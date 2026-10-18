import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api, ApiError, normalizeMeta } from '../api/client';
import { DEFAULT_META, OS_SHELLS, labelFor } from '../constants';

const WorkspaceContext = createContext(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return value;
}

let seq = 0;
const uid = () => `id-${Date.now()}-${++seq}`;

const toErr = (e) =>
  e instanceof ApiError
    ? { code: e.code, message: e.message }
    : { code: 'UNKNOWN', message: e?.message || 'Something went wrong' };

const fmt = (v) => {
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return String(v); }
};

export function WorkspaceProvider({ children }) {
  // --- Global selections ---
  const [mode, setMode] = useState('chat');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');

  // --- Backend ---
  const [meta, setMeta] = useState(DEFAULT_META);
  const [backend, setBackend] = useState('checking'); // checking | online | offline

  // --- Assistant ---
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [opts, setOpts] = useState({
    errorMessage: '',
    contextFiles: [],
    docstringStyle: 'google',
    testFramework: 'pytest',
    includeEdgeCases: true,
    stream: true,
  });
  const abortRef = useRef(null);

  // --- Dock ---
  const [activeTab, setActiveTab] = useState('output');
  const [outputLogs, setOutputLogs] = useState([]);
  const [termLogs, setTermLogs] = useState([]);
  const [cliBusy, setCliBusy] = useState(false);
  const [cliOpts, setCliOpts] = useState({ os: 'linux', shell: 'bash', mode: 'generate' });

  const setOpt = (key, value) => setOpts((o) => ({ ...o, [key]: value }));

  // ---------- Backend status ----------
  const checkBackend = async () => {
    setBackend('checking');
    try {
      await api.health();
      setBackend('online');
      try { setMeta(normalizeMeta(await api.meta())); } catch { /* keep defaults */ }
    } catch {
      setBackend('offline');
    }
  };
  useEffect(() => { checkBackend(); }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    const jsLike = lang === 'javascript' || lang === 'typescript';
    setOpts((o) => ({
      ...o,
      testFramework: jsLike ? 'jest' : o.testFramework === 'jest' ? 'pytest' : o.testFramework,
    }));
  };

  // ---------- Messages ----------
  const addMessage = (m) => {
    const id = m.id || uid();
    setMessages((p) => [...p, { ...m, id }]);
    return id;
  };
  const patchMessage = (id, fn) =>
    setMessages((p) => p.map((m) => (m.id === id ? { ...m, ...fn(m) } : m)));
  // End a stream: keep the text if there is any, otherwise drop the empty bubble.
  const finishStream = (id) =>
    setMessages((p) =>
      p.flatMap((m) => {
        if (m.id !== id) return [m];
        return m.payload.content ? [{ ...m, payload: { ...m.payload, streaming: false } }] : [];
      })
    );

  const send = async (rawPrompt) => {
    if (busy) return;
    const prompt = rawPrompt.trim();
    const common = { skill_level: skillLevel, language };

    if (mode === 'chat' && !prompt) return;
    if (mode !== 'chat' && !code.trim()) {
      addMessage({
        role: 'assistant', type: 'error',
        payload: { code: 'VALIDATION_ERROR', message: 'The editor is empty. This mode works on the code in the editor.' },
      });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);

    try {
      if (mode === 'chat') {
        addMessage({ role: 'user', type: 'text', payload: { text: prompt } });
        const payload = { session_id: sessionId, message: prompt, code_context: code.trim() || null, ...common };

        if (opts.stream) {
          const id = addMessage({ role: 'assistant', type: 'markdown', payload: { content: '', streaming: true } });
          let streamed = false;
          try {
            await api.streamChat(payload, {
              signal: controller.signal,
              onToken: (d) => patchMessage(id, (m) => ({ payload: { ...m.payload, content: m.payload.content + d } })),
              onDone: (d) => d?.session_id && setSessionId(d.session_id),
            });
            streamed = true;
          } catch (e) {
            const unsupported = e instanceof ApiError && [404, 405, 501].includes(e.status);
            if (!unsupported) { finishStream(id); throw e; }
            // /chat/stream is a P1 endpoint: fall back to /chat if the server doesn't have it.
            setMessages((p) => p.filter((m) => m.id !== id));
            setOpt('stream', false);
          }
          if (streamed) { finishStream(id); return; }
        }

        const res = await api.chat(payload, controller.signal);
        setSessionId(res.session_id);
        addMessage({ role: 'assistant', type: 'markdown', payload: { content: res.reply, codeBlocks: res.code_blocks || [] } });
        return;
      }

      const requests = {
        bugfix: {
          label: prompt || 'Find and fix the bug in my code',
          call: () => api.bugfix({
            code,
            error_message: opts.errorMessage.trim() || undefined,
            description: prompt || undefined,
            context_files: opts.contextFiles.length ? opts.contextFiles : undefined,
            ...common,
          }, controller.signal),
        },
        docstrings: {
          label: `Write ${opts.docstringStyle}-style docstrings`,
          call: () => api.docstrings({ code, style: opts.docstringStyle, ...common }, controller.signal),
        },
        tests: {
          label: `Generate ${opts.testFramework} tests${opts.includeEdgeCases ? ' with edge cases' : ''}`,
          call: () => api.tests({ code, framework: opts.testFramework, include_edge_cases: opts.includeEdgeCases, ...common }, controller.signal),
        },
      };
      const req = requests[mode];
      addMessage({ role: 'user', type: 'text', payload: { text: req.label } });
      const res = await req.call();
      addMessage({ role: 'assistant', type: mode, payload: res });
    } catch (e) {
      if (e.name !== 'AbortError') addMessage({ role: 'assistant', type: 'error', payload: toErr(e) });
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  };

  const stop = () => abortRef.current?.abort();

  const resetSession = async () => {
    abortRef.current?.abort();
    const sid = sessionId;
    setSessionId(null);
    setMessages([]);
    if (sid) { try { await api.deleteSession(sid); } catch { /* already gone */ } }
  };

  // ---------- Output tab ----------
  const log = (text, tone = 'text') => setOutputLogs((p) => [...p, { id: uid(), text, tone }]);
  const clearOutput = () => setOutputLogs([]);

  const runCode = () => {
    setActiveTab('output');
    if (!code.trim()) return log('The editor is empty.', 'warn');
    if (language !== 'javascript') {
      log(`Running ${labelFor(language)} in the browser isn't supported. Only JavaScript runs here.`, 'warn');
      log('Open the Terminal tab to get the command that runs it on your machine.', 'muted');
      return;
    }
    log('Running JavaScript…', 'info');
    const original = console.log;
    const t0 = performance.now();
    console.log = (...args) => { log(args.map(fmt).join(' ')); original(...args); };
    try {
      const result = new Function(code)();
      if (result !== undefined) log(`Result: ${fmt(result)}`, 'ok');
      log(`Finished in ${(performance.now() - t0).toFixed(1)}ms`, 'muted');
    } catch (e) {
      log(`${e.name}: ${e.message}`, 'err');
    } finally {
      console.log = original;
    }
  };

  // ---------- Terminal tab ----------
  const sendCli = async (query) => {
    const q = query.trim();
    if (!q || cliBusy) return;
    setCliBusy(true);
    setTermLogs((p) => [...p, { id: uid(), type: 'input', text: q }]);
    try {
      const res = await api.cli({ query: q, mode: cliOpts.mode, os: cliOpts.os, shell: cliOpts.shell, skill_level: skillLevel });
      setTermLogs((p) => [...p, { id: uid(), type: 'result', payload: res }]);
    } catch (e) {
      setTermLogs((p) => [...p, { id: uid(), type: 'error', payload: toErr(e) }]);
    } finally {
      setCliBusy(false);
    }
  };
  const clearTerminal = () => setTermLogs([]);

  const changeCliOs = (os) =>
    setCliOpts((o) => ({ ...o, os, shell: OS_SHELLS[os].includes(o.shell) ? o.shell : OS_SHELLS[os][0] }));
  const setCliOpt = (key, value) => setCliOpts((o) => ({ ...o, [key]: value }));

  const value = {
    mode, setMode, skillLevel, setSkillLevel, language, changeLanguage, code, setCode,
    meta, backend, checkBackend,
    messages, sessionId, busy, opts, setOpt, send, stop, resetSession,
    activeTab, setActiveTab, outputLogs, runCode, clearOutput,
    termLogs, cliBusy, cliOpts, setCliOpt, changeCliOs, sendCli, clearTerminal,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

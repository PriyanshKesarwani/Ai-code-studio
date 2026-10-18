import { useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import ErrorMessage from '../results/ErrorMessage';
import CliResult from './CliResult';

const PROMPT = 'devstudio$';

export default function TerminalTab() {
  const { termLogs, sendCli, cliBusy, cliOpts } = useWorkspace();
  const [value, setValue] = useState('');
  const [cursor, setCursor] = useState(-1);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const history = termLogs.filter((l) => l.type === 'input').map((l) => l.text);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [termLogs, cliBusy]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendCli(value);
      setValue('');
      setCursor(-1);
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      setCursor(next);
      setValue(history[history.length - 1 - next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setValue(next < 0 ? '' : history[history.length - 1 - next]);
    }
  };

  const placeholder = cliOpts.mode === 'explain' ? 'Paste a command to explain, e.g. tar -xzvf backup.tgz' : 'Describe a task, e.g. find files larger than 100 MB';

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 select-text space-y-2 overflow-y-auto p-3 text-xs">
        {termLogs.length === 0 && (
          <div className="text-gray-500">
            Describe what you want to do and get the command for {cliOpts.shell} on {cliOpts.os}. Switch to Explain to break down a command you already have.
          </div>
        )}
        {termLogs.map((l) =>
          l.type === 'input' ? (
            <div key={l.id} className="font-semibold text-cyan-300">{PROMPT} {l.text}</div>
          ) : l.type === 'result' ? (
            <CliResult key={l.id} data={l.payload} />
          ) : (
            <ErrorMessage key={l.id} compact code={l.payload.code} message={l.payload.message} />
          )
        )}
        {cliBusy && <div className="animate-pulse text-gray-500">Working…</div>}
        <div ref={endRef} />
      </div>
      <div className="flex flex-none items-center border-t border-gray-900 bg-[#070c18] px-3 py-1.5 text-xs">
        <span className="mr-2 font-bold text-cyan-400">{PROMPT}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={cliBusy}
          spellCheck={false}
          aria-label="Terminal assistant"
          placeholder={placeholder}
          className="flex-1 bg-transparent font-mono text-xs text-gray-100 outline-none placeholder:text-gray-600"
        />
      </div>
    </div>
  );
}

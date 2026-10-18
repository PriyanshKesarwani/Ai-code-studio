import { API_BASE, DEFAULT_META } from '../constants';

export class ApiError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// Converts any failed response into the contract's { error: { code, message } } shape.
async function toApiError(res) {
  let body = null;
  try { body = await res.json(); } catch { /* not JSON */ }
  if (body?.error) return new ApiError(body.error.code, body.error.message, res.status);
  // FastAPI's default validation payload
  if (typeof body?.detail === 'string') return new ApiError('VALIDATION_ERROR', body.detail, res.status);
  if (Array.isArray(body?.detail)) {
    const first = body.detail[0];
    const where = first?.loc?.slice(1).join('.');
    return new ApiError('VALIDATION_ERROR', `${where ? where + ': ' : ''}${first?.msg || 'Invalid request'}`, res.status);
  }
  const code = res.status === 404 ? 'NOT_FOUND' : res.status === 429 ? 'RATE_LIMITED' : `HTTP_${res.status}`;
  return new ApiError(code, res.statusText || 'Request failed', res.status);
}

let activeBase = API_BASE;

async function send(path, { method = 'GET', body, signal } = {}) {
  try {
    return await fetch(`${activeBase}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('NETWORK_ERROR', `Can't reach the API at ${activeBase}.`);
  }
}

async function request(path, opts) {
  const res = await send(path, opts);
  if (!res.ok) throw await toApiError(res);
  return res.status === 204 ? null : res.json();
}

// POST /chat/stream — Server-Sent Events: `token` {delta} … then `done` {session_id}
async function streamChat(body, { signal, onToken, onDone } = {}) {
  const res = await send('/chat/stream', { method: 'POST', body, signal });
  if (!res.ok) throw await toApiError(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const handleBlock = (block) => {
    let event = 'message';
    const data = [];
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    }
    if (!data.length) return;
    let payload;
    try { payload = JSON.parse(data.join('\n')); } catch { return; }
    if (event === 'token') onToken?.(payload.delta ?? '');
    else if (event === 'done') onDone?.(payload);
    else if (event === 'error') {
      const code = payload.error?.code || payload.code || 'LLM_BAD_OUTPUT';
      const msg = payload.error?.message || payload.message || 'Stream failed';
      throw new ApiError(code, msg);
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop();
    blocks.forEach(handleBlock);
  }
  if (buffer.trim()) handleBlock(buffer);
}

export const api = {
  health: async () => {
    try {
      return await request('/health');
    } catch (err) {
      // Auto-detect alternate local port if primary is unreachable (8000 <-> 8001)
      const alt = activeBase.includes(':8001')
        ? activeBase.replace(':8001', ':8000')
        : activeBase.includes(':8000')
          ? activeBase.replace(':8000', ':8001')
          : null;
      if (alt) {
        try {
          const res = await fetch(`${alt}/health`);
          if (res.ok) {
            activeBase = alt;
            return await res.json();
          }
        } catch { /* ignore fallback error */ }
      }
      throw err;
    }
  },
  meta: () => request('/meta'),
  bugfix: (body, signal) => request('/bugfix', { method: 'POST', body, signal }),
  docstrings: (body, signal) => request('/generate/docstrings', { method: 'POST', body, signal }),
  tests: (body, signal) => request('/generate/tests', { method: 'POST', body, signal }),
  cli: (body, signal) => request('/cli', { method: 'POST', body, signal }),
  chat: (body, signal) => request('/chat', { method: 'POST', body, signal }),
  streamChat,
  getHistory: (sessionId) => request(`/chat/${encodeURIComponent(sessionId)}`),
  deleteSession: (sessionId) => request(`/chat/${encodeURIComponent(sessionId)}`, { method: 'DELETE' }),
};

// GET /meta → dropdown options. Falls back to defaults for any missing list.
export function normalizeMeta(raw) {
  const list = (v, fallback) =>
    Array.isArray(v) && v.length
      ? v.map((x) => (typeof x === 'string' ? x : x?.value ?? x?.id ?? x?.name)).filter(Boolean)
      : fallback;
  return {
    skillLevels: list(raw?.skill_levels, DEFAULT_META.skillLevels),
    languages: list(raw?.languages, DEFAULT_META.languages),
    docstringStyles: list(raw?.docstring_styles, DEFAULT_META.docstringStyles),
    testFrameworks: list(raw?.test_frameworks, DEFAULT_META.testFrameworks),
  };
}

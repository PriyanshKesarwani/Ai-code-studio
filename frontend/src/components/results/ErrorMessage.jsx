const HINTS = {
  VALIDATION_ERROR: 'Check the inputs and try again.',
  LLM_TIMEOUT: 'The model took too long. Try again, or send a smaller piece of code.',
  LLM_BAD_OUTPUT: 'The model returned something the API could not read. Trying again usually helps.',
  RATE_LIMITED: 'Too many requests. Wait a moment, then try again.',
  NOT_FOUND: 'The API could not find what was requested.',
  NETWORK_ERROR: 'Start the FastAPI server and check VITE_API_BASE_URL. The server also needs CORS enabled for this origin.',
};

export default function ErrorMessage({ code, message, compact = false }) {
  return (
    <div role="alert" className={`rounded-lg border border-rose-900 bg-rose-950/40 ${compact ? 'p-2' : 'p-3'}`}>
      <div className="flex items-center gap-2">
        <span className="rounded bg-rose-900/60 px-1.5 font-mono text-[10px] text-rose-200">{code}</span>
        <span className="font-medium text-rose-300">{message}</span>
      </div>
      {HINTS[code] && <p className="mt-1 text-gray-400">{HINTS[code]}</p>}
    </div>
  );
}

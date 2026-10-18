import { useWorkspace } from '../../context/WorkspaceContext';

const STATES = {
  checking: { dot: 'bg-amber-400 animate-pulse', text: 'text-gray-400', label: 'Checking…' },
  online: { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'API online' },
  offline: { dot: 'bg-rose-500', text: 'text-rose-400', label: 'API offline' },
};

export default function StatusIndicator() {
  const { backend, checkBackend } = useWorkspace();
  const s = STATES[backend];
  return (
    <button
      onClick={checkBackend}
      title="Check the connection again"
      className="flex items-center gap-1.5 rounded-lg border border-ds-border bg-gray-900 px-2.5 py-1 text-[11px] hover:border-gray-700"
    >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      <span className={s.text}>{s.label}</span>
    </button>
  );
}

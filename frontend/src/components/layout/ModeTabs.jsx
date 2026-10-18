import { MODES } from '../../constants';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function ModeTabs() {
  const { mode, setMode } = useWorkspace();
  return (
    <div role="tablist" aria-label="Assistant mode" className="flex items-center gap-1 rounded-lg border border-ds-border bg-ds-raised p-1 text-xs">
      {MODES.map((m) => (
        <button
          key={m.id}
          role="tab"
          aria-selected={mode === m.id}
          onClick={() => setMode(m.id)}
          className={`rounded px-3 py-1 font-medium transition ${
            mode === m.id ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          {m.icon} {m.label}
        </button>
      ))}
    </div>
  );
}

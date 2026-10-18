import { useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

const TONES = {
  text: 'text-gray-300',
  info: 'text-cyan-400',
  ok: 'text-emerald-300 font-semibold',
  err: 'text-rose-400 font-semibold',
  warn: 'text-amber-400',
  muted: 'text-gray-500',
};

export default function OutputTab() {
  const { outputLogs } = useWorkspace();
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [outputLogs]);

  return (
    <div className="min-h-0 flex-1 select-text space-y-1 overflow-y-auto p-3 text-xs">
      {outputLogs.length === 0 && (
        <div className="text-gray-500">Nothing has run yet. Press Run in the editor (Ctrl+Enter).</div>
      )}
      {outputLogs.map((l) => (
        <div key={l.id} className={`whitespace-pre-wrap ${TONES[l.tone] || TONES.text}`}>{l.text}</div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

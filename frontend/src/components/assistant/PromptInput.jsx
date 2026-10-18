import { useState } from 'react';
import { MODES } from '../../constants';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SendIcon, StopIcon } from '../common/Icons';

export default function PromptInput() {
  const { mode, busy, send, stop } = useWorkspace();
  const [value, setValue] = useState('');
  const placeholder = MODES.find((m) => m.id === mode).placeholder;

  const submit = () => {
    if (busy) return;
    const text = value;
    setValue('');
    send(text);
  };

  return (
    <div className="flex min-h-0 flex-1 items-stretch gap-2 rounded-lg border border-gray-700 bg-ds-input p-2 focus-within:border-cyan-500">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
        }}
        placeholder={placeholder}
        aria-label="Message"
        className="min-h-0 flex-1 resize-none bg-transparent text-xs leading-normal text-gray-100 outline-none placeholder:text-gray-500"
      />
      {busy ? (
        <button onClick={stop} className="flex items-center gap-1 self-end rounded bg-rose-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-rose-600">
          <StopIcon /> Stop
        </button>
      ) : (
        <button onClick={submit} className="flex items-center gap-1 self-end rounded bg-cyan-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-cyan-500">
          <SendIcon /> Send
        </button>
      )}
    </div>
  );
}

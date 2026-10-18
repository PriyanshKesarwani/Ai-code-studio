import { useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CloseIcon } from '../common/Icons';

// Optional `context_files` for POST /bugfix: [{ filename, content }]
export default function ContextFiles() {
  const { opts, setOpt } = useWorkspace();
  const inputRef = useRef(null);

  const onPick = async (e) => {
    const picked = await Promise.all(
      [...e.target.files].map(async (f) => ({ filename: f.name, content: await f.text() }))
    );
    setOpt('contextFiles', [...opts.contextFiles, ...picked]);
    e.target.value = '';
  };
  const remove = (i) => setOpt('contextFiles', opts.contextFiles.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input ref={inputRef} type="file" multiple onChange={onPick} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current.click()}
        className="rounded bg-gray-800 px-2 py-0.5 text-[11px] text-gray-300 transition hover:text-white"
      >
        Add related files
      </button>
      {opts.contextFiles.map((f, i) => (
        <span key={`${f.filename}-${i}`} className="inline-flex items-center gap-1 rounded border border-gray-700 bg-ds-input px-1.5 py-0.5 font-mono text-[11px] text-gray-300">
          {f.filename}
          <button type="button" onClick={() => remove(i)} aria-label={`Remove ${f.filename}`} className="text-gray-500 hover:text-rose-400">
            <CloseIcon size={10} />
          </button>
        </span>
      ))}
    </div>
  );
}

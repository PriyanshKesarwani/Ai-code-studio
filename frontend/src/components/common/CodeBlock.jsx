import { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { highlight, normalizeLang } from '../../utils/highlight';
import CopyButton from './CopyButton';

export default function CodeBlock({ code, language = 'python', title, canInsert = true }) {
  const { setCode } = useWorkspace();
  const lang = normalizeLang(language);
  const html = useMemo(() => highlight(code, lang), [code, lang]);

  return (
    <div className="overflow-hidden rounded-lg border border-ds-border bg-ds-editor">
      <div className="flex items-center justify-between gap-2 border-b border-ds-border bg-ds-bar px-3 py-1">
        <span className="font-mono text-[11px] text-gray-400">{title || lang}</span>
        <div className="flex items-center gap-1.5">
          <CopyButton text={code} />
          {canInsert && (
            <button
              type="button"
              onClick={() => setCode(code)}
              className="rounded bg-cyan-700/40 px-2 py-0.5 text-[11px] text-cyan-300 transition hover:bg-cyan-600/50"
            >
              Use in editor
            </button>
          )}
        </div>
      </div>
      <pre className={`language-${lang} m-0 overflow-x-auto p-3 text-xs leading-relaxed`}>
        <code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

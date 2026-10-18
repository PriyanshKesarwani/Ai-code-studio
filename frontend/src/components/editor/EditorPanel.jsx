import { useEffect, useState } from 'react';
import { labelFor } from '../../constants';
import { useWorkspace } from '../../context/WorkspaceContext';
import CopyButton from '../common/CopyButton';
import { CollapseIcon, ExpandIcon, PlayIcon } from '../common/Icons';
import PanelHeader from '../common/PanelHeader';
import SplitPane from '../common/SplitPane';
import OutputTab from '../dock/OutputTab';
import CodeEditor from './CodeEditor';

const btn = 'inline-flex items-center gap-1 rounded bg-gray-800 px-2 py-0.5 text-[11px] text-gray-400 transition hover:text-white';

export default function EditorPanel() {
  const { code, setCode, language, runCode, outputLogs, clearOutput } = useWorkspace();
  const [fullscreen, setFullscreen] = useState(false);

  // Esc leaves fullscreen
  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const editor = <CodeEditor value={code} onChange={setCode} onRun={runCode} autoFocus={fullscreen} />;

  return (
    <section
      className={
        fullscreen
          ? 'fixed inset-0 z-[100] flex flex-col bg-ds-editor'
          : 'flex min-h-0 flex-1 flex-col bg-ds-editor'
      }
    >
      <PanelHeader title={`Editor · ${labelFor(language)}${fullscreen ? ' · fullscreen (Esc to exit)' : ''}`}>
        <button onClick={runCode} className="inline-flex items-center gap-1 rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-emerald-600">
          <PlayIcon /> Run
        </button>
        <CopyButton text={code} />
        <button onClick={() => setCode('')} className={btn}>Clear</button>
        <button
          onClick={() => setFullscreen((f) => !f)}
          aria-pressed={fullscreen}
          title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
          className={btn}
        >
          {fullscreen ? <CollapseIcon /> : <ExpandIcon />}
          {fullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </PanelHeader>

      {fullscreen ? (
        <SplitPane
          direction="vertical"
          controlled="second"
          initialSize={180}
          min={60}
          otherMin={120}
          storageKey="fullscreen-output"
          first={editor}
          second={
            <div className="flex min-h-0 flex-1 flex-col bg-ds-dock font-mono">
              <div className="flex h-7 flex-none items-center justify-between border-b border-gray-800 bg-[#0a0f1d] px-3 text-[11px] text-gray-400">
                <span>Output</span>
                {outputLogs.length > 0 && (
                  <button onClick={clearOutput} className="rounded bg-gray-800/80 px-1.5 py-0.5 hover:text-gray-200">Clear</button>
                )}
              </div>
              <OutputTab />
            </div>
          }
        />
      ) : (
        <div className="min-h-0 flex-1">{editor}</div>
      )}
    </section>
  );
}

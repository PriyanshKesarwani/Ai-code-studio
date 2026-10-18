import { OS_SHELLS } from '../../constants';
import { useWorkspace } from '../../context/WorkspaceContext';
import SelectControl from '../common/SelectControl';
import OutputTab from './OutputTab';
import TerminalTab from './TerminalTab';

const tabClass = (active) =>
  `rounded px-2.5 py-0.5 font-medium transition ${
    active ? 'border border-gray-700 bg-gray-800 text-cyan-300' : 'text-gray-400 hover:text-gray-200'
  }`;

export default function BottomDock() {
  const { activeTab, setActiveTab, clearOutput, clearTerminal, cliOpts, setCliOpt, changeCliOs } = useWorkspace();
  const isCli = activeTab === 'cli';

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ds-dock font-mono">
      <div className="flex min-h-8 flex-none flex-wrap items-center justify-between gap-2 border-b border-gray-800 bg-[#0a0f1d] px-3 py-0.5 text-[11px] text-gray-400">
        <div role="tablist" className="flex items-center gap-1">
          <button role="tab" aria-selected={!isCli} onClick={() => setActiveTab('output')} className={tabClass(!isCli)}>
            📊 Output
          </button>
          <button role="tab" aria-selected={isCli} onClick={() => setActiveTab('cli')} className={tabClass(isCli)}>
            💻 Terminal
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isCli && (
            <>
              <SelectControl compact label="Task:" value={cliOpts.mode} onChange={(v) => setCliOpt('mode', v)}
                options={[{ value: 'generate', label: 'Generate' }, { value: 'explain', label: 'Explain' }]} />
              <SelectControl compact label="OS:" value={cliOpts.os} onChange={changeCliOs} options={Object.keys(OS_SHELLS)} />
              <SelectControl compact label="Shell:" value={cliOpts.shell} onChange={(v) => setCliOpt('shell', v)} options={OS_SHELLS[cliOpts.os]} />
            </>
          )}
          <button onClick={isCli ? clearTerminal : clearOutput} className="rounded bg-gray-800/80 px-1.5 py-0.5 hover:text-gray-200">
            Clear
          </button>
        </div>
      </div>

      {isCli ? <TerminalTab /> : <OutputTab />}
    </div>
  );
}

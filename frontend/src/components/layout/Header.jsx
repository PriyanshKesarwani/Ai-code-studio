import { useWorkspace } from '../../context/WorkspaceContext';
import SelectControl from '../common/SelectControl';
import ModeTabs from './ModeTabs';
import StatusIndicator from './StatusIndicator';

export default function Header() {
  const { meta, skillLevel, setSkillLevel, language, changeLanguage } = useWorkspace();
  return (
    <header className="flex min-h-14 flex-none flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-800 bg-[#0d1322] px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-600/20 text-sm font-bold text-cyan-400">
          &lt;/&gt;
        </div>
        <div>
          <h1 className="flex items-center gap-2 text-sm font-bold text-gray-100">
            DevStudio AI
            <span className="rounded border border-cyan-800 bg-cyan-950 px-1.5 font-mono text-[10px] text-cyan-400">FastAPI v1</span>
          </h1>
          <p className="text-[10px] text-gray-500">Chat, fix, document and test your code</p>
        </div>
      </div>

      <ModeTabs />

      <div className="flex flex-wrap items-center gap-3">
        <SelectControl label="Level:" value={skillLevel} onChange={setSkillLevel} options={meta.skillLevels} />
        <SelectControl label="Language:" value={language} onChange={changeLanguage} options={meta.languages} />
        <StatusIndicator />
      </div>
    </header>
  );
}

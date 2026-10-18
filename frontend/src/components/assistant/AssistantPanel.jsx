import { MODES } from '../../constants';
import { useWorkspace } from '../../context/WorkspaceContext';
import PanelHeader from '../common/PanelHeader';
import SplitPane from '../common/SplitPane';
import ExtraInputs from './ExtraInputs';
import MessageList from './MessageList';
import PromptInput from './PromptInput';

function Composer() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-ds-bar p-3">
      <ExtraInputs />
      <PromptInput />
    </div>
  );
}

export default function AssistantPanel() {
  const { mode, resetSession } = useWorkspace();
  const endpoint = MODES.find((m) => m.id === mode).endpoint;

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-ds-panel">
      <PanelHeader title={endpoint} titleClass="font-mono font-semibold text-cyan-400">
        <button onClick={resetSession} className="text-[11px] text-gray-400 transition hover:text-rose-400">
          Reset session
        </button>
      </PanelHeader>
      <SplitPane
        direction="vertical"
        controlled="second"
        initialSize={190}
        min={110}
        otherMin={120}
        storageKey="assistant-composer"
        first={<MessageList />}
        second={<Composer />}
      />
    </section>
  );
}

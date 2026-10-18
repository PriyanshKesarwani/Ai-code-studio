import { WorkspaceProvider } from './context/WorkspaceContext';
import useMediaQuery from './hooks/useMediaQuery';
import SplitPane from './components/common/SplitPane';
import Header from './components/layout/Header';
import AssistantPanel from './components/assistant/AssistantPanel';
import EditorPanel from './components/editor/EditorPanel';
import BottomDock from './components/dock/BottomDock';

function Workspace() {
  // Stack the assistant above the editor on phones and narrow windows.
  const narrow = useMediaQuery('(max-width: 767px)');

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex min-h-0 flex-1">
        <SplitPane
          key={narrow ? 'stacked' : 'side-by-side'}
          direction={narrow ? 'vertical' : 'horizontal'}
          controlled="first"
          initialSize={narrow ? '45%' : '45%'}
          min={narrow ? 140 : 280}
          otherMin={narrow ? 140 : 320}
          storageKey={narrow ? 'main-stacked' : 'main-split'}
          first={<AssistantPanel />}
          second={
            <SplitPane
              direction="vertical"
              controlled="second"
              initialSize={260}
              min={90}
              otherMin={120}
              storageKey="editor-dock"
              first={<EditorPanel />}
              second={<BottomDock />}
            />
          }
        />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <Workspace />
    </WorkspaceProvider>
  );
}

import { useWorkspace } from '../../context/WorkspaceContext';
import MarkdownContent from '../common/MarkdownContent';
import BugfixResult from '../results/BugfixResult';
import DocstringsResult from '../results/DocstringsResult';
import TestsResult from '../results/TestsResult';
import ErrorMessage from '../results/ErrorMessage';

function ChatReply({ payload }) {
  const { setCode } = useWorkspace();
  return (
    <>
      <MarkdownContent content={payload.content} streaming={payload.streaming} />
      {payload.codeBlocks?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {payload.codeBlocks.map((b, i) => (
            <button
              key={i}
              onClick={() => setCode(b.code)}
              className="rounded bg-cyan-700/40 px-2 py-0.5 text-[11px] text-cyan-300 transition hover:bg-cyan-600/50"
            >
              Use {b.language || 'code'} block {i + 1} in editor
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function MessageBubble({ message }) {
  const { role, type, payload } = message;

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-xl bg-cyan-700 p-2.5 text-white">{payload.text}</div>
      </div>
    );
  }

  const body = {
    markdown: <ChatReply payload={payload} />,
    bugfix: <BugfixResult data={payload} />,
    docstrings: <DocstringsResult data={payload} />,
    tests: <TestsResult data={payload} />,
    error: <ErrorMessage code={payload.code} message={payload.message} />,
  }[type];

  return (
    <div className="flex justify-start">
      <div className="min-w-0 max-w-[96%] rounded-xl border border-gray-800 bg-ds-card p-3 text-gray-200">{body}</div>
    </div>
  );
}

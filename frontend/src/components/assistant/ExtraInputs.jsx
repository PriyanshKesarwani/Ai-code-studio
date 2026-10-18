import { useWorkspace } from '../../context/WorkspaceContext';
import SelectControl from '../common/SelectControl';
import ContextFiles from './ContextFiles';

const checkbox = 'h-3.5 w-3.5 accent-cyan-500';

function BugfixInputs() {
  const { opts, setOpt } = useWorkspace();
  return (
    <div className="space-y-1.5">
      <textarea
        value={opts.errorMessage}
        onChange={(e) => setOpt('errorMessage', e.target.value)}
        rows={2}
        spellCheck={false}
        placeholder="Stack trace or error message (optional)"
        className="w-full resize-none rounded border border-gray-700 bg-ds-input px-2 py-1 font-mono text-xs text-gray-200 outline-none focus:border-cyan-500"
      />
      <ContextFiles />
    </div>
  );
}

function DocstringInputs() {
  const { meta, opts, setOpt } = useWorkspace();
  return <SelectControl compact label="Style:" value={opts.docstringStyle} onChange={(v) => setOpt('docstringStyle', v)} options={meta.docstringStyles} />;
}

function TestInputs() {
  const { meta, opts, setOpt } = useWorkspace();
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SelectControl compact label="Framework:" value={opts.testFramework} onChange={(v) => setOpt('testFramework', v)} options={meta.testFrameworks} />
      <label className="flex items-center gap-1.5 text-[11px] text-gray-400">
        <input type="checkbox" className={checkbox} checked={opts.includeEdgeCases} onChange={(e) => setOpt('includeEdgeCases', e.target.checked)} />
        Include edge cases
      </label>
    </div>
  );
}

function ChatInputs() {
  const { opts, setOpt } = useWorkspace();
  return (
    <label className="flex items-center gap-1.5 text-[11px] text-gray-400">
      <input type="checkbox" className={checkbox} checked={opts.stream} onChange={(e) => setOpt('stream', e.target.checked)} />
      Stream replies as they are written
    </label>
  );
}

export default function ExtraInputs() {
  const { mode } = useWorkspace();
  const Inputs = { chat: ChatInputs, bugfix: BugfixInputs, docstrings: DocstringInputs, tests: TestInputs }[mode];
  return <Inputs />;
}

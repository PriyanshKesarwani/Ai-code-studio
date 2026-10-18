import { useWorkspace } from '../../context/WorkspaceContext';
import CodeBlock from '../common/CodeBlock';
import Section from './Section';

export default function BugfixResult({ data }) {
  const { language } = useWorkspace();
  return (
    <div className="space-y-3">
      <Section title="Root cause" tone="danger"><p>{data.root_cause}</p></Section>
      {data.explanation && <Section title="Explanation" tone="plain"><p className="whitespace-pre-wrap text-gray-300">{data.explanation}</p></Section>}
      <Section title="Fixed code"><CodeBlock code={data.fixed_code} language={language} /></Section>

      {data.changes?.length > 0 && (
        <Section title={`Changes (${data.changes.length})`} tone="warn">
          <ul className="space-y-2">
            {data.changes.map((c, i) => (
              <li key={i} className="rounded-lg border border-ds-border bg-ds-editor p-2">
                <div className="mb-1 font-mono text-[11px] text-gray-500">Line {c.line}</div>
                <pre className="overflow-x-auto whitespace-pre text-[11px] text-rose-300">- {c.before}</pre>
                <pre className="overflow-x-auto whitespace-pre text-[11px] text-emerald-300">+ {c.after}</pre>
                <p className="mt-1 text-gray-400">{c.reason}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.prevention_tips?.length > 0 && (
        <Section title="How to avoid this" tone="good">
          <ul className="list-disc space-y-0.5 pl-5 text-gray-300">
            {data.prevention_tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}

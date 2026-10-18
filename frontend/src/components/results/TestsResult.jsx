import { useWorkspace } from '../../context/WorkspaceContext';
import CodeBlock from '../common/CodeBlock';
import CopyButton from '../common/CopyButton';
import Section from './Section';

const CATEGORY_STYLES = {
  edge_case: 'border-amber-700 bg-amber-950 text-amber-300',
  happy_path: 'border-emerald-700 bg-emerald-950 text-emerald-300',
  error: 'border-rose-700 bg-rose-950 text-rose-300',
};

export default function TestsResult({ data }) {
  const { language } = useWorkspace();
  return (
    <div className="space-y-3">
      <Section title="Generated tests">
        <CodeBlock code={data.test_code} language={language} title="test code" canInsert={false} />
      </Section>

      {data.test_cases?.length > 0 && (
        <Section title={`Test cases (${data.test_cases.length})`} tone="warn">
          <ul className="space-y-1.5">
            {data.test_cases.map((t, i) => (
              <li key={i} className="rounded-lg border border-ds-border bg-ds-editor p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-cyan-300">{t.name}</span>
                  {t.category && (
                    <span className={`rounded border px-1.5 text-[10px] ${CATEGORY_STYLES[t.category] || 'border-gray-700 bg-gray-900 text-gray-300'}`}>
                      {t.category.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-gray-400">{t.description}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.run_instructions && (
        <Section title="Run them" tone="good">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-ds-border bg-ds-editor px-3 py-2">
            <code className="overflow-x-auto font-mono text-[11px] text-emerald-300">{data.run_instructions}</code>
            <CopyButton text={data.run_instructions} />
          </div>
        </Section>
      )}
    </div>
  );
}

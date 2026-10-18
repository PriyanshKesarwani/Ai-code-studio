import { useWorkspace } from '../../context/WorkspaceContext';
import CodeBlock from '../common/CodeBlock';
import Section from './Section';

export default function DocstringsResult({ data }) {
  const { language } = useWorkspace();
  return (
    <div className="space-y-3">
      <Section title="Documented code"><CodeBlock code={data.documented_code} language={language} /></Section>
      {data.docstrings?.length > 0 && (
        <Section title={`Docstrings (${data.docstrings.length})`} tone="good">
          <ul className="space-y-2">
            {data.docstrings.map((d, i) => (
              <li key={i} className="rounded-lg border border-ds-border bg-ds-editor p-2">
                <div className="mb-1 font-mono text-[11px] text-cyan-300">{d.target}</div>
                <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] text-gray-300">{d.docstring}</pre>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

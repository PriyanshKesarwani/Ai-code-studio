import CopyButton from '../common/CopyButton';
import RiskBanner from './RiskBanner';

export default function CliResult({ data }) {
  return (
    <div className="space-y-2 rounded-lg border border-ds-border bg-[#070c18] p-2.5">
      <RiskBanner level={data.risk_level} warning={data.warning} />

      <div className="flex items-start justify-between gap-2 rounded bg-ds-dock px-2 py-1.5">
        <code className="min-w-0 overflow-x-auto whitespace-pre font-semibold text-emerald-400">{data.command}</code>
        <CopyButton text={data.command} className="flex-none" />
      </div>

      {data.explanation && <p className="text-gray-300">{data.explanation}</p>}

      {data.breakdown?.length > 0 && (
        <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-0.5">
          {data.breakdown.map((b, i) => (
            <div key={i} className="contents">
              <dt className="font-semibold text-cyan-300">{b.part}</dt>
              <dd className="text-gray-400">{b.meaning}</dd>
            </div>
          ))}
        </dl>
      )}

      {data.alternatives?.length > 0 && (
        <div>
          <div className="mb-0.5 text-gray-500">Alternatives</div>
          <ul className="space-y-1">
            {data.alternatives.map((a, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <code className="min-w-0 overflow-x-auto whitespace-pre text-gray-300">{a}</code>
                <CopyButton text={a} className="flex-none" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

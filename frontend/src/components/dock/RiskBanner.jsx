const LEVELS = {
  safe: { cls: 'border-emerald-800 bg-emerald-950/40 text-emerald-300', label: 'Safe to run' },
  caution: { cls: 'border-amber-700 bg-amber-950/40 text-amber-300', label: 'Review before running' },
  dangerous: { cls: 'border-rose-600 bg-rose-950/60 text-rose-300', label: 'Dangerous: can delete or overwrite data' },
};

export default function RiskBanner({ level, warning }) {
  const l = LEVELS[level];
  if (!l) return null;
  return (
    <div role={level === 'dangerous' ? 'alert' : 'status'} className={`rounded border px-2 py-1.5 ${l.cls}`}>
      <div className="font-semibold">{l.label}</div>
      {warning && <div className="mt-0.5 text-[11px] opacity-90">{warning}</div>}
    </div>
  );
}

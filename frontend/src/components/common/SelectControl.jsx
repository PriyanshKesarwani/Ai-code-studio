import { labelFor } from '../../constants';

export default function SelectControl({ label, value, onChange, options, compact = false, id }) {
  const select = (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer rounded border border-gray-700/60 bg-[#0b101d] px-2 py-0.5 text-xs font-medium text-cyan-400 outline-none focus:border-cyan-500"
    >
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? labelFor(o) : o.label;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
  if (compact) {
    return (
      <label className="flex items-center gap-1.5 text-[11px] text-gray-400">
        {label}
        {select}
      </label>
    );
  }
  return (
    <label className="flex items-center gap-1.5 rounded-lg border border-ds-border bg-ds-raised px-2.5 py-1 text-[11px] text-gray-400">
      {label}
      {select}
    </label>
  );
}

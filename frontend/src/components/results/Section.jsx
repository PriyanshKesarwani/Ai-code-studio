const TONES = {
  danger: 'text-rose-400',
  accent: 'text-cyan-400',
  good: 'text-emerald-400',
  warn: 'text-amber-400',
  plain: 'text-gray-300',
};

export default function Section({ title, tone = 'accent', children }) {
  return (
    <section className="space-y-1.5">
      <h3 className={`font-bold ${TONES[tone]}`}>{title}</h3>
      {children}
    </section>
  );
}

export default function PanelHeader({ title, titleClass = 'text-gray-300 font-medium', children }) {
  return (
    <div className="flex h-9 flex-none items-center justify-between gap-2 border-b border-ds-border bg-ds-bar px-4 text-xs">
      <span className={`truncate ${titleClass}`}>{title}</span>
      <div className="flex flex-none items-center gap-2">{children}</div>
    </div>
  );
}

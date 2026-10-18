import { useEffect, useRef, useState } from 'react';

const HANDLE = 6; // px thickness of the drag bar

const readSize = (key) => {
  if (!key) return null;
  try {
    const n = Number(localStorage.getItem(`devstudio:${key}`));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch { return null; }
};
const writeSize = (key, size) => {
  if (!key || typeof size !== 'number') return;
  try { localStorage.setItem(`devstudio:${key}`, String(Math.round(size))); } catch { /* private mode */ }
};

/**
 * Two panes with a draggable divider.
 *
 * direction   'horizontal' = side by side, 'vertical' = stacked
 * controlled  which pane keeps the dragged size ('first' | 'second'); the other pane fills the rest
 * initialSize px number or CSS size like '45%'
 * min / otherMin  minimum px size of the controlled / other pane
 * storageKey  remembers the dragged size in localStorage
 *
 * Drag with mouse, touch or pen. Arrow keys nudge the divider when focused.
 * Double-click the divider to reset it.
 */
export default function SplitPane({
  direction = 'horizontal',
  controlled = 'first',
  initialSize = '50%',
  min = 120,
  otherMin = 120,
  storageKey,
  first,
  second,
}) {
  const isH = direction === 'horizontal';
  const containerRef = useRef(null);
  const paneRef = useRef(null);
  const [size, setSize] = useState(() => readSize(storageKey) ?? initialSize);
  const [dragging, setDragging] = useState(false);

  useEffect(() => { writeSize(storageKey, size); }, [size, storageKey]);
  useEffect(() => () => document.body.classList.remove('is-resizing'), []);

  const total = () => {
    const r = containerRef.current.getBoundingClientRect();
    return isH ? r.width : r.height;
  };
  const clamp = (v) => Math.min(Math.max(v, min), Math.max(min, total() - otherMin - HANDLE));

  const onPointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    document.body.classList.add('is-resizing');
    document.body.style.cursor = isH ? 'col-resize' : 'row-resize';
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const r = containerRef.current.getBoundingClientRect();
    const pos = isH ? e.clientX - r.left : e.clientY - r.top;
    setSize(clamp(controlled === 'first' ? pos : total() - pos - HANDLE));
  };
  const endDrag = () => {
    setDragging(false);
    document.body.classList.remove('is-resizing');
    document.body.style.cursor = '';
  };
  const onKeyDown = (e) => {
    const keys = isH ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
    const i = keys.indexOf(e.key);
    if (i < 0) return;
    e.preventDefault();
    const current = paneRef.current.getBoundingClientRect()[isH ? 'width' : 'height'];
    const dir = i === 0 ? -1 : 1;
    setSize(clamp(current + (controlled === 'first' ? dir : -dir) * 24));
  };

  const dim = isH ? 'width' : 'height';
  const Dim = isH ? 'Width' : 'Height';
  const paneStyle = {
    flex: 'none',
    [dim]: typeof size === 'number' ? `${size}px` : size,
    [`min${Dim}`]: min,
    [`max${Dim}`]: `calc(100% - ${otherMin + HANDLE}px)`,
  };
  const paneClass = 'flex min-h-0 min-w-0 flex-col overflow-hidden';

  const controlledPane = (
    <div ref={paneRef} style={paneStyle} className={paneClass}>
      {controlled === 'first' ? first : second}
    </div>
  );
  const otherPane = (
    <div style={{ [`min${Dim}`]: otherMin }} className={`${paneClass} flex-1`}>
      {controlled === 'first' ? second : first}
    </div>
  );
  const handle = (
    <div
      role="separator"
      aria-orientation={isH ? 'vertical' : 'horizontal'}
      aria-label="Resize panels"
      tabIndex={0}
      title="Drag to resize. Double-click to reset."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => setSize(initialSize)}
      onKeyDown={onKeyDown}
      className={`flex-none touch-none outline-none transition-colors ${
        isH ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize'
      } ${dragging ? 'bg-cyan-500' : 'bg-ds-border hover:bg-cyan-600/70 focus-visible:bg-cyan-600/70'}`}
    />
  );

  return (
    <div ref={containerRef} className={`flex min-h-0 min-w-0 flex-1 ${isH ? 'flex-row' : 'flex-col'}`}>
      {controlled === 'first' ? <>{controlledPane}{handle}{otherPane}</> : <>{otherPane}{handle}{controlledPane}</>}
    </div>
  );
}

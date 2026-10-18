import { useEffect, useRef } from 'react';

const PLACEHOLDER = `# Paste your code here
def calculate_average(numbers):
    total = 0
    for n in numbers:
        total += n
    return total / len(numbers)  # fails on an empty list`;

export default function CodeEditor({ value, onChange, onRun, autoFocus = false }) {
  const gutterRef = useRef(null);
  const areaRef = useRef(null);
  const lineCount = Math.max(value.split('\n').length, value ? 1 : PLACEHOLDER.split('\n').length);
  const numbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  useEffect(() => { if (autoFocus) areaRef.current?.focus(); }, [autoFocus]);

  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      el.setRangeText('    ', el.selectionStart, el.selectionEnd, 'end');
      onChange(el.value);
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onRun?.();
    }
  };

  return (
    <div className="flex h-full min-h-0 bg-ds-editor">
      <pre
        ref={gutterRef}
        aria-hidden="true"
        className="m-0 flex-none select-none overflow-hidden py-4 pb-8 pl-3 pr-3 text-right text-xs leading-relaxed text-gray-600"
      >
        {numbers}
      </pre>
      <textarea
        ref={areaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(e) => { gutterRef.current.scrollTop = e.currentTarget.scrollTop; }}
        spellCheck={false}
        wrap="off"
        aria-label="Code editor"
        placeholder={PLACEHOLDER}
        className="h-full min-w-0 flex-1 select-text resize-none overflow-auto whitespace-pre border-none bg-transparent py-4 pr-4 text-xs leading-relaxed text-cyan-200 outline-none placeholder:text-gray-600"
      />
    </div>
  );
}

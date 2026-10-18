import useCopy from '../../hooks/useCopy';
import { CheckIcon, CopyIcon } from './Icons';

export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, copy] = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={`inline-flex items-center gap-1 rounded bg-gray-800 px-2 py-0.5 text-[11px] text-gray-400 transition hover:text-white ${className}`}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? 'Copied' : label}
    </button>
  );
}

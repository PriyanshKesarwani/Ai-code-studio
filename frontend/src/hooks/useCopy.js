import { useEffect, useRef, useState } from 'react';

export default function useCopy(resetMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text ?? '');
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetMs);
    } catch { /* clipboard unavailable */ }
  };
  return [copied, copy];
}

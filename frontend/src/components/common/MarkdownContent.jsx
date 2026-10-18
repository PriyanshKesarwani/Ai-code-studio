import { useEffect, useMemo, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Prism } from '../../utils/highlight';

export default function MarkdownContent({ content, streaming = false }) {
  const ref = useRef(null);
  // Model output is untrusted: always sanitize before injecting.
  const html = useMemo(
    () => DOMPurify.sanitize(marked.parse(content || '', { async: false, gfm: true })),
    [content]
  );

  useEffect(() => {
    if (ref.current) Prism.highlightAllUnder(ref.current);
  }, [html]);

  if (!content && streaming) {
    return <span className="animate-pulse text-gray-500">Thinking…</span>;
  }
  return <div ref={ref} className="md-body" dangerouslySetInnerHTML={{ __html: html }} />;
}

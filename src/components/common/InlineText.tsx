import type { ReactNode } from 'react';

/**
 * A tiny renderer for the inline markdown used in titles: `code` (and ``double-backtick``
 * spans that contain backticks), **bold** and *italic*. It keeps question titles off the
 * heavy react-markdown chunk, so pages with collapsed answers render without loading it.
 */
const TOKEN = /``\s?([\s\S]+?)\s?``|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*/g;

export function InlineText({ children }: { children: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of children.matchAll(TOKEN)) {
    const [whole, doubleCode, code, bold, italic] = match;
    if (match.index > last) parts.push(children.slice(last, match.index));
    const key = match.index;
    if (doubleCode !== undefined || code !== undefined) {
      parts.push(<code key={key}>{doubleCode ?? code}</code>);
    } else if (bold !== undefined) {
      parts.push(<strong key={key}>{bold}</strong>);
    } else {
      parts.push(<em key={key}>{italic}</em>);
    }
    last = match.index + whole.length;
  }
  if (last < children.length) parts.push(children.slice(last));
  return <span className="md-inline">{parts}</span>;
}

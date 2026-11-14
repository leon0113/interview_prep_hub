/**
 * Strips inline markdown markers for places that render plain text (breadcrumbs, TOC, titles).
 * Code spans keep their content verbatim — `*args` stays `*args`; emphasis markers outside
 * code are removed.
 */
export function plainText(markdown: string): string {
  return markdown
    .split('`')
    .map((part, i) => (i % 2 === 1 ? part : part.replace(/\*\*|__|\*/g, '')))
    .join('');
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * A question may continue after its first paragraph — e.g. output-prediction puzzles put
 * the code below the question. The first paragraph is the title; the rest is the body.
 */
export function splitQuestion(markdown: string): { title: string; body: string } {
  const at = markdown.indexOf('\n\n');
  if (at === -1) return { title: markdown, body: '' };
  return { title: markdown.slice(0, at).trim(), body: markdown.slice(at + 2).trim() };
}

/** Plain-text title of a question, for the TOC, breadcrumbs, search results and links. */
export function questionTitle(markdown: string): string {
  return plainText(splitQuestion(markdown).title);
}

import type { ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '@/components/question/CodeBlock';
import { OutputBlock } from '@/components/question/OutputBlock';
import type { CodeLang } from '@/content/schema';
import { cn } from '@/lib/cn';

const remarkPlugins = [remarkGfm];
const INLINE_ELEMENTS = ['code', 'strong', 'em'];

const FENCE_LANG: Record<string, CodeLang> = {
  python: 'python',
  py: 'python',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  sql: 'sql',
  postgres: 'sql',
  postgresql: 'sql',
  psql: 'sql',
  json: 'json',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
};

/** Fences that are not content languages: shown with their own label (and grammar, if bundled). */
const EXTRA_FENCE: Record<string, { label: string; prism: string }> = {
  yaml: { label: 'YAML', prism: 'yaml' },
  yml: { label: 'YAML', prism: 'yaml' },
  dockerfile: { label: 'Dockerfile', prism: 'text' },
  env: { label: '.env', prism: 'text' },
  gitignore: { label: '.gitignore', prism: 'text' },
  nginx: { label: 'Nginx', prism: 'text' },
  jsonc: { label: 'JSON', prism: 'json' },
  ini: { label: 'INI', prism: 'text' },
};

function textOf(children: ReactNode): string {
  return Array.isArray(children) ? children.join('') : String(children ?? '');
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  children?: HastNode[];
}

/** Plain text of a hast (HTML AST) node. */
function hastText(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(hastText).join('');
}

/**
 * "Table: <column headers>, from <first row>". The first row keeps tables with the same
 * columns (e.g. several "Task | Command" tables in a cheat sheet) distinguishable.
 */
function tableLabel(node: HastNode | undefined): string {
  const rows: HastNode[] = [];
  const visit = (n: HastNode) => {
    if (n.tagName === 'tr') rows.push(n);
    else (n.children ?? []).forEach(visit);
  };
  if (node) visit(node);
  const cells = (row: HastNode | undefined) =>
    (row?.children ?? []).filter((c) => c.tagName === 'th' || c.tagName === 'td');
  const headers = cells(rows[0]).map((c) => hastText(c).trim() || 'Compared');
  if (!headers.length) return 'Table';
  const first = cells(rows[1])
    .map((c) => hastText(c).trim())
    .join(', ');
  const from = first ? `, from ${first.length > 60 ? `${first.slice(0, 60)}…` : first}` : '';
  return `Table: ${headers.join(', ')}${from}`;
}

/** Fenced code blocks render as full CodeBlocks (highlighting + copy); inline code stays inline. */
const components: Components = {
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const text = textOf(children);
    const fence = /language-(\w+)/.exec(className ?? '')?.[1];
    if (!fence && !text.includes('\n')) return <code>{children}</code>;
    // ```output fences (e.g. program output in topic notes) render as an Output block.
    if (fence === 'output') return <OutputBlock output={text.replace(/\n$/, '')} standalone />;
    const extra = fence ? EXTRA_FENCE[fence] : undefined;
    if (extra) {
      return <CodeBlock code={text} lang="text" label={extra.label} prismLang={extra.prism} />;
    }
    return <CodeBlock code={text} lang={FENCE_LANG[fence ?? ''] ?? 'text'} />;
  },
  // Task-list boxes ("- [ ] step") are decorative: a styled box, not an unlabeled control.
  input: ({ type, checked }) =>
    type === 'checkbox' ? (
      <span aria-hidden className="task-box" data-checked={checked ? '' : undefined} />
    ) : null,
  // Notes callouts: "> 💡 …" is a tip, "> ⚠️ …" a warning; other quotes are plain notes.
  blockquote: ({ children, node }) => {
    const text = node ? hastText(node as HastNode).trim() : '';
    const tone = text.startsWith('⚠') ? 'warn' : text.startsWith('💡') ? 'tip' : 'note';
    return <blockquote data-tone={tone}>{children}</blockquote>;
  },
  // Images (guide plots). A "#600x400" suffix on the URL gives the intrinsic size, so the
  // page doesn't shift while lazy images load (and anchor jumps land in the right place).
  img: ({ src, alt }) => {
    const url = typeof src === 'string' ? src : '';
    const size = /#(\d+)x(\d+)$/.exec(url);
    return (
      <img
        src={size ? url.slice(0, size.index) : url}
        alt={alt ?? ''}
        width={size ? Number(size[1]) : undefined}
        height={size ? Number(size[2]) : undefined}
        loading="lazy"
        decoding="async"
      />
    );
  },
  // Comparison tables can be wider than a phone: the wrapper scrolls and is focusable, so
  // keyboard users can scroll it too.
  // The region is named after its column headers, so a page with several tables open has
  // distinguishable landmarks ("Table: Aspect, DBMS, RDBMS" rather than "Table" each time).
  table: ({ children, node }) => (
    <div className="md-table" tabIndex={0} role="region" aria-label={tableLabel(node)}>
      <table>{children}</table>
    </div>
  ),
  // The corner cell of a comparison table ("| | A | B |") is empty; give it a label for
  // screen readers instead of an empty header.
  th: ({ children, style }) => (
    <th style={style}>
      {textOf(children).trim() ? children : <span className="sr-only">Compared</span>}
    </th>
  ),
};

interface MarkdownProps {
  children: string;
  /** Set for Bangla text so it gets the Bangla font metrics. */
  lang?: 'bn';
  className?: string;
}

/** Block markdown: answers, explanations, exercise prompts. */
export function Markdown({ children, lang, className }: MarkdownProps) {
  return (
    <div lang={lang} className={cn('md', className)}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

/** Inline markdown for one-line strings such as question titles (`code`, **bold**, *em*). */
export function InlineMarkdown({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn('md-inline', className)}>
      <ReactMarkdown allowedElements={INLINE_ELEMENTS} unwrapDisallowed>
        {children}
      </ReactMarkdown>
    </span>
  );
}

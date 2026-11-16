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

/** "Table: <column headers>" from the table's first row of <th> cells. */
function tableLabel(node: HastNode | undefined): string {
  const headers: string[] = [];
  const visit = (n: HastNode) => {
    if (headers.length) return;
    if (n.tagName === 'tr') {
      for (const cell of n.children ?? []) {
        if (cell.tagName === 'th') headers.push(hastText(cell).trim() || 'Compared');
      }
      return;
    }
    (n.children ?? []).forEach(visit);
  };
  if (node) visit(node);
  return headers.length ? `Table: ${headers.join(', ')}` : 'Table';
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
    return <CodeBlock code={text} lang={FENCE_LANG[fence ?? ''] ?? 'text'} />;
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

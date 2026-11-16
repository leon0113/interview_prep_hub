import { lazy, Suspense } from 'react';
import { InlineText } from '@/components/common/InlineText';
import type { TraceBlock } from '@/content/leetcode/schema';
import { cn } from '@/lib/cn';

const ArrayPointersViz = lazy(() => import('@/visualizations/leetcode/ArrayPointersViz'));
const SqlStepsViz = lazy(() => import('@/visualizations/leetcode/SqlStepsViz'));

/** One trace from a note: a table, an ASCII diagram, or an animated walk-through. */
export function TraceView({ block, animate = true }: { block: TraceBlock; animate?: boolean }) {
  switch (block.kind) {
    case 'table':
      return <TraceTable block={block} />;
    case 'diagram':
      return <TraceDiagram title={block.title} text={block.text} />;
    case 'steps':
      return animate ? (
        <Suspense fallback={<VizPlaceholder />}>
          <ArrayPointersViz
            title={plainTitle(block.title) ?? 'Step by step'}
            states={block.arrayStates}
          />
        </Suspense>
      ) : null;
    case 'sqlSteps':
      return (
        <Suspense fallback={<VizPlaceholder />}>
          <SqlStepsViz title={plainTitle(block.title)} steps={block.steps} />
        </Suspense>
      );
  }
}

/** Visualization titles are plain text; drop inline-code backticks. */
function plainTitle(title: string | undefined): string | undefined {
  return title?.replace(/`/g, '');
}

function VizPlaceholder() {
  return (
    <div aria-hidden className="h-72 animate-pulse rounded-xl border border-border bg-surface" />
  );
}

function BlockTitle({ children }: { children: string | undefined }) {
  return children ? (
    <p className="mb-2 text-sm font-medium text-muted">
      <InlineText>{children}</InlineText>
    </p>
  ) : null;
}

function TraceTable({ block }: { block: Extract<TraceBlock, { kind: 'table' }> }) {
  const bold = new Set((block.highlightCells ?? []).map(([r, c]) => `${r}:${c}`));
  return (
    <figure>
      <BlockTitle>{block.title}</BlockTitle>
      <div
        className="scrollbar-thin overflow-x-auto rounded-xl border border-border"
        tabIndex={0}
        role="region"
        aria-label={plainTitle(block.title) ?? 'Trace table'}
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-xs text-muted">
            <tr>
              {block.columns.map((column, i) => (
                <th key={i} scope="col" className="px-3 py-2 font-medium whitespace-nowrap">
                  <InlineText>{column}</InlineText>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r} className="border-t border-border">
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={cn(
                      'px-3 py-2 font-mono text-[0.8125rem] whitespace-nowrap',
                      bold.has(`${r}:${c}`) && 'bg-accent-soft font-semibold text-accent-text',
                    )}
                  >
                    <InlineText>{cell}</InlineText>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Multi-line text is ASCII art (monospace, scrolls); one-liners are a short note. */
export function TraceDiagram({ title, text }: { title?: string; text: string }) {
  if (!text.includes('\n')) {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
        {title ? <span className="mr-2 font-medium text-muted">{title}:</span> : null}
        <InlineText>{text}</InlineText>
      </div>
    );
  }
  return (
    <figure>
      <BlockTitle>{title}</BlockTitle>
      <pre
        tabIndex={0}
        className="scrollbar-thin overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-[0.8125rem] leading-6"
      >
        {text}
      </pre>
    </figure>
  );
}

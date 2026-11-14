import { Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { InlineMarkdown } from '@/components/common/Markdown';
import { Button } from '@/components/ui/button';

/** Progressive hints: each click reveals exactly one more. */
export function HintList({ hints }: { hints: string[] }) {
  const [revealed, setRevealed] = useState(0);
  const remaining = hints.length - revealed;

  return (
    <div>
      {revealed > 0 ? (
        <ol className="mb-3 flex flex-col gap-2" aria-live="polite">
          {hints.slice(0, revealed).map((hint, index) => (
            <li
              key={index}
              className="flex gap-3 rounded-xl border border-border bg-surface p-3.5 text-[0.9375rem] leading-7 shadow-card"
            >
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text">
                {index + 1}
              </span>
              <span className="min-w-0">
                <InlineMarkdown>{hint}</InlineMarkdown>
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {remaining > 0 ? (
        <Button variant="outline" onClick={() => setRevealed((count) => count + 1)}>
          <Lightbulb className="size-4" aria-hidden />
          {revealed === 0 ? 'Show a hint' : 'Show next hint'}
          <span className="text-xs font-normal text-subtle tabular-nums">
            {revealed + 1}/{hints.length}
          </span>
        </Button>
      ) : (
        <p className="text-sm text-muted">All {hints.length} hints shown.</p>
      )}
    </div>
  );
}

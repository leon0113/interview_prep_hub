import { CalendarClock, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { InlineText } from '@/components/common/InlineText';
import {
  CONFIDENCE_LABEL,
  CONFIDENCES,
  daysUntil,
  REVIEW_INTERVAL_DAYS,
  useLcReviewStore,
  useNow,
  type Confidence,
} from '@/features/leetcode/store';
import { cn } from '@/lib/cn';

/** A self-check question: the answer stays hidden until you flip the card. */
export function FlipCard({ q, a }: { q: string; a: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={flipped}
      onClick={() => setFlipped((v) => !v)}
      className={cn(
        'flex min-h-24 w-full flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors',
        flipped
          ? 'border-accent-border bg-accent-soft'
          : 'border-border bg-surface hover:border-border-strong',
      )}
    >
      <span lang="bn" className="text-[0.9375rem] leading-7 font-medium">
        <InlineText>{q}</InlineText>
      </span>
      {flipped ? (
        <span lang="bn" className="text-sm leading-6 text-accent-text">
          <InlineText>{a}</InlineText>
        </span>
      ) : (
        <span className="text-xs text-subtle">Tap to show the answer</span>
      )}
    </button>
  );
}

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  forgot:
    'hover:border-level-advanced hover:text-level-advanced aria-pressed:border-level-advanced aria-pressed:bg-level-advanced/10 aria-pressed:text-level-advanced',
  hard: 'hover:border-level-intermediate hover:text-level-intermediate aria-pressed:border-level-intermediate aria-pressed:bg-level-intermediate/10 aria-pressed:text-level-intermediate',
  good: 'hover:border-accent hover:text-accent-text aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:text-accent-text',
  easy: 'hover:border-level-foundation hover:text-level-foundation aria-pressed:border-level-foundation aria-pressed:bg-level-foundation/10 aria-pressed:text-level-foundation',
};

/** Forgot / Hard / Good / Easy. Rating schedules the next review (see REVIEW_INTERVAL_DAYS). */
export function ConfidenceButtons({
  problemId,
  onRated,
}: {
  problemId: string;
  onRated?: (confidence: Confidence) => void;
}) {
  const now = useNow();
  const review = useLcReviewStore((s) => s.reviews[problemId]);
  const rate = useLcReviewStore((s) => s.rate);
  const clear = useLcReviewStore((s) => s.clearReview);
  const current = now !== null ? review : undefined;

  return (
    <div>
      <div
        role="group"
        aria-label="How well did you remember it?"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {CONFIDENCES.map((confidence) => (
          <button
            key={confidence}
            type="button"
            aria-pressed={current?.confidence === confidence}
            onClick={() => {
              rate(problemId, confidence);
              onRated?.(confidence);
            }}
            className={cn(
              'flex min-h-12 flex-col items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium transition-colors',
              CONFIDENCE_STYLE[confidence],
            )}
          >
            {CONFIDENCE_LABEL[confidence]}
            <span className="text-[0.6875rem] font-normal text-muted">
              again in {REVIEW_INTERVAL_DAYS[confidence]}d
            </span>
          </button>
        ))}
      </div>
      {current ? (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5" aria-hidden />
            Rated {CONFIDENCE_LABEL[current.confidence]} ·{' '}
            {nextReviewLabel(daysUntil(current.nextReview, now ?? current.lastReviewed))}
          </span>
          <button
            type="button"
            onClick={() => clear(problemId)}
            className="inline-flex min-h-8 items-center gap-1 rounded-md px-1.5 text-muted hover:text-fg"
          >
            <RotateCcw className="size-3" aria-hidden />
            Clear rating
          </button>
        </p>
      ) : null}
    </div>
  );
}

function nextReviewLabel(days: number): string {
  if (days <= 0) return 'due now';
  if (days === 1) return 'next review tomorrow';
  return `next review in ${days} days`;
}

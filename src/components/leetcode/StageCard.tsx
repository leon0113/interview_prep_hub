import { Eye, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { STAGE_TITLES } from '@/features/leetcode/store';
import { cn } from '@/lib/cn';

const REVEAL_LABEL = [
  '',
  'Reveal approach',
  'Reveal breakdown',
  'Reveal solution',
  'Reveal revise',
] as const;

interface StageCardProps {
  index: number;
  open: boolean;
  /** The next locked stage gets a reveal button; later ones just say "locked". */
  isNext: boolean;
  onReveal: () => void;
  hint?: string;
  children: ReactNode;
}

/**
 * One stage of the problem page. A locked stage renders only its header: its content is not
 * in the page at all, so you can't scroll into the answer by accident.
 */
export function StageCard({ index, open, isNext, onReveal, hint, children }: StageCardProps) {
  const title = STAGE_TITLES[index]!;
  return (
    <section
      id={`stage-${index + 1}`}
      aria-labelledby={`stage-${index + 1}-title`}
      className={cn(
        'scroll-mt-24 rounded-xl border bg-surface shadow-card',
        open ? 'border-border' : 'border-dashed border-border',
      )}
    >
      <header className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
        <span
          className={cn(
            'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
            open ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-muted',
          )}
          aria-hidden
        >
          {index + 1}
        </span>
        <h2 id={`stage-${index + 1}-title`} className="text-base font-semibold">
          {title}
        </h2>
        {!open ? (
          <span className="ml-auto flex items-center gap-2">
            {isNext ? (
              <Button variant="soft" size="sm" onClick={onReveal}>
                <Eye className="size-4" aria-hidden />
                {REVEAL_LABEL[index]}
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
                <Lock className="size-3.5" aria-hidden />
                Locked
              </span>
            )}
          </span>
        ) : null}
      </header>
      {!open && isNext && hint ? (
        <p className="border-t border-dashed border-border px-4 py-3 text-sm text-muted sm:px-5">
          {hint}
        </p>
      ) : null}
      {open ? (
        <div className="flex flex-col gap-6 border-t border-border px-4 py-5 sm:px-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}

/** A labelled block inside a stage. */
export function StageBlock({
  title,
  badge,
  children,
  className,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="mb-2.5 flex flex-wrap items-center gap-2 text-sm font-semibold">
        {title}
        {badge}
      </h3>
      {children}
    </div>
  );
}

/** Highlighted callout (one-line reminder, invariant). */
export function Callout({
  label,
  children,
  tone = 'accent',
}: {
  label: string;
  children: ReactNode;
  tone?: 'accent' | 'amber';
}) {
  return (
    <div
      className={cn(
        'rounded-xl border-l-4 px-4 py-3',
        tone === 'accent'
          ? 'border-accent bg-accent-soft'
          : 'border-level-intermediate bg-level-intermediate/10',
      )}
    >
      <p
        className={cn(
          'mb-1 text-xs font-semibold tracking-wide uppercase',
          tone === 'accent' ? 'text-accent-text' : 'text-level-intermediate',
        )}
      >
        {label}
      </p>
      <div lang="bn" className="text-[0.9375rem] leading-7">
        {children}
      </div>
    </div>
  );
}

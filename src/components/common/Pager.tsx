import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

export interface PagerTarget {
  to: string;
  title: string;
  /** Overrides the default "Previous" / "Next" eyebrow. */
  label?: string;
}

interface PagerProps {
  prev?: PagerTarget;
  next?: PagerTarget;
  /** Accessible name, e.g. "Previous and next question". */
  label: string;
}

/** Previous / next cards at the bottom of a page. */
export function Pager({ prev, next, label }: PagerProps) {
  if (!prev && !next) return null;
  return (
    <nav aria-label={label} className="mt-8 grid gap-3 sm:grid-cols-2">
      {prev ? <PagerLink target={prev} direction="prev" /> : <span className="hidden sm:block" />}
      {next ? <PagerLink target={next} direction="next" /> : null}
    </nav>
  );
}

function PagerLink({ target, direction }: { target: PagerTarget; direction: 'prev' | 'next' }) {
  const isNext = direction === 'next';
  return (
    <Link
      to={target.to}
      className={cn(
        'group flex min-w-0 flex-col rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-accent-border',
        isNext && 'sm:items-end sm:text-right',
      )}
    >
      <span className="inline-flex items-center gap-1 text-xs font-medium text-subtle">
        {isNext ? null : <ArrowLeft className="size-3.5" aria-hidden />}
        {target.label ?? (isNext ? 'Next' : 'Previous')}
        {isNext ? <ArrowRight className="size-3.5" aria-hidden /> : null}
      </span>
      <span className="mt-1 line-clamp-2 text-sm font-medium group-hover:text-accent-text">
        {target.title}
      </span>
    </Link>
  );
}

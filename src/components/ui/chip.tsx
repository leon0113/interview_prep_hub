import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  selected: boolean;
  /** Trailing number, e.g. how many items match. */
  count?: number;
  children: ReactNode;
}

/** Toggleable filter chip. 44px tall on touch screens, compact on desktop. */
export function Chip({ selected, count, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors lg:h-8 lg:px-3 lg:text-[0.8125rem]',
        selected
          ? 'border-accent-border bg-accent-soft text-accent-text'
          : 'border-border bg-surface text-muted hover:border-border-strong hover:text-fg',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined ? (
        <span className={cn('text-xs tabular-nums', selected ? 'font-medium' : 'text-subtle')}>
          {count}
        </span>
      ) : null}
    </button>
  );
}

/** Thin vertical rule between chip groups. */
export function ChipDivider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 self-center bg-border" />;
}

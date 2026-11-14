import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-surface-2 px-1.5 font-sans text-[0.6875rem] font-medium text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/** A key combination such as Ctrl + K, with a label. */
export function KeyboardHint({ keys, label }: { keys: string[]; label?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
      {keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
      {label}
    </span>
  );
}

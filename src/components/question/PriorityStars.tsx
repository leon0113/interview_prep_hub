import { Star } from 'lucide-react';
import type { Priority } from '@/content/schema';
import { cn } from '@/lib/cn';

const LABEL: Record<Priority, string> = {
  1: 'Priority 1 of 3: asked occasionally',
  2: 'Priority 2 of 3: asked often',
  3: 'Priority 3 of 3: asked in almost every interview',
};

export function PriorityStars({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      role="img"
      aria-label={LABEL[priority]}
      title={LABEL[priority]}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {[1, 2, 3].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={cn(
            'size-3.5',
            n <= priority ? 'fill-amber-400 text-amber-400' : 'text-border-strong',
          )}
        />
      ))}
    </span>
  );
}

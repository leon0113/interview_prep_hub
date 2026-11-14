import type { Level } from '@/content/schema';
import { cn } from '@/lib/cn';
import { LEVEL_LABEL } from '@/lib/content';

const tone: Record<Level, string> = {
  foundation: 'text-level-foundation',
  intermediate: 'text-level-intermediate',
  advanced: 'text-level-advanced',
};

export function LevelBadge({ level, className }: { level: Level; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-surface px-2 text-[0.6875rem] font-medium',
        tone[level],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {LEVEL_LABEL[level]}
    </span>
  );
}

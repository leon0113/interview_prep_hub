import { Check } from 'lucide-react';
import { useIsLearned } from '@/features/progress/hooks';
import { useProgressStore } from '@/features/progress/store';
import { cn } from '@/lib/cn';

interface LearnedCheckboxProps {
  /** Question or exercise id. */
  id: string;
  labels?: { off: string; on: string };
  className?: string;
}

const DEFAULT_LABELS = { off: 'Mark as learned', on: 'Learned' };

export function LearnedCheckbox({ id, labels = DEFAULT_LABELS, className }: LearnedCheckboxProps) {
  const learned = useIsLearned(id);
  const toggleLearned = useProgressStore((state) => state.toggleLearned);

  return (
    <label
      className={cn(
        'inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm transition-colors select-none lg:h-9',
        learned ? 'font-medium text-accent-text' : 'text-muted hover:text-fg',
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={learned}
        onChange={() => toggleLearned(id)}
      />
      <span
        aria-hidden
        className={cn(
          'inline-flex size-[1.125rem] items-center justify-center rounded-md border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
          learned ? 'border-accent bg-accent text-accent-fg' : 'border-border-strong',
        )}
      >
        {learned ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>
      {learned ? labels.on : labels.off}
    </label>
  );
}

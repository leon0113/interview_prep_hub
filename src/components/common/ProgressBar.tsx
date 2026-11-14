import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  /** Accessible label, e.g. "Python progress". */
  label: string;
  className?: string;
}

export function ProgressBar({ value, max, label, className }: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} of ${max} learned`}
      className={cn('h-1.5 overflow-hidden rounded-full bg-surface-2', className)}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

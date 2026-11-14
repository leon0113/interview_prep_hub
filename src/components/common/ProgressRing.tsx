import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ProgressRingProps {
  value: number;
  max: number;
  /** Accessible label, e.g. "Functions progress". */
  label: string;
  /** Diameter in px. */
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/** Circular progress with the percentage (or a check when complete) in the middle. */
export function ProgressRing({
  value,
  max,
  label,
  size = 44,
  strokeWidth = 4,
  className,
}: ProgressRingProps) {
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  const percent = Math.round(ratio * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const complete = max > 0 && value >= max;

  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} of ${max} learned`}
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-surface-2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="stroke-accent transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span
        aria-hidden
        className={cn(
          'absolute font-medium tabular-nums',
          complete ? 'text-accent-text' : 'text-muted',
        )}
        style={{ fontSize: Math.max(10, Math.round(size * 0.25)) }}
      >
        {complete ? <Check style={{ width: size * 0.4, height: size * 0.4 }} /> : `${percent}%`}
      </span>
    </span>
  );
}

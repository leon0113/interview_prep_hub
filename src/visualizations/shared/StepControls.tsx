import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Stepper } from './useStepper';

const button =
  'inline-flex size-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:pointer-events-none disabled:opacity-35 lg:size-9';

/** Prev / play-pause / next / reset with a step counter and a clickable progress track. */
export function StepControls({ stepper }: { stepper: Stepper }) {
  const { index, count, playing, atStart, atEnd } = stepper;

  return (
    <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
      <ControlButton label="Previous step" onClick={stepper.prev} disabled={atStart}>
        <ChevronLeft className="size-5" aria-hidden />
      </ControlButton>
      <button
        type="button"
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={stepper.togglePlay}
        className={cn(
          'inline-flex size-11 items-center justify-center rounded-lg transition-colors lg:size-9',
          'bg-accent-soft text-accent-text hover:brightness-[0.97] dark:hover:brightness-125',
        )}
      >
        {playing ? (
          <Pause className="size-4" aria-hidden />
        ) : (
          <Play className="size-4" aria-hidden />
        )}
      </button>
      <ControlButton label="Next step" onClick={stepper.next} disabled={atEnd}>
        <ChevronRight className="size-5" aria-hidden />
      </ControlButton>

      <div className="mx-2 flex min-w-0 flex-1 items-center gap-1" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => stepper.goTo(i)}
            className="group flex h-6 min-w-0 flex-1 items-center"
          >
            <span
              className={cn(
                'h-1 w-full rounded-full transition-colors',
                i <= index ? 'bg-accent' : 'bg-border group-hover:bg-border-strong',
              )}
            />
          </button>
        ))}
      </div>

      <span className="shrink-0 text-xs text-muted tabular-nums" aria-live="off">
        Step {index + 1} / {count}
      </span>
      <ControlButton label="Reset" onClick={stepper.reset} disabled={atStart}>
        <RotateCcw className="size-4" aria-hidden />
      </ControlButton>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={button}
    >
      {children}
    </button>
  );
}

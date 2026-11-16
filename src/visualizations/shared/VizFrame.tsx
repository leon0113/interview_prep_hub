import { MotionConfig } from 'motion/react';
import type { KeyboardEvent, ReactNode } from 'react';
import { InlineText } from '@/components/common/InlineText';
import { StepControls } from './StepControls';
import type { Stepper } from './useStepper';

export interface StepText {
  /** One-line explanation of the current step (English). */
  text: string;
  /** Optional Bangla line shown under it. */
  bn?: string;
  /** Render `code`, **bold** and *italic* in the text (LeetCode captions use inline code). */
  rich?: boolean;
}

interface VizFrameProps {
  title: string;
  /** Short description of what the visualization shows. */
  caption?: string;
  /** Optional row above the diagram, e.g. preset chips. */
  toolbar?: ReactNode;
  /** The diagram. Rendered inside a CSS container, so use `@md:` / `@lg:` variants to reflow. */
  children: ReactNode;
  /** Explanation of the current step, announced to screen readers. */
  step?: StepText;
  /** Pass a stepper to get the standard prev / play / next / reset controls. */
  stepper?: Stepper;
}

/**
 * Shell shared by every visualization: title, caption, diagram area, step description
 * and StepControls. Left/Right arrow keys step while focus is inside the frame.
 */
export function VizFrame({ title, caption, toolbar, children, step, stepper }: VizFrameProps) {
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!stepper || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, [role="tab"]')) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepper.next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepper.prev();
    }
  }

  return (
    // reducedMotion="user": motion animations are skipped for people who ask for less motion.
    <MotionConfig reducedMotion="user">
      <section
        aria-label={`Visualization: ${title}`}
        onKeyDown={onKeyDown}
        className="overflow-hidden rounded-xl border border-border bg-surface"
      >
        <header className="border-b border-border px-3.5 py-3 sm:px-4">
          <h4 className="text-sm font-semibold">{title}</h4>
          {caption ? <p className="mt-0.5 text-xs leading-5 text-muted">{caption}</p> : null}
        </header>

        {toolbar ? (
          <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto border-b border-border px-3.5 py-2 sm:px-4">
            {toolbar}
          </div>
        ) : null}

        <div className="@container bg-bg p-3 sm:p-4">{children}</div>

        {step ? (
          <div
            aria-live="polite"
            className="min-h-[4.5rem] border-t border-border px-3.5 py-3 sm:px-4"
          >
            <p className="text-sm leading-6 text-pretty">
              {step.rich ? <InlineText>{step.text}</InlineText> : step.text}
            </p>
            {step.bn ? (
              <p lang="bn" className="mt-1 text-[0.8125rem] text-pretty text-muted">
                {step.bn}
              </p>
            ) : null}
          </div>
        ) : null}

        {stepper ? <StepControls stepper={stepper} /> : null}
      </section>
    </MotionConfig>
  );
}

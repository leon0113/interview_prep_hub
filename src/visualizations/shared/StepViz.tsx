import type { ReactNode } from 'react';
import { useStepper } from './useStepper';
import { VizFrame, type StepText } from './VizFrame';

/** One step = a state snapshot plus its one-line explanation. */
export interface VizStep<T> extends StepText {
  state: T;
}

interface StepVizProps<T> {
  title: string;
  caption?: string;
  steps: readonly VizStep<T>[];
  toolbar?: ReactNode;
  /** Draws the diagram for the current step. */
  children: (state: T, index: number) => ReactNode;
}

/**
 * The standard step-based visualization: a list of snapshots, one explanation per step,
 * and StepControls. To switch between presets, give it a `key` so the stepper restarts.
 */
export function StepViz<T>({ title, caption, steps, toolbar, children }: StepVizProps<T>) {
  const stepper = useStepper(steps.length);
  const step = steps[Math.min(stepper.index, steps.length - 1)];
  if (!step) return null;

  return (
    <VizFrame title={title} caption={caption} toolbar={toolbar} step={step} stepper={stepper}>
      {children(step.state, stepper.index)}
    </VizFrame>
  );
}

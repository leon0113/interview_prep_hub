import type { ReactNode } from 'react';
import { StepViz, type VizStep } from '../../shared/StepViz';
import { LinkedListDiagram, LLVars, type LLState } from './LinkedListDiagram';

/** StepViz preconfigured to draw linked-list snapshots. */
export function LLStepViz({
  title,
  caption,
  steps,
  toolbar,
}: {
  title: string;
  caption: string;
  steps: readonly VizStep<LLState>[];
  toolbar?: ReactNode;
}) {
  return (
    <StepViz title={title} caption={caption} steps={steps} toolbar={toolbar}>
      {(state) => (
        <div>
          {state.nodes.length === 0 ? (
            <p className="py-8 text-center font-mono text-sm text-subtle">
              head → null (empty list)
            </p>
          ) : (
            <LinkedListDiagram state={state} label={title} />
          )}
          <LLVars vars={state.vars} />
        </div>
      )}
    </StepViz>
  );
}

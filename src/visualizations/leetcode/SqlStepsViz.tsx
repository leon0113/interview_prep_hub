import { ResultTable } from '@/components/question/ResultTable';
import type { TraceBlock } from '@/content/leetcode/schema';
import { StepViz } from '../shared/StepViz';

type SqlStep = Extract<TraceBlock, { kind: 'sqlSteps' }>['steps'][number];

/**
 * Database problems: the intermediate result after each clause, in the order PostgreSQL runs
 * them (FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY). Fed by a problem's
 * `sqlSteps` trace, so new problems need no code.
 */
export default function SqlStepsViz({
  title,
  steps,
}: {
  title?: string;
  steps: readonly SqlStep[];
}) {
  return (
    <StepViz
      title={title ?? 'Query, clause by clause'}
      caption="Each step shows the rows after one clause runs."
      steps={steps.map((step) => ({ state: step, text: step.caption, rich: true }))}
    >
      {(step) => (
        <div className="flex flex-col gap-3">
          <p className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-xs font-semibold text-accent-text">
              {step.clause}
            </span>
          </p>
          <pre className="scrollbar-thin overflow-x-auto rounded-lg border border-border bg-surface p-3 font-mono text-xs leading-5">
            {step.sql}
          </pre>
          <ResultTable columns={step.table.columns} rows={step.table.rows} />
        </div>
      )}
    </StepViz>
  );
}

import { LoaderCircle, Play, SquareArrowOutUpRight, X } from 'lucide-react';
import { Link } from 'react-router';
import type { SqlRunState } from '@/features/sql/useSqlRun';
import { cn } from '@/lib/cn';
import { paths } from '@/lib/content';
import { pluralize } from '@/lib/text';
import { SqlResults } from './SqlResults';

const busy = (state: SqlRunState) => state.status === 'starting' || state.status === 'running';

/** "Run" in a SQL code block's header. */
export function RunSqlButton({ state, onRun }: { state: SqlRunState; onRun: () => void }) {
  return (
    <button
      type="button"
      onClick={onRun}
      disabled={busy(state)}
      aria-label="Run this query in your browser"
      className="inline-flex h-11 items-center gap-1.5 rounded-md px-2.5 text-[0.6875rem] font-medium tracking-normal text-accent-text normal-case transition-colors hover:bg-border/60 disabled:opacity-60 lg:h-7 lg:px-2"
    >
      {busy(state) ? (
        <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Play className="size-3.5" aria-hidden />
      )}
      Run
    </button>
  );
}

/** The live result of pressing Run, shown under the verified result. */
export function LiveSqlResult({
  state,
  code,
  trackSlug,
  onClose,
}: {
  state: SqlRunState;
  code: string;
  trackSlug: string;
  onClose: () => void;
}) {
  if (state.status === 'idle') return null;

  const status =
    state.status === 'starting'
      ? 'Starting PostgreSQL in your browser… (the first run downloads about 5 MB)'
      : state.status === 'running'
        ? 'Running…'
        : state.status === 'failed'
          ? state.message
          : `${pluralize(state.result.statements.length, 'statement')} · ${Math.max(1, Math.round(state.result.ms))} ms · on a fresh copy of the sample database`;

  return (
    <section aria-label="Live result" className="border-t border-border bg-surface px-3.5 py-3">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="text-[0.6875rem] font-semibold tracking-wide text-accent-text uppercase">
          Live result
        </p>
        <p
          aria-live="polite"
          className={cn(
            'flex-1 text-xs',
            state.status === 'failed' ? 'text-level-advanced' : 'text-muted',
          )}
        >
          {status}
        </p>
        <Link
          to={`${paths.playground(trackSlug)}?sql=${encodeURIComponent(code)}`}
          className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-accent-text hover:underline lg:min-h-0"
        >
          <SquareArrowOutUpRight className="size-3.5" aria-hidden />
          Edit in Playground
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close live result"
          className="inline-flex size-11 items-center justify-center rounded-md text-subtle hover:bg-surface-2 hover:text-fg lg:size-7"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {state.status === 'done' ? <SqlResults result={state.result} /> : null}
    </section>
  );
}

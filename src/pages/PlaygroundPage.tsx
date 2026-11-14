import { LoaderCircle, Play, RotateCcw, Table2 } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { NotFound } from '@/components/common/NotFound';
import { PageHeader } from '@/components/common/PageHeader';
import { SqlResults } from '@/components/question/SqlResults';
import { Button } from '@/components/ui/button';
import { useSqlRun } from '@/features/sql/useSqlRun';
import { useTrack } from '@/features/tracks/useTrack';
import { paths } from '@/lib/content';
import { pluralize } from '@/lib/text';
import { useIsMac } from '@/lib/useIsMac';

const STARTER = `-- Doctors per department, including departments with none
SELECT dep.name AS department, count(d.id) AS doctors
FROM departments AS dep
LEFT JOIN doctors AS d ON d.department_id = dep.id
GROUP BY dep.name
ORDER BY doctors DESC, dep.name;`;

/**
 * Free-form SQL against the track's sample database, running in the browser (PGlite). Not
 * prerendered: it is interactive only, and reads a starting query from `?sql=`.
 */
export default function PlaygroundPage() {
  const track = useTrack();
  const [searchParams] = useSearchParams();
  const [sql, setSql] = useState(() => searchParams.get('sql') ?? STARTER);
  const [resetNote, setResetNote] = useState(false);
  const { state, run, resetDatabase } = useSqlRun(track.dataset ? track.slug : null, 'playground');
  const isMac = useIsMac();

  if (!track.dataset) return <NotFound />;
  const busy = state.status === 'starting' || state.status === 'running';

  function runNow() {
    setResetNote(false);
    void run(sql);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      runNow();
    }
  }

  async function reset() {
    await resetDatabase();
    setResetNote(true);
  }

  return (
    <div>
      <PageHeader
        eyebrow={track.name}
        title="SQL Playground"
        description="Write any query against the sample database. It runs on real PostgreSQL inside your browser; nothing is sent anywhere."
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-subtle">Tables:</span>
        {track.dataset.tables.map((table) => (
          <button
            key={table}
            type="button"
            onClick={() => setSql(`SELECT *\nFROM ${table}\nLIMIT 20;`)}
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-surface px-3 font-mono text-xs text-muted transition-colors hover:border-accent-border hover:text-fg lg:min-h-8"
          >
            <Table2 className="size-3.5" aria-hidden />
            {table}
          </button>
        ))}
        <Link
          to={paths.dataset(track.slug)}
          className="ml-auto inline-flex min-h-11 items-center text-xs font-medium text-accent-text hover:underline lg:min-h-8"
        >
          View the schema
        </Link>
      </div>

      <label htmlFor="sql-editor" className="sr-only">
        SQL to run
      </label>
      <textarea
        id="sql-editor"
        value={sql}
        onChange={(event) => setSql(event.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        rows={Math.min(18, Math.max(8, sql.split('\n').length + 1))}
        className="block w-full resize-y rounded-xl border border-border bg-surface p-3.5 font-mono text-[0.8125rem] leading-[1.7] text-fg shadow-card outline-none focus-visible:border-accent-border focus-visible:ring-2 focus-visible:ring-accent/40"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="solid" size="md" onClick={runNow} disabled={busy}>
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
          Run
          <kbd className="ml-1 hidden rounded border border-accent-fg/40 px-1 text-[0.6875rem] font-normal sm:inline">
            {isMac ? '⌘' : 'Ctrl'} ↵
          </kbd>
        </Button>
        <Button variant="outline" size="md" onClick={() => void reset()} disabled={busy}>
          <RotateCcw className="size-4" aria-hidden />
          Reset database
        </Button>
        <p aria-live="polite" className="text-sm text-muted">
          {state.status === 'starting'
            ? 'Starting PostgreSQL… (the first run downloads about 5 MB)'
            : state.status === 'running'
              ? 'Running…'
              : resetNote
                ? 'The sample database was restored.'
                : state.status === 'done'
                  ? `${pluralize(state.result.statements.length, 'statement')} in ${Math.max(1, Math.round(state.result.ms))} ms`
                  : 'Changes persist until you reset or reload the page.'}
        </p>
      </div>

      <section aria-label="Results" className="mt-6">
        {state.status === 'failed' ? (
          <p role="alert" className="text-sm text-level-advanced">
            {state.message}
          </p>
        ) : state.status === 'done' ? (
          <SqlResults result={state.result} />
        ) : null}
      </section>
    </div>
  );
}

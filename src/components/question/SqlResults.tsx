import type { RunResult, StatementResult } from '@/lib/sql/session';
import { cn } from '@/lib/cn';
import { ResultTable } from './ResultTable';

/** One line summary of a statement, used as a label when a script has several. */
function label(sql: string): string {
  const oneLine = sql.replace(/\s+/g, ' ').trim();
  return oneLine.length > 72 ? `${oneLine.slice(0, 71)}…` : oneLine;
}

function Statement({ statement, showSql }: { statement: StatementResult; showSql: boolean }) {
  return (
    <li className="space-y-2">
      {showSql ? (
        <p className="truncate font-mono text-xs text-subtle" title={statement.sql}>
          {label(statement.sql)}
        </p>
      ) : null}
      {statement.notices.map((notice, i) => (
        <p key={i} className="font-mono text-xs text-muted">
          NOTICE: {notice}
        </p>
      ))}
      {statement.kind === 'rows' ? (
        <ResultTable standalone columns={statement.table.columns} rows={statement.table.rows} />
      ) : statement.kind === 'command' ? (
        <p className="inline-block rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[0.8125rem] text-muted">
          {statement.tag}
        </p>
      ) : (
        <div
          role="alert"
          className="rounded-xl border border-level-advanced/40 bg-level-advanced/10 px-3.5 py-2.5 font-mono text-[0.8125rem] leading-6 text-level-advanced"
        >
          <p>ERROR: {statement.message}</p>
          {statement.detail ? <p>DETAIL: {statement.detail}</p> : null}
          {statement.hint ? <p>HINT: {statement.hint}</p> : null}
        </div>
      )}
    </li>
  );
}

/** Every statement's outcome: result tables, command tags (UPDATE 3), notices and errors. */
export function SqlResults({ result, className }: { result: RunResult; className?: string }) {
  if (result.statements.length === 0) {
    return <p className={cn('text-sm text-muted', className)}>Nothing to run.</p>;
  }
  const many = result.statements.length > 1;
  return (
    <ol className={cn('space-y-4', className)}>
      {result.statements.map((statement, i) => (
        <Statement key={i} statement={statement} showSql={many} />
      ))}
    </ol>
  );
}

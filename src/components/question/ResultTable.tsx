import type { ResultTable as ResultTableData } from '@/content/schema';
import { cn } from '@/lib/cn';
import { pluralize } from '@/lib/text';

type Cell = ResultTableData['rows'][number][number];

interface ResultTableProps extends ResultTableData {
  /** Standalone = its own rounded box; otherwise it sits flush under a CodeBlock. */
  standalone?: boolean;
  className?: string;
}

function CellValue({ value }: { value: Cell }) {
  if (value === null) {
    return (
      <span className="rounded bg-surface-2 px-1 py-px text-[0.6875rem] font-medium text-subtle italic ring-1 ring-border">
        NULL
      </span>
    );
  }
  if (typeof value === 'boolean') return <>{value ? 'true' : 'false'}</>;
  return <>{String(value)}</>;
}

/**
 * The rows a query returns, shown like a database client would: column headers, zebra rows,
 * numbers right-aligned, NULL as a muted badge (never confused with the string "NULL"), and a
 * row count. Scrolls sideways on narrow screens instead of squeezing the columns.
 */
export function ResultTable({ columns, rows, note, standalone, className }: ResultTableProps) {
  // A column is numeric when every non-null value in it is a number.
  const numeric = columns.map((_, col) => {
    const values = rows.map((row) => row[col]).filter((value) => value !== null);
    return values.length > 0 && values.every((value) => typeof value === 'number');
  });

  return (
    <div
      className={cn(
        'bg-surface-2',
        standalone ? 'rounded-xl border border-border' : 'border-t border-border',
        className,
      )}
    >
      <p className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-2 text-[0.6875rem] font-semibold tracking-wide text-subtle uppercase">
        <span aria-hidden className="size-1.5 rounded-full bg-level-foundation" />
        Result
      </p>
      <div
        tabIndex={0}
        role="region"
        aria-label={`Query result, ${pluralize(rows.length, 'row')}`}
        className="scrollbar-thin overflow-x-auto px-3.5"
      >
        <table className="w-max border-collapse font-mono text-[0.8125rem] leading-6">
          <thead>
            <tr className="border-b border-border-strong">
              {columns.map((column, col) => (
                <th
                  key={col}
                  scope="col"
                  className={cn(
                    'px-2.5 py-1 font-semibold whitespace-nowrap text-fg first:pl-1',
                    numeric[col] ? 'text-right' : 'text-left',
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-b border-border/60 last:border-0 even:bg-surface/70">
                {row.map((value, col) => (
                  <td
                    key={col}
                    className={cn(
                      'px-2.5 py-1 align-top whitespace-pre text-muted first:pl-1',
                      numeric[col] && 'text-right tabular-nums',
                    )}
                  >
                    <CellValue value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="flex flex-wrap items-baseline gap-x-2 px-3.5 pt-1.5 pb-2.5 text-xs text-subtle">
        <span className="tabular-nums">({pluralize(rows.length, 'row')})</span>
        {note ? <span className="text-muted">{note}</span> : null}
      </p>
    </div>
  );
}

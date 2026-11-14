import { Check, ClipboardCopy } from 'lucide-react';
import { useMemo } from 'react';
import { NotFound } from '@/components/common/NotFound';
import { PageHeader } from '@/components/common/PageHeader';
import { SchemaDiagram } from '@/components/dataset/SchemaDiagram';
import { CodeBlock } from '@/components/question/CodeBlock';
import { ResultTable } from '@/components/question/ResultTable';
import { Button } from '@/components/ui/button';
import { buildSeedSql } from '@/content/dataset';
import type { DatasetColumn, DatasetTable } from '@/content/schema';
import { useDatasetData } from '@/features/tracks/routeData';
import { useTrack } from '@/features/tracks/useTrack';
import { useRegisterToc } from '@/features/ui/store';
import { pluralize } from '@/lib/text';
import { useCopyToClipboard } from '@/lib/useCopyToClipboard';

const tableAnchor = (name: string) => `table-${name}`;

export default function DatasetPage() {
  const track = useTrack();
  const { dataset } = useDatasetData();
  // Generated from the same rows shown below, so the page and the script cannot disagree.
  const seed = useMemo(() => (dataset ? buildSeedSql(dataset) : ''), [dataset]);
  const { copied, copy } = useCopyToClipboard(2000);

  const tocItems = useMemo(
    () =>
      dataset
        ? [
            { id: 'relationships', title: 'Relationships' },
            ...dataset.tables.map((table) => ({
              id: tableAnchor(table.name),
              title: table.name,
              hint: pluralize(table.rows.length, 'row'),
            })),
            { id: 'seed-script', title: 'Seed script' },
          ]
        : [],
    [dataset],
  );
  useRegisterToc(tocItems);

  if (!dataset) return <NotFound />;
  const rowCount = dataset.tables.reduce((sum, table) => sum + table.rows.length, 0);

  return (
    <div>
      <PageHeader eyebrow={track.name} title={dataset.title} description={dataset.description}>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Button variant="solid" size="md" onClick={() => copy(seed)}>
            {copied ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <ClipboardCopy className="size-4" aria-hidden />
            )}
            <span aria-live="polite">{copied ? 'Seed SQL copied' : 'Copy seed SQL'}</span>
          </Button>
          <p className="text-sm text-muted">
            {pluralize(dataset.tables.length, 'table')} · {pluralize(rowCount, 'row')} ·{' '}
            {dataset.dialect}
          </p>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          Every example and exercise in this track runs against this data. Paste the seed into{' '}
          <code className="font-mono text-[0.8125rem] text-fg">psql</code> (or any PostgreSQL
          client) to follow along on your machine.
        </p>
      </PageHeader>

      <section id="relationships" aria-labelledby="relationships-heading" className="scroll-mt-20">
        <h2 id="relationships-heading" className="mb-3 text-lg font-semibold tracking-tight">
          Relationships
        </h2>
        <SchemaDiagram dataset={dataset} />
      </section>

      <div className="mt-12 space-y-12">
        {dataset.tables.map((table) => (
          <TableSection key={table.name} table={table} />
        ))}
      </div>

      <section id="seed-script" aria-labelledby="seed-heading" className="mt-12 scroll-mt-20">
        <h2 id="seed-heading" className="mb-3 text-lg font-semibold tracking-tight">
          Seed script
        </h2>
        <details className="group rounded-xl border border-border">
          <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-medium text-accent-text select-none">
            Show the full CREATE + INSERT script
          </summary>
          <div className="border-t border-border p-3">
            <CodeBlock lang="sql" code={seed} runnable={false} />
          </div>
        </details>
      </section>
    </div>
  );
}

function constraintText(column: DatasetColumn): string {
  const parts = column.constraints ? [column.constraints] : [];
  if (column.references) {
    const { table, column: target, onDelete } = column.references;
    parts.push(`→ ${table}.${target}${onDelete ? ` (ON DELETE ${onDelete})` : ''}`);
  }
  return parts.join(' ');
}

function TableSection({ table }: { table: DatasetTable }) {
  const headingId = `${tableAnchor(table.name)}-heading`;
  return (
    <section id={tableAnchor(table.name)} aria-labelledby={headingId} className="scroll-mt-20">
      <h2 id={headingId} className="font-mono text-lg font-semibold tracking-tight">
        {table.name}
      </h2>
      <p className="mt-1 text-sm leading-6 text-muted">{table.purpose}</p>

      <div
        tabIndex={0}
        role="region"
        aria-label={`${table.name} columns`}
        className="mt-3 scrollbar-thin overflow-x-auto rounded-xl border border-border"
      >
        <table className="w-full text-left text-[0.8125rem]">
          <thead className="bg-surface-2 text-xs text-subtle">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">
                Column
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                Type
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                Constraints
              </th>
            </tr>
          </thead>
          <tbody>
            {table.columns.map((column) => (
              <tr key={column.name} className="border-t border-border">
                <td className="px-3 py-1.5 font-mono font-medium whitespace-nowrap">
                  {column.name}
                </td>
                <td className="px-3 py-1.5 font-mono whitespace-nowrap text-muted">
                  {column.type}
                </td>
                <td className="min-w-48 px-3 py-1.5 font-mono text-xs text-muted">
                  {constraintText(column)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ResultTable
        standalone
        className="mt-3"
        columns={table.columns.map((column) => column.name)}
        rows={table.rows}
      />
    </section>
  );
}

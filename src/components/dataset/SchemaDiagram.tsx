import { useId } from 'react';
import type { Dataset, DatasetColumn, DatasetTable } from '@/content/schema';

/*
 * An ER-style diagram of a sample database, laid out automatically from its foreign keys:
 * - wide screens: one column per dependency depth (referenced tables on the left), with each
 *   link drawn from the foreign-key row to the referenced key row;
 * - phones: one column of tables with links routed down a left gutter, so text stays at a
 *   readable size instead of scaling the wide layout down.
 */

const HEADER = 28;
const ROW = 20;
const PAD = 8;

interface Box {
  table: DatasetTable;
  x: number;
  y: number;
  width: number;
}

interface Link {
  from: { table: string; column: string };
  to: { table: string; column: string };
}

const boxHeight = (table: DatasetTable) => HEADER + table.columns.length * ROW + PAD;
const isPrimaryKey = (column: DatasetColumn) => /PRIMARY KEY/i.test(column.constraints ?? '');

/** Short display type: "NUMERIC(10,2)" -> "numeric", "appointment_status" stays. */
function shortType(type: string): string {
  return type.replace(/\(.*\)/, '').toLowerCase();
}

function links(dataset: Dataset): Link[] {
  return dataset.tables.flatMap((table) =>
    table.columns.flatMap((column) =>
      column.references
        ? [
            {
              from: { table: table.name, column: column.name },
              to: { table: column.references.table, column: column.references.column },
            },
          ]
        : [],
    ),
  );
}

/** 0 for tables that reference nothing else; otherwise one more than the deepest parent. */
function depths(dataset: Dataset): Map<string, number> {
  const byName = new Map(dataset.tables.map((table) => [table.name, table]));
  const memo = new Map<string, number>();
  const depth = (name: string, seen: Set<string>): number => {
    const cached = memo.get(name);
    if (cached !== undefined) return cached;
    const parents = (byName.get(name)?.columns ?? [])
      .map((column) => column.references?.table)
      .filter((parent): parent is string => !!parent && parent !== name && !seen.has(parent));
    const value = parents.length
      ? 1 + Math.max(...parents.map((parent) => depth(parent, new Set([...seen, name]))))
      : 0;
    memo.set(name, value);
    return value;
  };
  for (const table of dataset.tables) depth(table.name, new Set());

  // Pull each table right, next to the nearest table that references it, so links span one
  // column instead of running behind the boxes in between (e.g. patients sits beside doctors).
  const children = (name: string) =>
    dataset.tables
      .filter((t) => t.name !== name && t.columns.some((c) => c.references?.table === name))
      .map((t) => t.name);
  const byDepthDesc = [...dataset.tables].sort(
    (a, b) => (memo.get(b.name) ?? 0) - (memo.get(a.name) ?? 0),
  );
  for (const table of byDepthDesc) {
    const kids = children(table.name);
    if (kids.length === 0) continue;
    const nearest = Math.min(...kids.map((kid) => memo.get(kid) ?? 0)) - 1;
    memo.set(table.name, Math.max(memo.get(table.name) ?? 0, nearest));
  }
  return memo;
}

function rowY(box: Box, column: string): number {
  const index = box.table.columns.findIndex((c) => c.name === column);
  return box.y + HEADER + index * ROW + ROW / 2;
}

function TableBox({ box }: { box: Box }) {
  const { table, x, y, width } = box;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={boxHeight(table)}
        rx={8}
        className="fill-surface stroke-border-strong"
      />
      <path
        d={`M ${x} ${y + HEADER} V ${y + 8} Q ${x} ${y} ${x + 8} ${y} H ${x + width - 8} Q ${x + width} ${y} ${x + width} ${y + 8} V ${y + HEADER} Z`}
        className="fill-accent-soft"
      />
      <text x={x + 10} y={y + 18} className="fill-accent-text text-[13px] font-semibold">
        {table.name}
      </text>
      {table.columns.map((column, i) => {
        const cy = y + HEADER + i * ROW + ROW / 2 + 4;
        const key = isPrimaryKey(column) ? 'PK' : column.references ? 'FK' : '';
        return (
          <g key={column.name}>
            {key ? (
              <text x={x + 10} y={cy} className="fill-accent-text text-[9px] font-bold">
                {key}
              </text>
            ) : null}
            <text x={x + 30} y={cy} className="fill-fg text-[12px]">
              {column.name}
            </text>
            <text x={x + width - 10} y={cy} textAnchor="end" className="fill-subtle text-[11px]">
              {shortType(column.type)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** The "one" end: a short bar across the line. The "many" end: a small dot. */
function Markers({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={`${id}-one`}
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
      >
        <path d="M 5 1 V 9" className="stroke-subtle" strokeWidth={1.5} />
      </marker>
      <marker
        id={`${id}-many`}
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="8"
        markerHeight="8"
      >
        <circle cx="5" cy="5" r="3" className="fill-subtle" />
      </marker>
    </defs>
  );
}

function wideLayout(dataset: Dataset) {
  const width = 196;
  const gapX = 64;
  const gapY = 28;
  const depth = depths(dataset);
  const columnY: number[] = [];
  const boxes = new Map<string, Box>();
  for (const table of dataset.tables) {
    const d = depth.get(table.name) ?? 0;
    const y = columnY[d] ?? 0;
    boxes.set(table.name, { table, x: 8 + d * (width + gapX), y: y + 8, width });
    columnY[d] = y + boxHeight(table) + gapY;
  }
  const columns = Math.max(...depth.values()) + 1;
  return {
    boxes,
    width: 16 + columns * width + (columns - 1) * gapX + 32,
    height: Math.max(...columnY) - gapY + 16,
  };
}

function tallLayout(dataset: Dataset) {
  const width = 260;
  const gutter = 18 + links(dataset).length * 7;
  const gapY = 20;
  const depth = depths(dataset);
  const ordered = [...dataset.tables].sort(
    (a, b) => (depth.get(a.name) ?? 0) - (depth.get(b.name) ?? 0),
  );
  const boxes = new Map<string, Box>();
  let y = 8;
  for (const table of ordered) {
    boxes.set(table.name, { table, x: gutter, y, width });
    y += boxHeight(table) + gapY;
  }
  return { boxes, width: gutter + width + 36, height: y - gapY + 8, gutter };
}

function linkPath(boxes: Map<string, Box>, link: Link, layout: 'wide' | 'tall', index: number) {
  const from = boxes.get(link.from.table);
  const to = boxes.get(link.to.table);
  if (!from || !to) return '';
  const y1 = rowY(from, link.from.column);
  const y2 = rowY(to, link.to.column);
  if (from === to) {
    // Self-reference (dashed, see below): a wide loop on the right edge.
    const x = from.x + from.width;
    return `M ${x} ${y1} C ${x + 44} ${y1}, ${x + 44} ${y2}, ${x} ${y2}`;
  }
  if (layout === 'wide') {
    const x1 = from.x;
    const x2 = to.x + to.width;
    const bend = Math.max(24, (x1 - x2) / 2);
    return `M ${x1} ${y1} C ${x1 - bend} ${y1}, ${x2 + bend} ${y2}, ${x2} ${y2}`;
  }
  const x = from.x;
  const out = 12 + index * 7;
  return `M ${x} ${y1} C ${x - out} ${y1}, ${x - out} ${y2}, ${x} ${y2}`;
}

function Diagram({
  dataset,
  layout,
  className,
}: {
  dataset: Dataset;
  layout: 'wide' | 'tall';
  className?: string;
}) {
  const id = useId().replaceAll(':', '');
  const { boxes, width, height } = layout === 'wide' ? wideLayout(dataset) : tallLayout(dataset);
  const all = links(dataset);
  const description = all
    .map((l) => `${l.from.table}.${l.from.column} references ${l.to.table}.${l.to.column}`)
    .join('; ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={`${id}-title ${id}-desc`}
      className={className}
      style={{ maxWidth: width }}
    >
      <title
        id={`${id}-title`}
      >{`Relationships between the ${dataset.tables.length} tables`}</title>
      <desc id={`${id}-desc`}>{description}.</desc>
      <Markers id={id} />
      {all.map((link, i) => (
        <path
          key={`${link.from.table}.${link.from.column}`}
          d={linkPath(boxes, link, layout, i)}
          fill="none"
          className="stroke-subtle"
          strokeWidth={1.25}
          strokeDasharray={link.from.table === link.to.table ? '4 3' : undefined}
          markerStart={`url(#${id}-many)`}
          markerEnd={`url(#${id}-one)`}
        />
      ))}
      {[...boxes.values()].map((box) => (
        <TableBox key={box.table.name} box={box} />
      ))}
    </svg>
  );
}

/** Responsive ER diagram: wide layout from the `sm` breakpoint, stacked layout below it. */
export function SchemaDiagram({ dataset }: { dataset: Dataset }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3 sm:p-4">
      <Diagram dataset={dataset} layout="tall" className="mx-auto block h-auto w-full sm:hidden" />
      <div className="hidden scrollbar-thin overflow-x-auto sm:block">
        <Diagram dataset={dataset} layout="wide" className="block h-auto w-full min-w-[640px]" />
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span>
          <b className="font-semibold text-accent-text">PK</b> primary key
        </span>
        <span>
          <b className="font-semibold text-accent-text">FK</b> foreign key
        </span>
        <span>
          A dot marks the referencing (many) side; a bar marks the referenced (one) side. A dashed
          loop is a table that references itself.
        </span>
      </p>
    </div>
  );
}

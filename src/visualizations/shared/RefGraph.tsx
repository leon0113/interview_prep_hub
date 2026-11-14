import { motion } from 'motion/react';
import { useId } from 'react';
import { cn } from '@/lib/cn';
import { TONE, type Tone } from './tones';

export interface RefNode {
  id: string;
  /** Column index (0 = leftmost) and row index within that column. */
  col: number;
  row: number;
  /** First line, e.g. a variable name or a type. */
  title: string;
  /** Second line, e.g. the value. Keep it short — the box is narrow. */
  body?: string;
  tone?: Tone;
  /** Faded: unreachable / about to be garbage-collected. */
  dim?: boolean;
}

export interface RefEdge {
  from: string;
  to: string;
  tone?: Tone;
}

interface RefGraphProps {
  /** Column headings, left to right (2 or 3 columns). */
  columns: readonly string[];
  nodes: readonly RefNode[];
  edges: readonly RefEdge[];
  /** Reserve height for this many rows so the diagram does not jump between steps. */
  minRows?: number;
  label: string;
}

const WIDTH = 340;
const PAD = 6;
const HEADER = 20;
const ROW = 48;
const NODE_H = 38;

/**
 * Boxes-and-arrows diagram: names pointing at objects, objects pointing at other objects.
 * Drawn in a 340-unit-wide viewBox so it is 1:1 on a phone and scales up on desktop.
 */
export function RefGraph({ columns, nodes, edges, minRows = 0, label }: RefGraphProps) {
  const uid = useId();
  const nodeW = columns.length >= 3 ? 96 : 124;
  const colX = (col: number) =>
    columns.length === 1 ? PAD : PAD + (col * (WIDTH - 2 * PAD - nodeW)) / (columns.length - 1);
  const rows = Math.max(minRows, ...nodes.map((node) => node.row + 1));
  const height = HEADER + rows * ROW + 4;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const top = (node: RefNode) => HEADER + node.row * ROW + (ROW - NODE_H) / 2;

  // Spread several arrows leaving / entering the same box so they do not overlap.
  const outgoing = new Map<string, RefEdge[]>();
  const incoming = new Map<string, RefEdge[]>();
  for (const edge of edges) {
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge]);
    incoming.set(edge.to, [...(incoming.get(edge.to) ?? []), edge]);
  }
  const offset = (list: RefEdge[] | undefined, edge: RefEdge) => {
    if (!list || list.length < 2) return 0;
    return (list.indexOf(edge) - (list.length - 1) / 2) * 9;
  };

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label={label}
      className="mx-auto block w-full max-w-[32rem]"
    >
      <defs>
        {(Object.keys(TONE) as Tone[]).map((tone) => (
          <marker
            key={tone}
            id={`${uid}-${tone}`}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0 0 8 4 0 8z" className={TONE[tone].arrow} />
          </marker>
        ))}
      </defs>

      {columns.map((heading, col) => (
        <text
          key={heading}
          x={colX(col) + nodeW / 2}
          y={12}
          textAnchor="middle"
          className="fill-subtle text-[9px] font-semibold tracking-wider uppercase"
        >
          {heading}
        </text>
      ))}

      {edges.map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        const tone = edge.tone ?? 'muted';
        const x1 = colX(from.col) + nodeW;
        const y1 = top(from) + NODE_H / 2 + offset(outgoing.get(edge.from), edge);
        const x2 = colX(to.col) - 2;
        const y2 = top(to) + NODE_H / 2 + offset(incoming.get(edge.to), edge);
        const bend = (x2 - x1) / 2;
        const d = `M${x1} ${y1} C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`;
        return (
          <motion.path
            key={`${edge.from}->${edge.to}`}
            initial={{ opacity: 0, d }}
            animate={{ opacity: 1, d }}
            transition={{ duration: 0.35 }}
            fill="none"
            strokeWidth={1.5}
            markerEnd={`url(#${uid}-${tone})`}
            className={tone === 'muted' ? 'stroke-subtle' : TONE[tone].stroke}
          />
        );
      })}

      {nodes.map((node) => {
        const tone = node.tone ?? 'muted';
        const x = colX(node.col);
        const y = top(node);
        return (
          <motion.g
            key={node.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: node.dim ? 0.35 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <rect
              x={x}
              y={y}
              width={nodeW}
              height={NODE_H}
              rx={7}
              strokeWidth={1.25}
              className={cn(TONE[tone].fill, TONE[tone].stroke)}
            />
            <text
              x={x + 8}
              y={node.body ? y + 15 : y + 23}
              className={cn(
                'font-mono text-[10.5px]',
                node.body ? 'fill-muted' : 'fill-fg font-medium',
              )}
            >
              {node.title}
            </text>
            {node.body ? (
              <text x={x + 8} y={y + 30} className="fill-fg font-mono text-[11px] font-medium">
                {node.body}
              </text>
            ) : null}
          </motion.g>
        );
      })}
    </svg>
  );
}

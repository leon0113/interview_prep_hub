import { useId } from 'react';
import { cn } from '@/lib/cn';
import { describeList, type LLState } from './llState';

export type { LLNode, LLState } from './llState';

const PAD = 14;
const SP = 82; // distance between node left edges
const W = 54; // node width: value cell + next cell
const VAL_W = 36;
const H = 32;
const TOP = 58; // y of the node boxes (pointer labels live above)

/** SVG drawing of a linked list snapshot. Scales to the container width. */
export function LinkedListDiagram({ state, label }: { state: LLState; label?: string }) {
  const markerId = `ll-arrow-${useId().replace(/:/g, '')}`;
  const index = new Map(state.nodes.map((n, i) => [n.id, i]));
  const pointerEntries = Object.entries(state.pointers);
  const hasNullSlot = pointerEntries.some(([, target]) => target === null);
  const nullIndex = state.nodes.length;
  const slots = state.nodes.length + (hasNullSlot ? 1 : 0);
  const width = PAD * 2 + Math.max(slots, 1) * SP - (SP - W);
  const height = TOP + H + 62;
  const left = (i: number) => PAD + i * SP;

  // Pointer names grouped by the slot they point at.
  const labelsAt = new Map<number, string[]>();
  for (const [name, target] of pointerEntries) {
    const at = target === null ? nullIndex : index.get(target);
    if (at === undefined) continue;
    labelsAt.set(at, [...(labelsAt.get(at) ?? []), name]);
  }

  const head = state.pointers.head ?? state.nodes[0]?.id ?? null;
  const summary = `${label ? `${label}: ` : ''}${describeList(state, head)}. Pointers: ${
    pointerEntries
      .map(([n, t]) => `${n} at ${t === null ? 'null' : state.nodes[index.get(t) ?? 0]?.val}`)
      .join(', ') || 'none'
  }`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      style={{ maxHeight: 220 }}
      role="img"
      aria-label={summary}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted" />
        </marker>
      </defs>

      {/* next arrows */}
      {state.nodes.map((node, i) => {
        const target = state.next[node.id];
        if (!target) return null;
        const j = index.get(target);
        if (j === undefined) return null;
        const faded = state.faded?.includes(node.id);
        const common = {
          className: cn('fill-none stroke-muted', faded && 'opacity-30'),
          strokeWidth: 1.6,
          markerEnd: `url(#${markerId})`,
        };
        if (j === i + 1) {
          const y = TOP + 11;
          return (
            <line key={node.id} x1={left(i) + W - 9} y1={y} x2={left(j) - 1} y2={y} {...common} />
          );
        }
        if (j === i - 1) {
          const y = TOP + 23;
          return (
            <line key={node.id} x1={left(i) + 2} y1={y} x2={left(j) + W + 1} y2={y} {...common} />
          );
        }
        // Non-adjacent (a skip over a node, or a cycle back): curve below the boxes.
        const x1 = left(i) + VAL_W + (W - VAL_W) / 2;
        const x2 = left(j) + VAL_W / 2;
        const y = TOP + H;
        const depth = 18 + Math.abs(j - i) * 8;
        return (
          <path
            key={node.id}
            d={`M ${x1} ${y} C ${x1} ${y + depth}, ${x2} ${y + depth}, ${x2} ${y + 2}`}
            {...common}
            strokeDasharray={j < i ? '4 3' : undefined}
          />
        );
      })}

      {/* nodes */}
      {state.nodes.map((node, i) => {
        const x = left(i);
        const highlighted = state.highlight?.includes(node.id);
        const faded = state.faded?.includes(node.id);
        const isNull = state.next[node.id] == null;
        return (
          <g key={node.id} className={cn('transition-opacity duration-300', faded && 'opacity-30')}>
            <rect
              x={x}
              y={TOP}
              width={W}
              height={H}
              rx={6}
              strokeWidth={highlighted ? 2.2 : 1.4}
              className={
                highlighted ? 'fill-accent-soft stroke-accent' : 'fill-surface stroke-border-strong'
              }
            />
            <line
              x1={x + VAL_W}
              y1={TOP}
              x2={x + VAL_W}
              y2={TOP + H}
              className="stroke-border-strong"
              strokeWidth={1}
            />
            <text
              x={x + VAL_W / 2}
              y={TOP + H / 2 + 5}
              textAnchor="middle"
              className={cn(
                'font-mono text-[13px]',
                highlighted ? 'fill-accent-text font-semibold' : 'fill-fg',
              )}
            >
              {node.val}
            </text>
            {isNull ? (
              <text
                x={x + VAL_W + (W - VAL_W) / 2}
                y={TOP + H / 2 + 4}
                textAnchor="middle"
                className="fill-subtle text-[11px]"
              >
                ∅
              </text>
            ) : (
              <circle
                cx={x + VAL_W + (W - VAL_W) / 2}
                cy={TOP + 11}
                r={2.5}
                className="fill-muted"
              />
            )}
          </g>
        );
      })}

      {/* null slot for pointers that point at null */}
      {hasNullSlot ? (
        <text
          x={left(nullIndex) + W / 2}
          y={TOP + H / 2 + 5}
          textAnchor="middle"
          className="fill-subtle font-mono text-[12px]"
        >
          null
        </text>
      ) : null}

      {/* pointer labels above their node */}
      {[...labelsAt.entries()].map(([at, names]) => {
        const cx = left(at) + (at === nullIndex ? W / 2 : VAL_W / 2);
        return (
          <g key={`p${at}`}>
            {names.map((name, k) => (
              <text
                key={name}
                x={cx}
                y={TOP - 16 - (names.length - 1 - k) * 13}
                textAnchor="middle"
                className={cn(
                  'font-mono text-[11px] font-semibold',
                  name === 'head' ? 'fill-muted' : 'fill-accent-text',
                )}
              >
                {name}
              </text>
            ))}
            <line
              x1={cx}
              y1={TOP - 12}
              x2={cx}
              y2={TOP - 3}
              className="stroke-accent"
              strokeWidth={1.4}
              markerEnd={`url(#${markerId})`}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Small "name = value" chips under the diagram (size, return value, ...). */
export function LLVars({ vars }: { vars?: Record<string, string | number> }) {
  if (!vars || Object.keys(vars).length === 0) return null;
  return (
    <dl className="mt-2 flex flex-wrap gap-1.5">
      {Object.entries(vars).map(([name, value]) => (
        <div
          key={name}
          className="flex items-baseline gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs"
        >
          <dt className="font-mono text-muted">{name}</dt>
          <dd className="font-mono font-semibold">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

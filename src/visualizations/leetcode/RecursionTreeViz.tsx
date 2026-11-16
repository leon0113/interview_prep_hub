import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { Panel, PresetChips, TokenList } from '../shared/parts';
import { StepViz } from '../shared/StepViz';
import {
  fibonacciRun,
  layoutTree,
  powerOfTwoRun,
  type CallNode,
  type RecursionRun,
  type RecursionState,
} from './recursionSteps';

const PRESETS = {
  fib: { label: 'fib(4)', run: () => fibonacciRun(4, false) },
  memo: { label: 'fib(4) with memo', run: () => fibonacciRun(4, true) },
  pow16: { label: 'isPowerOfTwo(16)', run: () => powerOfTwoRun(16) },
  pow6: { label: 'isPowerOfTwo(6)', run: () => powerOfTwoRun(6) },
} as const;
type Preset = keyof typeof PRESETS;
const OPTIONS = (Object.keys(PRESETS) as Preset[]).map((value) => ({
  value,
  label: PRESETS[value].label,
}));

/** #509 / #231: the call tree grows call by call, with a call-stack panel beside it. */
export default function RecursionTreeViz() {
  const [preset, setPreset] = useState<Preset>('fib');
  const run = useMemo(() => PRESETS[preset].run(), [preset]);

  return (
    <StepViz
      key={preset}
      title="Recursion tree"
      caption="Each box is one call. Red-dashed calls repeat work that was already done; with a memo they return at once."
      steps={run.steps}
      toolbar={
        <PresetChips label="Example" options={OPTIONS} value={preset} onChange={setPreset} />
      }
    >
      {(state) => (
        <div className="flex flex-col gap-3 @lg:flex-row">
          <div className="min-w-0 flex-1">
            <CallTree run={run} state={state} />
          </div>
          <Panel title="Call stack" hint="top = running" className="@lg:w-48">
            <TokenList items={[...state.stack].reverse()} kind="stack" empty="(empty)" />
          </Panel>
        </div>
      )}
    </StepViz>
  );
}

const NODE_H = 38;
const GAP_X = 8;
const GAP_Y = 30;

function CallTree({ run, state }: { run: RecursionRun; state: RecursionState }) {
  const { x, width } = useMemo(() => layoutTree(run.nodes), [run]);
  // Narrow boxes keep fib's wide tree legible on phones; long labels get wider boxes.
  const NODE_W = Math.max(64, Math.max(...run.nodes.map((n) => n.label.length)) * 7 + 16);
  const depth = Math.max(...run.nodes.map((n) => n.depth)) + 1;
  const svgWidth = width * (NODE_W + GAP_X);
  const svgHeight = depth * (NODE_H + GAP_Y);
  const visible = new Set(state.visible);
  const pos = (node: CallNode) => ({
    cx: x[node.id]! * (NODE_W + GAP_X) + NODE_W / 2 + GAP_X / 2,
    top: node.depth * (NODE_H + GAP_Y),
  });

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="h-auto w-full"
      style={{ maxHeight: 340 }}
      role="img"
      aria-label={`Call tree: ${state.visible.length} of ${run.nodes.length} calls made`}
    >
      {run.nodes.map((node) => {
        if (node.parent === null || !visible.has(node.id)) return null;
        const parent = run.nodes[node.parent]!;
        const a = pos(parent);
        const b = pos(node);
        return (
          <line
            key={`e${node.id}`}
            x1={a.cx}
            y1={a.top + NODE_H}
            x2={b.cx}
            y2={b.top}
            className="stroke-border-strong"
            strokeWidth={1.5}
          />
        );
      })}
      {run.nodes.map((node) => {
        if (!visible.has(node.id)) return null;
        const { cx, top } = pos(node);
        const status = state.status[node.id] ?? 'waiting';
        const repeated = state.repeated.includes(node.id);
        const value = state.value[node.id];
        return (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <rect
              x={cx - NODE_W / 2}
              y={top}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              strokeWidth={status === 'active' ? 2.5 : 1.5}
              strokeDasharray={repeated ? '5 3' : undefined}
              className={cn(
                status === 'active' && 'fill-accent-soft stroke-accent',
                status === 'waiting' && 'fill-surface stroke-border-strong',
                status === 'done' && 'fill-level-foundation/10 stroke-level-foundation',
                status === 'memo' && 'fill-level-intermediate/10 stroke-level-intermediate',
                repeated && status !== 'memo' && 'stroke-level-advanced',
              )}
            />
            <text
              x={cx}
              y={top + (value ? 15 : NODE_H / 2 + 4)}
              textAnchor="middle"
              className="fill-fg font-mono text-[11px]"
            >
              {node.label}
            </text>
            {value ? (
              <text
                x={cx}
                y={top + 30}
                textAnchor="middle"
                className={cn(
                  'font-mono text-[11px] font-semibold',
                  status === 'memo' ? 'fill-level-intermediate' : 'fill-level-foundation',
                )}
              >
                {status === 'memo' ? `memo → ${value}` : `→ ${value}`}
              </text>
            ) : null}
          </motion.g>
        );
      })}
    </svg>
  );
}

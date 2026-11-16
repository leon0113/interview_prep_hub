import { ArrowRight } from 'lucide-react';
import { LayoutGroup, motion } from 'motion/react';
import { useId, useState, type ReactNode } from 'react';
import { InlineText } from '@/components/common/InlineText';
import type { ArrayState } from '@/content/leetcode/schema';
import { cn } from '@/lib/cn';
import { useStepper } from '../shared/useStepper';
import { VizFrame } from '../shared/VizFrame';

type Cell = ArrayState['array'][number];

const SPEEDS = { slow: 3200, normal: 2000, fast: 1000 } as const;
type Speed = keyof typeof SPEEDS;
const SPEED_OPTIONS: { value: Speed; label: string }[] = [
  { value: 'slow', label: '0.5×' },
  { value: 'normal', label: '1×' },
  { value: 'fast', label: '2×' },
];

interface ArrayPointersVizProps {
  title: string;
  caption?: string;
  states: readonly ArrayState[];
  /** Fade cells outside the range between these two pointers (binary search). */
  rangePointers?: [string, string];
  /** Extra toolbar controls (e.g. preset chips), shown before the speed control. */
  toolbar?: ReactNode;
}

/**
 * The generic LeetCode array visualizer: draws a list of `ArrayState` snapshots (from a
 * problem's `steps` trace) with pointer arrows, highlights, an "ignored" divider, side
 * variables and an optional second array. Data-driven: problems need no custom code.
 */
export default function ArrayPointersViz({
  title,
  caption,
  states,
  rangePointers,
  toolbar,
}: ArrayPointersVizProps) {
  const [speed, setSpeed] = useState<Speed>('normal');
  const stepper = useStepper(states.length, SPEEDS[speed]);
  const state = states[Math.min(stepper.index, states.length - 1)];
  if (!state) return null;

  return (
    <VizFrame
      title={title}
      caption={caption}
      toolbar={
        <>
          {toolbar}
          <label className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted">
            Speed
            <select
              value={speed}
              onChange={(e) => setSpeed(e.target.value as Speed)}
              className="h-9 rounded-lg border border-border bg-surface px-2 font-mono text-xs text-fg lg:h-8"
            >
              {SPEED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </>
      }
      step={{ text: state.caption, rich: true }}
      stepper={stepper}
    >
      <ArrayStateView state={state} rangePointers={rangePointers} name={title} />
    </VizFrame>
  );
}

/** One snapshot: main array, optional second array, move badge and variables. */
export function ArrayStateView({
  state,
  rangePointers,
  name,
}: {
  state: ArrayState;
  rangePointers?: [string, string];
  /** Names the scrollable regions, so several visualizers on one page stay distinguishable. */
  name?: string;
}) {
  const groupId = useId();
  const { move } = state;
  const faded = fadedOutside(state, rangePointers);

  return (
    <LayoutGroup id={groupId}>
      <div className="flex flex-col gap-4">
        <ArrayRow
          name={name}
          label={state.label}
          array={state.array}
          pointers={state.pointers}
          highlight={state.highlight}
          dividerAt={state.dividerAt}
          faded={faded}
          source={move?.from.array === 'primary' ? move.from.index : undefined}
        />
        {state.secondary ? (
          <ArrayRow
            name={name}
            label={state.secondary.label}
            array={state.secondary.array}
            pointers={state.secondary.pointers}
            highlight={state.secondary.highlight}
            source={move?.from.array === 'secondary' ? move.from.index : undefined}
          />
        ) : null}
        {move ? <MoveBadge state={state} /> : null}
        {state.vars && Object.keys(state.vars).length > 0 ? <VarsPanel vars={state.vars} /> : null}
      </div>
    </LayoutGroup>
  );
}

function fadedOutside(state: ArrayState, range?: [string, string]): Set<number> {
  const faded = new Set<number>();
  if (!range) return faded;
  const lo = state.pointers[range[0]];
  const hi = state.pointers[range[1]];
  if (lo === undefined || hi === undefined) return faded;
  state.array.forEach((_, i) => {
    if (i < lo || i > hi) faded.add(i);
  });
  return faded;
}

function display(value: Cell): string {
  return value === null ? '·' : String(value);
}

function ArrayRow({
  name,
  label,
  array,
  pointers,
  highlight = [],
  dividerAt,
  faded,
  source,
}: {
  name?: string;
  label?: string;
  array: readonly Cell[];
  pointers: Record<string, number>;
  highlight?: readonly number[];
  dividerAt?: number;
  faded?: Set<number>;
  /** Index the current "move" reads from. */
  source?: number;
}) {
  // Pointers may sit one step outside the array (-1 or length), e.g. p2 = -1 at the end.
  const positions = Object.values(pointers);
  const hasBefore = positions.some((p) => p < 0);
  const hasAfter = positions.some((p) => p >= array.length);
  const slots = [
    ...(hasBefore ? [-1] : []),
    ...array.map((_, i) => i),
    ...(hasAfter ? [array.length] : []),
  ];
  const pointerSummary = Object.entries(pointers)
    .map(([name, at]) => `${name} at ${at}`)
    .join(', ');

  return (
    <div className="min-w-0">
      {label ? <p className="mb-1.5 font-mono text-xs font-semibold text-muted">{label}</p> : null}
      {/* Focusable so keyboard users can scroll a wide array on small screens. */}
      <div
        className="scrollbar-thin overflow-x-auto pb-1"
        tabIndex={0}
        role="region"
        aria-label={`${name ? `${name}: ` : ''}${label ?? 'array'} cells`}
      >
        <div className="inline-flex min-w-full items-start gap-1">
          {slots.map((i) => {
            const inArray = i >= 0 && i < array.length;
            const names = Object.entries(pointers)
              .filter(([, at]) =>
                i < 0 ? at < 0 : i >= array.length ? at >= array.length : at === i,
              )
              .map(([name]) => name);
            const ignored = dividerAt !== undefined && i >= dividerAt;
            return (
              <div key={i} className="flex items-start">
                {dividerAt !== undefined && i === dividerAt && inArray ? (
                  <span
                    aria-hidden
                    className="mx-1 mt-4 h-10 w-0.5 shrink-0 rounded-full bg-level-intermediate"
                  />
                ) : null}
                <div className="flex w-10 shrink-0 flex-col items-center sm:w-11">
                  <span className="h-4 font-mono text-[0.625rem] leading-4 text-subtle tabular-nums">
                    {inArray ? i : ''}
                  </span>
                  {inArray ? (
                    <span
                      className={cn(
                        'flex h-10 w-full items-center justify-center rounded-md border font-mono text-sm transition-colors duration-300',
                        highlight.includes(i)
                          ? 'border-accent bg-accent-soft font-semibold text-accent-text'
                          : 'border-border-strong bg-surface text-fg',
                        source === i &&
                          'border-level-intermediate ring-2 ring-level-intermediate/40',
                        (ignored || faded?.has(i)) && 'border-dashed opacity-45',
                      )}
                    >
                      {display(array[i] ?? null)}
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-10 w-full items-center justify-center font-mono text-[0.625rem] text-subtle"
                    >
                      {i < 0 ? '−1' : 'end'}
                    </span>
                  )}
                  <div aria-hidden className="mt-1 flex min-h-5 flex-col items-center gap-0.5">
                    {names.map((name) => (
                      <motion.span
                        key={name}
                        layoutId={`ptr-${label ?? 'main'}-${name}`}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="flex flex-col items-center font-mono text-[0.6875rem] leading-none font-semibold text-accent-text"
                      >
                        <span aria-hidden>▲</span>
                        {name}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="sr-only">
        {label ? `${label}: ` : ''}[{array.map(display).join(', ')}]
        {pointerSummary ? `. Pointers: ${pointerSummary}` : ''}
        {highlight.length ? `. Highlighted index ${highlight.join(', ')}` : ''}
        {dividerAt !== undefined ? `. Everything from index ${dividerAt} is ignored` : ''}
      </p>
    </div>
  );
}

function MoveBadge({ state }: { state: ArrayState }) {
  const { move } = state;
  if (!move) return null;
  const nameOf = (which: 'primary' | 'secondary') =>
    which === 'primary' ? (state.label ?? 'array') : (state.secondary?.label ?? 'second');
  const arrayOf = (which: 'primary' | 'secondary') =>
    which === 'primary' ? state.array : (state.secondary?.array ?? []);
  // The value that moved is the one now written at the target.
  const value = arrayOf(move.to.array)[move.to.index];
  return (
    <p className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs">
      <span className="text-level-intermediate">
        {nameOf(move.from.array)}[{move.from.index}]
      </span>
      <ArrowRight className="size-4 text-muted" aria-label="moves to" />
      <span className="text-accent-text">
        {nameOf(move.to.array)}[{move.to.index}]
      </span>
      <span className="text-muted">= {display(value ?? null)}</span>
    </p>
  );
}

function VarsPanel({ vars }: { vars: Record<string, string | number> }) {
  return (
    <dl className="flex flex-wrap gap-1.5">
      {Object.entries(vars).map(([name, value]) => (
        <div
          key={name}
          className="flex items-baseline gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs"
        >
          <dt className="font-mono text-muted">{name}</dt>
          <dd className="font-mono font-semibold">
            <InlineText>{String(value)}</InlineText>
          </dd>
        </div>
      ))}
    </dl>
  );
}

import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { StepViz, type VizStep } from '../shared/StepViz';

type Region = 'unknown' | 'string' | 'number' | 'union' | 'A' | 'B' | 'AB' | 'never' | 'any';

interface State {
  /** Type expression shown above the diagram. */
  expr: string;
  /** Regions to highlight. */
  hot: Region[];
  /** Which diagram to draw. */
  view: 'primitives' | 'objects' | 'never' | 'any';
  /** Assignability check shown under the diagram. */
  check?: { code: string; ok: boolean };
}

const steps: VizStep<State>[] = [
  {
    text: 'Think of a type as a SET of values. unknown is the set of every possible value — the universe.',
    bn: 'Type মানে কিছু value-এর একটা set। unknown হলো সবচেয়ে বড় set — সব value এর ভেতরে।',
    state: {
      view: 'primitives',
      expr: 'unknown',
      hot: ['unknown'],
      check: { code: 'const u: unknown = 42;  // anything fits', ok: true },
    },
  },
  {
    text: 'string and number are smaller sets inside the universe. A value can be assigned to a type when it is inside that set.',
    state: {
      view: 'primitives',
      expr: 'string    number',
      hot: ['string', 'number'],
      check: { code: 'const s: string = 42;', ok: false },
    },
  },
  {
    text: 'A union string | number is the UNION of the two sets: a value is allowed if it belongs to either one.',
    bn: 'Union (|) মানে দুটো set মিলিয়ে বড় set — যেকোনো একটাতে থাকলেই চলবে।',
    state: {
      view: 'primitives',
      expr: 'string | number',
      hot: ['string', 'number', 'union'],
      check: { code: 'const v: string | number = 42;', ok: true },
    },
  },
  {
    text: 'Object types are sets too. A = { name: string } holds every object with a name; B = { age: number } every object with an age.',
    state: { view: 'objects', expr: 'A    B', hot: ['A', 'B'] },
  },
  {
    text: 'A & B is the INTERSECTION: objects that are in both sets — they have name AND age. More properties means a smaller set.',
    bn: 'Intersection (&) মানে দুটো set-এর common অংশ। Object-এ property বাড়লে set ছোট হয় — কারণ শর্ত বেশি।',
    state: {
      view: 'objects',
      expr: 'A & B',
      hot: ['AB'],
      check: { code: 'const p: A & B = { name: "Rafi", age: 30 };', ok: true },
    },
  },
  {
    text: 'Intersect two sets that do not overlap — string & number — and you get the EMPTY set. That is never: no value can ever have it.',
    bn: 'never হলো ফাঁকা set — এমন কোনো value নেই যেটা never type-এ বসানো যায়।',
    state: {
      view: 'never',
      expr: 'string & number  =  never',
      hot: ['never'],
      check: { code: 'const n: never = 42;', ok: false },
    },
  },
  {
    text: 'never fits inside every set (the empty set is a subset of all sets), so it is assignable to everything. That is why an exhaustive switch can assign the leftover value to never.',
    state: {
      view: 'never',
      expr: 'never  ⊂  every type',
      hot: ['never', 'string', 'number'],
    },
  },
  {
    text: 'any is not a set at all — it switches the checker off. It accepts everything AND can be assigned to everything, so mistakes slip through.',
    bn: 'any কোনো set না — এটা type checking বন্ধ করার switch। তাই unknown নিরাপদ, any বিপজ্জনক।',
    state: {
      view: 'any',
      expr: 'any',
      hot: ['any'],
      check: { code: 'const a: any = "x";  const n: number = a;  // compiles!', ok: true },
    },
  },
];

const fillFor = (hot: boolean) =>
  hot ? 'fill-accent-soft stroke-accent' : 'fill-surface stroke-border-strong';

function Primitives({ hot }: { hot: Region[] }) {
  const union = hot.includes('union');
  return (
    <>
      {union ? (
        <motion.rect
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          x={46}
          y={58}
          width={248}
          height={92}
          rx={46}
          strokeWidth={2}
          strokeDasharray="5 4"
          className="fill-level-foundation/10 stroke-level-foundation"
        />
      ) : null}
      <circle
        cx={110}
        cy={104}
        r={40}
        strokeWidth={1.5}
        className={fillFor(hot.includes('string'))}
      />
      <text x={110} y={108} textAnchor="middle" className="fill-fg font-mono text-[12px]">
        string
      </text>
      <circle
        cx={230}
        cy={104}
        r={40}
        strokeWidth={1.5}
        className={fillFor(hot.includes('number'))}
      />
      <text x={230} y={108} textAnchor="middle" className="fill-fg font-mono text-[12px]">
        number
      </text>
      <text x={60} y={170} className="fill-subtle font-mono text-[10px]">
        boolean, objects, null, …
      </text>
    </>
  );
}

function Objects({ hot }: { hot: Region[] }) {
  const both = hot.includes('AB');
  return (
    <>
      <circle cx={135} cy={104} r={58} strokeWidth={1.5} className={fillFor(hot.includes('A'))} />
      <circle cx={205} cy={104} r={58} strokeWidth={1.5} className={fillFor(hot.includes('B'))} />
      {both ? (
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          d="M170 56.6 A58 58 0 0 1 170 151.4 A58 58 0 0 1 170 56.6 Z"
          className="fill-level-foundation/30 stroke-level-foundation"
          strokeWidth={2}
        />
      ) : null}
      <text x={104} y={100} textAnchor="middle" className="fill-fg font-mono text-[11px]">
        A
      </text>
      <text x={104} y={114} textAnchor="middle" className="fill-muted font-mono text-[9px]">
        {'{name}'}
      </text>
      <text x={236} y={100} textAnchor="middle" className="fill-fg font-mono text-[11px]">
        B
      </text>
      <text x={236} y={114} textAnchor="middle" className="fill-muted font-mono text-[9px]">
        {'{age}'}
      </text>
      <text
        x={170}
        y={108}
        textAnchor="middle"
        className="fill-fg font-mono text-[10px] font-semibold"
      >
        A & B
      </text>
    </>
  );
}

function NeverView({ hot }: { hot: Region[] }) {
  return (
    <>
      <circle
        cx={110}
        cy={104}
        r={40}
        strokeWidth={1.5}
        className={fillFor(hot.includes('string'))}
      />
      <text x={110} y={108} textAnchor="middle" className="fill-fg font-mono text-[12px]">
        string
      </text>
      <circle
        cx={230}
        cy={104}
        r={40}
        strokeWidth={1.5}
        className={fillFor(hot.includes('number'))}
      />
      <text x={230} y={108} textAnchor="middle" className="fill-fg font-mono text-[12px]">
        number
      </text>
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{ transformOrigin: '170px 104px' }}
        cx={170}
        cy={104}
        r={9}
        strokeWidth={2}
        strokeDasharray="3 2"
        className="fill-bg stroke-level-advanced"
      />
      <text
        x={170}
        y={136}
        textAnchor="middle"
        className="fill-level-advanced font-mono text-[11px] font-semibold"
      >
        never = ∅
      </text>
    </>
  );
}

function AnyView() {
  return (
    <>
      <text
        x={170}
        y={98}
        textAnchor="middle"
        className="fill-level-intermediate font-mono text-[28px] font-semibold"
      >
        any
      </text>
      <text x={170} y={124} textAnchor="middle" className="fill-muted text-[11px]">
        type checking turned off
      </text>
    </>
  );
}

export default function TypeSetsViz() {
  return (
    <StepViz
      title="Types as sets"
      caption="unknown is the universe, never is the empty set; unions and intersections are set operations."
      steps={steps}
    >
      {(state) => (
        <div className="grid gap-2.5 *:min-w-0">
          <p className="text-center font-mono text-sm font-semibold whitespace-pre-wrap text-accent-text">
            {state.expr}
          </p>
          <svg
            viewBox="0 0 340 200"
            role="img"
            aria-label={`Set diagram for ${state.expr}`}
            className="mx-auto block w-full max-w-[26rem]"
          >
            <rect
              x={8}
              y={18}
              width={324}
              height={174}
              rx={14}
              strokeWidth={1.5}
              className={cn(
                state.view === 'any'
                  ? 'fill-level-intermediate/10 stroke-level-intermediate'
                  : state.hot.includes('unknown')
                    ? 'fill-accent-soft stroke-accent'
                    : 'fill-surface-2 stroke-border-strong',
              )}
              strokeDasharray={state.view === 'any' ? '6 4' : undefined}
            />
            <text x={20} y={36} className="fill-subtle font-mono text-[10px] font-semibold">
              {state.view === 'any' ? '' : 'unknown (every value)'}
            </text>
            {state.view === 'primitives' ? <Primitives hot={state.hot} /> : null}
            {state.view === 'objects' ? <Objects hot={state.hot} /> : null}
            {state.view === 'never' ? <NeverView hot={state.hot} /> : null}
            {state.view === 'any' ? <AnyView /> : null}
          </svg>
          <p
            className={cn(
              'min-h-6 rounded-md px-2.5 py-1 font-mono text-xs break-words',
              state.check
                ? state.check.ok
                  ? 'bg-level-foundation/10 text-level-foundation'
                  : 'bg-level-advanced/10 text-level-advanced'
                : '',
            )}
          >
            {state.check ? `${state.check.ok ? '✓' : '✗'} ${state.check.code}` : ''}
          </p>
        </div>
      )}
    </StepViz>
  );
}

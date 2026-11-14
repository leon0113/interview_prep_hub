import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { CodePane, ConsolePanel, Panel, TokenList } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

const CODE = `class A:
    def hi(self): print("A")

class B(A):
    def hi(self): print("B"); super().hi()

class C(A):
    def hi(self): print("C"); super().hi()

class D(B, C):
    def hi(self): print("D"); super().hi()

D().hi()`;

type Cls = 'A' | 'B' | 'C' | 'D';

interface State {
  line: number | null;
  /** Linearization built so far. */
  mro: string[];
  /** Class whose method is running. */
  active?: Cls;
  output: string[];
}

const POS: Record<Cls, { x: number; y: number }> = {
  A: { x: 170, y: 34 },
  B: { x: 80, y: 104 },
  C: { x: 260, y: 104 },
  D: { x: 170, y: 174 },
};
const EDGES: [Cls, Cls][] = [
  ['B', 'A'],
  ['C', 'A'],
  ['D', 'B'],
  ['D', 'C'],
];
const FULL = ['D', 'B', 'C', 'A', 'object'];

const steps: VizStep<State>[] = [
  {
    text: 'The diamond: D inherits from B and C, and both inherit from A. Which hi() runs, and in what order?',
    state: { line: 10, mro: [], output: [] },
  },
  {
    text: 'Python answers with the MRO (Method Resolution Order), computed by C3 linearization. It always starts with the class itself.',
    state: { line: 10, mro: ['D'], output: [] },
  },
  {
    text: 'Next come the bases in the order they were written: class D(B, C) puts B before C.',
    state: { line: 10, mro: ['D', 'B'], output: [] },
  },
  {
    text: 'A cannot come yet — C is also a subclass of A, and a class must appear before its parents. So C is next.',
    bn: 'C3-এর মূল নিয়ম: কোনো class তার parent-এর আগে আসবে। C-ও A-র child, তাই A-কে অপেক্ষা করতে হয়।',
    state: { line: 10, mro: ['D', 'B', 'C'], output: [] },
  },
  {
    text: 'Now A, then object. Full MRO: D → B → C → A → object. Check it with D.__mro__ or D.mro().',
    bn: 'A একবারই আসে — এভাবেই diamond problem-এর সমাধান হয়।',
    state: { line: 10, mro: FULL, output: [] },
  },
  {
    text: 'D().hi() finds hi on D first. It prints "D" and calls super().hi().',
    state: { line: 11, mro: FULL, active: 'D', output: ['D'] },
  },
  {
    text: "super() means 'next class in the MRO', so from D it goes to B.",
    state: { line: 5, mro: FULL, active: 'B', output: ['D', 'B'] },
  },
  {
    text: "Inside B, super() is NOT B's parent A. It is the class after B in D's MRO — that is C.",
    bn: 'super() মানে "আমার parent" না — এর মানে "MRO-তে আমার পরের class"। এটাই সবচেয়ে বেশি ভুল হয়।',
    state: { line: 8, mro: FULL, active: 'C', output: ['D', 'B', 'C'] },
  },
  {
    text: 'From C the next class is A. Every class ran exactly once, in MRO order.',
    state: { line: 2, mro: FULL, active: 'A', output: ['D', 'B', 'C', 'A'] },
  },
];

function Diagram({ state }: { state: State }) {
  return (
    <svg
      viewBox="0 0 340 208"
      role="img"
      aria-label="Class diagram: D inherits from B and C, which both inherit from A"
      className="mx-auto block w-full max-w-[26rem]"
    >
      {EDGES.map(([child, parent]) => (
        <line
          key={`${child}${parent}`}
          x1={POS[child].x}
          y1={POS[child].y - 17}
          x2={POS[parent].x}
          y2={POS[parent].y + 17}
          strokeWidth={1.5}
          className="stroke-border-strong"
        />
      ))}
      {(Object.keys(POS) as Cls[]).map((cls) => {
        const order = state.mro.indexOf(cls);
        const active = state.active === cls;
        return (
          <g key={cls}>
            <motion.rect
              x={POS[cls].x - 34}
              y={POS[cls].y - 17}
              width={68}
              height={34}
              rx={8}
              strokeWidth={active ? 2 : 1.25}
              animate={{ scale: active ? 1.06 : 1 }}
              style={{ transformOrigin: `${POS[cls].x}px ${POS[cls].y}px` }}
              className={cn(
                active
                  ? 'fill-accent-soft stroke-accent'
                  : order >= 0
                    ? 'fill-level-foundation/10 stroke-level-foundation'
                    : 'fill-surface stroke-border-strong',
              )}
            />
            <text
              x={POS[cls].x}
              y={POS[cls].y + 4.5}
              textAnchor="middle"
              className="fill-fg font-mono text-[13px] font-semibold"
            >
              {cls}
            </text>
            {order >= 0 ? (
              <text
                x={POS[cls].x + 42}
                y={POS[cls].y - 8}
                className="fill-level-foundation text-[10px] font-semibold"
              >
                #{order + 1}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export default function MroDiamondViz() {
  return (
    <StepViz
      title="MRO and the diamond problem"
      caption="How Python linearizes a diamond hierarchy, and how super() follows that order."
      steps={steps}
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @xl:grid-cols-[minmax(0,19rem)_1fr]">
          <CodePane code={CODE} active={state.line} className="self-start" />
          <div className="grid content-start gap-2.5 *:min-w-0">
            <Diagram state={state} />
            <Panel title="MRO of D">
              <TokenList items={state.mro} tone="green" empty="not computed yet" />
            </Panel>
            <ConsolePanel lines={state.output} title="Output" />
          </div>
        </div>
      )}
    </StepViz>
  );
}

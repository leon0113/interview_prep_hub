import { useState } from 'react';
import { CodePane, PresetChips } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

interface State {
  line: number;
  /** Variable being tracked and its type at this line. */
  variable: string;
  type: string;
  /** Members of the original union, and which are still possible here. */
  remaining: string[];
}

interface Preset {
  code: string;
  all: string[];
  steps: VizStep<State>[];
}

const PRESETS = {
  typeofGuard: {
    code: `function format(value: string | number | null) {
  if (value === null) {
    return "—";
  }
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}`,
    all: ['string', 'number', 'null'],
    steps: [
      {
        text: 'At the start, value can be any member of the union. You may only use what ALL members support.',
        bn: 'শুরুতে value union-এর যেকোনো কিছু হতে পারে, তাই শুধু সবার common operation গুলোই করা যায়।',
        state: {
          line: 1,
          variable: 'value',
          type: 'string | number | null',
          remaining: ['string', 'number', 'null'],
        },
      },
      {
        text: 'Inside if (value === null) TypeScript knows value is exactly null.',
        state: { line: 3, variable: 'value', type: 'null', remaining: ['null'] },
      },
      {
        text: 'That branch returns. After it, null is impossible, so it is removed from the type. This is control-flow analysis.',
        bn: 'TypeScript code-এর flow পড়ে: যে branch return করে ফেলেছে, তার পরে সেই type আর থাকতে পারে না।',
        state: {
          line: 5,
          variable: 'value',
          type: 'string | number',
          remaining: ['string', 'number'],
        },
      },
      {
        text: 'typeof value === "string" narrows to string, so .toUpperCase() is allowed here.',
        state: { line: 6, variable: 'value', type: 'string', remaining: ['string'] },
      },
      {
        text: 'Only number is left after the string branch returns, so .toFixed() type-checks without any cast.',
        state: { line: 8, variable: 'value', type: 'number', remaining: ['number'] },
      },
    ],
  },
  discriminated: {
    code: `type Shape =
  | { kind: "circle"; r: number }
  | { kind: "square"; side: number };

function area(s: Shape) {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2;
    case "square": return s.side ** 2;
    default: const x: never = s; return x;
  }
}`,
    all: ['circle', 'square'],
    steps: [
      {
        text: 'Every member of Shape has a literal kind property — the discriminant. Before the switch, s could be either.',
        state: { line: 5, variable: 's', type: 'Shape', remaining: ['circle', 'square'] },
      },
      {
        text: 'Checking s.kind narrows the WHOLE object. In case "circle", s is { kind: "circle"; r: number }, so s.r is available.',
        bn: 'একটা literal property (kind) মিলিয়ে দেখলেই পুরো object-এর type ঠিক হয়ে যায় — এটাই discriminated union।',
        state: {
          line: 7,
          variable: 's',
          type: '{ kind: "circle"; r: number }',
          remaining: ['circle'],
        },
      },
      {
        text: 'In case "square", s is the square member, so s.side is available and s.r is not.',
        state: {
          line: 8,
          variable: 's',
          type: '{ kind: "square"; side: number }',
          remaining: ['square'],
        },
      },
      {
        text: 'In default every member has been handled, so s is never. Add a "triangle" to Shape and this line stops compiling — a free exhaustiveness check.',
        bn: 'নতুন member যোগ করে case লিখতে ভুলে গেলে default-এ s আর never থাকে না, তাই compile error — এভাবেই exhaustive check কাজ করে।',
        state: { line: 9, variable: 's', type: 'never', remaining: [] },
      },
    ],
  },
  inGuard: {
    code: `type Fish = { swim(): void };
type Bird = { fly(): void };

function move(pet: Fish | Bird) {
  if ("swim" in pet) {
    pet.swim();
  } else {
    pet.fly();
  }
}`,
    all: ['Fish', 'Bird'],
    steps: [
      {
        text: 'pet is Fish | Bird. Calling pet.swim() directly is an error — a Bird has no swim.',
        state: { line: 4, variable: 'pet', type: 'Fish | Bird', remaining: ['Fish', 'Bird'] },
      },
      {
        text: '"swim" in pet narrows to the members that have a swim property: Fish.',
        bn: 'in operator দিয়ে property আছে কি না দেখে TypeScript বুঝে নেয় কোন type।',
        state: { line: 6, variable: 'pet', type: 'Fish', remaining: ['Fish'] },
      },
      {
        text: 'In the else branch the opposite holds: pet is Bird.',
        state: { line: 8, variable: 'pet', type: 'Bird', remaining: ['Bird'] },
      },
    ],
  },
} satisfies Record<string, Preset>;

type PresetId = keyof typeof PRESETS;

const OPTIONS: { value: PresetId; label: string }[] = [
  { value: 'typeofGuard', label: 'typeof / null' },
  { value: 'discriminated', label: 'discriminated union' },
  { value: 'inGuard', label: '"prop" in obj' },
];

export default function NarrowingFlowViz() {
  const [presetId, setPresetId] = useState<PresetId>('typeofGuard');
  const preset: Preset = PRESETS[presetId];

  return (
    <StepViz
      key={presetId}
      title="Control-flow narrowing"
      caption="Step through the code and watch the variable's type shrink as each check rules members out."
      steps={preset.steps}
      toolbar={
        <PresetChips label="Example" options={OPTIONS} value={presetId} onChange={setPresetId} />
      }
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,19rem)_1fr]">
          <CodePane code={preset.code} active={state.line} className="self-start" />
          <div className="grid content-start gap-2.5 *:min-w-0">
            <div className="rounded-lg border border-accent bg-accent-soft p-2.5">
              <p className="text-[0.625rem] font-semibold tracking-wider text-subtle uppercase">
                Type of {state.variable} on line {state.line}
              </p>
              <p className="mt-1 font-mono text-sm font-semibold break-words text-accent-text">
                {state.type}
              </p>
            </div>
            <ul className="grid gap-1.5 *:min-w-0" aria-label="Union members">
              {preset.all.map((member) => {
                const possible = state.remaining.includes(member);
                return (
                  <li
                    key={member}
                    className={
                      possible
                        ? 'flex items-center justify-between rounded-md border border-level-foundation bg-level-foundation/10 px-2.5 py-1.5 font-mono text-xs'
                        : 'flex items-center justify-between rounded-md border border-dashed border-border-strong px-2.5 py-1.5 font-mono text-xs text-subtle line-through'
                    }
                  >
                    {member}
                    <span className="font-sans text-[0.6875rem] no-underline">
                      {possible ? 'possible' : 'ruled out'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </StepViz>
  );
}

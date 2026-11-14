import { cn } from '@/lib/cn';
import { CodePane } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

const CODE = `function makeCounter() {
  let count = 0;
  return function increment() {
    count++;
    return count;
  };
}

const counter = makeCounter();
counter();
counter();
const other = makeCounter();
other();`;

type EnvStatus = 'running' | 'retained';

interface Env {
  id: string;
  label: string;
  count: number;
  status: EnvStatus;
  /** Highlight: a lookup just landed here. */
  hit?: boolean;
}

interface State {
  line: number;
  globals: string[];
  envs: Env[];
  /** Short-lived call of increment(), with the env it closes over. */
  call?: { label: string; closesOver: string; returns: number };
}

const steps: VizStep<State>[] = [
  {
    text: 'The global environment knows makeCounter. Nothing has been called yet.',
    state: { line: 1, globals: ['makeCounter: ƒ'], envs: [] },
  },
  {
    text: 'Calling makeCounter() creates a new environment for that call, holding count = 0.',
    state: {
      line: 2,
      globals: ['makeCounter: ƒ'],
      envs: [{ id: 'E1', label: 'makeCounter() call #1', count: 0, status: 'running' }],
    },
  },
  {
    text: 'makeCounter returns increment and finishes. Normally its environment would be discarded — but increment still references it, so it stays alive. That pairing is a closure.',
    bn: 'Function শেষ হয়ে গেলেও তার variable গুলো বেঁচে থাকে, কারণ ভেতরের function সেগুলোকে ধরে রেখেছে — এটাই closure।',
    state: {
      line: 9,
      globals: ['makeCounter: ƒ', 'counter: ƒ increment → E1'],
      envs: [{ id: 'E1', label: 'makeCounter() call #1', count: 0, status: 'retained' }],
    },
  },
  {
    text: 'counter() runs increment. count is not a local variable, so the lookup walks up the scope chain to the retained environment and updates it there.',
    state: {
      line: 10,
      globals: ['makeCounter: ƒ', 'counter: ƒ increment → E1'],
      envs: [{ id: 'E1', label: 'makeCounter() call #1', count: 1, status: 'retained', hit: true }],
      call: { label: 'counter()', closesOver: 'E1', returns: 1 },
    },
  },
  {
    text: 'Calling again finds the SAME environment: count goes from 1 to 2. The state persists between calls and is private — nothing else can reach count.',
    bn: 'প্রতিবার একই environment ব্যবহার হয়, তাই value মনে থাকে — আর বাইরে থেকে count ছোঁয়ার কোনো উপায় নেই।',
    state: {
      line: 11,
      globals: ['makeCounter: ƒ', 'counter: ƒ increment → E1'],
      envs: [{ id: 'E1', label: 'makeCounter() call #1', count: 2, status: 'retained', hit: true }],
      call: { label: 'counter()', closesOver: 'E1', returns: 2 },
    },
  },
  {
    text: 'A second makeCounter() call creates a completely separate environment with its own count.',
    state: {
      line: 12,
      globals: ['makeCounter: ƒ', 'counter: ƒ increment → E1', 'other: ƒ increment → E2'],
      envs: [
        { id: 'E1', label: 'makeCounter() call #1', count: 2, status: 'retained' },
        { id: 'E2', label: 'makeCounter() call #2', count: 0, status: 'retained' },
      ],
    },
  },
  {
    text: 'other() increments only its own environment. Each closure remembers the environment it was created in.',
    state: {
      line: 13,
      globals: ['makeCounter: ƒ', 'counter: ƒ increment → E1', 'other: ƒ increment → E2'],
      envs: [
        { id: 'E1', label: 'makeCounter() call #1', count: 2, status: 'retained' },
        { id: 'E2', label: 'makeCounter() call #2', count: 1, status: 'retained', hit: true },
      ],
      call: { label: 'other()', closesOver: 'E2', returns: 1 },
    },
  },
];

export default function ClosureScopeChainViz() {
  return (
    <StepViz
      title="Closures and the scope chain"
      caption="Environments are boxes of variables. A closure keeps its birth environment alive after the outer function returns."
      steps={steps}
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,16rem)_1fr]">
          <CodePane code={CODE} active={state.line} className="self-start" />
          <div className="rounded-lg border border-border bg-surface p-2.5">
            <p className="text-[0.625rem] font-semibold tracking-wider text-subtle uppercase">
              Global environment
            </p>
            <ul className="mt-1.5 grid gap-1 font-mono text-xs">
              {state.globals.map((entry) => (
                <li key={entry} className="break-words">
                  {entry}
                </li>
              ))}
            </ul>

            <div className="mt-2.5 grid gap-2">
              {state.envs.map((env) => (
                <div
                  key={env.id}
                  className={cn(
                    'rounded-lg border p-2.5 transition-colors',
                    env.hit
                      ? 'border-level-foundation bg-level-foundation/10'
                      : env.status === 'running'
                        ? 'border-accent bg-accent-soft'
                        : 'border-dashed border-border-strong bg-bg',
                  )}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="text-xs font-semibold">
                      {env.id} <span className="font-normal text-muted">· {env.label}</span>
                    </span>
                    <span className="text-[0.6875rem] text-subtle">
                      {env.status === 'running' ? 'running' : 'kept alive by a closure'}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs">
                    count = <span className="font-semibold">{env.count}</span>
                  </p>
                  {state.call?.closesOver === env.id ? (
                    <div className="mt-2 rounded-md border border-accent bg-accent-soft p-2 font-mono text-xs">
                      <span className="font-semibold text-accent-text">{state.call.label}</span>{' '}
                      <span className="font-sans text-[0.6875rem] text-muted">
                        looks up count ↑ here, returns
                      </span>{' '}
                      <span className="font-semibold">{state.call.returns}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </StepViz>
  );
}

import { cn } from '@/lib/cn';
import { CodePane, ConsolePanel } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

const CODE = `console.log(a);
greet();
sayBye();
var a = 1;
let b = 2;
var sayBye = function () {};
function greet() { console.log("hi"); }
console.log(a, b);`;

type Kind = 'value' | 'undefined' | 'tdz' | 'function';

interface Row {
  name: string;
  declared: string;
  value: string;
  kind: Kind;
  /** Highlight the row for this step. */
  hot?: boolean;
}

interface State {
  phase: 'Creation phase' | 'Execution phase';
  line: number | null;
  rows: Row[];
  output: string[];
}

const created = (hot?: string): Row[] => [
  { name: 'a', declared: 'var', value: 'undefined', kind: 'undefined', hot: hot === 'a' },
  { name: 'b', declared: 'let', value: '<uninitialized>', kind: 'tdz', hot: hot === 'b' },
  { name: 'sayBye', declared: 'var', value: 'undefined', kind: 'undefined', hot: hot === 'sayBye' },
  {
    name: 'greet',
    declared: 'function',
    value: 'ƒ greet()',
    kind: 'function',
    hot: hot === 'greet',
  },
];

const withValues = (values: Record<string, [string, Kind]>, hot?: string): Row[] =>
  created(hot).map((row) => {
    const next = values[row.name];
    return next ? { ...row, value: next[0], kind: next[1] } : row;
  });

const steps: VizStep<State>[] = [
  {
    text: 'Before running a single line, the engine scans the scope and registers every declaration. This is what "hoisting" really is.',
    bn: 'Code চালানোর আগেই engine পুরো scope ঘুরে সব declaration memory-তে তুলে রাখে — এটাকেই hoisting বলে।',
    state: { phase: 'Creation phase', line: null, rows: created(), output: [] },
  },
  {
    text: 'var is created AND initialised to undefined. let/const are created but left uninitialised (the Temporal Dead Zone). Function declarations get their whole body.',
    bn: 'var পায় undefined, let/const থাকে TDZ-তে, আর function declaration পুরো function সহই hoist হয়।',
    state: { phase: 'Creation phase', line: null, rows: created(), output: [] },
  },
  {
    text: 'Line 1 reads a. It exists and holds undefined, so there is no error — it prints undefined.',
    state: { phase: 'Execution phase', line: 1, rows: created('a'), output: ['undefined'] },
  },
  {
    text: 'Line 2 calls greet() before its declaration. It works: the function was fully hoisted.',
    state: {
      phase: 'Execution phase',
      line: 2,
      rows: created('greet'),
      output: ['undefined', 'hi'],
    },
  },
  {
    text: 'Line 3 calls sayBye(). Only the var was hoisted, with the value undefined — calling it throws TypeError. (Pretend we skip this line to continue.)',
    bn: 'Function expression-এর ক্ষেত্রে শুধু variable-টা hoist হয়, function না — তাই আগে call করলে TypeError।',
    state: {
      phase: 'Execution phase',
      line: 3,
      rows: created('sayBye'),
      output: ['undefined', 'hi', 'TypeError: sayBye is not a function'],
    },
  },
  {
    text: 'Line 4 assigns a = 1. Reading b at this point would throw ReferenceError: it is still in its Temporal Dead Zone.',
    state: {
      phase: 'Execution phase',
      line: 4,
      rows: withValues({ a: ['1', 'value'] }, 'b'),
      output: ['undefined', 'hi', 'TypeError: sayBye is not a function'],
    },
  },
  {
    text: 'Line 5 initialises b. The TDZ ends here — it lasts from the start of the scope until the let line runs.',
    bn: 'TDZ শেষ হয় ঠিক declaration-এর লাইনে পৌঁছালে। এর আগে b ছোঁয়া মানেই ReferenceError।',
    state: {
      phase: 'Execution phase',
      line: 5,
      rows: withValues({ a: ['1', 'value'], b: ['2', 'value'] }, 'b'),
      output: ['undefined', 'hi', 'TypeError: sayBye is not a function'],
    },
  },
  {
    text: 'Line 6 finally assigns the function to sayBye. Line 8 prints 1 2.',
    state: {
      phase: 'Execution phase',
      line: 8,
      rows: withValues({
        a: ['1', 'value'],
        b: ['2', 'value'],
        sayBye: ['ƒ ()', 'function'],
      }),
      output: ['undefined', 'hi', 'TypeError: sayBye is not a function', '1 2'],
    },
  },
];

const valueStyle: Record<Kind, string> = {
  value: 'text-level-foundation',
  undefined: 'text-muted',
  tdz: 'text-level-advanced',
  function: 'text-accent-text',
};

export default function HoistingTdzViz() {
  return (
    <StepViz
      title="Hoisting and the Temporal Dead Zone"
      caption="The memory table shows what each name holds during the creation phase and as each line executes."
      steps={steps}
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,17rem)_1fr]">
          <CodePane code={CODE} active={state.line} className="self-start" />
          <div className="grid content-start gap-2.5 *:min-w-0">
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <p className="flex items-center justify-between border-b border-border px-2.5 py-1.5 text-[0.625rem] font-semibold tracking-wider text-subtle uppercase">
                Memory
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 tracking-normal normal-case',
                    state.phase === 'Creation phase'
                      ? 'bg-level-intermediate/15 text-level-intermediate'
                      : 'bg-accent-soft text-accent-text',
                  )}
                >
                  {state.phase}
                </span>
              </p>
              <table className="w-full text-left font-mono text-xs">
                <tbody>
                  {state.rows.map((row) => (
                    <tr
                      key={row.name}
                      className={cn(
                        'border-b border-border transition-colors last:border-0',
                        row.hot && 'bg-accent-soft',
                      )}
                    >
                      <th scope="row" className="px-2.5 py-2 font-semibold">
                        {row.name}
                        <span className="ml-1.5 font-sans text-[0.625rem] font-normal text-subtle">
                          {row.declared}
                        </span>
                      </th>
                      <td className={cn('px-2.5 py-2 text-right break-all', valueStyle[row.kind])}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ConsolePanel lines={state.output} />
          </div>
        </div>
      )}
    </StepViz>
  );
}

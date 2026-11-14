import { cn } from '@/lib/cn';
import { CodePane } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

const CODE = `x = "global"
y = "global y"

def outer():
    x = "enclosing"
    def inner():
        print(x, y, len, z)
    inner()

outer()`;

type Scope = 'L' | 'E' | 'G' | 'B';
type Status = 'idle' | 'miss' | 'hit';

interface State {
  /** Name being looked up, if any. */
  lookup?: string;
  status: Record<Scope, Status>;
  result?: string;
  error?: boolean;
}

const idle: Record<Scope, Status> = { L: 'idle', E: 'idle', G: 'idle', B: 'idle' };

const SCOPES: { id: Scope; label: string; where: string; names: string[] }[] = [
  { id: 'B', label: 'Built-in', where: 'builtins module', names: ['len', 'print', 'range', '…'] },
  {
    id: 'G',
    label: 'Global',
    where: 'module level',
    names: ['x = "global"', 'y = "global y"', 'outer'],
  },
  { id: 'E', label: 'Enclosing', where: 'outer()', names: ['x = "enclosing"', 'inner'] },
  { id: 'L', label: 'Local', where: 'inner()', names: ['(no names defined)'] },
];

const steps: VizStep<State>[] = [
  {
    text: 'Scopes are nested. To resolve a name Python searches Local → Enclosing → Global → Built-in and stops at the first match.',
    bn: 'নাম খোঁজার ক্রম সবসময় ভেতর থেকে বাইরে: L → E → G → B। প্রথম যেখানে পায়, সেখানেই থামে।',
    state: { status: idle },
  },
  {
    text: 'Looking up x inside inner(): the Local scope has no x…',
    state: { lookup: 'x', status: { ...idle, L: 'miss' } },
  },
  {
    text: '…the Enclosing scope (outer) does. Search stops: x is "enclosing". The global x is shadowed.',
    bn: 'Enclosing scope-এ x পাওয়া গেছে, তাই global x পর্যন্ত আর যাওয়াই হয় না — এটাকে বলে shadowing।',
    state: { lookup: 'x', status: { ...idle, L: 'miss', E: 'hit' }, result: '"enclosing"' },
  },
  {
    text: 'Looking up y: not Local, not Enclosing — found in Global.',
    state: {
      lookup: 'y',
      status: { ...idle, L: 'miss', E: 'miss', G: 'hit' },
      result: '"global y"',
    },
  },
  {
    text: 'Looking up len: nothing in L, E or G, so Python falls back to the Built-in scope.',
    bn: 'len, print এগুলো কোনো keyword না — এগুলো Built-in scope-এর সাধারণ নাম, তাই shadow করাও যায়।',
    state: {
      lookup: 'len',
      status: { L: 'miss', E: 'miss', G: 'miss', B: 'hit' },
      result: '<built-in function len>',
    },
  },
  {
    text: 'Looking up z: all four scopes miss, so Python raises NameError.',
    state: {
      lookup: 'z',
      status: { L: 'miss', E: 'miss', G: 'miss', B: 'miss' },
      result: "NameError: name 'z' is not defined",
      error: true,
    },
  },
  {
    text: 'Assignment is different from lookup: x = … inside inner() creates a NEW local x. Use nonlocal x (enclosing) or global x (module) to rebind an outer name instead.',
    bn: 'পড়ার সময় বাইরের scope দেখা যায়, কিন্তু assign করলে নতুন local তৈরি হয়। বাইরেরটা বদলাতে nonlocal বা global লাগে।',
    state: { status: { ...idle, L: 'hit' } },
  },
];

const box: Record<Status, string> = {
  idle: 'border-border bg-surface',
  // Solid surface: nested scopes would otherwise stack tints and wash out the labels.
  miss: 'border-level-advanced/70 border-dashed bg-surface',
  hit: 'border-level-foundation bg-level-foundation/10',
};

function ScopeBox({ depth, state }: { depth: number; state: State }) {
  const scope = SCOPES[depth];
  if (!scope) return null;
  const status = state.status[scope.id];
  return (
    <div className={cn('rounded-lg border p-2 transition-colors @sm:p-2.5', box[status])}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-xs font-semibold">{scope.label}</span>
        <span className="text-[0.6875rem] text-muted">{scope.where}</span>
        {status !== 'idle' && state.lookup ? (
          <span
            className={cn(
              'ml-auto text-[0.6875rem] font-medium',
              status === 'hit' ? 'text-level-foundation' : 'text-level-advanced',
            )}
          >
            {status === 'hit' ? `✓ found ${state.lookup}` : `✗ no ${state.lookup}`}
          </span>
        ) : null}
      </div>
      <p className="mt-1 font-mono text-[0.6875rem] leading-5 break-words text-muted">
        {scope.names.join(' · ')}
      </p>
      {depth < SCOPES.length - 1 ? (
        <div className="mt-2">
          <ScopeBox depth={depth + 1} state={state} />
        </div>
      ) : null}
    </div>
  );
}

export default function LegbScopeViz() {
  return (
    <StepViz
      title="LEGB name lookup"
      caption="Each box is a scope. The lookup starts in the innermost box and walks outwards."
      steps={steps}
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,15rem)_1fr]">
          <div>
            <CodePane code={CODE} active={state.lookup ? 7 : null} />
            <p className="mt-2 min-h-10 font-mono text-xs leading-5">
              {state.lookup ? (
                <>
                  <span className="text-subtle">lookup › </span>
                  {state.lookup}
                  {state.result ? (
                    <span
                      className={cn(
                        'block break-words',
                        state.error ? 'text-level-advanced' : 'text-level-foundation',
                      )}
                    >
                      → {state.result}
                    </span>
                  ) : null}
                </>
              ) : null}
            </p>
          </div>
          <ScopeBox depth={0} state={state} />
        </div>
      )}
    </StepViz>
  );
}

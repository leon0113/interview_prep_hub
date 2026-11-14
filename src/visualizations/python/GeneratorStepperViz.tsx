import { cn } from '@/lib/cn';
import { CodePane, ConsolePanel, Panel, TokenList } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

const CODE = `def countdown(n):
    while n > 0:
        yield n
        n -= 1

gen = countdown(3)
print(next(gen))
print(next(gen))
print(next(gen))
print(next(gen))`;

interface State {
  /** Line in the caller. */
  callerLine: number;
  /** Line where the generator is paused / running, if any. */
  genLine?: number;
  status: 'not started' | 'paused at yield' | 'finished';
  n?: number;
  produced: string[];
  output: string[];
}

const steps: VizStep<State>[] = [
  {
    text: 'Calling a generator function runs NONE of its body. It just returns a generator object.',
    bn: 'Generator function call করলে ভেতরের code চলে না — শুধু একটা generator object তৈরি হয়।',
    state: { callerLine: 6, status: 'not started', n: 3, produced: [], output: [] },
  },
  {
    text: 'The first next() runs the body until it hits yield, hands back 3, and pauses right there.',
    bn: 'yield-এ এসে function থেমে যায়, কিন্তু শেষ হয় না — local variable গুলো সব মনে রাখে।',
    state: {
      callerLine: 7,
      genLine: 3,
      status: 'paused at yield',
      n: 3,
      produced: ['3'],
      output: ['3'],
    },
  },
  {
    text: 'The next next() resumes AFTER the yield: n becomes 2, the loop continues, and it pauses at yield again.',
    state: {
      callerLine: 8,
      genLine: 3,
      status: 'paused at yield',
      n: 2,
      produced: ['3', '2'],
      output: ['3', '2'],
    },
  },
  {
    text: 'Same again: resume, n becomes 1, yield 1, pause. Only one value exists at a time.',
    state: {
      callerLine: 9,
      genLine: 3,
      status: 'paused at yield',
      n: 1,
      produced: ['3', '2', '1'],
      output: ['3', '2', '1'],
    },
  },
  {
    text: 'Resume once more: n becomes 0, the loop ends and the function returns — which raises StopIteration. A for loop catches that for you.',
    bn: 'Generator একবারই iterate করা যায়। শেষ হয়ে গেলে আবার চালাতে চাইলে নতুন generator বানাতে হয়।',
    state: {
      callerLine: 10,
      status: 'finished',
      n: 0,
      produced: ['3', '2', '1'],
      output: ['3', '2', '1', 'StopIteration error'],
    },
  },
];

function MemoryBar({
  label,
  value,
  width,
  tone,
}: {
  label: string;
  value: string;
  width: string;
  tone: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-[0.6875rem] text-muted">
        <span className="font-mono">{label}</span>
        <span className="font-medium text-fg">{value}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-surface-2">
        <div className={cn('h-full rounded-full', tone)} style={{ width }} />
      </div>
    </div>
  );
}

export default function GeneratorStepperViz() {
  return (
    <StepViz
      title="Generator: pause and resume"
      caption="Each next() runs the generator up to the next yield. Its local state survives between calls."
      steps={steps}
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,14rem)_1fr]">
          <CodePane
            code={CODE}
            active={state.genLine ? [state.callerLine, state.genLine] : state.callerLine}
          />
          <div className="grid content-start gap-2.5 *:min-w-0">
            <Panel
              title="Generator frame"
              hint={state.status}
              active={state.status === 'paused at yield'}
              tone={state.status === 'finished' ? 'muted' : 'accent'}
            >
              <p className="font-mono text-xs">
                n = <span className="font-semibold">{state.n}</span>
              </p>
            </Panel>
            <Panel title="Values produced so far">
              <TokenList items={state.produced} tone="green" empty="none yet" />
            </Panel>
            <ConsolePanel lines={state.output} title="Output" />
            <Panel title="Memory for 1,000,000 numbers">
              <div className="grid gap-2 *:min-w-0">
                <MemoryBar
                  label="list(range(10**6))"
                  value="≈ 8 MB, all at once"
                  width="100%"
                  tone="bg-level-advanced"
                />
                <MemoryBar
                  label="(x for x in range(10**6))"
                  value="≈ 200 bytes"
                  width="2%"
                  tone="bg-level-foundation"
                />
              </div>
            </Panel>
          </div>
        </div>
      )}
    </StepViz>
  );
}

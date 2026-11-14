import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CodePane, ConsolePanel, PresetChips } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

type Block = 'try' | 'except' | 'else' | 'finally';
type Mark = 'ran' | 'skipped' | 'active';

interface State {
  line: number | null;
  marks: Partial<Record<Block, Mark>>;
  output: string[];
  /** Short status under the blocks. */
  note?: string;
}

interface Preset {
  code: string;
  blocks: Block[];
  steps: VizStep<State>[];
}

const BASIC = (first: string) => `try:
    ${first}
    print("try done")
except ZeroDivisionError:
    print("except")
else:
    print("else")
finally:
    print("finally")`;

const PRESETS = {
  ok: {
    code: BASIC('x = 10 / 2'),
    blocks: ['try', 'except', 'else', 'finally'],
    steps: [
      {
        text: 'The try block runs first. No exception is raised here.',
        state: { line: 2, marks: { try: 'active' }, output: [] },
      },
      {
        text: 'try finished without an error, so every except clause is skipped.',
        state: { line: 3, marks: { try: 'ran', except: 'skipped' }, output: ['try done'] },
      },
      {
        text: 'else runs ONLY when try raised nothing — the place for code that should run on success.',
        bn: 'else block চলে শুধু তখনই, যখন try-এ কোনো exception হয়নি।',
        state: {
          line: 7,
          marks: { try: 'ran', except: 'skipped', else: 'active' },
          output: ['try done', 'else'],
        },
      },
      {
        text: 'finally always runs last, success or failure. Use it for cleanup.',
        state: {
          line: 9,
          marks: { try: 'ran', except: 'skipped', else: 'ran', finally: 'active' },
          output: ['try done', 'else', 'finally'],
        },
      },
    ],
  },
  error: {
    code: BASIC('x = 10 / 0'),
    blocks: ['try', 'except', 'else', 'finally'],
    steps: [
      {
        text: 'try starts, and 10 / 0 raises ZeroDivisionError. The rest of the try block is abandoned.',
        state: { line: 2, marks: { try: 'active' }, output: [], note: 'ZeroDivisionError raised' },
      },
      {
        text: 'Python looks for a matching except clause. This one matches, so it handles the error.',
        bn: 'Exception হওয়ার সাথে সাথে try-এর বাকি লাইন বাদ পড়ে, আর মিলে যাওয়া except চলে।',
        state: { line: 5, marks: { try: 'ran', except: 'active' }, output: ['except'] },
      },
      {
        text: 'else is skipped because try did not finish cleanly.',
        state: {
          line: 6,
          marks: { try: 'ran', except: 'ran', else: 'skipped' },
          output: ['except'],
        },
      },
      {
        text: 'finally still runs. If no except had matched, finally would run and THEN the error would keep propagating.',
        state: {
          line: 9,
          marks: { try: 'ran', except: 'ran', else: 'skipped', finally: 'active' },
          output: ['except', 'finally'],
        },
      },
    ],
  },
  returnInFinally: {
    code: `def f():
    try:
        return "from try"
    finally:
        return "from finally"

print(f())`,
    blocks: ['try', 'finally'],
    steps: [
      {
        text: 'f() is called and the try block reaches return "from try".',
        state: {
          line: 3,
          marks: { try: 'active' },
          output: [],
          note: 'pending return: "from try"',
        },
      },
      {
        text: 'The function cannot leave yet: finally must run first. The return value is held as pending.',
        bn: 'return লেখা থাকলেও function বের হওয়ার আগে finally চলবেই।',
        state: {
          line: 4,
          marks: { try: 'ran', finally: 'active' },
          output: [],
          note: 'pending return: "from try"',
        },
      },
      {
        text: 'finally has its own return, which REPLACES the pending one. The value from try is lost.',
        state: {
          line: 5,
          marks: { try: 'ran', finally: 'active' },
          output: [],
          note: 'return value replaced: "from finally"',
        },
      },
      {
        text: 'Output is "from finally". A return in finally also silently swallows any in-flight exception — avoid it.',
        bn: 'finally-তে return দিলে try-এর return আর চলমান exception দুটোই হারিয়ে যায় — এটা না করাই ভালো।',
        state: {
          line: 7,
          marks: { try: 'ran', finally: 'ran' },
          output: ['from finally'],
        },
      },
    ],
  },
} satisfies Record<string, Preset>;

type PresetId = keyof typeof PRESETS;

const OPTIONS: { value: PresetId; label: string }[] = [
  { value: 'ok', label: 'no error' },
  { value: 'error', label: 'error raised' },
  { value: 'returnInFinally', label: 'return in finally' },
];

const markStyle: Record<Mark | 'idle', string> = {
  idle: 'border-border bg-surface text-muted',
  active: 'border-accent bg-accent-soft text-accent-text',
  ran: 'border-level-foundation bg-level-foundation/10 text-level-foundation',
  skipped: 'border-dashed border-border-strong bg-surface text-subtle line-through',
};
const markLabel: Record<Mark | 'idle', string> = {
  idle: '',
  active: 'running',
  ran: 'ran',
  skipped: 'skipped',
};

export default function TryExceptFlowViz() {
  const [presetId, setPresetId] = useState<PresetId>('ok');
  const preset: Preset = PRESETS[presetId];

  return (
    <StepViz
      key={presetId}
      title="try / except / else / finally"
      caption="Pick a scenario and follow which blocks run, in what order."
      steps={preset.steps}
      toolbar={
        <PresetChips label="Scenario" options={OPTIONS} value={presetId} onChange={setPresetId} />
      }
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,16rem)_1fr]">
          <CodePane code={preset.code} active={state.line} className="self-start" />
          <div className="grid content-start gap-2 *:min-w-0">
            {preset.blocks.map((block) => {
              const mark = state.marks[block] ?? 'idle';
              return (
                <div
                  key={block}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-xs transition-colors',
                    markStyle[mark],
                  )}
                >
                  <span className="font-semibold">{block}</span>
                  <span className="font-sans text-[0.6875rem] no-underline">{markLabel[mark]}</span>
                </div>
              );
            })}
            <p className="min-h-5 font-mono text-[0.6875rem] text-level-intermediate">
              {state.note}
            </p>
            <ConsolePanel lines={state.output} title="Output" />
          </div>
        </div>
      )}
    </StepViz>
  );
}

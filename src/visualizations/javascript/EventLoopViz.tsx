import { useState } from 'react';
import { CodePane, ConsolePanel, Panel, PresetChips, TokenList } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

interface State {
  line: number | null;
  stack: string[];
  webApis: string[];
  micro: string[];
  macro: string[];
  console: string[];
  /** Which area the step is about, to highlight it. */
  focus?: 'stack' | 'webApis' | 'micro' | 'macro';
}

interface Preset {
  code: string;
  steps: VizStep<State>[];
}

const s = (state: Partial<State>): State => ({
  line: null,
  stack: [],
  webApis: [],
  micro: [],
  macro: [],
  console: [],
  ...state,
});

const PRESETS = {
  basics: {
    code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
    steps: [
      {
        text: 'The script starts. The global code is pushed onto the call stack and runs top to bottom.',
        state: s({ stack: ['global'], focus: 'stack' }),
      },
      {
        text: 'console.log("A") is pushed, runs, prints A and pops. Synchronous code runs immediately.',
        state: s({ line: 1, stack: ['global', 'log("A")'], console: ['A'], focus: 'stack' }),
      },
      {
        text: 'setTimeout hands the callback and a 0 ms timer to the browser (a Web API). JavaScript does not wait.',
        bn: 'setTimeout নিজে কিছু চালায় না — callback-টা browser-এর কাছে জমা দিয়ে পরের লাইনে চলে যায়।',
        state: s({
          line: 2,
          stack: ['global'],
          webApis: ['timer 0ms → B'],
          console: ['A'],
          focus: 'webApis',
        }),
      },
      {
        text: 'The timer fires right away, so its callback moves to the macrotask (task) queue. It still cannot run: the stack is busy.',
        state: s({
          line: 2,
          stack: ['global'],
          macro: ['() => log("B")'],
          console: ['A'],
          focus: 'macro',
        }),
      },
      {
        text: 'The promise is already resolved, so .then puts its callback in the MICROtask queue.',
        state: s({
          line: 3,
          stack: ['global'],
          micro: ['() => log("C")'],
          macro: ['() => log("B")'],
          console: ['A'],
          focus: 'micro',
        }),
      },
      {
        text: 'console.log("D") runs synchronously and prints D — before either callback.',
        state: s({
          line: 4,
          stack: ['global', 'log("D")'],
          micro: ['() => log("C")'],
          macro: ['() => log("B")'],
          console: ['A', 'D'],
          focus: 'stack',
        }),
      },
      {
        text: 'The script ends and the call stack is empty. Now the event loop takes over.',
        state: s({
          micro: ['() => log("C")'],
          macro: ['() => log("B")'],
          console: ['A', 'D'],
          focus: 'stack',
        }),
      },
      {
        text: 'Rule 1: drain ALL microtasks first. The promise callback runs and prints C.',
        bn: 'Call stack খালি হলেই event loop আগে microtask queue পুরো খালি করে — তাই Promise সবসময় setTimeout-এর আগে।',
        state: s({
          line: 3,
          stack: ['() => log("C")'],
          macro: ['() => log("B")'],
          console: ['A', 'D', 'C'],
          focus: 'micro',
        }),
      },
      {
        text: 'Rule 2: with no microtasks left, take ONE macrotask. The timer callback runs and prints B.',
        state: s({
          line: 2,
          stack: ['() => log("B")'],
          console: ['A', 'D', 'C', 'B'],
          focus: 'macro',
        }),
      },
      {
        text: 'Everything is empty. Final order: A, D, C, B — sync code, then microtasks, then macrotasks.',
        state: s({ console: ['A', 'D', 'C', 'B'] }),
      },
    ],
  },
  asyncAwait: {
    code: `async function run() {
  console.log(1);
  await null;
  console.log(2);
}
run();
console.log(3);`,
    steps: [
      {
        text: 'The script starts with the global code on the stack.',
        state: s({ stack: ['global'], focus: 'stack' }),
      },
      {
        text: 'run() is called. An async function starts executing synchronously, like any other function.',
        state: s({ line: 6, stack: ['global', 'run()'], focus: 'stack' }),
      },
      {
        text: 'console.log(1) prints 1 — still synchronous.',
        state: s({ line: 2, stack: ['global', 'run()'], console: ['1'], focus: 'stack' }),
      },
      {
        text: 'await pauses run(). Everything after it is scheduled as a microtask, and run() leaves the stack.',
        bn: 'await-এর পরের অংশটা আসলে একটা microtask — await মানে "বাকিটা পরে চালাও"।',
        state: s({
          line: 3,
          stack: ['global'],
          micro: ['run() continues'],
          console: ['1'],
          focus: 'micro',
        }),
      },
      {
        text: 'Control returns to the caller, so console.log(3) runs next and prints 3.',
        state: s({
          line: 7,
          stack: ['global', 'log(3)'],
          micro: ['run() continues'],
          console: ['1', '3'],
          focus: 'stack',
        }),
      },
      {
        text: 'The script is done and the stack is empty. The microtask resumes run() after the await and prints 2.',
        state: s({ line: 4, stack: ['run() continues'], console: ['1', '3', '2'], focus: 'micro' }),
      },
      {
        text: 'Final order: 1, 3, 2. Code before the first await is synchronous; code after it is a microtask.',
        state: s({ console: ['1', '3', '2'] }),
      },
    ],
  },
  nested: {
    code: `setTimeout(() => console.log("timeout 1"), 0);
setTimeout(() => console.log("timeout 2"), 0);
Promise.resolve().then(() => {
  console.log("micro 1");
  queueMicrotask(() => console.log("micro 2"));
});
console.log("sync");`,
    steps: [
      {
        text: 'Two timers are registered. Both fire immediately, so two callbacks wait in the macrotask queue.',
        state: s({ line: 2, stack: ['global'], macro: ['timeout 1', 'timeout 2'], focus: 'macro' }),
      },
      {
        text: 'The resolved promise queues its .then callback as a microtask.',
        state: s({
          line: 3,
          stack: ['global'],
          micro: ['micro 1'],
          macro: ['timeout 1', 'timeout 2'],
          focus: 'micro',
        }),
      },
      {
        text: 'console.log("sync") runs right away.',
        state: s({
          line: 7,
          stack: ['global', 'log("sync")'],
          micro: ['micro 1'],
          macro: ['timeout 1', 'timeout 2'],
          console: ['sync'],
          focus: 'stack',
        }),
      },
      {
        text: 'Stack empty → microtasks first. "micro 1" runs, and while running it queues ANOTHER microtask.',
        state: s({
          line: 5,
          stack: ['micro 1'],
          micro: ['micro 2'],
          macro: ['timeout 1', 'timeout 2'],
          console: ['sync', 'micro 1'],
          focus: 'micro',
        }),
      },
      {
        text: 'The microtask queue must be completely empty before any macrotask, so the new one runs too.',
        bn: 'Microtask চলার সময় নতুন microtask যোগ হলে সেটাও একই দফায় শেষ হয় — macrotask অপেক্ষা করে।',
        state: s({
          line: 5,
          stack: ['micro 2'],
          macro: ['timeout 1', 'timeout 2'],
          console: ['sync', 'micro 1', 'micro 2'],
          focus: 'micro',
        }),
      },
      {
        text: 'Now ONE macrotask runs: "timeout 1". After it, the loop checks the microtask queue again (empty).',
        state: s({
          line: 1,
          stack: ['timeout 1'],
          macro: ['timeout 2'],
          console: ['sync', 'micro 1', 'micro 2', 'timeout 1'],
          focus: 'macro',
        }),
      },
      {
        text: 'Then the next macrotask: "timeout 2". One macrotask per loop turn, all microtasks in between.',
        state: s({
          line: 2,
          stack: ['timeout 2'],
          console: ['sync', 'micro 1', 'micro 2', 'timeout 1', 'timeout 2'],
          focus: 'macro',
        }),
      },
    ],
  },
} satisfies Record<string, Preset>;

type PresetId = keyof typeof PRESETS;

const OPTIONS: { value: PresetId; label: string }[] = [
  { value: 'basics', label: 'setTimeout vs Promise' },
  { value: 'asyncAwait', label: 'async / await' },
  { value: 'nested', label: 'nested microtasks' },
];

export default function EventLoopViz() {
  const [presetId, setPresetId] = useState<PresetId>('basics');
  const preset: Preset = PRESETS[presetId];

  return (
    <StepViz
      key={presetId}
      title="The event loop"
      caption="Pick a snippet and step through it: call stack, Web APIs, the two queues and the console."
      steps={preset.steps}
      toolbar={
        <PresetChips
          label="Code snippet"
          options={OPTIONS}
          value={presetId}
          onChange={setPresetId}
        />
      }
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @xl:grid-cols-2">
          <div className="grid content-start gap-2.5 *:min-w-0">
            <CodePane code={preset.code} active={state.line} />
            <ConsolePanel lines={state.console} />
          </div>
          <div className="grid grid-cols-2 content-start gap-2.5 *:min-w-0">
            <Panel title="Call stack" active={state.focus === 'stack'} className="min-h-28">
              <TokenList items={state.stack} kind="stack" tone="accent" />
            </Panel>
            <Panel
              title="Web APIs"
              active={state.focus === 'webApis'}
              tone="amber"
              className="min-h-28"
            >
              <TokenList items={state.webApis} kind="stack" tone="amber" empty="idle" />
            </Panel>
            <Panel
              title="Microtask queue"
              hint="first"
              active={state.focus === 'micro'}
              tone="green"
              className="col-span-2"
            >
              <TokenList items={state.micro} tone="green" />
            </Panel>
            <Panel
              title="Macrotask queue"
              hint="then one"
              active={state.focus === 'macro'}
              tone="pink"
              className="col-span-2"
            >
              <TokenList items={state.macro} tone="pink" />
            </Panel>
          </div>
        </div>
      )}
    </StepViz>
  );
}

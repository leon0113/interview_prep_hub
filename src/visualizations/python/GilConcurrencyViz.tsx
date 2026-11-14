import { useState } from 'react';
import { cn } from '@/lib/cn';
import { PresetChips } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

/** r = running Python code, w = waiting for the GIL, i = waiting on I/O, - = not started / done */
type Slot = 'r' | 'w' | 'i' | '-';

interface Preset {
  lanes: { label: string; slots: string }[];
  /** Units a plain sequential run would take, for comparison. */
  sequential: number;
  total: number;
  steps: VizStep<number>[];
}

const PRESETS = {
  threadsCpu: {
    lanes: [
      { label: 'Thread 1', slots: 'rwrwrwrw' },
      { label: 'Thread 2', slots: 'wrwrwrwr' },
    ],
    sequential: 8,
    total: 8,
    steps: [
      {
        text: 'Two threads, each with 4 units of pure-Python CPU work. Only the thread holding the GIL can execute bytecode.',
        bn: 'GIL হলো একটা lock — এক সময়ে শুধু একটা thread Python bytecode চালাতে পারে।',
        state: 0,
      },
      {
        text: 'Thread 1 runs while Thread 2 waits for the GIL. Then they swap. They take turns; they never run at the same instant.',
        state: 4,
      },
      {
        text: 'Total: 8 units — no faster than running them one after the other (often slower, because of switching). Threads do not speed up CPU-bound Python.',
        bn: 'CPU-bound কাজে thread দিয়ে কোনো লাভ নেই, কারণ দুজন পালা করে একই GIL ব্যবহার করে।',
        state: 8,
      },
    ],
  },
  threadsIo: {
    lanes: [
      { label: 'Thread 1', slots: 'riiir-' },
      { label: 'Thread 2', slots: 'wriiir' },
    ],
    sequential: 10,
    total: 6,
    steps: [
      {
        text: 'Two threads that each send a request, wait for the network, then process the reply.',
        state: 0,
      },
      {
        text: 'Thread 1 starts its request and begins waiting on I/O. While it waits it RELEASES the GIL, so Thread 2 can run.',
        bn: 'I/O-র জন্য অপেক্ষা করার সময় thread GIL ছেড়ে দেয় — তখন অন্য thread চলতে পারে।',
        state: 2,
      },
      {
        text: 'Both threads are now waiting on the network at the same time. The waits overlap.',
        state: 4,
      },
      {
        text: 'Total: 6 units instead of 10. For I/O-bound work threads help a lot, GIL or not.',
        state: 6,
      },
    ],
  },
  processes: {
    lanes: [
      { label: 'Process 1', slots: 'rrrr' },
      { label: 'Process 2', slots: 'rrrr' },
    ],
    sequential: 8,
    total: 4,
    steps: [
      {
        text: 'The same CPU-bound work, but in two processes. Each process has its own interpreter and its OWN GIL.',
        bn: 'প্রতিটা process-এর আলাদা interpreter আর আলাদা GIL থাকে।',
        state: 0,
      },
      {
        text: 'Both run truly in parallel on separate CPU cores. Nobody waits for a lock.',
        state: 2,
      },
      {
        text: 'Total: 4 units instead of 8. The price: slower start-up, more memory, and data must be pickled to cross between processes.',
        state: 4,
      },
    ],
  },
  asyncio: {
    lanes: [
      { label: 'Task A', slots: 'riiir-' },
      { label: 'Task B', slots: '-riiir' },
    ],
    sequential: 10,
    total: 6,
    steps: [
      {
        text: 'asyncio: ONE thread, and an event loop that switches between coroutines.',
        bn: 'asyncio-তে thread একটাই — event loop একটার পর একটা coroutine চালায়।',
        state: 0,
      },
      {
        text: 'Task A runs until it hits await. That hands control back to the event loop, which starts Task B.',
        state: 2,
      },
      {
        text: 'Both tasks are waiting on I/O. The single thread is free; nothing is blocked.',
        state: 4,
      },
      {
        text: 'Total: 6 units, like threads, but with one thread and switches only at await. A CPU-heavy coroutine would block every other task.',
        bn: 'Switch হয় শুধু await-এ। তাই কোনো coroutine ভারী হিসাব করতে থাকলে বাকি সবাই আটকে যায়।',
        state: 6,
      },
    ],
  },
} satisfies Record<string, Preset>;

type PresetId = keyof typeof PRESETS;

const OPTIONS: { value: PresetId; label: string }[] = [
  { value: 'threadsCpu', label: 'threads · CPU' },
  { value: 'threadsIo', label: 'threads · I/O' },
  { value: 'processes', label: 'processes · CPU' },
  { value: 'asyncio', label: 'asyncio · I/O' },
];

const slotStyle: Record<Slot, string> = {
  r: 'bg-accent',
  w: 'bg-level-advanced/50',
  i: 'bg-level-intermediate/60',
  '-': 'bg-transparent',
};

const LEGEND: { slot: Slot; label: string }[] = [
  { slot: 'r', label: 'running Python' },
  { slot: 'w', label: 'waiting for the GIL' },
  { slot: 'i', label: 'waiting on I/O' },
];

const MAX_SLOTS = 8;

export default function GilConcurrencyViz() {
  const [presetId, setPresetId] = useState<PresetId>('threadsCpu');
  const preset: Preset = PRESETS[presetId];

  return (
    <StepViz
      key={presetId}
      title="GIL: threads vs processes vs asyncio"
      caption="A timeline of two workers. Compare what each model does with CPU-bound and I/O-bound work."
      steps={preset.steps}
      toolbar={
        <PresetChips label="Scenario" options={OPTIONS} value={presetId} onChange={setPresetId} />
      }
    >
      {(revealed) => (
        <div>
          <div className="grid gap-2 *:min-w-0">
            {preset.lanes.map((lane) => (
              <div key={lane.label} className="flex items-center gap-2">
                <span className="w-[4.25rem] shrink-0 text-xs text-muted">{lane.label}</span>
                <div
                  className="grid flex-1 gap-0.5 rounded-md bg-surface-2 p-0.5 *:min-w-0"
                  style={{ gridTemplateColumns: `repeat(${MAX_SLOTS}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: MAX_SLOTS }, (_, i) => {
                    const slot = (lane.slots[i] ?? '-') as Slot;
                    return (
                      <span
                        key={i}
                        className={cn(
                          'h-7 rounded-[5px] transition-opacity duration-300',
                          slotStyle[slot],
                          i < revealed ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-[4.25rem] shrink-0 text-[0.6875rem] text-subtle">time →</span>
              <div
                className="grid flex-1 px-0.5 text-center text-[0.625rem] text-subtle tabular-nums *:min-w-0"
                style={{ gridTemplateColumns: `repeat(${MAX_SLOTS}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: MAX_SLOTS }, (_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-muted">
            {LEGEND.map((item) => (
              <li key={item.slot} className="inline-flex items-center gap-1.5">
                <span className={cn('size-2.5 rounded-sm', slotStyle[item.slot])} />
                {item.label}
              </li>
            ))}
          </ul>

          <p className="mt-3 text-xs text-muted">
            Total time:{' '}
            <span className="font-semibold text-fg tabular-nums">
              {revealed >= preset.total ? `${preset.total} units` : '…'}
            </span>{' '}
            · one after another would take{' '}
            <span className="font-semibold text-fg tabular-nums">{preset.sequential} units</span>
          </p>
        </div>
      )}
    </StepViz>
  );
}

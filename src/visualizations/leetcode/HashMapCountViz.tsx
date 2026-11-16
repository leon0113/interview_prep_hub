import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Panel, PresetChips } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';
import { ArrayStateView } from './ArrayPointersViz';

const NUMS = [4, 1, 2, 1, 2];

interface HashState {
  i?: number;
  pass: 1 | 2;
  map: [number, number][];
  updated?: number;
  found?: number;
}

function countSteps(): VizStep<HashState>[] {
  const steps: VizStep<HashState>[] = [
    { state: { pass: 1, map: [] }, text: 'Pass 1 (count): start with an empty hash map.' },
  ];
  const map = new Map<number, number>();
  NUMS.forEach((value, i) => {
    map.set(value, (map.get(value) ?? 0) + 1);
    const count = map.get(value)!;
    steps.push({
      state: { i, pass: 1, map: [...map.entries()], updated: value },
      text:
        count === 1
          ? `i = ${i}: first time we see ${value}, hash[${value}] = 1.`
          : `i = ${i}: seen ${value} before, hash[${value}]++ → ${count}.`,
    });
  });
  steps.push({
    state: { i: 0, pass: 2, map: [...map.entries()], updated: 4, found: 4 },
    text: 'Pass 2 (look up): i = 0, hash[4] === 1 → return 4.',
    bn: 'যার count 1, সেটাই উত্তর।',
  });
  return steps;
}

interface XorState {
  i?: number;
  before: number;
  operand?: number;
  after: number;
}

function xorSteps(): VizStep<XorState>[] {
  const steps: VizStep<XorState>[] = [
    { state: { before: 0, after: 0 }, text: 'XOR: result starts at 0. a ^ a = 0 and a ^ 0 = a.' },
  ];
  let result = 0;
  NUMS.forEach((value, i) => {
    const before = result;
    result ^= value;
    steps.push({
      state: { i, before, operand: value, after: result },
      text: `i = ${i}: ${before} ^ ${value} = ${result}.`,
    });
  });
  steps.push({
    state: { before: result, after: result },
    text: `The pairs (1, 1) and (2, 2) cancelled out; only 4 is left. Return ${result}.`,
    bn: 'জোড়া গুলো কেটে যায়, একা টা থাকে।',
  });
  return steps;
}

const COUNT_STEPS = countSteps();
const XOR_STEPS = xorSteps();

type Mode = 'hash' | 'xor';
const MODES: { value: Mode; label: string }[] = [
  { value: 'hash', label: 'Hash map (my solution)' },
  { value: 'xor', label: 'XOR (optimal)' },
];

/** #136: the hash map filling up in pass 1, the lookup in pass 2, or the XOR version in bits. */
export default function HashMapCountViz() {
  const [mode, setMode] = useState<Mode>('hash');
  const toolbar = <PresetChips label="Version" options={MODES} value={mode} onChange={setMode} />;

  return mode === 'hash' ? (
    <StepViz
      key="hash"
      title="Single Number: counting with a hash map"
      caption="Pass 1 builds counts; pass 2 finds the value whose count is 1. Space grows with the input: O(n)."
      steps={COUNT_STEPS}
      toolbar={toolbar}
    >
      {(state) => (
        <div className="flex flex-col gap-3 @md:flex-row">
          <div className="min-w-0 flex-1">
            <ArrayStateView
              name="Hash map count"
              state={{
                array: NUMS,
                pointers: state.i === undefined ? {} : { i: state.i },
                highlight: state.i === undefined ? [] : [state.i],
                vars: { pass: state.pass },
                caption: '',
              }}
            />
          </div>
          <Panel title="hash" hint="value → count" className="@md:w-44">
            {state.map.length === 0 ? (
              <p className="font-mono text-xs text-subtle">{'{}'}</p>
            ) : (
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="text-left text-subtle">
                    <th className="py-1 font-medium">key</th>
                    <th className="py-1 font-medium">count</th>
                  </tr>
                </thead>
                <tbody>
                  {state.map.map(([key, count]) => (
                    <tr
                      key={key}
                      className={cn(
                        key === state.updated && 'bg-accent-soft font-semibold text-accent-text',
                        key === state.found && 'bg-level-foundation/10 text-level-foundation',
                      )}
                    >
                      <td className="px-1 py-1">{key}</td>
                      <td className="px-1 py-1">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      )}
    </StepViz>
  ) : (
    <StepViz
      key="xor"
      title="Single Number: XOR cancels pairs"
      caption="XOR every value into result. Equal bits cancel, so pairs disappear and O(1) space is enough."
      steps={XOR_STEPS}
      toolbar={toolbar}
    >
      {(state) => (
        <div className="flex flex-col gap-3">
          <ArrayStateView
            name="XOR"
            state={{
              array: NUMS,
              pointers: state.i === undefined ? {} : { i: state.i },
              highlight: state.i === undefined ? [] : [state.i],
              caption: '',
            }}
          />
          <Panel title="Bits" hint="3-bit binary">
            <table className="font-mono text-sm">
              <tbody>
                <BitsRow label="result" value={state.before} />
                {state.operand !== undefined ? (
                  <BitsRow label={`^ ${state.operand}`} value={state.operand} />
                ) : null}
                <BitsRow label="=" value={state.after} strong />
              </tbody>
            </table>
          </Panel>
        </div>
      )}
    </StepViz>
  );
}

function BitsRow({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <tr className={cn(strong && 'border-t border-border font-semibold text-accent-text')}>
      <td className="py-1 pr-4 text-right text-muted">{label}</td>
      <td className="py-1 pr-4 tracking-[0.3em]">{value.toString(2).padStart(3, '0')}</td>
      <td className="py-1 text-muted">({value})</td>
    </tr>
  );
}

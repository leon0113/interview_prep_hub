import { useState } from 'react';
import { cn } from '@/lib/cn';
import { PresetChips } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

/** Three input promises: when each settles (in seconds) and how. */
const PROMISES = [
  { name: 'p1', settlesAt: 1, outcome: 'rejected', value: 'Error("X")' },
  { name: 'p2', settlesAt: 2, outcome: 'fulfilled', value: '"B"' },
  { name: 'p3', settlesAt: 3, outcome: 'fulfilled', value: '"C"' },
] as const;

const MAX_TIME = 3;

interface Combinator {
  call: string;
  /** Time at which the combined promise settles. */
  settlesAt: number;
  outcome: 'fulfilled' | 'rejected';
  value: string;
  rule: string;
  /** Explanation for t = 0, 1, 2, 3. */
  steps: { text: string; bn?: string }[];
}

const COMBINATORS = {
  all: {
    call: 'Promise.all([p1, p2, p3])',
    settlesAt: 1,
    outcome: 'rejected',
    value: 'Error("X")',
    rule: 'Fulfils when ALL fulfil · rejects as soon as ONE rejects',
    steps: [
      {
        text: 'A promise starts as pending. It later becomes fulfilled or rejected — "settled" — and can never change again.',
      },
      {
        text: 'p1 rejects at 1s. Promise.all short-circuits: it rejects immediately with that reason, without waiting for the others.',
        bn: 'Promise.all "সব অথবা কিছুই না" — একটা reject হলেই পুরোটা reject, বাকিদের জন্য অপেক্ষা করে না।',
      },
      {
        text: 'p2 fulfils, but the result of Promise.all was already decided. p2 still runs — it is just ignored.',
      },
      {
        text: 'Same for p3. Use all when every result is required and one failure should fail the whole thing.',
      },
    ],
  },
  allSettled: {
    call: 'Promise.allSettled([p1, p2, p3])',
    settlesAt: 3,
    outcome: 'fulfilled',
    value: '[{rejected}, {fulfilled "B"}, {fulfilled "C"}]',
    rule: 'Waits for ALL to settle · never rejects',
    steps: [
      {
        text: 'A promise starts as pending. It later becomes fulfilled or rejected — "settled" — and can never change again.',
      },
      { text: 'p1 rejects at 1s. allSettled does not care: it keeps waiting.' },
      { text: 'p2 fulfils. Still waiting for the last one.' },
      {
        text: 'Everything has settled, so it fulfils with one {status, value | reason} object per promise, in input order.',
        bn: 'allSettled কখনো reject হয় না — প্রতিটার ফলাফল আলাদা করে জানায়, কোনটা সফল আর কোনটা ব্যর্থ।',
      },
    ],
  },
  race: {
    call: 'Promise.race([p1, p2, p3])',
    settlesAt: 1,
    outcome: 'rejected',
    value: 'Error("X")',
    rule: 'Settles like the FIRST promise to settle, win or lose',
    steps: [
      {
        text: 'A promise starts as pending. It later becomes fulfilled or rejected — "settled" — and can never change again.',
      },
      {
        text: 'p1 settles first — by rejecting. race takes whatever happens first, so it rejects too.',
        bn: 'race শুধু দেখে কে আগে শেষ হলো — সফল না ব্যর্থ, সেটা দেখে না। Timeout বানাতে এটা কাজে লাগে।',
      },
      { text: 'p2 fulfils later, but the race is already over.' },
      { text: 'Same for p3. Classic use: racing a request against a timeout promise.' },
    ],
  },
  any: {
    call: 'Promise.any([p1, p2, p3])',
    settlesAt: 2,
    outcome: 'fulfilled',
    value: '"B"',
    rule: 'Fulfils with the FIRST fulfilment · rejects only if ALL reject',
    steps: [
      {
        text: 'A promise starts as pending. It later becomes fulfilled or rejected — "settled" — and can never change again.',
      },
      { text: 'p1 rejects at 1s. any ignores rejections and keeps waiting for a success.' },
      {
        text: 'p2 is the first to FULFIL, so any fulfils with "B". Compare with race, which had already rejected at 1s.',
        bn: 'any প্রথম সফলটার জন্য অপেক্ষা করে। সবগুলো reject হলে তবেই AggregateError দিয়ে reject হয়।',
      },
      {
        text: 'p3 no longer matters. If all three had rejected, any would reject with an AggregateError.',
      },
    ],
  },
} satisfies Record<string, Combinator>;

type CombinatorId = keyof typeof COMBINATORS;

const OPTIONS: { value: CombinatorId; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'allSettled', label: 'allSettled' },
  { value: 'race', label: 'race' },
  { value: 'any', label: 'any' },
];

const badge = {
  pending: 'bg-surface-2 text-muted',
  fulfilled: 'bg-level-foundation/15 text-level-foundation',
  rejected: 'bg-level-advanced/15 text-level-advanced',
};
const bar = {
  pending: 'bg-border-strong',
  fulfilled: 'bg-level-foundation',
  rejected: 'bg-level-advanced',
};

function Lane({
  name,
  settlesAt,
  outcome,
  value,
  time,
  strong,
}: {
  name: string;
  settlesAt: number;
  outcome: 'fulfilled' | 'rejected';
  value: string;
  time: number;
  strong?: boolean;
}) {
  const settled = time >= settlesAt;
  const state = settled ? outcome : 'pending';
  const progress = Math.min(time, settlesAt) / MAX_TIME;
  return (
    <div
      className={cn(
        'grid gap-1 *:min-w-0',
        strong && 'rounded-lg border border-border bg-surface p-2.5',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn('min-w-0 truncate font-mono text-xs', strong && 'font-semibold')}>
          {name}
        </span>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
            badge[state],
          )}
        >
          {state}
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-2">
        <div
          className={cn(
            'h-full rounded-full transition-[width,background-color] duration-500',
            bar[state],
          )}
          style={{ width: `${Math.max(progress * 100, 2)}%` }}
        />
      </div>
      <p className="min-h-4 font-mono text-[0.6875rem] break-words text-muted">
        {settled ? `${outcome === 'fulfilled' ? 'value' : 'reason'}: ${value}` : ''}
      </p>
    </div>
  );
}

export default function PromiseStatesViz() {
  const [id, setId] = useState<CombinatorId>('all');
  const combinator: Combinator = COMBINATORS[id];
  const steps: VizStep<number>[] = combinator.steps.map((step, time) => ({ ...step, state: time }));

  return (
    <StepViz
      key={id}
      title="Promise states and combinators"
      caption="Three promises settle at 1s, 2s and 3s. Step through time and compare how each combinator reacts."
      steps={steps}
      toolbar={<PresetChips label="Combinator" options={OPTIONS} value={id} onChange={setId} />}
    >
      {(time) => (
        <div className="grid gap-3 *:min-w-0">
          <p className="flex items-center justify-between text-xs text-muted">
            <span>pending → fulfilled | rejected</span>
            <span className="font-mono font-semibold text-fg tabular-nums">t = {time}s</span>
          </p>
          <div className="grid gap-2 *:min-w-0">
            {PROMISES.map((promise) => (
              <Lane key={promise.name} {...promise} time={time} />
            ))}
          </div>
          <Lane
            strong
            name={combinator.call}
            settlesAt={combinator.settlesAt}
            outcome={combinator.outcome}
            value={combinator.value}
            time={time}
          />
          <p className="text-xs text-muted">{combinator.rule}</p>
        </div>
      )}
    </StepViz>
  );
}

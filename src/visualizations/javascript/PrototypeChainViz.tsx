import { ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CodePane, PresetChips } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

const CODE = `const animal = {
  eats: true,
  walk() {},
};
const rabbit = Object.create(animal);
rabbit.jumps = true;`;

const CHAIN = [
  { id: 'rabbit', label: 'rabbit', props: ['jumps: true'] },
  { id: 'animal', label: 'animal', props: ['eats: true', 'walk: ƒ'] },
  {
    id: 'Object.prototype',
    label: 'Object.prototype',
    props: ['toString: ƒ', 'hasOwnProperty: ƒ', '…'],
  },
] as const;

interface Lookup {
  prop: string;
  /** Index in CHAIN where the property lives; -1 = nowhere. */
  foundAt: number;
  result: string;
}

const LOOKUPS = {
  jumps: { prop: 'jumps', foundAt: 0, result: 'true' },
  eats: { prop: 'eats', foundAt: 1, result: 'true' },
  toString: { prop: 'toString', foundAt: 2, result: 'ƒ toString()' },
  fly: { prop: 'fly', foundAt: -1, result: 'undefined' },
} satisfies Record<string, Lookup>;

type LookupId = keyof typeof LOOKUPS;

const OPTIONS: { value: LookupId; label: string }[] = [
  { value: 'jumps', label: 'rabbit.jumps' },
  { value: 'eats', label: 'rabbit.eats' },
  { value: 'toString', label: 'rabbit.toString' },
  { value: 'fly', label: 'rabbit.fly' },
];

/** state = index of the link being checked; CHAIN.length means "reached null". */
function buildSteps(lookup: Lookup): VizStep<number>[] {
  // state -1 = nothing checked yet.
  const steps: VizStep<number>[] = [
    {
      state: -1,
      text: `Reading rabbit.${lookup.prop}: JavaScript first looks at rabbit itself, then follows the [[Prototype]] links upwards.`,
      bn: 'Property পড়ার সময় আগে object নিজে, না পেলে তার prototype, তারপর তার prototype — এভাবে উপরে ওঠে।',
    },
  ];
  const last = lookup.foundAt === -1 ? CHAIN.length : lookup.foundAt;
  for (let i = 0; i <= last; i++) {
    const link = CHAIN[i];
    if (!link) {
      steps.push({
        state: i,
        text: `The chain ends at null and ${lookup.prop} was never found. The result is undefined — no error is thrown.`,
        bn: 'Chain-এর শেষে null। কোথাও না পেলে error হয় না, শুধু undefined ফেরত আসে।',
      });
    } else if (i === lookup.foundAt) {
      steps.push({
        state: i,
        text:
          i === 0
            ? `${lookup.prop} is an OWN property of rabbit, so the search stops immediately.`
            : `Found ${lookup.prop} on ${link.label}. rabbit does not own it — it is inherited through the prototype chain.`,
        bn:
          i === 0
            ? undefined
            : 'Property-টা rabbit-এর নিজের না; prototype chain ধরে উপরে উঠে খুঁজে পাওয়া গেছে — এটাই prototypal inheritance।',
      });
    } else {
      steps.push({
        state: i,
        text: `${link.label} has no ${lookup.prop}. Follow its [[Prototype]] link to the next object.`,
      });
    }
  }
  return steps;
}

export default function PrototypeChainViz() {
  const [lookupId, setLookupId] = useState<LookupId>('eats');
  const lookup: Lookup = LOOKUPS[lookupId];
  const steps = buildSteps(lookup);

  return (
    <StepViz
      key={lookupId}
      title="Prototype chain lookup"
      caption="Reading a property walks from the object up through its prototypes until it is found or the chain ends at null."
      steps={steps}
      toolbar={
        <PresetChips
          label="Property to read"
          options={OPTIONS}
          value={lookupId}
          onChange={setLookupId}
        />
      }
    >
      {(current) => {
        const finished = current === (lookup.foundAt === -1 ? CHAIN.length : lookup.foundAt);
        return (
          <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,15rem)_1fr]">
            <div>
              <CodePane code={CODE} />
              <p className="mt-2 min-h-10 font-mono text-xs leading-5">
                <span className="text-subtle">read › </span>rabbit.{lookup.prop}
                {finished ? (
                  <span
                    className={cn(
                      'block',
                      lookup.foundAt === -1 ? 'text-level-advanced' : 'text-level-foundation',
                    )}
                  >
                    → {lookup.result}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex flex-col items-stretch">
              {CHAIN.map((link, i) => {
                const checking = i === current;
                const hit = checking && i === lookup.foundAt;
                const passed = i < current;
                return (
                  <div key={link.id} className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-full rounded-lg border p-2.5 transition-colors',
                        hit
                          ? 'border-level-foundation bg-level-foundation/10'
                          : checking
                            ? 'border-accent bg-accent-soft'
                            : 'border-border bg-surface',
                        passed && 'opacity-85',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold">{link.label}</span>
                        {checking || passed ? (
                          <span
                            className={cn(
                              'text-[0.6875rem] font-medium',
                              hit ? 'text-level-foundation' : 'text-level-advanced',
                            )}
                          >
                            {hit ? `✓ has ${lookup.prop}` : `✗ no ${lookup.prop}`}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 font-mono text-[0.6875rem] break-words text-muted">
                        {link.props.join(' · ')}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 py-1 text-[0.625rem] text-subtle">
                      <ArrowDown className="size-3.5" aria-hidden />
                      [[Prototype]]
                    </span>
                  </div>
                );
              })}
              <div
                className={cn(
                  'self-center rounded-lg border px-4 py-1.5 font-mono text-xs transition-colors',
                  current === CHAIN.length
                    ? 'border-level-advanced bg-level-advanced/10 text-level-advanced'
                    : 'border-dashed border-border-strong text-subtle',
                )}
              >
                null
              </div>
            </div>
          </div>
        );
      }}
    </StepViz>
  );
}

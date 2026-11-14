import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { PresetChips } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

interface Prop {
  name: string;
  type: string;
  optional?: boolean;
  readonly?: boolean;
}

const USER: Prop[] = [
  { name: 'id', type: 'number' },
  { name: 'name', type: 'string' },
  { name: 'email', type: 'string', optional: true },
  { name: 'role', type: '"admin" | "user"' },
];

type Change = 'kept' | 'removed' | 'changed';

interface Utility {
  expr: string;
  /** How it is defined, as a mapped / conditional type. */
  definition: string;
  output: (Prop & { change: Change })[] | string;
  steps: string[];
  bn?: string;
}

const keep = (p: Prop, change: Change = 'kept', extra: Partial<Prop> = {}) => ({
  ...p,
  ...extra,
  change,
});

const UTILITIES = {
  Partial: {
    expr: 'Partial<User>',
    definition: '{ [K in keyof T]?: T[K] }',
    output: USER.map((p) => keep(p, p.optional ? 'kept' : 'changed', { optional: true })),
    steps: [
      'Start from User. keyof User is "id" | "name" | "email" | "role".',
      'Partial maps over every key and adds ?, so every property becomes optional. Typical use: an update payload.',
    ],
    bn: 'Partial সব property optional করে দেয় — update function-এ শুধু যেটা বদলাবে সেটা পাঠানোর জন্য খুব কাজের।',
  },
  Required: {
    expr: 'Required<User>',
    definition: '{ [K in keyof T]-?: T[K] }',
    output: USER.map((p) => keep(p, p.optional ? 'changed' : 'kept', { optional: false })),
    steps: [
      'Start from User. Only email is optional.',
      'Required maps every key with -?, which removes the optional modifier. email becomes required.',
    ],
  },
  Readonly: {
    expr: 'Readonly<User>',
    definition: '{ readonly [K in keyof T]: T[K] }',
    output: USER.map((p) => keep(p, 'changed', { readonly: true })),
    steps: [
      'Start from User.',
      'Readonly marks every property readonly. Assigning user.name = "x" becomes a compile error. It is shallow: nested objects are still mutable.',
    ],
  },
  Pick: {
    expr: 'Pick<User, "id" | "name">',
    definition: '{ [K in Keys]: T[K] }',
    output: USER.map((p) => keep(p, ['id', 'name'].includes(p.name) ? 'kept' : 'removed')),
    steps: [
      'Start from User and the key list "id" | "name".',
      'Pick builds a new type containing ONLY the listed keys, each with its original type.',
    ],
    bn: 'Pick: শুধু যে key গুলো চাই সেগুলো রাখো। Omit: যে key গুলো চাই না সেগুলো বাদ দাও।',
  },
  Omit: {
    expr: 'Omit<User, "email">',
    definition: 'Pick<T, Exclude<keyof T, Keys>>',
    output: USER.map((p) => keep(p, p.name === 'email' ? 'removed' : 'kept')),
    steps: [
      'Start from User and the key to drop: "email".',
      'Omit keeps every key EXCEPT the listed ones. It is Pick of the remaining keys — handy for "User without the password".',
    ],
  },
  Record: {
    expr: 'Record<"admin" | "user", number>',
    definition: '{ [K in Keys]: V }',
    output: [
      { name: 'admin', type: 'number', change: 'changed' },
      { name: 'user', type: 'number', change: 'changed' },
    ],
    steps: [
      'Record does not start from User — it takes a set of keys and one value type.',
      'It builds an object type with exactly those keys, all with the value type. Great for lookup tables.',
    ],
  },
  ReturnType: {
    expr: 'ReturnType<typeof getUser>',
    definition: 'T extends (...args: any) => infer R ? R : any',
    output: 'Promise<User>',
    steps: [
      'Input: the function type of async function getUser(id: number): Promise<User>.',
      'ReturnType uses infer to pull out the return type: Promise<User>. Parameters<typeof getUser> would give [id: number].',
    ],
    bn: 'ReturnType দিয়ে function-এর return type আলাদা করে লিখতে হয় না — function বদলালে type-ও নিজে থেকেই বদলায়।',
  },
} satisfies Record<string, Utility>;

type UtilityId = keyof typeof UTILITIES;

const OPTIONS = (Object.keys(UTILITIES) as UtilityId[]).map((id) => ({ value: id, label: id }));

function PropRow({ prop }: { prop: Prop & { change?: Change } }) {
  return (
    <li
      className={cn(
        'rounded-md px-2 py-1 font-mono text-xs break-all transition-colors',
        prop.change === 'removed' && 'text-subtle line-through opacity-60',
        prop.change === 'changed' && 'bg-level-foundation/10 text-level-foundation',
      )}
    >
      {prop.readonly ? <span className="text-accent-text">readonly </span> : null}
      {prop.name}
      {prop.optional ? <span className="font-semibold">?</span> : null}: {prop.type};
    </li>
  );
}

function TypeBox({
  title,
  children,
  active,
}: {
  title: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-2.5 transition-colors',
        active ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
      )}
    >
      <p className="mb-1.5 font-mono text-[0.6875rem] font-semibold break-words text-muted">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function UtilityTypesViz() {
  const [id, setId] = useState<UtilityId>('Partial');
  const utility: Utility = UTILITIES[id];
  const steps: VizStep<number>[] = utility.steps.map((text, i) => ({
    text,
    bn: i === utility.steps.length - 1 ? utility.bn : undefined,
    state: i,
  }));

  return (
    <StepViz
      key={id}
      title="Utility types"
      caption="Pick a utility type and see how it turns the input type into the output type."
      steps={steps}
      toolbar={<PresetChips label="Utility type" options={OPTIONS} value={id} onChange={setId} />}
    >
      {(step) => (
        <div className="grid gap-2.5 *:min-w-0 @lg:grid-cols-[1fr_auto_1fr] @lg:items-start">
          <TypeBox
            title={
              id === 'ReturnType'
                ? 'typeof getUser'
                : id === 'Record'
                  ? 'keys + value'
                  : 'interface User'
            }
            active={step === 0}
          >
            {id === 'ReturnType' ? (
              <p className="font-mono text-xs break-all">(id: number) =&gt; Promise&lt;User&gt;</p>
            ) : id === 'Record' ? (
              <p className="font-mono text-xs break-all">"admin" | "user" → number</p>
            ) : (
              <ul className="grid gap-0.5 *:min-w-0">
                {USER.map((prop) => (
                  <PropRow key={prop.name} prop={prop} />
                ))}
              </ul>
            )}
          </TypeBox>

          <div className="flex flex-col items-center justify-center gap-1 py-1 text-center">
            <span className="font-mono text-xs font-semibold break-all text-accent-text">
              {utility.expr}
            </span>
            <span className="text-lg text-subtle @lg:rotate-0" aria-hidden>
              <span className="@lg:hidden">↓</span>
              <span className="hidden @lg:inline">→</span>
            </span>
          </div>

          <TypeBox title="Result" active={step >= 1}>
            {step >= 1 ? (
              typeof utility.output === 'string' ? (
                <p className="rounded-md bg-level-foundation/10 px-2 py-1 font-mono text-xs text-level-foundation">
                  {utility.output}
                </p>
              ) : (
                <ul className="grid gap-0.5 *:min-w-0">
                  {utility.output.map((prop) => (
                    <PropRow key={prop.name} prop={prop} />
                  ))}
                </ul>
              )
            ) : (
              <p className="text-xs text-subtle italic">step forward to apply it</p>
            )}
          </TypeBox>

          <p className="font-mono text-[0.6875rem] break-words text-muted @lg:col-span-3">
            <span className="text-subtle">definition › </span>
            {utility.definition}
          </p>
        </div>
      )}
    </StepViz>
  );
}

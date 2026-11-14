import { cn } from '@/lib/cn';
import { CodePane } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

type Support = 'yes' | 'no' | 'partial';

interface Capability {
  feature: string;
  type: Support;
  iface: Support;
  code: string;
  text: string;
  bn?: string;
}

const CAPABILITIES: Capability[] = [
  {
    feature: 'Describe an object shape',
    type: 'yes',
    iface: 'yes',
    code: `type User = { name: string };
interface User2 { name: string }`,
    text: 'For plain object shapes the two are interchangeable. This is the 90% case.',
    bn: 'সাধারণ object shape-এর জন্য দুটো প্রায় একই — যেটা team-এর convention, সেটাই ব্যবহার করুন।',
  },
  {
    feature: 'Extend another type',
    type: 'partial',
    iface: 'yes',
    code: `interface Admin extends User { level: number }
type Admin2 = User & { level: number };`,
    text: 'interface uses extends; type uses an intersection (&). extends also reports conflicting properties as an error instead of quietly producing never.',
  },
  {
    feature: 'Union types',
    type: 'yes',
    iface: 'no',
    code: `type Status = "idle" | "loading" | "done";
type Result = Success | Failure;`,
    text: 'Only type can name a union. An interface always describes a single object shape.',
  },
  {
    feature: 'Primitives, tuples, function types',
    type: 'yes',
    iface: 'partial',
    code: `type ID = string;
type Pair = [number, number];
type Fn = (x: number) => string;`,
    text: 'type can alias anything — primitives, tuples, function types. interface can describe a callable, but cannot alias a primitive or tuple.',
  },
  {
    feature: 'Mapped & conditional types',
    type: 'yes',
    iface: 'no',
    code: `type Flags<T> = { [K in keyof T]: boolean };
type Unwrap<T> = T extends Promise<infer U> ? U : T;`,
    text: 'Type-level programming (mapped types, conditional types, infer) needs type.',
  },
  {
    feature: 'Declaration merging',
    type: 'no',
    iface: 'yes',
    code: `interface Window { myApp: App }
interface Window { theme: string }
// both properties are now on Window`,
    text: 'Two interfaces with the same name merge into one. That is how libraries let you augment global or third-party types. Redeclaring a type is an error.',
    bn: 'একই নামে দুবার interface লিখলে দুটো মিলে যায় — library-র type বাড়াতে এটা লাগে। type দিয়ে এটা হয় না।',
  },
  {
    feature: 'Class implements',
    type: 'yes',
    iface: 'yes',
    code: `class Customer implements User { name = "Rafi" }`,
    text: 'A class can implement either, as long as the type is an object shape (not a union).',
  },
];

const steps: VizStep<number>[] = [
  ...CAPABILITIES.map((cap, i) => ({ text: cap.text, bn: cap.bn, state: i })),
  {
    text: 'Rule of thumb: use interface for public object shapes and anything that may need merging; use type for unions, tuples, functions and computed types.',
    bn: 'সংক্ষেপে: object shape আর extend-যোগ্য API → interface; union, tuple, utility বা জটিল type → type।',
    state: CAPABILITIES.length,
  },
];

const mark: Record<Support, { label: string; className: string }> = {
  yes: { label: '✓', className: 'bg-level-foundation/15 text-level-foundation' },
  no: { label: '✗', className: 'bg-level-advanced/15 text-level-advanced' },
  partial: { label: '~', className: 'bg-level-intermediate/15 text-level-intermediate' },
};

function Cell({ support }: { support: Support }) {
  return (
    <span
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-md text-xs font-semibold',
        mark[support].className,
      )}
      aria-label={support === 'partial' ? 'partly' : support}
    >
      {mark[support].label}
    </span>
  );
}

export default function TypeVsInterfaceViz() {
  return (
    <StepViz
      title="type vs interface"
      caption="Walk through each capability and see which declaration supports it."
      steps={steps}
    >
      {(current) => {
        const cap = CAPABILITIES[current];
        return (
          <div className="grid gap-3 *:min-w-0 @xl:grid-cols-[1fr_minmax(0,18rem)]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[0.625rem] tracking-wider text-subtle uppercase">
                  <th className="py-1.5 pr-2 font-semibold">Capability</th>
                  <th className="w-14 py-1.5 text-center font-mono font-semibold normal-case">
                    type
                  </th>
                  <th className="w-16 py-1.5 text-center font-mono font-semibold normal-case">
                    interface
                  </th>
                </tr>
              </thead>
              <tbody>
                {CAPABILITIES.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      'border-b border-border transition-colors last:border-0',
                      i === current && 'bg-accent-soft',
                      i > current && current < CAPABILITIES.length && 'opacity-70',
                    )}
                  >
                    <td className="py-1.5 pr-2 font-medium">{row.feature}</td>
                    <td className="py-1.5 text-center">
                      <Cell support={row.type} />
                    </td>
                    <td className="py-1.5 text-center">
                      <Cell support={row.iface} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cap ? (
              <CodePane code={cap.code} className="self-start" />
            ) : (
              <div className="self-start rounded-lg border border-border bg-surface p-3 text-xs leading-5">
                <p className="font-semibold">Use interface for</p>
                <p className="text-muted">
                  object shapes, public APIs, things others may extend or augment
                </p>
                <p className="mt-2 font-semibold">Use type for</p>
                <p className="text-muted">
                  unions, tuples, function types, mapped / conditional types
                </p>
              </div>
            )}
          </div>
        );
      }}
    </StepViz>
  );
}

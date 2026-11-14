import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CodePane, PresetChips } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

/** The decision tree, in the order the rules take precedence. */
const QUESTIONS = [
  {
    id: 'arrow',
    ask: 'Is it an arrow function?',
    yes: 'this = whatever this is in the enclosing scope',
  },
  { id: 'new', ask: 'Was it called with new?', yes: 'this = the brand-new object' },
  {
    id: 'explicit',
    ask: 'Called with call / apply / bind?',
    yes: 'this = the object you passed in',
  },
  { id: 'method', ask: 'Called as obj.method()?', yes: 'this = the object left of the dot' },
  {
    id: 'default',
    ask: 'None of the above (plain call)',
    yes: 'this = undefined (strict) or globalThis (sloppy)',
  },
] as const;

type RuleId = (typeof QUESTIONS)[number]['id'];

interface Example {
  code: string;
  /** Which rule decides it. */
  rule: RuleId;
  result: string;
  why: string;
  bn?: string;
}

const EXAMPLES = {
  method: {
    code: `const user = {
  name: "Rafi",
  greet() { return this.name; },
};
user.greet();`,
    rule: 'method',
    result: 'user  →  "Rafi"',
    why: 'The call site is user.greet(), so this is user — the object to the left of the dot at call time.',
    bn: 'this ঠিক হয় call করার মুহূর্তে: dot-এর বাঁ পাশে যে object, সেটাই this।',
  },
  detached: {
    code: `const user = {
  name: "Rafi",
  greet() { return this.name; },
};
const greet = user.greet;
greet();`,
    rule: 'default',
    result: 'undefined  →  TypeError in strict mode',
    why: 'Copying the method into a variable drops the object. greet() is a plain call, so this falls to the default.',
    bn: 'Method-টা আলাদা variable-এ নিলে object-এর সাথে সম্পর্ক হারিয়ে যায় — এটাই সবচেয়ে common interview ফাঁদ।',
  },
  callback: {
    code: `const user = {
  name: "Rafi",
  greet() { return this.name; },
};
setTimeout(user.greet, 0);`,
    rule: 'default',
    result: 'not user — this is lost',
    why: 'Passing user.greet as a callback is the same as detaching it. Fix it with user.greet.bind(user) or () => user.greet().',
  },
  explicit: {
    code: `function greet() { return this.name; }
const admin = { name: "Nadia" };
greet.call(admin);`,
    rule: 'explicit',
    result: 'admin  →  "Nadia"',
    why: 'call, apply and bind set this explicitly. bind returns a new function whose this can never be changed again.',
  },
  newCall: {
    code: `function User(name) {
  this.name = name;
}
const u = new User("Rafi");`,
    rule: 'new',
    result: 'the new object  →  { name: "Rafi" }',
    why: 'new creates an empty object, sets its prototype, runs the function with this bound to it, and returns it.',
  },
  arrow: {
    code: `const user = {
  name: "Rafi",
  greetLater() {
    setTimeout(() => console.log(this.name), 0);
  },
};
user.greetLater();`,
    rule: 'arrow',
    result: 'user  →  "Rafi"',
    why: 'An arrow function has no this of its own. It uses the this of greetLater, which was called as user.greetLater().',
    bn: 'Arrow function-এর নিজের this নেই — যেখানে লেখা হয়েছে সেই scope-এর this-ই ব্যবহার করে। call/bind দিয়েও বদলানো যায় না।',
  },
} satisfies Record<string, Example>;

type ExampleId = keyof typeof EXAMPLES;

const OPTIONS: { value: ExampleId; label: string }[] = [
  { value: 'method', label: 'obj.method()' },
  { value: 'detached', label: 'detached method' },
  { value: 'callback', label: 'as a callback' },
  { value: 'explicit', label: 'call / bind' },
  { value: 'newCall', label: 'new' },
  { value: 'arrow', label: 'arrow function' },
];

/** One step per question asked, stopping at the rule that applies. */
function buildSteps(example: Example): VizStep<number>[] {
  const decidingIndex = QUESTIONS.findIndex((q) => q.id === example.rule);
  // state -1 = no rule checked yet.
  const steps: VizStep<number>[] = [
    {
      state: -1,
      text: 'Ignore where the function was written — look at the call site. Check these rules from the top; the first one that applies decides this.',
      bn: 'this ঠিক হয় function কোথায় লেখা হয়েছে তা দিয়ে না, কীভাবে call করা হয়েছে তা দিয়ে (arrow function বাদে)।',
    },
  ];
  for (let i = 0; i <= decidingIndex; i++) {
    const question = QUESTIONS[i]!;
    const isLast = i === decidingIndex;
    steps.push({
      state: i,
      text: isLast
        ? `${question.ask} ${question.id === 'default' ? '' : 'Yes. '}${example.why}`
        : `${question.ask} No — move on to the next rule.`,
      bn: isLast ? example.bn : undefined,
    });
  }
  return steps;
}

export default function ThisBindingViz() {
  const [exampleId, setExampleId] = useState<ExampleId>('method');
  const example: Example = EXAMPLES[exampleId];
  const steps = buildSteps(example);
  const decidingIndex = QUESTIONS.findIndex((q) => q.id === example.rule);

  return (
    <StepViz
      key={exampleId}
      title="What is `this`?"
      caption="this depends on HOW a function is called. Pick a call and walk the decision tree from the top."
      steps={steps}
      toolbar={
        <PresetChips
          label="Call style"
          options={OPTIONS}
          value={exampleId}
          onChange={setExampleId}
        />
      }
    >
      {(current) => (
        <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,17rem)_1fr]">
          <CodePane
            code={example.code}
            active={example.code.split('\n').length}
            className="self-start"
          />
          <ol className="grid content-start gap-1.5 *:min-w-0">
            {QUESTIONS.map((question, i) => {
              const asked = i <= current;
              const decided = i === decidingIndex && current === decidingIndex;
              return (
                <li
                  key={question.id}
                  className={cn(
                    'rounded-lg border px-3 py-2 transition-colors',
                    decided
                      ? 'border-level-foundation bg-level-foundation/10'
                      : i === current
                        ? 'border-accent bg-accent-soft'
                        : 'border-border bg-surface',
                    !asked && 'opacity-85',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">
                      <span className="mr-1.5 tabular-nums">{i + 1}.</span>
                      {question.ask}
                    </span>
                    {asked ? (
                      <span
                        className={cn(
                          'shrink-0 text-[0.6875rem] font-semibold',
                          decided ? 'text-level-foundation' : 'text-subtle',
                        )}
                      >
                        {decided ? (question.id === 'default' ? 'applies' : 'yes') : 'no'}
                      </span>
                    ) : null}
                  </div>
                  {decided ? (
                    <p className="mt-1.5 font-mono text-xs break-words">
                      <span className="text-subtle">this = </span>
                      <span className="font-semibold">{example.result}</span>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[0.6875rem] text-muted">{question.yes}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </StepViz>
  );
}

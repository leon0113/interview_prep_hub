import { defineSection } from '../../define';

export const basics = defineSection({
  id: 'ts-basics',
  title: 'Basics',
  description:
    'What TypeScript adds on top of JavaScript, the everyday types, and the special types `any`, `unknown` and `never`.',
  order: 1,
  questions: [
    {
      id: 'ts-what-is-typescript',
      level: 'foundation',
      priority: 3,
      question: 'What is TypeScript, and why would you use it over plain JavaScript?',
      tags: ['basics', 'static-typing', 'compiler', 'type-erasure'],
      answer: {
        interview: `**TypeScript is a statically typed superset of JavaScript: you add types, the compiler checks them, and the output is plain JavaScript.**

- It catches type errors at compile time — wrong arguments, missing properties, possible \`null\` — before the code ever runs.
- Types power the editor: autocomplete, safe refactoring, go-to-definition.
- Types work as documentation that cannot drift out of date.
- **Types are erased at build time.** There is no runtime type checking and no runtime cost; the browser or Node only ever sees JavaScript.

Real-world: on a large codebase or team, TypeScript turns a whole class of production bugs into red squiggles in the editor.`,
        explanationBn: `JavaScript dynamically typed — variable-এ কোন ধরনের value আছে সেটা জানা যায় কেবল code চলার সময়। ফলে ভুল type পাঠানোর মতো bug ধরা পড়ে runtime-এ, অনেক সময় একেবারে production-এ গিয়ে।

TypeScript এই জায়গাটাতেই কাজ করে। আপনি code-এ type লিখে দেন (বা TypeScript নিজেই infer করে নেয়), আর compiler (\`tsc\`) code **চালানোর আগেই** মিলিয়ে দেখে সব ঠিকঠাক মিলছে কি না। না মিললে editor-এই লাল দাগ।

Analogy: TypeScript অনেকটা লেখার সময়কার spell-checker-এর মতো। ভুল বানান ছাপা হওয়ার আগেই ধরা পড়ে — কিন্তু ছাপা বইয়ে spell-checker বলে কিছু থাকে না।

এই শেষ কথাটাই interview-তে সবচেয়ে গুরুত্বপূর্ণ: **type erasure**। Compile হওয়ার সময় সব type annotation, \`interface\`, \`type\` মুছে ফেলা হয় — বাকি থাকে শুধু সাধারণ JavaScript। তাই:

- TypeScript runtime-এ কিছুই চেক করে না। API থেকে ভুল আকারের data এলে TypeScript সেটা আটকাতে পারবে না — সেখানে runtime validation (যেমন zod) লাগে।
- Runtime-এ \`interface\`-এর কোনো অস্তিত্ব নেই, তাই \`value instanceof MyInterface\` লেখা যায় না।
- Type থাকার কারণে performance-এ কোনো প্রভাব পড়ে না।`,
        examples: [
          {
            lang: 'typescript',
            caption: 'The compiler rejects a wrong call before the program runs',
            code: `function total(price: number, qty: number): number {
  return price * qty;
}

console.log(total(250, 2));

// @ts-expect-error ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
total("250", 2);`,
            output: `500`,
          },
          {
            lang: 'javascript',
            caption: 'What the compiler emits — every type is gone',
            code: `function total(price, qty) {
  return price * qty;
}`,
          },
        ],
        pitfalls: [
          'Types do not validate data at runtime: `JSON.parse` and `fetch` results are only as correct as you verify them to be.',
          'A type assertion (`as User`) silences the compiler; it does not convert or check anything.',
          'Liberal use of `any` switches the checker off and throws away most of the benefit.',
        ],
        followUps: [
          'What does "types are erased at runtime" mean in practice?',
          'What is the difference between `any` and `unknown`?',
          'Does TypeScript make code run faster?',
        ],
      },
      related: ['ts-any-unknown-never'],
    },
    {
      id: 'ts-any-unknown-never',
      level: 'intermediate',
      priority: 3,
      question: 'What is the difference between `any`, `unknown` and `never`?',
      tags: ['any', 'unknown', 'never', 'type-safety', 'narrowing'],
      answer: {
        interview: `**\`any\` turns type checking off, \`unknown\` is the type-safe "could be anything", and \`never\` is the type with no possible values.**

- **\`any\`**: anything is assignable to it and it is assignable to anything; every operation is allowed. It is an escape hatch that spreads silently.
- **\`unknown\`**: anything is assignable to it, but you cannot use it until you narrow it (\`typeof\`, \`instanceof\`, a type guard). Use it for external input: API responses, \`JSON.parse\`, \`catch (err)\`.
- **\`never\`**: nothing is assignable to it. It is the return type of functions that always throw or never finish, and what remains after every case of a union has been handled.

Real-world: prefer \`unknown\` over \`any\` at system boundaries, and use \`never\` for exhaustive \`switch\` checks so adding a new union member becomes a compile error.`,
        explanationBn: `তিনটাকে set হিসেবে ভাবলে সবচেয়ে সহজে মনে থাকে।

- \`unknown\` হলো **সবচেয়ে বড় set** — সব সম্ভাব্য value এর ভেতরে পড়ে। তাই যেকোনো কিছু \`unknown\`-এ রাখা যায়। কিন্তু TypeScript জানে না ভেতরে আসলে কী আছে, তাই আগে চেক (narrowing) না করে আপনাকে কিছুই করতে দেয় না। এটা যেন একটা বন্ধ বাক্স — খুলে না দেখা পর্যন্ত ব্যবহার করা নিষেধ।
- \`never\` হলো **ফাঁকা set** — এর কোনো value-ই নেই। যে function সবসময় error throw করে বা কখনো শেষ হয় না, তার return type \`never\`। আর union-এর সব case সামলে ফেলার পর যা বাকি থাকে, সেটাও \`never\`।
- \`any\` কোনো set-ই না — এটা type checker-এর **বন্ধ করার switch**। \`any\` পেলে TypeScript আর কোনো প্রশ্ন করে না: যেকোনো property পড়া যায়, যেকোনো function call করা যায়, যেকোনো type-এ বসানো যায়। ভুল থাকলে সেটা ধরা পড়বে runtime-এ গিয়ে।

\`any\` আর \`unknown\`-এর পার্থক্যটাই interview-তে সবচেয়ে বেশি জিজ্ঞেস করা হয়: দুটোতেই যেকোনো value রাখা যায়, কিন্তু \`any\` আপনাকে **বিশ্বাস করে**, আর \`unknown\` বলে **প্রমাণ দাও**।

\`never\`-এর সবচেয়ে কাজের ব্যবহার হলো exhaustive check। \`switch\`-এর \`default\`-এ value-টাকে \`never\` type-এর variable-এ বসিয়ে রাখলে, পরে কেউ union-এ নতুন member যোগ করে সেটার \`case\` লিখতে ভুলে গেলে compiler সাথে সাথে error দেখাবে।`,
        examples: [
          {
            lang: 'typescript',
            caption: '`unknown` must be narrowed; `any` lets a bug through silently',
            code: `function parse(input: unknown): number {
  // input.toFixed();  // ❌ 'input' is of type 'unknown'
  if (typeof input === "number") return input;         // narrowed to number
  if (typeof input === "string") return Number(input); // narrowed to string
  throw new Error("Unsupported input");
}
console.log(parse(42), parse("3.5"));

const loose: any = "hello";
console.log(loose.toFixed); // compiles — strings have no toFixed`,
            output: `42 3.5
undefined`,
          },
          {
            lang: 'typescript',
            caption: '`never` as an exhaustiveness check',
            code: `type Shape =
  | { kind: "circle"; r: number }
  | { kind: "square"; side: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.r ** 2;
    case "square":
      return s.side ** 2;
    default: {
      const unreachable: never = s; // errors if a new kind is added
      return unreachable;
    }
  }
}
console.log(area({ kind: "square", side: 4 }));`,
            output: `16`,
          },
        ],
        pitfalls: [
          '`any` is contagious: a value read from an `any` is also `any`, so one `any` can disable checking far from where it was written.',
          '`void` is not `never`: a `void` function returns (with `undefined`); a `never` function does not return at all.',
          'With `useUnknownInCatchVariables` (part of `strict`), `catch (err)` gives `unknown` — narrow it before reading `err.message`.',
        ],
        followUps: [
          'When is using `any` acceptable?',
          'How do you narrow an `unknown` value to a specific object shape?',
          'What is the difference between `void` and `never`?',
        ],
      },
      visualizationId: 'ts-type-sets',
      related: ['ts-what-is-typescript'],
    },
    {
      id: 'ts-type-inference',
      level: 'foundation',
      priority: 3,
      question: 'What is type inference? When should you write type annotations explicitly?',
      tags: ['type-inference', 'annotations', 'basics'],
      answer: {
        interview: `**Type inference means TypeScript works out a type from the value or usage, so you don’t have to write it.**

- \`let count = 0\` is inferred as \`number\`; assigning a string later is an error.
- Return types are inferred from \`return\` statements; array types from their elements.
- **Annotate at boundaries:** function parameters (they can’t be inferred), public/exported function return types, and empty initial values (\`let items: string[] = []\`).
- **Let inference work** for local variables and obvious values — extra annotations add noise and can *widen* types.
- An unannotated parameter is implicitly \`any\`; \`noImplicitAny\` (part of \`strict\`) turns that into an error.

Real-world: annotate a function’s inputs and output (its contract) and let everything inside be inferred.`,
        explanationBn: `TypeScript প্রতিটা জায়গায় type লিখতে বাধ্য করে না — value দেখে নিজেই বুঝে নেয়। \`let count = 0\` লিখলেই সে জানে \`count\` একটা \`number\`; পরে string বসাতে গেলে error।

**কোথায় নিজে লিখবেন:**
- **Function parameter** — এখানে inference করার মতো কোনো value নেই, তাই লিখতেই হয়। না লিখলে implicit \`any\`, আর \`strict\` mode-এ error।
- **Export করা function-এর return type** — এটা function-এর "চুক্তি"। লিখে রাখলে ভেতরে ভুল করে অন্য কিছু return করলে সাথে সাথে ধরা পড়ে, caller-এর জায়গায় না।
- **খালি শুরু** — \`let items = []\` থেকে type বোঝা যায় না, তাই \`let items: string[] = []\`।

**কোথায় লিখবেন না:** \`const name: string = "Rafi"\` — অপ্রয়োজনীয়, বরং কখনো type আরও চওড়া করে দেয় (literal \`"Rafi"\`-এর জায়গায় \`string\`)।

নিয়মটা মনে রাখার উপায়: **সীমানায় (input/output) annotate, ভেতরে infer।**`,
        examples: [
          {
            lang: 'typescript',
            code: `let count = 0;                       // inferred: number
// @ts-expect-error ❌ Type 'string' is not assignable to type 'number'.
count = "zero";

const prices = [120, 80, 50];        // inferred: number[]
const total = prices.reduce((sum, p) => sum + p, 0);

function average(values: number[]): number {   // annotate the contract
  return values.length ? total / values.length : 0;
}

const tags: string[] = [];           // empty: annotate, or it would be any[]
tags.push("sale");
console.log(total, average(prices), tags);`,
            output: `250 83.33333333333333 [ 'sale' ]`,
          },
        ],
        pitfalls: [
          'Writing `let x;` with no value and no annotation gives `any` (evolving any) — annotate it.',
          'Over-annotating literals widens them: `const mode: string = "dark"` loses the literal type `"dark"`.',
        ],
        followUps: [
          'What is `noImplicitAny`?',
          'Why might you annotate a return type even though it can be inferred?',
        ],
      },
      related: ['ts-literal-types', 'ts-what-is-typescript'],
    },
    {
      id: 'ts-arrays-tuples',
      level: 'foundation',
      priority: 2,
      question: 'How do you type arrays and tuples, and how is a tuple different from an array?',
      tags: ['arrays', 'tuples', 'readonly', 'basics'],
      answer: {
        interview: `**An array type (\`number[]\` or \`Array<number>\`) is any length of one element type; a tuple (\`[string, number]\`) has a fixed length and a type per position.**

- Tuples model pairs/records by position: \`[lat, lng]\`, React’s \`useState\` returning \`[value, setter]\`.
- Labels document positions: \`[name: string, age: number]\`; optional (\`[string, number?]\`) and rest (\`[string, ...number[]]\`) elements are allowed.
- \`readonly string[]\` / \`ReadonlyArray<string>\` remove mutating methods (\`push\`, \`sort\`) at compile time.
- At runtime both are ordinary JavaScript arrays — the length check is compile-time only.

Real-world: return a tuple from a custom hook so callers can name the parts when destructuring.`,
        explanationBn: `**Array** — একই type-এর যতগুলো খুশি element: \`number[]\`।

**Tuple** — নির্দিষ্ট সংখ্যক element, আর **প্রতিটা অবস্থানের type আলাদা** করে ঠিক করা: \`[string, number]\` মানে প্রথমটা string, দ্বিতীয়টা number, এর বেশি না।

কখন tuple? যখন অবস্থানই অর্থ বহন করে — coordinate \`[lat, lng]\`, বা React-এর \`useState\`, যেটা \`[value, setValue]\` ফেরত দেয়। Tuple হলে caller destructure করার সময় নিজের পছন্দের নাম দিতে পারে, আর TypeScript প্রতিটার সঠিক type জানে।

**\`readonly\`** — \`push\`, \`pop\`, \`sort\`-এর মতো বদলানোর method গুলো type থেকেই সরিয়ে দেয়। Function-এ array পাঠালে \`readonly\` parameter বলে দেয় "আমি তোমার array বদলাব না"।

মনে রাখবেন: runtime-এ tuple বলে কিছু নেই — সাধারণ array। দৈর্ঘ্যের নিয়ম শুধু compile time-এ।`,
        examples: [
          {
            lang: 'typescript',
            code: `const scores: number[] = [90, 75];
const point: [lat: number, lng: number] = [23.81, 90.41];
// @ts-expect-error ❌ Type '[number, number, number]' is not assignable to type '[lat: number, lng: number]'.
const bad: [lat: number, lng: number] = [1, 2, 3];

function useToggle(initial: boolean): [boolean, () => boolean] {
  let value = initial;
  return [value, () => (value = !value)];
}
const [isOpen, toggle] = useToggle(false);
console.log(isOpen, toggle(), point[0]);

function sum(values: readonly number[]): number {
  // values.push(1);  ❌ Property 'push' does not exist on type 'readonly number[]'.
  return values.reduce((a, b) => a + b, 0);
}
console.log(sum(scores), Array.isArray(point));`,
            output: `false true 23.81
165 true`,
          },
        ],
        pitfalls: [
          'Array literals are inferred as arrays, not tuples: `const p = [1, 2]` is `number[]` — annotate or use `as const`.',
          '`push` on a non-readonly tuple compiles and breaks the fixed-length assumption at runtime.',
        ],
        followUps: [
          'What does `as const` do to an array literal?',
          'What is a variadic tuple type?',
        ],
      },
      related: ['ts-as-const'],
    },
    {
      id: 'ts-literal-types',
      level: 'foundation',
      priority: 2,
      question: 'What are literal types, and why does `let` infer a wider type than `const`?',
      tags: ['literal-types', 'widening', 'unions', 'inference'],
      answer: {
        interview: `**A literal type is a single exact value used as a type — \`"dark"\`, \`404\`, \`true\` — usually combined into a union like \`"light" | "dark"\`.**

- Unions of literals replace magic strings: the compiler rejects \`"blue"\` and autocompletes valid values.
- **Widening:** \`const mode = "dark"\` has type \`"dark"\` (it can never change), while \`let mode = "dark"\` widens to \`string\` (it might be reassigned).
- Object properties widen too: \`{ mode: "dark" }\` has \`mode: string\` — fix with an annotation, \`as const\`, or \`satisfies\`.

Real-world: \`type Method = "GET" | "POST" | "PUT" | "DELETE"\` for an HTTP client’s options.`,
        explanationBn: `Literal type মানে একটা নির্দিষ্ট value-ই একটা type। \`type Theme = "light" | "dark"\` — Theme হতে পারে শুধু এই দুটো string-এর একটা। ভুল বানান (\`"drak"\`) compile time-এই ধরা পড়ে, আর editor সম্ভাব্য value গুলো সাজেস্ট করে।

**Widening — interview-এর আসল প্রশ্ন:**
- \`const mode = "dark"\` → type \`"dark"\`। const আর কখনো বদলাবে না, তাই TypeScript সবচেয়ে সরু type দেয়।
- \`let mode = "dark"\` → type \`string\`। let পরে অন্য string পেতে পারে, তাই TypeScript type চওড়া (widen) করে দেয়।

তাই \`let\` variable-কে Theme চাওয়া function-এ পাঠালে error — \`string\` তো যেকোনো string হতে পারে। Object property-ও একই কারণে widen হয় (property পরে বদলানো যায়)। সমাধান: annotation (\`let mode: Theme\`), বা \`as const\`।`,
        examples: [
          {
            lang: 'typescript',
            code: `type Theme = "light" | "dark";
const applyTheme = (theme: Theme) => \`theme=\${theme}\`;

const fixed = "dark";          // type: "dark"
let changing = "dark";         // type: string (widened)
let annotated: Theme = "dark"; // type: Theme

console.log(applyTheme(fixed), applyTheme(annotated));
// @ts-expect-error ❌ Argument of type 'string' is not assignable to parameter of type 'Theme'.
applyTheme(changing);
// @ts-expect-error ❌ Argument of type '"blue"' is not assignable to parameter of type 'Theme'.
applyTheme("blue");`,
            output: `theme=dark theme=dark`,
          },
        ],
        pitfalls: [
          'Object literals widen their properties: `const cfg = { theme: "dark" }` gives `theme: string`.',
          'Literal unions exist only at compile time — validate external strings at runtime before trusting them.',
        ],
        followUps: [
          'How do you get a union type from an array of values?',
          'What is a template literal type?',
        ],
      },
      related: ['ts-as-const', 'ts-type-inference'],
    },
    {
      id: 'ts-null-undefined-strict',
      level: 'foundation',
      priority: 2,
      question:
        'How does TypeScript handle `null` and `undefined`? What does `strictNullChecks` change?',
      tags: ['null', 'undefined', 'strict-null-checks', 'optional'],
      answer: {
        interview: `**With \`strictNullChecks\` (part of \`strict\`), \`null\` and \`undefined\` are separate types that you must include explicitly and handle before use.**

- \`string\` no longer accepts \`null\`; a nullable value is written \`string | null\`.
- Using a possibly-null value is an error (\`'user' is possibly 'null'\`) until you narrow it: \`if (user)\`, \`user?.name\`, \`user ?? fallback\`.
- Optional properties and parameters (\`name?: string\`) are \`string | undefined\`.
- Without the flag, \`null\` is assignable to everything — the "billion-dollar mistake" comes back.
- \`!\` (non-null assertion) tells the compiler "trust me"; it is unchecked and should be rare.

Real-world: \`Array.prototype.find\` returns \`T | undefined\`, forcing you to handle "not found".`,
        explanationBn: `\`strictNullChecks\` ছাড়া TypeScript ধরে নেয় যেকোনো variable-এ \`null\` থাকতে পারে, আর কিছুই চেক করে না — ফলে "Cannot read properties of null" ধরনের runtime crash ঠেকানো যায় না।

Flag চালু থাকলে:
- \`null\` আর \`undefined\` আলাদা type। \`string\`-এ \`null\` বসানো যাবে না — দরকার হলে স্পষ্ট লিখতে হবে \`string | null\`।
- এমন value ব্যবহার করার আগে চেক করা বাধ্যতামূলক। TypeScript বলে "'user' is possibly 'null'" — আগে প্রমাণ দাও যে null না।

চেক করার উপায়: \`if (user)\`, optional chaining \`user?.name\`, default \`user ?? guest\`। চেকের পরে TypeScript নিজেই type সরু (narrow) করে নেয়।

\`find\` এর উদাহরণটা খুব বাস্তব: খুঁজে না পেলে \`undefined\` আসে, তাই return type \`User | undefined\` — TypeScript আপনাকে "পাওয়া যায়নি" case ভুলতে দেয় না।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface User { id: number; name: string; nickname?: string }
const users: User[] = [{ id: 1, name: "Rafi" }];

const found = users.find((u) => u.id === 2);   // User | undefined
// @ts-expect-error ❌ 'found' is possibly 'undefined'.
const risky = () => found.name;

console.log(found?.name ?? "not found");

const user = users[0]!;
const display = user.nickname ?? user.name;     // nickname: string | undefined
console.log(display.toUpperCase());`,
            output: `not found
RAFI`,
          },
        ],
        pitfalls: [
          '`!` silences the check without adding one — a wrong `!` is a runtime crash.',
          '`if (value)` also filters out `0` and `""`; use `!= null` when those are valid.',
        ],
        followUps: [
          'What is the difference between `?.` and `!`?',
          'What is the difference between an optional property and `T | undefined`?',
        ],
      },
      related: ['ts-type-assertions'],
    },
    {
      id: 'ts-type-assertions',
      level: 'intermediate',
      priority: 2,
      question: 'What is a type assertion (`as`), and how is it different from type casting?',
      tags: ['type-assertions', 'as', 'non-null-assertion', 'type-safety'],
      answer: {
        interview: `**\`value as Type\` tells the compiler to treat a value as a type you know better than it does — it changes nothing at runtime and checks nothing.**

- It is not a cast: no conversion happens (\`"42" as unknown as number\` is still a string).
- TypeScript only allows assertions between types that overlap; unrelated types need \`as unknown as T\` — a strong code smell.
- \`!\` is a non-null assertion: \`el!\` removes \`null | undefined\` from the type.
- Legitimate uses: DOM elements (\`getElementById(...) as HTMLInputElement\`), test fixtures, narrowing after a check the compiler cannot follow.
- Prefer real checks (type guards, schema validation) for external data — an assertion on wrong data just moves the crash.

Real-world: \`JSON.parse(text) as User\` compiles even if the JSON has no \`name\` — validate with zod instead.`,
        explanationBn: `**Assertion = compiler-কে বলা "আমি জানি এটা কী, তুমি মেনে নাও"।** এটা অন্য ভাষার casting-এর মতো দেখতে, কিন্তু কাজ সম্পূর্ণ আলাদা: কোনো conversion হয় না, কোনো চেক হয় না। Compile হওয়ার পর \`as User\` পুরো মুছে যায়।

তাই assertion ভুল হলে TypeScript আপনাকে বাঁচাবে না — crash সরে যাবে পরের কোনো লাইনে, যেখানে value-টা আসলে ব্যবহার হচ্ছে। নিচের উদাহরণে JSON-এ \`name\` নেই, তবু compile হয়; runtime-এ \`toUpperCase\` ডাকতেই crash।

TypeScript সম্পূর্ণ অসম্পর্কিত type-এ assertion আটকায় (\`"hello" as number\`) — জোর করতে হলে \`as unknown as number\` লিখতে হয়, যেটা code review-এ লাল পতাকা।

**কখন ঠিক আছে:** DOM element-এর নির্দিষ্ট type, test data, বা এমন চেকের পরে যেটা compiler বুঝতে পারে না। **বাইরের data-র জন্য না** — সেখানে runtime validation।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface User { name: string }

// @ts-expect-error ❌ Conversion of type 'string' to type 'number' may be a mistake
const n = "hello" as number;

const raw = '{"id": 1}';
const user = JSON.parse(raw) as User;     // compiles — nothing is checked
console.log(typeof user, "name" in user);
console.log(user.name.toUpperCase());`,
            output: `object false
TypeError: Cannot read properties of undefined (reading 'toUpperCase')`,
          },
        ],
        pitfalls: [
          '`as` is not validation; it hides bugs in external data.',
          '`as any` / `as unknown as T` disable checking entirely — treat them as TODOs.',
          'Angle-bracket syntax (`<User>value`) does the same but cannot be used in `.tsx` files.',
        ],
        followUps: [
          'How do you safely type the result of `JSON.parse`?',
          'When is `!` acceptable?',
        ],
      },
      related: ['ts-any-unknown-never', 'ts-null-undefined-strict', 'ts-satisfies'],
    },
    {
      id: 'ts-enums-vs-unions',
      level: 'intermediate',
      priority: 2,
      question: 'What are enums in TypeScript, and why do many teams prefer union types instead?',
      tags: ['enums', 'unions', 'literal-types', 'runtime'],
      answer: {
        interview: `**An enum is a named set of constants that, unlike most TypeScript features, generates a real JavaScript object at runtime.**

- Numeric enums auto-increment from 0 and get a **reverse mapping** (\`Direction[0] === "Up"\`), so \`Object.keys\` returns both names and numbers.
- String enums (\`Active = "ACTIVE"\`) are clearer in logs and have no reverse mapping.
- Enums are nominal: you must write \`Status.Active\`, a plain \`"ACTIVE"\` string is rejected.
- A union of string literals (\`"active" | "inactive"\`) gives the same safety with zero runtime code; pair it with an \`as const\` object when you need the values at runtime.
- Enums don’t work with "type stripping" tools (Node’s \`--experimental-strip-types\`, \`erasableSyntaxOnly\`), another reason teams avoid them.

Real-world: \`const ROLES = ["admin", "editor"] as const; type Role = typeof ROLES[number];\`.`,
        explanationBn: `TypeScript-এর বেশিরভাগ জিনিস compile-এর পর মুছে যায় — enum ব্যতিক্রম। Enum থেকে সত্যিকারের একটা JavaScript object তৈরি হয়।

**Numeric enum-এর অদ্ভুত দিক:** \`enum Direction { Up, Down }\` থেকে যে object বানায় তাতে দুই দিকেই mapping থাকে — \`Direction.Up\` = 0, আবার \`Direction[0]\` = "Up"। তাই \`Object.keys\` চালালে নাম আর সংখ্যা দুটোই আসে — loop করলে প্রায়ই bug।

**কেন অনেকে union পছন্দ করে:**
- \`type Status = "active" | "inactive"\` — একই নিরাপত্তা, কিন্তু runtime-এ কোনো code নেই।
- API থেকে আসা সাধারণ string সরাসরি মেলে; enum হলে \`"ACTIVE"\` লেখা string-কে \`Status\` হিসেবে মানে না।
- নতুন tool (Node-এর type stripping) শুধু type মুছে ফেলে — enum-এর মতো code তৈরি করা syntax সমর্থন করে না।

Runtime-এ value-র তালিকা দরকার হলে: \`as const\` array বা object, আর তার থেকে type বের করা — দুটো সুবিধাই পাওয়া যায়।`,
        examples: [
          {
            lang: 'typescript',
            code: `enum Direction { Up, Down }
enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }

console.log(Direction.Up, Direction[0], Object.keys(Direction));
console.log(Status.Active, Object.keys(Status));

function setStatus(s: Status) { return s; }
// @ts-expect-error ❌ Argument of type '"ACTIVE"' is not assignable to parameter of type 'Status'.
setStatus("ACTIVE");

const ROLES = ["admin", "editor", "viewer"] as const;
type Role = (typeof ROLES)[number];          // "admin" | "editor" | "viewer"
const isRole = (x: string): x is Role => (ROLES as readonly string[]).includes(x);
console.log(isRole("editor"), isRole("owner"));`,
            output: `0 Up [ '0', '1', 'Up', 'Down' ]
ACTIVE [ 'Active', 'Inactive' ]
true false`,
          },
        ],
        pitfalls: [
          'Iterating a numeric enum yields both the names and the numbers.',
          '`const enum` is inlined by `tsc` but breaks under `isolatedModules` / single-file transpilers.',
        ],
        followUps: ['What does `as const` do?', 'What is a reverse mapping?'],
      },
      related: ['ts-as-const', 'ts-literal-types'],
    },
    {
      id: 'ts-as-const',
      level: 'intermediate',
      priority: 2,
      question: 'What does `as const` do?',
      tags: ['as-const', 'const-assertions', 'readonly', 'literal-types'],
      answer: {
        interview: `**\`as const\` (a const assertion) tells TypeScript to infer the narrowest possible type: literals instead of \`string\`/\`number\`, \`readonly\` properties, and readonly tuples instead of arrays.**

- \`["GET", "POST"] as const\` → \`readonly ["GET", "POST"]\` instead of \`string[]\`.
- \`{ mode: "dark" } as const\` → \`{ readonly mode: "dark" }\`.
- Combine with \`typeof\` and indexed access to derive types from data: \`typeof METHODS[number]\` → \`"GET" | "POST"\`.
- It is compile-time only — it does **not** freeze the object at runtime (\`Object.freeze\` does).

Real-world: one source of truth — a runtime array of allowed values, and a union type derived from it.`,
        explanationBn: `সাধারণভাবে TypeScript value থেকে "চওড়া" type বের করে — \`["GET", "POST"]\` হয় \`string[]\`, কারণ পরে array বদলানো যেতে পারে। \`as const\` বলে: "এটা কখনো বদলাবে না, যত সরু সম্ভব type দাও।" ফলাফল:
- string/number → নির্দিষ্ট literal (\`"GET"\`)
- array → readonly tuple
- object property → readonly

**সবচেয়ে কাজের pattern:** একটা array-কে runtime value আর type — দুটোরই উৎস বানানো:
\`\`\`ts
const METHODS = ["GET", "POST"] as const;
type Method = typeof METHODS[number]; // "GET" | "POST"
\`\`\`
তালিকায় নতুন value যোগ করলে type নিজেই আপডেট হয় — দুই জায়গায় লিখতে হয় না।

সতর্কতা: \`readonly\` শুধু compile time-এ। Runtime-এ object আসলেই আটকাতে হলে \`Object.freeze\`।`,
        examples: [
          {
            lang: 'typescript',
            code: `const METHODS = ["GET", "POST", "DELETE"] as const;
type Method = (typeof METHODS)[number];        // "GET" | "POST" | "DELETE"

const config = { retries: 3, mode: "strict" } as const;
// @ts-expect-error ❌ Cannot assign to 'retries' because it is a read-only property.
config.retries = 5;

function request(method: Method) { return method.toLowerCase(); }
console.log(METHODS.map(request), config.mode);
console.log(Object.isFrozen(config));         // compile-time only`,
            output: `[ 'get', 'post', 'delete' ] strict
false`,
          },
        ],
        pitfalls: [
          '`as const` is not `Object.freeze` — the object is still mutable at runtime (the assignment above actually ran).',
          'Readonly tuples cannot be passed where a mutable `string[]` is expected.',
        ],
        followUps: [
          'How is `as const` different from `Object.freeze`?',
          'What does `satisfies` add on top of `as const`?',
        ],
      },
      related: ['ts-literal-types', 'ts-satisfies', 'ts-enums-vs-unions'],
    },
    {
      id: 'ts-satisfies',
      level: 'intermediate',
      priority: 2,
      question:
        'What does the `satisfies` operator do, and how is it different from a type annotation?',
      tags: ['satisfies', 'annotations', 'inference', 'typescript-4-9'],
      answer: {
        interview: `**\`satisfies\` (TS 4.9) checks that a value matches a type *without* changing the value’s inferred type.**

- With an annotation (\`const x: T = ...\`), the variable’s type **becomes** \`T\` — you lose the specific details TypeScript inferred.
- With \`satisfies T\`, errors are still reported (missing keys, wrong value types, typos), but the variable keeps its precise inferred type.
- Typical case: \`Record<Keys, string | number>\` config objects — you want validation of keys *and* to know that \`port\` is a \`number\`.
- \`as const satisfies T\` combines literal types with validation.

Real-world: route maps, theme tokens, and config objects where both completeness and precise types matter.`,
        explanationBn: `**Annotation আর satisfies-এর পার্থক্য এক লাইনে:** annotation বলে "এই variable-এর type এটাই", satisfies বলে "চেক করো এটা ওই type-এর সাথে মেলে কি না, কিন্তু type যেটা infer হয়েছে সেটাই রাখো"।

উদাহরণ: \`const config: Record<string, string | number>\` লিখলে \`config.port\`-এর type হয় \`string | number\` — আপনি জানেন এটা number, কিন্তু TypeScript ভুলে গেছে। \`.toFixed()\` ডাকতে গেলে error।

\`satisfies\` দিলে দুই দিকই পাওয়া যায়:
- ভুল value দিলে (number-এর জায়গায় boolean) বা key-এর বানান ভুল হলে error — validation।
- আবার \`config.port\` থাকে \`number\` — নির্দিষ্ট type হারায় না।

এটা বিশেষ কাজের config, route map বা theme-এর মতো object-এ, যেখানে "সব key আছে কি না" আর "প্রতিটার সঠিক type" দুটোই জরুরি।`,
        examples: [
          {
            lang: 'typescript',
            code: `type Config = Record<"host" | "port", string | number>;

const annotated: Config = { host: "localhost", port: 8080 };
// @ts-expect-error ❌ Property 'toFixed' does not exist on type 'string | number'.
annotated.port.toFixed();

const checked = { host: "localhost", port: 8080 } satisfies Config;
console.log(checked.port.toFixed(1), checked.host.toUpperCase());

const broken = {
  host: "localhost",
  // @ts-expect-error ❌ Type 'boolean' is not assignable to type 'string | number'.
  port: true,
} satisfies Config;`,
            output: `8080.0 LOCALHOST`,
          },
        ],
        pitfalls: [
          '`satisfies` does not widen: an object checked against `Record<string, X>` still only has the keys you wrote.',
          'It is not an assertion — it can only make the compiler stricter, never looser.',
        ],
        followUps: ['When would you still use an annotation instead of `satisfies`?'],
      },
      related: ['ts-type-assertions', 'ts-as-const'],
    },
    {
      id: 'ts-object-vs-empty-object',
      level: 'intermediate',
      priority: 1,
      question: 'What is the difference between `object`, `Object` and `{}` as types?',
      tags: ['object', 'empty-object-type', 'primitives', 'type-safety'],
      answer: {
        interview: `**\`object\` means any non-primitive; \`{}\` and \`Object\` mean any value except \`null\` and \`undefined\` — including strings and numbers.**

- \`object\` accepts \`{}\`, arrays, functions, class instances; rejects \`42\` and \`"hi"\`.
- \`{}\` is "anything with no required properties" — primitives qualify because they have properties via their wrappers.
- \`Object\` (capital) behaves like \`{}\`; linters ban it.
- For "some object with unknown keys" use \`Record<string, unknown>\`; for "any non-null value" use \`NonNullable<unknown>\` or just \`unknown\`.

Real-world: a generic constraint \`T extends object\` keeps primitives out of a function that uses \`Object.keys\`.`,
        explanationBn: `নামগুলো বিভ্রান্তিকর, তাই interviewer জিজ্ঞেস করতে ভালোবাসেন।

- **\`object\`** (ছোট হাতের) — যেকোনো non-primitive: object, array, function। কিন্তু string, number, boolean না।
- **\`{}\`** — দেখতে "খালি object" মনে হয়, কিন্তু মানে "এমন যেকোনো value, যার কোনো বাধ্যতামূলক property নেই"। String-ও তো এমন value! তাই \`{}\`-এ \`"hi"\` আর \`42\` দুটোই বসে — শুধু \`null\` আর \`undefined\` বাদ।
- **\`Object\`** (বড় হাতের) — \`{}\`-এর মতোই; ব্যবহার না করাই ভালো।

তাই "যেকোনো object, key জানা নেই" বোঝাতে \`{}\` না লিখে \`Record<string, unknown>\` লিখুন।`,
        examples: [
          {
            lang: 'typescript',
            code: `let a: object = { x: 1 };
a = [1, 2];
// @ts-expect-error ❌ Type 'number' is not assignable to type 'object'.
a = 42;

let b: {} = "a string is fine";
b = 42;
// @ts-expect-error ❌ Type 'null' is not assignable to type '{}'.
b = null;

function keysOf<T extends object>(value: T) {
  return Object.keys(value);
}
console.log(keysOf({ id: 1, name: "Rafi" }), keysOf([10, 20]));`,
            output: `[ 'id', 'name' ] [ '0', '1' ]`,
          },
        ],
        pitfalls: [
          '`{}` as a parameter type accepts primitives — almost never what you meant.',
          '`Record<string, unknown>` rejects class instances without an index signature in some cases; `object` is looser.',
        ],
        followUps: ['What type would you use for "any JSON object"?'],
      },
      related: ['ts-any-unknown-never'],
    },
  ],
});

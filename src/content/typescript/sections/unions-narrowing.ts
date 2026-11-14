import { defineSection } from '../../define';

export const unionsNarrowing = defineSection({
  id: 'ts-unions-narrowing',
  title: 'Unions & Narrowing',
  description:
    'Union and intersection types, narrowing with typeof / instanceof / in, discriminated unions, custom type guards and assertion functions.',
  order: 3,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'ts-union-intersection',
      level: 'foundation',
      priority: 3,
      question: 'What are union and intersection types?',
      tags: ['union', 'intersection', 'type-sets'],
      answer: {
        interview: `**A union \`A | B\` is a value that is *either* A or B; an intersection \`A & B\` is a value that is *both* A and B at once.**

- Think in sets of values: a union is the set union (more values allowed), an intersection is the set intersection (fewer values, more guarantees).
- On a union you can only use members **common to all** members until you narrow it.
- For object types, \`A & B\` has the properties of both — used to combine shapes.
- For primitives, \`string & number\` is \`never\` — no value is both.
- \`unknown\` is the union of everything; \`never\` is the empty set.

Real-world: \`string | null\` for a nullable value; \`User & { token: string }\` for a logged-in user.`,
        explanationBn: `Type-কে **value-এর set** হিসেবে ভাবলে দুটোই পরিষ্কার:

- **Union \`A | B\`** — A-এর সব value **আর** B-এর সব value। Set বড় হয় → কোন value আসবে তা কম নিশ্চিত। তাই union-এর ওপর শুধু সেই কাজ করা যায়, যা দুই দিকেই বৈধ — নির্দিষ্ট কিছু করতে আগে narrow করতে হয়।
- **Intersection \`A & B\`** — যে value একসাথে A **এবং** B দুটোই। Set ছোট হয় → বেশি নিশ্চয়তা। Object-এর ক্ষেত্রে মানে দুটোর সব property একসাথে।

উল্টো মনে হতে পারে: union-এ property "কমে" (শুধু common গুলো ব্যবহারযোগ্য), intersection-এ property "বাড়ে"। কারণ set বড় হলে সবার জন্য সত্য কথা কমে যায়।

\`string & number\` — এমন কোনো value নেই যেটা একসাথে string আর number, তাই ফলাফল \`never\` (ফাঁকা set)।`,
        examples: [
          {
            lang: 'typescript',
            code: `type Id = string | number;
function formatId(id: Id) {
  // id.toUpperCase();  ❌ only members common to string and number are allowed
  return typeof id === "string" ? id.toUpperCase() : id.toFixed(0);
}

type HasName = { name: string };
type HasAge = { age: number };
const person: HasName & HasAge = { name: "Rafi", age: 30 };

type Impossible = string & number;           // never
const check: Impossible extends never ? true : false = true;

console.log(formatId("ab-1"), formatId(42.7), person, check);`,
            output: `AB-1 43 { name: 'Rafi', age: 30 } true`,
          },
        ],
        pitfalls: [
          'Union of object types does not let you read a property that only some members have.',
          'Intersecting object types with conflicting properties silently produces `never` properties.',
        ],
        followUps: ['Why is `string & number` `never`?', 'How do you narrow a union?'],
      },
      visualizationId: 'ts-type-sets',
      related: ['ts-type-narrowing', 'ts-any-unknown-never'],
    },
    {
      id: 'ts-type-narrowing',
      level: 'foundation',
      priority: 3,
      question: 'What is type narrowing? What are the ways to narrow a type?',
      tags: ['narrowing', 'typeof', 'instanceof', 'in-operator', 'control-flow-analysis'],
      answer: {
        interview: `**Narrowing is TypeScript refining a broad type (a union, \`unknown\`) to a more specific one inside a branch, based on runtime checks it understands — control-flow analysis.**

- \`typeof x === "string"\` — primitives.
- \`x instanceof Date\` — class instances.
- \`"swim" in pet\` — checks for a property.
- Equality / truthiness: \`x !== null\`, \`if (x)\`, \`switch (shape.kind)\`.
- Custom type guards (\`x is Fish\`) and assertion functions (\`asserts x is Fish\`).
- Early \`return\`/\`throw\` narrows the rest of the function, and \`Array.isArray\` narrows arrays.

Real-world: handling an API field that may be \`string | string[]\`: \`Array.isArray(v) ? v : [v]\`.`,
        explanationBn: `Union type-এর value দিয়ে নির্দিষ্ট কাজ করতে আগে প্রমাণ করতে হয় সেটা আসলে কোন type। TypeScript আপনার \`if\`, \`switch\`, \`return\` পড়ে বুঝে নেয় — প্রতিটা branch-এ value-টার type কী হতে পারে। একে বলে **control-flow analysis**।

উপায়গুলো:
- **\`typeof\`** — string, number, boolean-এর মতো primitive।
- **\`instanceof\`** — class থেকে তৈরি object (\`Date\`, \`Error\`)।
- **\`in\`** — নির্দিষ্ট property আছে কি না (\`"swim" in pet\`)।
- **তুলনা** — \`x !== null\`, \`switch (shape.kind)\`।
- **নিজের type guard** — যখন উপরের কোনোটা যথেষ্ট না।

Early return খুব কাজের: \`if (!user) return;\` — এর পরের পুরো function-এ TypeScript জানে \`user\` আছে।`,
        examples: [
          {
            lang: 'typescript',
            code: `class Fish { swim() { return "swims"; } }
class Bird { fly() { return "flies"; } }

function describe(x: string | number | Date | Fish | Bird | string[] | null): string {
  if (x === null) return "nothing";
  if (typeof x === "string") return \`text "\${x}"\`;
  if (typeof x === "number") return \`number \${x.toFixed(1)}\`;
  if (Array.isArray(x)) return \`list of \${x.length}\`;
  if (x instanceof Date) return \`year \${x.getUTCFullYear()}\`;
  if ("swim" in x) return x.swim();
  return x.fly();                                  // only Bird is left
}

for (const v of ["hi", 3, new Date(0), new Fish(), new Bird(), ["a"], null]) {
  console.log(describe(v));
}`,
            output: `text "hi"
number 3.0
year 1970
swims
flies
list of 1
nothing`,
          },
        ],
        pitfalls: [
          '`typeof null === "object"` — check for `null` before `typeof x === "object"`.',
          '`instanceof` does not work with interfaces or type aliases (they do not exist at runtime).',
          '`if (x)` also removes `0` and `""`.',
        ],
        followUps: [
          'What is a discriminated union?',
          'How do you write a custom type guard?',
          'Why does narrowing sometimes get lost inside a callback?',
        ],
      },
      visualizationId: 'ts-narrowing-flow',
      related: ['ts-union-intersection', 'ts-discriminated-unions', 'ts-type-predicates'],
    },
    {
      id: 'ts-union-common-members',
      level: 'foundation',
      priority: 2,
      question: 'Why can you only access some properties on a union of object types?',
      tags: ['union', 'property-access', 'narrowing', 'in-operator'],
      answer: {
        interview: `**Because the value could be any member of the union, TypeScript only allows properties that exist on *every* member; anything else needs narrowing first.**

- \`Cat | Dog\` exposes shared properties like \`name\`; \`bark()\` is rejected until you prove it is a \`Dog\`.
- Narrow with a discriminant property, \`in\`, \`instanceof\` or a type guard.
- Optional "maybe" properties on each member (\`bark?: () => void\`) are a workaround but lose precision.
- Calling a method that exists on all members with different signatures (e.g. on \`string[] | number[]\`) can also be restricted, because TypeScript must accept arguments valid for **all** signatures.

Real-world: an API returning \`Success | Failure\` — you can read \`status\` directly, but \`data\` only after checking it.`,
        explanationBn: `ধরুন \`pet: Cat | Dog\`। Compile time-এ TypeScript জানে না এটা আসলে কোনটা। \`pet.bark()\` লিখলে — যদি Cat হয়? Crash। তাই TypeScript শুধু সেই property দেয়, যেটা **দুজনেরই** আছে (\`name\`)।

\`bark\` ব্যবহার করতে আগে প্রমাণ দিতে হয় যে এটা Dog — \`"bark" in pet\`, বা একটা common \`kind\` field মিলিয়ে (discriminated union)। প্রমাণের পরে সেই branch-এ type সরু হয়ে যায়।

একটা সূক্ষ্ম জায়গা: \`string[] | number[]\`-এর ওপর \`filter\` বা \`push\` — দুটো array-তেই method আছে, কিন্তু argument-এর type আলাদা। TypeScript তখন এমন argument চায় যেটা দুই signature-এই বৈধ, তাই অনেক সময় অদ্ভুত error আসে।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface Cat { name: string; meow(): string }
interface Dog { name: string; bark(): string }

function speak(pet: Cat | Dog) {
  console.log(pet.name);                       // common: allowed
  // @ts-expect-error ❌ Property 'bark' does not exist on type 'Cat | Dog'.
  const unsafe = () => pet.bark();
  return "bark" in pet ? pet.bark() : pet.meow();
}

console.log(speak({ name: "Rex", bark: () => "Woof" }));
console.log(speak({ name: "Tom", meow: () => "Meow" }));`,
            output: `Rex
Woof
Tom
Meow`,
          },
        ],
        pitfalls: [
          'Adding every member’s properties as optional to one big type hides which combinations are valid.',
        ],
        followUps: [
          'What is a discriminated union, and why is it better than optional properties?',
        ],
      },
      related: ['ts-union-intersection', 'ts-discriminated-unions'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'ts-discriminated-unions',
      level: 'intermediate',
      priority: 3,
      question: 'What is a discriminated (tagged) union, and why is it useful?',
      tags: ['discriminated-unions', 'narrowing', 'exhaustiveness', 'state-modeling'],
      answer: {
        interview: `**A discriminated union is a union of object types that share a literal "tag" property (like \`kind\` or \`status\`); checking the tag narrows the whole object.**

- \`type State = { status: "loading" } | { status: "success"; data: User } | { status: "error"; error: string }\`.
- \`switch (state.status)\` narrows each case, so \`data\` is only accessible when status is \`"success"\`.
- Impossible states (\`loading\` with \`data\` *and* \`error\`) cannot even be represented — unlike one object with many optional fields.
- Add a \`never\` check in \`default\` for **exhaustiveness**: adding a new variant becomes a compile error everywhere it is not handled.

Real-world: Redux actions, API result states, form steps, and events are all modelled this way.`,
        explanationBn: `**সমস্যা:** request-এর অবস্থা একটা object-এ রাখলেন — \`{ loading: boolean; data?: User; error?: string }\`। এখন \`loading: true\` আর একই সাথে \`error\` আছে — এমন অসম্ভব অবস্থাও type অনুযায়ী বৈধ। আর \`data\` ব্যবহারের আগে প্রতিবার \`undefined\` চেক।

**সমাধান — discriminated union:** প্রতিটা অবস্থা আলাদা type, আর সবার একটা common literal field (\`status\`)। \`status\` মিলিয়ে দেখলেই TypeScript বুঝে যায় পুরো object-টা কোন আকারের:
- \`"success"\` হলে \`data\` নিশ্চিত আছে।
- \`"error"\` হলে \`error\` আছে।
- অসম্ভব combination type-এই লেখা যায় না।

**Exhaustiveness:** \`default\`-এ \`never\`-এ assign করলে, ভবিষ্যতে কেউ নতুন অবস্থা (\`"idle"\`) যোগ করে handle করতে ভুলে গেলে compile error। Bug আসার আগেই ধরা পড়ে।

এই pattern-কে বলে "make impossible states impossible" — TypeScript-এর সবচেয়ে শক্তিশালী নকশার কৌশলগুলোর একটা।`,
        examples: [
          {
            lang: 'typescript',
            code: `type RequestState =
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; error: string };

function render(state: RequestState): string {
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      return \`\${state.data.length} items\`;     // data exists only here
    case "error":
      return \`Failed: \${state.error}\`;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

console.log(render({ status: "loading" }));
console.log(render({ status: "success", data: ["a", "b"] }));
console.log(render({ status: "error", error: "timeout" }));`,
            output: `Loading...
2 items
Failed: timeout`,
          },
        ],
        pitfalls: [
          'The tag must be a literal type; `status: string` does not narrow anything.',
          'Destructuring the tag into a separate variable before the switch can lose narrowing in older TS versions.',
        ],
        followUps: [
          'How do you make a switch exhaustive?',
          'How would you model a multi-step form with a discriminated union?',
        ],
      },
      visualizationId: 'ts-narrowing-flow',
      related: ['ts-type-narrowing', 'ts-any-unknown-never', 'ts-union-common-members'],
    },
    {
      id: 'ts-type-predicates',
      level: 'intermediate',
      priority: 2,
      question: 'What is a user-defined type guard (`value is Type`), and when do you need one?',
      tags: ['type-guards', 'type-predicates', 'narrowing', 'filter'],
      answer: {
        interview: `**A type guard is a function returning a boolean whose return type is a predicate like \`value is User\`; when it returns \`true\`, TypeScript narrows the argument to that type.**

- Needed when built-in checks are not enough: validating \`unknown\` JSON, checking several properties, reusing a check.
- \`array.filter(isUser)\` narrows the resulting array type.
- Since TS 5.5, simple guards are **inferred**: \`arr.filter(x => x !== null)\` already returns \`T[]\`.
- The compiler trusts the predicate — if your check is wrong, the narrowing is wrong too.

Real-world: \`function isApiError(e: unknown): e is ApiError\` in a \`catch\` block.`,
        explanationBn: `কখনো কখনো \`typeof\` বা \`instanceof\` যথেষ্ট না — যেমন \`unknown\` data সত্যিই \`User\`-এর আকারের কি না দেখতে কয়েকটা property চেক করতে হয়। সেই চেক একটা function-এ রাখলে, সাধারণ \`boolean\` return type দিলে TypeScript কিছুই শেখে না।

**Type predicate** — return type-এ \`value is User\` লিখলে TypeScript বোঝে: "এই function \`true\` দিলে argument-টা User"। তারপর \`if (isUser(x))\`-এর ভেতরে \`x\` হয়ে যায় \`User\`।

\`filter\`-এর সাথে চমৎকার কাজ করে: \`items.filter(isUser)\` → \`User[]\`।

**সতর্কতা:** TypeScript আপনার function-এর ভেতরের যুক্তি যাচাই করে না — শুধু বিশ্বাস করে। চেক ভুল হলে narrowing-ও ভুল, অর্থাৎ এটা একরকম লুকানো assertion।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface User { id: number; name: string }

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" && value !== null &&
    typeof (value as User).id === "number" &&
    typeof (value as User).name === "string"
  );
}

const data: unknown = JSON.parse('[{"id":1,"name":"Rafi"},{"id":"x"},null]');
const users = (data as unknown[]).filter(isUser);        // User[]
console.log(users.map((u) => u.name.toUpperCase()));

const maybe = ["a", null, "b"];
const strings = maybe.filter((s) => s !== null);         // string[] (inferred guard, TS 5.5+)
console.log(strings.join("-"));`,
            output: `[ 'RAFI' ]
a-b`,
          },
        ],
        pitfalls: [
          'A wrong predicate lies to the compiler just like a bad `as`.',
          'For complex shapes, a schema library (zod, valibot) is safer than hand-written guards.',
        ],
        followUps: [
          'What is an assertion function?',
          'How do you validate API responses at runtime?',
        ],
      },
      related: ['ts-type-narrowing', 'ts-assertion-functions'],
    },
    {
      id: 'ts-catch-unknown',
      level: 'intermediate',
      priority: 2,
      question:
        'Why is the `catch` variable `unknown`, and how do you handle errors in a type-safe way?',
      tags: ['errors', 'unknown', 'catch', 'result-type'],
      answer: {
        interview: `**Because JavaScript can \`throw\` anything — strings, numbers, objects — so TypeScript (with \`useUnknownInCatchVariables\`, part of \`strict\`) types the caught value as \`unknown\`.**

- Narrow before use: \`if (err instanceof Error) err.message\`; otherwise convert with \`String(err)\`.
- A small helper \`getErrorMessage(err: unknown): string\` keeps catch blocks tidy.
- TypeScript has no checked exceptions — function types do not say what they throw.
- For expected failures, many teams return a **Result** type (\`{ ok: true; value } | { ok: false; error }\`) so the caller is forced to handle errors.

Real-world: wrapping \`JSON.parse\` or \`fetch\` in a function returning \`Result<T>\` instead of throwing.`,
        explanationBn: `JavaScript-এ \`throw "oops"\`, \`throw 42\`, \`throw { code: 1 }\` — সবই বৈধ। তাই \`catch (err)\`-এ \`err\` আসলে কী, কেউ নিশ্চিত না। আগে TypeScript এটাকে \`any\` ধরত — \`err.message\` লিখলে compile হতো, কিন্তু string throw হলে \`undefined\`। এখন strict mode-এ \`unknown\` — আগে চেক করতে বাধ্য।

**Pattern:** \`err instanceof Error\` হলে \`message\` পড়ো, না হলে \`String(err)\`।

**Result type:** TypeScript-এ function-এর type বলে না সে কোন error throw করতে পারে — তাই caller ভুলে যেতে পারে। প্রত্যাশিত ব্যর্থতার জন্য (invalid input, not found) error throw না করে value হিসেবে ফেরত দিলে, discriminated union caller-কে দুটো case-ই সামলাতে বাধ্য করে। Rust/Go থেকে আসা এই ধারণা TypeScript-এও জনপ্রিয়।`,
        examples: [
          {
            lang: 'typescript',
            code: `function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

for (const thrower of [() => { throw new Error("boom"); }, () => { throw "plain string"; }]) {
  try {
    thrower();
  } catch (err) {
    // err.message;  ❌ 'err' is of type 'unknown'.
    console.log(getErrorMessage(err));
  }
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };
function parseJson<T>(text: string): Result<T> {
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch (err) {
    return { ok: false, error: getErrorMessage(err) };
  }
}
const r = parseJson<{ a: number }>("{bad json");
console.log(r.ok ? r.value.a : "invalid: " + r.error.split(" ")[0]);`,
            output: `boom
plain string
invalid: Expected`,
          },
        ],
        pitfalls: [
          'Errors from other realms (iframes, some test runners) can fail `instanceof Error`.',
          'Casting `catch (err: any)` re-opens the hole that `unknown` closed.',
        ],
        followUps: ['When would you throw versus return a Result?'],
      },
      related: ['ts-any-unknown-never', 'ts-type-predicates'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'ts-assertion-functions',
      level: 'advanced',
      priority: 1,
      question: 'What is an assertion function (`asserts value is Type`)?',
      tags: ['assertion-functions', 'asserts', 'narrowing', 'invariants'],
      answer: {
        interview: `**An assertion function throws if a condition is false; its \`asserts\` return type tells TypeScript that, if it returns, the condition holds — so the rest of the scope is narrowed.**

- \`function assertIsDefined<T>(v: T): asserts v is NonNullable<T>\`.
- \`asserts condition\` (without \`is\`) works like Node’s \`assert(x)\`: after the call, \`condition\` is known to be true.
- Unlike a type guard, you don’t wrap code in an \`if\` — the narrowing applies to everything after the call.
- Assertion functions must be declared with an explicit type (a \`function\` declaration or an annotated const), otherwise TypeScript cannot use them.

Real-world: \`invariant(user, "user must be loaded")\` at the top of a function that requires a user.`,
        explanationBn: `Type guard (\`x is User\`) একটা boolean দেয় — narrowing পেতে \`if\`-এর ভেতরে থাকতে হয়। **Assertion function** উল্টো ভাবে কাজ করে: শর্ত মিথ্যা হলে **throw করে**, আর ফিরে এলে মানে শর্ত সত্য। তাই call-এর পরের পুরো code-এ TypeScript narrow type ব্যবহার করে — কোনো \`if\` লাগে না।

এটা "invariant" লেখার জন্য দারুণ — function-এর শুরুতে এক লাইনে পূর্বশর্ত ঘোষণা: "এখানে user থাকতেই হবে, না থাকলে এটা bug"।

একটা নিয়ম মনে রাখবেন: assertion function-এর type স্পষ্টভাবে declare করা থাকতে হয় (\`function\` declaration বা type দেওয়া const), না হলে TypeScript error দেয়।`,
        examples: [
          {
            lang: 'typescript',
            code: `function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new TypeError(\`Expected string, got \${typeof value}\`);
}

function shout(input: unknown, user: { name: string } | null) {
  assertIsString(input);
  assert(user, "user must be loaded");
  return \`\${user.name}: \${input.toUpperCase()}\`;   // both narrowed, no if needed
}

console.log(shout("hello", { name: "Rafi" }));
try { shout(42, null); } catch (e) { console.log((e as Error).message); }`,
            output: `Rafi: HELLO
Expected string, got number`,
          },
        ],
        pitfalls: [
          'An arrow function assigned to an unannotated `const` cannot be used as an assertion.',
          'Like type guards, the compiler trusts your implementation.',
        ],
        followUps: ['What is the difference between a type guard and an assertion function?'],
      },
      related: ['ts-type-predicates'],
    },
    {
      id: 'ts-narrowing-pitfalls',
      level: 'advanced',
      priority: 1,
      question: 'When does TypeScript lose (or wrongly keep) a narrowed type?',
      tags: ['narrowing', 'control-flow-analysis', 'callbacks', 'soundness'],
      answer: {
        interview: `**Narrowing is based on local control flow, so it can be lost across function boundaries — and, in the other direction, TypeScript assumes function calls do not change narrowed properties, which is not always true.**

- **Callbacks:** a narrowed \`let\` variable is widened again inside a closure if it is reassigned later (TS 5.4+ keeps it when there is no later assignment). Copy it to a \`const\` first.
- **Property narrowing after calls:** \`if (box.value) { reset(); box.value.length }\` compiles even if \`reset()\` set it to \`null\` — a known, intentional unsoundness.
- **Aliasing:** checks on one variable don’t narrow a different reference to the same object.
- Narrowing via a stored boolean (\`const isStr = typeof x === "string"\`) works since TS 4.4, but only for \`const\` and unmodified references.

Real-world: in React effects, \`const user = props.user\` before using it in an async callback.`,
        explanationBn: `Narrowing হলো TypeScript-এর "অনুমান" — সে code-এর প্রবাহ দেখে ধরে নেয় কোন জায়গায় value কী। দুই দিকে এই অনুমান ভুল হতে পারে:

**১. হারিয়ে যাওয়া (অতিরিক্ত সতর্ক):** callback পরে চলবে — ততক্ষণে \`let\` variable বদলে যেতে পারে। তাই পরে কোনো assignment থাকলে TypeScript callback-এর ভেতরে narrowing বাদ দেয়। সমাধান: \`const\`-এ কপি করে নিন।

**২. ভুলভাবে টিকে থাকা (unsound):** \`box.value\` চেক করার পরে একটা function call করলেন, যেটা \`box.value = null\` করে দেয়। TypeScript ধরে নেয় function call কিছু বদলায়নি (প্রতিটা call-এর পর সব narrowing বাদ দিলে ভাষাটা ব্যবহার অযোগ্য হতো)। ফলে compile হয়, কিন্তু runtime-এ crash — নিচের উদাহরণে ঠিক সেটাই।

শিক্ষা: TypeScript নিখুঁত না; mutable shared state থাকলে narrowing-এর ওপর অন্ধ বিশ্বাস করবেন না।`,
        examples: [
          {
            lang: 'typescript',
            code: `let current: string | null = "draft";
if (current !== null) {
  // @ts-expect-error ❌ 'current' is possibly 'null'.
  const later = () => current.length;      // reassigned below, so narrowing is dropped
  const snapshot = current;
  const safe = () => snapshot.length;      // const copy keeps the narrowing
  console.log(safe());
}
current = null;

const box: { value: string | null } = { value: "hello" };
const reset = () => { box.value = null; };
if (box.value !== null) {
  reset();
  console.log(box.value.length);           // compiles, but crashes at runtime
}`,
            output: `5
TypeError: Cannot read properties of null (reading 'length')`,
          },
        ],
        pitfalls: [
          'Do not trust narrowed object properties after calling code that might mutate them.',
          'Narrowing does not survive `await` boundaries for shared mutable state in practice, even if the compiler keeps it.',
        ],
        followUps: ['Why doesn’t TypeScript invalidate narrowing after every function call?'],
      },
      related: ['ts-type-narrowing'],
    },
    {
      id: 'ts-mutually-exclusive-props',
      level: 'advanced',
      priority: 1,
      question: 'How do you type "either A or B, but not both" props?',
      tags: ['unions', 'never', 'xor', 'api-design'],
      answer: {
        interview: `**Use a union where each member forbids the other’s keys with \`?: never\`: \`{ href: string; onClick?: never } | { onClick: () => void; href?: never }\`.**

- A plain union \`A | B\` still accepts an object with *both* sets of props (it is assignable to either member).
- \`key?: never\` means "this key must be absent (or \`undefined\`)", which makes the members mutually exclusive.
- A reusable helper: \`type XOR<A, B> = (A & { [K in Exclude<keyof B, keyof A>]?: never }) | (B & { [K in Exclude<keyof A, keyof B>]?: never })\`.
- Combine with a discriminant (\`kind\`) when the variants grow.

Real-world: a \`<Button>\` that is either a link (\`href\`) or an action (\`onClick\`), never both.`,
        explanationBn: `ধরুন একটা Button হয় link (\`href\`), নয়তো action (\`onClick\`) — দুটো একসাথে অর্থহীন। প্রথমে মনে হয় \`LinkProps | ActionProps\` যথেষ্ট। কিন্তু না: দুটো property-ই থাকা object দুই member-এর যেকোনোটার সাথে মেলে (বাড়তি property structural typing-এ সমস্যা না) — তাই union সেটা আটকায় না।

**কৌশল — \`?: never\`:** প্রতিটা member-এ অন্যটার key-কে \`never\` type-এর optional হিসেবে লিখি। \`never\` type-এর কোনো value হয় না, তাই key-টা **থাকতেই পারবে না**। এখন দুটো একসাথে দিলে কোনো member-এর সাথেই মেলে না → error।

বারবার লিখতে না হয় তাই \`XOR<A, B>\` helper — mapped type দিয়ে অন্যটার key গুলো স্বয়ংক্রিয়ভাবে \`never\` করে দেয়।`,
        examples: [
          {
            lang: 'typescript',
            code: `type LinkProps = { href: string; onClick?: never };
type ActionProps = { onClick: () => void; href?: never };
type ButtonProps = { label: string } & (LinkProps | ActionProps);

function describe(props: ButtonProps): string {
  return props.href !== undefined ? \`link to \${props.href}\` : \`action "\${props.label}"\`;
}

console.log(describe({ label: "Docs", href: "/docs" }));
console.log(describe({ label: "Save", onClick: () => {} }));

// @ts-expect-error ❌ is not assignable to type 'ButtonProps'.
const both: ButtonProps = { label: "?", href: "/x", onClick: () => {} };

type Loose = { label: string } & ({ href: string } | { onClick: () => void });
const accepted: Loose = { label: "?", href: "/x", onClick: () => {} };   // plain union allows both
console.log("href" in accepted && "onClick" in accepted);`,
            output: `link to /docs
action "Save"
true`,
          },
        ],
        pitfalls: [
          '`?: never` still allows an explicit `undefined` unless `exactOptionalPropertyTypes` is on.',
        ],
        followUps: ['How would you write a generic `XOR<A, B>` type?'],
      },
      related: ['ts-discriminated-unions', 'ts-union-common-members'],
    },
  ],
});

import { defineSection } from '../../define';

export const generics = defineSection({
  id: 'ts-generics',
  title: 'Generics',
  description:
    'Type parameters for reusable, type-safe code: generic functions, interfaces and classes, constraints, `keyof`, defaults, inference and variance.',
  order: 5,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'ts-generics-basics',
      level: 'foundation',
      priority: 3,
      question: 'What are generics, and why use them instead of `any`?',
      tags: ['generics', 'type-parameters', 'reusability', 'type-safety'],
      answer: {
        interview: `**Generics are type parameters: placeholders (\`<T>\`) filled in when a function, class or type is used, so one implementation works for many types while keeping the link between input and output types.**

- \`function first<T>(items: T[]): T | undefined\` — pass \`string[]\`, get \`string | undefined\`.
- With \`any\`, the output would be \`any\` and all checking after it is lost.
- \`T\` is usually **inferred** from the arguments; you can also pass it explicitly: \`first<number>([])\`.
- Built-ins are generic: \`Array<T>\`, \`Promise<T>\`, \`Map<K, V>\`, React’s \`useState<T>\`.
- Generics are a compile-time feature — erased at runtime like all types.

Real-world: \`async function get<T>(url: string): Promise<T>\` so callers say what shape they expect.`,
        explanationBn: `ধরুন একটা function array-র প্রথম element ফেরত দেয়। Type কী লিখবেন? \`number[]\` লিখলে শুধু number-এ কাজ করে। \`any[]\` লিখলে সব array নেয়, কিন্তু ফলাফলও \`any\` — এরপর আর কোনো type checking নেই।

**Generic** এই সমস্যার সমাধান: \`<T>\` একটা ফাঁকা ঘর, যেটা ব্যবহারের সময় পূরণ হয়। \`first(["a", "b"])\` ডাকলে TypeScript দেখে array-টা \`string[]\`, তাই \`T = string\`, ফলাফল \`string | undefined\`। একই function, প্রতিটা ব্যবহারে নির্ভুল type।

**\`any\` বনাম generic-এর মূল পার্থক্য:** দুটোই যেকোনো type নেয়, কিন্তু generic **input আর output-এর সম্পর্ক** মনে রাখে — "যা দেবে, সেই type-ই ফেরত পাবে"। \`any\` সব ভুলে যায়।

\`Array<T>\`, \`Promise<T>\`, \`Map<K, V>\` — আপনি প্রতিদিন generic ব্যবহার করছেন।`,
        examples: [
          {
            lang: 'typescript',
            code: `function firstAny(items: any[]): any { return items[0]; }
function first<T>(items: T[]): T | undefined { return items[0]; }

const a = firstAny(["x", "y"]);    // any — a typo like a.toUppercase() compiles
const b = first(["x", "y"]);       // string | undefined
const n = first([10, 20]);         // number | undefined

console.log(b?.toUpperCase(), (n ?? 0) + 1);
// @ts-expect-error ❌ Property 'toUppercase' does not exist on type 'string'. Did you mean 'toUpperCase'?
const typo = () => b?.toUppercase();

const ids = new Map<string, number>([["rafi", 1]]);
console.log(ids.get("rafi"));      // number | undefined`,
            output: `X 11
1`,
          },
        ],
        pitfalls: [
          'A type parameter used only once (e.g. only in the return type) is a disguised type assertion.',
          'Generics do not exist at runtime: you cannot write `new T()` or `typeof T`.',
        ],
        followUps: [
          'How do you restrict what types a generic accepts?',
          'Can you give an example of a generic you use every day?',
        ],
      },
      related: ['ts-generic-constraints', 'ts-generic-interfaces-classes'],
    },
    {
      id: 'ts-generic-interfaces-classes',
      level: 'foundation',
      priority: 2,
      question: 'How do you write generic interfaces, type aliases and classes?',
      tags: ['generics', 'interfaces', 'classes', 'api-types'],
      answer: {
        interview: `**Add type parameters after the name — \`interface ApiResponse<T>\`, \`type Pair<A, B>\`, \`class Cache<K, V>\` — and use them in members; consumers supply the types.**

- Generic interfaces model wrappers: \`ApiResponse<User>\`, \`Paginated<Product>\`.
- Generic classes keep member types consistent: a \`Cache<string, User>\` only stores users.
- Class type parameters are per **instance**; static members cannot use them.
- Type arguments for classes are inferred from the constructor when possible; otherwise pass them (\`new Cache<string, User>()\`).

Real-world: \`interface Paginated<T> { items: T[]; page: number; total: number }\` reused by every list endpoint.`,
        explanationBn: `Function-এর মতো interface, type আর class-ও generic হতে পারে। সবচেয়ে common ব্যবহার — **wrapper type**: API-র প্রতিটা response একই কাঠামোয় আসে (\`data\`, \`error\`, \`page\`), শুধু ভেতরের data আলাদা। একবার \`ApiResponse<T>\` লিখে \`ApiResponse<User>\`, \`ApiResponse<Product>\` — সব জায়গায় ব্যবহার।

Generic class (\`Cache<K, V>\`) প্রতিটা instance-এ নিজের type ঠিক করে। \`new Cache<string, User>()\` বানালে \`set\`-এ শুধু User বসানো যায়, \`get\` User ফেরত দেয়।

একটা সীমা: \`static\` member class-এর type parameter ব্যবহার করতে পারে না — কারণ static সব instance-এর জন্য একটাই, আর প্রতিটা instance-এর \`T\` আলাদা হতে পারে।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface Paginated<T> { items: T[]; page: number; total: number }
type Pair<A, B> = [first: A, second: B];

class Cache<K, V> {
  #store = new Map<K, V>();
  set(key: K, value: V) { this.#store.set(key, value); return this; }
  get(key: K): V | undefined { return this.#store.get(key); }
}

const users: Paginated<{ name: string }> = { items: [{ name: "Rafi" }], page: 1, total: 1 };
const entry: Pair<string, number> = ["age", 30];
const cache = new Cache<string, number>().set("a", 1);
// @ts-expect-error ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
cache.set("b", "two");

console.log(users.items[0]?.name, entry, cache.get("a"));`,
            output: `Rafi [ 'age', 30 ] 1`,
          },
        ],
        pitfalls: [
          '`static` members cannot reference class type parameters.',
          'Without arguments to infer from, `new Cache()` gives `Cache<unknown, unknown>`.',
        ],
        followUps: ['Can a type parameter have a default?'],
      },
      related: ['ts-generics-basics', 'ts-generic-defaults'],
    },
    {
      id: 'ts-promise-types',
      level: 'foundation',
      priority: 2,
      question: 'How do you type async functions and promises?',
      tags: ['promises', 'async-await', 'awaited', 'generics'],
      answer: {
        interview: `**An \`async\` function always returns \`Promise<T>\`, where \`T\` is what it \`return\`s; \`await\` unwraps \`Promise<T>\` to \`T\`.**

- Annotate as \`async function load(): Promise<User>\` — writing \`: User\` is an error.
- \`new Promise<T>((resolve) => ...)\` — the type argument types \`resolve\`.
- \`Awaited<T>\` unwraps (nested) promises at the type level: \`Awaited<ReturnType<typeof load>>\` → \`User\`.
- \`Promise.all\` keeps tuple types: \`await Promise.all([getUser(), getPosts()])\` → \`[User, Post[]]\`.
- Rejection values are not typed — a promise’s error is effectively \`unknown\`.

Real-world: \`async function fetchJson<T>(url: string): Promise<T>\` as the base of an API client.`,
        explanationBn: `\`async\` function সবসময় একটা Promise ফেরত দেয় — ভেতরে \`return user\` লিখলেও বাইরে আসে \`Promise<User>\`। তাই return type লিখতে হয় \`Promise<User>\`, শুধু \`User\` না।

\`await\` উল্টো কাজ করে: \`Promise<User>\` খুলে \`User\` দেয়।

কয়েকটা কাজের জিনিস:
- **\`Awaited<T>\`** — type স্তরে promise খোলা। একটা async function-এর ফলাফলের type বের করতে: \`Awaited<ReturnType<typeof fn>>\`।
- **\`Promise.all\`** — tuple-এর প্রতিটা অবস্থানের type আলাদাভাবে রাখে।
- **Error type নেই:** \`Promise<T>\`-এ শুধু সফল value-র type; reject হলে কী আসবে, TypeScript জানে না — তাই \`catch\`-এ \`unknown\`।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface User { id: number; name: string }

async function getUser(id: number): Promise<User> {
  return { id, name: "Rafi" };
}
const getCount = async () => 3;                       // inferred: () => Promise<number>

// @ts-expect-error ❌ The return type of an async function or method must be the global Promise<T> type.
async function wrong(): User { return { id: 1, name: "x" }; }

type Loaded = Awaited<ReturnType<typeof getUser>>;    // User

const [user, count] = await Promise.all([getUser(1), getCount()]);  // [User, number]
const copy: Loaded = { ...user };
console.log(copy.name, count + 1);`,
            output: `Rafi 4`,
          },
        ],
        pitfalls: [
          'Forgetting `await` gives you a `Promise<User>`, and `user.name` is a compile error — a useful one.',
          'A `.catch` handler receives `any` in older lib typings; treat it as `unknown`.',
        ],
        followUps: ['What does `Awaited<T>` do with nested promises?'],
      },
      related: ['ts-generics-basics'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'ts-generic-constraints',
      level: 'intermediate',
      priority: 3,
      question: 'What are generic constraints (`T extends ...`)?',
      tags: ['generics', 'constraints', 'extends', 'keyof'],
      answer: {
        interview: `**\`<T extends Shape>\` limits a type parameter to types assignable to \`Shape\`, which lets you safely use \`Shape\`’s members inside the function while still returning the caller’s exact type.**

- \`function longest<T extends { length: number }>(a: T, b: T): T\` works for strings, arrays, anything with \`length\`.
- Without the constraint, \`a.length\` is an error — \`T\` could be anything.
- The return type is the specific \`T\` (e.g. \`string[]\`), not the constraint — that’s the advantage over just typing the parameter as \`{ length: number }\`.
- Combine with \`keyof\`: \`<T, K extends keyof T>\` constrains one parameter by another.

Real-world: \`function sortBy<T extends object, K extends keyof T>(items: T[], key: K)\`.`,
        explanationBn: `Generic \`T\` মানে "যেকোনো type"। তাই function-এর ভেতরে \`T\`-এর ওপর প্রায় কিছুই করা যায় না — \`a.length\` লিখলে TypeScript বলে "T-তে length আছে কে বলল?"

**Constraint** শর্ত দেয়: \`T extends { length: number }\` — "T যা-ই হোক, তাতে অন্তত একটা number \`length\` থাকতে হবে"। এখন ভেতরে \`length\` ব্যবহার নিরাপদ, আর caller string, array — যেকোনো length-ওয়ালা জিনিস পাঠাতে পারে।

**কেন সরাসরি \`{ length: number }\` parameter না?** তাহলে return type-ও হতো \`{ length: number }\` — caller-এর আসল type (string বা array) হারিয়ে যেত। Generic constraint-এ return type থাকে **ঠিক caller-এর type** — string দিলে string ফেরত।`,
        examples: [
          {
            lang: 'typescript',
            code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

const word = longest("apple", "fig");        // string
const list = longest([1, 2], [3, 4, 5]);     // number[]
console.log(word.toUpperCase(), list.length);

// @ts-expect-error ❌ Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
longest(10, 20);

function bad<T>(value: T) {
  // value.length;  ❌ Property 'length' does not exist on type 'T'.
  return value;
}`,
            output: `APPLE 3`,
          },
        ],
        pitfalls: [
          'Constraining too tightly (`T extends string`) when a plain `string` parameter would do adds complexity for nothing.',
          'A constraint is an upper bound, not a default — `T` can still be a narrower type.',
        ],
        followUps: ['How do you constrain a key to the keys of another type parameter?'],
      },
      related: ['ts-generics-basics', 'ts-generic-keyof'],
    },
    {
      id: 'ts-generic-keyof',
      level: 'intermediate',
      priority: 2,
      question: 'How do you write a type-safe `getProperty(obj, key)` function?',
      tags: ['generics', 'keyof', 'indexed-access', 'constraints'],
      answer: {
        interview: `**Use two type parameters where the key is constrained to the object’s keys: \`function get<T, K extends keyof T>(obj: T, key: K): T[K]\`.**

- \`keyof T\` is the union of \`T\`’s property names; an invalid key becomes a compile error with autocomplete for valid ones.
- \`T[K]\` (indexed access) returns the exact type of that property — \`get(user, "age")\` is \`number\`, \`get(user, "name")\` is \`string\`.
- The same pattern types \`pluck\`, \`sortBy\`, \`groupBy\`, form field helpers and event maps.

Real-world: \`setField<K extends keyof FormState>(key: K, value: FormState[K])\` so each field only accepts its own value type.`,
        explanationBn: `লক্ষ্য: \`get(user, "name")\` লিখলে key ভুল হলে error, আর ফলাফলের type ঠিক সেই property-র type।

- **\`keyof T\`** — T-এর সব property-র নামের union: \`"id" | "name" | "age"\`।
- **\`K extends keyof T\`** — key হতে হবে এগুলোর একটা। ভুল key দিলে compile error, আর editor সঠিক key গুলো সাজেস্ট করে।
- **\`T[K]\`** — indexed access type: "T-এর K property-র type"। \`K = "age"\` হলে \`number\`।

কেন দুটো type parameter? কারণ return type key-র ওপর নির্ভর করে — প্রতিটা call-এ আলাদা K, আলাদা ফলাফল। শুধু \`key: keyof T\` লিখলে return type হতো সব property-র type-এর union।

এই pattern সব জায়গায়: form-এর \`setField(key, value)\` — প্রতিটা field শুধু নিজের type-এর value নেয়।`,
        examples: [
          {
            lang: 'typescript',
            code: `function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

interface User { id: number; name: string; tags: string[] }
const user: User = { id: 1, name: "Rafi", tags: ["admin"] };

const name = getProperty(user, "name");    // string
const tags = getProperty(user, "tags");    // string[]
console.log(name.toUpperCase(), tags.length);

// @ts-expect-error ❌ Argument of type '"email"' is not assignable to parameter of type 'keyof User'.
getProperty(user, "email");

function setField<K extends keyof User>(key: K, value: User[K]) { user[key] = value; }
setField("id", 2);
// @ts-expect-error ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
setField("id", "two");
console.log(user.id);`,
            output: `RAFI 1
two`,
          },
        ],
        pitfalls: [
          'The `setField("id", "two")` line above still ran: types only stop it at compile time.',
          'Calling with a key typed as `keyof User` (a union) widens the result to a union of all property types.',
        ],
        followUps: [
          'What is an indexed access type?',
          'How would you type a `pluck` function over an array?',
        ],
      },
      related: ['ts-generic-constraints'],
    },
    {
      id: 'ts-generic-inference',
      level: 'intermediate',
      priority: 2,
      question:
        'How does TypeScript infer generic type arguments, and when do you pass them explicitly?',
      tags: ['generics', 'inference', 'const-type-parameters', 'no-infer'],
      answer: {
        interview: `**TypeScript infers type arguments from the values passed at the call site; pass them explicitly only when there is nothing to infer from or inference picks the wrong type.**

- \`identity("a")\` infers \`T = string\`; with \`const\`-like contexts it may infer the literal \`"a"\`.
- No inference source → \`unknown\`: \`new Set()\` is \`Set<unknown>\`, so write \`new Set<string>()\`.
- Return-type-only generics (\`parse<T>(json): T\`) cannot be inferred — callers must pass \`T\` (and it’s really an assertion).
- \`const\` type parameters (TS 5.0, \`<const T>\`) infer literal/readonly types as if the caller wrote \`as const\`.
- \`NoInfer<T>\` (TS 5.4) stops a parameter from being used as an inference source.

Real-world: \`useState<User | null>(null)\` — without the explicit argument the state would be typed \`null\` forever.`,
        explanationBn: `বেশিরভাগ সময় generic-এর type লিখতে হয় না — argument দেখে TypeScript নিজে বের করে।

**কখন নিজে লিখতে হয়:**
- **কিছু থেকে infer করা যায় না:** \`new Set()\` — ভেতরে কী থাকবে বোঝার উপায় নেই, তাই \`unknown\`। লিখুন \`new Set<string>()\`।
- **Inference ভুল/সরু হয়:** React-এ \`useState(null)\` — state-এর type হয়ে যায় শুধু \`null\`, পরে user বসানো যায় না! তাই \`useState<User | null>(null)\`।

**\`const\` type parameter (TS 5.0):** \`<const T>\` লিখলে caller-কে \`as const\` লিখতে হয় না — literal type নিজেই আসে (\`["a", "b"]\` → \`readonly ["a", "b"]\`)।

**\`NoInfer<T>\` (TS 5.4):** কোনো parameter থেকে T বের করতে নিষেধ — যেমন default value যেন T-কে চওড়া না করে, বরং বাকি argument থেকে আসা T-এর সাথে মিলতে বাধ্য হয়।`,
        examples: [
          {
            lang: 'typescript',
            code: `function identity<T>(value: T): T { return value; }
const s = identity("hello");                   // T = string
const tags = new Set<string>();                // nothing to infer from: pass T

function routes<const T extends readonly string[]>(paths: T): T { return paths; }
const r = routes(["/home", "/about"]);         // readonly ["/home", "/about"]

function pick<T extends string>(options: T[], fallback: NoInfer<T>): T {
  return options[0] ?? fallback;
}
pick(["sm", "md"], "md");
// @ts-expect-error ❌ Argument of type '"xl"' is not assignable to parameter of type '"sm" | "md"'.
pick(["sm", "md"], "xl");

tags.add(s);
console.log([...tags], r[1]);`,
            output: `[ 'hello' ] /about`,
          },
        ],
        pitfalls: [
          'Explicitly passing some but not all type arguments is not allowed (no partial inference) unless the rest have defaults.',
          '`useState(null)` / `useRef(null)` without a type argument is a classic React + TS bug.',
        ],
        followUps: ['What problem does `NoInfer` solve?', 'What are `const` type parameters?'],
      },
      related: ['ts-generics-basics', 'ts-generic-defaults'],
    },
    {
      id: 'ts-generic-defaults',
      level: 'intermediate',
      priority: 1,
      question: 'What are default type parameters?',
      tags: ['generics', 'defaults', 'api-design'],
      answer: {
        interview: `**A type parameter can have a default (\`<T = string>\`) used when it is neither passed nor inferred — like a default function argument, but for types.**

- \`interface ApiResponse<T = unknown>\` — \`ApiResponse\` alone is valid and means \`ApiResponse<unknown>\`.
- Defaults can reference earlier parameters: \`<T, K extends keyof T = keyof T>\`.
- Parameters with defaults must come after required ones.
- Defaults make generic types easier to use in the common case without losing flexibility.

Real-world: \`EventEmitter<Events = Record<string, unknown[]>>\`, React’s \`ComponentProps\`, Express’s \`Request<Params = {}, ...>\`.`,
        explanationBn: `Function parameter-এর default (\`name = "guest"\`) যেমন, type parameter-এরও default থাকতে পারে: \`<T = unknown>\`। ব্যবহারকারী type না দিলে বা infer না হলে default বসে।

কেন কাজের? Library-র generic type-এ অনেক সময় ৩-৪টা type parameter থাকে (Express-এর \`Request\`-এ পাঁচটা!)। Default থাকলে সাধারণ ব্যবহারে শুধু \`Request\` লিখলেই চলে, আর দরকার হলে নির্দিষ্টটা বদলানো যায়।

নিয়ম: default-ওয়ালা parameter required গুলোর পরে আসবে, আর default আগের parameter ব্যবহার করতে পারে।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface ApiResponse<T = unknown, E = string> {
  data?: T;
  error?: E;
}

const plain: ApiResponse = { data: 42 };                 // T = unknown
const typed: ApiResponse<{ id: number }> = { data: { id: 7 } };

// plain.data.toFixed();  ❌ 'plain.data' is of type 'unknown'.
console.log(typed.data?.id, typeof plain.data);

class Store<State = { count: number }> {
  constructor(public state: State) {}
}
console.log(new Store({ count: 1 }).state.count);`,
            output: `7 number
1`,
          },
        ],
        pitfalls: [
          'A default does not constrain: `<T = string>` still accepts any `T` passed explicitly — add `extends` for that.',
        ],
        followUps: ['What is the difference between a constraint and a default?'],
      },
      related: ['ts-generic-interfaces-classes', 'ts-generic-inference'],
    },
    {
      id: 'ts-generics-vs-unions',
      level: 'intermediate',
      priority: 1,
      question: 'When should you use a generic, and when is a union or a plain type better?',
      tags: ['generics', 'unions', 'api-design', 'best-practices'],
      answer: {
        interview: `**Use a generic when a type parameter *relates* two or more places (input to output, parameter to parameter); if it appears only once, a plain type or union is simpler.**

- "Rule of two": a type parameter should appear at least twice in the signature.
- \`function len<T extends string | unknown[]>(x: T): number\` → just write \`(x: string | unknown[]): number\`.
- Generics that only appear in the return type (\`get<T>(): T\`) are unchecked assertions in disguise.
- Too many type parameters make errors unreadable; push complexity into named helper types.

Real-world: \`map<T, U>(arr: T[], fn: (x: T) => U): U[]\` needs generics; \`printId(id: string | number)\` does not.`,
        explanationBn: `Generic ক্ষমতাশালী, কিন্তু সব জায়গায় দরকার নেই। প্রশ্ন একটাই: **type parameter কি দুটো জায়গাকে জুড়ছে?**

- \`map<T, U>(arr: T[], fn: (x: T) => U): U[]\` — T জুড়ছে array আর callback-এর input, U জুড়ছে callback-এর output আর ফলাফল। Generic অপরিহার্য।
- \`len<T extends string | unknown[]>(x: T): number\` — T শুধু একবার আছে, কিছু জুড়ছে না। এটা শুধু জটিলতা; সরাসরি union লিখুন।

**"Rule of two":** type parameter signature-এ অন্তত দুবার না থাকলে সম্ভবত দরকার নেই।

বিশেষ করে সাবধান: \`fetchJson<T>(): Promise<T>\` — T শুধু return-এ। কোনো যাচাই নেই — caller যা বলবে TypeScript তাই মেনে নেবে। এটা আসলে একটা লুকানো \`as\`।`,
        examples: [
          {
            lang: 'typescript',
            code: `// Needed: T and U connect the array, the callback and the result
function mapAll<T, U>(items: T[], fn: (item: T) => U): U[] {
  return items.map(fn);
}

// Not needed: a union says the same thing more simply
function describe(id: string | number): string {
  return \`id:\${id}\`;
}

// Disguised assertion: nothing checks that the JSON is really T
function parse<T>(json: string): T { return JSON.parse(json); }
const user = parse<{ name: string }>('{"nmae":"typo"}');

console.log(mapAll([1, 2], (n) => n * 2), describe(7), user.name);`,
            output: `[ 2, 4 ] id:7 undefined`,
          },
        ],
        pitfalls: ['Return-type-only generics give a false sense of safety.'],
        followUps: ['How would you make `parse<T>` actually safe?'],
      },
      related: ['ts-generics-basics', 'ts-union-intersection'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'ts-variance',
      level: 'advanced',
      priority: 1,
      question: 'What are covariance and contravariance, and how do they apply to TypeScript?',
      tags: ['variance', 'covariance', 'contravariance', 'strict-function-types', 'soundness'],
      answer: {
        interview: `**Variance describes how subtyping of a type’s parts carries over to the whole: covariant if it goes the same direction (\`Dog[]\` → \`Animal[]\`), contravariant if it reverses (a handler of \`Animal\` can be used as a handler of \`Dog\`).**

- Return types and readonly data are **covariant**: a function returning \`Dog\` can stand in for one returning \`Animal\`.
- Parameters are **contravariant** under \`strictFunctionTypes\`: \`(a: Animal) => void\` is assignable to \`(d: Dog) => void\`, not the reverse.
- **Method** parameters (method shorthand syntax) are checked **bivariantly** for compatibility with existing code — a deliberate unsoundness.
- Mutable arrays are treated covariantly, which is unsound: you can push a \`Cat\` into an \`Animal[]\` alias of a \`Dog[]\`.
- TS 4.7 added explicit variance annotations (\`in\`, \`out\`) on type parameters.

Real-world: why an event handler typed for a specific event can’t be passed where a handler for *any* event is expected.`,
        explanationBn: `**Covariance (একই দিকে):** Dog যদি Animal-এর subtype হয়, তাহলে "Dog ফেরত দেয় এমন function" "Animal ফেরত দেয় এমন function"-এর জায়গায় চলে — Dog তো Animal-ই। Output-এর দিকে subtype নিরাপদ।

**Contravariance (উল্টো দিকে):** Parameter-এ উল্টো। "যেকোনো Animal সামলাতে পারে এমন handler" Dog-handler-এর জায়গায় নিরাপদ (Dog-ও তো Animal)। কিন্তু "শুধু Dog সামলাতে পারে এমন handler"-কে Animal-handler বানালে কেউ Cat পাঠাবে — handler \`bark()\` ডাকবে, crash। \`strictFunctionTypes\` এটা আটকায়।

**TypeScript-এর ইচ্ছাকৃত ফাঁক:**
- Method syntax (\`handle(d: Dog): void\`) দিয়ে লেখা parameter দুই দিকেই মেনে নেয় (bivariant) — পুরনো code ভাঙা এড়াতে।
- Mutable array covariant ধরা হয় — \`Dog[]\`-কে \`Animal[]\` হিসেবে নিয়ে Cat push করা যায়; নিচের উদাহরণে runtime-এ dogs array-তে বিড়াল ঢুকে যায়।

Interview-তে এটা জানা দেখায় আপনি type system-কে গভীরভাবে বোঝেন।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface Animal { name: string }
interface Dog extends Animal { bark(): string }
interface Cat extends Animal { meow(): string }

let handleAnimal = (a: Animal) => a.name;
let handleDog = (d: Dog) => d.bark();

handleDog = handleAnimal;                  // OK: contravariant parameters
// @ts-expect-error ❌ Type '(d: Dog) => string' is not assignable to type '(a: Animal) => string'.
handleAnimal = handleDog;

const dogs: Dog[] = [{ name: "Rex", bark: () => "Woof" }];
const animals: Animal[] = dogs;            // arrays are (unsoundly) covariant
const tom: Cat = { name: "Tom", meow: () => "Meow" };
animals.push(tom);
console.log(dogs.length, dogs.map((d) => d.name));
console.log(typeof dogs[1]?.bark);         // a "Dog" without bark()`,
            output: `2 [ 'Rex', 'Tom' ]
undefined`,
          },
        ],
        pitfalls: [
          'Method-shorthand signatures (`handle(x: T): void`) are bivariant; property-style (`handle: (x: T) => void`) are checked strictly.',
          'Prefer `readonly T[]` parameters — readonly arrays are safely covariant.',
        ],
        followUps: [
          'Why are method parameters bivariant?',
          'What do `in` and `out` variance annotations do?',
        ],
      },
      related: ['ts-generics-basics', 'ts-function-types'],
    },
    {
      id: 'ts-extends-meanings',
      level: 'intermediate',
      priority: 2,
      question: 'What are the different meanings of `extends` in TypeScript?',
      tags: ['extends', 'generics', 'conditional-types', 'interfaces'],
      answer: {
        interview: `**\`extends\` means "is assignable to / is a subtype of" everywhere, but it appears in three different roles.**

1. **Inheritance** — \`interface Admin extends User\`, \`class Dog extends Animal\`: build a subtype from a base.
2. **Generic constraint** — \`<T extends { id: string }>\`: \`T\` must be assignable to that shape.
3. **Conditional type** — \`T extends string ? A : B\`: a compile-time *test* of assignability.

Reading tip: in all three, "A extends B" means every A is a B (A is the narrower set). In a conditional type it can also introduce \`infer\` variables and distribute over unions.

Real-world: \`function save<T extends Entity>(item: T): T extends Draft ? Pending : Saved\` uses two of the meanings in one signature.`,
        explanationBn: `একই keyword, তিন জায়গায় তিন কাজ — কিন্তু মূল অর্থ একটাই: **"A extends B" মানে A-কে B-এর জায়গায় বসানো যায় (A ছোট set, B বড় set)।**

1. **Inheritance (interface/class):** \`Admin extends User\` — Admin হলো User-এর সব কিছু + আরও। নতুন subtype **তৈরি** করা।
2. **Generic constraint:** \`<T extends HasId>\` — T যা-ই হোক, অন্তত HasId হতেই হবে। একটা **শর্ত চাপানো**।
3. **Conditional type:** \`T extends string ? A : B\` — "T কি string-এ বসে?" — একটা **প্রশ্ন করা**, উত্তর অনুযায়ী type বেছে নেওয়া।

পার্থক্য মনে রাখার উপায়: প্রথমটা তৈরি করে, দ্বিতীয়টা বাধ্য করে, তৃতীয়টা পরীক্ষা করে।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface Entity { id: string }
interface User extends Entity { name: string }                 // 1. inheritance

function byId<T extends Entity>(items: T[], id: string): T | undefined {   // 2. constraint
  return items.find((item) => item.id === id);
}

type Label<T> = T extends User ? \`user:\${T["name"]}\` : "entity";  // 3. conditional
type A = Label<{ id: "1"; name: "Rafi" }>;                       // "user:Rafi"
type B = Label<{ id: "2" }>;                                      // "entity"

const users: User[] = [{ id: "1", name: "Rafi" }];
const a: A = "user:Rafi";
const b: B = "entity";
console.log(byId(users, "1")?.name, a, b);
// @ts-expect-error ❌ Type 'number' is not assignable to type 'Entity'.
byId([1, 2], "1");`,
            output: `Rafi user:Rafi entity`,
          },
        ],
        pitfalls: [
          '`T extends U` in a conditional type distributes over unions when `T` is a naked type parameter.',
        ],
        followUps: ['What is a distributive conditional type?'],
      },
      related: ['ts-generic-constraints', 'ts-conditional-types', 'ts-extends-vs-intersection'],
    },
    {
      id: 'ts-generator-types',
      level: 'intermediate',
      priority: 1,
      question: 'How do you type generators and iterators?',
      tags: ['generators', 'iterators', 'iterable', 'generics'],
      answer: {
        interview: `**A generator function returns \`Generator<Yield, Return, Next>\`: the type of values it yields, the value it finally returns, and the type \`next(value)\` sends in.**

- Usually only the yield type matters: \`function* ids(): Generator<number>\` (Return and Next default to \`any\`/\`unknown\`-like defaults).
- \`Iterable<T>\` describes anything usable in \`for...of\`/spread; \`IterableIterator<T>\` is both iterable and an iterator.
- Accept \`Iterable<T>\` in function parameters to support arrays, Sets, Maps and generators at once.
- Async generators return \`AsyncGenerator<T>\` and are consumed with \`for await\`.

Real-world: a paginated API helper \`async function* pages<T>(url): AsyncGenerator<T[]>\` that fetches lazily.`,
        explanationBn: `Generator-এর type-এ তিনটা অংশ: \`Generator<Yield, Return, Next>\`।
- **Yield** — প্রতিবার \`yield\` কী দেয়।
- **Return** — শেষে \`return\` কী দেয়।
- **Next** — বাইরে থেকে \`next(x)\` দিয়ে ভেতরে কী পাঠানো যায় (\`yield\` expression-এর value)।

বেশিরভাগ সময় শুধু প্রথমটা লাগে: \`Generator<number>\`।

**\`Iterable<T>\` parameter-এ দারুণ:** \`sum(values: Iterable<number>)\` লিখলে array, Set, generator — সবকিছু পাঠানো যায়, কারণ সবাই \`for...of\` চুক্তি মানে। শুধু \`number[]\` লিখলে Set পাঠানো যেত না।

Async generator (\`async function*\`) — \`for await\` দিয়ে পড়া হয়, page-by-page API data আনার জন্য উপযুক্ত।`,
        examples: [
          {
            lang: 'typescript',
            code: `function* countdown(from: number): Generator<number, string, boolean | undefined> {
  for (let i = from; i > 0; i--) {
    const skip = yield i;                  // value passed to next()
    if (skip) i--;
  }
  return "liftoff";
}

const gen = countdown(5);
console.log(gen.next().value, gen.next(true).value, gen.next().value);
console.log([...countdown(2)]);

function sum(values: Iterable<number>): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}
console.log(sum([1, 2]), sum(new Set([3, 4])), sum(countdown(3)));`,
            output: `5 3 2
[ 2, 1 ]
3 7 6`,
          },
        ],
        pitfalls: [
          'The return value is not included when spreading or using `for...of` — only yielded values are.',
        ],
        followUps: ['How would you type an async generator that paginates an API?'],
      },
      related: ['ts-generics-basics', 'ts-promise-types'],
    },
  ],
});

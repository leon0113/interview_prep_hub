import type { Exercise } from '../schema';

export const exercises: Exercise[] = [
  {
    id: 'ts-ex-generic-stack',
    title: 'Generic Stack<T>',
    level: 'foundation',
    category: 'implementation',
    tags: ['generics', 'classes', 'data-structures'],
    prompt: `Implement a type-safe \`Stack<T>\` class with:

- \`push(item: T): void\`
- \`pop(): T | undefined\` — removes and returns the top item
- \`peek(): T | undefined\` — returns the top item without removing it
- a \`size\` getter and \`isEmpty(): boolean\`

A \`Stack<number>\` must reject \`push("x")\` at compile time, and callers must not be able to reach the underlying array.`,
    examples: [
      { input: 'push(1), push(2), push(3), pop()', output: '3' },
      { input: 'peek() after that', output: '2', note: 'peek does not remove the item' },
      { input: 'pop() on an empty stack', output: 'undefined' },
    ],
    hints: [
      'Declare the class with a type parameter: `class Stack<T> { ... }` and store the items in a `T[]`.',
      'An empty stack has nothing to return — model that honestly in the return type with `T | undefined`.',
      'Hide the array with `#items` (true runtime privacy) or `private items` (compile-time only).',
    ],
    solutions: [
      {
        label: 'Class with #private field',
        code: `class Stack<T> {
  #items: T[] = [];

  push(item: T): void {
    this.#items.push(item);
  }

  pop(): T | undefined {
    return this.#items.pop();
  }

  peek(): T | undefined {
    return this.#items.at(-1);
  }

  get size(): number {
    return this.#items.length;
  }

  isEmpty(): boolean {
    return this.#items.length === 0;
  }
}`,
        complexity: { time: 'O(1) per operation', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.pop());
console.log(stack.peek());
console.log(stack.size, stack.isEmpty());

const names = new Stack<string>();
console.log(names.pop(), names.isEmpty());

// @ts-expect-error ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
const rejected = () => stack.push("x");`,
      output: `3
2
2 false
undefined true`,
    },
    explanationBn: `Stack হলো LIFO (Last In, First Out) — যেটা সবার শেষে ঢোকে সেটাই সবার আগে বের হয়, থালার স্তূপের মতো।

এখানে মূল বিষয় **generic**। \`class Stack<T>\`-এর \`T\` হলো একটা type parameter — একটা ফাঁকা ঘর, যেটা পূরণ হয় ব্যবহারের সময়। \`new Stack<number>()\` লিখলে class-এর ভেতরের সব \`T\` হয়ে যায় \`number\`: \`push\` শুধু number নেয়, \`pop\` ফেরত দেয় \`number | undefined\`। একই class দিয়ে \`Stack<string>\` বা \`Stack<User>\`-ও বানানো যায় — code একবারই লেখা, অথচ type safety পুরোপুরি বজায় থাকে। \`any[]\` ব্যবহার করলে এই নিরাপত্তাটাই হারিয়ে যেত।

Return type-এ \`| undefined\` রাখাটা ইচ্ছাকৃত: খালি stack থেকে \`pop\` করলে ফেরত দেওয়ার মতো কিছু থাকে না, আর type সেই সত্যিটা লুকায় না। ফলে caller-কে বাধ্য হয়ে খালি থাকার case-টা সামলাতে হয়।

\`#items\` হলো JavaScript-এর আসল private field — runtime-এও class-এর বাইরে থেকে এটা ছোঁয়া যায় না। TypeScript-এর \`private\` keyword শুধু compile time-এ আটকায়; compile হওয়ার পর সেটা সাধারণ property হয়ে যায়।`,
  },
  {
    id: 'ts-ex-typed-pick',
    title: 'Type-safe pick and omit',
    level: 'foundation',
    category: 'implementation',
    tags: ['generics', 'keyof', 'utility-types', 'objects'],
    prompt: `Write \`pick(obj, keys)\` and \`omit(obj, keys)\` with precise types:

- \`pick(user, ["id", "name"])\` must return \`Pick<User, "id" | "name">\`,
- \`omit(user, ["password"])\` must return \`Omit<User, "password">\`,
- passing a key that does not exist on the object must be a **compile error**.`,
    examples: [
      {
        input: 'pick({ id: 1, name: "Rafi", password: "x" }, ["id", "name"])',
        output: '{ id: 1, name: "Rafi" }',
      },
      { input: 'omit(user, ["password"])', output: '{ id: 1, name: "Rafi" }' },
    ],
    hints: [
      'Two type parameters: the object type `T` and the keys `K extends keyof T`.',
      'Take the keys as `K[]` (or `readonly K[]`) so `K` is inferred as a union of literals.',
      'The return types are exactly `Pick<T, K>` and `Omit<T, K>`; building the object needs one assertion, because TypeScript cannot follow a loop that adds keys.',
    ],
    solutions: [
      {
        label: 'Loop + assertion',
        code: `function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const key of keys) out[key] = obj[key];
  return out;
}

function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const out = { ...obj };
  for (const key of keys) delete out[key];
  return out;
}`,
        complexity: { time: 'O(k) / O(n)', space: 'O(k) / O(n)' },
      },
      {
        label: 'Object.fromEntries',
        code: `function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((k) => [k, obj[k]])) as Pick<T, K>;
}

function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const drop = new Set<PropertyKey>(keys);
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !drop.has(k))) as Omit<T, K>;
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `const user = { id: 1, name: "Rafi", password: "secret" };

const view = pick(user, ["id", "name"]);   // { id: number; name: string }
const safe = omit(user, ["password"]);     // { id: number; name: string }
console.log(view, safe);
console.log("password" in safe, view.name.toUpperCase());

// @ts-expect-error ❌ Type '"email"' is not assignable to type '"id" | "name" | "password"'.
const typo = () => pick(user, ["email"]);`,
      output: `{ id: 1, name: 'Rafi' } { id: 1, name: 'Rafi' }
false RAFI`,
    },
    explanationBn: `এই exercise-এর আসল পরীক্ষা runtime logic না (সেটা সহজ), **type signature**।

\`<T extends object, K extends keyof T>\` — দুটো type parameter: object-এর type আর key-গুলোর type। \`K extends keyof T\` নিশ্চিত করে যে শুধু বিদ্যমান key দেওয়া যাবে; ভুল key দিলে compile error, আর editor সঠিক key সাজেস্ট করে।

\`keys: readonly K[]\` — array থেকে TypeScript \`K\`-কে literal-এর union হিসেবে infer করে (\`"id" | "name"\`), তাই return type \`Pick<T, "id" | "name">\` — একদম নির্ভুল।

**Assertion কেন লাগল?** খালি \`{}\` থেকে loop-এ key যোগ করে object বানালে TypeScript বুঝতে পারে না যে শেষে সব key এসে গেছে। তাই একবার \`as Pick<T, K>\` — কিন্তু সেটা function-এর ভেতরে, ছোট আর নিয়ন্ত্রিত জায়গায়; বাইরে caller পুরো type safety পায়। ভালো generic utility লেখার এটাই সাধারণ pattern।`,
  },
  {
    id: 'ts-ex-type-guard',
    title: 'Validate unknown data with a type guard',
    level: 'foundation',
    category: 'language-feature',
    tags: ['type-guards', 'unknown', 'narrowing', 'validation'],
    prompt: `An API returns \`unknown\` JSON. Write a type guard \`isProduct(value: unknown): value is Product\` for

\`\`\`ts
interface Product { id: number; title: string; price: number; tags: string[] }
\`\`\`

Then write \`parseProducts(json: string): Product[]\` that keeps only the valid items of a JSON array (and returns \`[]\` if the JSON is not an array).`,
    examples: [
      {
        input: '[{"id":1,"title":"Pen","price":2,"tags":[]}, {"id":"2"}]',
        output: 'one valid Product',
      },
    ],
    hints: [
      'Start with `typeof value === "object" && value !== null` — `typeof null` is `"object"`.',
      'To read properties of an `object`, use the `in` operator: after `"id" in value`, TypeScript knows `value.id` exists (as `unknown`).',
      'For `tags`, check `Array.isArray` and that every element is a string.',
      '`array.filter(isProduct)` narrows the result to `Product[]`.',
    ],
    solutions: [
      {
        label: 'in-operator narrowing',
        code: `interface Product { id: number; title: string; price: number; tags: string[] }

function isProduct(value: unknown): value is Product {
  return (
    typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "number" &&
    "title" in value && typeof value.title === "string" &&
    "price" in value && typeof value.price === "number" && value.price >= 0 &&
    "tags" in value && Array.isArray(value.tags) &&
    value.tags.every((t: unknown) => typeof t === "string")
  );
}

function parseProducts(json: string): Product[] {
  const data: unknown = JSON.parse(json);
  return Array.isArray(data) ? data.filter(isProduct) : [];
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `const json = JSON.stringify([
  { id: 1, title: "Pen", price: 2.5, tags: ["office"] },
  { id: "2", title: "Book", price: 10, tags: [] },
  { id: 3, title: "Bag", price: -1, tags: [] },
  null,
  { id: 4, title: "Lamp", price: 30, tags: ["home", 7] },
]);

const products = parseProducts(json);
console.log(products.map((p) => p.title.toUpperCase()));
console.log(parseProducts('{"not": "an array"}'));`,
      output: `[ 'PEN' ]
[]`,
    },
    explanationBn: `**\`unknown\` থেকে নির্দিষ্ট type-এ যাওয়ার নিরাপদ পথ।**

ধাপগুলো:
1. **\`typeof value === "object" && value !== null\`** — object কি না। \`null\` আলাদা করে বাদ দিতে হয়, কারণ \`typeof null\` হলো \`"object"\`।
2. **\`"id" in value\`** — TypeScript 4.9 থেকে \`in\` চেকের পরে \`value.id\` পড়া যায় (type \`unknown\`)। তারপর \`typeof value.id === "number"\` দিয়ে সেটাকেও narrow করি। কোনো \`as\` লাগে না!
3. **Array-র ভেতরের element** — \`tags\` array কি না, আর প্রতিটা string কি না।

Return type \`value is Product\` — \`true\` দিলে TypeScript ধরে নেয় value-টা Product। \`data.filter(isProduct)\` তাই \`Product[]\` দেয়।

Sample-এ পাঁচটার মধ্যে শুধু Pen বৈধ: Book-এর id string, Bag-এর price ঋণাত্মক (business rule), null, আর Lamp-এর tags-এ একটা number।

বাস্তবে বড় type-এর জন্য হাতে লেখা guard-এর বদলে zod-এর মতো schema library — কিন্তু interview-তে নিজে লিখতে পারা দেখায় আপনি narrowing বোঝেন।`,
  },
  {
    id: 'ts-ex-typed-group-by',
    title: 'Generic groupBy',
    level: 'intermediate',
    category: 'hashing',
    tags: ['generics', 'record', 'property-key', 'arrays'],
    prompt: `Write a generic \`groupBy(items, keyFn)\`:

\`\`\`ts
groupBy<T, K extends PropertyKey>(items: readonly T[], keyFn: (item: T) => K): Partial<Record<K, T[]>>
\`\`\`

The key type must be inferred from \`keyFn\` — e.g. a key function returning \`"even" | "odd"\` should give a result with exactly those optional keys.`,
    examples: [
      {
        input: 'groupBy([1, 2, 3, 4], n => (n % 2 ? "odd" : "even"))',
        output: '{ odd: [1, 3], even: [2, 4] }',
      },
    ],
    hints: [
      '`PropertyKey` is `string | number | symbol` — everything that can be an object key.',
      'Why `Partial<Record<K, T[]>>`? A group only exists if at least one item produced that key.',
      'Inside, start from `{}` typed as the return type and use `(out[key] ??= []).push(item)`.',
    ],
    solutions: [
      {
        label: 'reduce-free loop',
        code: `function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyFn: (item: T) => K,
): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {};
  for (const item of items) {
    (out[keyFn(item)] ??= []).push(item);
  }
  return out;
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Map, then fromEntries',
        code: `function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyFn: (item: T) => K,
): Partial<Record<K, T[]>> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return Object.fromEntries(groups) as Partial<Record<K, T[]>>;
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `const parity = groupBy([1, 2, 3, 4, 5], (n) => (n % 2 ? "odd" : "even"));
console.log(parity, parity.odd?.length);
// @ts-expect-error ❌ Property 'prime' does not exist on type 'Partial<Record<"odd" | "even", number[]>>'.
parity.prime;

interface Task { title: string; status: "todo" | "done" }
const tasks: Task[] = [
  { title: "Write tests", status: "done" },
  { title: "Ship", status: "todo" },
  { title: "Review", status: "done" },
];
const byStatus = groupBy(tasks, (t) => t.status);
console.log(byStatus.done?.map((t) => t.title), byStatus.todo?.length);`,
      output: `{ odd: [ 1, 3, 5 ], even: [ 2, 4 ] } 3
[ 'Write tests', 'Review' ] 1`,
    },
    explanationBn: `JavaScript-এর groupBy-কে type দেওয়া — দুটো type parameter:
- **\`T\`** — item-এর type, array থেকে infer হয়।
- **\`K extends PropertyKey\`** — key-এর type, \`keyFn\`-এর return থেকে infer হয়। \`PropertyKey\` মানে \`string | number | symbol\` — object key হতে পারে এমন সবকিছু।

Key function \`"odd" | "even"\` ফেরত দিলে \`K = "odd" | "even"\`, আর ফলাফলে ঠিক এই দুটো key — ভুল key (\`parity.prime\`) compile error।

**\`Partial\` কেন?** সব key-র group থাকবেই এমন নিশ্চয়তা নেই — কোনো task "todo" না থাকলে \`todo\` key-ই তৈরি হবে না। \`Partial\` সেই সত্যিটা type-এ বলে, তাই caller \`byStatus.todo?.length\` লিখতে বাধ্য। (ES2024-এর built-in \`Object.groupBy\`-ও ঠিক এই type ফেরত দেয়।)

\`(out[key] ??= []).push(item)\` — group না থাকলে খালি array বসায়, তারপর push।`,
  },
  {
    id: 'ts-ex-utility-types',
    title: 'Implement the built-in utility types',
    level: 'intermediate',
    category: 'language-feature',
    tags: ['utility-types', 'mapped-types', 'conditional-types', 'infer'],
    prompt: `Without using the built-ins, implement:

\`MyPartial<T>\`, \`MyRequired<T>\`, \`MyReadonly<T>\`, \`MyPick<T, K>\`, \`MyOmit<T, K>\`, \`MyRecord<K, V>\`, \`MyExclude<T, U>\`, \`MyReturnType<F>\` and \`MyAwaited<T>\`.

Each must be **identical** to the built-in version for the test cases (the sample run proves it with compile-time equality checks).`,
    examples: [
      { input: 'MyPick<{ a: 1; b: 2 }, "a">', output: '{ a: 1 }' },
      { input: 'MyExclude<"a" | "b" | "c", "a">', output: '"b" | "c"' },
    ],
    hints: [
      'Partial / Required / Readonly are mapped types over `keyof T` with `?`, `-?` and `readonly` modifiers.',
      'Pick maps over `K` (constrained by `keyof T`); Omit can be built from Pick and Exclude.',
      'Exclude is a distributive conditional type: `T extends U ? never : T`.',
      'ReturnType and Awaited use `infer` inside a conditional type; Awaited is recursive.',
    ],
    solutions: [
      {
        label: 'Mapped + conditional types',
        code: `type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyExclude<T, U> = T extends U ? never : T;
type MyOmit<T, K extends PropertyKey> = MyPick<T, MyExclude<keyof T, K>>;
type MyRecord<K extends PropertyKey, V> = { [P in K]: V };
type MyReturnType<F extends (...args: any) => any> = F extends (...args: any) => infer R ? R : never;
type MyAwaited<T> = T extends PromiseLike<infer V> ? MyAwaited<V> : T;`,
        complexity: { time: 'compile time only', space: 'compile time only' },
      },
    ],
    sampleRun: {
      code: `type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;

interface User { id: number; name?: string; readonly email: string }
const fetchUser = async () => ({ id: 1 });

type _checks = [
  Assert<Equal<MyPartial<User>, Partial<User>>>,
  Assert<Equal<MyRequired<User>, Required<User>>>,
  Assert<Equal<MyReadonly<User>, Readonly<User>>>,
  Assert<Equal<MyPick<User, "id" | "email">, Pick<User, "id" | "email">>>,
  Assert<Equal<MyOmit<User, "email">, Omit<User, "email">>>,
  Assert<Equal<MyRecord<"a" | "b", number>, Record<"a" | "b", number>>>,
  Assert<Equal<MyExclude<"a" | "b" | "c", "a">, Exclude<"a" | "b" | "c", "a">>>,
  Assert<Equal<MyReturnType<typeof fetchUser>, ReturnType<typeof fetchUser>>>,
  Assert<Equal<MyAwaited<Promise<Promise<string>>>, Awaited<Promise<Promise<string>>>>>,
];

// @ts-expect-error ❌ Type '"nope"' does not satisfy the constraint 'keyof User'.
type BadPick = MyPick<User, "nope">;

const draft: MyPartial<User> = { name: "Rafi" };
console.log("all 9 utility types match the built-ins", draft);`,
      output: `all 9 utility types match the built-ins { name: 'Rafi' }`,
    },
    explanationBn: `এই exercise-এর পুরোটাই compile time-এ — runtime-এ শুধু একটা লাইন প্রিন্ট হয়। আসল পরীক্ষা হলো \`Equal\` check গুলো compile হয় কি না।

**Mapped type দিয়ে (object-এর আকার বদলানো):**
- \`MyPartial\` — প্রতিটা key-তে \`?\`।
- \`MyRequired\` — \`-?\` দিয়ে optional সরানো।
- \`MyReadonly\` — \`readonly\` যোগ।
- \`MyPick\` — \`keyof T\`-এর বদলে শুধু \`K\`-এর ওপর loop।
- \`MyRecord\` — key-এর union-এর ওপর loop, সব value একই type।

**Conditional type দিয়ে:**
- \`MyExclude\` — distributive: union-এর প্রতিটা সদস্য U-তে পড়লে \`never\` (বাদ), নইলে রাখো।
- \`MyOmit\` — "সব key থেকে K বাদ দিয়ে Pick" — দুটো utility জোড়া।
- \`MyReturnType\` — \`infer R\` দিয়ে function-এর return অংশ ধরা।
- \`MyAwaited\` — promise হলে ভেতরটা নিয়ে **আবার নিজেকে** ডাকা (recursive), যতক্ষণ না promise শেষ হয়।

**\`Equal\` কৌশল:** সাধারণ \`A extends B\` দিয়ে দুটো type সমান কি না ঠিকভাবে বোঝা যায় না (optional/readonly modifier-এ ফাঁকি থাকে)। Generic function-এর তুলনার এই কৌশলটা type-level test library গুলো (\`type-fest\`, \`expect-type\`) ব্যবহার করে।`,
  },
  {
    id: 'ts-ex-cart-reducer',
    title: 'Exhaustive reducer with a discriminated union',
    level: 'intermediate',
    category: 'implementation',
    tags: ['discriminated-unions', 'reducers', 'never', 'immutability'],
    prompt: `Model shopping-cart actions as a discriminated union and write a pure \`cartReducer(state, action)\`:

- \`{ type: "add"; item: { id: string; price: number } }\` — add one, or increment quantity if present,
- \`{ type: "remove"; id: string }\`,
- \`{ type: "setQty"; id: string; qty: number }\` — \`qty <= 0\` removes the line,
- \`{ type: "clear" }\`.

Never mutate the state. Make the \`switch\` exhaustive so a new action type is a compile error until it is handled.`,
    examples: [{ input: 'add pen, add pen, add book', output: 'pen ×2, book ×1' }],
    hints: [
      'Each action variant has a literal `type` field — that is the discriminant.',
      'Return new arrays/objects: `map`, `filter` and spread instead of `push` or assignment.',
      'In `default`, assign `action` to a `never` variable.',
      'Mark the state `readonly` so accidental mutations are compile errors.',
    ],
    solutions: [
      {
        label: 'switch + never',
        code: `interface Line { readonly id: string; readonly price: number; readonly qty: number }
type CartState = readonly Line[];

type CartAction =
  | { type: "add"; item: { id: string; price: number } }
  | { type: "remove"; id: string }
  | { type: "setQty"; id: string; qty: number }
  | { type: "clear" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.find((l) => l.id === action.item.id);
      return existing
        ? state.map((l) => (l === existing ? { ...l, qty: l.qty + 1 } : l))
        : [...state, { ...action.item, qty: 1 }];
    }
    case "remove":
      return state.filter((l) => l.id !== action.id);
    case "setQty":
      return action.qty <= 0
        ? state.filter((l) => l.id !== action.id)
        : state.map((l) => (l.id === action.id ? { ...l, qty: action.qty } : l));
    case "clear":
      return [];
    default: {
      const unhandled: never = action;
      throw new Error(\`Unknown action: \${JSON.stringify(unhandled)}\`);
    }
  }
}`,
        complexity: { time: 'O(n) per action', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `const actions: CartAction[] = [
  { type: "add", item: { id: "pen", price: 2 } },
  { type: "add", item: { id: "pen", price: 2 } },
  { type: "add", item: { id: "book", price: 15 } },
  { type: "setQty", id: "book", qty: 3 },
  { type: "remove", id: "pen" },
];

const initial: CartState = [];
const final = actions.reduce(cartReducer, initial);
const total = final.reduce((sum, l) => sum + l.price * l.qty, 0);

console.log(final, total, initial.length);
console.log(cartReducer(final, { type: "setQty", id: "book", qty: 0 }));
// @ts-expect-error ❌ Type '"discount"' is not assignable to type '"add" | "remove" | "setQty" | "clear"'.
const unknownAction: CartAction = { type: "discount" };`,
      output: `[ { id: 'book', price: 15, qty: 3 } ] 45 0
[]`,
    },
    explanationBn: `Redux বা React-এর \`useReducer\` — দুটোতেই এই pattern।

**Discriminated union:** প্রতিটা action-এর একটা literal \`type\` field। \`switch (action.type)\`-এর প্রতিটা \`case\`-এ TypeScript জানে action-টা কোন আকারের — \`"add"\`-এ \`action.item\` আছে, \`"remove"\`-এ \`action.id\`। ভুল field পড়তে গেলে compile error।

**Exhaustive:** \`default\`-এ \`const unhandled: never = action\`। সব case সামলানো হলে এখানে action-এর type \`never\` — কোনো সমস্যা নেই। কেউ নতুন action (\`"applyCoupon"\`) যোগ করে case লিখতে ভুলে গেলে এখানে compile error আসবে।

**Immutability:** reducer কখনো পুরনো state বদলায় না — \`map\`, \`filter\`, spread দিয়ে নতুন array/object। \`readonly\` type দেওয়ায় ভুল করে \`state.push\` লিখলে compile error। Sample-এর শেষে \`initial.length\` এখনো 0 — মূল state অক্ষত।

\`actions.reduce(cartReducer, initial)\` — reducer-এর নাম এখান থেকেই: action-এর তালিকাকে একটা state-এ "reduce" করা।`,
  },
  {
    id: 'ts-ex-result-type',
    title: 'A Result type for errors without exceptions',
    level: 'intermediate',
    category: 'implementation',
    tags: ['result-type', 'discriminated-unions', 'error-handling', 'generics'],
    prompt: `Implement a small Result toolkit:

\`\`\`ts
type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };
\`\`\`

- helpers \`ok(value)\` and \`err(error)\`,
- \`map(result, fn)\` — transform the value of a success, pass failures through,
- \`parseAge(input: string): Result<number>\` — fails for non-integers and values outside 0–150.

Callers must not be able to read \`.value\` without checking \`.ok\` first.`,
    examples: [
      { input: 'parseAge("42")', output: '{ ok: true, value: 42 }' },
      { input: 'parseAge("abc")', output: '{ ok: false, error: "not a number" }' },
    ],
    hints: [
      'The `ok` field is the discriminant — use literal types `true` and `false`.',
      'Give `ok` and `err` precise return types so the literals don’t widen to `boolean`.',
      '`map` is generic in both the input value type and the output value type.',
    ],
    solutions: [
      {
        label: 'Discriminated union',
        code: `type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

function parseAge(input: string): Result<number> {
  const n = Number(input);
  if (input.trim() === "" || Number.isNaN(n)) return err("not a number");
  if (!Number.isInteger(n)) return err("must be a whole number");
  if (n < 0 || n > 150) return err("out of range");
  return ok(n);
}`,
        complexity: { time: 'O(1)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `for (const input of ["42", "abc", "4.5", "200"]) {
  const r = parseAge(input);
  console.log(input, "→", r.ok ? \`age \${r.value}\` : \`error: \${r.error}\`);
}

const nextYear = map(parseAge("29"), (age) => age + 1);
console.log(nextYear);
console.log(map(parseAge("-1"), (age) => age + 1));

const unchecked = parseAge("7");
// @ts-expect-error ❌ Property 'value' does not exist on type 'Result<number, string>'.
const leak = () => unchecked.value;`,
      output: `42 → age 42
abc → error: not a number
4.5 → error: must be a whole number
200 → error: out of range
{ ok: true, value: 30 }
{ ok: false, error: 'out of range' }`,
    },
    explanationBn: `TypeScript-এ function-এর type বলে না সেটা কী error throw করতে পারে। ফলে caller \`try/catch\` ভুলে যায়। **Result type** error-কে **return value**-এর অংশ বানায় — type নিজেই বলে "ব্যর্থও হতে পারি"।

**গঠন:** \`ok: true\` হলে \`value\`, \`ok: false\` হলে \`error\` — discriminated union। \`.ok\` চেক না করে \`.value\` পড়লে compile error (sample-এর শেষ লাইন)। ব্যর্থতা ভুলে যাওয়ার কোনো উপায় নেই।

**\`ok\` / \`err\` helper-এর \`never\`:** \`ok(5)\`-এর type \`Result<number, never>\` — error কখনো হবে না, তাই \`never\`। যেহেতু \`never\` সব type-এ assign করা যায়, এটা যেকোনো \`Result<number, E>\`-এ মিলে যায়। এভাবে helper গুলো সব জায়গায় ব্যবহারযোগ্য।

**\`map\`:** সফল হলে value বদলাও, ব্যর্থ হলে error যেমন আছে তেমন পার করে দাও। এভাবে কয়েকটা ধাপ জুড়ে দেওয়া যায় — প্রতিটা ধাপে আলাদা if লাগে না।

কখন Result, কখন throw? প্রত্যাশিত ব্যর্থতা (ভুল input, not found) — Result। অপ্রত্যাশিত bug বা system failure — throw।`,
  },
  {
    id: 'ts-ex-typed-debounce',
    title: 'Debounce that preserves argument types',
    level: 'intermediate',
    category: 'implementation',
    tags: ['generics', 'parameters', 'debounce', 'higher-order-functions'],
    prompt: `Write \`debounce(fn, wait)\` in TypeScript so that the returned function accepts **exactly the same parameters** as \`fn\` (checked at compile time) and has a \`cancel()\` method. Do not use \`any\` in the public signature.`,
    examples: [
      {
        input: 'debounce((query: string, page: number) => ..., 50)',
        output: 'a function taking (query: string, page: number)',
      },
    ],
    hints: [
      'Make the function generic over its argument tuple: `<Args extends unknown[]>(fn: (...args: Args) => void, wait: number)`.',
      'Alternatively take `F extends (...args: never[]) => unknown` and use `Parameters<F>`.',
      'Describe the return type as an intersection: `((...args: Args) => void) & { cancel(): void }`.',
      '`ReturnType<typeof setTimeout>` types the timer id in both Node and browsers.',
    ],
    solutions: [
      {
        label: 'Generic argument tuple',
        code: `type Debounced<Args extends unknown[]> = ((...args: Args) => void) & { cancel(): void };

function debounce<Args extends unknown[]>(fn: (...args: Args) => void, wait: number): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  return Object.assign(debounced, { cancel: () => clearTimeout(timer) });
}`,
        complexity: { time: 'O(1) per call', space: 'O(1)' },
      },
      {
        label: 'Parameters<F>',
        code: `function debounce<F extends (...args: never[]) => unknown>(fn: F, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  function debounced(...args: Parameters<F>): void {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}`,
        complexity: { time: 'O(1) per call', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `const search = debounce((query: string, page: number) => {
  console.log(\`searching "\${query}" page \${page}\`);
}, 50);

search("t", 1);
setTimeout(() => search("ty", 1), 10);
setTimeout(() => search("typescript", 2), 20);
setTimeout(() => search("cancelled", 1), 200);
setTimeout(() => search.cancel(), 210);
setTimeout(() => console.log("done"), 400);

// @ts-expect-error ❌ Argument of type 'number' is not assignable to parameter of type 'string'.
const wrong = () => search(42, 1);`,
      output: `searching "typescript" page 2
done`,
    },
    explanationBn: `JavaScript debounce লেখা সহজ; TypeScript-এ চ্যালেঞ্জ হলো **ফেরত দেওয়া function যেন মূল function-এর মতোই parameter নেয়** — \`any\` দিলে সেই নিরাপত্তা হারায়।

**Solution ১ — argument tuple generic:** \`Args extends unknown[]\` — function-এর parameter গুলো একটা tuple type হিসেবে ধরা হয় (\`[query: string, page: number]\`)। ফেরত দেওয়া function-ও \`(...args: Args)\` — হুবহু একই।

**Solution ২ — \`Parameters<F>\`:** পুরো function type \`F\` নিয়ে \`Parameters<F>\` দিয়ে parameter tuple বের করা। Constraint-এ \`never[]\` কেন, \`any[]\` না? \`(...args: never[]) => unknown\`-এ যেকোনো function বসে (parameter contravariance), আর কোনো \`any\` লাগে না।

**\`cancel\` method যোগ করা:** function-ও object, তাই property বসানো যায়। Type-এ intersection দিয়ে বলি: "এটা callable, আবার এতে \`cancel\`-ও আছে"। \`Object.assign\` বা সরাসরি \`debounced.cancel = ...\` (TypeScript function declaration-এ property যোগ করা বোঝে)।

**\`ReturnType<typeof setTimeout>\`** — Node-এ timer id একটা object, browser-এ number; এভাবে লিখলে দুই জায়গাতেই ঠিক।`,
  },
  {
    id: 'ts-ex-linked-list',
    title: 'Generic, iterable LinkedList<T>',
    level: 'intermediate',
    category: 'implementation',
    tags: ['generics', 'classes', 'iterators', 'data-structures'],
    prompt: `Implement \`LinkedList<T>\` with \`append(value)\`, \`prepend(value)\`, \`remove(value): boolean\`, a \`size\` getter, and make it **iterable** so \`[...list]\` and \`for...of\` work. Also add a static \`from<T>(iterable: Iterable<T>)\` factory.`,
    examples: [{ input: 'LinkedList.from([1, 2, 3]).prepend(0)', output: '[0, 1, 2, 3]' }],
    hints: [
      'Use a private `Node<T>` type: `{ value: T; next: Node<T> | null }`.',
      'Keep both `head` and `tail` so `append` is O(1).',
      'Implement `*[Symbol.iterator](): Iterator<T>` as a generator that walks the nodes.',
      'Static methods cannot use the class’s `T` — give `from` its own type parameter.',
    ],
    solutions: [
      {
        label: 'Head + tail with a generator',
        code: `interface ListNode<T> { value: T; next: ListNode<T> | null }

class LinkedList<T> implements Iterable<T> {
  #head: ListNode<T> | null = null;
  #tail: ListNode<T> | null = null;
  #size = 0;

  static from<U>(items: Iterable<U>): LinkedList<U> {
    const list = new LinkedList<U>();
    for (const item of items) list.append(item);
    return list;
  }

  get size(): number { return this.#size; }

  append(value: T): this {
    const node: ListNode<T> = { value, next: null };
    if (this.#tail) this.#tail.next = node;
    else this.#head = node;
    this.#tail = node;
    this.#size++;
    return this;
  }

  prepend(value: T): this {
    this.#head = { value, next: this.#head };
    this.#tail ??= this.#head;
    this.#size++;
    return this;
  }

  remove(value: T): boolean {
    let prev: ListNode<T> | null = null;
    for (let node = this.#head; node; prev = node, node = node.next) {
      if (node.value !== value) continue;
      if (prev) prev.next = node.next;
      else this.#head = node.next;
      if (node === this.#tail) this.#tail = prev;
      this.#size--;
      return true;
    }
    return false;
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let node = this.#head; node; node = node.next) yield node.value;
  }
}`,
        complexity: { time: 'append/prepend O(1), remove O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `const list = LinkedList.from([1, 2, 3]).prepend(0).append(4);
console.log([...list], list.size);

console.log(list.remove(4), list.remove(0), list.remove(99));
list.append(5);                                  // tail was updated by remove(4)
console.log([...list], list.size);

const words = new LinkedList<string>().append("type").append("script");
let joined = "";
for (const w of words) joined += w;
console.log(joined, Math.max(...list));
// @ts-expect-error ❌ Argument of type 'number' is not assignable to parameter of type 'string'.
words.append(1);`,
      output: `[ 0, 1, 2, 3, 4 ] 5
true true false
[ 1, 2, 3, 5 ] 4
typescript 5`,
    },
    explanationBn: `তিনটা TypeScript ধারণা একসাথে:

**১. Generic class:** \`LinkedList<T>\` — প্রতিটা node-এর value \`T\`। \`new LinkedList<string>()\`-এ number append করলে compile error।

**২. Iterable protocol:** \`*[Symbol.iterator]()\` একটা generator — head থেকে শুরু করে প্রতিটা node-এর value \`yield\` করে। এটা থাকলেই \`for...of\`, spread (\`[...list]\`), \`Math.max(...list)\` সব কাজ করে। \`implements Iterable<T>\` TypeScript-কে দিয়ে চুক্তিটা যাচাই করায়।

**৩. Static generic:** \`static from<U>\` — static method class-এর \`T\` ব্যবহার করতে পারে না (static তো কোনো নির্দিষ্ট instance-এর না), তাই নিজের type parameter \`U\`।

**Linked list-এর খুঁটিনাটি:** \`tail\` রাখায় শেষে যোগ O(1)। \`remove\`-এ সবচেয়ে সহজে ভুল হয় tail আপডেট — শেষ node সরালে tail-কে আগের node-এ সরাতে হয়, নইলে পরের append হারিয়ে যায়। Sample-এ \`remove(4)\`-এর পর \`append(5)\` সেটাই পরীক্ষা করে।

\`append\` আর \`prepend\`-এর return type \`this\` — chaining (\`.prepend(0).append(4)\`)।`,
  },
  {
    id: 'ts-ex-typed-event-emitter',
    title: 'Strongly typed event emitter',
    level: 'advanced',
    category: 'implementation',
    tags: ['generics', 'keyof', 'mapped-types', 'events'],
    prompt: `Write \`TypedEmitter<Events>\` where \`Events\` maps event names to argument tuples, e.g.

\`\`\`ts
type AppEvents = { login: [user: string]; logout: []; error: [code: number, message: string] };
\`\`\`

- \`on(event, listener)\` returns an unsubscribe function; the listener’s parameters are inferred from the event,
- \`emit(event, ...args)\` only accepts the right arguments for that event,
- unknown event names are compile errors.`,
    examples: [
      {
        input: 'bus.emit("error", 500, "Server down")',
        output: 'listeners receive (code: number, message: string)',
      },
    ],
    hints: [
      'Constrain the map: `Events extends Record<string, unknown[]>`.',
      'Method signatures: `on<E extends keyof Events>(event: E, listener: (...args: Events[E]) => void)`.',
      'Store listeners in a `Map<keyof Events, Set<Function>>`; a small internal type assertion is acceptable — the public API stays fully typed.',
    ],
    solutions: [
      {
        label: 'Generic class over an event map',
        code: `type Listener<Args extends unknown[]> = (...args: Args) => void;

class TypedEmitter<Events extends Record<string, unknown[]>> {
  #listeners = new Map<keyof Events, Set<Listener<any>>>();

  on<E extends keyof Events>(event: E, listener: Listener<Events[E]>): () => void {
    let set = this.#listeners.get(event);
    if (!set) this.#listeners.set(event, (set = new Set()));
    set.add(listener);
    return () => set.delete(listener);
  }

  emit<E extends keyof Events>(event: E, ...args: Events[E]): boolean {
    const set = this.#listeners.get(event);
    if (!set?.size) return false;
    for (const listener of [...set]) listener(...args);
    return true;
  }
}`,
        complexity: { time: 'emit O(listeners)', space: 'O(listeners)' },
      },
    ],
    sampleRun: {
      code: `type AppEvents = {
  login: [user: string];
  logout: [];
  error: [code: number, message: string];
};

const bus = new TypedEmitter<AppEvents>();
const stop = bus.on("login", (user) => console.log("welcome", user.toUpperCase()));
bus.on("error", (code, message) => console.log(\`error \${code}: \${message}\`));

bus.emit("login", "rafi");
bus.emit("error", 503, "Service unavailable");
stop();
console.log(bus.emit("login", "nadia"), bus.emit("logout"));

// @ts-expect-error ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
const wrongArgs = () => bus.emit("error", "503", "wrong type");
// @ts-expect-error ❌ Argument of type '"signup"' is not assignable to parameter of type 'keyof AppEvents'.
bus.on("signup", () => {});`,
      output: `welcome RAFI
error 503: Service unavailable
false false`,
    },
    explanationBn: `**মূল ধারণা — event map:** একটা type, যেখানে প্রতিটা event-এর নাম তার argument-এর tuple-এর সাথে জোড়া। পুরো emitter এই একটা type থেকে সব জানে।

**\`on<E extends keyof Events>\`** — event-এর নাম শুধু map-এর key গুলোর একটা। তারপর listener-এর type \`(...args: Events[E]) => void\` — indexed access দিয়ে ওই event-এর tuple বের করা। তাই \`bus.on("error", (code, message) => ...)\`-এ \`code\` নিজে থেকেই \`number\`, \`message\` \`string\` — কোনো annotation লাগে না।

**\`emit(event, ...args: Events[E])\`** — rest parameter হিসেবে tuple: \`"logout"\`-এ কোনো argument না, \`"error"\`-এ ঠিক দুটো, সঠিক type-এ।

**ভেতরের \`any\`:** Map-এ বিভিন্ন event-এর listener একসাথে থাকে, যাদের type আলাদা — একটা Map type-এ এটা প্রকাশ করা যায় না। তাই ভেতরে একটা ছোট \`any\`, কিন্তু public API (\`on\`, \`emit\`) পুরোপুরি typed। এটা TypeScript library-গুলোর সাধারণ কৌশল: জটিলতা ভেতরে লুকাও, বাইরে নিখুঁত type দাও।

Copy-র ওপর loop (\`[...set]\`) — emit চলাকালীন কেউ unsubscribe করলেও loop নিরাপদ।`,
  },
  {
    id: 'ts-ex-deep-readonly',
    title: 'DeepReadonly type and a matching deepFreeze',
    level: 'advanced',
    category: 'language-feature',
    tags: ['recursive-types', 'mapped-types', 'conditional-types', 'immutability'],
    prompt: `1. Write a type \`DeepReadonly<T>\` that makes every nested property readonly, turns arrays into \`ReadonlyArray\`, and leaves functions and primitives unchanged.
2. Write \`deepFreeze<T>(obj: T): DeepReadonly<T>\` that also freezes the object **at runtime**, recursively.`,
    examples: [
      {
        input: 'deepFreeze({ server: { ports: [80, 443] } })',
        output: 'server.ports.push(8080) is a compile error and throws at runtime',
      },
    ],
    hints: [
      'Check functions first: `T extends (...args: any[]) => unknown ? T : ...` — functions are objects too.',
      'Arrays: `T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : ...`.',
      'Objects: a mapped type with `readonly` that recurses into each property.',
      'At runtime: freeze children first (`Object.values`), then the object itself; skip values that are already frozen to handle shared references.',
    ],
    solutions: [
      {
        label: 'Recursive conditional type',
        code: `type DeepReadonly<T> =
  T extends (...args: any[]) => unknown ? T
  : T extends readonly (infer U)[] ? readonly DeepReadonly<U>[]
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}`,
        complexity: { time: 'O(n) nodes', space: 'O(depth)' },
      },
    ],
    sampleRun: {
      code: `"use strict";
const config = deepFreeze({
  server: { host: "localhost", ports: [80, 443] },
  log: (msg: string) => \`[log] \${msg}\`,
});

console.log(config.server.ports.join(","), config.log("ready"));
// @ts-expect-error ❌ Property 'push' does not exist on type 'readonly number[]'.
const add = () => config.server.ports.push(8080);
// @ts-expect-error ❌ Cannot assign to 'host' because it is a read-only property.
const rename = () => (config.server.host = "example.com");

for (const attempt of [add, rename]) {
  try {
    attempt();
  } catch (e) {
    console.log((e as Error).name);
  }
}
console.log(Object.isFrozen(config.server.ports), config.server.host);`,
      output: `80,443 [log] ready
TypeError
TypeError
true localhost`,
    },
    explanationBn: `**Compile time আর runtime — দুই স্তরেই নিরাপত্তা।**

**\`DeepReadonly<T>\` — ক্রম গুরুত্বপূর্ণ:**
1. **Function আগে** — function-ও object! আগে না ধরলে mapped type function-কে property-র object বানিয়ে ফেলত, আর call করা যেত না।
2. **Array** — \`infer U\` দিয়ে element type ধরে \`readonly DeepReadonly<U>[]\` — \`push\`/\`sort\` উধাও, আর ভেতরের element-ও deep readonly।
3. **Object** — mapped type, প্রতিটা property readonly আর recursive।
4. **বাকি সব (primitive)** — যেমন আছে।

**\`deepFreeze\`:** \`Object.freeze\` shallow, তাই আগে প্রতিটা child-কে recursively freeze, তারপর নিজেকে। \`Object.isFrozen\` চেক দুই কাজ করে: একই object দুই জায়গায় থাকলে দুবার কাজ হয় না, আর circular reference-এ অসীম loop হয় না।

Sample-এ \`@ts-expect-error\` দেখায় compiler আটকাচ্ছে; আর জোর করে চালালে (strict mode-এ) runtime-এও \`TypeError\` — দুই স্তরের সুরক্ষা। \`as DeepReadonly<T>\` একমাত্র assertion — freeze করার পরে value আসলেই সেই type, compiler শুধু সেটা প্রমাণ করতে পারে না।`,
  },
  {
    id: 'ts-ex-camel-case-keys',
    title: 'Convert snake_case keys to camelCase — at runtime and in the type',
    level: 'advanced',
    category: 'strings',
    tags: ['template-literal-types', 'key-remapping', 'infer', 'api'],
    prompt: `APIs often return \`snake_case\` keys. Write:

1. a type \`CamelCase<S>\` that turns \`"created_at"\` into \`"createdAt"\` (any number of underscores),
2. a type \`CamelKeys<T>\` that renames every key of an object type (top level is enough),
3. a function \`camelKeys<T extends object>(obj: T): CamelKeys<T>\` that does the same at runtime.`,
    examples: [
      {
        input: '{ user_id: 1, created_at: "2024-01-01", is_admin_user: true }',
        output: '{ userId: 1, createdAt: "2024-01-01", isAdminUser: true }',
      },
    ],
    hints: [
      'Template literal + `infer`: `` S extends `${infer Head}_${infer Tail}` `` splits at the first underscore.',
      'Recurse on the tail and capitalize it: `` `${Head}${Capitalize<CamelCase<Tail>>}` ``.',
      'Key remapping: `{ [K in keyof T as K extends string ? CamelCase<K> : K]: T[K] }`.',
      'At runtime: `key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())`.',
    ],
    solutions: [
      {
        label: 'Template literal types + regex',
        code: `type CamelCase<S extends string> = S extends \`\${infer Head}_\${infer Tail}\`
  ? \`\${Head}\${Capitalize<CamelCase<Tail>>}\`
  : S;

type CamelKeys<T> = { [K in keyof T as K extends string ? CamelCase<K> : K]: T[K] };

const toCamel = (key: string) => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

function camelKeys<T extends object>(obj: T): CamelKeys<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [toCamel(key), value]),
  ) as CamelKeys<T>;
}`,
        complexity: { time: 'O(total key length)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type _1 = Assert<Equal<CamelCase<"is_admin_user">, "isAdminUser">>;
type _2 = Assert<Equal<CamelCase<"id">, "id">>;

const row = { user_id: 7, created_at: "2024-01-01", is_admin_user: true };
const user = camelKeys(row);         // { userId: number; createdAt: string; isAdminUser: boolean }

console.log(user);
console.log(user.userId + 1, user.isAdminUser);
// @ts-expect-error ❌ Property 'user_id' does not exist on type 'CamelKeys<{ user_id: number; created_at: string; is_admin_user: boolean; }>'.
const old = user.user_id;`,
      output: `{ userId: 7, createdAt: '2024-01-01', isAdminUser: true }
8 true`,
    },
    explanationBn: `Backend (Python/SQL) সাধারণত \`snake_case\`, frontend (JavaScript) \`camelCase\`। এই রূপান্তর runtime-এ করা সহজ — কিন্তু তাহলে type-ও বদলাতে হয়, নইলে TypeScript এখনো \`user_id\` আশা করবে।

**\`CamelCase<S>\` — type-স্তরের recursion:**
- \`\` S extends \`\${infer Head}_\${infer Tail}\` \`\` — প্রথম \`_\`-এ string ভাঙা: \`"is_admin_user"\` → Head \`"is"\`, Tail \`"admin_user"\`।
- Tail-কে আবার নিজের ওপর চালাই (\`"adminUser"\`), তারপর \`Capitalize\` → \`"AdminUser"\`, Head-এর সাথে জোড়া → \`"isAdminUser"\`।
- আর কোনো \`_\` না থাকলে string যেমন আছে।

**\`CamelKeys<T>\`** — key remapping (\`as\`) দিয়ে প্রতিটা key-র নাম বদলানো, value type একই।

**Runtime:** regex দিয়ে \`_x\` → \`X\`। Type আর runtime দুটো আলাদা implementation একই নিয়ম মানে — compile-time \`Equal\` check আর runtime output মিলিয়ে দুটোই যাচাই হয়।

ফলাফল: \`user.userId\` লিখলে autocomplete, আর পুরনো \`user.user_id\` লিখলে compile error।`,
  },
];

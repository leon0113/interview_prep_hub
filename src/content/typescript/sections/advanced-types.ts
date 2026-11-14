import { defineSection } from '../../define';

/** Compile-time equality test used by the type-level examples (checked by `tsc` in verify). */
const EQUAL = `type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;`;

export const advancedTypes = defineSection({
  id: 'ts-advanced-types',
  title: 'Type Operators & Advanced Types',
  description:
    '`keyof`, `typeof`, indexed access, utility types, mapped and conditional types, `infer`, template literal types and recursive types.',
  order: 6,
  questions: [
    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'ts-keyof-typeof',
      level: 'intermediate',
      priority: 3,
      question: 'What do `keyof` and `typeof` do in a type position?',
      tags: ['keyof', 'typeof', 'type-operators', 'derived-types'],
      answer: {
        interview: `**\`keyof T\` produces the union of \`T\`’s property names; \`typeof value\` (in a type position) produces the type of a runtime value.**

- \`keyof { id: number; name: string }\` → \`"id" | "name"\`.
- \`typeof config\` turns an existing object into a type — no need to write the interface twice.
- Combined: \`keyof typeof config\` → the union of the object’s keys.
- With \`as const\` and indexed access: \`(typeof ROLES)[number]\` → union of array values.
- This is different from JavaScript’s runtime \`typeof x === "string"\`, which returns a string at runtime.

Real-world: derive types from a single source of truth — a config object, a translation file, a list of routes.`,
        explanationBn: `**\`keyof\`** — একটা type-এর সব key-র নাম union হিসেবে: \`keyof User\` → \`"id" | "name"\`। Generic function-এ key সীমিত করতে, বা mapped type বানাতে সবচেয়ে বেশি লাগে।

**\`typeof\` (type হিসেবে)** — একটা **runtime value** থেকে তার type বের করা। আপনার কাছে একটা config object আছে; আলাদা interface লিখে দুই জায়গায় একই জিনিস রাখার দরকার নেই — \`type Config = typeof config\`।

দুটো একসাথে: \`keyof typeof config\` — "config object-এর key গুলোর union"। translation key, route name — এমন সব জায়গায় একটা object-ই একমাত্র উৎস থাকে, type নিজে থেকে মেলে।

খেয়াল রাখবেন: JavaScript-এর \`typeof x === "string"\` আর TypeScript-এর type-স্তরের \`typeof\` আলাদা জিনিস — একটা runtime-এ string দেয়, অন্যটা compile time-এ type।`,
        examples: [
          {
            lang: 'typescript',
            code: `const translations = {
  greeting: "Hello",
  farewell: "Goodbye",
};

type Translations = typeof translations;         // { greeting: string; farewell: string }
type TranslationKey = keyof typeof translations;  // "greeting" | "farewell"

function t(key: TranslationKey): string {
  return translations[key];
}

console.log(t("greeting"), Object.keys(translations).length);
// @ts-expect-error ❌ Argument of type '"welcome"' is not assignable to parameter of type '"greeting" | "farewell"'.
t("welcome");`,
            output: `Hello 2`,
          },
        ],
        pitfalls: [
          '`keyof` on a type with an index signature gives `string | number`, not the specific keys.',
          '`typeof` in a type position only works on values (variables, properties), not on types.',
        ],
        followUps: ['How do you get a union of an array’s values as a type?'],
      },
      related: ['ts-indexed-access-types', 'ts-as-const', 'ts-generic-keyof'],
    },
    {
      id: 'ts-utility-types',
      level: 'intermediate',
      priority: 3,
      question:
        'Which built-in utility types do you use most? Explain `Partial`, `Required`, `Readonly`, `Pick`, `Omit` and `Record`.',
      tags: ['utility-types', 'partial', 'pick', 'omit', 'record', 'readonly'],
      answer: {
        interview: `**Utility types transform an existing type into a new one, so related types stay in sync with a single source.**

- \`Partial<T>\` — all properties optional (update/PATCH payloads).
- \`Required<T>\` — all properties required (after defaults are applied).
- \`Readonly<T>\` — all properties readonly (state, props).
- \`Pick<T, K>\` — keep only keys \`K\` (a public view of a model).
- \`Omit<T, K>\` — drop keys \`K\` (\`Omit<User, "password">\`).
- \`Record<K, V>\` — an object with keys \`K\` and values \`V\`.

All are implemented with mapped types in \`lib.d.ts\` and are shallow. Note \`Omit\` does not check that \`K\` exists on \`T\`, while \`Pick\` does.

Real-world: \`type CreateUserDto = Omit<User, "id" | "createdAt">\`, \`type UpdateUserDto = Partial<CreateUserDto>\`.`,
        explanationBn: `একই model-এর বিভিন্ন রূপ লাগে: create করার সময় \`id\` থাকে না, update-এ সব field optional, API response-এ password বাদ। প্রতিটার জন্য নতুন interface লিখলে model বদলালে সব জায়গায় হাত দিতে হয় — আর কোথাও ভুলে গেলে bug। Utility type মূল type থেকে নতুন type **বানিয়ে নেয়** — মূলটা বদলালে সব নিজে থেকে বদলায়।

- **\`Partial\`** — সব optional। PATCH request।
- **\`Required\`** — সব বাধ্যতামূলক। Default বসানোর পরের config।
- **\`Readonly\`** — সব readonly।
- **\`Pick<T, "a" | "b">\`** — শুধু বাছাই করা key।
- **\`Omit<T, "password">\`** — নির্দিষ্ট key বাদ।
- **\`Record<K, V>\`** — key আর value-র type দিয়ে object।

একটা সূক্ষ্ম পার্থক্য: \`Pick\`-এ ভুল key দিলে error, কিন্তু \`Omit\`-এ ভুল key দিলে **কোনো error নেই** — চুপচাপ কিছুই বাদ পড়ে না।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface User { id: number; name: string; email: string; password: string }

type CreateUser = Omit<User, "id">;
type UpdateUser = Partial<CreateUser>;
type PublicUser = Pick<User, "id" | "name">;
type Roles = Record<"admin" | "user", string[]>;

const update: UpdateUser = { name: "Rafi" };                // everything optional
const view: PublicUser = { id: 1, name: "Rafi" };
const roles: Roles = { admin: ["delete"], user: [] };
const frozen: Readonly<PublicUser> = view;

// @ts-expect-error ❌ Cannot assign to 'name' because it is a read-only property.
frozen.name = "x";
// @ts-expect-error ❌ Type '"emial"' does not satisfy the constraint 'keyof User'.
type Typo = Pick<User, "emial">;
type NoError = Omit<User, "emial">;                         // Omit does not check keys

console.log(update, view, Object.keys(roles));`,
            output: `{ name: 'Rafi' } { id: 1, name: 'x' } [ 'admin', 'user' ]`,
          },
        ],
        pitfalls: [
          '`Omit` with a misspelled key silently omits nothing.',
          '`Partial` and `Readonly` are shallow — nested objects keep their original modifiers.',
          '`Omit` on a union type does not distribute; it flattens the union.',
        ],
        followUps: [
          'How would you implement `Partial` yourself?',
          'What is the difference between `Pick` and `Omit` regarding key checking?',
        ],
      },
      visualizationId: 'ts-utility-types',
      related: ['ts-mapped-types', 'ts-more-utility-types'],
    },
    {
      id: 'ts-indexed-access-types',
      level: 'intermediate',
      priority: 2,
      question: 'What are indexed access types (`T["key"]`, `T[number]`)?',
      tags: ['indexed-access', 'lookup-types', 'derived-types'],
      answer: {
        interview: `**\`T["key"]\` looks up the type of a property, just like \`obj.key\` does for values.**

- \`User["address"]\` gives the nested address type without declaring it separately.
- A union of keys gives a union: \`User["id" | "name"]\` → \`number | string\`.
- \`T[keyof T]\` → union of all property value types.
- \`Arr[number]\` → element type of an array or tuple: \`(typeof ROLES)[number]\`.
- Works on any type, including types from libraries you don’t control.

Real-world: \`type Item = ApiResponse["data"]["items"][number]\` — the item type of an untyped-by-name nested response.`,
        explanationBn: `Value-তে \`user.address\` লিখে nested অংশ পাওয়া যায়; type-এ ঠিক একইভাবে \`User["address"]\` লিখে nested **type** পাওয়া যায়।

কোথায় কাজে লাগে: library বা generated API type-এ ভেতরের অংশের আলাদা নাম থাকে না। \`Response["data"]["items"][number]\` — "response-এর data-র items array-র একটা element-এর type" — নতুন করে না লিখেই।

\`[number]\` দিয়ে array-র element type: \`string[][number]\` → \`string\`। \`as const\` array-র সাথে ব্যবহার করলে value গুলোর union।

\`T[keyof T]\` — সব property-র value type-এর union।`,
        examples: [
          {
            lang: 'typescript',
            code: `${EQUAL}

interface ApiResponse {
  data: { items: { id: number; title: string }[]; total: number };
  meta: { page: number };
}

type Item = ApiResponse["data"]["items"][number];
type IdOrTitle = Item["id" | "title"];
type ValueTypes = ApiResponse["meta"][keyof ApiResponse["meta"]];

type _1 = Assert<Equal<Item, { id: number; title: string }>>;
type _2 = Assert<Equal<IdOrTitle, number | string>>;
type _3 = Assert<Equal<ValueTypes, number>>;

const first: Item = { id: 1, title: "Learn TS" };
console.log(first.title);`,
            output: `Learn TS`,
          },
        ],
        pitfalls: [
          'You must use bracket syntax: `User.address` is not valid in a type.',
          'Indexing an optional property includes `undefined`; wrap with `NonNullable<>` if needed.',
        ],
        followUps: ['How do you get the element type of an array type?'],
      },
      related: ['ts-keyof-typeof'],
    },
    {
      id: 'ts-mapped-types',
      level: 'intermediate',
      priority: 2,
      question: 'What is a mapped type? Implement `Partial` and `Readonly` yourself.',
      tags: ['mapped-types', 'keyof', 'modifiers', 'utility-types'],
      answer: {
        interview: `**A mapped type creates a new object type by looping over keys: \`{ [K in keyof T]: T[K] }\` — the type-level equivalent of \`Object.fromEntries(Object.entries(obj).map(...))\`.**

- \`type MyPartial<T> = { [K in keyof T]?: T[K] }\`.
- \`type MyReadonly<T> = { readonly [K in keyof T]: T[K] }\`.
- Modifiers can be removed with \`-\`: \`{ -readonly [K in keyof T]-?: T[K] }\` is \`Mutable\` + \`Required\`.
- The value type can be transformed: \`{ [K in keyof T]: () => T[K] }\`.
- Mapping over a union of literals builds objects from scratch: \`{ [K in "a" | "b"]: number }\`.

Real-world: \`type FormErrors<T> = { [K in keyof T]?: string }\` — an error message per form field.`,
        explanationBn: `Mapped type হলো type-স্তরের loop: "T-এর প্রতিটা key K-এর জন্য, নতুন type-এ একটা property বানাও"।

\`{ [K in keyof T]: T[K] }\` — হুবহু কপি। এখন এতে পরিবর্তন যোগ করা যায়:
- \`?\` যোগ করলে → সব optional (\`Partial\`)।
- \`readonly\` যোগ করলে → সব readonly।
- \`-?\` / \`-readonly\` → modifier সরিয়ে দেওয়া (\`Required\`, \`Mutable\`)।
- Value type বদলানো → \`{ [K in keyof T]?: string }\` — প্রতিটা field-এর জন্য error message।

TypeScript-এর built-in \`Partial\`, \`Readonly\`, \`Record\`, \`Pick\` সব এভাবেই লেখা — interview-তে নিজে লিখে দেখাতে বলা খুবই common।`,
        examples: [
          {
            lang: 'typescript',
            code: `${EQUAL}

type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type FormErrors<T> = { [K in keyof T]?: string };

interface Signup { email: string; age: number }

type _1 = Assert<Equal<MyPartial<Signup>, Partial<Signup>>>;
type _2 = Assert<Equal<MyReadonly<Signup>, Readonly<Signup>>>;
type _3 = Assert<Equal<Mutable<Readonly<Signup>>, Signup>>;

const errors: FormErrors<Signup> = { email: "Invalid email" };
// @ts-expect-error ❌ Type 'boolean' is not assignable to type 'string'.
const wrong: FormErrors<Signup> = { age: true };
console.log(errors);`,
            output: `{ email: 'Invalid email' }`,
          },
        ],
        pitfalls: [
          'Mapped types over `keyof T` preserve optional/readonly modifiers ("homomorphic"); mapping over an arbitrary union does not.',
        ],
        followUps: [
          'How do you rename keys in a mapped type?',
          'How would you write `DeepPartial`?',
        ],
      },
      related: ['ts-utility-types', 'ts-key-remapping', 'ts-recursive-types'],
    },
    {
      id: 'ts-more-utility-types',
      level: 'intermediate',
      priority: 2,
      question:
        'What do `ReturnType`, `Parameters`, `Exclude`, `Extract`, `NonNullable` and `Awaited` do?',
      tags: ['utility-types', 'return-type', 'parameters', 'exclude', 'extract', 'awaited'],
      answer: {
        interview: `**These utilities derive types from functions and unions instead of from object shapes.**

- \`ReturnType<typeof fn>\` — the function’s return type.
- \`Parameters<typeof fn>\` — its parameters as a tuple (\`Parameters<F>[0]\` for the first).
- \`Exclude<U, X>\` — remove members of union \`U\` assignable to \`X\`.
- \`Extract<U, X>\` — keep only those members.
- \`NonNullable<T>\` — remove \`null\` and \`undefined\`.
- \`Awaited<T>\` — unwrap promises recursively.

All of them are conditional types under the hood (\`Exclude<T, U> = T extends U ? never : T\`).

Real-world: wrapping a library function — \`function withRetry(...args: Parameters<typeof fetchUser>): ReturnType<typeof fetchUser>\` — without importing its internal types.`,
        explanationBn: `আগের utility গুলো (Partial, Pick) object-এর আকার বদলায়। এগুলো কাজ করে **function আর union**-এর ওপর:

- **\`ReturnType\` / \`Parameters\`** — একটা function-এর return type বা parameter-এর tuple বের করা। Library export করেনি এমন type পেতে দারুণ — function থেকেই বের করে নিন।
- **\`Exclude\` / \`Extract\`** — union থেকে কিছু সদস্য বাদ দেওয়া বা শুধু সেগুলো রাখা। \`Exclude<Status, "deleted">\`।
- **\`NonNullable\`** — \`null\` আর \`undefined\` বাদ।
- **\`Awaited\`** — promise খুলে ভেতরের type।

ভেতরে সবগুলো conditional type দিয়ে লেখা — পরের প্রশ্নের বিষয়।`,
        examples: [
          {
            lang: 'typescript',
            code: `${EQUAL}

async function fetchUser(id: number, opts?: { cache: boolean }) {
  return { id, name: "Rafi" };
}

type Args = Parameters<typeof fetchUser>;              // [id: number, opts?: { cache: boolean }]
type User = Awaited<ReturnType<typeof fetchUser>>;     // { id: number; name: string }
type Status = "active" | "pending" | "deleted";

type _1 = Assert<Equal<Args[0], number>>;
type _2 = Assert<Equal<User, { id: number; name: string }>>;
type _3 = Assert<Equal<Exclude<Status, "deleted">, "active" | "pending">>;
type _4 = Assert<Equal<Extract<Status, "active" | "banned">, "active">>;
type _5 = Assert<Equal<NonNullable<string | null | undefined>, string>>;

async function logged(...args: Args): Promise<User> {
  console.log("fetching", args[0]);
  return fetchUser(...args);
}
console.log((await logged(7)).name);`,
            output: `fetching 7
Rafi`,
          },
        ],
        pitfalls: [
          '`ReturnType` needs a function *type*: write `ReturnType<typeof fn>`, not `ReturnType<fn>`.',
          'For overloaded functions, these utilities use the last overload signature.',
        ],
        followUps: ['How is `Exclude` implemented?', 'How would you implement `ReturnType`?'],
      },
      related: ['ts-utility-types', 'ts-conditional-types', 'ts-infer-keyword'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'ts-conditional-types',
      level: 'advanced',
      priority: 2,
      question: 'What are conditional types?',
      tags: ['conditional-types', 'extends', 'type-level-programming'],
      answer: {
        interview: `**A conditional type picks one of two types based on an assignability test: \`T extends U ? X : Y\` — a ternary at the type level.**

- \`type IsString<T> = T extends string ? true : false\`.
- Used to make a return type depend on an input type, e.g. \`T extends string ? string : number\`.
- With a **naked** type parameter, conditional types **distribute** over unions (each member is checked separately).
- \`infer\` inside the \`extends\` clause extracts parts of a type.
- Built-ins like \`Exclude\`, \`Extract\`, \`NonNullable\`, \`ReturnType\` and \`Awaited\` are all conditional types.

Real-world: an API client where \`get<"/users">\` returns \`User[]\` and \`get<"/stats">\` returns \`Stats\`, driven by a route map type.`,
        explanationBn: `Conditional type হলো type-স্তরের \`if/else\` বা ternary: \`T extends U ? X : Y\` — "T যদি U-তে assign করা যায়, তবে X, নইলে Y"।

এটা দিয়ে **input type-এর ওপর নির্ভর করে output type** ঠিক করা যায়, যেটা সাধারণ generic পারে না।

দুটো গুরুত্বপূর্ণ বৈশিষ্ট্য (পরের প্রশ্নগুলোতে বিস্তারিত):
- **Distribution:** T একটা union হলে প্রতিটা সদস্যের ওপর আলাদাভাবে শর্ত চলে, ফলাফল আবার union।
- **\`infer\`:** শর্তের ভেতরে একটা অংশ "ধরে" নতুন নামে ব্যবহার।

\`Exclude\`, \`NonNullable\`, \`ReturnType\` — আপনি যেসব utility রোজ ব্যবহার করেন, সব এভাবেই লেখা।`,
        examples: [
          {
            lang: 'typescript',
            code: `${EQUAL}

type IsString<T> = T extends string ? "yes" : "no";
type ElementOf<T> = T extends readonly (infer E)[] ? E : T;

type _1 = Assert<Equal<IsString<"hi">, "yes">>;
type _2 = Assert<Equal<IsString<42>, "no">>;
type _3 = Assert<Equal<ElementOf<number[]>, number>>;
type _4 = Assert<Equal<ElementOf<string>, string>>;

type Routes = { "/users": { name: string }[]; "/stats": { visits: number } };
async function get<P extends keyof Routes>(path: P): Promise<Routes[P]> {
  const fake: Routes = { "/users": [{ name: "Rafi" }], "/stats": { visits: 42 } };
  return fake[path];
}
const users = await get("/users");   // { name: string }[]
const stats = await get("/stats");   // { visits: number }
console.log(users[0]?.name, stats.visits);`,
            output: `Rafi 42`,
          },
        ],
        pitfalls: [
          'Conditional types on unresolved generic parameters stay "deferred" — TypeScript can’t pick a branch until `T` is known.',
          'Deeply nested conditionals become unreadable; name intermediate types.',
        ],
        followUps: ['What is a distributive conditional type?', 'What does `infer` do?'],
      },
      related: ['ts-infer-keyword', 'ts-distributive-conditional', 'ts-more-utility-types'],
    },
    {
      id: 'ts-infer-keyword',
      level: 'advanced',
      priority: 2,
      question: 'What does the `infer` keyword do? Implement `ReturnType` yourself.',
      tags: ['infer', 'conditional-types', 'type-level-programming'],
      answer: {
        interview: `**\`infer X\` declares a type variable inside a conditional type’s \`extends\` clause; if the match succeeds, \`X\` holds the matched part.**

- \`type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never\`.
- Pattern matching on types: unwrap promises (\`Promise<infer V>\`), arrays (\`(infer E)[]\`), function parameters, tuple heads (\`[infer H, ...infer Rest]\`).
- With template literal types: \`\` S extends \`\${infer Head}_\${infer Tail}\` \`\` splits strings.
- \`infer X extends string\` (TS 4.7) constrains what is inferred.

Real-world: extracting the props type of a component: \`type PropsOf<C> = C extends (props: infer P) => any ? P : never\`.`,
        explanationBn: `\`infer\` হলো type-স্তরের "pattern matching"। Conditional type-এর শর্তে বলছেন "T যদি এই আকারের হয়…", আর আকারের ভেতরের একটা অংশকে \`infer R\` দিয়ে নাম দিচ্ছেন — মিললে R-এ সেই অংশের type বসে।

\`F extends (...args: any[]) => infer R ? R : never\` পড়ুন এভাবে: "F যদি একটা function হয়, তার return type-কে R বলো, আর R ফেরত দাও।" এটাই built-in \`ReturnType\`।

একই কৌশলে:
- \`Promise<infer V>\` — promise-এর ভেতরের type।
- \`[infer First, ...infer Rest]\` — tuple-এর প্রথম আর বাকিগুলো (recursive type-এ খুব কাজের)।
- Template literal-এর সাথে string ভাঙা।

Interview-তে "ReturnType নিজে লিখুন" খুবই জনপ্রিয় প্রশ্ন।`,
        examples: [
          {
            lang: 'typescript',
            code: `${EQUAL}

type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
type MyParameters<F> = F extends (...args: infer P) => any ? P : never;
type UnwrapPromise<T> = T extends Promise<infer V> ? UnwrapPromise<V> : T;
type First<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : undefined;

const createUser = (name: string, age: number) => ({ name, age, id: 1 });

type _1 = Assert<Equal<MyReturnType<typeof createUser>, { name: string; age: number; id: number }>>;
type _2 = Assert<Equal<MyParameters<typeof createUser>, [name: string, age: number]>>;
type _3 = Assert<Equal<UnwrapPromise<Promise<Promise<boolean>>>, boolean>>;
type _4 = Assert<Equal<First<[string, number]>, string>>;
type _5 = Assert<Equal<First<[]>, undefined>>;

console.log(createUser("Rafi", 30));`,
            output: `{ name: 'Rafi', age: 30, id: 1 }`,
          },
        ],
        pitfalls: [
          '`infer` is only allowed inside the `extends` clause of a conditional type.',
          'Using `any[]` vs `never[]` in the function pattern affects which functions match.',
        ],
        followUps: ['How would you get the type of the second parameter of a function?'],
      },
      related: ['ts-conditional-types', 'ts-template-literal-types'],
    },
    {
      id: 'ts-template-literal-types',
      level: 'advanced',
      priority: 2,
      question: 'What are template literal types?',
      tags: ['template-literal-types', 'string-manipulation', 'mapped-types'],
      answer: {
        interview: `**Template literal types build string literal types with the same backtick syntax as JavaScript template strings: \`\` \`on\${Capitalize<Event>}\` \`\`.**

- With a union inside, they produce every combination: \`\` \`\${"sm" | "lg"}-\${"red" | "blue"}\` \`\` → 4 members.
- Intrinsic helpers: \`Uppercase\`, \`Lowercase\`, \`Capitalize\`, \`Uncapitalize\`.
- With \`infer\` they parse strings: extract route params from \`"/users/:id"\`.
- With key remapping they generate method names: \`get\${Capitalize<K>}\`.

Real-world: typing event handler names (\`onClick\`), CSS utility class names, or route parameters in routers like React Router and Hono.`,
        explanationBn: `JavaScript-এর template string-এর মতোই syntax, কিন্তু type-স্তরে — string literal **type** বানানো।

- **Combination:** ভেতরে union থাকলে সব সম্ভাব্য জোড়া তৈরি হয় — size × color = সব class name।
- **Helper:** \`Capitalize<"click">\` → \`"Click"\`; তাই \`\` \`on\${Capitalize<E>}\` \`\` →\`"onClick"\`।
- **Parsing:** \`infer\`-এর সাথে string ভেঙে অংশ বের করা যায় — যেমন \`"/users/:id/posts/:postId"\` থেকে \`"id" | "postId"\`। আধুনিক router গুলো এভাবেই route param-এর type দেয়।

এটা TypeScript-কে প্রায় একটা ছোট programming language বানিয়ে দেয় — তবে বাস্তব code-এ সংযত ব্যবহারই ভালো।`,
        examples: [
          {
            lang: 'typescript',
            code: `${EQUAL}

type DomEvent = "click" | "focus";
type Handler = \`on\${Capitalize<DomEvent>}\`;             // "onClick" | "onFocus"
type Size = "sm" | "lg";
type Color = "red" | "blue";
type ButtonClass = \`btn-\${Size}-\${Color}\`;

type RouteParams<S extends string> =
  S extends \`\${string}:\${infer Param}/\${infer Rest}\` ? Param | RouteParams<Rest>
  : S extends \`\${string}:\${infer Param}\` ? Param
  : never;

type _1 = Assert<Equal<Handler, "onClick" | "onFocus">>;
type _2 = Assert<Equal<RouteParams<"/users/:id/posts/:postId">, "id" | "postId">>;

const cls: ButtonClass = "btn-lg-blue";
// @ts-expect-error ❌ Type '"btn-xl-red"' is not assignable to type
const bad: ButtonClass = "btn-xl-red";
console.log(cls);`,
            output: `btn-lg-blue`,
          },
        ],
        pitfalls: [
          'Large unions in templates explode combinatorially and slow down the compiler.',
          'They only check string *shape* at compile time; runtime strings still need validation.',
        ],
        followUps: ['How would you type `"/users/:id"` route parameters?'],
      },
      related: ['ts-infer-keyword', 'ts-key-remapping'],
    },
    {
      id: 'ts-distributive-conditional',
      level: 'advanced',
      priority: 1,
      question: 'What is a distributive conditional type, and how do you prevent distribution?',
      tags: ['conditional-types', 'distribution', 'unions', 'never'],
      answer: {
        interview: `**When a conditional type checks a naked type parameter (\`T extends U ? X : Y\`) and \`T\` is a union, it is applied to each member separately and the results are unioned.**

- \`ToArray<string | number>\` with \`T extends any ? T[] : never\` → \`string[] | number[]\`, not \`(string | number)[]\`.
- This is what makes \`Exclude\` work: members that match become \`never\` and disappear.
- \`never\` is the empty union, so a distributive type applied to \`never\` gives \`never\`.
- Prevent distribution by wrapping both sides in a tuple: \`[T] extends [U] ? X : Y\`.

Real-world: an \`IsNever<T>\` check must be written as \`[T] extends [never]\`, otherwise it always returns \`never\`.`,
        explanationBn: `Conditional type-এ যদি সরাসরি (মোড়ানো ছাড়া) type parameter থাকে আর সেখানে একটা union আসে, TypeScript union-এর **প্রতিটা সদস্যের ওপর আলাদাভাবে** শর্ত চালায়, তারপর ফলাফলগুলো জোড়া দেয়।

\`ToArray<string | number>\` → \`ToArray<string> | ToArray<number>\` → \`string[] | number[]\`।

এটাই \`Exclude\`-এর রহস্য: প্রতিটা সদস্যের জন্য "বাদ দেওয়ার তালিকায় আছে? তাহলে \`never\`, নইলে নিজেই" — আর union-এ \`never\` হারিয়ে যায়।

**ফাঁদ — \`never\`:** \`never\` হলো ফাঁকা union, তাই distribute করার মতো কোনো সদস্যই নেই — ফলাফল সবসময় \`never\`। \`IsNever<never>\` লিখলে \`true\` আশা করবেন, পাবেন \`never\`!

**সমাধান:** দুই দিক tuple-এ মুড়ে দিন — \`[T] extends [never]\`। মোড়ানো type parameter distribute হয় না।`,
        examples: [
          {
            lang: 'typescript',
            code: `${EQUAL}

type ToArray<T> = T extends unknown ? T[] : never;           // distributive
type ToArrayAll<T> = [T] extends [unknown] ? T[] : never;    // not distributive
type MyExclude<T, U> = T extends U ? never : T;

type NaiveIsNever<T> = T extends never ? true : false;
type IsNever<T> = [T] extends [never] ? true : false;

type _1 = Assert<Equal<ToArray<string | number>, string[] | number[]>>;
type _2 = Assert<Equal<ToArrayAll<string | number>, (string | number)[]>>;
type _3 = Assert<Equal<MyExclude<"a" | "b" | "c", "a">, "b" | "c">>;
type _4 = Assert<Equal<NaiveIsNever<never>, never>>;     // surprise!
type _5 = Assert<Equal<IsNever<never>, true>>;

console.log("all type assertions compiled");`,
            output: `all type assertions compiled`,
          },
        ],
        pitfalls: [
          'Distribution only happens for a *naked* type parameter, not for `T[]` or `{ value: T }` in the check.',
        ],
        followUps: ['Why does `Exclude` work with unions?'],
      },
      related: ['ts-conditional-types', 'ts-union-intersection'],
    },
    {
      id: 'ts-key-remapping',
      level: 'advanced',
      priority: 1,
      question: 'How do you rename or filter keys in a mapped type (`as` clause)?',
      tags: ['mapped-types', 'key-remapping', 'template-literal-types'],
      answer: {
        interview: `**Since TS 4.1, a mapped type can remap each key with \`as\`: \`{ [K in keyof T as NewKey]: ... }\`. Mapping a key to \`never\` removes it.**

- Rename: \`\` as \`get\${Capitalize<string & K>}\` \`\` turns \`name\` into \`getName\`.
- Filter: \`as T[K] extends Function ? never : K\` keeps only non-function properties.
- \`string & K\` is needed because \`keyof T\` may include \`number | symbol\`, which template literals can’t all accept.
- Combine with value transforms to generate APIs from a model.

Real-world: generating \`Getters<T>\` / \`Setters<T>\` interfaces, or extracting only the data fields of a class.`,
        explanationBn: `Mapped type-এ সাধারণত key একই থাকে। \`as\` দিয়ে প্রতিটা key-কে **নতুন নাম** দেওয়া যায়, আর \`never\`-এ map করলে key-টা **বাদ পড়ে**।

- **নাম বদলানো:** \`name\` → \`getName\` — template literal আর \`Capitalize\` দিয়ে।
- **ছাঁকা:** value-র type দেখে সিদ্ধান্ত — function হলে \`never\` (বাদ), না হলে রাখো। Class থেকে শুধু data property আলাদা করা যায়।

\`string & K\` কেন? \`keyof T\`-এ number বা symbol key-ও থাকতে পারে, আর \`Capitalize\` শুধু string নেয় — intersection দিয়ে শুধু string key রাখি।`,
        examples: [
          {
            lang: 'typescript',
            code: `${EQUAL}

type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
type DataOnly<T> = { [K in keyof T as T[K] extends Function ? never : K]: T[K] };

interface Person { name: string; age: number; greet(): string }

type _1 = Assert<Equal<keyof Getters<Pick<Person, "name" | "age">>, "getName" | "getAge">>;
type _2 = Assert<Equal<DataOnly<Person>, { name: string; age: number }>>;

function makeGetters<T extends object>(obj: T): Getters<T> {
  const out: Record<string, () => unknown> = {};
  for (const [k, v] of Object.entries(obj)) out["get" + k[0]!.toUpperCase() + k.slice(1)] = () => v;
  return out as Getters<T>;
}
const g = makeGetters({ name: "Rafi", age: 30 });
console.log(g.getName(), g.getAge());`,
            output: `Rafi 30`,
          },
        ],
        pitfalls: [
          'The runtime implementation needs an assertion (`as Getters<T>`) — TypeScript cannot check string-built keys.',
        ],
        followUps: ['How would you build `Setters<T>`?'],
      },
      related: ['ts-mapped-types', 'ts-template-literal-types'],
    },
    {
      id: 'ts-recursive-types',
      level: 'advanced',
      priority: 1,
      question:
        'How do you write recursive types such as `DeepPartial`, `DeepReadonly` or a JSON type?',
      tags: ['recursive-types', 'mapped-types', 'json', 'deep-readonly'],
      answer: {
        interview: `**A type alias can reference itself, so you can describe nested data (JSON, trees) and apply transforms at every depth.**

- \`type Json = string | number | boolean | null | Json[] | { [key: string]: Json }\`.
- \`type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }\`.
- Handle functions and arrays deliberately — \`T[K] extends object\` is also true for them.
- TypeScript limits recursion depth (around 50 levels for conditional types, with tail-call optimisation since 4.5) to keep checking fast.

Real-world: a deep-merge config function typed as \`merge<T>(base: T, override: DeepPartial<T>): T\`.`,
        explanationBn: `Type নিজেকে নিজের ভেতরে ব্যবহার করতে পারে — ঠিক recursive function-এর মতো। Nested data (JSON, tree, menu) বর্ণনার এটাই উপায়।

**JSON type:** একটা JSON value হতে পারে primitive, অথবা JSON-এর array, অথবা এমন object যার value-ও JSON। নিজেকেই উল্লেখ করে পুরো সংজ্ঞা।

**DeepPartial:** \`Partial\` শুধু উপরের স্তরে কাজ করে। Deep version: property যদি object হয়, তার ভেতরেও আবার DeepPartial লাগাও।

সতর্কতা: \`extends object\` array আর function-এর জন্যও সত্য — তাই এদের আলাদা করে সামলানো দরকার হতে পারে। আর অতিরিক্ত গভীর recursion-এ TypeScript "Type instantiation is excessively deep" error দেয়।`,
        examples: [
          {
            lang: 'typescript',
            code: `type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] };

interface Config { server: { port: number; host: string }; debug: boolean }

function merge<T>(base: T, override: DeepPartial<T>): T {
  const out: any = { ...base };
  for (const [k, v] of Object.entries(override as object)) {
    out[k] = v && typeof v === "object" ? merge((base as any)[k], v) : v;
  }
  return out;
}

const config: Config = { server: { port: 80, host: "localhost" }, debug: false };
const merged = merge(config, { server: { port: 8080 } });
const ro: DeepReadonly<Config> = merged;
// @ts-expect-error ❌ Cannot assign to 'port' because it is a read-only property.
ro.server.port = 1;
const payload: Json = { ok: true, items: [1, "two", null] };
// @ts-expect-error ❌ Type 'Date' is not assignable to type 'Json'.
const notJson: Json = new Date();
console.log(merged.server, JSON.stringify(payload));`,
            output: `{ port: 1, host: 'localhost' } {"ok":true,"items":[1,"two",null]}`,
          },
        ],
        pitfalls: [
          '`DeepReadonly` is still compile-time only — the `ro.server.port = 1` line above changed the real object.',
          'Very deep or wide recursive types can hit "Type instantiation is excessively deep".',
        ],
        followUps: ['How would you exclude functions and arrays in `DeepReadonly`?'],
      },
      related: ['ts-mapped-types', 'ts-readonly-vs-const'],
    },
    {
      id: 'ts-instance-type',
      level: 'intermediate',
      priority: 1,
      question: 'How do you type a function that receives a class and creates instances of it?',
      tags: ['constructors', 'instance-type', 'constructor-parameters', 'factories'],
      answer: {
        interview: `**Accept a constructor type (\`new (...args: A) => T\`) and use \`InstanceType<C>\` / \`ConstructorParameters<C>\` to get the instance and argument types.**

- \`typeof MyClass\` is the type of the class (the constructor); \`MyClass\` as a type is the instance type.
- \`function create<C extends new (...args: any[]) => any>(Ctor: C, ...args: ConstructorParameters<C>): InstanceType<C>\`.
- \`abstract new (...args: any[]) => T\` also accepts abstract classes (for registries that never instantiate them directly).
- Used by dependency-injection containers, plugin registries, ORMs and test factories.

Real-world: \`container.register(UserService)\` and later \`container.get(UserService)\` returning a typed \`UserService\`.`,
        explanationBn: `একটা গুরুত্বপূর্ণ পার্থক্য: type হিসেবে \`User\` মানে **User-এর instance**, আর \`typeof User\` মানে **class নিজে** (constructor function)।

Class-কে parameter হিসেবে নিতে construct signature (\`new (...) => T\`) লাগে। আর utility দুটো:
- **\`InstanceType<C>\`** — class থেকে instance-এর type।
- **\`ConstructorParameters<C>\`** — constructor-এর argument গুলোর tuple।

এগুলো দিয়ে generic factory লেখা যায়: যে class দেবেন, তার constructor-এর argument-ই চাইবে, আর তার instance-ই ফেরত দেবে — সব type-checked। Dependency injection container (NestJS, Angular) ঠিক এভাবে কাজ করে।`,
        examples: [
          {
            lang: 'typescript',
            code: `class Logger { constructor(public prefix: string) {} log(msg: string) { return \`[\${this.prefix}] \${msg}\`; } }
class Cache { constructor(public size: number, public ttl = 60) {} }

function create<C extends new (...args: any[]) => any>(
  Ctor: C,
  ...args: ConstructorParameters<C>
): InstanceType<C> {
  console.log("creating", Ctor.name);
  return new Ctor(...args);
}

const logger = create(Logger, "app");          // Logger
const cache = create(Cache, 100);              // Cache
console.log(logger.log("ready"), cache.ttl);
// @ts-expect-error ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
const wrong = () => create(Cache, "big");

const cls: typeof Logger = Logger;             // the class itself
const instance: Logger = new cls("x");         // an instance
console.log(instance instanceof Logger);`,
            output: `creating Logger
creating Cache
[app] ready 60
true`,
          },
        ],
        pitfalls: ['Confusing `Logger` (instance type) with `typeof Logger` (constructor type).'],
        followUps: ['How would you type a simple dependency-injection container?'],
      },
      related: ['ts-more-utility-types', 'ts-mixins'],
    },
  ],
});

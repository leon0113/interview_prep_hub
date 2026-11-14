import { defineSection } from '../../define';

export const objectsInterfaces = defineSection({
  id: 'ts-objects-interfaces',
  title: 'Types, Interfaces & Objects',
  description:
    'Describing object shapes: `type` vs `interface`, structural typing, optional and readonly properties, index signatures and excess property checks.',
  order: 2,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'ts-type-vs-interface',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between `type` and `interface`? When do you use each?',
      tags: ['type-alias', 'interface', 'declaration-merging', 'objects'],
      answer: {
        interview: `**Both can describe object shapes and are interchangeable for most code; the differences are at the edges.**

- **\`type\`** can name *any* type: unions (\`"a" | "b"\`), tuples, primitives, mapped and conditional types. An \`interface\` can only describe an object/function shape.
- **\`interface\`** supports **declaration merging**: two declarations with the same name combine — used to extend library types (\`Window\`, Express \`Request\`). Declaring a \`type\` twice is an error.
- Extending: \`interface B extends A\` vs \`type B = A & {...}\`. \`extends\` reports conflicting properties as an error; an intersection silently produces \`never\` for them.
- Classes can \`implements\` either, as long as the type is an object shape.
- Performance: interfaces are cached by name, so large hierarchies of \`extends\` check slightly faster than big intersections.

Real-world rule: \`interface\` for public object shapes and things others may extend; \`type\` for unions, utilities and everything else. Consistency within a codebase matters more than the choice.`,
        explanationBn: `দৈনন্দিন কাজে object-এর আকার বোঝাতে দুটোই একই কাজ করে। পার্থক্যগুলো কিনারায়:

**\`type\` যা পারে, \`interface\` পারে না:** \`type\` হলো যেকোনো type-এর একটা নাম — union (\`"light" | "dark"\`), tuple, primitive, mapped বা conditional type। \`interface\` শুধু object (বা function)-এর আকার।

**\`interface\` যা পারে, \`type\` পারে না — declaration merging:** একই নামে দুবার \`interface\` লিখলে দুটো মিলে এক হয়ে যায়। এটা library-র type বাড়াতে কাজে লাগে — যেমন \`Window\`-এ নিজের property যোগ করা। একই নামে দুবার \`type\` লিখলে error।

**Extend করার পার্থক্য:** \`interface B extends A\`-এ property-র type সংঘর্ষ হলে সাথে সাথে স্পষ্ট error। \`A & B\` intersection-এ সংঘর্ষ হলে কোনো error নেই — property-টা চুপচাপ \`never\` হয়ে যায়, পরে অদ্ভুত জায়গায় সমস্যা দেখা দেয়।

সাধারণ নিয়ম: বাইরের কেউ extend করতে পারে এমন object shape-এ \`interface\`, বাকি সবকিছুতে (union, utility) \`type\`। আসল কথা — codebase-এ একটা নিয়ম মেনে চলা।`,
        examples: [
          {
            lang: 'typescript',
            caption: 'What only `type` can do, and what only `interface` can do',
            code: `type Status = "idle" | "loading" | "done";      // unions need type
type Pair = [string, number];                   // so do tuples

interface User { id: number }
interface User { name: string }                 // merges with the first one
const u: User = { id: 1, name: "Rafi" };

// @ts-expect-error (both declarations are reported)
type Point = { x: number };
// @ts-expect-error ❌ Duplicate identifier 'Point'.
type Point = { y: number };

const s: Status = "done";
const p: Pair = ["age", 30];
console.log(u, s, p);`,
            output: `{ id: 1, name: 'Rafi' } done [ 'age', 30 ]`,
          },
          {
            lang: 'typescript',
            caption: '`extends` reports conflicts; an intersection silently creates `never`',
            code: `interface Base { id: string }

// @ts-expect-error ❌ Interface 'WithNumberId' incorrectly extends interface 'Base'.
interface WithNumberId extends Base { id: number }

type Mixed = Base & { id: number };             // no error here...
type MixedId = Mixed["id"];                     // ...but id is string & number = never

const check: MixedId extends never ? "never" : "ok" = "never";
console.log(check);`,
            output: `never`,
          },
        ],
        pitfalls: [
          'Accidental declaration merging: two files declaring the same global `interface` name combine silently.',
          'Intersections with conflicting properties produce `never` instead of an error.',
        ],
        followUps: [
          'What is declaration merging and when is it useful?',
          'Can a class implement a type alias?',
          'How would you add a property to the global `Window` type?',
        ],
      },
      visualizationId: 'ts-type-vs-interface',
      related: ['ts-extends-vs-intersection', 'ts-declaration-merging'],
    },
    {
      id: 'ts-structural-typing',
      level: 'foundation',
      priority: 2,
      question: 'What does it mean that TypeScript is structurally typed?',
      tags: ['structural-typing', 'duck-typing', 'compatibility'],
      answer: {
        interview: `**Type compatibility is decided by shape, not by name: if a value has all the properties a type requires, it is assignable to that type.**

- Two differently named interfaces with the same members are interchangeable.
- An object with **extra** properties is still assignable (it has at least what is needed) — except fresh object literals, which get excess property checks.
- Classes are compared structurally too: a plain object can satisfy a class type (unless the class has \`private\`/\`#private\` members).
- This matches how JavaScript works (duck typing). The opposite, **nominal** typing (Java, C#), compares declared names.
- When you need nominal behaviour (e.g. \`UserId\` vs \`OrderId\` strings), use **branded types**.

Real-world: a function accepting \`{ name: string }\` works with users, products and anything else that has a name.`,
        explanationBn: `**"যদি হাঁসের মতো হাঁটে আর হাঁসের মতো ডাকে, তবে সেটা হাঁস।"** TypeScript type-এর নাম দেখে না, দেখে **আকার** — দরকারি সব property আছে কি না।

তাই:
- \`Person\` আর \`Employee\` নামে দুটো আলাদা interface, কিন্তু ভেতরে একই property — TypeScript-এর চোখে দুটো একই।
- বাড়তি property থাকলেও সমস্যা নেই — যা লাগবে তা তো আছে। \`{ name, age }\` object-কে \`{ name: string }\` চাওয়া function-এ পাঠানো যায়।
- Class-ও একইভাবে — class-এর instance না হয়েও একই আকারের সাধারণ object class type-এ বসে।

Java বা C#-এ উল্টো (nominal typing) — সেখানে নাম মেলাতে হয়। TypeScript structural কারণ JavaScript নিজেই এভাবে কাজ করে।

অসুবিধা: \`UserId\` আর \`OrderId\` দুটোই \`string\` হলে TypeScript এদের গুলিয়ে ফেলতে দেয়। সমাধান: branded type।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface Person { name: string }
interface Product { name: string; price: number }
class Robot { constructor(public name: string) {} }

function greet(p: Person) { return \`Hello, \${p.name}\`; }

const laptop: Product = { name: "Laptop", price: 900 };
console.log(greet(laptop));                  // extra property is fine
console.log(greet(new Robot("R2")));         // a class instance with the same shape
const fake: Robot = { name: "not really a Robot" };
console.log(fake instanceof Robot);`,
            output: `Hello, Laptop
Hello, R2
false`,
          },
        ],
        pitfalls: [
          'A type match says nothing about runtime class: `fake` above passes the type check but `instanceof` is false.',
          'Different meanings with the same shape (`UserId`, `OrderId`) are not protected — use branded types.',
        ],
        followUps: [
          'What are branded types?',
          'Why do object literals sometimes reject extra properties?',
        ],
      },
      related: ['ts-excess-property-checks', 'ts-type-vs-interface'],
    },
    {
      id: 'ts-optional-readonly-properties',
      level: 'foundation',
      priority: 2,
      question: 'How do optional (`?`) and `readonly` properties work?',
      tags: ['optional-properties', 'readonly', 'objects', 'interfaces'],
      answer: {
        interview: `**\`prop?: T\` means the property may be missing (its type includes \`undefined\`); \`readonly prop: T\` means it cannot be reassigned after creation.**

- Reading an optional property gives \`T | undefined\`, so you must handle the missing case (\`??\`, \`?.\`, a check).
- \`readonly\` is compile-time only and **shallow**: \`readonly tags: string[]\` stops \`obj.tags = []\` but not \`obj.tags.push()\` — use \`readonly string[]\` for that.
- \`Partial<T>\` makes every property optional; \`Readonly<T>\` makes every property readonly.
- Optional parameters work the same way: \`function f(x?: number)\`.

Real-world: an update DTO is \`Partial<User>\`; an entity’s \`readonly id\` must never change after creation.`,
        explanationBn: `**Optional (\`?\`):** property থাকতেও পারে, না-ও পারে। পড়লে type হয় \`T | undefined\`, তাই ব্যবহারের আগে "না থাকলে কী করব" ঠিক করতে হয় — \`??\` দিয়ে default, বা \`?.\`।

**\`readonly\`:** তৈরির পর আর নতুন value বসানো যাবে না। \`id\`-এর মতো জিনিসের জন্য উপযুক্ত।

দুটো সতর্কতা:
1. **শুধু compile time।** Runtime-এ কোনো বাধা নেই — \`Object.freeze\` না।
2. **Shallow (অগভীর)।** \`readonly tags: string[]\` মানে \`tags\`-এ নতুন array বসানো যাবে না, কিন্তু ভেতরের array-তে \`push\` করা যাবে! ভেতরটাও আটকাতে \`readonly string[]\` লিখতে হয়।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface Profile {
  readonly id: number;
  name: string;
  bio?: string;
  readonly tags: string[];
}

const p: Profile = { id: 1, name: "Rafi", tags: [] };
console.log(p.bio ?? "(no bio)", p.bio?.length);

// @ts-expect-error ❌ Cannot assign to 'id' because it is a read-only property.
p.id = 2;
p.tags.push("admin");             // allowed: readonly is shallow
console.log(p.tags);`,
            output: `(no bio) undefined
[ 'admin' ]`,
          },
        ],
        pitfalls: [
          '`readonly` does not deep-freeze nested objects or arrays.',
          'With `exactOptionalPropertyTypes`, `bio?: string` no longer accepts an explicit `undefined`.',
        ],
        followUps: [
          'How do you make a type deeply readonly?',
          'What is the difference between `bio?: string` and `bio: string | undefined`?',
        ],
      },
      related: ['ts-optional-vs-undefined', 'ts-readonly-vs-const'],
    },
    {
      id: 'ts-extends-vs-intersection',
      level: 'foundation',
      priority: 2,
      question: 'How do you combine or extend object types? Compare `extends` and `&`.',
      tags: ['extends', 'intersection', 'interfaces', 'composition'],
      answer: {
        interview: `**\`interface B extends A\` creates a subtype with A’s members plus new ones; \`type B = A & C\` (intersection) creates a type that has all members of both.**

- Both are commonly used for composing shapes: \`interface Admin extends User { permissions: string[] }\`.
- An interface can extend several interfaces and even object-shaped type aliases.
- Conflicts: \`extends\` errors immediately if a property type is incompatible; \`&\` intersects the property types (possibly to \`never\`) without an error at the declaration.
- Intersections also work with unions and generics (\`T & { id: string }\`), which \`extends\` cannot express inline.

Real-world: \`type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date }\` adds fields to any entity.`,
        explanationBn: `দুটোই "এর সব + আরও কিছু" বানায়।

- **\`extends\`** — interface-এর উত্তরাধিকার: \`Admin extends User\` মানে User-এর সব property, সাথে নতুন কিছু। কোনো property-র type সংঘর্ষ হলে তখনই স্পষ্ট error।
- **\`&\` (intersection)** — দুটো type মিলিয়ে একটা, যাতে দুটোর সব property আছে। Generic-এর সাথে খুব কাজের: \`T & { id: string }\` — যেকোনো type-এ id যোগ।

পার্থক্য সংঘর্ষে: \`&\`-এ একই property দুই type-এ আলাদা হলে (\`string\` আর \`number\`) কোনো error হয় না, property-টা \`never\` হয়ে যায় — সমস্যা ধরা পড়ে অনেক পরে। তাই সাধারণ inheritance-এ \`extends\` বেশি নিরাপদ।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface User { id: number; name: string }
interface Admin extends User { permissions: string[] }

type WithTimestamps<T> = T & { createdAt: Date };

const admin: Admin = { id: 1, name: "Rafi", permissions: ["delete"] };
const saved: WithTimestamps<User> = { id: 2, name: "Nadia", createdAt: new Date(0) };

console.log(admin.permissions, saved.createdAt.toISOString());
// @ts-expect-error ❌ Property 'permissions' is missing in type 'User' but required in type 'Admin'.
const notAdmin: Admin = { id: 3, name: "Sam" } as User;`,
            output: `[ 'delete' ] 1970-01-01T00:00:00.000Z`,
          },
        ],
        pitfalls: [
          'Conflicting properties in an intersection become `never` silently.',
          'Deep `&` chains make error messages long and slow the checker; prefer `extends` for hierarchies.',
        ],
        followUps: ['What does `A & B` produce if A and B are unions?'],
      },
      related: ['ts-type-vs-interface'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'ts-excess-property-checks',
      level: 'intermediate',
      priority: 2,
      question:
        'Why does TypeScript reject an extra property in an object literal but accept it from a variable?',
      tags: ['excess-property-checks', 'structural-typing', 'object-literals', 'freshness'],
      answer: {
        interview: `**Excess property checking applies only to *fresh* object literals assigned directly to a typed target, because an unknown property there is almost certainly a typo.**

- \`createUser({ name: "Rafi", emial: "x" })\` → error: \`'emial' does not exist in type\`.
- The same object stored in a variable first, then passed, compiles — normal structural typing allows extra properties.
- It catches typos in optional properties, which structural typing alone would miss.
- Ways around it when you really need extras: an index signature, a wider type, or (rarely) a type assertion.

Real-world: a misspelled option like \`{ retires: 3 }\` instead of \`retries\` is caught at the call site.`,
        explanationBn: `Structural typing বলে বাড়তি property সমস্যা না। তাহলে object literal-এ কেন error?

কারণ: সরাসরি লেখা object literal-এ (**"fresh"** object) অজানা property প্রায় সবসময়ই **বানান ভুল**। ধরুন option গুলো সব optional — \`{ retries?: number }\`। আপনি লিখলেন \`{ retires: 3 }\`। Structural নিয়মে এটা বৈধ (কোনো required property বাদ নেই), অথচ আপনার setting কাজই করবে না! Excess property check এই ভুলটা ধরে।

কিন্তু object আগে variable-এ রাখলে সেটা আর fresh না — হয়তো অন্য কাজে আরও property সহ বানানো হয়েছে। তখন TypeScript স্বাভাবিক structural নিয়মে চলে, বাড়তি property মেনে নেয়।

এটা কোনো ফাঁক না, ইচ্ছাকৃত নকশা: যেখানে typo-র সম্ভাবনা সবচেয়ে বেশি, শুধু সেখানেই কড়াকড়ি।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface Options { retries?: number; timeout?: number }
const connect = (o: Options) => \`retries=\${o.retries ?? 0}\`;

// @ts-expect-error ❌ Object literal may only specify known properties, but 'retires' does not exist in type 'Options'. Did you mean to write 'retries'?
connect({ retires: 3 });

const fromElsewhere = { retries: 2, label: "db" };
console.log(connect(fromElsewhere));      // not fresh: extra 'label' is fine`,
            output: `retries=2`,
          },
        ],
        pitfalls: [
          'Assigning through a variable bypasses the check, so typos there slip through.',
          'Spreading (`{ ...base, extra: 1 }`) creates a fresh literal, so the check applies again.',
        ],
        followUps: [
          'What is a "fresh" object literal?',
          'How do you allow arbitrary extra keys on purpose?',
        ],
      },
      related: ['ts-structural-typing', 'ts-index-signatures-record'],
    },
    {
      id: 'ts-index-signatures-record',
      level: 'intermediate',
      priority: 2,
      question:
        'How do you type an object with dynamic keys? Compare index signatures and `Record`.',
      tags: ['index-signatures', 'record', 'dictionaries', 'no-unchecked-indexed-access'],
      answer: {
        interview: `**Use an index signature (\`{ [key: string]: number }\`) or \`Record<K, V>\`; with a union of keys, \`Record\` also forces every key to be present.**

- \`Record<string, number>\` is the same as \`{ [key: string]: number }\`.
- \`Record<"light" | "dark", string>\` requires **exactly** those keys — great for exhaustive maps.
- Reading \`dict[key]\` returns \`V\`, not \`V | undefined\`, even if the key is missing — unless you enable \`noUncheckedIndexedAccess\`.
- For truly dynamic data, a \`Map<K, V>\` is often clearer, and \`map.get()\` correctly returns \`V | undefined\`.

Real-world: \`const labels: Record<Status, string>\` — adding a new \`Status\` member forces you to add its label.`,
        explanationBn: `Key আগে থেকে জানা না থাকলে (যেমন user id → score) index signature লাগে: \`{ [key: string]: number }\` — "যেকোনো string key, value number"। \`Record<string, number>\` হুবহু একই জিনিস, লিখতে সহজ।

**\`Record\`-এর আসল শক্তি — union key:** \`Record<"light" | "dark", string>\` মানে ঠিক এই দুটো key **থাকতেই হবে**। পরে union-এ \`"system"\` যোগ করলে সব \`Record\` object-এ error আসবে যেখানে "system" নেই — কিছু ভুলে যাওয়ার সুযোগ নেই।

**ফাঁদ:** \`scores["unknown-id"]\` — key না থাকলে runtime-এ \`undefined\`, কিন্তু TypeScript type বলে \`number\`! মিথ্যা নিরাপত্তা। \`noUncheckedIndexedAccess\` চালু করলে type হয় \`number | undefined\`, তখন চেক করতে বাধ্য।`,
        examples: [
          {
            lang: 'typescript',
            code: `type Theme = "light" | "dark";
const background: Record<Theme, string> = { light: "#fff", dark: "#000" };

// @ts-expect-error ❌ Property 'dark' is missing in type '{ light: string; }' but required in type 'Record<Theme, string>'.
const incomplete: Record<Theme, string> = { light: "#fff" };

const scores: { [userId: string]: number } = { u1: 90 };
const missing = scores["u2"];             // typed as number, actually undefined
console.log(background.dark, missing, typeof missing);

const scoreMap = new Map<string, number>([["u1", 90]]);
console.log(scoreMap.get("u2") ?? 0);     // get() returns number | undefined`,
            output: `#000 undefined undefined
0`,
          },
        ],
        pitfalls: [
          'Without `noUncheckedIndexedAccess`, indexing a dictionary pretends every key exists.',
          'An index signature forces every declared property to match the value type.',
        ],
        followUps: [
          'What does `noUncheckedIndexedAccess` do?',
          'When would you choose `Map` over `Record`?',
        ],
      },
      related: ['ts-excess-property-checks'],
    },
    {
      id: 'ts-readonly-vs-const',
      level: 'intermediate',
      priority: 1,
      question:
        'What is the difference between `const`, `readonly`, `Readonly<T>` and `Object.freeze`?',
      tags: ['readonly', 'const', 'object-freeze', 'immutability'],
      answer: {
        interview: `**\`const\` protects a variable binding; \`readonly\`/\`Readonly<T>\` protect properties at compile time; \`Object.freeze\` protects properties at runtime. All of them are shallow.**

- \`const user = {...}\` — you cannot reassign \`user\`, but you can change \`user.name\`.
- \`readonly name\` / \`Readonly<User>\` — the compiler rejects \`user.name = ...\`; nothing exists at runtime.
- \`Object.freeze(obj)\` — runtime: assignments are ignored (or throw in strict mode); its return type is \`Readonly<T>\`.
- \`ReadonlyArray<T>\` / \`readonly T[]\` remove mutating array methods.
- For deep immutability, write a recursive \`DeepReadonly<T>\` type (and freeze recursively if you need runtime safety).

Real-world: props and state in React are treated as readonly; Redux Toolkit freezes state in development.`,
        explanationBn: `চারটা জিনিস চার স্তরে কাজ করে:

| | কী আটকায় | কখন |
|---|---|---|
| \`const\` | variable-এ নতুন value বসানো | compile + runtime |
| \`readonly\` / \`Readonly<T>\` | property বদলানো | শুধু compile time |
| \`Object.freeze\` | property বদলানো | runtime |

\`const\` নিয়ে সবচেয়ে common ভুল ধারণা: "const object বদলানো যায় না"। আসলে \`const\` শুধু variable-টাকে অন্য object-এ যেতে দেয় না — object-এর ভেতরটা পুরোপুরি বদলানো যায়।

চারটাই **shallow** — nested object-এর ভেতরে কেউ পৌঁছায় না। গভীরভাবে আটকাতে recursive type (\`DeepReadonly\`) আর recursive freeze লাগে।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface Settings { theme: string; nested: { size: number } }

const s: Settings = { theme: "dark", nested: { size: 1 } };
s.theme = "light";                         // const does not protect properties

const r: Readonly<Settings> = s;
// @ts-expect-error ❌ Cannot assign to 'theme' because it is a read-only property.
r.theme = "blue";
r.nested.size = 2;                         // shallow: nested is still mutable

"use strict";
const frozen = Object.freeze({ theme: "dark" });
try {
  (frozen as { theme: string }).theme = "light";
} catch (e) {
  console.log((e as Error).name);
}
console.log(s.theme, s.nested.size, frozen.theme);`,
            output: `TypeError
blue 2 dark`,
          },
        ],
        pitfalls: [
          '`r.theme = "blue"` above compiled away and still ran — `readonly` is only a compile-time promise.',
          '`Readonly<T>` and `Object.freeze` are shallow.',
        ],
        followUps: ['How would you write `DeepReadonly<T>`?'],
      },
      related: ['ts-optional-readonly-properties'],
    },
    {
      id: 'ts-optional-vs-undefined',
      level: 'intermediate',
      priority: 1,
      question: 'What is the difference between `name?: string` and `name: string | undefined`?',
      tags: ['optional-properties', 'undefined', 'exact-optional-property-types'],
      answer: {
        interview: `**\`name?: string\` means the key may be absent; \`name: string | undefined\` means the key must be present, though its value may be \`undefined\`.**

- \`{}\` satisfies \`{ name?: string }\` but not \`{ name: string | undefined }\` — you must write \`{ name: undefined }\`.
- Same for parameters: \`f(x?: number)\` can be called as \`f()\`; \`f(x: number | undefined)\` requires an argument.
- At runtime the difference shows in \`"name" in obj\`, \`Object.keys\` and \`JSON.stringify\`.
- With \`exactOptionalPropertyTypes\`, \`name?: string\` also forbids assigning \`undefined\` explicitly.

Real-world: use \`| undefined\` when callers must consciously pass "no value" (e.g. "clear this field" in an update).`,
        explanationBn: `দেখতে একই, কিন্তু অর্থ আলাদা:
- **\`name?: string\`** — key-টা **না থাকলেও চলবে**।
- **\`name: string | undefined\`** — key-টা **থাকতেই হবে**, শুধু value \`undefined\` হতে পারে।

Function parameter-এও একই: \`x?\` হলে argument না দিলেও চলে, \`x: number | undefined\` হলে কিছু একটা (অন্তত \`undefined\`) দিতেই হবে।

এটা কেন জরুরি? Runtime-এ key-টার থাকা বা না থাকা আলাদা আচরণ দেয় — \`"name" in obj\`, \`Object.keys\`, আর \`JSON.stringify\` (\`undefined\` value বাদ পড়ে, কিন্তু PATCH API-তে "এই field মুছে দাও" আর "এই field ছুঁয়ো না" — দুটো আলাদা অর্থ)।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface A { name?: string }
interface B { name: string | undefined }

const a: A = {};
// @ts-expect-error ❌ Property 'name' is missing in type '{}' but required in type 'B'.
const b0: B = {};
const b: B = { name: undefined };

console.log("name" in a, "name" in b, Object.keys(b));

function optional(x?: number) { return x ?? "none"; }
function required(x: number | undefined) { return x ?? "none"; }
// @ts-expect-error ❌ Expected 1 arguments, but got 0.
required();
console.log(optional(), required(undefined));`,
            output: `false true [ 'name' ]
none none`,
          },
        ],
        pitfalls: [
          'Spreading `{ ...defaults, ...{ name: undefined } }` overwrites the default with `undefined`.',
        ],
        followUps: ['What does `exactOptionalPropertyTypes` change?'],
      },
      related: ['ts-optional-readonly-properties'],
    },
    {
      id: 'ts-declaration-merging',
      level: 'intermediate',
      priority: 1,
      question: 'What is declaration merging, and how do you use it to extend third-party types?',
      tags: ['declaration-merging', 'interfaces', 'module-augmentation', 'global'],
      answer: {
        interview: `**When TypeScript sees several declarations with the same name, it merges them into one definition — most usefully, multiple \`interface\` declarations combine their members.**

- Two \`interface Config\` blocks in the same scope become one interface with all properties.
- Libraries rely on it: you add fields to \`Window\` with \`declare global { interface Window { ... } }\`, or to Express’s \`Request\` via module augmentation.
- Namespaces merge with functions, classes and enums (e.g. a function with static properties).
- \`type\` aliases never merge — redeclaring one is an error.

Real-world: typing \`window.dataLayer\` for analytics, or \`req.user\` added by an auth middleware.`,
        explanationBn: `একই নামে একাধিক declaration থাকলে TypeScript সেগুলো জোড়া লাগিয়ে একটা বানায়। সবচেয়ে common: interface merging।

এটা কেন দরকার? ধরুন একটা library \`Request\` interface দেয়, আর আপনার auth middleware \`req.user\` যোগ করে। Library-র code বদলাতে পারবেন না — কিন্তু নিজের file-এ একই নামে interface লিখে \`user\` property যোগ করলে TypeScript দুটো মিলিয়ে নেয়। Browser-এ \`window\`-এ নিজের global বসানোর ক্ষেত্রেও একই কৌশল: \`declare global { interface Window { ... } }\`।

এজন্যই library-র public type সাধারণত \`interface\` দিয়ে লেখা হয় — ব্যবহারকারী বাড়াতে পারে। \`type\` কখনো merge হয় না।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface AppConfig { apiUrl: string }
interface AppConfig { retries: number }      // merged into the same interface

const config: AppConfig = { apiUrl: "/api", retries: 3 };

declare global {
  interface Array<T> {
    last(): T | undefined;                    // augment a built-in type
  }
}
Array.prototype.last = function () { return this[this.length - 1]; };

console.log(config, [1, 2, 3].last());`,
            output: `{ apiUrl: '/api', retries: 3 } 3`,
          },
        ],
        pitfalls: [
          'Merging is silent: two unrelated libraries using the same global interface name combine.',
          'Augmenting built-ins with methods (as above) is fine for learning, risky in shared code.',
        ],
        followUps: ['What is module augmentation?', 'Why can’t type aliases merge?'],
      },
      related: ['ts-type-vs-interface'],
    },
    {
      id: 'ts-object-entries-typing',
      level: 'intermediate',
      priority: 1,
      question:
        'How are `Object.keys` and `Object.entries` typed, and how do you iterate an object type-safely?',
      tags: ['object-entries', 'object-keys', 'index-signatures', 'iteration'],
      answer: {
        interview: `**\`Object.keys\` always returns \`string[]\`, and \`Object.entries\` returns \`[string, T][]\` only when the object type has an index signature — otherwise \`[string, any][]\`.**

- Structural typing means an object may have extra keys at runtime, so TypeScript cannot promise \`(keyof T)[]\`.
- Type aliases of object literals get an *implicit* index signature; **interfaces do not** — so \`Object.entries\` on an interface value gives \`any\` values.
- Safe options: iterate over a known key list (\`as const\` array), use a \`Record<K, V>\`, or a \`Map\`.
- A local helper \`typedEntries<T>(o: T) => Object.entries(o) as [keyof T, T[keyof T]][]\` is fine when you control the object’s origin.

Real-world: rendering a settings form from a config object with a fixed key list.`,
        explanationBn: `অনেকের প্রশ্ন: "\`Object.keys(user)\` কেন \`(keyof User)[]\` না?" কারণ structural typing — \`User\` type-এর value-তে runtime-এ বাড়তি key থাকতে পারে, তাই TypeScript সৎভাবে \`string[]\` বলে।

\`Object.entries\`-এ একটা সূক্ষ্ম পার্থক্য আছে যা অনেকেই জানেন না:
- **\`type\` দিয়ে লেখা object type**-এর implicit index signature থাকে → \`[string, number][]\`।
- **\`interface\`**-এর থাকে না (কারণ interface পরে merge হয়ে বাড়তে পারে) → \`[string, any][]\` — value-গুলো \`any\`!

নিরাপদ উপায়: জানা key-র \`as const\` তালিকার ওপর loop, \`Record\` বা \`Map\` ব্যবহার, অথবা নিজের ছোট typed helper — যেখানে আপনি জানেন object-এ বাড়তি key নেই।`,
        examples: [
          {
            lang: 'typescript',
            code: `type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;

interface SizeI { width: number; height: number }
type SizeT = { width: number; height: number };
const si: SizeI = { width: 2, height: 3 };
const st: SizeT = { width: 2, height: 3 };

const fromInterface = Object.entries(si);
const fromAlias = Object.entries(st);
type _1 = Assert<Equal<typeof fromInterface, [string, any][]>>;
type _2 = Assert<Equal<typeof fromAlias, [string, number][]>>;
type _3 = Assert<Equal<ReturnType<typeof Object.keys>, string[]>>;

const KEYS = ["width", "height"] as const;
const area = KEYS.reduce((acc, key) => acc * si[key], 1);   // key: "width" | "height"
console.log(fromAlias, area);`,
            output: `[ [ 'width', 2 ], [ 'height', 3 ] ] 6`,
          },
        ],
        pitfalls: [
          'Casting `Object.keys(obj) as (keyof T)[]` is a lie whenever the object has extra properties.',
        ],
        followUps: ['Why don’t interfaces have implicit index signatures?'],
      },
      related: ['ts-out-object-keys-string', 'ts-index-signatures-record', 'ts-type-vs-interface'],
    },
  ],
});

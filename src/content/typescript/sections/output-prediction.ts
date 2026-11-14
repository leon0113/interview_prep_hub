import { defineSection, type SectionQuestion } from '../../define';
import type { Level, Priority } from '../../schema';

/**
 * "It compiles — what does it print?" puzzles. Every puzzle type-checks cleanly under `strict`,
 * then does something surprising at runtime because types are erased or the type system is
 * deliberately unsound. The code is repeated as the first example, so `npm run verify:outputs`
 * both type-checks it and checks the revealed output against Node.
 */
function puzzle(p: {
  id: string;
  level: Level;
  priority: Priority;
  title: string;
  tags: string[];
  code: string;
  output: string;
  why: string;
  explanationBn: string;
  pitfalls?: string[];
  followUps?: string[];
  related?: string[];
}): SectionQuestion {
  return {
    id: p.id,
    level: p.level,
    priority: p.priority,
    question: `${p.title}\n\n\`\`\`typescript\n${p.code}\n\`\`\``,
    tags: ['output-prediction', ...p.tags],
    answer: {
      interview: `**It compiles without errors. Output:**\n\n\`\`\`text\n${p.output}\n\`\`\`\n\n${p.why}`,
      explanationBn: p.explanationBn,
      examples: [
        {
          lang: 'typescript',
          code: p.code,
          output: p.output,
          caption: 'The puzzle — type-checked with strict and run on Node.js',
        },
      ],
      pitfalls: p.pitfalls,
      followUps: p.followUps,
    },
    related: p.related,
  };
}

export const outputPrediction = defineSection({
  id: 'ts-output-prediction',
  title: 'Compiles, But…',
  description:
    'Puzzles where the code type-checks under `strict` yet behaves surprisingly at runtime. Each one teaches where TypeScript’s guarantees end.',
  order: 8,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    puzzle({
      id: 'ts-out-any-contagious',
      level: 'foundation',
      priority: 2,
      title: '`any` meets a `number` annotation. What does this print?',
      tags: ['any', 'type-safety', 'coercion'],
      code: `const data: any = JSON.parse('{"price": "100"}');
const total: number = data.price + 50;

console.log(total, typeof total);
console.log(total.toFixed(2));`,
      output: `10050 string
TypeError: total.toFixed is not a function`,
      why: `- \`data\` is \`any\`, so \`data.price + 50\` is also \`any\` — and \`any\` is assignable to \`number\` without a check.
- At runtime \`price\` is the **string** \`"100"\`, so \`+\` concatenates: \`"10050"\`.
- The annotation \`: number\` is a lie the compiler cannot detect; the crash happens later, on \`toFixed\`.
- Fix: type the parsed JSON as \`unknown\` and validate it (or convert with \`Number(...)\`).`,
      explanationBn: `\`any\` type checker-কে পুরো বন্ধ করে দেয় — আর সেটা **ছড়িয়ে পড়ে**: \`any\` থেকে পড়া সবকিছুই \`any\`।

ধাপে ধাপে:
1. JSON-এ \`price\` আসলে string \`"100"\`, কিন্তু \`data: any\` হওয়ায় TypeScript কিছু জানে না।
2. \`data.price + 50\` — type \`any\`। \`any\`-কে \`number\`-এ বসাতে কোনো আপত্তি নেই।
3. Runtime-এ string + number = string concatenation → \`"10050"\`।
4. \`total\`-এর type বলছে number, আসলে string — \`toFixed\` নেই, crash।

শিক্ষা: annotation লিখলেই value সেই type হয়ে যায় না। বাইরের data-কে \`unknown\` ধরুন আর যাচাই করুন।`,
      pitfalls: ['A single `any` can silently invalidate every annotation downstream of it.'],
      followUps: ['How would you rewrite this so the compiler catches the bug?'],
      related: ['ts-any-unknown-never', 'ts-runtime-validation'],
    }),
    puzzle({
      id: 'ts-out-array-index',
      level: 'foundation',
      priority: 2,
      title: 'Indexing an empty array. Does the compiler stop this?',
      tags: ['arrays', 'no-unchecked-indexed-access', 'undefined'],
      code: `interface Order { id: number; total: number }
const orders: Order[] = [];

const latest = orders[orders.length - 1];
console.log(latest);
console.log(latest.total);`,
      output: `undefined
TypeError: Cannot read properties of undefined (reading 'total')`,
      why: `- Without \`noUncheckedIndexedAccess\`, \`orders[i]\` is typed \`Order\`, never \`Order | undefined\`.
- The array is empty, so \`orders[-1]\` is \`undefined\` at runtime.
- \`strict\` does not include \`noUncheckedIndexedAccess\` — enable it, or use \`orders.at(-1)\`, which is typed \`Order | undefined\`.`,
      explanationBn: `TypeScript ধরে নেয় index দিয়ে পড়লে element সবসময় আছে — \`orders[i]\`-এর type \`Order\`। খালি array-তে runtime-এ আসে \`undefined\`, আর \`.total\` পড়তেই crash।

\`strict\` চালু থাকলেও এটা ধরা পড়ে না, কারণ \`noUncheckedIndexedAccess\` \`strict\`-এর অংশ না।

দুটো সমাধান:
- tsconfig-এ \`noUncheckedIndexedAccess\` চালু করা — তখন \`latest\` হয় \`Order | undefined\`।
- \`orders.at(-1)\` ব্যবহার — এর return type আগে থেকেই \`Order | undefined\`, আর শেষ element পাওয়াও সহজ।`,
      related: ['ts-no-unchecked-indexed-access'],
    }),
    puzzle({
      id: 'ts-out-numeric-enum-keys',
      level: 'foundation',
      priority: 1,
      title: 'Listing the members of a numeric enum. What does this print?',
      tags: ['enums', 'reverse-mapping', 'object-keys'],
      code: `enum Priority { Low, Medium, High }

console.log(Object.keys(Priority));
console.log(Object.values(Priority).length);
console.log(Priority[Priority.High]);`,
      output: `[ '0', '1', '2', 'Low', 'Medium', 'High' ]
6
High`,
      why: `- A numeric enum compiles to an object with a **reverse mapping**: \`Priority.Low = 0\` and \`Priority[0] = "Low"\`.
- So it has six keys: the three numbers (as strings, listed first because they are integer-like) and the three names.
- \`Priority[Priority.High]\` → \`Priority[2]\` → \`"High"\`.
- To list members, filter: \`Object.keys(Priority).filter((k) => isNaN(Number(k)))\` — or use a string enum / \`as const\` object.`,
      explanationBn: `Numeric enum থেকে TypeScript দুই দিকের mapping-ওয়ালা object বানায়:
\`\`\`js
{ 0: "Low", 1: "Medium", 2: "High", Low: 0, Medium: 1, High: 2 }
\`\`\`
তাই key ছয়টা। Integer-এর মতো দেখতে key (\`"0"\`, \`"1"\`) object-এ সবসময় আগে আসে, তারপর বাকি key লেখার ক্রমে — JavaScript-এর property order-এর নিয়ম।

\`Priority[Priority.High]\` → \`Priority[2]\` → \`"High"\` — reverse mapping-এর কাজ।

Dropdown-এর option বানাতে enum-এর ওপর loop চালালে এই কারণে duplicate দেখা যায় — common bug। String enum-এ reverse mapping নেই।`,
      related: ['ts-enums-vs-unions'],
    }),
    puzzle({
      id: 'ts-out-tuple-push',
      level: 'foundation',
      priority: 1,
      title: 'A fixed-length tuple and `push`. What does this print?',
      tags: ['tuples', 'readonly', 'arrays'],
      code: `const pair: [string, number] = ["age", 30];
pair.push(99);

console.log(pair.length, pair);
const [, second, third] = pair as unknown as unknown[];
console.log(second, third);`,
      output: `3 [ 'age', 30, 99 ]
30 99`,
      why: `- Tuple types still inherit array methods, so \`push\` with a \`string | number\` argument type-checks.
- Tuples are plain arrays at runtime — nothing enforces the length.
- After the push the type still says length 2, but the array has 3 items.
- Fix: declare it \`readonly [string, number]\`, which removes \`push\` entirely.`,
      explanationBn: `Tuple-এর দৈর্ঘ্যের নিয়ম শুধু **assignment-এর সময়** চেক হয় — \`["age", 30, 99]\` সরাসরি বসাতে গেলে error। কিন্তু tuple-ও তো array, তাই \`push\`, \`pop\` method গুলো থেকে যায়, আর \`push\` বৈধ type-এর (\`string | number\`) value নেয় — compiler আপত্তি করে না।

Runtime-এ কোনো tuple নেই, সাধারণ array — তাই তিনটা element। Type বলছে দুটো, বাস্তবে তিনটা।

সমাধান: \`readonly [string, number]\` — readonly tuple-এ \`push\` method-ই থাকে না। React-এর \`useState\` ধরনের return value-তে \`as const\` দিলে readonly tuple আসে।`,
      related: ['ts-arrays-tuples'],
    }),

    // ──────────────────────────── Intermediate ────────────────────────────
    puzzle({
      id: 'ts-out-extra-props-leak',
      level: 'intermediate',
      priority: 2,
      title: 'Narrowing an object to a "public" type. What gets sent?',
      tags: ['structural-typing', 'excess-property-checks', 'security', 'json'],
      code: `interface PublicUser { id: number; name: string }

const dbRow = { id: 1, name: "Rafi", passwordHash: "x9f2..." };
const publicUser: PublicUser = dbRow;          // no error: not a fresh literal

console.log(JSON.stringify(publicUser));
console.log(Object.keys(publicUser).length);`,
      output: `{"id":1,"name":"Rafi","passwordHash":"x9f2..."}
3`,
      why: `- Structural typing: \`dbRow\` has at least \`id\` and \`name\`, so it is assignable to \`PublicUser\`.
- Excess property checks apply only to **fresh** object literals, not to variables.
- Assigning to a narrower type changes only what the compiler lets you *access* — the object keeps every property, and \`JSON.stringify\` sends them all.
- Fix: build a new object explicitly (\`{ id: row.id, name: row.name }\`) or strip fields with a schema (\`UserSchema.parse(row)\` drops unknown keys).`,
      explanationBn: `এটা একটা বাস্তব security bug-এর রূপ।

\`publicUser: PublicUser\` লিখলে মনে হয় password বাদ পড়ে গেছে। আসলে type শুধু ঠিক করে **compiler আপনাকে কী access করতে দেবে** — object-টা একই, সব property সহ। \`JSON.stringify\` type জানে না, object-এ যা আছে সব পাঠিয়ে দেয় — password hash সহ!

কেন compile error নেই? Structural typing-এ বাড়তি property সমস্যা না, আর excess property check শুধু সরাসরি লেখা object literal-এ হয়, variable-এ না।

সমাধান: API response-এ সবসময় নতুন object বানিয়ে শুধু দরকারি field দিন, অথবা schema দিয়ে parse করুন — zod-এর \`object\` অজানা key ফেলে দেয়।`,
      pitfalls: [
        '`Omit<User, "password">` as a type does not remove the property at runtime either.',
      ],
      related: ['ts-structural-typing', 'ts-excess-property-checks'],
    }),
    puzzle({
      id: 'ts-out-object-keys-string',
      level: 'intermediate',
      priority: 1,
      title: 'Why does `Object.keys` return `string[]`? What does this print?',
      tags: ['object-keys', 'structural-typing', 'keyof'],
      code: `interface Point { x: number; y: number }

function sum(p: Point): number {
  let total = 0;
  for (const key of Object.keys(p)) {
    total += p[key as keyof Point];
  }
  return total;
}

const point3d = { x: 1, y: 2, z: "oops" };
console.log(sum(point3d));`,
      output: `3oops`,
      why: `- Because of structural typing, a \`Point\` value may carry extra properties (\`z\` here).
- That is exactly why \`Object.keys\` returns \`string[]\`, not \`(keyof Point)[]\` — TypeScript cannot promise there are no other keys.
- The \`as keyof Point\` assertion overrides that caution, \`p["z"]\` is the string \`"oops"\`, and \`3 + "oops"\` concatenates.
- Fix: iterate over known keys (\`(["x", "y"] as const).map(...)\`) instead of asserting \`Object.keys\`.`,
      explanationBn: `অনেকে বিরক্ত হন: "\`Object.keys(p)\` কেন \`(keyof Point)[]\` দেয় না?" এই puzzle সেই প্রশ্নের উত্তর।

Structural typing-এ \`Point\` type-এর value-তে **বাড়তি property থাকতে পারে** — \`point3d\`-এ \`z\` আছে, তবুও সে বৈধ \`Point\`। তাই runtime-এ \`Object.keys\` যেকোনো key দিতে পারে, আর TypeScript সৎভাবে \`string[]\` বলে।

\`as keyof Point\` লিখে আমরা সেই সতর্কতা উপেক্ষা করলাম। Loop-এ \`z\` এল, \`p["z"]\` = \`"oops"\`, আর \`3 + "oops"\` = \`"3oops"\` — return type number, আসলে string।

শিক্ষা: \`Object.keys\`-এর ফলাফলে \`as keyof T\` লেখা একটা assertion — সতর্ক থাকুন।`,
      related: ['ts-structural-typing', 'ts-keyof-typeof'],
    }),
    puzzle({
      id: 'ts-out-numeric-enum-any-number',
      level: 'intermediate',
      priority: 1,
      title: 'Passing a number to a numeric-enum parameter. What does this print?',
      tags: ['enums', 'type-safety', 'numbers'],
      code: `enum Role { Viewer, Editor, Admin }

function label(role: Role): string {
  return Role[role] ?? "unknown";
}

const fromApi: number = 7;
console.log(label(Role.Admin), label(fromApi));`,
      output: `Admin unknown`,
      why: `- Numeric enums are deliberately loose: any \`number\` value is assignable to a numeric enum type.
- (Since TS 5.0, an out-of-range *literal* like \`label(7)\` is an error — but a value typed \`number\` still passes.)
- So the function receives \`7\`, and \`Role[7]\` is \`undefined\` — the \`?? "unknown"\` fallback saves us here.
- String enums or string-literal unions do not have this hole.`,
      explanationBn: `Numeric enum-এ একটা ইচ্ছাকৃত ফাঁক আছে: \`number\` type-এর যেকোনো value enum type-এ বসানো যায় — bit flag-এর মতো ব্যবহার (\`Read | Write\`) সমর্থন করার জন্য।

TS 5.0 থেকে সরাসরি literal (\`label(7)\`) লিখলে error আসে, কারণ compiler জানে 7 কোনো member না। কিন্তু value যদি সাধারণ \`number\` হয় (API থেকে আসা), compiler চুপ।

তাই \`Role[7]\` → \`undefined\`। এখানে \`??\` fallback থাকায় crash হয়নি, না থাকলে \`undefined\` আরও দূরে গিয়ে সমস্যা করত।

String enum বা \`"viewer" | "editor"\` union-এ এই সমস্যা নেই — আরেকটা কারণ যে অনেক team numeric enum এড়িয়ে চলে।`,
      related: ['ts-enums-vs-unions', 'ts-out-numeric-enum-keys'],
    }),
    puzzle({
      id: 'ts-out-definite-assignment',
      level: 'intermediate',
      priority: 1,
      title: 'A class field with `!`. What does this print?',
      tags: ['classes', 'definite-assignment', 'strict-property-initialization'],
      code: `class Session {
  token!: string;                  // "trust me, it will be set"

  load(raw: string) { this.token = raw; }
  header() { return "Bearer " + this.token.slice(0, 4); }
}

const s = new Session();
console.log(Object.keys(s), s.token);
console.log(s.header());`,
      output: `[ 'token' ] undefined
TypeError: Cannot read properties of undefined (reading 'slice')`,
      why: `- \`strictPropertyInitialization\` would normally reject \`token: string\` without an initializer.
- The definite assignment assertion \`!\` silences that check — you promise the field will be set before use.
- Nobody called \`load()\`, so \`token\` is \`undefined\` (the key exists because class fields are defined with \`undefined\`).
- Fix: initialise it in the constructor, or type it honestly as \`token?: string\` / \`string | null\` and handle the missing case.`,
      explanationBn: `\`strict\` mode-এ class-এর field constructor-এ set না করলে error আসে। \`token!: string\`-এর \`!\` বলে: "চিন্তা কোরো না, ব্যবহারের আগে আমি নিজেই set করব" — compiler বিশ্বাস করে চুপ থাকে।

কিন্তু কেউ \`load()\` ডাকেনি। Field-টা আছে (\`Object.keys\`-এ দেখা যায়, কারণ আধুনিক class field শুরুতেই \`undefined\` দিয়ে define হয়), কিন্তু value \`undefined\`। \`.slice\` ডাকতেই crash।

\`!\` (field বা value — দুই জায়গাতেই) মানে একটা প্রতিশ্রুতি, চেক না। Dependency injection বা framework যেখানে বাইরে থেকে field set করে, শুধু সেখানেই এটা যুক্তিসঙ্গত।`,
      related: ['ts-tsconfig-strict', 'ts-null-undefined-strict'],
    }),

    // ────────────────────────────── Advanced ──────────────────────────────
    puzzle({
      id: 'ts-out-method-bivariance',
      level: 'advanced',
      priority: 1,
      title: 'Method shorthand vs a narrower parameter. Does this crash?',
      tags: ['variance', 'bivariance', 'methods', 'strict-function-types'],
      code: `interface Formatter {
  format(value: string | number): string;
}

const upper: Formatter = {
  format(value: string) {          // narrower parameter than the interface
    return value.toUpperCase();
  },
};

console.log(upper.format("ok"));
console.log(upper.format(42));`,
      output: `OK
TypeError: value.toUpperCase is not a function`,
      why: `- \`strictFunctionTypes\` checks function-typed **properties** contravariantly — but parameters of **methods** declared with method shorthand (\`format(value): string\`) are checked bivariantly.
- So a method accepting only \`string\` is accepted where \`string | number\` is promised.
- \`upper.format(42)\` is a legal call by the interface, and the implementation crashes.
- Fix: declare it as a property (\`format: (value: string | number) => string\`) — then the assignment is a compile error.`,
      explanationBn: `Interface বলছে \`format\` string **বা** number নেবে। আমাদের implementation শুধু string সামলাতে পারে। এটা স্পষ্টতই ভুল — তবুও compile হয়!

কারণ: **method syntax-এ লেখা** (\`format(value): string\`) parameter TypeScript দুই দিকেই (bivariant) মেনে নেয়। পুরনো code আর DOM type-এর সাথে সামঞ্জস্য রাখতে এটা ইচ্ছাকৃত ফাঁক। \`strictFunctionTypes\` শুধু **property syntax**-এ (\`format: (value) => string\`) কড়া চেক করে।

ফলাফল: interface অনুযায়ী \`format(42)\` সম্পূর্ণ বৈধ call, কিন্তু implementation \`toUpperCase\` ডাকে number-এর ওপর → crash।

সমাধান: interface-এ method-কে property হিসেবে লিখুন — তখন ভুল implementation compile time-এই ধরা পড়ে। (typescript-eslint-এর \`method-signature-style\` rule এটা enforce করে।)`,
      related: ['ts-variance'],
    }),
  ],
});

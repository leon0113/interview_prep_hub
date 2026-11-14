import { defineSection } from '../../define';

export const configTooling = defineSection({
  id: 'ts-config-tooling',
  title: 'Configuration, Modules & Tooling',
  description:
    'The tsconfig flags that matter, declaration files, type-only imports, runtime validation, how TypeScript is compiled in modern toolchains, and migrating from JavaScript.',
  order: 7,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'ts-tsconfig-strict',
      level: 'foundation',
      priority: 2,
      question: 'What does `"strict": true` in tsconfig enable, and why should it be on?',
      tags: ['tsconfig', 'strict', 'compiler-options', 'strict-null-checks'],
      answer: {
        interview: `**\`strict\` is an umbrella flag that turns on the whole family of strict type-checking options; new projects should always enable it.**

- \`strictNullChecks\` — \`null\`/\`undefined\` must be handled explicitly (the most valuable one).
- \`noImplicitAny\` — unannotated values that would be \`any\` are errors.
- \`strictFunctionTypes\` — function parameters are checked contravariantly.
- \`strictPropertyInitialization\` — class fields must be initialised in the constructor.
- \`strictBindCallApply\`, \`noImplicitThis\`, \`useUnknownInCatchVariables\`, \`alwaysStrict\`.
- Future TypeScript versions may add more flags under \`strict\`, so upgrades can surface new errors.

Worth adding beyond \`strict\`: \`noUncheckedIndexedAccess\`, \`exactOptionalPropertyTypes\`, \`noImplicitOverride\`, \`noFallthroughCasesInSwitch\`.

Real-world: migrating an old codebase usually means enabling the strict flags one at a time.`,
        explanationBn: `\`strict: true\` একটা flag-এর মধ্যে অনেকগুলো কড়া নিয়ম একসাথে চালু করে। এটা বন্ধ থাকলে TypeScript-এর অর্ধেক সুবিধা হারিয়ে যায় — বিশেষ করে null-এর চেক।

সবচেয়ে গুরুত্বপূর্ণ গুলো:
- **\`strictNullChecks\`** — null/undefined আলাদা type; চেক না করে ব্যবহার করা যায় না। "Cannot read properties of undefined" ধরনের bug-এর বড় অংশ এখানেই আটকায়।
- **\`noImplicitAny\`** — type না লেখা parameter চুপচাপ \`any\` হয়ে যায় না, error হয়।
- **\`strictPropertyInitialization\`** — class field constructor-এ set না করলে error।
- **\`useUnknownInCatchVariables\`** — \`catch (err)\`-এ \`err\` হয় \`unknown\`।

\`strict\`-এর বাইরেও দুটো দরকারি flag: **\`noUncheckedIndexedAccess\`** (array/dictionary-র index-এ \`undefined\` সম্ভাবনা ধরা) আর **\`exactOptionalPropertyTypes\`**।

নতুন project-এ শুরু থেকেই \`strict\` চালু রাখুন — পরে চালু করা অনেক কষ্টের।`,
        examples: [
          {
            lang: 'json',
            caption: 'A sensible modern tsconfig.json for an application',
            code: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}`,
          },
          {
            lang: 'typescript',
            caption: 'Errors that `strict` catches',
            code: `class Account {
  // @ts-expect-error ❌ Property 'owner' has no initializer and is not definitely assigned in the constructor.
  owner: string;
}

// @ts-expect-error ❌ Parameter 'x' implicitly has an 'any' type.
function double(x) { return x * 2; }

const names = new Map<string, string>();
// @ts-expect-error ❌ Object is possibly 'undefined'.
names.get("rafi").toUpperCase;`,
          },
        ],
        pitfalls: [
          'Turning `strict` off to "fix" errors hides real bugs.',
          'Upgrading TypeScript can add new checks under `strict`; read release notes.',
        ],
        followUps: [
          'What does `noUncheckedIndexedAccess` add?',
          'How would you enable strict mode in a large legacy codebase?',
        ],
      },
      related: ['ts-null-undefined-strict', 'ts-no-unchecked-indexed-access'],
    },
    {
      id: 'ts-declaration-files',
      level: 'foundation',
      priority: 2,
      question: 'What are `.d.ts` declaration files and `@types` packages?',
      tags: ['declaration-files', 'd-ts', 'definitely-typed', 'declare'],
      answer: {
        interview: `**A \`.d.ts\` file contains only type information — no implementation — describing JavaScript code so TypeScript can type-check its use.**

- Libraries written in TypeScript ship \`.d.ts\` files generated with \`declaration: true\` (\`"types"\` in package.json points to them).
- JavaScript libraries get community types from **DefinitelyTyped**, installed as \`@types/<name>\` (e.g. \`@types/node\`, \`@types/lodash\`).
- \`declare\` describes something that exists at runtime but is defined elsewhere: \`declare const API_URL: string\`, \`declare function gtag(...args: unknown[]): void\`.
- \`declare module "untyped-lib"\` gives a quick (possibly \`any\`) type to a package that has none.
- \`skipLibCheck\` skips checking \`.d.ts\` files in \`node_modules\` to speed up builds.

Real-world: typing globals injected by a script tag, or env variables replaced by the bundler (\`import.meta.env\`).`,
        explanationBn: `JavaScript library-র code-এ type নেই। TypeScript তাহলে কীভাবে জানবে \`_.chunk\` কী নেয়? উত্তর: **declaration file (\`.d.ts\`)** — যেখানে শুধু type লেখা থাকে, কোনো implementation না। যেন একটা library-র "menu card": কী কী আছে আর কী কী লাগে, রান্নার পদ্ধতি না।

উৎস তিনটা:
1. **Library নিজেই TypeScript-এ লেখা** — build-এর সময় \`.d.ts\` তৈরি করে সাথে দেয়।
2. **DefinitelyTyped** — JavaScript library-র জন্য community-র লেখা type, \`npm i -D @types/lodash\`।
3. **নিজে লেখা** — \`declare\` keyword দিয়ে: "এই জিনিসটা runtime-এ কোথাও আছে, বিশ্বাস করো, এই তার type"। যেমন script tag থেকে আসা global (\`gtag\`), বা bundler-এর বসানো constant।

\`declare\` দিয়ে লেখা জিনিসের কোনো code তৈরি হয় না — তাই ভুল declare করলে runtime-এ crash, TypeScript ধরতে পারবে না।`,
        examples: [
          {
            lang: 'typescript',
            caption:
              'globals.d.ts — describing things that exist at runtime but are defined elsewhere',
            code: `declare const __APP_VERSION__: string;                  // replaced by the bundler
declare function gtag(command: "event", name: string, params?: Record<string, unknown>): void;

declare global {
  interface Window { dataLayer: unknown[] }
}

export function trackSignup(plan: string) {
  gtag("event", "sign_up", { plan, version: __APP_VERSION__ });
  window.dataLayer.push({ event: "sign_up" });
  // @ts-expect-error ❌ Argument of type '"pageview"' is not assignable to parameter of type '"event"'.
  gtag("pageview", "/home");
}`,
          },
        ],
        pitfalls: [
          '`declare` is a promise, not code — a wrong declaration compiles and crashes at runtime.',
          'Mismatched `@types/x` and `x` versions give wrong types silently.',
        ],
        followUps: [
          'What does `skipLibCheck` do?',
          'How do you add types for a package that has none?',
        ],
      },
      related: ['ts-declaration-merging', 'ts-what-is-typescript'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'ts-runtime-validation',
      level: 'intermediate',
      priority: 2,
      question:
        'TypeScript types disappear at runtime — how do you validate external data such as API responses?',
      tags: ['runtime-validation', 'zod', 'type-erasure', 'api'],
      answer: {
        interview: `**Validate at the boundary with a runtime schema (zod, valibot, ArkType…) and derive the static type from that schema, so types and checks can never drift apart.**

- Anything entering the program — \`fetch\` responses, \`JSON.parse\`, form data, env variables, \`localStorage\` — is really \`unknown\`.
- \`as User\` only silences the compiler; a schema actually checks fields and types.
- \`z.infer<typeof UserSchema>\` gives the TypeScript type for free — one source of truth.
- \`safeParse\` returns a discriminated union (\`{ success: true, data } | { success: false, error }\`) instead of throwing.
- After validation, the rest of the code can trust the types fully.

Real-world: parsing \`process.env\` at startup with a schema, so a missing variable fails fast with a clear message.`,
        explanationBn: `TypeScript-এর type compile-এর পর মুছে যায়। তাই API থেকে \`{ "id": "1" }\` (string id) এলে, \`as User\` লেখা থাকলেও কেউ আপত্তি করবে না — bug দেখা দেবে অনেক দূরে, অন্য কোথাও।

**সমাধান: সীমানায় (boundary) runtime-এ যাচাই।** বাইরে থেকে যা আসে — API, JSON, form, env variable — সব আসলে \`unknown\`। একটা schema library (zod) দিয়ে যাচাই করুন:
- Schema-টা runtime-এ আসলেই প্রতিটা field চেক করে।
- \`z.infer\` দিয়ে সেই schema থেকেই TypeScript type বের হয় — আলাদা interface লিখতে হয় না, তাই schema আর type কখনো অমিল হয় না।
- \`safeParse\` throw না করে discriminated union দেয় — সফল/ব্যর্থ দুটোই সামলাতে বাধ্য।

যাচাইয়ের পরে বাকি code-এ type-এর ওপর পুরো ভরসা করা যায় — "boundary-তে যাচাই, ভেতরে বিশ্বাস"।`,
        examples: [
          {
            lang: 'typescript',
            code: `import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  email: z.email(),
  role: z.enum(["admin", "user"]).default("user"),
});
type User = z.infer<typeof UserSchema>;     // { id: number; email: string; role: "admin" | "user" }

const good = UserSchema.safeParse(JSON.parse('{"id": 1, "email": "rafi@example.com"}'));
if (good.success) {
  const user: User = good.data;
  console.log(user.role, user.email);
}

const bad = UserSchema.safeParse(JSON.parse('{"id": "1", "email": "nope"}'));
if (!bad.success) console.log(bad.error.issues.map((issue) => issue.path.join(".")));`,
            output: `user rafi@example.com
[ 'id', 'email' ]`,
          },
        ],
        pitfalls: [
          'Validating deep inside the app instead of at the boundary spreads `unknown` checks everywhere.',
          'Keeping a hand-written interface *and* a schema for the same data lets them drift.',
        ],
        followUps: [
          'How would you type environment variables safely?',
          'What is the difference between `parse` and `safeParse`?',
        ],
      },
      related: ['ts-type-assertions', 'ts-type-predicates', 'ts-what-is-typescript'],
    },
    {
      id: 'ts-no-unchecked-indexed-access',
      level: 'intermediate',
      priority: 2,
      question: 'What does `noUncheckedIndexedAccess` do, and why is it not part of `strict`?',
      tags: ['tsconfig', 'no-unchecked-indexed-access', 'arrays', 'safety'],
      answer: {
        interview: `**It adds \`| undefined\` to every index access on arrays and index signatures (\`arr[i]\`, \`dict[key]\`), because the element might not exist.**

- Without it, \`const first = arr[0]\` is typed \`T\` even for an empty array — a common source of runtime crashes.
- With it you must handle the missing case: \`arr[0]?.name\`, \`arr[0] ?? fallback\`, or a check.
- \`for...of\`, \`map\`, \`forEach\` and destructuring with defaults are unaffected — only index access changes.
- It is not in \`strict\` because it is noisy in code that indexes arrays by loop counters, where the index is known to be valid.

Real-world: many teams enable it for new projects; this app’s own tsconfig uses it.`,
        explanationBn: `TypeScript সাধারণভাবে ধরে নেয় index দিয়ে পড়লে value পাওয়া যাবেই: খালি array-র \`arr[0]\`-এর type-ও \`User\` — অথচ runtime-এ \`undefined\`। Dictionary-তেও একই: অজানা key পড়লে type বলে value আছে।

\`noUncheckedIndexedAccess\` চালু করলে প্রতিটা index access-এর type-এ \`| undefined\` যোগ হয় — না থাকার সম্ভাবনা সামলাতে বাধ্য হন।

কেন \`strict\`-এ নেই? Classic \`for (let i = 0; i < arr.length; i++)\` loop-এ \`arr[i]\` নিশ্চিতভাবে আছে, তবুও প্রতিবার চেক করতে হয় — বিরক্তিকর। কিন্তু আধুনিক code-এ \`for...of\`, \`map\` বেশি ব্যবহার হয় (যেগুলো প্রভাবিত হয় না), তাই নতুন project-এ চালু রাখাই ভালো।`,
        examples: [
          {
            lang: 'typescript',
            caption: 'Behaviour without the flag (the verifier compiles with plain `strict`)',
            code: `const users: { name: string }[] = [];
const first = users[0];                 // typed { name: string } — but it is undefined
console.log(first);

const scores: Record<string, number> = { rafi: 90 };
const s = scores["nadia"];              // typed number — but it is undefined
console.log(s, (s ?? 0) + 1);
// With noUncheckedIndexedAccess: first is { name: string } | undefined,
// and first.name would be an error until you check it.`,
            output: `undefined
undefined 1`,
          },
        ],
        pitfalls: [
          'The `!` operator (`arr[0]!`) silences the check — use it only when the index is truly guaranteed.',
        ],
        followUps: ['Which other tsconfig flags do you enable beyond `strict`?'],
      },
      related: ['ts-tsconfig-strict', 'ts-index-signatures-record'],
    },
    {
      id: 'ts-type-only-imports',
      level: 'intermediate',
      priority: 1,
      question:
        'What are type-only imports (`import type`), and what does `verbatimModuleSyntax` do?',
      tags: ['modules', 'import-type', 'verbatim-module-syntax', 'isolated-modules'],
      answer: {
        interview: `**\`import type { User } from "./user"\` imports only types and is always removed from the output, so the module is never loaded at runtime just for its types.**

- Inline form: \`import { type User, createUser } from "./user"\`.
- Single-file transpilers (esbuild, swc, Babel, Vite) compile one file at a time and can’t always tell whether an import is a type — explicit \`type\` removes the guesswork.
- \`verbatimModuleSyntax\` (TS 5.0): imports **without** \`type\` are always kept, imports **with** \`type\` are always dropped. It makes you mark type imports explicitly, replacing \`isolatedModules\`/\`importsNotUsedAsValues\`.
- Benefits: no accidental side-effect imports, no circular-import surprises from type-only dependencies, smaller bundles.

Real-world: Vite templates enable \`verbatimModuleSyntax\`, so ESLint/TS will ask you to write \`import type\`.`,
        explanationBn: `Type compile-এর পর মুছে যায় — তাহলে শুধু type-এর জন্য করা import-ও মুছে যাওয়া উচিত। কিন্তু esbuild বা Vite-এর মতো tool একবারে একটা file দেখে; তারা জানে না \`User\` অন্য file-এ type নাকি value। ভুল করে import রেখে দিলে runtime-এ সেই module load হয় (side effect, circular import), মুছে দিলে value হলে crash।

**\`import type\`** — স্পষ্ট বলে দেয় "এটা শুধু type, output থেকে মুছে দাও"।

**\`verbatimModuleSyntax\`** — নিয়ম সহজ করে দেয়: \`type\` লেখা import সবসময় মুছবে, বাকিগুলো সবসময় থাকবে — হুবহু যা লিখেছেন। তাই type import-এ \`type\` লিখতে বাধ্য, আর কোনো tool-কে অনুমান করতে হয় না।

এই project-এও (Vite template) এটা চালু।`,
        examples: [
          {
            lang: 'typescript',
            caption: 'What the compiler keeps and removes',
            code: `import type { ZodType } from "zod";          // always removed from the output
import { type ZodError, z } from "zod";      // ZodError removed, z kept

const schema: ZodType<string> = z.string();
const firstIssue = (e: ZodError) => e.issues[0]?.message;

// @ts-expect-error ❌ 'ZodType' cannot be used as a value because it was imported using 'import type'.
const notAValue = ZodType;

// Emitted JavaScript (verbatimModuleSyntax):
// import { z } from "zod";
// const schema = z.string();
// const firstIssue = (e) => e.issues[0]?.message;`,
          },
        ],
        pitfalls: [
          '`import type` names cannot be used as values (see `notAValue` above).',
          'With `verbatimModuleSyntax`, CommonJS output needs `import x = require()` syntax instead of ESM imports.',
        ],
        followUps: ['Why do single-file transpilers need `isolatedModules`?'],
      },
      related: ['ts-tsc-vs-transpilers'],
    },
    {
      id: 'ts-tsc-vs-transpilers',
      level: 'intermediate',
      priority: 1,
      question:
        'How is TypeScript compiled in modern toolchains? What is the difference between `tsc`, esbuild/swc and type stripping?',
      tags: ['tsc', 'esbuild', 'swc', 'type-stripping', 'build-tools'],
      answer: {
        interview: `**Compilation is two separate jobs — type checking and transpiling (removing types). \`tsc\` does both; esbuild, swc, Babel and Node’s type stripping only remove types, very fast, without checking anything.**

- Typical setup: Vite/Next.js transpile with esbuild/swc for speed, and \`tsc --noEmit\` runs separately (CI, editor, \`npm run build\`).
- A type error does **not** stop a Vite dev server from running the code.
- Single-file transpilers can’t handle features needing whole-program info: \`const enum\` across files, ambiguous re-exports of types — hence \`isolatedModules\`.
- Node.js 23.6+ runs \`.ts\` files directly by stripping types; it rejects syntax that generates code (\`enum\`, \`namespace\`, parameter properties) unless \`--experimental-transform-types\` is used. \`erasableSyntaxOnly\` (TS 5.8) makes tsc enforce the same restriction.
- \`tsc\` is also needed to emit \`.d.ts\` files for libraries.

Real-world: \`"build": "tsc --noEmit && vite build"\`.`,
        explanationBn: `TypeScript compile করা আসলে দুটো আলাদা কাজ:
1. **Type check** — ভুল খোঁজা। ধীর, পুরো project দেখতে হয়।
2. **Transpile** — type মুছে JavaScript বানানো। দ্রুত, প্রতিটা file আলাদাভাবে করা যায়।

\`tsc\` দুটোই করে। কিন্তু esbuild, swc (Vite, Next.js যেগুলো ব্যবহার করে) শুধু দ্বিতীয়টা — কোনো চেক ছাড়াই type ছেঁটে ফেলে, বহুগুণ দ্রুত। তাই Vite dev server-এ type error থাকলেও app চলে! Type check আলাদাভাবে চালাতে হয়: editor, CI, বা \`tsc --noEmit\`।

**Node.js-এর type stripping:** নতুন Node সরাসরি \`.ts\` file চালায় — type-এর জায়গায় শুধু ফাঁকা space বসিয়ে। তাই যে syntax JavaScript code তৈরি করে (\`enum\`, \`namespace\`, parameter property) সেগুলো চলে না। \`erasableSyntaxOnly\` flag tsc-কেও এই নিয়ম মানায়।

এই কারণেই নতুন TypeScript code-এ enum-এর বদলে union আর \`as const\` জনপ্রিয় হচ্ছে।`,
        examples: [
          {
            lang: 'json',
            caption:
              'package.json scripts in a Vite project: transpile fast, type-check separately',
            code: `{
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "build": "tsc --noEmit && vite build"
  }
}`,
          },
          {
            lang: 'bash',
            caption: 'Running TypeScript directly with Node.js (type stripping)',
            code: `node app.ts                                   # Node 23.6+: types are stripped, not checked
node --experimental-transform-types app.ts    # also transforms enums and namespaces`,
          },
        ],
        pitfalls: [
          'Relying on the dev server alone: type errors never block it.',
          'Code using `enum`/`namespace` breaks under pure type stripping.',
        ],
        followUps: ['What does `isolatedModules` guarantee?', 'What is `erasableSyntaxOnly`?'],
      },
      related: ['ts-type-only-imports', 'ts-enums-vs-unions', 'ts-what-is-typescript'],
    },
    {
      id: 'ts-js-migration',
      level: 'intermediate',
      priority: 1,
      question: 'How would you migrate an existing JavaScript project to TypeScript?',
      tags: ['migration', 'allow-js', 'check-js', 'jsdoc'],
      answer: {
        interview: `**Incrementally: let JS and TS coexist, convert file by file starting from the leaves, and tighten the compiler settings over time.**

1. Add \`tsconfig.json\` with \`allowJs: true\` so \`.js\` and \`.ts\` files build together.
2. Optionally \`checkJs: true\` (or \`// @ts-check\` per file) to type-check JavaScript using JSDoc annotations.
3. Install \`@types/*\` for dependencies.
4. Rename files to \`.ts\` starting with leaf modules (utils, models), adding types to their exports first.
5. Start lenient (\`strict: false\`) if needed, then enable \`noImplicitAny\`, \`strictNullChecks\`, and finally \`strict\`.
6. Track and reduce \`any\` / \`@ts-expect-error\` with lint rules.

Real-world: never pause feature work for a "big bang" rewrite — convert files as you touch them.`,
        explanationBn: `একবারে পুরো project TypeScript-এ নেওয়া ঝুঁকিপূর্ণ আর ধীর। ভালো পদ্ধতি — **ধাপে ধাপে**, যাতে প্রতিটা ধাপের পরেও app চলে:

1. **\`allowJs\`** — JS আর TS file একসাথে থাকতে পারে।
2. **\`checkJs\` / \`// @ts-check\`** — নাম না বদলেই JS file-এ type checking, JSDoc comment থেকে type পড়ে।
3. **\`@types\`** — dependency-র type install।
4. **Leaf থেকে শুরু** — যেসব file অন্য কিছুর ওপর নির্ভর করে না (utils, model)। এগুলোর type ঠিক হলে, যারা এদের import করে তারাও উপকৃত হয়।
5. **ধীরে ধীরে কড়াকড়ি** — প্রথমে ঢিলেঢালা config, তারপর একটা একটা strict flag।

মূল কথা: feature-এর কাজ থামিয়ে "সব নতুন করে লিখি" না — যে file-এ হাত দিচ্ছেন সেটা convert করুন।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'Type-checking a plain .js file with JSDoc and // @ts-check',
            code: `// @ts-check

/**
 * @param {number} price
 * @param {number} [qty=1]
 * @returns {number}
 */
function total(price, qty = 1) {
  return price * qty;
}

console.log(total(250, 2));
// total("250");  // TS error in the editor: Argument of type 'string' is not assignable to parameter of type 'number'.`,
            output: `500`,
          },
        ],
        pitfalls: [
          'Renaming everything to `.ts` and sprinkling `any` gives the cost of TypeScript without the benefit.',
          'Turning on `strict` at the very end of a huge migration produces thousands of errors — plan the flags early.',
        ],
        followUps: ['What is JSDoc-based type checking?'],
      },
      related: ['ts-tsconfig-strict', 'ts-declaration-files'],
    },
  ],
});

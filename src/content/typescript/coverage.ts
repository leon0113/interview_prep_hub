import type { Coverage, Level, Priority, QuickConcept } from '../schema';

function concept(c: {
  id: string;
  question: string;
  level: Level;
  priority?: Priority;
  tags: string[];
  interview: string;
  bn: string;
  example?: { code: string; output?: string };
  related?: string[];
}): QuickConcept {
  return {
    id: c.id,
    sectionId: 'ts-coverage',
    level: c.level,
    priority: c.priority ?? 1,
    question: c.question,
    tags: c.tags,
    answer: {
      interview: c.interview,
      explanationBn: c.bn,
      examples: c.example ? [{ lang: 'typescript', ...c.example }] : undefined,
    },
    related: c.related,
  };
}

export const coverage: Coverage = {
  quickConcepts: [
    concept({
      id: 'ts-qc-branded-types',
      question: 'What are branded types?',
      level: 'advanced',
      tags: ['nominal-typing', 'patterns', 'structural-typing'],
      interview:
        'A pattern that fakes nominal typing in a structural type system: intersect a base type with a unique marker, e.g. `type UserId = string & { readonly __brand: "UserId" }`, so a plain `string` or an `OrderId` cannot be passed where a `UserId` is expected. The brand exists only at compile time; values are created through a small constructor or validator function.',
      bn: 'TypeScript structural — একই আকারের দুটো type আলাদা করে চেনে না, তাই `UserId` আর `OrderId` দুটোই `string` হলে গুলিয়ে ফেলা যায়। Brand একটা নকল property যোগ করে type দুটোকে আলাদা করে দেয়, runtime-এ যার কোনো অস্তিত্ব নেই — value তখনো সাধারণ string।',
      example: {
        code: `type UserId = string & { readonly __brand: "UserId" };
const toUserId = (id: string) => id as UserId;    // the only place we assert

function getUser(id: UserId) { return \`user:\${id}\`; }

const uid = toUserId("u_1");
const raw: string = "u_1";
console.log(getUser(uid), typeof uid);
// @ts-expect-error ❌ Argument of type 'string' is not assignable to parameter of type 'UserId'.
getUser(raw);`,
        output: `user:u_1 string`,
      },
    }),
    concept({
      id: 'ts-qc-ts-expect-error',
      question: 'What is the difference between `// @ts-expect-error` and `// @ts-ignore`?',
      level: 'intermediate',
      tags: ['directives', 'ts-expect-error', 'ts-ignore'],
      interview:
        'Both suppress the compiler error on the next line, but `@ts-expect-error` itself becomes an error when there is **no** error to suppress. So it documents an intentional error (great in tests and type-level examples) and alerts you once the underlying problem is fixed, while `@ts-ignore` stays silent forever. Prefer `@ts-expect-error` with a reason, and lint against `@ts-ignore`.',
      bn: 'দুটোই পরের লাইনের error চাপা দেয়। পার্থক্য: `@ts-expect-error` **error আশা করে** — error না থাকলে নিজেই error দেয়। তাই কেউ সমস্যা ঠিক করে ফেললে বা code বদলালে আপনি জানতে পারেন। `@ts-ignore` কিছু না বলে চিরকাল থেকে যায়। এই app-এর সব TypeScript example ঠিক এই কৌশলে যাচাই করা।',
      example: {
        code: `// @ts-expect-error ❌ Type 'string' is not assignable to type 'number'.
const a: number = "1";

// @ts-ignore — also silences it, but would stay silent even after the error is fixed
const b: number = "2";

console.log(typeof a, typeof b);`,
        output: `string string`,
      },
    }),
    concept({
      id: 'ts-qc-override-keyword',
      question: 'What does the `override` keyword do?',
      level: 'intermediate',
      tags: ['classes', 'override', 'inheritance', 'no-implicit-override'],
      interview:
        '`override` (TS 4.3) marks a method that replaces a base-class method. TypeScript then errors if the base class has no such member — catching typos and base-class renames. With `noImplicitOverride`, overriding *without* the keyword is also an error, so every override is explicit.',
      bn: 'Subclass-এ method override করার সময় বানান ভুল (`gret`) করলে আসলে নতুন method তৈরি হয় — override হয় না, আর কেউ টের পায় না। `override` keyword বলে "এটা base class-এর method বদলাচ্ছে" — base-এ না থাকলে compile error। Base class-এর method rename হলেও সাথে সাথে ধরা পড়ে।',
      example: {
        code: `class Base { greet() { return "hi"; } }

class Child extends Base {
  override greet() { return "hello"; }
  // @ts-expect-error ❌ This member cannot have an 'override' modifier because it is not declared in the base class 'Base'.
  override gret() { return "typo"; }
}

console.log(new Child().greet());`,
        output: `hello`,
      },
    }),
    concept({
      id: 'ts-qc-using-declarations',
      question: 'What are `using` declarations (explicit resource management)?',
      level: 'advanced',
      tags: ['using', 'symbol-dispose', 'resource-management', 'typescript-5-2'],
      interview:
        '`using x = resource` (TS 5.2, a TC39 proposal now shipping in engines) calls `x[Symbol.dispose]()` automatically when the enclosing block exits — normally or via an exception — like `try/finally` without the boilerplate. `await using` does the same with `Symbol.asyncDispose`. Use it for file handles, DB connections, locks and subscriptions.',
      bn: 'File, database connection, lock — এগুলো ব্যবহারের পরে বন্ধ করতে হয়, আর error হলেও যেন বন্ধ হয়। আগে এর জন্য `try/finally` লিখতে হতো। `using` দিয়ে declare করলে block শেষ হলেই (সাধারণভাবে বা error-এ) `Symbol.dispose` method নিজে থেকে চলে — C#-এর `using` বা Python-এর `with`-এর মতো।',
      example: {
        code: `class TempFile implements Disposable {
  constructor(public name: string) { console.log("open", name); }
  [Symbol.dispose]() { console.log("close", this.name); }
}

function exportReport() {
  using file = new TempFile("report.csv");
  console.log("writing", file.name);
}                                              // disposed here, automatically

exportReport();
console.log("done");`,
        output: `open report.csv
writing report.csv
close report.csv
done`,
      },
    }),
    concept({
      id: 'ts-qc-call-construct-signatures',
      question: 'What are call signatures and construct signatures?',
      level: 'advanced',
      tags: ['call-signatures', 'construct-signatures', 'functions', 'interfaces'],
      interview:
        'An object type can describe something callable — `{ (x: number): string; extra: boolean }` — which models functions that also carry properties. A construct signature, `{ new (x: number): Point }`, describes something called with `new`, which is how you accept a class as a parameter (factories, dependency injection).',
      bn: 'JavaScript-এ function-ও object, তাতে property থাকতে পারে (যেমন jQuery-র `$` নিজে function, আবার `$.ajax`-ও আছে)। Call signature এমন জিনিসের type লিখতে দেয়। Construct signature (`new (...)`) দিয়ে বলা যায় "এমন কিছু দাও যেটা `new` দিয়ে ডাকা যায়" — অর্থাৎ class নিজেই parameter হিসেবে।',
      example: {
        code: `interface Counter { (): number; count: number }
function makeCounter(): Counter {
  const counter = (() => ++counter.count) as Counter;
  counter.count = 0;
  return counter;
}
const next = makeCounter();
next(); next();
console.log(next.count);

interface PointClass { new (x: number, y: number): { x: number; y: number } }
const create = (C: PointClass) => new C(1, 2);
class Point { constructor(public x: number, public y: number) {} }
console.log(create(Point));`,
        output: `2
Point { x: 1, y: 2 }`,
      },
    }),
    concept({
      id: 'ts-qc-namespaces',
      question: 'What are namespaces, and should you still use them?',
      level: 'intermediate',
      tags: ['namespaces', 'modules', 'legacy'],
      interview:
        'Namespaces (`namespace Geometry { export ... }`, formerly "internal modules") group code under one global object — a pre-ES-modules way to avoid global name clashes. Today ES modules do that job; use namespaces mainly in `.d.ts` files to describe global libraries or to merge types with functions/classes. They generate runtime code, so type-stripping tools reject them.',
      bn: 'ES module আসার আগে সব code global scope-এ থাকত, তাই নাম সংঘর্ষ এড়াতে namespace দিয়ে একটা object-এর ভেতরে গুছিয়ে রাখা হতো। এখন প্রতিটা file নিজেই একটা module, তাই নতুন code-এ namespace লাগে না। পুরনো library-র type declaration-এ এখনো দেখবেন।',
      example: {
        code: `namespace Geometry {
  export const TAU = Math.PI * 2;
  export function circumference(r: number) { return TAU * r; }
}

console.log(Geometry.circumference(1).toFixed(2), typeof Geometry);`,
        output: `6.28 object`,
      },
    }),
    concept({
      id: 'ts-qc-project-references',
      question: 'What are project references (`tsc --build`)?',
      level: 'advanced',
      tags: ['tsconfig', 'monorepo', 'project-references', 'build'],
      interview:
        'Project references split a large codebase into smaller TypeScript projects (`"references": [{ "path": "../shared" }]`, each with `composite: true`). `tsc -b` builds them in dependency order and only rebuilds what changed, using `.tsbuildinfo` files — faster builds and enforced boundaries in monorepos. Vite’s template uses them to separate app and Node (config) code.',
      bn: 'বড় monorepo-তে পুরো code একসাথে type-check করা ধীর। Project references দিয়ে code ছোট ছোট TypeScript project-এ ভাগ করা হয়, যারা একে অপরের ওপর নির্ভর করে। `tsc -b` শুধু বদলানো অংশ আবার build করে। এই app-এর `tsconfig.app.json` আর `tsconfig.node.json`-ও এভাবে আলাদা করা।',
    }),
    concept({
      id: 'ts-qc-isolated-declarations',
      question: 'What is `isolatedDeclarations`?',
      level: 'advanced',
      tags: ['tsconfig', 'declaration-files', 'build-performance', 'typescript-5-5'],
      interview:
        '`isolatedDeclarations` (TS 5.5) requires explicit type annotations on everything a module exports, so `.d.ts` files can be generated per file without running the type checker — enabling fast, parallel declaration emit by tools like oxc or swc. It mainly matters for library authors in large monorepos.',
      bn: '`.d.ts` তৈরি করতে সাধারণত TypeScript-কে পুরো project বুঝতে হয় (inference-এর জন্য)। এই flag export করা সবকিছুতে স্পষ্ট type লিখতে বাধ্য করে, ফলে প্রতিটা file আলাদাভাবে, অনেক দ্রুত tool দিয়ে declaration বানানো যায়। Library লেখকদের জন্য বেশি প্রাসঙ্গিক।',
    }),
  ],
  notCovered: [
    {
      topic: 'The TypeScript Compiler API and custom transformers',
      reason: 'Tooling-author territory; not part of application-developer interviews.',
    },
    {
      topic: 'Type-level programming puzzles (type-challenges "extreme")',
      reason:
        'Fun, but far beyond what interviews expect; the advanced section covers the useful patterns.',
    },
    {
      topic: 'Legacy `experimentalDecorators` and `emitDecoratorMetadata` in depth',
      reason:
        'Specific to Angular/NestJS internals; the standard decorators question explains the difference.',
    },
    {
      topic: 'Framework-specific typing (React props, hooks, Next.js, Express)',
      reason: 'Will be covered inside the React, Next.js and Node.js tracks.',
    },
    {
      topic: 'Triple-slash directives and global script (non-module) projects',
      reason: 'Rare in modern module-based code.',
    },
    {
      topic: 'Version-by-version TypeScript release notes',
      reason: 'Features are explained where they matter; memorising release numbers is not useful.',
    },
  ],
  studyTips: [
    'Think of types as sets of values — unions, intersections, `unknown` and `never` all become obvious.',
    'Re-implement `Partial`, `Pick`, `Omit`, `Exclude` and `ReturnType` by hand once; it is the fastest way to learn mapped and conditional types.',
    'Always be able to say what happens at runtime: types are erased, so `as`, `!`, `readonly` and `private` change nothing there.',
    'Practise modelling state with discriminated unions; interviewers love "make impossible states impossible".',
    'Use the TypeScript Playground to hover types and read the emitted JavaScript side by side.',
    'Know your tsconfig: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, and why each exists.',
  ],
};

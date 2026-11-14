import { defineSection } from '../../define';

export const functionsClasses = defineSection({
  id: 'ts-functions-classes',
  title: 'Functions & Classes',
  description:
    'Typing functions and callbacks, overloads, `this`, access modifiers vs `#private`, abstract classes, `implements` and decorators.',
  order: 4,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'ts-function-types',
      level: 'foundation',
      priority: 2,
      question:
        'How do you type functions in TypeScript: parameters, return values, optional, default and rest parameters?',
      tags: ['functions', 'parameters', 'return-types', 'callbacks'],
      answer: {
        interview: `**Annotate each parameter, optionally the return type, and describe function values with a function type like \`(a: number, b: number) => number\`.**

- Optional parameter: \`greet(name?: string)\` — type includes \`undefined\`, must come after required ones.
- Default parameter: \`greet(name = "guest")\` — type is inferred from the default and the parameter is optional for callers.
- Rest parameter: \`sum(...nums: number[])\`.
- Function type aliases name callback shapes: \`type Handler = (event: string) => void\`.
- Callers must pass the right number of arguments — unlike JavaScript, extra or missing arguments are errors.
- A function with fewer parameters is assignable to a function type with more (callbacks may ignore arguments).

Real-world: \`type Middleware = (req: Request, next: () => void) => void\`.`,
        explanationBn: `JavaScript-এ function যেকোনো সংখ্যক argument নেয় — কম দিলে \`undefined\`, বেশি দিলে উপেক্ষা। TypeScript এখানে কড়া: সংখ্যা আর type দুটোই মিলতে হবে।

- **Optional (\`name?\`)** — না দিলেও চলবে; ভেতরে \`string | undefined\`।
- **Default (\`name = "guest"\`)** — না দিলে default; type default থেকেই infer হয়।
- **Rest (\`...nums: number[]\`)** — যতগুলো খুশি, সব একটা array-তে।

**Function type** — function-কেও value হিসেবে বর্ণনা করা যায়: \`(a: number, b: number) => number\`। Callback-এর জন্য এটাই ব্যবহার হয়।

একটা মজার নিয়ম: কম parameter-এর function বেশি parameter চাওয়া জায়গায় বসানো যায়। \`[1,2].forEach(n => ...)\` — forEach তিনটা argument দেয় (value, index, array), আপনার function একটা নিলেও সমস্যা নেই। JavaScript-এ এটা স্বাভাবিক, TypeScript তাই অনুমতি দেয়।`,
        examples: [
          {
            lang: 'typescript',
            code: `function greet(name = "guest", greeting?: string): string {
  return \`\${greeting ?? "Hello"}, \${name}\`;
}

const sum = (...nums: number[]): number => nums.reduce((a, b) => a + b, 0);

type BinaryOp = (a: number, b: number) => number;
const multiply: BinaryOp = (a, b) => a * b;     // parameters typed from BinaryOp
const first: BinaryOp = (a) => a;               // fewer parameters is fine

console.log(greet(), greet("Rafi", "Hi"), sum(1, 2, 3), multiply(4, 5), first(7, 8));
// @ts-expect-error ❌ Expected 2 arguments, but got 1.
multiply(4);`,
            output: `Hello, guest Hi, Rafi 6 20 7`,
          },
        ],
        pitfalls: [
          'An optional parameter cannot come before a required one.',
          'Unannotated parameters are implicitly `any` (an error under `strict`).',
        ],
        followUps: [
          'What are function overloads?',
          'Why can a callback with fewer parameters be passed?',
        ],
      },
      related: ['ts-function-overloads', 'ts-void-callbacks'],
    },
    {
      id: 'ts-access-modifiers',
      level: 'foundation',
      priority: 3,
      question:
        'What are `public`, `private` and `protected`, and how is `private` different from `#private`?',
      tags: ['classes', 'access-modifiers', 'private-fields', 'encapsulation'],
      answer: {
        interview: `**\`public\` (default), \`private\` and \`protected\` are TypeScript-only access checks; \`#field\` is a JavaScript private field enforced at runtime.**

- \`private\` — accessible only inside the class. \`protected\` — inside the class and subclasses.
- These keywords are **erased** at compile time: the property is a normal property at runtime, visible to \`Object.keys\`, \`JSON.stringify\` and \`(obj as any).x\`.
- \`#balance\` is truly private: inaccessible outside the class even at runtime, and not enumerable.
- TypeScript \`private\` allows access between instances and from \`this["x"]\` patterns in tests; \`#\` does not.
- \`readonly\` can combine with any of them.

Real-world: prefer \`#private\` for real encapsulation (libraries, security-sensitive data); \`private\`/\`protected\` are fine for app code and needed for \`protected\` semantics.`,
        explanationBn: `**TypeScript-এর \`private\`/\`protected\`** — শুধু compiler-এর নিয়ম। বাইরে থেকে access করতে গেলে লাল দাগ, কিন্তু compile হওয়ার পর keyword মুছে যায় — runtime-এ সাধারণ property। ফলে \`JSON.stringify\` করলে "private" data-ও বেরিয়ে আসে, আর \`as any\` দিয়ে সহজেই পড়া যায়।

**JavaScript-এর \`#private\`** — ভাষার নিজস্ব বৈশিষ্ট্য, runtime-এ সত্যিকারের তালা। Class-এর বাইরে থেকে কোনোভাবেই পড়া যায় না, \`Object.keys\` বা JSON-এ দেখা যায় না।

**\`protected\`** — class আর তার subclass-এর ভেতরে ব্যবহারযোগ্য, বাইরে না। JavaScript-এ এর কোনো সমতুল্য নেই।

কোনটা কখন? সত্যিকারের গোপনীয়তা দরকার হলে (token, password, library internals) \`#\`। সাধারণ app code-এ \`private\`ও চলে।`,
        examples: [
          {
            lang: 'typescript',
            code: `class Account {
  public owner: string;
  private pin = "1234";
  protected limit = 500;
  #balance = 0;

  constructor(owner: string) { this.owner = owner; }
  deposit(amount: number) { this.#balance += amount; return this.#balance; }
}

const acc = new Account("Rafi");
acc.deposit(100);
// @ts-expect-error ❌ Property 'pin' is private and only accessible within class 'Account'.
acc.pin;
// @ts-expect-error ❌ Property 'limit' is protected and only accessible within class 'Account' and its subclasses.
acc.limit;

console.log(JSON.stringify(acc));                // private/protected leak, #balance does not
console.log((acc as any).pin, (acc as any)["#balance"]);`,
            output: `{"owner":"Rafi","pin":"1234","limit":500}
1234 undefined`,
          },
        ],
        pitfalls: [
          'TypeScript `private` data shows up in `JSON.stringify` and logs.',
          '`#private` fields cannot be accessed by subclasses — there is no `#protected`.',
        ],
        followUps: ['What are parameter properties?', 'Can a subclass access `#private` fields?'],
      },
      related: ['ts-parameter-properties', 'ts-abstract-classes'],
    },
    {
      id: 'ts-parameter-properties',
      level: 'foundation',
      priority: 1,
      question: 'What are parameter properties in a TypeScript class constructor?',
      tags: ['classes', 'constructors', 'parameter-properties', 'readonly'],
      answer: {
        interview: `**Adding an access modifier or \`readonly\` to a constructor parameter (\`constructor(private readonly id: string)\`) declares and assigns the property in one step.**

- Saves the repeated "declare field, then \`this.x = x\`" boilerplate.
- Works with \`public\`, \`private\`, \`protected\` and \`readonly\`.
- It is not plain JavaScript: it generates code, so it is unavailable with Node’s type stripping or \`erasableSyntaxOnly\`.
- Common in Angular and NestJS for dependency injection.

Real-world: \`constructor(private readonly repo: UserRepository) {}\` in a NestJS service.`,
        explanationBn: `সাধারণভাবে class-এ property রাখতে তিন জায়গায় লিখতে হয়: field declare, constructor parameter, আর \`this.x = x\`। Parameter property-তে constructor parameter-এর আগে \`public\`/\`private\`/\`readonly\` লিখলেই TypeScript তিনটাই একসাথে করে দেয়।

Angular, NestJS-এ dependency injection-এ সবখানে দেখবেন: \`constructor(private http: HttpClient) {}\`।

সতর্কতা: এটা শুধু type না — TypeScript এর জন্য আসলে JavaScript code (\`this.id = id\`) তৈরি করে। তাই যে tool শুধু type মুছে ফেলে (Node-এর type stripping), সেগুলো এটা সমর্থন করে না। নতুন project-এ অনেকে তাই এড়িয়ে চলে।`,
        examples: [
          {
            lang: 'typescript',
            code: `class Point {
  constructor(public readonly x: number, public readonly y: number, private label = "P") {}
  toString() { return \`\${this.label}(\${this.x}, \${this.y})\`; }
}

const p = new Point(3, 4);
// @ts-expect-error ❌ Cannot assign to 'x' because it is a read-only property.
p.x = 10;
console.log(String(p), Object.keys(p));`,
            output: `P(10, 4) [ 'x', 'y', 'label' ]`,
          },
        ],
        pitfalls: [
          '`readonly` is compile-time only — the `p.x = 10` line above still ran and changed the value.',
          'Not supported by type-stripping runtimes (`--experimental-strip-types`).',
        ],
        followUps: ['What does `erasableSyntaxOnly` forbid?'],
      },
      related: ['ts-access-modifiers'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'ts-function-overloads',
      level: 'intermediate',
      priority: 2,
      question:
        'What are function overloads, and when should you use them instead of a union or generic?',
      tags: ['overloads', 'functions', 'generics', 'unions'],
      answer: {
        interview: `**Overloads are several call signatures for one implementation, letting the return type depend on which argument types were passed.**

- Write the overload signatures first, then one implementation signature that is compatible with all of them; callers only see the overloads.
- Overloads are checked **in order**; put the most specific first.
- Use them when the *relationship* between inputs and output changes per case (e.g. \`string\` in → \`string\` out, \`string[]\` in → \`string[]\` out).
- If one signature with a union parameter or a generic expresses it, prefer that — overloads are verbose and the implementation is loosely checked.

Real-world: DOM’s \`createElement("canvas")\` returning \`HTMLCanvasElement\` is typed with overload-like mappings.`,
        explanationBn: `ধরুন \`format\` function string পেলে string ফেরত দেয়, array পেলে array। একটা signature-এ \`(v: string | string[]) => string | string[]\` লিখলে caller সবসময় union পায় — string দিয়েও \`.toUpperCase()\` ডাকতে আগে চেক করতে হবে।

**Overload** দিয়ে বলা যায়: "string দিলে string, array দিলে array"। উপরে signature গুলো লিখি (caller এগুলোই দেখে), নিচে একটা implementation যেটা সব case সামলায়।

কখন ব্যবহার করবেন না: যখন generic বা union দিয়েই কাজ হয়। Overload verbose, আর implementation-এর ভেতরে TypeScript প্রতিটা overload আলাদা করে মেলায় না — ভুল থাকতে পারে। TypeScript টিমের পরামর্শ: "যদি union parameter দিয়ে পারেন, overload লিখবেন না।"`,
        examples: [
          {
            lang: 'typescript',
            code: `function format(value: string): string;
function format(value: string[]): string[];
function format(value: string | string[]): string | string[] {
  return Array.isArray(value) ? value.map((v) => v.trim()) : value.trim();
}

const one = format("  a ");        // string
const many = format([" b", "c "]); // string[]
console.log(one.toUpperCase(), many.length);

// @ts-expect-error ❌ No overload matches this call.
const bad = () => format(42);`,
            output: `A 2`,
          },
        ],
        pitfalls: [
          'The implementation signature is not callable from outside.',
          'Calling with a `string | string[]` value fails unless an overload accepts the union.',
        ],
        followUps: ['How would you write this with a generic and a conditional type instead?'],
      },
      related: ['ts-function-types'],
    },
    {
      id: 'ts-abstract-classes',
      level: 'intermediate',
      priority: 2,
      question: 'What is an abstract class, and how is it different from an interface?',
      tags: ['classes', 'abstract', 'interfaces', 'implements', 'oop'],
      answer: {
        interview: `**An abstract class is a base class that cannot be instantiated and may mix implemented methods with \`abstract\` ones that subclasses must implement; an interface is a pure shape with no code.**

- Abstract classes exist at runtime (they are real JavaScript classes); interfaces are erased.
- A class \`extends\` one (abstract) class but can \`implements\` many interfaces.
- Abstract classes can hold shared state, constructors and protected helpers (template-method pattern).
- \`implements\` only **checks** the class’s shape — it does not add members or change types inside the class.
- Prefer interfaces for contracts between modules; use an abstract class when subclasses really share code.

Real-world: an abstract \`Repository<T>\` with shared caching logic and abstract \`fetch\` per data source.`,
        explanationBn: `**Abstract class** — একটা অসম্পূর্ণ class। সরাসরি \`new\` করা যায় না; কিছু method এখানেই লেখা (সবার জন্য common logic), আর কিছু \`abstract\` — subclass-কে অবশ্যই লিখতে হবে।

**Interface** — শুধু চুক্তি, কোনো code নেই। "এই method গুলো থাকতে হবে" — কীভাবে, সেটা পুরোপুরি class-এর ব্যাপার।

পার্থক্যগুলো:
- Abstract class runtime-এ আছে (সত্যিকারের JS class), interface মুছে যায়।
- এক class একটাই class extend করতে পারে, কিন্তু অনেক interface implement করতে পারে।
- Abstract class state, constructor, protected helper রাখতে পারে।

**Template method pattern:** base class পুরো প্রক্রিয়ার কাঠামো ঠিক করে (\`describe()\`), আর ছোট ছোট ধাপ (\`area()\`) subclass-এর ওপর ছেড়ে দেয়।

\`implements\` শুধু চেক করে class চুক্তি মানছে কি না — কিছু যোগ করে না।`,
        examples: [
          {
            lang: 'typescript',
            code: `interface Printable { print(): string }

abstract class Shape implements Printable {
  constructor(protected name: string) {}
  abstract area(): number;                       // subclasses must implement
  print() { return \`\${this.name}: \${this.area().toFixed(2)}\`; }
}

class Circle extends Shape {
  constructor(private r: number) { super("circle"); }
  area() { return Math.PI * this.r ** 2; }
}

// @ts-expect-error ❌ Cannot create an instance of an abstract class.
const s = () => new Shape("x");

// @ts-expect-error ❌ Class 'Broken' incorrectly implements interface 'Printable'.
class Broken implements Printable {}     // print() is missing

console.log(new Circle(1).print(), new Circle(2) instanceof Shape);`,
            output: `circle: 3.14 true`,
          },
        ],
        pitfalls: [
          '`implements` does not provide parameter types to methods — you still annotate them.',
          'Deep abstract hierarchies get rigid; composition is often simpler.',
        ],
        followUps: ['Can an interface extend a class?', 'What is the template-method pattern?'],
      },
      related: ['ts-access-modifiers', 'ts-type-vs-interface'],
    },
    {
      id: 'ts-void-callbacks',
      level: 'intermediate',
      priority: 1,
      question: 'Why can a function that returns a value be passed where `() => void` is expected?',
      tags: ['void', 'callbacks', 'assignability', 'functions'],
      answer: {
        interview: `**A \`void\` return type in a *function type* means "the caller will ignore the return value", so functions returning anything are assignable to it.**

- \`[1, 2].forEach(n => arr.push(n))\` works although \`push\` returns a number — \`forEach\` expects \`(…) => void\`.
- But a function *declaration* annotated \`: void\` must not return a value.
- \`void\` is not \`undefined\`: you cannot use the result of a \`() => void\` callback as a value safely.
- If the return value matters, type it (\`() => boolean\`) or use \`() => undefined\`.

Real-world: event-handler props typed \`onClick: () => void\` accept handlers that return promises or values.`,
        explanationBn: `\`() => void\` callback type-এর মানে "এই function যা-ই ফেরত দিক, আমি সেটা ব্যবহার করব না"। তাই যেকোনো return type-এর function সেখানে বসানো যায়।

এই নিয়ম না থাকলে \`arr.forEach(n => other.push(n))\` error দিত — \`push\` একটা number ফেরত দেয়, আর arrow function সেটাই return করে। প্রতিবার \`{ }\` দিয়ে মুড়তে হতো। এটা খুব বিরক্তিকর হতো, তাই TypeScript ছাড় দেয়।

কিন্তু নিজে function declare করে \`: void\` লিখলে ভেতর থেকে value return করা যাবে না — সেখানে নিয়ম কড়া।

আর caller-এর দিক থেকে: \`() => void\`-এর ফলাফল কাজে লাগানোর চেষ্টা করবেন না — type বলছে "কিছু নেই", কিন্তু ভেতরে আসলে কিছু থাকতে পারে।`,
        examples: [
          {
            lang: 'typescript',
            code: `const collected: number[] = [];
[1, 2, 3].forEach((n) => collected.push(n * 10));   // push returns a number: fine

type Listener = () => void;
const listener: Listener = () => 42;                // allowed
const result = listener();                          // typed as void...
console.log(collected, result);                     // ...but it is 42 at runtime

function log(msg: string): void {
  // @ts-expect-error ❌ Type 'number' is not assignable to type 'void'.
  return msg.length;
}`,
            output: `[ 10, 20, 30 ] 42`,
          },
        ],
        pitfalls: [
          'A `() => void` callback might return a Promise that nobody awaits — unhandled rejections hide here.',
        ],
        followUps: ['What is the difference between `void` and `undefined` as return types?'],
      },
      related: ['ts-function-types', 'ts-any-unknown-never'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'ts-this-parameter',
      level: 'advanced',
      priority: 1,
      question: 'How do you type `this` in TypeScript functions and methods?',
      tags: ['this', 'functions', 'classes', 'this-types'],
      answer: {
        interview: `**Declare a fake first parameter named \`this\` (\`function f(this: Counter)\`); it is erased in output but makes the compiler check every call’s \`this\`.**

- Calling such a function detached (\`const f = obj.method; f()\`) becomes a compile error instead of a runtime bug.
- \`noImplicitThis\` (in \`strict\`) errors when \`this\` would be \`any\`.
- Inside classes, the polymorphic \`this\` *type* enables fluent APIs: a method returning \`this\` returns the subclass type in subclasses.
- Arrow-function class fields capture \`this\` lexically — the usual fix for detached callbacks.

Real-world: builder classes (\`query.where(...).limit(10)\`) return \`this\` so subclasses keep their extra methods.`,
        explanationBn: `JavaScript-এ \`this\` নির্ভর করে function **কীভাবে call হলো** তার ওপর — method আলাদা করে নিয়ে ডাকলে \`this\` হারিয়ে যায়। TypeScript দুটো সমাধান দেয়:

**১. \`this\` parameter:** function-এর প্রথম parameter হিসেবে \`this: Counter\` লিখুন। এটা আসল parameter না — compile-এর পর মুছে যায়। কিন্তু compiler প্রতিটা call চেক করে: ভুল \`this\` দিয়ে (বা ছাড়া) ডাকলে error। Runtime bug compile error-এ পরিণত হয়।

**২. \`this\` type (polymorphic):** method-এর return type \`this\` হলে subclass-এ সেটা subclass-এর type হয়। Builder/fluent API-তে chaining-এর সময় subclass-এর নিজস্ব method হারিয়ে যায় না।

Detached callback-এর সবচেয়ে সাধারণ সমাধান অবশ্য arrow function class field, যেটা \`this\` lexically ধরে রাখে।`,
        examples: [
          {
            lang: 'typescript',
            code: `class Counter {
  count = 0;
  increment(this: Counter) { this.count++; return this.count; }
}
const c = new Counter();
const detached = c.increment;
// @ts-expect-error ❌ The 'this' context of type 'void' is not assignable to method's 'this' of type 'Counter'.
const fails = () => detached();

class QueryBuilder {
  parts: string[] = [];
  where(cond: string): this { this.parts.push(\`WHERE \${cond}\`); return this; }
}
class PagedQuery extends QueryBuilder {
  limit(n: number): this { this.parts.push(\`LIMIT \${n}\`); return this; }
}
const q = new PagedQuery().where("age > 18").limit(10);   // where() returned PagedQuery
console.log(c.increment(), q.parts.join(" "));`,
            output: `1 WHERE age > 18 LIMIT 10`,
          },
        ],
        pitfalls: [
          'The `this` parameter must be first and is not counted as a real argument.',
          'Returning the class name instead of `this` breaks chaining in subclasses.',
        ],
        followUps: ['How do arrow-function class fields fix detached methods?'],
      },
      related: ['ts-function-types'],
    },
    {
      id: 'ts-decorators',
      level: 'advanced',
      priority: 1,
      question: 'What are decorators in TypeScript?',
      tags: ['decorators', 'classes', 'metaprogramming', 'typescript-5'],
      answer: {
        interview: `**Decorators are functions applied with \`@name\` to classes and class members that can observe, replace or wrap them — TypeScript 5.0 implements the standard (TC39 stage 3) version.**

- A method decorator receives the original method and a \`context\` object (\`name\`, \`kind\`, \`addInitializer\`) and can return a replacement function.
- Common uses: logging, timing, memoization, validation, binding \`this\`, dependency-injection metadata.
- The older "experimental" decorators (\`experimentalDecorators: true\`) have a different signature and are still used by Angular and NestJS.
- Standard decorators do not support parameter decorators or \`emitDecoratorMetadata\`.

Real-world: \`@Component\` in Angular, \`@Controller()\`/\`@Get()\` in NestJS, \`@observable\` in MobX.`,
        explanationBn: `Decorator হলো একটা function, যেটা class বা method-এর ওপর \`@\` দিয়ে বসানো হয় — মূল code না বদলে তার আচরণ বদলানো বা বাড়ানো যায়।

Method decorator মূল method হাতে পায়, আর একটা নতুন function ফেরত দিতে পারে যেটা মূলটাকে মুড়ে রাখে — call-এর আগে/পরে কিছু করা (logging, সময় মাপা, cache)। যেন একটা method-এর চারপাশে একটা "wrapper" পরিয়ে দেওয়া।

দুটো version আছে, interview-তে এটা বলা ভালো:
- **Standard decorators (TS 5.0+)** — JavaScript-এর প্রস্তাবিত standard অনুযায়ী। নতুন code-এ এটাই।
- **Experimental/legacy decorators** — \`experimentalDecorators\` flag, আলাদা signature। Angular, NestJS এখনো এটা ব্যবহার করে।`,
        examples: [
          {
            lang: 'typescript',
            code: `function logged<This, Args extends unknown[], R>(
  method: (this: This, ...args: Args) => R,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>,
) {
  const name = String(context.name);
  return function (this: This, ...args: Args): R {
    console.log(\`→ \${name}(\${args.join(", ")})\`);
    return method.call(this, ...args);
  };
}

class Calculator {
  @logged
  add(a: number, b: number) { return a + b; }
}

console.log(new Calculator().add(2, 3));`,
            output: `→ add(2, 3)
5`,
          },
        ],
        pitfalls: [
          'Mixing standard decorators with libraries written for `experimentalDecorators` does not work.',
          'Decorators run once per class definition, not per instance (use `context.addInitializer` for per-instance work).',
        ],
        followUps: ['What is the difference between legacy and standard decorators?'],
      },
      related: ['ts-abstract-classes'],
    },
    {
      id: 'ts-static-accessors',
      level: 'foundation',
      priority: 1,
      question: 'How do static members, getters and setters work in TypeScript classes?',
      tags: ['classes', 'static', 'getters-setters', 'accessors'],
      answer: {
        interview: `**\`static\` members belong to the class itself, not to instances; \`get\`/\`set\` accessors run code on property reads and writes.**

- Access statics through the class name (\`Counter.instances\`); they cannot use the class’s type parameters.
- \`static { ... }\` blocks run once when the class is defined — for complex static initialisation.
- A getter without a setter makes the property read-only to the type checker (and throws on assignment in strict-mode code).
- Since TS 5.1, the getter and setter may have unrelated types (e.g. setter accepts \`string | number\`, getter returns \`number\`).
- Common uses: counters/caches shared by all instances, factory methods (\`User.fromJson\`), computed and validated properties.

Real-world: \`static fromJson(json: unknown): User\` as a validating factory next to a private constructor.`,
        explanationBn: `**\`static\`** — class-এর নিজের property/method, কোনো instance-এর না। সব instance মিলে একটাই — যেমন কয়টা object তৈরি হলো তার counter, বা \`User.fromJson()\`-এর মতো factory method। Instance থেকে (\`this.count\`) পাওয়া যায় না, class-এর নাম দিয়ে ডাকতে হয়।

**\`get\` / \`set\`** — দেখতে সাধারণ property, কিন্তু পড়লে/লিখলে function চলে।
- Getter — হিসাব করে value দেওয়া (\`area\`)।
- Setter — value বসানোর আগে যাচাই (negative radius আটকানো)।
- শুধু getter থাকলে TypeScript property-টাকে readonly ধরে।

Factory pattern-এ প্রায়ই \`private constructor\` + \`static create()\` — বাইরে থেকে \`new\` করা যায় না, সব object যাচাই করা পথ দিয়েই তৈরি হয়।`,
        examples: [
          {
            lang: 'typescript',
            code: `class Circle {
  static created = 0;
  static readonly UNIT = new Circle(1);

  #radius = 0;
  constructor(radius: number) { this.radius = radius; Circle.created++; }

  get radius() { return this.#radius; }
  set radius(value: number) {
    if (value < 0) throw new RangeError("radius must be >= 0");
    this.#radius = value;
  }
  get area() { return Math.PI * this.#radius ** 2; }
}

const c = new Circle(2);
c.radius = 3;
console.log(c.area.toFixed(1), Circle.created, Circle.UNIT.radius);
// @ts-expect-error ❌ Cannot assign to 'area' because it is a read-only property.
const setArea = () => (c.area = 10);
// @ts-expect-error ❌ Property 'created' does not exist on type 'Circle'.
c.created;
try { c.radius = -1; } catch (e) { console.log((e as Error).message); }`,
            output: `28.3 2 1
radius must be >= 0`,
          },
        ],
        pitfalls: [
          'Static members cannot reference the class’s generic type parameters.',
          'Heavy logic in getters surprises readers who expect property access to be cheap.',
        ],
        followUps: ['How would you implement a singleton in TypeScript?'],
      },
      related: ['ts-access-modifiers', 'ts-parameter-properties'],
    },
    {
      id: 'ts-custom-errors',
      level: 'intermediate',
      priority: 1,
      question: 'How do you create and handle custom error classes in TypeScript?',
      tags: ['errors', 'classes', 'instanceof', 'error-cause'],
      answer: {
        interview: `**Extend \`Error\`, set \`name\`, add typed fields, and narrow with \`instanceof\` in \`catch\` blocks (where the error is \`unknown\`).**

- \`class HttpError extends Error { constructor(public status: number, message: string, options?: ErrorOptions) { super(message, options); this.name = "HttpError"; } }\`.
- Pass \`{ cause }\` (ES2022) to keep the original error when wrapping.
- \`instanceof HttpError\` narrows \`unknown\` to \`HttpError\`, giving typed access to \`status\`.
- With a modern target (ES2015+), \`instanceof\` works out of the box; when compiling to ES5, subclassing built-ins needs \`Object.setPrototypeOf(this, new.target.prototype)\`.
- A discriminating field (\`readonly kind = "http"\`) also works across realms and serialization, where \`instanceof\` fails.

Real-world: an API client throwing \`HttpError\` so UI code can show "not found" for 404 and "try again" for 5xx.`,
        explanationBn: `সব error একই \`Error\` হলে catch-এ বোঝা কঠিন কোনটা কী — network সমস্যা, validation, নাকি 404? নিজের error class বানালে সেটা আলাদা করা যায়, আর বাড়তি তথ্য (\`status\`, \`field\`) type সহ বহন করা যায়।

**গঠন:** \`Error\` extend করুন, \`name\` set করুন (stack trace আর log-এ সেটাই দেখায়), দরকারি field যোগ করুন।

**Catch-এ:** \`err\` হলো \`unknown\` — \`instanceof HttpError\` চেক করলে TypeScript narrow করে, তখন \`err.status\` নিরাপদে পড়া যায়।

**\`cause\`:** নিচের স্তরের error মুড়ে উপরের স্তরে নতুন error ছুড়লে মূল কারণ হারিয়ে যায় না — \`new AppError("Login failed", { cause: err })\`।

পুরনো সতর্কতা: ES5-এ compile করলে built-in class extend করা ভাঙে — \`instanceof\` false দেয়। আধুনিক target-এ এই সমস্যা নেই।`,
        examples: [
          {
            lang: 'typescript',
            code: `class HttpError extends Error {
  constructor(public readonly status: number, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "HttpError";
  }
}

function load(status: number) {
  try {
    throw new HttpError(status, \`Request failed with \${status}\`);
  } catch (err) {
    throw new Error("Could not load profile", { cause: err });
  }
}

try {
  load(404);
} catch (err) {
  if (err instanceof Error && err.cause instanceof HttpError) {
    console.log(err.message, "←", err.cause.name, err.cause.status);
  }
}`,
            output: `Could not load profile ← HttpError 404`,
          },
        ],
        pitfalls: [
          'Forgetting `this.name` makes logs show a generic "Error".',
          '`instanceof` fails for errors from other realms or after JSON serialization — add a discriminant field for those cases.',
        ],
        followUps: ['When would you return a Result instead of throwing?'],
      },
      related: ['ts-catch-unknown', 'ts-type-narrowing'],
    },
    {
      id: 'ts-function-type-avoid',
      level: 'intermediate',
      priority: 1,
      question: 'Why should you avoid the `Function` type, and what should you use instead?',
      tags: ['functions', 'function-type', 'type-safety', 'callbacks'],
      answer: {
        interview: `**\`Function\` accepts any function and calling it returns \`any\` with no argument checks — it is almost as unsafe as \`any\`.**

- Write the real signature: \`(event: string) => void\`.
- For "any function" in a generic constraint, use \`(...args: never[]) => unknown\` (accepts every function, no \`any\`) or \`(...args: any[]) => any\` when you need to call it.
- Then use \`Parameters<F>\` and \`ReturnType<F>\` to stay precise.
- The same applies to \`Object\` and \`{}\` — lint rules (\`@typescript-eslint/no-unsafe-function-type\`) ban them.

Real-world: a handler registry typed \`Record<string, Function>\` lets wrong arguments through; a typed event map does not.`,
        explanationBn: `\`Function\` type মানে "যেকোনো function" — শুনতে ঠিক, কিন্তু সমস্যা হলো call করার সময়: যত খুশি, যে type-এর খুশি argument দেওয়া যায়, আর ফলাফল \`any\`। অর্থাৎ type checking কার্যত বন্ধ।

**বদলে কী:**
- আসল signature লিখুন: \`(id: number) => string\`।
- Generic-এ "যেকোনো function" বোঝাতে \`(...args: never[]) => unknown\` — এতে সব function বসে (parameter-এর নিয়ম উল্টো দিকে কাজ করে বলে \`never[]\` সবচেয়ে উদার), আর কোনো \`any\` ঢোকে না।
- তারপর \`Parameters<F>\`, \`ReturnType<F>\` দিয়ে নির্দিষ্ট type বের করুন।

নিচের উদাহরণে \`Function\` থাকায় ভুল argument compile হয়ে runtime-এ crash করে।`,
        examples: [
          {
            lang: 'typescript',
            code: `const loose: Record<string, Function> = {
  greet: (name: string) => \`Hello, \${name.toUpperCase()}\`,
};
const result = loose.greet?.(42);          // compiles: no argument checks, result is any
console.log(typeof result);`,
            output: `TypeError: name.toUpperCase is not a function`,
          },
          {
            lang: 'typescript',
            code: `const strict = {
  greet: (name: string) => \`Hello, \${name.toUpperCase()}\`,
};
// @ts-expect-error ❌ Argument of type 'number' is not assignable to parameter of type 'string'.
const bad = () => strict.greet(42);

function callTwice<F extends (...args: never[]) => unknown>(fn: F, ...args: Parameters<F>) {
  return [fn(...args), fn(...args)] as ReturnType<F>[];
}
console.log(callTwice(strict.greet, "rafi"));`,
            output: `[ 'Hello, RAFI', 'Hello, RAFI' ]`,
          },
        ],
        pitfalls: ['`Function` also includes classes, which cannot be called without `new`.'],
        followUps: ['Why is `never[]` the most permissive parameter list?'],
      },
      related: ['ts-function-types', 'ts-variance'],
    },
    {
      id: 'ts-mixins',
      level: 'advanced',
      priority: 1,
      question: 'How do you implement mixins in TypeScript?',
      tags: ['mixins', 'classes', 'generics', 'composition'],
      answer: {
        interview: `**A mixin is a function that takes a class and returns a new class extending it: \`const Timestamped = <B extends Constructor>(Base: B) => class extends Base { ... }\`.**

- Define \`type Constructor<T = {}> = new (...args: any[]) => T\` to accept any class.
- Mixins compose: \`class User extends Timestamped(Activatable(Base)) {}\` — a way around single inheritance.
- TypeScript infers the combined instance type, so all mixed-in members are typed.
- Constrain the base (\`B extends Constructor<{ id: string }>\`) when the mixin needs members from it.
- Prefer plain composition (objects holding helpers) unless you really need instance methods on one class.

Real-world: adding \`createdAt\`/\`touch()\` or event-emitter behaviour to several model classes without a deep hierarchy.`,
        explanationBn: `JavaScript-এ একটা class একটাই parent extend করতে পারে। কয়েকটা আলাদা ক্ষমতা (timestamp, activate/deactivate) অনেক class-এ যোগ করতে চাইলে? **Mixin** — একটা function, যে একটা class নিয়ে তাকে extend করা নতুন class ফেরত দেয়।

\`Timestamped(Activatable(Base))\` — একটার ওপর আরেকটা স্তর, যেন কেকের layer। ফলাফলের class-এ সব ক্ষমতা একসাথে।

TypeScript-এর ভূমিকা: \`Constructor\` type দিয়ে "যেকোনো class" গ্রহণ, আর ফেরত দেওয়া class-এর type নিজে থেকেই infer — তাই mix করা সব method-এ autocomplete আর type checking।

Mixin-এর দরকার হলে \`B extends Constructor<{ id: string }>\` লিখে base class-এর কাছে শর্ত রাখা যায়। তবে অনেক ক্ষেত্রে সাধারণ composition (helper object রাখা) সহজতর — mixin শেষ বিকল্প।`,
        examples: [
          {
            lang: 'typescript',
            code: `type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<B extends Constructor>(Base: B) {
  return class extends Base {
    createdAt = new Date(0);
    touch() { this.createdAt = new Date(86_400_000); return this; }
  };
}

function Activatable<B extends Constructor>(Base: B) {
  return class extends Base {
    active = false;
    activate() { this.active = true; return this; }
  };
}

class Model { constructor(public id: string) {} }
class User extends Timestamped(Activatable(Model)) {}

const u = new User("u1").activate().touch();
console.log(u.id, u.active, u.createdAt.toISOString().slice(0, 10), u instanceof Model);`,
            output: `u1 true 1970-01-02 true`,
          },
        ],
        pitfalls: [
          'Mixins cannot declare `private`/`protected` members in their returned class expression in a way that is visible in declaration files.',
          'Deep mixin stacks make error messages and debugging hard.',
        ],
        followUps: ['When would you prefer composition over mixins?'],
      },
      related: ['ts-abstract-classes', 'ts-instance-type'],
    },
  ],
});

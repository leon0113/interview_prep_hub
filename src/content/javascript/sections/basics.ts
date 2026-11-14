import { defineSection } from '../../define';

export const basics = defineSection({
  id: 'js-basics',
  title: 'Basics & Data Types',
  description:
    'What kind of language JavaScript is, its primitive and reference types, and the quirks interviewers love.',
  order: 1,
  questions: [
    {
      id: 'js-primitive-vs-reference-types',
      level: 'foundation',
      priority: 3,
      question: 'What are the primitive types in JavaScript, and how do they differ from objects?',
      tags: ['data-types', 'primitives', 'reference', 'memory'],
      answer: {
        interview: `**JavaScript has 7 primitive types — \`string\`, \`number\`, \`bigint\`, \`boolean\`, \`undefined\`, \`null\`, \`symbol\` — and everything else is an object** (arrays, functions, dates, plain objects).

- **Primitives** are immutable and are copied and compared **by value**.
- **Objects** are mutable; a variable holds a **reference**, so assignment copies the reference, and \`===\` compares references, not contents.
- That is why \`{} === {}\` is \`false\`, and why changing an object through one variable is visible through another.
- \`typeof null\` returns \`"object"\` — a historical bug; \`null\` is still a primitive.

Real-world: this is the reason state updates in UI libraries need a new object or array instead of a mutation.`,
        explanationBn: `JavaScript-এ value দুই রকমের, আর দুটোর আচরণ একদম আলাদা।

**Primitive** (\`string\`, \`number\`, \`bigint\`, \`boolean\`, \`undefined\`, \`null\`, \`symbol\`) হলো একেকটা সরল, অপরিবর্তনীয় value। \`let b = a\` লিখলে value-টার একটা আলাদা কপি তৈরি হয় — তাই পরে \`b\` বদলালে \`a\`-র কিছুই হয় না।

**Object** (array আর function-ও object) থাকে memory-র heap অংশে, আর variable-এর কাছে থাকে শুধু সেটার **ঠিকানা (reference)**। \`const same = user\` লিখলে object কপি হয় না, কপি হয় ঠিকানাটা। ফলে দুটো variable একই object-এর দিকে তাকিয়ে থাকে — একটা দিয়ে বদলালে অন্যটা দিয়েও সেই বদল দেখা যায়।

Analogy: primitive হলো একটা কাগজে লেখা সংখ্যা — ফটোকপি করলে দুটো আলাদা কাগজ। Object হলো একটা বাসা, আর variable হলো সেই বাসার ঠিকানা লেখা চিরকুট — চিরকুট কপি করলে বাসা দুটো হয়ে যায় না।

তুলনার সময়ও একই নিয়ম: \`===\` primitive-এর বেলায় value মেলায়, আর object-এর বেলায় মেলায় ঠিকানা। তাই দেখতে হুবহু এক হলেও \`{} === {}\` হয় \`false\` — কারণ ওরা দুটো আলাদা object।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'Copy by value vs copy by reference',
            code: `let a = 10;
let b = a;            // copies the VALUE
b = 20;
console.log(a, b);

const user = { name: "Rafi" };
const same = user;    // copies the REFERENCE
same.name = "Nadia";
console.log(user.name);

console.log({} === {}, [] === []);
console.log(typeof 42n, typeof Symbol("id"), typeof null, typeof []);`,
            output: `10 20
Nadia
false false
bigint symbol object object`,
          },
        ],
        pitfalls: [
          '`typeof null === "object"` and `typeof [] === "object"` — use `value === null` and `Array.isArray(value)`.',
          '`const` prevents reassignment, not mutation: a `const` object can still be changed.',
          'Spreading (`{ ...obj }`) copies only one level; nested objects are still shared.',
        ],
        followUps: [
          'How do you compare two objects by content?',
          'If strings are primitives, how can you call `"abc".toUpperCase()`?',
          'Is JavaScript pass-by-value or pass-by-reference?',
        ],
      },
      visualizationId: 'js-primitive-vs-reference',
      related: ['js-null-vs-undefined'],
    },
    {
      id: 'js-null-vs-undefined',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between `null` and `undefined`?',
      tags: ['data-types', 'null', 'undefined'],
      answer: {
        interview: `**\`undefined\` means a value has not been assigned; \`null\` is an intentional "no value" that a developer sets.**

- JavaScript produces \`undefined\` by itself: declared-but-unassigned variables, missing object properties, missing arguments, functions with no \`return\`.
- \`null\` never appears on its own — you assign it to say "deliberately empty".
- \`null == undefined\` is \`true\`, but \`null === undefined\` is \`false\`.
- \`typeof undefined\` is \`"undefined"\`; \`typeof null\` is \`"object"\` (a legacy bug).
- In arithmetic \`null\` becomes \`0\` and \`undefined\` becomes \`NaN\`; default parameters kick in only for \`undefined\`.

Real-world: \`value == null\` is a handy check for "null or undefined", and it is exactly what \`??\` and \`?.\` test for.`,
        explanationBn: `দুটোই "কিছু নেই" বোঝায়, কিন্তু **কে** বলছে সেটাই আসল পার্থক্য।

- \`undefined\` বলে JavaScript নিজে: "এখানে এখনো কোনো value দেওয়াই হয়নি।" Variable declare করে value না দিলে, object-এ নেই এমন property পড়তে গেলে, function-এ argument না পাঠালে, বা function কিছু \`return\` না করলে — সব জায়গায় পাওয়া যায় \`undefined\`।
- \`null\` বলেন developer: "আমি জেনেশুনে এখানে ফাঁকা রাখছি।" JavaScript নিজে থেকে কখনো \`null\` বসায় না।

Analogy: ফর্মের একটা ঘর যদি কেউ পূরণই না করে, সেটা \`undefined\`। আর কেউ যদি সেখানে নিজে হাতে "প্রযোজ্য নয়" লিখে দেয়, সেটা \`null\`।

কয়েকটা আচরণ আলাদা করে মনে রাখার মতো:

- Number-এ রূপান্তর হলে \`null\` হয় \`0\`, কিন্তু \`undefined\` হয় \`NaN\`।
- \`JSON.stringify\` \`undefined\` value-ওয়ালা property বাদ দিয়ে দেয়, কিন্তু \`null\` রেখে দেয়।
- Default parameter শুধু \`undefined\` পেলে কাজ করে — \`null\` পাঠালে default বসে না।
- \`==\` দিয়ে তুলনা করলে \`null\` আর \`undefined\` শুধু একে অপরের সমান, অন্য কিছুর সমান না। তাই \`x == null\` দিয়ে এক লাইনে দুটোই চেক করা যায়।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'Where each one shows up, and how they behave',
            code: `let x;
const user = { name: "Rafi", age: null };
console.log(x, user.email, user.age);

console.log(typeof undefined, typeof null);
console.log(null == undefined, null === undefined);
console.log(1 + null, 1 + undefined);
console.log(JSON.stringify({ a: undefined, b: null }));

function greet(name = "guest") {
  return \`Hi \${name}\`;
}
console.log(greet(undefined), greet(null));`,
            output: `undefined undefined null
undefined object
true false
1 NaN
{"b":null}
Hi guest Hi null`,
          },
        ],
        pitfalls: [
          '`typeof null` is `"object"`, so `typeof x === "object"` does not prove `x` is an object.',
          'A default parameter is not applied for `null`, only for `undefined`.',
          '`||` treats `0` and `""` as missing too; use `??` when only `null`/`undefined` should fall back.',
        ],
        followUps: [
          'What is the difference between `undefined` and "not defined" (a `ReferenceError`)?',
          'When would you use `??` instead of `||`?',
          'How do you check for both `null` and `undefined` in one expression?',
        ],
      },
      related: ['js-primitive-vs-reference-types'],
    },
    {
      id: 'js-pass-by-value-or-reference',
      level: 'foundation',
      priority: 3,
      question: 'Is JavaScript pass-by-value or pass-by-reference? How do you compare two objects?',
      tags: ['functions', 'references', 'equality', 'objects'],
      answer: {
        interview: `**JavaScript is always pass-by-value — but for objects, the value that gets copied is a reference ("call by sharing").**

- Passing a primitive gives the function its own copy; changing it inside has no effect outside.
- Passing an object copies the reference: **mutating** the object (\`user.name = "x"\`) is visible to the caller, but **reassigning** the parameter (\`user = {}\`) is not.
- \`===\` on objects compares references: two separate objects with identical content are not equal.
- To compare content: compare the fields you care about, use a deep-equality helper (e.g. \`node:util\`'s \`isDeepStrictEqual\`, Lodash \`isEqual\`), or \`JSON.stringify\` for simple, same-key-order data.

Real-world: a function that "sanitizes" a request object by mutating it changes the caller's object too — return a new object instead.`,
        explanationBn: `এই প্রশ্নের সঠিক উত্তর অনেকে ভুল বলেন। JavaScript **সবসময় pass-by-value** — কিন্তু object-এর ক্ষেত্রে যে "value" কপি হয়, সেটা হলো object-এর **ঠিকানা (reference)**। একে বলে "call by sharing"।

তাই function-এর ভেতরে দুটো আলাদা জিনিস ঘটতে পারে:
- **Mutation** (\`user.name = "Nadia"\`) — ঠিকানা ধরে গিয়ে আসল object-টাই বদলানো হলো। Caller-ও একই object দেখছে, তাই বদলটা দেখতে পায়।
- **Reassignment** (\`user = { name: "X" }\`) — function-এর local variable-টা শুধু নতুন একটা object-এর দিকে সরে গেল। Caller-এর variable আগের object-কেই দেখায় — কিছুই বদলায় না।

যদি সত্যিকারের pass-by-reference হতো, তাহলে reassignment-ও caller-এর variable বদলে দিত। সেটা হয় না — এটাই প্রমাণ।

**Object তুলনা:** \`===\` দেখে দুটো একই object কি না (একই ঠিকানা?), ভেতরের data না। তাই \`{a: 1} === {a: 1}\` হলো \`false\`। Content মেলাতে হলে field ধরে ধরে তুলনা করতে হয়, বা deep equality function ব্যবহার করতে হয়। \`JSON.stringify\` দিয়ে তুলনা দ্রুত কৌশল, কিন্তু key-এর ক্রম আলাদা হলে, বা \`undefined\`, function, \`Date\` থাকলে ভুল উত্তর দেয়।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'Mutation is shared; reassignment is not',
            code: `function mutate(user) {
  user.name = "Nadia";      // changes the shared object
}
function reassign(user) {
  user = { name: "Sam" };   // only the local variable moves
}
function bump(n) {
  n = n + 1;                // a copy of the primitive
}

const user = { name: "Rafi" };
let count = 1;
mutate(user);
reassign(user);
bump(count);
console.log(user.name, count);`,
            output: `Nadia 1`,
          },
          {
            lang: 'javascript',
            caption: 'Comparing objects by content',
            code: `const { isDeepStrictEqual } = require("node:util");

const a = { id: 1, tags: ["x"] };
const b = { id: 1, tags: ["x"] };
console.log(a === b, isDeepStrictEqual(a, b));
console.log(JSON.stringify(a) === JSON.stringify(b));
console.log(JSON.stringify({ x: 1, y: 2 }) === JSON.stringify({ y: 2, x: 1 }));`,
            output: `false true
true
false`,
          },
        ],
        pitfalls: [
          'Calling it "pass-by-reference" invites the follow-up "then why does reassigning the parameter not affect the caller?".',
          '`JSON.stringify` comparison breaks on different key order, `undefined`, functions and Dates.',
        ],
        followUps: [
          'How would you write a deep-equal function?',
          'How do you avoid mutating an object passed into a function?',
        ],
      },
      visualizationId: 'js-primitive-vs-reference',
      related: ['js-primitive-vs-reference-types'],
    },
    {
      id: 'js-what-is-javascript',
      level: 'foundation',
      priority: 2,
      question:
        'What kind of language is JavaScript? (single-threaded, dynamically typed, JIT-compiled)',
      tags: ['basics', 'runtime', 'jit', 'single-threaded'],
      answer: {
        interview: `**JavaScript is a high-level, dynamically typed, garbage-collected language that runs single-threaded with an event loop, and modern engines JIT-compile it to machine code.**

- **Single-threaded:** one call stack runs your code; concurrency comes from the event loop and asynchronous APIs (timers, network, file I/O), not from parallel threads. (Web Workers / worker threads exist but do not share the main thread's variables.)
- **Dynamically and weakly typed:** variables have no fixed type, and operators coerce types implicitly (\`"5" * 2\` is \`10\`).
- **JIT-compiled:** engines like V8 start by interpreting, then compile hot functions to optimized machine code based on the types they observe.
- **Multi-paradigm:** functions are first-class (functional style), and objects use prototypal inheritance.
- Runs in browsers and on servers (Node.js, Deno, Bun); the language itself is standardized as ECMAScript.

Real-world: the single-threaded model is why one long synchronous loop freezes a page — and why async code matters so much.`,
        explanationBn: `এক বাক্যে: JavaScript একটা dynamic, single-threaded language, যেটা modern engine-এ JIT compile হয়ে দ্রুত চলে। প্রতিটা শব্দের মানে আলাদা করে বুঝুন:

**Single-threaded:** আপনার code চালানোর জন্য একটাই call stack — এক সময়ে একটাই কাজ। তাহলে একসাথে network call, timer, click সামলায় কীভাবে? কাজগুলো browser বা Node-এর কাছে পাঠিয়ে দেয় (Web APIs), আর শেষ হলে callback একটা queue-তে এসে অপেক্ষা করে। Event loop সেগুলো একটা একটা করে চালায়। এজন্যই কোনো লম্বা synchronous loop চললে পুরো page জমে যায় — event loop অন্য কিছু চালানোর সুযোগই পায় না।

**Dynamically ও weakly typed:** variable-এর type ঘোষণা করতে হয় না, আর ভুল type মিশালে JavaScript error না দিয়ে নিজেই রূপান্তর করে নেয় (coercion) — \`"5" * 2\` হয় \`10\`। Python-এর মতো strongly typed না।

**JIT (Just-In-Time) compilation:** V8-এর মতো engine প্রথমে code দ্রুত interpret করে চালু করে দেয়, তারপর যে function বারবার চলে ("hot"), সেটাকে চলতে চলতেই optimized machine code-এ compile করে। তাই JavaScript এখন অনেক দ্রুত।

ECMAScript হলো language-এর আনুষ্ঠানিক মান (standard); JavaScript তার একটা implementation।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'One thread: the timer callback has to wait for the synchronous loop',
            code: `const start = Date.now();
setTimeout(() => {
  console.log("timer ran after at least", Date.now() - start >= 200 ? "200ms" : "?");
}, 0);

while (Date.now() - start < 200) {}   // blocks the only thread
console.log("loop finished");`,
            output: `loop finished
timer ran after at least 200ms`,
          },
        ],
        pitfalls: [
          '"Single-threaded" describes how your code runs; the runtime itself uses other threads for I/O.',
          'JavaScript and Java are unrelated languages.',
        ],
        followUps: [
          'How can a single-threaded language handle many requests at once?',
          'What is the event loop?',
        ],
      },
      related: ['js-event-loop'],
    },
    {
      id: 'js-typeof-quirks',
      level: 'foundation',
      priority: 2,
      question: 'What does `typeof` return, and what are its quirks?',
      tags: ['typeof', 'data-types', 'type-checking'],
      answer: {
        interview: `**\`typeof\` returns a string naming the operand's type: \`"string"\`, \`"number"\`, \`"bigint"\`, \`"boolean"\`, \`"undefined"\`, \`"symbol"\`, \`"object"\` or \`"function"\`.**

Quirks:
- \`typeof null\` is \`"object"\` — a bug from the first version of JavaScript, kept for compatibility.
- Arrays, dates, maps and regexes are all \`"object"\`; use \`Array.isArray(x)\` or \`instanceof\`.
- Functions (and classes) are objects but report \`"function"\`.
- \`typeof NaN\` is \`"number"\`.
- \`typeof undeclaredVariable\` is \`"undefined"\` instead of throwing — but a \`let\`/\`const\` variable in its temporal dead zone **does** throw.

Real-world: a safe "is this a plain object?" check is \`value !== null && typeof value === "object" && !Array.isArray(value)\`.`,
        explanationBn: `\`typeof\` একটা operator, যেটা value-র type একটা string হিসেবে বলে দেয়। সমস্যা হলো এর কয়েকটা উত্তর বিভ্রান্তিকর:

- **\`typeof null === "object"\`** — এটা JavaScript-এর একদম প্রথম version-এর একটা bug। তখন value-র type বোঝাতে কয়েকটা bit ব্যবহার হতো, আর object-এর type-code ছিল 0 — \`null\`-এর মানও ছিল 0 (null pointer)। ঠিক করলে পুরনো website ভেঙে যেত, তাই রেখে দেওয়া হয়েছে।
- **Array-ও \`"object"\`** — কারণ array আসলে একটা বিশেষ ধরনের object। Array চেনার জন্য \`Array.isArray()\`।
- **Function \`"function"\`** — function-ও আসলে object, কিন্তু callable বলে আলাদা উত্তর।
- **\`typeof NaN === "number"\`** — "Not a Number" নিজেই number type-এর একটা বিশেষ value।

একটা কাজের বৈশিষ্ট্য: যে variable কখনো declare-ই হয়নি, তার ওপর \`typeof\` চালালে error হয় না, \`"undefined"\` দেয়। Feature detection-এ পুরনো code-এ এটা দেখা যায় (\`typeof window !== "undefined"\`)। কিন্তু \`let\`/\`const\` declare হওয়ার আগের লাইনে (TDZ-তে) \`typeof\` ব্যবহার করলে \`ReferenceError\`।`,
        examples: [
          {
            lang: 'javascript',
            code: `const values = ["hi", 42, 10n, true, undefined, Symbol(), null, [], {}, () => {}, NaN];
console.log(values.map((v) => typeof v).join(" "));
console.log(Array.isArray([]), Array.isArray({}));
console.log(typeof notDeclaredAnywhere);

try {
  console.log(typeof later);
  let later = 1;
} catch (e) {
  console.log(e.name);
}`,
            output: `string number bigint boolean undefined symbol object object object function number
true false
undefined
ReferenceError`,
          },
        ],
        pitfalls: [
          '`typeof x === "object"` is also true for `null` and arrays.',
          '`typeof` on a `let`/`const` before its declaration throws a `ReferenceError` (TDZ).',
        ],
        followUps: [
          'How do you reliably check if something is an array?',
          'What is the Temporal Dead Zone?',
        ],
      },
      related: ['js-null-vs-undefined', 'js-reliable-type-checks'],
    },
    {
      id: 'js-nan',
      level: 'foundation',
      priority: 2,
      question: 'What is `NaN`, and what is the difference between `isNaN()` and `Number.isNaN()`?',
      tags: ['nan', 'numbers', 'type-coercion'],
      answer: {
        interview: `**\`NaN\` ("Not-a-Number") is a special \`number\` value for invalid numeric results, like \`0 / 0\` or \`Number("abc")\`.**

- \`NaN\` is the only value not equal to itself: \`NaN === NaN\` is \`false\`.
- Global \`isNaN(x)\` first **converts** \`x\` to a number, so \`isNaN("hello")\` is \`true\` even though \`"hello"\` is not \`NaN\`.
- \`Number.isNaN(x)\` (ES2015) does **no conversion** — it is \`true\` only for the actual \`NaN\` value. Prefer it.
- \`Object.is(x, NaN)\` and \`x !== x\` also detect \`NaN\`.
- \`[NaN].includes(NaN)\` is \`true\`, but \`[NaN].indexOf(NaN)\` is \`-1\`.

Real-world: validating user input with \`Number.isNaN(Number(input))\`, or better \`Number.isFinite(Number(input))\`, which also rejects \`Infinity\`.`,
        explanationBn: `\`NaN\` মানে "Not-a-Number" — কিন্তু মজার ব্যাপার হলো এর type নিজেই \`number\`। এটা আসে যখন কোনো সংখ্যার হিসাবের অর্থপূর্ণ উত্তর নেই: \`0 / 0\`, \`Math.sqrt(-1)\`, \`Number("abc")\`।

**অদ্ভুত বৈশিষ্ট্য:** \`NaN\` কারও সমান না — নিজেরও না। \`NaN === NaN\` হলো \`false\`। (IEEE 754 standard-এর নিয়ম: একটা অবৈধ হিসাবের ফল আরেকটা অবৈধ হিসাবের ফলের সমান ধরে নেওয়া যায় না।) তাই \`x === NaN\` দিয়ে কখনো চেক করা যায় না।

**দুটো চেক করার function:**
- **\`isNaN(x)\`** (global, পুরনো) — আগে \`x\`-কে number-এ রূপান্তর করে, তারপর দেখে \`NaN\` কি না। তাই \`isNaN("hello")\` → \`true\`, কারণ \`Number("hello")\` হলো \`NaN\`। প্রশ্নটা আসলে হয়ে যায় "এটা কি number-এ রূপান্তরযোগ্য না?" — যেটা বিভ্রান্তিকর।
- **\`Number.isNaN(x)\`** (আধুনিক) — কোনো রূপান্তর করে না। শুধু \`x\` নিজে আসলেই \`NaN\` হলে \`true\`। এটাই ব্যবহার করুন।

Input validation-এ \`Number.isFinite()\` আরও ভালো — এটা \`NaN\` আর \`Infinity\` দুটোই বাদ দেয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log(typeof NaN, 0 / 0, Number("abc"));
console.log(NaN === NaN, Object.is(NaN, NaN));
console.log(isNaN("hello"), Number.isNaN("hello"));
console.log(isNaN(NaN), Number.isNaN(NaN));
console.log([NaN].includes(NaN), [NaN].indexOf(NaN));
console.log(Number.isFinite(Number("12")), Number.isFinite(Number("1/0")), Number.isFinite(Infinity));`,
            output: `number NaN NaN
false true
true false
true true
true -1
true false false`,
          },
        ],
        pitfalls: [
          '`x === NaN` is always `false` — use `Number.isNaN(x)`.',
          'Global `isNaN` coerces its argument and gives surprising results for strings and objects.',
        ],
        followUps: ['What is the difference between `===` and `Object.is`?'],
      },
      related: ['js-object-is'],
    },
    {
      id: 'js-truthy-falsy',
      level: 'foundation',
      priority: 2,
      question: 'What are truthy and falsy values in JavaScript?',
      tags: ['truthiness', 'boolean', 'type-coercion', 'conditionals'],
      answer: {
        interview: `**In a boolean context (\`if\`, \`&&\`, \`||\`, \`!\`), every value converts to \`true\` or \`false\`. There are exactly eight falsy values; everything else is truthy.**

- **Falsy:** \`false\`, \`0\`, \`-0\`, \`0n\`, \`""\` (empty string), \`null\`, \`undefined\`, \`NaN\`.
- **Truthy:** everything else — including \`"0"\`, \`"false"\`, \`" "\`, \`[]\`, \`{}\`, \`function() {}\`, \`Infinity\`.
- Empty arrays and objects are **truthy** (unlike Python), so check \`arr.length\` or \`Object.keys(obj).length\`.
- \`!!value\` or \`Boolean(value)\` converts explicitly.
- \`if (x)\` treats \`0\` and \`""\` as missing; use \`x != null\` or \`??\` when those are valid values.

Real-world: \`const count = input || 10\` silently replaces a legitimate \`0\` with \`10\`; \`input ?? 10\` does not.`,
        explanationBn: `\`if\`-এর condition-এ যেকোনো value বসালে JavaScript সেটাকে \`true\` বা \`false\`-এ রূপান্তর করে। কোন value কী হবে, সেটা মুখস্থ রাখার সহজ উপায়: **falsy value মাত্র আটটা** — বাকি সব truthy।

আটটা falsy: \`false\`, \`0\`, \`-0\`, \`0n\` (BigInt zero), \`""\` (খালি string), \`null\`, \`undefined\`, \`NaN\`।

যেগুলো ভুল করে falsy মনে হয়, কিন্তু আসলে truthy:
- \`"0"\` আর \`"false"\` — খালি না এমন string, তাই truthy।
- \`[]\` আর \`{}\` — খালি হলেও object, আর সব object truthy। **Python থেকে আসা developer-রা এখানে প্রায়ই ভুল করেন** — Python-এ খালি list falsy, JavaScript-এ না। Array খালি কি না জানতে \`arr.length === 0\` চেক করুন।

বাস্তব bug: \`const page = input || 1\` — user যদি \`0\` দেয়, সেটা falsy বলে বাদ পড়ে আর \`1\` বসে যায়। এখানে \`??\` (nullish coalescing) সঠিক, কারণ এটা শুধু \`null\`/\`undefined\`-এ default দেয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `const falsy = [false, 0, -0, 0n, "", null, undefined, NaN];
console.log(falsy.every((v) => !v));

const surprising = ["0", "false", " ", [], {}, () => {}, Infinity];
console.log(surprising.map((v) => Boolean(v)).join(" "));

const items = [];
console.log(items ? "truthy" : "falsy", items.length ? "has items" : "empty");

const input = 0;
console.log(input || 10, input ?? 10);`,
            output: `true
true true true true true true true
truthy empty
10 0`,
          },
        ],
        pitfalls: [
          'Empty arrays and objects are truthy — check `.length` instead.',
          '`value || fallback` replaces valid `0`, `""` and `false` values.',
        ],
        followUps: ['What is the difference between `||` and `??`?', 'What does `!!value` do?'],
      },
      related: ['js-null-vs-undefined', 'js-logical-operators-nullish'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'js-number-type-bigint',
      level: 'intermediate',
      priority: 2,
      question: 'How are numbers represented in JavaScript, and when do you need `BigInt`?',
      tags: ['numbers', 'ieee-754', 'bigint', 'precision'],
      answer: {
        interview: `**JavaScript has one \`number\` type: a 64-bit IEEE 754 double. Integers are exact only up to \`Number.MAX_SAFE_INTEGER\` (2⁵³ − 1); beyond that, use \`BigInt\`.**

- No separate integer type: \`1\` and \`1.0\` are the same value.
- Decimal fractions are approximate: \`0.1 + 0.2\` is \`0.30000000000000004\`.
- Past 2⁵³ integers lose precision: \`2 ** 53 + 1 === 2 ** 53\` is \`true\`.
- \`BigInt\` (\`123n\` or \`BigInt("123")\`) has arbitrary precision for integers; it cannot be mixed with \`number\` in arithmetic without explicit conversion, and \`JSON.stringify\` does not support it.
- Special values: \`Infinity\`, \`-Infinity\`, \`NaN\`, and \`-0\`.

Real-world: 64-bit database IDs (e.g. tweet IDs) must be sent as strings or BigInt, or the last digits get corrupted.`,
        explanationBn: `Java বা C-তে \`int\`, \`long\`, \`float\`, \`double\` — অনেক ধরনের সংখ্যা। JavaScript-এ মাত্র একটা: \`number\`, যেটা ভেতরে সবসময় একটা 64-bit floating-point (IEEE 754 double)। \`5\` আর \`5.0\` একই জিনিস।

**এর দুটো পরিণতি:**

১. **দশমিক সংখ্যা আনুমানিক:** binary-তে 0.1 ঠিকঠাক রাখা যায় না, তাই \`0.1 + 0.2\` হয় \`0.30000000000000004\`। টাকার হিসাব cent-এ integer হিসেবে রাখা ভালো।

২. **বড় integer নিরাপদ না:** 64 bit-এর মধ্যে 53 bit সংখ্যার digit-এর জন্য। তাই \`2⁵³ − 1\` (প্রায় ৯ কোয়াড্রিলিয়ন) পর্যন্ত সব integer নির্ভুল — এটাই \`Number.MAX_SAFE_INTEGER\`। এর ওপরে পাশাপাশি দুটো integer আলাদা করে রাখা যায় না: \`2 ** 53 + 1\` আসলে \`2 ** 53\`-ই থাকে।

**BigInt** এই সমস্যার সমাধান — যত বড় খুশি integer, নির্ভুলভাবে। শেষে \`n\` লিখে বানানো হয়: \`9007199254740993n\`। তবে \`number\` আর \`BigInt\` একসাথে যোগ-বিয়োগ করা যায় না (\`TypeError\`) — হাতে রূপান্তর করতে হয়, কারণ রূপান্তরে নির্ভুলতা হারাতে পারে।

বাস্তব উদাহরণ: Twitter/X-এর ID ২⁵³-এর চেয়ে বড়। API-তে number হিসেবে পাঠালে JavaScript-এ শেষের digit বদলে যায় — তাই ID string হিসেবে পাঠানো হয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log(1 === 1.0, 0.1 + 0.2);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1 === 2 ** 53, 9007199254740993);
console.log(2n ** 53n + 1n);

try {
  console.log(1n + 1);
} catch (e) {
  console.log(e.name, "-", e.message);
}
console.log(Number(10n) + 1, typeof 10n);`,
            output: `true 0.30000000000000004
9007199254740991
true 9007199254740992
9007199254740993n
TypeError - Cannot mix BigInt and other types, use explicit conversions
11 bigint`,
          },
        ],
        pitfalls: [
          'Large IDs in JSON become wrong numbers when parsed — keep them as strings.',
          '`JSON.stringify({ id: 1n })` throws a `TypeError`.',
        ],
        followUps: ['Why is `0.1 + 0.2 !== 0.3`?', 'How would you handle money in JavaScript?'],
      },
    },
    {
      id: 'js-primitive-methods-autoboxing',
      level: 'intermediate',
      priority: 1,
      question: 'If strings are primitives, how can you call methods like `"abc".toUpperCase()`?',
      tags: ['primitives', 'wrapper-objects', 'autoboxing', 'strings'],
      answer: {
        interview: `**Through autoboxing: when you access a property on a primitive, JavaScript temporarily wraps it in its wrapper object (\`String\`, \`Number\`, \`Boolean\`, \`Symbol\`, \`BigInt\`), looks the method up on that wrapper's prototype, calls it, and throws the wrapper away.**

- That is why \`"abc".length\` and \`(5).toFixed(2)\` work.
- Properties you assign to a primitive vanish — they were set on the temporary wrapper.
- Strings stay immutable: methods return new strings.
- Never create wrappers yourself with \`new String("x")\` — they are objects, so \`typeof\` is \`"object"\` and they are always truthy (\`new Boolean(false)\` is truthy!).
- \`null\` and \`undefined\` have no wrappers, so property access on them throws a \`TypeError\`.

Real-world: \`String(value)\` and \`Number(value)\` (without \`new\`) are the right way to convert.`,
        explanationBn: `Primitive (string, number, boolean) object না — তাহলে \`"abc".toUpperCase()\`-এর মতো method কোথা থেকে আসে?

উত্তর **autoboxing**: আপনি primitive-এর ওপর কোনো property বা method access করলে, JavaScript সেই মুহূর্তে চুপচাপ একটা wrapper object (\`new String("abc")\`-এর মতো) বানায়, তার prototype থেকে method খুঁজে call করে, তারপর wrapper-টা ফেলে দেয়। পুরোটাই চোখের আড়ালে।

এর একটা মজার পরিণতি:
\`\`\`js
const s = "hi";
s.color = "red";     // অস্থায়ী wrapper-এ বসানো হলো
s.color;             // undefined — সেই wrapper আর নেই
\`\`\`

**নিজে \`new String()\` কেন না?** তাহলে একটা আসল object তৈরি হয়: \`typeof\` হয় \`"object"\`, \`===\` তুলনা ভেঙে যায়, আর সবচেয়ে বিপজ্জনক — \`new Boolean(false)\` একটা object, তাই **truthy**! রূপান্তর করতে চাইলে \`new\` ছাড়া \`String(x)\`, \`Number(x)\` ব্যবহার করুন — এগুলো primitive ফেরত দেয়।

\`null\` আর \`undefined\`-এর কোনো wrapper নেই — তাই \`null.length\` সরাসরি \`TypeError\`।`,
        examples: [
          {
            lang: 'javascript',
            code: `const s = "hi";
console.log(s.toUpperCase(), s.length, (3.14159).toFixed(2));

s.color = "red";               // set on a throwaway wrapper
console.log(s.color);

const wrapped = new Boolean(false);
console.log(typeof wrapped, wrapped ? "truthy!" : "falsy");
console.log(typeof String(42), String(42) === "42");`,
            output: `HI 2 3.14
undefined
object truthy!
string true`,
          },
        ],
        pitfalls: [
          '`new Boolean(false)` is truthy and `new String("a") !== "a"` — never use primitive wrappers with `new`.',
        ],
        followUps: ['Why does `null.length` throw but `"".length` does not?'],
      },
    },
    {
      id: 'js-reliable-type-checks',
      level: 'intermediate',
      priority: 2,
      question: 'How do you reliably check the type of a value in JavaScript?',
      tags: ['type-checking', 'typeof', 'instanceof', 'array-isarray'],
      answer: {
        interview: `**Use the right tool for each case — \`typeof\` alone is not enough.**

- **Primitives:** \`typeof x === "string"\` / \`"number"\` / \`"boolean"\` / \`"bigint"\` / \`"symbol"\` / \`"undefined"\`.
- **null:** \`x === null\`; "null or undefined": \`x == null\`.
- **Arrays:** \`Array.isArray(x)\` — works across iframes/realms, unlike \`instanceof Array\`.
- **Class instances:** \`x instanceof Date\` (checks the prototype chain).
- **Functions:** \`typeof x === "function"\`.
- **Exact built-in tag:** \`Object.prototype.toString.call(x)\` → \`"[object Date]"\`, \`"[object Null]"\`…
- **Valid numbers:** \`Number.isFinite(x)\` (rejects \`NaN\` and \`Infinity\`); integers: \`Number.isInteger(x)\`.

Real-world: validation code at API boundaries combines these — or uses a schema library (zod, Joi) so you do not hand-roll them.`,
        explanationBn: `JavaScript-এ type চেক করার কোনো একক নিখুঁত উপায় নেই — প্রতিটা ক্ষেত্রের জন্য আলাদা tool:

- **Primitive**: \`typeof\` ঠিক কাজ করে — \`"string"\`, \`"number"\` ইত্যাদি।
- **\`null\`**: \`typeof\` এখানে মিথ্যা বলে (\`"object"\`), তাই সরাসরি \`x === null\`।
- **Array**: \`Array.isArray()\`। \`instanceof Array\` সাধারণত চলে, কিন্তু iframe থেকে আসা array অন্য window-এর \`Array\` constructor দিয়ে তৈরি, তাই \`instanceof\` ব্যর্থ হয়।
- **Date, Map, নিজের class**: \`instanceof\` — এটা দেখে object-এর prototype chain-এ ওই class-এর prototype আছে কি না।
- **সবচেয়ে নির্দিষ্ট উত্তর**: \`Object.prototype.toString.call(x)\` — প্রতিটা built-in type-এর জন্য আলাদা tag দেয়, \`null\`-এর জন্যও।

Number validation-এ সাবধান: \`typeof NaN\` হলো \`"number"\`। তাই "এটা কি ব্যবহারযোগ্য সংখ্যা?" জানতে \`Number.isFinite()\`।

বাস্তবে, বাইরে থেকে আসা data (API request, form) যাচাই করতে zod-এর মতো schema library ব্যবহার করাই সবচেয়ে নিরাপদ।`,
        examples: [
          {
            lang: 'javascript',
            code: `const tag = (x) => Object.prototype.toString.call(x).slice(8, -1);
const samples = [null, [], {}, new Date(0), /re/, () => {}, 42, "s"];
console.log(samples.map(tag).join(" "));

console.log(Array.isArray([]), [] instanceof Array, [] instanceof Object);
console.log(new Date(0) instanceof Date, typeof new Date(0));
console.log(Number.isFinite(NaN), Number.isInteger(5.0), Number.isInteger(5.5));`,
            output: `Null Array Object Date RegExp Function Number String
true true true
true object
false true false`,
          },
        ],
        followUps: ['How does `instanceof` work internally?'],
      },
      related: ['js-typeof-quirks', 'js-prototype-chain'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'js-object-is',
      level: 'advanced',
      priority: 1,
      question: 'What is the difference between `===` and `Object.is()`?',
      tags: ['equality', 'object-is', 'nan', 'negative-zero'],
      answer: {
        interview: `**They agree on everything except two edge cases: \`Object.is(NaN, NaN)\` is \`true\` (while \`NaN === NaN\` is \`false\`), and \`Object.is(0, -0)\` is \`false\` (while \`0 === -0\` is \`true\`).**

- \`Object.is\` implements the "SameValue" algorithm; \`===\` is "strict equality".
- \`includes\`, \`Map\` and \`Set\` use "SameValueZero": \`NaN\` equals \`NaN\`, but \`0\` and \`-0\` are equal.
- \`-0\` appears in some math (\`-1 * 0\`, \`Math.round(-0.4)\`) and matters for things like direction or sign of a limit; \`1 / -0\` is \`-Infinity\`.
- React uses \`Object.is\` to decide whether state changed.

Real-world: this is why \`[NaN].includes(NaN)\` works but \`indexOf\` (which uses \`===\`) does not.`,
        explanationBn: `JavaScript-এ আসলে চার ধরনের equality আছে, আর \`===\`-এর দুটো ছোট্ট ব্যতিক্রম ঠিক করতেই \`Object.is\` আনা হয়েছে:

1. **\`NaN\`:** \`NaN === NaN\` হলো \`false\` (IEEE নিয়ম), কিন্তু \`Object.is(NaN, NaN)\` হলো \`true\` — যেটা সাধারণ বুদ্ধিতে বেশি যুক্তিসঙ্গত।
2. **\`-0\`:** IEEE floating-point-এ শূন্যের দুটো রূপ আছে: \`+0\` আর \`-0\`। \`===\` এদের সমান ধরে, কিন্তু \`Object.is\` আলাদা করে। পার্থক্যটা কখন বোঝা যায়? \`1 / 0\` হলো \`Infinity\`, কিন্তু \`1 / -0\` হলো \`-Infinity\`।

চারটা algorithm-এর সারসংক্ষেপ:
- \`==\` — type রূপান্তর করে তুলনা।
- \`===\` — রূপান্তর ছাড়া, কিন্তু NaN আর -0-তে উপরের দুটো ব্যতিক্রম।
- **SameValueZero** — \`includes\`, \`Map\`, \`Set\` এটা ব্যবহার করে: NaN সমান NaN, কিন্তু 0 আর -0 সমান।
- **SameValue** (\`Object.is\`) — সব ক্ষেত্রেই "একদম একই value?"

React state বদলেছে কি না বুঝতে \`Object.is\` ব্যবহার করে।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log(NaN === NaN, Object.is(NaN, NaN));
console.log(0 === -0, Object.is(0, -0));
console.log(1 / 0, 1 / -0);
console.log([NaN].includes(NaN), [NaN].indexOf(NaN));
console.log(new Set([0, -0, NaN, NaN]).size);`,
            output: `false true
true false
Infinity -Infinity
true -1
2`,
          },
        ],
        followUps: ['Which equality algorithm do `Map` and `Set` use?'],
      },
      related: ['js-nan', 'js-loose-vs-strict-equality'],
    },
    {
      id: 'js-slice-substring-substr',
      level: 'foundation',
      priority: 1,
      question: 'What is the difference between `slice`, `substring` and `substr` on strings?',
      tags: ['strings', 'slice', 'substring'],
      answer: {
        interview: `**All three extract part of a string; \`slice\` is the one to use.**

- \`slice(start, end)\` — end is exclusive; **negative indexes count from the end** (\`"hello".slice(-3)\` → \`"llo"\`).
- \`substring(start, end)\` — treats negatives as \`0\` and **swaps** the arguments if \`start > end\`.
- \`substr(start, length)\` — second argument is a **length**; it is deprecated (Annex B, legacy) — avoid it in new code.
- None of them change the original string; strings are immutable.

Real-world: \`fileName.slice(fileName.lastIndexOf(".") + 1)\` for an extension, \`str.slice(-4)\` for the last four digits of a card number.`,
        explanationBn: `তিনটাই string-এর একটা অংশ কেটে নতুন string দেয় — মূল string বদলায় না।

পার্থক্য খুঁটিনাটিতে:
- **\`slice\`** — negative index মানে শেষ থেকে গোনা। \`slice(-3)\` = শেষ তিনটা অক্ষর। Array-র \`slice\`-এর সাথেও একই নিয়ম, তাই মনে রাখা সহজ।
- **\`substring\`** — negative পেলে 0 ধরে, আর start বড় হলে দুটো argument উল্টে নেয়। এই "নিজে থেকে ঠিক করে নেওয়া" আচরণ bug লুকিয়ে রাখতে পারে।
- **\`substr\`** — দ্বিতীয় argument end না, **কয়টা অক্ষর**। এটা deprecated, পুরনো code-এ দেখবেন কিন্তু নতুন code-এ লিখবেন না।

Interview-তে সংক্ষেপে: "সবসময় \`slice\` — negative index সুবিধা, array-র সাথে একই আচরণ।"`,
        examples: [
          {
            lang: 'javascript',
            code: `const s = "JavaScript";
console.log(s.slice(0, 4), s.slice(-6), s.slice(4, 0));
console.log(s.substring(0, 4), s.substring(-6), s.substring(4, 0));
console.log(s.substr(4, 3));
console.log(s);`,
            output: `Java Script
Java JavaScript Java
Scr
JavaScript`,
          },
        ],
        pitfalls: [
          '`slice(4, 0)` returns `""` while `substring(4, 0)` silently swaps to `substring(0, 4)`.',
          '`substr`’s second argument is a length, not an end index.',
        ],
        followUps: ['How do you get a file extension from a file name?'],
      },
      related: ['js-slice-vs-splice'],
    },
    {
      id: 'js-template-literals',
      level: 'foundation',
      priority: 2,
      question: 'What are template literals, and what can they do that normal strings cannot?',
      tags: ['strings', 'template-literals', 'es6'],
      answer: {
        interview: `**Template literals are strings in backticks that support \`\${expression}\` interpolation, real multi-line text, and tag functions.**

- Any expression works inside \`\${}\` — calls, ternaries, arithmetic; the result is converted to a string.
- Line breaks inside the backticks are kept, so no \`\\n\` concatenation.
- \`String.raw\` (a built-in tag) keeps backslashes as written — useful for regexes and Windows paths.
- Tagged templates (a function name written right before the literal) let that function process the parts — used by styled-components, GraphQL and SQL libraries.

Real-world: building messages and URLs such as \`/users/\${id}/orders?page=\${page}\` without string concatenation.`,
        explanationBn: `Backtick দিয়ে লেখা string — তিনটা বাড়তি ক্ষমতা:

1. **Interpolation** — \`\${...}\`-এর ভেতরে যেকোনো JavaScript expression। আর \`+\` দিয়ে জোড়া লাগানোর ঝামেলা নেই।
2. **Multi-line** — Enter চাপলে সত্যিকারের নতুন লাইন। (খেয়াল: indentation-এর space-ও string-এর অংশ হয়ে যায়।)
3. **Tagged template** — সামনে function-এর নাম দিলে সেই function string-এর টুকরো আর value গুলো আলাদা করে পায়। \`String.raw\` এরকম একটা built-in tag — backslash escape করে না।

\`\${}\`-এর ভেতরের value string-এ রূপান্তর হয় — object দিলে \`[object Object]\` আসে, তাই object দেখাতে \`JSON.stringify\` লাগে।`,
        examples: [
          {
            lang: 'javascript',
            code: `const user = { name: "Rafi", cart: [120, 80] };
const total = user.cart.reduce((a, b) => a + b, 0);
console.log(\`\${user.name} owes \${total > 150 ? "a lot" : "a little"}: \${total} BDT\`);

const lines = \`line 1
line 2\`;
console.log(lines.split("\\n").length);
console.log(\`\${{ a: 1 }}\`, String.raw\`C:\\new\\table\`);`,
            output: `Rafi owes a lot: 200 BDT
2
[object Object] C:\\new\\table`,
          },
        ],
        pitfalls: [
          'Indentation inside a multi-line template becomes part of the string.',
          'Interpolating an object prints `[object Object]`.',
          'Never build SQL or HTML by plain interpolation of user input — use parameters or an escaping tag.',
        ],
        followUps: ['What is a tagged template literal?'],
      },
      related: ['js-to-primitive'],
    },
  ],
});

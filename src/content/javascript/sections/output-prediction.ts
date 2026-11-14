import { defineSection, type SectionQuestion } from '../../define';
import type { Level, Priority } from '../../schema';

/**
 * "What does this print?" puzzles. The puzzle code is shown in the question and repeated as
 * the first example, so `npm run verify:outputs` checks the revealed output against Node.
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
  visualizationId?: string;
}): SectionQuestion {
  return {
    id: p.id,
    level: p.level,
    priority: p.priority,
    question: `${p.title}\n\n\`\`\`javascript\n${p.code}\n\`\`\``,
    tags: ['output-prediction', ...p.tags],
    answer: {
      interview: `**Output:**\n\n\`\`\`text\n${p.output}\n\`\`\`\n\n${p.why}`,
      explanationBn: p.explanationBn,
      examples: [
        {
          lang: 'javascript',
          code: p.code,
          output: p.output,
          caption: 'The puzzle, with its real output (Node.js)',
        },
      ],
      pitfalls: p.pitfalls,
      followUps: p.followUps,
    },
    visualizationId: p.visualizationId,
    related: p.related,
  };
}

export const outputPrediction = defineSection({
  id: 'js-output-prediction',
  title: 'Output Prediction',
  description:
    'Classic "what does this print?" puzzles on hoisting, the TDZ, closures, `this`, coercion and the event loop. Predict first, then reveal.',
  order: 10,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    puzzle({
      id: 'js-out-typeof',
      level: 'foundation',
      priority: 2,
      title: '`typeof` quirks: what does this print?',
      tags: ['typeof', 'data-types'],
      code: `console.log(typeof null);
console.log(typeof []);
console.log(typeof function () {});
console.log(typeof NaN);
console.log(typeof typeof 1);
console.log(typeof undeclaredName);`,
      output: `object
object
function
number
string
undefined`,
      why: `- \`typeof null\` is \`"object"\` — a bug kept for backward compatibility.
- Arrays are objects; use \`Array.isArray\` to detect them.
- Functions are objects too, but \`typeof\` reports \`"function"\`.
- \`NaN\` is a special **number** value.
- \`typeof 1\` is the string \`"number"\`, so \`typeof typeof 1\` is \`"string"\`.
- \`typeof\` on an undeclared name returns \`"undefined"\` instead of throwing.`,
      explanationBn: `ছয়টা লাইনেই একটা করে ফাঁদ:

1. \`typeof null\` → \`"object"\` — JavaScript-এর প্রথম দিনের একটা bug, পুরনো website ভাঙার ভয়ে আর ঠিক করা হয়নি।
2. Array আসলে object — তাই \`"object"\`। Array চিনতে \`Array.isArray\`।
3. Function-ও object, কিন্তু \`typeof\` আলাদা করে \`"function"\` বলে।
4. "Not a Number" নিজেই number type — \`"number"\`।
5. \`typeof 1\` দেয় \`"number"\` — একটা **string**। তার \`typeof\` তাই \`"string"\`।
6. Declare না করা নামে সাধারণত \`ReferenceError\`, কিন্তু \`typeof\` ব্যতিক্রম — \`"undefined"\` দেয়।`,
      related: ['js-typeof-quirks'],
    }),
    puzzle({
      id: 'js-out-float-sum',
      level: 'foundation',
      priority: 2,
      title: '`0.1 + 0.2`: what does this print?',
      tags: ['numbers', 'floating-point', 'ieee-754'],
      code: `console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log((0.1 + 0.2).toFixed(2) === "0.30");
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
console.log(0.5 + 0.25 === 0.75);`,
      output: `0.30000000000000004
false
true
true
true`,
      why: `- Numbers are IEEE 754 doubles; \`0.1\` and \`0.2\` have no exact binary representation, so their sum is slightly off.
- Compare floats with a tolerance (\`Number.EPSILON\` for values near 1) or round for display with \`toFixed\`.
- \`0.5\` and \`0.25\` are exact powers of two, so that sum is exact.
- For money, work in integer cents or use a decimal library.`,
      explanationBn: `কম্পিউটার সংখ্যা রাখে binary-তে। 0.1 আর 0.2 binary-তে অসীম ভগ্নাংশ — যেমন দশমিকে 1/3 = 0.333…। তাই কাছাকাছি একটা value রাখা হয়, আর যোগ করলে ছোট্ট ভুল জমে: \`0.30000000000000004\`।

এটা JavaScript-এর সমস্যা না — IEEE 754 মানা সব language-এ একই ফল।

সমাধান:
- **তুলনা:** সরাসরি \`===\` না করে পার্থক্য খুব ছোট কি না দেখুন — \`Number.EPSILON\`।
- **দেখানো:** \`toFixed(2)\`।
- **টাকাপয়সা:** পয়সায় (integer cent) হিসাব করুন।

শেষ লাইনটা মজার: 0.5 (½) আর 0.25 (¼) দুইয়ের ঘাত, binary-তে হুবহু রাখা যায় — তাই সেই যোগফল নির্ভুল।`,
      related: ['js-number-type-bigint'],
    }),
    puzzle({
      id: 'js-out-array-plus',
      level: 'foundation',
      priority: 2,
      title: '`[1, 2, 3] + [4]`: what does this print?',
      tags: ['type-coercion', 'arrays', 'plus-operator'],
      code: `console.log([1, 2, 3] + [4]);
console.log([] + []);
console.log([1] + 1);
console.log([2] * [3]);
console.log({} + "x");`,
      output: `1,2,34

11
6
[object Object]x`,
      why: `- \`+\` converts objects to primitives first; arrays become comma-joined strings: \`[1, 2, 3]\` → \`"1,2,3"\`, \`[4]\` → \`"4"\`.
- Two strings are concatenated: \`"1,2,3" + "4"\` → \`"1,2,34"\`.
- \`[] + []\` → \`"" + ""\` → an empty string (the blank line).
- \`[1] + 1\` → \`"1" + 1\` → \`"11"\` (a string is involved, so concatenation).
- \`*\` is numeric only: \`"2" * "3"\` → \`6\`.
- A plain object becomes \`"[object Object]"\`.`,
      explanationBn: `\`+\` operator object পেলে আগে সেটাকে primitive (string) বানায়:
- Array → element গুলো comma দিয়ে জোড়া string: \`[1,2,3]\` → \`"1,2,3"\`, \`[4]\` → \`"4"\`।
- তারপর দুটোই string, তাই জোড়া লাগে: \`"1,2,3" + "4"\` = \`"1,2,34"\` — "34" দেখে অনেকে ধোঁকা খান।

বাকিগুলো একই নিয়মে:
- \`[] + []\` → \`"" + ""\` → খালি string (output-এ ফাঁকা লাইন)।
- \`[1] + 1\` → \`"1" + 1\` → একটা string আছে, তাই \`"11"\`।
- \`*\` শুধু সংখ্যা বোঝে: \`[2]\` → \`"2"\` → 2, \`[3]\` → 3 → গুণফল **6**।
- সাধারণ object → \`"[object Object]"\`।`,
      related: ['js-implicit-coercion', 'js-to-primitive'],
    }),
    puzzle({
      id: 'js-out-var-hoisting',
      level: 'foundation',
      priority: 2,
      title: 'Hoisting inside a function: what does this print?',
      tags: ['hoisting', 'var', 'scope'],
      code: `var x = "global";

function show() {
  console.log(x);
  var x = "local";
  console.log(x);
}

show();
console.log(x);`,
      output: `undefined
local
global`,
      why: `- \`var x\` inside \`show\` is hoisted to the top of **the function**, initialised to \`undefined\`.
- That local \`x\` shadows the global one for the whole function — even before its line.
- So the first \`console.log\` reads the local \`x\`, which is still \`undefined\`.
- The global \`x\` is never touched.`,
      explanationBn: `অনেকে ভাবেন প্রথম \`console.log\` বাইরের \`"global"\` দেখাবে — কারণ local \`x\` তো তখনো declare হয়নি।

কিন্তু hoisting-এর কারণে function-এর creation phase-এই \`var x\` নিবন্ধিত হয়ে যায়, value \`undefined\`। এখন function-এর **পুরো** ভেতরে \`x\` মানে local \`x\` — বাইরেরটা ঢাকা পড়ে গেছে (shadowing)।

তাই:
1. প্রথম log → local \`x\`, এখনো \`undefined\`।
2. \`x = "local"\` বসে।
3. দ্বিতীয় log → \`"local"\`।
4. Function-এর বাইরে global \`x\` অক্ষত → \`"global"\`।

\`var\`-এর জায়গায় \`let\` হলে প্রথম log \`undefined\` না দিয়ে \`ReferenceError\` দিত (TDZ)।`,
      visualizationId: 'js-hoisting-tdz',
      related: ['js-hoisting'],
    }),
    puzzle({
      id: 'js-out-coercion-math',
      level: 'foundation',
      priority: 2,
      title: 'Mixing strings and numbers: what does this print?',
      tags: ['type-coercion', 'operators'],
      code: `console.log("3" * "4");
console.log("3" + 4 + 5);
console.log(3 + 4 + "5");
console.log(true + true);
console.log([] - 1);
console.log("b" + "a" + +"a" + "a");`,
      output: `12
345
75
2
-1
baNaNa`,
      why: `- \`*\` converts both strings to numbers: \`12\`.
- \`+\` goes left to right: \`"3" + 4\` → \`"34"\`, then \`+ 5\` → \`"345"\`.
- \`3 + 4\` → \`7\` first (both numbers), then \`7 + "5"\` → \`"75"\`.
- \`true\` becomes \`1\`: \`2\`.
- \`[]\` → \`""\` → \`0\`, so \`0 - 1\` → \`-1\`.
- \`+"a"\` is unary plus → \`NaN\`; the rest are string concatenation: \`"ba" + NaN + "a"\` → \`"baNaNa"\`.`,
      explanationBn: `চাবি হলো দুটো নিয়ম: (১) \`+\` কোনো একপাশে string থাকলে জোড়ে, না হলে যোগ করে; (২) \`*\`, \`-\` সবসময় number বানায়। আর \`+\` বাঁ থেকে ডানে চলে।

- \`"3" * "4"\` → গুণ → **12**।
- \`"3" + 4 + 5\` → প্রথমে \`"3" + 4\` = \`"34"\` (string), তারপর \`"34" + 5\` = **"345"**।
- \`3 + 4 + "5"\` → প্রথমে \`3 + 4\` = **7** (দুটোই number), তারপর \`7 + "5"\` = **"75"**। ক্রমের পার্থক্যে ফল সম্পূর্ণ আলাদা!
- \`true + true\` → 1 + 1 = **2**।
- \`[] - 1\` → \`[]\` → \`""\` → 0 → **-1**।
- বিখ্যাত "banana": \`+"a"\`-এ unary plus — "a" কে number বানাতে গিয়ে \`NaN\`। তারপর \`"ba" + NaN + "a"\` → **"baNaNa"**।`,
      related: ['js-implicit-coercion'],
    }),
    puzzle({
      id: 'js-out-string-immutability',
      level: 'foundation',
      priority: 1,
      title: 'Changing a string: what does this print?',
      tags: ['strings', 'immutability', 'primitives'],
      code: `let s = "hello";
s[0] = "J";
s.toUpperCase();
console.log(s, s.length);

s = s.toUpperCase();
console.log(s, [..."héllo👋"].length, "héllo👋".length);`,
      output: `hello 5
HELLO 6 7`,
      why: `- Strings are immutable primitives: \`s[0] = "J"\` is silently ignored (in strict mode it throws).
- \`toUpperCase()\` returns a **new** string; without assignment the result is lost.
- Assigning the result (\`s = ...\`) rebinds the variable.
- \`length\` counts UTF-16 code units: the emoji 👋 takes **two**, so \`"héllo👋".length\` is 7. Spreading iterates by code point, so the emoji counts once and the result has 6 items.`,
      explanationBn: `**String immutable** — একবার তৈরি হলে বদলানো যায় না।
- \`s[0] = "J"\` — sloppy mode-এ চুপচাপ উপেক্ষা হয় (strict mode-এ \`TypeError\`)।
- \`s.toUpperCase()\` — একটা **নতুন** string ফেরত দেয়, \`s\`-কে বদলায় না। Result কোথাও রাখা হয়নি, তাই হারিয়ে গেল।
তাই প্রথম লাইন: \`hello 5\`।

\`s = s.toUpperCase()\` — এখন নতুন string-টা variable-এ বসানো হলো → \`HELLO\`।

শেষ অংশ: \`length\` গোনে UTF-16 unit — 👋 emoji দুটো unit নেয়, তাই "héllo👋"-এর length **7**, যদিও দেখা যায় ৬টা অক্ষর। Spread (\`[...str]\`) code point ধরে গোনে — emoji একটাই — তাই **6**। Emoji বা বিশেষ অক্ষর থাকলে \`length\` দিয়ে অক্ষর গোনা ভুল ফল দেয়।`,
      related: ['js-primitive-methods-autoboxing'],
    }),

    // ──────────────────────────── Intermediate ────────────────────────────
    puzzle({
      id: 'js-out-function-vs-var-hoisting',
      level: 'intermediate',
      priority: 2,
      title: 'A function and a `var` with the same name: what does this print?',
      tags: ['hoisting', 'functions', 'var'],
      code: `console.log(typeof greet);
var greet = "hello";
function greet() {}
console.log(typeof greet);`,
      output: `function
string`,
      why: `- In the creation phase, function declarations are hoisted **with their body**, and \`var greet\` does not overwrite an existing binding with \`undefined\`.
- So before any line runs, \`greet\` is the function → \`"function"\`.
- Execution then reaches \`greet = "hello"\` (the \`var\` part is already done) and reassigns it.
- The \`function greet() {}\` line does nothing at runtime — it was handled during hoisting.`,
      explanationBn: `Creation phase-এ দুটো declaration আছে একই নামে:
- \`function greet() {}\` — পুরো function সহ hoist হয়।
- \`var greet\` — hoist হয়, কিন্তু নামটা আগে থেকেই থাকায় নতুন করে \`undefined\` বসায় না।

তাই code চালানো শুরুর আগে \`greet\` = function। প্রথম log → **"function"**।

Execution phase-এ:
- \`var greet = "hello"\` লাইনে আসলে শুধু assignment অংশটা চলে → \`greet\` এখন string।
- \`function greet() {}\` লাইনে runtime-এ কিছুই হয় না — এটা আগেই hoisting-এ সামলানো হয়ে গেছে।

দ্বিতীয় log → **"string"**।`,
      visualizationId: 'js-hoisting-tdz',
      related: ['js-hoisting'],
    }),
    puzzle({
      id: 'js-out-tdz',
      level: 'intermediate',
      priority: 2,
      title: 'TDZ and shadowing: what does this print?',
      tags: ['tdz', 'let', 'shadowing', 'hoisting'],
      code: `let a = 1;

function test() {
  console.log(typeof b);
  try {
    console.log(a);
  } catch (e) {
    console.log(e.name);
  }
  let a = 2;
  console.log(a);
}

test();`,
      output: `undefined
ReferenceError
2`,
      why: `- \`b\` is never declared anywhere, so \`typeof b\` is \`"undefined"\` (no error).
- \`let a = 2\` inside \`test\` is hoisted to the top of the function and **shadows** the outer \`a\` for the whole function.
- Until its line runs, that inner \`a\` is in the temporal dead zone → reading it throws \`ReferenceError\` — the outer \`a = 1\` is *not* used.
- After the declaration, \`a\` is \`2\`.`,
      explanationBn: `**প্রথম লাইন:** \`b\` কোথাও declare-ই হয়নি। এমন নামে \`typeof\` error দেয় না → \`"undefined"\`।

**দ্বিতীয় লাইন — মূল ফাঁদ:** অনেকে ভাবেন বাইরের \`a = 1\` দেখাবে, কারণ ভেতরের \`a\` এখনো declare হয়নি। কিন্তু \`let a = 2\` function-এর শুরুতেই hoist হয় এবং **পুরো function জুড়ে** বাইরের \`a\`-কে ঢেকে দেয়। Declaration লাইনে না পৌঁছানো পর্যন্ত ভেতরের \`a\` TDZ-তে — তাই পড়তে গেলে \`ReferenceError\`।

**তৃতীয় লাইন:** declaration-এর পরে \`a\` = **2**।

শিক্ষা: একটা block বা function-এ \`let\`/\`const\` থাকলে, সেই নাম ওই scope-এ শুরু থেকেই "দখল" হয়ে যায়।`,
      visualizationId: 'js-hoisting-tdz',
      related: ['js-temporal-dead-zone'],
    }),
    puzzle({
      id: 'js-out-closures-var-let',
      level: 'intermediate',
      priority: 2,
      title: 'Functions created in loops with `var` and `let`: what does this print?',
      tags: ['closures', 'var', 'let', 'loops'],
      code: `const withVar = [];
for (var i = 0; i < 3; i++) {
  withVar.push(() => i);
}

const withLet = [];
for (let j = 0; j < 3; j++) {
  withLet.push(() => j);
}

console.log(withVar.map((f) => f()), withLet.map((f) => f()));`,
      output: `[ 3, 3, 3 ] [ 0, 1, 2 ]`,
      why: `- With \`var\` there is **one** \`i\` for the whole loop; all three closures reference it, and after the loop it is \`3\`.
- With \`let\`, each iteration gets a **fresh binding** of \`j\` (initialised from the previous one), so each closure captures its own value.
- Closures capture variables, not values — \`let\` simply gives them different variables.`,
      explanationBn: `Closure **variable** ধরে রাখে, value না — এটাই পুরো ব্যাপার।

**\`var\` loop:** \`var\` function-scoped — পুরো loop জুড়ে একটাই \`i\`। তিনটা arrow function-ই সেই একই \`i\`-এর দিকে তাকিয়ে আছে। Function গুলো call হচ্ছে loop শেষে, যখন \`i\` = 3 → তিনটাই **3**।

**\`let\` loop:** \`for\`-এ \`let\` থাকলে JavaScript প্রতিটা iteration-এর জন্য **নতুন** একটা \`j\` তৈরি করে। প্রথম function ধরেছে প্রথম iteration-এর \`j\` (0), দ্বিতীয়টা দ্বিতীয়টার (1)… → **0, 1, 2**।

এটা \`setTimeout\` loop puzzle-এরই আরেক রূপ — timer ছাড়া, শুধু closure দিয়ে।`,
      visualizationId: 'js-closure-scope-chain',
      related: ['js-var-settimeout-loop', 'js-closures'],
    }),
    puzzle({
      id: 'js-out-detached-this',
      level: 'intermediate',
      priority: 2,
      title: '`this` in detached methods and callbacks: what does this print?',
      tags: ['this', 'methods', 'arrow-functions', 'callbacks'],
      code: `"use strict";
const user = {
  name: "Rafi",
  regular() { return this?.name; },
  arrow: () => this?.name,
  nested() { return [1].map(function () { return this?.name; })[0]; },
  nestedArrow() { return [1].map(() => this.name)[0]; },
};

const { regular } = user;
console.log(user.regular(), regular());
console.log(user.arrow(), user.nested(), user.nestedArrow());`,
      output: `Rafi undefined
undefined undefined Rafi`,
      why: `- \`user.regular()\` — a method call, \`this\` is \`user\` → \`"Rafi"\`.
- \`regular()\` — destructuring detached it; a plain call in strict mode has \`this = undefined\`.
- \`user.arrow()\` — an arrow function ignores how it is called; it uses the outer \`this\` (not \`user\`).
- \`user.nested()\` — the inner \`function\` passed to \`map\` is called as a plain function → \`this\` is \`undefined\`.
- \`user.nestedArrow()\` — the inner arrow inherits \`this\` from \`nestedArrow\`, which was called on \`user\` → \`"Rafi"\`.`,
      explanationBn: `পাঁচটা call, প্রতিটায় নিয়ম আলাদা:

1. **\`user.regular()\`** — dot-এর বাঁয়ে \`user\` → \`this = user\` → **Rafi**।
2. **\`regular()\`** — destructuring দিয়ে method আলাদা করে নেওয়া হয়েছে। এখন এটা plain call; strict mode-এ \`this = undefined\` → **undefined**। (Sloppy mode-এ \`this\` হতো global object; browser-এ \`window.name\` আসলে \`""\`, তাই সেখানে খালি string আসত — এজন্য উদাহরণে strict mode।)
3. **\`user.arrow()\`** — arrow function-এর নিজের \`this\` নেই, কীভাবে call হলো তা দেখেই না। Object literal-এর ভেতরে লেখা হলেও object literal কোনো scope তৈরি করে না — বাইরের \`this\` ব্যবহার করে, \`user\` না → **undefined**।
4. **\`user.nested()\`** — বাইরের method-এ \`this = user\` ঠিকই আছে, কিন্তু \`map\`-এ পাঠানো সাধারণ \`function\`-কে \`map\` plain function হিসেবে call করে → তার নিজের \`this = undefined\`।
5. **\`user.nestedArrow()\`** — ভেতরের arrow বাইরের method-এর \`this\` (user) ধার করে → **Rafi**।

এজন্যই method-এর ভেতরের callback-এ arrow function ব্যবহার করা হয়।`,
      visualizationId: 'js-this-binding',
      related: ['js-this-keyword', 'js-arrow-vs-regular'],
    }),
    puzzle({
      id: 'js-out-event-loop-basic',
      level: 'intermediate',
      priority: 2,
      title: 'Timers and promise chains: what does this print?',
      tags: ['event-loop', 'microtasks', 'macrotasks'],
      code: `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve()
  .then(() => console.log(3))
  .then(() => console.log(4));
setTimeout(() => console.log(5), 0);
console.log(6);`,
      output: `1
6
3
4
2
5`,
      why: `- Synchronous code first: \`1\`, \`6\`.
- Then the microtask queue drains completely — including microtasks added while draining: \`3\` runs and queues the next \`.then\`, so \`4\` runs too.
- Only then the macrotasks, in the order they were queued: \`2\`, \`5\`.`,
      explanationBn: `Event loop-এর তিন ধাপের নিয়ম প্রয়োগ করুন:

**১. Synchronous code:** \`1\` আর \`6\` সাথে সাথে। দুটো \`setTimeout\` → macrotask queue-তে (2, তারপর 5)। প্রথম \`.then\` (3) → microtask queue-তে।

**২. সব microtask:** \`3\` চলে। এটা শেষ হলে chain-এর পরের \`.then\` (4) microtask queue-তে যোগ হয়। Microtask queue পুরো খালি না হওয়া পর্যন্ত macrotask-এ যাওয়া যায় না — তাই \`4\`-ও এখনই চলে।

**৩. Macrotask:** \`2\`, তারপর \`5\` — যে ক্রমে queue হয়েছিল।

ফল: **1 6 3 4 2 5**।

গুরুত্বপূর্ণ পর্যবেক্ষণ: \`4\` পরে queue হলেও \`2\`-এর আগে চলে — কারণ microtask চলার সময় যোগ হওয়া microtask-ও একই দফায় শেষ হয়।`,
      visualizationId: 'js-event-loop',
      related: ['js-microtask-vs-macrotask', 'js-event-loop'],
    }),
    puzzle({
      id: 'js-out-async-await-order',
      level: 'intermediate',
      priority: 2,
      title: '`async`/`await` ordering: what does this print?',
      tags: ['event-loop', 'async-await', 'microtasks'],
      code: `async function a() {
  console.log("a1");
  await b();
  console.log("a2");
}
async function b() {
  console.log("b");
}

console.log("start");
setTimeout(() => console.log("timeout"), 0);
a();
Promise.resolve().then(() => console.log("promise"));
console.log("end");`,
      output: `start
a1
b
end
a2
promise
timeout`,
      why: `- \`start\` prints; the timer is queued as a macrotask.
- Calling \`a()\` runs synchronously until its first \`await\`: \`a1\`, then \`b()\` runs synchronously too and prints \`b\`.
- \`await\` suspends \`a\`; its continuation (\`a2\`) is queued as a microtask.
- \`Promise.resolve().then\` queues \`promise\` **after** it; \`end\` prints.
- Microtasks in order: \`a2\`, \`promise\`; then the macrotask: \`timeout\`.`,
      explanationBn: `ধাপে ধাপে:

1. \`"start"\` print। \`setTimeout\` → macrotask queue।
2. \`a()\` call — async function-ও প্রথম \`await\` পর্যন্ত **synchronously** চলে: \`"a1"\` print।
3. \`await b()\` — আগে \`b()\` call হয় (এটাও synchronous), \`"b"\` print। তারপর \`a\` থামে, তার বাকি অংশ (\`a2\`) microtask queue-তে।
4. \`Promise.resolve().then\` → \`"promise"\` microtask queue-তে, \`a2\`-এর **পরে**।
5. \`"end"\` print।
6. Stack খালি → microtask ক্রমানুসারে: \`"a2"\`, \`"promise"\`।
7. শেষে macrotask: \`"timeout"\`।

মূল শিক্ষা: \`await\`-এর আগের সবকিছু (call করা function সহ) synchronous; \`await\`-এর পরের অংশ microtask।`,
      visualizationId: 'js-event-loop',
      related: ['js-async-await', 'js-event-loop-puzzles'],
    }),
    puzzle({
      id: 'js-out-parseint-map',
      level: 'intermediate',
      priority: 2,
      title: '`["1", "2", "3"].map(parseInt)`: what does this print?',
      tags: ['parseint', 'map', 'callbacks'],
      code: `console.log(["1", "2", "3"].map(parseInt));
console.log(["10", "10", "10"].map(parseInt));
console.log(["1", "2", "3"].map(Number));
console.log(["1", "2", "3"].map((s) => parseInt(s, 10)));`,
      output: `[ 1, NaN, NaN ]
[ 10, NaN, 2 ]
[ 1, 2, 3 ]
[ 1, 2, 3 ]`,
      why: `- \`map\` calls its callback with **three** arguments: \`(element, index, array)\`.
- \`parseInt\` takes \`(string, radix)\`, so the index becomes the radix:
  - \`parseInt("1", 0)\` → radix 0 means "auto" → \`1\`
  - \`parseInt("2", 1)\` → radix 1 is invalid → \`NaN\`
  - \`parseInt("3", 2)\` → "3" is not a binary digit → \`NaN\`
  - \`parseInt("10", 2)\` → binary 10 → \`2\`
- \`Number\` takes one argument, so it works; or wrap: \`s => parseInt(s, 10)\`.`,
      explanationBn: `ফাঁদটা \`map\` আর \`parseInt\`-এর মধ্যে argument-এর অমিলে।

\`map\` callback-কে **তিনটা** argument দেয়: \`(element, index, array)\`। আর \`parseInt\` নেয় \`(string, radix)\` — দ্বিতীয় argument হলো সংখ্যা-পদ্ধতি (base)। ফলে **index চলে যায় radix হিসেবে**:

- \`parseInt("1", 0)\` — radix 0 মানে "নিজে বুঝে নাও" → 1
- \`parseInt("2", 1)\` — base 1 অবৈধ → NaN
- \`parseInt("3", 2)\` — binary-তে শুধু 0 আর 1; "3" অচেনা → NaN

দ্বিতীয় লাইন: \`"10"\` base 0 → 10; base 1 → NaN; base 2 (binary) → **2**।

**সমাধান:** \`Number\` এক argument নেয়, তাই নিরাপদ। অথবা নিজে wrap করুন: \`s => parseInt(s, 10)\`।

সাধারণ শিক্ষা: built-in function সরাসরি callback হিসেবে পাঠানোর আগে দেখুন সে কয়টা argument নেয়।`,
      related: ['js-number-vs-parseint', 'js-array-iteration-methods'],
    }),
    puzzle({
      id: 'js-out-object-keys-coercion',
      level: 'intermediate',
      priority: 2,
      title: 'Objects as object keys: what does this print?',
      tags: ['objects', 'type-coercion', 'map'],
      code: `const store = {};
const b = { key: "b" };
const c = { key: "c" };

store[b] = 123;
store[c] = 456;
console.log(store[b], Object.keys(store));

const map = new Map([[b, 123], [c, 456]]);
console.log(map.get(b), map.size);`,
      output: `456 [ '[object Object]' ]
123 2`,
      why: `- Plain object keys are always strings (or symbols). An object used as a key is converted with \`String(obj)\` → \`"[object Object]"\`.
- Both \`b\` and \`c\` become the **same** key, so \`456\` overwrites \`123\`.
- A \`Map\` keeps object keys by identity, so both entries survive.`,
      explanationBn: `সাধারণ object-এর key সবসময় string (বা symbol)। Object-কে key হিসেবে দিলে JavaScript সেটাকে string বানায় — আর যেকোনো সাধারণ object-এর string রূপ একই: \`"[object Object]"\`।

তাই:
- \`store[b] = 123\` → আসলে \`store["[object Object]"] = 123\`
- \`store[c] = 456\` → **একই key**-তে \`456\`, আগেরটা মুছে গেল।
- \`store[b]\` পড়লেও একই key → **456**। Key মাত্র একটা।

**\`Map\`** object-কে সত্যিকারের key হিসেবে রাখে — identity (reference) দিয়ে। \`b\` আর \`c\` আলাদা object, তাই দুটো আলাদা entry → \`map.get(b)\` = **123**, size **2**।

Object-কে key বানাতে হলে সবসময় \`Map\` (বা \`WeakMap\`)।`,
      related: ['js-map-vs-object', 'js-to-primitive'],
    }),
    puzzle({
      id: 'js-out-loose-equality',
      level: 'intermediate',
      priority: 2,
      title: '`==` puzzles: what does this print?',
      tags: ['equality', 'type-coercion'],
      code: `console.log([] == ![]);
console.log("" == 0, "0" == false, " \\t\\n" == 0);
console.log(null == false, undefined == null);
console.log([0] == false, [1, 2] == "1,2");
console.log(NaN != NaN);`,
      output: `true
true true true
false true
true true
true`,
      why: `- \`[] == ![]\`: \`![]\` is \`false\` (arrays are truthy) → \`[] == false\` → \`"" == 0\` → \`0 == 0\` → \`true\`. An array "equals" its own negation.
- Strings convert to numbers: \`""\` and whitespace-only strings become \`0\`; \`false\` becomes \`0\`.
- \`null\` only loosely equals \`undefined\` (and itself) — never \`false\` or \`0\`.
- Arrays convert to strings: \`[0]\` → \`"0"\` → \`0\`; \`[1, 2]\` → \`"1,2"\`.
- \`NaN\` is not equal to anything, so \`NaN != NaN\` is \`true\`.`,
      explanationBn: `**\`[] == ![]\` — সবচেয়ে বিখ্যাত:**
1. \`![]\` আগে হিসাব হয়। Array truthy, তাই \`![]\` = \`false\`।
2. এখন \`[] == false\`। Boolean → number: \`false\` → 0।
3. \`[] == 0\`। Object → primitive: \`[]\` → \`""\`।
4. \`"" == 0\`। String → number: \`""\` → 0।
5. \`0 == 0\` → **true**। একটা array তার নিজের "উল্টো"-র সমান!

বাকিগুলো:
- \`""\`, \`"0"\`, শুধু whitespace-এর string → সব number-এ 0 হয়, তাই \`0\` বা \`false\`-এর সমান।
- \`null == false\` → **false** — \`null\`-এর বিশেষ নিয়ম: সে শুধু \`undefined\`-এর সমান।
- \`[0]\` → \`"0"\` → 0 → \`false\` (0)-এর সমান। \`[1, 2]\` → \`"1,2"\`।
- \`NaN\` কারও সমান না, নিজেরও না — তাই \`!=\` হলো **true**।

এজন্যই সবসময় \`===\`।`,
      visualizationId: 'js-coercion-table',
      related: ['js-loose-vs-strict-equality'],
    }),

    // ────────────────────────────── Advanced ──────────────────────────────
    puzzle({
      id: 'js-out-promise-executor-timer',
      level: 'advanced',
      priority: 2,
      title: 'A promise resolved inside a timer: what does this print?',
      tags: ['promises', 'event-loop', 'executor'],
      code: `const p = new Promise((resolve) => {
  console.log(1);
  setTimeout(() => {
    console.log(2);
    resolve(3);
  }, 0);
  console.log(4);
});

p.then((value) => console.log(value));
console.log(5);`,
      output: `1
4
5
2
3`,
      why: `- The executor runs synchronously: \`1\`, schedules the timer, \`4\`.
- \`.then\` registers a handler, but \`p\` is still **pending** — nothing is queued yet.
- \`5\` prints; the script ends.
- The timer (macrotask) runs: \`2\`, then \`resolve(3)\` queues the \`.then\` handler as a microtask.
- That microtask runs right after the timer callback: \`3\`.`,
      explanationBn: `ধাপে ধাপে:

1. **Executor synchronous:** \`1\` print, \`setTimeout\` → macrotask queue, \`4\` print।
2. **\`p.then(...)\`** — handler নিবন্ধিত, কিন্তু \`p\` এখনো **pending** (resolve তো timer-এর ভেতরে)। তাই microtask queue-তে কিছুই যায় না।
3. \`5\` print। Script শেষ।
4. Microtask queue খালি → macrotask: timer callback চলে, \`2\` print, তারপর \`resolve(3)\`। **এই মুহূর্তে** \`.then\`-এর handler microtask queue-তে যায়।
5. Macrotask শেষ হওয়ার সাথে সাথে microtask চলে: \`3\`।

মূল শিক্ষা: \`.then\` লেখা মানেই microtask queue-তে যাওয়া না — promise **resolve হলে** তবেই handler queue হয়।`,
      visualizationId: 'js-event-loop',
      related: ['js-promise-executor-sync', 'js-promise-basics'],
    }),
    puzzle({
      id: 'js-out-getter-destructuring',
      level: 'advanced',
      priority: 1,
      title: 'A closure counter with a getter: what does this print?',
      tags: ['closures', 'getters', 'destructuring', 'iife'],
      code: `const counter = (() => {
  let count = 0;
  return {
    inc: () => ++count,
    get value() { return count; },
  };
})();

counter.inc();
counter.inc();
const { value } = counter;
counter.inc();
console.log(value, counter.value);`,
      output: `2 3`,
      why: `- The IIFE runs once and returns an object whose methods close over the private \`count\`.
- After two \`inc()\` calls, \`count\` is \`2\`.
- Destructuring \`{ value }\` **calls the getter once** and copies the number \`2\` into a new variable — it does not create a live link.
- After the third \`inc()\`, reading \`counter.value\` calls the getter again → \`3\`, while \`value\` is still \`2\`.`,
      explanationBn: `**IIFE + closure:** IIFE একবার চলে একটা object ফেরত দেয়। \`inc\` আর \`value\` getter দুজনেই closure-এর মাধ্যমে private \`count\` ধরে রেখেছে।

দুবার \`inc()\` → \`count\` = 2।

**ফাঁদ — destructuring:** \`const { value } = counter\` লিখলে getter **একবার** call হয়, আর তার ফল (সংখ্যা 2) একটা নতুন, সাধারণ variable-এ **কপি** হয়। এটা কোনো "live" সংযোগ না — পরে \`count\` বদলালেও \`value\` আর বদলাবে না।

তৃতীয় \`inc()\` → \`count\` = 3।

- \`value\` → এখনো **2** (পুরনো কপি)।
- \`counter.value\` → getter আবার call হয় → **3**।

Getter মানে "প্রতিবার পড়ার সময় হিসাব করো" — কিন্তু কপি করে ফেললে সেই সুবিধা হারায়।`,
      related: ['js-closure-use-cases', 'js-class-features'],
    }),
    puzzle({
      id: 'js-out-delete-array',
      level: 'advanced',
      priority: 1,
      title: '`delete` on an array and changing `length`: what does this print?',
      tags: ['arrays', 'delete', 'sparse-arrays', 'length'],
      code: `const arr = [1, 2, 3, 4];
delete arr[1];
console.log(arr, arr.length, 1 in arr);

arr.length = 2;
console.log(arr);

arr[5] = 6;
console.log(arr.length, arr);`,
      output: `[ 1, <1 empty item>, 3, 4 ] 4 false
[ 1, <1 empty item> ]
6 [ 1, <4 empty items>, 6 ]`,
      why: `- \`delete arr[1]\` removes the property but does **not** shift elements or change \`length\` — it leaves a hole.
- \`1 in arr\` is \`false\`: the index no longer exists.
- Setting \`length\` smaller truncates the array.
- Assigning to index 5 on a shorter array extends \`length\` to 6 and creates holes in between.
- To remove an item and close the gap, use \`splice\` or \`filter\`.`,
      explanationBn: `**\`delete arr[1]\`** — array থেকে element সরানোর ভুল উপায়। এটা শুধু index 1-এর property মুছে দেয়, কিন্তু পরের element গুলোকে সরায় না, \`length\`-ও বদলায় না। ফলে মাঝখানে একটা **ফাঁকা ঘর (hole)** থাকে: \`[1, <empty>, 3, 4]\`, length এখনো 4। \`1 in arr\` → \`false\`, কারণ index 1 আর নেই।

**\`arr.length = 2\`** — length ছোট করলে array কেটে যায়, বাকি element মুছে যায়।

**\`arr[5] = 6\`** — length 2-এর array-তে index 5-এ লিখলে length হয়ে যায় 6, আর মাঝের index 2–4 ফাঁকা থাকে।

সঠিক উপায়: element সরাতে \`splice(index, 1)\` (মূল array বদলায়) বা \`filter\` (নতুন array)।`,
      related: ['js-sparse-arrays', 'js-slice-vs-splice'],
    }),
  ],
});

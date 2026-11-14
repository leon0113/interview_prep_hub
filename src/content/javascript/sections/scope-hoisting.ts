import { defineSection } from '../../define';

export const scopeHoisting = defineSection({
  id: 'js-scope-hoisting',
  title: 'Variables, Scope & Hoisting',
  description:
    'var, let and const, the three kinds of scope, hoisting and the temporal dead zone, and how execution contexts tie it all together.',
  order: 2,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'js-var-let-const',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between `var`, `let` and `const`?',
      tags: ['variables', 'var', 'let', 'const', 'scope', 'hoisting'],
      answer: {
        interview: `**They differ in scope, hoisting behaviour, re-declaration and reassignment.**

| | \`var\` | \`let\` | \`const\` |
|---|---|---|---|
| Scope | function | block | block |
| Hoisted? | yes, initialised to \`undefined\` | yes, but uninitialised (TDZ) | yes, but uninitialised (TDZ) |
| Re-declare in same scope | allowed | \`SyntaxError\` | \`SyntaxError\` |
| Reassign | yes | yes | **no** (\`TypeError\`) |
| Global \`var\` becomes \`window\` property | yes | no | no |

- \`const\` means the **binding** cannot change, not that the value is immutable — a \`const\` object can still be mutated.
- \`let\` in a \`for\` loop creates a fresh binding per iteration, which fixes the classic closure-in-loop bug.
- Modern style: \`const\` by default, \`let\` when you must reassign, never \`var\`.

Real-world: \`var\` leaking out of an \`if\` block, or being shared by every callback created in a loop, are classic bugs that \`let\`/\`const\` remove.`,
        explanationBn: `তিনটাই variable declare করে, কিন্তু চারটা জায়গায় আচরণ আলাদা:

**১. Scope (কোথায় দেখা যায়):**
- \`var\` — **function scope**। \`if\` বা \`for\`-এর \`{}\`-এর ভেতরে declare করলেও পুরো function-এ দেখা যায়।
- \`let\`/\`const\` — **block scope**। যে \`{}\`-এর ভেতরে declare, শুধু সেখানেই।

**২. Hoisting (declaration-এর আগে কী হয়):**
- \`var\` উপরে উঠে যায় আর \`undefined\` দিয়ে শুরু হয় — declaration-এর আগে পড়লে \`undefined\` পাওয়া যায়, error না।
- \`let\`/\`const\`-ও hoist হয়, কিন্তু initialize হয় না — declaration-এর আগে ছুঁলেই \`ReferenceError\`। এই অঞ্চলের নাম **Temporal Dead Zone (TDZ)**।

**৩. Re-declaration:** একই scope-এ \`var x\` দুবার লেখা যায় (ভুল লুকিয়ে যায়); \`let\`/\`const\` দুবার লিখলে \`SyntaxError\`।

**৪. Reassignment:** \`const\`-কে নতুন value দেওয়া যায় না। কিন্তু সাবধান — \`const\` মানে "এই নামটা অন্য কিছুর দিকে সরবে না", value immutable না। \`const user = {}\` লিখে \`user.name = "x"\` সম্পূর্ণ বৈধ।

**আধুনিক নিয়ম:** default হিসেবে \`const\`, বদলাতে হলে \`let\`, আর \`var\` কখনো না। \`const\` দেখলেই পাঠক জানে "এটা আর বদলাবে না" — code পড়া সহজ হয়।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'Function scope vs block scope',
            code: `function demo() {
  if (true) {
    var a = "var";
    let b = "let";
  }
  console.log(a);          // var escapes the block
  try {
    console.log(b);
  } catch (e) {
    console.log(e.name);   // let does not
  }
}
demo();`,
            output: `var
ReferenceError`,
          },
          {
            lang: 'javascript',
            caption: 'Hoisting, re-declaration and const',
            code: `console.log(early);       // hoisted, initialised to undefined
var early = 1;
var early = 2;            // re-declaring var is silently allowed
console.log(early);

const config = { debug: false };
config.debug = true;      // mutating the object is fine
console.log(config.debug);
try {
  config = {};            // reassigning the binding is not
} catch (e) {
  console.log(e.name, "-", e.message);
}`,
            output: `undefined
2
true
TypeError - Assignment to constant variable.`,
          },
        ],
        pitfalls: [
          '`const` does not freeze objects or arrays — use `Object.freeze` for that (shallowly).',
          'A `var` declared in a loop is shared by every iteration and every closure created in it.',
          'Using a `let`/`const` before its declaration line throws, even inside `typeof`.',
        ],
        followUps: [
          'Can a `const` object be modified?',
          'What is the Temporal Dead Zone?',
          'Why does `let` fix the `setTimeout`-in-a-loop problem?',
        ],
      },
      visualizationId: 'js-hoisting-tdz',
      related: ['js-hoisting', 'js-temporal-dead-zone', 'js-const-mutation'],
    },
    {
      id: 'js-hoisting',
      level: 'foundation',
      priority: 3,
      question:
        'What is hoisting in JavaScript? How does it differ for `var`, `let`/`const`, function declarations and function expressions?',
      tags: ['hoisting', 'var', 'let', 'functions', 'execution-context'],
      answer: {
        interview: `**Hoisting is the effect of JavaScript registering all declarations in a scope before running any of its code, so names exist from the top of their scope — but what they hold before their line runs depends on how they were declared.**

- **\`var\`**: hoisted and initialised to \`undefined\` → reading it early gives \`undefined\`.
- **\`let\` / \`const\` / \`class\`**: hoisted but **not initialised** → reading early throws \`ReferenceError\` (the temporal dead zone).
- **Function declarations** (\`function f() {}\`): hoisted **with their body** → you can call them before the line they are written on.
- **Function expressions / arrow functions** (\`const f = () => {}\`, \`var f = function () {}\`): only the variable is hoisted, following that variable's rules → calling early gives \`TypeError: f is not a function\` (\`var\`) or \`ReferenceError\` (\`let\`/\`const\`).
- Nothing is physically moved; it happens in the "creation phase" of the execution context.

Real-world: hoisting is why helper functions can be declared at the bottom of a file and still be used at the top.`,
        explanationBn: `অনেকে বলেন "hoisting মানে declaration উপরে উঠে যায়"। আসলে code কোথাও সরে না — যা ঘটে তা হলো **দুই ধাপে execution**:

**ধাপ ১ — Creation phase:** কোনো লাইন চালানোর আগে JavaScript engine পুরো scope স্ক্যান করে সব declaration memory-তে নিবন্ধন করে।
**ধাপ ২ — Execution phase:** তারপর উপর থেকে নিচে লাইন চালায়।

ধাপ ১-এ কে কী নিয়ে নিবন্ধিত হয় — সেটাই আসল পার্থক্য:

| Declaration | Creation phase-এ value | আগে ব্যবহার করলে |
|---|---|---|
| \`var x\` | \`undefined\` | \`undefined\` পাওয়া যায় |
| \`let\`/\`const\` | uninitialized (TDZ) | \`ReferenceError\` |
| \`function f() {}\` | **পুরো function** | স্বাভাবিকভাবে call হয় |
| \`var f = function(){}\` | \`undefined\` | \`TypeError: f is not a function\` |

শেষ সারিটাই সবচেয়ে বেশি ভুল হয়: function expression-এ শুধু **variable**-টা hoist হয়, function-টা না। Function-টা variable-এ বসে তখনই, যখন execution সেই লাইনে পৌঁছায়। তাই আগে call করলে \`undefined()\` call করার মতো — \`TypeError\`।

Analogy: ক্লাস শুরুর আগে শিক্ষক হাজিরা খাতায় সবার নাম লিখে ফেলেন (creation phase)। \`var\`-ছাত্রের নামের পাশে "এখনো আসেনি" লেখা, function-ছাত্র পুরোপুরি হাজির, আর \`let\`/\`const\`-ছাত্রের নামের পাশে "ডাকবেন না!" লেখা — নির্দিষ্ট সময় না আসা পর্যন্ত ডাকলেই সমস্যা।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log(typeof declared, typeof expr, typeof arrowVar);
console.log(declared());

function declared() {
  return "function declarations are hoisted with their body";
}
var expr = function () { return "expr"; };
var arrowVar = () => "arrow";

try {
  later();
} catch (e) {
  console.log(e.name, "-", e.message);
}
const later = () => "too late";`,
            output: `function undefined undefined
function declarations are hoisted with their body
ReferenceError - Cannot access 'later' before initialization`,
          },
          {
            lang: 'javascript',
            caption: 'A var-assigned function expression called too early',
            code: `try {
  greet();
} catch (e) {
  console.log(e.name, "-", e.message);
}
var greet = function () {
  console.log("hello");
};
greet();`,
            output: `TypeError - greet is not a function
hello`,
          },
        ],
        pitfalls: [
          'Function expressions and arrow functions are not hoisted as functions — only their variable is.',
          'A `var` with the same name as a function declaration overrides it once its assignment line runs.',
          'Relying on `var` hoisting makes code order-dependent and hard to read.',
        ],
        followUps: [
          'What is the Temporal Dead Zone?',
          'Are `let` and `const` hoisted?',
          'What is an execution context?',
        ],
      },
      visualizationId: 'js-hoisting-tdz',
      related: ['js-temporal-dead-zone', 'js-var-let-const', 'js-execution-context'],
    },
    {
      id: 'js-const-mutation',
      level: 'foundation',
      priority: 2,
      question: 'Can you modify an object or array declared with `const`?',
      tags: ['const', 'mutability', 'object-freeze'],
      answer: {
        interview: `**Yes. \`const\` makes the *binding* constant — the name cannot be pointed at a different value — but the object or array it points to is still mutable.**

- \`const arr = []; arr.push(1)\` is fine; \`arr = [1]\` throws \`TypeError: Assignment to constant variable.\`
- To prevent changes to the object itself, use \`Object.freeze(obj)\` — which is **shallow**: nested objects stay mutable.
- In strict mode, writing to a frozen object throws; in sloppy mode it fails silently.
- For deep immutability, freeze recursively or use immutable update patterns (spread, \`structuredClone\`).

Real-world: \`const\` is the default for almost every variable precisely because it only forbids rebinding, not mutation.`,
        explanationBn: `\`const\`-এর অর্থ নিয়ে সবচেয়ে বড় ভুল ধারণা: "\`const\` মানে value বদলানো যায় না।" আসলে \`const\` বলে: "**এই নামটা** আর অন্য কোনো value-র দিকে সরবে না।"

Object বা array-এর ক্ষেত্রে variable-এ থাকে শুধু ঠিকানা (reference)। \`const\` সেই ঠিকানাটা আটকে দেয়, কিন্তু ঠিকানার বাড়ির ভেতরে আসবাব সরানো (property বদলানো, array-তে push) সম্পূর্ণ বৈধ।

- \`arr.push(4)\` ✓ — একই array, শুধু ভেতরের জিনিস বদলাল।
- \`arr = [4]\` ✗ — নামটাকে নতুন array-এর দিকে সরানোর চেষ্টা → \`TypeError\`।

Object-কেই বদলানো বন্ধ করতে চাইলে \`Object.freeze()\`। কিন্তু এটা **shallow** — শুধু প্রথম স্তর জমায়। ভেতরের nested object এখনো বদলানো যায়। আর strict mode ছাড়া frozen object-এ লেখার চেষ্টা কোনো error ছাড়াই নিঃশব্দে ব্যর্থ হয় — bug খোঁজা কঠিন করে।`,
        examples: [
          {
            lang: 'javascript',
            code: `const nums = [1, 2, 3];
nums.push(4);
console.log(nums);

const settings = Object.freeze({ theme: "dark", nested: { size: 12 } });
settings.theme = "light";        // ignored (sloppy mode)
settings.nested.size = 14;       // freeze is shallow
console.log(settings.theme, settings.nested.size, Object.isFrozen(settings));

(function () {
  "use strict";
  try {
    settings.theme = "light";
  } catch (e) {
    console.log(e.name);
  }
})();`,
            output: `[ 1, 2, 3, 4 ]
dark 14 true
TypeError`,
          },
        ],
        pitfalls: [
          '`Object.freeze` is shallow.',
          'Writes to frozen objects fail silently outside strict mode.',
        ],
        followUps: ['What is the difference between `Object.freeze` and `Object.seal`?'],
      },
      related: ['js-var-let-const', 'js-freeze-vs-seal'],
    },
    {
      id: 'js-scope-types',
      level: 'foundation',
      priority: 2,
      question: 'What are global, function and block scope in JavaScript?',
      tags: ['scope', 'block-scope', 'function-scope', 'global'],
      answer: {
        interview: `**Scope decides where a variable is visible.**

- **Global scope:** declared outside any function or block. Visible everywhere. In a browser script, global \`var\` and function declarations also become properties of \`window\`; \`let\`/\`const\` do not. In ES modules, the top level is **module** scope, not global.
- **Function scope:** variables declared inside a function (with \`var\`, \`let\` or \`const\`) are visible only inside it.
- **Block scope:** \`let\`, \`const\` and \`class\` inside \`{ }\` — an \`if\`, \`for\`, \`while\` or bare block — are visible only inside that block. \`var\` ignores blocks.
- Inner scopes can read outer variables; outer scopes cannot see inner ones.
- Assigning to an undeclared variable in sloppy mode creates an accidental global; strict mode throws \`ReferenceError\` instead.

Real-world: keeping variables in the smallest scope possible prevents name clashes and accidental sharing.`,
        explanationBn: `Scope হলো "কোন variable কোথা থেকে দেখা যায়"-র নিয়ম। JavaScript-এ তিন (চার) স্তর:

**Global scope:** কোনো function বা block-এর বাইরে। সব জায়গা থেকে দেখা যায়। Browser-এর সাধারণ script-এ global \`var\` আবার \`window\`-এর property-ও হয়ে যায় (\`window.x\`), কিন্তু \`let\`/\`const\` হয় না। আর ES module-এ (\`type="module"\`) top-level আসলে **module scope** — অন্য file থেকে দেখা যায় না, export না করলে।

**Function scope:** function-এর ভেতরে declare করা সবকিছু শুধু function-এর ভেতরে।

**Block scope:** \`{}\`-এর ভেতরে \`let\`/\`const\` — শুধু সেই block-এ। \`if\`, \`for\`, এমনকি শুধু একজোড়া \`{}\`-ও block। \`var\` block-কে পাত্তা দেয় না।

নিয়ম একমুখী: ভেতর থেকে বাইরের variable দেখা যায়, বাইরে থেকে ভেতরেরটা না।

**একটা বিপজ্জনক ফাঁদ:** sloppy mode-এ declare না করেই \`total = 5\` লিখলে JavaScript চুপচাপ একটা global variable বানিয়ে ফেলে। টাইপো থেকে এমন bug খুব হয়। Strict mode-এ (আর সব ES module, class-এ) এটা \`ReferenceError\` দেয় — নিরাপদ।`,
        examples: [
          {
            lang: 'javascript',
            code: `const app = "global";

function outer() {
  const local = "function";
  {
    const inBlock = "block";
    console.log(app, local, inBlock);
  }
  console.log(typeof inBlock);
}
outer();
console.log(typeof local);

function sloppy() {
  oops = 42;             // no declaration: creates a global
}
sloppy();
console.log(globalThis.oops);

function strict() {
  "use strict";
  try {
    alsoOops = 1;
  } catch (e) {
    console.log(e.name);
  }
}
strict();`,
            output: `global function block
undefined
undefined
42
ReferenceError`,
          },
        ],
        pitfalls: [
          'Assigning to an undeclared name in sloppy mode creates a global variable.',
          'Top-level code in an ES module is module-scoped, not global.',
        ],
        followUps: ['What is lexical scope?', 'What does strict mode change?'],
      },
      related: ['js-lexical-scope-chain', 'js-var-let-const'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'js-temporal-dead-zone',
      level: 'intermediate',
      priority: 3,
      question: 'What is the Temporal Dead Zone (TDZ)?',
      tags: ['tdz', 'let', 'const', 'hoisting'],
      answer: {
        interview: `**The TDZ is the period from the start of a scope until a \`let\`, \`const\` or \`class\` declaration is evaluated. During it the name exists (it is hoisted) but is uninitialised, so any access throws \`ReferenceError: Cannot access 'x' before initialization\`.**

- "Temporal" means it is about **time** (execution order), not position in the source: a function defined above the declaration can use the variable if it is *called* after the declaration runs.
- Because the name is hoisted, it **shadows** an outer variable with the same name for the whole block — even before its line.
- \`typeof\` is not safe inside the TDZ.
- Default parameters have a TDZ too: \`(a = b, b = 1) => {}\` throws.
- It exists to catch bugs where a value is used before it is ready, and to make \`const\` meaningful.

Real-world: a \`ReferenceError\` about "before initialization" usually means circular imports or code ordering inside a module.`,
        explanationBn: `\`let\`/\`const\` hoist হয় — তাহলে আগে পড়লে \`undefined\` না দিয়ে error দেয় কেন? কারণ **Temporal Dead Zone**।

Scope শুরু হওয়ার মুহূর্ত থেকে declaration লাইনটা **চালানো** পর্যন্ত সময়টা হলো TDZ। এই সময় variable-এর নাম আছে (engine জানে), কিন্তু তাতে কোনো value বসানো হয়নি — "uninitialized"। এই অবস্থায় পড়লে বা লিখলে \`ReferenceError\`।

**"Temporal" (সময়গত) কেন?** কারণ এটা নির্ভর করে code **কখন চলছে** তার ওপর, কোথায় লেখা তার ওপর না:
\`\`\`js
function show() { return x; }   // x-এর আগে লেখা
let x = 5;
show();                          // কিন্তু call হচ্ছে পরে → 5, ঠিক আছে
\`\`\`

**Shadowing-এর ফাঁদ:** বাইরে \`let x = 1\` আছে, আর একটা block-এর ভেতরে প্রথম লাইনে \`console.log(x)\`, পরে \`let x = 2\`। অনেকে ভাবেন প্রথম লাইন বাইরের \`x\` (1) দেখাবে। না — block-এর ভেতরের \`x\` hoist হয়ে পুরো block জুড়ে বাইরেরটাকে ঢেকে দেয়, আর সেটা তখনো TDZ-তে → \`ReferenceError\`।

TDZ আসলে একটা নিরাপত্তা ব্যবস্থা: \`var\`-এর মতো চুপচাপ \`undefined\` দিয়ে ভুল লুকানোর বদলে সাথে সাথে সমস্যা ধরিয়ে দেয়।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'TDZ is about time, not position',
            code: `function show() {
  return value;          // written above the declaration...
}
let value = 5;
console.log(show());     // ...but called after it: fine`,
            output: `5`,
          },
          {
            lang: 'javascript',
            caption: 'The inner declaration shadows the outer one for the whole block',
            code: `let x = "outer";
{
  try {
    console.log(x);
  } catch (e) {
    console.log(e.message);
  }
  let x = "inner";
  console.log(x);
}

try {
  ((a = b, b = 1) => a)();
} catch (e) {
  console.log(e.name);
}`,
            output: `Cannot access 'x' before initialization
inner
ReferenceError`,
          },
        ],
        pitfalls: [
          'An inner `let` with the same name as an outer variable shadows it from the start of the block.',
          '`typeof x` throws while `x` is in its TDZ.',
        ],
        followUps: [
          'Are `let` and `const` hoisted?',
          'What happens with `class` declarations before their line?',
        ],
      },
      visualizationId: 'js-hoisting-tdz',
      related: ['js-hoisting', 'js-var-let-const'],
    },
    {
      id: 'js-lexical-scope-chain',
      level: 'intermediate',
      priority: 2,
      question: 'What is lexical scope and the scope chain?',
      tags: ['scope', 'lexical-scope', 'scope-chain', 'closures'],
      answer: {
        interview: `**Lexical (static) scope means a function's access to variables is decided by where it is *written* in the source, not where it is *called*. The scope chain is the list of nested scopes the engine searches, from the innermost outward, to resolve a name.**

- Lookup: current scope → enclosing function/block scopes → module/global scope → \`ReferenceError\` if not found.
- The first match wins; inner variables **shadow** outer ones with the same name.
- Because scope is fixed at definition, a function keeps access to its outer variables even after the outer function returns — that is a closure.
- \`this\` is the exception: it is decided by how a function is called (except for arrow functions, which use lexical \`this\`).

Real-world: a callback defined inside a component can read that component's variables no matter which library eventually calls it.`,
        explanationBn: `**Lexical scope** মানে: একটা function কোন কোন variable দেখতে পাবে, সেটা ঠিক হয় function-টা **কোথায় লেখা হয়েছে** তা দেখে — কোথা থেকে **call** হচ্ছে তা দেখে না।

ধরুন \`inner\` function লেখা আছে \`outer\`-এর ভেতরে। এখন \`inner\`-কে অন্য যেকোনো জায়গা থেকে call করুন — সে সবসময় \`outer\`-এর variable দেখবে, call করা জায়গার variable না।

**Scope chain** হলো নাম খোঁজার পথ: engine প্রথমে বর্তমান scope-এ খোঁজে, না পেলে তার ঠিক বাইরের scope-এ, তারপর আরও বাইরে — global পর্যন্ত। কোথাও না পেলে \`ReferenceError\`। প্রথম যেখানে পায় সেখানেই থামে, তাই ভেতরের একই নামের variable বাইরেরটাকে ঢেকে দেয় (shadowing)।

Analogy: একটা নেস্টেড বাক্সের কথা ভাবুন। ভেতরের বাক্সে বসে আপনি বাইরের বাক্সগুলোর দেয়ালে লেখা দেখতে পান, কিন্তু বাইরের বাক্স থেকে ভেতরেরটা দেখা যায় না। আর বাক্সগুলো কীভাবে সাজানো, সেটা তৈরির সময়ই (লেখার সময়) ঠিক হয়ে গেছে।

এই নিয়মই **closure**-এর ভিত্তি। একমাত্র ব্যতিক্রম \`this\` — সাধারণ function-এ এটা call-এর ধরন দেখে ঠিক হয় (dynamic)।`,
        examples: [
          {
            lang: 'javascript',
            code: `const label = "global";

function makeLogger() {
  const label = "lexical";
  return function log() {
    return label;          // resolved where log is WRITTEN
  };
}

function caller(fn) {
  const label = "caller";  // never seen by fn
  return fn();
}

console.log(caller(makeLogger()));`,
            output: `lexical`,
          },
        ],
        pitfalls: [
          'Expecting a function to see variables from the place where it is called (that would be dynamic scope).',
        ],
        followUps: [
          'What is a closure?',
          'Why is `this` not lexically scoped for regular functions?',
        ],
      },
      visualizationId: 'js-closure-scope-chain',
      related: ['js-scope-types', 'js-closures'],
    },
    {
      id: 'js-global-var-window',
      level: 'intermediate',
      priority: 1,
      question:
        'Why do global `var` declarations become properties of `window` while `let` and `const` do not?',
      tags: ['global-object', 'var', 'let', 'globalthis'],
      answer: {
        interview: `**The global scope has two parts: the global object (\`window\` / \`globalThis\`), which holds \`var\` and function declarations, and a separate declarative record that holds top-level \`let\`, \`const\` and \`class\`.**

- So in a classic browser script, \`var x = 1\` makes \`window.x === 1\`, but \`let y = 1\` leaves \`window.y\` \`undefined\`.
- Global \`var\`s can clash with built-in \`window\` properties (\`var name\`, \`var status\`) and with other scripts.
- ES modules and Node.js CommonJS files have their own module scope, so top-level declarations there are not global at all.
- \`globalThis\` is the portable way to reach the global object in any environment.

Real-world: \`var name = 42\` at the top of a browser script turns it into the string \`"42"\`, because \`window.name\` is a built-in string property.`,
        explanationBn: `Browser-এর সাধারণ script-এ global scope আসলে দুই ভাগে বিভক্ত:

1. **Global object** (\`window\`, বা যেকোনো environment-এ \`globalThis\`) — global \`var\` আর function declaration এখানে property হিসেবে বসে।
2. **একটা আলাদা declarative record** — top-level \`let\`, \`const\`, \`class\` এখানে থাকে, \`window\`-এ না।

তাই \`var\` global-এ লিখলে \`window.x\` দিয়েও পাওয়া যায়, \`let\` দিয়ে লিখলে পাওয়া যায় না।

এটা কেন গুরুত্বপূর্ণ? \`window\`-এর অনেক built-in property আছে — \`name\`, \`status\`, \`top\`। Global \`var name = 42\` লিখলে আসলে \`window.name\`-এ লেখা হয়, যেটা সবসময় string — তাই \`42\` হয়ে যায় \`"42"\`। আরও খারাপ, একাধিক script একই global নাম ব্যবহার করলে একে অপরেরটা overwrite করে।

ES module আর Node.js file-এর নিজস্ব module scope আছে — সেখানে top-level declaration global হয়ই না। এজন্যই আধুনিক code-এ এই সমস্যা কম দেখা যায়।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'node:vm runs code as a classic script, like a browser <script> tag',
            code: `const vm = require("node:vm");

vm.runInThisContext('var viaVar = 1; let viaLet = 2; function viaFunction() {}');
console.log(globalThis.viaVar, globalThis.viaLet, typeof globalThis.viaFunction);
console.log(vm.runInThisContext("viaLet"));   // it still exists, just not on globalThis`,
            output: `1 undefined function
2`,
          },
        ],
        followUps: ['What is `globalThis`?'],
      },
      related: ['js-scope-types'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'js-execution-context',
      level: 'advanced',
      priority: 2,
      question:
        'What is an execution context, and what happens in its creation and execution phases?',
      tags: ['execution-context', 'call-stack', 'hoisting', 'this'],
      answer: {
        interview: `**An execution context is the environment in which a piece of code runs. There is one global context, plus a new one for every function call; they are stacked on the call stack.**

Each context holds:
- a **lexical environment** (its variables, functions and a link to the outer environment — the scope chain),
- the value of **\`this\`**,
- for functions, the \`arguments\` and parameters.

It is built in two phases:
1. **Creation:** the engine scans the code and registers declarations — function declarations get their body, \`var\` gets \`undefined\`, \`let\`/\`const\`/\`class\` are created uninitialised (TDZ). \`this\` is determined.
2. **Execution:** code runs line by line, assigning values.

When a function returns, its context is popped off the call stack; its variables survive only if a closure still references them.

Real-world: this model explains hoisting, the TDZ, closures, \`this\` and stack overflows (\`RangeError: Maximum call stack size exceeded\`).`,
        explanationBn: `Execution context হলো JavaScript code চলার "পরিবেশ" — কোন variable আছে, \`this\` কী, বাইরের scope কোনটা — সব তথ্য একসাথে।

**কয়টা থাকে?** শুরুতে একটা **global execution context**। তারপর **প্রতিটা function call**-এ একটা নতুন context তৈরি হয় আর **call stack**-এ উপরে বসে। Function শেষ হলে সেটা stack থেকে সরে যায়।

**প্রতিটা context-এ যা থাকে:**
- Variable আর function-এর একটা টেবিল (lexical environment), সাথে বাইরের environment-এর একটা link — এই link-গুলো জোড়া লেগেই scope chain তৈরি হয়।
- \`this\`-এর value।
- Function হলে parameter আর \`arguments\`।

**দুই ধাপে তৈরি:**
1. **Creation phase** — code চালানোর আগে declaration গুলো নিবন্ধন। এখানেই hoisting ঘটে: function পুরোটা, \`var\` = \`undefined\`, \`let\`/\`const\` = uninitialized (TDZ)।
2. **Execution phase** — লাইন ধরে ধরে চালানো, value বসানো।

এই একটা মডেল দিয়ে অনেক কিছু ব্যাখ্যা হয়: hoisting (creation phase), TDZ (uninitialized), closure (function শেষ হলেও environment বেঁচে থাকে যদি কেউ ধরে রাখে), আর stack overflow (অসীম recursion-এ context জমতে জমতে stack ভরে যায়)।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'Each call pushes a context; unbounded recursion overflows the stack',
            code: `function depth(n) {
  return n === 0 ? "bottom" : depth(n - 1);
}
console.log(depth(3));

function forever() {
  return forever();
}
try {
  forever();
} catch (e) {
  console.log(e.name, "-", e.message);
}`,
            output: `bottom
RangeError - Maximum call stack size exceeded`,
          },
        ],
        followUps: ['What is the call stack?', 'How do closures keep variables alive?'],
      },
      visualizationId: 'js-hoisting-tdz',
      related: ['js-hoisting', 'js-lexical-scope-chain'],
    },
  ],
});

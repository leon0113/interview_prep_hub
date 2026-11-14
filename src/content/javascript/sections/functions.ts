import { defineSection } from '../../define';

export const functions = defineSection({
  id: 'js-functions',
  title: 'Functions',
  description:
    'Declarations vs expressions, arrow functions vs regular functions, parameters, callbacks and higher-order functions, IIFEs and pure functions.',
  order: 4,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'js-arrow-vs-regular',
      level: 'foundation',
      priority: 3,
      question: 'What are the differences between arrow functions and regular functions?',
      tags: ['functions', 'arrow-functions', 'this', 'arguments'],
      answer: {
        interview: `**Arrow functions are a shorter syntax, but the important differences are semantic: they have no own \`this\`, no \`arguments\`, and cannot be used with \`new\`.**

- **\`this\`:** an arrow function uses the \`this\` of the scope where it was *defined* (lexical \`this\`). A regular function's \`this\` depends on *how it is called*. \`call\`/\`apply\`/\`bind\` cannot change an arrow's \`this\`.
- **\`arguments\`:** arrows do not have their own \`arguments\` object — use rest parameters (\`...args\`).
- **Constructors:** arrows have no \`prototype\` and throw \`TypeError\` with \`new\`.
- **Syntax:** concise body returns implicitly (\`x => x * 2\`); returning an object literal needs parentheses: \`() => ({ a: 1 })\`.
- No \`super\`, no \`new.target\`, cannot be generators.

When to use which: arrows for callbacks and short functions (especially inside methods, where you want the outer \`this\`); regular functions (or method shorthand) for object methods, constructors, and anything that needs its own \`this\`.

Real-world: \`setTimeout(() => this.refresh(), 1000)\` inside a class method works; with \`function () {}\` it loses \`this\`.`,
        explanationBn: `দেখতে শুধু ছোট syntax মনে হলেও arrow function-এর আচরণে চারটা মৌলিক পার্থক্য আছে — interview-তে এগুলোই জিজ্ঞেস করা হয়:

**১. \`this\` — সবচেয়ে গুরুত্বপূর্ণ:**
- Regular function-এর \`this\` ঠিক হয় **কীভাবে call করা হলো** তা দেখে (dynamic)।
- Arrow function-এর নিজের কোনো \`this\` নেই। সে **যেখানে লেখা হয়েছে**, সেই বাইরের scope-এর \`this\` ব্যবহার করে (lexical)। \`call\`/\`bind\` দিয়েও এটা বদলানো যায় না।

এটাই arrow-এর সবচেয়ে বড় সুবিধা: class method-এর ভেতরে callback (\`setTimeout\`, \`map\`, event handler) লিখলে arrow function বাইরের method-এর \`this\` (object-টা) ধরে রাখে। পুরনো দিনে এজন্য \`const self = this\` বা \`.bind(this)\` লিখতে হতো।

আবার এটাই ফাঁদ: **object-এর method arrow দিয়ে লিখবেন না।** \`{ name: "x", greet: () => this.name }\` — এখানে \`this\` object না, বাইরের scope-এর \`this\`।

**২. \`arguments\` নেই** — rest parameter (\`...args\`) ব্যবহার করুন, যেটা আসল array।

**৩. Constructor না** — \`new\` দিয়ে call করলে \`TypeError\`; \`prototype\` property-ও নেই।

**৪. Syntax:** এক expression হলে \`{}\` আর \`return\` লাগে না। কিন্তু object ফেরত দিতে চাইলে বন্ধনী লাগে: \`() => ({ id: 1 })\` — নইলে \`{}\` function body হিসেবে পড়া হয়।

মনে রাখার নিয়ম: callback-এ arrow, method আর constructor-এ regular function।`,
        examples: [
          {
            lang: 'javascript',
            caption:
              "Lexical this: the arrow keeps the method's this; the regular function loses it",
            code: `const timer = {
  seconds: 0,
  startArrow() {
    [1, 2, 3].forEach(() => this.seconds++);       // this = timer
  },
  startRegular() {
    [1, 2, 3].forEach(function () {
      this.seconds++;                               // this = undefined/global, not timer
    });
  },
};
timer.startArrow();
console.log(timer.seconds);

const counter = {
  count: 10,
  regular() { return this.count; },
  arrow: () => this === counter,                   // not the object
};
console.log(counter.regular(), counter.arrow());`,
            output: `3
10 false`,
          },
          {
            lang: 'javascript',
            caption: 'No arguments, no new, implicit return',
            code: `function regular() { return arguments.length; }
const arrow = (...args) => args.length;
console.log(regular(1, 2, 3), arrow(1, 2, 3));

const Person = (name) => { this.name = name; };
try {
  new Person("Rafi");
} catch (e) {
  console.log(e.name, "-", e.message);
}

const makeUser = (name) => ({ name, active: true });
console.log(makeUser("Nadia"), typeof Person.prototype);`,
            output: `3 3
TypeError - Person is not a constructor
{ name: 'Nadia', active: true } undefined`,
          },
        ],
        pitfalls: [
          'Arrow functions as object methods do not get the object as `this`.',
          'Returning an object literal needs parentheses: `() => ({})`.',
          "You cannot rebind an arrow function's `this` with `call`, `apply` or `bind`.",
        ],
        followUps: [
          'How is `this` determined for a regular function?',
          'When should you NOT use an arrow function?',
          'What does `bind` do?',
        ],
      },
      visualizationId: 'js-this-binding',
      related: ['js-declaration-vs-expression', 'js-this-keyword'],
    },
    {
      id: 'js-declaration-vs-expression',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between a function declaration and a function expression?',
      tags: ['functions', 'hoisting', 'function-expression'],
      answer: {
        interview: `**A function declaration (\`function greet() {}\`) is a statement that defines a named function and is hoisted with its body. A function expression (\`const greet = function () {}\` or an arrow) creates a function as a value inside an expression, and is only available after that line runs.**

- **Hoisting:** declarations can be called before their line; expressions cannot (\`TypeError\` with \`var\`, \`ReferenceError\` with \`let\`/\`const\`).
- **Naming:** declarations must have a name; expressions can be anonymous or named (\`const f = function inner() {}\` — \`inner\` is visible only inside, useful for recursion and stack traces).
- **Usage:** expressions are what you pass as callbacks, return from functions, or assign conditionally.
- In strict mode and modules, declarations inside blocks are block-scoped.

Real-world: many style guides prefer \`const fn = () => {}\` for consistency and predictable ordering; declarations are handy for top-level helpers used before they are defined.`,
        explanationBn: `দুটো লেখার ধরন:
\`\`\`js
function add(a, b) { return a + b; }        // declaration
const add = function (a, b) { return a + b; }; // expression
const add = (a, b) => a + b;                // এটাও expression (arrow)
\`\`\`

**মূল পার্থক্য — hoisting:**
- **Declaration** পুরো function সহ hoist হয়। তাই file-এর একদম নিচে লেখা function উপরে call করা যায়।
- **Expression** — শুধু variable-টা hoist হয় (\`var\` হলে \`undefined\`, \`let\`/\`const\` হলে TDZ)। Function-টা variable-এ বসে তখনই, যখন execution সেই লাইনে পৌঁছায়। তার আগে call করলে error।

**অন্য পার্থক্য:**
- Declaration-এর নাম বাধ্যতামূলক। Expression নামহীন হতে পারে — callback হিসেবে পাঠানোর সময় সুবিধাজনক।
- **Named function expression**: \`const factorial = function fact(n) { ... fact(n-1) ... }\` — \`fact\` নামটা শুধু function-এর ভেতরে দেখা যায়। Recursion নিরাপদ হয় (বাইরের variable বদলালেও কাজ করে), আর error-এর stack trace-এ নাম দেখায়।

কোনটা ব্যবহার করবেন? দুটোই বৈধ। অনেক team \`const\` + arrow পছন্দ করে, কারণ তাতে code উপর থেকে নিচে পড়লেই ক্রম বোঝা যায় — "আগে define, পরে use"।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log(square(4));                 // declaration: hoisted
function square(n) { return n * n; }

try {
  cube(2);
} catch (e) {
  console.log(e.name);                  // expression: not yet assigned
}
const cube = function (n) { return n ** 3; };
console.log(cube(2));

const factorial = function fact(n) {    // named function expression
  return n <= 1 ? 1 : n * fact(n - 1);
};
console.log(factorial(5), typeof fact);`,
            output: `16
ReferenceError
8
120 undefined`,
          },
        ],
        pitfalls: [
          'Calling a function expression before its line throws.',
          "A named function expression's name is not visible outside the function.",
        ],
        followUps: ['What is hoisting?', 'What are arrow functions?'],
      },
      related: ['js-hoisting', 'js-arrow-vs-regular'],
    },
    {
      id: 'js-higher-order-callbacks',
      level: 'foundation',
      priority: 2,
      question: 'What are first-class functions, callbacks and higher-order functions?',
      tags: ['functions', 'callbacks', 'higher-order-functions', 'functional-programming'],
      answer: {
        interview: `**Functions in JavaScript are first-class values: they can be stored in variables, passed as arguments, returned from other functions and have properties. A callback is a function passed to another function to be called later; a higher-order function is one that takes and/or returns functions.**

- Built-in higher-order functions: \`map\`, \`filter\`, \`reduce\`, \`sort\`, \`setTimeout\`, \`addEventListener\`, \`Promise.then\`.
- Callbacks can be synchronous (\`arr.map(fn)\` runs immediately) or asynchronous (\`setTimeout(fn)\` runs later).
- Returning functions enables factories, currying, memoization and decorators.
- Passing a function means passing a **reference** — \`onClick={handle}\`, not \`handle()\`.

Real-world: \`button.addEventListener("click", handleClick)\` and \`users.filter(isActive)\` are everyday higher-order code.`,
        explanationBn: `**First-class function:** JavaScript-এ function সাধারণ value-র মতো — number বা string-এর মতোই variable-এ রাখা যায়, array-তে রাখা যায়, argument হিসেবে পাঠানো যায়, function থেকে ফেরত দেওয়া যায়। Function-এর নিজস্ব property-ও থাকতে পারে, কারণ function আসলে একটা object।

**Callback:** যে function আরেকটা function-কে argument হিসেবে দেওয়া হয়, "পরে আমাকে ডেকো" বলে। দুই ধরনের:
- **Synchronous:** \`[1,2,3].map(double)\` — \`map\` সাথে সাথেই \`double\` call করে।
- **Asynchronous:** \`setTimeout(done, 1000)\` — এক সেকেন্ড পরে।

**Higher-order function:** যে function অন্য function **নেয়** বা **ফেরত দেয়**। \`map\`, \`filter\`, \`reduce\`, \`addEventListener\` — সবই higher-order।

একটা খুব common ভুল: \`setTimeout(greet(), 1000)\` — এখানে \`greet\` সাথে সাথেই call হয়ে যায়, আর তার return value (সম্ভবত \`undefined\`) পাঠানো হয়। সঠিক: \`setTimeout(greet, 1000)\` — function-টাই পাঠানো, call না করে।

Function ফেরত দেওয়ার ক্ষমতা থেকেই আসে closure, currying, memoization — যেগুলো পরের section-এ।`,
        examples: [
          {
            lang: 'javascript',
            code: `const isEven = (n) => n % 2 === 0;
const double = (n) => n * 2;
console.log([1, 2, 3, 4].filter(isEven).map(double));

function repeat(times, action) {          // takes a function
  for (let i = 0; i < times; i++) action(i);
}
repeat(3, (i) => console.log("tick", i));

function multiplier(factor) {             // returns a function
  return (n) => n * factor;
}
const triple = multiplier(3);
console.log(triple(5), typeof triple, triple.length);`,
            output: `[ 4, 8 ]
tick 0
tick 1
tick 2
15 function 1`,
          },
        ],
        pitfalls: ['`setTimeout(fn(), 100)` calls `fn` immediately; pass `fn` itself.'],
        followUps: ['What is a closure?', 'Implement your own `map`.'],
      },
      related: ['js-closures', 'js-array-iteration-methods'],
    },
    {
      id: 'js-default-parameters',
      level: 'foundation',
      priority: 2,
      question: 'How do default parameters work in JavaScript?',
      tags: ['functions', 'default-parameters', 'undefined'],
      answer: {
        interview: `**A default parameter is used when the argument is \`undefined\` — either omitted or explicitly passed as \`undefined\`. \`null\`, \`0\` and \`""\` do not trigger the default.**

- Defaults are evaluated **at call time**, every call — so \`function f(list = [])\` gets a fresh array each time (unlike Python).
- Later parameters can use earlier ones: \`function f(a, b = a * 2)\`.
- Defaults can call functions: \`function f(id = generateId())\`.
- Parameters with defaults are not counted in \`fn.length\`.
- Combine with destructuring for options objects: \`function f({ retries = 3 } = {})\`.

Real-world: \`function fetchPage(page = 1, size = 20)\` gives sensible behaviour without \`if\` checks.`,
        explanationBn: `Default parameter-এর নিয়ম একটাই: **argument \`undefined\` হলে default বসে।** অর্থাৎ:
- argument না দিলে → default
- \`undefined\` পাঠালে → default
- \`null\`, \`0\`, \`""\`, \`false\` পাঠালে → **default বসে না**, পাঠানো value-ই থাকে।

**Python থেকে একটা গুরুত্বপূর্ণ পার্থক্য:** JavaScript-এ default value **প্রতিটা call-এ নতুন করে** evaluate হয়। তাই \`function add(item, list = [])\` প্রতিবার নতুন খালি array পায় — Python-এর "mutable default argument" ফাঁদ JavaScript-এ নেই।

কিছু সুবিধাজনক বৈশিষ্ট্য:
- পরের parameter আগের parameter ব্যবহার করতে পারে: \`function rect(w, h = w)\` — h না দিলে বর্গক্ষেত্র।
- Default-এ function call করা যায়: \`function create(id = uuid())\`।

\`fn.length\` শুধু default ছাড়া parameter গুনে — কিছু library (যেমন currying helper) এর ওপর নির্ভর করে, তাই জানা থাকা ভালো।`,
        examples: [
          {
            lang: 'javascript',
            code: `function greet(name = "guest", greeting = \`Hello, \${name}\`) {
  return greeting;
}
console.log(greet(), greet("Rafi"), greet(undefined), greet(null));

function add(item, list = []) {     // a fresh array on every call
  list.push(item);
  return list;
}
console.log(add(1), add(2));

let created = 0;
const nextId = () => ++created;
function make(id = nextId()) { return id; }
console.log(make(), make(), make(99), make());
console.log(greet.length, ((a, b = 1) => {}).length);`,
            output: `Hello, guest Hello, Rafi Hello, guest Hello, null
[ 1 ] [ 2 ]
1 2 99 3
0 1`,
          },
        ],
        pitfalls: ['`null` does not trigger a default parameter.'],
        followUps: ["How does this differ from Python's mutable default argument trap?"],
      },
      related: ['js-null-vs-undefined', 'js-destructuring'],
    },
    {
      id: 'js-iife',
      level: 'foundation',
      priority: 2,
      question: 'What is an IIFE, and why was it used?',
      tags: ['iife', 'scope', 'modules', 'closures'],
      answer: {
        interview: `**An IIFE (Immediately Invoked Function Expression) is a function that is defined and called in one go: \`(function () { ... })()\` or \`(() => { ... })()\`.**

- The wrapping parentheses turn the function into an *expression* so it can be invoked immediately.
- It creates a private scope: variables inside do not leak into the global scope.
- Classic uses before ES modules and \`let\`: the module pattern (expose a public API, keep the rest private), avoiding global name clashes, and capturing a loop variable with \`var\`.
- Today, ES modules and block scope cover most of those uses; IIFEs still appear for one-off async setup (\`(async () => { await init(); })()\`) and in bundler output.

Real-world: older libraries like jQuery were wrapped in an IIFE so only one global (\`$\`) was exposed.`,
        explanationBn: `**IIFE** = যে function তৈরি হওয়ার সাথে সাথেই call হয়ে যায়:
\`\`\`js
(function () {
  // এখানের সবকিছু private
})();
\`\`\`
বাইরের বন্ধনী function-টাকে একটা expression বানায় (নইলে \`function\` দিয়ে শুরু হওয়া লাইন declaration হিসেবে পড়া হতো, আর সাথে সাথে call করা যেত না), শেষের \`()\` সেটাকে call করে।

**কেন দরকার ছিল?** ES6-এর আগে JavaScript-এ block scope (\`let\`/\`const\`) আর module ছিল না। একমাত্র scope ছিল function। তাই:
- **Global দূষণ এড়ানো:** একাধিক script একই global নাম ব্যবহার করলে সংঘর্ষ হতো। IIFE-এর ভেতরের variable বাইরে যায় না।
- **Module pattern:** IIFE থেকে শুধু public function গুলো ফেরত দেওয়া, বাকি সব (helper, state) closure-এ private। jQuery এভাবেই শুধু \`$\` বাইরে দিত।

**এখন:** ES module প্রতিটা file-কে নিজস্ব scope দেয়, আর \`let\`/\`const\` block scope দেয় — তাই IIFE কম লাগে। তবে একটা আধুনিক ব্যবহার এখনো প্রচলিত: যেখানে top-level \`await\` চলে না, সেখানে async কাজের জন্য \`(async () => { ... })()\`।`,
        examples: [
          {
            lang: 'javascript',
            code: `const counterModule = (function () {
  let count = 0;                    // private
  return {
    increment: () => ++count,
    current: () => count,
  };
})();

counterModule.increment();
counterModule.increment();
console.log(counterModule.current(), typeof count);

(async () => {
  const value = await Promise.resolve("async setup done");
  console.log(value);
})();`,
            output: `2 undefined
async setup done`,
          },
        ],
        pitfalls: [
          'A missing semicolon before an IIFE on the next line can make it call the previous expression.',
        ],
        followUps: ['What is the module pattern?', 'How do ES modules replace IIFEs?'],
      },
      related: ['js-closures'],
    },
    {
      id: 'js-pure-functions',
      level: 'foundation',
      priority: 2,
      question: 'What is a pure function, and why does it matter?',
      tags: ['functional-programming', 'pure-functions', 'side-effects', 'immutability'],
      answer: {
        interview: `**A pure function always returns the same output for the same input and has no side effects — it does not modify its arguments, global state, the DOM, or perform I/O.**

- Pure: \`const total = (items) => items.reduce((s, i) => s + i.price, 0)\`.
- Impure: mutating an argument (\`items.push\`), reading \`Date.now()\` or \`Math.random()\`, logging, network calls.
- Benefits: easy to test (no setup or mocks), easy to reason about, safe to memoize and to run in parallel, predictable.
- Real programs need side effects — the goal is to isolate them at the edges and keep the core logic pure.
- Immutable updates (\`[...items, x]\`, \`{ ...obj, key: v }\`) keep functions pure.

Real-world: Redux reducers must be pure — same state and action, same new state, no mutation.`,
        explanationBn: `**Pure function-এর দুটো শর্ত:**
1. **একই input → সবসময় একই output।** বাইরের কোনো পরিবর্তনশীল জিনিসের (সময়, random সংখ্যা, global variable) ওপর নির্ভর করে না।
2. **কোনো side effect নেই।** বাইরের কিছু বদলায় না — argument mutate করে না, global variable বদলায় না, file/network/console-এ কিছু করে না।

উদাহরণ:
- Pure: \`(a, b) => a + b\`
- Impure: \`(list) => { list.push(1); return list; }\` — argument বদলে ফেলছে।
- Impure: \`() => Date.now()\` — প্রতিবার আলাদা ফল।

**কেন গুরুত্বপূর্ণ?**
- **Test সহজ:** input দাও, output মেলাও — কোনো mock বা setup লাগে না।
- **বোঝা সহজ:** function-টা পড়লেই সব জানা যায়, লুকানো প্রভাব নেই।
- **Memoize করা যায়:** একই input-এ একই output নিশ্চিত, তাই ফল মনে রাখা নিরাপদ।

বাস্তব program-এ side effect লাগবেই (data save, screen-এ দেখানো)। কৌশল হলো সেগুলোকে সীমানায় রাখা, আর মূল business logic pure রাখা। Redux-এর reducer, React-এর render — দুটোই pure হওয়ার কথা।`,
        examples: [
          {
            lang: 'javascript',
            code: `// Impure: mutates its argument
function addItemImpure(cart, item) {
  cart.push(item);
  return cart;
}

// Pure: returns a new array, leaves the input alone
const addItem = (cart, item) => [...cart, item];

const cart = ["pen"];
const next = addItem(cart, "book");
console.log(cart, next, cart === next);

addItemImpure(cart, "bag");
console.log(cart);`,
            output: `[ 'pen' ] [ 'pen', 'book' ] false
[ 'pen', 'bag' ]`,
          },
        ],
        followUps: ['Why must Redux reducers be pure?', 'What is memoization?'],
      },
      related: ['js-memoization'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'js-arguments-object',
      level: 'intermediate',
      priority: 1,
      question: 'What is the `arguments` object, and why are rest parameters preferred?',
      tags: ['functions', 'arguments', 'rest-parameters'],
      answer: {
        interview: `**\`arguments\` is an array-like object available inside regular (non-arrow) functions that holds every argument passed, regardless of the declared parameters.**

- It has \`length\` and indexes but no array methods (\`map\`, \`filter\`) — convert with \`Array.from(arguments)\` or \`[...arguments]\`.
- Arrow functions do not have their own \`arguments\` (they see the enclosing function's).
- In sloppy mode, \`arguments\` is linked to named parameters: changing one changes the other. Strict mode removes that link.
- Rest parameters (\`...args\`) are a real array, explicit in the signature, work in arrows, and are the modern replacement.

Real-world: you will see \`arguments\` in older libraries and polyfills; write \`...args\` in new code.`,
        explanationBn: `\`arguments\` হলো regular function-এর ভেতরে স্বয়ংক্রিয়ভাবে পাওয়া একটা object, যেখানে call-এ পাঠানো **সব** argument থাকে — parameter যতগুলোই declare করা থাকুক।

সমস্যা:
- এটা **array-like**, আসল array না — \`length\` আর index আছে, কিন্তু \`map\`, \`filter\`, \`reduce\` নেই। আগে \`Array.from(arguments)\` করতে হয়।
- Arrow function-এ নিজস্ব \`arguments\` নেই।
- Sloppy mode-এ একটা অদ্ভুত আচরণ: \`arguments[0]\` আর প্রথম parameter একে অপরের সাথে জোড়া — একটা বদলালে অন্যটাও বদলায়। Strict mode-এ এই জোড় নেই।

**Rest parameter (\`...args\`)** সব সমস্যার সমাধান: আসল array, signature-এই স্পষ্ট লেখা থাকে যে function যেকোনো সংখ্যক argument নেয়, আর arrow function-এও কাজ করে। নতুন code-এ সবসময় এটাই।`,
        examples: [
          {
            lang: 'javascript',
            code: `function legacySum() {
  console.log(Array.isArray(arguments), arguments.length);
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}
console.log(legacySum(1, 2, 3));

const modernSum = (...nums) => nums.reduce((a, b) => a + b, 0);
console.log(modernSum(1, 2, 3));

function linked(a) {
  arguments[0] = 99;          // sloppy mode: changes 'a' too
  return a;
}
function unlinked(a) {
  "use strict";
  arguments[0] = 99;
  return a;
}
console.log(linked(1), unlinked(1));`,
            output: `false 3
6
6
99 1`,
          },
        ],
        followUps: ['Why do arrow functions not have `arguments`?'],
      },
      related: ['js-spread-vs-rest', 'js-arrow-vs-regular'],
    },
    {
      id: 'js-function-composition',
      level: 'intermediate',
      priority: 1,
      question: 'What is function composition? Implement `compose` and `pipe`.',
      tags: ['functional-programming', 'composition', 'reduce', 'higher-order-functions'],
      answer: {
        interview: `**Composition builds a new function by chaining existing ones so the output of one becomes the input of the next.**

- \`compose(f, g, h)(x)\` = \`f(g(h(x)))\` — applied **right to left** (like math notation).
- \`pipe(f, g, h)(x)\` = \`h(g(f(x)))\` — applied **left to right**, which usually reads more naturally.
- Both are one-line \`reduce\`s over the list of functions.
- Works best with small, pure, single-argument functions — which is where currying helps.

Real-world: data-transformation pipelines (\`pipe(trim, toLowerCase, slugify)\`), and middleware chains in frameworks follow the same idea.`,
        explanationBn: `**Function composition** মানে ছোট ছোট function জোড়া লাগিয়ে বড় একটা function বানানো — একটার output পরেরটার input।

ধরুন একটা title থেকে URL slug বানাতে হবে: আগে space ছাঁটো (trim), তারপর lowercase, তারপর space-কে \`-\` বানাও। তিনটা আলাদা ছোট function লিখে জোড়া দিলে:
\`\`\`js
const slugify = pipe(trim, toLower, dashify);
\`\`\`

**\`pipe\`** — বাঁ থেকে ডানে চলে: প্রথম function আগে। পড়তে স্বাভাবিক।
**\`compose\`** — ডান থেকে বাঁয়ে: গণিতের \`f(g(x))\`-এর মতো, শেষেরটা আগে চলে।

Implementation একটা \`reduce\`: শুরুর value দিয়ে শুরু করে প্রতিটা function পরপর প্রয়োগ। \`compose\`-এর জন্য \`reduceRight\`।

সুবিধা: প্রতিটা ছোট function আলাদাভাবে test করা যায় আর অন্য জায়গায় পুনরায় ব্যবহার করা যায়। শর্ত হলো function গুলো এক argument নেবে আর pure হবে।`,
        examples: [
          {
            lang: 'javascript',
            code: `const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input);
const compose = (...fns) => (input) => fns.reduceRight((value, fn) => fn(value), input);

const trim = (s) => s.trim();
const toLower = (s) => s.toLowerCase();
const dashify = (s) => s.replace(/\\s+/g, "-");

const slugify = pipe(trim, toLower, dashify);
console.log(slugify("  Hello World From JS  "));

const add1 = (n) => n + 1;
const double = (n) => n * 2;
console.log(pipe(add1, double)(5), compose(add1, double)(5));`,
            output: `hello-world-from-js
12 11`,
          },
        ],
        followUps: ['What is currying, and how does it help composition?'],
      },
      related: ['js-higher-order-callbacks', 'js-currying'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'js-function-objects',
      level: 'advanced',
      priority: 1,
      question:
        'Functions are objects in JavaScript — what properties do they have, and what does that enable?',
      tags: ['functions', 'objects', 'properties', 'memoization'],
      answer: {
        interview: `**Every function is a callable object (an instance of \`Function\`), so it has properties and can be given new ones.**

- Built-in properties: \`name\`, \`length\` (number of declared parameters before the first default/rest), \`prototype\` (regular functions only — used by \`new\`).
- Methods inherited from \`Function.prototype\`: \`call\`, \`apply\`, \`bind\`, \`toString\`.
- You can attach your own properties — e.g. a cache on a memoized function or a counter on a spy in tests.
- \`fn.name\` is inferred from the variable or property it is assigned to (\`const sum = () => {}\` → \`"sum"\`); bound functions get \`"bound sum"\`.

Real-world: test spies (\`jest.fn()\`) are functions with extra properties like \`.mock.calls\`.`,
        explanationBn: `JavaScript-এ function আসলে একটা বিশেষ ধরনের **object** — call করা যায় এমন object। তাই এর property থাকে, আর নিজে property যোগও করা যায়।

**Built-in property:**
- \`name\` — function-এর নাম। Arrow বা anonymous function-এর ক্ষেত্রেও যে variable-এ রাখা হয়েছে সেখান থেকে নাম অনুমান করে নেয়। \`bind\` করা function-এর নাম হয় \`"bound ..."\`।
- \`length\` — কয়টা parameter declare করা (default বা rest-এর আগ পর্যন্ত)। Currying helper এটা ব্যবহার করে বোঝে কখন সব argument এসে গেছে।
- \`prototype\` — শুধু regular function-এর; \`new\` দিয়ে তৈরি object-এর prototype হয়।

**নিজের property যোগ করা:** যেমন memoized function-এর সাথেই তার cache রেখে দেওয়া, বা কতবার call হয়েছে তা গোনা। Jest-এর \`jest.fn()\` ঠিক এভাবেই বানানো — একটা function, যার \`.mock.calls\`-এ সব call-এর হিসাব থাকে।`,
        examples: [
          {
            lang: 'javascript',
            code: `function greet(name, greeting = "hi", ...rest) {}
const sum = (a, b) => a + b;
console.log(greet.name, greet.length, sum.name, sum.length);
console.log(typeof greet.prototype, typeof sum.prototype, sum.bind(null).name);

function tracked(x) {
  tracked.calls = (tracked.calls ?? 0) + 1;
  return x * 2;
}
tracked(1); tracked(2);
console.log(tracked.calls, greet instanceof Function, greet instanceof Object);`,
            output: `greet 1 sum 2
object undefined bound sum
2 true true`,
          },
        ],
        followUps: ['What does `Function.prototype.bind` return?'],
      },
      related: ['js-higher-order-callbacks', 'js-call-apply-bind'],
    },
  ],
});

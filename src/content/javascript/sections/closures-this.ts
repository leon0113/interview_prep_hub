import { defineSection } from '../../define';

export const closuresThis = defineSection({
  id: 'js-closures-this',
  title: 'Closures & this',
  description:
    'Closures and their real uses, the classic loop bug, every rule for `this`, call/apply/bind, currying and memoization.',
  order: 5,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'js-closures',
      level: 'foundation',
      priority: 3,
      question: 'What is a closure in JavaScript?',
      tags: ['closures', 'scope', 'lexical-scope', 'functions'],
      answer: {
        interview: `**A closure is a function together with the variables from the scope where it was created. The function keeps access to those variables even after the outer function has returned.**

- Every function in JavaScript is a closure: it holds a reference to its outer lexical environment.
- It captures **variables, not values** — it sees the variable's current value when it runs, and can update it.
- Each call of the outer function creates a **new** environment, so two closures from two calls have independent state.
- Captured variables stay alive (not garbage-collected) as long as the closure is reachable.
- Uses: data privacy, function factories, stateful callbacks (counters, \`once\`), memoization, currying, partial application, event handlers that remember context.

Real-world: an event handler created inside a component remembers that component's \`userId\` when the click happens seconds later.`,
        explanationBn: `**Closure = একটা function + যে পরিবেশে সে জন্মেছে সেখানকার variable গুলো।**

সাধারণত function শেষ হলে তার local variable মুছে যায়। কিন্তু যদি সেই function-এর ভেতরে আরেকটা function থাকে, যেটা বাইরের variable ব্যবহার করে, আর সেই ভেতরের function কোনোভাবে বাইরে চলে যায় (return করা হয়, callback হিসেবে দেওয়া হয়) — তাহলে বাইরের function শেষ হলেও তার variable গুলো মুছে যায় না, কারণ ভেতরের function এখনো সেগুলোকে "ধরে" আছে।

\`\`\`js
function makeCounter() {
  let count = 0;
  return () => ++count;   // count-কে মনে রাখে
}
const next = makeCounter();
next(); next();           // 1, 2 — count বেঁচে আছে!
\`\`\`
\`makeCounter\` অনেক আগেই শেষ, কিন্তু \`count\` এখনো আছে — শুধু \`next\` দিয়েই পৌঁছানো যায়।

তিনটা জিনিস মনে রাখুন:
1. **Value না, variable ধরে রাখে।** তাই পরে variable বদলালে closure নতুন value দেখে — এটাই loop-এর বিখ্যাত bug-এর কারণ।
2. **প্রতিটা call নতুন পরিবেশ বানায়।** \`makeCounter()\` দুবার ডাকলে দুটো স্বাধীন counter।
3. **Memory:** closure যতক্ষণ বেঁচে থাকে, তার ধরা variable-ও বেঁচে থাকে — বড় object অপ্রয়োজনে ধরে রাখলে memory leak হতে পারে।

Analogy: closure হলো একটা পিঠের ব্যাগ — function জন্মের জায়গা থেকে দরকারি জিনিস ব্যাগে ভরে নিয়ে যায়, যেখানেই যাক সাথে থাকে।

Visualize tab-এ দেখা যায় outer function শেষ হওয়ার পরেও তার environment কীভাবে বেঁচে থাকে।`,
        examples: [
          {
            lang: 'javascript',
            code: `function makeCounter() {
  let count = 0;                    // captured by the closure
  return {
    increment: () => ++count,
    get: () => count,
  };
}

const a = makeCounter();
const b = makeCounter();            // a separate environment
a.increment();
a.increment();
b.increment();
console.log(a.get(), b.get(), typeof count);`,
            output: `2 1 undefined`,
          },
          {
            lang: 'javascript',
            caption: 'Closures capture variables, not values',
            code: `let message = "hello";
const show = () => message;
message = "changed later";
console.log(show());`,
            output: `changed later`,
          },
        ],
        pitfalls: [
          'Closures capture variables, not snapshots — values read at call time, which causes the classic loop bug with `var`.',
          'A long-lived closure keeps everything it references in memory.',
        ],
        followUps: [
          'Give real use cases for closures.',
          'Why does `var` in a `for` loop with `setTimeout` print the same number?',
          'Can closures cause memory leaks?',
        ],
      },
      visualizationId: 'js-closure-scope-chain',
      related: ['js-closure-use-cases', 'js-var-settimeout-loop', 'js-lexical-scope-chain'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'js-closure-use-cases',
      level: 'intermediate',
      priority: 3,
      question: 'What are practical use cases for closures? Show privacy, a factory and `once`.',
      tags: ['closures', 'encapsulation', 'factory', 'once', 'module-pattern'],
      answer: {
        interview: `**Closures let a function carry private, persistent state without a class or globals.**

- **Data privacy / encapsulation:** variables inside the outer function are reachable only through the returned functions — true privacy (the module pattern).
- **Function factories:** \`makeMultiplier(3)\` returns a function specialised by a captured argument.
- **Stateful helpers:** \`once(fn)\` (run only the first time), counters, rate limiters, \`debounce\`/\`throttle\` (they capture the timer id).
- **Memoization:** a cache object captured by the wrapper.
- **Partial application / currying:** remembering earlier arguments.
- **Callbacks and event handlers** that remember the context they were created in.

Real-world: \`debounce\` keeps its \`timeoutId\` in a closure, so every call can cancel the previous timer.`,
        explanationBn: `Closure-এর বাস্তব ব্যবহার বলতে পারাটাই interview-তে আসল পরীক্ষা — শুধু সংজ্ঞা না।

**১. Data privacy:** JavaScript class-এ \`#private\` আসার আগে private data রাখার একমাত্র নির্ভরযোগ্য উপায় ছিল closure। একটা bank account-এর \`balance\` বাইরে থেকে সরাসরি বদলানো যাবে না — শুধু \`deposit\`/\`withdraw\` দিয়ে, যেখানে validation আছে।

**২. Function factory:** একটা "ছাঁচ" function, যেটা setting নিয়ে বিশেষায়িত function বানায়: \`makeMultiplier(3)\` → তিনগুণ করার function। \`makeLogger("auth")\` → সব message-এর আগে "[auth]" লেখা logger।

**৩. \`once\`:** function শুধু প্রথমবার চলবে, পরে আগের result দেবে — payment submit button দুবার চাপলে দুবার charge হওয়া ঠেকাতে। Closure-এ "আগে চলেছে কি না" আর result মনে রাখা হয়।

**৪. Debounce/throttle:** timer-এর id closure-এ থাকে, যাতে প্রতিটা call আগের timer বাতিল করতে পারে।

**৫. Memoization:** cache object closure-এ থাকে।

সবগুলোর মূল কথা একই: **closure = function-এর ব্যক্তিগত, স্থায়ী memory।**`,
        examples: [
          {
            lang: 'javascript',
            caption: 'Privacy: balance can only change through the methods',
            code: `function createAccount(initial) {
  let balance = initial;                 // private
  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("invalid amount");
      balance += amount;
      return balance;
    },
    getBalance: () => balance,
  };
}

const account = createAccount(100);
account.deposit(50);
account.balance = 1_000_000;             // adds an unrelated property
console.log(account.getBalance());`,
            output: `150`,
          },
          {
            lang: 'javascript',
            caption: 'A factory and once()',
            code: `const makeTagger = (tag) => (msg) => \`[\${tag}] \${msg}\`;
const authLog = makeTagger("auth");
console.log(authLog("login ok"));

function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

const charge = once((amount) => {
  console.log("charging", amount);
  return "receipt-1";
});
console.log(charge(500), charge(500));`,
            output: `[auth] login ok
charging 500
receipt-1 receipt-1`,
          },
        ],
        followUps: [
          'How do closures compare with `#private` class fields?',
          'Implement `memoize` using a closure.',
        ],
      },
      visualizationId: 'js-closure-scope-chain',
      related: ['js-closures', 'js-memoization', 'js-debounce-vs-throttle'],
    },
    {
      id: 'js-var-settimeout-loop',
      level: 'intermediate',
      priority: 3,
      question:
        'Why does this print `3 3 3`, and how do you fix it?\n\n```javascript\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n```',
      tags: ['closures', 'var', 'let', 'settimeout', 'event-loop'],
      answer: {
        interview: `**\`var\` is function-scoped, so there is only one \`i\` shared by every callback. The callbacks run after the loop has finished (they are queued as tasks), and by then \`i\` is \`3\`.**

Fixes:
1. **Use \`let\`:** a \`for\` loop with \`let\` creates a fresh binding of \`i\` for each iteration, so each callback closes over its own copy. → \`0 1 2\`
2. **IIFE (pre-ES6):** wrap the body in \`(function (j) { setTimeout(() => console.log(j)); })(i)\` to capture the current value as a parameter.
3. **Pass it as an argument:** \`setTimeout(console.log, 0, i)\` — extra \`setTimeout\` arguments are bound at call time.
4. **\`bind\`:** \`setTimeout(console.log.bind(null, i), 0)\`.

Two ideas combine here: closures capture variables (not values), and timer callbacks run only after the synchronous loop completes.

Real-world: the same bug appears when attaching event handlers in a loop with \`var\`.`,
        explanationBn: `এই puzzle-এ দুটো ধারণা একসাথে কাজ করে:

**১. Event loop:** \`setTimeout\`-এর callback সাথে সাথে চলে না, এমনকি delay 0 হলেও। এটা task queue-তে অপেক্ষা করে, আর চলে তখনই যখন বর্তমান synchronous code (পুরো loop) শেষ হয়। Loop শেষে \`i\` হয়ে গেছে \`3\` (এই মানেই শর্ত \`i < 3\` মিথ্যা হয়ে loop থামে)।

**২. \`var\`-এর scope:** \`var\` function-scoped — পুরো loop জুড়ে **একটাই** \`i\`। তিনটা callback-ই একই \`i\`-কে ধরে রেখেছে (closure variable ধরে, value না)। তাই যখন চলে, তিনজনই দেখে \`3\`।

**সমাধান — প্রতিটা iteration-এ আলাদা variable দেওয়া:**
- **\`let\`** — সবচেয়ে সহজ। \`for\` loop-এ \`let\` থাকলে JavaScript **প্রতিটা iteration-এর জন্য নতুন একটা \`i\`** তৈরি করে (আগের value কপি করে)। তাই প্রতিটা callback নিজস্ব \`i\` ধরে রাখে → 0, 1, 2।
- **IIFE** — ES6-এর আগের সমাধান: একটা function-এ \`i\` parameter হিসেবে পাঠানো। Parameter হলো নতুন variable, তাতে সেই মুহূর্তের value কপি হয়।
- **\`setTimeout\`-এর তৃতীয় argument** — \`setTimeout(fn, 0, i)\`: \`i\`-এর value সাথে সাথে পাঠানো হয়।

Interview-তে দুটো কারণই বলুন — শুধু "let ব্যবহার করুন" বললে interviewer জিজ্ঞেস করবেন "কেন কাজ করে?"`,
        examples: [
          {
            lang: 'javascript',
            caption: 'The code from the question',
            code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
            output: `3
3
3`,
          },
          {
            lang: 'javascript',
            caption: 'Three fixes',
            code: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log("let", i), 0);
}

for (var j = 0; j < 3; j++) {
  (function (captured) {
    setTimeout(() => console.log("iife", captured), 0);
  })(j);
}

for (var k = 0; k < 3; k++) {
  setTimeout((value) => console.log("arg", value), 0, k);
}`,
            output: `let 0
let 1
let 2
iife 0
iife 1
iife 2
arg 0
arg 1
arg 2`,
          },
        ],
        pitfalls: [
          'Using `let` declared *outside* the loop (`let i; for (i = 0; ...)`) brings the bug back — there is still one shared variable.',
        ],
        followUps: [
          'How exactly does `let` create a new binding per iteration?',
          'What is the event loop?',
        ],
      },
      visualizationId: 'js-closure-scope-chain',
      related: ['js-closures', 'js-var-let-const', 'js-event-loop'],
    },
    {
      id: 'js-this-keyword',
      level: 'intermediate',
      priority: 3,
      question: 'How is `this` determined in JavaScript? Explain every context.',
      tags: ['this', 'functions', 'binding', 'strict-mode', 'arrow-functions'],
      answer: {
        interview: `**For regular functions, \`this\` is decided by *how the function is called*, not where it is defined. Arrow functions are the exception: they use the \`this\` of their enclosing scope.**

Rules, in order of precedence:
1. **\`new Fn()\`** → \`this\` is the newly created object.
2. **Explicit binding** — \`fn.call(obj)\`, \`fn.apply(obj)\`, \`fn.bind(obj)\` → \`this\` is \`obj\` (a bound function cannot be re-bound).
3. **Method call** — \`obj.method()\` → \`this\` is the object left of the dot **at call time**.
4. **Plain call** — \`fn()\` → \`undefined\` in strict mode (and in modules/classes), the global object in sloppy mode.
5. **Arrow function** → no own \`this\`; uses the enclosing scope's \`this\`, and ignores all the rules above.

Other contexts: top-level \`this\` is \`window\` in a browser script, \`undefined\` in an ES module; in DOM event handlers (regular function), \`this\` is the element; inside class methods, rules 3–4 apply (classes are strict).

The classic bug — a **detached method**: \`const f = obj.method; f()\` or \`setTimeout(obj.method)\` loses \`obj\`. Fix with \`bind\`, an arrow wrapper, or an arrow class field.

Real-world: \`button.addEventListener("click", this.handleClick)\` in a class loses \`this\` unless it is bound.`,
        explanationBn: `\`this\` JavaScript-এর সবচেয়ে বিভ্রান্তিকর বিষয়গুলোর একটা, কারণ অন্য language-এর মতো এটা "নিজের object" না। **Regular function-এ \`this\` ঠিক হয় function কীভাবে call করা হলো তা দেখে** — কোথায় লেখা হয়েছে তা দেখে না।

একটা নিয়মের তালিকা উপর থেকে নিচে চেক করুন — প্রথম যেটা মেলে, সেটাই উত্তর:

**১. \`new\` দিয়ে call?** → \`this\` = নতুন তৈরি হওয়া object।
**২. \`call\`/\`apply\`/\`bind\` দিয়ে?** → \`this\` = যে object পাঠানো হয়েছে।
**৩. \`obj.method()\` — dot-এর বাঁয়ে object?** → \`this\` = সেই object।
**৪. শুধু \`fn()\`?** → strict mode-এ \`undefined\`, sloppy mode-এ global object (\`window\`)।
**আর arrow function?** → উপরের কোনো নিয়মই খাটে না। Arrow-এর নিজের \`this\` নেই — যেখানে লেখা, সেই বাইরের scope-এর \`this\`।

**সবচেয়ে common bug — "detached method":**
\`\`\`js
const greet = user.greet;   // method আলাদা করে নেওয়া
greet();                    // এখন এটা plain call (নিয়ম ৪) → this হারিয়ে গেল
\`\`\`
একই জিনিস ঘটে method-কে callback হিসেবে পাঠালে: \`setTimeout(user.greet, 100)\` বা \`button.addEventListener("click", this.handleClick)\`। Callback-কে পরে কেউ plain function হিসেবে call করে, তাই object-এর সাথে সম্পর্ক হারায়।

**সমাধান:** \`user.greet.bind(user)\`, অথবা arrow wrapper \`() => user.greet()\`, অথবা class-এ arrow function দিয়ে field: \`handleClick = () => { ... }\`।

Visualize tab-এ প্রতিটা call style-এর জন্য এই decision tree ধাপে ধাপে দেখা যায়।`,
        examples: [
          {
            lang: 'javascript',
            code: `const user = {
  name: "Rafi",
  greet() { return this?.name; },
};

console.log(user.greet());                       // method call

const detached = user.greet;
console.log(detached());                          // plain call: this lost

console.log(user.greet.call({ name: "Nadia" }));  // explicit
const bound = user.greet.bind(user);
console.log(bound.call({ name: "ignored" }));     // bind wins over call

function Person(name) { this.name = name; }
console.log(new Person("Sam").name);              // new

function sloppy() { return this === globalThis; }
function strict() { "use strict"; return this; }
console.log(sloppy(), strict());`,
            output: `Rafi
undefined
Nadia
Rafi
Sam
true undefined`,
          },
          {
            lang: 'javascript',
            caption: 'Fixing lost this in callbacks',
            code: `class Clock {
  ticks = 0;
  tickMethod() { this.ticks++; }
  tickArrow = () => { this.ticks++; };   // arrow class field: this is fixed
}

const clock = new Clock();
const run = (callback) => callback();

try {
  run(clock.tickMethod);                 // detached: this is undefined (class = strict)
} catch (e) {
  console.log(e.name);
}
run(clock.tickMethod.bind(clock));
run(() => clock.tickMethod());
run(clock.tickArrow);
console.log(clock.ticks);`,
            output: `TypeError
3`,
          },
        ],
        pitfalls: [
          'Passing `obj.method` as a callback detaches it from `obj`.',
          'Arrow functions as object methods do not get the object as `this`.',
          'Classes and modules are always strict, so a lost `this` is `undefined`, not `window`.',
        ],
        followUps: [
          'What is the difference between `call`, `apply` and `bind`?',
          'What does `new` do step by step?',
          'Why are arrow functions useful inside class methods?',
        ],
      },
      visualizationId: 'js-this-binding',
      related: ['js-call-apply-bind', 'js-arrow-vs-regular'],
    },
    {
      id: 'js-call-apply-bind',
      level: 'intermediate',
      priority: 3,
      question: 'What is the difference between `call`, `apply` and `bind`?',
      tags: ['this', 'call', 'apply', 'bind', 'functions'],
      answer: {
        interview: `**All three set \`this\` explicitly. \`call\` and \`apply\` invoke the function immediately; \`bind\` returns a new function with \`this\` (and optionally some arguments) permanently fixed.**

- \`fn.call(thisArg, a, b)\` — arguments listed individually.
- \`fn.apply(thisArg, [a, b])\` — arguments as an array ("**a** for **a**rray").
- \`const g = fn.bind(thisArg, a)\` — returns \`g\`; calling \`g(b)\` runs \`fn\` with \`this = thisArg\` and arguments \`a, b\` (partial application).
- A bound function's \`this\` cannot be changed again, even with \`call\`/\`apply\` — only \`new\` overrides it.
- They have no effect on arrow functions' \`this\`.
- With spread syntax, \`apply\` is rarely needed: \`fn.call(obj, ...args)\`, \`Math.max(...nums)\`.

Real-world: \`bind\` for event handlers and callbacks that must keep their object; \`call\` to borrow methods, e.g. \`Array.prototype.slice.call(arguments)\`.`,
        explanationBn: `তিনটাই একটা function-কে বলে "তোমার \`this\` হবে এই object"। পার্থক্য দুটো জায়গায় — **কখন চলে** আর **argument কীভাবে যায়**:

| | কখন চলে | Argument |
|---|---|---|
| \`call\` | সাথে সাথে | একটা একটা করে: \`fn.call(obj, 1, 2)\` |
| \`apply\` | সাথে সাথে | একটা array-তে: \`fn.apply(obj, [1, 2])\` |
| \`bind\` | **চলে না** — নতুন function ফেরত দেয় | আগে থেকে কিছু দেওয়া যায়, বাকিটা পরে |

মনে রাখার কৌশল: **A**pply → **A**rray; **C**all → **C**omma।

**\`bind\` সবচেয়ে বেশি ব্যবহৃত**, কারণ callback-এ \`this\` হারানোর সমস্যার সমাধান এটা। \`bind\` একটা নতুন function বানায়, যার \`this\` চিরকালের জন্য আটকে গেছে — পরে \`call\` বা \`apply\` দিয়েও বদলানো যায় না।

\`bind\` দিয়ে **partial application**-ও করা যায়: শুরুর কিছু argument আগে থেকে বসিয়ে রাখা — \`const double = multiply.bind(null, 2)\`।

**Method borrowing:** এক object-এর method অন্য object-এ ব্যবহার করা — যেমন array-like \`arguments\`-কে array বানাতে \`Array.prototype.slice.call(arguments)\`।

আধুনিক JavaScript-এ spread operator আসায় \`apply\` কম লাগে: \`Math.max.apply(null, nums)\`-এর বদলে \`Math.max(...nums)\`।`,
        examples: [
          {
            lang: 'javascript',
            code: `function introduce(greeting, punctuation) {
  return \`\${greeting}, I am \${this.name}\${punctuation}\`;
}
const rafi = { name: "Rafi" };
const nadia = { name: "Nadia" };

console.log(introduce.call(rafi, "Hi", "!"));
console.log(introduce.apply(nadia, ["Hello", "."]));

const rafiSays = introduce.bind(rafi, "Hey");     // this + first argument fixed
console.log(rafiSays("?"));
console.log(rafiSays.call(nadia, "!"));            // bound: call cannot change this

const multiply = (a, b) => a * b;
const double = multiply.bind(null, 2);
console.log(double(21));

function toArray() { return Array.prototype.slice.call(arguments); }
console.log(toArray(1, 2, 3));`,
            output: `Hi, I am Rafi!
Hello, I am Nadia.
Hey, I am Rafi?
Hey, I am Rafi!
42
[ 1, 2, 3 ]`,
          },
        ],
        pitfalls: [
          'Calling `bind` inside a render or loop creates a new function every time.',
          "`call`/`apply`/`bind` cannot change an arrow function's `this`.",
        ],
        followUps: [
          'Write a polyfill for `Function.prototype.bind`.',
          'What is partial application?',
        ],
      },
      visualizationId: 'js-this-binding',
      related: ['js-this-keyword', 'js-currying'],
    },
    {
      id: 'js-currying',
      level: 'intermediate',
      priority: 2,
      question: 'What is currying? Write a generic `curry` function.',
      tags: ['currying', 'closures', 'functional-programming', 'partial-application'],
      answer: {
        interview: `**Currying transforms a function of several arguments into a chain of functions that each take one (or some) of them: \`f(a, b, c)\` becomes \`f(a)(b)(c)\`.**

- Each call returns a closure that remembers the arguments so far; when enough arguments are collected (\`fn.length\`), the original function runs.
- It enables easy specialisation: \`const addTax = multiply(1.15)\`.
- **Partial application** is related but different: fixing some arguments once (\`bind\`) and taking the rest in a single call.
- A generic \`curry\` usually accepts several arguments per step too: \`curried(1)(2, 3)\`.
- Works best with functions of fixed arity (no rest/default parameters, since \`length\` ignores them).

Real-world: Ramda/lodash-fp style pipelines, and configuring reusable handlers: \`const logError = log("error")\`.`,
        explanationBn: `**Currying** মানে একসাথে অনেক argument নেওয়া function-কে এমনভাবে রূপান্তর করা, যাতে সে একটা একটা করে argument নেয়:
\`\`\`js
add(1, 2, 3)      // সাধারণ
add(1)(2)(3)      // curried
\`\`\`

**কীভাবে কাজ করে?** প্রতিটা call একটা নতুন function ফেরত দেয়, যেটা closure-এর মাধ্যমে এ পর্যন্ত পাওয়া argument মনে রাখে। যখন যথেষ্ট argument জমে যায় (\`fn.length\` দিয়ে জানা যায় কয়টা লাগবে), তখন আসল function চালায়।

**লাভ কী?** বিশেষায়িত function সহজে বানানো:
\`\`\`js
const log = curry((level, msg) => ...);
const logError = log("error");   // level আটকে গেল
logError("disk full");
\`\`\`
একই function থেকে \`logInfo\`, \`logWarn\` — আলাদা করে লিখতে হয় না।

**Partial application-এর সাথে পার্থক্য:** partial application মানে একবারে কিছু argument বসিয়ে বাকিটা পরে একবারে দেওয়া (\`bind\` যা করে)। Currying মানে প্রতিটা argument আলাদা ধাপে। বাস্তবে generic \`curry\` দুটোই সমর্থন করে — \`f(1)(2, 3)\` বা \`f(1, 2)(3)\`।

Interview-তে generic \`curry\` লেখা একটা খুব common প্রশ্ন — মূল কৌশল হলো argument জমানো আর \`fn.length\`-এর সাথে তুলনা করা।`,
        examples: [
          {
            lang: 'javascript',
            code: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

const volume = curry((l, w, h) => l * w * h);
console.log(volume(2)(3)(4), volume(2, 3)(4), volume(2)(3, 4), volume(2, 3, 4));

const log = curry((level, message) => \`[\${level}] \${message}\`);
const logError = log("error");
console.log(logError("disk full"));`,
            output: `24 24 24 24
[error] disk full`,
          },
        ],
        pitfalls: [
          '`fn.length` ignores rest and default parameters, so `curry` cannot know how many arguments such functions need.',
        ],
        followUps: [
          'What is the difference between currying and partial application?',
          'How would you curry a function with optional arguments?',
        ],
      },
      related: ['js-closures', 'js-call-apply-bind', 'js-function-composition'],
    },
    {
      id: 'js-memoization',
      level: 'intermediate',
      priority: 2,
      question: 'What is memoization? Implement a `memoize` function.',
      tags: ['memoization', 'caching', 'closures', 'performance'],
      answer: {
        interview: `**Memoization caches a function's results by its arguments, so repeated calls with the same input return the stored result instead of recomputing.**

- Implemented with a closure over a cache (\`Map\` is ideal); the key is derived from the arguments.
- Only safe for **pure** functions: same input → same output, no side effects.
- Key choice matters: a single primitive argument can be the key directly; multiple arguments need a combined key (\`JSON.stringify(args)\` works for simple values but is slow and fails on objects with the same content in different order).
- Trade-off: memory for speed — unbounded caches grow forever; use an LRU limit or \`WeakMap\` for object keys.
- Memoizing recursive functions (Fibonacci) turns exponential time into linear time, but the recursive calls must go through the memoized version.

Real-world: \`React.useMemo\`, \`reselect\` selectors, and caching expensive formatting or parsing.`,
        explanationBn: `**Memoization** = ভারী হিসাবের result মনে রাখা, যাতে একই input-এ আবার হিসাব করতে না হয়।

**গঠন:** একটা wrapper function, যার closure-এ একটা cache (\`Map\`)। প্রতিবার call হলে:
1. Argument থেকে একটা key বানাও।
2. Cache-এ আছে? থাকলে সাথে সাথে ফেরত দাও।
3. না থাকলে আসল function চালাও, result cache-এ রাখো, তারপর ফেরত দাও।

**শর্ত — function pure হতে হবে।** একই input-এ যদি আলাদা output আসতে পারে (\`Date.now()\` ব্যবহার করে, বা বাইরের state পড়ে), তাহলে cache থেকে পুরনো ভুল উত্তর দেবে।

**Key বানানোর সমস্যা:**
- এক argument (number/string) হলে সেটাই key।
- একাধিক argument হলে \`JSON.stringify(args)\` সহজ সমাধান, কিন্তু ধীর, আর object-এর key-এর ক্রম আলাদা হলে একই data-র আলাদা key হয়।
- Object argument-এর ক্ষেত্রে \`WeakMap\` — object মুছে গেলে cache entry-ও নিজে থেকে মুছে যায়।

**Trade-off:** memory দিয়ে গতি কেনা। সীমাহীন cache long-running app-এ memory leak — সর্বোচ্চ আকার (LRU) রাখুন।

**Recursive function-এ** (Fibonacci) memoization exponential সময়কে linear বানায় — কিন্তু ভেতরের recursive call গুলোকেও memoized version দিয়ে যেতে হবে, নইলে শুধু বাইরের call-টা cache হবে।`,
        examples: [
          {
            lang: 'javascript',
            code: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = args.length === 1 ? args[0] : JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}

let work = 0;
const slowSquare = (n) => { work++; return n * n; };
const fastSquare = memoize(slowSquare);
fastSquare(9); fastSquare(9); fastSquare(4);
console.log("computed", work, "times");

let calls = 0;
const fib = memoize((n) => {
  calls++;
  return n < 2 ? n : fib(n - 1) + fib(n - 2);   // recursion goes through the cache
});
console.log(fib(50), "calls:", calls);`,
            output: `computed 2 times
12586269025 calls: 51`,
          },
        ],
        pitfalls: [
          'Memoizing impure functions returns stale results.',
          'An unbounded cache is a memory leak in long-running apps.',
          '`JSON.stringify` keys treat `{a:1,b:2}` and `{b:2,a:1}` as different.',
        ],
        followUps: ['How would you limit the cache size?', 'When would you use a `WeakMap` cache?'],
      },
      related: ['js-closure-use-cases', 'js-pure-functions'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'js-closure-memory',
      level: 'advanced',
      priority: 1,
      question: 'Can closures cause memory leaks? How?',
      tags: ['closures', 'memory', 'garbage-collection', 'performance'],
      answer: {
        interview: `**Yes — a closure keeps its captured variables reachable for as long as the closure itself is reachable, so a long-lived closure can retain large objects you no longer need.**

Common patterns:
- Event listeners or intervals that are never removed, whose callbacks capture large data or DOM nodes.
- Closures stored in long-lived caches, globals or singletons.
- A forgotten \`setInterval\` that keeps its callback (and everything it references) alive forever.
- Detached DOM nodes still referenced from a handler.

Fixes: remove listeners (\`removeEventListener\`, or \`AbortController\` signals), \`clearInterval\`/\`clearTimeout\`, capture only what you need (copy the small value, not the whole object), null out references, and use \`WeakMap\`/\`WeakRef\` for caches keyed by objects.

Modern engines only retain variables that closures actually reference, but any variable referenced by *one* closure in a scope can be kept alive for all closures created in that scope.

Real-world: a single-page app that adds a resize listener on every route change, but never removes it, grows memory with each navigation.`,
        explanationBn: `Closure-এর শক্তিটাই এর ঝুঁকি: closure যতক্ষণ বেঁচে থাকে, তার ধরে রাখা variable গুলোও garbage collector মুছতে পারে না।

এটা সমস্যা হয় যখন:
- **Event listener সরানো হয় না:** listener-এর callback একটা বিশাল data structure ধরে রেখেছে। Component বা page বদলে গেলেও listener থেকে গেছে — ফলে data-ও memory-তে থেকে যায়।
- **\`setInterval\` বন্ধ করা হয়নি:** interval চিরকাল চলতে থাকে, তার callback আর তার সব ধরা variable-ও চিরকাল বেঁচে থাকে।
- **Global cache-এ closure রাখা।**

**সমাধান:**
- Listener সরান — \`removeEventListener\`, বা আধুনিক উপায় \`AbortController\` (একটা \`abort()\` দিয়ে একসাথে অনেক listener সরানো)।
- Timer বন্ধ করুন — \`clearInterval\`।
- শুধু দরকারি অংশটুকু ধরুন: পুরো বড় object না, শুধু যে field লাগবে সেটা আলাদা variable-এ নিয়ে closure-এ ব্যবহার করুন।

আধুনিক engine বুদ্ধিমান — closure যে variable আসলে ব্যবহার করে না, সেগুলো ধরে রাখে না। কিন্তু একটা ফাঁদ আছে: একই scope-এ তৈরি একাধিক closure একটা shared environment ব্যবহার করে, তাই একটা closure কোনো বড় variable ব্যবহার করলে সেটা সব closure-এর জন্যই বেঁচে থাকতে পারে।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'Capture only what you need, and clean up timers',
            code: `function startReporting(report) {
  const title = report.title;            // keep the small value...
  let runs = 0;
  const id = setInterval(() => {
    runs++;
    console.log(\`tick \${runs} for \${title}\`);   // ...not the whole report
    if (runs === 2) clearInterval(id);    // stop, so the closure can be collected
  }, 10);
}

startReporting({ title: "Q3", rows: new Array(100_000).fill(0) });`,
            output: `tick 1 for Q3
tick 2 for Q3`,
          },
        ],
        followUps: [
          'How does `AbortController` help remove event listeners?',
          'What is a `WeakMap` and when does it help?',
        ],
      },
      related: ['js-closures', 'js-map-vs-object'],
    },
  ],
});

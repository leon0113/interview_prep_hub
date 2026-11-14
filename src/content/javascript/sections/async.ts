import { defineSection } from '../../define';

export const asyncJs = defineSection({
  id: 'js-async',
  title: 'Asynchronous JavaScript',
  description:
    'The event loop, microtasks vs macrotasks, callbacks, promises and their combinators, async/await, error handling, and output-order puzzles.',
  order: 8,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'js-event-loop',
      level: 'foundation',
      priority: 3,
      question: 'What is the event loop? Explain the call stack, Web APIs and the task queue.',
      tags: ['event-loop', 'call-stack', 'task-queue', 'concurrency', 'runtime'],
      answer: {
        interview: `**The event loop is the mechanism that lets single-threaded JavaScript handle asynchronous work: it runs the next queued callback whenever the call stack is empty.**

The pieces:
- **Call stack** — where JavaScript executes functions, one at a time.
- **Web APIs / host APIs** — timers, network (\`fetch\`), DOM events, file I/O in Node. They run outside your JavaScript thread and, when done, queue a callback.
- **Macrotask (task) queue** — callbacks from \`setTimeout\`, \`setInterval\`, I/O and UI events.
- **Microtask queue** — promise reactions (\`.then\`, \`await\` continuations) and \`queueMicrotask\`.

The loop, repeatedly:
1. Run the current script / task until the call stack is empty.
2. **Drain the whole microtask queue** (including microtasks added meanwhile).
3. Render if needed (browsers).
4. Take the **next** macrotask and repeat.

Consequences: \`setTimeout(fn, 0)\` means "as soon as possible after the current work and all microtasks", not "now"; a long synchronous loop blocks everything — clicks, rendering, timers.

Real-world: splitting a heavy computation into chunks (or moving it to a Web Worker) keeps the page responsive.`,
        explanationBn: `JavaScript-এ code চলে একটাই thread-এ — এক সময়ে একটাই কাজ। তবুও একসাথে network request, timer, click সামলায় কীভাবে? উত্তর **event loop**।

**চারটা অংশ:**

1. **Call Stack** — এখানে আপনার code চলে। Function call হলে stack-এ ওঠে, শেষ হলে নামে।
2. **Web APIs** (Node-এ libuv) — \`setTimeout\`, \`fetch\`, event listener। এরা আপনার JavaScript thread-এর **বাইরে** অপেক্ষার কাজ করে। কাজ শেষ হলে callback-টা একটা queue-তে রেখে দেয়।
3. **Macrotask queue** — \`setTimeout\`, \`setInterval\`, I/O, click-এর callback।
4. **Microtask queue** — Promise-এর \`.then\`, \`await\`-এর পরের অংশ, \`queueMicrotask\`।

**Event loop-এর নিয়ম (একটা চক্র):**
1. বর্তমান code চালাও যতক্ষণ না call stack খালি হয়।
2. **পুরো microtask queue খালি করো** — নতুন microtask যোগ হলে সেটাও।
3. (Browser-এ) দরকার হলে screen render করো।
4. Macrotask queue থেকে **একটা** নিয়ে চালাও, তারপর আবার ধাপ ২।

Analogy: একজন রাঁধুনি (call stack) একসাথে একটাই রান্না করেন। চুলার timer আর ডেলিভারি boy (Web APIs) বাইরে অপেক্ষা করে, কাজ শেষ হলে অর্ডার-স্লিপ রাখে দুটো ট্রেতে। VIP ট্রে (microtask) পুরো খালি না করে রাঁধুনি সাধারণ ট্রেতে (macrotask) হাত দেন না — আর সাধারণ ট্রে থেকে একবারে একটাই স্লিপ নেন।

**দুটো গুরুত্বপূর্ণ পরিণতি:**
- \`setTimeout(fn, 0)\` মানে "এখনই" না — মানে "বর্তমান code আর সব microtask শেষ হওয়ার পরে"।
- লম্বা synchronous কাজ চললে stack খালি হয় না, তাই click, render, timer — সব আটকে থাকে। Page জমে যায়।

Visualize tab-এ preset code ধরে প্রতিটা ধাপে stack আর দুই queue-র অবস্থা দেখা যায়।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log("1: script start");

setTimeout(() => console.log("4: macrotask (setTimeout)"), 0);

Promise.resolve().then(() => console.log("3: microtask (promise)"));

console.log("2: script end");`,
            output: `1: script start
2: script end
3: microtask (promise)
4: macrotask (setTimeout)`,
          },
          {
            lang: 'javascript',
            caption: 'A synchronous loop blocks even a 0 ms timer',
            code: `const start = Date.now();
setTimeout(() => {
  console.log("timer waited at least", Date.now() - start >= 100 ? "100ms" : "?");
}, 0);
while (Date.now() - start < 100) {}    // busy for 100 ms
console.log("loop done");`,
            output: `loop done
timer waited at least 100ms`,
          },
        ],
        pitfalls: [
          '`setTimeout(fn, 0)` never runs before the current synchronous code and pending microtasks.',
          'A long synchronous task blocks rendering, input and timers.',
          'An endless chain of microtasks can starve macrotasks and rendering.',
        ],
        followUps: [
          'What is the difference between microtasks and macrotasks?',
          'Predict the output order of a snippet with `setTimeout`, promises and `async`.',
          'How would you keep the UI responsive during heavy work?',
        ],
      },
      visualizationId: 'js-event-loop',
      related: ['js-microtask-vs-macrotask', 'js-sync-vs-async', 'js-event-loop-puzzles'],
    },
    {
      id: 'js-sync-vs-async',
      level: 'foundation',
      priority: 2,
      question: 'What is the difference between synchronous and asynchronous code in JavaScript?',
      tags: ['async', 'blocking', 'non-blocking', 'event-loop'],
      answer: {
        interview: `**Synchronous code runs line by line, and each line blocks until it finishes. Asynchronous code starts an operation, continues immediately, and handles the result later via a callback, promise or \`await\`.**

- JavaScript runs on one thread, so a slow synchronous operation (a big loop, \`readFileSync\`) blocks everything else.
- Async operations — network, timers, file and database I/O — are handled by the runtime outside your thread; their results come back through the event loop.
- Async does not mean parallel *JavaScript*: your callbacks still run one at a time on the same thread.
- Three styles, historically: callbacks → promises → \`async\`/\`await\` (which reads like synchronous code but does not block).

Real-world: a Node server that uses \`fs.readFileSync\` in a request handler makes every other request wait.`,
        explanationBn: `**Synchronous:** একটা কাজ পুরো শেষ হওয়ার পরেই পরের লাইন চলে। ধীর কাজ মানে সবাই অপেক্ষা করে — "blocking"।

**Asynchronous:** কাজটা শুরু করে দিয়ে সাথে সাথে পরের লাইনে চলে যায়। কাজ শেষ হলে ফলাফল পরে আসে — callback, promise, বা \`await\`-এর মাধ্যমে। "Non-blocking"।

Analogy: রেস্টুরেন্টে synchronous ওয়েটার একজনের অর্ডার নিয়ে রান্নাঘরে দাঁড়িয়ে থাকেন যতক্ষণ না খাবার হয় — বাকি সবাই অপেক্ষা করে। Asynchronous ওয়েটার অর্ডার রান্নাঘরে দিয়ে অন্য টেবিলে যান; খাবার তৈরি হলে বেল বাজে, তখন নিয়ে আসেন।

JavaScript একটাই thread-এ চলে বলে async এত জরুরি। Network বা file-এর কাজ runtime (browser বা Node) পেছনে করে, আর ফলাফল event loop-এর মাধ্যমে আসে।

**একটা ভুল ধারণা:** async মানে আপনার JavaScript code একসাথে (parallel) চলছে — না। অপেক্ষাগুলো একসাথে ঘটে, কিন্তু callback গুলো এখনো একটা একটা করে একই thread-এ চলে।

Node server-এ \`readFileSync\` ব্যবহার করলে একটা request-এর file পড়ার সময় বাকি সব request আটকে থাকে — এজন্যই server code-এ সবসময় async version।`,
        examples: [
          {
            lang: 'javascript',
            code: `const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const file = path.join(os.tmpdir(), "iph-demo.txt");
fs.writeFileSync(file, "hello");

console.log("1: before");
fs.readFile(file, "utf8", (err, text) => {
  console.log("3: async read finished:", text);
});
console.log("2: after starting the async read");
console.log("   sync read:", fs.readFileSync(file, "utf8"));`,
            output: `1: before
2: after starting the async read
   sync read: hello
3: async read finished: hello`,
          },
        ],
        followUps: ['What is the event loop?', 'What problem do promises solve over callbacks?'],
      },
      related: ['js-event-loop', 'js-callback-hell'],
    },
    {
      id: 'js-callback-hell',
      level: 'foundation',
      priority: 2,
      question: 'What is callback hell, and how do promises and async/await fix it?',
      tags: ['callbacks', 'callback-hell', 'promises', 'async-await'],
      answer: {
        interview: `**Callback hell (the "pyramid of doom") is deeply nested callbacks when each async step depends on the previous one — hard to read, and error handling must be repeated at every level.**

Problems beyond indentation:
- **Error handling** is manual and duplicated (\`if (err) return cb(err)\` everywhere); a thrown error inside a callback is not caught by an outer \`try\`.
- **Inversion of control:** you trust third-party code to call your callback exactly once.
- Hard to run steps in parallel or compose them.

Fixes:
- **Promises** flatten the nesting into a \`.then()\` chain with one \`.catch()\` and guaranteed single resolution.
- **async/await** makes the chain read top to bottom, with ordinary \`try/catch\`.
- Node's \`util.promisify\` and the \`fs/promises\` APIs convert callback APIs.
- Also: named functions instead of inline closures, and \`Promise.all\` for independent steps.

Real-world: a "load user → load orders → load invoice" flow goes from three nested callbacks to three \`await\` lines.`,
        explanationBn: `যখন একটা async কাজ শেষ হওয়ার পরে আরেকটা, তারপর আরেকটা — আর প্রতিটা আগেরটার ফলাফলের ওপর নির্ভর করে — callback দিয়ে লিখলে code ক্রমশ ডানে সরে যায়:
\`\`\`js
getUser(id, (err, user) => {
  getOrders(user, (err, orders) => {
    getInvoice(orders[0], (err, invoice) => { ... });
  });
});
\`\`\`
এই পিরামিড আকৃতিকে বলে **callback hell**।

শুধু দেখতে খারাপ না, আসল সমস্যাগুলো আরও গভীর:
- **Error handling:** প্রতিটা স্তরে আলাদা করে \`if (err)\` লিখতে হয়। একটা ভুলে গেলে error নিঃশব্দে হারায়। আর callback-এর ভেতরে \`throw\` করলে বাইরের \`try/catch\` সেটা ধরতে পারে না (ততক্ষণে বাইরের code অনেক আগেই শেষ)।
- **Inversion of control:** আপনি অন্যের code-কে বিশ্বাস করছেন যে সে আপনার callback ঠিক একবার call করবে — দুবার বা কখনোই না করলে?

**Promise** এটা সমতল করে: \`.then().then().then()\` chain, আর শেষে একটা \`.catch()\` সব স্তরের error ধরে। Promise নিশ্চয়তা দেয় যে ফল একবারই আসবে।

**async/await** আরও এক ধাপ এগিয়ে — async code দেখতে হুবহু সাধারণ synchronous code-এর মতো, আর error ধরতে সাধারণ \`try/catch\`।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'The same flow with callbacks and with async/await',
            code: `const getUser = (id, cb) => setTimeout(() => cb(null, { id, name: "Rafi" }), 10);
const getOrders = (user, cb) => setTimeout(() => cb(null, [{ total: 250 }]), 10);

getUser(7, (err, user) => {
  if (err) return console.error(err);
  getOrders(user, (err, orders) => {
    if (err) return console.error(err);
    console.log("callbacks:", user.name, orders[0].total);
  });
});

const { promisify } = require("node:util");
const getUserP = promisify(getUser);
const getOrdersP = promisify(getOrders);

(async () => {
  try {
    const user = await getUserP(7);
    const orders = await getOrdersP(user);
    console.log("async/await:", user.name, orders[0].total);
  } catch (err) {
    console.error(err);
  }
})();`,
            output: `callbacks: Rafi 250
async/await: Rafi 250`,
          },
        ],
        followUps: ['What does `util.promisify` do?', 'How do promises handle errors?'],
      },
      related: ['js-promise-basics', 'js-async-await', 'js-promisify'],
    },
    {
      id: 'js-promise-basics',
      level: 'foundation',
      priority: 2,
      question: 'What is a Promise, and what are its states?',
      tags: ['promises', 'states', 'async'],
      answer: {
        interview: `**A Promise is an object representing the eventual result of an async operation. It is in one of three states: *pending*, then either *fulfilled* (with a value) or *rejected* (with a reason).**

- Once fulfilled or rejected it is **settled** and can never change again; \`resolve\`/\`reject\` calls after that are ignored.
- Create one with \`new Promise((resolve, reject) => { ... })\`, or \`Promise.resolve(v)\` / \`Promise.reject(e)\`.
- Consume it with \`.then(onFulfilled, onRejected)\`, \`.catch(onRejected)\` and \`.finally(onSettled)\` — or with \`await\`.
- Handlers always run **asynchronously** (as microtasks), even if the promise is already settled.
- Resolving with another promise (or any "thenable") adopts that promise's state.

Real-world: \`fetch(url)\` returns a promise that fulfils with a \`Response\` once headers arrive — or rejects on a network failure (not on HTTP 404/500).`,
        explanationBn: `**Promise** হলো একটা "প্রতিশ্রুতি" — একটা object, যেটা এখনো না-আসা একটা ভবিষ্যৎ ফলাফলের প্রতিনিধিত্ব করে।

**তিনটা অবস্থা:**
- **Pending** — অপেক্ষায়, ফল এখনো আসেনি।
- **Fulfilled** — সফল, একটা value আছে।
- **Rejected** — ব্যর্থ, একটা কারণ (error) আছে।

Fulfilled বা rejected হলে বলে **settled**। একবার settled হলে আর **কখনো** বদলায় না — পরে আবার \`resolve\` বা \`reject\` call করলে উপেক্ষা করা হয়। এই নিশ্চয়তাটাই callback-এর তুলনায় বড় সুবিধা।

Analogy: রেস্টুরেন্টের টোকেন। অর্ডার দিলে একটা টোকেন পান (pending)। পরে হয় খাবার পান (fulfilled), নয়তো জানানো হয় "শেষ হয়ে গেছে" (rejected)। একবার খাবার পেলে সেই টোকেন দিয়ে আবার "শেষ হয়ে গেছে" শুনবেন না।

**ব্যবহার:** \`.then()\` সফল হলে, \`.catch()\` ব্যর্থ হলে, \`.finally()\` দুই ক্ষেত্রেই (loading spinner বন্ধ করার মতো কাজে)।

**একটা সূক্ষ্ম নিয়ম:** handler সবসময় **asynchronously** চলে (microtask হিসেবে) — promise আগে থেকেই resolved থাকলেও। তাই \`.then\`-এর পরের synchronous code আগে চলে।

**\`fetch\`-এর ফাঁদ:** HTTP 404 বা 500 হলেও \`fetch\`-এর promise **fulfilled** হয় — শুধু network-ই ব্যর্থ হলে rejected। তাই \`response.ok\` চেক করতে হয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `const p = new Promise((resolve, reject) => {
  resolve("first");
  resolve("second");     // ignored: already settled
  reject(new Error("x")); // ignored
});

p.then((v) => console.log("fulfilled with", v))
 .finally(() => console.log("finally runs either way"));

Promise.reject(new Error("boom"))
  .then(() => console.log("never"))
  .catch((e) => console.log("caught:", e.message));

console.log("sync code runs first");`,
            output: `sync code runs first
fulfilled with first
finally runs either way
caught: boom`,
          },
        ],
        pitfalls: [
          'Calling `resolve` or `reject` more than once has no effect — only the first settles the promise.',
          '`fetch` does not reject on HTTP errors; check `response.ok`.',
          'Forgetting to `return` a promise inside `.then` breaks the chain.',
        ],
        followUps: [
          'How does promise chaining work?',
          'What is the difference between `Promise.all` and `Promise.allSettled`?',
        ],
      },
      visualizationId: 'js-promise-states',
      related: ['js-promise-chaining', 'js-promise-combinators'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'js-microtask-vs-macrotask',
      level: 'intermediate',
      priority: 3,
      question: 'What is the difference between microtasks and macrotasks?',
      tags: ['event-loop', 'microtasks', 'macrotasks', 'promises', 'settimeout'],
      answer: {
        interview: `**Both are queues of callbacks, but the event loop drains the *entire* microtask queue after every task, before taking the *next single* macrotask.**

- **Microtasks:** promise reactions (\`.then\`/\`.catch\`/\`.finally\`), \`await\` continuations, \`queueMicrotask\`, \`MutationObserver\`. (Node also has \`process.nextTick\`, which runs even before promise microtasks.)
- **Macrotasks (tasks):** \`setTimeout\`, \`setInterval\`, I/O callbacks, UI events, \`MessageChannel\`, \`setImmediate\` (Node).
- Order: current script → **all** microtasks (including ones queued while draining) → render → **one** macrotask → all microtasks → …
- So a resolved promise's \`.then\` always runs before a \`setTimeout(..., 0)\` queued at the same time.
- Danger: microtasks that keep queuing microtasks starve timers and rendering.

Real-world: state libraries batch updates in a microtask, so several synchronous changes produce a single re-render — still before the browser paints.`,
        explanationBn: `দুটোই callback-এর queue, কিন্তু **অগ্রাধিকার** আলাদা — আর এখান থেকেই প্রায় সব output-order puzzle-এর উত্তর আসে।

**Microtask (উচ্চ অগ্রাধিকার):**
- Promise-এর \`.then\`, \`.catch\`, \`.finally\`
- \`await\`-এর পরের অংশ
- \`queueMicrotask(fn)\`
- (Node-এ \`process.nextTick\` — এটা promise microtask-এরও আগে)

**Macrotask / task (সাধারণ):**
- \`setTimeout\`, \`setInterval\`
- I/O callback, click-এর মতো event
- (Node-এ \`setImmediate\`)

**নিয়ম — এটাই মুখস্থ রাখুন:**
> প্রতিটা macrotask শেষ হওয়ার পর, পরের macrotask-এ যাওয়ার আগে, **পুরো microtask queue খালি করা হয়** — চলার সময় নতুন microtask যোগ হলে সেটাও।

ধাপে ধাপে: script চলে → সব microtask → (render) → **একটা** macrotask → সব microtask → **একটা** macrotask → …

তাই একই সময়ে queue করা হলে Promise-এর \`.then\` সবসময় \`setTimeout(..., 0)\`-এর আগে চলে।

**বিপদ — starvation:** একটা microtask যদি বারবার নতুন microtask যোগ করতে থাকে, queue কখনো খালি হয় না — timer, click, render কিছুই চলার সুযোগ পায় না। Page জমে যায়, যদিও কোনো একক লম্বা loop নেই।`,
        examples: [
          {
            lang: 'javascript',
            code: `setTimeout(() => console.log("timeout 1"), 0);
setTimeout(() => {
  console.log("timeout 2");
  Promise.resolve().then(() => console.log("micro inside timeout 2"));
}, 0);
setTimeout(() => console.log("timeout 3"), 0);

Promise.resolve().then(() => {
  console.log("micro 1");
  queueMicrotask(() => console.log("micro 2 (queued while draining)"));
});
console.log("sync");`,
            output: `sync
micro 1
micro 2 (queued while draining)
timeout 1
timeout 2
micro inside timeout 2
timeout 3`,
          },
        ],
        pitfalls: [
          'Recursively queuing microtasks starves timers, I/O and rendering.',
          "Do not rely on `setTimeout(0)` vs `setImmediate` order in Node's main module — it can vary.",
        ],
        followUps: [
          'Where does `await` put the rest of an async function?',
          'Where does `process.nextTick` fit in Node?',
        ],
      },
      visualizationId: 'js-event-loop',
      related: ['js-event-loop', 'js-event-loop-puzzles', 'js-await-scheduling'],
    },
    {
      id: 'js-promise-combinators',
      level: 'intermediate',
      priority: 3,
      question:
        'What is the difference between `Promise.all`, `Promise.allSettled`, `Promise.race` and `Promise.any`?',
      tags: ['promises', 'promise-all', 'promise-allsettled', 'promise-race', 'promise-any'],
      answer: {
        interview: `**All four take an iterable of promises and return one promise; they differ in when it settles and with what.**

| | Fulfils when | Rejects when | Result |
|---|---|---|---|
| \`all\` | **all** fulfil | **any one** rejects (fail-fast) | array of values, in input order |
| \`allSettled\` | all have settled | never | array of \`{ status, value \\| reason }\` |
| \`race\` | the **first to settle** fulfils | the first to settle rejects | that first value / reason |
| \`any\` | the **first to fulfil** | **all** reject | first value / \`AggregateError\` |

- Results of \`all\`/\`allSettled\` keep the **input order**, not completion order.
- None of them cancels the "losing" promises — they keep running.
- Empty input: \`all([])\` and \`allSettled([])\` fulfil with \`[]\`; \`any([])\` rejects; \`race([])\` stays pending forever.

Real-world: \`all\` for "load everything this page needs"; \`allSettled\` for a batch where some failures are acceptable; \`race\` for a timeout; \`any\` for the fastest of several mirrors.`,
        explanationBn: `চারটাই অনেকগুলো promise নিয়ে একটা promise ফেরত দেয় — পার্থক্য হলো **কখন** আর **কী নিয়ে** শেষ হয়:

**\`Promise.all\` — "সব অথবা কিছুই না":** সবগুলো সফল হলে সব value-র array দেয় (input-এর ক্রমে)। কিন্তু **একটা** ব্যর্থ হলেই সাথে সাথে পুরোটা reject — বাকিদের জন্য অপেক্ষা করে না (fail-fast)। ব্যবহার: page দেখাতে যে সব data লাগবেই।

**\`Promise.allSettled\` — "সবার খবর দাও":** কখনো reject হয় না। সবগুলো শেষ হওয়া পর্যন্ত অপেক্ষা করে, তারপর প্রতিটার জন্য \`{status: "fulfilled", value}\` বা \`{status: "rejected", reason}\` দেয়। ব্যবহার: ১০০ জনকে email পাঠানো — কিছু ব্যর্থ হলেও বাকিরা যাক, পরে দেখব কারা ব্যর্থ।

**\`Promise.race\` — "যে আগে শেষ হয়":** প্রথম **settle** হওয়া promise-এর ফলাফল — সেটা সফল হোক বা ব্যর্থ। ব্যবহার: timeout — আসল request আর একটা "৫ সেকেন্ড পরে reject" promise-এর দৌড়।

**\`Promise.any\` — "প্রথম সফলটা":** ব্যর্থতাগুলো উপেক্ষা করে প্রথম **সফল** ফল দেয়। সবগুলো ব্যর্থ হলে তবেই \`AggregateError\`। ব্যবহার: একই file কয়েকটা server থেকে চাওয়া, যেটা আগে দেয়।

**মনে রাখবেন:** কোনোটাই হেরে যাওয়া promise-গুলোকে **থামায় না** — তারা পেছনে চলতেই থাকে। আসলেই থামাতে \`AbortController\` লাগে।

Visualize tab-এ তিনটা promise ১, ২, ৩ সেকেন্ডে settle হলে প্রতিটা combinator কীভাবে সাড়া দেয় তা দেখা যায়।`,
        examples: [
          {
            lang: 'javascript',
            code: `const ok = (v, ms) => new Promise((res) => setTimeout(() => res(v), ms));
const fail = (msg, ms) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));

async function main() {
  console.log(await Promise.all([ok("a", 20), ok("b", 10)]));

  try {
    await Promise.all([ok("a", 20), fail("b broke", 10)]);
  } catch (e) {
    console.log("all rejected:", e.message);
  }

  const settled = await Promise.allSettled([ok("a", 10), fail("b broke", 5)]);
  console.log(settled.map((r) => r.status + ":" + (r.value ?? r.reason.message)));

  console.log("race:", await Promise.race([ok("slow", 30), ok("fast", 5)]));
  console.log("any:", await Promise.any([fail("x", 5), ok("first success", 15)]));

  try {
    await Promise.any([fail("x", 5), fail("y", 10)]);
  } catch (e) {
    console.log(e.name, e.errors.length);
  }
}
main();`,
            output: `[ 'a', 'b' ]
all rejected: b broke
[ 'fulfilled:a', 'rejected:b broke' ]
race: fast
any: first success
AggregateError 2`,
          },
        ],
        pitfalls: [
          'None of the combinators cancels the remaining promises.',
          '`Promise.race([])` never settles; `Promise.any([])` rejects immediately.',
        ],
        followUps: [
          'Implement `Promise.all` yourself.',
          'How would you add a timeout to a fetch call?',
        ],
      },
      visualizationId: 'js-promise-states',
      related: ['js-promise-basics', 'js-sequential-vs-parallel-await', 'js-abort-timeouts'],
    },
    {
      id: 'js-promise-chaining',
      level: 'intermediate',
      priority: 2,
      question: 'How does promise chaining work, and how do errors propagate through a chain?',
      tags: ['promises', 'chaining', 'error-handling', 'then', 'catch'],
      answer: {
        interview: `**Every \`.then()\`/\`.catch()\`/\`.finally()\` returns a *new* promise, settled by what its handler does.**

- Return a value → the next promise fulfils with it.
- Return a promise → the chain waits for it and adopts its result (this is how async steps run in sequence).
- Throw (or return a rejected promise) → the next promise rejects.
- A rejection **skips** every \`.then\` fulfilment handler until it reaches a \`.catch\` (or a \`.then\` with a second argument).
- After a \`.catch\` handles an error, the chain **continues as fulfilled** with whatever the catch returned.
- \`.finally\` runs either way, does not receive the value, and passes the original result through (unless it throws).
- Forgetting \`return\` inside a \`.then\` is the classic bug: the next step runs with \`undefined\` and does not wait.

Real-world: \`fetchUser().then(fetchOrders).then(render).catch(showError)\` — one catch covers every step.`,
        explanationBn: `**মূল নিয়ম: \`.then()\` সবসময় একটা নতুন promise ফেরত দেয়।** সেই নতুন promise কী হবে, সেটা নির্ভর করে handler কী করে তার ওপর:

- **একটা value return করলে** → পরের \`.then\` সেই value পায়।
- **একটা promise return করলে** → chain সেই promise শেষ হওয়া পর্যন্ত **অপেক্ষা করে**, তারপর তার ফল পরের ধাপে যায়। এভাবেই async কাজ ক্রমানুসারে চলে।
- **Error throw করলে** → নতুন promise rejected।

**Error কীভাবে চলে:** rejection হলে chain-এর সামনের সব \`.then\` **এড়িয়ে যায়**, সরাসরি পরের \`.catch\`-এ পৌঁছায় — অনেকটা \`try/catch\`-এর মতো। তাই শেষে একটা \`.catch\` পুরো chain-এর error ধরে।

**\`.catch\`-এর পরে কী হয়?** \`.catch\` error "সামলে" দিলে chain আবার **সফল** অবস্থায় চলে। \`.catch\` যা return করে, পরের \`.then\` সেটা পায়। (Error আবার ছড়াতে চাইলে \`.catch\`-এর ভেতরে \`throw\` করুন।)

**\`.finally\`:** দুই ক্ষেত্রেই চলে, কোনো value পায় না, আর মূল ফলাফল অপরিবর্তিত রেখে পরের ধাপে পাঠিয়ে দেয়।

**সবচেয়ে common bug:** \`.then\`-এর ভেতরে promise তৈরি করে \`return\` করতে ভুলে যাওয়া — chain অপেক্ষা করে না, পরের ধাপ \`undefined\` পায়, আর ওই promise-এর error কেউ ধরে না।`,
        examples: [
          {
            lang: 'javascript',
            code: `Promise.resolve(1)
  .then((v) => v + 1)                                  // returns a value
  .then((v) => new Promise((r) => setTimeout(() => r(v * 10), 10)))  // returns a promise
  .then((v) => {
    console.log("value:", v);
    throw new Error("step failed");
  })
  .then(() => console.log("skipped"))                  // skipped by the rejection
  .catch((e) => {
    console.log("caught:", e.message);
    return "recovered";
  })
  .then((v) => console.log("after catch:", v))
  .finally(() => console.log("finally"));`,
            output: `value: 20
caught: step failed
after catch: recovered
finally`,
          },
          {
            lang: 'javascript',
            caption: 'The forgotten return',
            code: `const later = (v) => new Promise((r) => setTimeout(() => r(v), 10));

later("a")
  .then((v) => { later(v + "b"); })        // no return: the chain does not wait
  .then((v) => console.log("broken:", v));

later("a")
  .then((v) => later(v + "b"))             // returned: the chain waits
  .then((v) => console.log("fixed:", v));`,
            output: `broken: undefined
fixed: ab`,
          },
        ],
        pitfalls: [
          'Not returning a promise from `.then` breaks sequencing and loses its errors.',
          'A `.catch` in the middle of a chain turns the rest of the chain back into success.',
        ],
        followUps: ['How does error handling work with async/await?'],
      },
      visualizationId: 'js-promise-states',
      related: ['js-promise-basics', 'js-async-error-handling'],
    },
    {
      id: 'js-async-await',
      level: 'intermediate',
      priority: 2,
      question: 'How do `async` and `await` work?',
      tags: ['async-await', 'promises', 'microtasks'],
      answer: {
        interview: `**\`async\` functions always return a promise; \`await\` pauses the async function until a promise settles, then resumes it with the value (or throws the rejection).**

- \`return x\` in an async function fulfils its promise with \`x\`; \`throw\` rejects it.
- \`await\` only pauses **that function** — the caller and the event loop keep running. The rest of the function resumes as a microtask.
- Code before the first \`await\` runs synchronously when the function is called.
- \`await\` works on any value (non-promises are wrapped) and on "thenables".
- Top-level \`await\` works in ES modules (not in CommonJS scripts).
- It is syntax over promises — you can mix \`await\` with \`.then\`, \`Promise.all\`, etc.

Real-world: \`const user = await db.findUser(id)\` reads like synchronous code while the server keeps handling other requests.`,
        explanationBn: `\`async\`/\`await\` হলো promise-এর ওপরে তৈরি একটা সুন্দর syntax — async code কে synchronous code-এর মতো পড়া যায়।

**\`async\` function:**
- **সবসময় একটা promise ফেরত দেয়।** \`return 5\` লিখলেও caller পায় \`Promise<5>\`।
- ভেতরে \`throw\` করলে promise rejected হয়।

**\`await\`:**
- একটা promise শেষ হওয়া পর্যন্ত **শুধু এই function-টা** থামায় (pause)। বাকি program, event loop — সব চলতে থাকে। পুরো thread আটকায় না।
- Promise fulfilled হলে value দেয়; rejected হলে সেখানে exception **throw** করে — তাই সাধারণ \`try/catch\` দিয়ে ধরা যায়।

**কখন কী চলে — একটা সূক্ষ্ম কিন্তু গুরুত্বপূর্ণ বিষয়:**
- Function call করলে প্রথম \`await\` পর্যন্ত code **সাথে সাথে, synchronously** চলে।
- \`await\`-এ পৌঁছালে function থামে, control ফিরে যায় caller-এর কাছে।
- পরে promise শেষ হলে বাকি অংশ **microtask** হিসেবে আবার শুরু হয়।

এজন্যই output-order puzzle-এ \`async\` function-এর প্রথম লাইন আগে, আর \`await\`-এর পরের লাইন পরে print হয়।

ES module-এ function ছাড়াই top-level-এ \`await\` লেখা যায়; CommonJS-এ যায় না।`,
        examples: [
          {
            lang: 'javascript',
            code: `async function getNumber() {
  return 42;                         // wrapped in a promise
}
console.log(getNumber() instanceof Promise);

async function steps() {
  console.log("2: before await (synchronous)");
  const value = await getNumber();
  console.log("4: after await, value =", value);
  return "done";
}

console.log("1: calling steps");
steps().then((r) => console.log("5:", r));
console.log("3: caller continues");`,
            output: `true
1: calling steps
2: before await (synchronous)
3: caller continues
4: after await, value = 42
5: done`,
          },
        ],
        pitfalls: [
          'Forgetting `await` gives you a pending promise instead of the value (and unhandled rejections).',
          '`await` inside `forEach` does not pause the loop.',
          'Awaiting independent operations one by one makes them sequential and slow.',
        ],
        followUps: [
          'How do you handle errors with async/await?',
          'How do you run several awaits in parallel?',
        ],
      },
      visualizationId: 'js-event-loop',
      related: [
        'js-async-error-handling',
        'js-sequential-vs-parallel-await',
        'js-await-scheduling',
      ],
    },
    {
      id: 'js-async-error-handling',
      level: 'intermediate',
      priority: 2,
      question: 'How do you handle errors with async/await?',
      tags: ['async-await', 'error-handling', 'try-catch', 'promises'],
      answer: {
        interview: `**Wrap the \`await\` in \`try/catch\`: a rejected promise makes \`await\` throw, so ordinary exception handling works.**

- \`try { await x } catch (e) { ... } finally { ... }\` — \`finally\` is the place for cleanup (hide spinner, close connection).
- Alternatively attach \`.catch\` to the call: \`const user = await getUser().catch(() => null)\`.
- A \`try\` only catches what is **awaited** inside it — a promise created but not awaited (or returned without \`await\`) escapes.
- \`return await p\` inside \`try\` is needed if you want *this* \`catch\` to handle \`p\`'s rejection; plain \`return p\` hands the rejection to the caller.
- With \`Promise.all\`, one \`catch\` gets the first rejection; use \`allSettled\` to inspect each.
- Unhandled rejections crash Node (since v15) and log errors in browsers.

Real-world: an API route wraps its body in \`try/catch\` and maps errors to HTTP responses, so one failure never crashes the server.`,
        explanationBn: `\`await\`-এর সবচেয়ে বড় সুবিধা: rejected promise-কে \`await\` করলে সেটা সাধারণ **exception throw** করে। তাই error ধরতে সাধারণ \`try/catch\` — callback বা \`.catch\`-এর জটিলতা নেই।

\`\`\`js
try {
  const user = await getUser(id);
} catch (err) {
  // network error, 404, যা-ই হোক
} finally {
  hideSpinner();   // সফল বা ব্যর্থ — দুই ক্ষেত্রেই
}
\`\`\`

**তিনটা ফাঁদ, যেগুলো interview-তে ধরা হয়:**

**১. \`await\` ছাড়া promise:** \`try\`-এর ভেতরে promise তৈরি করলেন কিন্তু \`await\` করলেন না — সেটা পরে reject হলে \`try\` ততক্ষণে শেষ, তাই ধরতে পারে না। "Unhandled rejection"।

**২. \`return p\` বনাম \`return await p\`:** \`try\`-এর ভেতরে \`return fetchData()\` লিখলে promise সরাসরি caller-এর কাছে চলে যায় — তার rejection এই \`catch\`-এ আসবে না। এই \`catch\`-এ ধরতে চাইলে \`return await fetchData()\` লিখতে হয়। (\`try\` block-এর বাইরে দুটো প্রায় একই।)

**৩. \`forEach\`-এর ভেতরে await:** loop অপেক্ষা করে না, তাই error-ও বাইরের \`try\`-এ আসে না।

Node-এ (v15 থেকে) unhandled rejection পুরো process বন্ধ করে দেয় — তাই সব promise-এর error কোথাও না কোথাও ধরা জরুরি।`,
        examples: [
          {
            lang: 'javascript',
            code: `const failing = () => new Promise((_, rej) => setTimeout(() => rej(new Error("network down")), 10));

async function load() {
  try {
    await failing();
  } catch (e) {
    console.log("caught:", e.message);
  } finally {
    console.log("cleanup");
  }
}

async function returnsWithoutAwait() {
  try {
    return failing();            // the rejection escapes this try
  } catch {
    return "handled here";
  }
}

async function returnsWithAwait() {
  try {
    return await failing();      // the rejection is caught here
  } catch {
    return "handled here";
  }
}

(async () => {
  await load();
  console.log(await returnsWithAwait());
  console.log(await returnsWithoutAwait().catch((e) => "escaped to caller: " + e.message));
})();`,
            output: `caught: network down
cleanup
handled here
escaped to caller: network down`,
          },
        ],
        pitfalls: [
          '`return promise` inside `try` skips that `catch`; use `return await`.',
          'A promise that is never awaited or caught becomes an unhandled rejection.',
        ],
        followUps: ['What happens to unhandled promise rejections in Node?'],
      },
      related: ['js-async-await', 'js-promise-chaining', 'js-unhandled-rejections'],
    },
    {
      id: 'js-sequential-vs-parallel-await',
      level: 'intermediate',
      priority: 2,
      question: 'How do you run async operations sequentially vs in parallel with `await`?',
      tags: ['async-await', 'promise-all', 'performance', 'concurrency'],
      answer: {
        interview: `**Awaiting one call after another runs them sequentially — the second does not start until the first finishes. To run independent operations in parallel, start them all first, then await them together with \`Promise.all\` (or \`allSettled\`).**

- Sequential: \`const a = await getA(); const b = await getB();\` → time ≈ A + B. Correct when B depends on A.
- Parallel: \`const [a, b] = await Promise.all([getA(), getB()]);\` → time ≈ max(A, B).
- Over an array: \`await Promise.all(items.map(fetchItem))\` for parallel; \`for (const item of items) await fetchItem(item)\` for sequential.
- \`forEach\` with an async callback is neither — it does not wait at all.
- For many items, limit concurrency (batches, a pool, or a library like \`p-limit\`) to avoid overloading servers.

Real-world: a dashboard loading user, notifications and stats in sequence takes three round trips; with \`Promise.all\` it takes one.`,
        explanationBn: `\`await\` লেখার ধরন অনুযায়ী একই কাজ ধীর বা দ্রুত হতে পারে — এটা খুব বাস্তব performance প্রশ্ন।

**Sequential (একটার পর একটা):**
\`\`\`js
const user = await getUser();      // ২০০ms
const stats = await getStats();    // ২০০ms → মোট ৪০০ms
\`\`\`
দ্বিতীয় request শুরুই হয় প্রথমটা শেষ হলে। দ্বিতীয়টা যদি প্রথমটার ফলাফলের ওপর নির্ভর করে (যেমন user-এর id লাগে), তাহলে এটাই সঠিক।

**Parallel (একসাথে):**
\`\`\`js
const [user, stats] = await Promise.all([getUser(), getStats()]); // মোট ~২০০ms
\`\`\`
দুটো request একসাথে শুরু হয়, \`Promise.all\` দুটোর জন্য অপেক্ষা করে। মোট সময় সবচেয়ে ধীরটার সমান।

**মূল কৌশল:** promise **তৈরি** করা মানেই কাজ শুরু। তাই আগে সবগুলো তৈরি করুন, পরে একসাথে await করুন।

**Array-র ক্ষেত্রে:**
- Parallel: \`await Promise.all(ids.map(fetchItem))\`
- Sequential: \`for (const id of ids) await fetchItem(id)\`
- **\`forEach(async ...)\` — কোনোটাই না!** কারো জন্য অপেক্ষা করে না।

**সতর্কতা:** ১০,০০০ item একসাথে parallel-এ পাঠালে server ভেঙে পড়তে পারে বা rate limit-এ পড়বেন। তখন একসাথে সর্বোচ্চ ৫-১০টা — concurrency limit।`,
        examples: [
          {
            lang: 'javascript',
            code: `const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const time = async (label, fn) => {
  const start = Date.now();
  const result = await fn();
  const ms = Date.now() - start;
  console.log(label, result, ms >= 190 ? "~200ms" : "~100ms");
};

(async () => {
  await time("sequential:", async () => {
    const a = await wait(100, "a");
    const b = await wait(100, "b");
    return a + b;
  });
  await time("parallel:  ", async () => {
    const [a, b] = await Promise.all([wait(100, "a"), wait(100, "b")]);
    return a + b;
  });
})();`,
            output: `sequential: ab ~200ms
parallel:   ab ~100ms`,
          },
        ],
        pitfalls: [
          'Independent `await`s written one after another waste time.',
          '`Promise.all` fails fast: one rejection rejects the whole batch.',
          'Unbounded parallelism over large arrays can overload a server or hit rate limits.',
        ],
        followUps: ['How would you limit concurrency to 5 requests at a time?'],
      },
      related: ['js-promise-combinators', 'js-async-await', 'js-map-vs-foreach'],
    },
    {
      id: 'js-event-loop-puzzles',
      level: 'intermediate',
      priority: 2,
      question:
        'Predict the output order:\n\n```javascript\nconsole.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nqueueMicrotask(() => console.log("D"));\n(async () => {\n  console.log("E");\n  await null;\n  console.log("F");\n})();\nnew Promise((resolve) => {\n  console.log("G");\n  resolve();\n}).then(() => console.log("H"));\nconsole.log("I");\n```',
      tags: ['event-loop', 'output-prediction', 'microtasks', 'async-await'],
      answer: {
        interview: `**Output: \`A E G I C D F H B\`.**

Step by step:
1. **Synchronous code first, top to bottom:** \`A\`; the \`setTimeout\` callback is queued as a macrotask; the \`.then\` (\`C\`) and \`queueMicrotask\` (\`D\`) go to the microtask queue.
2. The async IIFE runs synchronously until its first \`await\`: prints \`E\`; \`await null\` queues the rest (\`F\`) as a microtask.
3. A **Promise executor runs synchronously**: prints \`G\`, resolves, and queues \`H\` as a microtask.
4. \`I\` prints. The script ends; the call stack is empty.
5. **Microtasks drain in FIFO order:** \`C\`, \`D\`, \`F\`, \`H\`.
6. Finally the **macrotask**: \`B\`.

Rules to remember: sync code → all microtasks (in queue order) → one macrotask; executors and code before the first \`await\` are synchronous.`,
        explanationBn: `এই ধরনের puzzle সমাধানের পদ্ধতি সবসময় একই — তিনটা কলাম আঁকুন: **Console**, **Microtask queue**, **Macrotask queue**, তারপর code লাইন ধরে ধরে চালান।

**ধাপ ১ — Synchronous অংশ (উপর থেকে নিচে):**
- \`console.log("A")\` → **A**
- \`setTimeout\` → callback (B) যায় **macrotask** queue-তে।
- \`Promise.resolve().then\` → C যায় **microtask** queue-তে। Queue: [C]
- \`queueMicrotask\` → D যায় microtask-এ। Queue: [C, D]
- Async IIFE call হয় — প্রথম \`await\` পর্যন্ত synchronous: **E** print হয়। \`await null\`-এ থামে, বাকি অংশ (F) microtask-এ। Queue: [C, D, F]
- \`new Promise\`-এর executor **synchronous** — এটা অনেকে ভুল করেন: **G** সাথে সাথে print। \`resolve()\` হয়, \`.then\` (H) microtask-এ। Queue: [C, D, F, H]
- \`console.log("I")\` → **I**

**ধাপ ২ — Stack খালি, সব microtask ক্রমানুসারে (FIFO):** **C, D, F, H**

**ধাপ ৩ — একটা macrotask:** **B**

ফলাফল: **A E G I C D F H B**

মুখস্থ রাখার তিনটা নিয়ম:
1. Synchronous code সবার আগে — Promise executor আর \`await\`-এর আগের অংশও এর মধ্যে।
2. তারপর **সব** microtask, যে ক্রমে queue হয়েছে।
3. তারপর macrotask।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'The code from the question',
            code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
queueMicrotask(() => console.log("D"));
(async () => {
  console.log("E");
  await null;
  console.log("F");
})();
new Promise((resolve) => {
  console.log("G");
  resolve();
}).then(() => console.log("H"));
console.log("I");`,
            output: `A
E
G
I
C
D
F
H
B`,
          },
        ],
        pitfalls: [
          'The Promise executor function runs synchronously.',
          'Code before the first `await` in an async function runs synchronously.',
        ],
        followUps: [
          'What changes if `await null` becomes `await new Promise(r => setTimeout(r, 0))`?',
        ],
      },
      visualizationId: 'js-event-loop',
      related: ['js-microtask-vs-macrotask', 'js-event-loop'],
    },
    {
      id: 'js-promisify',
      level: 'intermediate',
      priority: 1,
      question: 'How do you convert a callback-based API into a promise-based one?',
      tags: ['promises', 'promisify', 'callbacks', 'node'],
      answer: {
        interview: `**Wrap the call in \`new Promise\` and resolve or reject from the callback. For Node-style \`(err, result)\` callbacks, \`util.promisify\` does it for you.**

- Manual: \`const read = (p) => new Promise((resolve, reject) => fs.readFile(p, (err, data) => err ? reject(err) : resolve(data)))\`.
- \`util.promisify(fn)\` works for any function whose last argument is a Node-style callback.
- Many Node modules ship promise versions: \`fs/promises\`, \`timers/promises\`, \`stream/promises\`.
- Generic promisify: return \`(...args) => new Promise((res, rej) => fn(...args, (err, v) => err ? rej(err) : res(v)))\`.
- Be careful with methods: bind \`this\` (\`promisify(obj.method).bind(obj)\` or \`promisify(obj.method.bind(obj))\`).

Real-world: wrapping \`setTimeout\` as \`const sleep = (ms) => new Promise(r => setTimeout(r, ms))\` is the most common promisify of all.`,
        explanationBn: `অনেক পুরনো API (Node-এর পুরনো \`fs\`, অনেক library) callback দিয়ে কাজ করে। এগুলোকে \`await\` দিয়ে ব্যবহার করতে চাইলে promise-এ রূপান্তর (promisify) করতে হয়।

**হাতে করা:** \`new Promise\`-এর ভেতরে মূল function call করুন, আর তার callback থেকে \`resolve\` বা \`reject\` ডাকুন:
\`\`\`js
const readFileP = (path) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => (err ? reject(err) : resolve(data)));
  });
\`\`\`

**Node-এর নিয়ম ("error-first callback"):** callback-এর প্রথম argument error, দ্বিতীয়টা ফলাফল। এই নিয়ম মানলে \`util.promisify(fn)\` এক লাইনে কাজটা করে দেয়।

**সবচেয়ে বেশি ব্যবহৃত promisify:** \`sleep\`
\`\`\`js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(1000);
\`\`\`

একটা সতর্কতা: object-এর method promisify করলে \`this\` হারিয়ে যায় (detached method) — \`bind\` করে নিন।`,
        examples: [
          {
            lang: 'javascript',
            code: `const { promisify } = require("node:util");

function legacyDivide(a, b, callback) {
  setTimeout(() => {
    if (b === 0) callback(new Error("division by zero"));
    else callback(null, a / b);
  }, 10);
}

const divideManual = (a, b) =>
  new Promise((resolve, reject) =>
    legacyDivide(a, b, (err, value) => (err ? reject(err) : resolve(value))),
  );
const divideAuto = promisify(legacyDivide);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log(await divideManual(10, 2), await divideAuto(9, 3));
  await sleep(20);
  try {
    await divideAuto(1, 0);
  } catch (e) {
    console.log("rejected:", e.message);
  }
})();`,
            output: `5 3
rejected: division by zero`,
          },
        ],
        followUps: ['What is an error-first callback?'],
      },
      related: ['js-callback-hell', 'js-promise-basics'],
    },
    {
      id: 'js-promise-executor-sync',
      level: 'intermediate',
      priority: 1,
      question:
        'Is the function passed to `new Promise()` run synchronously or asynchronously? What happens if it throws?',
      tags: ['promises', 'executor', 'event-loop'],
      answer: {
        interview: `**The executor runs synchronously, immediately, during \`new Promise(...)\`. Only the \`.then\`/\`.catch\` handlers are asynchronous.**

- So \`new Promise(r => { console.log("x"); r(); })\` logs \`x\` before the next line of the caller.
- If the executor **throws synchronously**, the promise is rejected with that error (it does not escape as an exception).
- But an error thrown **later inside an async callback** in the executor (e.g. inside a \`setTimeout\`) is *not* caught — it becomes an uncaught exception; call \`reject\` explicitly there.
- Wrapping already-synchronous code in \`new Promise\` does not make it non-blocking.

Real-world: "promisifying" a heavy calculation with \`new Promise\` still freezes the page — it runs synchronously in the executor.`,
        explanationBn: `অনেকে ভাবেন \`new Promise(...)\`-এর ভেতরের code "পরে" চলে। আসলে **executor function সাথে সাথে, synchronously চলে** — \`new Promise\` লাইনেই। শুধু \`.then\`/\`.catch\`-এর handler গুলো পরে (microtask হিসেবে) চলে।

**Error-এর দুটো ভিন্ন ক্ষেত্র:**
- Executor-এর ভেতরে **সরাসরি** \`throw\` করলে → Promise নিজে থেকে rejected হয়ে যায়। \`.catch\` দিয়ে ধরা যায়।
- কিন্তু executor-এর ভেতরে একটা \`setTimeout\` callback-এ throw করলে → সেটা Promise-এর নিয়ন্ত্রণের বাইরে, কারণ executor ততক্ষণে শেষ। Uncaught exception — program crash। তাই async callback-এর ভেতরে সবসময় নিজে \`reject(err)\` ডাকতে হয়।

**একটা প্রচলিত ভুল ধারণা:** ভারী হিসাব \`new Promise\`-এ মুড়ে দিলে সেটা "async" হয়ে যাবে, page জমবে না — ভুল! Executor synchronous, তাই হিসাবটা ঠিক আগের মতোই thread আটকে রাখে। Promise শুধু **ফলাফল** পরে জানানোর একটা মোড়ক; কাজটাকে অন্য thread-এ পাঠায় না। সত্যিকারের পৃথক thread লাগলে Web Worker।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log("1");
const p = new Promise((resolve) => {
  console.log("2: executor runs immediately");
  resolve("4: handler runs later");
});
p.then(console.log);
console.log("3");

new Promise(() => {
  throw new Error("thrown in executor");
}).catch((e) => console.log("5: becomes a rejection:", e.message));`,
            output: `1
2: executor runs immediately
3
4: handler runs later
5: becomes a rejection: thrown in executor`,
          },
        ],
        followUps: ['Does wrapping a CPU-heavy function in a Promise stop it from blocking?'],
      },
      related: ['js-promise-basics', 'js-event-loop-puzzles'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'js-await-scheduling',
      level: 'advanced',
      priority: 2,
      question:
        'How is `await` scheduled? Why can `return await` and an extra `.then` change output order?',
      tags: ['async-await', 'microtasks', 'event-loop', 'output-prediction'],
      answer: {
        interview: `**Every \`await\` suspends the function and resumes it in a later microtask. Awaiting a native promise takes one microtask "tick"; resolving a promise *with* another promise (or a thenable) costs extra ticks, because the engine must call its \`then\`.**

- \`await nonPromise\` and \`await nativePromise\` both resume after one tick (since the 2019 spec optimisation).
- An async function's returned promise settles one tick after its body finishes.
- Returning a promise from an async function (\`return p\`) or from a \`.then\` adds **two** extra ticks before the outer promise settles.
- So in puzzles, two chains started together interleave tick by tick, and the one with more "hops" finishes later.
- This is only about *ordering among microtasks*; all of it still runs before the next macrotask.

Real-world: you rarely need this precision, but it explains "impossible" orderings in tests and why \`return await\` inside \`try\` is correct for error handling.`,
        explanationBn: `এটা গভীর একটা প্রশ্ন — senior interview-তে মাঝে মাঝে আসে। মূল ধারণা: **প্রতিটা \`await\` আর প্রতিটা promise "লাফ" এক বা একাধিক microtask "tick" খরচ করে**, আর দুটো chain একসাথে চললে তারা tick ধরে ধরে পালা করে এগোয়।

**নিয়মগুলো:**
- \`await\` (promise হোক বা সাধারণ value) → function থামে, বাকি অংশ **এক tick** পরে আবার চলে।
- একটা async function-এর body শেষ হওয়ার পর তার ফেরত দেওয়া promise settle হতে আরও এক tick।
- কোনো promise-কে **আরেকটা promise দিয়ে resolve** করলে (যেমন async function থেকে \`return somePromise\`, বা \`.then\`-এর ভেতরে promise return) — engine-কে ভেতরের promise-এর \`then\` ডেকে অপেক্ষা করতে হয়, তাই **অতিরিক্ত দুই tick**।

**এর ফলে:** দুটো chain একসাথে শুরু হলে, যার পথে "লাফ" বেশি সে পরে শেষ হয় — যদিও কোনোটাতেই কোনো timer নেই।

**বাস্তবে কি এটা মুখস্থ লাগে?** সাধারণত না — microtask-দের নিজেদের মধ্যে সূক্ষ্ম ক্রমের ওপর নির্ভর করে code লেখা উচিত না। কিন্তু test-এ অদ্ভুত ক্রম দেখলে এটা ব্যাখ্যা করে। আর মনে রাখুন: এই সব tick মিলেও পরের macrotask-এর (\`setTimeout\`) **আগেই** শেষ হয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `async function returnsValue() { return "v"; }
async function returnsPromise() { return Promise.resolve("p"); }   // extra ticks

returnsPromise().then(() => console.log("returned a promise"));
returnsValue().then(() => console.log("returned a value"));

Promise.resolve()
  .then(() => console.log("tick 1"))
  .then(() => console.log("tick 2"))
  .then(() => console.log("tick 3"))
  .then(() => console.log("tick 4"));

setTimeout(() => console.log("macrotask after all of them"), 0);`,
            output: `returned a value
tick 1
tick 2
returned a promise
tick 3
tick 4
macrotask after all of them`,
          },
        ],
        followUps: ['Why is `return await` recommended inside `try` blocks?'],
      },
      visualizationId: 'js-event-loop',
      related: ['js-microtask-vs-macrotask', 'js-async-await'],
    },
    {
      id: 'js-unhandled-rejections',
      level: 'advanced',
      priority: 1,
      question: 'What is an unhandled promise rejection, and how do you deal with it?',
      tags: ['promises', 'error-handling', 'node', 'unhandledrejection'],
      answer: {
        interview: `**A rejection is "unhandled" if no rejection handler is attached by the time the microtask queue drains after the rejection.**

- Node.js (v15+) terminates the process on an unhandled rejection by default; browsers log an error and fire the \`unhandledrejection\` event.
- Common causes: a missing \`.catch\`, forgetting \`await\`, \`async\` callbacks in \`forEach\`/event handlers, fire-and-forget calls.
- Global hooks for logging: \`process.on("unhandledRejection", ...)\` in Node, \`window.addEventListener("unhandledrejection", ...)\` in browsers — use them for reporting, not as a substitute for real handling.
- Attaching a handler later fires \`rejectionhandled\`; the warning was still emitted.
- Fire-and-forget calls should end with \`.catch(logError)\`.

Real-world: a background \`sendAnalytics()\` without \`.catch\` crashing a production Node server is a classic incident.`,
        explanationBn: `কোনো promise reject হলো, কিন্তু কেউ তার error ধরল না (\`.catch\` বা \`await\` + \`try/catch\` নেই) — এটাই **unhandled rejection**।

**পরিণতি:**
- **Node.js (v15 থেকে):** পুরো process বন্ধ হয়ে যায়! একটা ছোট background কাজের ব্যর্থতায় পুরো server পড়ে যেতে পারে।
- **Browser:** console-এ error আসে আর \`unhandledrejection\` event fire হয়, page চলতে থাকে।

**সাধারণ কারণ:**
- \`.catch\` ভুলে যাওয়া।
- \`await\` ভুলে যাওয়া — promise তৈরি হলো কিন্তু কেউ তার দিকে তাকাল না।
- \`forEach(async ...)\` বা event handler-এর ভেতরে async function — তাদের promise কেউ ধরে না।
- "Fire-and-forget" call — যেমন \`sendAnalytics()\` — ফলাফলের দরকার নেই বলে \`await\` করা হয়নি।

**সমাধান:**
- Fire-and-forget call-এর শেষে সবসময় \`.catch(logError)\`।
- Global hook (\`process.on("unhandledRejection")\`) রাখুন **log/report করার জন্য** — কিন্তু এটা আসল error handling-এর বিকল্প না।`,
        examples: [
          {
            lang: 'javascript',
            code: `process.on("unhandledRejection", (reason) => {
  console.log("global hook saw:", reason.message);
});

async function sendAnalytics() {
  throw new Error("analytics endpoint down");
}

sendAnalytics();                                        // fire-and-forget, unhandled
sendAnalytics().catch((e) => console.log("handled:", e.message));  // the right way`,
            output: `handled: analytics endpoint down
global hook saw: analytics endpoint down`,
          },
        ],
        followUps: ['Why does Node crash on unhandled rejections now?'],
      },
      related: ['js-async-error-handling'],
    },
    {
      id: 'js-abort-timeouts',
      level: 'advanced',
      priority: 1,
      question: 'How do you add a timeout to an async operation or cancel it?',
      tags: ['promises', 'abortcontroller', 'timeouts', 'cancellation', 'fetch'],
      answer: {
        interview: `**Promises cannot be cancelled by themselves. Use \`AbortController\`: pass its \`signal\` to the operation, and call \`abort()\` (or use \`AbortSignal.timeout(ms)\`) to stop it.**

- \`fetch(url, { signal: AbortSignal.timeout(5000) })\` rejects with a \`TimeoutError\` after 5 s and actually cancels the request.
- \`controller.abort()\` rejects with an \`AbortError\` — e.g. when the user navigates away or types a new search.
- \`Promise.race([work, timeoutPromise])\` gives a timeout for anything, but the losing operation keeps running.
- Your own async functions can support cancellation by checking \`signal.aborted\` / listening for the \`abort\` event.
- The same signal can remove event listeners: \`addEventListener(type, fn, { signal })\`.

Real-world: search-as-you-type aborts the previous request on every keystroke so stale results never overwrite new ones.`,
        explanationBn: `Promise-এর একটা সীমাবদ্ধতা: একবার শুরু হলে নিজে থেকে **থামানোর কোনো উপায় নেই**। কিন্তু বাস্তবে দরকার হয়:
- Request ৫ সেকেন্ডের বেশি নিলে বাতিল (timeout)।
- User নতুন কিছু খুঁজলে আগের search request বাতিল।
- User page ছেড়ে গেলে চলমান কাজ বাতিল।

**সমাধান — \`AbortController\`:**
\`\`\`js
const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort();   // request সত্যিই বাতিল, promise reject হয় AbortError দিয়ে
\`\`\`
Timeout-এর জন্য আরও সহজ: \`AbortSignal.timeout(5000)\` — নিজেই ৫ সেকেন্ড পর abort করে।

**\`Promise.race\` দিয়ে timeout:** যেকোনো promise-এর সাথে কাজ করে, কিন্তু একটা বড় পার্থক্য — race শুধু **আপনার অপেক্ষা** বন্ধ করে; আসল কাজটা পেছনে চলতেই থাকে (network bandwidth, server resource খরচ হয়)। \`AbortController\` সত্যিই কাজটা থামায়।

নিজের async function-কে cancel-যোগ্য বানাতে \`signal\` parameter নিন, আর মাঝে মাঝে \`signal.aborted\` চেক করুন।

**Search-as-you-type:** প্রতিটা keystroke-এ আগের request abort করলে, পুরনো (ধীরে আসা) result নতুন result-কে overwrite করতে পারে না — একটা বিখ্যাত race condition bug এড়ানো যায়।`,
        examples: [
          {
            lang: 'javascript',
            code: `function slowTask(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => resolve("finished"), ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);                       // actually stop the work
      reject(signal.reason);
    });
  });
}

(async () => {
  try {
    await slowTask(500, { signal: AbortSignal.timeout(50) });
  } catch (e) {
    console.log("timed out:", e.name);
  }

  const controller = new AbortController();
  const pending = slowTask(500, { signal: controller.signal });
  controller.abort();
  try {
    await pending;
  } catch (e) {
    console.log("cancelled:", e.name);
  }

  console.log(await slowTask(10));
})();`,
            output: `timed out: TimeoutError
cancelled: AbortError
finished`,
          },
        ],
        pitfalls: ['`Promise.race` timeouts do not stop the underlying work.'],
        followUps: ['How would you cancel stale requests in a search box?'],
      },
      related: ['js-promise-combinators', 'js-debounce-vs-throttle'],
    },
  ],
});

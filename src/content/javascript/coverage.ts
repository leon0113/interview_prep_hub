import type { Coverage, Level, Priority, QuickConcept } from '../schema';

function concept(c: {
  id: string;
  question: string;
  level: Level;
  priority?: Priority;
  tags: string[];
  interview: string;
  bn: string;
  example?: { code: string; output: string };
  related?: string[];
}): QuickConcept {
  return {
    id: c.id,
    sectionId: 'js-coverage',
    level: c.level,
    priority: c.priority ?? 1,
    question: c.question,
    tags: c.tags,
    answer: {
      interview: c.interview,
      explanationBn: c.bn,
      examples: c.example ? [{ lang: 'javascript', ...c.example }] : undefined,
    },
    related: c.related,
  };
}

export const coverage: Coverage = {
  quickConcepts: [
    concept({
      id: 'js-qc-global-this',
      question: 'What is `globalThis`?',
      level: 'foundation',
      tags: ['global-object', 'es2020'],
      interview:
        'A standard (ES2020) way to reach the global object in any environment — `window` in browsers, `self` in workers, `global` in Node.js — so cross-platform code no longer needs to feature-detect which one exists.',
      bn: 'আগে browser-এ `window`, worker-এ `self` আর Node-এ `global` লিখতে হতো; `globalThis` সব জায়গায় একই নামে global object দেয়।',
      example: {
        code: `globalThis.appVersion = "1.0";
console.log(appVersion, typeof globalThis);`,
        output: `1.0 object`,
      },
    }),
    concept({
      id: 'js-qc-iterator-protocol',
      question: 'What are the iterable and iterator protocols?',
      level: 'intermediate',
      priority: 2,
      tags: ['iterators', 'symbol-iterator', 'for-of'],
      interview:
        'An object is **iterable** if it has a `[Symbol.iterator]()` method that returns an **iterator** — an object with `next()` returning `{ value, done }`. `for...of`, spread, destructuring, `Array.from` and `Promise.all` all use this protocol, which is why they work on arrays, strings, Maps, Sets and your own objects.',
      bn: '`for...of` আসলে জানে না সে array নাকি Map-এর ওপর ঘুরছে — সে শুধু `[Symbol.iterator]()` ডাকে আর `done: true` না হওয়া পর্যন্ত `next()` ডাকতে থাকে। এই চুক্তি মানলে নিজের object-ও `for...of` আর spread-এ কাজ করে।',
      example: {
        code: `const range = {
  from: 1,
  to: 4,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return { next: () => ({ value: current, done: current++ > last }) };
  },
};
console.log([...range], Math.max(...range));`,
        output: `[ 1, 2, 3, 4 ] 4`,
      },
    }),
    concept({
      id: 'js-qc-generators',
      question: 'What are generator functions?',
      level: 'intermediate',
      priority: 2,
      tags: ['generators', 'yield', 'iterators', 'lazy-evaluation'],
      interview:
        '`function*` returns a generator object that is both an iterator and iterable. Each `yield` pauses the function and hands out a value; `next()` resumes it. They make writing iterators trivial, allow lazy (even infinite) sequences, and `next(value)` can send data back in.',
      bn: 'সাধারণ function একবার চালু হলে শেষ পর্যন্ত চলে। Generator `yield`-এ **থেমে** থাকে, নিজের local state মনে রেখে — পরের `next()`-এ ঠিক সেখান থেকে আবার চলে। তাই অসীম sequence-ও বানানো যায়, কারণ value তৈরি হয় যখন চাওয়া হয় তখন।',
      example: {
        code: `function* ids(prefix) {
  let n = 1;
  while (true) yield prefix + n++;
}
const gen = ids("user-");
console.log(gen.next().value, gen.next().value);
console.log(gen.next());`,
        output: `user-1 user-2
{ value: 'user-3', done: false }`,
      },
    }),
    concept({
      id: 'js-qc-symbol',
      question: 'What is a `Symbol`?',
      level: 'intermediate',
      tags: ['symbol', 'primitives', 'well-known-symbols'],
      interview:
        'A primitive whose every value is unique: `Symbol("id") !== Symbol("id")`. Symbol keys never clash with string keys and are skipped by `for...in`, `Object.keys` and `JSON.stringify`. **Well-known symbols** such as `Symbol.iterator` and `Symbol.toPrimitive` let you hook into built-in language behaviour.',
      bn: 'Symbol হলো এমন একটা key যেটা অন্য কেউ ভুল করেও বানাতে পারবে না — তাই library নিজের লুকানো property object-এ বসাতে পারে, user-এর key-র সাথে সংঘর্ষ ছাড়াই। Description শুধু debug-এর জন্য, uniqueness-এ কোনো প্রভাব নেই।',
      example: {
        code: `const id = Symbol("id");
const user = { name: "Rafi", [id]: 42 };
console.log(Symbol("id") === Symbol("id"), user[id]);
console.log(Object.keys(user), JSON.stringify(user));`,
        output: `false 42
[ 'name' ] {"name":"Rafi"}`,
      },
    }),
    concept({
      id: 'js-qc-proxy-reflect',
      question: 'What are `Proxy` and `Reflect`?',
      level: 'advanced',
      tags: ['proxy', 'reflect', 'metaprogramming'],
      interview:
        'A `Proxy` wraps an object and intercepts operations — `get`, `set`, `has`, `deleteProperty` and more — through **trap** functions. `Reflect` provides the default behaviour of each operation as a function, so traps usually end with `Reflect.get(...)` / `Reflect.set(...)`. Real uses: validation, logging, default values, and reactivity systems such as Vue 3.',
      bn: 'Proxy হলো object-এর সামনে বসানো একজন দারোয়ান — কেউ property পড়তে বা লিখতে এলে আগে trap চলে, তারপর চাইলে আসল object-এ পাঠায়। `Reflect` সেই "আসল কাজটা" করার standard উপায়।',
      example: {
        code: `const user = new Proxy({ age: 30 }, {
  set(target, key, value) {
    if (key === "age" && !Number.isInteger(value)) throw new TypeError("age must be an integer");
    return Reflect.set(target, key, value);
  },
  get: (target, key) => Reflect.get(target, key) ?? "n/a",
});
user.age = 31;
console.log(user.age, user.email);
try { user.age = "old"; } catch (e) { console.log(e.message); }`,
        output: `31 n/a
age must be an integer`,
      },
    }),
    concept({
      id: 'js-qc-weakmap-weakset',
      question: 'What are `WeakMap` and `WeakSet`?',
      level: 'intermediate',
      tags: ['weakmap', 'weakset', 'garbage-collection', 'memory'],
      interview:
        'Collections whose keys must be objects (or non-registered symbols) and are held **weakly**: if nothing else references a key, it can be garbage-collected and its entry disappears. Because entries can vanish at any time, they are not iterable and have no `size`. Use them for caches and private data attached to objects you do not own.',
      bn: 'সাধারণ `Map`-এ object key রাখলে Map নিজেই সেটাকে বাঁচিয়ে রাখে — memory leak। `WeakMap` key-কে "দুর্বলভাবে" ধরে: অন্য কোথাও reference না থাকলে GC object আর entry দুটোই সরিয়ে দেয়। তাই iterate করা যায় না — কখন কী থাকবে নিশ্চিত না।',
      example: {
        code: `const visits = new WeakMap();
function track(user) {
  visits.set(user, (visits.get(user) ?? 0) + 1);
}
let rafi = { name: "Rafi" };
track(rafi);
track(rafi);
console.log(visits.get(rafi), visits.has({ name: "Rafi" }));
try { visits.set("key", 1); } catch (e) { console.log(e.name); }`,
        output: `2 false
TypeError`,
      },
    }),
    concept({
      id: 'js-qc-garbage-collection',
      question: 'How does garbage collection work in JavaScript?',
      level: 'advanced',
      priority: 2,
      tags: ['garbage-collection', 'memory', 'mark-and-sweep', 'memory-leaks'],
      interview:
        'Engines use **reachability**: starting from roots (globals, the current call stack, closures in use), the collector **marks** everything it can reach and **sweeps** the rest. Cycles are not a problem, unlike reference counting. Modern engines like V8 are generational (most objects die young) and incremental. Leaks happen when objects stay reachable by mistake: forgotten timers and listeners, growing caches, global variables, closures holding large data.',
      bn: 'GC প্রশ্ন করে "এই object-এ কি root থেকে পৌঁছানো যায়?" — যায় না মানে কেউ আর ব্যবহার করতে পারবে না, তাই মুছে ফেলা নিরাপদ। দুটো object একে অপরকে ধরে রাখলেও (cycle), root থেকে পৌঁছানো না গেলে দুটোই মুছে যায়। তাই JS-এ memory leak মানে আসলে "ভুল করে reachable রেখে দেওয়া" — যেমন সরাতে ভুলে যাওয়া event listener বা `setInterval`।',
    }),
    concept({
      id: 'js-qc-tagged-templates',
      question: 'What are tagged template literals?',
      level: 'intermediate',
      tags: ['template-literals', 'tagged-templates', 'strings'],
      interview:
        'Writing a function name before a template literal — ``tag`Hello ${name}` `` — calls the function with the array of literal string parts and then the interpolated values. The tag can return anything. Used for escaping (HTML, SQL), i18n, and DSLs like styled-components’ ``css`...` `` and GraphQL’s ``gql`...` ``.',
      bn: 'Tag function string-কে সরাসরি জোড়া লাগানোর আগে টুকরো গুলো আর value গুলো আলাদা করে হাতে পায় — তাই value-কে নিরাপদ (escape) করে তারপর জোড়া দিতে পারে। styled-components বা `gql` ঠিক এভাবে কাজ করে।',
      example: {
        code: `function escapeHtml(strings, ...values) {
  const safe = (v) => String(v).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return strings.reduce((out, str, i) => out + str + (i < values.length ? safe(values[i]) : ""), "");
}
const comment = "<script>alert(1)</script>";
console.log(escapeHtml\`<p>\${comment}</p>\`);`,
        output: `<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>`,
      },
    }),
    concept({
      id: 'js-qc-define-property',
      question: 'What does `Object.defineProperty` do?',
      level: 'intermediate',
      tags: ['objects', 'property-descriptors', 'getters-setters'],
      interview:
        'It creates or changes a property with an explicit **descriptor**: `value`, `writable`, `enumerable`, `configurable` — or `get`/`set` accessors. Flags default to `false` when you use it, unlike normal assignment. `Object.freeze` and non-enumerable built-in methods are built on the same descriptor mechanism.',
      bn: 'সাধারণ `obj.x = 1` লিখলে property writable, enumerable, configurable — সব `true`। `defineProperty` দিয়ে প্রতিটা flag নিজে ঠিক করা যায় — read-only বা লুকানো (non-enumerable) property বানানো যায়। খেয়াল করুন: এখানে না বললে সব flag `false`।',
      example: {
        code: `const config = {};
Object.defineProperty(config, "apiUrl", { value: "https://api.example.com", enumerable: true });
Object.defineProperty(config, "secret", { value: "s3cr3t" });
config.apiUrl = "changed";   // silently ignored (throws in strict mode)
console.log(config.apiUrl, Object.keys(config), config.secret);`,
        output: `https://api.example.com [ 'apiUrl' ] s3cr3t`,
      },
    }),
  ],
  notCovered: [
    {
      topic: 'V8 internals (hidden classes, inline caching, JIT tiers)',
      reason: 'Interesting, but almost never asked outside performance-specialist roles.',
    },
    {
      topic: 'Version-by-version lists of ES features',
      reason:
        'Interviewers ask how features work, not which year added them; the relevant ones are covered in context.',
    },
    {
      topic: 'The `with` statement and other deprecated syntax',
      reason: 'Forbidden in strict mode and modules; you will only meet it as trivia.',
    },
    {
      topic: 'Bitwise tricks (`~~x`, `x | 0`, bit flags)',
      reason:
        'Rare in day-to-day JavaScript and in language interviews; algorithm rounds cover them separately.',
    },
    {
      topic: 'Web Workers, SharedArrayBuffer and Atomics',
      reason:
        'Specialised concurrency topics; mention that workers exist for CPU-heavy work, but deep questions are uncommon.',
    },
    {
      topic: 'DOM manipulation and browser APIs in depth',
      reason: 'Planned for a separate Frontend track; this track is about the language.',
    },
    {
      topic: 'React and other frameworks',
      reason: 'Each will get its own track (React, Next.js, Node.js are planned).',
    },
  ],
  studyTips: [
    'For every output-order puzzle, write down the call stack, the microtask queue and the task queue before answering.',
    'Be able to implement debounce, throttle, `once`, `memoize`, a `bind` polyfill and `Promise.all` from memory — they come up constantly.',
    'When asked about `this`, walk through the four binding rules in order: `new`, explicit (`call`/`apply`/`bind`), implicit (method call), default — and remember arrows skip them all.',
    'Run every snippet you are unsure about in Node or the browser console; predicting output and then checking builds intuition fast.',
    'Explain closures with a concrete use (private counter, debounce, memoize) rather than a definition alone.',
    'Know the difference between what the language specifies and what the host provides: `setTimeout`, `fetch` and the DOM are not part of ECMAScript.',
  ],
};

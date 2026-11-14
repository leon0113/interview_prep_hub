import { defineSection } from '../../define';

export const objectsArrays = defineSection({
  id: 'js-objects-arrays',
  title: 'Objects & Arrays',
  description:
    'Creating and copying objects, the array methods every interview uses, mutating vs non-mutating operations, Map/Set, and JSON gotchas.',
  order: 6,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'js-array-iteration-methods',
      level: 'foundation',
      priority: 3,
      question:
        'Explain `map`, `filter`, `reduce`, `forEach`, `find`, `some`, `every` and `includes`.',
      tags: ['arrays', 'map', 'filter', 'reduce', 'higher-order-functions'],
      answer: {
        interview: `**They are the core array methods; each takes a callback \`(element, index, array)\` (except \`includes\`) and none of them mutates the original array.**

| Method | Returns | Use it to |
|---|---|---|
| \`map\` | new array, same length | transform every item |
| \`filter\` | new array, ≤ length | keep items that pass a test |
| \`reduce\` | any single value | combine items (sum, group, count) |
| \`forEach\` | \`undefined\` | run a side effect per item |
| \`find\` / \`findIndex\` | first match / its index (\`undefined\` / \`-1\`) | look up one item |
| \`some\` | boolean | is **any** item a match? (stops early) |
| \`every\` | boolean | are **all** items a match? (stops early) |
| \`includes\` | boolean | is this exact value present? (\`NaN\`-safe) |

- They chain: \`orders.filter(o => o.paid).map(o => o.total).reduce((a, b) => a + b, 0)\`.
- Always give \`reduce\` an initial value — without it, an empty array throws.
- \`forEach\` cannot be stopped with \`break\`; use \`for...of\`, \`some\` or \`find\` when you need to stop early.
- Edge cases: \`[].every(fn)\` is \`true\`, \`[].some(fn)\` is \`false\`.

Real-world: almost all data shaping in front-end and Node code — building UI lists, totals, lookups — is written with these.`,
        explanationBn: `এই আটটা method interview-তে প্রায় নিশ্চিতভাবে আসে — কোনটা কী **ফেরত দেয়**, সেটাই মনে রাখার চাবি:

- **\`map\`** — প্রতিটা item বদলে একটা **নতুন array**, দৈর্ঘ্য একই। "সবগুলোকে রূপান্তর করো।"
- **\`filter\`** — শর্ত মেলে এমন item গুলোর **নতুন array**। "কিছু বেছে নাও।"
- **\`reduce\`** — পুরো array থেকে **একটা value** বানায় — যোগফল, object, group, যা খুশি। Accumulator (জমা হওয়া ফল) আর current item নিয়ে কাজ করে।
- **\`forEach\`** — শুধু প্রতিটা item-এ কিছু করে (side effect), **কিছু ফেরত দেয় না** (\`undefined\`)।
- **\`find\`** — শর্ত মেলা **প্রথম item**-টা দেয়, না পেলে \`undefined\`। \`findIndex\` তার index দেয়।
- **\`some\`** — **কোনো একটা** মিললেই \`true\`, আর সাথে সাথে থেমে যায়।
- **\`every\`** — **সবগুলো** মিললে \`true\`; একটা না মিললেই থেমে \`false\`।
- **\`includes\`** — নির্দিষ্ট value আছে কি না। \`indexOf\`-এর চেয়ে ভালো, কারণ \`NaN\`-ও খুঁজে পায়।

কয়েকটা ফাঁদ:
- **\`reduce\`-এ সবসময় initial value দিন।** না দিলে খালি array-তে \`TypeError\`, আর প্রথম element-টা accumulator হয়ে যায় — object-এর array-তে প্রায়ই ভুল ফল।
- **\`forEach\`-এ \`break\` চলে না।** মাঝপথে থামতে চাইলে \`for...of\`, বা \`some\`/\`find\`।
- **খালি array:** \`[].every(...)\` → \`true\`, \`[].some(...)\` → \`false\` — validation-এ সতর্ক থাকুন।

এগুলো chain করা যায় — \`filter\` → \`map\` → \`reduce\` — পড়তে প্রায় ইংরেজি বাক্যের মতো।`,
        examples: [
          {
            lang: 'javascript',
            code: `const orders = [
  { id: 1, total: 250, paid: true },
  { id: 2, total: 400, paid: false },
  { id: 3, total: 150, paid: true },
];

console.log(orders.map((o) => o.id));
console.log(orders.filter((o) => o.paid).map((o) => o.id));
console.log(orders.reduce((sum, o) => sum + o.total, 0));
console.log(orders.find((o) => o.total > 300)?.id, orders.findIndex((o) => o.id === 9));
console.log(orders.some((o) => !o.paid), orders.every((o) => o.total > 100));
console.log([1, NaN].includes(NaN), [1, NaN].indexOf(NaN));
console.log([].every((x) => x > 5), [].some((x) => x > 5));

const result = orders.forEach((o) => o.id);
console.log(result);`,
            output: `[ 1, 2, 3 ]
[ 1, 3 ]
800
2 -1
true true
true -1
true false
undefined`,
          },
          {
            lang: 'javascript',
            caption: 'reduce for grouping, and why the initial value matters',
            code: `const people = [
  { name: "Rafi", city: "Dhaka" },
  { name: "Nadia", city: "Sylhet" },
  { name: "Sam", city: "Dhaka" },
];
const byCity = people.reduce((groups, p) => {
  (groups[p.city] ??= []).push(p.name);
  return groups;
}, {});
console.log(byCity);

try {
  [].reduce((a, b) => a + b);
} catch (e) {
  console.log(e.name, "-", e.message);
}`,
            output: `{ Dhaka: [ 'Rafi', 'Sam' ], Sylhet: [ 'Nadia' ] }
TypeError - Reduce of empty array with no initial value`,
          },
        ],
        pitfalls: [
          '`reduce` without an initial value throws on an empty array.',
          '`forEach` ignores `return` values and cannot `break`.',
          '`map` with a callback that does not return gives an array of `undefined`.',
        ],
        followUps: [
          'What is the difference between `map` and `forEach`?',
          'Implement `map`, `filter` and `reduce` yourself.',
          'How would you group an array of objects by a key?',
        ],
      },
      related: ['js-map-vs-foreach', 'js-higher-order-callbacks', 'js-reduce-patterns'],
    },
    {
      id: 'js-shallow-deep-copy',
      level: 'foundation',
      priority: 3,
      question:
        'What is the difference between a shallow and a deep copy? Compare spread, `Object.assign`, `JSON` and `structuredClone`.',
      tags: ['objects', 'copy', 'structuredclone', 'json', 'spread'],
      answer: {
        interview: `**A shallow copy creates a new top-level object but shares any nested objects with the original. A deep copy recursively copies nested objects too, so nothing is shared.**

- **Shallow:** \`{ ...obj }\`, \`Object.assign({}, obj)\`, \`[...arr]\`, \`arr.slice()\`, \`Array.from(arr)\`.
- **\`JSON.parse(JSON.stringify(obj))\`** — a deep copy for plain data only: it drops \`undefined\`, functions and symbols, turns \`Date\` into strings, \`NaN\`/\`Infinity\` into \`null\`, loses \`Map\`/\`Set\`, and throws on circular references.
- **\`structuredClone(obj)\`** — the modern built-in deep copy (browsers and Node 17+): handles \`Date\`, \`Map\`, \`Set\`, typed arrays, circular references; cannot clone functions, DOM nodes or class prototypes (instances come back as plain objects).
- Libraries: Lodash \`cloneDeep\` covers the remaining cases.

Real-world: immutable state updates in React/Redux use shallow copies *per changed level*: \`{ ...state, user: { ...state.user, name } }\`.`,
        explanationBn: `**Shallow copy:** শুধু বাইরের স্তরটা নতুন। ভেতরের nested object (address, array) কপি হয় না — নতুন আর পুরনো দুটোই একই nested object দেখায়। তাই copy-র \`address.city\` বদলালে মূলটারও বদলায়।

**Deep copy:** সব স্তর নতুন করে কপি — মূলটার সাথে কোনো যোগাযোগ থাকে না।

**উপায়গুলোর তুলনা:**
- **Spread \`{...obj}\`, \`Object.assign\`, \`[...arr]\`, \`slice()\`** — সবই **shallow**। দ্রুত আর সাধারণত যথেষ্ট, যদি nested data না বদলান।
- **\`JSON.parse(JSON.stringify(obj))\`** — পুরনো "deep copy" কৌশল, কিন্তু অনেক ফাঁদ:
  - \`undefined\` আর function হারিয়ে যায়
  - \`Date\` হয়ে যায় string
  - \`NaN\`, \`Infinity\` হয়ে যায় \`null\`
  - \`Map\`/\`Set\` খালি object হয়ে যায়
  - Circular reference থাকলে error
- **\`structuredClone(obj)\`** — আধুনিক, built-in deep copy। \`Date\`, \`Map\`, \`Set\`, circular reference সব ঠিকঠাক সামলায়। সীমাবদ্ধতা: function কপি করতে পারে না (error দেয়), আর class-এর instance সাধারণ object হয়ে ফেরত আসে (method হারায়)।

**বাস্তব অভ্যাস (React/Redux):** পুরো state deep copy করা অপচয়। যে স্তরটা বদলাচ্ছেন, শুধু সেই পথ ধরে shallow copy করুন — বাকিটা share থাকে, যেটা আসলে কাজের (unchanged অংশ \`===\` দিয়ে দ্রুত তুলনা করা যায়)।`,
        examples: [
          {
            lang: 'javascript',
            code: `const original = {
  name: "Rafi",
  joined: new Date(0),
  tags: new Set(["admin"]),
  address: { city: "Dhaka" },
  greet() {},
  score: undefined,
};

const shallow = { ...original };
shallow.address.city = "Sylhet";
console.log(original.address.city);           // shared nested object

const viaJson = JSON.parse(JSON.stringify(original));
console.log(typeof viaJson.joined, viaJson.tags, "greet" in viaJson, "score" in viaJson);

const { greet, ...data } = original;           // structuredClone cannot copy functions
const deep = structuredClone(data);
deep.address.city = "Khulna";
console.log(original.address.city, deep.joined instanceof Date, deep.tags.has("admin"));`,
            output: `Sylhet
string {} false false
Sylhet true true`,
          },
          {
            lang: 'javascript',
            caption: 'Circular references',
            code: `const node = { name: "root" };
node.self = node;

try {
  JSON.stringify(node);
} catch (e) {
  console.log(e.name);
}
const copy = structuredClone(node);
console.log(copy.self === copy, copy === node);`,
            output: `TypeError
true false`,
          },
        ],
        pitfalls: [
          'Spread and `Object.assign` are shallow — nested objects are still shared.',
          'The JSON trick silently loses `undefined`, functions, Dates, Maps and Sets.',
          '`structuredClone` throws on functions and returns plain objects for class instances.',
        ],
        followUps: [
          'Write your own deep clone function.',
          'How do you update nested state immutably?',
        ],
      },
      visualizationId: 'js-primitive-vs-reference',
      related: ['js-spread-vs-rest', 'js-json-gotchas'],
    },
    {
      id: 'js-map-vs-foreach',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between `map` and `forEach`?',
      tags: ['arrays', 'map', 'foreach', 'immutability'],
      answer: {
        interview: `**\`map\` returns a new array built from each callback's return value; \`forEach\` returns \`undefined\` and exists only for side effects.**

- Use \`map\` to **transform** data: \`const names = users.map(u => u.name)\`.
- Use \`forEach\` (or \`for...of\`) to **do something** per item: logging, sending, mutating external state.
- \`map\` is chainable (\`.map().filter()\`); \`forEach\` is not.
- Using \`map\` just for side effects builds a throwaway array — a code smell.
- Neither can be stopped with \`break\`; neither waits for \`async\` callbacks (use \`for...of\` with \`await\`, or \`Promise.all(arr.map(...))\`).
- Both skip holes in sparse arrays.

Real-world: in React, \`items.map(item => <Row />)\` renders a list because \`map\` returns the elements; \`forEach\` would render nothing.`,
        explanationBn: `দুটোই array-র প্রতিটা item-এ একটা function চালায়, কিন্তু উদ্দেশ্য আলাদা:

- **\`map\` — রূপান্তর।** প্রতিটা callback যা **return** করে, সেগুলো দিয়ে একটা **নতুন array** বানায়। মূল array অক্ষত থাকে।
- **\`forEach\` — শুধু কাজ করা।** কিছু ফেরত দেয় না (\`undefined\`)। Console-এ লেখা, API-তে পাঠানো, বাইরের কোনো variable বদলানো — এসব side effect-এর জন্য।

**সাধারণ ভুল:**
1. \`forEach\`-এর ফল variable-এ রাখা: \`const doubled = nums.forEach(n => n * 2)\` → \`undefined\`।
2. \`map\`-কে শুধু side effect-এর জন্য ব্যবহার: \`users.map(u => sendEmail(u))\` — অকারণে একটা অব্যবহৃত array তৈরি হয়, আর পাঠক বিভ্রান্ত হয় ("result কোথায় ব্যবহার হলো?")।
3. \`map\`-এর callback-এ \`return\` ভুলে যাওয়া (curly brace দিলে) → \`[undefined, undefined, ...]\`।

**Async-এর ফাঁদ:** দুটোর কোনোটাই \`async\` callback-এর জন্য অপেক্ষা করে না। \`forEach(async ...)\` দিলে loop সাথে সাথে শেষ হয়ে যায়, কাজগুলো পেছনে চলে। ক্রমানুসারে চালাতে \`for...of\` + \`await\`; একসাথে চালাতে \`await Promise.all(items.map(async ...))\`।

React-এ list render করতে \`map\` লাগে, কারণ এটা element-এর array ফেরত দেয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `const nums = [1, 2, 3];

const doubled = nums.map((n) => n * 2);
const fromForEach = nums.forEach((n) => n * 2);
console.log(doubled, fromForEach, nums);

const forgotReturn = nums.map((n) => { n * 2; });
console.log(forgotReturn);

const seen = [];
nums.forEach((n) => seen.push(n * 10));     // side effect: the right tool
console.log(seen);`,
            output: `[ 2, 4, 6 ] undefined [ 1, 2, 3 ]
[ undefined, undefined, undefined ]
[ 10, 20, 30 ]`,
          },
          {
            lang: 'javascript',
            caption: 'forEach does not wait for async callbacks',
            code: `const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

async function main() {
  const log = [];
  [30, 10].forEach(async (ms) => log.push(await wait(ms, ms)));
  console.log("after forEach:", log);

  const results = await Promise.all([30, 10].map((ms) => wait(ms, ms)));
  console.log("Promise.all + map:", results);
}
main();`,
            output: `after forEach: []
Promise.all + map: [ 30, 10 ]`,
          },
        ],
        pitfalls: [
          'Assigning the result of `forEach` gives `undefined`.',
          '`forEach(async ...)` does not wait — use `for...of` or `Promise.all`.',
        ],
        followUps: ['How do you run async operations over an array sequentially vs in parallel?'],
      },
      related: ['js-array-iteration-methods', 'js-sequential-vs-parallel-await'],
    },
    {
      id: 'js-slice-vs-splice',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between `slice` and `splice`?',
      tags: ['arrays', 'slice', 'splice', 'mutation'],
      answer: {
        interview: `**\`slice(start, end)\` returns a shallow copy of part of an array and does not change the original. \`splice(start, deleteCount, ...items)\` changes the array in place — removing, replacing or inserting items — and returns the removed items.**

- \`slice\`: \`end\` is exclusive; negative indexes count from the end; \`arr.slice()\` copies the whole array. Also exists on strings.
- \`splice\`: mutates; returns an array of deleted elements; \`splice(i, 0, x)\` inserts without removing.
- Non-mutating alternative to \`splice\`: \`toSpliced\` (ES2023).
- Memory aid: s**p**lice **p**ermanently changes; slice is a safe copy.

Real-world: \`slice\` for pagination (\`items.slice(page * size, (page + 1) * size)\`); \`splice\` to remove an item by index from a list you own.`,
        explanationBn: `নাম প্রায় একই, কিন্তু আচরণ সম্পূর্ণ আলাদা — আর এই পার্থক্যই interview-তে জিজ্ঞেস করা হয়:

**\`slice(start, end)\` — নিরাপদ কপি:**
- মূল array **একদম অক্ষত** থাকে।
- \`start\` থেকে \`end\`-এর **আগ পর্যন্ত** অংশের একটা নতুন array দেয়।
- Negative index শেষ থেকে গোনে: \`slice(-2)\` = শেষ দুটো।
- \`slice()\` argument ছাড়া = পুরো array-র shallow copy।
- String-এও আছে।

**\`splice(start, deleteCount, ...newItems)\` — মূল array বদলায়:**
- \`start\` থেকে \`deleteCount\` সংখ্যক element **সরিয়ে দেয়**, চাইলে সেখানে নতুন element বসায়।
- **সরানো element গুলোর array** ফেরত দেয় (বদলানো array না!)।
- \`splice(2, 0, "x")\` → কিছু না সরিয়ে index 2-এ "x" ঢোকায়।

মনে রাখার কৌশল: s**p**lice-এর **p** = **p**ermanent (স্থায়ী বদল)।

React বা Redux-এ state সরাসরি বদলানো নিষেধ, তাই সেখানে \`splice\` চলে না — ES2023-এর \`toSpliced()\` একই কাজ করে কিন্তু নতুন array দেয়, অথবা \`filter\`/\`slice\` দিয়ে নতুন array বানানো হয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `const letters = ["a", "b", "c", "d", "e"];

console.log(letters.slice(1, 3), letters.slice(-2), letters);

const removed = letters.splice(1, 2);          // remove 2 items at index 1
console.log(removed, letters);

letters.splice(1, 0, "X", "Y");                // insert without removing
console.log(letters);

const source = [1, 2, 3, 4];
console.log(source.toSpliced(1, 1), source);   // ES2023: non-mutating`,
            output: `[ 'b', 'c' ] [ 'd', 'e' ] [ 'a', 'b', 'c', 'd', 'e' ]
[ 'b', 'c' ] [ 'a', 'd', 'e' ]
[ 'a', 'X', 'Y', 'd', 'e' ]
[ 1, 3, 4 ] [ 1, 2, 3, 4 ]`,
          },
        ],
        pitfalls: [
          '`splice` returns the removed elements, not the modified array.',
          'Calling `splice` while looping forward over the same array skips elements.',
        ],
        followUps: [
          'Which array methods mutate the array, and what are their non-mutating versions?',
        ],
      },
      related: ['js-mutating-vs-nonmutating'],
    },
    {
      id: 'js-for-in-vs-for-of',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between `for...in` and `for...of`?',
      tags: ['loops', 'for-in', 'for-of', 'iterables'],
      answer: {
        interview: `**\`for...in\` iterates over the enumerable property *keys* (as strings) of an object, including inherited ones. \`for...of\` iterates over the *values* of an iterable — arrays, strings, Maps, Sets, generators.**

- Arrays: \`for...of\` gives values; \`for...in\` gives index strings (\`"0"\`, \`"1"\`) plus any extra enumerable properties — avoid it for arrays.
- Plain objects are **not** iterable, so \`for...of\` over \`{}\` throws; use \`Object.keys/values/entries(obj)\` with \`for...of\`.
- \`for...in\` walks the prototype chain — guard with \`Object.hasOwn(obj, key)\`.
- Strings: \`for...of\` handles emoji/surrogate pairs correctly, indexing does not.
- Both support \`break\`, \`continue\` and \`await\` inside async functions (unlike \`forEach\`).

Real-world: \`for (const [key, value] of Object.entries(config))\` is the idiomatic way to loop over an object.`,
        explanationBn: `**মনে রাখার সহজ উপায়: \`in\` → key (index), \`of\` → value।**

**\`for...in\`** — object-এর **property-র নাম (key)** গুলোর ওপর ঘোরে, সবসময় string হিসেবে।
- Array-তে ব্যবহার করলে index পাওয়া যায় — কিন্তু \`"0"\`, \`"1"\` string হিসেবে, number না।
- **বিপদ:** prototype chain থেকে inherit করা enumerable property-ও দেখায়। কেউ \`Array.prototype\`-এ কিছু যোগ করলে আপনার loop-এ সেটাও চলে আসবে। তাই array-তে \`for...in\` এড়িয়ে চলুন।

**\`for...of\`** — যেকোনো **iterable**-এর **value** গুলোর ওপর ঘোরে: array, string, \`Map\`, \`Set\`, generator, \`arguments\`।
- Array-র জন্য এটাই সঠিক।
- String-এ emoji-কে ঠিকমতো একটা character হিসেবে দেখে।
- **সাধারণ object iterable না** — \`for (const x of {})\` লিখলে \`TypeError\`।

**Object-এর ওপর loop-এর আধুনিক উপায়:**
\`\`\`js
for (const [key, value] of Object.entries(obj)) { ... }
\`\`\`
\`Object.entries\` শুধু নিজের property দেয় (inherited না), তাই নিরাপদ।

দুটোতেই \`break\`/\`continue\` চলে, আর async function-এ \`await\` — যেটা \`forEach\`-এ সম্ভব না।`,
        examples: [
          {
            lang: 'javascript',
            code: `const colors = ["red", "green"];
colors.extra = "oops";

for (const i in colors) console.log("in:", i, typeof i);
for (const c of colors) console.log("of:", c);

const user = { name: "Rafi", role: "admin" };
for (const [key, value] of Object.entries(user)) console.log(key, "=", value);

try {
  for (const x of user) {}
} catch (e) {
  console.log(e.name, "-", e.message);
}

const parent = { inherited: true };
const child = Object.create(parent);
child.own = 1;
for (const k in child) console.log(k, Object.hasOwn(child, k));`,
            output: `in: 0 string
in: 1 string
in: extra string
of: red
of: green
name = Rafi
role = admin
TypeError - user is not iterable
own true
inherited false`,
          },
        ],
        pitfalls: [
          '`for...in` over arrays gives string indexes and extra enumerable properties.',
          '`for...in` includes inherited enumerable properties.',
          'Plain objects are not iterable with `for...of`.',
        ],
        followUps: ['What makes an object iterable?', 'Which loop works with `await`?'],
      },
      related: ['js-object-keys-values-entries'],
    },
    {
      id: 'js-create-objects',
      level: 'foundation',
      priority: 2,
      question: 'What are the different ways to create an object in JavaScript?',
      tags: ['objects', 'classes', 'object-create', 'constructors'],
      answer: {
        interview: `**Five common ways, each with a different prototype and use case.**

1. **Object literal** \`{ name: "Rafi" }\` — the everyday choice; prototype is \`Object.prototype\`.
2. **Constructor function + \`new\`** — \`function User(name) { this.name = name; }\`; methods go on \`User.prototype\`.
3. **\`class\` + \`new\`** — modern syntax over constructor functions and prototypes.
4. **\`Object.create(proto)\`** — create an object with a chosen prototype; \`Object.create(null)\` gives an object with **no** prototype (a safe dictionary).
5. **Factory function** — a normal function that returns a literal; can use closures for privacy and needs no \`new\`.

Also: \`Object.fromEntries(pairs)\`, \`structuredClone\`/spread copies, and \`new Object()\` (avoid — the literal is clearer).

Real-world: literals for data, classes or factories for things with behaviour, \`Object.create(null)\` for maps keyed by user input.`,
        explanationBn: `**১. Object literal \`{}\`** — সবচেয়ে প্রচলিত। দ্রুত, পরিষ্কার।

**২. Constructor function + \`new\`** — ES6-এর আগে "class" বানানোর উপায়। \`new User("Rafi")\` নতুন object বানায়, \`this\` সেটাকে দেখায়, আর method গুলো \`User.prototype\`-এ রাখা হয় যাতে সব instance share করে।

**৩. \`class\`** — উপরেরটারই আধুনিক, পরিষ্কার syntax। ভেতরে একই prototype ব্যবস্থা (syntactic sugar)।

**৪. \`Object.create(proto)\`** — নিজে বেছে দেওয়া prototype দিয়ে object। বিশেষ ব্যবহার: \`Object.create(null)\` — **কোনো prototype ছাড়া** object। সাধারণ \`{}\`-এর ভেতরে \`toString\`, \`constructor\`, \`__proto__\`-এর মতো inherited key থাকে — user-এর দেওয়া key দিয়ে lookup করলে সংঘর্ষ বা নিরাপত্তা সমস্যা (prototype pollution) হতে পারে। Prototype-হীন object সেই ঝুঁকি দূর করে। (তবে এমন কাজে \`Map\` আরও ভালো।)

**৫. Factory function** — সাধারণ function যেটা object ফেরত দেয়। \`new\` লাগে না, \`this\`-এর জটিলতা নেই, আর closure দিয়ে সত্যিকারের private data রাখা যায়।

\`Object.fromEntries([["a", 1]])\` — key-value জোড়ার list থেকে object বানায়, \`Object.entries\`-এর উল্টো।`,
        examples: [
          {
            lang: 'javascript',
            code: `const literal = { name: "Rafi" };

function UserFn(name) { this.name = name; }
UserFn.prototype.greet = function () { return "hi " + this.name; };

class UserClass {
  constructor(name) { this.name = name; }
  greet() { return "hi " + this.name; }
}

const proto = { greet() { return "hi " + this.name; } };
const created = Object.create(proto);
created.name = "Sam";

const makeUser = (name) => ({ name, greet: () => "hi " + name });

console.log(new UserFn("Nadia").greet(), new UserClass("Mita").greet(), created.greet(), makeUser("Ali").greet());

const dict = Object.create(null);
console.log("toString" in literal, "toString" in dict);
console.log(Object.fromEntries([["a", 1], ["b", 2]]));`,
            output: `hi Nadia hi Mita hi Sam hi Ali
true false
{ a: 1, b: 2 }`,
          },
        ],
        followUps: ['What does `new` do step by step?', 'What is prototype pollution?'],
      },
      related: ['js-new-operator', 'js-classes'],
    },
    {
      id: 'js-object-keys-values-entries',
      level: 'foundation',
      priority: 2,
      question: 'What do `Object.keys`, `Object.values` and `Object.entries` return?',
      tags: ['objects', 'object-keys', 'object-entries', 'iteration'],
      answer: {
        interview: `**They return arrays of an object's own, enumerable, string-keyed properties: \`keys\` → names, \`values\` → values, \`entries\` → \`[key, value]\` pairs.**

- Inherited and non-enumerable properties are skipped; symbol keys are skipped (use \`Object.getOwnPropertySymbols\` or \`Reflect.ownKeys\`).
- Order: integer-like keys ascending first, then other string keys in insertion order.
- \`Object.fromEntries\` is the inverse — together they let you transform objects with array methods.
- \`Object.keys(obj).length\` is the usual "is this object empty?" check.

Real-world: \`Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v * 1.15]))\` adds tax to every price.`,
        explanationBn: `তিনটা function একটা object-কে array-তে রূপান্তর করে, যাতে array-র সব method (\`map\`, \`filter\`, \`reduce\`) ব্যবহার করা যায়:

- \`Object.keys(obj)\` → property-র নামের array
- \`Object.values(obj)\` → value-র array
- \`Object.entries(obj)\` → \`[key, value]\` জোড়ার array

শুধু **নিজের** (inherited না) আর **enumerable** property আসে। Symbol key আসে না।

**Object transform করার কৌশল:** object → \`entries\` → array method দিয়ে বদলানো → \`Object.fromEntries\` দিয়ে আবার object। যেমন সব দামের সাথে ভ্যাট যোগ, বা নির্দিষ্ট key বাদ দেওয়া।

**Object খালি কি না** — \`Object.keys(obj).length === 0\`। (\`obj === {}\` কখনো কাজ করে না, কারণ object reference দিয়ে তুলনা হয়।)

**Key-এর ক্রম:** integer-এর মতো key (\`"1"\`, \`"2"\`) আগে, ছোট থেকে বড়; তারপর বাকি string key যোগ করার ক্রমে। তাই \`{ b: 1, 2: 1, a: 1, 1: 1 }\`-এর key-ক্রম হয় \`1, 2, b, a\`।`,
        examples: [
          {
            lang: 'javascript',
            code: `const prices = { tea: 40, coffee: 120 };
console.log(Object.keys(prices), Object.values(prices));
console.log(Object.entries(prices));

const withVat = Object.fromEntries(
  Object.entries(prices).map(([item, price]) => [item, price * 1.15]),
);
console.log(withVat);

console.log(Object.keys({}).length === 0, Object.keys({ b: 1, 2: 1, a: 1, 1: 1 }));`,
            output: `[ 'tea', 'coffee' ] [ 40, 120 ]
[ [ 'tea', 40 ], [ 'coffee', 120 ] ]
{ tea: 46, coffee: 138 }
true [ '1', '2', 'b', 'a' ]`,
          },
        ],
        followUps: ['In what order are object keys returned?'],
      },
      related: ['js-for-in-vs-for-of', 'js-property-order'],
    },
    {
      id: 'js-remove-duplicates-flatten',
      level: 'foundation',
      priority: 2,
      question: 'How do you remove duplicates from an array and flatten a nested array?',
      tags: ['arrays', 'set', 'flat', 'deduplication'],
      answer: {
        interview: `**Duplicates: \`[...new Set(arr)]\` (keeps first-occurrence order). Flatten: \`arr.flat(depth)\`, or \`arr.flat(Infinity)\` for any depth.**

- \`Set\` uses SameValueZero equality, so it deduplicates primitives (and \`NaN\`), but two objects with the same content are still different.
- Deduplicate objects by a key with a \`Map\`: \`[...new Map(users.map(u => [u.id, u])).values()]\` (keeps the *last* occurrence) or a \`seen\` set + \`filter\` (keeps the first).
- \`flat()\` defaults to depth 1; \`flatMap(fn)\` is \`map\` + \`flat(1)\`.
- Hand-written versions (recursion, \`reduce\`, or a stack) are common interview follow-ups.

Real-world: \`[...new Set(tags)]\` to clean user-entered tags; \`flatMap\` to expand orders into line items.`,
        explanationBn: `**Duplicate সরানো:** \`[...new Set(arr)]\`
\`Set\` শুধু unique value রাখে, আর প্রথম দেখার ক্রম মনে রাখে। Spread দিয়ে আবার array বানানো হয়। O(n)।

সতর্কতা: Set reference দিয়ে তুলনা করে। তাই \`{id: 1}\` আর \`{id: 1}\` দুটো আলাদা object — দুটোই থাকবে। Object-এর duplicate সরাতে কোনো একটা key (\`id\`) ধরে কাজ করতে হয়:
- \`seen\` Set + \`filter\` — প্রথম occurrence রাখে।
- \`Map\` দিয়ে — একই key-তে পরের value আগেরটাকে overwrite করে, তাই শেষ occurrence থাকে।

**Flatten:** \`arr.flat(depth)\`
- Default depth 1 — এক স্তর খোলে।
- \`flat(Infinity)\` — যত গভীরই হোক, সব খুলে দেয়।
- \`flatMap(fn)\` — প্রথমে \`map\`, তারপর এক স্তর \`flat\`। যেমন প্রতিটা order থেকে তার item গুলোর list বানানো।

Interview-তে প্রায়ই বলে "built-in ছাড়া করুন" — তখন recursion বা stack (Exercises section-এ আছে)।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log([...new Set([3, 1, 3, 2, 1, NaN, NaN])]);
console.log(new Set([{ id: 1 }, { id: 1 }]).size);

const users = [{ id: 1, v: "a" }, { id: 2, v: "b" }, { id: 1, v: "c" }];
const seen = new Set();
console.log(users.filter((u) => !seen.has(u.id) && seen.add(u.id)).map((u) => u.v));

const nested = [1, [2, [3, [4]]]];
console.log(nested.flat(), nested.flat(Infinity));

const orders = [{ items: ["pen", "ink"] }, { items: ["book"] }];
console.log(orders.flatMap((o) => o.items));`,
            output: `[ 3, 1, 2, NaN ]
2
[ 'a', 'b' ]
[ 1, 2, [ 3, [ 4 ] ] ] [ 1, 2, 3, 4 ]
[ 'pen', 'ink', 'book' ]`,
          },
        ],
        followUps: [
          'Flatten an array without `flat()`.',
          'Remove duplicate objects by a property.',
        ],
      },
      related: ['js-map-vs-object'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'js-mutating-vs-nonmutating',
      level: 'intermediate',
      priority: 2,
      question:
        'Which array methods mutate the array, and what are their non-mutating alternatives (`toSorted`, `toReversed`…)?',
      tags: ['arrays', 'immutability', 'es2023', 'sort'],
      answer: {
        interview: `**Mutating methods change the array in place; non-mutating ones return a new array or value.**

| Mutating | Non-mutating alternative |
|---|---|
| \`push\`, \`unshift\` | \`[...arr, x]\`, \`[x, ...arr]\`, \`concat\` |
| \`pop\`, \`shift\` | \`slice(0, -1)\`, \`slice(1)\` |
| \`splice\` | \`toSpliced\` (ES2023), \`slice\` + spread, \`filter\` |
| \`sort\` | \`toSorted\` (ES2023), \`[...arr].sort()\` |
| \`reverse\` | \`toReversed\` (ES2023) |
| \`arr[i] = x\`, \`fill\`, \`copyWithin\` | \`with(i, x)\` (ES2023), \`map\` |

- Non-mutating by design: \`map\`, \`filter\`, \`reduce\`, \`slice\`, \`concat\`, \`flat\`, \`join\`, \`find\`, \`includes\`.
- \`sort\` and \`reverse\` both mutate **and** return the same array, which hides the mutation.
- Immutability matters for React/Redux change detection and for avoiding surprises when arrays are shared.

Real-world: \`const sorted = items.sort(...)\` inside a React component mutates props — use \`toSorted\`.`,
        explanationBn: `**Mutating** method মূল array-টাকেই বদলে ফেলে। এটা বিপজ্জনক যখন array অন্য কোথাও share হচ্ছে — যেমন React-এর props বা state, বা function-এ পাঠানো array।

Mutating method-গুলো মুখস্থ রাখুন: \`push\`, \`pop\`, \`shift\`, \`unshift\`, \`splice\`, \`sort\`, \`reverse\`, \`fill\`, \`copyWithin\`, আর সরাসরি \`arr[i] = x\`।

**সবচেয়ে বড় ফাঁদ — \`sort\` আর \`reverse\`:** এরা মূল array বদলায় **এবং** সেই একই array ফেরত দেয়। তাই \`const sorted = items.sort()\` দেখে মনে হয় নতুন array পেলাম, কিন্তু আসলে \`items\` নিজেই sorted হয়ে গেছে, আর \`sorted === items\`।

**ES2023-এর নতুন non-mutating method:**
- \`toSorted()\` — sort-এর নিরাপদ সংস্করণ
- \`toReversed()\` — reverse-এর
- \`toSpliced()\` — splice-এর
- \`with(index, value)\` — একটা index-এর value বদলে নতুন array

এর আগে কৌশল ছিল আগে কপি করে নেওয়া: \`[...arr].sort()\`।

React/Redux কেন immutability চায়? তারা বদল চেনে reference তুলনা করে (\`prev === next\`)। Array জায়গায় বদলালে reference একই থাকে, তাই UI update হয় না।`,
        examples: [
          {
            lang: 'javascript',
            code: `const scores = [30, 10, 20];

const sortedCopy = scores.toSorted((a, b) => a - b);
console.log(sortedCopy, scores);

const reversed = scores.toReversed();
const replaced = scores.with(0, 99);
console.log(reversed, replaced, scores);

const sameArray = scores.sort((a, b) => a - b);   // mutates AND returns it
console.log(sameArray === scores, scores);`,
            output: `[ 10, 20, 30 ] [ 30, 10, 20 ]
[ 20, 10, 30 ] [ 99, 10, 20 ] [ 30, 10, 20 ]
true [ 10, 20, 30 ]`,
          },
        ],
        pitfalls: ['`sort` and `reverse` return the same (mutated) array, not a copy.'],
        followUps: ['Why do React and Redux require immutable updates?'],
      },
      related: ['js-slice-vs-splice', 'js-array-sort-default'],
    },
    {
      id: 'js-array-sort-default',
      level: 'intermediate',
      priority: 2,
      question:
        'Why does `[10, 9, 1].sort()` return `[1, 10, 9]`? How do you sort numbers and objects correctly?',
      tags: ['arrays', 'sort', 'comparator'],
      answer: {
        interview: `**Without a comparator, \`sort\` converts elements to strings and compares them by UTF-16 code units, so \`"10"\` comes before \`"9"\`.**

- Numbers: \`arr.sort((a, b) => a - b)\` ascending, \`b - a\` descending.
- The comparator returns negative (a first), positive (b first) or 0 (keep order).
- Strings in human order: \`a.localeCompare(b)\` (handles case and accents; \`Intl.Collator\` for speed).
- Objects: \`users.sort((a, b) => a.age - b.age || a.name.localeCompare(b.name))\` for multi-key sorting.
- \`sort\` is stable (guaranteed since ES2019) and mutates the array; use \`toSorted\` for a copy.
- Never return a boolean (\`a > b\`) — it breaks the ordering.
- \`undefined\` values are always moved to the end.

Real-world: sorting prices or scores without a comparator is one of the most common production bugs.`,
        explanationBn: `**কেন এমন হয়?** \`sort()\`-এ comparator না দিলে JavaScript প্রতিটা element-কে **string**-এ রূপান্তর করে, তারপর অভিধানের ক্রমে সাজায়। \`"10"\` আর \`"9"\` তুলনায় প্রথম অক্ষর \`"1"\` < \`"9"\`, তাই 10 আগে। সংখ্যার মান দেখাই হয় না!

**সংখ্যা সঠিকভাবে:** \`arr.sort((a, b) => a - b)\`

Comparator-এর নিয়ম: \`(a, b)\` নিয়ে একটা সংখ্যা ফেরত দাও —
- **negative** → \`a\` আগে
- **positive** → \`b\` আগে
- **0** → ক্রম যেমন আছে

\`a - b\` ঠিক এটাই দেয়: a ছোট হলে negative। উল্টো ক্রমে চাইলে \`b - a\`।

**String (মানুষের ক্রমে):** \`a.localeCompare(b)\` — বড়-ছোট হাতের অক্ষর আর বিভিন্ন ভাষার অক্ষর ঠিকমতো সামলায়।

**একাধিক key দিয়ে:** \`a.age - b.age || a.name.localeCompare(b.name)\` — বয়স সমান হলে (\`0\`, যেটা falsy) \`||\`-এর ডান পাশে গিয়ে নাম দিয়ে তুলনা।

**সাধারণ ভুল:** \`(a, b) => a > b\` — এটা boolean দেয়, negative কখনো না, তাই engine ভেদে ভুল ক্রম আসে।

\`sort\` মূল array বদলায় — কপি চাইলে \`toSorted\`।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log([10, 9, 1, 100].sort());
console.log([10, 9, 1, 100].sort((a, b) => a - b));
console.log(["banana", "Apple", "cherry"].sort());
console.log(["banana", "Apple", "cherry"].sort((a, b) => a.localeCompare(b)));

const users = [
  { name: "Rafi", age: 30 },
  { name: "Nadia", age: 25 },
  { name: "Ali", age: 30 },
];
users.sort((a, b) => a.age - b.age || a.name.localeCompare(b.name));
console.log(users.map((u) => \`\${u.name}:\${u.age}\`).join(" "));`,
            output: `[ 1, 10, 100, 9 ]
[ 1, 9, 10, 100 ]
[ 'Apple', 'banana', 'cherry' ]
[ 'Apple', 'banana', 'cherry' ]
Nadia:25 Ali:30 Rafi:30`,
          },
        ],
        pitfalls: [
          'Default `sort` compares as strings, even for numbers.',
          'A comparator returning a boolean gives unreliable results.',
        ],
        followUps: ["Is JavaScript's sort stable?"],
      },
      related: ['js-mutating-vs-nonmutating', 'js-relational-comparison-coercion'],
    },
    {
      id: 'js-freeze-vs-seal',
      level: 'intermediate',
      priority: 2,
      question:
        'What is the difference between `Object.freeze`, `Object.seal` and `Object.preventExtensions`?',
      tags: ['objects', 'immutability', 'freeze', 'seal'],
      answer: {
        interview: `**They lock an object to increasing degrees — all are shallow.**

| | add props | delete props | change values |
|---|---|---|---|
| \`preventExtensions\` | ✗ | ✓ | ✓ |
| \`seal\` | ✗ | ✗ | ✓ |
| \`freeze\` | ✗ | ✗ | ✗ |

- Check with \`Object.isExtensible\`, \`Object.isSealed\`, \`Object.isFrozen\`.
- Violations fail silently in sloppy mode and throw \`TypeError\` in strict mode (and in modules/classes).
- **Shallow:** nested objects stay mutable — deep-freeze recursively if you need it.
- Freezing has no effect on \`const\`: \`const\` locks the binding, \`freeze\` locks the object.

Real-world: freezing configuration objects or enum-like constants (\`const Status = Object.freeze({ ACTIVE: "active" })\`) prevents accidental changes.`,
        explanationBn: `তিনটা function object-কে কতটা "তালা" দেবে তার তিনটা স্তর:

1. **\`Object.preventExtensions\`** — নতুন property **যোগ** করা যাবে না। বাকি সব চলে।
2. **\`Object.seal\`** — যোগও না, **মুছে ফেলাও** না। কিন্তু বিদ্যমান value বদলানো যায়। Object-এর আকার (কোন কোন key আছে) স্থির।
3. **\`Object.freeze\`** — কিছুই না: যোগ না, মোছা না, **value বদলানোও না**। সম্পূর্ণ read-only।

**দুটো গুরুত্বপূর্ণ সতর্কতা:**
- **Shallow:** তিনটাই শুধু প্রথম স্তরে কাজ করে। \`frozen.address.city = "x"\` এখনো চলে, কারণ \`address\` object নিজে frozen না। পুরোপুরি জমাতে প্রতিটা স্তরে recursively freeze করতে হয় (Exercises-এ deep freeze)।
- **Silent failure:** sloppy mode-এ নিয়ম ভাঙলে কোনো error হয় না — শুধু কিছুই ঘটে না। Bug খোঁজা কঠিন। Strict mode-এ \`TypeError\` দেয়।

\`const\` বনাম \`freeze\`: \`const\` বলে "variable অন্য object-এ যাবে না", \`freeze\` বলে "এই object বদলাবে না"। পুরোপুরি স্থির constant-এর জন্য দুটোই লাগে।`,
        examples: [
          {
            lang: 'javascript',
            code: `"use strict";
const attempt = (label, fn) => {
  try { fn(); console.log(label, "ok"); }
  catch (e) { console.log(label, "->", e.name); }
};

const sealed = Object.seal({ a: 1 });
attempt("seal: change", () => { sealed.a = 2; });
attempt("seal: add", () => { sealed.b = 1; });
attempt("seal: delete", () => { delete sealed.a; });

const frozen = Object.freeze({ a: 1, nested: { x: 1 } });
attempt("freeze: change", () => { frozen.a = 2; });
attempt("freeze: nested", () => { frozen.nested.x = 2; });
console.log(Object.isFrozen(frozen), Object.isFrozen(frozen.nested), sealed);`,
            output: `seal: change ok
seal: add -> TypeError
seal: delete -> TypeError
freeze: change -> TypeError
freeze: nested ok
true false { a: 2 }`,
          },
        ],
        pitfalls: ['All three are shallow.', 'In sloppy mode, violations fail silently.'],
        followUps: ['Write a `deepFreeze` function.'],
      },
      related: ['js-const-mutation'],
    },
    {
      id: 'js-map-vs-object',
      level: 'intermediate',
      priority: 2,
      question:
        'When should you use a `Map` instead of a plain object? What about `Set`, `WeakMap` and `WeakSet`?',
      tags: ['map', 'set', 'weakmap', 'collections'],
      answer: {
        interview: `**Use a \`Map\` for dynamic key/value collections; use a plain object for fixed-shape records.**

\`Map\` vs object:
- **Keys:** any value (objects, functions, \`NaN\`) vs strings and symbols only (numbers are converted to strings).
- **Size:** \`map.size\` vs \`Object.keys(obj).length\`.
- **Order:** insertion order always vs integer-like keys first.
- **No inherited keys:** a \`Map\` has no prototype collisions (\`"__proto__"\`, \`"constructor"\`) — safer for user-supplied keys.
- **Performance:** optimized for frequent additions and deletions; directly iterable.
- Objects win for JSON serialization, destructuring and static structure.

Others:
- **\`Set\`** — unique values, O(1) \`has\`; great for deduplication and membership.
- **\`WeakMap\` / \`WeakSet\`** — keys must be objects and are held **weakly**: if nothing else references the key, the entry can be garbage-collected. Not iterable, no \`size\`. Used for private data attached to objects, caches and "already visited" marks.

Real-world: a \`WeakMap\` keyed by DOM nodes stores per-element data without leaking memory when nodes are removed.`,
        explanationBn: `**Object** মূলত তৈরি "record" রাখার জন্য — নির্দিষ্ট আকারের data: \`{ name, age, email }\`।
**Map** তৈরি "dictionary"-র জন্য — যেখানে key আগে থেকে জানা নেই, ঘনঘন যোগ-বাদ হয়।

**Map-এর সুবিধা:**
- **যেকোনো কিছু key হতে পারে** — object, function, number। Object-এ key সবসময় string হয়ে যায়: \`obj[1]\` আর \`obj["1"]\` একই।
- **\`size\`** সরাসরি পাওয়া যায়।
- **Insertion order** সবসময় ঠিক থাকে।
- **কোনো inherited key নেই** — সাধারণ object-এ \`"constructor"\`, \`"toString"\`, \`"__proto__"\` আগে থেকেই "আছে"। User-এর দেওয়া string দিয়ে key বানালে সংঘর্ষ বা prototype pollution-এর মতো নিরাপত্তা ঝুঁকি হয়। Map-এ এই সমস্যা নেই।
- ঘনঘন যোগ-বাদে দ্রুত।

**Object-এর সুবিধা:** JSON-এ সরাসরি যায়, destructuring করা যায়, syntax সহজ।

**Set** — শুধু unique value-র collection; \`has()\` O(1)।

**WeakMap / WeakSet** — key অবশ্যই object, আর key-কে **"দুর্বলভাবে"** ধরে রাখে: অন্য কোথাও সেই object-এর reference না থাকলে garbage collector entry-সহ মুছে দিতে পারে। তাই এগুলো iterate করা যায় না, \`size\`-ও নেই (কখন কী মুছে যাবে অনিশ্চিত)। ব্যবহার: কোনো object-এর সাথে বাড়তি data জুড়ে রাখা, memory leak ছাড়া — যেমন DOM element বা cache।`,
        examples: [
          {
            lang: 'javascript',
            code: `const obj = {};
obj[1] = "number key";
obj["1"] = "string key";              // same key!
console.log(Object.keys(obj), "constructor" in obj);

const map = new Map();
const userKey = { id: 7 };
map.set(1, "number").set("1", "string").set(userKey, "object key");
console.log(map.size, map.get(1), map.get("1"), map.get(userKey));
console.log([...map.keys()].map((k) => typeof k));

const visited = new WeakSet();
const node = { id: "n1" };
visited.add(node);
console.log(visited.has(node), visited.has({ id: "n1" }));

const privateData = new WeakMap();
class Account {
  constructor(balance) { privateData.set(this, { balance }); }
  get balance() { return privateData.get(this).balance; }
}
console.log(new Account(500).balance);`,
            output: `[ '1' ] true
3 number string object key
[ 'number', 'string', 'object' ]
true false
500`,
          },
        ],
        pitfalls: [
          '`JSON.stringify(map)` gives `"{}"` — convert with `Object.fromEntries(map)` first.',
          'Object keys are always strings or symbols.',
        ],
        followUps: ['Why are WeakMaps not iterable?', 'What is prototype pollution?'],
      },
      related: ['js-remove-duplicates-flatten', 'js-closure-memory'],
    },
    {
      id: 'js-json-gotchas',
      level: 'intermediate',
      priority: 2,
      question: 'What are the gotchas of `JSON.stringify` and `JSON.parse`?',
      tags: ['json', 'serialization', 'dates', 'bigint'],
      answer: {
        interview: `**JSON supports only strings, numbers, booleans, \`null\`, arrays and plain objects — everything else is dropped, converted or rejected.**

\`JSON.stringify\`:
- \`undefined\`, functions and symbols are **omitted** from objects and become \`null\` in arrays.
- \`NaN\` and \`Infinity\` become \`null\`.
- \`Date\` becomes an ISO string (via \`toJSON\`) — \`JSON.parse\` does **not** turn it back into a \`Date\`.
- \`Map\`/\`Set\` become \`{}\`; \`BigInt\` throws; circular references throw.
- Only own enumerable properties are included; a \`toJSON()\` method customises output.
- Extra arguments: a replacer (function or key whitelist) and indentation (\`JSON.stringify(obj, null, 2)\`).

\`JSON.parse\`:
- Throws \`SyntaxError\` on invalid JSON (trailing commas, single quotes, comments) — always wrap untrusted input in \`try\`.
- A reviver function can rebuild types, e.g. dates.
- Large integers lose precision beyond 2⁵³.

Real-world: API responses with dates arrive as strings, so \`new Date(order.createdAt)\` is needed after parsing.`,
        explanationBn: `JSON মাত্র ছয় ধরনের data বোঝে: string, number, boolean, \`null\`, array, সাধারণ object। এর বাইরের কিছু থাকলে সেটা হারিয়ে যায়, বদলে যায়, বা error দেয়।

**\`JSON.stringify\`-এর ফাঁদ:**
- **\`undefined\`, function, symbol** — object-এ থাকলে key-সহ **উধাও**; array-তে থাকলে \`null\` হয়ে যায়।
- **\`NaN\`, \`Infinity\`** → \`null\`।
- **\`Date\`** → ISO string (\`"2024-01-15T..."\`)। কিন্তু \`JSON.parse\` এটাকে আবার \`Date\` বানায় না — string হিসেবেই থাকে। API থেকে আসা তারিখের ওপর \`.getFullYear()\` চালালে error।
- **\`Map\`, \`Set\`** → \`{}\` (খালি object) — data সব হারায়।
- **\`BigInt\`** আর **circular reference** → \`TypeError\`।

**কাজের বৈশিষ্ট্য:**
- \`JSON.stringify(obj, null, 2)\` — সুন্দর করে indentation দিয়ে লেখা।
- Object-এ \`toJSON()\` method লিখলে নিজের মতো format ঠিক করা যায়।

**\`JSON.parse\`-এর ফাঁদ:**
- JSON-এর নিয়ম কড়া: single quote, শেষে বাড়তি comma, comment — সব \`SyntaxError\`। বাইরের data parse করলে সবসময় \`try/catch\`।
- **Reviver** function দিয়ে parse করার সময় type ঠিক করা যায় — যেমন তারিখের string-কে \`Date\` বানানো।`,
        examples: [
          {
            lang: 'javascript',
            code: `const data = {
  name: "Rafi",
  missing: undefined,
  greet() {},
  score: NaN,
  list: [undefined, () => {}, 1],
  when: new Date(Date.UTC(2024, 0, 15)),
  tags: new Set(["a"]),
};
const text = JSON.stringify(data);
console.log(text);

const back = JSON.parse(text);
console.log(typeof back.when);

const revived = JSON.parse(text, (key, value) => (key === "when" ? new Date(value) : value));
console.log(revived.when instanceof Date, revived.when.getUTCFullYear());

for (const bad of ["{'a': 1}", '{"a": 1,}']) {
  try { JSON.parse(bad); } catch (e) { console.log(e.name); }
}
try { JSON.stringify({ id: 1n }); } catch (e) { console.log(e.name); }`,
            output: `{"name":"Rafi","score":null,"list":[null,null,1],"when":"2024-01-15T00:00:00.000Z","tags":{}}
string
true 2024
SyntaxError
SyntaxError
TypeError`,
          },
        ],
        followUps: ['How would you serialize a Map to JSON?', 'What does `toJSON` do?'],
      },
      related: ['js-shallow-deep-copy', 'js-number-type-bigint'],
    },
    {
      id: 'js-reduce-patterns',
      level: 'intermediate',
      priority: 2,
      question: 'How does `reduce` work? Use it to count, group and index data.',
      tags: ['arrays', 'reduce', 'grouping', 'object-groupby'],
      answer: {
        interview: `**\`reduce(callback, initialValue)\` walks the array and carries an *accumulator*: each call receives \`(accumulator, item, index, array)\` and returns the next accumulator; the final one is the result.**

- Always pass an initial value that matches the result type: \`0\` for sums, \`{}\` for lookups, \`[]\` for arrays, \`new Map()\`.
- Common patterns: sum/average, count occurrences, group by key, build an id → item index, flatten, compose functions.
- Return the accumulator from every call — forgetting it is the most common bug.
- \`Object.groupBy(items, fn)\` (ES2024) and \`Map.groupBy\` now cover grouping directly.
- If \`reduce\` gets hard to read, a plain \`for...of\` loop is fine.

Real-world: turning an array of API records into \`{ [id]: record }\` for O(1) lookups.`,
        explanationBn: `\`reduce\` একটা array-কে ধাপে ধাপে একটা "ফলাফল"-এ নামিয়ে আনে। মূল ধারণা হলো **accumulator** — একটা চলমান ফলাফল, যেটা প্রতিটা item দেখার পর আপডেট হয়।

\`\`\`js
arr.reduce((acc, item) => নতুন_acc, শুরুর_মান)
\`\`\`
- প্রথম call-এ \`acc\` = শুরুর মান।
- প্রতিটা call যা **return** করে, সেটাই পরের call-এর \`acc\`।
- শেষ call-এর return = পুরো \`reduce\`-এর ফল।

**শুরুর মান বেছে নেওয়া** — ফলাফল কী ধরনের হবে তার ওপর:
- যোগফল → \`0\`
- গণনা বা lookup → \`{}\`
- নতুন list → \`[]\`

**প্রচলিত pattern:**
- **গণনা:** প্রতিটা শব্দ কতবার আছে।
- **Group:** city অনুযায়ী user ভাগ করা।
- **Index:** \`{ [id]: item }\` — পরে id দিয়ে O(1)-এ খোঁজা।

**সবচেয়ে common bug:** callback থেকে \`acc\` return করতে ভুলে যাওয়া → পরের ধাপে \`acc\` হয়ে যায় \`undefined\`।

ES2024-এ \`Object.groupBy()\` এসেছে — grouping-এর জন্য আর \`reduce\` লাগে না। আর \`reduce\` জটিল হয়ে গেলে সাধারণ \`for...of\` loop লেখা লজ্জার কিছু না — readability বেশি জরুরি।`,
        examples: [
          {
            lang: 'javascript',
            code: `const words = ["a", "b", "a", "c", "a"];
const counts = words.reduce((acc, w) => {
  acc[w] = (acc[w] ?? 0) + 1;
  return acc;
}, {});
console.log(counts);

const users = [
  { id: 7, name: "Rafi", city: "Dhaka" },
  { id: 9, name: "Nadia", city: "Sylhet" },
  { id: 4, name: "Sam", city: "Dhaka" },
];
const byId = users.reduce((acc, u) => ({ ...acc, [u.id]: u.name }), {});
console.log(byId);

const grouped = Object.groupBy(users, (u) => u.city);
console.log(Object.keys(grouped), grouped.Dhaka.map((u) => u.name));`,
            output: `{ a: 3, b: 1, c: 1 }
{ '4': 'Sam', '7': 'Rafi', '9': 'Nadia' }
[ 'Dhaka', 'Sylhet' ] [ 'Rafi', 'Sam' ]`,
          },
        ],
        pitfalls: [
          'Forgetting to return the accumulator makes it `undefined` on the next step.',
          'Spreading the accumulator on every step (`{ ...acc }`) is O(n²) for large arrays — mutate a local accumulator instead.',
        ],
        followUps: ['Implement `reduce` yourself.', 'Implement `groupBy`.'],
      },
      related: ['js-array-iteration-methods'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'js-property-order',
      level: 'advanced',
      priority: 1,
      question: 'In what order are object properties iterated?',
      tags: ['objects', 'property-order', 'iteration'],
      answer: {
        interview: `**Own string keys are ordered: integer-like keys (array indexes) first in ascending numeric order, then all other string keys in insertion order. Symbol keys come last, in insertion order (only with \`Reflect.ownKeys\`).**

- This order applies to \`Object.keys\`, \`entries\`, \`JSON.stringify\`, \`for...in\` (own properties) and spread.
- "Integer-like" means a canonical non-negative integer string: \`"2"\` counts, \`"02"\` and \`"-1"\` do not.
- So an object keyed by numeric IDs is always sorted numerically, regardless of insertion order.
- If insertion order matters for any key type, use a \`Map\`.

Real-world: a lookup object keyed by product IDs "re-sorts" itself — surprising when rendering in the order the API returned.`,
        explanationBn: `Object-এর key-এর ক্রম আসলে নির্দিষ্ট নিয়মে চলে, আর সেই নিয়ম অনেককে অবাক করে:

1. **Integer-এর মতো key আগে**, ছোট থেকে বড় সংখ্যার ক্রমে — যোগ করার ক্রম যা-ই হোক।
2. **তারপর বাকি string key**, যে ক্রমে যোগ করা হয়েছে।
3. **শেষে symbol key** (শুধু \`Reflect.ownKeys\` দেখায়)।

"Integer-এর মতো" মানে ঠিক array index-এর মতো দেখতে string: \`"2"\` হ্যাঁ, কিন্তু \`"02"\`, \`"-1"\`, \`"1.5"\` না — ওগুলো সাধারণ string key হিসেবে insertion order মানে।

**বাস্তব প্রভাব:** API থেকে product ID দিয়ে একটা object বানালেন — \`{ 300: ..., 100: ..., 200: ... }\`। Loop চালালে আসবে 100, 200, 300 — API-র ক্রম হারিয়ে গেছে! এটা অনেক UI bug-এর কারণ।

সমাধান: ক্রম গুরুত্বপূর্ণ হলে **\`Map\`** ব্যবহার করুন — Map সবসময়, সব ধরনের key-র জন্য, insertion order রাখে।`,
        examples: [
          {
            lang: 'javascript',
            code: `const byId = { 300: "c", 100: "a", 200: "b" };
console.log(Object.keys(byId));

const mixed = { b: 1, 10: 1, a: 1, 2: 1, "02": 1, "-1": 1, [Symbol("s")]: 1 };
console.log(Object.keys(mixed), Reflect.ownKeys(mixed).length);

const ordered = new Map([[300, "c"], [100, "a"], [200, "b"]]);
console.log([...ordered.keys()]);`,
            output: `[ '100', '200', '300' ]
[ '2', '10', 'b', 'a', '02', '-1' ] 7
[ 300, 100, 200 ]`,
          },
        ],
        followUps: ['When would you choose a Map over an object?'],
      },
      related: ['js-object-keys-values-entries', 'js-map-vs-object'],
    },
    {
      id: 'js-sparse-arrays',
      level: 'advanced',
      priority: 1,
      question: 'What are sparse arrays (holes), and how do array methods treat them?',
      tags: ['arrays', 'sparse-arrays', 'holes', 'array-from'],
      answer: {
        interview: `**A sparse array has missing indexes ("holes") — e.g. \`new Array(3)\`, \`[1, , 3]\`, or assigning \`arr[10]\` on a short array. A hole is not the same as an element whose value is \`undefined\`.**

- \`forEach\`, \`map\`, \`filter\`, \`reduce\`, \`some\`, \`every\` and \`for...in\` **skip** holes (\`map\` keeps them as holes).
- \`for...of\`, spread, \`Array.from\`, \`find\`, \`includes\`, \`join\` and \`entries\` treat holes as \`undefined\`.
- \`1 in [1, , 3]\` is \`false\` — the index does not exist.
- \`new Array(3).map(...)\` does nothing useful; create real elements with \`Array.from({ length: 3 }, (_, i) => i)\` or \`new Array(3).fill(0)\`.
- Setting \`arr.length\` larger also creates holes; making it smaller truncates.

Real-world: \`Array(5).map((_, i) => i)\` returning \`[ <5 empty items> ]\` is a classic surprise; \`Array.from({ length: 5 }, (_, i) => i)\` works.`,
        explanationBn: `**Sparse array** মানে এমন array, যার মাঝে কিছু index-এ কিছুই নেই — "ফাঁকা ঘর" (hole)। এটা \`undefined\` value থাকা থেকে আলাদা: \`[undefined]\`-এ index 0 **আছে**, যার value \`undefined\`; কিন্তু \`[ , ]\`-এ index 0 **নেই-ই**।

কীভাবে তৈরি হয়:
- \`new Array(3)\` — length 3, কিন্তু তিনটাই ফাঁকা।
- \`[1, , 3]\` — মাঝে comma।
- \`arr[10] = "x"\` একটা ছোট array-তে — মাঝের সব ঘর ফাঁকা।

**সমস্যা হলো method-ভেদে আচরণ আলাদা:**
- \`forEach\`, \`map\`, \`filter\`, \`reduce\` ফাঁকা ঘর **এড়িয়ে যায়** — callback call-ই হয় না।
- \`for...of\`, spread, \`Array.from\`, \`includes\` ফাঁকা ঘরকে \`undefined\` হিসেবে দেখে।

**বিখ্যাত ফাঁদ:** \`new Array(5).map((_, i) => i)\` — \`map\` সব ফাঁকা ঘর এড়িয়ে যায়, তাই ফল এখনো ৫টা ফাঁকা ঘর, \`[0,1,2,3,4]\` না।

**সমাধান:** \`Array.from({ length: 5 }, (_, i) => i)\` — আসল element তৈরি করে। অথবা \`new Array(5).fill(0)\` দিয়ে আগে ভরে নিন।`,
        examples: [
          {
            lang: 'javascript',
            code: `const holes = [1, , 3];
console.log(holes.length, 1 in holes, holes[1]);

let visits = 0;
holes.forEach(() => visits++);
console.log("forEach visits:", visits, "| spread:", [...holes]);

console.log(new Array(3).map((_, i) => i));
console.log(Array.from({ length: 3 }, (_, i) => i), new Array(3).fill(0));`,
            output: `3 false undefined
forEach visits: 2 | spread: [ 1, undefined, 3 ]
[ <3 empty items> ]
[ 0, 1, 2 ] [ 0, 0, 0 ]`,
          },
        ],
        followUps: ['How do you create an array of N numbers?'],
      },
      related: ['js-array-iteration-methods'],
    },
    {
      id: 'js-array-from-of',
      level: 'foundation',
      priority: 1,
      question: 'What is the difference between `new Array(3)`, `Array.of(3)` and `Array.from()`?',
      tags: ['arrays', 'array-from', 'array-of', 'iterables'],
      answer: {
        interview: `**\`new Array(3)\` makes an empty array of length 3 (three holes), \`Array.of(3)\` makes \`[3]\`, and \`Array.from(x)\` builds a real array from any iterable or array-like.**

- \`new Array(n)\` with a single number sets the **length**; with any other arguments it lists elements — an inconsistent API.
- \`Array.of(...items)\` always treats arguments as elements — the fix for that inconsistency.
- \`Array.from(source, mapFn?)\` converts strings, Sets, Maps, \`arguments\`, NodeLists and \`{ length: n }\` objects; the optional map function runs on each item.
- \`Array.from({ length: n }, (_, i) => i)\` is the idiomatic way to generate a range.

Real-world: \`Array.from(document.querySelectorAll("li"))\` to use array methods on a NodeList, or \`Array.from(new Set(ids))\` to dedupe.`,
        explanationBn: `তিনটা দেখতে একই রকম, কিন্তু কাজ আলাদা:

- **\`new Array(3)\`** — এক সংখ্যার argument দিলে সেটা **length** হিসেবে ধরে: \`[ <3 empty items> ]\`। এগুলো \`undefined\` না, একেবারে ফাঁকা ঘর (hole) — \`map\` এগুলোকে এড়িয়ে যায়, তাই \`new Array(3).map(...)\` কিছুই করে না। আবার \`new Array(3, 4)\` দিলে \`[3, 4]\` — একই function-এর দুই রকম আচরণ, বিভ্রান্তিকর।
- **\`Array.of(3)\`** — সবসময় argument গুলোই element: \`[3]\`। এই বিভ্রান্তি দূর করতেই এসেছে।
- **\`Array.from(x)\`** — যেকোনো iterable (string, Set, Map) বা array-like (\`length\` আছে এমন object, যেমন \`arguments\`, NodeList) থেকে আসল array বানায়। দ্বিতীয় argument একটা map function।

সবচেয়ে কাজের কৌশল: \`Array.from({ length: 5 }, (_, i) => i)\` — \`{ length: 5 }\` একটা array-like, তাই পাঁচটা \`undefined\` পায় (hole না), আর map function index দিয়ে ভরে দেয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log(new Array(3), new Array(3, 4), Array.of(3));
console.log(new Array(3).map(() => "x"));
console.log(Array.from({ length: 5 }, (_, i) => i * 2));
console.log(Array.from("héllo"), Array.from(new Set([1, 1, 2])));
console.log(Array.from(new Map([["a", 1]])));`,
            output: `[ <3 empty items> ] [ 3, 4 ] [ 3 ]
[ <3 empty items> ]
[ 0, 2, 4, 6, 8 ]
[ 'h', 'é', 'l', 'l', 'o' ] [ 1, 2 ]
[ [ 'a', 1 ] ]`,
          },
        ],
        pitfalls: [
          '`new Array(3).map(fn)` does nothing — holes are skipped. Use `Array.from({ length: 3 }, fn)` or `new Array(3).fill(0)`.',
          '`new Array(-1)` and `new Array(2.5)` throw a `RangeError`.',
          '`new Array(3).fill([])` puts the **same** array in every slot; use `Array.from({ length: 3 }, () => [])`.',
        ],
        followUps: [
          'How do you create a 2D grid without shared rows?',
          'What is an array-like object?',
        ],
      },
      related: ['js-sparse-arrays', 'js-array-iteration-methods'],
    },
    {
      id: 'js-array-length',
      level: 'foundation',
      priority: 1,
      question: 'What happens when you change an array’s `length` property directly?',
      tags: ['arrays', 'length', 'sparse-arrays'],
      answer: {
        interview: `**\`length\` is writable: setting it smaller deletes the elements past the new end, setting it larger adds holes.**

- \`arr.length = 0\` empties the array **in place** — every reference to it sees the change, unlike \`arr = []\`.
- \`length\` is always one more than the highest index, so \`arr[10] = x\` on a 3-item array makes length 11 with holes in between.
- Truncation is permanent: shrinking and growing again does not bring the old values back.

Real-world: \`queue.length = 0\` clears an array that other modules hold a reference to.`,
        explanationBn: `Array-র \`length\` শুধু পড়ার জিনিস না — লেখাও যায়, আর লিখলে array আসলেই বদলায়।

- **ছোট করলে** — নতুন length-এর পরের সব element মুছে যায়। আবার বড় করলেও সেগুলো ফেরত আসে না।
- **বড় করলে** — শেষে ফাঁকা ঘর (hole) যোগ হয়।
- **দূরের index-এ লিখলে** — length লাফিয়ে বেড়ে যায়, মাঝখানে hole।

\`arr.length = 0\` বনাম \`arr = []\` — interview-তে প্রায়ই আসে। \`arr = []\` শুধু এই variable-কে নতুন array-তে নিয়ে যায়; অন্য কেউ পুরনো array ধরে থাকলে সে সব data দেখতেই থাকে। \`arr.length = 0\` **সেই array-টাকেই** খালি করে — সবার কাছেই খালি।`,
        examples: [
          {
            lang: 'javascript',
            code: `const nums = [1, 2, 3, 4, 5];
nums.length = 2;
console.log(nums);
nums.length = 4;
console.log(nums);

const shared = [1, 2, 3];
const alias = shared;
shared.length = 0;           // empties the one array both names point to
console.log(alias, alias.length);

const letters = ["a"];
letters[3] = "d";
console.log(letters, letters.length);`,
            output: `[ 1, 2 ]
[ 1, 2, <2 empty items> ]
[] 0
[ 'a', <2 empty items>, 'd' ] 4`,
          },
        ],
        pitfalls: [
          'Shrinking `length` silently destroys data.',
          'Reassigning (`arr = []`) does not clear the array for other references; `arr.length = 0` does.',
          'A `const` array can still be emptied with `length = 0`.',
        ],
        followUps: ['What are the ways to empty an array, and how do they differ?'],
      },
      related: ['js-sparse-arrays', 'js-const-mutation'],
    },
    {
      id: 'js-map-set-key-equality',
      level: 'intermediate',
      priority: 1,
      question: 'How do `Map` and `Set` decide whether two keys are the same?',
      tags: ['map', 'set', 'equality', 'samevaluezero'],
      answer: {
        interview: `**They use the SameValueZero algorithm: like \`===\`, except \`NaN\` equals \`NaN\` — and objects are compared by reference, never by content.**

- \`new Set([NaN, NaN]).size\` is 1; \`0\` and \`-0\` are the same key.
- No type coercion: \`1\` and \`"1"\` are different keys (unlike plain object keys, which become strings).
- Two objects with identical content are two different keys — a \`Set\` of \`{ id: 1 }\` literals does not dedupe.
- To key by content, use a primitive key such as an id or a serialized string.

Real-world: deduping records needs \`new Map(items.map(i => [i.id, i]))\`, not \`new Set(items)\`.`,
        explanationBn: `Map আর Set key মেলানোর জন্য **SameValueZero** নিয়ম ব্যবহার করে — প্রায় \`===\`-এর মতো, শুধু দুটো পার্থক্য: \`NaN\` নিজের সমান ধরা হয়, আর \`0\` ও \`-0\` একই।

**Object-এর ক্ষেত্রে reference দেখা হয়, content না।** \`{ id: 1 }\` দুবার লিখলে memory-তে দুটো আলাদা object — Set দুটোকেই রাখবে। তাই object-এর তালিকা থেকে duplicate সরাতে Set সরাসরি কাজে আসে না; একটা primitive key (যেমন \`id\`) দিয়ে Map বানাতে হয়।

**সাধারণ object-এর সাথে তুলনা:** object-এর key সবসময় string হয়ে যায় — তাই \`obj[1]\` আর \`obj["1"]\` একই। Map-এ \`1\` আর \`"1"\` আলাদা key, কারণ কোনো type conversion হয় না।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log(new Set([NaN, NaN, 0, -0]).size);

const m = new Map([[1, "number"], ["1", "string"]]);
console.log(m.size, m.get(1), m.get("1"));

const obj = { 1: "number" };
obj["1"] = "string";
console.log(Object.keys(obj).length, obj[1]);

const users = [{ id: 1 }, { id: 1 }, { id: 2 }];
console.log(new Set(users).size);
const byId = new Map(users.map((u) => [u.id, u]));
console.log(byId.size, [...byId.keys()]);`,
            output: `2
2 number string
1 string
3
2 [ 1, 2 ]`,
          },
        ],
        pitfalls: [
          '`new Set(arrayOfObjects)` never removes content-duplicates.',
          '`map.get({ id: 1 })` with a fresh literal always returns `undefined`.',
        ],
        followUps: [
          'When should you choose a `Map` over a plain object?',
          'How does `includes` compare values?',
        ],
      },
      related: ['js-map-vs-object', 'js-object-is', 'js-remove-duplicates-flatten'],
    },
  ],
});

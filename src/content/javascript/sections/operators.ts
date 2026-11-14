import { defineSection } from '../../define';

export const operators = defineSection({
  id: 'js-operators',
  title: 'Operators & Type Coercion',
  description:
    '== vs ===, how implicit coercion really works, the logical and nullish operators, optional chaining, spread/rest and destructuring.',
  order: 3,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'js-loose-vs-strict-equality',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between `==` and `===`?',
      tags: ['equality', 'type-coercion', 'operators'],
      answer: {
        interview: `**\`===\` (strict equality) compares type and value with no conversion. \`==\` (loose equality) converts the operands to a common type first, following a fixed set of coercion rules, then compares.**

- \`1 === "1"\` is \`false\`; \`1 == "1"\` is \`true\` (the string becomes a number).
- Key \`==\` rules: \`null == undefined\` is \`true\` and they equal nothing else; booleans become numbers; strings vs numbers → numbers; objects are converted to primitives.
- Surprising results: \`0 == ""\`, \`"0" == false\`, \`[] == false\` are all \`true\`, while \`[] == []\` is \`false\` (two different objects).
- Both use reference comparison for two objects, and both say \`NaN\` is not equal to anything.
- Rule of thumb: always use \`===\`. The one common, accepted exception is \`x == null\` to test for "null or undefined".

Real-world: linters (ESLint \`eqeqeq\`) enforce \`===\` because \`==\` bugs are hard to spot in review.`,
        explanationBn: `**\`===\` (strict):** type আর value দুটোই মিলতে হবে, কোনো রূপান্তর ছাড়া। \`1 === "1"\` → \`false\`, কারণ একটা number, অন্যটা string।

**\`==\` (loose):** type আলাদা হলে আগে একটা নির্দিষ্ট নিয়মে **রূপান্তর (coercion)** করে, তারপর তুলনা করে। মূল নিয়মগুলো:
1. \`null\` আর \`undefined\` শুধু একে অপরের সমান — আর কারও না।
2. Boolean থাকলে সেটা number হয়ে যায় (\`true\` → 1, \`false\` → 0)।
3. String আর number হলে string-টা number হয়।
4. Object থাকলে আগে primitive-এ রূপান্তর হয় (\`[]\` → \`""\`, \`[1]\` → \`"1"\`)।

এই নিয়মগুলো ধাপে ধাপে চালালে অদ্ভুত ফলাফল আসে:
- \`[] == false\`: false → 0; \`[]\` → \`""\` → 0; \`0 == 0\` → \`true\`!
- অথচ \`[]\` truthy (\`if ([])\` চলে)। অর্থাৎ একটা জিনিস "false-এর সমান" কিন্তু "truthy" — এই স্ববিরোধই দেখায় কেন \`==\` এড়ানো উচিত।

**নিয়ম:** সবসময় \`===\`। একমাত্র গ্রহণযোগ্য ব্যতিক্রম \`x == null\` — এটা এক লাইনে "\`null\` অথবা \`undefined\`" চেক করে, আর অনেক style guide এটা অনুমোদন করে।

Visualize tab-এর টেবিলে যেকোনো জুটিতে tap করলে ধাপে ধাপে রূপান্তর দেখা যায়।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log(1 == "1", 1 === "1");
console.log(0 == "", "0" == false, [] == false);
console.log(null == undefined, null == 0, undefined == "");
console.log([] == [], NaN == NaN);
console.log(Boolean([]), [] == false);   // truthy, yet "== false"

const value = undefined;
console.log(value == null ? "missing" : "present");`,
            output: `true false
true true true
true false false
false false
true true
missing`,
          },
        ],
        pitfalls: [
          '`==` is not transitive: `"0" == 0` and `0 == ""` but `"0" != ""`.',
          '`x == null` is fine for null/undefined checks; anywhere else, prefer `===`.',
        ],
        followUps: [
          'Walk through how `[] == false` is evaluated.',
          'What does `Object.is` do differently from `===`?',
        ],
      },
      visualizationId: 'js-coercion-table',
      related: ['js-implicit-coercion', 'js-object-is'],
    },
    {
      id: 'js-spread-vs-rest',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between the spread and rest operators?',
      tags: ['spread', 'rest', 'arrays', 'objects', 'functions'],
      answer: {
        interview: `**They use the same \`...\` syntax for opposite jobs: spread *expands* an iterable or object into individual elements; rest *collects* remaining elements into an array or object.**

- **Spread** (where values are *used*): \`[...a, ...b]\`, \`{ ...defaults, ...overrides }\`, \`Math.max(...nums)\`, \`fn(...args)\`.
- **Rest** (where values are *received*): \`function f(first, ...others)\`, \`const [head, ...tail] = arr\`, \`const { id, ...rest } = obj\`.
- Rest must be the **last** element; a function can have only one rest parameter.
- Spread copies are **shallow**: nested objects are shared.
- In object spread, later properties win, so \`{ ...defaults, ...user }\` lets the user override defaults.
- Rest parameters are a real array, unlike the old \`arguments\` object.

Real-world: \`const { password, ...safeUser } = user\` removes a field before sending a user object to the client.`,
        explanationBn: `একই তিনটা ডট \`...\`, কিন্তু কাজ উল্টো — কোথায় লেখা হয়েছে তার ওপর নির্ভর করে:

**Spread = খুলে ছড়িয়ে দেওয়া।** যেখানে value **ব্যবহার** হচ্ছে (array literal, object literal, function call), সেখানে \`...\` একটা collection-কে আলাদা আলাদা element-এ ভেঙে দেয়:
- \`[...a, ...b]\` — দুটো array জোড়া।
- \`Math.max(...nums)\` — array-এর প্রতিটা সংখ্যা আলাদা argument হিসেবে।
- \`{ ...defaults, ...user }\` — object merge; একই key থাকলে পরেরটা জেতে।

**Rest = বাকিগুলো জড়ো করা।** যেখানে value **গ্রহণ** করা হচ্ছে (function parameter, destructuring-এর বাঁ পাশ), সেখানে \`...\` "বাকি সবকিছু" একটা array বা object-এ জমা করে:
- \`function sum(...nums)\` — যত argument আসুক, সব একটা array-তে।
- \`const [first, ...rest] = list\`
- \`const { password, ...safeUser } = user\` — password বাদ দিয়ে বাকি সব field একটা নতুন object-এ। API-তে user পাঠানোর আগে sensitive field সরানোর খুব প্রচলিত কৌশল।

**একটা সতর্কতা:** spread দিয়ে কপি **shallow** — ভেতরের nested object কপি হয় না, shared থাকে। আর rest সবসময় শেষে থাকতে হয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `const a = [1, 2];
const b = [3, 4];
console.log([...a, ...b], Math.max(...a, ...b));

const defaults = { theme: "light", lang: "en" };
console.log({ ...defaults, theme: "dark" });

function sum(first, ...others) {
  return { first, others, total: others.reduce((s, n) => s + n, first) };
}
console.log(sum(1, 2, 3));

const user = { id: 7, name: "Rafi", password: "secret" };
const { password, ...safeUser } = user;
console.log(safeUser);`,
            output: `[ 1, 2, 3, 4 ] 4
{ theme: 'dark', lang: 'en' }
{ first: 1, others: [ 2, 3 ], total: 6 }
{ id: 7, name: 'Rafi' }`,
          },
          {
            lang: 'javascript',
            caption: 'Spread is a shallow copy',
            code: `const original = { name: "Rafi", address: { city: "Dhaka" } };
const copy = { ...original };
copy.name = "Nadia";
copy.address.city = "Sylhet";      // nested object is shared
console.log(original.name, original.address.city);`,
            output: `Rafi Sylhet`,
          },
        ],
        pitfalls: [
          'Spread copies are shallow — nested objects are still shared.',
          "`Math.max(...hugeArray)` can exceed the engine's argument limit for very large arrays; use `reduce`.",
          'A rest element must be last: `const [...a, b] = arr` is a SyntaxError.',
        ],
        followUps: [
          'How do you deep copy an object?',
          'What is the difference between rest parameters and `arguments`?',
        ],
      },
      related: ['js-destructuring', 'js-shallow-deep-copy'],
    },
    {
      id: 'js-logical-operators-nullish',
      level: 'foundation',
      priority: 2,
      question:
        'How do `&&`, `||` and `??` work, and what is the difference between `||` and `??`?',
      tags: ['operators', 'nullish-coalescing', 'short-circuit', 'defaults'],
      answer: {
        interview: `**\`&&\` and \`||\` return one of their operands (not necessarily a boolean) and short-circuit. \`??\` returns the right side only when the left side is \`null\` or \`undefined\`.**

- \`a || b\` → \`a\` if \`a\` is truthy, otherwise \`b\`.
- \`a && b\` → \`a\` if \`a\` is falsy, otherwise \`b\`.
- \`a ?? b\` → \`a\` unless \`a\` is \`null\`/\`undefined\`, otherwise \`b\`.
- **\`||\` vs \`??\`:** \`||\` treats \`0\`, \`""\`, \`false\` and \`NaN\` as "missing"; \`??\` does not. For defaults where \`0\` or \`""\` is valid, use \`??\`.
- Short-circuit: the right side is not evaluated if the left side decides the result — \`user && user.save()\`.
- Mixing \`??\` with \`||\` or \`&&\` without parentheses is a SyntaxError.

Real-world: \`const limit = query.limit ?? 20\` keeps a user's explicit \`limit=0\`, where \`||\` would turn it into 20.`,
        explanationBn: `**গুরুত্বপূর্ণ কথা:** JavaScript-এ \`&&\` আর \`||\` সবসময় \`true\`/\`false\` দেয় না — দুই পাশের কোনো একটা **operand-কেই** ফেরত দেয়।

- **\`a || b\`** — "প্রথম truthy-টা দাও"। \`a\` truthy হলে \`a\`, না হলে \`b\`। Default value দেওয়ার পুরনো কৌশল।
- **\`a && b\`** — "প্রথম falsy-টা দাও, সব truthy হলে শেষেরটা"। \`a\` falsy হলে \`a\`, না হলে \`b\`। "থাকলে তবেই কাজ করো" — \`user && user.name\`।
- **\`a ?? b\`** (nullish coalescing) — \`a\` যদি **শুধু \`null\` বা \`undefined\`** হয়, তবেই \`b\`।

**\`||\` বনাম \`??\` — এটাই আসল প্রশ্ন:**
ধরুন user volume \`0\` সেট করেছে:
- \`volume || 50\` → \`50\` ❌ (0 falsy, তাই বাদ পড়ল — user-এর পছন্দ হারিয়ে গেল)
- \`volume ?? 50\` → \`0\` ✓ (0 তো null/undefined না)

তাই default দেওয়ার সময় যদি \`0\`, \`""\` বা \`false\` বৈধ value হয়, সবসময় \`??\`।

**Short-circuit:** ফলাফল বাঁ পাশ দেখেই ঠিক হয়ে গেলে ডান পাশ evaluate-ই হয় না। তাই \`isLoggedIn && loadDashboard()\` — login না থাকলে function call-ই হয় না।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log("a" || "b", "" || "b", 0 || null);
console.log("a" && "b", "" && "b", 1 && 2 && 3);

const settings = { volume: 0, name: "", theme: null };
console.log(settings.volume || 50, settings.volume ?? 50);
console.log(settings.name || "anon", settings.name ?? "anon");
console.log(settings.theme ?? "light", settings.missing ?? "default");

let calls = 0;
const track = () => { calls++; return true; };
false && track();
true || track();
console.log("calls:", calls);`,
            output: `a b null
b  3
50 0
anon
light default
calls: 0`,
          },
        ],
        pitfalls: [
          '`x || default` overwrites valid `0`, `""` and `false` values.',
          '`a ?? b || c` is a SyntaxError — add parentheses.',
        ],
        followUps: ['What are `||=`, `&&=` and `??=`?', 'What is optional chaining?'],
      },
      related: ['js-optional-chaining', 'js-logical-assignment', 'js-truthy-falsy'],
    },
    {
      id: 'js-optional-chaining',
      level: 'foundation',
      priority: 2,
      question: 'What is optional chaining (`?.`)?',
      tags: ['optional-chaining', 'null-safety', 'operators'],
      answer: {
        interview: `**\`?.\` accesses a property, index or method only if the value on its left is not \`null\`/\`undefined\`; otherwise the whole expression short-circuits to \`undefined\` instead of throwing.**

- Property: \`user?.address?.city\`; index: \`list?.[0]\`; call: \`callback?.()\` (call only if it exists).
- It short-circuits the rest of the chain: in \`a?.b.c.d\`, if \`a\` is nullish, nothing after it is evaluated.
- It only guards against \`null\`/\`undefined\` — not against other falsy values or wrong types.
- Pairs naturally with \`??\`: \`user?.settings?.theme ?? "light"\`.
- You cannot assign through it: \`a?.b = 1\` is a SyntaxError.

Real-world: reading deeply nested, optional fields from API responses without a chain of \`&&\` checks.`,
        explanationBn: `Nested object থেকে data পড়ার সময় মাঝখানের কোনো অংশ না থাকলে error হয়:
\`\`\`js
user.address.city   // address না থাকলে → TypeError
\`\`\`
আগে এটা এড়াতে লিখতে হতো: \`user && user.address && user.address.city\` — লম্বা আর কষ্টকর।

**Optional chaining \`?.\`** এটা এক লাইনে করে: \`user?.address?.city\`। \`?.\`-এর বাঁ পাশের value যদি \`null\` বা \`undefined\` হয়, তাহলে error না দিয়ে পুরো expression সাথে সাথে \`undefined\` হয়ে যায়, ডানের বাকি অংশ evaluate-ই হয় না।

তিনটা রূপ:
- Property: \`obj?.prop\`
- Index/dynamic key: \`arr?.[0]\`, \`obj?.[key]\`
- Method call: \`onSuccess?.()\` — callback দেওয়া থাকলে call হবে, না থাকলে কিছুই হবে না।

\`??\`-এর সাথে জুটি বেঁধে default value দেওয়া সবচেয়ে প্রচলিত: \`user?.settings?.theme ?? "light"\`।

**সাবধানতা:** সব জায়গায় \`?.\` ছড়িয়ে দিলে আসল bug লুকিয়ে যায়। যে data অবশ্যই থাকার কথা, সেখানে \`?.\` না দিয়ে error হতে দেওয়াই ভালো — তাতে সমস্যা তাড়াতাড়ি ধরা পড়ে।`,
        examples: [
          {
            lang: 'javascript',
            code: `const user = { name: "Rafi", address: null, tags: ["admin"] };

console.log(user.address?.city);
console.log(user.tags?.[0], user.roles?.[0]);
console.log(user.address?.city ?? "unknown city");

const onDone = undefined;
console.log(onDone?.("finished"));      // not called, no error

try {
  console.log(user.address.city);
} catch (e) {
  console.log(e.name);
}`,
            output: `undefined
admin undefined
unknown city
undefined
TypeError`,
          },
        ],
        pitfalls: [
          'Overusing `?.` hides real bugs where a value should always exist.',
          '`?.` does not protect against non-nullish wrong types: `(5)?.toUpperCase()` still throws.',
        ],
        followUps: ['How does `?.` combine with `??`?'],
      },
      related: ['js-logical-operators-nullish'],
    },
    {
      id: 'js-destructuring',
      level: 'foundation',
      priority: 2,
      question: 'How does destructuring work for arrays and objects (defaults, renaming, nesting)?',
      tags: ['destructuring', 'arrays', 'objects', 'defaults'],
      answer: {
        interview: `**Destructuring unpacks values from arrays (by position) or objects (by property name) into variables in one statement.**

- Arrays: \`const [first, , third] = arr\` (skip with commas), \`const [head, ...rest] = arr\`.
- Objects: \`const { name, age } = user\`.
- **Rename:** \`const { name: userName } = user\`.
- **Defaults** apply only when the value is \`undefined\`: \`const { role = "user" } = user\`.
- **Nested:** \`const { address: { city } } = user\` — throws if \`address\` is missing, so add a default: \`{ address: { city } = {} }\`.
- Works in function parameters: \`function draw({ x = 0, y = 0 } = {})\`.
- Swap without a temp: \`[a, b] = [b, a]\`.

Real-world: \`const { data, error } = await fetchUser()\` and named options objects for functions.`,
        explanationBn: `Destructuring মানে একটা array বা object থেকে value বের করে এক লাইনে variable-এ বসানো।

**Array — অবস্থান (position) দিয়ে:**
\`\`\`js
const [first, second] = ["a", "b"];
const [, , third] = list;        // comma দিয়ে বাদ দেওয়া
const [head, ...rest] = list;    // বাকি সব
\`\`\`

**Object — নাম দিয়ে:** \`const { name, age } = user;\` — variable-এর নাম আর property-র নাম একই হতে হবে।

তিনটা কাজের বৈশিষ্ট্য:
1. **নাম বদলানো (rename):** \`const { name: userName } = user;\` — property \`name\`, কিন্তু variable \`userName\`। Colon-এর পরের নামটাই variable।
2. **Default:** \`const { role = "guest" } = user;\` — শুধু value \`undefined\` হলে default বসে, \`null\` হলে না।
3. **Nested:** \`const { address: { city } } = user;\` — কিন্তু \`address\` না থাকলে error, তাই nested default দিন: \`{ address: { city } = {} }\`।

Function parameter-এ destructuring খুব শক্তিশালী — options object-এর জন্য:
\`\`\`js
function connect({ host = "localhost", port = 5432 } = {}) { ... }
connect({ port: 3306 });
\`\`\`
শেষের \`= {}\` জরুরি — না দিলে কোনো argument ছাড়া \`connect()\` call করলে error হতো।`,
        examples: [
          {
            lang: 'javascript',
            code: `const [first, , third, ...rest] = [10, 20, 30, 40, 50];
console.log(first, third, rest);

const user = { name: "Rafi", role: undefined, address: { city: "Dhaka" } };
const { name: userName, role = "guest", address: { city } } = user;
console.log(userName, role, city);

const { profile: { bio } = {} } = user;     // nested default avoids a crash
console.log(bio);

function connect({ host = "localhost", port = 5432 } = {}) {
  return \`\${host}:\${port}\`;
}
console.log(connect(), connect({ port: 3306 }));

let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b);`,
            output: `10 30 [ 40, 50 ]
Rafi guest Dhaka
undefined
localhost:5432 localhost:3306
2 1`,
          },
        ],
        pitfalls: [
          'Destructuring a nested property of a missing object throws a `TypeError`.',
          'Defaults apply only for `undefined`, not `null`.',
          'A statement starting with `{` is parsed as a block: wrap object destructuring assignments in parentheses: `({ a } = obj)`.',
        ],
        followUps: ['How would you destructure function parameters with defaults?'],
      },
      related: ['js-spread-vs-rest'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'js-implicit-coercion',
      level: 'intermediate',
      priority: 2,
      question:
        'Explain implicit type coercion: why is `"5" + 3` `"53"` but `"5" - 3` `2`? What about `[] + {}`?',
      tags: ['type-coercion', 'operators', 'plus-operator'],
      answer: {
        interview: `**JavaScript converts operands automatically, and the rules depend on the operator.**

- **\`+\`** is overloaded: if **either** operand is a string (after converting objects to primitives), it concatenates; otherwise it adds numbers. So \`"5" + 3\` → \`"53"\`.
- **\`-\`, \`*\`, \`/\`, \`%\`** are numeric only: both sides become numbers. So \`"5" - 3\` → \`2\`, \`"5" * "2"\` → \`10\`, \`"abc" - 1\` → \`NaN\`.
- Objects are first converted to a primitive (\`valueOf\`, then \`toString\`): \`[]\` → \`""\`, \`[1, 2]\` → \`"1,2"\`, \`{}\` → \`"[object Object]"\`.
- So \`[] + {}\` → \`"" + "[object Object]"\` → \`"[object Object]"\`, and \`[] + []\` → \`""\`.
- Unary \`+x\` converts to a number: \`+"42"\` → \`42\`, \`+true\` → \`1\`, \`+[]\` → \`0\`.
- \`true + 1\` → \`2\`; \`null + 1\` → \`1\`; \`undefined + 1\` → \`NaN\`.

Real-world: form inputs are strings, so \`input.value + 1\` gives \`"51"\` — convert explicitly with \`Number(...)\` first.`,
        explanationBn: `JavaScript ভুল type পেলে error না দিয়ে নিজেই রূপান্তর করে — একে বলে **implicit coercion**। কোন operator কী করবে সেটা মনে রাখলেই সব puzzle সমাধান হয়:

**\`+\` operator দুই কাজ করে:**
- দুই পাশের যেকোনো একটা **string** হলে → string জোড়া (concatenation)।
- না হলে → সংখ্যার যোগ।

তাই \`"5" + 3\` → একটা string আছে → \`"53"\`।

**\`-\`, \`*\`, \`/\` শুধু গণিত জানে:** দুই পাশকেই number বানায়। তাই \`"5" - 3\` → \`5 - 3\` → \`2\`। String যদি সংখ্যায় রূপান্তরযোগ্য না হয় → \`NaN\`।

**Object থাকলে আগে primitive বানানো হয়:**
- \`[]\` → \`""\` (খালি string)
- \`[1, 2]\` → \`"1,2"\`
- \`{}\` → \`"[object Object]"\`

তাই \`[] + {}\` → \`"" + "[object Object]"\` → \`"[object Object]"\`। আর \`[] + []\` → \`"" + ""\` → \`""\`।

**বাস্তব bug:** HTML input-এর value সবসময় string। \`quantity.value + 1\` লিখলে \`"5"\` থেকে হয় \`"51"\`! আগে \`Number(quantity.value)\` করে নিতে হয়।

শিক্ষা: implicit coercion-এর ওপর ভরসা না করে নিজে স্পষ্টভাবে রূপান্তর করুন — \`Number()\`, \`String()\`, \`Boolean()\`।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log("5" + 3, "5" - 3, "5" * "2", "abc" - 1);
console.log(1 + 2 + "3", "1" + 2 + 3);
console.log([] + {}, [] + [], [1, 2] + [3]);
console.log(+"42", +true, +[], +{});
console.log(true + 1, null + 1, undefined + 1);

const inputValue = "5";              // e.g. from a form field
console.log(inputValue + 1, Number(inputValue) + 1);`,
            output: `53 2 10 NaN
33 123
[object Object]  1,23
42 1 0 NaN
2 1 NaN
51 6`,
          },
        ],
        pitfalls: [
          '`+` is evaluated left to right: `1 + 2 + "3"` is `"33"`, but `"1" + 2 + 3` is `"123"`.',
          'Form values and query parameters are strings — convert them before arithmetic.',
        ],
        followUps: [
          'How does JavaScript convert an object to a primitive?',
          'What is the difference between `Number()` and `parseInt()`?',
        ],
      },
      visualizationId: 'js-coercion-table',
      related: ['js-loose-vs-strict-equality', 'js-to-primitive', 'js-number-vs-parseint'],
    },
    {
      id: 'js-number-vs-parseint',
      level: 'intermediate',
      priority: 2,
      question:
        'What is the difference between `Number()`, `parseInt()`, `parseFloat()` and unary `+`?',
      tags: ['type-conversion', 'parseint', 'numbers'],
      answer: {
        interview: `**\`Number(x)\` and unary \`+x\` convert the whole value strictly; \`parseInt\`/\`parseFloat\` read a string from the start and stop at the first character they cannot parse.**

- \`Number("42px")\` → \`NaN\`; \`parseInt("42px")\` → \`42\`.
- \`Number("")\` and \`Number("  ")\` → \`0\` (surprising); \`parseInt("")\` → \`NaN\`.
- \`parseInt\` truncates decimals: \`parseInt("3.9")\` → \`3\`; \`parseFloat("3.9")\` → \`3.9\`.
- Always pass a radix: \`parseInt(str, 10)\`; \`parseInt("0x1A")\` is 26 by default.
- \`parseInt\` converts its argument to a string first: \`parseInt(0.0000005)\` → \`5\` (because it is \`"5e-7"\`).
- \`Number(null)\` → \`0\`, \`Number(undefined)\` → \`NaN\`, \`Number(true)\` → \`1\`.

Real-world: use \`Number()\` (plus \`Number.isFinite\`) to validate user input strictly; use \`parseInt(x, 10)\` to read numbers out of strings like \`"120px"\`.`,
        explanationBn: `চারটাই string থেকে number বানায়, কিন্তু কতটা কড়া — সেখানে পার্থক্য:

**\`Number(x)\` আর \`+x\` — কড়া:** পুরো string-টা একটা বৈধ সংখ্যা হতে হবে। একটাও অবৈধ character থাকলে \`NaN\`। \`Number("42px")\` → \`NaN\`। (\`+x\` হুবহু \`Number(x)\`-এর মতো, শুধু ছোট লেখা।)

**\`parseInt\` / \`parseFloat\` — উদার:** string-এর শুরু থেকে পড়তে থাকে, যেখানে অচেনা character পায় সেখানে থেমে যায় আর যতটুকু পড়েছে সেটা দেয়। \`parseInt("42px")\` → \`42\`। CSS value পড়তে কাজের।

কয়েকটা ফাঁদ:
- **খালি string:** \`Number("")\` → \`0\` (অবাক করা!), কিন্তু \`parseInt("")\` → \`NaN\`। তাই খালি input-কে \`Number\` দিয়ে validate করলে ভুল করে 0 পাওয়া যায়।
- **Radix:** \`parseInt\`-এ সবসময় দ্বিতীয় argument \`10\` দিন। \`"0x"\` দিয়ে শুরু হলে সে hexadecimal ধরে নেয়।
- **ছোট দশমিক সংখ্যা:** \`parseInt(0.0000005)\` → \`5\`! কারণ \`parseInt\` আগে argument-কে string বানায়, আর এই সংখ্যার string হলো \`"5e-7"\` — শুরুর "5" পড়ে থেমে যায়।

এই শেষ ফাঁদটাই বিখ্যাত \`["1","2","3"].map(parseInt)\` puzzle-এর কারণ।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log(Number("42px"), parseInt("42px", 10), +"42");
console.log(Number(""), Number("  "), parseInt("", 10));
console.log(parseInt("3.9", 10), parseFloat("3.9"), Number("3.9"));
console.log(parseInt("0x1A"), parseInt("101", 2));
console.log(parseInt(0.0000005), String(0.0000005));
console.log(Number(null), Number(undefined), Number(true), Number([5]));`,
            output: `NaN 42 42
0 0 NaN
3 3.9 3.9
26 5
5 5e-7
0 NaN 1 5`,
          },
        ],
        pitfalls: [
          '`Number("")` is `0`, so an empty input passes a naive `!isNaN(Number(x))` check.',
          '`["1", "2", "3"].map(parseInt)` gives `[1, NaN, NaN]` because `map` passes the index as the radix.',
        ],
        followUps: ['Why does `["1","2","3"].map(parseInt)` return `[1, NaN, NaN]`?'],
      },
      related: ['js-implicit-coercion', 'js-nan'],
    },
    {
      id: 'js-logical-assignment',
      level: 'intermediate',
      priority: 1,
      question: 'What do the logical assignment operators `||=`, `&&=` and `??=` do?',
      tags: ['operators', 'logical-assignment', 'es2021'],
      answer: {
        interview: `**They combine a logical operator with assignment, and they only assign when needed (short-circuit).**

- \`a ||= b\` → assign \`b\` only if \`a\` is falsy (≈ \`a || (a = b)\`).
- \`a &&= b\` → assign \`b\` only if \`a\` is truthy.
- \`a ??= b\` → assign \`b\` only if \`a\` is \`null\`/\`undefined\`.
- Because the assignment is skipped otherwise, setters are not triggered unnecessarily.

Real-world: \`cache[key] ??= computeExpensiveValue()\` computes and stores a value only the first time.`,
        explanationBn: `ES2021-এর তিনটা সংক্ষিপ্ত operator, যেগুলো "শর্তসাপেক্ষে assign" করে:

- **\`a ||= b\`** — \`a\` falsy হলে তবেই \`b\` বসাও।
- **\`a &&= b\`** — \`a\` truthy হলে তবেই \`b\` বসাও।
- **\`a ??= b\`** — \`a\` \`null\`/\`undefined\` হলে তবেই \`b\` বসাও।

সবচেয়ে কাজের \`??=\` — lazy initialization বা caching:
\`\`\`js
cache[key] ??= expensiveCalculation();
\`\`\`
প্রথমবার key না থাকায় হিসাব করে রাখে; পরের বার আগে থেকেই আছে, তাই ডান পাশ evaluate-ই হয় না — হিসাব আর হয় না।

\`||=\`-এর বদলে \`??=\` বেছে নেওয়ার কারণ \`||\` আর \`??\`-এর পার্থক্যের মতোই: value \`0\` বা \`""\` হলে \`||=\` সেটা overwrite করে ফেলবে।`,
        examples: [
          {
            lang: 'javascript',
            code: `const opts = { retries: 0, name: "", debug: true };
opts.retries ||= 3;      // 0 is falsy -> replaced
opts.name ??= "anon";    // "" is not nullish -> kept
opts.debug &&= "verbose";
opts.timeout ??= 5000;
console.log(opts);

let computed = 0;
const cache = {};
const get = (k) => (cache[k] ??= (computed++, k.toUpperCase()));
get("a"); get("a"); get("b");
console.log(cache, "computed:", computed);`,
            output: `{ retries: 3, name: '', debug: 'verbose', timeout: 5000 }
{ a: 'A', b: 'B' } computed: 2`,
          },
        ],
        followUps: ['When would you prefer `??=` over `||=`?'],
      },
      related: ['js-logical-operators-nullish'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'js-to-primitive',
      level: 'advanced',
      priority: 2,
      question:
        'How does JavaScript convert an object to a primitive (`valueOf`, `toString`, `Symbol.toPrimitive`)?',
      tags: ['type-coercion', 'toprimitive', 'valueof', 'tostring', 'symbols'],
      answer: {
        interview: `**When an object is used where a primitive is needed, the engine runs the ToPrimitive algorithm with a *hint* — \`"number"\`, \`"string"\` or \`"default"\`.**

1. If the object has \`[Symbol.toPrimitive](hint)\`, call it; it must return a primitive.
2. Otherwise, for hint \`"string"\` try \`toString()\` then \`valueOf()\`; for \`"number"\`/\`"default"\` try \`valueOf()\` then \`toString()\`. The first one that returns a primitive wins.

- Plain objects: \`valueOf()\` returns the object itself (not a primitive), so \`toString()\` gives \`"[object Object]"\`.
- Arrays: \`toString()\` joins the elements with commas.
- \`Date\` is special: its default hint is \`"string"\`, so \`date + 1\` concatenates while \`date - 0\` gives a timestamp.
- Template literals and \`String(x)\` use hint \`"string"\`; arithmetic and \`+x\` use \`"number"\`; \`+\` and \`==\` use \`"default"\`.

Real-world: defining \`valueOf\` on a \`Money\` class lets \`a > b\` compare amounts — but explicit methods are usually clearer.`,
        explanationBn: `Object যখন এমন জায়গায় ব্যবহার হয় যেখানে primitive দরকার (\`+\`, \`-\`, \`==\`, template literal), তখন JavaScript একটা নির্দিষ্ট algorithm চালায় — **ToPrimitive**। সাথে একটা "hint" দেয়: কী ধরনের primitive চাই।

- **\`"number"\`** — গণিতের operator (\`-\`, \`*\`, \`<\`), unary \`+\`।
- **\`"string"\`** — \`String(x)\`, template literal \`\${x}\`।
- **\`"default"\`** — \`+\` operator আর \`==\` (কারণ তারা জানে না string নাকি number চাই)।

**Algorithm:**
1. Object-এ \`Symbol.toPrimitive\` method থাকলে সেটাকে hint দিয়ে call করে — পুরো নিয়ন্ত্রণ আপনার হাতে।
2. না থাকলে:
   - hint "string" → আগে \`toString()\`, তারপর \`valueOf()\`
   - hint "number"/"default" → আগে \`valueOf()\`, তারপর \`toString()\`
   - যেটা প্রথম primitive ফেরত দেয়, সেটাই ফলাফল।

সাধারণ object-এর \`valueOf()\` object-টাই ফেরত দেয় (primitive না), তাই শেষে \`toString()\` চলে → \`"[object Object]"\`। Array-এর \`toString()\` element গুলো comma দিয়ে জোড়ে। এভাবেই \`[] + {}\`-এর মতো puzzle-এর উত্তর আসে।

\`Date\` ব্যতিক্রম: তার default hint "string", তাই \`date + 1\` string জোড়ে, কিন্তু \`date - 0\` timestamp দেয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `const money = {
  amount: 50,
  [Symbol.toPrimitive](hint) {
    return hint === "string" ? \`\${this.amount} BDT\` : this.amount;
  },
};
console.log(\`\${money}\`, money + 10, money * 2, money > 40);

const legacy = {
  valueOf() { return 7; },
  toString() { return "seven"; },
};
console.log(legacy + 1, String(legacy), \`\${legacy}\`);

const d = new Date(0);
console.log(typeof (d + 1), d - 0);`,
            output: `50 BDT 60 100 true
8 seven seven
string 0`,
          },
        ],
        followUps: ['Why does `[] + {}` produce `"[object Object]"`?'],
      },
      related: ['js-implicit-coercion'],
    },
    {
      id: 'js-relational-comparison-coercion',
      level: 'advanced',
      priority: 1,
      question: 'Why is `"10" < "9"` true, and why is `null >= 0` true while `null == 0` is false?',
      tags: ['comparison', 'type-coercion', 'null', 'strings'],
      answer: {
        interview: `**Relational operators (\`<\`, \`>\`, \`<=\`, \`>=\`) follow different rules from \`==\`.**

- If **both** operands are strings, they are compared **lexicographically** by UTF-16 code units: \`"10" < "9"\` is \`true\` because \`"1"\` < \`"9"\`.
- Otherwise both are converted to **numbers**: \`"10" < 9\` is \`false\` (10 < 9).
- \`null\` converts to \`0\` for relational comparison, so \`null >= 0\` is \`true\` — but \`==\` has a special rule that \`null\` only equals \`undefined\`, so \`null == 0\` is \`false\`.
- \`undefined\` converts to \`NaN\`, and every comparison with \`NaN\` is \`false\`: \`undefined < 1\`, \`undefined >= 1\` are both \`false\`.
- \`>=\` is defined as "not \`<\`", which is why \`null >= 0\` comes out \`true\`.

Real-world: sorting or comparing numeric strings from CSV or form data without converting them gives wrong orders.`,
        explanationBn: `\`<\`, \`>\` জাতীয় তুলনার নিয়ম \`==\`-এর নিয়ম থেকে আলাদা — আর এখান থেকেই অদ্ভুত ফলাফল আসে।

**দুই পাশেই string হলে → অভিধানের ক্রম (lexicographic):** অক্ষর ধরে ধরে তুলনা, সংখ্যার মান দেখে না। \`"10"\` আর \`"9"\`-এর প্রথম অক্ষর \`"1"\` আর \`"9"\` — \`"1"\` ছোট, তাই \`"10" < "9"\` সত্যি। এজন্য number-কে string হিসেবে sort করলে \`["1", "10", "2", "9"]\` হয়।

**অন্তত একটা string না হলে → দুটোই number-এ রূপান্তর।** \`"10" < 9\` → \`10 < 9\` → \`false\`।

**\`null\`-এর ধাঁধা:**
- \`null >= 0\` → relational তুলনায় \`null\` হয় \`0\` → \`0 >= 0\` → \`true\`।
- \`null == 0\` → \`==\`-এর বিশেষ নিয়ম: \`null\` শুধু \`undefined\`-এর সমান, আর কিছুর না → \`false\`।
- তাই \`null >= 0\` সত্য, \`null > 0\` মিথ্যা, \`null == 0\` মিথ্যা — যেটা গণিতের যুক্তিতে অসম্ভব, কিন্তু JavaScript-এ বাস্তব।

**\`undefined\`** number হলে \`NaN\`, আর \`NaN\`-এর সাথে সব তুলনা \`false\`।

শিক্ষা: তুলনার আগে data-কে সঠিক type-এ রূপান্তর করুন।`,
        examples: [
          {
            lang: 'javascript',
            code: `console.log("10" < "9", "10" < 9, "a" < "b", "B" < "a");
console.log(null >= 0, null > 0, null == 0);
console.log(undefined < 1, undefined >= 1, undefined == 0);
console.log(["10", "9", "2", "1"].sort());`,
            output: `true false true true
true false false
false false false
[ '1', '10', '2', '9' ]`,
          },
        ],
        followUps: ['How do you sort an array of numbers correctly?'],
      },
      related: ['js-loose-vs-strict-equality'],
    },
    {
      id: 'js-switch-comparison',
      level: 'foundation',
      priority: 1,
      question: 'How does `switch` compare values, and what is fall-through?',
      tags: ['switch', 'strict-equality', 'control-flow'],
      answer: {
        interview: `**\`switch\` compares with strict equality (\`===\`) and, without \`break\`, falls through into the next case.**

- No coercion: \`switch ("1")\` never matches \`case 1:\`.
- Execution starts at the first matching case and continues until \`break\`, \`return\` or the end — even through other \`case\` labels.
- Fall-through is useful to group cases (\`case "sat": case "sun": return "weekend";\`); accidental fall-through is a classic bug.
- \`default\` runs when nothing matches, wherever it is placed.
- \`switch (true)\` with conditions in each \`case\` works, but an \`if/else\` chain or an object lookup is usually clearer.

Real-world: reducers in Redux traditionally switch on \`action.type\`; a lookup object (\`handlers[action.type]\`) is a common alternative.`,
        explanationBn: `**তুলনা \`===\` দিয়ে** — কোনো type conversion নেই। তাই input থেকে আসা \`"1"\` (string) কখনো \`case 1:\` (number)-এ মিলবে না — form বা URL থেকে আসা data নিয়ে কাজ করার সময় এটা প্রায়ই bug ঘটায়।

**Fall-through:** মিলে যাওয়া \`case\` থেকে code চলা শুরু হয়, আর \`break\` না পাওয়া পর্যন্ত **পরের case গুলোর code-ও** চলতে থাকে — case label গুলো শুধু "শুরুর জায়গা", দেয়াল না।

এটা ইচ্ছা করে কাজে লাগানো যায় — কয়েকটা case একসাথে গুচ্ছ করতে। কিন্তু \`break\` ভুলে গেলে অপ্রত্যাশিত code চলে যায়। ESLint-এর \`no-fallthrough\` rule এটা ধরে।`,
        examples: [
          {
            lang: 'javascript',
            code: `function dayType(day) {
  switch (day) {
    case "sat":
    case "sun":
      return "weekend";      // grouped cases via fall-through
    default:
      return "weekday";
  }
}
console.log(dayType("sun"), dayType("mon"));

function label(code) {
  const out = [];
  switch (code) {
    case 1: out.push("one");     // no break: falls through
    case 2: out.push("two"); break;
    default: out.push("other");
  }
  return out.join(",");
}
console.log(label(1), label(2), label("1"));`,
            output: `weekend weekday
one,two two other`,
          },
        ],
        pitfalls: [
          'A missing `break` runs the next case’s code too.',
          'String input from forms or URLs never matches numeric cases.',
          '`let`/`const` declared in one `case` share the whole switch block — wrap a case in `{ }` to give it its own scope.',
        ],
        followUps: ['How would you replace a long `switch` with an object lookup?'],
      },
      related: ['js-loose-vs-strict-equality'],
    },
  ],
});

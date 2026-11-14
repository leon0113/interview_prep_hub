import { defineSection } from '../../define';

export const other = defineSection({
  id: 'js-other',
  title: 'Other Important Topics',
  description:
    'Debounce and throttle, timers, event propagation and delegation, modules, browser storage, strict mode and errors.',
  order: 9,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'js-settimeout-vs-setinterval',
      level: 'foundation',
      priority: 2,
      question: 'What is the difference between `setTimeout` and `setInterval`?',
      tags: ['timers', 'settimeout', 'setinterval', 'event-loop'],
      answer: {
        interview: `**\`setTimeout(fn, ms)\` runs \`fn\` once after *at least* \`ms\` milliseconds; \`setInterval(fn, ms)\` runs it repeatedly every \`ms\` milliseconds until cleared.**

- Both return an id; cancel with \`clearTimeout(id)\` / \`clearInterval(id)\`.
- The delay is a **minimum**: the callback waits for the call stack and earlier tasks; browsers clamp nested timers to ≥4 ms and throttle background tabs.
- \`setInterval\` does not wait for the previous run to finish — if the callback is slow or async, runs can pile up or overlap.
- **Recursive \`setTimeout\`** (schedule the next run at the end of the current one) guarantees a gap between runs and adapts to slow work — usually the better choice for polling.
- Extra arguments after the delay are passed to the callback.
- Forgetting \`clearInterval\` is a common memory leak.

Real-world: polling an API every 5 s with recursive \`setTimeout\` avoids overlapping requests when the server is slow.`,
        explanationBn: `**\`setTimeout\`** — নির্দিষ্ট সময় পরে **একবার** চালায়।
**\`setInterval\`** — নির্দিষ্ট সময় পরপর **বারবার** চালায়, যতক্ষণ না \`clearInterval\` করা হয়।

দুটোই একটা id ফেরত দেয়, যেটা দিয়ে বাতিল করা যায়।

**Delay মানে "ঠিক এই সময়ে" না, "কমপক্ষে এই সময় পরে"।** Callback queue-তে বসে অপেক্ষা করে — call stack ব্যস্ত থাকলে বা আগের task থাকলে দেরি হয়। Browser-এ পেছনের (inactive) tab-এর timer আরও ধীর করে দেওয়া হয়।

**\`setInterval\`-এর সমস্যা:** এটা আগের run শেষ হয়েছে কি না দেখে না। ধরুন প্রতি ১ সেকেন্ডে API call করছেন, কিন্তু server ৩ সেকেন্ড নিচ্ছে — request গুলো জমতে থাকে, একসাথে চলে, server-এর ওপর আরও চাপ।

**সমাধান — recursive \`setTimeout\`:**
\`\`\`js
async function poll() {
  await fetchData();
  setTimeout(poll, 1000);   // আগেরটা শেষ হলে তবেই পরেরটা schedule
}
\`\`\`
এতে প্রতিটা run-এর মাঝে নিশ্চিত বিরতি থাকে।

**Memory leak:** component বা page বন্ধ হলে \`clearInterval\` ভুলে গেলে interval চিরকাল চলে, আর তার callback যা ধরে আছে সব memory-তে থাকে।`,
        examples: [
          {
            lang: 'javascript',
            code: `const cancelled = setTimeout(() => console.log("never"), 5);
clearTimeout(cancelled);

setTimeout((name) => console.log("timeout fired once for", name), 10, "Rafi");

setTimeout(() => {
  let runs = 0;
  const id = setInterval(() => {
    runs++;
    console.log("interval run", runs);
    if (runs < 3) return;
    clearInterval(id);

    let polls = 0;
    (function poll() {             // recursive setTimeout: the next run waits for this one
      polls++;
      if (polls < 3) setTimeout(poll, 20);
      else console.log("polled", polls, "times with recursive setTimeout");
    })();
  }, 20);
}, 100);`,
            output: `timeout fired once for Rafi
interval run 1
interval run 2
interval run 3
polled 3 times with recursive setTimeout`,
          },
        ],
        pitfalls: [
          '`setInterval` with slow or async work can overlap runs.',
          'Forgetting `clearInterval` leaks the callback and everything it references.',
          'The delay is a minimum, never a guarantee.',
        ],
        followUps: [
          'Implement `setInterval` using `setTimeout`.',
          'What is the minimum delay of `setTimeout`?',
        ],
      },
      related: ['js-event-loop', 'js-debounce-vs-throttle'],
    },
    {
      id: 'js-esm-named-vs-default',
      level: 'foundation',
      priority: 2,
      question: 'What is the difference between named and default exports in ES modules?',
      tags: ['modules', 'esm', 'import', 'export'],
      answer: {
        interview: `**A module can have many named exports, imported with their exact names in braces, and at most one default export, imported with any name you choose.**

- Named: \`export const sum = ...\` → \`import { sum } from "./math.js"\`; rename with \`import { sum as add }\`.
- Default: \`export default function format() {}\` → \`import format from "./format.js"\` (any local name).
- Both together: \`import format, { sum } from "./utils.js"\`.
- Namespace import: \`import * as math from "./math.js"\`.
- Re-export: \`export { sum } from "./math.js"\`, \`export * from "./math.js"\`.
- Many teams prefer named exports: consistent names across the codebase, better autocomplete and refactoring, and accidental renames are impossible.

Real-world: a component library exposes named exports from an \`index.js\` barrel so consumers can tree-shake what they do not use.`,
        explanationBn: `ES module-এ কিছু বাইরে দিতে দুটো উপায়:

**Named export** — একটা module-এ যত খুশি। Import করার সময় **হুবহু সেই নাম** curly brace-এর ভেতরে লিখতে হয়:
\`\`\`js
export const sum = (a, b) => a + b;
export const PI = 3.14;
// অন্য file-এ:
import { sum, PI } from "./math.js";
import { sum as add } from "./math.js";   // নাম বদলে
\`\`\`

**Default export** — প্রতি module-এ **সর্বোচ্চ একটা**। Import-এ curly brace লাগে না, আর **যেকোনো নাম** দেওয়া যায়:
\`\`\`js
export default function formatDate() {}
// অন্য file-এ:
import formatDate from "./format.js";
import whatever from "./format.js";   // এটাও কাজ করে!
\`\`\`

**কোনটা ভালো?** অনেক team named export পছন্দ করে:
- পুরো codebase-এ একই জিনিসের একই নাম থাকে — খুঁজে পাওয়া সহজ।
- IDE autocomplete আর rename refactoring ঠিকমতো কাজ করে।
- Default export-এ প্রতিটা file ইচ্ছামতো নাম দিতে পারে — একই function তিন জায়গায় তিন নামে।

\`import * as math\` দিয়ে সব named export একটা object-এ নেওয়া যায়।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'math.js and app.js (two files)',
            code: `// math.js
export const PI = 3.14159;
export function area(r) { return PI * r * r; }
export default function describe() { return "geometry helpers"; }

// app.js
import describe, { area, PI as pi } from "./math.js";
import * as math from "./math.js";
// describe(), area(2), pi, math.area(2)`,
          },
        ],
        followUps: ['What is tree shaking?', 'How do ES modules differ from CommonJS?'],
      },
      related: ['js-commonjs-vs-esm'],
    },
    {
      id: 'js-storage-cookies',
      level: 'foundation',
      priority: 2,
      question: 'What is the difference between `localStorage`, `sessionStorage` and cookies?',
      tags: ['browser-storage', 'localstorage', 'sessionstorage', 'cookies', 'security'],
      answer: {
        interview: `**All three store small strings in the browser, but they differ in lifetime, scope, size and whether the server sees them.**

| | localStorage | sessionStorage | Cookies |
|---|---|---|---|
| Lifetime | until cleared | until the **tab** closes | until \`Expires\`/\`Max-Age\` (or session) |
| Scope | origin, all tabs | origin, **one tab** | domain/path, all tabs |
| Size | ~5–10 MB | ~5 MB | ~4 KB each |
| Sent to server | no | no | **yes, with every matching request** |
| JS access | yes | yes | yes, unless \`HttpOnly\` |

- Web Storage API: \`setItem\`, \`getItem\`, \`removeItem\`, \`clear\` — values are strings, so use \`JSON.stringify\`/\`parse\`.
- Storage is synchronous and blocks the main thread; use IndexedDB for large or structured data.
- **Security:** any script on the page (including injected XSS) can read Web Storage, so do not store auth tokens there. Session tokens belong in \`HttpOnly; Secure; SameSite\` cookies.
- \`storage\` events let other tabs react to \`localStorage\` changes.

Real-world: theme preference in \`localStorage\`, a multi-step form draft in \`sessionStorage\`, the login session in an \`HttpOnly\` cookie.`,
        explanationBn: `তিনটাই browser-এ ছোট data রাখার জায়গা, কিন্তু চারটা প্রশ্নে পার্থক্য:

**১. কতদিন থাকে?**
- \`localStorage\` — নিজে মুছে না ফেলা পর্যন্ত, browser বন্ধ করলেও।
- \`sessionStorage\` — শুধু সেই **tab** খোলা থাকা পর্যন্ত। Tab বন্ধ → মুছে গেল। এমনকি একই site-এর আরেকটা tab-ও দেখতে পায় না।
- Cookie — যে মেয়াদ দেওয়া হয় (\`Expires\`), বা না দিলে browser বন্ধ পর্যন্ত।

**২. কত বড়?** Storage প্রায় ৫–১০ MB; cookie মাত্র ~৪ KB।

**৩. Server কি দেখে?** — এটাই সবচেয়ে বড় পার্থক্য। **Cookie প্রতিটা request-এর সাথে নিজে থেকেই server-এ যায়।** Storage কখনো যায় না, শুধু JavaScript পড়তে পারে। তাই cookie-তে বড় data রাখলে প্রতিটা request ভারী হয়।

**৪. নিরাপত্তা:** Page-এ চলা **যেকোনো** script — XSS attack-এ ঢোকানো malicious script সহ — \`localStorage\` পড়তে পারে। তাই login token \`localStorage\`-এ রাখা ঝুঁকিপূর্ণ। নিরাপদ উপায়: \`HttpOnly\` cookie — JavaScript সেটা পড়তেই পারে না, শুধু browser server-এ পাঠায়। সাথে \`Secure\` (শুধু HTTPS) আর \`SameSite\` (CSRF থেকে সুরক্ষা)।

**ব্যবহারিক নিয়ম:** theme/language পছন্দ → \`localStorage\`; একটা tab-এর form draft → \`sessionStorage\`; login session → \`HttpOnly\` cookie।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'Browser-only code (Web Storage stores strings)',
            code: `localStorage.setItem("theme", "dark");
localStorage.setItem("prefs", JSON.stringify({ fontSize: 16 }));
const prefs = JSON.parse(localStorage.getItem("prefs") ?? "{}");

sessionStorage.setItem("checkoutStep", "2");      // gone when this tab closes

document.cookie = "lang=bn; Max-Age=31536000; Path=/; SameSite=Lax";
// The session cookie is set by the server and is invisible to JavaScript:
// Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict`,
          },
        ],
        pitfalls: [
          'Storing auth tokens in `localStorage` exposes them to any XSS.',
          'Web Storage only stores strings — objects become `"[object Object]"` without `JSON.stringify`.',
          'Large cookies slow down every request.',
        ],
        followUps: [
          'What do `HttpOnly`, `Secure` and `SameSite` do?',
          'When would you use IndexedDB?',
        ],
      },
    },
    {
      id: 'js-strict-mode',
      level: 'foundation',
      priority: 2,
      question: 'What is strict mode, and what does it change?',
      tags: ['strict-mode', 'errors', 'this', 'best-practices'],
      answer: {
        interview: `**Strict mode (\`"use strict"\`) is an opt-in, safer variant of JavaScript that turns silent mistakes into errors and removes some confusing features.**

What changes:
- Assigning to an undeclared variable throws \`ReferenceError\` instead of creating a global.
- \`this\` in a plain function call is \`undefined\`, not the global object.
- Writing to read-only or frozen properties, or adding properties to non-extensible objects, throws \`TypeError\`.
- Duplicate parameter names, \`with\`, and octal literals like \`010\` are syntax errors.
- \`arguments\` is no longer linked to named parameters; \`eval\` gets its own scope.
- Reserved words (\`implements\`, \`private\`…) cannot be used as names.

**ES modules and class bodies are strict automatically**, so most modern code is already strict.

Real-world: a typo like \`totl = 5\` silently creating a global is caught immediately in strict mode.`,
        explanationBn: `**Strict mode** হলো JavaScript-এর একটা "কড়া" সংস্করণ। File বা function-এর শুরুতে \`"use strict";\` লিখলে চালু হয়। উদ্দেশ্য: যে ভুলগুলো আগে **চুপচাপ** ঘটত, সেগুলোকে **error** বানানো — যাতে সাথে সাথে ধরা পড়ে।

**প্রধান পরিবর্তনগুলো:**
1. **Declare না করা variable-এ assign → error।** Sloppy mode-এ \`totl = 5\` (টাইপো) চুপচাপ একটা global variable বানিয়ে ফেলে। Strict mode-এ \`ReferenceError\`।
2. **Plain function call-এ \`this\` হয় \`undefined\`** — global object না। ফলে detached method-এর ভুল সাথে সাথে error দেয়, global object-এ ভুল করে কিছু লেখা হয় না।
3. **Read-only বা frozen object-এ লেখা → \`TypeError\`** (sloppy mode-এ চুপচাপ ব্যর্থ)।
4. একই নামের দুটো parameter, \`with\` statement, \`010\`-এর মতো পুরনো octal — সব syntax error।

**ভালো খবর:** **ES module আর class-এর ভেতরের code স্বয়ংক্রিয়ভাবে strict।** তাই আধুনিক project-এ (React, Vite, TypeScript output) সাধারণত আলাদা করে লিখতে হয় না।`,
        examples: [
          {
            lang: 'javascript',
            code: `function sloppy() {
  typoVariable = 1;              // silently creates a global
  return this === globalThis;
}

function strict() {
  "use strict";
  const results = [this];
  try {
    anotherTypo = 1;
  } catch (e) {
    results.push(e.name);
  }
  try {
    Object.freeze({ a: 1 }).a = 2;
  } catch (e) {
    results.push(e.name);
  }
  return results;
}

console.log(sloppy(), typeof typoVariable);
console.log(strict());`,
            output: `true number
[ undefined, 'ReferenceError', 'TypeError' ]`,
          },
        ],
        followUps: ['Which code is strict automatically?'],
      },
      related: ['js-scope-types', 'js-this-keyword'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'js-debounce-vs-throttle',
      level: 'intermediate',
      priority: 3,
      question: 'What is the difference between debounce and throttle? Implement both.',
      tags: ['debounce', 'throttle', 'performance', 'closures', 'timers'],
      answer: {
        interview: `**Both limit how often a function runs during a burst of events. Debounce waits until the events *stop* for \`wait\` ms, then runs once. Throttle runs at most once every \`wait\` ms *while* the events keep coming.**

- **Debounce** — search-as-you-type, auto-save, validating a field, window resize "done". Each new call cancels the pending timer and starts a new one (\`clearTimeout\` + \`setTimeout\`).
- **Throttle** — scroll and mousemove handlers, drag, infinite scroll checks, rate-limited buttons. Calls inside the window are ignored (or the last one is run at the end — "trailing").
- Both are closures that keep a timer id / last-run timestamp.
- Variants: leading vs trailing edge, \`maxWait\` for debounce, and a \`cancel()\` method.
- Use \`fn.apply(this, args)\` so the wrapped function keeps its \`this\` and arguments.

Real-world: debouncing a search box cuts 10 keystrokes into 1 API request; throttling a scroll handler from ~100 calls/s to 10.`,
        explanationBn: `দুটোই একটা function-কে "ঘনঘন" চলা থেকে আটকায় — যখন event খুব দ্রুত, বারবার আসে (typing, scroll, resize)। কিন্তু নীতি আলাদা:

**Debounce — "থামলে তবে একবার":**
প্রতিটা নতুন call আগের অপেক্ষমাণ timer বাতিল করে নতুন timer শুরু করে। তাই function চলে শুধু তখনই, যখন user নির্দিষ্ট সময় (যেমন ৩০০ms) কোনো event দেয়নি।
- **Search box:** user "javascript" টাইপ করছে — ১০টা keystroke, কিন্তু টাইপ থামার পর **একটাই** API request।
- Auto-save, form validation, resize শেষ হলে layout হিসাব।

**Throttle — "চলতে থাকলেও নির্দিষ্ট বিরতিতে একবার":**
প্রথম call সাথে সাথে চলে, তারপর নির্দিষ্ট সময় পর্যন্ত বাকি সব call উপেক্ষা করে। Event যতক্ষণ আসতে থাকে, function **নিয়মিত বিরতিতে** চলতে থাকে।
- **Scroll handler:** scroll-এ সেকেন্ডে ১০০ বার event আসে, throttle করে সেকেন্ডে ১০ বার।
- Infinite scroll-এ নিচে পৌঁছেছে কি না চেক, game-এ gun fire rate।

**মনে রাখার উপায়:** লিফটের দরজা = debounce (শেষ মানুষ ঢোকার কিছুক্ষণ পরে বন্ধ হয়, প্রতিটা নতুন মানুষ timer আবার শুরু করে)। ট্রেনের সময়সূচি = throttle (যাত্রী যতই আসুক, প্রতি ১০ মিনিটে একটা ট্রেন)।

**Implementation-এর মূল কথা — closure:** debounce একটা \`timeoutId\` মনে রাখে, throttle শেষবার কখন চলেছে তা মনে রাখে। \`fn.apply(this, args)\` দিয়ে call করা জরুরি, যাতে মূল function-এর \`this\` আর argument ঠিক থাকে।

Visualize tab-এ নিজে টাইপ বা click করে তিনটা timeline (raw, debounced, throttled) পাশাপাশি দেখা যায়।`,
        examples: [
          {
            lang: 'javascript',
            code: `function debounce(fn, wait) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, wait) {
  let last = -Infinity;
  return function (...args) {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn.apply(this, args);
    }
  };
}

const searches = [];
let scrollCalls = 0;
const search = debounce((q) => searches.push(q), 50);
const onScroll = throttle(() => scrollCalls++, 100);

// 5 quick keystrokes (10 ms apart) and 26 scroll events (every 10 ms for 250 ms)
["j", "ja", "jav", "java", "javas"].forEach((q, i) => setTimeout(() => search(q), i * 10));
for (let t = 0; t <= 250; t += 10) setTimeout(() => onScroll(), t);

setTimeout(() => {
  console.log("debounced searches:", searches);
  console.log("throttled scroll calls:", scrollCalls, "of 26 events");
}, 400);`,
            output: `debounced searches: [ 'javas' ]
throttled scroll calls: 3 of 26 events`,
          },
        ],
        pitfalls: [
          'Creating a new debounced function on every render/call resets its timer each time — create it once.',
          'Calling `fn()` instead of `fn.apply(this, args)` loses `this` and arguments.',
          'A leading-only throttle drops the final event; add a trailing call if the last value matters.',
        ],
        followUps: [
          'Add a `cancel()` method and a leading-edge option to debounce.',
          'How would you add a trailing call to throttle?',
        ],
      },
      visualizationId: 'js-debounce-throttle',
      related: ['js-closure-use-cases', 'js-settimeout-vs-setinterval'],
    },
    {
      id: 'js-event-delegation',
      level: 'intermediate',
      priority: 2,
      question: 'Explain event bubbling, capturing and event delegation.',
      tags: ['dom-events', 'bubbling', 'capturing', 'event-delegation'],
      answer: {
        interview: `**A DOM event travels in three phases: *capturing* (from \`window\` down to the target), *target*, then *bubbling* (from the target back up to \`window\`). Listeners run in the bubbling phase by default; pass \`{ capture: true }\` to run during capturing.**

- \`event.target\` is the element where the event originated; \`event.currentTarget\` is the element whose listener is running.
- \`stopPropagation()\` stops further travel; \`preventDefault()\` cancels the browser's default action (they are unrelated).
- Some events do not bubble (\`focus\`, \`blur\`, \`mouseenter\`) — use \`focusin\`/\`focusout\` instead.
- **Event delegation:** attach one listener to a common ancestor and use \`event.target.closest(selector)\` to find which child was clicked.
  - Fewer listeners → less memory.
  - Works automatically for elements added later (dynamic lists).

Real-world: one \`click\` listener on a \`<ul>\` handles every \`<li>\`, including ones added after an API call.`,
        explanationBn: `কোনো element-এ click করলে event শুধু সেই element-এ ঘটে না — DOM tree ধরে **ভ্রমণ** করে, তিন ধাপে:

1. **Capturing phase:** \`window\` থেকে শুরু করে নিচে নামতে নামতে target পর্যন্ত।
2. **Target phase:** যে element-এ আসলে click হয়েছে।
3. **Bubbling phase:** target থেকে উপরে উঠতে উঠতে আবার \`window\` পর্যন্ত — পানির বুদবুদের মতো।

Default-এ listener চলে **bubbling** phase-এ। \`addEventListener("click", fn, { capture: true })\` দিলে capturing phase-এ চলে।

**দুটো property গুলিয়ে ফেলা হয়:**
- \`event.target\` — যেখানে event আসলে শুরু হয়েছে (যেমন ভেতরের \`<span>\`)।
- \`event.currentTarget\` — যে element-এর listener এখন চলছে।

**\`stopPropagation\` বনাম \`preventDefault\`:** প্রথমটা event-এর ভ্রমণ থামায়; দ্বিতীয়টা browser-এর default কাজ (link-এ গিয়ে navigate করা, form submit) বাতিল করে। দুটো সম্পূর্ণ আলাদা।

**Event delegation — bubbling-এর সবচেয়ে কাজের ব্যবহার:**
১০০০টা list item-এর প্রতিটায় আলাদা listener না দিয়ে parent \`<ul>\`-এ **একটা** listener দিন। যেকোনো \`<li>\`-তে click bubble হয়ে \`<ul>\`-এ পৌঁছায়; সেখানে \`event.target.closest("li")\` দিয়ে বের করুন কোন item।

সুবিধা:
- Listener কম → memory কম।
- পরে যোগ হওয়া item-এর জন্যও স্বয়ংক্রিয়ভাবে কাজ করে — নতুন listener লাগাতে হয় না।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'Browser code: one delegated listener for a dynamic list',
            code: `const list = document.querySelector("#todo-list");

list.addEventListener("click", (event) => {
  const item = event.target.closest("li[data-id]");
  if (!item || !list.contains(item)) return;     // click was not on an item

  if (event.target.matches(".delete")) {
    item.remove();
  } else {
    item.classList.toggle("done");
  }
});

// Items added later work automatically - no new listeners needed:
list.insertAdjacentHTML("beforeend", '<li data-id="42">New task <button class="delete">x</button></li>');`,
          },
        ],
        pitfalls: [
          '`event.target` may be a child of the element you care about — use `closest()`.',
          'Overusing `stopPropagation` breaks delegated listeners higher up.',
          '`focus`/`blur` do not bubble; use `focusin`/`focusout` for delegation.',
        ],
        followUps: ['What is the difference between `target` and `currentTarget`?'],
      },
    },
    {
      id: 'js-commonjs-vs-esm',
      level: 'intermediate',
      priority: 2,
      question: 'What is the difference between CommonJS and ES modules?',
      tags: ['modules', 'commonjs', 'esm', 'node'],
      answer: {
        interview: `**CommonJS (\`require\` / \`module.exports\`) is Node's original, synchronous, runtime module system. ES modules (\`import\` / \`export\`) are the language standard: static, asynchronous-loading and supported in browsers and Node.**

| | CommonJS | ES modules |
|---|---|---|
| Syntax | \`require()\`, \`module.exports\` | \`import\`, \`export\` |
| Resolved | at runtime (can be conditional) | statically, before running |
| Loading | synchronous | asynchronous; top-level \`await\` |
| Exports | a copied value (the exports object) | **live bindings** |
| \`this\` at top level | \`module.exports\` | \`undefined\` |
| Strict mode | opt-in | always |
| Tree-shaking | hard | easy (static) |

- In Node: \`.mjs\` or \`"type": "module"\` in \`package.json\` means ESM; \`.cjs\` means CommonJS.
- ESM can import CommonJS; CommonJS loads ESM with dynamic \`import()\` (and recent Node versions can \`require\` synchronous ESM).
- ESM has no \`__dirname\`/\`require\` — use \`import.meta.url\` / \`import.meta.dirname\`.

Real-world: bundlers can drop unused exports from ESM libraries (tree-shaking), which is why libraries now ship ESM builds.`,
        explanationBn: `JavaScript-এ code-কে file-এ ভাগ করার দুটো পদ্ধতি চালু আছে:

**CommonJS (CJS)** — Node.js-এর পুরনো, নিজস্ব পদ্ধতি:
\`\`\`js
const fs = require("fs");
module.exports = { sum };
\`\`\`

**ES Modules (ESM)** — JavaScript language-এর আনুষ্ঠানিক standard, browser আর Node দুজায়গাতেই:
\`\`\`js
import fs from "fs";
export const sum = ...;
\`\`\`

**মূল পার্থক্যগুলো:**

1. **Static বনাম dynamic:** \`require\` একটা সাধারণ function — runtime-এ চলে, \`if\`-এর ভেতরেও লেখা যায়। \`import\` static — code চালানোর আগেই engine সব import জেনে যায়। এর বড় সুবিধা **tree-shaking**: bundler দেখে কোন export কেউ ব্যবহার করে না, সেগুলো final bundle থেকে বাদ দেয়।

2. **Copy বনাম live binding:** CJS-এ import করার মুহূর্তের value পাওয়া যায়। ESM-এ পাওয়া যায় **live binding** — মূল module পরে value বদলালে import করা জায়গাতেও নতুন value দেখা যায়।

3. **Loading:** CJS synchronous; ESM asynchronous, তাই top-level \`await\` চলে।

4. ESM সবসময় strict mode; top-level \`this\` হলো \`undefined\`।

**Node-এ কোনটা কীভাবে বোঝে:** \`.mjs\` বা \`package.json\`-এ \`"type": "module"\` → ESM; \`.cjs\` → CommonJS।

ESM-এ \`__dirname\` নেই — \`import.meta.dirname\` (নতুন Node) বা \`import.meta.url\` থেকে বের করতে হয়।`,
        examples: [
          {
            lang: 'javascript',
            caption: 'CommonJS: require is a runtime function call',
            code: `const path = require("node:path");
const useFast = true;
const parser = useFast ? require("node:querystring") : require("node:url");   // conditional

console.log(typeof module.exports, this === module.exports);
console.log(path.basename("/tmp/report.pdf"), typeof parser.parse);`,
            output: `object true
report.pdf function`,
          },
          {
            lang: 'javascript',
            caption: 'ES module: static imports, live bindings, top-level await',
            code: `import { basename } from "node:path";

const config = await Promise.resolve({ env: "prod" });   // top-level await
console.log(basename("/tmp/report.pdf"), config.env, this, typeof import.meta.url);`,
            output: `report.pdf prod undefined string`,
          },
        ],
        followUps: ['What is tree-shaking?', 'How do you use `__dirname` in an ES module?'],
      },
      related: ['js-esm-named-vs-default', 'js-dynamic-import'],
    },
    {
      id: 'js-custom-errors',
      level: 'intermediate',
      priority: 2,
      question: 'What are the built-in error types, and how do you create a custom error class?',
      tags: ['errors', 'custom-errors', 'error-handling', 'classes'],
      answer: {
        interview: `**Built-ins: \`Error\` plus \`TypeError\`, \`ReferenceError\`, \`SyntaxError\`, \`RangeError\`, \`URIError\`, \`EvalError\` and \`AggregateError\`. Create your own by extending \`Error\`.**

- \`class ValidationError extends Error { constructor(message, field) { super(message); this.name = "ValidationError"; this.field = field; } }\`
- Set \`this.name\` so logs and stack traces show the right type.
- Extra properties (\`statusCode\`, \`field\`) let handlers react precisely; check with \`instanceof\`.
- **Error \`cause\`** (ES2022): \`new Error("Saving failed", { cause: originalError })\` chains errors without losing the root cause.
- Always throw \`Error\` objects, not strings — strings have no stack trace.
- In \`catch\`, the value is \`unknown\` in practice — anything can be thrown.

Real-world: an Express error middleware checks \`err instanceof NotFoundError\` to send 404 and logs everything else as 500.`,
        explanationBn: `**Built-in error type গুলো** — কখন কোনটা আসে:
- \`TypeError\` — ভুল type-এর ওপর কাজ: \`undefined\`-এর property পড়া, function না এমন কিছু call করা।
- \`ReferenceError\` — নেই এমন variable, বা TDZ-তে থাকা variable।
- \`SyntaxError\` — ভুল code বা ভুল JSON।
- \`RangeError\` — সীমার বাইরে: অসীম recursion, \`new Array(-1)\`।
- \`AggregateError\` — একসাথে অনেক error (\`Promise.any\`)।

**Custom error কেন?** Caller যেন error-এর **ধরন** দেখে আলাদা আচরণ করতে পারে — শুধু message-এর string পড়ে না। যেমন validation error হলে user-কে form-এ দেখানো, not found হলে 404 দেওয়া।

\`\`\`js
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}
\`\`\`
- \`super(message)\` — Error-এর message আর stack trace সেট করে।
- \`this.name\` সেট করা জরুরি — নইলে log-এ "Error" দেখাবে।
- বাড়তি তথ্য (\`field\`, \`statusCode\`) property হিসেবে রাখুন।

**\`cause\` (ES2022):** নিচের স্তরের error ধরে উপরের স্তরে অর্থপূর্ণ error দিন, কিন্তু মূল কারণটা \`cause\`-এ রেখে দিন — debugging-এ পুরো গল্প পাওয়া যায়।

**নিয়ম:** সবসময় \`Error\` object throw করুন, কখনো string না (\`throw "failed"\`) — string-এর কোনো stack trace থাকে না।`,
        examples: [
          {
            lang: 'javascript',
            code: `class AppError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = this.constructor.name;
  }
}
class NotFoundError extends AppError {
  statusCode = 404;
}
class ValidationError extends AppError {
  statusCode = 400;
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

function toResponse(err) {
  if (err instanceof AppError) return \`\${err.statusCode} \${err.name}: \${err.message}\`;
  return "500 Internal Server Error";
}

console.log(toResponse(new NotFoundError("user 7 not found")));
console.log(toResponse(new ValidationError("email is required", "email")));
console.log(toResponse(new TypeError("x is not a function")));

try {
  try {
    JSON.parse("{bad");
  } catch (e) {
    throw new AppError("Could not load settings", { cause: e });
  }
} catch (e) {
  console.log(e.name, "-", e.message, "| cause:", e.cause.name);
}`,
            output: `404 NotFoundError: user 7 not found
400 ValidationError: email is required
500 Internal Server Error
AppError - Could not load settings | cause: SyntaxError`,
          },
        ],
        pitfalls: [
          'Throwing strings loses the stack trace.',
          'Forgetting to set `this.name` makes every custom error log as "Error".',
        ],
        followUps: ['What is `error.cause` for?', 'Why should you not throw strings?'],
      },
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'js-dynamic-import',
      level: 'advanced',
      priority: 1,
      question: 'What is dynamic `import()`, and when is it useful?',
      tags: ['modules', 'dynamic-import', 'code-splitting', 'lazy-loading'],
      answer: {
        interview: `**\`import(specifier)\` loads a module at runtime and returns a promise for its namespace object. Unlike static \`import\`, it can be called conditionally, inside functions, with computed paths, and from CommonJS.**

- Code splitting: bundlers turn each \`import()\` into a separate chunk loaded on demand (\`React.lazy\`, route-level lazy loading).
- Load heavy or rarely used code only when needed (charts, editors, a PDF exporter).
- Feature or locale based loading: \`await import(\`./locales/\${lang}.js\`)\`.
- Default export is on \`.default\` of the namespace object.
- The module is still cached after the first load.

Real-world: this app loads each track's content and each visualization with \`import()\`, so the first page downloads only what it needs.`,
        explanationBn: `সাধারণ \`import\` statement-কে file-এর শুরুতে, static ভাবে লিখতে হয় — আর page load-এর সময়ই সব module লোড হয়। **Dynamic \`import()\`** একটা function-এর মতো: যেকোনো জায়গায়, যেকোনো সময় call করা যায়, আর একটা promise ফেরত দেয়।

\`\`\`js
button.addEventListener("click", async () => {
  const { exportPdf } = await import("./pdf-exporter.js");
  exportPdf(data);
});
\`\`\`
PDF exporter-এর ভারী code শুধু তখনই download হয়, যখন user আসলে button চাপে।

**ব্যবহার:**
- **Code splitting / lazy loading:** Vite বা webpack প্রতিটা \`import()\`-কে আলাদা chunk বানায়। প্রথমে শুধু জরুরি code লোড হয় — page দ্রুত খোলে। React-এর \`lazy()\`, route-ভিত্তিক loading এভাবেই কাজ করে।
- **শর্তসাপেক্ষ loading:** user-এর ভাষা অনুযায়ী translation file।
- **CommonJS থেকে ES module ব্যবহার।**

Default export পাওয়া যায় \`.default\` property-তে। একবার লোড হলে module cache হয় — দ্বিতীয়বার \`import()\` আর network-এ যায় না।

এই app-টাই এর উদাহরণ: প্রতিটা track-এর content আর প্রতিটা visualization আলাদা chunk, দরকার হলে তবেই লোড হয়।`,
        examples: [
          {
            lang: 'javascript',
            code: `async function formatReport(useCompression) {
  const { basename } = await import("node:path");
  const result = [basename("/reports/q3.csv")];
  if (useCompression) {
    const zlib = await import("node:zlib");           // loaded only when needed
    result.push(typeof zlib.gzipSync);
  }
  const again = await import("node:path");
  result.push(again.basename === basename);            // cached module
  return result;
}

formatReport(true).then((r) => console.log(r));`,
            output: `[ 'q3.csv', 'function', true ]`,
          },
        ],
        followUps: ['How do bundlers use `import()` for code splitting?'],
      },
      related: ['js-commonjs-vs-esm'],
    },
    {
      id: 'js-break-loops-labels',
      level: 'foundation',
      priority: 1,
      question: 'How do you break out of nested loops, and can you break out of `forEach`?',
      tags: ['loops', 'labels', 'break', 'foreach'],
      answer: {
        interview: `**A labelled \`break\` exits an outer loop directly; \`forEach\` cannot be stopped with \`break\` at all.**

- Label a loop (\`outer: for (...)\`) and use \`break outer\` or \`continue outer\` from an inner loop.
- \`break\` inside a \`forEach\` callback is a syntax error, and \`return\` only ends the current callback call, not the loop.
- Need an early exit? Use \`for...of\`, or \`some\`/\`every\`/\`find\`, which stop as soon as the answer is known.
- Often clearer still: move the nested loops into a function and \`return\`.

Real-world: searching a 2D grid for the first match — \`for...of\` with \`return\` inside a helper function.`,
        explanationBn: `**Nested loop থেকে বের হওয়া:** সাধারণ \`break\` শুধু ভেতরের loop থামায়। বাইরের loop-কে একটা নাম (label) দিলে \`break outer\` লিখে একবারেই দুটো থেকে বের হওয়া যায়।

**\`forEach\` থামানো যায় না।** \`forEach\` প্রতিটা element-এর জন্য আপনার callback function ডাকে — \`break\` সেখানে লেখা যায় না (function-এর ভেতরে loop নেই), আর \`return\` শুধু ওই এক call শেষ করে, পরের element-এ আবার চলে।

তাই আগেভাগে থামাতে হলে:
- \`for...of\` — \`break\`/\`return\` স্বাভাবিকভাবে কাজ করে।
- \`some\` / \`every\` / \`find\` — উত্তর পেলেই নিজে থেকে থেমে যায়।

Label খুব কম দেখা যায়; বেশিরভাগ সময় loop গুলো একটা function-এ রেখে \`return\` করা বেশি পরিষ্কার।`,
        examples: [
          {
            lang: 'javascript',
            code: `const grid = [[1, 2], [3, 4], [5, 6]];
let found = null;
outer: for (const row of grid) {
  for (const n of row) {
    if (n > 2) {
      found = n;
      break outer;
    }
  }
}
console.log("found", found);

const seen = [];
[1, 2, 3, 4].forEach((n) => {
  if (n === 2) return;       // skips 2 only — the loop keeps going
  seen.push(n);
});
console.log(seen);

const checked = [];
[1, 2, 3, 4].some((n) => { checked.push(n); return n === 2; });
console.log(checked);`,
            output: `found 3
[ 1, 3, 4 ]
[ 1, 2 ]`,
          },
        ],
        pitfalls: [
          '`return` inside `forEach` behaves like `continue`, not `break`.',
          'Throwing to escape `forEach` works but is an abuse of exceptions.',
        ],
        followUps: ['When would you choose `for...of` over `forEach`?'],
      },
      related: ['js-map-vs-foreach', 'js-for-in-vs-for-of'],
    },
    {
      id: 'js-try-finally-return',
      level: 'intermediate',
      priority: 1,
      question: 'What happens when `try`, `catch` and `finally` all contain `return` statements?',
      tags: ['errors', 'try-catch', 'finally', 'control-flow'],
      answer: {
        interview: `**\`finally\` always runs — after \`try\`/\`catch\`, even if they \`return\` or \`throw\` — and a \`return\` inside \`finally\` overrides theirs.**

- The return value of \`try\` is computed first, then \`finally\` runs, then the function returns.
- If \`finally\` itself returns (or throws), that replaces the earlier result and **swallows** any pending exception.
- Mutating an object in \`finally\` affects a returned object (same reference), but reassigning a returned primitive does not.
- Use \`finally\` for cleanup (closing files, hiding spinners, releasing locks) — never \`return\` from it.

Real-world: \`try { return await fetchData(); } finally { setLoading(false); }\`.`,
        explanationBn: `**\`finally\` সবসময় চলে** — \`try\` সফল হোক, \`catch\`-এ error ধরা পড়ুক, বা মাঝখানে \`return\` থাকুক।

ধাপগুলো:
1. \`try\`-এর \`return x\` — value \`x\` হিসাব হয়ে **অপেক্ষায়** থাকে।
2. তারপর \`finally\` চলে।
3. তারপর function সেই অপেক্ষমাণ value ফেরত দেয়।

কিন্তু \`finally\`-এর ভেতরে নিজের \`return\` থাকলে সেটা আগেরটাকে **বাতিল করে দেয়** — এমনকি \`try\` থেকে ছোড়া error-ও গিলে ফেলে, error কোথাও পৌঁছায় না! এটা ভয়ংকর bug, তাই \`finally\`-তে কখনো return লিখবেন না।

আরেকটা সূক্ষ্ম বিষয়: \`return count\` (primitive) হলে value আগেই কপি হয়ে গেছে, \`finally\`-তে \`count\` বদলালেও ফলাফল বদলায় না। কিন্তু object হলে একই reference — \`finally\`-তে mutate করলে caller সেটা দেখবে।`,
        examples: [
          {
            lang: 'javascript',
            code: `function order() {
  try {
    console.log("try");
    return "from try";
  } finally {
    console.log("finally");
  }
}
console.log(order());

function overrides() {
  try {
    throw new Error("lost");
  } finally {
    return "finally wins";   // swallows the error
  }
}
console.log(overrides());

function primitive() {
  let count = 1;
  try { return count; } finally { count = 99; }
}
console.log(primitive());`,
            output: `try
finally
from try
finally wins
1`,
          },
        ],
        pitfalls: [
          '`return` in `finally` silently discards exceptions.',
          'In async functions, `finally` runs after the awaited work settles — make sure you `await` inside `try`.',
        ],
        followUps: ['Does `finally` run if the `catch` block throws?'],
      },
      related: ['js-custom-errors', 'js-async-error-handling'],
    },
  ],
});

import { defineSection } from '../../define';

export const prototypesOop = defineSection({
  id: 'js-prototypes-oop',
  title: 'Prototypes & OOP',
  description:
    'Prototypal inheritance and the prototype chain, `__proto__` vs `prototype`, what `new` does, and ES6 classes with their modern features.',
  order: 7,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'js-classes',
      level: 'foundation',
      priority: 2,
      question: 'Are ES6 classes "real" classes? What are they underneath?',
      tags: ['classes', 'prototypes', 'syntactic-sugar', 'es6'],
      answer: {
        interview: `**Classes are mostly syntactic sugar over constructor functions and prototypes: \`typeof MyClass\` is \`"function"\`, and methods live on \`MyClass.prototype\`. Inheritance is still prototypal.**

They do add real differences, though:
- Class bodies are always in **strict mode**.
- A class **must** be called with \`new\` — calling it directly throws \`TypeError\`.
- Class declarations are hoisted but stay in the **TDZ** (unlike function declarations).
- Methods are **non-enumerable** (they do not show up in \`for...in\`).
- \`extends\` also sets up static inheritance and lets you subclass built-ins (\`Array\`, \`Error\`); \`super\` works properly.
- Newer features have no ES5 equivalent: \`#private\` fields, \`static\` blocks, class fields.

Real-world: when debugging, a class instance's methods are found on its prototype — \`Object.getPrototypeOf(obj) === MyClass.prototype\`.`,
        explanationBn: `ES6-এর \`class\` দেখতে Java বা C#-এর class-এর মতো, কিন্তু ভেতরে JavaScript-এর পুরনো **prototype** ব্যবস্থাই কাজ করে। \`class User {}\` লিখলে আসলে একটা constructor function তৈরি হয় (\`typeof User === "function"\`), আর class-এর method গুলো বসে \`User.prototype\`-এ — যেখান থেকে সব instance share করে।

তাই একে বলা হয় **syntactic sugar** — একই জিনিস, সুন্দর লেখার ধরন।

তবে পুরোপুরি "শুধু sugar" না — কিছু আসল পার্থক্য আছে, যেগুলো interview-তে বললে ভালো:
- Class-এর ভেতরের code সবসময় **strict mode**-এ চলে।
- **\`new\` ছাড়া call করা যায় না** — পুরনো constructor function-এ \`new\` ভুলে গেলে চুপচাপ ভুল হতো (\`this\` হয়ে যেত global)।
- Class hoist হয় কিন্তু TDZ-তে থাকে — declaration-এর আগে ব্যবহার করলে \`ReferenceError\`।
- Method গুলো **non-enumerable** — \`for...in\`-এ আসে না।
- \`extends\` দিয়ে built-in (\`Array\`, \`Error\`, \`Map\`) সঠিকভাবে subclass করা যায়, যেটা ES5-এ প্রায় অসম্ভব ছিল।
- \`#private\` field, \`static\` block — এগুলোর পুরনো কোনো সমতুল্য নেই।`,
        examples: [
          {
            lang: 'javascript',
            code: `class User {
  constructor(name) { this.name = name; }
  greet() { return \`hi \${this.name}\`; }
}

console.log(typeof User, typeof User.prototype.greet);
const u = new User("Rafi");
console.log(Object.getPrototypeOf(u) === User.prototype, Object.hasOwn(u, "greet"));
console.log(Object.keys(User.prototype));        // methods are non-enumerable

try {
  User("Rafi");
} catch (e) {
  console.log(e.name, "-", e.message);
}`,
            output: `function function
true false
[]
TypeError - Class constructor User cannot be invoked without 'new'`,
          },
        ],
        followUps: ['What is prototypal inheritance?', 'What does `new` do?'],
      },
      related: ['js-prototypal-inheritance', 'js-class-features'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'js-prototypal-inheritance',
      level: 'intermediate',
      priority: 3,
      question: 'What is a prototype, and how does prototypal inheritance work?',
      tags: ['prototypes', 'inheritance', 'prototype-chain', 'objects'],
      answer: {
        interview: `**Every object has an internal link, \`[[Prototype]]\`, to another object (or \`null\`). When you read a property the object does not have, JavaScript looks it up on the prototype, then the prototype's prototype, and so on — that is prototypal inheritance.**

- Objects inherit directly from other **objects**, not from classes.
- Methods are shared: they live once on the prototype instead of being copied into every instance.
- **Reading** walks the chain; **writing** (\`obj.x = 1\`) always creates/updates an own property on the object itself (shadowing the prototype's), unless a setter is inherited.
- Set or read the link with \`Object.create(proto)\`, \`Object.getPrototypeOf(obj)\`, \`Object.setPrototypeOf\` (slow — avoid), or \`class ... extends\`.
- The chain ends at \`Object.prototype\`, whose prototype is \`null\`.
- Changing a prototype affects every object that inherits from it — including existing ones.

Real-world: \`[].map\` works because every array's prototype is \`Array.prototype\`, which holds \`map\`.`,
        explanationBn: `**Prototype** হলো অন্য একটা object, যার সাথে প্রতিটা object একটা লুকানো link (\`[[Prototype]]\`) দিয়ে জোড়া।

**Inheritance কীভাবে কাজ করে:** কোনো object-এ একটা property পড়তে গেলে:
1. প্রথমে object-এর নিজের মধ্যে খোঁজে।
2. না পেলে তার prototype-এ যায়।
3. সেখানেও না পেলে prototype-এর prototype-এ।
4. এভাবে \`null\` পর্যন্ত — কোথাও না পেলে \`undefined\`।

এই link-এর সারিটাই **prototype chain**।

Class-ভিত্তিক language-এ (Java) class হলো নকশা আর object তার থেকে তৈরি। JavaScript-এ **object সরাসরি অন্য object থেকে inherit করে** — কোনো আলাদা "নকশা" লাগে না।

**কেন কাজের?** Method গুলো প্রতিটা object-এ কপি না হয়ে prototype-এ **একবার** থাকে, আর সব object share করে। লাখো array থাকলেও \`map\` function memory-তে একটাই — \`Array.prototype.map\`।

**পড়া বনাম লেখা — গুরুত্বপূর্ণ পার্থক্য:**
- **পড়া** chain ধরে উপরে যায়।
- **লেখা** (\`obj.x = 5\`) সবসময় object-এর **নিজের** property তৈরি করে — prototype-এরটা বদলায় না, শুধু ঢেকে দেয় (shadowing)।

আরেকটা শক্তিশালী (এবং বিপজ্জনক) দিক: prototype বদলালে সেই prototype থেকে inherit করা **সব** object — এমনকি আগে তৈরি হওয়াগুলোও — সাথে সাথে বদল দেখে। এজন্যই built-in prototype (\`Array.prototype\`) বদলানো খারাপ অভ্যাস।`,
        examples: [
          {
            lang: 'javascript',
            code: `const animal = {
  eats: true,
  describe() { return \`\${this.name} eats: \${this.eats}\`; },
};

const rabbit = Object.create(animal);    // rabbit's prototype is animal
rabbit.name = "Bunny";

console.log(rabbit.describe());           // method found on the prototype
console.log(Object.hasOwn(rabbit, "eats"), "eats" in rabbit);

rabbit.eats = false;                      // writing creates an OWN property
console.log(rabbit.eats, animal.eats);

animal.sleeps = true;                     // added later, visible immediately
console.log(rabbit.sleeps);
console.log(Object.getPrototypeOf(Object.getPrototypeOf(rabbit)) === Object.prototype);`,
            output: `Bunny eats: true
false true
false true
true
true`,
          },
        ],
        pitfalls: [
          'Assigning to an inherited property shadows it instead of changing the prototype.',
          'Modifying built-in prototypes (`Array.prototype.x = ...`) affects all code and can break libraries.',
          '`Object.setPrototypeOf` on existing objects de-optimises them in engines.',
        ],
        followUps: [
          'What is the difference between `__proto__` and `prototype`?',
          'What does `new` do step by step?',
          'How does `instanceof` work?',
        ],
      },
      visualizationId: 'js-prototype-chain',
      related: ['js-prototype-chain', 'js-proto-vs-prototype', 'js-classes'],
    },
    {
      id: 'js-prototype-chain',
      level: 'intermediate',
      priority: 2,
      question: 'Walk through the prototype chain of an array and of a class instance.',
      tags: ['prototypes', 'prototype-chain', 'arrays', 'classes'],
      answer: {
        interview: `**Every lookup follows \`[[Prototype]]\` links until it finds the property or reaches \`null\`.**

- An array: \`arr\` → \`Array.prototype\` (\`map\`, \`push\`…) → \`Object.prototype\` (\`hasOwnProperty\`, \`toString\`…) → \`null\`.
- A function: \`fn\` → \`Function.prototype\` (\`call\`, \`bind\`) → \`Object.prototype\` → \`null\`.
- A subclass instance: \`admin\` → \`Admin.prototype\` → \`User.prototype\` → \`Object.prototype\` → \`null\`.
- Methods are found on the first prototype that has them, so a subclass method **overrides** the parent's.
- Long chains cost a little per lookup; engines cache the results, so it rarely matters.
- \`Object.create(null)\` creates an object with no chain at all.

Real-world: \`arr.toString()\` uses \`Array.prototype.toString\` (comma-joined), which shadows \`Object.prototype.toString\` (\`"[object Object]"\`).`,
        explanationBn: `Prototype chain-কে একটা সিঁড়ির মতো ভাবুন — property খুঁজতে নিচ থেকে উপরে ওঠা হয়, প্রথম যে ধাপে পাওয়া যায় সেখানেই থামা।

**একটা array-র chain:**
\`[1, 2]\` → \`Array.prototype\` → \`Object.prototype\` → \`null\`
- \`arr.map\`? → \`Array.prototype\`-এ পাওয়া গেল।
- \`arr.hasOwnProperty\`? → \`Array.prototype\`-এ নেই, উপরে \`Object.prototype\`-এ পাওয়া গেল।

**Subclass instance-এর chain:**
\`admin\` → \`Admin.prototype\` → \`User.prototype\` → \`Object.prototype\` → \`null\`

**Override:** \`Admin.prototype\` আর \`User.prototype\` দুটোতেই \`describe\` থাকলে, নিচের (\`Admin\`)-টা আগে পাওয়া যায় — তাই সেটাই চলে। এটাই method overriding-এর পেছনের যান্ত্রিকতা।

একটা সুন্দর উদাহরণ: \`[1, 2].toString()\` দেয় \`"1,2"\`, কিন্তু \`({}).toString()\` দেয় \`"[object Object]"\`। কারণ array-র chain-এ \`Array.prototype.toString\` আগে পড়ে, যেটা \`Object.prototype.toString\`-কে ঢেকে দেয়।

Visualize tab-এ বিভিন্ন property পড়লে chain ধরে খোঁজার প্রতিটা ধাপ দেখা যায়।`,
        examples: [
          {
            lang: 'javascript',
            code: `const chain = (obj) => {
  const names = [];
  for (let p = Object.getPrototypeOf(obj); p; p = Object.getPrototypeOf(p)) {
    names.push(p.constructor.name + ".prototype");
  }
  return names.join(" -> ") + " -> null";
};

class User { describe() { return "user"; } }
class Admin extends User { describe() { return "admin, not " + super.describe(); } }

console.log(chain([1, 2]));
console.log(chain(() => {}));
console.log(chain(new Admin()));
console.log(new Admin().describe());
console.log([1, 2].toString(), ({}).toString());`,
            output: `Array.prototype -> Object.prototype -> null
Function.prototype -> Object.prototype -> null
Admin.prototype -> User.prototype -> Object.prototype -> null
admin, not user
1,2 [object Object]`,
          },
        ],
        followUps: ['What happens when a property is not found anywhere in the chain?'],
      },
      visualizationId: 'js-prototype-chain',
      related: ['js-prototypal-inheritance', 'js-instanceof'],
    },
    {
      id: 'js-proto-vs-prototype',
      level: 'intermediate',
      priority: 2,
      question: 'What is the difference between `__proto__` and `prototype`?',
      tags: ['prototypes', '__proto__', 'constructors'],
      answer: {
        interview: `**\`prototype\` is a property of constructor functions (and classes): it is the object that will become the \`[[Prototype]]\` of instances created with \`new\`. \`__proto__\` is an accessor on every object that exposes that object's own \`[[Prototype]]\`.**

- \`new User()\` → \`instance.__proto__ === User.prototype\`.
- Ordinary objects do not have a \`prototype\` property; only functions (except arrows and methods) do.
- \`User.prototype.constructor === User\`.
- \`User.__proto__\` is \`Function.prototype\` (a class is a function).
- \`__proto__\` is legacy — use \`Object.getPrototypeOf\` / \`Object.setPrototypeOf\` / \`Object.create\` in real code.

Real-world: when you add a method to \`User.prototype\`, every existing and future \`User\` instance gets it through \`__proto__\`.`,
        explanationBn: `নাম প্রায় একই, কিন্তু দুটো আলাদা জিনিস — আর এটাই prototype নিয়ে সবচেয়ে বেশি জিজ্ঞেস করা প্রশ্ন:

**\`prototype\`** — শুধু **function (constructor)**-এর একটা সাধারণ property। এটা একটা object, যেটা "ভবিষ্যতের instance-দের prototype" হবে। \`new User()\` লিখলে নতুন object-এর লুকানো link সেট হয় \`User.prototype\`-এর দিকে।

**\`__proto__\`** — **প্রতিটা object**-এর একটা accessor, যেটা দেখায় **এই object-এর নিজের prototype** কে।

একটা বাক্যে সম্পর্কটা:
\`\`\`js
new User().__proto__ === User.prototype   // true
\`\`\`

Analogy: \`User.prototype\` হলো কারখানার "মূল নকশার বই", যেটা কারখানার (constructor-এর) কাছে থাকে। আর প্রতিটা তৈরি হওয়া জিনিসের গায়ে একটা লেবেল (\`__proto__\`) লাগানো — "আমার নকশা ওই বইয়ে"।

আরও কিছু তথ্য:
- সাধারণ object-এর \`prototype\` property নেই — শুধু function-এর আছে (arrow function আর method-এরও নেই)।
- \`User.prototype.constructor\` ফিরে \`User\`-কেই দেখায়।
- Class নিজেও একটা function, তাই \`User.__proto__ === Function.prototype\`।

\`__proto__\` পুরনো, শুধু সামঞ্জস্যের জন্য রাখা। আধুনিক code-এ \`Object.getPrototypeOf()\` ব্যবহার করুন।`,
        examples: [
          {
            lang: 'javascript',
            code: `function User(name) { this.name = name; }
User.prototype.greet = function () { return "hi " + this.name; };

const u = new User("Rafi");
console.log(u.__proto__ === User.prototype, Object.getPrototypeOf(u) === User.prototype);
console.log(User.prototype.constructor === User);
console.log("prototype" in u, typeof User.prototype, (() => {}).prototype);
console.log(User.__proto__ === Function.prototype);`,
            output: `true true
true
false object undefined
true`,
          },
        ],
        followUps: ['What does `new` do with `Fn.prototype`?'],
      },
      visualizationId: 'js-prototype-chain',
      related: ['js-prototypal-inheritance', 'js-new-operator'],
    },
    {
      id: 'js-new-operator',
      level: 'intermediate',
      priority: 2,
      question: 'What does the `new` keyword do, step by step?',
      tags: ['new', 'constructors', 'prototypes', 'this'],
      answer: {
        interview: `**\`new Fn(...args)\` performs four steps:**

1. **Create** a brand-new empty object.
2. **Link** its \`[[Prototype]]\` to \`Fn.prototype\`.
3. **Call** \`Fn\` with \`this\` bound to the new object (and the given arguments).
4. **Return** the new object — unless \`Fn\` explicitly returns another **object**, in which case that object is returned instead (returned primitives are ignored).

- Classes do the same, but call the parent constructor first via \`super()\`, which is why \`this\` cannot be used before \`super()\` in a subclass.
- Arrow functions and methods cannot be used with \`new\` — they have no \`prototype\`.
- \`new.target\` tells a function whether it was called with \`new\`.

Real-world: writing a \`myNew(Fn, ...args)\` helper is a common interview task — it is exactly the four steps above.`,
        explanationBn: `\`new User("Rafi")\` লিখলে JavaScript চারটা কাজ করে — এটা মুখস্থ রাখার মতো:

1. **একটা নতুন খালি object তৈরি করে।** \`{}\`
2. **তার prototype link সেট করে** \`User.prototype\`-এ। এর ফলে নতুন object \`User.prototype\`-এর সব method পায়।
3. **\`User\` function-টা call করে, \`this\` = নতুন object।** তাই \`this.name = name\` আসলে নতুন object-এ property বসায়।
4. **নতুন object-টা ফেরত দেয়** — তবে একটা ব্যতিক্রম আছে: function নিজে যদি কোনো **object** return করে, তাহলে সেটাই ফেরত আসে, নতুন তৈরি object বাতিল। Primitive (number, string) return করলে উপেক্ষা করা হয়।

এই চারটা ধাপ দিয়ে নিজের \`new\` বানানো একটা প্রচলিত interview প্রশ্ন:
\`\`\`js
function myNew(Fn, ...args) {
  const obj = Object.create(Fn.prototype);      // ধাপ ১ + ২
  const result = Fn.apply(obj, args);           // ধাপ ৩
  return result instanceof Object ? result : obj; // ধাপ ৪
}
\`\`\`

Class-এ একটা ছোট পার্থক্য: subclass-এ object তৈরির দায়িত্ব parent-এর, তাই \`super()\` call করার আগে \`this\` ব্যবহার করা যায় না।`,
        examples: [
          {
            lang: 'javascript',
            code: `function User(name) {
  this.name = name;
}
User.prototype.greet = function () { return "hi " + this.name; };

function myNew(Fn, ...args) {
  const obj = Object.create(Fn.prototype);         // steps 1 + 2
  const result = Fn.apply(obj, args);              // step 3
  return result !== null && typeof result === "object" ? result : obj;   // step 4
}

const a = new User("Rafi");
const b = myNew(User, "Nadia");
console.log(a.greet(), b.greet(), b instanceof User);

function Weird() {
  this.lost = true;
  return { replaced: true };      // an object return wins
}
function Primitive() {
  this.kept = true;
  return 42;                      // a primitive return is ignored
}
console.log(new Weird(), new Primitive());`,
            output: `hi Rafi hi Nadia true
{ replaced: true } Primitive { kept: true }`,
          },
        ],
        followUps: ['Why can arrow functions not be used with `new`?', 'What is `new.target`?'],
      },
      related: ['js-proto-vs-prototype', 'js-this-keyword'],
    },
    {
      id: 'js-class-features',
      level: 'intermediate',
      priority: 2,
      question:
        'Explain class features: `extends`, `super`, `static`, `#private` fields, getters and setters.',
      tags: ['classes', 'inheritance', 'private-fields', 'static', 'getters-setters'],
      answer: {
        interview: `**Modern classes cover inheritance, encapsulation and class-level members.**

- **\`extends\` / \`super\`:** \`class Admin extends User\`; in the constructor, \`super(...)\` must be called before using \`this\`; \`super.method()\` calls the parent's version.
- **\`static\`:** members on the class itself, not instances — factory methods (\`User.fromJSON\`), counters, utilities. Static members are inherited by subclasses.
- **\`#private\` fields and methods:** truly private (enforced by the language, not convention); \`#x in obj\` checks for them. Not accessible from subclasses.
- **Getters / setters:** \`get fullName()\` / \`set fullName(v)\` run on property access and assignment — for computed values and validation.
- **Class fields:** \`count = 0\` declared in the body, initialised per instance.
- **\`static { }\` blocks** run once when the class is defined.

Real-world: \`class Money { #cents; static fromString(s) {...} get amount() { return this.#cents / 100; } }\`.`,
        explanationBn: `**\`extends\` আর \`super\`:**
- \`class Admin extends User\` — Admin, User-এর সবকিছু inherit করে।
- Subclass-এর constructor-এ **\`this\` ব্যবহারের আগে অবশ্যই \`super(...)\` ডাকতে হয়** — কারণ object আসলে তৈরি করে parent। না ডাকলে \`ReferenceError\`।
- \`super.method()\` দিয়ে parent-এর method চালানো যায় — override করা method-এর ভেতর থেকে মূলটা ব্যবহার করতে।

**\`static\`:** instance-এর না, **class-এর নিজের** member। \`User.fromJSON(data)\` — নতুন object তৈরির factory, বা মোট কতগুলো instance তৈরি হলো তার counter। Instance থেকে access করা যায় না।

**\`#private\`:** নামের আগে \`#\` দিলে সেটা সত্যিকারের private — class-এর বাইরে থেকে পড়লে বা লিখলে **SyntaxError** (code-ই চলবে না)। আগের \`_balance\` convention শুধু অনুরোধ ছিল, এটা ভাষার নিয়ম। Subclass-ও parent-এর \`#private\` দেখতে পায় না।

**Getter/Setter:** দেখতে property, কিন্তু আসলে method:
- \`get fullName()\` — \`user.fullName\` পড়লে চলে; computed value-র জন্য।
- \`set age(v)\` — \`user.age = 5\` লিখলে চলে; validation-এর জন্য।

**Class field:** constructor-এর বাইরে সরাসরি লেখা — \`count = 0;\` — প্রতিটা instance-এ আলাদা কপি।`,
        examples: [
          {
            lang: 'javascript',
            code: `class Account {
  static #created = 0;
  #balance = 0;                         // truly private

  constructor(owner) {
    this.owner = owner;
    Account.#created++;
  }
  static count() { return Account.#created; }

  get balance() { return this.#balance; }
  set balance(_) { throw new Error("use deposit()"); }
  deposit(amount) {
    if (amount <= 0) throw new Error("invalid amount");
    this.#balance += amount;
    return this;
  }
}

class Savings extends Account {
  constructor(owner, rate) {
    super(owner);                       // must come before using this
    this.rate = rate;
  }
  addInterest() { return this.deposit(this.balance * this.rate); }
}

const s = new Savings("Rafi", 0.1).deposit(1000).addInterest();
console.log(s.balance, Account.count(), s instanceof Account);
try { s.balance = 5; } catch (e) { console.log(e.message); }
console.log(Object.keys(s));`,
            output: `1100 1 true
use deposit()
[ 'owner', 'rate' ]`,
          },
        ],
        pitfalls: [
          'Using `this` before `super()` in a subclass constructor throws a `ReferenceError`.',
          "`#private` members are not inherited-accessible: subclasses cannot read the parent's `#field`.",
        ],
        followUps: [
          'How do `#private` fields compare with closures for privacy?',
          'Why must `super()` be called first?',
        ],
      },
      related: ['js-classes', 'js-class-fields-vs-methods'],
    },
    {
      id: 'js-instanceof',
      level: 'intermediate',
      priority: 1,
      question: 'How does `instanceof` work?',
      tags: ['instanceof', 'prototypes', 'type-checking'],
      answer: {
        interview: `**\`obj instanceof Fn\` checks whether \`Fn.prototype\` appears anywhere in \`obj\`'s prototype chain.**

- It does not check how the object was created — only the chain at the moment of the check.
- Changing \`Fn.prototype\` after creating objects makes \`instanceof\` return \`false\` for them.
- It fails across realms (iframes, \`vm\` contexts) because each has its own \`Array\`, \`Object\`…; use \`Array.isArray\` for arrays.
- Primitives are never instances (\`"a" instanceof String\` is \`false\`).
- \`Symbol.hasInstance\` lets a class customise the check.
- \`Fn.prototype.isPrototypeOf(obj)\` is the explicit equivalent.

Real-world: \`if (err instanceof ValidationError)\` to branch on custom error types.`,
        explanationBn: `\`obj instanceof Fn\` আসলে প্রশ্ন করে: "\`Fn.prototype\` কি \`obj\`-এর prototype chain-এর কোথাও আছে?"

অর্থাৎ এটা দেখে না object কোন constructor দিয়ে তৈরি — দেখে prototype link-গুলো। তাই:
- Subclass-এর instance parent-এরও instance: \`admin instanceof User\` → \`true\`।
- Object তৈরির পরে কেউ \`Fn.prototype\` অন্য object দিয়ে বদলে ফেললে, পুরনো object গুলো আর \`instanceof Fn\` হবে না।
- Primitive কখনো instance না: \`"abc" instanceof String\` → \`false\`।

**Realm সমস্যা:** প্রতিটা iframe বা \`vm\` context-এর নিজস্ব \`Array\` constructor। Iframe থেকে আসা array-র prototype হলো সেই iframe-এর \`Array.prototype\` — তাই main window-এর \`Array\` দিয়ে \`instanceof\` চেক করলে \`false\`। এজন্য array চেক করতে \`Array.isArray()\` নিরাপদ।

সবচেয়ে কাজের বাস্তব ব্যবহার: custom error type চেনা — \`if (err instanceof NotFoundError) return 404\`।`,
        examples: [
          {
            lang: 'javascript',
            code: `class User {}
class Admin extends User {}
const admin = new Admin();
console.log(admin instanceof Admin, admin instanceof User, admin instanceof Object);
console.log("abc" instanceof String, User.prototype.isPrototypeOf(admin));

function Legacy() {}
const before = new Legacy();
Legacy.prototype = {};                     // replace the prototype
console.log(before instanceof Legacy);

const vm = require("node:vm");
const foreignArray = vm.runInNewContext("[1, 2]");
console.log(foreignArray instanceof Array, Array.isArray(foreignArray));`,
            output: `true true true
false true
false
false true`,
          },
        ],
        followUps: ['Why is `Array.isArray` better than `instanceof Array`?'],
      },
      related: ['js-prototype-chain', 'js-reliable-type-checks'],
    },
    {
      id: 'js-object-create-inheritance',
      level: 'intermediate',
      priority: 1,
      question:
        'How do you set up inheritance without classes (constructor functions and `Object.create`)?',
      tags: ['prototypes', 'inheritance', 'object-create', 'es5'],
      answer: {
        interview: `**With constructor functions, link the child's prototype to the parent's with \`Object.create\`, restore \`constructor\`, and call the parent constructor with \`this\`.**

1. \`function Admin(name, level) { User.call(this, name); this.level = level; }\` — inherit instance properties.
2. \`Admin.prototype = Object.create(User.prototype)\` — inherit methods.
3. \`Admin.prototype.constructor = Admin\` — fix the constructor reference.

- This is what \`class Admin extends User\` does for you (plus static inheritance and built-in subclassing).
- \`Object.create(proto)\` alone enables simple object-to-object delegation without constructors (the "OLOO" style).
- Avoid \`Admin.prototype = new User()\` — it runs the parent constructor and shares its instance data.

Real-world: you will meet this pattern in older codebases and library internals; knowing it explains what classes compile to.`,
        explanationBn: `ES6 class-এর আগে inheritance হাতে তিনটা ধাপে সেট করতে হতো — আর class আজও ভেতরে ঠিক এটাই করে:

**১. Parent-এর constructor চালানো:** \`User.call(this, name)\` — parent-এর instance property (\`this.name\`) নতুন object-এ বসাতে। (Class-এর \`super(name)\` এর সমতুল্য।)

**২. Prototype জোড়া:** \`Admin.prototype = Object.create(User.prototype)\` — Admin-এর prototype একটা নতুন object, যার নিজের prototype হলো \`User.prototype\`। ফলে admin-এর chain: \`admin → Admin.prototype → User.prototype\` — parent-এর method পাওয়া যায়।

**৩. \`constructor\` ঠিক করা:** ধাপ ২-এ \`Admin.prototype\` পুরো বদলে গেছে, তাই তার \`constructor\` এখন ভুল করে \`User\`-কে দেখায়। আবার \`Admin\`-এ বসাতে হয়।

**পুরনো ভুল পদ্ধতি:** \`Admin.prototype = new User()\` — এতে parent-এর constructor অপ্রয়োজনে চলে, আর parent-এর instance data সব Admin-এর মধ্যে shared হয়ে যায়।

\`Object.create\` একা ব্যবহার করে constructor ছাড়াই object থেকে object-এ সরাসরি inheritance করা যায় — JavaScript-এর আসল, সরল prototype ধারণা।`,
        examples: [
          {
            lang: 'javascript',
            code: `function User(name) { this.name = name; }
User.prototype.describe = function () { return "user " + this.name; };

function Admin(name, level) {
  User.call(this, name);                         // 1. parent instance properties
  this.level = level;
}
Admin.prototype = Object.create(User.prototype); // 2. inherit methods
Admin.prototype.constructor = Admin;             // 3. fix constructor
Admin.prototype.describe = function () {
  return User.prototype.describe.call(this) + " (level " + this.level + ")";
};

const a = new Admin("Nadia", 2);
console.log(a.describe(), a instanceof User, a.constructor.name);`,
            output: `user Nadia (level 2) true Admin`,
          },
        ],
        followUps: ['What does `class extends` add on top of this?'],
      },
      related: ['js-prototypal-inheritance', 'js-classes'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'js-class-fields-vs-methods',
      level: 'advanced',
      priority: 1,
      question: 'What is the difference between a class method and an arrow-function class field?',
      tags: ['classes', 'class-fields', 'this', 'memory'],
      answer: {
        interview: `**A method (\`handle() {}\`) is defined once on the prototype and shared by all instances; its \`this\` depends on the call. An arrow-function field (\`handle = () => {}\`) is created per instance as an own property, with \`this\` permanently bound to that instance.**

- Arrow fields solve the "lost \`this\`" problem for callbacks and event handlers.
- Cost: one function per instance (more memory with many instances).
- Arrow fields are not on the prototype, so subclasses cannot call them with \`super.handle()\`, and they are harder to mock via the prototype in tests.
- Fields are initialised **after** the parent constructor runs, so a parent constructor cannot see a subclass's fields.
- Alternative: keep methods and \`bind\` them once in the constructor.

Real-world: UI components with many instances usually use methods; handlers passed around as callbacks often use arrow fields.`,
        explanationBn: `দুটো লেখার ধরন দেখতে প্রায় একই, কিন্তু ভেতরে আলাদা:

\`\`\`js
class Button {
  click() { ... }          // method
  handle = () => { ... };  // arrow function class field
}
\`\`\`

**Method:**
- \`Button.prototype\`-এ **একবার** তৈরি হয়, সব instance share করে।
- \`this\` ঠিক হয় call-এর ধরন দেখে — callback হিসেবে পাঠালে \`this\` হারায়।

**Arrow field:**
- **প্রতিটা instance-এর জন্য আলাদা** function তৈরি হয়, object-এর নিজের property হিসেবে।
- Arrow function-এর \`this\` lexical — field তৈরি হয় instance-এর ভেতরে, তাই \`this\` চিরকাল সেই instance। Callback হিসেবে পাঠালেও \`this\` হারায় না।

**Trade-off:**
- Arrow field \`this\`-এর সমস্যা মেটায়, কিন্তু ১০,০০০ instance মানে ১০,০০০টা function — বেশি memory।
- Prototype-এ না থাকায় subclass \`super.handle()\` দিয়ে ডাকতে পারে না, আর test-এ prototype-এ mock করা যায় না।

**একটা সূক্ষ্ম ক্রমের ব্যাপার:** class field initialize হয় parent constructor চলার **পরে**। তাই parent-এর constructor থেকে subclass-এর field দেখা যায় না।`,
        examples: [
          {
            lang: 'javascript',
            code: `class Widget {
  label = "widget";
  method() { return this?.label; }
  arrow = () => this.label;
}

const a = new Widget();
const b = new Widget();
console.log(a.method === b.method, a.arrow === b.arrow);
console.log(Object.hasOwn(a, "method"), Object.hasOwn(a, "arrow"));

const { method, arrow } = a;          // detach both
console.log(method(), arrow());`,
            output: `true false
false true
undefined widget`,
          },
        ],
        followUps: ['What are the memory implications of arrow-function fields?'],
      },
      related: ['js-class-features', 'js-this-keyword'],
    },
  ],
});

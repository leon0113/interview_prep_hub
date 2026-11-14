import { defineSection } from '../../define';

export const functions = defineSection({
  id: 'py-functions',
  title: 'Functions',
  description:
    'Arguments, scope and closures, then the big three: decorators, generators and iterators — plus the functional tools around them.',
  order: 4,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'py-args-kwargs',
      level: 'foundation',
      priority: 3,
      question: 'What are `*args` and `**kwargs`?',
      tags: ['functions', 'args', 'kwargs', 'unpacking'],
      answer: {
        interview: `**\`*args\` collects any extra positional arguments into a tuple; \`**kwargs\` collects any extra keyword arguments into a dict.** The names are convention — the \`*\` and \`**\` do the work.

- Order in a signature: regular params, \`*args\`, keyword-only params, \`**kwargs\` — e.g. \`def f(a, *args, flag=False, **kwargs)\`.
- At a **call** site, \`*\` and \`**\` do the opposite — they *unpack*: \`f(*[1, 2])\`, \`f(**{"x": 1})\`.
- The classic use is forwarding: \`def wrapper(*args, **kwargs): return fn(*args, **kwargs)\` — the backbone of decorators.
- Also used for flexible APIs (\`print(*values, sep=",")\`) and for calling a parent's \`__init__\` without repeating its signature.

Real-world: every generic decorator, and every \`super().__init__(*args, **kwargs)\` in a subclass, relies on this.`,
        explanationBn: `কখনো কখনো আগে থেকে জানা থাকে না function কয়টা argument পাবে — যেমন \`print()\` যত খুশি value নিতে পারে। এর জন্য Python-এ দুটো বিশেষ parameter আছে:

- **\`*args\`** — বাড়তি যত **positional** argument আসবে, সব একটা **tuple**-এ জমা হবে।
- **\`**kwargs\`** — বাড়তি যত **keyword** argument (\`name=value\`) আসবে, সব একটা **dict**-এ জমা হবে।

"args" আর "kwargs" শুধু প্রচলিত নাম — আপনি \`*numbers\` বা \`**options\` লিখলেও চলবে। আসল জাদু \`*\` আর \`**\`-এ।

মজার ব্যাপার হলো, function **call** করার সময় এই একই চিহ্ন উল্টো কাজ করে — জমা না করে **খুলে দেয় (unpack)**। \`add(*[1, 2])\` মানে \`add(1, 2)\`, আর \`connect(**config)\` মানে dict-এর প্রতিটা key-value আলাদা keyword argument হিসেবে পাঠানো।

এই দুটো মিলে সবচেয়ে গুরুত্বপূর্ণ pattern তৈরি হয় — **forwarding**:
\`\`\`python
def wrapper(*args, **kwargs):
    return original(*args, **kwargs)
\`\`\`
\`wrapper\` জানেই না \`original\` কী কী argument নেয়, তবুও সব হুবহু পাস করে দেয়। Decorator এভাবেই যেকোনো function-এর জন্য কাজ করে।

Parameter-এর ক্রম মনে রাখুন: সাধারণ → \`*args\` → keyword-only → \`**kwargs\`। ক্রম ভুল হলে SyntaxError।`,
        examples: [
          {
            lang: 'python',
            code: `def describe(name, *args, sep=", ", **kwargs):
    print(name, args, kwargs)
    return sep.join(map(str, args))

print(describe("nums", 1, 2, 3, color="red", size=4))

values = [10, 20]
options = {"sep": " | "}
print(describe("unpacked", *values, **options))`,
            output: `nums (1, 2, 3) {'color': 'red', 'size': 4}
1, 2, 3
unpacked (10, 20) {}
10 | 20`,
          },
          {
            lang: 'python',
            caption: 'Forwarding every argument unchanged — the heart of a decorator',
            code: `def log_call(fn):
    def wrapper(*args, **kwargs):
        print(f"calling {fn.__name__} with {args} {kwargs}")
        return fn(*args, **kwargs)
    return wrapper

@log_call
def power(base, exp=2):
    return base ** exp

print(power(3, exp=3))`,
            output: `calling power with (3,) {'exp': 3}
27`,
          },
        ],
        pitfalls: [
          '`args` is a tuple, not a list — it cannot be appended to.',
          'Accepting `**kwargs` silently swallows misspelled keyword arguments; validate them or prefer explicit parameters.',
          'Parameter order is fixed: `def f(**kwargs, *args)` is a SyntaxError.',
        ],
        followUps: [
          'What are positional-only and keyword-only parameters?',
          'How do you write a decorator that works for any function signature?',
          'What does `*` alone in a parameter list mean?',
        ],
      },
      related: ['py-positional-keyword-only', 'py-decorators-basics'],
    },
    {
      id: 'py-mutable-default-argument',
      level: 'foundation',
      priority: 3,
      question: 'What is the mutable default argument trap, and how do you avoid it?',
      tags: ['functions', 'default-arguments', 'mutability', 'bugs'],
      answer: {
        interview: `**Default values are evaluated once, when the \`def\` statement runs — not on every call. A mutable default like \`[]\` or \`{}\` is therefore one shared object, and changes made in one call leak into the next.**

- \`def add(item, items=[])\` keeps appending to the same list across calls.
- The fix is a \`None\` sentinel: \`def add(item, items=None): if items is None: items = []\`.
- The default object is visible as \`add.__defaults__\`.
- Immutable defaults (\`0\`, \`""\`, \`None\`, tuples) are safe.
- The same "evaluated once" rule means \`def log(ts=datetime.now())\` freezes the time at definition.
- Linters (ruff \`B006\`, pylint \`W0102\`) flag it.

Real-world: a classic production bug — e.g. a "fresh" request context or cache that silently accumulates data between calls.`,
        explanationBn: `এটা Python interview-এর সবচেয়ে জনপ্রিয় প্রশ্নগুলোর একটা।

মূল কথা: **default value তৈরি হয় একবার — যখন \`def\` লাইনটা চলে**, প্রতিবার function call হলে না। Python সেই object-টা function-এর সাথে সংরক্ষণ করে রাখে (\`__defaults__\`-এ)।

এখন default যদি একটা খালি list হয়, তাহলে পুরো program জুড়ে সেই **একটাই list**। প্রথম call-এ তাতে কিছু append করলেন — list-টা বদলে গেল। দ্বিতীয় call-এ argument না দিলে Python আবার সেই একই (এখন আর খালি না) list দেয়। ফলাফল: আগের call-এর data নতুন call-এ ঢুকে পড়ে।

Analogy: একটা অফিসে নতুন কর্মী এলে তাকে "একটা খালি খাতা" দেওয়ার কথা। কিন্তু সবাইকে আসলে **একই খাতা** দেওয়া হচ্ছে — প্রথম জন যা লিখে রেখেছে, দ্বিতীয় জন খাতা খুলেই সেটা দেখছে।

**সমাধান — \`None\` sentinel:**
\`\`\`python
def add(item, items=None):
    if items is None:
        items = []      # প্রতিটা call-এ নতুন list
\`\`\`
এখন default হলো \`None\` (immutable, তাই নিরাপদ), আর নতুন list তৈরি হয় function-এর ভেতরে — প্রতি call-এ আলাদা।

একই নিয়মের আরেকটা রূপ: \`def log(ts=datetime.now())\` — সময়টা function define করার মুহূর্তে আটকে যায়, প্রতিটা call-এ একই সময় দেখায়।`,
        examples: [
          {
            lang: 'python',
            caption: 'The bug: one list shared by every call',
            code: `def add_item(item, cart=[]):
    cart.append(item)
    return cart

print(add_item("apple"))
print(add_item("bread"))      # expected ['bread']
print(add_item.__defaults__)`,
            output: `['apple']
['apple', 'bread']
(['apple', 'bread'],)`,
          },
          {
            lang: 'python',
            caption: 'The fix: a None sentinel, and a new list per call',
            code: `def add_item(item, cart=None):
    if cart is None:
        cart = []
    cart.append(item)
    return cart

print(add_item("apple"))
print(add_item("bread"))
print(add_item("milk", ["eggs"]))`,
            output: `['apple']
['bread']
['eggs', 'milk']`,
          },
        ],
        pitfalls: [
          "Using `cart = cart or []` instead of `is None` replaces a caller's intentionally empty list with a new one.",
          'Dataclasses refuse a mutable default (`items: list = []`); use `field(default_factory=list)`.',
          'Defaults like `datetime.now()` or `uuid4()` are also frozen at definition time.',
        ],
        followUps: [
          'Why does Python evaluate defaults only once?',
          'Is this ever useful on purpose (e.g. as a cache)?',
          'How do dataclasses handle mutable defaults?',
        ],
      },
      related: ['py-mutable-vs-immutable', 'py-pass-by-object-reference'],
    },
    {
      id: 'py-first-class-functions',
      level: 'foundation',
      priority: 2,
      question: 'What does it mean that functions are first-class objects in Python?',
      tags: ['functions', 'first-class', 'higher-order-functions'],
      answer: {
        interview: `**Functions are ordinary objects: you can assign them to variables, store them in data structures, pass them as arguments and return them from other functions.**

- A function that takes or returns a function is a **higher-order function** — \`sorted(key=...)\`, \`map\`, decorators.
- Functions have attributes: \`__name__\`, \`__doc__\`, \`__defaults__\`, and you can add your own.
- Storing functions in a dict replaces long \`if/elif\` chains (a dispatch table).
- This property is what makes closures and decorators possible.

Real-world: \`handlers = {"create": create_user, "delete": delete_user}\` then \`handlers[action](payload)\`.`,
        explanationBn: `"First-class" মানে function-কে আলাদা কোনো বিশেষ জিনিস হিসেবে দেখা হয় না — int বা string-এর মতোই সাধারণ একটা object। তাই function দিয়ে সেই সব কাজ করা যায় যা অন্য value দিয়ে করা যায়:

- Variable-এ রাখা: \`shout = str.upper\`
- List বা dict-এ রাখা
- অন্য function-এ argument হিসেবে পাঠানো: \`sorted(words, key=len)\` — এখানে \`len\` function-টাই পাঠানো হচ্ছে, call করা না (পেছনে \`()\` নেই খেয়াল করুন)
- Function থেকে function ফেরত দেওয়া

যে function অন্য function নেয় বা ফেরত দেয়, তাকে **higher-order function** বলে।

একটা খুব কাজের pattern হলো **dispatch table**: লম্বা \`if action == "a": ... elif action == "b": ...\` লেখার বদলে function গুলো একটা dict-এ রেখে দিন, তারপর \`handlers[action]()\`। নতুন action যোগ করা মানে dict-এ এক লাইন যোগ করা।

এই ধারণাটা না বুঝলে decorator আর closure বোঝা কঠিন — কারণ ওগুলো পুরোপুরি এর ওপর দাঁড়িয়ে।`,
        examples: [
          {
            lang: 'python',
            code: `def add(a, b): return a + b
def sub(a, b): return a - b

ops = {"+": add, "-": sub}       # functions stored in a dict
print(ops["+"](5, 3), ops["-"](5, 3))

def apply_twice(fn, x):          # a function as an argument
    return fn(fn(x))
print(apply_twice(lambda n: n * 10, 2))

shout = str.upper                # a function in a variable
print(shout("hi"), add.__name__)`,
            output: `8 2
200
HI add`,
          },
        ],
        pitfalls: ['`key=len()` calls the function; `key=len` passes it.'],
        followUps: ['What is a closure?', 'What is a higher-order function?'],
      },
      related: ['py-closures', 'py-decorators-basics'],
    },
    {
      id: 'py-lambda',
      level: 'foundation',
      priority: 2,
      question: 'What is a lambda function, and when should you (not) use one?',
      tags: ['lambda', 'anonymous-functions', 'functions'],
      answer: {
        interview: `**A lambda is a small anonymous function written as a single expression: \`lambda args: expression\`. It returns the value of that expression automatically.**

- Good for short throwaway functions passed to another function: \`sorted(users, key=lambda u: u.age)\`.
- Limited to one expression — no statements, no assignments (except the walrus), no annotations.
- It is still a normal function object; \`lambda\` only skips the name and the \`def\`.
- PEP 8 says do not assign a lambda to a name (\`f = lambda x: ...\`) — use \`def\`, which gives a proper name in tracebacks.
- Often \`operator.itemgetter\`, \`attrgetter\` or a comprehension is clearer.

Real-world: \`max(products, key=lambda p: p["rating"])\`.`,
        explanationBn: `Lambda হলো "এক লাইনের নামহীন function"। \`lambda x: x * 2\` আর নিচেরটা একই:
\`\`\`python
def double(x):
    return x * 2
\`\`\`
শুধু lambda-তে \`return\` লিখতে হয় না — expression-এর value নিজে থেকেই ফেরত আসে।

**কোথায় মানানসই:** যখন একটা ছোট function অন্য কোনো function-কে দিতে হবে আর সেটা আর কোথাও লাগবে না — \`sorted\`, \`max\`, \`min\`-এর \`key\`, বা \`map\`/\`filter\`-এ।

**সীমাবদ্ধতা:** শুধু একটা expression। \`if\` statement, loop, \`try\`, একাধিক লাইন — কিছুই চলে না (তবে \`a if cond else b\` ধরনের expression চলে)।

**কোথায় এড়িয়ে চলবেন:** \`square = lambda x: x * x\` — নাম দিয়ে রাখতেই যদি চান, তাহলে \`def\` লিখুন। কারণ error হলে traceback-এ lambda-র নাম আসে শুধু \`<lambda>\`, বোঝা যায় না কোন function। Logic একটু জটিল হলেই \`def\` বেশি readable।`,
        examples: [
          {
            lang: 'python',
            code: `products = [
    {"name": "pen", "price": 20, "rating": 4.1},
    {"name": "book", "price": 350, "rating": 4.8},
    {"name": "bag", "price": 900, "rating": 3.9},
]
print(max(products, key=lambda p: p["rating"])["name"])
print([p["name"] for p in sorted(products, key=lambda p: p["price"], reverse=True)])

label = lambda n: "even" if n % 2 == 0 else "odd"   # works, but PEP 8 prefers def
print(label(7), label.__name__)`,
            output: `book
['bag', 'book', 'pen']
odd <lambda>`,
          },
        ],
        pitfalls: [
          'Lambdas in a loop capture variables late — see the late-binding closure problem.',
          'Named lambdas show up as `<lambda>` in tracebacks.',
        ],
        followUps: [
          'What is the late-binding problem with lambdas in a loop?',
          'When would you use `operator.itemgetter` instead?',
        ],
      },
      related: ['py-map-filter-reduce', 'py-late-binding-closures'],
    },
    {
      id: 'py-map-filter-reduce',
      level: 'foundation',
      priority: 2,
      question: 'Explain `map`, `filter` and `reduce`. When are comprehensions better?',
      tags: ['map', 'filter', 'reduce', 'functional-programming', 'comprehensions'],
      answer: {
        interview: `**\`map(fn, it)\` applies a function to every item, \`filter(fn, it)\` keeps items where the function returns truthy, and \`functools.reduce(fn, it, init)\` folds the items into one value.**

- \`map\` and \`filter\` return **lazy iterators** in Python 3 — wrap in \`list()\` to see results, and they can be consumed only once.
- \`map\` accepts several iterables: \`map(operator.add, a, b)\`.
- \`filter(None, items)\` drops falsy values.
- \`reduce\` lives in \`functools\`; for common cases prefer \`sum\`, \`max\`, \`min\`, \`math.prod\`, \`"".join\`.
- Comprehensions are usually more readable, especially when you would need a lambda: \`[x * 2 for x in nums if x > 0]\`.
- \`map\` with an existing function (\`map(int, parts)\`) is concise and fine.

Real-world: \`list(map(int, line.split()))\` to parse a row of numbers.`,
        explanationBn: `এই তিনটা functional programming থেকে আসা tool:

- **\`map(fn, items)\`** — প্রতিটা item-এ \`fn\` চালায়, result গুলো দেয়। "সবগুলোকে বদলাও"।
- **\`filter(fn, items)\`** — যে item-এর জন্য \`fn\` truthy দেয়, শুধু সেগুলো রাখে। "কিছু বেছে নাও"।
- **\`reduce(fn, items, start)\`** — পুরো collection-কে ধাপে ধাপে একটা value-তে নামিয়ে আনে। যেমন যোগফল: \`((((0+1)+2)+3)+4)\`।

Python 3-এ \`map\` আর \`filter\` **lazy** — সাথে সাথে কিছু হিসাব করে না, একটা iterator দেয় যেটা দরকার মতো একটা একটা করে value বানায়। তাই print করলে \`<map object ...>\` দেখায়, আর একবার পুরোটা পড়ে ফেললে দ্বিতীয়বার খালি পাওয়া যায়।

**Comprehension বনাম map/filter:** Python community-তে সাধারণ মত হলো, lambda লাগলে comprehension বেশি পরিষ্কার:
- \`list(map(lambda x: x * 2, filter(lambda x: x > 0, nums)))\`
- \`[x * 2 for x in nums if x > 0]\` ← এটা পড়তে অনেক সহজ

কিন্তু আগে থেকে তৈরি function থাকলে \`map\` সুন্দর: \`map(int, parts)\`, \`map(str.strip, lines)\`।

\`reduce\` Python 3-এ built-in থেকে সরিয়ে \`functools\`-এ রাখা হয়েছে, কারণ বেশিরভাগ ক্ষেত্রে \`sum\`, \`max\`, \`math.prod\`-এর মতো নির্দিষ্ট function বেশি পরিষ্কার।`,
        examples: [
          {
            lang: 'python',
            code: `from functools import reduce

nums = [3, -1, 4, -1, 5]
doubled = map(lambda x: x * 2, nums)
print(doubled.__class__.__name__, list(doubled), list(doubled))
print(list(filter(lambda x: x > 0, nums)))
print(reduce(lambda acc, x: acc + x, nums, 0), sum(nums))
print(list(filter(None, [0, 1, "", "a", None])))

print([x * 2 for x in nums if x > 0])     # usually clearer
print(list(map(int, "10 20 30".split())))`,
            output: `map [6, -2, 8, -2, 10] []
[3, 4, 5]
10 10
[1, 'a']
[6, 8, 10]
[10, 20, 30]`,
          },
        ],
        pitfalls: [
          '`map`/`filter` objects are exhausted after one pass — the second `list(...)` is empty.',
          '`reduce` without an initial value fails on an empty iterable.',
        ],
        followUps: [
          'What is the difference between a map object and a list?',
          'How would you compute a product of a list?',
        ],
      },
      related: ['py-list-comprehensions', 'py-iterable-vs-iterator'],
    },
    {
      id: 'py-any-all',
      level: 'foundation',
      priority: 1,
      question: 'What do `any()` and `all()` do?',
      tags: ['any', 'all', 'short-circuit', 'generators'],
      answer: {
        interview: `**\`any(it)\` returns \`True\` if at least one item is truthy; \`all(it)\` returns \`True\` if every item is truthy. Both short-circuit — they stop at the first decisive item.**

- Edge cases: \`any([])\` is \`False\`, \`all([])\` is \`True\` (vacuous truth).
- Pair them with a generator expression so items are computed lazily: \`any(x < 0 for x in nums)\`.
- Passing a list comprehension instead builds the whole list first and loses the short-circuit benefit.

Real-world: \`all(field in payload for field in required)\` to validate input.`,
        explanationBn: `- \`any()\` — "অন্তত একটা কি সত্যি?"
- \`all()\` — "সবগুলোই কি সত্যি?"

দুটোই **short-circuit** করে: \`any\` প্রথম truthy পেলেই থেমে যায় (আর দেখার দরকার নেই), \`all\` প্রথম falsy পেলেই থেমে যায়। তাই generator expression-এর সাথে ব্যবহার করলে অপ্রয়োজনীয় হিসাব হয় না।

খালি collection-এর ক্ষেত্রে: \`any([])\` হলো \`False\` (একটাও সত্যি নেই), আর \`all([])\` হলো \`True\` — কারণ "সবগুলো সত্যি" কথাটা ভুল প্রমাণ করার মতো কোনো উদাহরণই নেই। গণিতে এটাকে vacuous truth বলে। Validation code-এ এটা মনে রাখা জরুরি: খালি list পেলে \`all\` চুপচাপ \`True\` দিয়ে দেবে।`,
        examples: [
          {
            lang: 'python',
            code: `nums = [4, 8, -2, 6]
print(any(n < 0 for n in nums), all(n > 0 for n in nums))
print(any([]), all([]))

payload = {"name": "Rafi", "email": "r@x.com"}
required = ["name", "email", "age"]
print(all(field in payload for field in required))`,
            output: `True False
False True
False`,
          },
        ],
        pitfalls: ['`all([])` is `True` — check for emptiness separately when it matters.'],
        followUps: ['What is short-circuit evaluation?'],
      },
    },
    {
      id: 'py-legb-scope',
      level: 'foundation',
      priority: 2,
      question: 'What is the LEGB rule in Python?',
      tags: ['scope', 'legb', 'namespaces', 'builtins'],
      answer: {
        interview: `**LEGB is the order Python searches for a name: Local → Enclosing → Global → Built-in. The first match wins; if none matches, you get \`NameError\`.**

- **Local:** names assigned inside the current function.
- **Enclosing:** locals of any outer functions (for nested functions).
- **Global:** names at the top level of the module.
- **Built-in:** \`len\`, \`print\`, \`range\`… from the \`builtins\` module.
- Scope is decided at **compile time**: if a function assigns to a name anywhere, that name is local throughout the function.
- Loops and \`if\` blocks do **not** create a new scope in Python — only functions, classes, modules (and comprehensions) do.

Real-world: naming a variable \`list\` or \`id\` shadows the built-in and causes confusing errors later in the module.`,
        explanationBn: `কোনো নাম (variable বা function) ব্যবহার করলে Python সেটা কোথায় খুঁজবে — তার নির্দিষ্ট একটা ক্রম আছে, আর সেটাই LEGB:

1. **L — Local:** বর্তমান function-এর ভেতরে
2. **E — Enclosing:** function-টা যদি অন্য একটা function-এর ভেতরে থাকে, সেই বাইরের function-এর ভেতরে
3. **G — Global:** module-এর (file-এর) সবচেয়ে বাইরের স্তরে
4. **B — Built-in:** Python-এর নিজস্ব নাম — \`len\`, \`print\`, \`sum\`

যেখানে প্রথম পায়, সেখানেই থামে। কোথাও না পেলে \`NameError\`।

Analogy: আপনি একটা বই খুঁজছেন — আগে নিজের টেবিলে (local), তারপর নিজের ঘরে (enclosing), তারপর বাড়ির লাইব্রেরিতে (global), শেষে পাবলিক লাইব্রেরিতে (built-in)। টেবিলেই পেয়ে গেলে লাইব্রেরি পর্যন্ত যান না।

দুটো জিনিস অনেককে অবাক করে:
- Python-এ \`for\`, \`if\`, \`while\` নতুন scope বানায় না। Loop-এর ভেতরে তৈরি variable loop শেষেও থাকে। নতুন scope তৈরি করে শুধু function, class, module (আর comprehension)।
- \`list = [1, 2]\` লিখলে built-in \`list\` "ঢাকা পড়ে যায়" (shadowing)। একই module-এ পরে \`list("abc")\` লিখলে error, কারণ \`list\` এখন আপনার একটা list object।`,
        examples: [
          {
            lang: 'python',
            code: `x = "global"

def outer():
    x = "enclosing"
    def inner():
        print(x)          # found in Enclosing
        print(len("ab"))  # found in Built-in
    inner()

outer()
print(x)                  # the global is untouched

for i in range(3):
    pass
print(i)                  # loops do not create a scope`,
            output: `enclosing
2
global
2`,
          },
          {
            lang: 'python',
            caption: 'Shadowing a built-in',
            code: `list = [1, 2, 3]
try:
    list("abc")
except TypeError as e:
    print("TypeError:", e)
del list                  # remove the shadow; the built-in is visible again
print(list("abc"))`,
            output: `TypeError: 'list' object is not callable
['a', 'b', 'c']`,
          },
        ],
        pitfalls: [
          'Naming variables `list`, `dict`, `id`, `input`, `sum` shadows built-ins.',
          'Reading an outer variable is fine; assigning to it inside a function creates a new local instead.',
        ],
        followUps: ['What do `global` and `nonlocal` do?', 'Why does `UnboundLocalError` happen?'],
      },
      visualizationId: 'py-legb-scope',
      related: ['py-global-nonlocal', 'py-unboundlocalerror'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'py-decorators-basics',
      level: 'intermediate',
      priority: 3,
      question: 'What is a decorator? Write one from scratch.',
      tags: ['decorators', 'closures', 'higher-order-functions', 'wraps'],
      answer: {
        interview: `**A decorator is a function that takes a function and returns a new function — usually a wrapper that adds behaviour before and/or after calling the original, without changing its code.**

- \`@my_decorator\` above \`def f\` is just syntax for \`f = my_decorator(f)\`.
- The wrapper accepts \`*args, **kwargs\` so it works for any signature, calls the original, and **returns its result**.
- Use \`@functools.wraps(fn)\` on the wrapper so the decorated function keeps its name, docstring and signature.
- It works because functions are first-class objects and the wrapper is a closure over \`fn\`.
- Decoration happens once, at definition time; the wrapper runs on every call.

Real-world: logging, timing, retries, caching, authentication checks, rate limiting — cross-cutting concerns kept out of business logic.`,
        explanationBn: `Decorator বুঝতে তিনটা ধারণা লাগে, যেগুলো আগে দেখেছি: function একটা object (first-class), function থেকে function ফেরত দেওয়া যায়, আর ভেতরের function বাইরের variable মনে রাখে (closure)।

**Decorator = এমন একটা function, যে একটা function নেয় আর তার জায়গায় একটা নতুন (মোড়ানো) function ফেরত দেয়।**

\`\`\`python
@timer
def load_data(): ...
\`\`\`
এটা আসলে শুধু এই লাইনের সংক্ষিপ্ত রূপ:
\`\`\`python
load_data = timer(load_data)
\`\`\`
অর্থাৎ \`load_data\` নামটা এখন আর আসল function-কে দেখায় না — \`timer\` যে **wrapper** ফেরত দিয়েছে, সেটাকে দেখায়। কেউ \`load_data()\` call করলে আসলে wrapper চলে। Wrapper আগে-পরে নিজের কাজ (যেমন সময় মাপা) করে, মাঝখানে আসল function-কে call করে।

Analogy: উপহারের বাক্সকে wrapping paper দিয়ে মোড়ানো। ভেতরের উপহার একই, কিন্তু বাইরে নতুন একটা স্তর যোগ হলো। আর একাধিক decorator মানে একাধিক স্তরের মোড়ক।

Wrapper লেখার তিনটা নিয়ম, যেগুলো interview-তে খেয়াল করা হয়:
1. \`*args, **kwargs\` নিন, যাতে যেকোনো function-এর সাথে কাজ করে।
2. আসল function-এর **return value ফেরত দিন** — ভুলে গেলে decorated function সবসময় \`None\` দেবে।
3. \`@functools.wraps(fn)\` ব্যবহার করুন — না হলে function-এর নাম হয়ে যায় "wrapper", docstring হারায়, debugging কঠিন হয়।

Decoration একবারই হয় (function define করার সময়), আর wrapper চলে প্রতিটা call-এ।`,
        examples: [
          {
            lang: 'python',
            caption: 'A minimal, correct decorator',
            code: `import functools

def announce(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        print(f"-> {fn.__name__}{args}")
        result = fn(*args, **kwargs)
        print(f"<- {fn.__name__} returned {result}")
        return result
    return wrapper

@announce
def add(a, b):
    """Add two numbers."""
    return a + b

total = add(2, 3)
print(total, add.__name__, add.__doc__)`,
            output: `-> add(2, 3)
<- add returned 5
5 add Add two numbers.`,
          },
          {
            lang: 'python',
            caption: '@ is only syntax: decoration is a plain function call at definition time',
            code: `def shout(fn):
    print(f"decorating {fn.__name__}")
    def wrapper():
        return fn().upper()
    return wrapper

def greet():
    return "hello"

greet = shout(greet)      # exactly what @shout does
print(greet())`,
            output: `decorating greet
HELLO`,
          },
        ],
        pitfalls: [
          'Forgetting `return result` in the wrapper makes every decorated call return `None`.',
          'Without `functools.wraps`, `__name__`, `__doc__` and introspection show the wrapper instead.',
          'Code in the decorator body (outside the wrapper) runs once at import time, not per call.',
        ],
        followUps: [
          'How do you write a decorator that takes arguments?',
          'In what order are stacked decorators applied?',
          'What does `functools.wraps` actually do?',
          'Give real use cases for decorators.',
        ],
      },
      visualizationId: 'py-decorator-wrapping',
      related: [
        'py-decorators-with-arguments',
        'py-stacked-decorators',
        'py-functools-wraps',
        'py-closures',
      ],
    },
    {
      id: 'py-decorators-with-arguments',
      level: 'intermediate',
      priority: 3,
      question: 'How do you write a decorator that takes arguments, like `@retry(times=3)`?',
      tags: ['decorators', 'decorator-factory', 'closures'],
      answer: {
        interview: `**Add one more layer: a decorator factory. \`retry(times=3)\` is called first and *returns* the actual decorator, which then receives the function.**

- Three levels: factory(config) → decorator(fn) → wrapper(*args, **kwargs).
- \`@retry(times=3)\` means \`f = retry(times=3)(f)\`.
- Each layer is a closure: the wrapper can see \`times\` (from the factory) and \`fn\` (from the decorator).
- \`@retry\` without parentheses would pass the function as \`times\` — a common bug; supporting both forms needs an explicit check.
- A class with \`__init__\` (config) and \`__call__\` (receives the function) is an alternative.

Real-world: \`@retry(times=3, delay=0.5)\`, \`@cache(ttl=60)\`, \`@require_role("admin")\`, Flask's \`@app.route("/users")\`.`,
        explanationBn: `সাধারণ decorator দুই স্তরের: decorator(fn) → wrapper। কিন্তু decorator-কে যদি কিছু setting দিতে চাই, যেমন কতবার retry করবে, তাহলে আরেকটা স্তর লাগে।

\`@retry(times=3)\` দেখতে decorator মনে হলেও এখানে আসলে দুটো ধাপ হয়:
1. প্রথমে \`retry(times=3)\` **call** হয় — এটা একটা decorator ফেরত দেয়।
2. তারপর সেই ফেরত আসা decorator-কে function-এর ওপর প্রয়োগ করা হয়।

অর্থাৎ \`f = retry(times=3)(f)\`।

তাই তিনটা function, একটার ভেতরে আরেকটা:
- **বাইরেরটা (factory):** setting নেয় (\`times\`)
- **মাঝেরটা (decorator):** function নেয় (\`fn\`)
- **ভেতরেরটা (wrapper):** আসল call-এর argument নেয়

ভেতরের wrapper closure-এর মাধ্যমে বাইরের দুটোরই variable দেখতে পায় — \`times\` আর \`fn\` দুটোই।

Analogy: একটা "মোড়ক বানানোর মেশিন"-এর কারখানা। প্রথমে কারখানাকে বলেন "লাল রঙের মোড়ক বানাও" (factory-কে setting দেওয়া)। কারখানা আপনাকে একটা মেশিন দেয় (decorator)। সেই মেশিনে উপহার ঢোকালে মোড়ানো উপহার বের হয় (wrapper)।

Common bug: argument-ওয়ালা decorator-কে \`()\` ছাড়া লেখা — \`@retry\`। তখন function-টা \`times\` হিসেবে ঢুকে যায়, আর সবকিছু উল্টাপাল্টা হয়।`,
        examples: [
          {
            lang: 'python',
            code: `import functools

def retry(times=3, exceptions=(Exception,)):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except exceptions as e:
                    print(f"attempt {attempt} failed: {e}")
            raise RuntimeError(f"{fn.__name__} failed {times} times")
        return wrapper
    return decorator

calls = {"n": 0}

@retry(times=3, exceptions=(ConnectionError,))
def fetch():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("timeout")
    return "data"

print(fetch())`,
            output: `attempt 1 failed: timeout
attempt 2 failed: timeout
data`,
          },
          {
            lang: 'python',
            caption: 'A decorator factory that tags functions with a required role',
            code: `def require_role(role):
    def decorator(fn):
        def wrapper(user, *args, **kwargs):
            if role not in user["roles"]:
                return f"403: {role} required"
            return fn(user, *args, **kwargs)
        return wrapper
    return decorator

@require_role("admin")
def delete_user(user, user_id):
    return f"deleted {user_id}"

print(delete_user({"roles": ["admin"]}, 7))
print(delete_user({"roles": ["viewer"]}, 7))`,
            output: `deleted 7
403: admin required`,
          },
        ],
        pitfalls: [
          'Using `@retry` instead of `@retry()` passes the function as the first argument.',
          'Retrying on bare `Exception` also retries programming errors like `TypeError` — narrow the exception types.',
        ],
        followUps: [
          'How would you add exponential backoff to the retry decorator?',
          'How can one decorator support both `@d` and `@d(arg)`?',
        ],
      },
      visualizationId: 'py-decorator-wrapping',
      related: ['py-decorators-basics', 'py-decorator-use-cases'],
    },
    {
      id: 'py-decorator-use-cases',
      level: 'intermediate',
      priority: 3,
      question:
        'What are real-world use cases for decorators? Show a timing and a caching decorator.',
      tags: ['decorators', 'timing', 'caching', 'memoization', 'auth'],
      answer: {
        interview: `**Decorators handle cross-cutting concerns — behaviour many functions need that is not their core job.**

- **Timing / profiling:** measure how long a call takes.
- **Logging / tracing:** record calls, arguments, results, errors.
- **Retry with backoff:** re-run flaky network or database calls.
- **Caching / memoization:** remember results of expensive pure functions (\`functools.lru_cache\`, \`functools.cache\`).
- **Access control:** \`@login_required\`, \`@require_role("admin")\` in web frameworks.
- **Validation / rate limiting / registration:** check arguments, throttle calls, or register handlers (\`@app.route\`, \`@pytest.fixture\`).
- Built-in examples: \`@property\`, \`@classmethod\`, \`@staticmethod\`, \`@dataclass\`, \`@contextmanager\`.

Real-world: a single \`@timed\` on slow endpoints is a quick way to find bottlenecks without touching their code.`,
        explanationBn: `Decorator-এর আসল মূল্য হলো **"cross-cutting concern"** আলাদা রাখা — অর্থাৎ এমন কাজ যেটা অনেক function-এরই দরকার, কিন্তু কোনোটারই মূল কাজ না।

ভাবুন ৩০টা API function-এ সময় মাপতে হবে। প্রতিটার শুরুতে-শেষে timing code লিখলে ৩০ জায়গায় একই code, আর পরে বদলাতে হলে ৩০ জায়গায় বদলাতে হবে। Decorator লিখলে logic এক জায়গায়, আর প্রতিটা function-এর ওপর শুধু \`@timed\`।

প্রচলিত ব্যবহার:
- **Timing:** কোন function ধীর তা খুঁজে বের করা।
- **Caching (memoization):** একই input-এ একই output দেয় এমন ভারী function-এর result মনে রাখা — দ্বিতীয়বার আর হিসাব করতে হয় না।
- **Retry:** network call ব্যর্থ হলে আবার চেষ্টা।
- **Auth:** Django-র \`@login_required\` — user login না করলে function চলবেই না।
- **Registration:** Flask-এর \`@app.route("/")\` — function-টাকে একটা URL-এর সাথে নিবন্ধন করে।

আপনি সম্ভবত আগেই অনেক decorator ব্যবহার করেছেন: \`@property\`, \`@staticmethod\`, \`@dataclass\` — সবই decorator।

Caching-এর একটা শর্ত মনে রাখুন: function-কে **pure** হতে হবে (একই input → সবসময় একই output, কোনো side effect নেই), আর argument গুলো hashable হতে হবে, কারণ সেগুলো dict-এর key হিসেবে রাখা হয়।`,
        examples: [
          {
            lang: 'python',
            caption: 'A timing decorator',
            code: `import functools, time

def timed(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            elapsed = time.perf_counter() - start
            print(f"{fn.__name__} took {elapsed:.1f}s")
    return wrapper

@timed
def slow_report():
    time.sleep(0.2)
    return "done"

print(slow_report())`,
            output: `slow_report took 0.2s
done`,
          },
          {
            lang: 'python',
            caption: 'A hand-written memoizing decorator (what lru_cache does for you)',
            code: `import functools

def memoize(fn):
    cache = {}
    @functools.wraps(fn)
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]
    wrapper.cache = cache
    return wrapper

@memoize
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(80), len(fib.cache))`,
            output: `23416728348467685 81`,
          },
        ],
        pitfalls: [
          'Caching functions with side effects or unhashable arguments (lists, dicts) breaks or errors.',
          'An unbounded cache is a memory leak in a long-running process — bound it (`lru_cache(maxsize=...)`).',
          'Decorating methods: the wrapper receives `self` as the first positional argument.',
        ],
        followUps: [
          'How does `functools.lru_cache` work, and what are its limits?',
          'How would you add a timeout or rate limit with a decorator?',
        ],
      },
      related: ['py-decorators-basics', 'py-lru-cache-partial'],
    },
    {
      id: 'py-generators-yield',
      level: 'intermediate',
      priority: 3,
      question: 'What is a generator, and what is the difference between `yield` and `return`?',
      tags: ['generators', 'yield', 'lazy-evaluation', 'memory', 'iterators'],
      answer: {
        interview: `**A generator is a function that contains \`yield\`. Calling it returns a generator object; each \`next()\` runs the body until the next \`yield\`, hands back that value and *pauses*, keeping all local state.**

- \`return\` ends the function and sends back one value; \`yield\` produces a value and suspends, so the function can resume where it left off.
- Lazy evaluation: values are produced one at a time, on demand — memory stays O(1) instead of building a whole list.
- When the body finishes (or hits \`return\`), the generator raises \`StopIteration\`; \`for\` loops handle that for you.
- A generator can be iterated **only once** — after exhaustion it yields nothing.
- They can represent infinite sequences and pipelines: read lines → filter → transform, one item at a time.

Real-world: processing a 10 GB log file line by line, streaming database rows, or paginating an API without loading everything into memory.`,
        explanationBn: `সাধারণ function \`return\` পেলে শেষ — local variable সব মুছে যায়, পরের call আবার শুরু থেকে। Generator function \`yield\` পেলে **থামে, কিন্তু শেষ হয় না**: value-টা দিয়ে দেয়, তারপর ঠিক সেই লাইনে, সব local variable সহ, "pause" হয়ে বসে থাকে। পরের বার \`next()\` ডাকলে ঠিক সেখান থেকে আবার চলা শুরু করে।

Function-এর body-তে কোথাও \`yield\` থাকলেই সেটা generator function। আর একটা চমক: generator function call করলে body-র **কিছুই চলে না** — শুধু একটা generator object ফেরত আসে। Body চলা শুরু হয় প্রথম \`next()\`-এ।

**Memory-র সুবিধা (lazy evaluation):** ১ কোটি সংখ্যার list বানালে সব সংখ্যা একসাথে memory-তে থাকে (দশ-বিশ MB)। Generator একবারে মাত্র একটা সংখ্যা বানায় — memory প্রায় শূন্য, সংখ্যা যতই হোক।

Analogy: list হলো পুরো বইটা একবারে ছাপিয়ে হাতে দেওয়া। Generator হলো একজন গল্পকার, যিনি আপনি "তারপর?" বললে পরের পাতাটা বলেন, আর আপনি না বলা পর্যন্ত চুপচাপ অপেক্ষা করেন — কোথায় থেমেছিলেন সেটা মনে রেখে।

শেষ হলে generator \`StopIteration\` raise করে। \`for\` loop সেটা নিজেই ধরে loop বন্ধ করে, তাই আমাদের দেখতে হয় না।

**ফাঁদ:** generator একবারই চলে। পুরোটা একবার পড়ে ফেললে দ্বিতীয়বার loop চালালে কিছুই পাবেন না। আবার লাগলে নতুন generator বানাতে হবে, বা result list-এ রেখে দিতে হবে।`,
        examples: [
          {
            lang: 'python',
            caption: 'Pause and resume: local state survives between next() calls',
            code: `def countdown(n):
    print("starting")
    while n > 0:
        yield n
        n -= 1
    print("done")

gen = countdown(3)        # nothing printed yet: the body has not started
print(next(gen))
print(next(gen))
print(list(gen))          # resumes, yields 1, then finishes
print(list(gen))          # exhausted: one-time iteration`,
            output: `starting
3
2
done
[1]
[]`,
          },
          {
            lang: 'python',
            caption: 'Memory: a generator holds one value at a time',
            code: `import sys

squares_list = [n * n for n in range(1_000_000)]
squares_gen = (n * n for n in range(1_000_000))

print(sys.getsizeof(squares_list) > 1_000_000)
print(sys.getsizeof(squares_gen) < 1_000)
print(sum(squares_gen) == sum(squares_list))`,
            output: `True
True
True`,
          },
          {
            lang: 'python',
            caption: 'A lazy pipeline: nothing is read until the final loop asks for it',
            code: `lines = ["INFO ok", "ERROR disk full", "INFO ok", "ERROR timeout"]

def read(source):
    for line in source:
        yield line

errors = (line for line in read(lines) if line.startswith("ERROR"))
messages = (line.split(" ", 1)[1] for line in errors)

for msg in messages:
    print(msg)`,
            output: `disk full
timeout`,
          },
        ],
        pitfalls: [
          'A generator is exhausted after one pass; iterating it again silently yields nothing.',
          '`len(gen)` and `gen[0]` do not work — generators have no length or indexing.',
          'Calling a generator function does not run any of its code until the first `next()`.',
        ],
        followUps: [
          'What is `yield from`?',
          'What is the difference between an iterable and an iterator?',
          'What is a generator expression?',
          'When is a list better than a generator?',
        ],
      },
      visualizationId: 'py-generator-stepper',
      related: ['py-iterable-vs-iterator', 'py-genexp-vs-listcomp', 'py-yield-from'],
    },
    {
      id: 'py-iterable-vs-iterator',
      level: 'intermediate',
      priority: 2,
      question:
        'What is the difference between an iterable and an iterator? Write a custom iterator.',
      tags: ['iterators', 'iterables', 'iterator-protocol', '__iter__', '__next__'],
      answer: {
        interview: `**An iterable is anything you can loop over — it has \`__iter__\` that returns an iterator. An iterator is the object that does the looping — it has \`__next__\` (returning the next item or raising \`StopIteration\`) and an \`__iter__\` that returns itself.**

- Lists, tuples, strings, dicts, sets and files are iterables; \`iter(x)\` gives an iterator over them.
- A \`for\` loop calls \`iter()\` once, then \`next()\` repeatedly until \`StopIteration\`.
- An iterable can be looped many times (each loop gets a fresh iterator); an iterator is **single-use**.
- Generators are iterators, created the easy way.
- Custom iterator: implement \`__iter__\` and \`__next__\`. A cleaner design is an iterable class whose \`__iter__\` is a generator.

Real-world: file objects are iterators — that is why reading a file twice in the same loop pattern gives nothing the second time.`,
        explanationBn: `দুটো শব্দ কাছাকাছি, কিন্তু ভূমিকা আলাদা:

- **Iterable** — "যার ওপর loop চালানো যায়"। এর একটা \`__iter__()\` method থাকে, যেটা একটা iterator বানিয়ে দেয়। list, string, dict, set — সব iterable।
- **Iterator** — "যে আসলে loop চালায়"। এর \`__next__()\` থাকে: প্রতিবার পরের item দেয়, শেষ হলে \`StopIteration\` raise করে। Iterator জানে সে এখন কোথায় আছে (state রাখে)।

Analogy: **বই** হলো iterable, আর **bookmark** হলো iterator। একই বইয়ে অনেকগুলো bookmark রাখা যায় — প্রত্যেকে আলাদাভাবে পড়তে পারে। কিন্তু একটা bookmark একবার শেষ পাতায় চলে গেলে সেটা আর শুরুতে ফেরে না।

**\`for\` loop ভেতরে যা করে:**
\`\`\`python
it = iter(items)          # iterable থেকে iterator
while True:
    try:
        x = next(it)
    except StopIteration:
        break
    ...                   # loop body
\`\`\`

এজন্যই list-এর ওপর দুবার loop চালালে দুবারই সব পাওয়া যায় (প্রতিবার নতুন iterator), কিন্তু একটা iterator বা generator-এর ওপর দ্বিতীয়বার চালালে কিছুই পাওয়া যায় না।

Custom iterator লিখতে \`__iter__\` (যেটা \`self\` ফেরত দেয়) আর \`__next__\` লিখতে হয়। তবে বাস্তবে বেশি সুবিধাজনক হলো class-এর \`__iter__\`-কে একটা generator বানিয়ে দেওয়া — তাহলে object-টা বারবার iterate করা যায়।`,
        examples: [
          {
            lang: 'python',
            caption: 'What a for loop does under the hood',
            code: `nums = [10, 20]
it = iter(nums)
print(next(it), next(it))
try:
    next(it)
except StopIteration:
    print("StopIteration")
print(iter(it) is it)     # an iterator's __iter__ returns itself`,
            output: `10 20
StopIteration
True`,
          },
          {
            lang: 'python',
            caption: 'A custom iterator vs a reusable iterable',
            code: `class Countdown:                     # an iterator: single-use
    def __init__(self, start):
        self.current = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1

c = Countdown(3)
print(list(c), list(c))

class Range:                         # an iterable: fresh iterator each time
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        yield from range(self.n)

r = Range(3)
print(list(r), list(r))`,
            output: `[3, 2, 1] []
[0, 1, 2] [0, 1, 2]`,
          },
        ],
        pitfalls: [
          'Passing an iterator to code that loops twice (e.g. once to validate, once to process) silently loses data.',
          'Forgetting to raise `StopIteration` in `__next__` creates an infinite loop.',
        ],
        followUps: [
          'Are all iterables iterators?',
          'How does a `for` loop know when to stop?',
          'How would you make an object that can be iterated multiple times?',
        ],
      },
      related: ['py-generators-yield'],
    },
    {
      id: 'py-genexp-vs-listcomp',
      level: 'intermediate',
      priority: 2,
      question: 'What is the difference between a generator expression and a list comprehension?',
      tags: ['generators', 'comprehensions', 'lazy-evaluation', 'memory'],
      answer: {
        interview: `**A list comprehension \`[...]\` builds the whole list immediately; a generator expression \`(...)\` produces items lazily, one at a time, using almost no memory.**

- Use a genexp when the result is consumed once, in order — especially by \`sum\`, \`max\`, \`any\`, \`all\`, \`"".join\`, or a \`for\` loop.
- Use a list when you need indexing, \`len\`, multiple passes, or to keep the results.
- A genexp as the only argument can drop its own parentheses: \`sum(x * x for x in nums)\`.
- Genexps short-circuit with \`any\`/\`all\`; a list comprehension computes everything first.
- For small data the list is often slightly faster; for large or infinite data the generator wins.

Real-world: \`total = sum(order.amount for order in orders)\` without building a temporary list.`,
        explanationBn: `লেখার পার্থক্য শুধু bracket-এ — \`[]\` বনাম \`()\` — কিন্তু আচরণ একদম আলাদা:

- **List comprehension \`[...]\`**: সাথে সাথে **সব** item হিসাব করে একটা list বানায়, সব memory-তে রাখে।
- **Generator expression \`(...)\`**: কিছুই আগে হিসাব করে না। একটা generator দেয়, যেটা কেউ চাইলে তখন একটা একটা করে item বানায়।

কখন কোনটা?
- Result একবারই, ক্রমানুসারে ব্যবহার করবেন (যেমন যোগফল, সর্বোচ্চ, কোনো শর্ত মেলে কি না) → **generator expression**। Memory বাঁচে, আর \`any\`/\`all\`-এর সাথে প্রথম উত্তর পেলেই থেমে যায়।
- Result একাধিকবার লাগবে, \`len\` বা index দরকার, বা পরে আবার ব্যবহার করবেন → **list**।

একটা সুন্দর syntax সুবিধা: function-এর একমাত্র argument হিসেবে generator expression দিলে আলাদা bracket লাগে না — \`sum(x * x for x in nums)\`।

ছোট data-য় list সাধারণত একটু দ্রুত, কারণ generator-এর প্রতিটা ধাপে pause/resume-এর সামান্য খরচ আছে। কিন্তু data বড় হলে বা অসীম হলে generator ছাড়া উপায় নেই।`,
        examples: [
          {
            lang: 'python',
            code: `nums = range(1, 6)
as_list = [n * n for n in nums]
as_gen = (n * n for n in nums)

print(as_list, len(as_list), as_list[0])
print(type(as_gen).__name__, sum(as_gen), sum(as_gen))

def noisy(n):
    print(f"checking {n}")
    return n > 2

print(any(noisy(n) for n in nums))    # stops at the first True`,
            output: `[1, 4, 9, 16, 25] 5 1
generator 55 0
checking 1
checking 2
checking 3
True`,
          },
        ],
        pitfalls: [
          'A generator expression can be consumed only once — the second `sum` above is `0`.',
          '`any([noisy(n) for n in nums])` would call `noisy` for every item before `any` sees anything.',
        ],
        followUps: ['When is a list faster than a generator?'],
      },
      related: ['py-generators-yield', 'py-list-comprehensions'],
    },
    {
      id: 'py-closures',
      level: 'intermediate',
      priority: 2,
      question: 'What is a closure in Python?',
      tags: ['closures', 'scope', 'nested-functions', 'nonlocal'],
      answer: {
        interview: `**A closure is an inner function that remembers variables from the enclosing function's scope, even after the outer function has returned.**

- Three ingredients: a nested function, it references a variable from the outer function, and the outer function returns (or passes out) the inner one.
- The captured variables live in "cells" — see \`fn.__closure__[i].cell_contents\`.
- To **rebind** a captured variable from inside, declare it \`nonlocal\`; reading needs no declaration.
- Closures give functions private state without a class.
- Decorators, callbacks and function factories are all built on closures.

Real-world: \`make_multiplier(3)\` returning a function that triples, or a counter with hidden state.`,
        explanationBn: `সাধারণত function শেষ হলে তার local variable মুছে যায়। কিন্তু যদি সেই function-এর ভেতরে আরেকটা function থাকে, যেটা বাইরের variable ব্যবহার করে, আর বাইরের function সেই ভেতরের function-টাকে ফেরত দেয় — তাহলে ভেতরের function বাইরের variable গুলো **সাথে নিয়ে যায়**। এই function আর তার মনে রাখা variable-এর জুটিকেই **closure** বলে।

Analogy: একটা পিঠে বাঁধা ব্যাগ। ভেতরের function জন্মের সময় যে পরিবেশে ছিল, সেখান থেকে দরকারি জিনিসগুলো ব্যাগে ভরে নেয়। বাইরের function শেষ হয়ে গেলেও ব্যাগটা ভেতরের function-এর পিঠেই থাকে।

কয়েকটা গুরুত্বপূর্ণ বিষয়:
- বাইরের variable **পড়তে** কিছু লাগে না। কিন্তু ভেতর থেকে তাকে **নতুন value assign** করতে চাইলে \`nonlocal\` লিখতে হয়, নইলে Python ভাবে আপনি নতুন local variable বানাচ্ছেন।
- প্রতিবার বাইরের function call করলে নতুন একটা closure তৈরি হয়, নিজস্ব আলাদা variable সহ। তাই \`make_counter()\` দুবার ডাকলে দুটো স্বাধীন counter।
- Closure হলো class ছাড়া private state রাখার একটা হালকা উপায় — বাইরে থেকে \`count\` সরাসরি ছোঁয়ার কোনো রাস্তা নেই।

Decorator-এর wrapper একটা closure — সে \`fn\`-কে মনে রাখে।`,
        examples: [
          {
            lang: 'python',
            code: `def make_multiplier(factor):
    def multiply(x):
        return x * factor        # 'factor' is captured
    return multiply

triple = make_multiplier(3)
print(triple(10))
print(triple.__closure__[0].cell_contents)

def make_counter():
    count = 0
    def increment():
        nonlocal count           # needed to rebind, not to read
        count += 1
        return count
    return increment

a, b = make_counter(), make_counter()
print(a(), a(), a(), b())`,
            output: `30
3
1 2 3 1`,
          },
        ],
        pitfalls: [
          'Assigning to a captured variable without `nonlocal` raises `UnboundLocalError`.',
          'Closures capture variables, not values — in loops they see the final value (late binding).',
        ],
        followUps: [
          'What is the late-binding closure problem?',
          'How do closures relate to decorators?',
          'Closure or class — when would you choose each?',
        ],
      },
      related: ['py-late-binding-closures', 'py-global-nonlocal', 'py-decorators-basics'],
    },
    {
      id: 'py-late-binding-closures',
      level: 'intermediate',
      priority: 2,
      question:
        'Why do functions created in a loop all return the same value, and how do you fix it?',
      tags: ['closures', 'late-binding', 'lambda', 'loops'],
      answer: {
        interview: `**Closures capture the *variable*, not its value at creation time. The value is looked up when the function is called — after the loop finished — so every function sees the loop variable's final value.**

- \`[lambda: i for i in range(3)]\` → all three return \`2\`.
- **Fix 1:** bind the current value as a default argument: \`lambda i=i: i\` (defaults are evaluated at definition time).
- **Fix 2:** use a factory function so each call gets its own scope: \`def make(i): return lambda: i\`.
- **Fix 3:** \`functools.partial(fn, i)\` freezes the argument.
- It is the same mechanism that makes closures useful — the binding is "late".

Real-world: creating callback handlers for a list of buttons or tasks in a loop.`,
        explanationBn: `এটা closure-এর একটা বিখ্যাত ফাঁদ। ধরুন loop-এ তিনটা function বানালেন, প্রতিটা যেন তার নিজের \`i\` ফেরত দেয়। কিন্তু call করলে তিনটাই \`2\` দেয়। কেন?

কারণ closure **variable-টাকে** মনে রাখে, সেই মুহূর্তের **value-কে** না। তিনটা lambda-ই আসলে একই \`i\`-এর দিকে তাকিয়ে আছে। Lambda গুলো যখন **call** হয়, তখন তারা \`i\`-এর বর্তমান value দেখে — আর ততক্ষণে loop শেষ, \`i\` হয়ে গেছে \`2\`। এটাকে বলে **late binding**: নাম থেকে value খোঁজা হয় দেরিতে, call-এর সময়।

Analogy: তিনজনকে একটা দেয়ালঘড়ির দিকে ইশারা করে বললেন, "সময়টা মনে রাখো।" কিন্তু তারা সময় লিখে রাখেনি, শুধু ঘড়িটা মনে রেখেছে। পরে জিজ্ঞেস করলে তিনজনই ঘড়ি দেখে একই (এখনকার) সময় বলে।

**সমাধান — value-টাকে সেই মুহূর্তেই আটকে ফেলা:**
1. **Default argument:** \`lambda i=i: i\` — default value function তৈরির সময়ই evaluate হয়, তাই প্রতিটা lambda নিজের কপি পায়।
2. **Factory function:** \`make_handler(i)\` — প্রতিবার call-এ নতুন scope তৈরি হয়, যেখানে \`i\` আলাদা।
3. **\`functools.partial\`** — argument আগে থেকে বসিয়ে রাখে।`,
        examples: [
          {
            lang: 'python',
            code: `funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])            # all see the final i

fixed = [lambda i=i: i for i in range(3)]
print([f() for f in fixed])            # default arg freezes each value

def make(i):
    return lambda: i
factory = [make(i) for i in range(3)]
print([f() for f in factory])          # each call has its own scope`,
            output: `[2, 2, 2]
[0, 1, 2]
[0, 1, 2]`,
          },
        ],
        pitfalls: [
          'The default-argument fix changes the function signature — a caller could pass a different `i`.',
          'The same happens with `def` functions defined in a loop, not only lambdas.',
        ],
        followUps: [
          'Why does the default-argument trick work?',
          'How does `functools.partial` help here?',
        ],
      },
      related: ['py-closures', 'py-mutable-default-argument'],
    },
    {
      id: 'py-global-nonlocal',
      level: 'intermediate',
      priority: 2,
      question: 'What do the `global` and `nonlocal` keywords do?',
      tags: ['scope', 'global', 'nonlocal', 'closures'],
      answer: {
        interview: `**They let a function *rebind* a name in an outer scope instead of creating a local one. \`global x\` targets the module-level \`x\`; \`nonlocal x\` targets the nearest enclosing function's \`x\`.**

- You only need them to **assign**; reading an outer name works without any declaration.
- Mutating an outer object (\`items.append(1)\`) needs neither — that is not rebinding the name.
- \`nonlocal\` requires the name to already exist in an enclosing function; it cannot reach module globals.
- Heavy use of \`global\` makes code hard to test and reason about — prefer passing values in and returning results, or a class.

Real-world: \`nonlocal\` is common in closures and decorators that keep a counter; \`global\` mostly appears in small scripts.`,
        explanationBn: `Python-এ function-এর ভেতরে কোনো নামে assign করলে (\`x = ...\`, \`x += 1\`), Python ধরে নেয় সেটা একটা **নতুন local variable**। বাইরের একই নামের variable ছোঁয়া হয় না।

কিন্তু কখনো কখনো আমরা আসলেই বাইরের variable বদলাতে চাই। তখন Python-কে জানিয়ে দিতে হয়:
- **\`global x\`** — "এই \`x\` module-এর top-level-এর \`x\`।"
- **\`nonlocal x\`** — "এই \`x\` আমার ঠিক বাইরের function-এর \`x\`।" (closure-এ লাগে)

তিনটা জিনিস পরিষ্কার রাখুন:
1. শুধু **পড়তে** কোনো keyword লাগে না।
2. Object **mutate** করতেও লাগে না — \`cart.append(x)\` নাম বদলাচ্ছে না, object বদলাচ্ছে।
3. লাগে শুধু নামটাকে **নতুন value-তে বসাতে** (rebind)।

\`global\` বেশি ব্যবহার করা খারাপ অভ্যাস — যেকোনো function যেকোনো সময় global বদলাতে পারলে কোথায় কী বদলাচ্ছে বোঝা কঠিন, আর test লেখাও কঠিন। ভালো পথ হলো argument পাঠানো আর result return করা।`,
        examples: [
          {
            lang: 'python',
            code: `count = 0

def bump():
    global count
    count += 1

bump(); bump()
print(count)

def outer():
    total = 0
    def add(n):
        nonlocal total
        total += n
    add(5); add(7)
    return total

print(outer())

items = []
def remember(x):
    items.append(x)      # mutation: no keyword needed
remember("a")
print(items)`,
            output: `2
12
['a']`,
          },
        ],
        pitfalls: [
          '`nonlocal` for a module-level name is a SyntaxError — use `global` (or better, avoid it).',
          'Global mutable state makes functions order-dependent and hard to test.',
        ],
        followUps: ['What is `UnboundLocalError`?'],
      },
      visualizationId: 'py-legb-scope',
      related: ['py-legb-scope', 'py-unboundlocalerror', 'py-closures'],
    },
    {
      id: 'py-unboundlocalerror',
      level: 'intermediate',
      priority: 2,
      question:
        'Why does this raise `UnboundLocalError`?\n\n```python\ncount = 0\n\ndef bump():\n    count += 1\n\nbump()\n```',
      tags: ['scope', 'unboundlocalerror', 'global', 'compile-time'],
      answer: {
        interview: `**Because \`count += 1\` is an assignment, so the compiler marks \`count\` as local for the *whole* function. At runtime the read part of \`count += 1\` looks up the local \`count\`, which has not been assigned yet.**

- Scope is decided when the function is compiled, not line by line at runtime.
- Even an assignment *later* in the function makes earlier reads of that name fail.
- Fixes: \`global count\` (or \`nonlocal\` in a closure), or better — pass the value in and return the new one.
- \`UnboundLocalError\` is a subclass of \`NameError\`.

Real-world: it often appears when someone adds a "harmless" assignment at the bottom of a function that previously only read a global.`,
        explanationBn: `অনেকেই ভাবেন: "\`count\` তো বাইরে আছে, ভেতরে পড়তে পারব না কেন?"

উত্তরটা লুকিয়ে আছে **কখন** Python scope ঠিক করে তার মধ্যে। Function চালানোর আগে compile করার সময়ই Python পুরো function-টা দেখে নেয়। যদি কোথাও \`count = ...\` বা \`count += ...\` (যেটাও assignment) থাকে, তাহলে Python ঘোষণা করে দেয়: "এই function-এ \`count\` একটা **local** variable" — পুরো function জুড়ে, প্রথম লাইন থেকেই।

এখন runtime-এ \`count += 1\` মানে \`count = count + 1\`। ডান পাশে \`count\` পড়তে গিয়ে Python local \`count\` খোঁজে — কারণ এটা তো local বলে ঘোষিত — কিন্তু তাতে এখনো কোনো value বসানো হয়নি। তাই error: local variable আছে, কিন্তু "unbound"।

মজার ব্যাপার: function-এর একদম শেষ লাইনে assignment থাকলেও শুরুর দিকের read ভেঙে যায়।

সমাধান: \`global count\` লিখে বলে দেওয়া যে এটা বাইরেরটা। তবে সবচেয়ে পরিষ্কার design হলো value-টা argument হিসেবে নেওয়া আর নতুন value return করা।`,
        examples: [
          {
            lang: 'python',
            caption: 'The code from the question, as it fails',
            code: `count = 0

def bump():
    count += 1

bump()`,
            output: `UnboundLocalError: cannot access local variable 'count' where it is not associated with a value`,
          },
          {
            lang: 'python',
            code: `count = 0

def bump():
    count += 1

try:
    bump()
except UnboundLocalError as e:
    print(type(e).__name__, issubclass(UnboundLocalError, NameError))

def show():
    print(total)     # fails, because of the assignment below
    total = 5

total = 1
try:
    show()
except UnboundLocalError:
    print("assignment later in the function made 'total' local")`,
            output: `UnboundLocalError True
assignment later in the function made 'total' local`,
          },
        ],
        pitfalls: [
          'An assignment anywhere in the function — even after the read — makes the name local.',
        ],
        followUps: ['How does Python decide which scope a name belongs to?'],
      },
      visualizationId: 'py-legb-scope',
      related: ['py-global-nonlocal', 'py-legb-scope'],
    },
    {
      id: 'py-functools-wraps',
      level: 'intermediate',
      priority: 2,
      question: 'What does `functools.wraps` do, and why does it matter?',
      tags: ['decorators', 'functools', 'wraps', 'introspection'],
      answer: {
        interview: `**\`@functools.wraps(fn)\` copies the original function's metadata — \`__name__\`, \`__qualname__\`, \`__doc__\`, \`__module__\`, \`__dict__\` — onto the wrapper and sets \`wrapper.__wrapped__ = fn\`.**

- Without it, every decorated function looks like it is called \`wrapper\`, with no docstring.
- That breaks debugging and logs, \`help()\`, documentation tools, and frameworks that register functions by name (e.g. Flask endpoints, pytest).
- \`inspect.signature\` follows \`__wrapped__\`, so the real signature is shown.
- \`__wrapped__\` also lets you reach the undecorated function, which is handy in tests.

Real-world: two Flask routes decorated without \`wraps\` both get the endpoint name "wrapper" and collide.`,
        explanationBn: `Decorator আসল function-কে একটা wrapper দিয়ে বদলে দেয়। সমস্যা হলো, এখন সেই নামটা wrapper-কে দেখায় — তাই \`add.__name__\` লিখলে আসে \`"wrapper"\`, docstring হারিয়ে যায়, \`help(add)\` ভুল তথ্য দেখায়।

শুনতে ছোট সমস্যা মনে হলেও বাস্তবে বড় ঝামেলা তৈরি করে:
- Log আর error message-এ সব function-এর নাম "wrapper" — কোনটা কোনটা বোঝা যায় না।
- Flask-এর মতো framework function-এর নাম দিয়ে route নিবন্ধন করে। দুটো decorated route-এর নামই "wrapper" হলে সংঘর্ষ হয়।
- Documentation tool ভুল docstring দেখায়।

\`@functools.wraps(fn)\` wrapper-এর ওপর আসল function-এর পরিচয় (নাম, docstring, module ইত্যাদি) কপি করে দেয়। সাথে \`__wrapped__\` attribute-এ আসল function-টাও রেখে দেয় — test-এ decorator বাদ দিয়ে আসল function call করতে চাইলে কাজে লাগে।

সংক্ষেপে: প্রতিটা decorator-এর wrapper-এ \`@functools.wraps\` লিখুন — এটা একটা ভালো অভ্যাস যেটা interviewer খেয়াল করেন।`,
        examples: [
          {
            lang: 'python',
            code: `import functools

def plain(fn):
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper

def proper(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper

@plain
def a():
    """Docstring of a."""

@proper
def b():
    """Docstring of b."""

print(a.__name__, a.__doc__)
print(b.__name__, b.__doc__)
print(b.__wrapped__.__name__)`,
            output: `wrapper None
b Docstring of b.
b`,
          },
        ],
        followUps: ['How can a test call the original, undecorated function?'],
      },
      related: ['py-decorators-basics'],
    },
    {
      id: 'py-stacked-decorators',
      level: 'intermediate',
      priority: 2,
      question: 'In what order are stacked decorators applied and executed?',
      tags: ['decorators', 'stacking', 'order'],
      answer: {
        interview: `**They are applied bottom-up and run top-down. The decorator closest to the function wraps it first; the top decorator ends up outermost, so its code runs first on each call and its "after" code runs last.**

- \`@a\` / \`@b\` / \`def f\` means \`f = a(b(f))\`.
- On a call: \`a\`'s wrapper → \`b\`'s wrapper → \`f\` → back through \`b\` → back through \`a\`.
- Order matters: \`@cache\` above \`@timed\` caches the timed function (the timer only runs on a cache miss); swapped, every call is timed, hits included.
- Similarly, an auth check should be outermost so nothing else runs for an unauthorized user.

Real-world: in Flask, \`@app.route\` must be the top decorator, otherwise it registers the undecorated function.`,
        explanationBn: `একাধিক decorator একটার ওপর আরেকটা বসালে দুটো আলাদা "ক্রম" আছে, আর দুটো গুলিয়ে ফেলাই সাধারণ ভুল:

**১. Apply হওয়ার ক্রম — নিচ থেকে উপরে।**
\`\`\`python
@bold
@italic
def greet(): ...
\`\`\`
মানে \`greet = bold(italic(greet))\`। Function-এর সবচেয়ে কাছের (\`italic\`) আগে মোড়ায়, তারপর বাইরে থেকে \`bold\` মোড়ায়।

**২. Call-এর সময় চলার ক্রম — উপর থেকে নিচে।**
সবচেয়ে বাইরের মোড়ক (\`bold\`) আগে চলে, সে ভেতরেরটাকে (\`italic\`) ডাকে, সে আসল function-কে ডাকে। Result ফেরার সময় উল্টো পথে — ভেতর থেকে বাইরে।

Analogy: পেঁয়াজের খোসা। বানানোর সময় ভেতরের স্তর আগে লাগে। কাটার সময় বাইরের স্তর আগে খোলা হয়।

বাস্তবে ক্রম গুরুত্বপূর্ণ: auth-check decorator সবার উপরে রাখা উচিত, যাতে অননুমোদিত user-এর জন্য বাকি কিছু (logging, caching) চলেই না। আর Flask-এ \`@app.route\` সবার উপরে না থাকলে সে নিচের decorator গুলো ছাড়া আসল function-টাকে নিবন্ধন করে ফেলে।`,
        examples: [
          {
            lang: 'python',
            code: `def tag(name):
    def decorator(fn):
        print(f"applying {name}")
        def wrapper():
            print(f"enter {name}")
            result = f"<{name}>{fn()}</{name}>"
            print(f"exit {name}")
            return result
        return wrapper
    return decorator

@tag("b")
@tag("i")
def greet():
    return "hi"

print(greet())`,
            output: `applying i
applying b
enter b
enter i
exit i
exit b
<b><i>hi</i></b>`,
          },
        ],
        pitfalls: [
          'Putting `@app.route` (or any registering decorator) below others registers an unwrapped function.',
          'A caching decorator placed below a logging one still logs cache hits.',
        ],
        followUps: ['Where should an authentication decorator go in a stack?'],
      },
      visualizationId: 'py-decorator-wrapping',
      related: ['py-decorators-basics'],
    },
    {
      id: 'py-lru-cache-partial',
      level: 'intermediate',
      priority: 2,
      question: 'What do `functools.lru_cache` and `functools.partial` do?',
      tags: ['functools', 'lru-cache', 'memoization', 'partial'],
      answer: {
        interview: `**\`lru_cache\` memoizes a function: it stores results keyed by the arguments and returns the cached result for repeat calls, evicting the least-recently-used entry once \`maxsize\` is reached. \`partial\` creates a new callable with some arguments pre-filled.**

**lru_cache:**
- \`@lru_cache(maxsize=128)\`; \`@functools.cache\` (3.9+) is the unbounded version.
- Arguments must be hashable; the function should be pure.
- \`fn.cache_info()\` shows hits/misses; \`fn.cache_clear()\` empties it.
- On methods it keeps \`self\` alive in the cache — a common memory leak.

**partial:**
- \`partial(int, base=2)("1010")\` → \`10\`.
- Useful for callbacks, \`map\`, and adapting a function to an interface that expects fewer arguments.

Real-world: \`lru_cache\` on a recursive or expensive lookup; \`partial(send_email, sender="noreply@…")\`.`,
        explanationBn: `**\`lru_cache\`** — ভারী হিসাবের result মনে রাখার built-in decorator। প্রথমবার \`f(5)\` call হলে হিসাব করে result রেখে দেয় (key = argument)। পরে আবার \`f(5)\` এলে হিসাব না করে সাথে সাথে রাখা result দেয়।

"LRU" মানে Least Recently Used: cache-এর একটা সর্বোচ্চ আকার (\`maxsize\`) থাকে। ভরে গেলে যেটা সবচেয়ে বেশিদিন ব্যবহার হয়নি, সেটা ফেলে দেয় — যাতে memory সীমার মধ্যে থাকে। \`@functools.cache\` হলো সীমাহীন সংস্করণ।

শর্ত: argument hashable হতে হবে (list চলবে না), আর function pure হতে হবে — একই input-এ সবসময় একই output।

Recursive Fibonacci-র মতো সমস্যায় এটা জাদুর মতো কাজ করে: exponential সময় থেকে linear সময়ে নেমে আসে, কারণ প্রতিটা subproblem একবারই হিসাব হয়।

**\`partial\`** — একটা function-এর কিছু argument আগে থেকে বসিয়ে নতুন একটা function বানায়। যেমন \`int\`-এর \`base=2\` বসিয়ে দিলে একটা "binary parser" পাওয়া যায়। Callback বা \`map\`-এ, যেখানে নির্দিষ্ট সংখ্যক argument-এর function লাগে, সেখানে খুব কাজের।`,
        examples: [
          {
            lang: 'python',
            code: `from functools import lru_cache, partial

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(30))
print(fib.cache_info())

parse_binary = partial(int, base=2)
print(parse_binary("1010"), parse_binary.func.__name__, parse_binary.keywords)

def power(base, exp):
    return base ** exp
square = partial(power, exp=2)
print(list(map(square, [1, 2, 3])))`,
            output: `832040
CacheInfo(hits=28, misses=31, maxsize=None, currsize=31)
10 int {'base': 2}
[1, 4, 9]`,
          },
        ],
        pitfalls: [
          '`lru_cache` on an instance method caches `self` too, keeping objects alive.',
          'Unhashable arguments raise `TypeError: unhashable type`.',
          'Caching a function that returns a mutable object lets callers corrupt the cached value.',
        ],
        followUps: [
          'How would you implement an LRU cache yourself?',
          'Why is caching instance methods with `lru_cache` risky?',
        ],
      },
      related: ['py-decorator-use-cases'],
    },
    {
      id: 'py-positional-keyword-only',
      level: 'intermediate',
      priority: 2,
      question: 'What do `/` and `*` mean in a function signature?',
      tags: ['functions', 'positional-only', 'keyword-only', 'api-design'],
      answer: {
        interview: `**Parameters before \`/\` are positional-only; parameters after \`*\` (or after \`*args\`) are keyword-only.**

- \`def f(a, b, /, c, *, d)\`: \`a\` and \`b\` positional-only, \`c\` either way, \`d\` keyword-only.
- Positional-only (3.8+) lets you rename parameters later without breaking callers, and avoids clashes with \`**kwargs\` names.
- Keyword-only forces readable call sites for flags and options: \`connect(host, timeout=5, retry=True)\`.
- Many built-ins are positional-only: \`len(obj=...)\` is an error.

Real-world: \`def send(to, /, *, subject, html=False)\` — the recipient is obvious, but the options must be named.`,
        explanationBn: `Signature-এ দুটো বিশেষ চিহ্ন argument কীভাবে পাঠাতে হবে তা নিয়ন্ত্রণ করে:

- **\`/\`-এর আগের** parameter গুলো শুধু position দিয়ে পাঠানো যাবে — নাম ধরে না।
- **\`*\`-এর পরের** parameter গুলো শুধু নাম ধরে পাঠানো যাবে — position দিয়ে না।

**Keyword-only কেন দরকার?** \`create_user("rafi", True, False)\` দেখে কেউ বুঝবে না \`True\` আর \`False\` কী বোঝায়। কিন্তু \`create_user("rafi", admin=True, notify=False)\` একদম পরিষ্কার। Boolean flag বা option-কে keyword-only বানালে call site সবসময় readable থাকে, আর ভুল ক্রমে argument দেওয়ার bug-ও হয় না।

**Positional-only কেন দরকার?** Library লেখকের স্বাধীনতার জন্য। Parameter-এর নাম যদি public API-র অংশ না হয়, তাহলে পরে নাম বদলালে কারও code ভাঙবে না। \`len(obj=x)\` লেখা যায় না, কারণ \`len\`-এর parameter positional-only।`,
        examples: [
          {
            lang: 'python',
            code: `def send(to, /, *, subject, html=False):
    return f"to={to} subject={subject} html={html}"

print(send("a@x.com", subject="Hi"))

for call in (lambda: send(to="a@x.com", subject="Hi"),
             lambda: send("a@x.com", "Hi")):
    try:
        call()
    except TypeError as e:
        print("TypeError:", e)`,
            output: `to=a@x.com subject=Hi html=False
TypeError: send() got some positional-only arguments passed as keyword arguments: 'to'
TypeError: send() takes 1 positional argument but 2 were given`,
          },
        ],
        followUps: ['Why are many built-in functions positional-only?'],
      },
      related: ['py-args-kwargs'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'py-yield-from',
      level: 'advanced',
      priority: 2,
      question: 'What does `yield from` do?',
      tags: ['generators', 'yield-from', 'delegation', 'recursion'],
      answer: {
        interview: `**\`yield from iterable\` delegates to another iterable or generator: it yields every value from it, and when the sub-generator finishes, the expression evaluates to that sub-generator's \`return\` value.**

- Simplest view: \`yield from it\` ≈ \`for x in it: yield x\`.
- It also forwards \`send()\` and \`throw()\` to the sub-generator, which a plain loop does not.
- It captures the sub-generator's \`return\` value: \`result = yield from sub()\`.
- Great for recursive generators — e.g. walking a tree or flattening nested lists.
- Historically it was the basis of coroutines before \`async\`/\`await\` (PEP 380).

Real-world: \`yield from walk(child)\` in a recursive directory or tree traversal.`,
        explanationBn: `\`yield from\` একটা generator-কে বলে: "এই অংশটা আমি অন্য একজনকে দিয়ে করাচ্ছি — তার সব value সরাসরি বাইরে পাঠিয়ে দাও।"

সহজ অর্থে এটা এই loop-এর সংক্ষিপ্ত রূপ:
\`\`\`python
for x in sub():
    yield x
\`\`\`

কিন্তু শুধু সংক্ষেপ না, আরও দুটো কাজ করে:
1. ভেতরের generator শেষে যা \`return\` করে, সেটা \`yield from\` expression-এর value হয়ে যায়: \`total = yield from sub()\`। সাধারণ loop দিয়ে এই return value পাওয়া যায় না।
2. বাইরে থেকে \`send()\` বা \`throw()\` করলে সেটা সরাসরি ভেতরের generator-এ পৌঁছে যায়।

সবচেয়ে কাজের জায়গা হলো **recursive generator** — যেমন nested list flatten করা বা tree traverse করা। প্রতিটা স্তর নিজের child-দের কাছে কাজ ভাগ করে দেয় \`yield from\` দিয়ে, আর সব value স্তর পেরিয়ে সোজা বাইরে চলে আসে।`,
        examples: [
          {
            lang: 'python',
            code: `def flatten(items):
    for item in items:
        if isinstance(item, list):
            yield from flatten(item)     # delegate to the recursive call
        else:
            yield item

print(list(flatten([1, [2, [3, [4]], 5]])))

def sub():
    yield 1
    yield 2
    return "sub finished"

def outer():
    result = yield from sub()
    yield result

print(list(outer()))`,
            output: `[1, 2, 3, 4, 5]
[1, 2, 'sub finished']`,
          },
        ],
        followUps: [
          'How would you walk a tree lazily with generators?',
          'How did `yield from` lead to `async`/`await`?',
        ],
      },
      related: ['py-generators-yield'],
    },
    {
      id: 'py-closure-cells',
      level: 'advanced',
      priority: 1,
      question: 'How does Python implement closures internally?',
      tags: ['closures', 'cells', 'internals', 'cpython'],
      answer: {
        interview: `**Variables captured by an inner function are stored in *cell* objects. The outer function's frame and the inner function both reference the same cell, so the variable outlives the frame.**

- The compiler decides which variables are captured: outer functions list them in \`co_cellvars\`, inner ones in \`co_freevars\`.
- The function object carries the cells in \`__closure__\`; read one with \`.cell_contents\`.
- Because both sides share one cell, \`nonlocal\` rebinding is seen by every closure created from the same call.
- Variables that are not captured stay plain fast locals and die with the frame.

Real-world: this explains late binding — the closure reads the cell's *current* value at call time.`,
        explanationBn: `Closure কীভাবে বাইরের variable "মনে রাখে"? উত্তর হলো **cell** নামের একটা ছোট্ট object।

Compile করার সময় Python দেখে নেয় বাইরের function-এর কোন variable ভেতরের function ব্যবহার করছে। সেই variable গুলোকে সাধারণ local হিসেবে না রেখে একটা **cell**-এর ভেতরে রাখে — cell হলো একটা বাক্স যার ভেতরে একটা value থাকে।

বাইরের function আর ভেতরের function দুজনেই **একই cell**-এর দিকে point করে। বাইরের function শেষ হলে তার frame মুছে যায়, কিন্তু cell-টা মুছে না, কারণ ভেতরের function এখনো সেটা ধরে আছে (\`__closure__\`-এ)।

এখান থেকে দুটো জিনিস ব্যাখ্যা হয়:
- **Late binding:** closure value কপি করে না, cell-টা রাখে। Call-এর সময় cell-এর *বর্তমান* value পড়ে।
- **\`nonlocal\` share হয়:** একই call থেকে তৈরি দুটো inner function একই cell দেখে, তাই একজন বদলালে অন্যজনও নতুন value দেখে।`,
        examples: [
          {
            lang: 'python',
            code: `def outer():
    x = 1
    def get():
        return x
    def set_(value):
        nonlocal x
        x = value
    return get, set_

get, set_ = outer()
print(outer.__code__.co_cellvars, get.__code__.co_freevars)
print(get.__closure__[0] is set_.__closure__[0])   # one shared cell
set_(42)
print(get())`,
            output: `('x',) ('x',)
True
42`,
          },
        ],
        followUps: ['Why do closures in a loop see the final value?'],
      },
      related: ['py-closures', 'py-late-binding-closures'],
    },
    {
      id: 'py-class-based-decorators',
      level: 'advanced',
      priority: 1,
      question: 'How do you write a class-based decorator, and when is it better than a function?',
      tags: ['decorators', 'classes', '__call__', 'state'],
      answer: {
        interview: `**A class becomes a decorator when \`__init__\` receives the function and \`__call__\` runs on each call. The instance replaces the function and can hold state as ordinary attributes.**

- Good when the decorator needs rich state or extra methods (e.g. \`.reset()\`, \`.calls\`).
- Use \`functools.update_wrapper(self, fn)\` to copy metadata (the class equivalent of \`@wraps\`).
- Gotcha: decorating a **method** with a class instance breaks \`self\` binding, because the instance is not a descriptor; implement \`__get__\` or use a function decorator instead.
- For decorator factories, \`__init__\` takes the configuration and \`__call__\` takes the function.

Real-world: a rate limiter or call counter object that exposes statistics.`,
        explanationBn: `Decorator শুধু function দিয়েই লিখতে হবে এমন না — যেকোনো callable কাজ করে। Class-এ \`__call__\` method লিখলে তার instance function-এর মতো call করা যায়, তাই class দিয়েও decorator বানানো যায়:

- \`__init__(self, fn)\` — decorate করার সময় একবার চলে, আসল function রেখে দেয়।
- \`__call__(self, *args, **kwargs)\` — প্রতিটা call-এ চলে, wrapper-এর কাজ করে।

**সুবিধা:** state রাখা স্বাভাবিক — closure-এ \`nonlocal\` বা function attribute-এর কৌশল লাগে না, সরাসরি \`self.calls\`। আর অতিরিক্ত method দেওয়া যায়, যেমন \`.reset()\`।

**একটা সূক্ষ্ম ফাঁদ:** class-based decorator কোনো class-এর **method**-এর ওপর দিলে \`self\` হারিয়ে যায়। কারণ সাধারণ function একটা descriptor — instance থেকে access করলে নিজে থেকে \`self\` bind করে নেয়। কিন্তু আমাদের decorator instance-এর \`__get__\` নেই, তাই bind হয় না। সমাধান: \`__get__\` লিখে দেওয়া, বা method-এর জন্য function-based decorator ব্যবহার করা।`,
        examples: [
          {
            lang: 'python',
            code: `import functools

class CountCalls:
    def __init__(self, fn):
        functools.update_wrapper(self, fn)
        self.fn = fn
        self.calls = 0

    def __call__(self, *args, **kwargs):
        self.calls += 1
        return self.fn(*args, **kwargs)

    def reset(self):
        self.calls = 0

@CountCalls
def greet(name):
    """Say hello."""
    return f"hi {name}"

greet("a"); greet("b")
print(greet.calls, greet.__name__, greet.__doc__)
greet.reset()
print(greet.calls)`,
            output: `2 greet Say hello.
0`,
          },
        ],
        pitfalls: [
          'Using a class decorator on an instance method loses `self` unless the class implements `__get__`.',
        ],
        followUps: ['What is a descriptor, and why do methods bind `self`?'],
      },
      related: ['py-decorators-basics'],
    },
  ],
});

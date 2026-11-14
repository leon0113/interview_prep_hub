import { defineSection } from '../../define';

export const basics = defineSection({
  id: 'py-basics',
  title: 'Basics & Data Types',
  description:
    'How Python treats names, objects and types — the foundation almost every other question builds on.',
  order: 1,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'py-key-features',
      level: 'foundation',
      priority: 2,
      question: 'What is Python, and what are its key features?',
      tags: ['basics', 'features', 'overview'],
      answer: {
        interview: `**Python is a high-level, general-purpose language that is dynamically typed, garbage-collected and known for readable code.**

- **Readable syntax:** indentation defines blocks, so code looks the same no matter who wrote it.
- **Dynamically but strongly typed:** types are checked at runtime, and Python refuses to silently mix incompatible types (\`"1" + 1\` is an error).
- **Multi-paradigm:** procedural, object-oriented and functional styles all work.
- **Batteries included:** a large standard library (JSON, HTTP, CSV, dates, testing…) plus a huge package ecosystem on PyPI.
- **Automatic memory management:** reference counting plus a cycle-detecting garbage collector.
- **Interpreted (via bytecode):** no separate compile step for the developer; source is compiled to bytecode and run by the Python virtual machine.

Real-world: those traits are why Python dominates scripting, automation, data/ML and backend APIs — fast to write, easy to read, with a library for almost everything.`,
        explanationBn: `Interview-তে এই প্রশ্নটা সাধারণত warm-up — তবে উত্তরটা গুছিয়ে বলতে পারলে শুরুতেই ভালো impression তৈরি হয়।

Python-কে "high-level" বলা হয় কারণ memory allocation, pointer — এসব নিচের স্তরের কাজ আপনাকে নিজে করতে হয় না। Language-টা সেগুলো সামলায়, আপনি সমস্যার logic-এ মন দেন।

**Dynamic typing** মানে variable-এর type আগে থেকে ঘোষণা করতে হয় না — runtime-এ value দেখে type ঠিক হয়। কিন্তু Python **strongly typed**, অর্থাৎ নিজে থেকে উল্টাপাল্টা type conversion করে না। JavaScript-এ \`"1" + 1\` দেয় \`"11"\`, আর Python দেয় \`TypeError\`। এই পার্থক্যটা interview-তে উল্লেখ করলে বোঝা যায় আপনি দুটো ধারণা গুলিয়ে ফেলেননি।

"Batteries included" কথাটার মানে, অনেক সাধারণ কাজের জন্য বাইরের কোনো library লাগে না — \`json\`, \`csv\`, \`datetime\`, \`pathlib\`, \`unittest\` সব standard library-তেই আছে।

শেষে একটা বাস্তব উদাহরণ দিলে উত্তর জোরালো হয় — যেমন automation script, Django/FastAPI দিয়ে backend, বা pandas দিয়ে data analysis।`,
        examples: [
          {
            lang: 'python',
            caption:
              'Dynamic typing (a name can be rebound to any type) but strong typing (no silent mixing)',
            code: `x = 10
print(type(x).__name__)
x = "ten"          # rebinding to a different type is fine
print(type(x).__name__)

try:
    print("1" + 1)  # Python will not guess what you meant
except TypeError as e:
    print("TypeError:", e)`,
            output: `int
str
TypeError: can only concatenate str (not "int") to str`,
          },
        ],
        pitfalls: [
          '"Dynamically typed" is not the same as "weakly typed" — Python is dynamic AND strong.',
          'Saying Python is "purely interpreted" is imprecise: CPython compiles to bytecode first.',
        ],
        followUps: [
          'Is Python interpreted or compiled?',
          'What is the difference between dynamic and strong typing?',
          'What are the main drawbacks of Python?',
        ],
      },
      related: ['py-interpreted-or-compiled', 'py-dynamic-vs-strong-typing'],
    },
    {
      id: 'py-interpreted-or-compiled',
      level: 'foundation',
      priority: 2,
      question: 'Is Python interpreted or compiled?',
      tags: ['bytecode', 'pvm', 'cpython', 'interpreter'],
      answer: {
        interview: `**Both: CPython first compiles source code to bytecode, then the Python Virtual Machine (PVM) interprets that bytecode.**

- The compile step is automatic and fast — you never run a separate compiler.
- Bytecode is a low-level, platform-independent instruction set, not machine code.
- Imported modules have their bytecode cached as \`.pyc\` files in \`__pycache__\`, so the next import skips recompiling.
- The PVM is a loop that executes bytecode instructions one by one — that is the "interpreted" part, and the main reason pure Python is slower than C.
- Other implementations differ: PyPy adds a JIT compiler, and CPython 3.13 ships an experimental JIT.

Real-world: you can inspect the bytecode with the \`dis\` module when you want to see what a line actually does.`,
        explanationBn: `"Python interpreted" — এই কথাটা পুরোপুরি ভুল না, আবার পুরো সত্যিও না। CPython-এ (যেটা আমরা সাধারণত ব্যবহার করি) কাজটা হয় দুই ধাপে:

1. **Compile:** আপনার \`.py\` source code প্রথমে **bytecode**-এ রূপান্তর হয়। Bytecode হলো সহজ, ছোট ছোট instruction-এর একটা তালিকা — যেমন "এই variable load করো", "দুটো value যোগ করো"। এটা CPU-র machine code না, তাই যেকোনো OS-এ একই থাকে।
2. **Interpret:** এরপর **PVM** (Python Virtual Machine) একটা loop-এর মধ্যে সেই instruction গুলো একটা একটা করে চালায়।

Java-র সাথে মিল আছে — Java-ও bytecode বানায়, আর JVM সেটা চালায়। পার্থক্য হলো Java-তে \`javac\` আলাদা করে চালাতে হয়, আর Python-এ compile ধাপটা চোখের আড়ালে নিজে থেকেই হয়ে যায়।

কোনো module import করলে Python তার bytecode \`__pycache__\` folder-এ \`.pyc\` file হিসেবে রেখে দেয়। পরের বার source না বদলালে আবার compile না করে সরাসরি \`.pyc\` ব্যবহার করে — তাই দ্বিতীয়বার import দ্রুত হয়।

Python ধীর কেন — এই প্রশ্নের উত্তরও এখানেই: প্রতিটা bytecode instruction PVM-কে আলাদা করে interpret করতে হয়, আর প্রতিটা operation-এর সময় type চেক করতে হয়।`,
        examples: [
          {
            lang: 'python',
            caption: 'The bytecode instruction names CPython compiles a small function into',
            code: `import dis

def add(a, b):
    return a + b

ops = [ins.opname for ins in dis.get_instructions(add)]
print("LOAD_FAST" in ops, "BINARY_OP" in ops)`,
            output: `True True`,
          },
        ],
        pitfalls: [
          'A `.pyc` file is not a compiled executable — it still needs the Python interpreter to run.',
          'Exact bytecode differs between Python versions, so never depend on specific opcodes.',
        ],
        followUps: [
          'What is in the `__pycache__` folder?',
          'Why is Python slower than C or Java?',
          'What is the difference between CPython and PyPy?',
        ],
      },
      related: ['py-key-features'],
    },
    {
      id: 'py-mutable-vs-immutable',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between mutable and immutable objects in Python?',
      tags: ['mutability', 'data-types', 'memory'],
      answer: {
        interview: `**A mutable object can be changed in place after it is created; an immutable object cannot** — any "change" produces a new object.

- **Mutable:** \`list\`, \`dict\`, \`set\`, \`bytearray\`, and most user-defined objects.
- **Immutable:** \`int\`, \`float\`, \`bool\`, \`str\`, \`tuple\`, \`frozenset\`, \`bytes\`.
- It matters because variables are references: if two names point to the same mutable object, a change through one name is visible through the other.
- Hashable objects — in practice the immutable built-ins — are the only ones that can be \`dict\` keys or \`set\` members.

Real-world: this explains the mutable-default-argument bug and why a function can accidentally modify the caller's list.`,
        explanationBn: `Python-এ variable কোনো বাক্স না যার ভেতরে value রাখা থাকে — variable হলো object-এর গায়ে লাগানো একটা **নাম (label)**। তাই আসল প্রশ্নটা হলো: object-টা নিজে বদলাতে পারে কি না।

- **Mutable** object (যেমন \`list\`, \`dict\`, \`set\`) memory-তে একই জায়গায় থেকে নিজের ভেতরের data বদলাতে পারে। বদলানোর পরেও তার \`id()\` একই থাকে।
- **Immutable** object (যেমন \`int\`, \`str\`, \`tuple\`) একবার তৈরি হলে আর বদলায় না। \`s.upper()\` বা \`s + "x"\` পুরনো string-কে ছোঁয় না — নতুন একটা string বানায়, আর আপনি চাইলে নামটাকে সেই নতুন object-এ বসাতে পারেন (এটাকে বলে **rebinding**)।

সহজ একটা analogy: mutable object হলো whiteboard — মুছে আবার লেখা যায়, আর যারা যারা ওই board-এর দিকে তাকিয়ে আছে সবাই নতুন লেখাটাই দেখে। Immutable object হলো ছাপানো কাগজ — বদলাতে চাইলে নতুন কাগজ ছাপাতে হয়, পুরনোটা যেমন ছিল তেমনই থাকে।

একটা সূক্ষ্ম বিষয় মনে রাখবেন: \`tuple\` নিজে immutable, কিন্তু তার ভেতরে যদি একটা \`list\` থাকে, সেই list-টা ঠিকই বদলানো যায়। অর্থাৎ immutability মানে "tuple-এর reference গুলো বদলাবে না" — ভেতরের object-ও immutable হবে, এমন কোনো নিশ্চয়তা নেই।`,
        examples: [
          {
            lang: 'python',
            caption:
              'Mutation is shared between names; immutable objects are replaced, not changed',
            code: `nums = [1, 2, 3]
alias = nums          # second name, same list object
alias.append(4)       # mutate in place
print(nums)
print(alias is nums)

s = "hello"
t = s.upper()         # returns a NEW string
print(s, t)

point = (1, 2)
try:
    point[0] = 99
except TypeError as e:
    print("TypeError:", e)`,
            output: `[1, 2, 3, 4]
True
hello HELLO
TypeError: 'tuple' object does not support item assignment`,
          },
          {
            lang: 'python',
            caption: 'An immutable tuple can still hold a mutable object',
            code: `t = ([1, 2], "x")
t[0].append(3)        # the tuple still holds the same list
print(t)`,
            output: `([1, 2, 3], 'x')`,
          },
        ],
        pitfalls: [
          'A tuple is immutable, but a mutable object inside it can still change — and such a tuple is not hashable.',
          '`a = b = []` creates one list with two names, not two lists.',
          'A mutable default argument (`def f(items=[])`) is created once and shared by every call.',
        ],
        followUps: [
          "Why can't a list be used as a dictionary key?",
          'What happens when you pass a list to a function and modify it inside?',
          'Is a tuple always hashable?',
        ],
      },
      visualizationId: 'py-reference-model',
      related: ['py-is-vs-equals', 'py-pass-by-object-reference'],
    },
    {
      id: 'py-is-vs-equals',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between `is` and `==` in Python?',
      tags: ['identity', 'equality', 'operators', 'interning'],
      answer: {
        interview: `**\`==\` compares values; \`is\` compares identity** — whether two names refer to the exact same object in memory.

- \`a == b\` calls \`a.__eq__(b)\`, so a class can define what "equal" means.
- \`a is b\` is equivalent to \`id(a) == id(b)\` and cannot be overridden.
- Use \`is\` only for singletons: \`None\`, \`True\`, \`False\` — e.g. \`if x is None\`.
- Gotcha: CPython caches small integers (-5 to 256) and interns some strings, so \`is\` can *appear* to work for values. That is an implementation detail — never rely on it.

Real-world: \`if result is None\` is the idiomatic null check; using \`is\` to compare numbers or strings is a bug waiting to happen.`,
        explanationBn: `দুটো আলাদা প্রশ্ন, দুটো আলাদা operator:

- \`==\` জিজ্ঞেস করে — "এই দুইটার **value** কি সমান?"
- \`is\` জিজ্ঞেস করে — "এই দুইটা নাম কি **একই object**-এর দিকে তাকিয়ে আছে?"

Analogy: দুজনের হাতে একই বইয়ের দুটো আলাদা কপি থাকলে \`==\` হবে \`True\` (লেখা একই), কিন্তু \`is\` হবে \`False\` (কপি আলাদা)। দুজন যদি একটাই কপি ভাগাভাগি করে ধরে থাকে, তখনই \`is\` হবে \`True\`।

**তাহলে \`256 is 256\` কেন \`True\`?** CPython চালু হওয়ার সময়ই -5 থেকে 256 পর্যন্ত integer object গুলো বানিয়ে রাখে আর বারবার সেগুলোই reuse করে (small integer caching)। তাই এই range-এর দুটো সমান সংখ্যা আসলে একই object। 257 থেকে প্রতিবার নতুন object তৈরি হতে পারে, তখন \`is\` দেয় \`False\`। ছোট string-এর ক্ষেত্রেও একই ধরনের optimization আছে, যার নাম **interning**।

এগুলো performance-এর জন্য করা CPython-এর ভেতরের optimization, ভাষার নিয়ম না। একই file-এ \`a = 1000; b = 1000\` লিখলে compiler দুটোকে একই constant বানিয়ে ফেলতে পারে, আবার REPL-এ আলাদা লাইনে লিখলে আলাদা object হয়। তাই নিয়ম একটাই: value তুলনায় সবসময় \`==\`, আর \`None\`-এর মতো singleton চেক করতে \`is\`।`,
        examples: [
          {
            lang: 'python',
            caption: 'Equal values vs the same object',
            code: `a = [1, 2, 3]
b = [1, 2, 3]   # equal value, different object
c = a           # same object, second name

print(a == b, a is b)
print(a == c, a is c)`,
            output: `True False
True True`,
          },
          {
            lang: 'python',
            caption: 'Small-integer caching makes `is` look like it works',
            code: `a = int("256")
b = int("256")
print(a is b)          # cached: -5..256 are shared objects

c = int("257")
d = int("257")
print(c is d, c == d)  # two separate objects with equal value

result = None
print(result is None)  # the correct use of \`is\``,
            output: `True
False True
True`,
          },
        ],
        pitfalls: [
          '`x == None` works but can be fooled by a custom `__eq__`; always write `x is None`.',
          'Comparing numbers or strings with `is` passes in small tests (caching/interning) and fails in production.',
          'Python 3.8+ emits `SyntaxWarning: "is" with a literal` for code like `x is 5`.',
        ],
        followUps: [
          'What does `id()` return?',
          'What is string interning, and when does it happen?',
          'How would you make two instances of your own class compare equal with `==`?',
        ],
      },
      visualizationId: 'py-reference-model',
      related: ['py-mutable-vs-immutable', 'py-int-caching-and-interning'],
    },
    {
      id: 'py-pass-by-object-reference',
      level: 'foundation',
      priority: 3,
      question: 'Is Python pass-by-value or pass-by-reference?',
      tags: ['functions', 'arguments', 'references', 'mutability'],
      answer: {
        interview: `**Neither, strictly: Python is "pass by object reference" (also called pass by assignment).** The function parameter becomes a new name bound to the *same object* the caller passed.

- If the function **mutates** that object (\`items.append(x)\`), the caller sees the change — it is the same object.
- If the function **rebinds** the parameter (\`items = [...]\`), only the local name moves; the caller's variable is untouched.
- With immutable arguments (\`int\`, \`str\`, \`tuple\`) mutation is impossible, so it *looks* like pass-by-value.
- So it is not pass-by-value (no copy is made) and not true pass-by-reference (the function cannot rebind the caller's variable).

Real-world: if a function must not change the caller's data, copy it first (\`items = list(items)\`) or return a new object instead of mutating.`,
        explanationBn: `এই প্রশ্নে "pass-by-value" বা "pass-by-reference" — দুটোর কোনোটা বললেই interviewer পাল্টা প্রশ্ন করবেন, কারণ Python আসলে তৃতীয় একটা পদ্ধতি মানে।

Function call করার সময় যা হয় সেটা আসলে একটা **assignment**: \`def f(items)\`-কে \`f(nums)\` দিয়ে call করলে ভেতরে কার্যত \`items = nums\` হয়। আগেই দেখেছি, assignment object কপি করে না — শুধু নতুন একটা নাম একই object-এর গায়ে লাগায়। তাই function-এর ভেতরের \`items\` আর বাইরের \`nums\` একই list-কে দেখায়।

এখান থেকে দুটো ঘটনা বের হয়:

- **Mutation** (\`items.append(4)\`): object-টাই বদলাচ্ছে, আর যেহেতু object একটাই, caller-ও বদলটা দেখে।
- **Rebinding** (\`items = [9, 9]\`): শুধু local নাম \`items\` নতুন একটা list-এ সরে যায়। বাইরের \`nums\` আগের list-কেই ধরে থাকে — কিছুই বদলায় না।

C++-এর আসল pass-by-reference-এ function চাইলে caller-এর variable-কেই অন্য কিছুতে বসিয়ে দিতে পারে; Python-এ সেটা সম্ভব না। আবার pass-by-value-এর মতো copy-ও হয় না। তাই সঠিক নাম "pass by object reference"।

Analogy: আপনি বন্ধুকে আপনার বাসার ঠিকানা দিলেন। সে গিয়ে ঘরের আসবাব সরালে (mutation) আপনি বাসায় ফিরে সেটা দেখবেন। কিন্তু সে যদি তার কাগজের ঠিকানা কেটে অন্য বাসার ঠিকানা লেখে (rebinding), আপনার বাসার কিছুই হয় না।`,
        examples: [
          {
            lang: 'python',
            caption: 'Mutation is visible to the caller; rebinding is not',
            code: `def mutate(items):
    items.append(4)       # changes the shared object

def rebind(items):
    items = [9, 9]        # moves the local name only

nums = [1, 2, 3]
mutate(nums)
print(nums)
rebind(nums)
print(nums)`,
            output: `[1, 2, 3, 4]
[1, 2, 3, 4]`,
          },
          {
            lang: 'python',
            caption: 'Immutable arguments cannot be changed, so it looks like pass-by-value',
            code: `def increment(n):
    n += 1                # builds a new int and rebinds n
    return n

x = 5
print(increment(x), x)`,
            output: `6 5`,
          },
        ],
        pitfalls: [
          'Calling it "pass by reference" in an interview usually earns the follow-up "then why does rebinding not affect the caller?".',
          '`items += [4]` on a list mutates in place (it calls `__iadd__`), unlike `items = items + [4]`, which rebinds.',
          'Default mutable arguments combine with this behaviour to create the classic shared-default bug.',
        ],
        followUps: [
          "How do you stop a function from modifying the caller's list?",
          'What is the difference between `items += [x]` and `items = items + [x]`?',
          'What is the mutable default argument trap?',
        ],
      },
      visualizationId: 'py-reference-model',
      related: ['py-mutable-vs-immutable', 'py-shallow-vs-deep-copy'],
    },
    {
      id: 'py-truthy-falsy-none',
      level: 'foundation',
      priority: 2,
      question: 'What are truthy and falsy values in Python, and what is `None`?',
      tags: ['truthiness', 'none', 'boolean', 'conditionals'],
      answer: {
        interview: `**Every object has a boolean value when used in a condition. A few values are falsy; everything else is truthy.**

- **Falsy:** \`False\`, \`None\`, zero of any numeric type (\`0\`, \`0.0\`, \`0j\`), and empty collections (\`""\`, \`[]\`, \`()\`, \`{}\`, \`set()\`, \`range(0)\`).
- **Truthy:** everything else — including \`"0"\`, \`"False"\`, \`[0]\` and \`[[]]\`.
- Custom classes decide via \`__bool__\`, falling back to \`__len__\`; with neither, instances are always truthy.
- **\`None\`** is the single instance of \`NoneType\`, Python's "no value". Functions without a \`return\` return \`None\`.
- Check for it with \`is None\`, not \`== None\` and not \`if not x\` — \`if not x\` also treats \`0\` and \`""\` as missing.

Real-world: \`if items:\` is the idiomatic emptiness check; \`if value is None:\` is the idiomatic "missing" check.`,
        explanationBn: `\`if\` বা \`while\`-এর condition-এ যেকোনো object বসানো যায় — Python তখন object-টাকে \`True\` বা \`False\` হিসেবে বিচার করে। এটাকেই truthiness বলে।

মনে রাখার সহজ নিয়ম: **"শূন্য" বা "খালি" জিনিস falsy, বাকি সব truthy।** অর্থাৎ \`0\`, \`0.0\`, খালি string \`""\`, খালি list \`[]\`, খালি dict \`{}\`, আর অবশ্যই \`None\` ও \`False\`।

ফাঁদ হলো এমন value গুলো, যেগুলো দেখতে "না"-এর মতো কিন্তু আসলে truthy: \`"0"\` (একটা character আছে, তাই খালি না), \`"False"\` (এটাও non-empty string), \`[0]\` (একটা element আছে)।

**\`None\`** হলো Python-এর "কিছু নেই"। এটা একটা singleton — পুরো program-এ \`None\` object মাত্র একটাই, তাই চেক করতে \`is\` ব্যবহার করা হয়।

একটা গুরুত্বপূর্ণ পার্থক্য: \`if not x:\` আর \`if x is None:\` এক জিনিস না। কেউ যদি \`0\` বা খালি string পাঠায়, প্রথমটা সেটাকেও "missing" ধরবে, যেটা প্রায়ই bug। Quantity \`0\` একটা বৈধ value হতে পারে — তখন অবশ্যই \`is None\` দিয়ে চেক করুন।`,
        examples: [
          {
            lang: 'python',
            code: `values = [0, 0.0, "", "0", [], [0], {}, None, "False"]
for v in values:
    print(repr(v), bool(v))`,
            output: `0 False
0.0 False
'' False
'0' True
[] False
[0] True
{} False
None False
'False' True`,
          },
          {
            lang: 'python',
            caption: '`if not x` treats 0 as missing; `is None` does not',
            code: `def describe(qty=None):
    if qty is None:
        return "not given"
    return f"qty={qty}"

print(describe(), describe(0))

def bad(qty=None):
    return "not given" if not qty else f"qty={qty}"

print(bad(0))`,
            output: `not given qty=0
not given`,
          },
        ],
        pitfalls: [
          '`if not value:` treats `0`, `0.0` and `""` the same as `None` — a bug when zero is valid.',
          '`bool("False")` is `True`; parse strings explicitly instead of relying on truthiness.',
        ],
        followUps: [
          'How do you make instances of your own class falsy?',
          'Why should you write `is None` instead of `== None`?',
          'What does a function return if it has no `return` statement?',
        ],
      },
      related: ['py-is-vs-equals'],
    },
    {
      id: 'py-division-operators',
      level: 'foundation',
      priority: 2,
      question:
        'What is the difference between `/`, `//` and `%` in Python, including with negative numbers?',
      tags: ['operators', 'arithmetic', 'floor-division', 'modulo'],
      answer: {
        interview: `**\`/\` is true division and always returns a float; \`//\` is floor division; \`%\` is the remainder that goes with it.**

- \`7 / 2\` → \`3.5\`, and \`6 / 2\` → \`3.0\` (still a float).
- \`7 // 2\` → \`3\`: the result is rounded **down toward negative infinity**, not toward zero.
- So \`-7 // 2\` → \`-4\` (not \`-3\` as in C, Java or JavaScript's \`Math.trunc\`).
- \`%\` follows the same rule: the result takes the sign of the **divisor**, so \`-7 % 2\` → \`1\`.
- The identity always holds: \`a == (a // b) * b + (a % b)\`. \`divmod(a, b)\` returns both at once.

Real-world: Python's \`%\` is handy for wrapping indexes — \`(i - 1) % n\` gives a valid index even when \`i\` is 0.`,
        explanationBn: `\`/\`-এর ব্যাপারটা সহজ: Python 3-এ \`/\` সবসময় float দেয়, এমনকি \`6 / 2\`-ও \`3.0\`।

মজার অংশ \`//\` আর \`%\`। \`//\`-এর নাম **floor division** — result-কে নিচের দিকে (negative infinity-র দিকে) round করে। Positive সংখ্যায় এটা দশমিক কেটে ফেলার মতোই দেখায়: \`7 // 2 = 3\`। কিন্তু negative সংখ্যায় পার্থক্য দেখা যায়: \`-7 / 2 = -3.5\`, আর এর floor হলো \`-4\` (কারণ \`-4\` হলো \`-3.5\`-এর চেয়ে ছোট)। C বা Java-তে integer division শূন্যের দিকে কাটে, তাই সেখানে উত্তর \`-3\` — এই পার্থক্যটাই interview-তে ধরা হয়।

\`%\` এমনভাবে বানানো যাতে \`a == (a // b) * b + (a % b)\` সবসময় সত্যি থাকে। \`-7 // 2 = -4\` হলে \`-4 * 2 = -8\`, তাই remainder হতে হবে \`1\` (\`-8 + 1 = -7\`)। এজন্য Python-এ \`%\`-এর result-এর চিহ্ন সবসময় **divisor**-এর চিহ্নের মতো হয়।

এটা আসলে কাজের: circular buffer বা ঘড়ির মতো wrap-around হিসাবে \`(i - 1) % n\` কখনো negative index দেয় না।`,
        examples: [
          {
            lang: 'python',
            code: `print(7 / 2, 6 / 2)
print(7 // 2, -7 // 2)
print(7 % 2, -7 % 2, 7 % -2)
print(divmod(-7, 2))

a, b = -7, 2
print(a == (a // b) * b + a % b)`,
            output: `3.5 3.0
3 -4
1 1 -1
(-4, 1)
True`,
          },
          {
            lang: 'python',
            caption: 'Wrapping an index backwards with %',
            code: `days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
today = 0  # Monday
print(days[(today - 1) % 7])`,
            output: `Sun`,
          },
        ],
        pitfalls: [
          '`//` on floats returns a float: `7.0 // 2` is `3.0`.',
          'To truncate toward zero like C, use `int(a / b)` (or `math.trunc`), not `//`.',
        ],
        followUps: [
          'How would you get integer division that truncates toward zero?',
          'What does `divmod` return?',
        ],
      },
    },
    {
      id: 'py-dynamic-vs-strong-typing',
      level: 'foundation',
      priority: 2,
      question: 'What do "dynamically typed" and "strongly typed" mean for Python?',
      tags: ['typing', 'dynamic-typing', 'strong-typing', 'type-hints'],
      answer: {
        interview: `**They are two separate axes. Dynamic vs static is *when* types are checked; strong vs weak is *how strictly* mismatched types are treated. Python is dynamic and strong.**

- **Dynamic:** types belong to objects, not variables, and are checked at runtime. A name can be bound to an \`int\` now and a \`str\` later.
- **Static** languages (Java, C#, Go) check types at compile time, and a variable keeps one declared type.
- **Strong:** Python does not silently convert between unrelated types — \`"3" + 4\` raises \`TypeError\`.
- **Weak** languages (JavaScript, PHP) coerce implicitly — \`"3" + 4\` is \`"34"\` in JavaScript.
- Type hints (\`x: int\`) do not make Python static; they are ignored at runtime and only used by tools like mypy or your IDE.

Real-world: dynamic typing makes Python quick to write; type hints plus a checker give back much of the safety on large codebases.`,
        explanationBn: `অনেকে "dynamic" আর "weak" — এই দুটো শব্দ একই অর্থে ব্যবহার করেন, কিন্তু এরা দুটো আলাদা প্রশ্নের উত্তর।

**প্রশ্ন ১: type কখন চেক হয়?**
- Static: code চালানোর আগেই (compile time)। Java-তে \`int x = "hi";\` compile-ই হবে না।
- Dynamic: code চলার সময় (runtime)। Python-এ variable-এর কোনো নির্দিষ্ট type নেই — type থাকে object-এর। \`x = 10\` তারপর \`x = "ten"\` — সম্পূর্ণ বৈধ।

**প্রশ্ন ২: ভুল type মিশালে কী হয়?**
- Strong: language নিজে থেকে type বদলায় না, error দেয়। Python-এ \`"3" + 4\` → \`TypeError\`।
- Weak: language আন্দাজ করে নিজেই convert করে নেয়। JavaScript-এ \`"3" + 4\` → \`"34"\`।

তাহলে Python = **dynamic + strong**। JavaScript = dynamic + weak। Java = static + (মোটামুটি) strong।

Type hints নিয়ে একটা ভুল ধারণা আছে: \`def f(x: int)\` লিখলে Python runtime-এ কিছুই চেক করে না — \`f("hello")\` দিব্যি চলবে। Hints কাজে লাগে mypy, pyright বা IDE-র কাছে, যারা code না চালিয়েই ভুল ধরিয়ে দেয়।`,
        examples: [
          {
            lang: 'python',
            code: `def double(x: int) -> int:
    return x * 2

print(double(4))
print(double("ab"))     # hints are not enforced at runtime

try:
    "3" + 4
except TypeError as e:
    print("TypeError:", e)`,
            output: `8
abab
TypeError: can only concatenate str (not "int") to str`,
          },
        ],
        pitfalls: [
          'Python does have some implicit numeric conversion (`1 + 2.5`, `True + 1`); "strong" means no coercion between unrelated types like str and int.',
          'Type hints are documentation plus tooling — they never raise errors by themselves.',
        ],
        followUps: ['Are type hints enforced at runtime?', 'What is duck typing?'],
      },
      related: ['py-key-features', 'py-type-vs-isinstance'],
    },
    {
      id: 'py-type-vs-isinstance',
      level: 'foundation',
      priority: 2,
      question: 'What is the difference between `type()` and `isinstance()`?',
      tags: ['typing', 'inheritance', 'type-checking'],
      answer: {
        interview: `**\`type(x)\` returns the exact class of an object; \`isinstance(x, C)\` asks whether \`x\` is an instance of \`C\` *or any subclass* of it.**

- \`type(x) == C\` fails for subclasses, which breaks polymorphism.
- \`isinstance\` accepts a tuple of types: \`isinstance(x, (int, float))\`.
- \`isinstance\` also works with abstract base classes such as \`collections.abc.Iterable\`.
- Gotcha: \`bool\` is a subclass of \`int\`, so \`isinstance(True, int)\` is \`True\`.
- Prefer \`isinstance\` for checks, and often prefer no check at all (duck typing).

Real-world: \`isinstance(value, Mapping)\` lets a function accept a \`dict\`, an \`OrderedDict\` or any custom mapping.`,
        explanationBn: `\`type()\` একদম নির্দিষ্ট উত্তর দেয় — "এই object ঠিক কোন class থেকে তৈরি?" আর \`isinstance()\` জিজ্ঞেস করে — "এই object কি এই class-এর *পরিবারের* সদস্য?" অর্থাৎ subclass হলেও \`isinstance\` \`True\` দেয়।

ধরুন \`class Dog(Animal)\`। একটা \`Dog\` object-এর জন্য:
- \`type(d) == Animal\` → \`False\` (সে ঠিক Animal না, Dog)
- \`isinstance(d, Animal)\` → \`True\` (Dog তো Animal-এর একটা ধরন)

Object-oriented code-এ আমরা প্রায় সবসময় দ্বিতীয়টাই চাই — কারণ subclass-কে parent-এর জায়গায় ব্যবহার করতে পারাটাই inheritance-এর মূল সুবিধা। \`type() ==\` দিয়ে চেক করলে কেউ নতুন subclass বানালেই code ভেঙে যায়।

একটা চমকপ্রদ তথ্য: \`bool\` আসলে \`int\`-এর subclass (\`True == 1\`, \`False == 0\`)। তাই "শুধু int চাই, bool না" এমন ক্ষেত্রে \`isinstance(x, int) and not isinstance(x, bool)\` লিখতে হয়।

আর Pythonic code-এ অনেক সময় type চেকই করা হয় না — object-টা যা দরকার সেটা করতে পারলেই হলো। এটাকে বলে **duck typing**: "যদি হাঁসের মতো হাঁটে আর হাঁসের মতো ডাকে, তাহলে সেটা হাঁস।"`,
        examples: [
          {
            lang: 'python',
            code: `class Animal: pass
class Dog(Animal): pass

d = Dog()
print(type(d) == Animal, isinstance(d, Animal))
print(type(d).__name__)
print(isinstance(3.5, (int, float)))
print(isinstance(True, int), type(True) == int)`,
            output: `False True
Dog
True
True False`,
          },
        ],
        pitfalls: [
          '`isinstance(True, int)` is `True`, which surprises validation code expecting only integers.',
          'Heavy use of type checks is often a sign that polymorphism or duck typing would be cleaner.',
        ],
        followUps: [
          'What is duck typing?',
          'How would you check that something is iterable?',
          'Why is `bool` a subclass of `int`?',
        ],
      },
      related: ['py-dynamic-vs-strong-typing'],
    },
    {
      id: 'py-float-precision',
      level: 'foundation',
      priority: 2,
      question: 'Why is `0.1 + 0.2 == 0.3` False in Python?',
      tags: ['float', 'precision', 'decimal', 'ieee-754'],
      answer: {
        interview: `**Because floats are stored in binary (IEEE 754 double precision), and 0.1, 0.2 and 0.3 cannot be represented exactly in binary — so their tiny rounding errors don't cancel out.**

- \`0.1 + 0.2\` is \`0.30000000000000004\`; that is not a Python bug, every language using IEEE 754 does the same.
- Compare floats with a tolerance: \`math.isclose(a, b)\`.
- For money and other exact decimal values use \`decimal.Decimal\` — built from **strings**, e.g. \`Decimal("0.1")\`.
- \`fractions.Fraction\` gives exact rational arithmetic.
- \`round()\` uses banker's rounding: \`round(2.5)\` is \`2\`.

Real-world: never store prices as floats — use \`Decimal\` or integer cents.`,
        explanationBn: `কম্পিউটার সংখ্যা রাখে binary-তে (0 আর 1)। কিছু দশমিক সংখ্যা binary-তে ঠিকঠাক লেখাই যায় না — ঠিক যেমন 1/3-কে দশমিকে লিখলে 0.3333… অনন্তকাল চলতে থাকে।

0.1 binary-তে লিখলে সেটা একটা অসীম পুনরাবৃত্ত ভগ্নাংশ। Float রাখার জায়গা সীমিত (64 bit), তাই Python সবচেয়ে কাছের একটা value রাখে — যেটা আসলে 0.1-এর চেয়ে সামান্য বেশি। 0.2-এরও একই অবস্থা। দুটো যোগ করলে ছোট ছোট ভুলগুলো জমে \`0.30000000000000004\` হয়। অথচ 0.3 লিখলে Python যে সবচেয়ে কাছের value রাখে, সেটা অন্য — তাই \`==\` হয় \`False\`।

এটা Python-এর সমস্যা না; JavaScript, Java, C — সবাই IEEE 754 মানে, সবাই একই উত্তর দেয়।

সমাধান কাজ অনুযায়ী:
- **তুলনা করতে:** \`math.isclose(a, b)\` — অল্প পার্থক্য মাফ করে দেয়।
- **টাকাপয়সার হিসাবে:** \`Decimal\` — দশমিকেই হিসাব করে, তাই একদম নির্ভুল। কিন্তু অবশ্যই string থেকে বানাবেন: \`Decimal(0.1)\` লিখলে ভুল float-টাই ঢুকে যায়।

\`round(2.5)\` কেন \`2\`? Python "banker's rounding" ব্যবহার করে — ঠিক মাঝখানে পড়লে জোড় সংখ্যার দিকে round করে, যাতে অনেক হিসাবে bias না জমে।`,
        examples: [
          {
            lang: 'python',
            code: `import math
from decimal import Decimal

print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))
print(Decimal("0.1") + Decimal("0.2") == Decimal("0.3"))
print(Decimal(0.1))   # built from a float: the error comes along
print(round(2.5), round(3.5))`,
            output: `0.30000000000000004
False
True
True
0.1000000000000000055511151231257827021181583404541015625
2 4`,
          },
        ],
        pitfalls: [
          '`Decimal(0.1)` copies the float\'s error — always pass a string: `Decimal("0.1")`.',
          'Using `==` on computed floats in tests causes flaky failures; use `math.isclose` or `pytest.approx`.',
        ],
        followUps: ['How would you store currency values?', "What is banker's rounding?"],
      },
    },
    {
      id: 'py-swap-and-unpacking',
      level: 'foundation',
      priority: 1,
      question: 'How do you swap two variables in Python, and how does it work?',
      tags: ['tuples', 'unpacking', 'assignment'],
      answer: {
        interview: `**Write \`a, b = b, a\`. The right side is evaluated first into a tuple, then that tuple is unpacked into the names on the left.**

- No temporary variable is needed.
- The same tuple packing/unpacking powers multiple assignment: \`x, y = 1, 2\`.
- Extended unpacking collects the rest with \`*\`: \`first, *rest = [1, 2, 3]\`.
- The number of names must match the number of values (unless one name has \`*\`), otherwise \`ValueError\`.

Real-world: unpacking is everywhere — \`for key, value in d.items()\`, \`for i, item in enumerate(items)\`, returning several values from a function.`,
        explanationBn: `অন্য অনেক language-এ swap করতে একটা temporary variable লাগে: \`temp = a; a = b; b = temp\`। Python-এ এক লাইনেই হয়: \`a, b = b, a\`।

কীভাবে কাজ করে? Python আগে **ডান পাশ পুরোটা** evaluate করে — \`b, a\` থেকে একটা tuple তৈরি হয়, যেমন \`(2, 1)\`। এই মুহূর্তে পুরনো value দুটো tuple-এর ভেতরে নিরাপদে রাখা আছে। তারপর বাঁ পাশে সেই tuple **unpack** হয়: প্রথম value যায় \`a\`-তে, দ্বিতীয়টা \`b\`-তে। ডান পাশ আগে শেষ হয় বলেই কোনো value হারায় না।

এই একই কৌশল আরও অনেক জায়গায় দেখা যায়:
- Function থেকে একাধিক value ফেরত দেওয়া: \`return min_v, max_v\` আসলে একটা tuple ফেরত দেয়।
- Loop-এ: \`for name, age in people:\`
- \`*\` দিয়ে বাকি সব ধরা: \`first, *rest = items\` — \`rest\` সবসময় একটা list হয়।`,
        examples: [
          {
            lang: 'python',
            code: `a, b = 1, 2
a, b = b, a
print(a, b)

first, *middle, last = [10, 20, 30, 40]
print(first, middle, last)

try:
    x, y = [1, 2, 3]
except ValueError as e:
    print("ValueError:", e)`,
            output: `2 1
10 [20, 30] 40
ValueError: too many values to unpack (expected 2)`,
          },
        ],
        pitfalls: ['The starred name always becomes a list, even if it captures zero items.'],
        followUps: ['How do you return multiple values from a function?'],
      },
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'py-shallow-vs-deep-copy',
      level: 'intermediate',
      priority: 3,
      question: 'What is the difference between a shallow copy and a deep copy?',
      tags: ['copy', 'deepcopy', 'references', 'nested-data'],
      answer: {
        interview: `**A shallow copy creates a new outer container but fills it with references to the same inner objects; a deep copy recursively copies the inner objects too.**

- Shallow copies: \`copy.copy(x)\`, \`list(x)\`, \`x[:]\`, \`x.copy()\`, \`dict(d)\`, \`{**d}\`.
- Deep copy: \`copy.deepcopy(x)\`.
- For a flat list of immutable items (e.g. \`[1, 2, 3]\`), shallow is enough — there is nothing nested to share.
- For nested data, mutating an inner object through the copy also changes the original after a shallow copy.
- Plain assignment (\`b = a\`) copies nothing at all — it is just a second name.

Real-world: copying a nested config or game board before modifying it needs \`deepcopy\`; a shallow copy will leak changes back into the original.`,
        explanationBn: `এখানে তিনটা আলাদা জিনিস আছে, আর interview-তে তিনটাই পরিষ্কার করে বলা দরকার:

1. **Assignment (\`b = a\`):** কোনো copy হয় না। শুধু একই object-এর দ্বিতীয় একটা নাম।
2. **Shallow copy:** বাইরের container-টা নতুন তৈরি হয়, কিন্তু ভেতরের element গুলো কপি হয় না — নতুন list-এর ঘরগুলো পুরনো inner object গুলোর দিকেই point করে।
3. **Deep copy:** বাইরের container, তার ভেতরের object, তার ভেতরের object — সব স্তর নতুন করে কপি হয়। মূলটার সাথে আর কোনো কিছু shared থাকে না।

Analogy: একটা ফাইল কেবিনেটের কথা ভাবুন, যার drawer-এ কিছু folder আছে। Shallow copy মানে নতুন একটা কেবিনেট কেনা, কিন্তু drawer-এ আগের folder গুলোরই "shortcut" রাখা — কেউ folder-এর কাগজ বদলালে দুই কেবিনেট থেকেই সেটা দেখা যাবে। Deep copy মানে প্রতিটা folder আর কাগজ ফটোকপি করে নতুন কেবিনেটে রাখা।

কখন কোনটা? যদি list-এ শুধু number বা string থাকে (immutable), shallow copy-ই যথেষ্ট — ভেতরের জিনিস তো বদলানোই যায় না। কিন্তু list-এর ভেতরে list, বা dict-এর ভেতরে dict থাকলে, আর আপনি ভেতরের অংশ বদলাতে চাইলে, \`deepcopy\` লাগবে।

\`deepcopy\` বড় data-য় ধীর হতে পারে, কারণ পুরো structure হেঁটে প্রতিটা object নতুন বানাতে হয়।`,
        examples: [
          {
            lang: 'python',
            caption: 'Shallow copy shares the inner lists; deep copy does not',
            code: `import copy

a = [[1, 2], [3, 4]]
shallow = copy.copy(a)      # same as a[:] or list(a)
deep = copy.deepcopy(a)

a[0].append(99)             # mutate an INNER list
a.append([5, 6])            # mutate the OUTER list

print(a)
print(shallow)
print(deep)
print(shallow[0] is a[0], deep[0] is a[0])`,
            output: `[[1, 2, 99], [3, 4], [5, 6]]
[[1, 2, 99], [3, 4]]
[[1, 2], [3, 4]]
True False`,
          },
          {
            lang: 'python',
            caption: 'The classic bug: copying a nested dict with .copy()',
            code: `config = {"db": {"host": "localhost", "port": 5432}}
test_config = config.copy()          # shallow!
test_config["db"]["host"] = "test-db"
print(config["db"]["host"])`,
            output: `test-db`,
          },
        ],
        pitfalls: [
          'Slicing (`x[:]`), `list(x)`, `x.copy()` and `{**d}` are all shallow.',
          '`[[0] * 3] * 3` is not even a shallow copy problem — it is three references to one inner list.',
          '`deepcopy` copies everything reachable, which can be slow and may copy objects (connections, locks) you did not mean to.',
        ],
        followUps: [
          'How does `deepcopy` handle an object that appears twice, or a cycle?',
          'How do you control how your own class is copied?',
          'Why does `[[0] * 3] * 3` behave strangely?',
        ],
      },
      visualizationId: 'py-shallow-vs-deep-copy',
      related: ['py-pass-by-object-reference', 'py-deepcopy-memo-and-cycles'],
    },
    {
      id: 'py-int-caching-and-interning',
      level: 'intermediate',
      priority: 2,
      question: 'What is small integer caching and string interning in CPython?',
      tags: ['cpython', 'interning', 'identity', 'memory', 'optimization'],
      answer: {
        interview: `**Both are CPython memory optimizations that reuse a single object for common immutable values, which is why \`is\` sometimes returns \`True\` for equal values.**

- **Small integer caching:** integers from -5 to 256 are created once at start-up and reused everywhere.
- **String interning:** strings that look like identifiers (letters, digits, underscores) and names used in code are stored once and shared. Other strings may or may not be.
- You can intern explicitly with \`sys.intern(s)\`, which speeds up dictionary lookups when the same strings are compared many times.
- Constants in one compiled code block can also be merged, so \`a = 1000; b = 1000\` in a script may give \`a is b == True\`.
- All of this is an implementation detail, so code must always use \`==\` for values.

Real-world: knowing this explains "flaky" \`is\` comparisons in someone else's code — and why the fix is \`==\`.`,
        explanationBn: `Python-এ সবকিছুই object, আর প্রতিটা object তৈরি করতে memory আর সময় লাগে। Program-এ \`0\`, \`1\`, \`-1\`, \`"name"\`-এর মতো value গুলো লক্ষবার ব্যবহার হয় — প্রতিবার নতুন object বানানো অপচয়। তাই CPython কিছু কৌশল ব্যবহার করে:

**Small integer cache:** interpreter চালু হওয়ার সময়ই -5 থেকে 256 পর্যন্ত সব integer object একবার বানিয়ে রাখা হয়। এরপর যেখানেই এই range-এর সংখ্যা দরকার, নতুন object না বানিয়ে সেই রেডিমেড object-টাই দেওয়া হয়। এজন্য \`int("100") is int("100")\` \`True\`, কিন্তু \`int("1000") is int("1000")\` \`False\`।

**String interning:** variable নাম, function নাম, attribute নামের মতো identifier-এর মতো দেখতে string গুলো একটা টেবিলে একবার রাখা হয় আর সবাই সেটা share করে। এতে dict lookup দ্রুত হয়, কারণ তুলনা করার সময় শুধু pointer মেলালেই চলে।

\`sys.intern()\` দিয়ে নিজে থেকেও কোনো string intern করা যায় — অনেক বার একই string নিয়ে কাজ করলে memory আর সময় দুটোই বাঁচে।

মূল শিক্ষা: এগুলো CPython-এর ভেতরের সিদ্ধান্ত, version বা context বদলালে বদলে যেতে পারে। তাই value তুলনায় \`is\` কখনো না।`,
        examples: [
          {
            lang: 'python',
            code: `import sys

print(int("100") is int("100"))
print(int("1000") is int("1000"))

a = "".join(["hello", "_world"])   # built at runtime: not interned
b = "hello_world"
print(a == b, a is b)
print(sys.intern(a) is b)`,
            output: `True
False
True False
True`,
          },
        ],
        pitfalls: [
          'Results differ between the REPL, a script and different Python versions — never build logic on them.',
        ],
        followUps: [
          'When would you use `sys.intern` deliberately?',
          'Why does CPython cache small integers at all?',
        ],
      },
      related: ['py-is-vs-equals'],
    },
    {
      id: 'py-arbitrary-precision-int',
      level: 'intermediate',
      priority: 1,
      question: 'Can a Python integer overflow?',
      tags: ['int', 'bigint', 'numbers'],
      answer: {
        interview: `**No. Python \`int\` has arbitrary precision — it grows to as many digits as memory allows, so it never overflows.**

- \`2 ** 100\` is computed exactly.
- Larger numbers simply use more memory and make arithmetic slower.
- \`float\` is different: it is a fixed 64-bit double, so it overflows to \`inf\` (or raises \`OverflowError\` in some operations).
- Since Python 3.11, converting a huge int to a string (over 4300 digits) raises \`ValueError\` by default — a protection against denial-of-service; it can be raised with \`sys.set_int_max_str_digits\`.

Real-world: no need for a separate BigInteger type as in Java — factorials, cryptography and large IDs just work.`,
        explanationBn: `C বা Java-তে \`int\`-এর নির্দিষ্ট size থাকে (যেমন 32 বা 64 bit)। সীমার বাইরে গেলে সংখ্যা "overflow" হয়ে উল্টাপাল্টা value দেয়। Python-এ এই সমস্যা নেই — \`int\` দরকার মতো বড় হতে থাকে, যতক্ষণ memory আছে।

ভেতরে ভেতরে Python বড় সংখ্যাকে অনেকগুলো ছোট "digit"-এর array হিসেবে রাখে (খাতায় হাতে বড় যোগ-গুণ করার মতো), তাই সংখ্যা যত বড়ই হোক, হিসাব নির্ভুল থাকে। তবে বড় সংখ্যায় হিসাব ধীর হয়।

\`float\` কিন্তু এর ব্যতিক্রম — সেটা সবসময় 64-bit, তাই খুব বড় হলে \`inf\` হয়ে যায়।

Python 3.11-এ একটা নতুন সীমা এসেছে: অনেক বড় integer (৪৩০০ digit-এর বেশি) string-এ রূপান্তর করতে গেলে \`ValueError\` হয়। এটা নিরাপত্তার জন্য — কেউ ইচ্ছে করে বিশাল সংখ্যা পাঠিয়ে server-কে ধীর করে দিতে না পারে।`,
        examples: [
          {
            lang: 'python',
            code: `print(2 ** 100)
print(len(str(2 ** 1000)))
print(1e308 * 10)`,
            output: `1267650600228229401496703205376
302
inf`,
          },
        ],
        followUps: ['Why is `0.1 + 0.2` not exactly `0.3`?'],
      },
      related: ['py-float-precision'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'py-deepcopy-memo-and-cycles',
      level: 'advanced',
      priority: 2,
      question:
        'How does `copy.deepcopy` handle shared references and cycles, and how do you customize copying?',
      tags: ['copy', 'deepcopy', 'dunder-methods', 'memo'],
      answer: {
        interview: `**\`deepcopy\` keeps a \`memo\` dictionary from \`id(original)\` to its copy. Before copying an object it checks the memo, so shared references stay shared in the copy and cycles terminate.**

- If one inner list appears twice in the original, it appears twice in the copy as **one** new list — the structure is preserved.
- A self-referencing object (\`a.append(a)\`) is copied without infinite recursion.
- Customize with \`__copy__(self)\` and \`__deepcopy__(self, memo)\`; pass \`memo\` along when deep-copying your attributes.
- Without those methods, copying falls back to the pickle protocol (\`__reduce_ex__\`).
- Immutable atoms (\`int\`, \`str\`, \`tuple\` of immutables) are returned as-is, not duplicated.

Real-world: implement \`__deepcopy__\` when an object holds a resource that must not be duplicated — e.g. share a database connection but deep-copy the data.`,
        explanationBn: `ধরুন একটা list-এর ভেতরে একই inner list দুবার আছে, অথবা একটা list নিজের ভেতরেই নিজেকে রেখেছে (cycle)। সরল recursive copy এখানে দুটো ভুল করত: shared object-কে দুটো আলাদা copy বানিয়ে ফেলত, আর cycle-এ পড়লে অনন্তকাল ঘুরতে থাকত।

\`deepcopy\` এটা সমাধান করে একটা **memo** dictionary দিয়ে। প্রতিটা object কপি করার আগে সে memo-তে দেখে — "এই object-টা কি আগেই কপি করেছি?" যদি করে থাকে, নতুন কপি না বানিয়ে আগের কপিটাই বসিয়ে দেয়। কপি বানানোর সাথে সাথে memo-তে লিখে রাখে \`id(original) → copy\`।

ফলাফল:
- মূল structure-এ যে object দুই জায়গায় shared ছিল, copy-তেও সেটা দুই জায়গায় shared থাকে (কিন্তু নতুন একটা object হিসেবে)।
- Cycle-এ পৌঁছালে memo-তে নিজেকেই খুঁজে পায়, তাই recursion থেমে যায়।

নিজের class-এর জন্য copy-র নিয়ম বদলাতে চাইলে \`__deepcopy__(self, memo)\` লিখতে হয়। ভেতরের attribute deep copy করার সময় অবশ্যই \`memo\` পাস করবেন — না হলে shared/cycle-এর সুরক্ষাটা ভেঙে যায়। বাস্তব উদাহরণ: object-এ একটা database connection আছে — সেটা কপি করা অর্থহীন, তাই connection share করে শুধু data deep copy করা হয়।`,
        examples: [
          {
            lang: 'python',
            caption: 'Shared references stay shared; cycles are handled',
            code: `import copy

inner = [1, 2]
outer = [inner, inner]          # the same list twice
clone = copy.deepcopy(outer)
print(clone[0] is clone[1], clone[0] is inner)

loop = [1]
loop.append(loop)               # a list that contains itself
loop_copy = copy.deepcopy(loop)
print(loop_copy[1] is loop_copy, loop_copy is loop)`,
            output: `True False
True False`,
          },
          {
            lang: 'python',
            caption: 'Customizing deepcopy: share the connection, copy the data',
            code: `import copy

class Report:
    def __init__(self, conn, rows):
        self.conn = conn
        self.rows = rows

    def __deepcopy__(self, memo):
        rows = copy.deepcopy(self.rows, memo)   # pass memo along
        return Report(self.conn, rows)          # share the connection

r1 = Report(conn=object(), rows=[[1, 2]])
r2 = copy.deepcopy(r1)
print(r2.conn is r1.conn, r2.rows is r1.rows, r2.rows == r1.rows)`,
            output: `True False True`,
          },
        ],
        pitfalls: [
          'Forgetting to pass `memo` inside `__deepcopy__` breaks shared-reference preservation and can loop forever on cycles.',
          'Objects that cannot be pickled usually cannot be deep-copied either without a custom `__deepcopy__`.',
        ],
        followUps: [
          'What is the difference between `__copy__` and `__deepcopy__`?',
          'Why are tuples of immutables not copied by `deepcopy`?',
        ],
      },
      related: ['py-shallow-vs-deep-copy'],
    },
  ],
});

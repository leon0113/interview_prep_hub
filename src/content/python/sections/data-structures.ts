import { defineSection } from '../../define';

export const dataStructures = defineSection({
  id: 'py-data-structures',
  title: 'Data Structures',
  description:
    'Lists, tuples, sets and dicts: the operations interviewers ask about, the classic traps, comprehensions, and what happens under the hood.',
  order: 3,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'py-list-vs-tuple',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between a list and a tuple, and when would you use each?',
      tags: ['list', 'tuple', 'mutability', 'hashable'],
      answer: {
        interview: `**A list is mutable and meant for a variable-length collection of similar items; a tuple is immutable and meant for a fixed-size record whose positions have meaning.**

- **Mutability:** lists support \`append\`, \`remove\`, item assignment; tuples cannot change after creation.
- **Hashability:** a tuple of hashable items can be a \`dict\` key or \`set\` member (e.g. \`(lat, lng)\`); a list never can.
- **Performance/memory:** tuples are slightly smaller and faster to create, and constant tuples can be built once at compile time.
- **Intent:** \`[3, 7, 1]\` says "several of the same kind"; \`("Rafi", 30, "Dhaka")\` says "one record with fields".
- Syntax gotcha: a one-element tuple needs a trailing comma — \`(5,)\`; \`(5)\` is just \`5\`.

Real-world: return several values from a function as a tuple, use tuples as composite dict keys, and use a list whenever the collection grows or changes.`,
        explanationBn: `বাইরে থেকে দুটো দেখতে প্রায় একই — দুটোই ordered, index দিয়ে পড়া যায়, slice করা যায়। মূল পার্থক্য হলো **mutability**, আর সেখান থেকেই বাকি সব পার্থক্য আসে।

**List mutable:** element যোগ, বাদ, বদল — সব করা যায়। তাই যে collection-এর আকার বা উপাদান বদলাতে পারে (shopping cart, task list), সেখানে list।

**Tuple immutable:** একবার তৈরি হলে আর বদলায় না। এর তিনটা সুবিধা:
1. **Hashable হতে পারে** — তাই dict-এর key বা set-এর element হিসেবে ব্যবহার করা যায়। যেমন grid-এর একটা ঘর বোঝাতে \`(row, col)\` key।
2. **নিরাপত্তা** — function-এ পাঠালে কেউ ভুল করে বদলে ফেলতে পারবে না।
3. **সামান্য দ্রুত ও ছোট** — Python জানে size আর বদলাবে না, তাই বাড়তি জায়গা রাখতে হয় না।

একটা দার্শনিক পার্থক্যও আছে, যেটা বললে interviewer খুশি হন: list সাধারণত **একই ধরনের অনেক জিনিস** রাখে (homogeneous), আর tuple একটা **record** — প্রতিটা position-এর আলাদা অর্থ (heterogeneous)। যেমন \`("Rafi", 30)\`-এ প্রথমটা নাম, দ্বিতীয়টা বয়স।

ছোট্ট ফাঁদ: \`(5)\` কোনো tuple না — এটা শুধু bracket-এর ভেতরে 5। এক element-এর tuple বানাতে comma লাগে: \`(5,)\`। আসলে tuple বানায় comma, bracket না।`,
        examples: [
          {
            lang: 'python',
            code: `point = (23.8, 90.4)          # a record: lat, lng
visited = {point: "Dhaka"}    # tuples can be dict keys
print(visited[(23.8, 90.4)])

try:
    {[1, 2]: "x"}
except TypeError as e:
    print("TypeError:", e)

print(type((5)).__name__, type((5,)).__name__)
t = 1, 2, 3                   # the comma makes the tuple
print(t, len(t))`,
            output: `Dhaka
TypeError: unhashable type: 'list'
int tuple
(1, 2, 3) 3`,
          },
          {
            lang: 'python',
            caption: 'Tuples are smaller than equivalent lists',
            code: `import sys
print(sys.getsizeof((1, 2, 3)) < sys.getsizeof([1, 2, 3]))`,
            output: `True`,
          },
        ],
        pitfalls: [
          '"Tuples are immutable" does not make their contents immutable: `([1], 2)` can still change, and is not hashable.',
          '`(5)` is an int; a single-item tuple is `(5,)`.',
          'Using a list as a dict key raises `TypeError: unhashable type`.',
        ],
        followUps: [
          'Can a tuple contain a list? Is that tuple hashable?',
          'What is a `namedtuple`, and why use it?',
          'Why are tuples faster than lists?',
        ],
      },
      related: ['py-hashable-dict-keys', 'py-mutable-vs-immutable'],
    },
    {
      id: 'py-list-comprehensions',
      level: 'foundation',
      priority: 3,
      question: 'What are list, dict and set comprehensions? Show examples with conditions.',
      tags: ['comprehensions', 'list', 'dict', 'set', 'pythonic'],
      answer: {
        interview: `**A comprehension builds a new list, dict or set from an iterable in one expression: \`[expression for item in iterable if condition]\`.**

- **List:** \`[x * x for x in nums]\`
- **Dict:** \`{name: len(name) for name in names}\`
- **Set:** \`{word.lower() for word in words}\`
- **Filter** with a trailing \`if\`: \`[x for x in nums if x % 2 == 0]\` keeps only some items.
- **Transform conditionally** with \`a if cond else b\` *before* the \`for\`: \`["even" if x % 2 == 0 else "odd" for x in nums]\` keeps every item.
- Usually faster and clearer than an equivalent \`for\` loop with \`append\`.
- There is no tuple comprehension: \`(x for x in nums)\` is a **generator expression**.

Real-world: \`{u.id: u for u in users}\` builds an id → user lookup table in one line.`,
        explanationBn: `Comprehension হলো "একটা collection থেকে আরেকটা collection বানানো"-র সংক্ষিপ্ত, পড়তে সহজ রূপ। নিচের দুটো একই কাজ করে:

\`\`\`python
squares = []
for x in nums:
    squares.append(x * x)

squares = [x * x for x in nums]
\`\`\`

পড়ার নিয়ম: \`[কী রাখব  for  কোথা থেকে  if  কোন শর্তে]\`।

একটা খুব common confusion — \`if\`-এর অবস্থান:
- **শেষে \`if\`** → filter। শর্ত না মিললে item বাদ পড়ে, তাই result ছোট হতে পারে।
- **শুরুতে \`a if cond else b\`** → transform। প্রতিটা item থাকে, শুধু value বদলায়। এখানে \`else\` বাধ্যতামূলক।

Dict comprehension-এ \`key: value\` লিখতে হয়, আর set comprehension-এ curly brace কিন্তু colon ছাড়া।

Comprehension loop-এর চেয়ে সাধারণত দ্রুত, কারণ \`.append\` method বারবার খুঁজতে হয় না আর ভেতরে optimized bytecode চলে। তবে যদি logic জটিল হয়ে তিন-চার স্তর হয়ে যায়, তখন সাধারণ loop-ই বেশি readable — "clever" code-এর চেয়ে পরিষ্কার code ভালো।

আর মনে রাখবেন: \`()\` দিলে tuple comprehension হয় না, হয় **generator expression** — যেটা lazy, সব value একবারে memory-তে রাখে না।`,
        examples: [
          {
            lang: 'python',
            code: `nums = [1, 2, 3, 4, 5, 6]

print([x * x for x in nums])
print([x for x in nums if x % 2 == 0])                  # filter
print(["even" if x % 2 == 0 else "odd" for x in nums])  # transform

names = ["rafi", "nadia", "sam"]
print({name: len(name) for name in names})
print(sorted({w.lower() for w in ["Py", "py", "PY", "js"]}))

gen = (x * x for x in nums)
print(type(gen).__name__, sum(gen))`,
            output: `[1, 4, 9, 16, 25, 36]
[2, 4, 6]
['odd', 'even', 'odd', 'even', 'odd', 'even']
{'rafi': 4, 'nadia': 5, 'sam': 3}
['js', 'py']
generator 91`,
          },
          {
            lang: 'python',
            caption: 'Inverting a dict and building a lookup table',
            code: `codes = {"BD": "Bangladesh", "IN": "India"}
print({country: code for code, country in codes.items()})

users = [{"id": 7, "name": "Rafi"}, {"id": 9, "name": "Nadia"}]
by_id = {u["id"]: u["name"] for u in users}
print(by_id[9])`,
            output: `{'Bangladesh': 'BD', 'India': 'IN'}
Nadia`,
          },
        ],
        pitfalls: [
          '`[x for x in nums if x > 0 else 0]` is a SyntaxError — `if/else` must come before the `for`.',
          'Comprehensions with side effects (`[print(x) for x in nums]`) build a useless list; use a loop.',
          'Very nested comprehensions hurt readability; split them or use a loop.',
        ],
        followUps: [
          'How do you write a nested comprehension, e.g. to flatten a list of lists?',
          'What is the difference between a list comprehension and a generator expression?',
          'Do comprehension variables leak into the surrounding scope?',
        ],
      },
      related: ['py-nested-comprehensions', 'py-genexp-vs-listcomp'],
    },
    {
      id: 'py-append-vs-extend',
      level: 'foundation',
      priority: 2,
      question: 'What is the difference between `append`, `extend` and `insert`?',
      tags: ['list', 'append', 'extend', 'insert'],
      answer: {
        interview: `**\`append(x)\` adds \`x\` as a single element; \`extend(iterable)\` adds each element of the iterable; \`insert(i, x)\` puts \`x\` at position \`i\`.**

- \`[1, 2].append([3, 4])\` → \`[1, 2, [3, 4]]\` (one nested element).
- \`[1, 2].extend([3, 4])\` → \`[1, 2, 3, 4]\`.
- \`extend("ab")\` adds \`"a"\` and \`"b"\` — a string is an iterable of characters.
- \`lst += other\` behaves like \`extend\` and mutates in place.
- All return \`None\`; they change the list in place.
- \`append\`/\`extend\` at the end are amortized O(1)/O(k); \`insert(0, x)\` is O(n) because every element shifts — use \`collections.deque\` for fast inserts at the front.

Real-world: \`results.extend(page_items)\` when collecting paginated API results.`,
        explanationBn: `তিনটা method-ই list-কে জায়গায় বসে (in place) বদলায় আর \`None\` ফেরত দেয়।

- **\`append(x)\`**: \`x\`-কে যেমন আছে তেমনই একটা element হিসেবে শেষে বসায়। \`x\` নিজে একটা list হলে পুরো list-টা একটা element হয়ে ঢোকে — ফলে nested list তৈরি হয়।
- **\`extend(iterable)\`**: iterable খুলে ভেতরের প্রতিটা item আলাদা আলাদা করে যোগ করে।
- **\`insert(i, x)\`**: নির্দিষ্ট index-এ বসায়, পরের সবাইকে এক ঘর ডানে সরিয়ে।

ফাঁদ: \`extend("hello")\` পাঁচটা আলাদা অক্ষর যোগ করে, কারণ string-ও iterable।

Performance: list ভেতরে একটা array — শেষে যোগ করা সস্তা, কিন্তু শুরুতে \`insert(0, x)\` করলে বাকি সব element-কে সরাতে হয়, তাই O(n)। সামনে-পেছনে দুদিকেই ঘনঘন যোগ-বাদ করতে হলে \`deque\` ব্যবহার করুন।

আরেকটা common bug: \`nums = nums.append(4)\` — append \`None\` ফেরত দেয়, তাই \`nums\` হয়ে যায় \`None\`!`,
        examples: [
          {
            lang: 'python',
            code: `a = [1, 2]
a.append([3, 4])
print(a)

b = [1, 2]
b.extend([3, 4])
b.extend("ab")
print(b)

c = [1, 3]
c.insert(1, 2)
print(c)

d = [1]
d = d.append(2)   # bug: append returns None
print(d)`,
            output: `[1, 2, [3, 4]]
[1, 2, 3, 4, 'a', 'b']
[1, 2, 3]
None`,
          },
        ],
        pitfalls: [
          '`lst = lst.append(x)` sets `lst` to `None`.',
          '`extend` with a string adds individual characters.',
        ],
        followUps: [
          'What is the time complexity of `insert(0, x)`?',
          'When would you use `collections.deque` instead of a list?',
        ],
      },
      related: ['py-list-internals'],
    },
    {
      id: 'py-sort-vs-sorted',
      level: 'foundation',
      priority: 2,
      question:
        'What is the difference between `list.sort()` and `sorted()`? How do you sort by a custom key?',
      tags: ['sorting', 'sorted', 'key', 'lambda'],
      answer: {
        interview: `**\`list.sort()\` sorts the list in place and returns \`None\`; \`sorted(iterable)\` returns a new sorted list and works on any iterable.**

- Both take \`key=\` (a function applied to each item) and \`reverse=True\`.
- \`sorted(words, key=len)\`, \`sorted(users, key=lambda u: u["age"])\`, \`sorted(s, key=str.lower)\`.
- Sort by several fields with a tuple key: \`key=lambda u: (u["dept"], -u["salary"])\`.
- Python's sort (Timsort) is **stable**: items with equal keys keep their original order — which makes multi-pass sorting work.
- \`operator.itemgetter\` / \`attrgetter\` are fast, readable alternatives to lambdas.
- Complexity: O(n log n), and O(n) for already-sorted data.

Real-world: \`sorted(orders, key=lambda o: o.created_at, reverse=True)\` for "newest first" without touching the original list.`,
        explanationBn: `দুটোই sort করে, কিন্তু কাজের ধরন আলাদা:

- **\`lst.sort()\`** — মূল list-টাকেই বদলে দেয় এবং \`None\` ফেরত দেয়। শুধু list-এ আছে।
- **\`sorted(x)\`** — মূলটা যেমন ছিল রেখে **নতুন** একটা sorted list দেয়। যেকোনো iterable-এ চলে — tuple, string, dict (key গুলো sort হয়), generator।

মূলটা পরে আর লাগবে না আর memory বাঁচাতে চান → \`.sort()\`। মূলটা অক্ষত রাখতে চান → \`sorted()\`।

**\`key\` function** হলো আসল শক্তি: প্রতিটা element-এর জন্য একটা "তুলনার মান" বানিয়ে দেয়, আর Python সেই মান দেখে সাজায়। একাধিক field দিয়ে sort করতে key থেকে tuple ফেরত দিন — tuple প্রথম element দিয়ে তুলনা হয়, সমান হলে দ্বিতীয়টা দিয়ে। কোনো সংখ্যা উল্টো ক্রমে চাইলে তার আগে মাইনাস দিন।

**Stability** মানে: যাদের key সমান, তারা sort-এর পরেও আগের ক্রমেই থাকে। এজন্যই "আগে নাম দিয়ে sort, তারপর department দিয়ে sort" করলে প্রতিটা department-এর ভেতরে নাম সাজানো থাকে।

Common bug: \`nums = nums.sort()\` — এখন \`nums\` হলো \`None\`।`,
        examples: [
          {
            lang: 'python',
            code: `nums = [3, 1, 2]
print(sorted(nums), nums)     # new list, original untouched
print(nums.sort(), nums)      # in place, returns None

words = ["banana", "Apple", "cherry", "kiwi"]
print(sorted(words))
print(sorted(words, key=str.lower))
print(sorted(words, key=len, reverse=True))`,
            output: `[1, 2, 3] [3, 1, 2]
None [1, 2, 3]
['Apple', 'banana', 'cherry', 'kiwi']
['Apple', 'banana', 'cherry', 'kiwi']
['banana', 'cherry', 'Apple', 'kiwi']`,
          },
          {
            lang: 'python',
            caption: 'Multi-field sort: department ascending, salary descending',
            code: `staff = [
    ("Rafi", "eng", 90),
    ("Nadia", "ops", 70),
    ("Sam", "eng", 120),
    ("Mita", "ops", 85),
]
for name, dept, pay in sorted(staff, key=lambda s: (s[1], -s[2])):
    print(dept, pay, name)`,
            output: `eng 120 Sam
eng 90 Rafi
ops 85 Mita
ops 70 Nadia`,
          },
        ],
        pitfalls: [
          '`lst = lst.sort()` replaces the list with `None`.',
          'Uppercase letters sort before lowercase by default — use `key=str.lower` for human order.',
          'Sorting mixed types like `[1, "a"]` raises `TypeError` in Python 3.',
        ],
        followUps: [
          "What does it mean that Python's sort is stable?",
          'How would you sort a dict by its values?',
          'What algorithm does Python use for sorting?',
        ],
      },
      related: ['py-dict-iterate-and-sort'],
    },
    {
      id: 'py-remove-pop-del',
      level: 'foundation',
      priority: 2,
      question: 'What is the difference between `remove`, `pop` and `del` on a list?',
      tags: ['list', 'remove', 'pop', 'del'],
      answer: {
        interview: `**\`remove(x)\` deletes by value, \`pop(i)\` deletes by index and returns the item, \`del lst[i]\` deletes by index (or slice) and returns nothing.**

- \`remove(x)\` deletes only the **first** match and raises \`ValueError\` if \`x\` is absent.
- \`pop()\` with no argument removes the last item (O(1)) — perfect for a stack; \`pop(0)\` is O(n).
- \`pop(i)\` / \`del lst[i]\` raise \`IndexError\` for a bad index.
- \`del lst[1:3]\` removes a whole slice; \`del lst\` removes the *name*, not necessarily the object.
- \`clear()\` empties the list in place.

Real-world: to remove *every* occurrence of a value, build a new list with a comprehension instead of calling \`remove\` in a loop.`,
        explanationBn: `তিনটা উপায়ই list থেকে element সরায়, কিন্তু কীভাবে খুঁজবে আর কী ফেরত দেবে সেখানে পার্থক্য:

| | কী দিয়ে খোঁজে | কী ফেরত দেয় | না পেলে |
|---|---|---|---|
| \`remove(x)\` | value | \`None\` | \`ValueError\` |
| \`pop(i)\` | index (default শেষটা) | সরানো item | \`IndexError\` |
| \`del lst[i]\` | index বা slice | কিছু না (statement) | \`IndexError\` |

\`remove\` শুধু **প্রথম** মিলটা সরায়। সব মিল সরাতে loop-এর মধ্যে \`remove\` ডাকলে ধীর (প্রতিবার আবার খোঁজা) আর loop চলাকালীন list বদলালে bug-ও হতে পারে। সবচেয়ে পরিষ্কার উপায়: \`[x for x in lst if x != target]\`।

\`pop()\` শেষ থেকে সরায় বলে O(1) — তাই list-কে stack হিসেবে ব্যবহার করা যায়। কিন্তু \`pop(0)\` প্রথমটা সরাতে বাকি সবাইকে এক ঘর বাঁয়ে সরাতে হয় — O(n)। Queue লাগলে \`deque.popleft()\`।

\`del\` আসলে একটা statement — শুধু list-এর element না, variable নাম, dict-এর key, slice — সব মুছতে পারে।`,
        examples: [
          {
            lang: 'python',
            code: `nums = [10, 20, 30, 20, 40]
nums.remove(20)          # first 20 only
print(nums)
print(nums.pop(), nums)  # last item
print(nums.pop(0), nums)
del nums[0]
print(nums)

data = [1, 2, 1, 3, 1]
print([x for x in data if x != 1])   # remove every 1

try:
    data.remove(99)
except ValueError as e:
    print("ValueError:", e)`,
            output: `[10, 30, 20, 40]
40 [10, 30, 20]
10 [30, 20]
[20]
[2, 3]
ValueError: list.remove(x): x not in list`,
          },
        ],
        pitfalls: [
          'Calling `remove` while iterating over the same list skips elements.',
          '`pop(0)` on a long list is slow; use `collections.deque`.',
        ],
        followUps: [
          'How do you remove all occurrences of a value?',
          'What happens if you modify a list while iterating over it?',
        ],
      },
    },
    {
      id: 'py-nested-list-multiplication',
      level: 'foundation',
      priority: 2,
      question: 'Why does `grid = [[0] * 3] * 3` behave strangely when you change one cell?',
      tags: ['list', 'references', 'aliasing', '2d-list'],
      answer: {
        interview: `**Because \`* 3\` on the outer list copies the *reference* to the same inner list three times. All three rows are one list object, so changing \`grid[0][0]\` changes every row.**

- \`[0] * 3\` is fine — it repeats the integer \`0\`, which is immutable.
- \`[[0] * 3] * 3\` repeats a reference to one mutable list.
- Correct way: build a new inner list per row with a comprehension — \`[[0] * 3 for _ in range(3)]\`.
- \`grid[0] is grid[1]\` is \`True\` in the buggy version, \`False\` in the fixed one.

Real-world: this bites people building game boards, matrices and DP tables.`,
        explanationBn: `\`*\` operator list-এর ভেতরের জিনিস **কপি করে না**, শুধু reference গুলো পুনরাবৃত্তি করে।

\`[0] * 3\`-এ সমস্যা নেই — ভেতরের জিনিস \`0\`, যেটা immutable। তিনটা ঘর একই \`0\` object-কে দেখালেও কিছু যায় আসে না, কারণ \`grid[0] = 5\` লিখলে ঘরটা নতুন object-এ সরে যায়।

কিন্তু \`[[0] * 3] * 3\`-এ প্রথমে **একটা** inner list তৈরি হয় \`[0, 0, 0]\`, তারপর বাইরের \`* 3\` সেই একই list-এর reference তিনবার বসায়। দেখতে তিনটা row, আসলে একটাই list তিনটা নামে। এখন \`grid[0][0] = 1\` মানে সেই একমাত্র inner list-টাকে বদলানো — তাই তিনটা "row"-তেই 1 দেখা যায়।

সমাধান: comprehension, কারণ comprehension প্রতিটা iteration-এ \`[0] * 3\` আবার নতুন করে evaluate করে — ফলে প্রতিটা row একটা আলাদা list।

Interview-এ এটা বোঝানোর সময় \`is\` দিয়ে প্রমাণ দেখালে খুব ভালো লাগে: \`grid[0] is grid[1]\`।`,
        examples: [
          {
            lang: 'python',
            code: `bad = [[0] * 3] * 3
bad[0][0] = 1
print(bad)
print(bad[0] is bad[1])

good = [[0] * 3 for _ in range(3)]
good[0][0] = 1
print(good)
print(good[0] is good[1])`,
            output: `[[1, 0, 0], [1, 0, 0], [1, 0, 0]]
True
[[1, 0, 0], [0, 0, 0], [0, 0, 0]]
False`,
          },
        ],
        pitfalls: [
          'The same trap applies to `[[]] * n` and `[{}] * n`.',
          '`dict.fromkeys(keys, [])` also shares one list between all keys.',
        ],
        followUps: [
          'Is `[[0] * 3] * 3` a shallow-copy problem?',
          'What does `dict.fromkeys(["a", "b"], [])` give you?',
        ],
      },
      related: ['py-shallow-vs-deep-copy', 'py-mutable-vs-immutable'],
    },
    {
      id: 'py-set-basics',
      level: 'foundation',
      priority: 2,
      question: 'What is a set, and what operations does it support?',
      tags: ['set', 'uniqueness', 'set-operations', 'frozenset'],
      answer: {
        interview: `**A set is an unordered collection of unique, hashable items, backed by a hash table — membership tests are O(1) on average.**

- Duplicates disappear automatically: \`set([1, 1, 2])\` → \`{1, 2}\`.
- Operations: union \`a | b\`, intersection \`a & b\`, difference \`a - b\`, symmetric difference \`a ^ b\`; plus \`issubset\` (\`<=\`) and \`isdisjoint\`.
- \`add\`, \`remove\` (raises \`KeyError\` if missing), \`discard\` (silent), \`pop\` (arbitrary item).
- No indexing and no guaranteed order.
- \`{}\` is an empty **dict** — an empty set is \`set()\`.
- \`frozenset\` is the immutable, hashable version (usable as a dict key or inside another set).

Real-world: "which users are in both groups?" is just \`group_a & group_b\`; checking "have I seen this id?" uses a set.`,
        explanationBn: `Set হলো গণিতের "সেট"-এর মতো — প্রতিটা element একবারই থাকে, আর কোনো নির্দিষ্ট ক্রম নেই।

ভেতরে set একটা **hash table**। কোনো element যোগ করার সময় Python তার hash হিসাব করে সরাসরি একটা নির্দিষ্ট ঘরে রাখে। খোঁজার সময়ও hash দিয়ে সরাসরি সেই ঘরে যায় — পুরো collection ঘুরতে হয় না। তাই \`x in my_set\` গড়ে O(1), যেখানে list-এ O(n)। এই কারণেই set-এর element-কে **hashable** হতে হয় — list বা dict set-এ রাখা যায় না।

Set operation গুলো পড়তে খুব সুন্দর:
- \`a | b\` — দুটোতে যা আছে সব (union)
- \`a & b\` — দুটোতেই যা আছে (intersection)
- \`a - b\` — a-তে আছে কিন্তু b-তে নেই
- \`a ^ b\` — যেকোনো একটাতে আছে, দুটোতে না

দুটো ফাঁদ:
1. \`{}\` লিখলে খালি **dict** তৈরি হয়, set না। খালি set = \`set()\`।
2. Set-এর print order-এর ওপর ভরসা করবেন না — string-এর set প্রতিবার program চালালে ভিন্ন ক্রমে দেখাতে পারে।`,
        examples: [
          {
            lang: 'python',
            code: `a = {1, 2, 3, 4}
b = {3, 4, 5}
print(a | b, a & b)
print(a - b, a ^ b)
print({1, 2} <= a, a.isdisjoint({9}))

s = set([3, 1, 3, 2, 1])
s.add(5)
s.discard(42)        # no error if missing
print(s, 2 in s)
print(type({}).__name__, type(set()).__name__)`,
            output: `{1, 2, 3, 4, 5} {3, 4}
{1, 2} {1, 2, 5}
True True
{1, 2, 3, 5} True
dict set`,
          },
        ],
        pitfalls: [
          '`{}` creates a dict, not a set.',
          'Iteration order of a set of strings changes between runs (hash randomization) — sort before displaying.',
          '`remove` raises `KeyError` for a missing item; `discard` does not.',
        ],
        followUps: [
          'How do you remove duplicates from a list but keep the order?',
          'What is a `frozenset` used for?',
          'Why is `x in my_set` faster than `x in my_list`?',
        ],
      },
      related: ['py-remove-duplicates-keep-order', 'py-time-complexity-lookups'],
    },
    {
      id: 'py-remove-duplicates-keep-order',
      level: 'foundation',
      priority: 2,
      question: 'How do you remove duplicates from a list while keeping the original order?',
      tags: ['list', 'set', 'dict', 'deduplication'],
      answer: {
        interview: `**Use \`list(dict.fromkeys(items))\`. Dicts keep insertion order (Python 3.7+) and keys are unique, so the first occurrence of each item wins.**

- \`list(set(items))\` removes duplicates but **loses the order**.
- The explicit version uses a \`seen\` set plus a loop — useful when deduplicating by a key (e.g. by user id).
- Both are O(n); items must be hashable.
- For unhashable items (like dicts), deduplicate on a hashable key derived from each item.

Real-world: deduplicating a list of email addresses or tags while keeping the order the user entered them.`,
        explanationBn: `সবচেয়ে সহজ পথ \`list(set(items))\` — কিন্তু set-এর কোনো ক্রম নেই, তাই মূল ক্রম হারিয়ে যায়। Interview-এ প্রায়ই প্রশ্নটা থাকে "ক্রম ঠিক রেখে"।

**কৌশল ১: \`dict.fromkeys\`** — Python 3.7 থেকে dict insertion order মনে রাখে, আর dict-এর key unique। \`dict.fromkeys(items)\` প্রতিটা item-কে key বানায় (value \`None\`)। কোনো item দ্বিতীয়বার এলে key আগে থেকেই আছে, তাই কিছু বদলায় না — প্রথম অবস্থানটাই থাকে। শেষে key গুলো list বানালেই কাজ শেষ। এক লাইন, O(n)।

**কৌশল ২: \`seen\` set দিয়ে loop** — একটু বেশি লেখা, কিন্তু নমনীয়। যেমন user-এর list থেকে একই email-এর duplicate বাদ দিতে চাইলে key হিসেবে \`user["email"]\` রাখুন। Interviewer যদি "built-in ছাড়া করুন" বলেন, এটাই উত্তর।

দুটোই O(n), কারণ set/dict-এ খোঁজা O(1)। কেউ যদি \`if x not in result_list\` দিয়ে করেন, সেটা O(n²) — বড় data-য় খুব ধীর।`,
        examples: [
          {
            lang: 'python',
            code: `items = [3, 1, 3, 2, 1, 4]
print(list(dict.fromkeys(items)))

def dedupe(iterable, key=lambda x: x):
    seen = set()
    result = []
    for item in iterable:
        k = key(item)
        if k not in seen:
            seen.add(k)
            result.append(item)
    return result

users = [{"email": "a@x.com", "n": 1}, {"email": "b@x.com", "n": 2},
         {"email": "a@x.com", "n": 3}]
print([u["n"] for u in dedupe(users, key=lambda u: u["email"])])`,
            output: `[3, 1, 2, 4]
[1, 2]`,
          },
        ],
        pitfalls: [
          '`list(set(items))` loses order.',
          'Checking `if x not in result` against a list is O(n²).',
        ],
        followUps: ['Why are dicts ordered since Python 3.7?'],
      },
      related: ['py-set-basics', 'py-dict-merge-and-order'],
    },
    {
      id: 'py-dict-get-vs-brackets',
      level: 'foundation',
      priority: 2,
      question: 'What is the difference between `d[key]` and `d.get(key)`?',
      tags: ['dict', 'get', 'keyerror', 'setdefault'],
      answer: {
        interview: `**\`d[key]\` raises \`KeyError\` when the key is missing; \`d.get(key, default)\` returns the default (\`None\` if not given) instead.**

- Use \`d[key]\` when a missing key is a bug — fail loudly.
- Use \`d.get(key, fallback)\` when a missing key is normal.
- \`d.setdefault(key, default)\` returns the value and **inserts** the default if missing.
- \`key in d\` tests membership without fetching.
- For counting or grouping, \`collections.Counter\` / \`defaultdict\` remove the need for checks entirely.

Real-world: \`config.get("timeout", 30)\` for optional settings; \`request.headers["Authorization"]\` when the header is required.`,
        explanationBn: `দুটোই dict থেকে value পড়ে, পার্থক্য হলো key না থাকলে আচরণ:

- \`d["x"]\` → \`KeyError\`, program থেমে যায় (যদি না ধরা হয়)।
- \`d.get("x")\` → \`None\`; \`d.get("x", 0)\` → \`0\`।

কোনটা কখন? এটা আসলে একটা design সিদ্ধান্ত: key না থাকাটা কি **স্বাভাবিক** নাকি **bug**?
- Optional config, optional field → \`get\` দিয়ে default দিন।
- যে key অবশ্যই থাকার কথা → \`[]\` ব্যবহার করুন, যাতে সমস্যা সাথে সাথে ধরা পড়ে। সব জায়গায় \`get\` দিলে bug চুপচাপ \`None\` হয়ে অনেক দূরে গিয়ে অদ্ভুত error দেয়।

\`setdefault\` একটু আলাদা: শুধু পড়ে না, key না থাকলে default value **ঢুকিয়েও** দেয়। Grouping-এ কাজের: \`groups.setdefault(k, []).append(x)\`। তবে এই কাজের জন্য \`defaultdict(list)\` আরও পরিষ্কার।

ছোট্ট ফাঁদ: key থাকলেও value \`None\` হলে \`d.get(k, "x")\` দেয় \`None\` — default দেয় না, কারণ key তো আছে।`,
        examples: [
          {
            lang: 'python',
            code: `config = {"host": "localhost", "debug": None}
print(config.get("port", 8080))
print(config.get("debug", True))   # key exists: its None is returned
print("host" in config)

try:
    config["port"]
except KeyError as e:
    print("KeyError:", e)

groups = {}
for word in ["apple", "avocado", "banana"]:
    groups.setdefault(word[0], []).append(word)
print(groups)`,
            output: `8080
None
True
KeyError: 'port'
{'a': ['apple', 'avocado'], 'b': ['banana']}`,
          },
        ],
        pitfalls: [
          'Using `.get` everywhere hides bugs where a key should always exist.',
          '`d.get(k, default)` returns the stored value even when it is `None`.',
        ],
        followUps: ['When would you use `defaultdict` instead?'],
      },
      related: ['py-collections-module'],
    },
    {
      id: 'py-dict-iterate-and-sort',
      level: 'foundation',
      priority: 2,
      question: 'How do you iterate over a dictionary, and how do you sort it by value?',
      tags: ['dict', 'iteration', 'sorting', 'items'],
      answer: {
        interview: `**Iterating a dict yields its keys; use \`.items()\` for (key, value) pairs and \`.values()\` for values. To sort by value, sort the items with \`key=lambda kv: kv[1]\`.**

- \`for k in d\` → keys, \`for k, v in d.items()\` → pairs.
- \`sorted(d.items(), key=lambda kv: kv[1], reverse=True)\` → a list of pairs, highest value first.
- Wrap it in \`dict(...)\` to get a dict back in that order.
- \`max(d, key=d.get)\` returns the key with the largest value.
- \`collections.Counter(...).most_common(n)\` does the "top N" case directly.
- Do not add or remove keys while iterating — \`RuntimeError: dictionary changed size during iteration\`.

Real-world: ranking products by sales or words by frequency.`,
        explanationBn: `Dict-এর ওপর সরাসরি \`for\` চালালে শুধু **key** আসে। Value দরকার হলে \`.values()\`, আর দুটোই একসাথে চাইলে \`.items()\` — এটা প্রতিবার একটা \`(key, value)\` tuple দেয়, যেটা সরাসরি দুটো variable-এ unpack করা যায়।

Value দিয়ে sort করার কৌশল: dict নিজে sort করার কোনো method নেই, তাই আমরা \`items()\`-কে sort করি। প্রতিটা item একটা tuple \`(key, value)\`, আর \`key=lambda kv: kv[1]\` বলে "tuple-এর দ্বিতীয় element (মানে value) দিয়ে তুলনা করো"। ফল হয় tuple-এর একটা list; dict চাইলে \`dict()\` দিয়ে মুড়ে দিন — যেহেতু dict ক্রম মনে রাখে, sorted ক্রমটাই থাকবে।

সবচেয়ে বড় value-র key চাই? \`max(d, key=d.get)\` — এখানে key function হিসেবে \`d.get\` দেওয়া মানে "প্রতিটা key-র জন্য তার value দেখে তুলনা করো"।

একটা সতর্কতা: loop চলার সময় dict-এ key যোগ বা বাদ দিলে \`RuntimeError\`। মুছতে হলে আগে key গুলোর একটা copy নিন: \`for k in list(d):\`।`,
        examples: [
          {
            lang: 'python',
            code: `sales = {"tea": 40, "coffee": 95, "juice": 60}

for item, qty in sales.items():
    print(item, qty)

ranked = sorted(sales.items(), key=lambda kv: kv[1], reverse=True)
print(ranked)
print(dict(ranked))
print(max(sales, key=sales.get))`,
            output: `tea 40
coffee 95
juice 60
[('coffee', 95), ('juice', 60), ('tea', 40)]
{'coffee': 95, 'juice': 60, 'tea': 40}
coffee`,
          },
          {
            lang: 'python',
            caption: 'Deleting while iterating fails; iterate over a copy of the keys',
            code: `stock = {"a": 0, "b": 5, "c": 0}
try:
    for k in stock:
        if stock[k] == 0:
            del stock[k]
except RuntimeError as e:
    print("RuntimeError:", e)

stock = {"a": 0, "b": 5, "c": 0}
for k in list(stock):
    if stock[k] == 0:
        del stock[k]
print(stock)`,
            output: `RuntimeError: dictionary changed size during iteration
{'b': 5}`,
          },
        ],
        pitfalls: [
          "Changing a dict's size while iterating over it raises `RuntimeError`.",
          '`sorted(d)` sorts the keys, not the values.',
        ],
        followUps: [
          'How would you get the top 3 most frequent words?',
          'What are dict views (`keys()`, `items()`)?',
        ],
      },
      related: ['py-sort-vs-sorted', 'py-dict-views'],
    },
    {
      id: 'py-dict-merge-and-order',
      level: 'foundation',
      priority: 2,
      question: 'How do you merge two dictionaries, and are dictionaries ordered?',
      tags: ['dict', 'merge', 'ordering', 'python-3-9'],
      answer: {
        interview: `**Since Python 3.9, \`a | b\` returns a merged dict and \`a |= b\` updates \`a\` in place. When keys collide, the right-hand value wins. And yes — since Python 3.7, dicts are guaranteed to keep insertion order.**

- Older equivalents: \`{**a, **b}\` (new dict) and \`a.update(b)\` (in place).
- The merge is shallow: nested dicts are shared, not merged recursively.
- Insertion order: iteration returns keys in the order they were first added; updating a value does not move the key.
- Order became an implementation detail in CPython 3.6 and a language guarantee in 3.7.
- \`OrderedDict\` is still useful for \`move_to_end\` and order-sensitive equality.

Real-world: \`settings = defaults | user_settings\` — user values override defaults.`,
        explanationBn: `**Merge করার উপায়:**
- \`a | b\` (Python 3.9+) — নতুন dict বানায়, \`a\` আর \`b\` অক্ষত থাকে।
- \`a |= b\` বা \`a.update(b)\` — \`a\`-কেই বদলায়।
- \`{**a, **b}\` — পুরনো version-এ নতুন dict বানানোর উপায়।

একই key দুই dict-এ থাকলে **ডান পাশেরটা জেতে**। এজন্য default config আগে আর user-এর config পরে লেখা হয়: \`defaults | user_settings\`।

এগুলো সব **shallow** merge — nested dict থাকলে ভেতরেরটা পুরোটাই ডানেরটা দিয়ে বদলে যায়, দুটো মিশে যায় না। Recursive merge লাগলে নিজে function লিখতে হয়।

**Order:** Python 3.7 থেকে dict insertion order মনে রাখা ভাষার নিয়ম। প্রথম যে ক্রমে key যোগ হয়েছে, loop-এ সেই ক্রমেই আসবে। কোনো key-র value বদলালে তার অবস্থান বদলায় না। (3.6-এ CPython নতুন compact dict design-এর কারণে এটা করত, কিন্তু তখনো guarantee ছিল না।)

তাহলে \`OrderedDict\` কি অপ্রয়োজনীয়? পুরোপুরি না — এর \`move_to_end()\` আছে (LRU cache বানাতে কাজে লাগে), আর দুটো \`OrderedDict\`-এর \`==\` তুলনায় ক্রমও মেলানো হয়, যেটা সাধারণ dict করে না।`,
        examples: [
          {
            lang: 'python',
            code: `defaults = {"theme": "light", "lang": "en", "size": 12}
user = {"theme": "dark", "size": 14}

print(defaults | user)
print({**defaults, **user} == defaults | user)

d = {"b": 1, "a": 2}
d["c"] = 3
d["b"] = 99            # updating does not move the key
print(list(d))

nested_a = {"db": {"host": "x", "port": 1}}
nested_b = {"db": {"host": "y"}}
print(nested_a | nested_b)   # shallow: the whole inner dict is replaced`,
            output: `{'theme': 'dark', 'lang': 'en', 'size': 14}
True
['b', 'a', 'c']
{'db': {'host': 'y'}}`,
          },
        ],
        pitfalls: [
          'Merging is shallow — nested dicts are replaced, not combined.',
          '`dict ==` ignores order; `OrderedDict ==` does not.',
        ],
        followUps: [
          'Why did dicts become ordered in Python 3.7?',
          'When is `OrderedDict` still useful?',
        ],
      },
      related: ['py-dict-internals'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'py-hashable-dict-keys',
      level: 'intermediate',
      priority: 3,
      question: 'What does "hashable" mean, and what can be used as a dictionary key?',
      tags: ['hashable', 'dict', 'set', '__hash__', '__eq__'],
      answer: {
        interview: `**An object is hashable if it has a hash value that never changes during its lifetime (\`__hash__\`) and can be compared with \`__eq__\`. Only hashable objects can be dict keys or set members.**

- **Hashable:** \`int\`, \`float\`, \`str\`, \`bytes\`, \`bool\`, \`None\`, \`frozenset\`, and \`tuple\`s whose items are all hashable.
- **Not hashable:** \`list\`, \`dict\`, \`set\` — they are mutable, so their hash could change.
- The contract: if \`a == b\` then \`hash(a) == hash(b)\`. (Equal hashes do not imply equality — collisions are allowed.)
- User-defined objects are hashable by default (by identity). If you define \`__eq__\`, Python sets \`__hash__\` to \`None\` unless you also define \`__hash__\`.
- \`@dataclass(frozen=True)\` generates a matching \`__eq__\` and \`__hash__\` for you.

Real-world: use a tuple like \`(user_id, date)\` as a composite key; never mutate an object that is being used as a key.`,
        explanationBn: `Dict আর set ভেতরে **hash table**। Key রাখার সময় Python \`hash(key)\` হিসাব করে, সেই সংখ্যা থেকে ঠিক করে কোন "ঘরে" রাখবে। পরে খোঁজার সময় আবার hash হিসাব করে সরাসরি সেই ঘরে যায়।

এখন ভাবুন, key যদি mutable হয়: একটা list key হিসেবে রাখলেন, পরে list-এ একটা element যোগ করলেন — তার hash বদলে গেল। এখন খুঁজতে গেলে Python নতুন hash দিয়ে **অন্য ঘরে** খুঁজবে, অথচ data পড়ে আছে পুরনো ঘরে। Key হারিয়ে গেল! এই বিপদ এড়াতে Python mutable built-in type (list, dict, set)-কে unhashable বানিয়েছে।

**Hashable হওয়ার শর্ত দুটো:**
1. Object-এর জীবনকালে hash কখনো বদলাবে না।
2. যারা \`==\` অনুযায়ী সমান, তাদের hash-ও সমান হতে হবে। (উল্টোটা জরুরি না — দুটো আলাদা জিনিসের hash মিলে যেতে পারে, এটাকে collision বলে, আর hash table সেটা সামলাতে পারে।)

Tuple-এর ক্ষেত্রে একটা সূক্ষ্মতা: tuple নিজে immutable, কিন্তু ভেতরে list থাকলে \`hash()\` করতে গেলে error — কারণ tuple-এর hash তার সব element-এর hash থেকে বানানো হয়।

নিজের class-এ \`__eq__\` লিখলে Python স্বয়ংক্রিয়ভাবে \`__hash__ = None\` করে দেয় — অর্থাৎ object unhashable হয়ে যায়। কারণ পুরনো identity-ভিত্তিক hash নতুন \`__eq__\`-এর সাথে সামঞ্জস্যপূর্ণ থাকবে না। সমাধান: \`__hash__\`-ও লিখুন, সেই একই field ব্যবহার করে যেগুলো \`__eq__\`-এ আছে।`,
        examples: [
          {
            lang: 'python',
            code: `print(hash((1, 2)) == hash((1, 2)))
for key in ([1, 2], {"a": 1}, (1, [2])):
    try:
        hash(key)
    except TypeError as e:
        print("TypeError:", e)

grid = {(0, 0): "start", (2, 3): "goal"}
print(grid[(2, 3)])`,
            output: `True
TypeError: unhashable type: 'list'
TypeError: unhashable type: 'dict'
TypeError: unhashable type: 'list'
goal`,
          },
          {
            lang: 'python',
            caption: 'Defining __eq__ removes the default __hash__; define both',
            code: `class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)

print(Point.__hash__)

class HashablePoint(Point):
    def __hash__(self):
        return hash((self.x, self.y))

print(len({HashablePoint(1, 2), HashablePoint(1, 2)}))`,
            output: `None
1`,
          },
        ],
        pitfalls: [
          'A tuple is only hashable if everything inside it is hashable.',
          'Mutating an object after using it as a key makes it impossible to find.',
          'Overriding `__eq__` without `__hash__` makes instances unhashable.',
        ],
        followUps: [
          'Why are lists not hashable?',
          'What is the relationship between `__eq__` and `__hash__`?',
          'What happens on a hash collision?',
        ],
      },
      related: ['py-list-vs-tuple', 'py-dict-internals'],
    },
    {
      id: 'py-nested-comprehensions',
      level: 'intermediate',
      priority: 2,
      question: 'How do nested comprehensions work? Flatten a list of lists and build a matrix.',
      tags: ['comprehensions', 'nested', 'flatten', 'matrix'],
      answer: {
        interview: `**In a comprehension with several \`for\` clauses, the clauses read left to right in the same order as nested \`for\` loops. A comprehension *inside* the expression builds a nested structure.**

- Flatten: \`[x for row in matrix for x in row]\` = \`for row in matrix: for x in row: ...\`.
- Build a 2-D grid: \`[[0] * cols for _ in range(rows)]\` or \`[[r * c for c in range(3)] for r in range(3)]\`.
- Transpose: \`[list(col) for col in zip(*matrix)]\`.
- Conditions can follow any \`for\`: \`[x for row in m if row for x in row if x > 0]\`.
- Beyond two levels, a plain loop or \`itertools.chain.from_iterable\` is easier to read.

Real-world: flattening paginated results (a list of pages, each a list of items).`,
        explanationBn: `Nested comprehension-এ দুটো আলাদা জিনিস গুলিয়ে যায় — দুটো আলাদা করে বুঝুন:

**১. একাধিক \`for\` পাশাপাশি (flatten করা):** \`[x for row in matrix for x in row]\`

এটা পড়ার নিয়ম: \`for\` গুলো **বাঁ থেকে ডানে**, ঠিক সাধারণ nested loop-এর মতো উপর থেকে নিচে:
\`\`\`python
for row in matrix:      # প্রথম for
    for x in row:       # দ্বিতীয় for
        result.append(x)
\`\`\`
অনেকে ভাবেন ভেতরের loop আগে লিখতে হবে — না, বাইরেরটা আগে।

**২. Comprehension-এর ভেতরে comprehension (nested structure বানানো):** \`[[r * c for c in range(3)] for r in range(3)]\`

এখানে বাইরের comprehension প্রতিটা \`r\`-এর জন্য একটা পুরো list বানায় — ফলে list-এর list।

\`zip(*matrix)\` দিয়ে transpose একটা সুন্দর কৌশল: \`*\` matrix-এর row গুলোকে আলাদা argument হিসেবে zip-এ পাঠায়, আর zip প্রতিটা row থেকে একটা করে element নিয়ে column বানায়।

পরামর্শ: দুই স্তরের বেশি হলে readability নষ্ট হয় — তখন সাধারণ loop লিখুন।`,
        examples: [
          {
            lang: 'python',
            code: `matrix = [[1, 2, 3], [4, 5, 6]]

print([x for row in matrix for x in row])           # flatten
print([[r * c for c in range(1, 4)] for r in range(1, 3)])
print([list(col) for col in zip(*matrix)])          # transpose
print([x for row in matrix for x in row if x % 2])`,
            output: `[1, 2, 3, 4, 5, 6]
[[1, 2, 3], [2, 4, 6]]
[[1, 4], [2, 5], [3, 6]]
[1, 3, 5]`,
          },
        ],
        pitfalls: [
          'Writing the `for` clauses in the wrong order gives a NameError or a wrong result.',
          '`[[0] * 3] * 3` is NOT a nested comprehension — it shares one inner list.',
        ],
        followUps: [
          'How else could you flatten a list of lists?',
          'How do you flatten arbitrarily nested lists?',
        ],
      },
      related: ['py-list-comprehensions', 'py-nested-list-multiplication'],
    },
    {
      id: 'py-time-complexity-lookups',
      level: 'intermediate',
      priority: 2,
      question: 'What is the time complexity of `x in list` vs `x in set` vs `key in dict`?',
      tags: ['complexity', 'big-o', 'set', 'dict', 'list', 'performance'],
      answer: {
        interview: `**\`x in list\` is O(n) — a linear scan. \`x in set\` and \`key in dict\` are O(1) on average because they use a hash table (O(n) only in pathological collision cases).**

Common operations:

| Operation | list | dict / set |
|---|---|---|
| index / lookup by key | O(1) | O(1) avg |
| \`x in ...\` | O(n) | O(1) avg |
| append / add | O(1) amortized | O(1) avg |
| insert / pop at front | O(n) | — |
| pop from end | O(1) | — |
| delete by value | O(n) | O(1) avg |

- Converting a list to a set costs O(n) once, so it pays off when you test membership many times.
- \`deque\` gives O(1) appends and pops at both ends.

Real-world: replacing \`if user_id in banned_list\` with a set turned an O(n·m) job into O(n + m).`,
        explanationBn: `Interview-এ "এই code optimize করুন" ধরনের প্রশ্নের অর্ধেকের উত্তর এখানে: **list-এ খোঁজা ধীর, set/dict-এ খোঁজা দ্রুত।**

কেন? \`x in my_list\` চালালে Python প্রথম element থেকে শুরু করে একটা একটা করে মেলায় — সবচেয়ে খারাপ ক্ষেত্রে পুরো list। n element হলে n বার তুলনা: O(n)।

\`x in my_set\` চালালে Python \`hash(x)\` হিসাব করে, সেখান থেকে সরাসরি জানে কোন ঘরে থাকার কথা, শুধু সেই ঘরটা দেখে। Element ১০টা হোক বা ১০ লাখ — সময় প্রায় একই: O(1)।

**বাস্তব প্রভাব:** দুটো list-এর common element খুঁজছেন, প্রতিটাতে ১ লাখ element। nested loop বা \`if x in list_b\` দিয়ে করলে প্রায় ১০ বিলিয়ন তুলনা। \`list_b\`-কে আগে set বানালে মোট কাজ ২ লাখের মতো।

"Amortized O(1)" মানে: list-এ append প্রায় সবসময় সস্তা, মাঝে মাঝে ভেতরের array ভরে গেলে বড় একটা array-তে সব কপি করতে হয় — কিন্তু সেটা এত কম হয় যে গড়ে প্রতিটা append O(1)।

Hash table-এর "worst case O(n)" তখন হয় যখন অনেক key-র hash একই ঘরে পড়ে — বাস্তবে প্রায় দেখা যায় না।`,
        examples: [
          {
            lang: 'python',
            caption: 'Same result, very different cost on large inputs',
            code: `orders = [101, 205, 309, 412, 512]
banned = [205, 412, 999]

# O(len(orders) * len(banned)): each 'in' scans the list
slow = [o for o in orders if o in banned]

# O(len(orders) + len(banned)): build the set once
banned_set = set(banned)
fast = [o for o in orders if o in banned_set]

print(slow, fast, slow == fast)`,
            output: `[205, 412] [205, 412] True`,
          },
        ],
        pitfalls: [
          'Building a set inside the loop (`if o in set(banned)`) throws away the benefit.',
          'Hash lookups are O(1) on average, not guaranteed.',
        ],
        followUps: [
          'What does "amortized O(1)" mean for `list.append`?',
          'How is a Python dict implemented?',
        ],
      },
      related: ['py-list-internals', 'py-dict-internals'],
    },
    {
      id: 'py-list-internals',
      level: 'intermediate',
      priority: 2,
      question: 'How is a Python list implemented internally?',
      tags: ['list', 'internals', 'dynamic-array', 'cpython'],
      answer: {
        interview: `**A CPython list is a dynamic array: a contiguous block of pointers to Python objects, with some extra capacity reserved for growth.**

- The list stores **references**, not the objects themselves — that is why one list can hold mixed types.
- Indexing is O(1): pointer arithmetic on the array.
- When the array is full, \`append\` allocates a bigger block (over-allocating by roughly 1/8 plus a constant) and copies the pointers — rare, so \`append\` is amortized O(1).
- Inserting or deleting near the front shifts every later pointer — O(n).
- It is not a linked list; for fast operations at both ends use \`collections.deque\` (a doubly linked list of blocks).

Real-world: if you know the final size, a comprehension or \`[None] * n\` avoids repeated growth.`,
        explanationBn: `অনেকে "list" নাম শুনে linked list ভাবেন — কিন্তু Python-এর list আসলে একটা **dynamic array**।

ভেতরে যা থাকে:
- পাশাপাশি সাজানো কিছু ঘর (contiguous memory), প্রতিটা ঘরে একটা **pointer** — আসল object অন্য কোথাও memory-তে আছে, ঘরে শুধু তার ঠিকানা। এজন্যই একই list-এ int, string, dict সব একসাথে রাখা যায় — সবার ঠিকানার size তো একই।
- বর্তমান length, আর মোট capacity।

**Indexing O(1):** \`lst[500]\` মানে "শুরুর ঠিকানা + 500 × pointer-এর size" — সরাসরি হিসাব, খুঁজতে হয় না।

**Append amortized O(1):** capacity-তে জায়গা থাকলে শুধু পরের ঘরে বসিয়ে দেয়। ভরে গেলে Python আরও বড় (প্রায় ১২.৫% বেশি) একটা জায়গা নেয়, সব pointer কপি করে। এই কপি মাঝে মাঝে হয়, তাই গড়ে প্রতিটা append সস্তা। Analogy: একটা বড় বাক্সে খেলনা রাখছেন — ভরে গেলে বড় বাক্স কিনে সব খেলনা সরান; কিন্তু প্রতিটা খেলনার জন্য নতুন বাক্স কিনতে হয় না।

**সামনে insert O(n):** \`insert(0, x)\` করলে বাকি সব pointer-কে এক ঘর ডানে সরাতে হয়।

তাই queue-র মতো সামনে থেকে সরানো-যোগ করা কাজে \`deque\` ব্যবহার করা উচিত।`,
        examples: [
          {
            lang: 'python',
            caption: 'Capacity grows in steps, so most appends do not reallocate',
            code: `import sys

lst = []
sizes = []
for i in range(32):
    lst.append(i)
    sizes.append(sys.getsizeof(lst))

reallocations = len(set(sizes))
print(len(lst), reallocations < len(lst))`,
            output: `32 True`,
          },
        ],
        pitfalls: ['Treating a list as a queue (`pop(0)`) is O(n) per operation.'],
        followUps: ['Why is `append` amortized O(1)?', 'How is `collections.deque` different?'],
      },
      related: ['py-time-complexity-lookups', 'py-append-vs-extend'],
    },
    {
      id: 'py-dict-views',
      level: 'intermediate',
      priority: 1,
      question: 'What do `dict.keys()`, `values()` and `items()` return?',
      tags: ['dict', 'views', 'keys', 'items'],
      answer: {
        interview: `**They return dynamic *view* objects, not lists: views reflect later changes to the dict, cost nothing to create, and \`keys()\`/\`items()\` support set operations.**

- A view created before an update shows the updated contents.
- \`d.keys() & other.keys()\` gives the common keys; \`d.keys() - other.keys()\` the missing ones.
- Wrap in \`list(...)\` when you need a snapshot or indexing.
- In Python 2 these returned lists — a common migration gotcha.

Real-world: \`required.keys() - payload.keys()\` finds missing fields in one expression.`,
        explanationBn: `\`d.keys()\` কোনো নতুন list বানায় না — dict-এর ওপর একটা "জানালা" (view) দেয়। জানালা দিয়ে সবসময় ঘরের বর্তমান অবস্থা দেখা যায়: view তৈরির পরে dict-এ key যোগ করলে view-তেও সেটা দেখা যায়।

সুবিধা দুটো:
1. **খরচ নেই** — লাখো key থাকলেও view বানাতে কপি লাগে না।
2. **Set-এর মতো আচরণ** — key তো unique, তাই \`keys()\` (আর \`items()\`) set operation সমর্থন করে। দুই dict-এ কোন key common, কোনটা অনুপস্থিত — এক লাইনে বের করা যায়।

Snapshot দরকার হলে (যেমন loop-এর মধ্যে dict বদলাবেন) \`list(d.keys())\` নিন।`,
        examples: [
          {
            lang: 'python',
            code: `d = {"a": 1, "b": 2}
keys = d.keys()
d["c"] = 3
print(keys)                       # the view sees the new key

required = {"name": None, "email": None, "age": None}
payload = {"name": "Rafi", "age": 30}
print(sorted(required.keys() - payload.keys()))
print(sorted(d.keys() & {"a", "z"}))`,
            output: `dict_keys(['a', 'b', 'c'])
['email']
['a']`,
          },
        ],
        followUps: ['How do you find keys present in one dict but not another?'],
      },
      related: ['py-dict-iterate-and-sort'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'py-dict-internals',
      level: 'advanced',
      priority: 2,
      question: 'How is a Python dict implemented, and how does it handle collisions?',
      tags: ['dict', 'hash-table', 'internals', 'collisions', 'cpython'],
      answer: {
        interview: `**A CPython dict is a hash table with open addressing. Since 3.6 it is "compact": a sparse index table points into a dense array of entries stored in insertion order.**

- Lookup: compute \`hash(key)\`, use its low bits to pick a slot in the index table, follow it to an entry, then compare hash and \`==\`.
- **Collisions:** if the slot is taken by a different key, CPython probes other slots using a pseudo-random sequence that mixes in more bits of the hash — no linked lists.
- The table is resized (roughly doubled) when it gets about 2/3 full, keeping lookups O(1) on average.
- The dense entry array is why dicts preserve insertion order and use less memory.
- Equal keys must have equal hashes, so \`1\`, \`1.0\` and \`True\` are the **same** key.

Real-world: this is why keys must be hashable and immutable, and why dict/set membership is so fast.`,
        explanationBn: `এটা একটা গভীর প্রশ্ন, তবে মূল ধারণাগুলো সহজে বলা যায়।

**Hash table:** একটা বড় টেবিল, যার প্রতিটা ঘর (slot) একটা key রাখতে পারে। Key রাখতে Python \`hash(key)\` হিসাব করে, তার একটা অংশ দিয়ে ঠিক করে কোন slot-এ রাখবে।

**Collision:** দুটো আলাদা key একই slot চাইলে কী হবে? অনেক language প্রতিটা slot-এ একটা linked list রাখে। CPython **open addressing** ব্যবহার করে: slot দখল থাকলে একটা নির্দিষ্ট pseudo-random নিয়মে পরের একটা slot চেষ্টা করে, খালি পাওয়া পর্যন্ত। খোঁজার সময়ও একই পথ ধরে চলে — যতক্ষণ না key মেলে বা খালি slot পায়।

**Resize:** টেবিল প্রায় দুই-তৃতীয়াংশ ভরে গেলে collision বাড়ে, তাই Python বড় টেবিল বানিয়ে সব key আবার বসায়। এতে গড় lookup O(1) থাকে।

**Compact dict (3.6+):** আগে বড় sparse টেবিলে সরাসরি (hash, key, value) রাখা হতো — অনেক জায়গা নষ্ট হতো। এখন দুটো অংশ: একটা ছোট index টেবিল (শুধু সংখ্যা), আর একটা ঘন array যেখানে entry গুলো **যোগ করার ক্রমে** পরপর রাখা থাকে। Index টেবিল শুধু বলে "entry নম্বর ৩-এ যাও"। এই ঘন array-র কারণেই dict insertion order মনে রাখে আর কম memory নেয়।

একটা মজার পরিণতি: \`1 == 1.0 == True\` এবং তাদের hash-ও সমান, তাই dict-এর কাছে এরা একই key।`,
        examples: [
          {
            lang: 'python',
            code: `print(hash(1) == hash(1.0) == hash(True))
d = {1: "int", 1.0: "float", True: "bool"}
print(d)                    # one key, last value wins

class AlwaysCollides:
    def __init__(self, n):
        self.n = n
    def __hash__(self):
        return 42           # every instance lands in the same slot
    def __eq__(self, other):
        return self.n == other.n

table = {AlwaysCollides(i): i for i in range(5)}
print(len(table), table[AlwaysCollides(3)])   # still correct, just slower`,
            output: `True
{1: 'bool'}
5 3`,
          },
        ],
        pitfalls: [
          '`1`, `1.0` and `True` collide into one dict key.',
          'A bad `__hash__` (returning a constant) keeps dicts correct but degrades lookups to O(n).',
        ],
        followUps: [
          'Why did dicts become ordered in Python 3.6/3.7?',
          'What happens if two keys have the same hash?',
          'Why must equal objects have equal hashes?',
        ],
      },
      related: ['py-hashable-dict-keys', 'py-dict-merge-and-order', 'py-time-complexity-lookups'],
    },
  ],
});

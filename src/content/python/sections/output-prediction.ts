import { defineSection, type SectionQuestion } from '../../define';
import type { Level, Priority } from '../../schema';

/**
 * Output-prediction puzzles. The puzzle code is shown in the question and repeated as the
 * first example, so `npm run verify:outputs` checks the revealed output against CPython.
 */
function puzzle(p: {
  id: string;
  level: Level;
  priority: Priority;
  title: string;
  tags: string[];
  code: string;
  output: string;
  why: string;
  explanationBn: string;
  extra?: { code: string; output: string; caption: string };
  pitfalls?: string[];
  followUps?: string[];
  related?: string[];
  visualizationId?: string;
}): SectionQuestion {
  return {
    id: p.id,
    level: p.level,
    priority: p.priority,
    question: `${p.title}\n\n\`\`\`python\n${p.code}\n\`\`\``,
    tags: ['output-prediction', ...p.tags],
    answer: {
      interview: `**Output:**\n\n\`\`\`text\n${p.output}\n\`\`\`\n\n${p.why}`,
      explanationBn: p.explanationBn,
      examples: [
        {
          lang: 'python',
          code: p.code,
          output: p.output,
          caption: 'The puzzle, with its real output',
        },
        ...(p.extra ? [{ lang: 'python' as const, ...p.extra }] : []),
      ],
      pitfalls: p.pitfalls,
      followUps: p.followUps,
    },
    visualizationId: p.visualizationId,
    related: p.related,
  };
}

export const outputPrediction = defineSection({
  id: 'py-output-prediction',
  title: 'Output Prediction',
  description:
    'Classic "what does this print?" puzzles. Predict the output first, then reveal the answer and the step-by-step reasoning.',
  order: 8,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    puzzle({
      id: 'py-out-chained-comparison',
      level: 'foundation',
      priority: 2,
      title: 'Chained comparisons: what does this print?',
      tags: ['operators', 'comparison', 'chaining'],
      code: `print(1 < 2 < 3)
print(3 > 2 > 1)
print(1 < 3 > 2)
print(False == False in [False])
print((3 > 2) > 1)`,
      output: `True
True
True
True
False`,
      why: `- Python **chains** comparisons: \`a < b < c\` means \`a < b and b < c\` (with \`b\` evaluated once).
- \`1 < 3 > 2\` → \`1 < 3 and 3 > 2\` → \`True\`, even though it looks odd.
- \`False == False in [False]\` is also a chain: \`(False == False) and (False in [False])\` → \`True\`. \`in\` is a comparison operator, so it chains too.
- \`(3 > 2) > 1\` has explicit parentheses, so no chaining: \`True > 1\` → \`1 > 1\` → \`False\`.`,
      explanationBn: `Python-এ comparison operator গুলো **chain** হয়, যেটা অনেক language-এ হয় না। \`a < b < c\` লিখলে Python আসলে পড়ে \`a < b and b < c\` — গণিতের মতো।

C বা JavaScript-এ \`3 > 2 > 1\` প্রথমে \`3 > 2\` হিসাব করে \`true\` পায়, তারপর \`true > 1\` → \`1 > 1\` → \`false\`। Python-এ এটা \`3 > 2 and 2 > 1\` → \`True\`।

সবচেয়ে চালাক অংশ \`False == False in [False]\`। এটা দেখে মনে হয় \`(False == False) in [False]\` → \`True in [False]\` → \`False\`। কিন্তু \`in\`-ও একটা comparison operator, তাই এটাও chain হয়: \`(False == False) and (False in [False])\` → \`True and True\` → \`True\`।

শেষ লাইনে bracket আছে — bracket chain ভেঙে দেয়। আগে \`(3 > 2)\` → \`True\`, তারপর \`True > 1\`। \`True\`-এর মান \`1\`, তাই \`1 > 1\` → \`False\`।`,
      pitfalls: ['`in`, `not in`, `is` and `is not` all chain like `<` and `==`.'],
      followUps: ['How is `a < b < c` evaluated if `b` is a function call?'],
    }),
    puzzle({
      id: 'py-out-bool-arithmetic',
      level: 'foundation',
      priority: 1,
      title: '`True + True`: what does this print?',
      tags: ['bool', 'int', 'arithmetic'],
      code: `print(True + True)
print(True * 10)
print(sum([True, False, True, True]))
print(["no", "yes"][True])
print(isinstance(True, int), True == 1, hash(True) == hash(1))`,
      output: `2
10
3
yes
True True True`,
      why: `- \`bool\` is a subclass of \`int\`: \`True\` is \`1\` and \`False\` is \`0\` in arithmetic.
- So \`True + True\` is \`2\`, and \`sum\` over booleans **counts the \`True\` values** — a handy idiom: \`sum(x > 0 for x in nums)\`.
- A bool can even index a list: \`[...][True]\` is index \`1\`.
- Because \`True == 1\` and their hashes match, \`True\` and \`1\` are the same dict key.`,
      explanationBn: `Python-এ \`bool\` আসলে \`int\`-এর subclass। \`True\` মানে 1, \`False\` মানে 0 — শুধু print করলে নাম দেখায়।

তাই \`True + True = 2\`, \`True * 10 = 10\`। এটা শুধু মজার trivia না, কাজেও লাগে: \`sum(x > 0 for x in nums)\` লিখলে প্রতিটা \`True\` 1 হিসেবে যোগ হয় — অর্থাৎ কতগুলো positive সংখ্যা আছে তা গোনা হয়ে যায়।

\`["no", "yes"][True]\` — \`True\` index হিসেবে 1, তাই \`"yes"\`।

একটা পরিণতি মনে রাখবেন: \`True\` আর \`1\` dict-এ একই key। \`{1: "a", True: "b"}\`-এ একটাই entry থাকে।`,
      pitfalls: ['Validation like `isinstance(x, int)` also accepts `True` and `False`.'],
      followUps: ['Why was `bool` made a subclass of `int`?'],
      related: ['py-type-vs-isinstance'],
    }),
    puzzle({
      id: 'py-out-identity-and-plus-equals',
      level: 'foundation',
      priority: 2,
      title: '`is`, `==` and `+=` on lists: what does this print?',
      tags: ['identity', 'equality', 'mutability', 'augmented-assignment'],
      code: `a = [1, 2]
b = [1, 2]
c = a
print(a == b, a is b)
print(a is c)
c += [3]
print(a, a is c)
c = c + [4]
print(a, c, a is c)`,
      output: `True False
True
[1, 2, 3] True
[1, 2, 3] [1, 2, 3, 4] False`,
      why: `- \`a\` and \`b\` are equal lists but separate objects: \`==\` is \`True\`, \`is\` is \`False\`.
- \`c = a\` makes a second name for the same list.
- \`c += [3]\` calls \`list.__iadd__\`, which **mutates in place** — so \`a\` sees \`3\`, and \`c\` is still \`a\`.
- \`c = c + [4]\` builds a **new** list and rebinds \`c\` — \`a\` is untouched and the two names now differ.`,
      explanationBn: `চারটা ধাপে ভাগ করে দেখুন:

1. \`a\` আর \`b\` দেখতে একই, কিন্তু দুটো আলাদা list object। তাই \`==\` (value সমান?) → \`True\`, আর \`is\` (একই object?) → \`False\`।
2. \`c = a\` — কোনো copy না, শুধু একই list-এর দ্বিতীয় নাম।
3. **\`c += [3]\`** — এখানেই ফাঁদ। List-এর জন্য \`+=\` হলো in-place operation (\`__iadd__\`, \`extend\`-এর মতো) — নতুন list বানায় না, বিদ্যমান list-টাকেই বদলায়। যেহেতু \`a\` আর \`c\` একই list, \`a\`-তেও \`3\` দেখা যায়।
4. **\`c = c + [4]\`** — \`+\` সবসময় **নতুন** list বানায়, আর \`=\` নামটাকে সেখানে সরিয়ে দেয়। \`a\` পুরনো list-টাই ধরে থাকে।

শিক্ষা: mutable object-এ \`x += y\` আর \`x = x + y\` এক জিনিস না। Immutable object-এ (int, str, tuple) দুটো একই, কারণ সেখানে in-place বদলানো সম্ভবই না।`,
      pitfalls: [
        'For lists, `x += y` mutates while `x = x + y` rebinds — they are not equivalent.',
      ],
      followUps: ['Does `+=` behave the same for tuples and strings?'],
      related: ['py-is-vs-equals', 'py-pass-by-object-reference'],
      visualizationId: 'py-reference-model',
    }),
    puzzle({
      id: 'py-out-shared-inner-list',
      level: 'foundation',
      priority: 2,
      title: 'A list of lists made with `*`: what does this print?',
      tags: ['list', 'references', 'aliasing'],
      code: `rows = [[]] * 3
rows[0].append("x")
print(rows)
rows[1] = ["y"]
print(rows)`,
      output: `[['x'], ['x'], ['x']]
[['x'], ['y'], ['x']]`,
      why: `- \`[[]] * 3\` puts **three references to one inner list** in the outer list.
- \`rows[0].append("x")\` mutates that single shared list, so every slot shows \`['x']\`.
- \`rows[1] = ["y"]\` is different: it **replaces** slot 1 with a brand-new list. Slots 0 and 2 still share the original.
- Correct construction: \`[[] for _ in range(3)]\`.`,
      explanationBn: `\`[[]] * 3\` তিনটা খালি list বানায় না — **একটা** খালি list বানিয়ে তার reference তিনবার বসায়। তাই তিনটা ঘর আসলে একই list।

\`rows[0].append("x")\` সেই একমাত্র list-টাকে বদলায় — তাই তিনটা ঘরেই \`['x']\` দেখা যায়।

দ্বিতীয় অংশটাই এই puzzle-এর আসল প্রশ্ন: \`rows[1] = ["y"]\` কোনো list বদলায় না — বাইরের list-এর ঘর 1-এ **একটা নতুন list বসিয়ে দেয়**। তাই শুধু ঘর 1 বদলায়; ঘর 0 আর 2 এখনো সেই পুরনো shared list (\`['x']\`) দেখায়।

Mutation (object বদলানো) আর assignment (ঘরে নতুন object বসানো) — এই পার্থক্যটাই Python-এর বেশিরভাগ puzzle-এর মূল।`,
      followUps: ['How do you create a 3×3 grid correctly?'],
      related: ['py-nested-list-multiplication'],
    }),

    // ──────────────────────────── Intermediate ────────────────────────────
    puzzle({
      id: 'py-out-mutable-default',
      level: 'intermediate',
      priority: 2,
      title: 'A mutable default argument: what does this print?',
      tags: ['functions', 'default-arguments', 'mutability'],
      code: `def register(name, registry={}):
    registry[name] = len(registry) + 1
    return registry

a = register("rafi")
b = register("nadia")
print(a)
print(a is b)
print(register("sam", {}))
print(register("mita"))`,
      output: `{'rafi': 1, 'nadia': 2}
True
{'sam': 1}
{'rafi': 1, 'nadia': 2, 'mita': 3}`,
      why: `- The default \`{}\` is created **once**, when \`def\` runs, and reused by every call that omits \`registry\`.
- So \`a\` and \`b\` are the same dict, and it holds both names.
- Passing an explicit \`{}\` uses a fresh dict for that one call.
- The next default call is back on the shared dict, which still remembers \`rafi\` and \`nadia\`.
- Fix: \`registry=None\`, then \`if registry is None: registry = {}\`.`,
      explanationBn: `Default value তৈরি হয় **একবার** — \`def\` লাইন চলার সময়। তারপর যতবার argument ছাড়া function call হয়, ততবার সেই একই dict ব্যবহার হয়।

- প্রথম call: shared dict-এ \`rafi: 1\`।
- দ্বিতীয় call: **একই** dict, এখন \`nadia: 2\` যোগ হলো। \`a\` আর \`b\` দুটোই এই dict — তাই \`a\` print করলে দুটো নামই দেখা যায়, আর \`a is b\` → \`True\`।
- তৃতীয় call-এ আমরা নিজেরা নতুন \`{}\` দিয়েছি — তাই শুধু \`sam: 1\`।
- চতুর্থ call আবার default dict-এ ফিরে যায়, যেটা আগের দুজনকে মনে রেখেছে — \`mita\` পায় 3।

সমাধান সবসময় একই: default হিসেবে \`None\` দিন, আর function-এর ভেতরে নতুন dict বানান।`,
      followUps: ['Where can you see the stored default value? (`register.__defaults__`)'],
      related: ['py-mutable-default-argument'],
    }),
    puzzle({
      id: 'py-out-late-binding-lambdas',
      level: 'intermediate',
      priority: 2,
      title: 'Lambdas created in a comprehension: what does this print?',
      tags: ['closures', 'lambda', 'late-binding'],
      code: `multipliers = [lambda x: x * i for i in range(1, 4)]
print([m(10) for m in multipliers])

fixed = [lambda x, i=i: x * i for i in range(1, 4)]
print([m(10) for m in fixed])`,
      output: `[30, 30, 30]
[10, 20, 30]`,
      why: `- Each lambda looks up \`i\` **when it is called**, not when it is created (late binding).
- By the time we call them the loop has finished and \`i\` is \`3\`, so every lambda computes \`10 * 3\`.
- \`i=i\` evaluates the default at creation time, freezing the current value in each lambda.`,
      explanationBn: `তিনটা lambda তৈরি হলো, প্রত্যেকটা \`x * i\` হিসাব করে। প্রশ্ন হলো, কোন \`i\`?

Closure **variable** মনে রাখে, value না। তিনটা lambda-ই একই \`i\`-এর দিকে তাকিয়ে আছে, আর \`i\`-এর value দেখা হয় **call করার সময়**। আমরা call করছি comprehension শেষ হওয়ার পরে, যখন \`i\` = 3। তাই সবাই \`10 * 3 = 30\` দেয়।

\`i=i\` কৌশল: default argument function **তৈরির সময়** evaluate হয়। তাই প্রতিটা lambda তৈরির মুহূর্তে \`i\`-এর তখনকার value নিজের ভেতরে আটকে রাখে — 1, 2, 3।`,
      followUps: ['What are other ways to fix late binding?'],
      related: ['py-late-binding-closures', 'py-closures'],
    }),
    puzzle({
      id: 'py-out-modify-while-iterating',
      level: 'intermediate',
      priority: 2,
      title: 'Removing items while looping: what does this print?',
      tags: ['list', 'iteration', 'mutation', 'bugs'],
      code: `nums = [1, 2, 2, 3, 4, 4]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)
print(nums)`,
      output: `[1, 2, 3, 4]`,
      why: `- A \`for\` loop over a list walks an **index** forward: 0, 1, 2…
- Removing an item shifts everything after it one place left, so the loop **skips** the next item.
- Index 1 is \`2\` → removed; the second \`2\` slides into index 1 and is skipped. Same story for the two \`4\`s.
- Fix: build a new list — \`[n for n in nums if n % 2 != 0]\` — or iterate over a copy (\`for n in nums[:]\`).`,
      explanationBn: `List-এর ওপর \`for\` loop ভেতরে ভেতরে একটা index ধরে এগোয়: 0, 1, 2, …

ধাপে ধাপে দেখুন:
- index 0 → \`1\` — বিজোড়, কিছু হয় না।
- index 1 → \`2\` — জোড়, \`remove\` করা হলো। এখন list: \`[1, 2, 3, 4, 4]\`। দ্বিতীয় \`2\`-টা সরে index 1-এ চলে এসেছে।
- loop এগিয়ে index 2-তে যায় → \`3\`। index 1-এ চলে আসা \`2\`-টা **বাদ পড়ে গেল!**
- index 3 → \`4\` — remove। list: \`[1, 2, 3, 4]\`। দ্বিতীয় \`4\` index 3-এ চলে এল।
- index 4 → list-এ আর নেই, loop শেষ।

ফলাফল \`[1, 2, 3, 4]\` — দুটো জোড় সংখ্যা রয়ে গেছে। এজন্যই নিয়ম: যে list-এর ওপর loop চলছে, তার আকার loop-এর মধ্যে বদলাবেন না। নতুন list বানান, অথবা copy-র ওপর loop চালান।`,
      extra: {
        caption: 'The fixes',
        code: `nums = [1, 2, 2, 3, 4, 4]
print([n for n in nums if n % 2 != 0])

for n in nums[:]:            # iterate over a copy
    if n % 2 == 0:
        nums.remove(n)
print(nums)`,
        output: `[1, 3]
[1, 3]`,
      },
      pitfalls: [
        'Dicts and sets raise `RuntimeError` when their size changes during iteration; lists silently misbehave.',
      ],
      followUps: ['What happens if you do the same with a dict?'],
      related: ['py-remove-pop-del', 'py-dict-iterate-and-sort'],
    }),
    puzzle({
      id: 'py-out-class-vs-instance-variable',
      level: 'intermediate',
      priority: 2,
      title: 'Class variables vs instance variables: what does this print?',
      tags: ['oop', 'class-variables', 'mutability'],
      code: `class Counter:
    count = 0
    items = []

    def add(self, x):
        self.count += 1
        self.items.append(x)

a, b = Counter(), Counter()
a.add("x")
b.add("y")
print(a.count, b.count, Counter.count)
print(a.items, b.items)`,
      output: `1 1 0
['x', 'y'] ['x', 'y']`,
      why: `- \`self.count += 1\` is \`self.count = self.count + 1\`: it **reads** the class value \`0\`, then **assigns** an instance attribute \`1\`. Each instance gets its own \`count\`; \`Counter.count\` stays \`0\`.
- \`self.items.append(x)\` never assigns — it finds the class-level list and **mutates** it, so both instances share one list.
- Immutable class attribute + assignment → per-instance copy. Mutable class attribute + mutation → shared by everyone.`,
      explanationBn: `দুটো লাইন দেখতে একই রকম, কিন্তু আচরণ সম্পূর্ণ আলাদা:

**\`self.count += 1\`** — এটা আসলে \`self.count = self.count + 1\`। ডান পাশে \`self.count\` পড়তে গিয়ে Python object-এ পায় না, class-এ পায় → \`0\`। তারপর \`0 + 1 = 1\` হিসাব করে **assign** করে \`self.count\`-এ — আর assignment সবসময় object-এর নিজের মধ্যে নতুন attribute তৈরি করে। ফলে \`a\` আর \`b\` দুজনেরই নিজস্ব \`count = 1\`, আর \`Counter.count\` আগের মতো \`0\`।

**\`self.items.append(x)\`** — এখানে কোনো assignment নেই। Python \`self.items\` খোঁজে, object-এ না পেয়ে class-এ পায়, আর **সেই shared list-টাকেই** বদলে দেয়। তাই \`a\` আর \`b\` দুজনেই একই list দেখে, দুটো item সহ।

এটা "mutable class variable trap"-এর সবচেয়ে পরিষ্কার প্রদর্শন।`,
      followUps: ['How do you give every instance its own list?'],
      related: ['py-instance-vs-class-variables'],
    }),
    puzzle({
      id: 'py-out-finally-and-return',
      level: 'intermediate',
      priority: 2,
      title: '`return` and `finally`: what does this print?',
      tags: ['exceptions', 'finally', 'return', 'mutability'],
      code: `def f():
    items = [1]
    try:
        return items
    finally:
        items.append(2)

def g():
    x = 1
    try:
        return x
    finally:
        x = 2

print(f(), g())`,
      output: `[1, 2] 1`,
      why: `- \`return items\` evaluates the return value (a reference to the list) **before** \`finally\` runs.
- \`finally\` then **mutates** that same list, so the caller receives \`[1, 2]\`.
- In \`g\`, the return value \`1\` is already captured; \`x = 2\` only rebinds the local name, which no longer matters.
- Neither \`finally\` contains a \`return\`, so the original return values are kept.`,
      explanationBn: `\`return\` লাইনে পৌঁছালে Python আগে return value-টা ঠিক করে ফেলে, তারপর \`finally\` চালায়, তারপর ফেরত দেয়।

**\`f()\`-তে:** return value হলো list object-এর একটা reference। \`finally\` সেই **একই list**-এ \`2\` append করে। যেহেতু object একই, caller যা পায় সেটা বদলে যাওয়া list — \`[1, 2]\`।

**\`g()\`-তে:** return value হলো int \`1\`, যেটা আগেই ঠিক হয়ে গেছে। \`finally\`-তে \`x = 2\` শুধু local নাম \`x\`-কে নতুন value-তে সরায় — ইতিমধ্যে ঠিক হয়ে যাওয়া return value-র ওপর এর কোনো প্রভাব নেই। তাই \`1\`।

আবারও সেই মূল পার্থক্য: mutation দেখা যায়, rebinding দেখা যায় না।`,
      followUps: ['What if `finally` contained its own `return`?'],
      related: ['py-return-in-finally', 'py-try-except-else-finally'],
      visualizationId: 'py-try-except-flow',
    }),
    puzzle({
      id: 'py-out-generator-exhausted',
      level: 'intermediate',
      priority: 2,
      title: 'Using a generator twice: what does this print?',
      tags: ['generators', 'iterators', 'exhaustion'],
      code: `squares = (n * n for n in range(4))
print(sum(squares))
print(sum(squares))

gen = (n for n in range(5))
print(3 in gen)
print(list(gen))`,
      output: `14
0
True
[4]`,
      why: `- A generator can be consumed **once**. The first \`sum\` reads all values (0 + 1 + 4 + 9 = 14); the second finds nothing and returns \`0\`.
- \`3 in gen\` consumes items until it finds \`3\` — it stops there.
- \`list(gen)\` gets only what is left: \`[4]\`.`,
      explanationBn: `Generator হলো একবার-ব্যবহারযোগ্য। একবার পুরোটা পড়ে ফেললে আর কিছু থাকে না, আর কোনো error-ও দেয় না — চুপচাপ খালি থাকে।

- প্রথম \`sum\` চারটা value পড়ে: 0 + 1 + 4 + 9 = 14।
- দ্বিতীয় \`sum\` আর কিছুই পায় না → খালি sum = 0।

দ্বিতীয় অংশ আরও সূক্ষ্ম: \`3 in gen\` generator থেকে একটা একটা করে value নেয় — 0, 1, 2, 3 — আর 3 পেয়েই থামে, \`True\` দেয়। কিন্তু ওই চারটা value **খরচ হয়ে গেছে**। তাই পরের \`list(gen)\` শুধু বাকি থাকা \`4\` পায়।

বাস্তবে এই bug খুব দেখা যায়: একটা function-এ generator পাঠালেন, যেটা প্রথমে validate করার জন্য একবার loop চালায়, তারপর process করার জন্য আবার চালায় — দ্বিতীয়বার কিছুই পায় না। সমাধান: একাধিকবার লাগলে list বানিয়ে নিন।`,
      followUps: ['How can you make an object that can be iterated more than once?'],
      related: ['py-generators-yield', 'py-iterable-vs-iterator'],
      visualizationId: 'py-generator-stepper',
    }),
    puzzle({
      id: 'py-out-for-else',
      level: 'intermediate',
      priority: 1,
      title: '`for ... else`: what does this print?',
      tags: ['loops', 'for-else', 'control-flow'],
      code: `for n in [3, 5, 7]:
    if n % 2 == 0:
        print("found even", n)
        break
else:
    print("no even number")

for n in []:
    pass
else:
    print("else runs for an empty loop too")`,
      output: `no even number
else runs for an empty loop too`,
      why: `- A loop's \`else\` runs when the loop finishes **without hitting \`break\`**.
- No even number is found, so there is no \`break\` and \`else\` runs.
- An empty loop also finishes without \`break\`, so its \`else\` runs as well.
- Think of it as "no break" — the typical use is a search loop with a "not found" branch.`,
      explanationBn: `Python-এ \`for\` আর \`while\` loop-এর সাথেও \`else\` লেখা যায়, আর এর অর্থ অনেকের কাছে অপ্রত্যাশিত।

Loop-এর \`else\` চলে **যদি loop \`break\` ছাড়া শেষ হয়।** \`if\`-এর \`else\`-এর মতো "শর্ত মিথ্যা হলে" না — বরং "\`break\` না হলে"। মনে রাখার জন্য অনেকে মনে মনে \`else\`-কে "nobreak" পড়েন।

প্রথম loop-এ কোনো জোড় সংখ্যা নেই, তাই \`break\` কখনো হয়নি → \`else\` চলে।

দ্বিতীয় loop খালি — একবারও চলে না, তাই \`break\`-ও হয় না → \`else\` চলে।

সবচেয়ে কাজের ব্যবহার: কিছু খোঁজা। পেলে \`break\`, আর না পেলে \`else\`-এ "পাওয়া যায়নি" — আলাদা flag variable লাগে না।`,
      followUps: ['Does `while` also support `else`?'],
    }),

    // ────────────────────────────── Advanced ──────────────────────────────
    puzzle({
      id: 'py-out-tuple-plus-equals',
      level: 'advanced',
      priority: 2,
      title: '`t[0] += [3]` on a tuple that contains a list: what does this print?',
      tags: ['tuples', 'mutability', 'augmented-assignment', 'gotchas'],
      code: `t = ([1, 2], "x")
try:
    t[0] += [3]
except TypeError as e:
    print("TypeError:", e)
print(t)`,
      output: `TypeError: 'tuple' object does not support item assignment
([1, 2, 3], 'x')`,
      why: `**Both things happen: the list is changed *and* a \`TypeError\` is raised.**

- \`t[0] += [3]\` runs in two steps: \`tmp = t[0].__iadd__([3])\` then \`t[0] = tmp\`.
- Step 1 succeeds — \`list.__iadd__\` extends the list **in place**.
- Step 2 assigns back into the tuple, which is immutable → \`TypeError\`.
- By then the list has already been modified, so \`t\` shows \`[1, 2, 3]\`.
- \`t[0].append(3)\` or \`t[0].extend([3])\` mutates the list without the failing assignment.`,
      explanationBn: `এটা Python-এর সবচেয়ে বিখ্যাত অদ্ভুত আচরণগুলোর একটা: **error হয়, তবুও বদলটা ঘটে যায়।**

\`t[0] += [3]\` আসলে দুটো ধাপ:
1. \`t[0]\`-এর list-টার ওপর \`+=\` চালাও → list-এর জন্য এটা in-place extend। List বদলে হয় \`[1, 2, 3]\`। ✓
2. Result-টা আবার \`t[0]\`-এ **assign** করো → কিন্তু tuple-এ item assign করা যায় না। ✗ \`TypeError\`।

প্রথম ধাপ সফল হয়ে গেছে error আসার আগেই, তাই list-টা বদলেই থাকে। Tuple-টা নিজে বদলায়নি — এখনো সেই একই list-কে ধরে আছে — কিন্তু সেই list-এর ভেতরে এখন তিনটা element।

শিক্ষা: tuple-এর immutability মানে শুধু "কোন object ধরে আছে তা বদলাবে না"। ভেতরের mutable object ঠিকই বদলাতে পারে। আর \`append\`/\`extend\` ব্যবহার করলে error ছাড়াই একই কাজ হয়।`,
      followUps: ['Is a tuple containing a list hashable?'],
      related: ['py-mutable-vs-immutable', 'py-list-vs-tuple'],
    }),
    puzzle({
      id: 'py-out-comprehension-scope',
      level: 'advanced',
      priority: 1,
      title: 'Loop variables and comprehension scope: what does this print?',
      tags: ['scope', 'comprehensions', 'loops'],
      code: `x = "outer"
squares = [x * 2 for x in range(3)]
print(x, squares)

for x in range(3):
    pass
print(x)`,
      output: `outer [0, 2, 4]
2`,
      why: `- In Python 3, a comprehension has **its own scope**: its \`x\` does not leak, so the outer \`x\` is still \`"outer"\`.
- A plain \`for\` loop does **not** create a scope: it rebinds the outer \`x\`, which keeps the last value, \`2\`.
- (In Python 2 list comprehensions leaked their variable too.)`,
      explanationBn: `দুটো জিনিস দেখতে একই রকম, কিন্তু scope-এর নিয়ম আলাদা:

**Comprehension:** Python 3-এ comprehension-এর নিজস্ব scope আছে (ভেতরে ভেতরে একটা ছোট function-এর মতো)। এর ভেতরের \`x\` বাইরের \`x\`-কে ছোঁয় না। তাই comprehension শেষে বাইরের \`x\` এখনো \`"outer"\`।

**সাধারণ \`for\` loop:** Python-এ loop কোনো নতুন scope তৈরি করে না। \`for x in range(3)\` বাইরের \`x\`-কেই বারবার বদলায়, আর loop শেষে \`x\`-এ থাকে শেষ value — \`2\`।

এটা মনে রাখার মতো, কারণ loop শেষে loop variable ব্যবহার করা বৈধ (এবং মাঝে মাঝে কাজের), আবার অজান্তে কোনো বাইরের variable-কে overwrite করে ফেলাও সম্ভব।`,
      followUps: ['Which constructs create a new scope in Python?'],
      related: ['py-legb-scope', 'py-list-comprehensions'],
    }),
    puzzle({
      id: 'py-out-except-variable-cleared',
      level: 'advanced',
      priority: 1,
      title: 'Using the exception variable after `except`: what does this print?',
      tags: ['exceptions', 'scope', 'gotchas'],
      code: `e = "before"
try:
    1 / 0
except ZeroDivisionError as e:
    print("caught:", e)
try:
    print(e)
except NameError:
    print("NameError: e was deleted after the except block")`,
      output: `caught: division by zero
NameError: e was deleted after the except block`,
      why: `- \`except ... as e\` binds the exception to \`e\` — overwriting the earlier \`"before"\` value.
- At the end of the \`except\` block Python **deletes** \`e\` (\`del e\`), so even the old value is gone.
- This avoids a reference cycle: the exception's traceback references the frame, which references \`e\`.
- To keep the exception, assign it to another name inside the block: \`error = e\`.`,
      explanationBn: `\`except ZeroDivisionError as e\` লিখলে exception-টা \`e\` নামে বসে — আর আগের \`e = "before"\` হারিয়ে যায়, কারণ একই নাম।

চমক হলো, \`except\` block শেষ হলে Python নিজে থেকে \`del e\` করে দেয়। তাই block-এর পরে \`e\` বলে আর কিছু নেই — না exception, না পুরনো string — ফলে \`NameError\`।

কেন এমন? Exception object-এর ভেতরে traceback থাকে, traceback-এর ভেতরে বর্তমান frame, আর frame-এর ভেতরে local variable \`e\` — যেটা আবার exception-কে দেখায়। এটা একটা reference cycle, যেটা memory অনেকক্ষণ আটকে রাখতে পারে। তাই Python block শেষে নামটা মুছে চক্রটা ভেঙে দেয়।

Exception পরে লাগলে block-এর ভেতরেই অন্য নামে রেখে দিন: \`saved = e\`।`,
      followUps: ['Why does Python delete the exception variable?'],
      related: ['py-try-except-else-finally', 'py-memory-management'],
    }),
    puzzle({
      id: 'py-out-dict-key-collision',
      level: 'advanced',
      priority: 1,
      title: '`True`, `1` and `1.0` as dict keys: what does this print?',
      tags: ['dict', 'hashing', 'equality'],
      code: `d = {True: "a", 1: "b", 1.0: "c"}
print(d, len(d))`,
      output: `{True: 'c'} 1`,
      why: `- \`True == 1 == 1.0\` and they have equal hashes, so to a dict they are **one key**.
- The **first** key object inserted is kept (\`True\`); each later "duplicate" only overwrites the **value**.
- The final value is the last one assigned: \`"c"\`.`,
      explanationBn: `Dict-এর কাছে দুটো key একই হয় যদি তারা \`==\` অনুযায়ী সমান আর তাদের hash-ও সমান। \`True\`, \`1\` আর \`1.0\` — তিনটাই সমান (\`True\` মানে 1), আর hash-ও একই। তাই dict-এর চোখে এরা একটাই key।

এখন কোন key দেখা যাবে আর কোন value? নিয়ম:
- **Key:** প্রথমবার যে object দিয়ে key তৈরি হয়েছে, সেটাই থাকে — \`True\`। পরে "একই" key এলে key object বদলায় না।
- **Value:** প্রতিবার overwrite হয়, তাই শেষেরটা থাকে — \`"c"\`।

ফলাফল: \`{True: 'c'}\`, মাত্র একটা entry।`,
      followUps: ['How does a dict decide two keys are the same?'],
      related: ['py-dict-internals', 'py-hashable-dict-keys'],
    }),
  ],
});

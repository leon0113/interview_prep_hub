import { defineSection } from '../../define';

export const strings = defineSection({
  id: 'py-strings',
  title: 'Strings',
  description:
    'Immutability, slicing, the everyday methods, f-strings, building strings efficiently, and text vs bytes.',
  order: 2,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'py-string-slicing',
      level: 'foundation',
      priority: 2,
      question: 'How does string slicing work, and how does `s[::-1]` reverse a string?',
      tags: ['strings', 'slicing', 'immutability', 'reverse'],
      answer: {
        interview: `**A slice \`s[start:stop:step]\` returns a new string from \`start\` up to (not including) \`stop\`, taking every \`step\`-th character. With a negative step it walks backwards, so \`s[::-1]\` is the whole string reversed.**

- Omitted values default to "the beginning", "the end" and \`step=1\` (for a negative step, the defaults flip).
- Negative indexes count from the end: \`s[-1]\` is the last character, \`s[-3:]\` the last three.
- Slicing never raises \`IndexError\` — out-of-range bounds are clipped. Plain indexing (\`s[100]\`) does raise.
- Strings are **immutable**, so a slice is always a new string and \`s[0] = "x"\` is a \`TypeError\`.
- The same syntax works on lists, tuples and bytes.

Real-world: \`s[::-1]\` is the idiomatic way to reverse; \`"".join(reversed(s))\` does the same and reads well too.`,
        explanationBn: `Slice-এর তিনটা অংশ: \`start\`, \`stop\`, \`step\`। মনে রাখার মূল নিয়ম — **\`stop\` index-টা নিজে বাদ পড়ে।** তাই \`"python"[0:2]\` দেয় \`"py"\` (index 0 আর 1, কিন্তু 2 না)। এই নিয়মের সুবিধা হলো \`s[:k] + s[k:]\` সবসময় পুরো \`s\` দেয় আর \`len(s[:k]) == k\`।

**Negative index** শেষ থেকে গোনে: \`-1\` মানে শেষ character, \`-2\` তার আগেরটা।

**Step** বলে কয়টা করে লাফ দেবে। \`s[::2]\` মানে একটা ছেড়ে একটা। Step negative হলে Python উল্টো দিকে হাঁটে — আর start/stop না দিলে শেষ থেকে শুরু করে একদম প্রথম পর্যন্ত যায়। তাই \`s[::-1]\` মানে "পুরো string, পেছন থেকে, একটা একটা করে" — অর্থাৎ reverse।

String **immutable**, তাই slice কখনো মূল string বদলায় না — সবসময় নতুন string বানায়। \`s[0] = "J"\` লিখলে error; বদলাতে চাইলে নতুন string বানাতে হয়: \`"J" + s[1:]\`।

একটা সুবিধাজনক আচরণ: slice-এ সীমার বাইরের index দিলে error হয় না, Python চুপচাপ সীমার মধ্যে কেটে নেয়। কিন্তু সাধারণ indexing-এ (\`s[100]\`) \`IndexError\` হয়।`,
        examples: [
          {
            lang: 'python',
            code: `s = "python"
print(s[0:2], s[2:], s[-3:])
print(s[::2], s[::-1])
print(s[1:100])          # slices clip silently

try:
    s[0] = "J"
except TypeError as e:
    print("TypeError:", e)
print("J" + s[1:])`,
            output: `py thon hon
pto nohtyp
ython
TypeError: 'str' object does not support item assignment
Jython`,
          },
        ],
        pitfalls: [
          '`s[::-1]` reverses code points: combined characters (e.g. emoji with skin-tone modifiers) can come out scrambled.',
          'Slicing a huge string copies it; in tight loops prefer indexes over repeated slices.',
        ],
        followUps: [
          'Why are strings immutable in Python?',
          'How would you check if a string is a palindrome?',
        ],
      },
      related: ['py-mutable-vs-immutable', 'py-string-methods'],
    },
    {
      id: 'py-string-methods',
      level: 'foundation',
      priority: 2,
      question: 'Explain `split`, `join`, `strip` and `replace` with examples.',
      tags: ['strings', 'split', 'join', 'strip', 'replace'],
      answer: {
        interview: `**They are the core text-processing methods, and each returns a new value because strings are immutable.**

- **\`split(sep=None)\`** → list of parts. With no argument it splits on any run of whitespace and drops empty strings; with a separator it splits exactly, keeping empty parts.
- **\`sep.join(iterable)\`** → one string; it is called on the *separator*, and every item must already be a \`str\`.
- **\`strip(chars=None)\`** removes leading/trailing whitespace (or the given *set* of characters); \`lstrip\`/\`rstrip\` do one side.
- **\`replace(old, new, count=-1)\`** replaces every occurrence, or the first \`count\` of them.
- Python 3.9+ adds \`removeprefix\`/\`removesuffix\` for removing an exact substring.

Real-world: \`" ".join(text.split())\` collapses all runs of whitespace into single spaces in one line.`,
        explanationBn: `এই চারটা method প্রায় প্রতিটা text-processing কাজে লাগে, আর প্রতিটার একটা করে সূক্ষ্ম ব্যাপার আছে যেটা interview-তে জিজ্ঞেস করা হয়:

**\`split()\`** — argument না দিলে যেকোনো পরিমাণ whitespace (space, tab, newline) দিয়ে ভাগ করে আর খালি অংশ ফেলে দেয়। কিন্তু \`split(",")\`-এর মতো নির্দিষ্ট separator দিলে খালি অংশও রেখে দেয় — \`"a,,b".split(",")\` দেয় \`['a', '', 'b']\`।

**\`join()\`** — অনেকে উল্টো ভাবে: এটা list-এর method না, **separator string-এর method**। \`", ".join(items)\`। আর list-এর সব element string হতে হবে — সংখ্যা থাকলে আগে \`map(str, nums)\` করতে হয়।

**\`strip()\`** — argument-টা একটা *character-এর set*, কোনো শব্দ না। \`"www.site.com".strip("w.moc")\` ওই set-এর যেকোনো character দুই প্রান্ত থেকে সরায়। নির্দিষ্ট prefix/suffix সরাতে \`removeprefix\`/\`removesuffix\` ব্যবহার করুন।

**\`replace()\`** — default-এ সব occurrence বদলায়; তৃতীয় argument দিয়ে সংখ্যা সীমিত করা যায়।

সবগুলোই নতুন string ফেরত দেয় — \`s.strip()\` লিখে result কোথাও রাখলেন না, তাহলে কিছুই বদলাবে না। Beginner-দের খুব common bug এটা।`,
        examples: [
          {
            lang: 'python',
            code: `print("  a  b\\tc\\n".split())
print("a,,b".split(","))
print("-".join(["2024", "01", "15"]))
print(", ".join(map(str, [1, 2, 3])))
print(repr("  hi  ".strip()), "xxhixx".strip("x"))
print("aaa".replace("a", "b", 2))
print("report.csv".removesuffix(".csv"))
print(" ".join("too    many   spaces".split()))`,
            output: `['a', 'b', 'c']
['a', '', 'b']
2024-01-15
1, 2, 3
'hi' hi
bba
report
too many spaces`,
          },
        ],
        pitfalls: [
          '`strip("abc")` strips any of the characters a, b, c — it is not a substring.',
          '`s.strip()` alone does nothing useful; strings are immutable, so assign the result.',
          '`",".join([1, 2])` raises `TypeError`: join needs strings.',
        ],
        followUps: [
          'What is the difference between `split()` and `split(" ")`?',
          'Why is `join` a method on the separator?',
        ],
      },
      related: ['py-string-slicing', 'py-string-concat-performance'],
    },
    {
      id: 'py-find-vs-index',
      level: 'foundation',
      priority: 1,
      question: 'What is the difference between `str.find()` and `str.index()`?',
      tags: ['strings', 'find', 'index', 'search'],
      answer: {
        interview: `**Both return the lowest index where the substring starts. When it is not found, \`find\` returns \`-1\` and \`index\` raises \`ValueError\`.**

- \`rfind\`/\`rindex\` search from the right.
- Both accept optional \`start\` and \`end\` bounds.
- To just test presence, use \`in\`: \`"py" in text\`.
- Lists have \`index\` but no \`find\`.

Real-world: prefer \`index\` (or \`in\`) — a returned \`-1\` used as an index silently picks the **last** character, which hides bugs.`,
        explanationBn: `দুটো method একই কাজ করে — substring কোথায় শুরু হয়েছে তার index খোঁজে। পার্থক্য শুধু না পেলে কী হয়:

- \`find()\` চুপচাপ \`-1\` ফেরত দেয়।
- \`index()\` \`ValueError\` raise করে।

\`-1\`-টা বিপজ্জনক, কারণ Python-এ \`-1\` একটা বৈধ index — শেষ character। কেউ যদি \`find\`-এর result চেক না করে সরাসরি \`s[pos]\` লেখে, না পাওয়ার ক্ষেত্রে ভুলভাবে শেষ character পেয়ে যাবে, কোনো error ছাড়াই। \`index()\` সমস্যাটা সাথে সাথে ধরিয়ে দেয়।

শুধু "আছে কি নেই" জানতে চাইলে এগুলোর কোনোটাই লাগে না — \`if "py" in text:\` সবচেয়ে পরিষ্কার।`,
        examples: [
          {
            lang: 'python',
            code: `s = "hello world"
print(s.find("o"), s.rfind("o"), s.find("z"))
print(s.index("world"))
try:
    s.index("z")
except ValueError as e:
    print("ValueError:", e)
print("wor" in s)`,
            output: `4 7 -1
6
ValueError: substring not found
True`,
          },
        ],
        pitfalls: ['Using the result of `find` as an index without checking for `-1`.'],
        followUps: ['How do you count occurrences of a substring?'],
      },
    },
    {
      id: 'py-f-strings',
      level: 'foundation',
      priority: 2,
      question: 'What are f-strings, and what does `f"{x=}"` do?',
      tags: ['strings', 'f-strings', 'formatting', 'debugging'],
      answer: {
        interview: `**f-strings (Python 3.6+) are string literals prefixed with \`f\` where any expression inside \`{}\` is evaluated and formatted inline.**

- Any expression works: \`f"{price * qty}"\`, \`f"{name.upper()}"\`.
- A format spec follows a colon: \`{x:.2f}\` (2 decimals), \`{n:,}\` (thousands separator), \`{x:>10}\` (right-align), \`{n:08b}\` (binary, zero-padded).
- Conversions: \`{x!r}\` uses \`repr()\`, \`{x!s}\` uses \`str()\`.
- **\`f"{x=}"\`** (Python 3.8+) prints the expression text *and* its value — \`x=42\` — handy for debugging.
- They are the fastest and most readable of the three formatting styles (\`%\`, \`str.format\`, f-strings).

Real-world: \`print(f"{user_id=} {status=}")\` is a quick, self-labelling debug line.`,
        explanationBn: `f-string-এ string-এর সামনে \`f\` লিখলে \`{}\`-এর ভেতরে সরাসরি Python expression লেখা যায় — variable, হিসাব, function call, সব। Python runtime-এ সেটা evaluate করে string-এ বসিয়ে দেয়।

\`{}\`-এর ভেতরে colon (\`:\`)-এর পরে **format spec** দিয়ে কীভাবে দেখাবে তা ঠিক করা যায়:
- \`{pi:.2f}\` → দশমিকের পর দুই ঘর
- \`{1234567:,}\` → \`1,234,567\`
- \`{name:>10}\` → ১০ ঘরের মধ্যে ডানে align
- \`{0.25:.0%}\` → \`25%\`

**\`{x=}\`** একটা debugging-এর ছোট্ট জাদু: এটা expression-এর লেখা আর তার value দুটোই দেখায়। \`print(f"{total=}")\` লিখলে আসে \`total=150\` — আলাদা করে label লিখতে হয় না। Expression হলেও কাজ করে: \`f"{len(items)=}"\` → \`len(items)=3\`।

\`!r\` দিলে value-এর \`repr()\` দেখায় — string-এর চারপাশে quote সহ — তাই debug করার সময় বোঝা যায় শেষে কোনো বাড়তি space বা newline আছে কি না।`,
        examples: [
          {
            lang: 'python',
            code: `name, price, qty = "Tea", 2.5, 3
print(f"{name}: {price * qty:.2f}")
print(f"{1234567:,} | {0.256:.1%} | {7:08b}")
print(f"[{name:>6}] [{name:<6}] [{name:^7}]")

total = 150
items = ["a", "b", "c"]
print(f"{total=}, {len(items)=}")
print(f"{'hi '!r}")`,
            output: `Tea: 7.50
1,234,567 | 25.6% | 00000111
[   Tea] [Tea   ] [  Tea  ]
total=150, len(items)=3
'hi '`,
          },
        ],
        pitfalls: [
          'Before Python 3.12, an f-string cannot reuse its own quote type inside `{}` (`f"{d["k"]}"` is a SyntaxError there).',
          'Never build SQL queries with f-strings — use parameterised queries to avoid SQL injection.',
          'f-strings are evaluated immediately; for logging, pass arguments (`log.info("x=%s", x)`) so formatting is skipped when the level is off.',
        ],
        followUps: [
          'What are the other ways to format strings in Python?',
          'Why should logging calls not use f-strings?',
        ],
      },
      related: ['py-string-formatting-styles'],
    },
    {
      id: 'py-raw-strings',
      level: 'foundation',
      priority: 1,
      question: 'What is a raw string (`r"..."`) and when do you use one?',
      tags: ['strings', 'raw-strings', 'regex', 'escape-sequences'],
      answer: {
        interview: `**A raw string treats backslashes as literal characters instead of escape sequences.**

- \`"\\n"\` is one newline character; \`r"\\n"\` is two characters, a backslash and an \`n\`.
- Used for regular expressions (\`r"\\d+"\`) and Windows paths (\`r"C:\\new\\temp"\`).
- A raw string still cannot end with an odd number of backslashes: \`r"C:\\"\` is a syntax error.

Real-world: always write regex patterns as raw strings so \`\\b\`, \`\\d\` and friends reach the regex engine unchanged.`,
        explanationBn: `সাধারণ string-এ backslash (\`\\\`) একটা বিশেষ অর্থ বহন করে — \`\\n\` মানে newline, \`\\t\` মানে tab, \`\\b\` মানে backspace। কিন্তু regex আর Windows path-এ backslash-টাই আসল লেখার অংশ।

যেমন \`"C:\\new"\` লিখলে Python \`\\n\`-কে newline বানিয়ে ফেলে — path ভেঙে যায়। আবার regex-এ \`"\\b"\` (word boundary) লিখলে Python সেটাকে backspace character বানিয়ে দেয়, ফলে regex ভুল জিনিস খোঁজে।

\`r\` prefix দিলে Python backslash নিয়ে কোনো কারসাজি করে না — যা লেখা আছে, হুবহু তাই রাখে। তাই regex সবসময় raw string-এ লেখা ভালো অভ্যাস।`,
        examples: [
          {
            lang: 'python',
            code: `import re

print(len("\\n"), len(r"\\n"))
print(r"C:\\new\\temp")
print(re.findall(r"\\b\\w{3}\\b", "the cat sat on a mat"))`,
            output: `1 2
C:\\new\\temp
['the', 'cat', 'sat', 'mat']`,
          },
        ],
        pitfalls: ['A raw string cannot end with a single backslash.'],
        followUps: ['How would you build file paths portably? (`pathlib`)'],
      },
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'py-string-concat-performance',
      level: 'intermediate',
      priority: 2,
      question: 'Why is `"".join(parts)` preferred over `+=` for building a string in a loop?',
      tags: ['strings', 'performance', 'join', 'immutability'],
      answer: {
        interview: `**Because strings are immutable, each \`s += piece\` can create a brand-new string and copy everything so far — O(n²) work over a loop. \`"".join(parts)\` computes the final size once and copies each piece once — O(n).**

- Collect pieces in a list, then \`"".join(pieces)\` at the end.
- A generator works too: \`"".join(str(n) for n in nums)\`.
- CPython sometimes optimizes \`s += x\` in place when nothing else references \`s\`, but that is an implementation detail — other interpreters (PyPy) and slightly different code lose it.
- For a handful of concatenations, \`+\` or an f-string is perfectly fine; the issue is loops.
- \`io.StringIO\` is another option when writing text incrementally.

Real-world: building a CSV line, HTML snippet or log message in a loop — always \`join\`.`,
        explanationBn: `String immutable — তাই \`s += "x"\` আসলে "s-কে বদলাও" না, বরং "পুরনো s আর "x" মিলিয়ে **নতুন** একটা string বানাও, তারপর নামটা সেখানে সরাও"। নতুন string বানাতে পুরনো সব character কপি করতে হয়।

এখন ধরুন loop-এ ১০,০০০ বার যোগ করছেন। প্রথমবার ১টা character কপি, দ্বিতীয়বার ২টা, তৃতীয়বার ৩টা… মোট কপি হয় প্রায় n²/2 — এটাকে বলে quadratic সময়। Data বড় হলে খুব ধীর হয়ে যায়।

\`join\` ভিন্নভাবে কাজ করে: আগে সব টুকরো দেখে মোট দৈর্ঘ্য হিসাব করে, একবারেই সেই size-এর memory নেয়, তারপর প্রতিটা টুকরো ঠিক একবার কপি করে। মোট কাজ linear — O(n)।

Analogy: \`+=\` মানে প্রতিবার নতুন একটা লাইন যোগ করতে গিয়ে পুরো চিঠিটা নতুন কাগজে আবার লেখা। \`join\` মানে সব লাইন আলাদা চিরকুটে লিখে রাখা, শেষে একবারে একটা কাগজে সাজিয়ে লেখা।

CPython কখনো কখনো \`+=\`-কে চালাকি করে দ্রুত করে ফেলে, তাই ছোট test-এ পার্থক্য চোখে নাও পড়তে পারে — কিন্তু এর ওপর ভরসা করা উচিত না।`,
        examples: [
          {
            lang: 'python',
            code: `nums = range(5)

# Slow pattern in a long loop: each += may copy the whole string
s = ""
for n in nums:
    s += str(n) + ","
print(s)

# Idiomatic: collect, then join once
print(",".join(str(n) for n in nums))`,
            output: `0,1,2,3,4,
0,1,2,3,4`,
          },
        ],
        pitfalls: [
          'A micro-benchmark in CPython may not show the difference because of its in-place `+=` optimization — it still matters in general.',
          '`join` needs every item to be a `str`.',
        ],
        followUps: ['What is `io.StringIO` used for?', 'Why are Python strings immutable?'],
      },
      related: ['py-string-methods', 'py-string-plus-equals-optimization'],
    },
    {
      id: 'py-str-vs-bytes',
      level: 'intermediate',
      priority: 2,
      question:
        'What is the difference between `str` and `bytes`, and how do `encode` and `decode` work?',
      tags: ['strings', 'bytes', 'unicode', 'utf-8', 'encoding'],
      answer: {
        interview: `**\`str\` is a sequence of Unicode characters (text); \`bytes\` is a sequence of integers 0–255 (raw binary data). Encoding turns text into bytes; decoding turns bytes back into text.**

- \`"café".encode("utf-8")\` → \`b'caf\\xc3\\xa9'\` — 5 bytes for 4 characters, because UTF-8 uses 1–4 bytes per character.
- \`b"..." .decode("utf-8")\` reverses it; decoding with the wrong encoding raises \`UnicodeDecodeError\` or produces garbage.
- Python 3 never mixes them implicitly: \`"a" + b"a"\` is a \`TypeError\`.
- Files opened in text mode (\`"r"\`) decode for you; binary mode (\`"rb"\`) gives bytes. Always pass \`encoding="utf-8"\` explicitly.
- Rule of thumb: decode at the input boundary, work with \`str\` inside, encode at the output boundary.

Real-world: network sockets, HTTP bodies, images and hashing (\`hashlib\`) all work on bytes.`,
        explanationBn: `কম্পিউটার আসলে শুধু byte বোঝে (0 থেকে 255 পর্যন্ত সংখ্যা)। "লেখা" (text) একটা মানুষের ধারণা — কোন byte কোন অক্ষর বোঝাবে, সেই নিয়মকে বলে **encoding**। সবচেয়ে প্রচলিত encoding হলো **UTF-8**।

Python 3-এ দুটো একদম আলাদা type:
- **\`str\`** — Unicode character-এর sequence। "আমি", "café", "😀" — সব এক রকম ভাবে ধরা যায়।
- **\`bytes\`** — কাঁচা byte-এর sequence। File, network বা image-এর ভেতরের আসল data।

**\`encode\`**: text → bytes। **\`decode\`**: bytes → text। UTF-8-এ ইংরেজি অক্ষর ১ byte নেয়, কিন্তু \`é\` নেয় ২ byte, বাংলা অক্ষর ৩ byte, emoji ৪ byte। তাই \`len("café")\` হলো 4, কিন্তু encode করার পর \`len\` হয় 5।

ভুল encoding দিয়ে decode করলে হয় error, নয়তো অদ্ভুত অক্ষর (যেমন \`cafÃ©\`) — এটাকে বলে "mojibake"।

সবচেয়ে ভালো নিয়ম, যাকে "Unicode sandwich" বলে: বাইরে থেকে data ঢোকার মুহূর্তেই decode করুন, program-এর ভেতরে সব কাজ \`str\` দিয়ে করুন, আর বাইরে পাঠানোর মুহূর্তে encode করুন। আর file খোলার সময় সবসময় \`encoding="utf-8"\` লিখুন — না লিখলে Windows-এ অন্য encoding ধরে নিতে পারে।`,
        examples: [
          {
            lang: 'python',
            code: `text = "café"
data = text.encode("utf-8")
print(len(text), len(data), data)
print(data.decode("utf-8"))
print(data.decode("latin-1"))     # wrong encoding: mojibake
print(len("আমি".encode("utf-8")))

try:
    "a" + b"a"
except TypeError as e:
    print("TypeError:", e)`,
            output: `4 5 b'caf\\xc3\\xa9'
café
cafÃ©
9
TypeError: can only concatenate str (not "bytes") to str`,
          },
        ],
        pitfalls: [
          'Opening files without `encoding=` uses the platform default, which differs between Windows and Linux.',
          '`len(s)` counts characters, not bytes — storage limits are usually in bytes.',
        ],
        followUps: [
          'What is UTF-8, and why is it the default choice?',
          'What does `errors="replace"` do in `decode`?',
        ],
      },
    },
    {
      id: 'py-string-formatting-styles',
      level: 'intermediate',
      priority: 1,
      question: 'Compare `%` formatting, `str.format()` and f-strings.',
      tags: ['strings', 'formatting', 'f-strings', 'logging'],
      answer: {
        interview: `**All three produce formatted strings; f-strings are the modern default, \`str.format\` is for templates decided at runtime, and \`%\` survives mainly in logging.**

- \`"%s is %d" % (name, age)\` — oldest, C-style, easy to get wrong with tuples.
- \`"{} is {}".format(name, age)\` — works with a template stored in a variable or config file, supports named fields \`{name}\`.
- \`f"{name} is {age}"\` — most readable and fastest, but the template must be a literal in the code.
- The \`logging\` module uses \`%\`-style lazily: \`log.info("user %s", uid)\` only formats if the message is actually emitted.

Real-world: f-strings in code, \`.format\` for user-editable templates, \`%\` arguments in log calls.`,
        explanationBn: `তিনটা পদ্ধতিই একই ফল দেয়, কিন্তু কোনটা কখন ভালো সেটাই প্রশ্নের আসল উদ্দেশ্য।

- **\`%\` formatting:** C language থেকে আসা, সবচেয়ে পুরনো। এখন প্রধানত logging-এ দেখা যায়।
- **\`str.format()\`:** template আর value আলাদা থাকে। তাই template যদি আগে থেকে জানা না থাকে — যেমন database বা config file থেকে আসে — তখন এটা লাগে: \`template.format(name="Rafi")\`।
- **f-string:** সবচেয়ে পরিষ্কার আর দ্রুত, কিন্তু template-টা code-এর মধ্যেই লিখতে হয়।

Logging-এ কেন f-string না? \`log.debug(f"data={big_obj}")\` লিখলে debug level বন্ধ থাকলেও string-টা আগে তৈরি হয়ে যায় — অযথা খরচ। \`log.debug("data=%s", big_obj)\` লিখলে logging module শুধু দরকার হলেই format করে।`,
        examples: [
          {
            lang: 'python',
            code: `name, age = "Rafi", 30
print("%s is %d" % (name, age))
print("{} is {}".format(name, age))
print(f"{name} is {age}")

template = "Hello, {user}! You have {n} new messages."
print(template.format(user=name, n=3))`,
            output: `Rafi is 30
Rafi is 30
Rafi is 30
Hello, Rafi! You have 3 new messages.`,
          },
        ],
        followUps: ['Why should logging calls pass arguments instead of an f-string?'],
      },
      related: ['py-f-strings'],
    },
    {
      id: 'py-string-checks',
      level: 'intermediate',
      priority: 1,
      question:
        'How do you check what a string contains — digits, letters, a prefix — and compare strings case-insensitively?',
      tags: ['strings', 'validation', 'casefold', 'startswith'],
      answer: {
        interview: `**Use the \`is…\` predicates for character classes, \`startswith\`/\`endswith\` for prefixes, and \`casefold()\` for case-insensitive comparison.**

- \`isdigit()\`, \`isalpha()\`, \`isalnum()\`, \`isspace()\`, \`isupper()\` — all return \`False\` for an empty string.
- \`startswith\`/\`endswith\` accept a tuple: \`name.endswith((".jpg", ".png"))\`.
- \`casefold()\` is a stronger \`lower()\` for comparisons (German \`ß\` → \`ss\`).
- \`isdigit()\` accepts characters like \`"²"\`; to check "can this be parsed as an int?", try \`int(s)\` and catch \`ValueError\`.

Real-world: \`filename.lower().endswith((".jpg", ".jpeg", ".png"))\` for a simple file-type check.`,
        explanationBn: `String validation-এর জন্য Python অনেক ready-made method দেয়, কিন্তু কয়েকটা ফাঁদ আছে:

- সব \`is…\` method খালি string-এর জন্য \`False\` দেয় — \`"".isdigit()\` হলো \`False\`।
- \`isdigit()\` শুধু 0–9 না, আরও কিছু Unicode digit (যেমন superscript \`²\`) মেনে নেয়। তাই "এটা কি সংখ্যায় রূপান্তর করা যাবে?" জানতে সবচেয়ে নির্ভরযোগ্য উপায় হলো সরাসরি \`int(s)\` চেষ্টা করে \`ValueError\` ধরা — এটা EAFP style।
- \`startswith\`/\`endswith\`-এ একাধিক option একটা tuple হিসেবে দেওয়া যায়।

Case ছাড়া তুলনায় \`lower()\` প্রায়ই কাজ করে, কিন্তু সব ভাষায় না। \`casefold()\` আরও কড়াভাবে normalize করে — যেমন জার্মান \`ß\`-কে \`ss\` বানায় — তাই তুলনার জন্য এটাই সঠিক।`,
        examples: [
          {
            lang: 'python',
            code: `print("123".isdigit(), "12.5".isdigit(), "".isdigit(), "²".isdigit())
print("abc1".isalnum(), "abc 1".isalnum())
print("photo.PNG".lower().endswith((".jpg", ".png")))
print("Straße".lower() == "STRASSE".lower())
print("Straße".casefold() == "STRASSE".casefold())`,
            output: `True False False True
True False
True
False
True`,
          },
        ],
        followUps: ['What is EAFP, and how does it apply to parsing numbers?'],
      },
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'py-string-plus-equals-optimization',
      level: 'advanced',
      priority: 1,
      question: 'If strings are immutable, why can `s += x` in a loop be fast in CPython?',
      tags: ['strings', 'cpython', 'performance', 'reference-counting'],
      answer: {
        interview: `**CPython has a special case: if the string on the left has a reference count of exactly one (only \`s\` points to it), it can resize that string's memory in place instead of creating a new one.**

- That is safe because nobody else can observe the "mutation".
- It breaks as soon as another reference exists (\`t = s\` inside the loop, or the string is in a list), and quadratic behaviour returns.
- It is a CPython implementation detail — PyPy and other interpreters do not promise it, and the language guide (PEP 8) says not to rely on it.
- Python strings also use a compact internal layout (PEP 393): 1, 2 or 4 bytes per character depending on the widest character in the string.

Real-world: this is why a quick benchmark can "prove" \`+=\` is fine — and why \`join\` is still the correct answer.`,
        explanationBn: `এটা একটা "senior-level" follow-up প্রশ্ন। আগের উত্তরে বলেছি \`+=\` প্রতিবার নতুন string বানায় — তাহলে CPython-এ মাঝে মাঝে কেন দ্রুত চলে?

কারণ CPython একটা চালাকি করে। প্রতিটা object-এর একটা **reference count** থাকে — কয়টা নাম/জায়গা এটাকে point করছে। \`s += x\` করার সময় CPython দেখে: "এই string-কে কি শুধু \`s\`-ই ধরে আছে (count = 1)?" যদি তাই হয়, তাহলে পুরনো string-এ আর কেউ তাকিয়ে নেই — সেটাকে সরাসরি বড় করে নতুন অংশ যোগ করে দিলে কেউ টেরও পাবে না। তাই নতুন string বানানো ও কপি করার খরচ বাঁচে।

কিন্তু loop-এর মধ্যে কোথাও \`t = s\` লিখলেই count হয়ে যায় 2 — তখন in-place বদলানো নিরাপদ না, তাই আবার পুরো কপি শুরু হয়। আর PyPy-র মতো অন্য interpreter-এ এই optimization নেই-ই।

তাই interview-তে বলার মতো সারকথা: "CPython-এ refcount 1 হলে in-place resize হয়, কিন্তু এটা implementation detail — portable আর নিশ্চিত দ্রুত code-এর জন্য \`join\` ব্যবহার করি।"`,
        examples: [
          {
            lang: 'python',
            caption:
              'PEP 393: each string uses the narrowest width (1, 2 or 4 bytes per character) that fits',
            code: `import sys

def bytes_per_char(ch):
    # memory growth per extra character, independent of the header size
    return (sys.getsizeof(ch * 200) - sys.getsizeof(ch * 100)) // 100

print(bytes_per_char("a"), bytes_per_char("অ"), bytes_per_char("😀"))`,
            output: `1 2 4`,
          },
        ],
        pitfalls: [
          'Benchmarks that show `+=` is fast in CPython do not prove it is fast in general.',
        ],
        followUps: ['What is reference counting?'],
      },
      related: ['py-string-concat-performance'],
    },
  ],
});

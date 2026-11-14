import { defineSection } from '../../define';

export const advanced = defineSection({
  id: 'py-advanced',
  title: 'Advanced (Common in Interviews)',
  description:
    'The GIL and the three concurrency models, asyncio, memory management, type hints, and the standard-library tools every Python developer is expected to know.',
  order: 7,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'py-cpu-vs-io-bound',
      level: 'foundation',
      priority: 2,
      question: 'What is the difference between CPU-bound and I/O-bound work?',
      tags: ['concurrency', 'performance', 'cpu-bound', 'io-bound'],
      answer: {
        interview: `**CPU-bound work is limited by computation speed (the processor is busy the whole time); I/O-bound work spends most of its time waiting for something external — network, disk, a database.**

- CPU-bound examples: image processing, number crunching, parsing huge files, ML feature engineering in pure Python.
- I/O-bound examples: HTTP calls, database queries, reading files, waiting on a message queue.
- The distinction decides the concurrency tool: I/O-bound → \`threading\` or \`asyncio\` (overlap the waiting); CPU-bound → \`multiprocessing\` or native code (NumPy, C extensions) to use several cores.
- Measure before deciding — a "slow" function may be waiting on I/O, not computing.

Real-world: a scraper downloading 1,000 pages is I/O-bound (use async/threads); resizing 1,000 images is CPU-bound (use processes).`,
        explanationBn: `কোনো কাজ ধীর কেন — সেটা বোঝা concurrency বেছে নেওয়ার প্রথম ধাপ।

**CPU-bound:** কাজটা ধীর কারণ CPU-কে প্রচুর হিসাব করতে হচ্ছে। Processor পুরো সময় ব্যস্ত। যেমন বড় সংখ্যার হিসাব, image filter, বিশাল data parse করা। দ্রুত করার উপায়: একাধিক CPU core একসাথে কাজে লাগানো।

**I/O-bound:** কাজটা ধীর কারণ বাইরের কিছুর জন্য **অপেক্ষা** করতে হচ্ছে — network-এর response, disk থেকে data, database query। এই সময় CPU আসলে বসে থাকে। দ্রুত করার উপায়: অপেক্ষার সময়গুলো একসাথে ঘটানো (overlap) — একটার response-এর অপেক্ষার মধ্যেই আরেকটা request পাঠানো।

Analogy: রেস্টুরেন্টের রাঁধুনি। সবজি কাটা CPU-bound — হাত যত দ্রুত, কাজ তত দ্রুত; আরও রাঁধুনি (core) লাগবে। আর ভাত সেদ্ধ হওয়ার অপেক্ষা I/O-bound — চুলায় বসিয়ে দিয়ে সেই সময়ে অন্য কাজ করা যায়, একজন রাঁধুনিই অনেকগুলো পাতিল সামলাতে পারে।

Python-এ এই পার্থক্য খুব গুরুত্বপূর্ণ, কারণ GIL-এর জন্য thread CPU-bound কাজে কোনো সাহায্য করে না, কিন্তু I/O-bound কাজে খুব কাজের।`,
        examples: [
          {
            lang: 'python',
            caption: 'Waiting overlaps well with threads; a CPU-bound loop would not',
            code: `import time
from concurrent.futures import ThreadPoolExecutor

def fake_request(n):
    time.sleep(0.2)           # I/O-bound: the thread just waits
    return n * 10

start = time.perf_counter()
with ThreadPoolExecutor(max_workers=5) as pool:
    results = list(pool.map(fake_request, range(5)))
elapsed = time.perf_counter() - start
print(results)
print(f"5 waits of 0.2s took about {elapsed:.1f}s")`,
            output: `[0, 10, 20, 30, 40]
5 waits of 0.2s took about 0.2s`,
          },
        ],
        followUps: [
          'Which concurrency model fits each kind of work?',
          'Why do threads not speed up CPU-bound Python code?',
        ],
      },
      related: ['py-threading-multiprocessing-asyncio', 'py-gil'],
    },
    {
      id: 'py-collections-module',
      level: 'foundation',
      priority: 2,
      question: 'What are `Counter`, `defaultdict`, `deque` and `namedtuple` from `collections`?',
      tags: ['collections', 'counter', 'defaultdict', 'deque', 'namedtuple'],
      answer: {
        interview: `**They are specialised containers that replace common hand-written patterns.**

- **\`Counter\`** — a dict that counts hashable items: \`Counter(words).most_common(3)\`; supports \`+\`, \`-\`, \`&\`, \`|\`.
- **\`defaultdict(factory)\`** — creates a default value for a missing key on first access: \`defaultdict(list)\` for grouping, \`defaultdict(int)\` for counting.
- **\`deque\`** — a double-ended queue with O(1) \`append\`/\`appendleft\`/\`pop\`/\`popleft\`; \`deque(maxlen=n)\` keeps only the last n items. Use it for queues and BFS instead of \`list.pop(0)\`.
- **\`namedtuple\`** — an immutable tuple with named fields: \`Point = namedtuple("Point", "x y")\`, then \`p.x\`. \`typing.NamedTuple\` is the class-syntax version with type hints.
- Also: \`OrderedDict\` (\`move_to_end\`), \`ChainMap\`.

Real-world: word frequencies with \`Counter\`, grouping orders by customer with \`defaultdict(list)\`, a sliding window of recent events with \`deque(maxlen=100)\`.`,
        explanationBn: `\`collections\` module-এ কয়েকটা "বিশেষ dict/list" আছে, যেগুলো খুব common কিছু কাজ এক লাইনে করে দেয়। Interview-তে এগুলো ব্যবহার করলে code পরিষ্কার হয়, আর বোঝা যায় আপনি standard library ভালো জানেন।

**\`Counter\`** — গণনার জন্য। কোনো iterable দিলে প্রতিটা item কতবার আছে তা গুনে দেয়। \`most_common(n)\` দিয়ে সবচেয়ে বেশিবার আসা n-টা পাওয়া যায়। Anagram চেক করা, word frequency — সবখানে কাজের।

**\`defaultdict\`** — সাধারণ dict-এ নেই এমন key পড়লে \`KeyError\`। \`defaultdict(list)\`-এ নেই এমন key পড়লে সে নিজেই একটা খালি list বানিয়ে বসিয়ে দেয়। তাই grouping-এ \`if key not in d: d[key] = []\` লেখার ঝামেলা থাকে না।

**\`deque\`** ("ডেক" উচ্চারণ) — দুই দিকেই দ্রুত যোগ-বাদ। List-এ সামনে থেকে \`pop(0)\` O(n), কারণ বাকি সবাইকে সরাতে হয়। \`deque\`-এ \`popleft()\` O(1)। তাই queue বা BFS-এ সবসময় \`deque\`। আর \`maxlen\` দিলে পুরনোগুলো নিজে থেকেই বাদ পড়ে — "শেষ ১০০টা event" রাখার জন্য দারুণ।

**\`namedtuple\`** — tuple-এর মতো হালকা আর immutable, কিন্তু index-এর বদলে নাম দিয়ে পড়া যায়: \`p[0]\`-এর বদলে \`p.x\`। Code পড়তে অনেক সহজ।`,
        examples: [
          {
            lang: 'python',
            code: `from collections import Counter, defaultdict, deque, namedtuple

words = "the cat and the hat and the bat".split()
counts = Counter(words)
print(counts.most_common(2), counts["dog"])

orders = [("rafi", 120), ("nadia", 80), ("rafi", 45)]
by_customer = defaultdict(list)
for name, amount in orders:
    by_customer[name].append(amount)
print(dict(by_customer))

recent = deque(maxlen=3)
for event in ["a", "b", "c", "d"]:
    recent.append(event)
recent.appendleft("z")          # full: drops "d" from the right
print(recent)
print(recent.popleft(), recent)

Point = namedtuple("Point", "x y")
p = Point(3, 4)
print(p, p.x, p._asdict())`,
            output: `[('the', 3), ('and', 2)] 0
{'rafi': [120, 45], 'nadia': [80]}
deque(['z', 'b', 'c'], maxlen=3)
z deque(['b', 'c'], maxlen=3)
Point(x=3, y=4) 3 {'x': 3, 'y': 4}`,
          },
        ],
        pitfalls: [
          'Merely *reading* a missing key from a `defaultdict` inserts it.',
          '`Counter` returns `0` for missing items instead of raising `KeyError`.',
          '`appendleft` on a full `deque(maxlen=...)` drops an item from the right end.',
        ],
        followUps: [
          'How would you find the top 3 most frequent words?',
          'Why use `deque` for BFS instead of a list?',
          '`namedtuple` vs `dataclass` — when to use each?',
        ],
      },
      related: ['py-dict-get-vs-brackets', 'py-itertools'],
    },
    {
      id: 'py-type-hints-basics',
      level: 'foundation',
      priority: 2,
      question: 'What are type hints in Python, and are they enforced at runtime?',
      tags: ['typing', 'type-hints', 'mypy', 'optional'],
      answer: {
        interview: `**Type hints are optional annotations that describe expected types: \`def total(prices: list[float]) -> float\`. They are not enforced at runtime — Python ignores them when running the code; tools like mypy, pyright and IDEs use them.**

- Built-in generics (3.9+): \`list[int]\`, \`dict[str, int]\`, \`tuple[int, str]\`.
- Unions (3.10+): \`int | None\`; the older spellings are \`Optional[int]\` and \`Union[int, str]\`.
- \`Optional[X]\` means "X or None" — not "this argument is optional".
- Annotations are stored in \`__annotations__\`; libraries such as Pydantic, FastAPI and dataclasses read them.
- Benefits: early error detection, better autocomplete and refactoring, self-documenting signatures.

Real-world: FastAPI uses the hints on an endpoint to validate requests and generate API docs.`,
        explanationBn: `Type hint হলো code-এ লেখা একটা "নোট" — কোন variable বা parameter-এ কোন ধরনের value আশা করা হচ্ছে:
\`\`\`python
def greet(name: str, times: int = 1) -> str:
\`\`\`

**সবচেয়ে গুরুত্বপূর্ণ কথা: Python runtime-এ এগুলো চেক করে না।** \`greet(42, "x")\` দিব্যি চলবে (বা ভেতরে গিয়ে অন্য কারণে ভাঙবে), hint-এর কারণে কোনো error হবে না।

তাহলে লাভ কী?
- **Static checker** (mypy, pyright) code না চালিয়েই ভুল ধরে — যেমন \`str\`-এর জায়গায় \`int\` পাঠানো।
- **IDE** সঠিক autocomplete দেয়, rename নিরাপদে করে।
- **Documentation** — signature দেখেই বোঝা যায় কী দিতে হবে, কী ফেরত আসবে।
- কিছু library hint **পড়ে** নিজেই runtime validation করে — Pydantic, FastAPI। কিন্তু সেটা ওই library-র কাজ, Python-এর না।

আধুনিক syntax মনে রাখুন: \`list[int]\` (3.9+), আর \`int | None\` (3.10+)। পুরনো code-এ \`List[int]\` আর \`Optional[int]\` দেখবেন।

ছোট একটা ফাঁদ: \`Optional[int]\` মানে "int অথবা None" — "argument দেওয়া ঐচ্ছিক" না। Argument ঐচ্ছিক হয় default value দিলে।`,
        examples: [
          {
            lang: 'python',
            code: `def average(scores: list[float], default: float | None = None) -> float | None:
    if not scores:
        return default
    return sum(scores) / len(scores)

print(average([80, 90, 100]))
print(average([], default=0.0))
print(average("abc" and []))          # wrong type, but hints are not enforced
print(average.__annotations__["scores"], average.__annotations__["return"])`,
            output: `90.0
0.0
None
list[float] float | None`,
          },
        ],
        pitfalls: [
          'Hints do not validate data — use Pydantic or explicit checks at boundaries.',
          '`Optional[int]` does not make a parameter optional; a default value does.',
        ],
        followUps: [
          'What is the difference between `Optional[int]` and `int | None`?',
          'What are `TypeVar` and `Protocol` used for?',
        ],
      },
      related: ['py-dynamic-vs-strong-typing', 'py-typing-generics-protocol'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'py-gil',
      level: 'intermediate',
      priority: 3,
      question: 'What is the GIL, and how does it affect multithreading in Python?',
      tags: ['gil', 'threading', 'concurrency', 'cpython', 'performance'],
      answer: {
        interview: `**The Global Interpreter Lock is a mutex in CPython that allows only one thread at a time to execute Python bytecode. Threads still exist and switch, but they cannot run Python code in parallel on multiple cores.**

- **Why it exists:** CPython's memory management uses reference counting; the GIL makes those updates thread-safe without fine-grained locks, and keeps single-threaded code and C extensions simple and fast.
- **CPU-bound** pure-Python code gets **no speed-up** from threads — often a slowdown from switching.
- **I/O-bound** code still benefits: a thread releases the GIL while blocked on I/O (and many C libraries release it during heavy work, e.g. NumPy, hashlib, compression).
- For CPU parallelism use \`multiprocessing\` / \`ProcessPoolExecutor\` (one GIL per process) or native extensions.
- The GIL does **not** make your code thread-safe: \`counter += 1\` is several bytecodes, and a thread can be switched out between them.
- **Free-threaded Python:** 3.13 ships an optional build without the GIL (PEP 703), officially supported from 3.14 — still opt-in, with some single-thread cost.

Real-world: a web scraper with 20 threads is fine; a thread pool to speed up a pure-Python number cruncher is not.`,
        explanationBn: `**GIL (Global Interpreter Lock)** হলো CPython-এর ভেতরের একটা তালা (lock)। নিয়ম একটাই: **যে thread-এর হাতে GIL, শুধু সে-ই Python bytecode চালাতে পারে।** বাকিরা অপেক্ষা করে। অর্থাৎ ৮-core CPU থাকলেও, এক process-এর Python thread গুলো একই মুহূর্তে একটার বেশি Python code চালায় না — পালা করে চালায়।

**কেন এমন ব্যবস্থা?** CPython memory সামলায় reference counting দিয়ে — প্রতিটা object-এর একটা counter, কতজন তাকে ব্যবহার করছে। দুটো thread একসাথে একই counter বদলালে সংখ্যা ভুল হয়ে memory corruption হতে পারে। প্রতিটা object-এ আলাদা lock দেওয়ার বদলে পুরো interpreter-এ একটা বড় lock দেওয়া সহজ আর single-thread program-এর জন্য দ্রুত। অনেক C extension-ও এই নিশ্চয়তার ওপর নির্ভর করে লেখা।

**প্রভাব:**
- **CPU-bound কাজে thread অকেজো।** চারটা thread চারটা হিসাব একসাথে করবে ভাবলেন, কিন্তু তারা পালা করে GIL নেয় — মোট সময় প্রায় একই, বরং switching-এর খরচে একটু বেশি।
- **I/O-bound কাজে thread দারুণ কাজের।** Thread যখন network বা disk-এর জন্য অপেক্ষা করে, তখন GIL ছেড়ে দেয়। ফলে অন্য thread চলতে পারে, আর অপেক্ষার সময়গুলো একসাথে কাটে।

**CPU-bound কাজ দ্রুত করার উপায়:** \`multiprocessing\` — প্রতিটা process-এর নিজস্ব interpreter আর নিজস্ব GIL, তাই সত্যিকারের parallel। অথবা NumPy-র মতো library, যেগুলো ভারী কাজের সময় GIL ছেড়ে দেয়।

**একটা ভুল ধারণা:** "GIL আছে তাই আমার code thread-safe" — না! \`count += 1\` আসলে কয়েকটা bytecode (পড়ো, যোগ করো, লেখো), আর মাঝখানে thread বদলে যেতে পারে। Shared data-য় এখনো \`Lock\` লাগে।

**ভবিষ্যৎ:** Python 3.13-এ GIL ছাড়া একটা experimental build এসেছে (free-threaded), 3.14 থেকে সেটা officially supported, তবে এখনো ঐচ্ছিক।`,
        examples: [
          {
            lang: 'python',
            caption: 'The GIL does not make shared updates safe — use a Lock',
            code: `import threading

counter = 0
lock = threading.Lock()

def work():
    global counter
    for _ in range(100_000):
        with lock:              # without the lock, updates can be lost
            counter += 1

threads = [threading.Thread(target=work) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(counter)`,
            output: `400000`,
          },
          {
            lang: 'python',
            caption:
              'counter += 1 is several bytecode steps, so a thread switch can land in between',
            code: `import dis

def bump():
    global counter
    counter += 1

ops = [i.opname for i in dis.get_instructions(bump)]
print("LOAD_GLOBAL" in ops, "STORE_GLOBAL" in ops)`,
            output: `True True`,
          },
        ],
        pitfalls: [
          'Assuming the GIL makes code thread-safe — compound operations still race.',
          'Using threads to speed up pure-Python CPU work usually makes it slower.',
          'The GIL is a CPython detail; Jython and IronPython never had one, and PyPy still does.',
        ],
        followUps: [
          'When would you use threads, processes or asyncio?',
          'Why does CPython have a GIL at all?',
          'What is free-threaded Python?',
        ],
      },
      visualizationId: 'py-gil-concurrency',
      related: [
        'py-threading-multiprocessing-asyncio',
        'py-cpu-vs-io-bound',
        'py-memory-management',
      ],
    },
    {
      id: 'py-threading-multiprocessing-asyncio',
      level: 'intermediate',
      priority: 3,
      question: 'Threading vs multiprocessing vs asyncio — when do you use which?',
      tags: ['concurrency', 'threading', 'multiprocessing', 'asyncio', 'architecture'],
      answer: {
        interview: `**Use asyncio or threads for I/O-bound work, and multiprocessing for CPU-bound work.**

| | threading | multiprocessing | asyncio |
|---|---|---|---|
| Runs on | threads in one process | separate processes | one thread, event loop |
| Parallel CPU? | no (GIL) | yes | no |
| Best for | I/O, blocking libraries | CPU-heavy work | lots of concurrent I/O |
| Switching | preemptive (OS) | separate processes | cooperative (at \`await\`) |
| Shared state | shared memory (needs locks) | separate memory (pickling) | shared, rarely needs locks |
| Cost | ~MB per thread | heavy start-up and memory | very light tasks |

- **asyncio** shines with thousands of connections (web servers, crawlers, chat) — but every library in the path must be async; one blocking call stalls everything.
- **Threads** are the easy choice for a moderate amount of I/O with ordinary blocking libraries (\`requests\`, database drivers).
- **Processes** bypass the GIL; arguments and results must be picklable, and start-up is slow.
- \`concurrent.futures\` gives one API (\`ThreadPoolExecutor\` / \`ProcessPoolExecutor\`) for both.

Real-world: FastAPI endpoint (asyncio) → offloads image resizing to a process pool → calls a sync SDK with \`asyncio.to_thread\`.`,
        explanationBn: `এটা Python interview-এর একটা "classic" প্রশ্ন — উত্তরটা একটা সিদ্ধান্ত নেওয়ার কাঠামো হিসেবে বলুন:

**প্রথম প্রশ্ন: কাজটা CPU-bound নাকি I/O-bound?**
- CPU-bound → **multiprocessing**। আর কিছু GIL পেরোতে পারে না।
- I/O-bound → **threading** বা **asyncio**।

**I/O-bound হলে দ্বিতীয় প্রশ্ন: কতগুলো কাজ, আর library গুলো কেমন?**
- কয়েক ডজন কাজ, আর সাধারণ (blocking) library যেমন \`requests\` → **threading**। সহজ, পুরনো code না বদলেই চলে।
- হাজার হাজার connection → **asyncio**। একটা thread-ই হাজারো task সামলায়, কারণ task খুব হালকা।

**তিনটার মূল পার্থক্য:**

*Threading* — OS নিজে ঠিক করে কখন কোন thread চলবে (preemptive)। Memory share হয়, তাই shared data-য় lock লাগে। GIL-এর জন্য CPU-তে parallel না।

*Multiprocessing* — সম্পূর্ণ আলাদা process, আলাদা memory, আলাদা GIL। সত্যিকারের parallel। খরচ: process শুরু হতে সময় লাগে, memory বেশি লাগে, আর data পাঠাতে pickle করতে হয়।

*Asyncio* — একটা thread, একটা event loop। Task গুলো **নিজে থেকে** control ছেড়ে দেয় \`await\`-এ (cooperative)। খুব হালকা আর efficient। কিন্তু ফাঁদ হলো: কোনো task যদি \`time.sleep()\` বা blocking library call করে, পুরো loop আটকে যায় — সব task থেমে থাকে। তাই সব library async হতে হবে (\`httpx\`, \`asyncpg\`)।

Analogy: Threading = একটা রান্নাঘরে কয়েকজন রাঁধুনি, কিন্তু চাকু একটাই (GIL)। Multiprocessing = আলাদা আলাদা রান্নাঘর। Asyncio = একজন দক্ষ রাঁধুনি, যিনি একটা পাতিল চুলায় বসিয়ে অপেক্ষা না করে পরেরটায় যান।`,
        examples: [
          {
            lang: 'python',
            caption: 'One API for both pools: concurrent.futures',
            code: `from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

def cpu_task(n):                 # CPU-bound: run in processes
    return sum(i * i for i in range(n))

def io_task(name):               # I/O-bound stand-in: run in threads
    return f"fetched {name}"

if __name__ == "__main__":       # required for process pools on Windows/macOS
    with ProcessPoolExecutor() as pool:
        print(list(pool.map(cpu_task, [10, 100, 1000])))
    with ThreadPoolExecutor(max_workers=3) as pool:
        print(list(pool.map(io_task, ["a", "b", "c"])))`,
            output: `[285, 328350, 332833500]
['fetched a', 'fetched b', 'fetched c']`,
          },
          {
            lang: 'python',
            caption: 'asyncio: three 0.2 s waits overlap on a single thread',
            code: `import asyncio, time

async def fetch(name, delay):
    await asyncio.sleep(delay)           # non-blocking wait
    return f"{name} done"

async def main():
    start = time.perf_counter()
    results = await asyncio.gather(fetch("a", 0.2), fetch("b", 0.2), fetch("c", 0.2))
    print(results, f"{time.perf_counter() - start:.1f}s")

asyncio.run(main())`,
            output: `['a done', 'b done', 'c done'] 0.2s`,
          },
        ],
        pitfalls: [
          'Calling blocking code (`time.sleep`, `requests.get`) inside a coroutine freezes every task on the loop.',
          'Process pools need picklable functions and arguments — lambdas and local functions fail.',
          'Forgetting the `if __name__ == "__main__":` guard breaks multiprocessing on Windows.',
        ],
        followUps: [
          'What happens if you call a blocking function inside async code?',
          'How do processes share data?',
          'What is the event loop?',
        ],
      },
      visualizationId: 'py-gil-concurrency',
      related: ['py-gil', 'py-async-await', 'py-blocking-in-async'],
    },
    {
      id: 'py-async-await',
      level: 'intermediate',
      priority: 2,
      question: 'What are `async`, `await`, coroutines and the event loop?',
      tags: ['asyncio', 'async-await', 'coroutines', 'event-loop'],
      answer: {
        interview: `**\`async def\` defines a coroutine function; calling it returns a coroutine object that does nothing until awaited. \`await\` pauses the current coroutine until the awaited thing finishes, handing control back to the event loop. The event loop runs many coroutines on one thread, resuming each when what it waits for is ready.**

- \`asyncio.run(main())\` starts the loop and runs the top-level coroutine.
- Calling a coroutine without \`await\` does nothing (and triggers a "never awaited" warning).
- Concurrency comes from **tasks**: \`asyncio.create_task(coro)\` or \`asyncio.gather(...)\` — plain sequential \`await\`s run one after another.
- \`await\` only works inside \`async def\`; switches happen *only* at \`await\` points (cooperative multitasking).
- \`async with\` and \`async for\` are the async versions of context managers and iteration.

Real-world: an async HTTP server handles thousands of open connections on one thread because each request spends most of its time awaiting I/O.`,
        explanationBn: `**Coroutine** হলো এমন একটা function, যেটা মাঝপথে থেমে আবার শুরু করতে পারে — অনেকটা generator-এর মতো। \`async def\` দিয়ে লেখা হয়।

**\`await\`** মানে: "এই কাজটা শেষ হওয়া পর্যন্ত আমি অপেক্ষা করছি — এর মধ্যে event loop অন্য কাউকে চালাক।" Coroutine তখন pause হয়, আর control ফিরে যায় **event loop**-এর কাছে।

**Event loop** হলো একজন ব্যবস্থাপক, যে একটা thread-এ বসে অনেকগুলো coroutine-এর হিসাব রাখে: কে কীসের জন্য অপেক্ষা করছে, কারটা প্রস্তুত। যার কাজ প্রস্তুত (যেমন network response এসে গেছে), তাকে আবার চালু করে।

তিনটা জিনিস প্রায়ই ভুল হয়:

1. **\`await\` ছাড়া call করলে কিছুই হয় না।** \`fetch()\` লিখলে শুধু একটা coroutine object তৈরি হয় — ভেতরের code চলেই না। Python warning দেয়: "coroutine was never awaited"।

2. **পরপর \`await\` মানে concurrency না।**
\`\`\`python
a = await fetch(1)   # শেষ হওয়া পর্যন্ত অপেক্ষা
b = await fetch(2)   # তারপর শুরু
\`\`\`
এটা sequential — ঠিক সাধারণ code-এর মতো। একসাথে চালাতে হলে \`asyncio.gather(fetch(1), fetch(2))\` বা \`create_task\` লাগে।

3. **Switch হয় শুধু \`await\`-এ।** কোনো coroutine \`await\` ছাড়া লম্বা হিসাব করতে থাকলে বাকি সবাই আটকে থাকে।`,
        examples: [
          {
            lang: 'python',
            code: `import asyncio

async def step(name, delay):
    print(f"{name} start")
    await asyncio.sleep(delay)
    print(f"{name} end")
    return name

async def main():
    coro = step("x", 0)
    print(type(coro).__name__)        # nothing has run yet
    await coro

    print("-- sequential --")
    await step("a", 0.02)
    await step("b", 0.01)

    print("-- concurrent --")
    results = await asyncio.gather(step("a", 0.02), step("b", 0.01))
    print(results)                    # gather keeps argument order

asyncio.run(main())`,
            output: `coroutine
x start
x end
-- sequential --
a start
a end
b start
b end
-- concurrent --
a start
b start
b end
a end
['a', 'b']`,
          },
        ],
        pitfalls: [
          'A coroutine called without `await` never runs.',
          'Sequential `await`s are not concurrent — use `gather` or tasks.',
          'Calling `asyncio.run` inside an already running loop (e.g. Jupyter) raises `RuntimeError`.',
        ],
        followUps: [
          'What is the difference between `gather` and `create_task`?',
          'How do you call blocking code from async code?',
        ],
      },
      related: [
        'py-asyncio-gather-tasks',
        'py-threading-multiprocessing-asyncio',
        'py-generators-yield',
      ],
    },
    {
      id: 'py-asyncio-gather-tasks',
      level: 'intermediate',
      priority: 2,
      question:
        'What do `asyncio.gather` and `asyncio.create_task` do, and how do you handle errors and timeouts?',
      tags: ['asyncio', 'gather', 'tasks', 'timeouts', 'taskgroup'],
      answer: {
        interview: `**\`create_task\` schedules a coroutine to run concurrently and returns a \`Task\`; \`gather\` runs several awaitables concurrently and returns their results in argument order.**

- By default, the first exception in \`gather\` propagates to the caller (the other tasks keep running). \`return_exceptions=True\` returns exceptions as results instead.
- \`asyncio.TaskGroup\` (3.11+) is the structured alternative: if one task fails, the others are cancelled, and errors are raised as an \`ExceptionGroup\`.
- Timeouts: \`asyncio.wait_for(coro, timeout)\` or \`async with asyncio.timeout(seconds):\` (3.11+) — they raise \`TimeoutError\`.
- Keep a reference to tasks you create, or they can be garbage-collected mid-flight.
- Limit concurrency with \`asyncio.Semaphore\` so you do not open 10,000 connections at once.

Real-world: fetch 50 product pages with \`gather\`, a semaphore of 10 and a timeout per request.`,
        explanationBn: `**\`create_task(coro)\`** — coroutine-টাকে event loop-এ "চালু হয়ে যাও" বলে পাঠিয়ে দেয়, আর সাথে সাথে একটা \`Task\` object ফেরত দেয়। আপনার code এগিয়ে যায়; task পেছনে চলতে থাকে। পরে \`await task\` করে result নেওয়া যায়।

**\`gather(a, b, c)\`** — অনেকগুলো একসাথে চালায় আর সবগুলো শেষ হলে result-এর list দেয় — **argument-এর ক্রমে**, যে আগে শেষ হয়েছে সেই ক্রমে না।

**Error handling:**
- Default-এ কোনো একটা fail করলে \`gather\` সেই exception raise করে। বাকিরা কিন্তু থামে না, চলতেই থাকে।
- \`return_exceptions=True\` দিলে exception raise না করে result-এর list-এ exception object হিসেবে রাখে — তখন প্রতিটা আলাদা করে দেখা যায়।
- **\`TaskGroup\`** (3.11+) — আধুনিক ও নিরাপদ পদ্ধতি: একটা fail করলে বাকি সব cancel হয়, কিছু ঝুলে থাকে না।

**Timeout:** network call চিরকাল অপেক্ষা করতে পারে। \`asyncio.timeout(2)\` বা \`wait_for\` দিয়ে সময়সীমা দিন — পার হলে \`TimeoutError\`।

**Concurrency সীমিত রাখা:** ১০,০০০ URL একসাথে \`gather\` করলে server বা আপনার machine দুটোই চাপে পড়ে। \`Semaphore(10)\` দিয়ে একসাথে সর্বোচ্চ ১০টা চালান।`,
        examples: [
          {
            lang: 'python',
            code: `import asyncio

async def fetch(n):
    await asyncio.sleep(0.01 * n)
    if n == 2:
        raise ValueError(f"page {n} failed")
    return f"page {n}"

async def main():
    results = await asyncio.gather(*(fetch(n) for n in range(1, 4)),
                                   return_exceptions=True)
    print([r if isinstance(r, str) else repr(r) for r in results])

    try:
        async with asyncio.timeout(0.05):
            await asyncio.sleep(1)
    except TimeoutError:
        print("timed out")

    limit = asyncio.Semaphore(2)
    async def limited(n):
        async with limit:               # at most 2 run at once
            return await fetch(n)
    print(await asyncio.gather(limited(1), limited(3), limited(4)))

asyncio.run(main())`,
            output: `['page 1', "ValueError('page 2 failed')", 'page 3']
timed out
['page 1', 'page 3', 'page 4']`,
          },
        ],
        pitfalls: [
          'Without `return_exceptions=True`, one failure raises but the other tasks keep running unobserved.',
          'Not keeping a reference to a task created with `create_task` can let it be garbage-collected.',
        ],
        followUps: ['What is an `ExceptionGroup`, and how does `except*` work?'],
      },
      related: ['py-async-await'],
    },
    {
      id: 'py-memory-management',
      level: 'intermediate',
      priority: 2,
      question:
        'How does Python manage memory? Explain reference counting and the garbage collector.',
      tags: ['memory', 'reference-counting', 'garbage-collection', 'cpython'],
      answer: {
        interview: `**CPython uses reference counting as the main mechanism and a cyclic garbage collector as a backup.**

- **Reference counting:** every object counts how many references point to it. When the count drops to zero (a name is deleted or rebound, a container releases it, a function returns), the object is freed immediately.
- **The problem:** reference cycles (\`a.b = b; b.a = a\`) never reach zero on their own.
- **Cyclic GC (\`gc\` module):** periodically finds groups of objects only reachable from each other and frees them. It is *generational*: new objects are checked often, long-lived objects less often, because most objects die young.
- Objects are allocated by \`pymalloc\`, a fast allocator for small objects; freed memory is often reused by Python rather than returned to the OS.
- Tools: \`sys.getrefcount\`, \`gc.collect()\`, \`weakref\` (references that do not keep objects alive), \`tracemalloc\` for finding leaks.

Real-world: a "leak" in a long-running service is usually a growing global cache or a lingering reference, not the GC failing.`,
        explanationBn: `Python-এ \`free()\` বা \`delete\` করে নিজে memory ছাড়তে হয় না — CPython দুটো পদ্ধতিতে এটা করে।

**১. Reference counting (মূল পদ্ধতি):**
প্রতিটা object-এর ভেতরে একটা counter থাকে — "কতজন আমাকে ব্যবহার করছে।" কোনো variable-এ বসালে, list-এ রাখলে, function-এ পাঠালে counter বাড়ে। Variable মুছলে, অন্য কিছুতে বসালে, function শেষ হলে কমে। **Counter শূন্য হওয়ার সাথে সাথে** object মুছে memory ফেরত দেওয়া হয় — দেরি না করে।

এটা সহজ আর তাৎক্ষণিক, কিন্তু একটা দুর্বলতা আছে।

**২. Cyclic garbage collector (সহায়ক পদ্ধতি):**
দুর্বলতা হলো **cycle**: A, B-কে ধরে আছে, আর B, A-কে ধরে আছে। বাইরে থেকে কেউ আর এদের ব্যবহার না করলেও প্রত্যেকের counter কমপক্ষে ১ — কখনো শূন্য হবে না। এদের খুঁজে বের করতে \`gc\` module মাঝে মাঝে চলে, দেখে কোন object গুলো শুধু নিজেদের মধ্যেই আটকে আছে, আর সেগুলো মুছে দেয়।

GC **generational** — object-দের বয়স অনুযায়ী তিনটা দলে রাখে। নতুন object গুলো ঘনঘন পরীক্ষা হয় (বেশিরভাগ object অল্প সময়েই অপ্রয়োজনীয় হয়ে যায়), আর যারা অনেক collection পেরিয়ে বেঁচে আছে তাদের কম পরীক্ষা হয়। এতে সময় বাঁচে।

**\`weakref\`** — এমন reference, যেটা counter বাড়ায় না। Cache বা observer pattern-এ কাজে লাগে, যাতে cache-এ থাকার কারণেই object বেঁচে না থাকে।

বাস্তবে "memory leak" সাধারণত GC-এর দোষ না — কোনো global list বা cache ক্রমাগত বড় হচ্ছে, অথবা কেউ এখনো একটা reference ধরে রেখেছে।`,
        examples: [
          {
            lang: 'python',
            code: `import gc, sys, weakref

data = []
before = sys.getrefcount(data)
alias = data                       # one more reference
print(sys.getrefcount(data) - before)

gc.disable()                       # make the demo deterministic

class Node:
    pass

a, b = Node(), Node()
a.partner, b.partner = b, a        # a reference cycle
probe = weakref.ref(a)             # observes a without keeping it alive

del a, b
print(probe() is None)             # the cycle keeps both alive
gc.collect()
print(probe() is None)             # the cyclic GC freed them`,
            output: `1
False
True`,
          },
        ],
        pitfalls: [
          'Objects with `__del__` in a cycle used to be uncollectable (fixed in 3.4, but `__del__` order is still unpredictable).',
          'Global caches and long-lived lists are the most common real "leaks".',
          'Exact `sys.getrefcount` values vary by version; compare changes, not absolute numbers.',
        ],
        followUps: [
          'What is a weak reference used for?',
          'How would you find a memory leak in a Python service?',
        ],
      },
      related: ['py-gil', 'py-gc-generations'],
    },
    {
      id: 'py-itertools',
      level: 'intermediate',
      priority: 2,
      question: 'Which `itertools` functions should every Python developer know?',
      tags: ['itertools', 'iterators', 'combinatorics', 'groupby'],
      answer: {
        interview: `**\`itertools\` provides fast, lazy building blocks for iteration. The everyday ones:**

- **\`chain(a, b)\` / \`chain.from_iterable(lists)\`** — iterate several iterables as one; the standard way to flatten one level.
- **\`groupby(it, key)\`** — groups **consecutive** items with the same key — sort by the key first.
- **\`combinations(it, r)\`** / **\`permutations(it, r)\`** / **\`product(a, b)\`** — combinatorics without nested loops.
- **\`islice(it, start, stop)\`** — slice any iterator, including infinite ones.
- **\`count\`**, **\`cycle\`**, **\`repeat\`** — infinite iterators; **\`accumulate\`** for running totals; **\`zip_longest\`**, **\`pairwise\`** (3.10+), **\`batched\`** (3.12+).
- All return lazy iterators, so they work on huge or infinite inputs with constant memory.

Real-world: \`groupby\` over log lines sorted by date, \`combinations\` to test all pairs, \`islice\` to take the first N results from a generator.`,
        explanationBn: `\`itertools\` হলো iteration-এর জন্য তৈরি করা ছোট ছোট, দ্রুত tool-এর একটা বাক্স। প্রায় সবগুলো **lazy** — তাই বিশাল বা অসীম data-তেও memory কম লাগে।

সবচেয়ে কাজের কয়েকটা:

- **\`chain\`** — কয়েকটা list/iterable জোড়া লাগিয়ে একটার মতো loop চালানো। \`chain.from_iterable(list_of_lists)\` দিয়ে এক স্তর flatten করা যায়।
- **\`groupby\`** — পরপর থাকা একই key-র item গুলো একসাথে করে। **বড় ফাঁদ:** এটা শুধু *পাশাপাশি* থাকা item গুলো group করে। তাই আগে একই key দিয়ে sort না করলে একই group কয়েক টুকরো হয়ে যায়।
- **\`combinations\`** — ক্রম ছাড়া বাছাই: \`[A,B,C]\` থেকে ২টা → AB, AC, BC।
- **\`permutations\`** — ক্রমসহ সাজানো: AB আর BA আলাদা।
- **\`product\`** — nested loop-এর বদলে: \`product(sizes, colors)\` = সব size-color জুটি।
- **\`islice\`** — যেকোনো iterator, এমনকি অসীম generator থেকেও প্রথম কয়েকটা নেওয়া (সাধারণ slice \`[:5]\` generator-এ চলে না)।
- **\`accumulate\`** — running total: \`[1,2,3]\` → \`[1,3,6]\`।

Interview-এ এগুলো ব্যবহার করলে nested loop এড়িয়ে পরিষ্কার code লেখা যায়।`,
        examples: [
          {
            lang: 'python',
            code: `from itertools import (accumulate, chain, combinations, count, groupby,
                       islice, permutations, product)

print(list(chain([1, 2], (3,), "ab")))
print(list(chain.from_iterable([[1, 2], [3], [4, 5]])))

sales = [("mon", 5), ("tue", 3), ("mon", 2)]
for day, rows in groupby(sorted(sales), key=lambda r: r[0]):
    print(day, sum(qty for _, qty in rows))

print(list(combinations("ABC", 2)))
print(len(list(permutations("ABC", 2))), list(product([1, 2], "xy")))
print(list(islice(count(10, 5), 4)), list(accumulate([1, 2, 3, 4])))`,
            output: `[1, 2, 3, 'a', 'b']
[1, 2, 3, 4, 5]
mon 7
tue 3
[('A', 'B'), ('A', 'C'), ('B', 'C')]
6 [(1, 'x'), (1, 'y'), (2, 'x'), (2, 'y')]
[10, 15, 20, 25] [1, 3, 6, 10]`,
          },
        ],
        pitfalls: [
          '`groupby` on unsorted data produces several groups for the same key.',
          'Each group from `groupby` is consumed when you advance to the next group — collect it first if needed.',
        ],
        followUps: ['How would you get every pair of items from a list?'],
      },
      related: ['py-collections-module', 'py-generators-yield'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'py-blocking-in-async',
      level: 'advanced',
      priority: 2,
      question:
        'What happens if you call blocking code inside an async function, and how do you fix it?',
      tags: ['asyncio', 'blocking', 'to_thread', 'executors'],
      answer: {
        interview: `**The whole event loop stops: coroutines only yield at \`await\`, so a blocking call (\`time.sleep\`, \`requests.get\`, a sync DB driver, a long CPU loop) prevents every other task from running until it returns.**

- Symptom: an "async" server that handles requests one at a time, with latency spikes.
- Fix for blocking I/O: use an async library (\`httpx\`, \`aiohttp\`, \`asyncpg\`), or offload with \`await asyncio.to_thread(fn, *args)\` (3.9+).
- Fix for CPU work: \`loop.run_in_executor(process_pool, fn, ...)\` so it runs in another process.
- \`asyncio\` debug mode (\`PYTHONASYNCIODEBUG=1\`) logs callbacks that take too long.

Real-world: wrapping a legacy synchronous SDK call in \`asyncio.to_thread\` inside a FastAPI endpoint.`,
        explanationBn: `Asyncio-র পুরো ব্যবস্থাটা একটা বিশ্বাসের ওপর দাঁড়িয়ে: **প্রতিটা coroutine নিয়মিত \`await\`-এ পৌঁছে control ছেড়ে দেবে।** Event loop একটাই thread-এ চলে, তাই কেউ control না ছাড়লে বাকি কেউ চলতে পারে না।

এখন কোনো coroutine-এর ভেতরে যদি লেখেন \`time.sleep(2)\` — এটা \`await\` করার মতো কিছু না, এটা পুরো thread-কে ২ সেকেন্ড আটকে রাখে। সেই ২ সেকেন্ড event loop কিছুই করতে পারে না — অন্য সব request, সব task থেমে থাকে। একই সমস্যা হয় \`requests.get()\`, সাধারণ (sync) database driver, বা লম্বা হিসাবের loop-এ।

ফলাফল: নামে "async server", কিন্তু আসলে একটা একটা করে request সামলায়।

**সমাধান:**
1. **Async library ব্যবহার করুন** — \`requests\`-এর বদলে \`httpx.AsyncClient\`, \`time.sleep\`-এর বদলে \`await asyncio.sleep\`।
2. **Blocking I/O অন্য thread-এ পাঠান** — \`await asyncio.to_thread(func, arg)\`। Function আলাদা thread-এ চলে, আর event loop ততক্ষণ অন্য কাজ করতে পারে।
3. **CPU-ভারী কাজ অন্য process-এ পাঠান** — \`run_in_executor\` দিয়ে process pool-এ। Thread-এ পাঠালে GIL-এর কারণে loop তবুও ধীর হবে।`,
        examples: [
          {
            lang: 'python',
            code: `import asyncio, time

def legacy_sdk_call(n):        # a blocking, synchronous function
    time.sleep(0.2)
    return n * 2

async def heartbeat(ticks):
    for _ in range(3):
        ticks.append("tick")
        await asyncio.sleep(0.05)

async def main():
    ticks = []
    beat = asyncio.create_task(heartbeat(ticks))
    legacy_sdk_call(1)                          # blocks the loop
    print("ticks while blocked:", len(ticks))
    await beat

    ticks.clear()
    beat = asyncio.create_task(heartbeat(ticks))
    result = await asyncio.to_thread(legacy_sdk_call, 21)
    await beat
    print("result:", result, "| ticks while offloaded:", len(ticks))

asyncio.run(main())`,
            output: `ticks while blocked: 0
result: 42 | ticks while offloaded: 3`,
          },
        ],
        pitfalls: [
          '`asyncio.to_thread` still runs under the GIL — fine for I/O, not for heavy CPU work.',
          'Hidden blocking calls (DNS lookups, logging to a slow handler, sync ORMs) are common culprits.',
        ],
        followUps: ['How would you detect blocking calls in an async application?'],
      },
      related: ['py-threading-multiprocessing-asyncio', 'py-async-await'],
    },
    {
      id: 'py-gc-generations',
      level: 'advanced',
      priority: 1,
      question: "How does CPython's generational garbage collector decide when to run?",
      tags: ['garbage-collection', 'gc', 'generations', 'performance'],
      answer: {
        interview: `**Container objects are tracked in generations. A collection of the youngest generation runs when allocations minus deallocations exceed a threshold; survivors are promoted to an older generation, which is collected less often.**

- \`gc.get_threshold()\` returns the thresholds (traditionally \`(700, 10, 10)\`); \`gc.get_count()\` shows the current counters.
- Only container objects (lists, dicts, class instances…) are tracked — ints and strings cannot form cycles. CPython even skips dicts that hold only atomic values until they store a container.
- \`gc.freeze()\` moves all current objects to a permanent generation; used before forking worker processes to avoid copy-on-write memory growth.
- Some services tune thresholds or disable the GC around hot paths, but only after measuring.
- Python 3.13 reworked the collector (incremental collection for the oldest generation), so exact numbers vary between versions.

Real-world: Instagram famously disabled/froze the GC in forked Django workers to reduce memory use.`,
        explanationBn: `Cyclic GC সারাক্ষণ চলে না — চললে program অনেক ধীর হয়ে যেত। তাই এটা ঠিক করে কখন চলবে, **generation**-এর ধারণা দিয়ে।

একটা পর্যবেক্ষণ থেকে ধারণাটা এসেছে: **বেশিরভাগ object অল্প সময়ের মধ্যেই অপ্রয়োজনীয় হয়ে যায়** (loop-এর temporary list, function-এর local data)। আর যারা অনেকক্ষণ বেঁচে থাকে, তারা সাধারণত আরও অনেকক্ষণ থাকে।

তাই object-দের তিনটা দলে রাখা হয়:
- **Generation 0** — নতুন object। এখানে GC সবচেয়ে ঘনঘন চলে।
- কোনো collection-এ বেঁচে গেলে object পরের generation-এ **promote** হয়।
- পুরনো generation গুলো অনেক কম পরীক্ষা হয়।

কখন চলবে? Generation 0-এর জন্য একটা threshold থাকে (ঐতিহ্যগতভাবে 700): নতুন তৈরি হওয়া object থেকে মুছে যাওয়া object বাদ দিয়ে সংখ্যাটা সেই সীমা পার হলে collection চলে।

শুধু **container object** (list, dict, class-এর instance) track হয়, কারণ শুধু এরাই অন্য object ধরে রেখে cycle বানাতে পারে। Int বা string cycle বানাতে পারে না।

\`gc.freeze()\` একটা বিশেষ কৌশল: fork করে অনেক worker process বানানোর আগে ডাকলে, বিদ্যমান object গুলো আর GC-র আওতায় আসে না, ফলে worker-রা অপ্রয়োজনে shared memory কপি করে না।`,
        examples: [
          {
            lang: 'python',
            code: `import gc

print(len(gc.get_threshold()) == 3)
print(gc.is_tracked([]), gc.is_tracked({"k": []}), gc.is_tracked(42), gc.is_tracked("text"))
print(gc.is_tracked({}), gc.is_tracked({"k": 1}))   # dicts of atomic values are untracked`,
            output: `True
True True False False
False False`,
          },
        ],
        followUps: ['Why are integers and strings not tracked by the GC?'],
      },
      related: ['py-memory-management'],
    },
    {
      id: 'py-typing-generics-protocol',
      level: 'advanced',
      priority: 1,
      question: 'What are `TypeVar`, generics and `Protocol` in Python typing?',
      tags: ['typing', 'generics', 'typevar', 'protocol', 'structural-typing'],
      answer: {
        interview: `**\`TypeVar\` lets a function or class be generic — the type checker links input and output types. \`Protocol\` describes a set of methods, and any class that has them matches, without inheriting (static duck typing).**

- \`def first(items: list[T]) -> T\` tells mypy that \`first([1, 2])\` returns an \`int\`.
- Python 3.12 adds inline syntax: \`def first[T](items: list[T]) -> T\` and \`class Box[T]: ...\`.
- \`class SupportsClose(Protocol): def close(self) -> None: ...\` — any object with \`close()\` is accepted.
- \`@runtime_checkable\` allows \`isinstance\` checks against a Protocol (only method names are checked).
- All of this is for type checkers; at runtime the generic code is ordinary Python.

Real-world: a \`Repository[T]\` base class, and a \`Protocol\` for "anything with \`.read()\`" accepted by a parser.`,
        explanationBn: `**Generic ও \`TypeVar\`:** ধরুন একটা function list থেকে প্রথম element ফেরত দেয়। Return type কী লিখবেন? \`Any\` লিখলে type checker সব তথ্য হারায়। আসল কথা হলো "যে type-এর list দেবেন, সেই type-এর element ফেরত আসবে।" \`TypeVar\` ঠিক এটাই প্রকাশ করে — একটা type-এর "চলক":
\`\`\`python
T = TypeVar("T")
def first(items: list[T]) -> T: ...
\`\`\`
এখন \`first([1, 2])\`-এর type mypy জানে \`int\`, আর \`first(["a"])\`-এর \`str\`। Python 3.12-এ আরও সহজ syntax: \`def first[T](items: list[T]) -> T\`।

**\`Protocol\`:** duck typing-কে type checker-এর ভাষায় লেখা। আপনি বলেন "আমার এমন একটা object দরকার, যার \`close()\` method আছে" — কোনো class-কে সেই Protocol থেকে inherit করতে হয় না। যার \`close()\` আছে, সে-ই মানানসই। একে বলে **structural typing** (আকার দেখে মেলানো), যেখানে ABC হলো **nominal typing** (নাম/বংশ দেখে মেলানো)।

এগুলো সবই static checking-এর জন্য — runtime-এ কোনো পার্থক্য তৈরি করে না।`,
        examples: [
          {
            lang: 'python',
            code: `from typing import Protocol, TypeVar, runtime_checkable

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

@runtime_checkable
class SupportsClose(Protocol):
    def close(self) -> None: ...

class Connection:              # no inheritance from SupportsClose
    def close(self) -> None:
        print("closed")

def shutdown(resource: SupportsClose) -> None:
    resource.close()

print(first([3, 1, 2]), first(["x", "y"]))
shutdown(Connection())
print(isinstance(Connection(), SupportsClose), isinstance(42, SupportsClose))`,
            output: `3 x
closed
True False`,
          },
        ],
        pitfalls: [
          '`runtime_checkable` only checks that the method names exist, not their signatures.',
        ],
        followUps: ['Protocol vs abstract base class — when do you choose each?'],
      },
      related: ['py-type-hints-basics', 'py-abstract-classes', 'py-duck-typing'],
    },
  ],
});

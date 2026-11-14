import type { Coverage, Level, Priority, QuickConcept } from '../schema';

function concept(c: {
  id: string;
  question: string;
  level: Level;
  priority?: Priority;
  tags: string[];
  interview: string;
  bn: string;
  example?: { code: string; output: string };
  related?: string[];
}): QuickConcept {
  return {
    id: c.id,
    sectionId: 'py-coverage',
    level: c.level,
    priority: c.priority ?? 1,
    question: c.question,
    tags: c.tags,
    answer: {
      interview: c.interview,
      explanationBn: c.bn,
      examples: c.example ? [{ lang: 'python', ...c.example }] : undefined,
    },
    related: c.related,
  };
}

export const coverage: Coverage = {
  quickConcepts: [
    concept({
      id: 'py-qc-walrus-operator',
      question: 'What is the walrus operator (`:=`)?',
      level: 'intermediate',
      tags: ['syntax', 'assignment-expression'],
      interview:
        'An assignment expression (Python 3.8+): it assigns a value to a name **and** evaluates to that value, so you can assign inside a condition — e.g. `while (chunk := f.read(1024)):` or `if (m := pattern.search(text)):`.',
      bn: 'Walrus একসাথে দুটো কাজ করে: value assign করে, আবার সেই value-টাই expression হিসেবে ফেরত দেয় — তাই আলাদা লাইনে assign না করেই condition-এর ভেতরে ব্যবহার করা যায়।',
      example: {
        code: `data = [3, 8, 1, 9]
if (n := len(data)) > 3:
    print(f"list is long ({n} items)")`,
        output: `list is long (4 items)`,
      },
    }),
    concept({
      id: 'py-qc-match-case',
      question: 'What is structural pattern matching (`match` / `case`)?',
      level: 'intermediate',
      tags: ['syntax', 'pattern-matching', 'python-3-10'],
      interview:
        'Python 3.10\'s `match` statement compares a value against **patterns** — literals, sequences, mappings, class shapes — and can bind parts of it to names. It is much more than a `switch`: `case {"type": "click", "x": x, "y": y}:` destructures a dict, and `case _:` is the wildcard.',
      bn: '`match` শুধু value মেলায় না, data-র **আকার** মেলায় এবং দরকারি অংশ বের করে নামে বসিয়ে দেয় — JSON event বা command parse করতে খুব কাজের।',
      example: {
        code: `def handle(event):
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"click at {x},{y}"
        case {"type": "key", "key": "q" | "Q"}:
            return "quit"
        case _:
            return "ignored"

print(handle({"type": "click", "x": 3, "y": 4}), handle({"type": "key", "key": "Q"}))`,
        output: `click at 3,4 quit`,
      },
    }),
    concept({
      id: 'py-qc-slots',
      question: 'What does `__slots__` do?',
      level: 'advanced',
      tags: ['oop', 'memory', 'performance'],
      interview:
        '`__slots__ = ("x", "y")` tells Python to store instance attributes in fixed slots instead of a per-instance `__dict__`. Instances use noticeably less memory and attribute access is slightly faster, but you cannot add attributes that are not listed. Useful when creating millions of small objects; `@dataclass(slots=True)` generates it.',
      bn: 'প্রতিটা object-এর সাথে একটা `__dict__` থাকে, যেটা memory খায়। `__slots__` সেটা বাদ দিয়ে নির্দিষ্ট কয়েকটা ঘর বানায় — লাখো ছোট object থাকলে memory অনেক বাঁচে।',
      example: {
        code: `class Point:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y

p = Point(1, 2)
print(hasattr(p, "__dict__"))
try:
    p.z = 3
except AttributeError:
    print("cannot add attribute z")`,
        output: `False
cannot add attribute z`,
      },
    }),
    concept({
      id: 'py-qc-descriptors',
      question: 'What is a descriptor?',
      level: 'advanced',
      tags: ['oop', 'descriptors', 'property', 'data-model'],
      interview:
        'An object that defines `__get__`, `__set__` and/or `__delete__` and is stored as a **class** attribute. When you access that attribute on an instance, Python calls those methods instead. `property`, `classmethod`, `staticmethod` and even ordinary methods (which bind `self`) are all built on descriptors.',
      bn: 'Descriptor হলো attribute access-এর একটা "hook" — `obj.x` পড়া বা লেখার সময় Python আপনার নিজের method ডাকে। `@property` এভাবেই কাজ করে, আর method-এ `self` নিজে থেকে বসে যাওয়াও descriptor-এর কারণে।',
      example: {
        code: `class Positive:
    def __set_name__(self, owner, name):
        self.name = "_" + name
    def __get__(self, obj, objtype=None):
        return getattr(obj, self.name)
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError("must be positive")
        setattr(obj, self.name, value)

class Order:
    qty = Positive()             # reusable validation

o = Order()
o.qty = 3
print(o.qty)
try:
    o.qty = 0
except ValueError as e:
    print("ValueError:", e)`,
        output: `3
ValueError: must be positive`,
      },
      related: ['py-property'],
    }),
    concept({
      id: 'py-qc-metaclass',
      question: 'What is a metaclass?',
      level: 'advanced',
      tags: ['oop', 'metaclass', 'type'],
      interview:
        'The class of a class. Classes are objects created by a metaclass — by default `type`. A custom metaclass (subclassing `type`) can customise class creation: register subclasses, validate attributes, add methods. Frameworks like Django models and SQLAlchemy use them; in application code, `__init_subclass__` or class decorators are usually simpler.',
      bn: 'Object তৈরি করে class, আর class তৈরি করে metaclass — default-এ `type`। Class কীভাবে তৈরি হবে সেটা বদলাতে metaclass লাগে, তবে সাধারণ কাজে `__init_subclass__` বা class decorator-ই যথেষ্ট।',
      example: {
        code: `class Plugin:
    registry = []
    def __init_subclass__(cls, **kwargs):      # a lighter alternative to a metaclass
        super().__init_subclass__(**kwargs)
        Plugin.registry.append(cls.__name__)

class CsvExport(Plugin): pass
class PdfExport(Plugin): pass

print(type(Plugin), Plugin.registry)`,
        output: `<class 'type'> ['CsvExport', 'PdfExport']`,
      },
    }),
    concept({
      id: 'py-qc-getattr-vs-getattribute',
      question: 'What is the difference between `__getattr__` and `__getattribute__`?',
      level: 'advanced',
      tags: ['oop', 'data-model', 'attributes'],
      interview:
        '`__getattribute__` runs for **every** attribute access; `__getattr__` runs only when normal lookup **fails**. `__getattr__` is the safe one for fallbacks and proxies. Overriding `__getattribute__` is rare and easy to get wrong — accessing `self.anything` inside it recurses unless you call `object.__getattribute__(self, name)`.',
      bn: '`__getattribute__` প্রতিটা attribute পড়ার সময় চলে; `__getattr__` চলে শুধু তখন, যখন attribute খুঁজে পাওয়া যায় না — তাই proxy বা default value দিতে `__getattr__`-ই নিরাপদ।',
      example: {
        code: `class Settings:
    def __init__(self):
        self.debug = True
    def __getattr__(self, name):           # only for missing attributes
        return f"<default for {name}>"

s = Settings()
print(s.debug, s.timeout)`,
        output: `True <default for timeout>`,
      },
    }),
    concept({
      id: 'py-qc-weakref',
      question: 'What is a weak reference (`weakref`)?',
      level: 'advanced',
      tags: ['memory', 'weakref', 'caching'],
      interview:
        'A reference that does **not** increase the reference count, so it does not keep the object alive. When the object is collected, the weak reference returns `None`. Used for caches (`WeakValueDictionary`), observer lists and parent pointers in trees, to avoid memory leaks and reference cycles.',
      bn: 'সাধারণ reference object-কে বাঁচিয়ে রাখে; weak reference শুধু "দেখে", বাঁচিয়ে রাখে না। Object মুছে গেলে weakref `None` দেয় — cache-এ রাখা জিনিস যেন শুধু cache-এর কারণে memory আটকে না রাখে।',
      example: {
        code: `import weakref

class Image:
    pass

img = Image()
ref = weakref.ref(img)
print(ref() is img)
del img                  # last strong reference gone
print(ref())`,
        output: `True
None`,
      },
      related: ['py-memory-management'],
    }),
    concept({
      id: 'py-qc-dis-bytecode',
      question: 'What is the `dis` module used for?',
      level: 'intermediate',
      tags: ['bytecode', 'dis', 'cpython', 'debugging'],
      interview:
        '`dis` disassembles Python functions into CPython **bytecode** instructions. It helps explain behaviour (e.g. why `x += 1` is not atomic, how a comprehension compiles) and compare implementations. The exact output changes between Python versions, so it is for learning and investigation, not for production logic.',
      bn: '`dis` দেখায় আপনার Python code CPython-এর ভেতরে কোন কোন ছোট instruction-এ ভাঙছে — কেন `x += 1` thread-safe না, তা বুঝতে এটা খুব কাজের।',
      related: ['py-interpreted-or-compiled'],
    }),
    concept({
      id: 'py-qc-exception-groups',
      question: 'What are `ExceptionGroup` and `except*`?',
      level: 'advanced',
      tags: ['exceptions', 'exception-groups', 'asyncio', 'python-3-11'],
      interview:
        'Python 3.11 added `ExceptionGroup` to raise several unrelated exceptions at once — typical when concurrent tasks fail together (`asyncio.TaskGroup`). `except* ValueError:` handles only the matching exceptions inside the group; the rest keep propagating.',
      bn: 'একসাথে চলা কয়েকটা task একসাথে ব্যর্থ হলে একটা error দেখানো যথেষ্ট না। `ExceptionGroup` সবগুলো একসাথে বহন করে, আর `except*` তার থেকে নির্দিষ্ট ধরনেরগুলো আলাদা করে সামলায়।',
      example: {
        code: `try:
    raise ExceptionGroup("batch failed", [ValueError("bad row"), KeyError("id")])
except* ValueError as group:
    print("values:", [str(e) for e in group.exceptions])
except* KeyError as group:
    print("keys:", [str(e) for e in group.exceptions])`,
        output: `values: ['bad row']
keys: ["'id'"]`,
      },
      related: ['py-asyncio-gather-tasks'],
    }),
    concept({
      id: 'py-qc-free-threaded',
      question: 'What is free-threaded Python?',
      level: 'advanced',
      tags: ['gil', 'free-threading', 'pep-703', 'concurrency'],
      interview:
        'A CPython build without the GIL (PEP 703): experimental in 3.13 (`python3.13t`) and officially supported, but still optional, from 3.14. Threads can run Python bytecode truly in parallel on multiple cores. Trade-offs: some single-threaded slowdown, and C extensions must be updated to be thread-safe.',
      bn: 'GIL ছাড়া CPython-এর একটা আলাদা build, যেখানে thread গুলো সত্যিই একসাথে একাধিক core-এ চলে। এখনো ঐচ্ছিক, আর পুরনো C extension-গুলোকে নতুন করে thread-safe করতে হচ্ছে।',
      related: ['py-gil'],
    }),
  ],
  notCovered: [
    {
      topic: 'CPython internals in depth',
      reason:
        'Frame objects, the evaluation loop, object allocators and the C API rarely come up outside interpreter or extension work. The concept-level answers here are enough.',
    },
    {
      topic: 'Version-by-version feature lists',
      reason:
        'Interviewers ask how features work, not which release added them. Version numbers are mentioned only where they change behaviour.',
    },
    {
      topic: 'Rarely used standard library modules (`ChainMap`, `argparse`, `shutil`, …)',
      reason: 'Look them up when you need them; they are almost never interview topics.',
    },
    {
      topic: 'Cython, Numba and C extensions',
      reason: 'Specialised performance tooling, outside a language-level interview.',
    },
    {
      topic: 'Generator `send()` / `throw()` and generator-based coroutines',
      reason:
        'Superseded by `async`/`await` for coroutines; plain generators are covered in depth.',
    },
    {
      topic: 'Web frameworks (Django, FastAPI, Flask)',
      reason: 'Framework questions belong in their own tracks, not the language track.',
    },
    {
      topic: 'NumPy and Pandas',
      reason: 'Planned as a separate data track.',
    },
  ],
  studyTips: [
    'For every output question, predict the answer on paper first — most Python traps are about references, mutability and when things are evaluated.',
    'Say the one-sentence answer out loud first, then the key points. That is exactly how each Interview Answer is structured.',
    'Master the priority-3 (★★★) questions before anything else: mutability, `is` vs `==`, decorators, generators, the GIL and the three kinds of methods come up in nearly every interview.',
    'Run every code example yourself and change one thing at a time. Explaining *why* the output changed is what interviewers are really testing.',
    'Solve each exercise without hints first, then compare with every solution approach and be ready to state the time and space complexity.',
    'Use practice mode (press `p`) for a final revision pass: answer each question aloud before revealing it, and mark it learned only when you can explain it without looking.',
  ],
};

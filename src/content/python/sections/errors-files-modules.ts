import { defineSection } from '../../define';

export const errorsFilesModules = defineSection({
  id: 'py-errors-files-modules',
  title: 'Errors, Files & Modules',
  description:
    'Exception handling done right, context managers, reading and writing files, and how modules, packages, imports and environments fit together.',
  order: 6,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'py-try-except-else-finally',
      level: 'foundation',
      priority: 3,
      question: 'Explain `try`, `except`, `else` and `finally` — when does each block run?',
      tags: ['exceptions', 'try-except', 'finally', 'error-handling'],
      answer: {
        interview: `**\`try\` holds code that might fail; \`except\` runs only if a matching exception is raised; \`else\` runs only if \`try\` raised nothing; \`finally\` always runs last — success, failure, \`return\` or \`break\`.**

- Order: \`try\` → (\`except\` **or** \`else\`) → \`finally\`.
- \`except\` clauses are checked top to bottom; put specific exceptions before general ones.
- \`else\` keeps the \`try\` block small: only the risky line goes in \`try\`, follow-up code goes in \`else\` so its own errors are not accidentally caught.
- \`finally\` is for cleanup — closing files, releasing locks — though a \`with\` statement is usually better.
- If no \`except\` matches, \`finally\` still runs and then the exception keeps propagating.
- Catch specific exceptions; a bare \`except:\` also catches \`KeyboardInterrupt\` and \`SystemExit\`.

Real-world: \`try: data = json.loads(raw) except json.JSONDecodeError: return error_response() else: save(data) finally: log_request()\`.`,
        explanationBn: `চারটা block-এর কাজ মনে রাখার সহজ উপায় হলো প্রতিটার "কখন চলে" প্রশ্নের উত্তর:

- **\`try\`** — সবসময় প্রথমে চলে। এখানে সেই code রাখুন যেটা ব্যর্থ হতে পারে।
- **\`except\`** — **শুধু** তখন, যখন \`try\`-এ মিলে যাওয়া exception হয়। Exception হওয়ার মুহূর্তে \`try\`-এর বাকি লাইন বাদ পড়ে যায়।
- **\`else\`** — **শুধু** তখন, যখন \`try\`-এ কোনো exception হয়নি।
- **\`finally\`** — **সবসময়**, সবার শেষে — সফল হোক, ব্যর্থ হোক, এমনকি \`try\`-এর ভেতরে \`return\` থাকলেও।

**\`else\` কেন দরকার?** অনেকে ভাবেন \`else\`-এর code তো \`try\`-এর শেষেই লেখা যেত। কিন্তু তাহলে সেই code-এর নিজের কোনো exception-ও ভুল করে একই \`except\` ধরে ফেলত। ধরুন \`try\`-তে file খুলছেন আর \`except FileNotFoundError\` ধরছেন। File খোলার পরে প্রক্রিয়াকরণের code \`try\`-তে রাখলে, সেখানে অন্য কারণে \`FileNotFoundError\` হলে আপনি ভুল message দেখাবেন। \`else\` সেটা আলাদা রাখে — \`try\`-এ শুধু ঝুঁকিপূর্ণ লাইনটা।

**\`finally\` কেন দরকার?** Cleanup-এর জন্য — file বন্ধ করা, lock ছেড়ে দেওয়া, connection ফেরত দেওয়া। Error হলেও যেন resource আটকে না থাকে। তবে আধুনিক Python-এ এই কাজের জন্য \`with\` statement বেশি পরিষ্কার।

কোনো \`except\` না মিললে কী হয়? \`finally\` চলে, তারপর exception উপরের দিকে (caller-এর কাছে) চলে যায়।

একটা ভালো অভ্যাস: নির্দিষ্ট exception ধরুন। খালি \`except:\` লিখলে Ctrl+C (\`KeyboardInterrupt\`) পর্যন্ত ধরা পড়ে, program বন্ধ করাই কঠিন হয়ে যায়।`,
        examples: [
          {
            lang: 'python',
            code: `def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        print("except: cannot divide by zero")
        return None
    else:
        print("else: no error")
        return result
    finally:
        print("finally: always runs")

print(divide(10, 2))
print("---")
print(divide(1, 0))`,
            output: `else: no error
finally: always runs
5.0
---
except: cannot divide by zero
finally: always runs
None`,
          },
          {
            lang: 'python',
            caption: 'An unhandled exception still runs finally, then propagates',
            code: `def parse(text):
    try:
        return int(text)
    except ZeroDivisionError:        # does not match ValueError
        return -1
    finally:
        print("cleanup")

try:
    parse("abc")
except ValueError as e:
    print("caller got:", type(e).__name__)`,
            output: `cleanup
caller got: ValueError`,
          },
        ],
        pitfalls: [
          'A bare `except:` catches `KeyboardInterrupt` and `SystemExit` — use `except Exception:` at most.',
          'Putting too much code in `try` catches errors you did not expect; move follow-up code to `else`.',
          'A `return` inside `finally` overrides any return value and silently swallows exceptions.',
        ],
        followUps: [
          'What happens if both `try` and `finally` contain a `return`?',
          'How do you define a custom exception?',
          'What is the difference between `except Exception` and a bare `except`?',
        ],
      },
      visualizationId: 'py-try-except-flow',
      related: ['py-return-in-finally', 'py-exception-hierarchy-custom', 'py-context-managers'],
    },
    {
      id: 'py-name-main',
      level: 'foundation',
      priority: 3,
      question: 'What does `if __name__ == "__main__":` do?',
      tags: ['modules', '__name__', 'scripts', 'imports'],
      answer: {
        interview: `**Every module has a \`__name__\` attribute. When a file is run directly, Python sets it to \`"__main__"\`; when the file is imported, it is the module's name. The \`if\` block therefore runs only when the file is executed as a script, not when it is imported.**

- It lets one file be both a reusable module (functions, classes) and a runnable script.
- Without the guard, importing the module would also run its demo code, tests, or CLI.
- It is required for \`multiprocessing\` on Windows/macOS (spawn), where child processes re-import the main module.
- Convention: put the script logic in a \`main()\` function and call it from the guard.
- \`python -m package.module\` also sets \`__name__ == "__main__"\`; a package can provide \`__main__.py\` for \`python -m package\`.

Real-world: \`utils.py\` with helper functions plus a small CLI under the guard, so other modules can \`import utils\` safely.`,
        explanationBn: `Python প্রতিটা module (file)-কে একটা নাম দেয়, যেটা \`__name__\` variable-এ থাকে। এই নামটা **file কীভাবে চালানো হলো** তার ওপর নির্ভর করে:

- **সরাসরি চালালে** (\`python report.py\`) → \`__name__ = "__main__"\`
- **অন্য file থেকে import করলে** (\`import report\`) → \`__name__ = "report"\`

তাই \`if __name__ == "__main__":\` মানে: "এই অংশটা শুধু তখনই চালাও, যখন এই file-টা নিজেই মূল program হিসেবে চলছে — কেউ import করলে না।"

কেন দরকার? Import করলে Python পুরো file-টা উপর থেকে নিচে **execute** করে। ধরুন \`report.py\`-তে কিছু দরকারি function আছে, আর নিচে test করার জন্য \`print(generate_report())\` লিখেছেন। এখন অন্য কেউ \`import report\` করলেই সেই report তৈরি হয়ে যাবে — যেটা সে চায়নি। Guard দিলে import নিরাপদ: শুধু function আর class define হয়, বাড়তি কিছু চলে না।

Analogy: একটা রান্নার বইয়ের রেসিপি। কেউ বইটা পড়লে (import) শুধু রেসিপি জানে; কিন্তু আপনি নিজে রান্নাঘরে দাঁড়িয়ে বইটা ধরলে (সরাসরি চালালে) রান্নাও শুরু হয়।

\`multiprocessing\`-এ এটা বাধ্যতামূলক: Windows-এ নতুন process তৈরির সময় main module আবার import হয়। Guard না থাকলে প্রতিটা child process আবার নতুন process বানাতে থাকে — অসীম চক্র।`,
        examples: [
          {
            lang: 'python',
            caption:
              'Run directly, the module name is __main__; an imported module keeps its own name',
            code: `import json

def main():
    print("running as a script")

print(__name__, json.__name__)

if __name__ == "__main__":
    main()`,
            output: `__main__ json
running as a script`,
          },
          {
            lang: 'text',
            caption: 'Two ways to execute the same file',
            code: `$ python report.py        -> __name__ == "__main__"  (guard runs)
>>> import report          -> __name__ == "report"    (guard skipped)`,
          },
        ],
        pitfalls: [
          'Top-level code without the guard runs on every import, including in tests.',
          'With `multiprocessing` on Windows, a missing guard makes child processes spawn more processes.',
        ],
        followUps: [
          'What happens when you import a module twice?',
          'What does `python -m` do differently from `python file.py`?',
        ],
      },
      related: ['py-module-vs-package', 'py-import-system'],
    },
    {
      id: 'py-exception-hierarchy-custom',
      level: 'foundation',
      priority: 2,
      question:
        'What does the exception hierarchy look like, and how do you create a custom exception?',
      tags: ['exceptions', 'custom-exceptions', 'hierarchy', 'baseexception'],
      answer: {
        interview: `**All exceptions inherit from \`BaseException\`. Application errors inherit from \`Exception\`; \`SystemExit\`, \`KeyboardInterrupt\` and \`GeneratorExit\` inherit directly from \`BaseException\` so a normal \`except Exception\` does not catch them.**

- Useful families: \`LookupError\` (\`KeyError\`, \`IndexError\`), \`ArithmeticError\` (\`ZeroDivisionError\`), \`OSError\` (\`FileNotFoundError\`, \`PermissionError\`), \`ValueError\`, \`TypeError\`.
- Catching a parent catches every child: \`except LookupError\` handles both \`KeyError\` and \`IndexError\`.
- Custom exception: subclass \`Exception\` (never \`BaseException\`), usually with a project-wide base class: \`class AppError(Exception)\`, then \`class NotFoundError(AppError)\`.
- Add useful attributes (e.g. \`status_code\`, \`field\`) and call \`super().__init__(message)\`.
- Name them with an \`Error\` suffix.

Real-world: an API layer catches \`AppError\` once and maps each subclass to an HTTP status.`,
        explanationBn: `Python-এর সব exception একটা গাছের মতো (hierarchy) সাজানো। একদম মূলে \`BaseException\`। তার নিচে দুটো ধারা:

- **\`Exception\`** — সাধারণ program-এর সব error: \`ValueError\`, \`TypeError\`, \`KeyError\`, \`FileNotFoundError\`...
- **সরাসরি \`BaseException\`-এর সন্তান** — \`KeyboardInterrupt\` (Ctrl+C), \`SystemExit\` (\`sys.exit()\`)। এরা আসলে "error" না, program বন্ধ করার সংকেত। তাই এগুলো \`Exception\`-এর বাইরে রাখা হয়েছে, যাতে \`except Exception\` লিখলে ভুল করে Ctrl+C আটকে না যায়।

Hierarchy-র সুবিধা: parent ধরলে সব child ধরা পড়ে। \`except LookupError\` একসাথে \`KeyError\` আর \`IndexError\` দুটোই সামলায়। \`except OSError\` file-সংক্রান্ত সব error সামলায়।

**Custom exception কেন?** \`raise Exception("user not found")\` লিখলে caller শুধু message-এর string পড়ে বুঝতে পারে কী হয়েছে — ভঙ্গুর পদ্ধতি। নিজের exception class থাকলে caller নির্দিষ্টভাবে \`except UserNotFoundError\` ধরতে পারে।

ভালো অভ্যাস:
1. Project-এর জন্য একটা base exception (\`AppError\`), বাকি সব তার subclass — তাহলে এক জায়গায় সব app error ধরা যায়।
2. \`Exception\` থেকে inherit করুন, \`BaseException\` থেকে কখনো না।
3. দরকারি তথ্য attribute হিসেবে রাখুন — যেমন কোন field ভুল, কোন HTTP status।`,
        examples: [
          {
            lang: 'python',
            code: `print(issubclass(KeyError, LookupError), issubclass(IndexError, LookupError))
print(issubclass(FileNotFoundError, OSError))
print(issubclass(KeyboardInterrupt, Exception))

class AppError(Exception):
    status_code = 500

class NotFoundError(AppError):
    status_code = 404
    def __init__(self, resource, key):
        super().__init__(f"{resource} {key!r} not found")
        self.resource, self.key = resource, key

def handle(fn):
    try:
        return fn()
    except AppError as e:          # one handler for every app error
        return f"{e.status_code}: {e}"

def get_user():
    raise NotFoundError("user", 42)

print(handle(get_user))`,
            output: `True True
True
False
404: user 42 not found`,
          },
        ],
        pitfalls: [
          'Inheriting custom exceptions from `BaseException` makes them escape `except Exception` handlers.',
          "Catching a broad parent class before a specific child makes the child's handler unreachable.",
        ],
        followUps: [
          'What does `raise ... from ...` do?',
          'Why does `KeyboardInterrupt` not inherit from `Exception`?',
        ],
      },
      related: ['py-raise-from', 'py-try-except-else-finally'],
    },
    {
      id: 'py-file-read-write',
      level: 'foundation',
      priority: 2,
      question: 'How do you read and write files in Python, and how do you read a very large file?',
      tags: ['files', 'io', 'with', 'modes', 'large-files'],
      answer: {
        interview: `**Open files with \`with open(path, mode, encoding="utf-8") as f:\` so they are closed automatically. Iterate over the file object to read it line by line — that streams the file and keeps memory constant, however large it is.**

- Modes: \`"r"\` read (default), \`"w"\` write (truncates!), \`"a"\` append, \`"x"\` create only if missing, \`"b"\` binary, \`"+"\` read and write.
- \`f.read()\` loads everything; \`f.readline()\` one line; \`f.readlines()\` a list of all lines — avoid the last two for big files.
- \`for line in f:\` reads lazily, one buffered line at a time; strip the trailing \`"\\n"\`.
- For binary files, read in fixed-size chunks: \`while chunk := f.read(65536):\`.
- Always pass \`encoding=\`; the platform default differs between Windows and Linux.
- \`pathlib.Path\` offers \`read_text\`, \`write_text\` and path handling.

Real-world: scanning a multi-gigabyte log for errors with \`for line in f\` uses a few kilobytes of memory.`,
        explanationBn: `**মূল নিয়ম: সবসময় \`with\` দিয়ে file খুলুন।** \`with\` block শেষ হলে file নিজে থেকে বন্ধ হয় — error হলেও। হাতে \`open\`/\`close\` করলে error-এর ক্ষেত্রে file খোলা থেকে যেতে পারে।

**Mode গুলো:**
- \`"r"\` — পড়া (default)। File না থাকলে error।
- \`"w"\` — লেখা। **সাবধান:** file আগে থেকে থাকলে তার সব content মুছে ফেলে!
- \`"a"\` — শেষে যোগ করা (append)।
- \`"x"\` — নতুন file তৈরি; আগে থাকলে error — ভুল করে overwrite থেকে বাঁচায়।
- \`"b"\` যোগ করলে binary (\`"rb"\`, \`"wb"\`) — image, PDF-এর জন্য।

**বড় file পড়া — interview-এর আসল প্রশ্ন:** \`f.read()\` পুরো file একবারে memory-তে তোলে। ১০ GB-এর log file হলে program ক্র্যাশ। সমাধান হলো **file object-এর ওপর সরাসরি loop**:
\`\`\`python
for line in f:
    ...
\`\`\`
File object নিজেই একটা iterator — প্রতিবার একটা লাইন পড়ে দেয়। Memory-তে একসাথে মাত্র একটা লাইন (আর ছোট একটা buffer) থাকে, file যত বড়ই হোক।

Binary file-এ "লাইন" বলে কিছু নেই, তাই নির্দিষ্ট আকারের টুকরো (chunk) করে পড়া হয়।

আর সবসময় \`encoding="utf-8"\` লিখুন — না লিখলে Windows-এ অন্য encoding ধরে বাংলা লেখা ভেঙে যেতে পারে।`,
        examples: [
          {
            lang: 'python',
            code: `import os, tempfile

path = os.path.join(tempfile.mkdtemp(), "app.log")

with open(path, "w", encoding="utf-8") as f:          # "w" truncates
    f.write("INFO start\\nERROR disk full\\n")

with open(path, "a", encoding="utf-8") as f:          # "a" appends
    f.write("ERROR timeout\\n")

with open(path, encoding="utf-8") as f:
    errors = [line.rstrip("\\n") for line in f if line.startswith("ERROR")]
print(errors)

with open(path, "rb") as f:                          # binary, in chunks
    total = 0
    while chunk := f.read(8):
        total += len(chunk)
print(total == os.path.getsize(path))`,
            output: `['ERROR disk full', 'ERROR timeout']
True`,
          },
        ],
        pitfalls: [
          'Opening with `"w"` erases the existing file immediately.',
          '`readlines()` and `read()` load the whole file into memory.',
          'Lines read from a file keep their trailing newline.',
        ],
        followUps: [
          'How would you process a 20 GB CSV file?',
          'Why use `with` instead of calling `close()`?',
          'What does `pathlib` offer over `os.path`?',
        ],
      },
      related: ['py-context-managers', 'py-json'],
    },
    {
      id: 'py-json',
      level: 'foundation',
      priority: 2,
      question: 'How do you work with JSON in Python?',
      tags: ['json', 'serialization', 'files'],
      answer: {
        interview: `**Use the \`json\` module: \`json.dumps(obj)\` → string, \`json.loads(text)\` → Python objects, and \`json.dump(obj, f)\` / \`json.load(f)\` for files.**

- Mapping: object ↔ \`dict\`, array ↔ \`list\`, string ↔ \`str\`, number ↔ \`int\`/\`float\`, \`true\`/\`false\` ↔ \`True\`/\`False\`, \`null\` ↔ \`None\`.
- Tuples become lists; dict keys become strings (\`{1: "a"}\` round-trips as \`{"1": "a"}\`).
- \`indent=2\` pretty-prints; \`ensure_ascii=False\` keeps non-ASCII text (e.g. Bangla) readable; \`sort_keys=True\` for stable output.
- \`datetime\`, \`Decimal\`, \`set\` and custom objects are not serializable by default — use \`default=\` (e.g. \`default=str\`) or convert first.
- Invalid input raises \`json.JSONDecodeError\` (a subclass of \`ValueError\`).

Real-world: \`json.loads(response.text)\` for API payloads; \`json.dump(config, f, indent=2)\` for config files.`,
        explanationBn: `JSON হলো data আদান-প্রদানের সবচেয়ে প্রচলিত format — API, config file, সবখানে। Python-এ \`json\` module দিয়ে কাজ হয়, চারটা function মনে রাখলেই চলে:

- \`dumps\` — Python object → JSON **string** (s মানে string)
- \`loads\` — JSON string → Python object
- \`dump\` / \`load\` — একই কাজ, কিন্তু সরাসরি **file**-এ

**রূপান্তরের কিছু ফাঁদ:**
- Tuple JSON-এ যায় array হয়ে, ফেরত আসে **list** হয়ে।
- JSON-এ object-এর key শুধু string হতে পারে — তাই \`{1: "a"}\` ফেরত আসে \`{"1": "a"}\` হয়ে।
- \`datetime\`, \`Decimal\`, \`set\` বা নিজের class — এগুলো JSON সরাসরি বোঝে না, \`TypeError\` দেয়। সমাধান: \`default=str\` দিলে অপরিচিত object string হয়ে যায়, অথবা নিজে convert করুন।

**বাংলা লেখার জন্য:** default-এ JSON non-ASCII character-কে \`\\u0986\`-এর মতো escape করে। \`ensure_ascii=False\` দিলে বাংলা যেমন আছে তেমন থাকে — পড়তে সুবিধা।

ভুল JSON পেলে \`json.JSONDecodeError\` হয় — বাইরের data নিয়ে কাজ করলে এটা ধরা উচিত।`,
        examples: [
          {
            lang: 'python',
            code: `import json
from datetime import date

data = {"name": "রফি", "tags": ("py", "js"), 1: None, "ok": True}
text = json.dumps(data, ensure_ascii=False)
print(text)
print(json.loads(text))

print(json.dumps({"day": date(2024, 1, 15)}, default=str))

try:
    json.loads("{bad json}")
except json.JSONDecodeError as e:
    print(type(e).__name__, isinstance(e, ValueError))`,
            output: `{"name": "রফি", "tags": ["py", "js"], "1": null, "ok": true}
{'name': 'রফি', 'tags': ['py', 'js'], '1': None, 'ok': True}
{"day": "2024-01-15"}
JSONDecodeError True`,
          },
        ],
        pitfalls: [
          'Round-tripping changes types: tuples become lists, int keys become strings.',
          '`json.dumps` on `datetime` or `Decimal` raises `TypeError` without a `default=`.',
        ],
        followUps: ['How would you serialize a custom class to JSON?'],
      },
      related: ['py-file-read-write'],
    },
    {
      id: 'py-module-vs-package',
      level: 'foundation',
      priority: 2,
      question: 'What is the difference between a module and a package? What is `__init__.py` for?',
      tags: ['modules', 'packages', '__init__', 'imports'],
      answer: {
        interview: `**A module is a single \`.py\` file. A package is a directory of modules (and sub-packages), traditionally marked by an \`__init__.py\` file.**

- \`import shop.cart\` imports the \`cart\` module from the \`shop\` package.
- \`__init__.py\` runs when the package is first imported. It can be empty, or it can expose a clean API (\`from .cart import Cart\`) and define \`__all__\`.
- Without \`__init__.py\`, Python 3.3+ treats the folder as a *namespace package* — it works, but tools and explicit packaging usually expect the file.
- Absolute imports (\`from shop.cart import Cart\`) are preferred; relative imports (\`from .cart import Cart\`) only work inside packages.
- Every module is imported once per process and cached in \`sys.modules\`.

Real-world: \`requests\` is a package; \`requests/__init__.py\` re-exports \`get\`, \`post\` and \`Session\` so users never import submodules directly.`,
        explanationBn: `- **Module** = একটা \`.py\` file। \`utils.py\` একটা module, তার ভেতরের function \`import utils\` দিয়ে ব্যবহার করা যায়।
- **Package** = module গুলো রাখার একটা folder। বড় project-কে গুছিয়ে রাখার উপায় — যেমন \`shop/cart.py\`, \`shop/payment.py\`।

**\`__init__.py\`-এর ভূমিকা:**
1. Folder-টাকে "এটা একটা package" হিসেবে চিহ্নিত করা।
2. Package প্রথমবার import হলে এই file-টা চলে — তাই এখানে initialization code রাখা যায়।
3. সবচেয়ে কাজের ব্যবহার: **package-এর public API সাজানো।** ভেতরে অনেক file থাকলেও \`__init__.py\`-তে \`from .cart import Cart\` লিখে দিলে user সরাসরি \`from shop import Cart\` লিখতে পারে — ভেতরের file কাঠামো জানার দরকার নেই।

Python 3.3 থেকে \`__init__.py\` ছাড়াও folder import করা যায় (namespace package), কিন্তু সাধারণ project-এ file-টা রাখাই ভালো — অনেক tool এটাই আশা করে।

**Import শুধু একবার চলে:** একই module দশ জায়গা থেকে import করলেও প্রথমবারই execute হয়, তারপর \`sys.modules\` থেকে cache করা copy দেয়। এজন্যই module-level variable সব জায়গায় share হয়।`,
        examples: [
          {
            lang: 'text',
            caption: 'A small package layout',
            code: `shop/
├── __init__.py        # from .cart import Cart  →  lets users write: from shop import Cart
├── cart.py
└── payment/
    ├── __init__.py
    └── stripe.py      # import shop.payment.stripe`,
          },
          {
            lang: 'python',
            caption: 'json is a package; its submodules are modules, and imports are cached',
            code: `import sys
import json
import json.decoder

print(hasattr(json, "__path__"), hasattr(json.decoder, "__path__"))
print("json" in sys.modules)
import json as again
print(again is json)`,
            output: `True False
True
True`,
          },
        ],
        pitfalls: [
          'Heavy work in `__init__.py` slows down every import of the package.',
          'Relative imports fail when a module inside a package is run directly as a script; use `python -m`.',
        ],
        followUps: [
          'What is a circular import, and how do you fix it?',
          'How does Python find a module when you import it?',
        ],
      },
      related: ['py-name-main', 'py-circular-imports', 'py-import-system'],
    },
    {
      id: 'py-venv-pip',
      level: 'foundation',
      priority: 2,
      question:
        'What is a virtual environment, and how do `pip`, `requirements.txt` and `pyproject.toml` fit in?',
      tags: ['venv', 'pip', 'dependencies', 'packaging', 'tooling'],
      answer: {
        interview: `**A virtual environment is an isolated Python installation for one project, with its own \`site-packages\`, so each project can have its own dependency versions without conflicts.**

- Create and activate: \`python -m venv .venv\`, then \`source .venv/bin/activate\` (Linux/macOS) or \`.venv\\Scripts\\activate\` (Windows).
- \`pip install package\` installs into the active environment.
- \`requirements.txt\` is a plain list of pinned dependencies (\`pip freeze > requirements.txt\`, \`pip install -r requirements.txt\`) — common for applications.
- \`pyproject.toml\` is the modern standard project file: metadata, dependencies, build system and tool settings (ruff, pytest). Tools like Poetry, PDM, Hatch and uv use it, plus a lock file for exact versions.
- Never commit the \`.venv\` folder; commit the dependency files.

Real-world: two services needing Django 4 and Django 5 on the same machine each get their own venv.`,
        explanationBn: `ধরুন একটা পুরনো project-এ Django 4 লাগে আর নতুন project-এ Django 5। সব package যদি computer-এর একটাই Python-এ install হয়, তাহলে দুটো একসাথে চলবে না। **Virtual environment** এই সমস্যার সমাধান — প্রতিটা project-এর জন্য আলাদা, বিচ্ছিন্ন একটা Python পরিবেশ, যার নিজস্ব package folder।

কাজের ধাপ:
1. \`python -m venv .venv\` — project folder-এ environment তৈরি।
2. Activate — এরপর \`python\` আর \`pip\` এই environment-এরটাই ব্যবহার করবে।
3. \`pip install ...\` — package গুলো শুধু এই project-এ install হয়।

**Dependency তালিকা রাখার দুটো উপায়:**
- **\`requirements.txt\`** — সরল একটা তালিকা, প্রতি লাইনে একটা package আর version। \`pip freeze\` দিয়ে তৈরি, \`pip install -r\` দিয়ে install। App deploy করতে সহজ।
- **\`pyproject.toml\`** — আধুনিক standard। এক file-এ project-এর নাম, version, dependency, build পদ্ধতি, এমনকি ruff বা pytest-এর setting। Poetry, uv-এর মতো tool এর সাথে একটা **lock file** রাখে, যেখানে প্রতিটা package-এর (indirect dependency সহ) হুবহু version লেখা থাকে — ফলে সব machine-এ একই environment তৈরি হয়।

\`.venv\` folder কখনো git-এ commit করবেন না — এটা বড় আর machine-নির্ভর। Commit করুন dependency file গুলো।`,
        examples: [
          {
            lang: 'bash',
            caption: 'Typical workflow',
            code: `python -m venv .venv
source .venv/bin/activate          # Windows: .venv\\Scripts\\activate
pip install "requests==2.32.*"
pip freeze > requirements.txt
pip install -r requirements.txt    # on another machine`,
          },
          {
            lang: 'text',
            caption: 'A minimal pyproject.toml',
            code: `[project]
name = "shop"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["requests>=2.32", "pydantic>=2"]

[tool.ruff]
line-length = 100`,
          },
        ],
        pitfalls: [
          'Installing packages globally with `sudo pip` breaks system tools on Linux.',
          'Unpinned requirements produce different environments on different days.',
        ],
        followUps: ['What is a lock file, and why does it matter?'],
      },
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'py-context-managers',
      level: 'intermediate',
      priority: 2,
      question: 'What is a context manager? Write one as a class and with `@contextmanager`.',
      tags: ['context-managers', 'with', '__enter__', '__exit__', 'contextlib'],
      answer: {
        interview: `**A context manager sets something up when a \`with\` block starts and guarantees cleanup when it ends — even if an exception is raised.**

- Class-based: \`__enter__\` returns the value bound by \`as\`; \`__exit__(exc_type, exc, tb)\` runs on exit and receives any exception.
- If \`__exit__\` returns \`True\`, the exception is suppressed; otherwise it propagates.
- \`@contextlib.contextmanager\` turns a generator into one: code before \`yield\` is setup, the yielded value is bound by \`as\`, code after \`yield\` (in a \`finally\`) is cleanup.
- Built-ins: files, locks (\`threading.Lock\`), database transactions, \`decimal.localcontext\`, \`contextlib.suppress\`, \`tempfile.TemporaryDirectory\`.
- Several can share one \`with\`: \`with open(a) as f, open(b) as g:\`.

Real-world: a \`with transaction():\` block that commits on success and rolls back on any exception.`,
        explanationBn: `অনেক কাজে একটা "শুরু" আর একটা "শেষ" থাকে, আর শেষটা **অবশ্যই** হতে হবে: file খুললে বন্ধ করতে হবে, lock নিলে ছাড়তে হবে, database transaction শুরু করলে commit বা rollback করতে হবে। Error হলেও যেন শেষটা বাদ না পড়ে — এটাই context manager নিশ্চিত করে।

\`with\` statement দুটো method ব্যবহার করে:
- **\`__enter__\`** — block শুরুর সময় চলে (setup)। এর return value \`as\`-এর পরের নামে বসে।
- **\`__exit__\`** — block শেষে চলে (cleanup), সফল হোক বা exception হোক। Exception হলে তার তথ্য argument হিসেবে পায়।

\`__exit__\` যদি \`True\` return করে, exception "গিলে ফেলা" হয় — বাইরে যায় না। সাধারণত এটা করা উচিত না, বিশেষ ক্ষেত্র ছাড়া।

**\`@contextmanager\` — সহজ উপায়:** পুরো class না লিখে একটা generator function লিখুন:
\`\`\`python
@contextmanager
def opened(path):
    f = open(path)      # setup
    try:
        yield f         # with block এখানে চলে
    finally:
        f.close()       # cleanup
\`\`\`
\`yield\`-এর আগের অংশ = \`__enter__\`, পরের অংশ = \`__exit__\`। Cleanup অবশ্যই \`finally\`-তে রাখুন — নইলে block-এ exception হলে cleanup চলবে না।

\`try/finally\`-এর সাথে পার্থক্য কী? কাজ একই, কিন্তু context manager-এ setup আর cleanup **এক জায়গায় পুনঃব্যবহারযোগ্য** — প্রতিবার \`try/finally\` লিখতে হয় না, ভুলে যাওয়ার সুযোগও নেই।`,
        examples: [
          {
            lang: 'python',
            caption: 'Class-based: a transaction that commits or rolls back',
            code: `class Transaction:
    def __init__(self, db):
        self.db = db

    def __enter__(self):
        print("BEGIN")
        return self.db

    def __exit__(self, exc_type, exc, tb):
        if exc_type is None:
            print("COMMIT")
        else:
            print(f"ROLLBACK because of {exc_type.__name__}")
        return False                 # do not suppress the exception

db = []
with Transaction(db) as conn:
    conn.append("insert 1")

try:
    with Transaction(db) as conn:
        conn.append("insert 2")
        raise ValueError("bad row")
except ValueError:
    print("caller still sees the error")`,
            output: `BEGIN
COMMIT
BEGIN
ROLLBACK because of ValueError
caller still sees the error`,
          },
          {
            lang: 'python',
            caption: 'Generator-based with @contextmanager',
            code: `from contextlib import contextmanager, suppress

@contextmanager
def tag(name):
    print(f"<{name}>")
    try:
        yield name.upper()
    finally:
        print(f"</{name}>")          # runs even on error

with tag("div") as label:
    print("inside", label)

with suppress(KeyError):             # a ready-made context manager
    {}["missing"]
print("KeyError was suppressed")`,
            output: `<div>
inside DIV
</div>
KeyError was suppressed`,
          },
        ],
        pitfalls: [
          'In a `@contextmanager` generator, cleanup outside `try/finally` is skipped when the block raises.',
          'Returning a truthy value from `__exit__` silently swallows exceptions.',
        ],
        followUps: [
          'How does `__exit__` decide whether to suppress an exception?',
          'What does `contextlib.ExitStack` do?',
        ],
      },
      related: ['py-try-except-else-finally', 'py-file-read-write', 'py-exit-suppression'],
    },
    {
      id: 'py-return-in-finally',
      level: 'intermediate',
      priority: 2,
      question: 'What happens when both `try` and `finally` contain a `return` statement?',
      tags: ['exceptions', 'finally', 'return', 'gotchas'],
      answer: {
        interview: `**The \`finally\` block's \`return\` wins. When \`try\` hits \`return\`, the value is held while \`finally\` runs; a \`return\` in \`finally\` replaces it — and also discards any exception that was propagating.**

- \`def f(): try: return 1 finally: return 2\` returns \`2\`.
- If \`try\` raised an exception and \`finally\` returns, the exception disappears silently.
- \`break\` and \`continue\` in \`finally\` behave the same way.
- Python 3.14 starts emitting a \`SyntaxWarning\` for this (PEP 765) — it is almost always a bug.
- Without a \`return\` in \`finally\`, the \`try\` block's return value is kept even though \`finally\` runs afterwards.

Real-world: a "cleanup" block that ends with \`return None\` can hide real errors in production.`,
        explanationBn: `\`try\`-এর ভেতরে \`return\` থাকলেও \`finally\` চলবেই — এটা আগে দেখেছি। প্রশ্ন হলো, দুই জায়গাতেই \`return\` থাকলে কোনটা জিতবে?

যা ঘটে ধাপে ধাপে:
1. \`try\`-এ \`return 1\` পৌঁছায়। Python value \`1\` তৈরি করে, কিন্তু function থেকে তখনই বের হয় না — "pending" রাখে, কারণ আগে \`finally\` চালাতে হবে।
2. \`finally\` চলে, আর সেখানে \`return 2\`। এটা একটা নতুন return — pending থাকা \`1\`-কে **বাতিল করে** দেয়।
3. Function \`2\` ফেরত দেয়।

আরও বিপজ্জনক দিক: \`try\`-এ যদি exception হতো, আর \`finally\`-তে \`return\` থাকত, তাহলে exception-টা **চুপচাপ হারিয়ে যেত** — caller কখনো জানতেই পারত না কিছু ভুল হয়েছিল। Production-এ এমন bug খুঁজে পাওয়া খুব কঠিন।

এজন্য নিয়ম: \`finally\`-তে কখনো \`return\`, \`break\` বা \`continue\` লিখবেন না — শুধু cleanup। Python 3.14 থেকে এর জন্য warning দেওয়া শুরু হয়েছে।`,
        examples: [
          {
            lang: 'python',
            code: `def which():
    try:
        return "from try"
    finally:
        return "from finally"

def swallow():
    try:
        raise ValueError("important error")
    finally:
        return "everything is fine?"

def normal():
    try:
        return "from try"
    finally:
        print("cleanup runs, value kept")

print(which())
print(swallow())        # the ValueError vanished
print(normal())`,
            output: `from finally
everything is fine?
cleanup runs, value kept
from try`,
          },
        ],
        pitfalls: [
          'A `return` in `finally` silently swallows exceptions.',
          'Mutating a returned object in `finally` *does* affect the result, because the same object is returned.',
        ],
        followUps: ['What happens to an exception if `finally` itself raises?'],
      },
      visualizationId: 'py-try-except-flow',
      related: ['py-try-except-else-finally'],
    },
    {
      id: 'py-raise-from',
      level: 'intermediate',
      priority: 2,
      question:
        'What does `raise ... from ...` do, and how is it different from raising inside `except`?',
      tags: ['exceptions', 'chaining', 'raise-from', '__cause__'],
      answer: {
        interview: `**\`raise NewError(...) from original\` chains exceptions explicitly: it sets \`__cause__\`, and the traceback shows both with "The above exception was the direct cause of the following exception".**

- Raising inside an \`except\` *without* \`from\` chains implicitly via \`__context__\` ("During handling of the above exception, another exception occurred") — which reads like a bug in the handler.
- \`from e\` says the translation is intentional.
- \`raise ... from None\` suppresses the context when the original error is an irrelevant implementation detail.
- Use it to translate low-level errors into domain errors at a boundary while keeping the root cause for debugging.

Real-world: \`except KeyError as e: raise ConfigError(f"missing setting {name}") from e\`.`,
        explanationBn: `ধরুন একটা low-level error (\`KeyError\`) ধরে আপনি তার বদলে একটা অর্থবহ domain error (\`ConfigError\`) raise করছেন। কারণ caller-এর কাছে "config-এ setting নেই" কথাটা "KeyError: 'DB_URL'"-এর চেয়ে বেশি অর্থবহ।

কিন্তু মূল কারণটা হারিয়ে গেলে debugging কঠিন। \`raise ... from e\` দুটোকে জুড়ে দেয়:
- নতুন exception-এর \`__cause__\`-এ মূল exception রাখা হয়।
- Traceback-এ দুটোই দেখায়, মাঝখানে লেখা: "The above exception was the direct cause of the following exception" — অর্থাৎ "আমি ইচ্ছাকৃতভাবে এটা রূপান্তর করেছি"।

\`from\` না লিখে \`except\`-এর ভেতরে raise করলেও Python মূল exception মনে রাখে (\`__context__\`-এ), কিন্তু তখন লেখা থাকে "During handling of the above exception, another exception occurred" — যেটা পড়লে মনে হয় handler-এর ভেতরে নিজেই একটা অপ্রত্যাশিত bug হয়েছে।

আর \`from None\` দিলে মূল exception লুকিয়ে ফেলা হয় — যখন সেটা সত্যিই অপ্রাসঙ্গিক, ভেতরের খুঁটিনাটি।`,
        examples: [
          {
            lang: 'python',
            code: `class ConfigError(Exception):
    pass

settings = {"host": "localhost"}

def get_setting(name):
    try:
        return settings[name]
    except KeyError as e:
        raise ConfigError(f"missing setting {name!r}") from e

try:
    get_setting("port")
except ConfigError as err:
    print(err)
    print(type(err.__cause__).__name__, err.__cause__)

try:
    try:
        int("x")
    except ValueError:
        raise ConfigError("bad number") from None
except ConfigError as err:
    print(err.__cause__, err.__suppress_context__)`,
            output: `missing setting 'port'
KeyError 'port'
None True`,
          },
        ],
        followUps: ['What is the difference between `__cause__` and `__context__`?'],
      },
      related: ['py-exception-hierarchy-custom'],
    },
    {
      id: 'py-eafp-vs-lbyl',
      level: 'intermediate',
      priority: 2,
      question: 'What are EAFP and LBYL? Which is more Pythonic?',
      tags: ['exceptions', 'eafp', 'lbyl', 'idioms', 'race-conditions'],
      answer: {
        interview: `**LBYL ("Look Before You Leap") checks preconditions first; EAFP ("Easier to Ask Forgiveness than Permission") just tries the operation and handles the exception. EAFP is the idiomatic Python style.**

- LBYL: \`if key in d: value = d[key]\`. EAFP: \`try: value = d[key] except KeyError: ...\`.
- EAFP avoids race conditions: with files, the file can disappear between \`os.path.exists()\` and \`open()\`.
- EAFP fits duck typing — try to use the object, instead of checking its type first.
- Exceptions are cheap when not raised, so EAFP is fast when failure is rare; if failure is common, an \`if\` check can be faster.
- Keep the \`try\` block tiny so you do not catch unrelated errors.

Real-world: \`try: return int(user_input) except ValueError: return None\` instead of trying to validate the string's format first.`,
        explanationBn: `দুটো দর্শন:

- **LBYL — "লাফ দেওয়ার আগে দেখে নাও":** আগে সব শর্ত চেক করো, তারপর কাজ করো। \`if key in d:\` তারপর \`d[key]\`।
- **EAFP — "অনুমতি চাওয়ার চেয়ে ক্ষমা চাওয়া সহজ":** সরাসরি কাজটা করো, সমস্যা হলে exception ধরে সামলাও।

Python community EAFP পছন্দ করে, তিনটা কারণে:

**১. Race condition এড়ানো:** \`if os.path.exists(path): open(path)\` — চেক আর খোলার মাঝখানে অন্য কোনো process file-টা মুছে দিতে পারে, তখন চেক করার পরেও crash। EAFP-এ শুধু \`open\` করে \`FileNotFoundError\` ধরুন — মাঝখানে কোনো ফাঁক নেই।

**২. Duck typing-এর সাথে মানানসই:** object-এর type চেক না করে সরাসরি ব্যবহার করুন।

**৩. পরিষ্কার code:** অনেক শর্ত চেক করার বদলে মূল কাজটা সামনে থাকে।

Performance: Python-এ exception না হলে \`try\`-এর খরচ প্রায় শূন্য। কিন্তু exception raise হওয়া তুলনামূলক ব্যয়বহুল। তাই ব্যর্থতা যদি **বিরল** হয় → EAFP দ্রুত। ব্যর্থতা যদি **ঘনঘন** হয় (যেমন অর্ধেক key-ই নেই) → \`if\` বা \`.get()\` ভালো।

সতর্কতা: \`try\` block ছোট রাখুন — শুধু সেই লাইন, যেটা ব্যর্থ হতে পারে।`,
        examples: [
          {
            lang: 'python',
            code: `def parse_age_lbyl(text):
    if text.strip().isdigit():          # misses "-5", "+7", " 42 " edge cases
        return int(text)
    return None

def parse_age_eafp(text):
    try:
        return int(text)
    except ValueError:
        return None

for raw in ["42", " 42 ", "-5", "abc"]:
    print(repr(raw), parse_age_lbyl(raw), parse_age_eafp(raw))`,
            output: `'42' 42 42
' 42 ' 42 42
'-5' None -5
'abc' None None`,
          },
          {
            lang: 'python',
            caption: 'EAFP with files avoids the check-then-open race',
            code: `def read_config(path):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "{}"

print(read_config("/definitely/missing.json"))`,
            output: `{}`,
          },
        ],
        pitfalls: [
          'A large `try` block can catch errors from code you did not intend to protect.',
          'When failures are frequent, raising exceptions in a hot loop is slower than a check.',
        ],
        followUps: ['Why is `os.path.exists()` before `open()` a race condition?'],
      },
      related: ['py-duck-typing', 'py-try-except-else-finally'],
    },
    {
      id: 'py-circular-imports',
      level: 'intermediate',
      priority: 2,
      question: 'What is a circular import, and how do you fix it?',
      tags: ['modules', 'imports', 'circular-imports', 'architecture'],
      answer: {
        interview: `**A circular import happens when module A imports B while B (directly or indirectly) imports A. Because a module is added to \`sys.modules\` before it finishes executing, the second import gets a half-initialized module, and names that are not defined yet raise \`ImportError\` or \`AttributeError\`.**

- Typical error: \`ImportError: cannot import name 'X' from partially initialized module 'a' (most likely due to a circular import)\`.
- **Best fix:** restructure — move the shared code into a third module both can import.
- Import the module, not the name: \`import a\` then use \`a.X\` at call time (names are resolved later).
- Move the import inside the function that needs it (lazy import).
- For type hints only, use \`from typing import TYPE_CHECKING\` and \`if TYPE_CHECKING: import ...\`.

Real-world: \`models.py\` and \`services.py\` importing each other — pull the shared pieces into \`schemas.py\`.`,
        explanationBn: `Circular import মানে দুটো module একে অপরকে import করছে: \`a.py\` লেখে \`from b import x\`, আর \`b.py\` লেখে \`from a import y\`।

কেন সমস্যা হয়? Python যখন \`a\` import করে:
1. \`a\`-কে \`sys.modules\`-এ যোগ করে (এখনো অসম্পূর্ণ), তারপর \`a.py\`-র code উপর থেকে চালাতে শুরু করে।
2. প্রথম লাইনেই \`from b import x\` — তাই \`b.py\` চালাতে যায়।
3. \`b.py\`-র প্রথম লাইন \`from a import y\` — Python দেখে \`a\` তো \`sys.modules\`-এ আছে, সেটাই নেয়। কিন্তু \`a\` এখনো প্রথম লাইনেই আটকে আছে — \`y\` তখনো define-ই হয়নি!
4. ফলাফল: \`ImportError: cannot import name 'y' from partially initialized module 'a'\`।

Analogy: দুজন মানুষ একে অপরকে বলছে "তুমি আগে বলো, তারপর আমি বলব" — কেউই শুরু করতে পারছে না।

**সমাধান (ভালো থেকে কম ভালো):**
1. **কাঠামো ঠিক করা** — দুজনের দরকারি অংশ তৃতীয় একটা module-এ সরিয়ে নিন। Circular import সাধারণত design সমস্যার লক্ষণ।
2. **পুরো module import করুন** (\`import a\`), আর নাম ব্যবহার করুন function-এর ভেতরে (\`a.y\`) — তখন নাম খোঁজা হয় পরে, যখন সব load হয়ে গেছে।
3. **Function-এর ভেতরে import** — দরকারের মুহূর্তে import।
4. শুধু type hint-এর জন্য হলে \`TYPE_CHECKING\` block।`,
        examples: [
          {
            lang: 'python',
            caption: 'Before: models.py and services.py import each other',
            code: `# models.py
from services import send_welcome      # imports services first ...

class User:
    def register(self):
        send_welcome(self)

# services.py
from models import User                # ... which imports models: circular!

def send_welcome(user: User): ...`,
          },
          {
            lang: 'python',
            caption: 'After: a lazy import inside the function, and a type-only import',
            code: `# models.py
class User:
    def register(self):
        from services import send_welcome   # resolved at call time
        send_welcome(self)

# services.py
from typing import TYPE_CHECKING
if TYPE_CHECKING:                           # never runs at runtime
    from models import User

def send_welcome(user: "User"): ...`,
          },
        ],
        pitfalls: [
          'Lazy imports hide the dependency; restructuring is the real fix.',
          'Circular imports may "work" in one import order and fail in another.',
        ],
        followUps: ['How does Python cache modules during import?'],
      },
      related: ['py-module-vs-package', 'py-import-system'],
    },
    {
      id: 'py-broad-except',
      level: 'intermediate',
      priority: 1,
      question:
        'Why is catching every exception (`except:` or `except Exception:`) considered bad practice?',
      tags: ['exceptions', 'best-practices', 'logging'],
      answer: {
        interview: `**Because it hides bugs: typos, \`TypeError\`s and unexpected failures get swallowed and the program continues in a broken state.**

- Bare \`except:\` is worse — it also catches \`KeyboardInterrupt\` and \`SystemExit\`, so Ctrl+C and \`sys.exit()\` stop working.
- Catch the specific exceptions you can actually handle.
- A broad \`except Exception\` is acceptable at a top-level boundary (request handler, worker loop) **if you log it with the traceback** (\`logger.exception(...)\`) and fail safely.
- Never \`except: pass\` silently.

Real-world: a background job wrapped in \`except Exception: pass\` that "succeeded" for weeks while silently skipping every record.`,
        explanationBn: `সব exception ধরে ফেলা নিরাপদ মনে হয় — program অন্তত crash করবে না। কিন্তু আসলে এটা bug লুকিয়ে রাখে।

ধরুন code-এ একটা টাইপো আছে: \`user.emial\`। Exception না ধরলে সাথে সাথে \`AttributeError\` দেখে ঠিক করে ফেলতেন। কিন্তু \`except Exception: pass\` থাকলে program চুপচাপ চলতে থাকে, ভুল data নিয়ে — আর সমস্যাটা ধরা পড়ে অনেক পরে, অন্য কোথাও, অদ্ভুত রূপে।

**খালি \`except:\` আরও খারাপ** — এটা \`KeyboardInterrupt\` আর \`SystemExit\`-ও ধরে। ফলে Ctrl+C চাপলেও program বন্ধ হয় না।

তাহলে কখন broad except চলে? Program-এর **সীমানায়** — যেমন web server-এর request handler বা background worker-এর মূল loop। একটা request-এর জন্য পুরো server বন্ধ হওয়া উচিত না। কিন্তু সেখানে অবশ্যই \`logger.exception(...)\` দিয়ে পুরো traceback log করুন, যাতে পরে বোঝা যায় কী হয়েছিল।

নিয়ম: যে exception আপনি সত্যিই সামলাতে জানেন, শুধু সেটা ধরুন।`,
        examples: [
          {
            lang: 'python',
            code: `import logging, sys
logging.basicConfig(stream=sys.stdout, format="%(levelname)s %(message)s")
log = logging.getLogger("worker")

def process(record):
    return record["amount"] * 2

for record in [{"amount": 5}, {"amont": 7}]:      # second one has a typo
    try:
        print(process(record))
    except KeyError as e:                          # specific and logged
        log.error("record missing field %s", e)`,
            output: `10
ERROR record missing field 'amount'`,
          },
        ],
        pitfalls: ['`except Exception: pass` turns real failures into silent data corruption.'],
        followUps: ['When is a broad exception handler appropriate?'],
      },
      related: ['py-exception-hierarchy-custom'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'py-import-system',
      level: 'advanced',
      priority: 1,
      question: 'What happens step by step when you write `import x`?',
      tags: ['imports', 'sys.modules', 'sys.path', 'internals'],
      answer: {
        interview: `**Python checks the \`sys.modules\` cache; if the module is not there, it finds it via \`sys.path\` (using finders and loaders), creates a module object, registers it in \`sys.modules\`, executes the module's code in that object's namespace, then binds the name \`x\` in the importing scope.**

- Cache hit → no code runs again; that is why imports are cheap after the first time and module state is shared.
- \`sys.path\` order: the script's directory (or current directory), \`PYTHONPATH\`, the standard library, then \`site-packages\`.
- Registering *before* executing is what makes circular imports return partially initialized modules.
- Bytecode is cached in \`__pycache__\` as \`.pyc\`.
- A local file named like a standard module (\`random.py\`, \`json.py\`) shadows it — a classic bug.
- \`importlib.reload(x)\` re-executes a module; existing references to old objects are not updated.

Real-world: "AttributeError: module 'random' has no attribute 'randint'" usually means there is a \`random.py\` in your project.`,
        explanationBn: `\`import x\` লিখলে ভেতরে কয়েকটা ধাপ হয়:

1. **Cache চেক:** Python আগে \`sys.modules\` dict-এ দেখে \`x\` আগে import হয়েছে কি না। হয়ে থাকলে সেটাই নেয় — code আর চলে না। এজন্যই module একবারই execute হয়, আর সব জায়গায় একই module object share হয়।
2. **খোঁজা:** cache-এ না থাকলে \`sys.path\`-এর folder গুলোতে ক্রমানুসারে খোঁজে — প্রথমে script-এর নিজের folder, তারপর \`PYTHONPATH\`, তারপর standard library, শেষে \`site-packages\` (pip-এ install করা package)।
3. **Module object তৈরি** এবং সাথে সাথে **\`sys.modules\`-এ রাখা** — code চালানোর *আগেই*।
4. **Code execute:** module-এর পুরো code উপর থেকে নিচে চলে, আর যা কিছু define হয় সব module object-এর ভেতরে জমা হয়।
5. **নাম বসানো:** import করা file-এ \`x\` নামটা সেই module object-কে দেখায়।

ধাপ ৩-এর কারণেই circular import-এ অসম্পূর্ণ module পাওয়া যায়।

একটা খুব common bug: project-এ নিজের একটা file-এর নাম \`random.py\` বা \`json.py\` রাখলে, সেটা standard library-র module-কে ঢেকে দেয় (কারণ script-এর folder সবার আগে খোঁজা হয়)। তখন \`random.randint\` খুঁজতে গিয়ে আপনার নিজের file পায় — আর অদ্ভুত error।`,
        examples: [
          {
            lang: 'python',
            code: `import sys
import importlib

print("textwrap" in sys.modules)
import textwrap
print("textwrap" in sys.modules)
print(sys.modules["textwrap"] is textwrap)

again = importlib.import_module("textwrap")   # served from the cache
print(again is textwrap)`,
            output: `False
True
True
True`,
          },
        ],
        pitfalls: [
          'A project file named `random.py`, `json.py` or `email.py` shadows the standard library module.',
          '`importlib.reload` does not update objects that were already imported with `from x import y`.',
        ],
        followUps: ['Why do circular imports produce partially initialized modules?'],
      },
      related: ['py-circular-imports', 'py-module-vs-package', 'py-name-main'],
    },
    {
      id: 'py-exit-suppression',
      level: 'advanced',
      priority: 1,
      question:
        'How does `__exit__` receive and suppress exceptions, and what does `ExitStack` do?',
      tags: ['context-managers', '__exit__', 'exitstack', 'contextlib'],
      answer: {
        interview: `**\`__exit__(exc_type, exc_value, traceback)\` receives \`None, None, None\` on normal exit, or the exception's details if the block raised. Returning a truthy value suppresses the exception; returning \`None\`/\`False\` lets it propagate.**

- Suppression should be deliberate and narrow — \`contextlib.suppress(FileNotFoundError)\` is the standard tool.
- If \`__exit__\` itself raises, that new exception replaces the original one.
- \`contextlib.ExitStack\` manages a dynamic number of context managers: \`stack.enter_context(cm)\` in a loop, and all are exited in reverse order (LIFO) — even if one cleanup fails.
- Async code uses \`__aenter__\`/\`__aexit__\` and \`async with\`.

Real-world: \`ExitStack\` to open an unknown number of files from a list and guarantee they all close.`,
        explanationBn: `\`with\` block শেষ হলে Python \`__exit__\` ডাকে তিনটা argument দিয়ে:
- সব ঠিক থাকলে: \`None, None, None\`।
- Exception হলে: exception-এর type, object, আর traceback।

এখন \`__exit__\` কী return করে সেটার ওপর নির্ভর করে exception-এর ভাগ্য:
- **\`True\` (বা truthy)** → exception বাতিল, \`with\`-এর পরের code স্বাভাবিকভাবে চলে।
- **\`None\`/\`False\`** → exception বাইরে চলে যায়।

এই ক্ষমতা সাবধানে ব্যবহার করতে হয় — অপ্রত্যাশিত exception চুপচাপ গিলে ফেললে bug লুকিয়ে যায়। নির্দিষ্ট exception উপেক্ষা করতে \`contextlib.suppress\` আছে।

**\`ExitStack\`** — যখন কয়টা context manager লাগবে আগে থেকে জানা নেই। যেমন user-এর দেওয়া ১০টা বা ১০০টা file খুলতে হবে। Loop-এ \`stack.enter_context(open(path))\` করলে প্রতিটা stack-এ জমা হয়, আর \`with ExitStack()\` block শেষে সবগুলো **উল্টো ক্রমে** (শেষেরটা আগে) বন্ধ হয় — একটার cleanup-এ error হলেও বাকিগুলো বন্ধ হবে।`,
        examples: [
          {
            lang: 'python',
            code: `from contextlib import ExitStack

class Ignore:
    def __init__(self, *types):
        self.types = types
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        print("exit got", exc_type.__name__ if exc_type else None)
        return exc_type is not None and issubclass(exc_type, self.types)

with Ignore(KeyError):
    {}["x"]
print("continued after KeyError")

class Resource:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print("open", self.name)
        return self
    def __exit__(self, *exc):
        print("close", self.name)

with ExitStack() as stack:
    for name in ["a", "b", "c"]:
        stack.enter_context(Resource(name))`,
            output: `exit got KeyError
continued after KeyError
open a
open b
open c
close c
close b
close a`,
          },
        ],
        followUps: ['What happens if `__exit__` raises its own exception?'],
      },
      related: ['py-context-managers'],
    },
  ],
});

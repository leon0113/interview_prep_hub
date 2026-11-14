import { defineSection } from '../../define';

export const oop = defineSection({
  id: 'py-oop',
  title: 'Object-Oriented Programming',
  description:
    'Classes and instances, the three kinds of methods, inheritance and the MRO, dunder methods, properties, and when to reach for dataclasses or composition.',
  order: 5,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    {
      id: 'py-four-pillars',
      level: 'foundation',
      priority: 3,
      question: 'Explain the four pillars of OOP with Python examples.',
      tags: ['oop', 'encapsulation', 'abstraction', 'inheritance', 'polymorphism'],
      answer: {
        interview: `**Encapsulation, abstraction, inheritance and polymorphism.**

- **Encapsulation:** bundle data with the methods that work on it, and control access. Python uses conventions (\`_internal\`) and \`@property\` rather than enforced \`private\`.
- **Abstraction:** expose *what* an object does and hide *how*. Abstract base classes (\`abc.ABC\`, \`@abstractmethod\`) define the interface.
- **Inheritance:** a subclass reuses and extends a parent (\`class Admin(User)\`), calling the parent with \`super()\`.
- **Polymorphism:** different classes respond to the same method call in their own way — \`shape.area()\` works for circles and squares. In Python, duck typing gives polymorphism even without a shared base class.

Real-world: a payment system with a \`PaymentMethod\` interface, \`Card\` and \`Wallet\` implementations, and checkout code that just calls \`method.pay(amount)\`.`,
        explanationBn: `চারটা স্তম্ভ মুখস্থ বলা সহজ — কিন্তু interviewer আসলে দেখতে চান আপনি প্রতিটার **উদ্দেশ্য** বোঝেন কি না, আর Python-এ সেটা কীভাবে দেখা যায়।

**১. Encapsulation (মোড়কবদ্ধ করা):** data আর সেই data-র ওপর কাজ করা method এক জায়গায় রাখা, আর বাইরে থেকে ভেতরের অবস্থা সরাসরি এলোমেলো করতে না দেওয়া। Java-র মতো কড়া \`private\` Python-এ নেই — Python-এর দর্শন "আমরা সবাই প্রাপ্তবয়স্ক"। তাই \`_balance\` (convention: "ভেতরের জিনিস, ছোঁবেন না") আর \`@property\` (নিয়ন্ত্রিত access) ব্যবহার হয়।

**২. Abstraction (বিমূর্ততা):** ব্যবহারকারী জানবে object **কী** করে, **কীভাবে** করে তা লুকানো থাকবে। গাড়ি চালাতে engine-এর ভেতরের খুঁটিনাটি জানতে হয় না — steering, brake, accelerator জানলেই চলে। Python-এ \`ABC\` দিয়ে একটা "চুক্তি" (interface) ঠিক করা হয়।

**৩. Inheritance (উত্তরাধিকার):** নতুন class পুরনো class-এর সব কিছু পেয়ে যায়, সাথে নিজের কিছু যোগ বা বদল করতে পারে। Code পুনরায় লিখতে হয় না।

**৪. Polymorphism (বহুরূপতা):** একই method call, ভিন্ন ভিন্ন object-এ ভিন্ন আচরণ। \`for shape in shapes: shape.area()\` — circle নিজের নিয়মে, square নিজের নিয়মে হিসাব করে, loop-এর সেটা জানার দরকার নেই।

Python-এর বিশেষত্ব হলো **duck typing**: polymorphism-এর জন্য common parent class লাগেই না — দরকারি method থাকলেই চলে।`,
        examples: [
          {
            lang: 'python',
            code: `from abc import ABC, abstractmethod
import math

class Shape(ABC):                          # abstraction: the interface
    @abstractmethod
    def area(self): ...

class Circle(Shape):                       # inheritance
    def __init__(self, r):
        self._r = r                        # encapsulation (by convention)
    def area(self):
        return math.pi * self._r ** 2

class Square(Shape):
    def __init__(self, side):
        self._side = side
    def area(self):
        return self._side ** 2

for shape in [Circle(1), Square(3)]:       # polymorphism
    print(type(shape).__name__, round(shape.area(), 2))`,
            output: `Circle 3.14
Square 9`,
          },
        ],
        pitfalls: [
          'Claiming Python has no encapsulation — it has it by convention and properties, just not enforced access modifiers.',
          'Using inheritance only to reuse code often leads to fragile hierarchies; composition is frequently better.',
        ],
        followUps: [
          'How does Python implement private attributes?',
          'What is duck typing?',
          'Composition or inheritance — how do you choose?',
        ],
      },
      related: ['py-abstract-classes', 'py-duck-typing', 'py-composition-vs-inheritance'],
    },
    {
      id: 'py-str-vs-repr',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between `__str__` and `__repr__`?',
      tags: ['dunder-methods', '__str__', '__repr__', 'debugging'],
      answer: {
        interview: `**\`__repr__\` is the unambiguous, developer-facing representation — ideally valid Python that recreates the object. \`__str__\` is the readable, user-facing one.**

- \`print(x)\`, \`str(x)\` and f-strings use \`__str__\`; the REPL, debuggers, logs of containers and \`repr(x)\` use \`__repr__\`.
- If only \`__repr__\` is defined, \`str()\` falls back to it — so **always define \`__repr__\`**, and add \`__str__\` only when a friendlier form helps.
- Containers show their items with \`repr\`: \`print([obj])\` uses each item's \`__repr__\`.
- In f-strings, \`{x!r}\` forces \`repr\`.
- Built-in example: \`str("hi")\` is \`hi\`, \`repr("hi")\` is \`'hi'\` (with quotes, so you see the type).

Real-world: a good \`__repr__\` like \`User(id=7, email='a@x.com')\` makes logs and debugging dramatically easier than \`<User object at 0x7f...>\`.`,
        explanationBn: `দুটো method-ই object-কে string বানায়, কিন্তু দুজনের "পাঠক" আলাদা:

- **\`__repr__\` → developer-এর জন্য।** লক্ষ্য হলো একদম স্পষ্ট হওয়া — দেখেই যেন বোঝা যায় এটা কোন object, কী value নিয়ে। আদর্শভাবে এমন যে এটা কপি করে Python-এ পেস্ট করলে একই object তৈরি হবে: \`Point(x=1, y=2)\`।
- **\`__str__\` → end user-এর জন্য।** সুন্দর, পড়তে সহজ: \`(1, 2)\` বা \`"Rafi (Admin)"\`।

কে কোনটা ব্যবহার করে:
- \`print()\`, \`str()\`, f-string → \`__str__\`
- REPL-এ object-এর নাম লিখলে, debugger, \`repr()\` → \`__repr__\`
- **List বা dict-এর ভেতরে থাকলে** → সবসময় \`__repr__\`, এমনকি print করলেও। এটা অনেকে জানেন না।

\`__str__\` না থাকলে Python \`__repr__\`-ই ব্যবহার করে, কিন্তু উল্টোটা হয় না। তাই নিয়ম: **কমপক্ষে \`__repr__\` সবসময় লিখুন।** না লিখলে default দেখায় \`<__main__.User object at 0x10a3f...>\` — যেটা debugging-এ প্রায় অকেজো।

String-এর উদাহরণে পার্থক্যটা পরিষ্কার: \`str("5")\` দেখায় \`5\`, কিন্তু \`repr("5")\` দেখায় \`'5'\` — quote থাকায় বোঝা যায় এটা সংখ্যা না, string।`,
        examples: [
          {
            lang: 'python',
            code: `class Money:
    def __init__(self, amount, currency):
        self.amount = amount
        self.currency = currency

    def __repr__(self):
        return f"Money({self.amount!r}, {self.currency!r})"

    def __str__(self):
        return f"{self.amount:,.2f} {self.currency}"

m = Money(1500, "BDT")
print(m)                 # __str__
print(repr(m))           # __repr__
print([m])               # containers use __repr__
print(f"{m} | {m!r}")
print(str("5"), repr("5"))`,
            output: `1,500.00 BDT
Money(1500, 'BDT')
[Money(1500, 'BDT')]
1,500.00 BDT | Money(1500, 'BDT')
5 '5'`,
          },
          {
            lang: 'python',
            caption: 'With only __repr__ defined, str() falls back to it',
            code: `class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point(x={self.x}, y={self.y})"

print(Point(1, 2), str(Point(3, 4)))`,
            output: `Point(x=1, y=2) Point(x=3, y=4)`,
          },
        ],
        pitfalls: [
          'Defining only `__str__` leaves containers and debuggers showing `<... object at 0x...>`.',
          'A `__repr__` that hides important fields makes debugging harder, not easier.',
        ],
        followUps: [
          'Which one does `print([obj])` use?',
          'What other dunder methods do you commonly implement?',
          'How does `@dataclass` help here?',
        ],
      },
      related: ['py-dunder-methods', 'py-dataclasses'],
    },
    {
      id: 'py-class-object-self-init',
      level: 'foundation',
      priority: 2,
      question: 'What are a class, an object, `self` and `__init__`?',
      tags: ['oop', 'classes', 'self', '__init__'],
      answer: {
        interview: `**A class is a blueprint; an object (instance) is one thing built from it. \`__init__\` initializes a new instance's attributes, and \`self\` is the instance a method is working on.**

- \`User("Rafi")\` creates an instance and calls \`__init__(self, "Rafi")\`.
- \`self\` is not a keyword — it is just the conventional name for the first parameter, which Python fills in automatically.
- \`user.greet()\` is shorthand for \`User.greet(user)\`.
- \`__init__\` does not create the object (that is \`__new__\`) and must return \`None\`.
- Each instance has its own attribute dict (\`user.__dict__\`).

Real-world: \`self.email = email\` stores state on the instance so every method can reach it.`,
        explanationBn: `**Class** হলো নকশা (blueprint) — যেমন একটা বাড়ির নকশা। **Object** বা instance হলো সেই নকশা দেখে বানানো আসল বাড়ি। এক নকশা থেকে অনেক বাড়ি বানানো যায়, প্রতিটার নিজস্ব রং, নিজস্ব আসবাব।

**\`__init__\`** হলো initializer — নতুন object তৈরি হওয়ার ঠিক পরে চলে, তার শুরুর অবস্থা (attribute) ঠিক করে দেয়। অনেকে এটাকে constructor বলেন, তবে নির্ভুলভাবে বললে object তৈরি করে \`__new__\`, আর \`__init__\` শুধু সাজিয়ে দেয়।

**\`self\`** নিয়ে সবচেয়ে বেশি প্রশ্ন আসে। \`self\` হলো "যে object-এর ওপর এখন method চলছে"। যখন লেখেন \`rafi.greet()\`, Python আসলে এটা চালায় \`User.greet(rafi)\` — অর্থাৎ object-টাকে নিজে থেকে প্রথম argument হিসেবে পাঠিয়ে দেয়। Method-এর ভেতরে সেটাই \`self\`। এজন্যই method define করার সময় \`self\` লিখতে হয়, কিন্তু call করার সময় দিতে হয় না।

\`self\` কোনো reserved keyword না — চাইলে অন্য নাম দেওয়া যায়, কিন্তু সবাই \`self\`-ই লেখে, আর অন্য নাম দিলে code পড়া কঠিন হয়।`,
        examples: [
          {
            lang: 'python',
            code: `class User:
    def __init__(self, name, email):
        self.name = name          # instance attributes
        self.email = email

    def greet(self):
        return f"Hi, I'm {self.name}"

rafi = User("Rafi", "rafi@x.com")
print(rafi.greet())
print(User.greet(rafi))           # what rafi.greet() really does
print(rafi.__dict__)`,
            output: `Hi, I'm Rafi
Hi, I'm Rafi
{'name': 'Rafi', 'email': 'rafi@x.com'}`,
          },
        ],
        pitfalls: [
          'Forgetting `self` in a method definition gives "takes 0 positional arguments but 1 was given".',
          'Returning a value from `__init__` raises `TypeError`.',
        ],
        followUps: ['What is the difference between `__init__` and `__new__`?'],
      },
      related: ['py-init-vs-new', 'py-instance-vs-class-variables'],
    },
    {
      id: 'py-instance-vs-class-variables',
      level: 'foundation',
      priority: 2,
      question:
        'What is the difference between instance variables and class variables? What is the mutable class variable trap?',
      tags: ['oop', 'class-variables', 'instance-variables', 'mutability'],
      answer: {
        interview: `**Class variables are defined in the class body and shared by all instances; instance variables are set on \`self\` and belong to one object.**

- Attribute lookup checks the instance first, then the class — so instances can *read* class variables.
- **Assigning** \`obj.x = ...\` creates an instance attribute that shadows the class one; the class value is unchanged.
- **The trap:** a mutable class variable (\`items = []\`) is one shared list — \`self.items.append(...)\` mutates it for **every** instance.
- Use class variables for constants and true shared state (counters, config); initialize per-instance data in \`__init__\`.

Real-world: a \`tags = []\` class attribute on a model, appended to per instance, leaks tags across all objects.`,
        explanationBn: `**Class variable** class-এর body-তে সরাসরি লেখা হয় — সব instance মিলে **একটাই** কপি share করে। **Instance variable** \`self.x = ...\` দিয়ে বসানো হয় — প্রতিটা object-এর নিজের আলাদা কপি।

Attribute খোঁজার নিয়ম: Python আগে object-এর নিজের মধ্যে খোঁজে, না পেলে class-এ খোঁজে। তাই instance থেকে class variable পড়া যায়।

এখন দুটো আলাদা ঘটনা:
- **\`obj.count = 5\` (assignment):** object-এর নিজের মধ্যে নতুন একটা \`count\` তৈরি হয়, যেটা class-এরটাকে ঢেকে দেয় (shadowing)। Class-এর আসল value বদলায় না, অন্য object-রাও প্রভাবিত হয় না।
- **\`obj.items.append(x)\` (mutation):** এখানে কোনো assignment নেই — Python \`items\` খোঁজে, object-এ না পেয়ে class-এ পায়, আর **সেই shared list-টাকেই** বদলে দেয়। ফলে সব object একসাথে বদলে যায়।

এটাই "mutable class variable trap" — mutable default argument-এর মতো একই রোগ: একটা mutable object, যেটা সবাই অজান্তে share করছে।

নিয়ম: প্রতিটা object-এর নিজস্ব list/dict দরকার হলে সেটা \`__init__\`-এ বানান: \`self.items = []\`।`,
        examples: [
          {
            lang: 'python',
            code: `class Dog:
    species = "canine"        # class variable: shared
    tricks = []               # mutable class variable: the trap

    def __init__(self, name):
        self.name = name      # instance variable

    def add_trick(self, trick):
        self.tricks.append(trick)

a, b = Dog("Rex"), Dog("Fido")
a.add_trick("roll over")
print(b.tricks)               # Fido "learned" Rex's trick

a.species = "wolf"            # assignment creates an instance attribute
print(a.species, b.species, Dog.species)`,
            output: `['roll over']
wolf canine canine`,
          },
          {
            lang: 'python',
            caption: 'The fix: create the list per instance',
            code: `class Dog:
    def __init__(self, name):
        self.name = name
        self.tricks = []

a, b = Dog("Rex"), Dog("Fido")
a.tricks.append("roll over")
print(a.tricks, b.tricks)`,
            output: `['roll over'] []`,
          },
        ],
        pitfalls: [
          'Mutating a class-level list or dict through `self` affects every instance.',
          'Assigning through an instance never changes the class variable — it shadows it.',
        ],
        followUps: [
          'How would you count how many instances have been created?',
          'How does attribute lookup work for instances?',
        ],
      },
      related: ['py-mutable-default-argument', 'py-class-object-self-init'],
    },
    {
      id: 'py-inheritance-super',
      level: 'foundation',
      priority: 2,
      question: 'How does inheritance work in Python, and what does `super()` do?',
      tags: ['oop', 'inheritance', 'super', 'method-overriding'],
      answer: {
        interview: `**A subclass inherits attributes and methods from its parent and can override them. \`super()\` returns a proxy that calls the *next* class in the method resolution order — usually the parent.**

- \`class Admin(User):\` — \`Admin\` gets everything \`User\` has.
- Override a method by defining it again; call the parent version with \`super().method(...)\`.
- The common pattern: \`super().__init__(...)\` in the subclass \`__init__\`, then add extra attributes.
- If a subclass defines \`__init__\` and forgets \`super().__init__()\`, the parent's attributes are never set.
- \`isinstance(admin, User)\` is \`True\`; \`issubclass(Admin, User)\` is \`True\`.

Real-world: \`class ValidationError(AppError)\` reusing the base error's fields and adding its own.`,
        explanationBn: `Inheritance মানে নতুন class পুরনো class-এর সবকিছু "উত্তরাধিকারসূত্রে" পায়। \`class Admin(User)\` লিখলে \`Admin\`-এর কাছে \`User\`-এর সব method আর attribute চলে আসে, আবার নিজের নতুন জিনিসও যোগ করতে পারে।

**Override:** subclass-এ একই নামে method লিখলে সেটা parent-এরটাকে প্রতিস্থাপন করে। কিন্তু অনেক সময় আমরা পুরোপুরি বদলাতে চাই না — parent-এর কাজটাও হোক, তার সাথে কিছু যোগ হোক। তখন **\`super()\`** দিয়ে parent-এর version-টাকে ডাকা হয়।

সবচেয়ে common ব্যবহার \`__init__\`-এ:
\`\`\`python
def __init__(self, name, level):
    super().__init__(name)   # parent নিজের attribute বসাক
    self.level = level       # তারপর নিজেরটা
\`\`\`

একটা সাধারণ bug: subclass-এ \`__init__\` লিখলেন কিন্তু \`super().__init__()\` ডাকতে ভুলে গেলেন — তাহলে parent-এর \`__init__\` চলেই না, \`self.name\` তৈরিই হয় না, পরে \`AttributeError\`।

\`super()\` সবসময় সরাসরি parent-কে না, বরং MRO (Method Resolution Order)-এ "পরের class"-কে ডাকে। Single inheritance-এ দুটো একই, কিন্তু multiple inheritance-এ পার্থক্য দেখা যায়।`,
        examples: [
          {
            lang: 'python',
            code: `class User:
    def __init__(self, name):
        self.name = name
    def describe(self):
        return f"user {self.name}"

class Admin(User):
    def __init__(self, name, level):
        super().__init__(name)          # let User set its attributes
        self.level = level
    def describe(self):                 # override, extending the parent
        return super().describe() + f" (admin L{self.level})"

a = Admin("Nadia", 2)
print(a.describe())
print(isinstance(a, User), issubclass(Admin, User))`,
            output: `user Nadia (admin L2)
True True`,
          },
        ],
        pitfalls: [
          "Forgetting `super().__init__()` leaves the parent's attributes uninitialized.",
          'Hard-coding `User.__init__(self, ...)` breaks cooperative multiple inheritance; use `super()`.',
        ],
        followUps: [
          'What is the MRO, and how does it handle the diamond problem?',
          'Does `super()` always call the parent class?',
        ],
      },
      related: ['py-mro-diamond', 'py-four-pillars'],
    },
    {
      id: 'py-property',
      level: 'foundation',
      priority: 2,
      question: 'What is `@property`, and why use it instead of getter and setter methods?',
      tags: ['oop', 'property', 'encapsulation', 'validation'],
      answer: {
        interview: `**\`@property\` turns a method into an attribute-style accessor: \`obj.x\` calls the getter, and \`@x.setter\` runs on \`obj.x = value\`.**

- Start with a plain public attribute; switch to a property later (for validation or computation) **without changing any calling code**. That is why Python does not need Java-style \`get_x()\`/\`set_x()\`.
- Typical uses: validation in the setter, computed/derived values (\`full_name\`, \`area\`), read-only attributes (getter only), lazy computation.
- The value is usually stored in an underscore attribute (\`self._price\`) to avoid infinite recursion.
- \`functools.cached_property\` computes once and caches on the instance.

Real-world: \`account.balance\` as a read-only property so only \`deposit\`/\`withdraw\` can change it.`,
        explanationBn: `Java-তে সাধারণ নিয়ম হলো প্রতিটা field private রেখে \`getX()\`/\`setX()\` লেখা — "যদি কখনো validation লাগে" ভেবে। Python এই আগাম ঝামেলা এড়ায় \`@property\` দিয়ে।

Python-এ শুরুতে সাধারণ attribute রাখুন: \`self.price = price\`। পরে যদি দরকার হয় "price negative হতে পারবে না", তখন সেটাকে property বানিয়ে ফেলুন। বাইরের code \`item.price = 50\` আগের মতোই লেখে — কিন্তু এখন ভেতরে আপনার validation চলে। **কোনো caller-এর code বদলাতে হয় না।** এটাই property-র আসল শক্তি।

কীভাবে কাজ করে:
- \`@property\` দিয়ে getter: \`item.price\` পড়লে এই method চলে।
- \`@price.setter\` দিয়ে setter: \`item.price = 50\` লিখলে এই method চলে।
- Setter না দিলে attribute **read-only** — assign করতে গেলে \`AttributeError\`।

আসল value রাখা হয় underscore দেওয়া নামে (\`self._price\`)। কেন? Setter-এর ভেতরে যদি \`self.price = value\` লেখেন, সেটা আবার setter-কেই ডাকবে — অসীম recursion!

আরেকটা ব্যবহার: **computed value** — যেমন \`rect.area\`, যেটা আলাদা করে রাখা হয় না, প্রতিবার width × height থেকে হিসাব হয়। বাইরে থেকে দেখতে সাধারণ attribute-এর মতো।`,
        examples: [
          {
            lang: 'python',
            code: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price            # goes through the setter

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("price cannot be negative")
        self._price = value

    @property
    def label(self):                  # computed, read-only
        return f"{self.name} - {self._price} BDT"

p = Product("Tea", 50)
p.price = 60
print(p.label)
for bad in (lambda: setattr(p, "price", -5), lambda: setattr(p, "label", "x")):
    try:
        bad()
    except (ValueError, AttributeError) as e:
        print(type(e).__name__)`,
            output: `Tea - 60 BDT
ValueError
AttributeError`,
          },
        ],
        pitfalls: [
          'Writing `self.price = value` inside the `price` setter recurses forever — store in `self._price`.',
          'Expensive work inside a property surprises callers who expect attribute access to be cheap.',
        ],
        followUps: [
          'How would you make an attribute read-only?',
          'What is `cached_property`?',
          'How is a property implemented (descriptors)?',
        ],
      },
      related: ['py-private-name-mangling', 'py-four-pillars'],
    },
    {
      id: 'py-private-name-mangling',
      level: 'foundation',
      priority: 2,
      question: 'What do `_name` and `__name` mean in a class? What is name mangling?',
      tags: ['oop', 'encapsulation', 'name-mangling', 'conventions'],
      answer: {
        interview: `**A single underscore (\`_name\`) is a convention meaning "internal — don't use from outside". A double underscore (\`__name\`) triggers name mangling: Python renames it to \`_ClassName__name\` inside the class.**

- Neither makes the attribute truly private — Python has no enforced access control.
- Name mangling exists mainly to **avoid accidental clashes in subclasses**, not to hide data.
- The mangled name is still reachable: \`obj._Account__balance\`.
- \`from module import *\` skips names starting with \`_\`.
- Dunder names (\`__init__\`, with trailing underscores too) are **not** mangled — they are special methods.

Real-world: use \`_internal\` for implementation details; reserve \`__mangled\` for base classes designed to be subclassed by others.`,
        explanationBn: `Python-এ Java-র মতো \`private\` keyword নেই। এর বদলে underscore-এর convention:

**একটা underscore (\`_balance\`):** একটা ভদ্র অনুরোধ — "এটা ভেতরের জিনিস, বাইরে থেকে ব্যবহার করবেন না।" Python কিছুই আটকায় না, কিন্তু সব developer এই সংকেত বোঝে, আর IDE/linter সতর্ক করে।

**দুটো underscore (\`__balance\`):** এখানে Python সত্যিই কিছু করে — **name mangling**। Class-এর ভেতরে \`__balance\` লিখলে Python নামটা নিজে থেকে বদলে \`_Account__balance\` করে দেয়। তাই বাইরে থেকে \`acc.__balance\` লিখলে \`AttributeError\`।

কিন্তু এটা নিরাপত্তা না — \`acc._Account__balance\` লিখলেই পাওয়া যায়। তাহলে উদ্দেশ্য কী? **Subclass-এর সাথে নামের সংঘর্ষ এড়ানো।** ধরুন আপনার base class-এ \`__cache\` আছে, আর কেউ subclass বানিয়ে নিজের একটা \`__cache\` রাখল। Mangling না থাকলে দুটো একই attribute হতো আর একজন আরেকজনেরটা মুছে দিত। Mangling-এর কারণে দুটো হয় \`_Base__cache\` আর \`_Child__cache\` — আলাদা।

Python-এর দর্শন: "We are all consenting adults here" — কড়া নিষেধাজ্ঞার বদলে স্পষ্ট convention।

খেয়াল রাখবেন: \`__init__\`-এর মতো দুই পাশে underscore থাকা নাম mangle হয় না — ওগুলো special (dunder) method।`,
        examples: [
          {
            lang: 'python',
            code: `class Account:
    def __init__(self):
        self._owner = "Rafi"      # convention only
        self.__balance = 100      # mangled to _Account__balance

acc = Account()
print(acc._owner)
try:
    print(acc.__balance)
except AttributeError:
    print("AttributeError: no attribute '__balance'")
print(acc._Account__balance)
print([k for k in vars(acc)])`,
            output: `Rafi
AttributeError: no attribute '__balance'
100
['_owner', '_Account__balance']`,
          },
        ],
        pitfalls: [
          'Using `__name` for "privacy" makes testing and debugging harder without adding real security.',
          "Mangling uses the class where the code is written, so a subclass cannot easily access its parent's `__name`.",
        ],
        followUps: ['How would you make an attribute read-only?'],
      },
      related: ['py-property'],
    },
    {
      id: 'py-duck-typing',
      level: 'foundation',
      priority: 2,
      question: 'What is duck typing?',
      tags: ['oop', 'duck-typing', 'polymorphism', 'protocols'],
      answer: {
        interview: `**Duck typing means an object's suitability is decided by the methods and behaviour it has, not by its class: "if it walks like a duck and quacks like a duck, it's a duck."**

- A function that calls \`obj.read()\` works with files, \`io.StringIO\`, sockets or your own class — anything with \`read\`.
- It gives polymorphism without inheritance and keeps code flexible.
- Built-in protocols rely on it: any object with \`__iter__\` works in a \`for\` loop; any with \`__len__\` works with \`len()\`.
- Downsides: errors surface at runtime; mitigate with tests and \`typing.Protocol\` (static duck typing).
- Usually paired with EAFP: just call the method and handle the exception if it is missing.

Real-world: \`json.dump(data, fp)\` accepts any object with a \`write\` method.`,
        explanationBn: `Duck typing-এর নাম এসেছে একটা প্রবাদ থেকে: "যদি হাঁসের মতো হাঁটে আর হাঁসের মতো প্যাঁক প্যাঁক করে, তাহলে সেটা হাঁস।"

অর্থাৎ Python object-এর **class কী** তা নিয়ে মাথা ঘামায় না — দেখে **object কী করতে পারে**। একটা function যদি \`obj.read()\` call করে, তাহলে যেকোনো object, যার \`read()\` method আছে, সেটা চলবে: আসল file, memory-তে থাকা \`StringIO\`, network socket, বা আপনার নিজের বানানো class।

Java-তে একই কাজের জন্য সাধারণত একটা interface লাগে, আর প্রতিটা class-কে ঘোষণা করতে হয় "আমি এই interface implement করি"। Python-এ সেই ঘোষণা লাগে না।

Python-এর অনেক জিনিস এভাবেই কাজ করে: \`for\` loop যেকোনো object নেয় যার \`__iter__\` আছে, \`len()\` যেকোনো object নেয় যার \`__len__\` আছে।

**অসুবিধা:** ভুল object দিলে error ধরা পড়ে runtime-এ, অনেক পরে। এর সমাধানে আধুনিক Python-এ \`typing.Protocol\` আছে — "এই method গুলো থাকলেই চলবে" কথাটা type hint হিসেবে লেখা যায়, আর mypy আগেই চেক করে দেয়। একে বলে static duck typing।`,
        examples: [
          {
            lang: 'python',
            code: `import io

class Shouter:
    def read(self):
        return "HELLO FROM A CUSTOM OBJECT"

def first_word(source):
    return source.read().split()[0]     # only needs .read()

print(first_word(io.StringIO("hello world")))
print(first_word(Shouter()))

class Bag:
    def __init__(self, *items):
        self.items = items
    def __len__(self):
        return len(self.items)
    def __iter__(self):
        return iter(self.items)

bag = Bag("pen", "book")
print(len(bag), [x for x in bag])`,
            output: `hello
HELLO
2 ['pen', 'book']`,
          },
        ],
        pitfalls: [
          'A missing method is only discovered at runtime, possibly far from where the wrong object was created.',
        ],
        followUps: ['What is `typing.Protocol`?', 'What is EAFP vs LBYL?'],
      },
      related: ['py-four-pillars', 'py-eafp-vs-lbyl'],
    },

    // ──────────────────────────── Intermediate ────────────────────────────
    {
      id: 'py-instance-class-static-methods',
      level: 'intermediate',
      priority: 3,
      question:
        'What is the difference between an instance method, a `@classmethod` and a `@staticmethod`?',
      tags: ['oop', 'classmethod', 'staticmethod', 'factory-methods'],
      answer: {
        interview: `**An instance method receives the instance (\`self\`), a class method receives the class (\`cls\`), and a static method receives neither — it is a plain function namespaced inside the class.**

- **Instance method:** reads or changes one object's state — \`order.total()\`.
- **\`@classmethod\`:** works with the class itself; the classic use is an **alternative constructor** (\`User.from_dict(data)\`, \`date.fromisoformat(s)\`). Because it receives \`cls\`, it creates the right subclass when called on a subclass.
- **\`@staticmethod\`:** a utility that logically belongs to the class but needs no class or instance data — \`Temperature.c_to_f(30)\`.
- All three can be called on an instance or on the class.
- If a static method starts needing the class, make it a class method; if it never needs the class at all, a module-level function is often fine.

Real-world: \`datetime.now()\` and \`dict.fromkeys()\` are class methods; validation helpers are often static methods.`,
        explanationBn: `তিন ধরনের method-এর পার্থক্য হলো **প্রথম argument হিসেবে কী পায়**:

| ধরন | প্রথম argument | কী access করতে পারে |
|---|---|---|
| Instance method | \`self\` (object) | object-এর data + class-এর data |
| \`@classmethod\` | \`cls\` (class নিজে) | শুধু class-এর data |
| \`@staticmethod\` | কিছুই না | কোনোটাই না (যা argument দেওয়া হয়) |

**Instance method** — সবচেয়ে সাধারণ। নির্দিষ্ট একটা object-এর অবস্থা নিয়ে কাজ করে।

**Class method** — সবচেয়ে বড় ব্যবহার **alternative constructor** বা factory। ধরুন user তৈরি হতে পারে নাম-email দিয়ে, আবার একটা dict থেকে, আবার একটা CSV লাইন থেকে। Python-এ একাধিক \`__init__\` লেখা যায় না, তাই \`User.from_dict(d)\`, \`User.from_csv(line)\` — এগুলো class method।

এখানে একটা সূক্ষ্ম কিন্তু গুরুত্বপূর্ণ বিষয়: class method-এর ভেতরে \`User(...)\` না লিখে \`cls(...)\` লিখি। তাহলে কেউ \`Admin.from_dict(d)\` ডাকলে \`cls\` হবে \`Admin\`, আর সঠিকভাবে একটা \`Admin\` object তৈরি হবে। Hard-code করলে সবসময় \`User\` তৈরি হতো।

**Static method** — একটা সাধারণ function, শুধু সম্পর্কিত বলে class-এর ভেতরে রাখা। Object বা class কিছুই লাগে না। যেমন তাপমাত্রা রূপান্তরের সূত্র।

মনে রাখার সহজ উপায়: object-এর data লাগলে instance method, class লাগলে (বিশেষত নতুন object বানাতে) class method, কিছুই না লাগলে static method।`,
        examples: [
          {
            lang: 'python',
            code: `class User:
    count = 0

    def __init__(self, name, role="user"):
        self.name, self.role = name, role
        User.count += 1

    def greet(self):                       # instance method
        return f"Hi {self.name} ({self.role})"

    @classmethod
    def from_dict(cls, data):              # alternative constructor
        return cls(data["name"], data.get("role", "user"))

    @staticmethod
    def is_valid_name(name):               # utility, no self/cls
        return name.isalpha() and len(name) >= 2

class Admin(User):
    pass

u = User.from_dict({"name": "Rafi"})
a = Admin.from_dict({"name": "Nadia", "role": "admin"})
print(u.greet(), "|", type(a).__name__)    # cls gave us an Admin
print(User.is_valid_name("R2"), User.count)`,
            output: `Hi Rafi (user) | Admin
False 2`,
          },
        ],
        pitfalls: [
          'Writing `return User(...)` inside a class method instead of `cls(...)` breaks subclasses.',
          'A static method that refers to the class by name is usually a class method in disguise.',
        ],
        followUps: [
          'Why use `cls(...)` instead of the class name in a factory method?',
          'Can you call a class method on an instance?',
          'When would you use a module-level function instead of a static method?',
        ],
      },
      related: ['py-method-overloading', 'py-class-object-self-init'],
    },
    {
      id: 'py-mro-diamond',
      level: 'intermediate',
      priority: 3,
      question:
        'What is the MRO, and how does Python solve the diamond problem in multiple inheritance?',
      tags: ['oop', 'multiple-inheritance', 'mro', 'c3-linearization', 'super'],
      answer: {
        interview: `**The Method Resolution Order is the order in which Python searches classes for an attribute. Python computes it with C3 linearization, which guarantees every class appears once, children come before their parents, and the order of bases is respected.**

- The diamond: \`class D(B, C)\`, where \`B\` and \`C\` both inherit from \`A\`. The MRO is \`D → B → C → A → object\` — \`A\` appears once, after both \`B\` and \`C\`.
- See it with \`D.__mro__\` or \`D.mro()\`.
- \`super()\` follows the MRO of the **instance's** class, not "my parent": inside \`B\`, \`super()\` is \`C\` when the object is a \`D\`.
- If every class calls \`super()\`, each method in the chain runs exactly once (cooperative multiple inheritance).
- If no consistent order exists, the class definition fails with \`TypeError: Cannot create a consistent method resolution order\`.

Real-world: mixins (\`class View(LoginRequiredMixin, TemplateView)\` in Django) depend on this order.`,
        explanationBn: `**Diamond problem:** \`B\` আর \`C\` দুজনেই \`A\`-এর সন্তান, আর \`D\` একসাথে \`B\` ও \`C\` দুজনের সন্তান। Diagram আঁকলে হীরার মতো দেখায়। প্রশ্ন: \`D\`-তে কোনো method খুঁজলে Python কোন ক্রমে খুঁজবে? আর \`A\`-এর method কি দুবার চলবে (একবার \`B\`-এর পথে, একবার \`C\`-এর পথে)?

Python এর উত্তর দেয় **MRO** দিয়ে — প্রতিটা class-এর জন্য একটা নির্দিষ্ট, সরলরেখার ক্রম, যেটা **C3 linearization** algorithm দিয়ে হিসাব হয়। তিনটা নিয়ম মানে:
1. Class নিজে সবার আগে।
2. Child সবসময় তার parent-এর আগে।
3. \`class D(B, C)\`-এ যে ক্রমে base লেখা, সেই ক্রম মানা হয় — \`B\` আগে, \`C\` পরে।

ফলাফল: \`D → B → C → A → object\`। লক্ষ্য করুন \`A\` আসে **একবার**, আর \`B\`-এর ঠিক পরে না — কারণ \`C\`-ও \`A\`-এর child, তাই নিয়ম ২ অনুযায়ী \`C\`-কে \`A\`-এর আগে আসতে হবে।

**\`super()\`-এর আসল অর্থ:** এখানেই সবচেয়ে বেশি ভুল হয়। \`super()\` মানে "আমার parent" **না** — মানে "**এই object-এর MRO-তে আমার পরের class**"। তাই \`B\`-এর ভেতরে \`super().hi()\` ডাকলে, object যদি \`D\` হয়, তাহলে যায় \`C\`-তে (\`A\`-তে না!)। প্রতিটা class \`super()\` ডাকলে পুরো chain-এর প্রতিটা method ঠিক একবার চলে।

\`D.__mro__\` print করে যেকোনো সময় ক্রমটা দেখে নেওয়া যায় — interview-তে এটা দেখানো খুব কার্যকর।`,
        examples: [
          {
            lang: 'python',
            code: `class A:
    def hi(self): print("A")

class B(A):
    def hi(self):
        print("B")
        super().hi()

class C(A):
    def hi(self):
        print("C")
        super().hi()

class D(B, C):
    def hi(self):
        print("D")
        super().hi()

print([cls.__name__ for cls in D.__mro__])
D().hi()             # each class runs once, in MRO order`,
            output: `['D', 'B', 'C', 'A', 'object']
D
B
C
A`,
          },
          {
            lang: 'python',
            caption: 'An impossible ordering is rejected when the class is defined',
            code: `class X: pass
class Y(X): pass

try:
    class Z(X, Y): pass      # X before Y, but Y is a subclass of X
except TypeError as e:
    print("TypeError:", e)`,
            output: `TypeError: Cannot create a consistent method resolution
order (MRO) for bases X, Y`,
          },
        ],
        pitfalls: [
          'Assuming `super()` means "parent class" — it means "next in the instance\'s MRO".',
          'Mixing `super()` calls with hard-coded `Parent.method(self)` calls makes some methods run twice and others never.',
          'Cooperative `__init__` methods should accept `**kwargs` and pass them on, since you do not know who comes next.',
        ],
        followUps: [
          'What does C3 linearization guarantee?',
          'What is a mixin?',
          'How should `__init__` be written in cooperative multiple inheritance?',
        ],
      },
      visualizationId: 'py-mro-diamond',
      related: ['py-inheritance-super', 'py-mixins'],
    },
    {
      id: 'py-init-vs-new',
      level: 'intermediate',
      priority: 2,
      question: 'What is the difference between `__init__` and `__new__`?',
      tags: ['oop', '__new__', '__init__', 'object-creation', 'immutables'],
      answer: {
        interview: `**\`__new__\` creates and returns the new instance; \`__init__\` initializes an instance that already exists.** Calling \`Cls(...)\` runs \`__new__\` first, then \`__init__\` on the result.

- \`__new__(cls, ...)\` is a static method that receives the class and must return an object.
- \`__init__(self, ...)\` receives that object and must return \`None\`.
- If \`__new__\` returns an object that is not an instance of \`cls\`, \`__init__\` is skipped.
- You rarely override \`__new__\`. Real reasons: subclassing immutable types (\`int\`, \`str\`, \`tuple\`), where the value must be set at creation; instance caching or singletons; metaclasses.

Real-world: \`class Celsius(float)\` must use \`__new__\` to set its value — by the time \`__init__\` runs, the float is already immutable.`,
        explanationBn: `\`Cls(...)\` লিখলে দুটো ধাপে object তৈরি হয়:

1. **\`__new__\` — জন্ম:** class থেকে নতুন একটা খালি object তৈরি করে ফেরত দেয়।
2. **\`__init__\` — সাজানো:** সেই object-এর attribute গুলো বসায়।

Analogy: \`__new__\` হলো নতুন একটা বাড়ি বানানো, \`__init__\` হলো তাতে আসবাব সাজানো।

প্রায় সবসময় আমরা শুধু \`__init__\` লিখি, আর \`object.__new__\` নিজের কাজ চুপচাপ করে দেয়। \`__new__\` লেখার আসল প্রয়োজন হয় কয়েকটা ক্ষেত্রে:

- **Immutable type-এর subclass:** \`int\`, \`str\`, \`tuple\`-এর value তৈরির মুহূর্তেই ঠিক হয়ে যায়, পরে বদলানো যায় না। \`__init__\` চলার সময় object আগেই তৈরি — তখন value বদলানোর আর সুযোগ নেই। তাই value ঠিক করতে হয় \`__new__\`-এ।
- **Instance নিয়ন্ত্রণ:** নতুন object না বানিয়ে আগের একটা ফেরত দেওয়া — singleton বা cache।

একটা নিয়ম: \`__new__\` যদি অন্য class-এর object ফেরত দেয়, Python তার ওপর \`__init__\` চালায় না।`,
        examples: [
          {
            lang: 'python',
            code: `class Trace:
    def __new__(cls, *args):
        print("__new__ creates the object")
        return super().__new__(cls)
    def __init__(self, value):
        print("__init__ sets", value)
        self.value = value

t = Trace(5)

class Celsius(float):
    def __new__(cls, value):
        if value < -273.15:
            raise ValueError("below absolute zero")
        return super().__new__(cls, round(value, 1))

c = Celsius(36.66)
print(c, isinstance(c, float), c + 1)`,
            output: `__new__ creates the object
__init__ sets 5
36.7 True 37.7`,
          },
        ],
        pitfalls: [
          'Trying to change the value of an `int`/`str` subclass in `__init__` is too late — use `__new__`.',
          'Forgetting to `return` the instance from `__new__` makes the constructor return `None`.',
        ],
        followUps: ['How would you implement a singleton in Python?'],
      },
      related: ['py-class-object-self-init', 'py-singleton'],
    },
    {
      id: 'py-method-overloading',
      level: 'intermediate',
      priority: 2,
      question: 'Does Python support method overloading? What are the alternatives?',
      tags: ['oop', 'overloading', 'singledispatch', 'default-arguments'],
      answer: {
        interview: `**No — a class can have only one method per name; a later \`def\` with the same name simply replaces the earlier one.** Python gets the same flexibility in other ways:

- **Default arguments:** \`def area(self, width, height=None)\`.
- **\`*args\` / \`**kwargs\`** for a variable number of inputs.
- **Type dispatch with \`functools.singledispatch\`** (or \`singledispatchmethod\`) — choose an implementation by the type of the first argument.
- **Class methods as named constructors:** \`Point.from_polar(r, theta)\` instead of an overloaded constructor.
- \`typing.overload\` exists only for type checkers; it does not create runtime overloads.

Operator overloading (\`__add__\`, \`__eq__\`…) **is** supported — that is a different thing.

Real-world: \`singledispatch\` for a \`to_json(obj)\` function that handles \`datetime\`, \`Decimal\` and custom classes differently.`,
        explanationBn: `Java বা C++-এ একই নামে একাধিক method লেখা যায়, যেগুলো parameter-এর সংখ্যা বা type দিয়ে আলাদা হয় — এটাই overloading। Python-এ এটা হয় না: একই নামে দ্বিতীয় \`def\` লিখলে সেটা প্রথমটাকে **মুছে প্রতিস্থাপন** করে, কারণ class-এর ভেতরে method আসলে একটা dict-এর entry, আর একই key-তে দুটো value থাকতে পারে না।

তাহলে Python-এ একই কাজ কীভাবে হয়?

1. **Default argument** — সবচেয়ে সাধারণ। ঐচ্ছিক parameter-এর default দিন।
2. **\`*args\`/\`**kwargs\`** — যত খুশি argument।
3. **\`functools.singledispatch\`** — argument-এর **type দেখে** আলাদা function চালায়। এটাই সত্যিকারের type-based overloading-এর সবচেয়ে কাছাকাছি। প্রতিটা type-এর জন্য আলাদা function \`@fn.register\` দিয়ে নিবন্ধন করা হয়।
4. **Class method constructor** — একাধিক constructor-এর বদলে স্পষ্ট নামের factory: \`Date.from_string("2024-01-01")\`, \`Date.today()\`।

তবে **operator overloading** Python ভালোভাবেই সমর্থন করে — \`__add__\` লিখলে \`+\` আপনার object-এ কাজ করে। Interview-তে দুটো আলাদা করে বলুন।`,
        examples: [
          {
            lang: 'python',
            code: `from functools import singledispatch
from datetime import date

class Calc:
    def add(self, a, b):
        return a + b
    def add(self, a, b, c):          # replaces the first add
        return a + b + c

try:
    Calc().add(1, 2)
except TypeError:
    print("only the last 'add' exists")

@singledispatch
def describe(value):
    return f"something: {value!r}"

@describe.register
def _(value: int):
    return f"an int, doubled: {value * 2}"

@describe.register
def _(value: date):
    return f"a date in {value.year}"

print(describe(21), "|", describe(date(2024, 5, 1)), "|", describe("hi"))`,
            output: `only the last 'add' exists
an int, doubled: 42 | a date in 2024 | something: 'hi'`,
          },
        ],
        pitfalls: [
          'Defining two methods with the same name silently keeps only the last one.',
          '`typing.overload` decorators are for type checkers only and do nothing at runtime.',
        ],
        followUps: [
          'What is operator overloading?',
          'How do class methods act as alternative constructors?',
        ],
      },
      related: ['py-instance-class-static-methods', 'py-dunder-methods'],
    },
    {
      id: 'py-dunder-methods',
      level: 'intermediate',
      priority: 2,
      question:
        'What are dunder (magic) methods? Implement `__len__`, `__eq__`, `__hash__`, `__add__`, `__getitem__`, `__iter__` and `__call__`.',
      tags: ['dunder-methods', 'operator-overloading', 'data-model', 'protocols'],
      answer: {
        interview: `**Dunder methods ("double underscore") are hooks into Python's data model: the interpreter calls them for built-in syntax and functions, letting your objects behave like built-in types.**

- \`len(x)\` → \`__len__\`; \`x == y\` → \`__eq__\`; \`hash(x)\` → \`__hash__\`.
- \`x + y\` → \`__add__\` (and \`__radd__\` when the left operand does not know how).
- \`x[i]\` → \`__getitem__\` (also makes the object iterable by index); \`for v in x\` → \`__iter__\`.
- \`x(...)\` → \`__call__\`; \`with x:\` → \`__enter__\`/\`__exit__\`; \`print(x)\` → \`__str__\`.
- Return \`NotImplemented\` (not \`False\`) from binary operators for unsupported types, so Python can try the other operand.
- Defining \`__eq__\` without \`__hash__\` makes instances unhashable.

Real-world: a \`Money\` class with \`__add__\` and \`__eq__\`, or a \`Deck\` with \`__len__\` and \`__getitem__\` that instantly supports slicing, \`in\` and \`random.choice\`.`,
        explanationBn: `Dunder method হলো দুই পাশে দুটো underscore দেওয়া বিশেষ method — \`__len__\`, \`__add__\` ইত্যাদি। এগুলো আমরা সাধারণত নিজে ডাকি না; Python নিজে ডাকে, যখন আমরা কোনো built-in syntax ব্যবহার করি:

- \`len(deck)\` লিখলে Python ভেতরে ডাকে \`deck.__len__()\`
- \`a + b\` → \`a.__add__(b)\`
- \`deck[0]\` → \`deck.__getitem__(0)\`
- \`a == b\` → \`a.__eq__(b)\`
- \`obj()\` → \`obj.__call__()\`

এর মানে, আপনার class-এ এগুলো লিখলে আপনার object ঠিক built-in type-এর মতো আচরণ করে। একে বলে Python **data model**।

কয়েকটা দারুণ সুবিধা আছে: শুধু \`__len__\` আর \`__getitem__\` লিখলেই Python আপনাকে বিনামূল্যে আরও অনেক কিছু দেয় — \`for\` loop, \`in\` চেক, slicing, \`reversed()\`, \`random.choice()\` — কারণ এগুলো ওই দুটো method-এর ওপর নির্ভর করে।

দুটো গুরুত্বপূর্ণ নিয়ম:
1. \`__add__\`-এ অপরিচিত type পেলে \`NotImplemented\` return করুন (exception না, \`False\`-ও না)। তখন Python অন্য পক্ষের \`__radd__\` চেষ্টা করে। এভাবেই \`sum()\` আপনার object-এর সাথে কাজ করে (\`sum\` শুরু করে \`0\` থেকে, তাই \`0 + obj\` সামলাতে \`__radd__\` লাগে)।
2. \`__eq__\` লিখলে \`__hash__\`-ও লিখুন, নইলে object আর set বা dict key-তে রাখা যাবে না।`,
        examples: [
          {
            lang: 'python',
            code: `class Money:
    def __init__(self, amount):
        self.amount = amount
    def __add__(self, other):
        if isinstance(other, Money):
            return Money(self.amount + other.amount)
        return NotImplemented
    def __radd__(self, other):          # makes sum() work (0 + Money)
        return self if other == 0 else self.__add__(other)
    def __eq__(self, other):
        return isinstance(other, Money) and self.amount == other.amount
    def __hash__(self):
        return hash(self.amount)
    def __repr__(self):
        return f"Money({self.amount})"

print(Money(5) + Money(7), sum([Money(1), Money(2), Money(3)]))
print(Money(5) == Money(5), len({Money(5), Money(5)}))`,
            output: `Money(12) Money(6)
True 1`,
          },
          {
            lang: 'python',
            caption: '__len__ + __getitem__ give you iteration, `in`, slicing and more for free',
            code: `class Playlist:
    def __init__(self, *songs):
        self._songs = list(songs)
    def __len__(self):
        return len(self._songs)
    def __getitem__(self, index):
        return self._songs[index]
    def __call__(self):                 # instances are callable
        return f"now playing {self._songs[0]}"

p = Playlist("A", "B", "C")
print(len(p), p[1], p[-1], p[:2])
print("B" in p, [s for s in p], list(reversed(p)))
print(p())`,
            output: `3 B C ['A', 'B']
True ['A', 'B', 'C'] ['C', 'B', 'A']
now playing A`,
          },
        ],
        pitfalls: [
          'Returning `False` instead of `NotImplemented` from `__eq__`/`__add__` blocks the reflected operation.',
          'Overriding `__eq__` without `__hash__` makes instances unhashable.',
          'Mutable objects that define `__hash__` based on mutable fields break dicts and sets.',
        ],
        followUps: [
          'What does returning `NotImplemented` do?',
          'Why does `sum()` need `__radd__`?',
          'How do you make an object usable in a `with` statement?',
        ],
      },
      related: ['py-str-vs-repr', 'py-hashable-dict-keys', 'py-iterable-vs-iterator'],
    },
    {
      id: 'py-abstract-classes',
      level: 'intermediate',
      priority: 2,
      question:
        'What are abstract base classes (`ABC`, `@abstractmethod`) and when do you use them?',
      tags: ['oop', 'abc', 'abstractmethod', 'interfaces'],
      answer: {
        interview: `**An abstract base class defines an interface: it cannot be instantiated, and any subclass must implement every \`@abstractmethod\` before it can be instantiated.**

- Inherit from \`abc.ABC\` and decorate required methods with \`@abstractmethod\`.
- Instantiating the ABC, or a subclass missing an implementation, raises \`TypeError\` — at object creation, not at call time.
- Abstract methods may contain a default implementation reachable via \`super()\`.
- Can combine with \`@property\` and \`@classmethod\` to require abstract properties or constructors.
- \`collections.abc\` provides ready ABCs (\`Iterable\`, \`Mapping\`, \`Sequence\`) — inherit to get mixin methods for free, or use them with \`isinstance\`.

Real-world: a \`Storage\` ABC with \`save\`/\`load\`, implemented by \`S3Storage\` and \`LocalStorage\`, so the rest of the app depends only on the interface.`,
        explanationBn: `Abstract base class হলো একটা "চুক্তি" বা interface: এটা বলে দেয় subclass-এর **অবশ্যই** কোন কোন method থাকতে হবে, কিন্তু নিজে সেগুলোর পূর্ণ implementation দেয় না।

দুটো নিয়ম Python নিজে প্রয়োগ করে:
1. ABC-কে সরাসরি instantiate করা যায় না — \`Storage()\` লিখলে \`TypeError\`।
2. Subclass যদি সব \`@abstractmethod\` implement না করে, সেটাকেও instantiate করা যায় না।

গুরুত্বপূর্ণ ব্যাপার হলো error আসে **object তৈরির সময়ই** — method call করার অনেক পরে না। তাই ভুল তাড়াতাড়ি ধরা পড়ে।

কখন ব্যবহার করবেন? যখন একই কাজের একাধিক implementation থাকবে, আর বাকি code শুধু interface-এর ওপর নির্ভর করবে। যেমন file রাখার জন্য \`LocalStorage\` আর \`S3Storage\` — বাকি app শুধু \`storage.save()\` ডাকে, কোনটা ব্যবহার হচ্ছে জানে না। নতুন কেউ \`GCSStorage\` যোগ করলে ABC নিশ্চিত করে যে সে কোনো দরকারি method ভুলে যাবে না।

ABC বনাম duck typing: duck typing-এ কোনো চুক্তি লাগে না, কিন্তু ভুল ধরা পড়ে দেরিতে। ABC কাঠামো দেয়। আধুনিক Python-এ \`typing.Protocol\` তৃতীয় একটা পথ — inheritance ছাড়াই type checker দিয়ে চুক্তি যাচাই।`,
        examples: [
          {
            lang: 'python',
            code: `from abc import ABC, abstractmethod

class Storage(ABC):
    @abstractmethod
    def save(self, key, data): ...

    @abstractmethod
    def load(self, key): ...

    def exists(self, key):             # concrete helper built on the interface
        return self.load(key) is not None

class MemoryStorage(Storage):
    def __init__(self):
        self._data = {}
    def save(self, key, data):
        self._data[key] = data
    def load(self, key):
        return self._data.get(key)

class Broken(Storage):
    def save(self, key, data): ...     # forgot load()

store = MemoryStorage()
store.save("a", 1)
print(store.load("a"), store.exists("b"))

for cls in (Storage, Broken):
    try:
        cls()
    except TypeError as e:
        print(cls.__name__, "->", type(e).__name__)`,
            output: `1 False
Storage -> TypeError
Broken -> TypeError`,
          },
        ],
        pitfalls: [
          'Forgetting to inherit from `ABC` (or use `ABCMeta`) makes `@abstractmethod` silently do nothing.',
          'ABCs add ceremony; for small internal code, duck typing or a `Protocol` is often enough.',
        ],
        followUps: [
          'Abstract class vs `typing.Protocol` — what is the difference?',
          'What does `collections.abc` give you?',
        ],
      },
      related: ['py-four-pillars', 'py-duck-typing'],
    },
    {
      id: 'py-dataclasses',
      level: 'intermediate',
      priority: 2,
      question: 'What is a `@dataclass`, and what does it generate for you?',
      tags: ['dataclasses', 'boilerplate', 'immutability', 'oop'],
      answer: {
        interview: `**\`@dataclass\` reads the class's annotated fields and generates boilerplate — \`__init__\`, \`__repr__\` and \`__eq__\` by default — so a data-holding class is a few lines.**

- Options: \`frozen=True\` (immutable, and generates \`__hash__\`), \`order=True\` (\`<\`, \`>\`…), \`slots=True\` (3.10+, less memory), \`kw_only=True\`.
- Mutable defaults need \`field(default_factory=list)\` — a plain \`= []\` is rejected.
- \`__post_init__\` runs after the generated \`__init__\`, for validation or derived fields.
- Type hints are required to declare fields but are **not** validated at runtime.
- Alternatives: \`NamedTuple\` (immutable, tuple-like), \`attrs\`, and Pydantic when you need runtime validation.

Real-world: DTOs, config objects, and value objects like \`Point\` or \`Money\`.`,
        explanationBn: `শুধু data রাখার জন্য একটা class লিখতে গেলে অনেক একঘেয়ে code লিখতে হয়: \`__init__\`-এ প্রতিটা field assign করা, debug-এর জন্য \`__repr__\`, তুলনার জন্য \`__eq__\`। \`@dataclass\` এগুলো সব নিজে লিখে দেয় — আপনি শুধু field আর তাদের type লেখেন।

\`\`\`python
@dataclass
class Point:
    x: int
    y: int = 0
\`\`\`
এতেই পাওয়া যায় \`Point(1, 2)\`, সুন্দর \`repr\` (\`Point(x=1, y=2)\`), আর field ধরে \`==\` তুলনা।

কাজের option গুলো:
- **\`frozen=True\`** — object তৈরির পর আর বদলানো যায় না, আর hashable হয় (set বা dict key-তে রাখা যায়)।
- **\`order=True\`** — \`<\`, \`>\` দিয়ে তুলনা, field-এর ক্রম অনুযায়ী।
- **\`slots=True\`** — memory কম লাগে।

দুটো ফাঁদ:
1. **Mutable default:** \`tags: list = []\` লিখলে dataclass নিজেই error দেয় (mutable default trap থেকে বাঁচাতে)। লিখতে হয় \`field(default_factory=list)\`।
2. **Type check হয় না:** \`Point("a", "b")\` দিব্যি চলবে। Runtime validation লাগলে \`__post_init__\`-এ নিজে লিখুন, বা Pydantic ব্যবহার করুন।`,
        examples: [
          {
            lang: 'python',
            code: `from dataclasses import dataclass, field

@dataclass(order=True)
class Task:
    priority: int
    title: str = field(compare=False)
    tags: list = field(default_factory=list, compare=False)

    def __post_init__(self):
        if self.priority < 0:
            raise ValueError("priority must be >= 0")

a = Task(2, "write tests")
b = Task(1, "fix bug", ["urgent"])
print(a)
print(sorted([a, b])[0].title, a == Task(2, "other title"))

@dataclass(frozen=True)
class Point:
    x: int
    y: int

p = Point(1, 2)
print({p: "origin-ish"}[Point(1, 2)])
try:
    p.x = 5
except Exception as e:
    print(type(e).__name__)`,
            output: `Task(priority=2, title='write tests', tags=[])
fix bug True
origin-ish
FrozenInstanceError`,
          },
        ],
        pitfalls: [
          '`items: list = []` raises `ValueError` — use `field(default_factory=list)`.',
          'Annotations are not enforced; `Point("a", "b")` is accepted.',
          'A non-frozen dataclass with `eq=True` sets `__hash__` to `None`, so it is unhashable.',
        ],
        followUps: [
          'Dataclass vs `NamedTuple` vs Pydantic model — when to use each?',
          'What does `frozen=True` change?',
        ],
      },
      related: ['py-str-vs-repr', 'py-hashable-dict-keys'],
    },
    {
      id: 'py-composition-vs-inheritance',
      level: 'intermediate',
      priority: 2,
      question: 'Composition vs inheritance: what is the difference, and which do you prefer?',
      tags: ['oop', 'composition', 'inheritance', 'design'],
      answer: {
        interview: `**Inheritance models an "is-a" relationship (\`Admin\` is a \`User\`); composition models "has-a" (\`Car\` has an \`Engine\`) by holding other objects and delegating to them. The common guideline is "favour composition over inheritance".**

- Inheritance couples the subclass tightly to the parent's internals; changes in the base ripple into every subclass.
- Deep hierarchies become rigid and hard to reason about, especially with multiple inheritance.
- Composition lets you swap parts at runtime (inject a different \`Notifier\`), test parts in isolation, and combine behaviours freely.
- Inheritance is still right when there is a true is-a relationship and you want polymorphism, or when a framework expects it (Django models, exception classes).

Real-world: an \`OrderService\` that *has* a \`PaymentGateway\` and an \`EmailSender\` instead of inheriting from both.`,
        explanationBn: `দুটোই code পুনরায় ব্যবহারের উপায়, কিন্তু সম্পর্কের ধরন আলাদা:

- **Inheritance = "is-a" (একটা ধরন)।** Admin **একজন** User। Dog **একটা** Animal।
- **Composition = "has-a" (ধারণ করে)।** Car-এর **আছে** একটা Engine। Order-এর **আছে** একটা Payment।

প্রচলিত পরামর্শ: **"composition-কে inheritance-এর ওপর প্রাধান্য দিন"।** কেন?

Inheritance-এ subclass parent-এর ভেতরের খুঁটিনাটির সাথে শক্তভাবে বাঁধা। Parent-এ কিছু বদলালে সব subclass-এ অপ্রত্যাশিত প্রভাব পড়ে। আর শুধু কিছু method পাওয়ার জন্য inheritance করলে hierarchy ক্রমশ গভীর আর জট পাকানো হয়ে যায় — \`EmailNotifyingLoggingCachedRepository\`-এর মতো।

Composition-এ object অন্য object-কে নিজের ভেতরে রাখে আর কাজ তাদের কাছে পাঠায় (delegation)। সুবিধা:
- **অংশ বদলানো সহজ:** email-এর বদলে SMS notifier দিতে চাইলে শুধু অন্য object পাস করুন।
- **Test সহজ:** test-এ আসল payment gateway-র বদলে একটা fake দিন।
- **নমনীয়:** যেকোনো সমন্বয় বানানো যায়।

তবে inheritance খারাপ না — সত্যিকারের "is-a" সম্পর্ক আর polymorphism-এর জন্য এটাই সঠিক, আর অনেক framework (Django model, custom exception) এটাই চায়।`,
        examples: [
          {
            lang: 'python',
            code: `class EmailSender:
    def send(self, to, msg):
        return f"email to {to}: {msg}"

class SmsSender:
    def send(self, to, msg):
        return f"sms to {to}: {msg}"

class OrderService:
    def __init__(self, notifier):          # has-a notifier (injected)
        self.notifier = notifier

    def place(self, customer, item):
        return self.notifier.send(customer, f"{item} ordered")

print(OrderService(EmailSender()).place("rafi@x.com", "book"))
print(OrderService(SmsSender()).place("+880170000", "pen"))`,
            output: `email to rafi@x.com: book ordered
sms to +880170000: pen ordered`,
          },
        ],
        pitfalls: [
          'Inheriting just to reuse a couple of helper methods creates coupling you do not need.',
        ],
        followUps: ['What is dependency injection?', 'What is a mixin?'],
      },
      related: ['py-four-pillars', 'py-mixins'],
    },

    // ────────────────────────────── Advanced ──────────────────────────────
    {
      id: 'py-mixins',
      level: 'advanced',
      priority: 1,
      question: 'What is a mixin, and how should it be written?',
      tags: ['oop', 'mixins', 'multiple-inheritance', 'mro'],
      answer: {
        interview: `**A mixin is a small class that adds one focused behaviour to other classes through multiple inheritance. It is not meant to be instantiated on its own.**

- Examples: \`JsonMixin\` adding \`to_json()\`, Django's \`LoginRequiredMixin\`, \`collections.abc\` mixin methods.
- Keep mixins narrow, stateless where possible, and named \`...Mixin\`.
- Put mixins **before** the main base class (\`class View(LoginRequiredMixin, TemplateView)\`) so their methods come first in the MRO.
- Cooperative methods in mixins should call \`super()\` so the chain continues.
- Mixins are a form of reuse that avoids deep "is-a" hierarchies, but too many make the MRO hard to follow.

Real-world: adding \`to_dict()\`/\`to_json()\` to several unrelated model classes.`,
        explanationBn: `Mixin হলো একটা ছোট class, যেটা নির্দিষ্ট **একটা** বাড়তি ক্ষমতা অন্য class-এ "মিশিয়ে" দেয় — multiple inheritance-এর মাধ্যমে। এটা নিজে আলাদা কোনো object হিসেবে ব্যবহারের জন্য না।

যেমন \`JsonMixin\`: এতে শুধু একটা \`to_json()\` method আছে, যেটা \`self.__dict__\` থেকে JSON বানায়। এখন \`User\`, \`Order\`, \`Product\` — যেকোনো class-এ \`JsonMixin\` যোগ করলেই সে JSON-এ রূপান্তরিত হতে পারে, অথচ এদের মধ্যে কোনো "is-a" সম্পর্ক নেই।

ভালো mixin লেখার নিয়ম:
- **একটা কাজ, ছোট পরিসর।** নামের শেষে \`Mixin\`।
- নিজস্ব \`__init__\` বা state এড়িয়ে চলুন, অথবা থাকলে \`super()\` ডাকুন।
- **Base class-এর আগে লিখুন:** \`class View(LoginRequiredMixin, TemplateView)\` — MRO-তে mixin আগে আসে, তাই তার method আগে চলে আর \`super()\` দিয়ে মূল class-এ যায়।

Django-তে mixin খুব প্রচলিত — \`LoginRequiredMixin\` আগে login চেক করে, তারপর মূল view-কে কাজ করতে দেয়।`,
        examples: [
          {
            lang: 'python',
            code: `import json

class JsonMixin:
    def to_json(self):
        return json.dumps(self.__dict__)

class AuditMixin:
    def save(self):
        print(f"audit: saving {type(self).__name__}")
        return super().save()             # continue the chain

class Model:
    def save(self):
        return "saved"

class User(AuditMixin, JsonMixin, Model):
    def __init__(self, name):
        self.name = name

u = User("Rafi")
print(u.to_json())
print(u.save())
print([c.__name__ for c in User.__mro__])`,
            output: `{"name": "Rafi"}
audit: saving User
saved
['User', 'AuditMixin', 'JsonMixin', 'Model', 'object']`,
          },
        ],
        pitfalls: ['A mixin placed after the base class may never get its methods called first.'],
        followUps: ['How does the MRO decide which `save` runs first?'],
      },
      visualizationId: 'py-mro-diamond',
      related: ['py-mro-diamond', 'py-composition-vs-inheritance'],
    },
    {
      id: 'py-singleton',
      level: 'advanced',
      priority: 1,
      question: 'How do you implement a singleton in Python, and should you?',
      tags: ['design-patterns', 'singleton', '__new__', 'modules'],
      answer: {
        interview: `**The simplest Pythonic singleton is a module: modules are imported once and cached in \`sys.modules\`, so a module-level object is shared everywhere. If you need a class, override \`__new__\` to return a cached instance.**

- \`__new__\` approach: store the instance on the class and return it on every call. Note that \`__init__\` still runs on each call unless guarded.
- Alternatives: a decorator that caches the instance, or a metaclass.
- Singletons are global state in disguise: they make testing harder and hide dependencies.
- Often dependency injection (create one instance at start-up and pass it around) is cleaner.
- Thread safety needs a lock if instances can be created concurrently.

Real-world: a settings object or a connection pool created once — usually as a module-level instance.`,
        explanationBn: `Singleton মানে এমন class, যার পুরো program-এ একটাই object থাকবে — যতবারই তৈরি করতে চান, একই object ফেরত আসবে।

**Python-এ সবচেয়ে সহজ উপায় হলো module।** Module প্রথমবার import হলে Python সেটা \`sys.modules\`-এ cache করে রাখে; পরে যত জায়গা থেকেই import করুন, একই module object পান। তাই module-এর ভেতরে \`settings = Settings()\` লিখে রাখলেই সেটা কার্যত singleton।

**Class দিয়ে করতে চাইলে \`__new__\` override:** প্রথমবার object বানিয়ে class-এর একটা attribute-এ রেখে দিন, পরের সব call-এ সেটাই ফেরত দিন। খেয়াল রাখুন, \`__init__\` প্রতিবারই আবার চলবে — তাই সাবধানে লিখতে হয়।

**কিন্তু আসল প্রশ্ন — উচিত কি?** Singleton আসলে ছদ্মবেশী global variable। সমস্যা:
- Test-এ এক test-এর বদল পরের test-এ থেকে যায়।
- কোন code কোন জিনিসের ওপর নির্ভর করছে তা লুকিয়ে থাকে।

অনেক ক্ষেত্রে ভালো হলো app শুরুর সময় একটা object বানিয়ে যেখানে দরকার সেখানে পাঠানো (dependency injection)। Interview-তে এই trade-off বলতে পারলে বোঝা যায় আপনি শুধু pattern মুখস্থ করেননি।`,
        examples: [
          {
            lang: 'python',
            code: `class Settings:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.values = {}
        return cls._instance

a = Settings()
b = Settings()
a.values["debug"] = True
print(a is b, b.values)`,
            output: `True {'debug': True}`,
          },
        ],
        pitfalls: [
          '`__init__` runs on every `Settings()` call and can reset state if it assigns attributes.',
          'Singletons leak state between tests.',
        ],
        followUps: ['Why are modules natural singletons in Python?'],
      },
      related: ['py-init-vs-new'],
    },
  ],
});

# Pydantic v2 — Model, Validation, Error message ও Interview

Stack: **Python 3.12 · Pydantic 2.x** (`pydantic-settings`, `email-validator` আলাদা install)। প্রতিটা output আর error message আসল run থেকে নেওয়া, তাই real app-এ হুবহু এমনটাই দেখবে (শুধু শেষের URL-এর version নম্বর তোমার install অনুযায়ী বদলাবে)।

> 💡 কীভাবে পড়বে: পর্ব ১–৩ পরপর পড়ো। কোনো error দেখে বুঝতে না পারলে **পর্ব ৪** (সেকশন ১৭–২০): সেখানে প্রতিটা error-এর আসল message, মানে আর সমাধান আছে। Interview-এর আগে সেকশন ২১ আর ২২।

---

# পর্ব ১ — ভিত্তি

## 1. Pydantic কী, কেন লাগে

**Pydantic** = Python-এর type hint দিয়ে data **validate** (ঠিক আছে কিনা যাচাই), **parse** (ঠিক type-এ রূপান্তর) আর **serialize** (dict/JSON-এ ফেরত) করার library। তুমি class-এ লিখে দাও data দেখতে কেমন হবে, Pydantic বাইরে থেকে আসা data (API request, JSON, `.env`, database row) সেই নিয়মে মিলিয়ে নেয়, না মিললে পরিষ্কার error দেয়।

কোথায় লাগে:

- **FastAPI**: request body, query, response সবকিছুর validation আর docs (`/docs`) Pydantic দিয়ে।
- **Config**: `.env` থেকে settings পড়া (`pydantic-settings`)।
- **LLM / AI app**: model-এর structured output (JSON) যাচাই, tool-এর argument schema।
- **Data pipeline**: CSV/API থেকে আসা ময়লা data ঢোকার মুখেই ধরা।

বাংলায়: Pydantic হলো দরজার দারোয়ান। ভেতরের কোড ধরে নিতে পারে যে `price` সবসময় একটা ধনাত্মক `float`, কারণ ভুল data দরজাতেই আটকে গেছে। প্রতিটা function-এ `if not isinstance(...)` লেখার দরকার পড়ে না।

| | Pydantic `BaseModel` | `dataclass` | `TypedDict` |
| --- | --- | --- | --- |
| Runtime validation | ✅ | ❌ (type hint শুধু লেখা) | ❌ |
| Type conversion (`'5'` → `5`) | ✅ | ❌ | ❌ |
| JSON in/out | ✅ `model_validate_json`, `model_dump_json` | হাতে লিখতে হয় | হাতে |
| JSON Schema | ✅ `model_json_schema()` | ❌ | ❌ |
| গতি | v2-এর core Rust-এ (`pydantic-core`), দ্রুত | সবচেয়ে দ্রুত (কিছুই যাচাই করে না) | dict-এর মতো |

**v1 বনাম v2**: v2 (২০২৩) core নতুন করে Rust-এ লিখেছে, ৫–৫০ গুণ দ্রুত, আর অনেক API-র নাম বদলেছে (`.dict()` → `.model_dump()`, `@validator` → `@field_validator`, `class Config` → `model_config`)। পুরনো tutorial-এর কোড চালালে deprecation warning আসে (সেকশন ২০.৫)।

```bash
pip install pydantic "pydantic[email]" pydantic-settings
```

---

## 2. প্রথম model

```python
from pydantic import BaseModel, ValidationError

class User(BaseModel):
    id: int
    name: str
    is_active: bool = True          # default থাকলে optional

user = User(id='42', name='Rafi')    # '42' string দিলেও int হয়ে যাবে
print(user)
print(user.id, type(user.id))
print(user.model_dump())             # dict
print(user.model_dump_json())        # JSON string
```

```
id=42 name='Rafi' is_active=True
42 <class 'int'>
{'id': 42, 'name': 'Rafi', 'is_active': True}
{"id":42,"name":"Rafi","is_active":true}
```

ধাপে ধাপে কী হলো:

1. `User(id='42', name='Rafi')` চালানোর সাথে সাথে validation হয়।
2. `id` চায় `int`, পেয়েছে `'42'` (string)। Pydantic default-এ **lax mode**-এ চলে: string-টা পরিষ্কার integer হলে রূপান্তর করে নেয় (**coercion**)।
3. `is_active` দেওয়া হয়নি, তাই default `True`।
4. ভুল data হলে object তৈরিই হয় না, `ValidationError` ওঠে:

```python
try:
    User(id='abc')
except ValidationError as e:
    print(e)
```

```
2 validation errors for User
id
  Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='abc', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/int_parsing
name
  Field required [type=missing, input_value={'id': 'abc'}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.14/v/missing
```

একটা call-এ **সব** ভুল একসাথে আসে (এখানে ২টা): প্রথমটা ঠিক করে আবার চালাতে হয় না। কীভাবে পড়তে হয় তা সেকশন ১৭-এ।

> ⚠️ `User(42, 'Rafi')` (positional argument) চলে না: `TypeError: BaseModel.__init__() takes 1 positional argument but 3 were given`। সবসময় keyword: `User(id=42, name='Rafi')`।

---

## 3. Field-এর type: required, optional, collection, nested

```python
from typing import Literal, Optional
from datetime import datetime
from enum import Enum
from uuid import UUID

class Status(str, Enum):
    pending = 'pending'
    paid = 'paid'

class Address(BaseModel):
    city: str
    zip_code: str

class Order(BaseModel):
    id: UUID
    items: list[str]                          # list, ভেতরের প্রতিটা str
    quantities: dict[str, int] = {}           # mutable default Pydantic-এ নিরাপদ (প্রতিবার copy)
    status: Status = Status.pending           # Enum
    size: Literal['S', 'M', 'L']              # এই তিনটার একটা
    note: Optional[str] = None                # str অথবা None, না দিলে None
    coupon: str | None                        # None হতে পারে, কিন্তু দিতেই হবে (required!)
    address: Address                          # nested model
    created_at: datetime

order = Order(
    id='8f14e45f-ceea-467f-a8f8-3c9e5b1d2a10', items=['tea', 'cake'], size='M',
    coupon=None, address={'city': 'Dhaka', 'zip_code': '1207'}, created_at='2025-01-15T10:30:00',
)
print(order.status, order.address.city, order.created_at.year)
```

```
Status.pending Dhaka 2025
```

| লিখলে | মানে |
| --- | --- |
| `x: int` | **Required**, None চলবে না |
| `x: int = 0` | Optional (default 0) |
| `x: int \| None` / `Optional[int]` | None **হতে পারে**, কিন্তু default না থাকলে তবুও **required** |
| `x: int \| None = None` | None হতে পারে, না দিলেও চলবে: সাধারণ "optional field" |
| `x: Literal['a', 'b']` | শুধু এই মানগুলো |
| `x: list[int]` | list, প্রতিটা element int-এ validate |
| `x: Address` | nested model; dict দিলেও Address-এ রূপান্তর |

> ⚠️ সবচেয়ে কমন ভুল ধারণা: `Optional[str]` মানে "দেওয়া optional" না, মানে "**None হতে পারে**"। Default (`= None`) না দিলে field required থেকে যায়, না দিলে `missing` error আসে।

- Nested model-এ dict দিলে Pydantic নিজেই `Address(...)` বানায়। String থেকে `datetime`, `UUID`, `Enum` সবই parse হয়।
- Python-এ `def f(x=[])` বিপজ্জনক (সবাই একই list শেয়ার করে), কিন্তু Pydantic field-এর `[]` / `{}` default প্রতিটা instance-এ নতুন copy পায়। তবু পরিষ্কার রাখতে `Field(default_factory=list)` লেখা ভালো অভ্যাস।

---

## 4. `Field()`: default, constraint, alias, description

```python
from pydantic import Field

class Product(BaseModel):
    name: str = Field(..., min_length=3, max_length=50, description='Product name')
    price: float = Field(gt=0, le=100_000)              # 0-এর বেশি, ১ লাখ পর্যন্ত
    stock: int = Field(default=0, ge=0)                 # 0 বা বেশি
    sku: str = Field(pattern=r'^[A-Z]{3}-\d{4}$')       # যেমন ABC-1234
    tags: list[str] = Field(default_factory=list, max_length=5)
    discount: float = Field(default=0, multiple_of=0.5)

p = Product(name='Laptop', price=85000, sku='LAP-2025', tags=['tech'])
print(p)
```

```
name='Laptop' price=85000.0 stock=0 sku='LAP-2025' tags=['tech'] discount=0
```

| Constraint | কোথায় | মানে |
| --- | --- | --- |
| `gt`, `ge`, `lt`, `le` | সংখ্যা | >, ≥, <, ≤ |
| `multiple_of` | সংখ্যা | এর গুণিতক হতে হবে |
| `min_length`, `max_length` | str, list, dict, set | দৈর্ঘ্য / কয়টা element |
| `pattern` | str | regex মিলতে হবে |
| `max_digits`, `decimal_places` | `Decimal` | দাম, টাকা-পয়সা |

অন্য argument:

| Argument | কাজ |
| --- | --- |
| `default=` / প্রথম positional | default মান। `...` (Ellipsis) মানে required: `Field(...)` আর শুধু `Field()` একই |
| `default_factory=list` | প্রতিবার নতুন default (list, dict, `datetime.now`, `uuid4`) |
| `alias='userName'` | বাইরের data-য় অন্য নামে আসে (সেকশন ১২) |
| `description=`, `examples=`, `title=` | JSON Schema আর FastAPI `/docs`-এ দেখায় |
| `exclude=True` | `model_dump()`-এ আসবে না (যেমন password) |
| `frozen=True` | শুধু এই field বদলানো যাবে না |
| `repr=False` | `print`-এ দেখাবে না |

> ⚠️ Constraint সেই type-এ মানানসই হতে হবে। Nested model-এ `gt=0` দিলে model বানাতে গেলেই `TypeError: Unable to apply constraint 'gt' to supplied value ...` (সেকশন ২০.২)।

### `Annotated`: constraint-সহ type বারবার ব্যবহার

```python
from typing import Annotated

Price = Annotated[float, Field(gt=0, description='Price in BDT')]
Username = Annotated[str, Field(min_length=3, max_length=20, pattern=r'^[a-z0-9_]+$')]

class Item(BaseModel):
    price: Price
    old_price: Price | None = None
    seller: Username

print(Item(price=120, seller='rafi_01'))
```

```
price=120.0 old_price=None seller='rafi_01'
```

বড় project-এ একই নিয়ম (দাম, username, phone) অনেক model-এ লাগে; `Annotated` দিয়ে একবার লিখে সবখানে ব্যবহার করো। আধুনিক Pydantic কোডে এটাই সুপারিশকৃত ধরন (পুরনো `conint`, `constr`-এর বদলে)।

---

## 5. Special type: Email, URL, Secret, Positive...

```python
from pydantic import EmailStr, HttpUrl, AnyUrl, SecretStr, PositiveInt, PastDate
from datetime import date
from decimal import Decimal

class Account(BaseModel):
    email: EmailStr                  # pip install "pydantic[email]"
    website: HttpUrl                 # শুধু http/https
    repo: AnyUrl                     # যেকোনো scheme (ftp, postgres://...)
    password: SecretStr              # print-এ লুকানো থাকে
    age: PositiveInt                 # > 0
    birthday: PastDate               # আজকের আগের তারিখ
    balance: Decimal

acc = Account(email='Rafi@Example.COM', website='https://example.com', repo='git://github.com/x/y',
              password='hunter2', age=25, birthday='2000-05-10', balance='1500.50')
print(acc.email, acc.website, acc.password)
print(acc.password.get_secret_value())      # আসল মান লাগলে
print(acc.balance + Decimal('0.25'))
```

```
Rafi@example.com https://example.com/ **********
hunter2
1500.75
```

| Type | কী যাচাই করে | কখন |
| --- | --- | --- |
| `EmailStr` | email format (domain অংশ ছোট হাতের অক্ষরে করে) | signup, contact |
| `HttpUrl` / `AnyUrl` | URL; `HttpUrl` শুধু http(s), শেষে `/` বসায় | webhook, profile link |
| `SecretStr` | কিছু না, শুধু `repr`/`print`/log-এ `**********` | password, API key |
| `PositiveInt`, `NegativeFloat`, `NonNegativeInt` | চিহ্ন | count, amount |
| `PastDate`, `FutureDate`, `AwareDatetime` | তারিখ অতীত/ভবিষ্যৎ, timezone আছে কিনা | জন্মতারিখ, booking |
| `Decimal` | নির্ভুল দশমিক | টাকা (float-এ `0.1 + 0.2` সমস্যা) |
| `IPvAnyAddress`, `UUID4`, `Json[T]` | IP, UUID, JSON string-এর ভেতর | network, id, nested JSON |

> ⚠️ `HttpUrl`, `AnyUrl` v2-তে **str না**, `Url` object। Database বা `requests`-এ পাঠাতে `str(acc.website)` করো, নইলে `TypeError` বা অদ্ভুত error আসে।

---

# পর্ব ২ — Validation-এর ভেতরে

## 6. Lax mode বনাম Strict mode

Default **lax mode**-এ Pydantic বুদ্ধি করে রূপান্তর করে, কিন্তু যা হারায় (data loss) বা অস্পষ্ট তা করে না:

```python
class Lax(BaseModel):
    n: int
    f: float
    flag: bool
    s: str

print(Lax(n='10', f='3.5', flag='yes', s='hello'))
print(Lax(n=5.0, f=7, flag=0, s='x'))
```

```
n=10 f=3.5 flag=True s='hello'
n=5 f=7.0 flag=False s='x'
```

| Input → type | Lax | কেন |
| --- | --- | --- |
| `'10'` → int | ✅ 10 | পরিষ্কার integer string |
| `5.0` → int | ✅ 5 | দশমিক অংশ শূন্য |
| `5.5` → int | ❌ `int_from_float` | দশমিক হারাবে |
| `'5.5'` → int | ❌ `int_parsing` | string-টা integer না |
| `7` → float | ✅ 7.0 | |
| `'yes'`, `'on'`, `1`, `'true'` → bool | ✅ True | স্বীকৃত শব্দ |
| `'maybe'` → bool | ❌ `bool_parsing` | |
| `123` → str | ❌ `string_type` | number থেকে str-এ **যায় না** (v1-এ যেত) |

### Strict mode

```python
from pydantic import ConfigDict

class Strict(BaseModel):
    model_config = ConfigDict(strict=True)
    n: int
    d: date

try:
    Strict(n='10', d='2025-01-01')
except ValidationError as e:
    print(e)

print(Strict.model_validate_json('{"n": 10, "d": "2025-01-01"}'))   # JSON-এ date string চলে
```

```
2 validation errors for Strict
n
  Input should be a valid integer [type=int_type, input_value='10', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/int_type
d
  Input should be a valid date [type=date_type, input_value='2025-01-01', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/date_type
n=10 d=datetime.date(2025, 1, 1)
```

বাংলায়: strict mode-এ type হুবহু মিলতে হবে, কোনো রূপান্তর না। কিন্তু **JSON থেকে** validate করলে (`model_validate_json`) তারিখ string হিসেবে আসাটাই স্বাভাবিক (JSON-এ date type নেই), তাই সেটা strict-এও চলে। Python dict দিয়ে `Strict(d='2025-01-01')` দিলে চলে না।

- শুধু একটা field strict চাইলে: `n: int = Field(strict=True)` বা `from pydantic import StrictInt`।
- কখন strict: payment, অন্য service-এর সাথে কঠোর contract, যেখানে `'1'` আর `1` আলাদা অর্থ বহন করে। সাধারণ API-তে lax-ই সুবিধাজনক (form data সব string হিসেবে আসে)।

---

## 7. `@field_validator`: একটা field-এর নিজস্ব নিয়ম

```python
from pydantic import field_validator

class Signup(BaseModel):
    username: str
    name: str
    password: str

    @field_validator('name')                   # field-এর নাম string হিসেবে
    @classmethod
    def title_case(cls, value: str) -> str:
        return value.strip().title()            # যা return করবে সেটাই field-এর মান হবে

    @field_validator('username', 'password')    # একাধিক field-এ একই validator
    @classmethod
    def no_spaces(cls, value: str) -> str:
        if ' ' in value:
            raise ValueError('must not contain spaces')
        return value

print(Signup(username='rafi', name='  chiCken BIRYANI ', password='secret'))
try:
    Signup(username='ra fi', name='x', password='p w')
except ValidationError as e:
    print(e)
```

```
username='rafi' name='Chicken Biryani' password='secret'
2 validation errors for Signup
username
  Value error, must not contain spaces [type=value_error, input_value='ra fi', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/value_error
password
  Value error, must not contain spaces [type=value_error, input_value='p w', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/value_error
```

নিয়মগুলো:

1. Field-এর নাম **string** হিসেবে দাও: `@field_validator('name')`। `@field_validator(name)` (quote ছাড়া) লিখলে class তৈরির সময়ই error (সেকশন ২০.১)।
2. `@classmethod` দাও (না দিলেও v2 চালিয়ে নেয়, তবে docs আর type checker এটাই চায়)। এখানে `self` নেই, কারণ object এখনো তৈরি হয়নি।
3. **ঠিক থাকলে value return করো।** Return ভুলে গেলে field-এর মান `None` হয়ে যায়!
4. ভুল হলে `ValueError` (বা `AssertionError`) raise করো, message-টা error-এ `Value error, ...` হয়ে দেখায়। `TypeError` raise করলে সেটা ValidationError-এ ধরা পড়ে না, সরাসরি crash করে।

### `mode`: কখন চলবে

| mode | কখন চলে | value কী অবস্থায় | কখন ব্যবহার |
| --- | --- | --- | --- |
| `'after'` (default) | Pydantic-এর নিজের validation-এর **পরে** | ঠিক type-এ (int, date...) | ব্যবসার নিয়ম (business rule) |
| `'before'` | **আগে** | কাঁচা input (যা এসেছে তাই) | input পরিষ্কার: `'1,200'` → `1200`, comma-string → list |
| `'wrap'` | আগে-পরে দুই দিকেই | handler call করে | error ধরে বিকল্প মান, লগিং |
| `'plain'` | Pydantic-এর validation বাদ দিয়ে শুধু এটা | কাঁচা | নিজের পুরো validation |

```python
class Invoice(BaseModel):
    amount: int
    tags: list[str]

    @field_validator('amount', mode='before')
    @classmethod
    def remove_commas(cls, value):
        if isinstance(value, str):
            return value.replace(',', '')       # '1,200' → '1200', তারপর Pydantic int বানাবে
        return value

    @field_validator('tags', mode='before')
    @classmethod
    def split_tags(cls, value):
        if isinstance(value, str):
            return [t.strip() for t in value.split(',')]
        return value

print(Invoice(amount='1,200', tags='food, urgent'))
```

```
amount=1200 tags=['food', 'urgent']
```

ধাপে ধাপে `amount='1,200'`: before validator → `'1200'` → Pydantic-এর int validation → `1200`। Before validator না থাকলে `'1,200'` সরাসরি `int_parsing` error দিত।

### অন্য field-এর মান দেখা: `ValidationInfo`

```python
from pydantic import ValidationInfo

class ChangePassword(BaseModel):
    password: str
    confirm: str

    @field_validator('confirm')
    @classmethod
    def must_match(cls, value: str, info: ValidationInfo) -> str:
        if value != info.data.get('password'):   # info.data = আগে validate হওয়া field-গুলো
            raise ValueError('passwords do not match')
        return value

try:
    ChangePassword(password='abc12345', confirm='abc1234')
except ValidationError as e:
    print(e)
```

```
1 validation error for ChangePassword
confirm
  Value error, passwords do not match [type=value_error, input_value='abc1234', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/value_error
```

> ⚠️ `info.data`-তে শুধু **আগে declare করা** আর সফলভাবে validate হওয়া field থাকে। `confirm`-কে `password`-এর আগে লিখলে `info.data`-তে password থাকবে না। একাধিক field মিলিয়ে নিয়ম হলে `model_validator` বেশি পরিষ্কার (পরের সেকশন)।

---

## 8. `@model_validator`: পুরো model মিলিয়ে নিয়ম

```python
from pydantic import model_validator
from datetime import date

class Booking(BaseModel):
    check_in: date
    check_out: date
    is_available: bool = True
    price: float

    @model_validator(mode='after')
    def check_rules(self):                        # 'after' mode-এ self = তৈরি হওয়া object
        if self.check_out <= self.check_in:
            raise ValueError('check_out must be after check_in')
        if self.is_available and self.price <= 0:
            raise ValueError('available room must have price greater than 0')
        return self                               # ⚠️ self return করতেই হবে

try:
    Booking(check_in='2025-03-10', check_out='2025-03-08', price=0)
except ValidationError as e:
    print(e)
```

```
1 validation error for Booking
  Value error, check_out must be after check_in [type=value_error, input_value={'check_in': '2025-03-10'...2025-03-08', 'price': 0}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.14/v/value_error
```

- `mode='after'`: সব field validate হওয়ার পরে, `self` দিয়ে সব field পাওয়া যায়। **Cross-field rule**-এর জন্য এটাই সবচেয়ে কমন।
- `mode='before'`: `@classmethod`, কাঁচা input (সাধারণত dict) পায়। পুরনো নাম বদলানো বা input-এর আকার বদলাতে।
- Error-এর `loc` খালি থাকে (model পুরোটা দায়ী), তাই message-এ কোন field-এর সমস্যা তা পরিষ্কার লিখো।
- প্রথম `raise`-এই থামে: দুটো নিয়ম ভাঙলেও একটা error আসে।

```python
class LegacyUser(BaseModel):
    full_name: str

    @model_validator(mode='before')
    @classmethod
    def rename_old_keys(cls, data):
        if isinstance(data, dict) and 'fullname' in data:      # পুরনো API 'fullname' পাঠায়
            data = {**data, 'full_name': data.pop('fullname')}
        return data

print(LegacyUser.model_validate({'fullname': 'Nila Ahmed'}))
```

```
full_name='Nila Ahmed'
```

> ⚠️ `raise('message')` লিখলে Pydantic error না, Python-এর `TypeError: exceptions must derive from BaseException` আসে। Raise করতে হয় exception object: `raise ValueError('message')`।

---

## 9. `@computed_field`: হিসাব করা field

```python
from pydantic import computed_field

class CartItem(BaseModel):
    price: float
    quantity: int = 1

    @computed_field
    @property
    def total_with_vat(self) -> float:
        return round(self.price * self.quantity * 1.05, 2)

item = CartItem(price=120.0, quantity=3)
print(item.total_with_vat)
print(item.model_dump())                 # computed field dump আর JSON-এ আসে
```

```
378.0
{'price': 120.0, 'quantity': 3, 'total_with_vat': 378.0}
```

- সাধারণ `@property` `model_dump()`-এ **আসে না**; `@computed_field` আসে, আর JSON Schema-তেও (response-এ) দেখায়।
- এটা input নেয় না: `CartItem(total_with_vat=10)` দিলে ignore (বা `extra='forbid'`-এ error)।
- Return type annotation (`-> float`) দাও, schema-র জন্য লাগে।
- ভারী হিসাব হলে `@cached_property`-ও দেওয়া যায় (frozen model-এ সুবিধা)।

---

## 10. `model_config`: পুরো model-এর আচরণ

```python
class Strictish(BaseModel):
    model_config = ConfigDict(
        extra='forbid',              # অজানা field এলে error
        frozen=True,                 # তৈরির পর বদলানো যাবে না (hashable হয়)
        str_strip_whitespace=True,   # সব str-এর দুই পাশের space বাদ
        str_to_lower=False,
        validate_assignment=False,   # frozen=True হলে এর দরকার নেই
    )
    name: str
    qty: int

s = Strictish(name='  Pen  ', qty=2)
print(repr(s.name), hash(s) == hash(Strictish(name='Pen', qty=2)))
try:
    Strictish(name='Pen', qty=2, color='red')
except ValidationError as e:
    print(e)
```

```
'Pen' True
1 validation error for Strictish
color
  Extra inputs are not permitted [type=extra_forbidden, input_value='red', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/extra_forbidden
```

| Option | মান | কাজ | কখন |
| --- | --- | --- | --- |
| `extra` | `'ignore'` (default) / `'forbid'` / `'allow'` | অজানা field: চুপচাপ বাদ / error / রেখে দাও | API input-এ `forbid` টাইপো ধরে (`emial`) |
| `frozen` | `True` | immutable, hash করা যায় (dict key, set) | config, value object |
| `validate_assignment` | `True` | `obj.x = 'abc'`-এও validation | ফর্ম/state object যা পরে বদলায় |
| `strict` | `True` | কোনো type রূপান্তর না | কঠোর contract |
| `str_strip_whitespace` | `True` | str-এর space ছাঁটা | ফর্ম input |
| `from_attributes` | `True` | ORM object (SQLAlchemy) থেকে validate | DB row → response (সেকশন ১১.৩) |
| `populate_by_name` | `True` | alias **আর** আসল নাম দুটোই নেয় | alias ব্যবহার করলে (সেকশন ১২) |
| `alias_generator` | `to_camel` | সব field-এর camelCase alias | JS frontend-এর সাথে |
| `use_enum_values` | `True` | Enum-এর বদলে তার `.value` রাখে | JSON-এ সরাসরি পাঠানো |
| `arbitrary_types_allowed` | `True` | নিজের class (যেমন numpy array) field হিসেবে | সেকশন ২০.৩ |

### `validate_assignment` কী করে

```python
class Profile(BaseModel):
    model_config = ConfigDict(validate_assignment=True)
    age: int

p = Profile(age=20)
p.age = '25'                 # validation চলে: '25' → 25
print(p.age, type(p.age))
try:
    p.age = 'twenty'
except ValidationError as e:
    print(e)
```

```
25 <class 'int'>
1 validation error for Profile
age
  Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='twenty', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/int_parsing
```

Default-এ (`validate_assignment=False`) তৈরির পরে `p.age = 'twenty'` **কোনো error ছাড়াই** বসে যায়: Pydantic শুধু তৈরির সময় যাচাই করে। এটা অনেকের কাছে অপ্রত্যাশিত।

---

# পর্ব ৩ — Data ভেতরে-বাইরে

## 11. Validate আর serialize: `model_validate`, `model_dump`, `model_copy`

### 11.1 Data ভেতরে আনা

```python
class Book(BaseModel):
    title: str
    price: float
    author: str | None = None

b1 = Book(title='Clean Code', price=550)                       # keyword argument
b2 = Book.model_validate({'title': 'SICP', 'price': '700'})   # dict থেকে
b3 = Book.model_validate_json('{"title": "DDIA", "price": 900}')   # JSON string থেকে
print(b1, b2, b3, sep='\n')
```

```
title='Clean Code' price=550.0 author=None
title='SICP' price=700.0 author=None
title='DDIA' price=900.0 author=None
```

`model_validate_json` সরাসরি JSON parse + validate একসাথে করে (Rust-এ), `json.loads` তারপর `model_validate`-এর চেয়ে দ্রুত। API response, file, queue message-এ এটাই ব্যবহার করো।

### 11.2 Data বাইরে পাঠানো

```python
from datetime import datetime

class Event(BaseModel):
    name: str
    when: datetime
    venue: str | None = None
    seats: int = 100

e = Event(name='PyCon', when='2025-06-01T09:00:00')
print(e.model_dump())                        # Python object (datetime থেকেই যায়)
print(e.model_dump(mode='json'))             # JSON-এ পাঠানো যায় এমন (datetime → str)
print(e.model_dump(exclude_none=True))       # None বাদ
print(e.model_dump(exclude_unset=True))      # শুধু যা আসলে দেওয়া হয়েছিল
print(e.model_dump(include={'name', 'seats'}))
print(e.model_dump_json(indent=2))
```

```
{'name': 'PyCon', 'when': datetime.datetime(2025, 6, 1, 9, 0), 'venue': None, 'seats': 100}
{'name': 'PyCon', 'when': '2025-06-01T09:00:00', 'venue': None, 'seats': 100}
{'name': 'PyCon', 'when': datetime.datetime(2025, 6, 1, 9, 0), 'seats': 100}
{'name': 'PyCon', 'when': datetime.datetime(2025, 6, 1, 9, 0)}
{'name': 'PyCon', 'seats': 100}
{
  "name": "PyCon",
  "when": "2025-06-01T09:00:00",
  "venue": null,
  "seats": 100
}
```

| Option | কাজ | কখন |
| --- | --- | --- |
| `mode='json'` | সব কিছু JSON-বান্ধব type-এ (date → str, UUID → str, Decimal → str) | JSON-এ লেখার আগে dict লাগলে |
| `exclude_unset=True` | শুধু ব্যবহারকারী যা পাঠিয়েছে (default-গুলো বাদ) | **PATCH update** (সেকশন ১৬) |
| `exclude_defaults=True` | default মানের সমান হলে বাদ | |
| `exclude_none=True` | None বাদ | পরিষ্কার response |
| `include={...}` / `exclude={...}` | কিছু field রাখো / বাদ দাও; nested-এ `{'address': {'zip_code'}}` | password বাদ দেওয়া |
| `by_alias=True` | alias নামে বের করা | camelCase API |

### 11.3 Object বদলানো আর ORM থেকে আনা

```python
updated = e.model_copy(update={'seats': 250})     # নতুন object; e অপরিবর্তিত
print(e.seats, updated.seats)

class UserRow:                                    # ধরো SQLAlchemy-র row object
    def __init__(self):
        self.id, self.email, self.password_hash = 7, 'a@b.com', 'x9f...'

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str                                    # password_hash নেই → response-এ যাবে না

print(UserOut.model_validate(UserRow()))
```

```
100 250
id=7 email='a@b.com'
```

> ⚠️ `model_copy(update=...)` update-এর মানগুলো **validate করে না**: `update={'seats': 'many'}` দিলেও চুপচাপ বসে যাবে। Validation চাইলে `Event.model_validate({**e.model_dump(), 'seats': x})`।

---

## 12. Alias: বাইরের নাম আর ভেতরের নাম আলাদা

```python
from pydantic.alias_generators import to_camel

class ApiUser(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    user_id: int
    first_name: str
    is_admin: bool = False

u = ApiUser.model_validate({'userId': 1, 'firstName': 'Nila'})    # frontend camelCase পাঠায়
print(u.first_name)
print(u.model_dump())                    # Python-এ snake_case
print(u.model_dump(by_alias=True))       # frontend-কে camelCase ফেরত
print(ApiUser(user_id=2, first_name='Sakib'))   # populate_by_name: আসল নামেও চলে
```

```
Nila
{'user_id': 1, 'first_name': 'Nila', 'is_admin': False}
{'userId': 1, 'firstName': 'Nila', 'isAdmin': False}
user_id=2 first_name='Sakib' is_admin=False
```

| | কাজ |
| --- | --- |
| `Field(alias='x')` | ঢোকা আর বের হওয়া দুইয়েই `x` (বের হওয়ার সময় `by_alias=True` লাগে) |
| `Field(validation_alias='x')` | শুধু ঢোকার সময় |
| `Field(serialization_alias='x')` | শুধু বের হওয়ার সময় |
| `Field(validation_alias=AliasChoices('email', 'mail'))` | কয়েকটা নামের যেকোনোটা |
| `Field(validation_alias=AliasPath('user', 'name'))` | nested dict থেকে তুলে আনা |

> ⚠️ Alias দিলে default-এ **আসল নামে আর দেওয়া যায় না**: `ApiUser(user_id=2)` দিলে `missing` error (field `userId` খুঁজছে)। `populate_by_name=True` (Pydantic 2.11+-এ `validate_by_name=True`) দিলে দুটোই চলে।

---

## 13. Nested model, list আর discriminated union

### 13.1 Nested list: error-এর ঠিকানা (loc)

```python
class LineItem(BaseModel):
    sku: str
    qty: int = Field(gt=0)

class Cart(BaseModel):
    customer: str
    items: list[LineItem]

try:
    Cart(customer='Rafi', items=[{'sku': 'A1', 'qty': 2}, {'sku': 'B2', 'qty': 0}, {'qty': 1}])
except ValidationError as e:
    print(e)
```

```
2 validation errors for Cart
items.1.qty
  Input should be greater than 0 [type=greater_than, input_value=0, input_type=int]
    For further information visit https://errors.pydantic.dev/2.14/v/greater_than
items.2.sku
  Field required [type=missing, input_value={'qty': 1}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.14/v/missing
```

`items.1.qty` পড়ো এভাবে: `items` list-এর **index 1** (দ্বিতীয় item)-এর `qty` field। `items.2.sku` = তৃতীয় item-এ `sku` নেই। Deeply nested JSON-এ ভুল কোথায় তা এই path দিয়েই খুঁজে পাবে।

### 13.2 Union: কয়েক রকম data

```python
class Card(BaseModel):
    method: Literal['card']
    card_number: str

class Bkash(BaseModel):
    method: Literal['bkash']
    phone: str = Field(pattern=r'^01\d{9}$')

class Payment(BaseModel):
    amount: float
    detail: Card | Bkash = Field(discriminator='method')   # 'method' দেখে সরাসরি ঠিক model বাছে

p = Payment(amount=500, detail={'method': 'bkash', 'phone': '01712345678'})
print(type(p.detail).__name__, p.detail)
try:
    Payment(amount=500, detail={'method': 'bkash', 'phone': '123'})
except ValidationError as e:
    print(e)
try:
    Payment(amount=500, detail={'method': 'nagad'})
except ValidationError as e:
    print(e)
```

```
Bkash method='bkash' phone='01712345678'
1 validation error for Payment
detail.bkash.phone
  String should match pattern '^01\d{9}$' [type=string_pattern_mismatch, input_value='123', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/string_pattern_mismatch
1 validation error for Payment
detail
  Input tag 'nagad' found using 'method' does not match any of the expected tags: 'card', 'bkash' [type=union_tag_invalid, input_value={'method': 'nagad'}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.14/v/union_tag_invalid
```

**Discriminated union কেন**: শুধু `Card | Bkash` লিখলে Pydantic প্রতিটা option একে একে চেষ্টা করে, আর কোনোটা না মিললে **সব option-এর error** একসাথে দেখায় (পরের উদাহরণ), যা পড়া কঠিন। `discriminator='method'` দিলে আগে `method`-এর মান দেখে, সরাসরি ঠিক model-এ যায়: দ্রুত আর error-এ শুধু সেই model-এর সমস্যা (`detail.bkash.phone`)। অজানা মান হলে `union_tag_invalid` বলে দেয় কোন মানগুলো চলবে।

```python
class PaymentPlain(BaseModel):
    detail: Card | Bkash                   # discriminator ছাড়া

try:
    PaymentPlain(detail={'method': 'bkash', 'phone': '123'})
except ValidationError as e:
    print(e)
```

```
3 validation errors for PaymentPlain
detail.Card.method
  Input should be 'card' [type=literal_error, input_value='bkash', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/literal_error
detail.Card.card_number
  Field required [type=missing, input_value={'method': 'bkash', 'phone': '123'}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.14/v/missing
detail.Bkash.phone
  String should match pattern '^01\d{9}$' [type=string_pattern_mismatch, input_value='123', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/string_pattern_mismatch
```

দেখো: একটা ভুলের জন্য ৩টা error, কারণ Pydantic `Card` হিসেবেও চেষ্টা করেছে (method মেলেনি, card_number নেই)। `detail.Card...` আর `detail.Bkash...`: loc-এ model-এর নাম দেখলে বুঝবে এটা union-এর error।

---

## 14. `TypeAdapter`: model ছাড়াই validate

```python
from pydantic import TypeAdapter

ids = TypeAdapter(list[int])
print(ids.validate_python(['1', 2, '3']))
print(ids.validate_json('[4, 5, 6]'))

books = TypeAdapter(list[Book])
print(books.validate_json('[{"title": "A", "price": 1}, {"title": "B", "price": 2}]'))
print(books.dump_json(books.validate_python([{'title': 'C', 'price': 3}])))
```

```
[1, 2, 3]
[4, 5, 6]
[Book(title='A', price=1.0, author=None), Book(title='B', price=2.0, author=None)]
b'[{"title":"C","price":3.0,"author":null}]'
```

কখন: API একটা **list** ফেরত দেয় (`[{...}, {...}]`), বা শুধু একটা type (`dict[str, int]`, `Card | Bkash`) validate করতে হবে, যার জন্য wrapper model বানানো অপ্রয়োজনীয়। TypeAdapter বানানো একটু ভারী, তাই module-level-এ একবার বানিয়ে বারবার ব্যবহার করো।

---

## 15. `pydantic-settings`: `.env` থেকে config

Install: `pip install pydantic-settings` (Pydantic v2-তে settings আলাদা package)।

### 15.1 প্রথম উদাহরণ: env variable → typed settings

```python
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_prefix='APP_', extra='ignore')
    database_url: str
    debug: bool = False
    port: int = 8000
    allowed_hosts: list[str] = ['localhost']

os.environ['APP_DATABASE_URL'] = 'postgresql://localhost/shop'   # সাধারণত .env বা server-এ থাকে
os.environ['APP_DEBUG'] = 'true'
os.environ['APP_ALLOWED_HOSTS'] = '["example.com", "api.example.com"]'   # list = JSON string
settings = Settings()
print(settings.database_url, settings.debug, settings.port, settings.allowed_hosts)
```

```
postgresql://localhost/shop True 8000 ['example.com', 'api.example.com']
```

- Environment variable সব string, Pydantic সেগুলোকে ঠিক type-এ আনে (`'true'` → `True`, `'8000'` → `8000`)। List/dict হলে JSON string লিখতে হয়।
- `env_prefix='APP_'`: শুধু `APP_` দিয়ে শুরু হওয়া variable পড়ে, তাই অন্য app-এর `DEBUG`-এর সাথে গুলিয়ে যায় না।
- Required setting (`database_url`) না থাকলে app **শুরুতেই** `ValidationError` দিয়ে থামে: production-এ ভুল config নিয়ে অর্ধেক চলার চেয়ে এটা ভালো।

### 15.2 Secret `.env`-এ রাখা: `SecretStr`

বাস্তব project-এ (যেমন JWT auth API) database URL আর secret key কোডে লেখা যায় না, থাকে `.env`-এ:

```env
APP_NAME=Auth API
DEBUG=true
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/appdb
SECRET_KEY=3f9a1c7e5b2d8a64c0e1f7b9d3a5c8e2f4b6a1d7c9e0f2b4a6c8d0e1f3a5b7c9
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

`app/core/config.py`:

```python
from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "My API"
    debug: bool = False
    database_url: str                       # default নেই, তাই জরুরি
    secret_key: SecretStr                   # default নেই, জরুরি, আর print হলে লুকানো থাকে
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
print(settings)
print(settings.secret_key, settings.model_dump_json())
```

```
app_name='Auth API' debug=True database_url='postgresql+asyncpg://postgres:postgres@localhost:5432/appdb' secret_key=SecretStr('**********') access_token_expire_minutes=30
********** {"app_name":"Auth API","debug":true,"database_url":"postgresql+asyncpg://postgres:postgres@localhost:5432/appdb","secret_key":"**********","access_token_expire_minutes":30}
```

আসল secret লাগলে (যেমন JWT sign করতে) শুধু সেই জায়গাতেই খোলো:

```python
print(settings.secret_key.get_secret_value()[:8] + "...")
```

```
3f9a1c7e...
```

বাংলায় বুঝে নাও:

- **`.env`-এর `DEBUG=true` string, কিন্তু `debug: bool`:** Pydantic নিজে `"true"` → `True` করে, `ACCESS_TOKEN_EXPIRE_MINUTES=30` হয় `int` 30। Node-এ `process.env`-এ সব string থাকত, নিজে `parseInt` করতে হতো।
- **নাম মেলে ছোট-বড় হাত নির্বিশেষে:** `.env`-এর `SECRET_KEY` মিলে যায় `secret_key` field-এর সাথে (default `case_sensitive=False`)।
- **Default নেই = জরুরি:** `database_url: str`-এর default নেই, তাই `.env`-এ না থাকলে app **চালুই হবে না** (15.4)।
- **`SecretStr`:** `print(settings)`, log বা `model_dump_json()`-এ ভুলে ছাপা হলেও `**********` দেখায়। আসল মান শুধু `.get_secret_value()` দিয়ে। খেয়াল করো: `model_dump()` (Python dict) মান খোলে না, `SecretStr` object-ই রাখে।
- **`@lru_cache`:** `Settings()` প্রতিবার `.env` file পড়ে। Cache থাকলে একবারই পড়ে, পরের সব call একই object ফেরত দেয় (`get_settings() is get_settings()` → `True`)।
- **`extra="ignore"`:** `.env`-এ এমন key থাকলে যা `Settings`-এ নেই (যেমন `MONGO_URL`), এটা না দিলে error আসে (15.4)। একটা `.env` কয়েকটা service share করলে এটা লাগবেই।

### 15.3 FastAPI-তে `Depends(get_settings)`

```python
from typing import Annotated
from fastapi import Depends, FastAPI
from app.core.config import Settings, get_settings

app = FastAPI()


@app.get("/info")
def info(settings: Annotated[Settings, Depends(get_settings)]):
    return {
        "app": settings.app_name,
        "debug": settings.debug,
        "token_minutes": settings.access_token_expire_minutes,
        "secret_preview": str(settings.secret_key),
    }
```

**`GET /info`:**

```
{"app":"Auth API","debug":true,"token_minutes":30,"secret_preview":"**********"}
```

Global `settings` import না করে `Depends(get_settings)` কেন? Test-এ অন্য settings বসানো যায়, `.env` না ছুঁয়েই:

```python
app.dependency_overrides[get_settings] = lambda: Settings(
    database_url="sqlite://", secret_key="test-secret"
)
```

### 15.4 Setting ভুল বা অনুপস্থিত হলে কোন error

**`.env`-এ `SECRET_KEY` নেই:** app চালু হওয়ার সময়ই (`Settings()` call-এ) থামে:

```
pydantic_core._pydantic_core.ValidationError: 1 validation error for Settings
secret_key
  Field required [type=missing, input_value={'app_name': 'Auth API', ...esql://localhost/appdb'}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.14/v/missing
```

`input_value` হলো Pydantic যা যা খুঁজে পেয়েছে (`.env` + environment), লম্বা হলে মাঝখানে `...` দিয়ে কাটা। Field-এর নাম (`secret_key`) দেখে বুঝবে কোন variable বসাতে হবে: `SECRET_KEY` (prefix থাকলে `APP_SECRET_KEY`)।

**`.env`-এ অজানা key, আর `extra="ignore"` দেওয়া নেই:** `BaseSettings`-এর default `extra='forbid'`, তাই:

```
1 validation error for Settings
mongo_url
  Extra inputs are not permitted [type=extra_forbidden, input_value='mongodb://localhost', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/extra_forbidden
```

সমাধান: `SettingsConfigDict(..., extra="ignore")`, অথবা field-টা `Settings`-এ যোগ করো।

**Type ভুল** (যেমন `ACCESS_TOKEN_EXPIRE_MINUTES=thirty`): সাধারণ `int_parsing` error, field-এর নামসহ (18.2)।

### 15.5 কোন মান জেতে (priority)

বেশি শক্তিশালী আগে:

1. `Settings(...)`-এ সরাসরি দেওয়া মান
2. Operating system-এর environment variable
3. `.env` file
4. Class-এর default মান

`.env`-এ `DEBUG=true` আর OS-এ `DEBUG=false` থাকলে `Settings().debug` → `False` (OS জেতে), কিন্তু `Settings(debug=True).debug` → `True`। তাই production-এ (Docker, Railway, Render) `.env` file ছাড়াই dashboard-এ environment variable বসালে সেটাই কাজ করে। `.env` file **git-এ commit করো না** (`.gitignore`-এ রাখো), বদলে key-গুলোর খালি নমুনা `.env.example`-এ রাখো।

### 15.6 Secret key বানানো

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Output (প্রতিবার আলাদা):**

```
3f9a1c7e5b2d8a64c0e1f7b9d3a5c8e2f4b6a1d7c9e0f2b4a6c8d0e1f3a5b7c9
```

`token_hex(32)` = 32 random byte = 64টা hex অক্ষর। এটাই `SECRET_KEY`। উপরের `.env`-এর key শুধু উদাহরণ, **নিজেরটা বানাও**, আর development ও production-এর key আলাদা রাখো।

---

## 16. FastAPI-তে Pydantic

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

class ItemCreate(BaseModel):              # request: ব্যবহারকারী যা পাঠাবে
    name: str = Field(min_length=3)
    price: float = Field(gt=0)

class ItemUpdate(BaseModel):              # PATCH: সব optional
    name: str | None = Field(default=None, min_length=3)
    price: float | None = Field(default=None, gt=0)

class ItemOut(BaseModel):                 # response: যা ফেরত যাবে
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    price: float

@app.post('/items', response_model=ItemOut, status_code=201)
def create_item(payload: ItemCreate):
    return {'id': 1, **payload.model_dump()}

@app.patch('/items/{item_id}', response_model=ItemOut)
def update_item(item_id: int, payload: ItemUpdate):
    stored = {'id': item_id, 'name': 'Old name', 'price': 10.0}
    stored.update(payload.model_dump(exclude_unset=True))     # শুধু পাঠানো field বদলাও
    return stored
```

**Create / Update / Out**: তিনটা আলাদা schema কেন?

- **Create**: `id` নেই (database বানায়), password থাকতে পারে।
- **Update**: সব field optional, আর `exclude_unset=True` দিয়ে শুধু পাঠানোগুলো বদলাও। না দিলে না-পাঠানো field `None` দিয়ে পুরনো মান মুছে দেবে।
- **Out** (`response_model`): যা ফেরত যাবে শুধু তা; password_hash-এর মতো জিনিস ভুলেও বের হয় না।

Validation ব্যর্থ হলে FastAPI নিজেই **422 Unprocessable Entity** দেয়, body-তে Pydantic-এর `errors()` list:

```json
{
  "detail": [
    {
      "type": "greater_than",
      "loc": ["body", "price"],
      "msg": "Input should be greater than 0",
      "input": -5,
      "ctx": { "gt": 0.0 }
    }
  ]
}
```

`loc`-এর প্রথম অংশ বলে data কোথা থেকে এসেছিল: `body`, `query`, `path`, `header`। Frontend এই `loc` দিয়ে ঠিক input box-এর নিচে error দেখাতে পারে।

> ⚠️ **422 বনাম 500**: 422 = client-এর পাঠানো data ভুল (request validation)। কিন্তু তোমার endpoint যা return করছে তা `response_model`-এর সাথে না মিললে সেটা server-এর দোষ: FastAPI `ResponseValidationError` দেয় আর client পায় **500 Internal Server Error**। Server log-এ "ResponseValidationError" দেখলে বুঝবে return করা data-য় field কম বা ভুল type।

---

# পর্ব ৪ — Error message চেনা (real app-এর জন্য)

## 17. ValidationError কীভাবে পড়বে

```python
class Signup2(BaseModel):
    email: EmailStr
    age: int = Field(ge=18)
    plan: Literal['free', 'pro']

try:
    Signup2(email='rafi@', age='17', plan='gold')
except ValidationError as e:
    print(e)
    print('---')
    print(e.error_count())
    for err in e.errors():
        print(err['type'], err['loc'], err['msg'], '| input =', repr(err['input']))
```

```
3 validation errors for Signup2
email
  value is not a valid email address: There must be something after the @-sign. [type=value_error, input_value='rafi@', input_type=str]
age
  Input should be greater than or equal to 18 [type=greater_than_equal, input_value='17', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/greater_than_equal
plan
  Input should be 'free' or 'pro' [type=literal_error, input_value='gold', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/literal_error
---
3
value_error ('email',) value is not a valid email address: There must be something after the @-sign. | input = 'rafi@'
greater_than_equal ('age',) Input should be greater than or equal to 18 | input = '17'
literal_error ('plan',) Input should be 'free' or 'pro' | input = 'gold'
```

একটা error-এর অংশগুলো:

```text
3 validation errors for Signup2          ← মোট কয়টা ভুল, কোন model-এ
age                                      ← loc: কোন field (nested হলে items.1.qty)
  Input should be greater than or equal to 18     ← msg: মানুষের পড়ার মতো বর্ণনা
  [type=greater_than_equal,              ← type: error-এর code (কোডে এটা দিয়ে চেনো)
   input_value='17',                     ← যা আসলে এসেছিল
   input_type=str]                       ← তার Python type
    For further information visit https://errors.pydantic.dev/.../v/greater_than_equal
```

- **প্রথমে `loc` দেখো** (কোথায়), তারপর `type` (কী ধরনের), তারপর `input_value` (আসলে কী এসেছিল)। বেশিরভাগ bug `input_value` দেখলেই ধরা পড়ে: হয়তো `None` এসেছে, বা পুরো object-টা একটা string হয়ে এসেছে।
- `e.errors()` = list of dict: API response বা log-এ পাঠানোর জন্য। `e.json()` = একই জিনিস JSON string।
- `ctx` = constraint-এর মান (যেমন `{'ge': 18}`)।
- `age='17'` string ছিল, তবুও error `greater_than_equal`, `int_parsing` না: আগে `'17'` → `17` হয়েছে, তারপর `ge=18` ব্যর্থ। Type রূপান্তর আগে, constraint পরে।

### নিজের helper (এই অংশের বাকি উদাহরণের জন্য)

```python
def check(model, **data):
    try:
        print(model(**data))
    except ValidationError as e:
        print(e)
```

---

## 18. সাধারণ error: message, মানে, সমাধান

### 18.1 `missing`: required field দেওয়া হয়নি

```python
class Item2(BaseModel):
    name: str
    price: float

check(Item2, name='Tea')
```

```
1 validation error for Item2
price
  Field required [type=missing, input_value={'name': 'Tea'}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.14/v/missing
```

**মানে**: `price` required (default নেই), কিন্তু data-য় key-টাই নেই। **কোথায় দেখবে**: frontend field-এর নাম ভুল পাঠাচ্ছে (`Price`, `item_price`), alias দিয়েছ কিন্তু আসল নামে পাঠাচ্ছ, বা `Optional[...]` লিখে ভেবেছ optional (সেকশন ৩)। **সমাধান**: key-এর নাম মেলাও, অথবা default দাও (`price: float = 0` / `| None = None`)।

### 18.2 `int_parsing`, `float_parsing`: সংখ্যা না

```python
check(Item2, name='Tea', price='free')
check(Lax, n='12abc', f=1, flag=True, s='x')
```

```
1 validation error for Item2
price
  Input should be a valid number, unable to parse string as a number [type=float_parsing, input_value='free', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/float_parsing
1 validation error for Lax
n
  Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='12abc', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/int_parsing
```

**মানে**: string-টা সংখ্যায় রূপান্তর করা যায়নি। Form-এ `'1,200'`, `'৳500'`, `'12 pcs'`, খালি string `''` এর সাধারণ কারণ। **সমাধান**: `mode='before'` validator দিয়ে পরিষ্কার করো (সেকশন ৭)।

### 18.3 `int_from_float`: দশমিকওয়ালা মান int-এ

```python
check(Lax, n=2.5, f=1, flag=True, s='x')
```

```
1 validation error for Lax
n
  Input should be a valid integer, got a number with a fractional part [type=int_from_float, input_value=2.5, input_type=float]
    For further information visit https://errors.pydantic.dev/2.14/v/int_from_float
```

**মানে**: `2.5` int-এ নিলে `.5` হারাবে, তাই Pydantic নিজে কেটে দেয় না। `2.0` হলে চলত। **সমাধান**: field-টা কি সত্যিই int? না হলে `float`; হলে input-এ round করে পাঠাও।

### 18.4 `string_type`, `bool_parsing`, `list_type`, `model_type`: ভুল ধরনের data

```python
check(Lax, n=1, f=1, flag='maybe', s=123)
check(Cart, customer='Rafi', items={'sku': 'A1', 'qty': 1})       # list-এর জায়গায় dict
check(Cart, customer='Rafi', items=['A1'])                         # model-এর জায়গায় str
```

```
2 validation errors for Lax
flag
  Input should be a valid boolean, unable to interpret input [type=bool_parsing, input_value='maybe', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/bool_parsing
s
  Input should be a valid string [type=string_type, input_value=123, input_type=int]
    For further information visit https://errors.pydantic.dev/2.14/v/string_type
1 validation error for Cart
items
  Input should be a valid list [type=list_type, input_value={'sku': 'A1', 'qty': 1}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.14/v/list_type
1 validation error for Cart
items.0
  Input should be a valid dictionary or instance of LineItem [type=model_type, input_value='A1', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/model_type
```

- `string_type`: number থেকে str-এ v2 নিজে রূপান্তর করে না (v1 করত)। ID-গুলো frontend থেকে number হয়ে এলে এটা দেখবে। সমাধান: field-কে `int` করো, বা `ConfigDict(coerce_numbers_to_str=True)`।
- `list_type`: list চেয়েছিল, একটা object এসেছে। API একটা item পাঠালে `[item]` দিয়ে মুড়ে পাঠাতে হবে।
- `model_type`: nested model চেয়েছিল (dict বা model instance), এসেছে `'A1'`। Message-এ `Input should be a valid dictionary or instance of LineItem`।

### 18.5 Constraint error: `greater_than`, `string_too_short`, `string_pattern_mismatch`, `too_long`

```python
check(Product, name='TV', price=-1, sku='tv-1', tags=['a', 'b', 'c', 'd', 'e', 'f'])
```

```
4 validation errors for Product
name
  String should have at least 3 characters [type=string_too_short, input_value='TV', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/string_too_short
price
  Input should be greater than 0 [type=greater_than, input_value=-1, input_type=int]
    For further information visit https://errors.pydantic.dev/2.14/v/greater_than
sku
  String should match pattern '^[A-Z]{3}-\d{4}$' [type=string_pattern_mismatch, input_value='tv-1', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/string_pattern_mismatch
tags
  List should have at most 5 items after validation, not 6 [type=too_long, input_value=['a', 'b', 'c', 'd', 'e', 'f'], input_type=list]
    For further information visit https://errors.pydantic.dev/2.14/v/too_long
```

প্রতিটা `type` নাম থেকেই কোন constraint ভেঙেছে বোঝা যায়: `string_too_short` ↔ `min_length`, `greater_than` ↔ `gt`, `string_pattern_mismatch` ↔ `pattern`, `too_long` ↔ list-এর `max_length`। Pattern error-এ message-এ পুরো regex দেখায়: frontend-এ ব্যবহারকারীকে দেখানোর আগে বন্ধুত্বপূর্ণ message-এ বদলে নিও।

### 18.6 `literal_error`, `enum`: অনুমোদিত মানের বাইরে

```python
check(Order, id='8f14e45f-ceea-467f-a8f8-3c9e5b1d2a10', items=[], size='XL', status='shipped',
      coupon=None, address={'city': 'Dhaka', 'zip_code': '1'}, created_at='2025-01-01')
```

```
2 validation errors for Order
status
  Input should be 'pending' or 'paid' [type=enum, input_value='shipped', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/enum
size
  Input should be 'S', 'M' or 'L' [type=literal_error, input_value='XL', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/literal_error
```

**মানে**: Message-এ নিজেই অনুমোদিত মানগুলোর তালিকা দেয়। বড়-ছোট হাতের অক্ষর আলাদা (`'m'` ≠ `'M'`)। **সমাধান**: before validator-এ `.upper()`/`.lower()`, বা মান তালিকায় যোগ করো।

### 18.7 Email, URL, date, UUID: format ভুল

```python
check(Account, email='rafi@gmail', website='example.com', repo='not a url', password='x',
      age=0, birthday='2099-01-01', balance='abc')
```

```
6 validation errors for Account
email
  value is not a valid email address: The part after the @-sign is not valid. It should have a period. [type=value_error, input_value='rafi@gmail', input_type=str]
website
  Input should be a valid URL, relative URL without a base [type=url_parsing, input_value='example.com', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/url_parsing
repo
  Input should be a valid URL, relative URL without a base [type=url_parsing, input_value='not a url', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/url_parsing
age
  Input should be greater than 0 [type=greater_than, input_value=0, input_type=int]
    For further information visit https://errors.pydantic.dev/2.14/v/greater_than
birthday
  Date should be in the past [type=date_past, input_value='2099-01-01', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/date_past
balance
  Input should be a valid decimal [type=decimal_parsing, input_value='abc', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/decimal_parsing
```

| type | সাধারণ কারণ |
| --- | --- |
| `value_error` (email) | `@` নেই, domain-এ `.` নেই, শেষে space |
| `url_parsing` / `url_scheme` | `https://` দেওয়া হয়নি, `HttpUrl`-এ `ftp://` |
| `greater_than` (PositiveInt) | 0 বা ঋণাত্মক |
| `date_past` / `date_future` | `PastDate`-এ ভবিষ্যতের তারিখ |
| `decimal_parsing` | `Decimal`-এ সংখ্যা না |

```python
class When(BaseModel):
    d: date
    t: datetime
    uid: UUID

check(When, d='15/01/2025', t='yesterday', uid='1234')
check(When, d='2025-02-30', t='2025-01-15 10:30', uid='8f14e45f-ceea-467f-a8f8-3c9e5b1d2a10')
```

```
3 validation errors for When
d
  Input should be a valid date or datetime, invalid character in year [type=date_from_datetime_parsing, input_value='15/01/2025', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/date_from_datetime_parsing
t
  Input should be a valid datetime or date, input is too short [type=datetime_from_date_parsing, input_value='yesterday', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/datetime_from_date_parsing
uid
  Input should be a valid UUID, invalid length: found 4 [type=uuid_parsing, input_value='1234', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/uuid_parsing
1 validation error for When
d
  Input should be a valid date or datetime, day value is outside expected range [type=date_from_datetime_parsing, input_value='2025-02-30', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/date_from_datetime_parsing
```

- তারিখ সবসময় **ISO 8601** format-এ: `YYYY-MM-DD`, `YYYY-MM-DDTHH:MM:SS` (মাঝে space-ও চলে)। `15/01/2025` বা `Jan 15` চলে না: before validator-এ `datetime.strptime` দিয়ে parse করো।
- `2025-02-30`: format ঠিক, তারিখটা অসম্ভব → `date_from_datetime_parsing` + `day value is outside expected range`।

### 18.8 `extra_forbidden`: অজানা field

```python
check(Strictish, name='Pen', qty=1, colour='blue', price=10)
```

```
2 validation errors for Strictish
colour
  Extra inputs are not permitted [type=extra_forbidden, input_value='blue', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/extra_forbidden
price
  Extra inputs are not permitted [type=extra_forbidden, input_value=10, input_type=int]
    For further information visit https://errors.pydantic.dev/2.14/v/extra_forbidden
```

**মানে**: `extra='forbid'` দেওয়া model-এ এমন key এসেছে যা model-এ নেই। প্রায়ই **বানান ভুল** (`colour` বনাম `color`) বা frontend পুরনো field পাঠাচ্ছে। Default (`extra='ignore'`)-এ এগুলো চুপচাপ বাদ পড়ে: তখন bug খুঁজে পাওয়া কঠিন, কারণ data হারিয়ে যায় কোনো error ছাড়া।

### 18.9 `frozen_instance`: frozen model বদলানোর চেষ্টা

```python
s = Strictish(name='Pen', qty=1)
try:
    s.qty = 5
except ValidationError as e:
    print(e)
print(s.model_copy(update={'qty': 5}))       # বদলানো copy চাইলে
```

```
1 validation error for Strictish
qty
  Instance is frozen [type=frozen_instance, input_value=5, input_type=int]
    For further information visit https://errors.pydantic.dev/2.14/v/frozen_instance
name='Pen' qty=5
```

লক্ষ করো: frozen-এ বদলানোর চেষ্টা `AttributeError` না, `ValidationError` দেয়। সমাধান: `model_copy(update=...)` দিয়ে নতুন object।

### 18.10 Custom validator-এর error: `value_error`, `assertion_error`

```python
class Coupon(BaseModel):
    code: str
    percent: int

    @field_validator('code')
    @classmethod
    def upper_only(cls, v: str) -> str:
        if not v.isupper():
            raise ValueError('coupon code must be uppercase')
        return v

    @field_validator('percent')
    @classmethod
    def sane_percent(cls, v: int) -> int:
        assert 0 < v <= 90, 'percent must be between 1 and 90'
        return v

check(Coupon, code='eid25', percent=95)
```

```
2 validation errors for Coupon
code
  Value error, coupon code must be uppercase [type=value_error, input_value='eid25', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/value_error
percent
  Assertion failed, percent must be between 1 and 90 [type=assertion_error, input_value=95, input_type=int]
    For further information visit https://errors.pydantic.dev/2.14/v/assertion_error
```

তোমার নিজের message-এর আগে Pydantic `Value error, ` বা `Assertion failed, ` বসায়। `type=value_error` দেখলে বুঝবে এটা কারো লেখা custom validator থেকে এসেছে, তাই কারণ খুঁজতে সেই validator-এর কোড দেখো।

> ⚠️ `assert` production-এ `python -O` দিয়ে চালালে **বন্ধ হয়ে যায়**, তখন validation চুপচাপ পাস করে। গুরুত্বপূর্ণ নিয়মে সবসময় `raise ValueError`।

---

## 19. Union আর strict-এর কঠিন error

### 19.1 Union-এ একটা ভুলের জন্য কয়েকটা error

```python
class Measure(BaseModel):
    amount: int | float
    count: int | None = None

check(Measure, amount='many', count='few')
```

```
3 validation errors for Measure
amount.int
  Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='many', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/int_parsing
amount.float
  Input should be a valid number, unable to parse string as a number [type=float_parsing, input_value='many', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/float_parsing
count
  Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='few', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/int_parsing
```

`amount: int | float` একটা union, তাই Pydantic প্রতিটা branch চেষ্টা করে আর **প্রতিটার** error দেখায়: loc `amount.int` আর `amount.float` মানে "union-এর এই branch-এ ব্যর্থ"। Union বড় হলে (৪–৫টা model) একটা ভুলে ১০টা error-ও দেখতে পারো: তখন discriminator দাও (সেকশন ১৩.২)।

`count: int | None` (Optional) কিন্তু একটাই error দিয়েছে: Pydantic Optional-কে "nullable" হিসেবে আলাদা করে সামলায়, তাই শুধু আসল type-এর error দেখায়।

### 19.2 Strict mode-এ `int_type`, `date_type`

```python
check(Strict, n='10', d=date(2025, 1, 1))
check(Strict, n=10.0, d='2025-01-01')
```

```
1 validation error for Strict
n
  Input should be a valid integer [type=int_type, input_value='10', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/int_type
2 validation errors for Strict
n
  Input should be a valid integer [type=int_type, input_value=10.0, input_type=float]
    For further information visit https://errors.pydantic.dev/2.14/v/int_type
d
  Input should be a valid date [type=date_type, input_value='2025-01-01', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/date_type
```

Lax-এ `int_parsing` (রূপান্তর করতে গিয়ে ব্যর্থ), strict-এ `int_type` (রূপান্তরের চেষ্টাই করেনি, type মেলেনি)। `_type` দিয়ে শেষ হওয়া error দেখলে প্রথমে দেখো strict mode চালু কিনা।

### 19.3 Field-এর নাম আর type একই: `date: date`

```python
from typing import Optional
from datetime import date

try:
    class Visit(BaseModel):
        date: date | None = None       # field-এর নাম 'date', type-ও 'date'
except TypeError as e:
    print('TypeError:', e)

class Visit2(BaseModel):
    date: Optional[date] = None        # Optional দিয়ে লিখলে class তৈরি হয়, কিন্তু...

check(Visit2, date='2025-01-15')
```

```
TypeError: unsupported operand type(s) for |: 'NoneType' and 'NoneType'
1 validation error for Visit2
date
  Input should be None [type=none_required, input_value='2025-01-15', input_type=str]
    For further information visit https://errors.pydantic.dev/2.14/v/none_required
```

এটা Python-এর একটা ফাঁদ: class body-তে `date = None` (default) লেখার সাথে সাথে class-এর ভেতরে `date` নামটা `None`-কে বোঝায়। তারপর annotation evaluate হয়:

- `date | None` হয়ে যায় `None | None` → class define করতেই `TypeError: unsupported operand type(s) for |: 'NoneType' and 'NoneType'`।
- `Optional[date]` হয়ে যায় `Optional[None]`, অর্থাৎ field **শুধু `None` নেয়** → আসল তারিখ দিলে `none_required`। এটা আরও বিপজ্জনক, কারণ class ঠিকঠাক তৈরি হয়, ভুল ধরা পড়ে শুধু data আসার পর।

Default ছাড়া (`date: date`) কাকতালীয়ভাবে চলে, কিন্তু ঝুঁকিপূর্ণ। **সমাধান**: field-এর নাম বদলাও (`visit_date: date`), অথবা `import datetime` করে `date: datetime.date | None = None`।

---

## 20. Model লেখার সময়ের error (data না, কোডের ভুল)

এগুলো `ValidationError` না: class define করার সময়ই (import করতেই) ওঠে, অথবা Python-এর সাধারণ exception।

### 20.1 `@field_validator(name)`: quote ছাড়া field-এর নাম

```python
try:
    class Dish(BaseModel):
        name: str = Field(min_length=3)

        @field_validator(name)                 # ❌ 'name' string হওয়ার কথা
        @classmethod
        def title_name(cls, value):
            return value.title()
except Exception as e:
    print(type(e).__name__ + ':', e)
```

```
PydanticUserError: The provided field names to the `@field_validator` decorator should be strings. For example: `@field_validator('<field_name_1>', '<field_name_2>', ...).`

For further information visit https://errors.pydantic.dev/2.14/u/decorator-invalid-fields
```

Quote ছাড়া `name` লিখলে Python সেটাকে variable হিসেবে পড়ে: এখানে `name = Field(...)`-এর FieldInfo object। Field-এর default না থাকলে `NameError: name 'name' is not defined` আসত। **সমাধান**: `@field_validator('name')`।

### 20.2 ভুল type-এ constraint: `Unable to apply constraint`

```python
class Category(BaseModel):
    name: Literal['starter', 'main course', 'dessert', 'coffee']

try:
    class Menu(BaseModel):
        category: Category = Field(gt=0)      # ❌ model-কে "0-এর বেশি" বলা যায় না
    Menu(category={'name': 'coffee'})
except Exception as e:
    print(type(e).__name__ + ':', e)
```

```
TypeError: Unable to apply constraint 'gt' to supplied value name='coffee'
```

`gt`, `ge` শুধু তুলনা করা যায় এমন type-এ (সংখ্যা, date), `min_length` শুধু str/list-এ। Model-এ constraint লাগলে `model_validator` লেখো।

### 20.3 `PydanticSchemaGenerationError`: Pydantic চেনে না এমন type

```python
class Camera:                    # সাধারণ Python class
    pass

try:
    class Photo(BaseModel):
        camera: Camera
except Exception as e:
    print(type(e).__name__ + ':', str(e).split('\n')[0])

class Photo(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)   # শুধু isinstance check করবে
    camera: Camera

print(Photo(camera=Camera()).camera.__class__.__name__)
```

```
PydanticSchemaGenerationError: Unable to generate pydantic-core schema for <class '__main__.Camera'>. Set `arbitrary_types_allowed=True` in the model_config to ignore this error or implement `__get_pydantic_core_schema__` on your type to fully support it.
Camera
```

NumPy array, pandas DataFrame, নিজের class সাধারণত এই error দেয়। `arbitrary_types_allowed=True` দিলে Pydantic শুধু `isinstance` যাচাই করে (রূপান্তর বা JSON schema হয় না)। ভালো সমাধান: নিজের class-কেও `BaseModel` বানাও।

### 20.4 `is not fully defined`: forward reference

```python
from pydantic import PydanticUserError

class Employee(BaseModel):
    name: str
    manager: 'Manager | None' = None     # Manager এখনো define হয়নি

try:
    Employee(name='Rafi')                # এখনো Manager নেই
except PydanticUserError as e:
    print(e)

class Manager(BaseModel):
    name: str

Employee.model_rebuild()                 # এখন Manager আছে, schema আবার বানাও
print(Employee(name='Rafi', manager={'name': 'Nila'}))
```

```
`Employee` is not fully defined; you should define `Manager`, then call `Employee.model_rebuild()`.

For further information visit https://errors.pydantic.dev/2.14/u/class-not-fully-defined
name='Rafi' manager=Manager(name='Nila')
```

সাধারণত দুইটা model একে অপরকে refer করলে বা আলাদা file-এ circular import-এ হয়। একই file-এ পরের model define হলে Pydantic অনেক সময় নিজেই ঠিক করে নেয়; না পারলে `Model.model_rebuild()`। নিজেকে refer করা (tree, comment-এর reply) সাধারণত নিজেই কাজ করে: `children: list['Node'] = []`।

### 20.5 v1-এর কোড v2-তে: deprecation warning

```python
import warnings
from pydantic import validator

with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter('always')

    class OldStyle(BaseModel):
        x: int

        class Config:
            orm_mode = True

        @validator('x')
        def positive(cls, v):
            return v

    OldStyle(x=1).dict()

for w in caught:
    print(type(w.message).__name__ + ':', str(w.message).split('.')[0])
```

```
PydanticDeprecatedSince20: Pydantic V1 style `@validator` validators are deprecated
PydanticDeprecatedSince20: Support for class-based `config` is deprecated, use ConfigDict instead
UserWarning: Valid config keys have changed in V2:
* 'orm_mode' has been renamed to 'from_attributes'
UserWarning: Valid config keys have changed in V2:
* 'orm_mode' has been renamed to 'from_attributes'
PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead
```

| v1 | v2 |
| --- | --- |
| `.dict()`, `.json()` | `.model_dump()`, `.model_dump_json()` |
| `.parse_obj(d)`, `.parse_raw(s)` | `.model_validate(d)`, `.model_validate_json(s)` |
| `.copy(update=)` | `.model_copy(update=)` |
| `.schema()` | `.model_json_schema()` |
| `@validator` | `@field_validator` (+ `@classmethod`) |
| `@root_validator` | `@model_validator` |
| `class Config:` | `model_config = ConfigDict(...)` |
| `orm_mode = True` | `from_attributes=True` |
| `allow_population_by_field_name` | `populate_by_name` |
| `Optional[x]` ছিল আপনা থেকে optional | default (`= None`) লাগে |
| `const=True`, `regex=` | `Literal[...]`, `pattern=` |

পুরনো tutorial বা Stack Overflow-এর কোড কপি করলে এই warning-গুলো দেখবে। এখন চলে, কিন্তু Pydantic v3-এ মুছে যাবে।

### 20.6 আরও কিছু Python-লেভেলের ভুল

| দেখলে | কারণ | সমাধান |
| --- | --- | --- |
| `TypeError: exceptions must derive from BaseException` | validator-এ `raise('message')` | `raise ValueError('message')` |
| Field-এর মান হঠাৎ `None` | `field_validator` value return করতে ভুলে গেছ | শেষে `return value` |
| `UserWarning: A custom validator is returning a value other than self` | `model_validator(mode='after')` থেকে কিছু return হয়নি | `return self` |
| `TypeError: BaseModel.__init__() takes 1 positional argument` | `Model(1, 'x')` | keyword argument |
| `PydanticUserError: Decorators defined with incorrect fields` | validator-এ এমন field-এর নাম যা model-এ নেই (বানান ভুল) | নাম ঠিক করো |
| `AttributeError: 'Model' object has no attribute ...` | `field_validator`-এ `self.x` (এখানে `self` নেই) | `info.data['x']` বা `model_validator` |
| `TypeError: Object of type Url is not JSON serializable` | `json.dumps(model.model_dump())`-এ URL/date | `model.model_dump_json()` বা `model_dump(mode='json')` |

### 20.7 একটা model-এ ৭টা ভুল: ধাপে ধাপে ঠিক করা

```python
# ❌ ভুলে ভরা model
class Model(BaseModel):
    model_config = ConfigDict(extra='forbid', frozen=True, strict=True, validate_assignment=True)

    name: str = Field(..., min_length=3)
    price: float
    category: CategoryModel = Field(..., gt=0)          # ২
    email: EmailStr
    date: date                                          # ৪ (ঝুঁকি)

    @field_validator(name)                              # ১
    @classmethod
    def title_name(cls, value):
        return value.title()

    @model_validator(mode='after')
    def check_available(self):
        if self.is_available and self.price <= 0:
            raise('Available item must have price greater than 0')   # ৩
        return self

item = Model(name='Espresso', price=20.5, category=CategoryModel(name='coffee'))   # ৫, ৬
```

| # | ভুল | কী হয় | ঠিক রূপ |
| --- | --- | --- | --- |
| ১ | `@field_validator(name)` | `PydanticUserError: ... should be strings` | `@field_validator('name')` |
| ২ | model field-এ `gt=0` | `TypeError: Unable to apply constraint 'gt'` | constraint বাদ দাও |
| ৩ | `raise('...')` | নিয়ম ভাঙলে `TypeError` | `raise ValueError('...')` |
| ৪ | field `date`, type `date` | এখন চলে, কিন্তু default দিলেই ভাঙে (সেকশন ১৯.৩) | `available_from: date` |
| ৫ | `email`, `date` না দিয়ে instance | `missing` error | সব required field দাও, বা default |
| ৬ | `strict=True` আর date/URL string হিসেবে দেওয়া | `date_type`, `url_type` error | strict বাদ, বা JSON থেকে `model_validate_json` |
| ৭ | `frozen=True` আর `validate_assignment=True` একসাথে | ভুল না, কিন্তু অর্থহীন: frozen-এ assignment-ই হয় না | একটা রাখো |
| বোনাস | `'desert'` বানান | মরুভূমি! | `'dessert'` |

```python
# ✅ ঠিক করা model
class CategoryModel(BaseModel):
    name: Literal['starter', 'main course', 'dessert', 'coffee']

class MenuItem(BaseModel):
    model_config = ConfigDict(extra='forbid', frozen=True)

    id: int
    name: str = Field(min_length=3, max_length=50, description='item name')
    price: float = Field(ge=0)
    category: CategoryModel
    is_available: bool = True
    description: str | None = None
    email: EmailStr
    url: AnyUrl
    available_from: date

    @field_validator('name')
    @classmethod
    def title_name(cls, value: str) -> str:
        return value.title()

    @model_validator(mode='after')
    def check_available(self):
        if self.is_available and self.price <= 0:
            raise ValueError('available item must have price greater than 0')
        return self

    @computed_field
    @property
    def price_with_tax(self) -> float:
        return round(self.price * 1.05, 2)

item = MenuItem(id=1, name='chiCken BIRYANI', price=250, category={'name': 'main course'},
                email='kitchen@example.com', url='https://example.com/menu', available_from='2025-01-01')
print(item.model_dump())
print(item.model_dump_json())
check(MenuItem, id=2, name='Tea', price=0, category={'name': 'coffee'},
      email='kitchen@example.com', url='https://example.com', available_from='2025-01-01')
```

```
{'id': 1, 'name': 'Chicken Biryani', 'price': 250.0, 'category': {'name': 'main course'}, 'is_available': True, 'description': None, 'email': 'kitchen@example.com', 'url': AnyUrl('https://example.com/menu'), 'available_from': datetime.date(2025, 1, 1), 'price_with_tax': 262.5}
{"id":1,"name":"Chicken Biryani","price":250.0,"category":{"name":"main course"},"is_available":true,"description":null,"email":"kitchen@example.com","url":"https://example.com/menu","available_from":"2025-01-01","price_with_tax":262.5}
1 validation error for MenuItem
  Value error, available item must have price greater than 0 [type=value_error, input_value={'id': 2, 'name': 'Tea', ...ble_from': '2025-01-01'}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.14/v/value_error
```

---

# পর্ব ৫ — Interview ও Revision

## 21. Interview প্রশ্ন-উত্তর

### 21.1 Pydantic কী, আর কেন ব্যবহার করো?

**Answer:** Pydantic is a data validation and parsing library driven by Python type hints. You declare a model with typed fields and constraints; it validates incoming data at runtime, converts it to the right types, and serializes back to dicts or JSON, with clear errors that show where and why validation failed. I use it at system boundaries: API requests and responses (it's FastAPI's foundation), configuration from environment variables, and parsing external or LLM-generated JSON.

### 21.2 Pydantic v1 আর v2-এর মূল পার্থক্য?

**Answer:** V2 rewrote the core in Rust (`pydantic-core`), so validation is several times to tens of times faster. The API was renamed: `model_dump`/`model_validate` instead of `dict`/`parse_obj`, `field_validator`/`model_validator` instead of `validator`/`root_validator`, and `model_config = ConfigDict(...)` instead of `class Config`. Behaviour also changed: `Optional[X]` no longer implies a default of `None`, numbers are no longer coerced to strings, and there's a strict mode.

### 21.3 Lax mode আর strict mode কী?

**Answer:** In the default lax mode, Pydantic coerces inputs when it's unambiguous and lossless: `'42'` becomes `42`, `'true'` becomes `True`, but `4.5` won't become an int. In strict mode, types must match exactly, so `'42'` fails for an int field. JSON input is special: types JSON can't express, like dates and UUIDs, are still accepted as strings. Strict mode can be set per model, per field (`Field(strict=True)`), or per call.

### 21.4 `field_validator` আর `model_validator`-এর পার্থক্য? `before` আর `after` mode?

**Answer:** A `field_validator` checks or transforms one field (or several listed fields) and returns the value. A `model_validator` sees the whole model and is used for cross-field rules, like end date after start date. `mode='after'` runs after Pydantic's own type validation, so values are already typed; `mode='before'` receives the raw input, for cleaning things like `'1,200'` before type parsing. An after model validator gets `self` and must return it; validators signal failure by raising `ValueError`.

### 21.5 `Optional[int]` দিলে কি field optional হয়?

**Answer:** No. In v2, `Optional[int]` (or `int | None`) only means the value may be `None`; the field is still required unless it has a default. For a truly optional field write `x: int | None = None`.

### 21.6 `model_dump`-এর `exclude_unset` কেন দরকার?

**Answer:** It returns only the fields that were explicitly provided, leaving out defaults. That's essential for PATCH endpoints: if the update schema has all fields defaulting to `None`, a plain `model_dump()` would include `None` for every field the client didn't send and overwrite existing data. With `exclude_unset=True` only the sent fields are applied.

### 21.7 FastAPI-তে Pydantic কীভাবে ব্যবহার হয়? 422 কখন আসে?

**Answer:** Path, query and body parameters annotated with types or models are validated by Pydantic before the endpoint runs; invalid input returns 422 with the error list (`type`, `loc`, `msg`, `input`), where `loc` starts with `body`, `query` or `path`. `response_model` filters and validates the output, so fields like password hashes are never leaked. If the returned data doesn't fit `response_model`, that's a server bug and surfaces as a 500, not a 422.

### 21.8 আলাদা Create, Update, Response schema কেন?

**Answer:** Each direction has different rules. Create has required input fields but no server-generated ones like `id`; Update makes everything optional for partial changes; Response exposes only safe fields and can read ORM objects with `from_attributes=True`. One shared model would either leak sensitive fields or force clients to send data they shouldn't control.

### 21.9 Discriminated union কী, কেন ব্যবহার করবে?

**Answer:** A union of models with a shared literal field (the discriminator, like `type` or `method`) declared with `Field(discriminator='method')`. Pydantic reads that field and validates against exactly one model, instead of trying each member in turn. It's faster, gives errors only for the matching model, and produces a clean `oneOf` JSON schema; it's the standard way to model event types or payment methods.

### 21.10 Pydantic model আর dataclass-এর পার্থক্য?

**Answer:** A standard dataclass only generates `__init__`, `__repr__` and comparison; type hints are not enforced at runtime. A Pydantic model validates and coerces on creation, supports nested models, JSON parsing and serialization, aliases and JSON Schema. I use dataclasses for internal, trusted data and Pydantic at boundaries where data comes from outside. Pydantic also offers `pydantic.dataclasses.dataclass` for dataclass syntax with validation.

### 21.11 Validation কি assignment-এও হয়? Immutable model কীভাবে বানাবে?

**Answer:** Not by default: Pydantic validates on construction, so `obj.age = 'abc'` is accepted silently unless `validate_assignment=True` is set. For immutability, `frozen=True` makes assignment raise a `frozen_instance` validation error and makes instances hashable. To "change" a frozen model, create a new one with `model_copy(update=...)`, keeping in mind that `model_copy` doesn't re-validate the update.

### 21.12 ORM (SQLAlchemy) object থেকে Pydantic model কীভাবে বানাবে?

**Answer:** Set `model_config = ConfigDict(from_attributes=True)` and call `Model.model_validate(orm_obj)`. Pydantic then reads attributes instead of dict keys. In FastAPI, returning the ORM object from an endpoint with `response_model` does this automatically. In v1 this option was called `orm_mode`.

### 21.13 Secret বা password কীভাবে সামলাবে?

**Answer:** Use `SecretStr` so the value shows as `**********` in repr, logs and default serialization, and read it with `.get_secret_value()` only where needed. Never include the password in response models: use a separate output schema or `Field(exclude=True)`. For configuration, load secrets with `pydantic-settings` from environment variables, not from code.

### 21.14 Error message user-বান্ধব করবে কীভাবে?

**Answer:** Catch `ValidationError` and use `e.errors()`: each item has a stable `type` code, a `loc` path and `ctx` values. Map types to my own messages (for example `string_too_short` to "at least {min_length} characters"), and use `loc` to attach the message to the right form field. In FastAPI I override the `RequestValidationError` handler to return that format. Custom validators raise `ValueError` with a clear message, which appears as `Value error, <message>`.

### 21.15 Pydantic-এর performance tips?

**Answer:** Use `model_validate_json` instead of `json.loads` plus `model_validate`, since parsing and validation happen together in Rust. Create `TypeAdapter`s once at module level, prefer discriminated unions over plain unions, and avoid heavy logic in `before`/`wrap` validators. For trusted data that's already valid, `model_construct()` skips validation entirely.

---

## 22. Quick Reference (cheat sheet)

| কাজ | Code |
| --- | --- |
| Model | `class User(BaseModel): id: int; name: str = 'x'` |
| Optional field | `note: str \| None = None` |
| Constraint | `Field(gt=0, le=100, min_length=3, max_length=50, pattern=r'...')` |
| Mutable default | `Field(default_factory=list)` |
| Reusable type | `Price = Annotated[float, Field(gt=0)]` |
| Fixed values | `Literal['a', 'b']`, `Enum` |
| Special | `EmailStr`, `HttpUrl`, `SecretStr`, `PositiveInt`, `PastDate`, `Decimal`, `UUID` |
| Field validator | `@field_validator('x', mode='before')` + `@classmethod`, return value |
| Model validator | `@model_validator(mode='after')`, `return self` |
| অন্য field দেখা | `info: ValidationInfo` → `info.data['x']` |
| Computed | `@computed_field` + `@property` |
| Config | `model_config = ConfigDict(extra='forbid', frozen=True, strict=True, validate_assignment=True, from_attributes=True, populate_by_name=True)` |
| ভেতরে আনা | `Model(**d)`, `Model.model_validate(d)`, `Model.model_validate_json(s)` |
| বাইরে পাঠানো | `model_dump(mode='json', exclude_unset=True, exclude_none=True, by_alias=True)`, `model_dump_json()` |
| Copy | `model_copy(update={...})` (validate করে না) |
| Alias | `Field(alias=...)`, `alias_generator=to_camel` |
| Union | `Field(discriminator='kind')` |
| List validate | `TypeAdapter(list[Model]).validate_json(s)` |
| Settings | `class S(BaseSettings): model_config = SettingsConfigDict(env_file='.env')` |
| Schema | `Model.model_json_schema()` |
| Error | `except ValidationError as e: e.errors()`, `e.error_count()` |

### Error type এক নজরে

| type | মানে |
| --- | --- |
| `missing` | required field নেই |
| `int_parsing`, `float_parsing`, `bool_parsing`, `date_parsing` | string থেকে রূপান্তর হয়নি |
| `int_from_float` | দশমিক মান int-এ |
| `string_type`, `int_type`, `list_type`, `dict_type`, `model_type` | পুরো ভুল ধরনের data (strict-এ `_type` বেশি দেখবে) |
| `greater_than(_equal)`, `less_than(_equal)`, `multiple_of` | সংখ্যার constraint |
| `string_too_short/long`, `too_short/long` | str / list-এর দৈর্ঘ্য |
| `string_pattern_mismatch` | regex মেলেনি |
| `literal_error`, `enum` | অনুমোদিত মানের বাইরে |
| `value_error`, `assertion_error` | custom validator (বা email) |
| `extra_forbidden` | অজানা field (`extra='forbid'`) |
| `frozen_instance` | frozen model বদলানোর চেষ্টা |
| `none_required` | union-এর None branch, বা field-এর নাম আর type একই (`date: Optional[date] = None`) |
| `union_tag_invalid` | discriminator-এর মান অচেনা |
| `url_parsing`, `url_scheme` | URL ভুল |

### ১ মিনিটে revision

1. Type hint = নিয়ম; Pydantic runtime-এ যাচাই + রূপান্তর + serialize করে।
2. Default lax: `'5'` → 5 চলে, `5.5` → int চলে না; strict-এ কোনো রূপান্তর না।
3. `Optional[x]` ≠ optional; `= None` দাও।
4. Validator: নাম string-এ, `@classmethod`, value return, ভুলে `raise ValueError`।
5. Cross-field rule = `model_validator(mode='after')`, `return self`।
6. PATCH = `model_dump(exclude_unset=True)`।
7. Error পড়ো: loc → type → input_value।
8. `extra='forbid'` টাইপো ধরে; `frozen=True` immutable + hashable।
9. Union-এ discriminator দাও; error-এ `field.ModelName` দেখলে বুঝবে union।
10. FastAPI: খারাপ input = 422, খারাপ output = 500।

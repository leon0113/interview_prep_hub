# NumPy — Array, Indexing, Broadcasting ও দরকারি Function

Stack: **Python 3.12 · NumPy 2.x**। সব code `import numpy as np` দিয়ে শুরু ধরে নেওয়া। প্রতিটা function-এর জন্য: **কী করে → syntax → কখন লাগে → উদাহরণ ও output**। কঠিনগুলো (axis, fancy indexing, broadcasting, argsort, `np.select`...) ধাপে ধাপে ভেঙে দেখানো।

> 💡 কীভাবে পড়বে: প্রথমবার পর্ব ১–৩ পরপর পড়ো, কারণ বাকি সব এর উপর দাঁড়ানো। সবচেয়ে গুরুত্বপূর্ণ তিনটা ধারণা: **axis** (সেকশন ৬), **view বনাম copy** (সেকশন ১০), **broadcasting** (সেকশন ১৭)। Interview-এর আগে সেকশন ৩১ (প্রশ্ন-উত্তর) আর সেকশন ৩২ (cheat sheet) দেখে নাও।

---

# পর্ব ১ — ভিত্তি

## 1. NumPy কী, আর list থেকে কেন আলাদা

**NumPy** = Python-এ সংখ্যা নিয়ে দ্রুত কাজ করার library। এর মূল জিনিস **`ndarray`**: n-মাত্রার (1D, 2D, 3D...) array, যার **সব element একই type**-এর। Pandas, scikit-learn, PyTorch, OpenCV সবাই ভেতরে NumPy array (বা তার মতো জিনিস) ব্যবহার করে।

| | Python list | NumPy array |
| --- | --- | --- |
| Element-এর type | মিশ্র হতে পারে | **সব একই** (`dtype`) |
| Memory | প্রতিটা element আলাদা Python object, list-এ শুধু pointer | সংখ্যাগুলো গায়ে গায়ে (contiguous) এক ব্লকে |
| গণিত | loop লাগে | পুরো array-তে একবারে (**vectorized**) |
| গতি | ধীর | সাধারণত ১০–১০০ গুণ দ্রুত |
| Size | `append` করে বাড়ানো সস্তা | fixed; বাড়ালে নতুন array তৈরি হয় |

```python
import numpy as np

prices = [100, 200, 300]
print([p * 1.1 for p in prices])      # list: loop লাগে

arr = np.array(prices)
print(arr * 1.1)                       # NumPy: পুরো array একবারে
print([1, 2] + [3, 4])                 # list-এ + মানে জোড়া লাগানো
print(np.array([1, 2]) + np.array([3, 4]))   # array-তে + মানে যোগ
```

```
[110.00000000000001, 220.00000000000003, 330.0]
[110. 220. 330.]
[1, 2, 3, 4]
[4 6]
```

**কেন দ্রুত?** তিনটা কারণ:

1. **Vectorization**: loop-টা Python-এ না চলে **C-তে** চলে।
2. **একই type**: প্রতিটা element-এর type বারবার যাচাই করতে হয় না।
3. **Contiguous memory**: সংখ্যাগুলো পাশাপাশি থাকে, তাই CPU cache ভালো কাজ করে আর SIMD instruction ব্যবহার করা যায়।

> 💡 Interview line: "NumPy is fast because operations are vectorized: the loop runs in compiled C over a contiguous, single-dtype buffer, instead of Python iterating over boxed objects."

---

## 2. Array বানানো

### 2.1 `np.array`: list থেকে

```python
a = np.array([1, 2, 3])                          # 1D
b = np.array([[1, 2, 3], [4, 5, 6]])             # 2D: ২ row, ৩ column
c = np.array([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])   # 3D: ২টা ২×২ block
f = np.array([1, 2, 3], dtype=float)             # type নিজে ঠিক করা

print(a)
print(b)
print(c.shape)
print(f)
```

```
[1 2 3]
[[1 2 3]
 [4 5 6]]
(2, 2, 2)
[1. 2. 3.]
```

- শুরুতে কয়টা `[` = কয় মাত্রা (dimension)।
- মিশ্র type দিলে NumPy সবাইকে একটা "বড়" type-এ তোলে (**upcasting**): `np.array([1, 2.5])` → সব float, `np.array([1, 'a'])` → সব string।
- প্রতিটা row-এর দৈর্ঘ্য সমান না হলে (`[[1, 2], [3]]`) NumPy 2-তে `ValueError` আসে।

### 2.2 `np.arange` বনাম `np.linspace`

| | `np.arange(start, stop, step)` | `np.linspace(start, stop, num)` |
| --- | --- | --- |
| কী দাও | **ধাপ** (step) | **কয়টা সংখ্যা** (num) |
| stop | বাদ পড়ে | **থাকে** (default `endpoint=True`) |
| কখন | integer sequence, index | গ্রাফের x-axis, সমান দূরত্বের float |

```python
print(np.arange(5))              # 0 থেকে 4
print(np.arange(1, 11, 2))       # 1 থেকে, 11 বাদ, ধাপ 2
print(np.arange(0, 1, 0.25))     # float step-ও চলে
print(np.linspace(0, 1, 5))      # 0 থেকে 1, ঠিক ৫টা সংখ্যা
print(np.linspace(0, 10, 4))
```

```
[0 1 2 3 4]
[1 3 5 7 9]
[0.   0.25 0.5  0.75]
[0.   0.25 0.5  0.75 1.  ]
[ 0.          3.33333333  6.66666667 10.        ]
```

> ⚠️ `arange`-এ float step দিলে rounding-এর কারণে শেষ মানটা কখনো ঢুকে পড়ে, কখনো পড়ে না। Float range-এ `linspace` বেশি নির্ভরযোগ্য।

### 2.3 Fixed মান দিয়ে: `zeros`, `ones`, `full`, `eye`, `*_like`

```python
print(np.zeros((2, 3)))          # shape একটা tuple হিসেবে দাও
print(np.ones(3, dtype=int))
print(np.full((2, 2), 7))
print(np.eye(3))                 # identity matrix (np.identity(3)-ও একই)

b = np.array([[1, 2, 3], [4, 5, 6]])
print(np.zeros_like(b))          # b-র মতো shape আর dtype, সব 0
```

```
[[0. 0. 0.]
 [0. 0. 0.]]
[1 1 1]
[[7 7]
 [7 7]]
[[1. 0. 0.]
 [0. 1. 0.]
 [0. 0. 1.]]
[[0 0 0]
 [0 0 0]]
```

| Function | কখন লাগে |
| --- | --- |
| `np.zeros(shape)` | ফলাফল জমানোর খালি array (counter, accumulator) |
| `np.ones(shape)` | গুণের শুরুর মান, bias column |
| `np.full(shape, v)` | সব জায়গায় একটা নির্দিষ্ট মান (যেমন `-1` = "এখনো ঠিক হয়নি") |
| `np.eye(n)` | identity matrix, one-hot encoding (সেকশন ২৮) |
| `np.zeros_like(x)` | অন্য array-র মতো আকারের খালি array |
| `np.empty(shape)` | মান সেট না করে শুধু memory নেওয়া (দ্রুত, কিন্তু ভেতরে আবর্জনা মান থাকে; পরে সব ঘর ভরতে হবে) |

> ⚠️ `np.zeros(2, 3)` ভুল: দ্বিতীয় argument হলো dtype। Shape সবসময় tuple: `np.zeros((2, 3))`।

### 2.4 Random array (নতুন উপায়: `default_rng`)

```python
rng = np.random.default_rng(42)            # seed = 42: প্রতিবার একই random সংখ্যা

print(rng.integers(1, 100, size=5))        # 1 থেকে 99-এর integer
print(rng.random((2, 3)).round(3))         # 0 থেকে 1-এর float
print(rng.normal(loc=50, scale=10, size=3).round(2))   # mean 50, std 10
print(rng.choice(['red', 'green', 'blue'], size=4))
```

```
[ 9 77 65 44 43]
[[0.697 0.094 0.976]
 [0.761 0.786 0.128]]
[41.47 58.79 57.78]
['blue' 'blue' 'green' 'green']
```

| Function | কী দেয় | কখন |
| --- | --- | --- |
| `rng.integers(low, high, size)` | `[low, high)` integer | dice, random index, fake ID |
| `rng.random(size)` | `[0, 1)` সমবণ্টিত float | probability, random threshold |
| `rng.uniform(low, high, size)` | `[low, high)` float | নির্দিষ্ট range-এ float |
| `rng.normal(mean, std, size)` | bell curve | noise যোগ করা, weight initialize |
| `rng.choice(a, size, replace=False)` | `a` থেকে বাছাই | sampling, train/test-এ ভাগ |
| `rng.permutation(n)` / `rng.shuffle(a)` | এলোমেলো ক্রম | data shuffle |

- **Seed** দিলে প্রতিবার একই "random" সংখ্যা আসে: experiment পুনরায় করা (reproducibility) আর debugging-এর জন্য জরুরি।
- পুরনো API (`np.random.seed(0)`, `np.random.randint`, `np.random.random`) এখনো চলে আর পুরনো কোডে প্রচুর দেখবে। নতুন কোডে `default_rng` লেখো: এটা global state বদলায় না, তাই একাধিক জায়গায় আলাদা generator রাখা যায়।

---

## 3. Attributes: shape, ndim, size, dtype

```python
m = np.arange(12, dtype=np.float64).reshape(3, 4)

print(m.ndim)        # কয় মাত্রা
print(m.shape)       # প্রতি মাত্রায় কয়টা: (row, column)
print(m.size)        # মোট element = 3 × 4
print(m.dtype)       # element-এর type
print(m.itemsize)    # এক element কত byte
print(m.nbytes)      # মোট byte = size × itemsize
```

```
2
(3, 4)
12
float64
8
96
```

- `shape` সবচেয়ে বেশি দেখবে: debugging-এর ৮০% হলো "shape কী আছে আর কী হওয়ার কথা"।
- এগুলো **attribute**, method না: `m.shape` (`m.shape()` লিখলে error)।
- 1D array-র shape `(4,)`: একটা সংখ্যার tuple, কমাটা জরুরি। `(4,)` আর `(1, 4)` আর `(4, 1)` তিনটা আলাদা জিনিস (সেকশন ১৪)।

---

## 4. dtype ও `astype`

| dtype | সীমা / কাজ | কখন |
| --- | --- | --- |
| `int8` / `uint8` | −128…127 / 0…255 | ছবির pixel (`uint8`), memory বাঁচাতে |
| `int32` / `int64` | ~±২১০ কোটি / অনেক বড় | সাধারণ integer (`int64` default) |
| `float32` | ~৭ ঘর নির্ভুল | deep learning (GPU), বড় data |
| `float64` | ~১৫ ঘর নির্ভুল | সাধারণ হিসাব (default) |
| `bool` | `True` / `False` | mask, শর্ত |
| `<U10` | ১০ অক্ষর পর্যন্ত string | লেবেল (তবে টেক্সটে pandas ভালো) |

```python
a = np.array([1.7, 2.2, -3.9])
print(a.astype(int))           # দশমিক কেটে ফেলে (round করে না!), শূন্যের দিকে
print(a.astype(str))
print(np.array([0, 1, 2]).astype(bool))

x = np.array([1, 2, 3])
y = x.astype(float)            # নতুন array; x বদলায় না
print(x.dtype, y.dtype)
```

```
[ 1  2 -3]
['1.7' '2.2' '-3.9']
[False  True  True]
int64 float64
```

### Integer overflow: নীরবে ভুল ফল

```python
small = np.array([100, 120], dtype=np.int8)     # int8-এর সীমা 127
print(small + 10)

big = np.array([10**18, 9 * 10**18])            # int64
print(big * 2)
print(big.astype(float) * 2)                    # float-এ নিলে ঠিক
```

```
[ 110 -126]
[2000000000000000000 -446744073709551616]
[2.0e+18 1.8e+19]
```

বাংলায়: integer-এর সীমা ছাড়ালে NumPy **error দেয় না**, ঘড়ির কাঁটার মতো ঘুরে উল্টো দিক থেকে আসে (wrap around)। তাই 120 + 10 = 130 না হয়ে −126 হয়ে যায় (127-এর পর সরাসরি −128 থেকে গোনা শুরু)। বিশাল গুণফল (`cumprod`, `**`) বা ছবির pixel-এ যোগ করার সময় এটা প্রায়ই হয়। সমাধান: আগে `astype(float)` বা বড় int type (`int64`)।

> ⚠️ `astype(int)` round করে না, দশমিকটা **কেটে ফেলে** (1.7 → 1, −3.9 → −3)। Round চাইলে আগে `np.round(a).astype(int)`।

---

# পর্ব ২ — Operations ও Function

## 5. Vectorized operations

```python
a = np.array([[1, 2], [3, 4]])
b = np.array([[10, 20], [30, 40]])

print(a + 100)        # scalar: প্রতিটা element-এ
print(a ** 2)
print(a + b)          # একই shape: ঘরে ঘরে (element-wise)
print(a * b)          # element-wise গুণ, matrix গুণ না!
print(b / a)          # ভাগ সবসময় float দেয়
print(b // a, b % 3)  # integer ভাগ আর ভাগশেষ
print(a > 2)          # তুলনা → Boolean array
```

```
[[101 102]
 [103 104]]
[[ 1  4]
 [ 9 16]]
[[11 22]
 [33 44]]
[[ 10  40]
 [ 90 160]]
[[10. 10.]
 [10. 10.]]
[[10 10]
 [10 10]] [[1 2]
 [0 1]]
[[False False]
 [ True  True]]
```

- সব arithmetic (`+ - * / // % **`) আর তুলনা (`> < == !=`) **element-wise**: একই position-এর element-এ।
- দুই array-র shape আলাদা হলে broadcasting-এর নিয়ম খাটে (সেকশন ১৭); না মিললে error।
- `a += 1` মূল array-কেই বদলায় (in-place); `a = a + 1` নতুন array বানায়।

> ⚠️ `a * b` মানে matrix multiplication না। Matrix গুণ = `a @ b` (সেকশন ৮)। Interview-এ এটা প্রায় নিশ্চিত প্রশ্ন।

---

## 6. Aggregation আর `axis` (সবচেয়ে গুরুত্বপূর্ণ ধারণা)

### 6.1 Aggregate function

```python
scores = np.array([[70, 85, 90],
                   [60, 75, 95]])      # ২ জন student (row), ৩টা subject (column)

print(scores.sum())            # সব মিলিয়ে একটা সংখ্যা
print(scores.mean())
print(scores.max(), scores.min())
print(scores.std().round(2))
```

```
475
79.16666666666667
95 60
12.05
```

| Function | কাজ | method রূপ |
| --- | --- | --- |
| `np.sum` / `np.prod` | যোগ / গুণ | `a.sum()` |
| `np.mean` / `np.median` | গড় / মধ্যমা | `a.mean()` (median-এর method নেই) |
| `np.std` / `np.var` | standard deviation / variance | `a.std()` |
| `np.min` / `np.max` | সর্বনিম্ন / সর্বোচ্চ | `a.min()` |
| `np.argmin` / `np.argmax` | সর্বনিম্ন / সর্বোচ্চের **index** | `a.argmax()` |
| `np.any` / `np.all` | কোনো একটা / সবগুলো True? | `a.any()` |

### 6.2 `axis` ধাপে ধাপে

`axis` বলে দেয় **কোন মাত্রা বরাবর হিসাব করে সেই মাত্রাটা "গুঁড়িয়ে" দেবে**।

```python
print(scores.sum(axis=0))      # প্রতিটা column-এর যোগ (subject-ভিত্তিক)
print(scores.sum(axis=1))      # প্রতিটা row-এর যোগ (student-ভিত্তিক)
print(scores.mean(axis=1))
print(scores.argmax(axis=1))   # প্রতিটা student-এর সেরা subject কোন column-এ
```

```
[130 160 185]
[245 230]
[81.66666667 76.66666667]
[2 2]
```

**`axis=0` ধাপে ধাপে** (shape `(2, 3)` → `(3,)`):

```text
         col0  col1  col2
row0  [   70,   85,   90 ]
row1  [   60,   75,   95 ]
          ↓     ↓     ↓       axis=0: উপর থেকে নিচে, row-গুলো একসাথে মিশিয়ে দাও
        [ 130,  160,  185 ]   → ০ নম্বর মাত্রা (row, সাইজ 2) গায়েব, বাকি থাকে 3টা column
```

**`axis=1` ধাপে ধাপে** (shape `(2, 3)` → `(2,)`):

```text
row0  [ 70, 85, 90 ]  →  245
row1  [ 60, 75, 95 ]  →  230      axis=1: বাঁ থেকে ডানে, প্রতিটা row-কে একটা সংখ্যায় নামাও
                                  → ১ নম্বর মাত্রা (column, সাইজ 3) গায়েব, বাকি থাকে 2টা row
```

মনে রাখার নিয়ম: **result-এর shape = মূল shape থেকে ওই axis-টা মুছে দাও।** `(2, 3)`-এ `axis=0` মুছলে `(3,)`, `axis=1` মুছলে `(2,)`। 3D-তেও একই: `(4, 2, 3)`-এ `axis=1` দিলে result `(4, 3)`।

```python
cube = np.arange(24).reshape(4, 2, 3)     # ৪টা block, প্রতিটায় ২×৩
print(cube.sum(axis=0).shape)
print(cube.sum(axis=1).shape)
print(cube.sum(axis=2).shape)
print(cube.sum(axis=(1, 2)))              # একাধিক axis একসাথে: প্রতিটা block-এর মোট
```

```
(2, 3)
(4, 3)
(4, 2)
[ 15  51  87 123]
```

### 6.3 `keepdims=True`: পরের হিসাবের জন্য shape ধরে রাখা

```python
row_total = scores.sum(axis=1, keepdims=True)    # (2,) না হয়ে (2, 1)
print(row_total)
print((scores / row_total).round(2))            # প্রতিটা row-কে তার মোট দিয়ে ভাগ = শতকরা ভাগ
```

```
[[245]
 [230]]
[[0.29 0.35 0.37]
 [0.26 0.33 0.41]]
```

কেন লাগে: `scores.sum(axis=1)` দিলে shape `(2,)`; `(2, 3) / (2,)` broadcasting-এ মেলে না (ডান দিক থেকে 3 বনাম 2)। `keepdims=True` দিলে `(2, 1)`, যা প্রতিটা row-তে ছড়িয়ে পড়ে। Softmax আর normalization-এ (সেকশন ২৮) এটা সবসময় লাগে।

---

## 7. Math function (ufunc) ও rounding

**ufunc** (universal function) = element-wise চলা function: প্রতিটা element-এ আলাদা করে প্রয়োগ হয়।

```python
x = np.array([1, 4, 9, 16])
print(np.sqrt(x))
print(np.log(np.array([1, np.e, 100])).round(3))   # natural log (ln)
print(np.log10(100), np.log2(8))
print(np.exp(np.array([0, 1, 2])).round(2))
print(np.abs(np.array([-3, 2, -1])))
print(np.sin(np.array([0, np.pi / 2])).round(3))
```

```
[1. 2. 3. 4.]
[0.    1.    4.605]
2.0 3.0
[1.   2.72 7.39]
[3 2 1]
[0. 1.]
```

### Rounding: চারটা আলাদা জিনিস

```python
v = np.array([-2.5, -1.7, 0.5, 1.5, 2.5, 2.7])
print(np.round(v))     # নিকটতম; ঠিক .5 হলে নিকটতম জোড় সংখ্যায়!
print(np.floor(v))     # নিচের দিকে (−∞)
print(np.ceil(v))      # উপরের দিকে (+∞)
print(np.trunc(v))     # শূন্যের দিকে (দশমিক কেটে ফেলা)
print(np.round(3.14159, 2))
```

```
[-2. -2.  0.  2.  2.  3.]
[-3. -2.  0.  1.  2.  2.]
[-2. -1.  1.  2.  3.  3.]
[-2. -1.  0.  1.  2.  2.]
3.14
```

> ⚠️ `np.round(2.5)` = 2.0, `np.round(0.5)` = 0.0: NumPy (আর Python-এর `round`) **banker's rounding** করে, ঠিক মাঝখানে হলে জোড় সংখ্যায় যায়, যাতে অনেক সংখ্যা যোগ করলে bias না জমে। স্কুলের নিয়ম (.5 সবসময় উপরে) চাইলে `np.floor(v + 0.5)`।

| Function | কাজ | কখন |
| --- | --- | --- |
| `np.sqrt`, `np.square`, `np.power(a, n)` | বর্গমূল, বর্গ, ঘাত | distance, variance |
| `np.exp`, `np.log`, `np.log1p` | eˣ, ln, ln(1+x) | sigmoid/softmax, skewed data-তে log transform (`log1p` 0-তেও চলে) |
| `np.abs` | পরম মান | error (MAE) |
| `np.sign` | −1, 0, +1 | দিক বোঝা |
| `np.maximum(a, b)` / `np.minimum` | দুই array-র ঘরে ঘরে বড়/ছোট | ReLU: `np.maximum(0, x)` |
| `np.max(a)` | **একটা** array-র সবচেয়ে বড় | aggregation |

> ⚠️ `np.max(a, b)` আর `np.maximum(a, b)` গুলিয়ে ফেলো না। `np.max(a, 1)`-এ দ্বিতীয় argument হলো **axis**, অন্য array না।

---

## 8. Matrix: `@`, `dot`, transpose, `linalg`

```python
A = np.array([[1, 2],
              [3, 4]])          # (2, 2)
B = np.array([[5, 6, 7],
              [8, 9, 10]])      # (2, 3)

print(A @ B)                    # matrix গুণ: (2,2) @ (2,3) → (2,3)
print(np.dot(A, B))             # 2D-তে একই ফল
print(A * A)                    # element-wise (তুলনার জন্য)
print(B.T)                      # transpose: (2,3) → (3,2)
```

```
[[21 24 27]
 [47 54 61]]
[[21 24 27]
 [47 54 61]]
[[ 1  4]
 [ 9 16]]
[[ 5  8]
 [ 6  9]
 [ 7 10]]
```

**Matrix গুণ ধাপে ধাপে**: `(A @ B)[i, j]` = A-র row `i` আর B-র column `j`-এর ঘরে ঘরে গুণ করে যোগ।

```text
(A @ B)[0, 0] = A row0 · B col0 = 1×5 + 2×8 = 21
(A @ B)[0, 1] = A row0 · B col1 = 1×6 + 2×9 = 24
(A @ B)[1, 2] = A row1 · B col2 = 3×7 + 4×10 = 61
```

**Shape-এর নিয়ম**: `(m, n) @ (n, p) → (m, p)`। ভেতরের দুটো সংখ্যা (`n`) মিলতে হবে, বাইরের দুটো ফলের shape। `(2, 3) @ (2, 3)` হবে না; `(2, 3) @ (3, 2)` হবে → `(2, 2)`।

| | `*` | `@` / `np.matmul` | `np.dot` |
| --- | --- | --- | --- |
| কাজ | element-wise | matrix গুণ | 1D-তে dot product, 2D-তে matrix গুণ |
| কখন | ঘরে ঘরে scale | neural network layer, linear regression | দুই vector-এর dot product |

```python
u = np.array([1, 2, 3])
v = np.array([4, 5, 6])
print(np.dot(u, v))             # 1×4 + 2×5 + 3×6

M = np.array([[2., 1.], [1., 3.]])
print(np.linalg.det(M).round(2))          # determinant
print(np.linalg.inv(M).round(2))          # inverse
print(np.linalg.solve(M, np.array([3., 5.])))   # Mx = b সমাধান
print(np.linalg.norm(np.array([3, 4])))   # vector-এর দৈর্ঘ্য
```

```
32
5.0
[[ 0.6 -0.2]
 [-0.2  0.4]]
[0.8 1.4]
5.0
```

- `np.linalg.solve(M, b)` সমীকরণ সমাধানে `inv(M) @ b`-এর চেয়ে দ্রুত আর বেশি নির্ভুল।
- `np.linalg.norm(x)` = √(x₁² + x₂² + ...): দুই বিন্দুর দূরত্ব `norm(p - q)`।
- আরও আছে: `np.linalg.eig` (eigenvalue, PCA-তে), `np.linalg.svd`, `np.linalg.matrix_rank`।

---

# পর্ব ৩ — Indexing

## 9. Indexing ও Slicing

### 9.1 1D

```python
a = np.arange(10, 20)          # [10 11 ... 19]
print(a[0], a[-1])             # প্রথম, শেষ
print(a[2:5])                  # index 2, 3, 4 (5 বাদ)
print(a[::3])                  # প্রতি ৩টায় একটা
print(a[::-1])                 # উল্টো
print(a[-3:])                  # শেষ ৩টা
```

```
10 19
[12 13 14]
[10 13 16 19]
[19 18 17 16 15 14 13 12 11 10]
[17 18 19]
```

Slice-এর নিয়ম: `[start : stop : step]`; `stop` বাদ পড়ে; কিছু না দিলে start = শুরু, stop = শেষ, step = 1।

### 9.2 2D: `[row, column]`

```python
m = np.arange(12).reshape(3, 4)
print(m)
print(m[1, 2])          # row 1, column 2
print(m[0])             # পুরো row 0 (m[0, :]-এর সমান)
print(m[:, 1])          # পুরো column 1
print(m[1:, 2:])        # row 1 থেকে শেষ, column 2 থেকে শেষ
print(m[::2, ::3])      # row 0, 2; column 0, 3
print(m[:, -1])         # শেষ column
```

```
[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]
6
[0 1 2 3]
[1 5 9]
[[ 6  7]
 [10 11]]
[[ 0  3]
 [ 8 11]]
[ 3  7 11]
```

ধাপে ধাপে `m[1:, 2:]`: প্রথমে row বাছো → `1:` মানে row 1 আর 2। তারপর সেই row গুলো থেকে column বাছো → `2:` মানে column 2 আর 3। ফল = দুই বাছাইয়ের ছেদ (intersection), ২×২।

### 9.3 3D: `[block, row, column]`

```python
t = np.arange(24).reshape(2, 3, 4)     # ২টা block, প্রতিটায় ৩×৪
print(t[1])                            # block 1 পুরো (৩×৪)
print(t[1, 2])                         # block 1-এর row 2
print(t[0, :, 0])                      # block 0-এর column 0
print(t[:, 0, 0])                      # প্রতিটা block-এর [0, 0]
```

```
[[12 13 14 15]
 [16 17 18 19]
 [20 21 22 23]]
[20 21 22 23]
[0 4 8]
[ 0 12]
```

### 9.4 Index দিলে মাত্রা কমে, slice দিলে থাকে

```python
print(m[1].shape)        # integer index → সেই মাত্রা গায়েব
print(m[1:2].shape)      # slice → মাত্রা থাকে (সাইজ 1)
print(m[:, 1].shape)
print(m[:, 1:2].shape)   # column-কে 2D (column vector) রাখতে
```

```
(4,)
(1, 4)
(3,)
(3, 1)
```

scikit-learn-এ `X` সবসময় 2D চায়; একটা column নিতে `X[:, 1:2]` বা `X[:, [1]]` লেখো, `X[:, 1]` দিলে 1D হয়ে error আসে।

---

## 10. View বনাম Copy (সবচেয়ে বেশি bug এখানে)

**Slice = view**: নতুন array মনে হলেও আসলে **একই memory**-র দিকে আরেকটা জানালা। View বদলালে মূল array-ও বদলায়।

```python
data = np.arange(6)
part = data[1:4]          # view
part[0] = 999
print(data)               # মূল array বদলে গেছে!

safe = data[1:4].copy()   # আলাদা copy
safe[0] = -1
print(data)               # এবার মূল array অপরিবর্তিত
print(np.shares_memory(data, part), np.shares_memory(data, safe))
```

```
[  0 999   2   3   4   5]
[  0 999   2   3   4   5]
True False
```

ধাপে ধাপে কী হলো:

1. `data` memory-তে `[0 1 2 3 4 5]` রাখে।
2. `part = data[1:4]` নতুন সংখ্যা copy করে না, শুধু বলে "data-র index 1 থেকে 3 পর্যন্ত দেখাও"।
3. `part[0] = 999` আসলে `data[1]`-এ লেখে।
4. `.copy()` নতুন memory নেয়, তাই `safe` বদলালে `data`-তে কিছু হয় না।

| কোনটা কী দেয় | view | copy |
| --- | --- | --- |
| Basic slicing `a[1:4]`, `a[:, 0]` | ✅ | |
| `reshape`, `.T`, `ravel` (সম্ভব হলে) | ✅ | |
| Fancy indexing `a[[0, 2]]` | | ✅ |
| Boolean indexing `a[a > 5]` | | ✅ |
| `flatten()`, `astype()`, `.copy()` | | ✅ |
| বেশিরভাগ function (`np.sort`, `np.append`...) | | ✅ নতুন array |

কেন view? বড় data (যেমন ১ GB) slice করলে copy না হওয়ায় দ্রুত আর memory বাঁচে। কিন্তু function-এর ভেতরে argument-এর slice বদলালে বাইরের data নষ্ট হয়, তাই অন্য কারো array বদলানোর আগে `.copy()` দাও।

> 💡 Pandas-এর `SettingWithCopyWarning` এই একই সমস্যা থেকে আসে।

---

## 11. Fancy indexing: index-এর list দিয়ে বাছাই

```python
m = np.arange(12).reshape(3, 4)
print(m[[0, 2]])              # row 0 আর 2
print(m[:, [0, 3, 1]])        # column 0, 3, 1 (এই ক্রমে!)
print(m[[2, 0, 0]])           # একই row বারবার নেওয়া যায়
```

```
[[ 0  1  2  3]
 [ 8  9 10 11]]
[[ 0  3  1]
 [ 4  7  5]
 [ 8 11  9]]
[[ 8  9 10 11]
 [ 0  1  2  3]
 [ 0  1  2  3]]
```

### দুই list একসাথে: **জোড়া** তৈরি হয় (grid না!)

```python
print(m[[0, 1, 2], [1, 2, 3]])        # (0,1), (1,2), (2,3) জোড়া
print(m[np.ix_([0, 2], [1, 3])])      # grid চাইলে: row {0,2} × column {1,3}
print(m[[0, 2]][:, [1, 3]])           # একই grid, দুই ধাপে
```

```
[ 1  6 11]
[[ 1  3]
 [ 9 11]]
[[ 1  3]
 [ 9 11]]
```

ধাপে ধাপে `m[[0, 1, 2], [1, 2, 3]]`: দুই list পাশাপাশি জোড়া বাঁধে, প্রথমটা row, দ্বিতীয়টা column:

```text
row list:    [0, 1, 2]
column list: [1, 2, 3]
জোড়া:       (0,1)  (1,2)  (2,3)
মান:          m[0,1]=1  m[1,2]=6  m[2,3]=11   → [ 1  6 11]
```

কখন লাগে:

- অনিয়মিত row/column বাছা (slice-এ ধাপ নিয়মিত হতে হয়)।
- **সাজানোর ক্রমে বসানো**: `data[np.argsort(scores)]` (সেকশন ১৮)।
- প্রতিটা row থেকে আলাদা column নেওয়া: `probs[np.arange(n), labels]` = প্রতিটা sample-এর সঠিক class-এর probability (cross-entropy loss-এ ঠিক এটাই হয়)।

```python
probs = np.array([[0.7, 0.2, 0.1],
                  [0.1, 0.8, 0.1],
                  [0.3, 0.3, 0.4]])
labels = np.array([0, 1, 2])                    # প্রতিটা sample-এর সঠিক class
print(probs[np.arange(3), labels])              # (0,0), (1,1), (2,2)
```

```
[0.7 0.8 0.4]
```

---

## 12. Boolean indexing: শর্ত দিয়ে বাছাই

```python
a = np.array([12, 55, 7, 80, 33, 64, 41])
mask = a > 40
print(mask)
print(a[mask])                        # যেখানে True শুধু সেগুলো
print(a[(a > 40) & (a % 2 == 0)])     # দুই শর্ত: AND
print(a[(a < 10) | (a > 70)])         # OR
print(a[~(a > 40)])                   # NOT
print(mask.sum(), mask.mean().round(2))   # কয়টা, আর কত ভাগ শর্ত মানে
```

```
[False  True False  True False  True  True]
[55 80 64 41]
[80 64]
[ 7 80]
[12  7 33]
4 0.57
```

ধাপে ধাপে `a[(a > 40) & (a % 2 == 0)]`:

```text
a             = [12   55    7    80   33   64   41]
a > 40        = [F    T     F    T    F    T    T ]
a % 2 == 0    = [T    F     F    T    F    T    F ]
&             = [F    F     F    T    F    T    F ]
a[...]        = [80, 64]
```

| ভুল | ঠিক | কেন |
| --- | --- | --- |
| `and` | `&` | `and` পুরো array-কে একটা True/False চায় → `ValueError: The truth value of an array ... is ambiguous` |
| `or` | `\|` | একই কারণে |
| `not` | `~` | একই কারণে |
| `a > 40 & a < 70` | `(a > 40) & (a < 70)` | `&`-এর অগ্রাধিকার `>`-এর চেয়ে বেশি, তাই বন্ধনী ছাড়া আগে `40 & a` হয় |

### Boolean দিয়ে মান বদলানো

```python
b = a.copy()
b[b > 50] = 50            # সব 50-এর বেশি মানকে 50 করো (capping)
print(b)

m = np.arange(12).reshape(3, 4)
print(m[m % 2 == 0])                  # 2D থেকে বাছাই করলে ফল সবসময় 1D
print(m[m[:, 0] > 2])                 # প্রথম column-এর মান দেখে পুরো row বাছাই
```

```
[12 50  7 50 33 50 41]
[ 0  2  4  6  8 10]
[[ 4  5  6  7]
 [ 8  9 10 11]]
```

শেষেরটা বাস্তবে সবচেয়ে বেশি লাগে: "যেসব row-এর age column > 30" ধরনের filter। এখানে mask-এর shape `(3,)` (প্রতিটা row-এর জন্য একটা True/False), তাই পুরো row বাছাই হয়।

---

## 13. `np.where`, `np.select`, `nonzero`

### 13.1 `np.where(condition, x, y)`: vectorized if-else

```python
temp = np.array([18, 25, 31, 12, 28])
print(np.where(temp > 24, 'hot', 'cool'))
print(np.where(temp > 24, temp - 24, 0))        # শর্ত মানলে একটা হিসাব, নাহলে 0
print(np.where(temp > 24))                      # শুধু শর্ত দিলে: index-এর tuple
print(np.where(temp > 24)[0])                   # index array
```

```
['cool' 'hot' 'hot' 'cool' 'hot']
[0 1 7 0 4]
(array([1, 2, 4]),)
[1 2 4]
```

- **তিন argument**: Excel-এর `IF(condition, true_value, false_value)`, প্রতিটা element-এ। ফলের shape = `temp`-এর shape।
- **এক argument**: যেসব position-এ শর্ত True তাদের **index**। ফল tuple (প্রতি মাত্রার জন্য একটা array), তাই 1D-তে `[0]` দিয়ে বের করো। `np.nonzero(cond)` একই জিনিস।
- `x`, `y` array-ও হতে পারে: `np.where(a < 0, 0, a)` = ঋণাত্মকগুলো 0, বাকি যেমন ছিল (ReLU)।

### 13.2 একাধিক শর্ত: nested `where` বনাম `np.select`

```python
marks = np.array([92, 78, 55, 34, 67])

# nested where: ভেতর থেকে বাইরে পড়তে হয়, কঠিন
grade = np.where(marks >= 80, 'A', np.where(marks >= 60, 'B', np.where(marks >= 40, 'C', 'F')))
print(grade)

# np.select: শর্তের list + মানের list + default
conditions = [marks >= 80, marks >= 60, marks >= 40]
choices = ['A', 'B', 'C']
print(np.select(conditions, choices, default='F'))
```

```
['A' 'B' 'C' 'F' 'B']
['A' 'B' 'C' 'F' 'B']
```

**`np.select` ধাপে ধাপে**: প্রতিটা element-এর জন্য শর্তগুলো **উপর থেকে নিচে** দেখে, **প্রথম যেটা True** তার মান নেয়; কোনোটাই না মানলে `default`।

```text
marks    ≥80   ≥60   ≥40   → প্রথম True       ফল
92       T     T     T     → ≥80              'A'
78       F     T     T     → ≥60              'B'
55       F     F     T     → ≥40              'C'
34       F     F     F     → কোনোটা না       'F' (default)
67       F     T     T     → ≥60              'B'
```

তাই শর্তের **ক্রম** গুরুত্বপূর্ণ: `marks >= 40`-কে প্রথমে রাখলে 92-ও 'C' পেত।

### 13.3 `argwhere`, `any`, `all`, `count_nonzero`

```python
m = np.array([[3, 0, 8], [0, 5, 0]])
print(np.argwhere(m > 2))          # প্রতিটা match-এর [row, col], এক row করে
print(np.count_nonzero(m))         # 0 নয় কয়টা
print((m > 4).any(), (m >= 0).all())
print((m > 4).any(axis=1))         # কোন row-তে অন্তত একটা > 4
```

```
[[0 0]
 [0 2]
 [1 1]]
3
True True
[ True  True]
```

---

# পর্ব ৪ — Shape বদল, জোড়া, ভাঙা, Broadcasting

## 14. Reshape, flatten, transpose, নতুন axis

### 14.1 `reshape` আর `-1`

```python
a = np.arange(12)
print(a.reshape(3, 4))
print(a.reshape(2, -1).shape)    # -1: "বাকিটা তুমি হিসাব করো" → 12 / 2 = 6
print(a.reshape(-1, 1).shape)    # column vector
print(a.reshape(3, 4).reshape(-1))   # আবার 1D
```

```
[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]
(2, 6)
(12, 1)
[ 0  1  2  3  4  5  6  7  8  9 10 11]
```

- মোট element সমান থাকতে হবে: 12টা দিয়ে `(5, 3)` হবে না → `ValueError: cannot reshape array of size 12 into shape (5,3)`।
- `-1` শুধু **একটা** মাত্রায় দেওয়া যায়।
- Reshape ক্রম রাখে: আগে row 0 ভরে, তারপর row 1 (row-major, "C order")।

### 14.2 `ravel` বনাম `flatten`

```python
m = np.arange(6).reshape(2, 3)
r = m.ravel()        # সম্ভব হলে view
f = m.flatten()      # সবসময় copy
r[0] = 100
print(m[0, 0])       # ravel-এর বদল মূলে গেছে
f[1] = 200
print(m[0, 1])       # flatten-এর বদল যায়নি
```

```
100
1
```

### 14.3 Transpose আর `swapaxes`

```python
m = np.arange(6).reshape(2, 3)
print(m.T)                         # (2,3) → (3,2)
t = np.zeros((2, 3, 4))
print(t.transpose(2, 0, 1).shape)  # axis-এর নতুন ক্রম: (4, 2, 3)
print(np.swapaxes(t, 0, 2).shape)  # শুধু দুটো axis অদলবদল
```

```
[[0 3]
 [1 4]
 [2 5]]
(4, 2, 3)
(4, 3, 2)
```

কখন: ছবি `(height, width, channel)` থেকে PyTorch-এর `(channel, height, width)` বানাতে `img.transpose(2, 0, 1)`।

### 14.4 নতুন axis যোগ বা বাদ: `newaxis`, `expand_dims`, `squeeze`

```python
v = np.array([1, 2, 3])               # (3,)
print(v[np.newaxis, :].shape)         # (1, 3): row vector
print(v[:, np.newaxis].shape)         # (3, 1): column vector
print(np.expand_dims(v, axis=0).shape)   # newaxis-এর মতোই
print(np.zeros((1, 3, 1)).squeeze().shape)   # সাইজ 1-এর সব axis বাদ
```

```
(1, 3)
(3, 1)
(1, 3)
(3,)
```

কখন: broadcasting মেলাতে (সেকশন ১৭), একটা sample-কে batch বানাতে (`x[np.newaxis]` → model একটা batch চায়), আর model-এর `(n, 1)` output-কে `(n,)` বানাতে (`squeeze`)।

---

## 15. জোড়া লাগানো: `concatenate`, `vstack`, `hstack`, `stack`

```python
a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])

print(np.concatenate([a, b], axis=0))    # উপর-নিচে: (4, 2)
print(np.concatenate([a, b], axis=1))    # পাশাপাশি: (2, 4)
print(np.vstack([a, b]).shape, np.hstack([a, b]).shape)
print(np.stack([a, b]).shape)            # নতুন axis: (2, 2, 2)
print(np.stack([a, b], axis=-1).shape)
```

```
[[1 2]
 [3 4]
 [5 6]
 [7 8]]
[[1 2 5 6]
 [3 4 7 8]]
(4, 2) (2, 4)
(2, 2, 2)
(2, 2, 2)
```

| Function | কী করে | shape `(2,2)` + `(2,2)` |
| --- | --- | --- |
| `np.concatenate([...], axis=0)` / `np.vstack` | আছে এমন axis বরাবর জোড়া (row বাড়ে) | `(4, 2)` |
| `np.concatenate([...], axis=1)` / `np.hstack` | column বাড়ে | `(2, 4)` |
| `np.stack([...])` | **নতুন** axis বানিয়ে জোড়া | `(2, 2, 2)` |
| `np.column_stack([v1, v2])` | কয়েকটা 1D-কে column বানিয়ে পাশাপাশি | `(n, k)` |

**concatenate বনাম stack**: ৩টা `(28, 28)` ছবি `concatenate` করলে `(84, 28)` (একটা লম্বা ছবি), `stack` করলে `(3, 28, 28)` (৩টা ছবির batch)। Batch বানাতে চাইলে `stack`।

```python
x1 = np.array([1, 2, 3])
x2 = np.array([4, 5, 6])
print(np.hstack([x1, x2]))           # 1D-তে hstack = এক লাইনে জোড়া
print(np.vstack([x1, x2]))           # 1D-গুলো row হয়ে বসে
print(np.column_stack([x1, x2]))     # 1D-গুলো column হয়ে বসে: feature matrix
```

```
[1 2 3 4 5 6]
[[1 2 3]
 [4 5 6]]
[[1 4]
 [2 5]
 [3 6]]
```

> ⚠️ জোড়ার axis ছাড়া বাকি সব মাত্রার সাইজ মিলতে হবে। আর loop-এর ভেতরে বারবার `np.append`/`concatenate` করো না: প্রতিবার পুরো array নতুন করে copy হয় (O(n²))। Python list-এ জমিয়ে শেষে একবার `np.array(list)` বা `np.stack(list)`।

---

## 16. ভাঙা: `split`, `array_split`, `hsplit`, `vsplit`

```python
a = np.arange(10)
print(np.split(a, 2))                 # ২টা সমান ভাগ
print(np.split(a, [3, 7]))            # index 3 আর 7-এ কাটো
print(np.array_split(a, 3))           # অসমান ভাগও চলে
```

```
[array([0, 1, 2, 3, 4]), array([5, 6, 7, 8, 9])]
[array([0, 1, 2]), array([3, 4, 5, 6]), array([7, 8, 9])]
[array([0, 1, 2, 3]), array([4, 5, 6]), array([7, 8, 9])]
```

- `np.split(a, n)`: `n` দিয়ে নিঃশেষে ভাগ না হলে `ValueError: array split does not result in an equal division`। `np.split(a, 3)` (10টা element) ব্যর্থ হয়।
- `np.split(a, [3, 7])`: list দিলে সেটা **কাটার জায়গা**: `[:3]`, `[3:7]`, `[7:]`।
- `np.array_split`: অসমান হলে প্রথম ভাগগুলো একটা করে বড় হয় (4, 3, 3)।
- 2D-তে `np.hsplit(m, n)` = column ধরে ভাঙা (`axis=1`), `np.vsplit(m, n)` = row ধরে (`axis=0`)।

```python
data = np.arange(20).reshape(10, 2)
train, test = np.split(data, [8])     # প্রথম ৮টা row train, বাকি ২টা test
print(train.shape, test.shape)
X, y = np.hsplit(data, [1])           # প্রথম column feature, বাকিটা target
print(X.shape, y.shape)
```

```
(8, 2) (2, 2)
(10, 1) (10, 1)
```

---

## 17. Broadcasting (ধাপে ধাপে)

**Broadcasting** = আলাদা shape-এর array-তে element-wise হিসাব করার নিয়ম। ছোট array-টা বড়টার shape-এ "টেনে লম্বা" হয়, কিন্তু আসলে memory-তে copy হয় না।

### নিয়ম: shape দুটো **ডান দিক থেকে** মেলাও

1. মাত্রা কম হলে ছোটটার **বাঁ দিকে 1** বসাও।
2. প্রতিটা মাত্রায় সাইজ হতে হবে **সমান**, নয়তো **একটা 1**। যেখানে 1, সেটা অন্যটার সাইজে টানা হয়।
3. কোথাও দুটো আলাদা সংখ্যা আর কোনোটাই 1 না → **error**।

### উদাহরণ ১: `(3, 4) + (4,)` ✅

```text
a: (3, 4)
b:    (4,)   → ধাপ ১: (1, 4)
ডান থেকে: 4 vs 4 সমান ✅ | 3 vs 1 → 1 টেনে 3 ✅
ফল: (3, 4) — b প্রতিটা row-তে যোগ হয়
```

### উদাহরণ ২: `(3, 4) + (3,)` ❌

```text
a: (3, 4)
b:    (3,)   → (1, 3)
ডান থেকে: 4 vs 3, কোনোটাই 1 না ❌
ValueError: operands could not be broadcast together with shapes (3,4) (3,)
সমাধান: b.reshape(3, 1) → (3, 1): 4 vs 1 ✅, 3 vs 3 ✅ → প্রতিটা column-এ যোগ
```

### উদাহরণ ৩: `(3, 1) + (1, 4)` → `(3, 4)`: দুটোই টানা হয়

```python
col = np.array([[0], [10], [20]])     # (3, 1)
row = np.array([[1, 2, 3, 4]])        # (1, 4)
print(col + row)
```

```
[[ 1  2  3  4]
 [11 12 13 14]
 [21 22 23 24]]
```

```text
col টানা হয়ে:      row টানা হয়ে:       যোগফল:
[[ 0  0  0  0]     [[1 2 3 4]          [[ 1  2  3  4]
 [10 10 10 10]  +   [1 2 3 4]    =      [11 12 13 14]
 [20 20 20 20]]     [1 2 3 4]]          [21 22 23 24]]
```

এটা আসলে একটা "যোগের নামতা" (outer sum)। একই কৌশলে নামতার টেবিল: `np.arange(1, 10)[:, None] * np.arange(1, 10)`।

### দ্রুত পরীক্ষা

| A | B | ফল |
| --- | --- | --- |
| `(5, 3)` | `()` (scalar) | ✅ `(5, 3)` |
| `(5, 3)` | `(3,)` | ✅ `(5, 3)` |
| `(5, 3)` | `(5,)` | ❌ (3 vs 5) → `(5, 1)` করো |
| `(5, 3)` | `(5, 1)` | ✅ `(5, 3)` |
| `(4, 1)` | `(3,)` | ✅ `(4, 3)` |
| `(2, 3)` | `(3, 2)` | ❌ |
| `(8, 1, 6)` | `(7, 1)` | ✅ `(8, 7, 6)` |
| `(4, 4)` | `(2, 2)` | ❌ (4 vs 2) |

### বাস্তব কাজে broadcasting

```python
X = np.array([[1., 200.],
              [2., 300.],
              [3., 400.]])            # 3 sample, 2 feature (সম্পূর্ণ আলাদা স্কেল)

mean = X.mean(axis=0)                 # (2,): প্রতিটা feature-এর গড়
std = X.std(axis=0)                   # (2,)
X_scaled = (X - mean) / std           # (3,2) - (2,) → প্রতিটা row থেকে গড় বাদ
print(mean, std.round(3))
print(X_scaled.round(3))
```

```
[  2. 300.] [ 0.816 81.65 ]
[[-1.225 -1.225]
 [ 0.     0.   ]
 [ 1.225  1.225]]
```

এটাই **standardization** (scikit-learn-এর `StandardScaler`): প্রতিটা column-এর গড় 0, std 1। এক লাইনে, কোনো loop ছাড়া।

```python
points = np.array([[0, 0], [3, 4], [6, 8]])     # (3, 2)
diff = points[:, np.newaxis, :] - points[np.newaxis, :, :]    # (3,1,2) - (1,3,2) → (3,3,2)
dist = np.sqrt((diff ** 2).sum(axis=-1))        # (3, 3): প্রতিটা জোড়ার দূরত্ব
print(dist)
```

```
[[ 0.  5. 10.]
 [ 5.  0.  5.]
 [10.  5.  0.]]
```

**Pairwise distance ধাপে ধাপে**: `(3, 1, 2)` আর `(1, 3, 2)` broadcast হয়ে `(3, 3, 2)` হয়, যেখানে `diff[i, j]` = বিন্দু i − বিন্দু j। শেষ axis (x, y) বরাবর বর্গের যোগ নিয়ে বর্গমূল = দূরত্ব। KNN, clustering-এ ঠিক এটাই হয়।

> ⚠️ Broadcasting নিঃশব্দে "ভুল কিন্তু চলে" ফলও দিতে পারে: `(5,)` আর `(5, 1)` যোগ করলে error না দিয়ে `(5, 5)` হয়ে যায়! ML-এ `y_true` `(n,)` আর `y_pred` `(n, 1)` হলে loss ভুল হিসাব হয়। সন্দেহ হলে `.shape` print করো।

---

# পর্ব ৫ — দরকারি function

## 18. Sort, argsort, argmax, top-k

### 18.1 `np.sort` বনাম `a.sort()`

```python
a = np.array([40, 10, 30, 20])
print(np.sort(a))          # নতুন sorted array; a অপরিবর্তিত
print(np.sort(a)[::-1])    # বড় → ছোট (descending-এর আলাদা option নেই)
a.sort()                   # in-place: a নিজেই বদলায়, return করে None
print(a)

m = np.array([[3, 1, 2], [9, 7, 8]])
print(np.sort(m, axis=1))  # প্রতিটা row আলাদা করে (default axis=-1)
print(np.sort(m, axis=0))  # প্রতিটা column আলাদা করে
```

```
[10 20 30 40]
[40 30 20 10]
[10 20 30 40]
[[1 2 3]
 [7 8 9]]
[[3 1 2]
 [9 7 8]]
```

### 18.2 `argsort`: "কোন ক্রমে বসালে sorted হবে" তার index

```python
scores = np.array([72, 95, 60, 88])
names = np.array(['Rafi', 'Mitu', 'Sakib', 'Nila'])
order = np.argsort(scores)
print(order)
print(scores[order])           # sorted scores
print(names[order])            # নামগুলোও একই ক্রমে
print(names[np.argsort(-scores)])    # বড় থেকে ছোট
```

```
[2 0 3 1]
[60 72 88 95]
['Sakib' 'Rafi' 'Nila' 'Mitu']
['Mitu' 'Nila' 'Rafi' 'Sakib']
```

**ধাপে ধাপে `np.argsort([72, 95, 60, 88])`**:

```text
index:  0    1    2    3
মান:   72   95   60   88

সবচেয়ে ছোট 60 → আছে index 2   → order[0] = 2
তারপর 72     → index 0          → order[1] = 0
তারপর 88     → index 3          → order[2] = 3
সবচেয়ে বড় 95 → index 1         → order[3] = 1
argsort = [2 0 3 1]
```

`argsort` মান সাজায় না, সাজানোর **রেসিপি** দেয়। সেই রেসিপি দিয়ে (fancy indexing) সম্পর্কিত অন্য array-ও একই ক্রমে সাজানো যায়: এটাই এর আসল শক্তি।

### 18.3 Top-k

```python
k = 2
top_idx = np.argsort(scores)[::-1][:k]       # বড় থেকে ছোট সাজিয়ে প্রথম k
print(top_idx, names[top_idx])
print(np.argmax(scores), scores.max())       # একটাই সবচেয়ে বড় হলে
```

```
[1 3] ['Mitu' 'Nila']
1 95
```

কখন: recommendation-এ top-5 item, classification-এ top-3 predicted class, সবচেয়ে কাছের k neighbour (KNN)। খুব বড় array-তে `np.argpartition(-scores, k)[:k]` পুরো sort না করে দ্রুত top-k দেয় (ভেতরে ক্রম ঠিক থাকে না)।

### 18.4 `argmax` / `argmin` with axis

```python
probs = np.array([[0.1, 0.7, 0.2],
                  [0.5, 0.3, 0.2]])
print(np.argmax(probs, axis=1))     # প্রতিটা sample-এর predicted class
print(np.argmax(probs))             # axis না দিলে চ্যাপ্টা করা array-তে index
row, col = np.unravel_index(np.argmax(probs), probs.shape)   # flat index → (row, col)
print(row, col)
```

```
[1 0]
1
0 1
```

> ⚠️ `argmax` ফেরত দেয় **index**, মান না। একাধিক জায়গায় সর্বোচ্চ মান থাকলে **প্রথমটার** index দেয়।

---

## 19. `unique`, set operation, `isin`

### 19.1 `np.unique`

```python
votes = np.array(['b', 'a', 'c', 'a', 'b', 'a'])
print(np.unique(votes))                            # সাজানো, ডুপ্লিকেট ছাড়া

values, counts = np.unique(votes, return_counts=True)
print(values, counts)
print(values[np.argmax(counts)])                   # সবচেয়ে বেশিবার (mode)

values, inverse = np.unique(votes, return_inverse=True)
print(inverse)                                     # প্রতিটা element কোন unique মানের index
```

```
['a' 'b' 'c']
['a' 'b' 'c'] [3 2 1]
a
[1 0 2 0 1 0]
```

**`return_inverse` ধাপে ধাপে**: unique মান `['a' 'b' 'c']` = index `0, 1, 2`। এখন মূল array-র প্রতিটা element-কে তার index দিয়ে বদলাও: `b→1, a→0, c→2, a→0, b→1, a→0` = `[1 0 2 0 1 0]`। এটাই **label encoding** (text category → সংখ্যা), আর `values[inverse]` দিলে আবার মূল array ফিরে আসে।

### 19.2 Set function

```python
x = np.array([1, 2, 3, 4, 5])
y = np.array([4, 5, 6, 7])
print(np.union1d(x, y))          # যেকোনো একটাতে
print(np.intersect1d(x, y))      # দুটোতেই
print(np.setdiff1d(x, y))        # x-এ আছে, y-এ নেই
print(np.setdiff1d(y, x))        # ক্রম বদলালে ফল বদলায়
print(np.setxor1d(x, y))         # ঠিক একটাতে
```

```
[1 2 3 4 5 6 7]
[4 5]
[1 2 3]
[6 7]
[1 2 3 6 7]
```

### 19.3 `np.isin`: "এই list-এর কোনো একটা কি?"

```python
cities = np.array(['Dhaka', 'Sylhet', 'Khulna', 'Chattogram', 'Rajshahi'])
wanted = ['Dhaka', 'Chattogram']
print(np.isin(cities, wanted))
print(cities[np.isin(cities, wanted)])
print(cities[~np.isin(cities, wanted)])   # list-এ নেই এমনগুলো
```

```
[ True False False  True False]
['Dhaka' 'Chattogram']
['Sylhet' 'Khulna' 'Rajshahi']
```

SQL-এর `IN` / pandas-এর `.isin()`-এর মতো। পুরনো `np.in1d` NumPy 2-তে deprecated: সবসময় `np.isin` লেখো।

---

## 20. `cumsum`, `cumprod`, `diff`

```python
sales = np.array([5, 3, 8, 2, 6])
print(np.cumsum(sales))          # running total
print(np.diff(sales))            # পাশাপাশি দুটোর পার্থক্য (n-1টা)
print(np.cumprod([1.1, 1.2, 0.9]).round(3))   # চক্রবৃদ্ধি বৃদ্ধি

m = np.array([[1, 2, 3], [4, 5, 6]])
print(np.cumsum(m, axis=1))      # প্রতিটা row-তে ডান দিকে জমা
print(np.cumsum(m))              # axis না দিলে চ্যাপ্টা করে
```

```
[ 5  8 16 18 24]
[-2  5 -6  4]
[1.1   1.32  1.188]
[[ 1  3  6]
 [ 4  9 15]]
[ 1  3  6 10 15 21]
```

**`cumsum` ধাপে ধাপে**: `[5, 5+3, 5+3+8, 5+3+8+2, 5+3+8+2+6]` = `[5 8 16 18 24]`। শেষ মান = `sum`।

| Function | কখন |
| --- | --- |
| `cumsum` | running total, মাস শেষে মোট বিক্রি, cumulative probability (CDF) |
| `cumprod` | চক্রবৃদ্ধি সুদ / stock return (প্রতিদিনের 1.02, 0.98...) |
| `diff` | প্রতিদিনের পরিবর্তন, sorted array-তে ফাঁক খোঁজা, `np.diff(np.sign(x))` দিয়ে কোথায় চিহ্ন বদলায় |

> ⚠️ Integer-এ `cumprod` দ্রুত `int64` ছাড়িয়ে overflow হয় (ঋণাত্মক আবর্জনা মান)। আগে `astype(float)`।

---

## 21. Statistics: percentile, histogram, bincount, digitize

### 21.1 `percentile` / `quantile`

```python
data = np.array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
print(np.percentile(data, 50), np.median(data))    # 50th percentile = median
print(np.percentile(data, [25, 75]))               # Q1, Q3
print(np.quantile(data, 0.9))                      # quantile = percentile / 100
```

```
55.0 55.0
[32.5 77.5]
91.0
```

**Percentile** মানে "এই মানের নিচে কত শতাংশ data"। মাঝখানে কোনো আসল মান না পড়লে NumPy দুই পাশের মানের মাঝখান থেকে (linear interpolation) হিসাব করে, তাই 25th percentile = 32.5।

```python
q1, q3 = np.percentile(data, [25, 75])
iqr = q3 - q1
outlier = (data < q1 - 1.5 * iqr) | (data > q3 + 1.5 * iqr)
print(iqr, outlier.any())
```

```
45.0 False
```

কখন: outlier ধরা (IQR rule, box plot-এর নিয়ম), latency-র p95/p99, "top 10%" বের করা।

### 21.2 `histogram`

```python
ages = np.array([5, 12, 19, 22, 25, 31, 38, 45, 50, 60])
counts, edges = np.histogram(ages, bins=[0, 18, 30, 50, 65])
print(counts)
print(edges)
```

```
[2 3 3 2]
[ 0 18 30 50 65]
```

**ধাপে ধাপে**: bin হলো `[0, 18)`, `[18, 30)`, `[30, 50)`, `[50, 65]`:

```text
[0, 18)  → 5, 12            = 2
[18, 30) → 19, 22, 25       = 3
[30, 50) → 31, 38, 45       = 3   (50 এখানে না, কারণ ডান সীমা বাদ)
[50, 65] → 50, 60           = 2   (শুধু শেষ bin-এ ডান সীমাও ধরা হয়)
```

`bins=5` দিলে min থেকে max পর্যন্ত ৫টা সমান ভাগ নিজে বানায়। ছবি চাইলে `plt.hist` (Data Visualization guide)।

### 21.3 `bincount` আর `digitize`

```python
labels = np.array([0, 2, 1, 2, 2, 0])
print(np.bincount(labels))                 # 0 কয়বার, 1 কয়বার, 2 কয়বার

income = np.array([12, 45, 70, 30, 95])
groups = np.digitize(income, bins=[25, 60])   # <25 → 0, 25–59 → 1, ≥60 → 2
print(groups)
print(np.array(['low', 'mid', 'high'])[groups])
```

```
[2 1 3]
[0 1 2 1 2]
['low' 'mid' 'high' 'mid' 'high']
```

- `np.bincount`: ছোট non-negative integer গোনার সবচেয়ে দ্রুত উপায় (class-এ কয়টা sample)।
- `np.digitize`: প্রতিটা মান কোন bin-এ পড়ে তার নম্বর: সংখ্যাকে category বানানো (age → age group)।

### 21.4 Correlation ও covariance

```python
hours = np.array([1, 2, 3, 4, 5])
marks = np.array([52, 55, 61, 70, 74])
print(np.corrcoef(hours, marks).round(3))
print(np.corrcoef(hours, marks)[0, 1].round(3))
print(np.cov(hours, marks).round(2))
```

```
[[1.    0.987]
 [0.987 1.   ]]
0.987
[[ 2.5  14.75]
 [14.75 89.3 ]]
```

`np.corrcoef` একটা matrix দেয়: কর্ণে (diagonal) সবসময় 1 (নিজের সাথে নিজের correlation), আসল মান **কর্ণের বাইরে** `[0, 1]`। মান −1 থেকে +1; এখানে 0.987 মানে খুব জোরালো ধনাত্মক linear সম্পর্ক। Correlation মানে causation না।

---

## 22. Missing value: `np.nan`

```python
a = np.array([4.0, np.nan, 7.0, 1.0, np.nan])
print(np.nan == np.nan)            # NaN কারো সমান না, নিজেরও না!
print(np.isnan(a))
print(np.isnan(a).sum())           # কয়টা missing
print(a.mean())                    # একটা NaN থাকলে পুরো ফল NaN
print(np.nanmean(a), np.nansum(a), np.nanmax(a))   # NaN বাদ দিয়ে হিসাব
print(a[~np.isnan(a)])             # NaN বাদ দেওয়া
print(np.where(np.isnan(a), np.nanmean(a), a))     # NaN-এর জায়গায় গড় বসানো (imputation)
```

```
False
[False  True False False  True]
2
nan
4.0 12.0 7.0
[4. 7. 1.]
[4. 4. 7. 1. 4.]
```

- NaN একটা **float**: integer array-তে NaN রাখা যায় না; `np.array([1, np.nan])` নিজেই float হয়ে যায়।
- `a == np.nan` সবসময় সব `False`, তাই কাজ করে না: সবসময় `np.isnan`।
- `nan` ফাংশন পরিবার: `nanmean`, `nansum`, `nanmax`, `nanmin`, `nanstd`, `nanmedian`, `nanpercentile`।
- `np.inf` (অসীম) ধরতে `np.isinf`, দুটোই ধরতে `~np.isfinite(a)`।
- `np.nan_to_num(a, nan=0.0)`: NaN আর inf-কে নির্দিষ্ট মানে বদলায়।

---

## 23. মান কাটা ও ছাঁটা: `clip`, `flip`, `tile`, `repeat`, `pad`

```python
a = np.array([-5, 3, 12, 8, 20])
print(np.clip(a, 0, 10))           # 0-এর নিচে → 0, 10-এর উপরে → 10
print(np.flip(a))                  # উল্টো (a[::-1])
print(np.tile([1, 2], 3))          # পুরো array বারবার
print(np.repeat([1, 2], 3))        # প্রতিটা element বারবার
print(np.tile([[1, 2]], (2, 2)))   # 2D-তে টাইলের মতো বিছানো
print(np.pad([1, 2, 3], 2))        # দুই পাশে ২টা করে 0
```

```
[ 0  3 10  8 10]
[20  8 12  3 -5]
[1 2 1 2 1 2]
[1 1 1 2 2 2]
[[1 2 1 2]
 [1 2 1 2]]
[0 0 1 2 3 0 0]
```

| Function | কাজ | কখন |
| --- | --- | --- |
| `np.clip(a, lo, hi)` | সীমার বাইরের মান সীমায় আনা | outlier capping, probability-কে `[1e-7, 1-1e-7]`-এ রাখা (log(0) এড়াতে), pixel 0–255 |
| `np.flip(a, axis)` | উল্টানো | ছবি আয়নার মতো উল্টানো (data augmentation) |
| `np.tile(a, n)` | পুরো pattern পুনরাবৃত্তি | pattern বানানো |
| `np.repeat(a, n)` | প্রতিটা element পুনরাবৃত্তি | প্রতিটা ID-কে n বার |
| `np.pad(a, width)` | চারপাশে ভরাট | CNN-এ ছবির চারপাশে padding, sequence সমান দৈর্ঘ্য করা |

---

## 24. যোগ, ঢোকানো, মোছা: `append`, `insert`, `delete`, `put`

```python
a = np.array([10, 20, 30, 40])
print(np.append(a, [50, 60]))         # শেষে যোগ
print(np.insert(a, 1, 15))            # index 1-এর আগে 15 ঢোকাও
print(np.delete(a, [0, 2]))           # index 0 আর 2 মুছো (মান না, index!)
print(a)                              # a নিজে অপরিবর্তিত

m = np.array([[1, 2], [3, 4]])
print(np.append(m, [[5, 6]], axis=0)) # নতুন row
print(np.append(m, [[9], [9]], axis=1))   # নতুন column: shape (2, 1) হতে হবে
print(np.append(m, [5, 6]))           # axis না দিলে সব চ্যাপ্টা হয়ে 1D!

b = a.copy()
np.put(b, [0, 3], [-1, -4])           # in-place: কিছু return করে না
print(b)
```

```
[10 20 30 40 50 60]
[10 15 20 30 40]
[20 40]
[10 20 30 40]
[[1 2]
 [3 4]
 [5 6]]
[[1 2 9]
 [3 4 9]]
[1 2 3 4 5 6]
[-1 20 30 -4]
```

- `append`, `insert`, `delete` **নতুন array** দেয়; ফল রাখতে `a = np.append(a, x)`।
- এগুলো প্রতিবার পুরো array copy করে, তাই loop-এ ব্যবহার করলে খুব ধীর (সেকশন ১৫)।
- `np.put(a, indices, values)` ব্যতিক্রম: মূল array **বদলে দেয়**, আর index চ্যাপ্টা (flattened) array ধরে গোনে। সাধারণ `a[idx] = values` একই কাজ আরও পরিষ্কারভাবে করে।

---

## 25. তুলনা: `array_equal`, `allclose`

```python
print(0.1 + 0.2 == 0.3)                           # float-এর rounding error
print(np.isclose(0.1 + 0.2, 0.3))
print(np.allclose([1.0, 2.0], [1.0, 2.0000001]))  # সব প্রায় সমান?
print(np.array_equal([1, 2, 3], [1, 2, 3]))       # shape আর মান হুবহু সমান?
print(np.array([1, 2, 3]) == np.array([1, 2, 4]))   # == element-wise
```

```
False
True
True
True
[ True  True False]
```

- দুই array সমান কিনা জানতে `if a == b:` লিখলে `ValueError` আসে (element-wise ফল একটা array)। `np.array_equal(a, b)` বা `(a == b).all()` লেখো।
- Float-এর তুলনায় সবসময় `np.isclose` / `np.allclose`: test লেখার সময় (expected বনাম actual) খুব লাগে।

---

## 26. Iteration (আর কেন এড়াবে)

```python
m = np.arange(6).reshape(2, 3)
for row in m:                       # প্রথম axis ধরে: প্রতিবার একটা row
    print(row)
for value in np.nditer(m):          # প্রতিটা element আলাদা করে
    print(value, end=' ')
print()
for (i, j), value in np.ndenumerate(m):   # index সহ
    if value > 3:
        print((i, j), value)
```

```
[0 1 2]
[3 4 5]
0 1 2 3 4 5 
(1, 1) 4
(1, 2) 5
```

> 💡 NumPy-তে loop দেখলেই ভাবো "এটা কি vectorize করা যায়?" প্রায় সবসময় যায়: `where`, boolean mask, `axis`, broadcasting। `np.vectorize` নামটা ধোঁকা দেয়: এটা ভেতরে আসলে Python loop-ই চালায়, শুধু লেখা সুন্দর করে, গতি বাড়ায় না।

---

## 27. Meshgrid (ধাপে ধাপে)

`np.meshgrid(x, y)` দুটো 1D array থেকে একটা 2D grid-এর **সব (x, y) জোড়া** বানায়।

```python
x = np.array([1, 2, 3])
y = np.array([10, 20])
xx, yy = np.meshgrid(x, y)
print(xx)
print(yy)
print(xx + yy)                         # প্রতিটা grid বিন্দুতে f(x, y) = x + y
print(np.column_stack([xx.ravel(), yy.ravel()]))   # সব (x, y) জোড়ার তালিকা
```

```
[[1 2 3]
 [1 2 3]]
[[10 10 10]
 [20 20 20]]
[[11 12 13]
 [21 22 23]]
[[ 1 10]
 [ 2 10]
 [ 3 10]
 [ 1 20]
 [ 2 20]
 [ 3 20]]
```

**ধাপে ধাপে**: `x`-এ ৩টা, `y`-তে ২টা মান, তাই grid-এর shape `(len(y), len(x))` = `(2, 3)`।

```text
xx: x-কে প্রতিটা row-এ কপি       yy: y-কে প্রতিটা column-এ কপি
[[1 2 3]                         [[10 10 10]
 [1 2 3]]                         [20 20 20]]

একই position-এর (xx, yy) = grid-এর একটা বিন্দু:
(1,10) (2,10) (3,10)
(1,20) (2,20) (3,20)
```

কখন: 3D surface ও contour plot-এ `z = f(xx, yy)` (Data Visualization guide-এর "Heatmap ও Contour" অংশ), classifier-এর decision boundary আঁকতে, দুই hyperparameter-এর সব combination বানাতে।

> 💡 Broadcasting দিয়েও একই ফল: `x[np.newaxis, :] + y[:, np.newaxis]`। বড় grid-এ `np.meshgrid(x, y, sparse=True)` memory বাঁচায়।

---

## 28. ML formula NumPy দিয়ে

### 28.1 Sigmoid আর ReLU

```python
z = np.array([-2.0, 0.0, 2.0])
sigmoid = 1 / (1 + np.exp(-z))
relu = np.maximum(0, z)
print(sigmoid.round(3))
print(relu)
```

```
[0.119 0.5   0.881]
[0. 0. 2.]
```

Sigmoid যেকোনো সংখ্যাকে 0 থেকে 1-এর মধ্যে আনে (binary classification-এর probability); ReLU ঋণাত্মককে 0 করে, ধনাত্মক রাখে।

### 28.2 Softmax (numerically stable) ধাপে ধাপে

```python
def softmax(logits):
    shifted = logits - logits.max(axis=-1, keepdims=True)   # ধাপ ১: সবচেয়ে বড়টা বাদ দাও
    exp = np.exp(shifted)                                    # ধাপ ২: e^x
    return exp / exp.sum(axis=-1, keepdims=True)             # ধাপ ৩: মোট দিয়ে ভাগ

logits = np.array([[2.0, 1.0, 0.1],
                   [1000.0, 1001.0, 1002.0]])   # দ্বিতীয় row: বিশাল সংখ্যা
probs = softmax(logits)
print(probs.round(3))
print(probs.sum(axis=1))
print(np.exp(1000.0))                           # কেন ধাপ ১ লাগে
```

```
[[0.659 0.242 0.099]
 [0.09  0.245 0.665]]
[1. 1.]
inf
```

ধাপে ধাপে row `[2.0, 1.0, 0.1]`:

```text
ধাপ ১: max = 2.0 → [0.0, -1.0, -1.9]
ধাপ ২: e^x       → [1.000, 0.368, 0.150]   মোট = 1.518
ধাপ ৩: ÷ মোট     → [0.659, 0.242, 0.099]   (যোগফল = 1)
```

কেন max বাদ দিই: `e^1000` = `inf` (overflow), তাতে `inf / inf` = `nan`। সব সংখ্যা থেকে একই মান বাদ দিলে softmax-এর ফল বদলায় না (ভগ্নাংশের উপর-নিচে একই `e^(-max)` কাটাকাটি হয়), কিন্তু সবচেয়ে বড়টা 0 হয়ে যায়, তাই overflow হয় না। `keepdims=True` ছাড়া `(2, 3) - (2,)` broadcasting মিলত না (সেকশন ৬.৩)।

### 28.3 Loss function: MSE, MAE, Binary cross-entropy

```python
y_true = np.array([3.0, 5.0, 2.5])
y_pred = np.array([2.5, 5.0, 4.0])
print(np.mean((y_true - y_pred) ** 2))           # MSE
print(np.mean(np.abs(y_true - y_pred)))          # MAE

y = np.array([1, 0, 1, 1])                       # আসল class (0/1)
p = np.array([0.9, 0.2, 0.6, 0.99])              # predicted probability
p = np.clip(p, 1e-7, 1 - 1e-7)                   # log(0) এড়াতে
bce = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
print(bce.round(4))
```

```
0.8333333333333334
0.6666666666666666
0.2123
```

- **MSE** বড় ভুলকে বেশি শাস্তি দেয় (বর্গ), **MAE** সব ভুলকে সমান; outlier বেশি থাকলে MAE।
- **BCE**: `y = 1` হলে শুধু `log(p)` অংশ কাজ করে, `y = 0` হলে শুধু `log(1 − p)`। নিশ্চিত ভুল prediction (p ≈ 0 যখন y = 1) বিশাল শাস্তি পায়। `clip` না করলে `p = 0`-তে `log(0) = -inf`।

### 28.4 One-hot encoding আর accuracy

```python
labels = np.array([0, 2, 1, 2])
one_hot = np.eye(3)[labels]                # identity matrix-এর row বাছাই (fancy indexing)
print(one_hot)

pred = np.array([0, 2, 2, 2])
print((pred == labels).mean())             # accuracy = মিল কত ভাগ
```

```
[[1. 0. 0.]
 [0. 0. 1.]
 [0. 1. 0.]
 [0. 0. 1.]]
0.75
```

**`np.eye(3)[labels]` ধাপে ধাপে**: `np.eye(3)` = `[[1,0,0],[0,1,0],[0,0,1]]`, অর্থাৎ row `k`-তে শুধু `k` নম্বর ঘরে 1। Label `2` মানে row 2 = `[0,0,1]`। তাই label-এর list দিয়ে fancy indexing করলে প্রতিটা label-এর one-hot row একবারে চলে আসে।

### 28.5 Linear regression (normal equation) এক লাইনে

```python
X = np.array([[1, 1.0], [1, 2.0], [1, 3.0], [1, 4.0]])   # প্রথম column = 1 (bias)
y = np.array([3.1, 4.9, 7.2, 8.8])
w = np.linalg.solve(X.T @ X, X.T @ y)                    # (XᵀX) w = Xᵀy
print(w.round(3))                                        # [intercept, slope]
print((X @ w).round(2))                                  # prediction
```

```
[1.15 1.94]
[3.09 5.03 6.97 8.91]
```

---

## 29. Performance: গতি ও memory

```python
import time

n = 1_000_000
a_list = list(range(n))
a_arr = np.arange(n)

t = time.perf_counter()
squares = [x * x for x in a_list]
loop_time = time.perf_counter() - t

t = time.perf_counter()
squares_np = a_arr * a_arr
numpy_time = time.perf_counter() - t

print(f'NumPy faster by about {loop_time / numpy_time:.0f}x')
```

সংখ্যাটা মেশিন ভেদে বদলায়, সাধারণত ২০–১০০ গুণ। Notebook-এ সহজে মাপতে `%timeit a_arr * a_arr`।

| টিপস | কেন |
| --- | --- |
| Python loop-এর বদলে vectorized operation | loop C-তে চলে |
| Loop-এ `np.append` না, list-এ জমিয়ে শেষে `np.array` | প্রতিবার copy এড়ানো |
| ঠিক dtype (`float32`, `int8`, `uint8`) | memory অর্ধেক বা আরও কম (১০ লক্ষ `int8` = ~১ MB, `int64` = ~৮ MB) |
| Slice (view) ব্যবহার, অপ্রয়োজনীয় `.copy()` না | memory বাঁচে |
| In-place operation (`a *= 2`, `np.add(a, b, out=a)`) | নতুন array বানাতে হয় না |
| `np.vectorize`-এর উপর ভরসা না | এটা loop-ই |

```python
print(np.zeros(1_000_000, dtype=np.int64).nbytes)
print(np.zeros(1_000_000, dtype=np.int8).nbytes)
```

```
8000000
1000000
```

---

# পর্ব ৬ — Interview ও Revision

## 30. সাধারণ ভুল ও সমাধান

| ভুল | কী হয় | ঠিক করো |
| --- | --- | --- |
| `a[(a > 5) and (a < 9)]` | `ValueError: truth value ... ambiguous` | `&`, `\|`, `~` আর প্রতিটা শর্ত বন্ধনীতে |
| `if a == b:` | একই `ValueError` | `np.array_equal(a, b)` বা `(a == b).all()` |
| `a * b` কে matrix গুণ ভাবা | element-wise ফল | `a @ b` |
| Slice বদলে মূল array নষ্ট | view মূল memory শেয়ার করে | `.copy()` |
| `np.append(a, x)` লিখে ভাবা a বদলেছে | নতুন array return হয় | `a = np.append(a, x)` (loop-এ না) |
| `np.zeros(2, 3)` | `TypeError` (3 = dtype) | `np.zeros((2, 3))` |
| `(3, 4) + (3,)` | broadcast error | `b.reshape(3, 1)` বা `b[:, None]` |
| `(n,)` আর `(n, 1)` মিশে `(n, n)` | নিঃশব্দে ভুল হিসাব | shape print, `.ravel()` / `.reshape(-1, 1)` |
| `a == np.nan` | সব `False` | `np.isnan(a)` |
| `a.mean()`-এ NaN | ফল NaN | `np.nanmean(a)` |
| বড় integer গুণে ঋণাত্মক ফল | overflow (নিঃশব্দে) | `astype(float)` / `int64` |
| `astype(int)` কে round ভাবা | দশমিক কাটা পড়ে | `np.round(a).astype(int)` |
| `np.round(2.5)` = 2 দেখে অবাক | banker's rounding | স্বাভাবিক; দরকারে `np.floor(a + 0.5)` |
| `argmax`-কে মান ভাবা | index | `a[a.argmax()]` বা `a.max()` |
| `axis=0`/`1` উল্টো | ভুল দিকের হিসাব | "result-এর shape = ওই axis মুছে" |
| `np.split(a, 3)` অসমান দৈর্ঘ্যে | `ValueError` | `np.array_split` বা index list |
| `0.1 + 0.2 == 0.3` | `False` | `np.isclose` |
| `np.in1d` | deprecated | `np.isin` |
| Seed ছাড়া random | প্রতিবার ভিন্ন ফল | `np.random.default_rng(seed)` |

---

## 31. Interview প্রশ্ন-উত্তর

### 31.1 NumPy array list-এর চেয়ে দ্রুত কেন?

**Answer:** A NumPy array stores one dtype in a contiguous memory block, while a list stores pointers to separate Python objects. Operations are vectorized: the loop runs in compiled C (often with SIMD) with no per-element type checks or interpreter overhead, and contiguous memory is cache-friendly. The result is typically 10–100× faster and several times less memory for numeric work.

### 31.2 View আর copy-র পার্থক্য কী? কোনটা কখন হয়?

**Answer:** A view shares memory with the original array, so changing it changes the original; a copy has its own memory. Basic slicing, `reshape`, `.T` and `ravel` (when possible) return views; fancy indexing, boolean indexing, `flatten`, `astype` and `.copy()` return copies. I check with `np.shares_memory` and call `.copy()` before modifying data I don't own.

### 31.3 Broadcasting কী? নিয়মগুলো বলো।

**Answer:** Broadcasting lets NumPy combine arrays of different shapes without copying data. Compare shapes from the right: missing leading dimensions are treated as 1, and each pair of sizes must be equal or one of them must be 1, in which case it is stretched. Otherwise it raises an error. Example: subtracting a `(n_features,)` mean from an `(n_samples, n_features)` matrix centres every column in one line.

### 31.4 `axis=0` আর `axis=1` কী বোঝায়?

**Answer:** The axis is the dimension that gets collapsed. On a 2D array, `axis=0` aggregates down the rows, giving one value per column; `axis=1` aggregates across columns, giving one value per row. The result's shape is the input shape with that axis removed, unless `keepdims=True` keeps it as size 1 for broadcasting.

### 31.5 `*`, `@` আর `np.dot`-এর পার্থক্য?

**Answer:** `*` is element-wise multiplication and needs broadcast-compatible shapes. `@` (`np.matmul`) is matrix multiplication: `(m, n) @ (n, p) → (m, p)`, and it batches over leading dimensions for 3D+ arrays. `np.dot` is the dot product for 1D vectors and matrix multiplication for 2D, but behaves differently from `matmul` on higher dimensions, so I use `@` for matrices.

### 31.6 Fancy indexing আর boolean indexing কী?

**Answer:** Fancy indexing selects with arrays of integer indices, such as `a[[0, 3, 5]]` or `a[:, [2, 0]]`, in any order and with repeats; two index arrays pair element-wise, so `a[[0, 1], [2, 3]]` gives `a[0, 2]` and `a[1, 3]`. Boolean indexing selects with a mask of the same shape, such as `a[a > 0]`. Both return copies, and boolean results are always 1D.

### 31.7 `np.where` কীভাবে কাজ করে?

**Answer:** With three arguments, `np.where(cond, x, y)` is a vectorized if-else: it takes `x` where the condition is true and `y` elsewhere, broadcasting all three. With only a condition it returns a tuple of index arrays where the condition holds, the same as `np.nonzero`. For several conditions I use `np.select(conditions, choices, default)`, which picks the first matching condition.

### 31.8 `reshape(-1)`, `ravel` আর `flatten`-এর পার্থক্য?

**Answer:** All three give a 1D array. `ravel` and `reshape(-1)` return a view when the memory layout allows, so they are cheap but share memory; `flatten` always returns a new copy. `-1` in `reshape` means "infer this dimension from the total size", and only one dimension can be `-1`.

### 31.9 NaN কীভাবে সামলাবে?

**Answer:** NaN is a float that is not equal to anything, including itself, so `a == np.nan` never works; I use `np.isnan`. Normal aggregations propagate NaN, so I use the `nan` versions (`np.nanmean`, `np.nansum`), filter with `a[~np.isnan(a)]`, or impute with `np.where(np.isnan(a), fill, a)`. Integer arrays can't hold NaN, so they become float.

### 31.10 Softmax লেখার সময় overflow কীভাবে ঠেকাবে?

**Answer:** Subtract the maximum of each row before exponentiating: `exp(x - x.max(axis=-1, keepdims=True))`, then divide by the row sum. Softmax is invariant to subtracting a constant, so the result is identical, but the largest exponent becomes `e^0 = 1`, so `exp` can't overflow to `inf` and produce `nan`.

### 31.11 `np.sort` আর `argsort`-এর পার্থক্য? Top-k কীভাবে বের করবে?

**Answer:** `np.sort` returns the sorted values; `argsort` returns the indices that would sort the array, which lets me reorder related arrays (`names[np.argsort(scores)]`). For top-k I use `np.argsort(-a)[:k]`, or `np.argpartition` for large arrays when the top-k order doesn't matter, since it avoids a full sort.

### 31.12 Loop ছাড়া কোড লেখা (vectorization) কেন দরকার, আর `np.vectorize` কী?

**Answer:** Python-level loops over array elements pay interpreter overhead per element; expressing the operation on whole arrays pushes the loop into C. Tools: arithmetic and ufuncs, boolean masks, `np.where`/`np.select`, aggregations with `axis`, and broadcasting. `np.vectorize` only wraps a Python function for convenience; it still loops in Python and is not a speed-up.

### 31.13 `np.random.seed` আর `default_rng`-এর পার্থক্য?

**Answer:** `np.random.seed` sets a single global random state used by the legacy `np.random.*` functions, so any code can disturb it. `np.random.default_rng(seed)` returns an independent `Generator` object with a better algorithm (PCG64); I pass it around explicitly, which makes experiments reproducible and isolated.

### 31.14 Integer overflow কেন বিপজ্জনক?

**Answer:** NumPy integers have fixed width, and arithmetic that exceeds the range wraps around silently instead of raising, so results become wrong (often negative) without any error. It shows up with `int8`/`uint8` image data, large products and `cumprod`. I cast to a wider type or float before the operation.

---

## 32. Quick Reference (cheat sheet)

| কাজ | Code |
| --- | --- |
| বানানো | `np.array` · `arange` · `linspace` · `zeros` · `ones` · `full` · `eye` · `zeros_like` |
| Random | `rng = np.random.default_rng(42)` · `rng.integers` · `rng.random` · `rng.normal` · `rng.choice` |
| তথ্য | `.shape` · `.ndim` · `.size` · `.dtype` · `.nbytes` |
| Type | `.astype(float)` |
| আকার | `reshape(r, -1)` · `ravel` · `flatten` · `.T` · `transpose` · `np.newaxis` · `squeeze` |
| হিসাব | `sum` · `mean` · `median` · `std` · `var` · `min` · `max` · `prod` (+ `axis=`, `keepdims=`) |
| Index খোঁজা | `argmax` · `argmin` · `argsort` · `np.where(cond)` · `argwhere` |
| শর্ত | `(c1) & (c2)` · `(c1) \| (c2)` · `~c` · `np.where(c, x, y)` · `np.select` · `any` · `all` |
| বাছাই | `a[1:3]` · `a[:, 0]` · `a[[0, 2]]` · `a[a > 0]` · `np.isin` |
| Matrix | `a @ b` · `np.dot` · `np.linalg.inv` · `solve` · `det` · `norm` |
| জোড়া | `concatenate(axis=)` · `vstack` · `hstack` · `stack` · `column_stack` |
| ভাঙা | `split` · `array_split` · `hsplit` · `vsplit` |
| সাজানো | `np.sort` · `a.sort()` · `[::-1]` · `np.flip` · `argsort` |
| Unique / set | `unique(return_counts=, return_inverse=)` · `union1d` · `intersect1d` · `setdiff1d` · `setxor1d` |
| জমা | `cumsum` · `cumprod` · `diff` |
| Statistics | `percentile` · `quantile` · `histogram` · `bincount` · `digitize` · `corrcoef` · `cov` |
| NaN | `np.isnan` · `nanmean` · `nansum` · `nan_to_num` · `isfinite` |
| ছাঁটা | `clip` · `round` · `floor` · `ceil` · `trunc` · `pad` |
| পুনরাবৃত্তি | `tile` · `repeat` |
| পরিবর্তন | `append` · `insert` · `delete` · `put` (in-place) |
| তুলনা | `array_equal` · `isclose` · `allclose` |
| Grid | `np.meshgrid(x, y)` |

### ১ মিনিটে revision

1. Array = এক dtype, contiguous memory, vectorized: list-এর চেয়ে অনেক দ্রুত।
2. `shape` সবসময় দেখো; `(n,)`, `(1, n)`, `(n, 1)` আলাদা।
3. `axis=k` = ওই মাত্রা গুঁড়িয়ে দাও; result shape = সেটা মুছে।
4. Slice = view, fancy/boolean = copy; বদলানোর আগে `.copy()`।
5. শর্তে `& | ~` আর বন্ধনী; if-else = `np.where`, অনেক শর্ত = `np.select`।
6. Broadcasting: ডান থেকে মেলাও, প্রতিটা জোড়া সমান বা একটা 1।
7. `*` element-wise, `@` matrix গুণ।
8. `argsort`/`argmax` index দেয়, মান না।
9. NaN-এ `isnan` আর `nan*` function; float তুলনায় `isclose`।
10. Integer overflow নিঃশব্দে হয়; বড় হিসাবে float।

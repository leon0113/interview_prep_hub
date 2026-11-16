# 🔗 Linked List in Python — Beginner থেকে Advanced

> **কিভাবে পড়বে:** উপর থেকে নিচে ক্রমানুসারে পড়ো। প্রতিটা code নিজে VS Code-এ লিখে run করো, তারপর output মিলিয়ে দেখো। প্রতিটা section আগেরটার উপর ভিত্তি করে বানানো।

---

## 📑 সূচিপত্র

1. Linked List কী? (ধারণা)
2. Array (Python list) vs Linked List
3. Node — Linked List-এর ইট
4. Singly Linked List বানানো + Traverse করা
5. Length বের করা
6. Insertion (শুরুতে, শেষে, নির্দিষ্ট position-এ)
7. Deletion (শুরু, শেষ, value দিয়ে, position দিয়ে)
8. Search ও Get by Index
9. Reverse (Iterative ও Recursive)
10. Pythonic করা — `__len__`, `__iter__`, `__repr__`, `__contains__`
11. Doubly Linked List
12. Circular Linked List
13. Advanced Technique: Two Pointer (Slow/Fast)
    - Middle node বের করা
    - Cycle detection (Floyd's Algorithm)
    - Cycle-এর শুরু খোঁজা
    - শেষ থেকে n-তম node মুছে ফেলা
14. Advanced Problems
    - দুইটা sorted list merge
    - Palindrome check
    - Sorted list থেকে duplicate মুছা
    - Rotate list
    - Add Two Numbers
    - Merge Sort on Linked List
15. Real-world Project: LRU Cache (Doubly LL + Dict)
16. Python-এর built-in `collections.deque`
17. Time Complexity Cheat Sheet
18. Practice Problems (LeetCode)

---

## 1. Linked List কী?

**Linked List** হলো একটা linear data structure, যেখানে data গুলো memory-তে **পাশাপাশি থাকে না**। প্রতিটা element (যাকে **Node** বলে) নিজের data রাখে এবং **পরের node কোথায় আছে তার reference (pointer)** রাখে।

একটা ট্রেনের কথা চিন্তা করো 🚂:
- প্রতিটা বগি = একটা **Node**
- বগির ভেতরের যাত্রী = **data**
- এক বগির সাথে পরের বগির হুক = **next pointer**
- ইঞ্জিন (প্রথম বগি) = **head**
- শেষ বগির পরে আর কিছু নেই = **None**

```
 head
  │
  ▼
┌────┬────┐    ┌────┬────┐    ┌────┬────┐
│ 10 │  ●─┼───►│ 20 │  ●─┼───►│ 30 │None│
└────┴────┘    └────┴────┘    └────┴────┘
 data next      data next      data next
```

### Linked List-এর প্রকারভেদ

| Type | বর্ণনা |
|---|---|
| **Singly Linked List** | প্রতিটা node শুধু **পরের** node চেনে |
| **Doubly Linked List** | প্রতিটা node **আগের ও পরের** দুইটাই চেনে |
| **Circular Linked List** | শেষ node আবার **head**-এ point করে (গোল চক্র) |

---

## 2. Array (Python list) vs Linked List

| Operation | Python `list` | Linked List |
|---|---|---|
| Index দিয়ে access (`a[5]`) | **O(1)** ⚡ | O(n) 🐢 |
| শুরুতে insert | O(n) 🐢 | **O(1)** ⚡ |
| শেষে insert | O(1) (amortized) | O(n), tail রাখলে **O(1)** |
| মাঝখানে insert (node জানা থাকলে) | O(n) | **O(1)** |
| Memory | পাশাপাশি block | ছড়ানো, প্রতি node-এ extra pointer |

**কেন শুরুতে insert করলে list ধীর?**
Python list-এ `insert(0, x)` করলে বাকি সব element একঘর করে ডানে সরাতে হয়। ১০ লাখ element থাকলে ১০ লাখবার সরানো! Linked List-এ শুধু নতুন node বানিয়ে head বদলে দিলেই কাজ শেষ।

> 💡 **Interview tip:** Python-এ বাস্তবে Linked List খুব কম বানাতে হয়, কিন্তু **coding interview-তে এটা সবচেয়ে জনপ্রিয় topic**-গুলোর একটা। এটা pointer manipulation আর logical thinking পরীক্ষা করে।

---

## 3. Node — Linked List-এর ইট

```python
class Node:
    def __init__(self, data):
        self.data = data    # node-এর মান
        self.next = None    # পরের node-এর reference (শুরুতে কেউ নেই)


# Data sample: তিনটা আলাদা node
n1 = Node(10)
n2 = Node(20)
n3 = Node(30)

# হাতে হাতে জোড়া লাগানো
n1.next = n2
n2.next = n3

print(n1.data)            # প্রথম node
print(n1.next.data)       # n1-এর পরেরটা
print(n1.next.next.data)  # তার পরেরটা
print(n3.next)            # শেষ node-এর পরে কী?
```

**Output:**
```
10
20
30
None
```

**ব্যাখ্যা:** `n1.next.next.data` মানে — n1 থেকে এক ধাপ গেলাম (n2), আরেক ধাপ গেলাম (n3), তারপর তার data নিলাম। Python-এ `self.next` আসলে অন্য object-এর **reference** রাখে, copy না।

---

## 4. Singly Linked List বানানো + Traverse করা

হাতে হাতে node জোড়া লাগানো ঝামেলা। তাই একটা `LinkedList` class বানাই যে শুধু `head` মনে রাখবে।

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None   # খালি list

    def append(self, data):
        """শেষে নতুন node যোগ করে"""
        new_node = Node(data)
        if self.head is None:          # list খালি হলে নতুন node-ই head
            self.head = new_node
            return
        cur = self.head
        while cur.next:                # শেষ node পর্যন্ত হাঁটো
            cur = cur.next
        cur.next = new_node            # শেষ node-এর পরে জুড়ে দাও

    def display(self):
        """পুরো list print করে (traverse)"""
        cur = self.head
        items = []
        while cur:                     # cur None না হওয়া পর্যন্ত
            items.append(str(cur.data))
            cur = cur.next
        print(" -> ".join(items) + " -> None")


# Data sample
ll = LinkedList()
for x in [5, 15, 25, 35]:
    ll.append(x)

ll.display()

empty = LinkedList()
empty.display()
```

**Output:**
```
5 -> 15 -> 25 -> 35 -> None
 -> None
```

### 🔍 Traverse-এর গোপন কথা
```python
cur = self.head
while cur:
    ...
    cur = cur.next
```
এই ৩ লাইন হলো Linked List-এর **সবচেয়ে গুরুত্বপূর্ণ pattern**। প্রায় সব operation এর উপর দাঁড়িয়ে।

- `while cur:` → যতক্ষণ node আছে, চলো (শেষে cur = None হলে থামবে)
- `while cur.next:` → **শেষ node-এ এসে থামো** (append-এর জন্য দরকার, কারণ শেষ node-এর `.next` বদলাতে হবে)

> ⚠️ **কখনো `self.head` নিজে সরাবে না!** সবসময় `cur = self.head` নিয়ে `cur` সরাও। নইলে head হারিয়ে যাবে, পুরো list হারিয়ে যাবে।

---

## 5. Length বের করা

```python
    def length(self):
        count = 0
        cur = self.head
        while cur:
            count += 1
            cur = cur.next
        return count
```

**Data sample ও Output:**
```python
ll = LinkedList()
for x in [5, 15, 25, 35]:
    ll.append(x)
print(ll.length())            # 4
print(LinkedList().length())  # 0
```
```
4
0
```

**Optimization:** প্রতিবার গুনতে O(n) লাগে। চাইলে class-এ `self.size` variable রেখে প্রতিটা insert/delete-এ বাড়াতে-কমাতে পারো → তখন length **O(1)**। (Section 10-এর final class-এ এটা করেছি।)

---

## 6. Insertion

### 6.1 শুরুতে insert (prepend) — O(1)

```python
    def prepend(self, data):
        new_node = Node(data)
        new_node.next = self.head   # ধাপ ১: নতুন node পুরানো head-কে point করে
        self.head = new_node        # ধাপ ২: head এখন নতুন node
```

```
আগে:   head → [10] → [20] → None
ধাপ ১:  [5] → [10] → [20] → None   (head এখনো 10-এ)
ধাপ ২:  head → [5] → [10] → [20] → None
```

> ⚠️ **ক্রম খুব জরুরি!** যদি আগে `self.head = new_node` করো, তাহলে পুরানো list-এর reference হারিয়ে যাবে। **সবসময় আগে নতুন node-কে জুড়ো, তারপর পুরানো link ভাঙো।**

**Data sample ও Output:**
```python
ll = LinkedList()
ll.append(10)
ll.append(20)
ll.prepend(5)
ll.prepend(1)
ll.display()
```
```
1 -> 5 -> 10 -> 20 -> None
```

### 6.2 শেষে insert (append) — O(n)
Section 4-এ করেছি। শেষ পর্যন্ত হাঁটতে হয় বলে O(n)। `self.tail` pointer রাখলে O(1) করা যায় (Doubly LL section দেখো)।

### 6.3 নির্দিষ্ট index-এ insert — O(n)

```python
    def insert_at(self, index, data):
        if index < 0:
            raise IndexError("Index negative হতে পারবে না")
        if index == 0:
            self.prepend(data)
            return

        cur = self.head
        # index-এর ঠিক আগের node-এ যাও (index - 1 ধাপ)
        for _ in range(index - 1):
            if cur is None:
                raise IndexError("Index out of range")
            cur = cur.next

        if cur is None:
            raise IndexError("Index out of range")

        new_node = Node(data)
        new_node.next = cur.next   # ধাপ ১: নতুন node পরেরটাকে ধরে
        cur.next = new_node        # ধাপ ২: আগেরটা নতুন node-কে ধরে
```

**কেন index-এর আগের node-এ থামি?** কারণ Singly LL-এ পিছনে যাওয়া যায় না। নতুন node বসাতে হলে আগের node-এর `.next` বদলাতে হবে।

```
index = 2-এ 99 insert:
head → [1] → [5] → [10] → [20]
              ↑ cur (index 1)

new_node.next = cur.next:   [99] → [10]
cur.next = new_node:        [5] → [99]

ফলাফল: [1] → [5] → [99] → [10] → [20]
```

**Data sample ও Output:**
```python
ll = LinkedList()
for x in [1, 5, 10, 20]:
    ll.append(x)

ll.insert_at(2, 99)
ll.display()

ll.insert_at(0, 0)       # শুরুতে
ll.display()

ll.insert_at(6, 100)     # একদম শেষে (length = 6)
ll.display()

try:
    ll.insert_at(50, 7)
except IndexError as e:
    print("Error:", e)
```
```
1 -> 5 -> 99 -> 10 -> 20 -> None
0 -> 1 -> 5 -> 99 -> 10 -> 20 -> None
0 -> 1 -> 5 -> 99 -> 10 -> 20 -> 100 -> None
Error: Index out of range
```

---

## 7. Deletion

Delete করার মূল কৌশল: **যে node মুছবো, তার আগের node-কে বলবো তাকে বাদ দিয়ে পরেরটাকে ধরতে।** Python-এর garbage collector বাকিটা নিজেই সামলায় (কেউ point না করলে memory মুক্ত)।

```
মুছবো [20]:
[10] → [20] → [30]
prev.next = prev.next.next
[10] ────────→ [30]     ([20] এখন একা, garbage collected)
```

### 7.1 শুরু থেকে delete — O(1)

```python
    def delete_first(self):
        if self.head is None:
            return None
        removed = self.head.data
        self.head = self.head.next
        return removed
```

### 7.2 শেষ থেকে delete — O(n)

```python
    def delete_last(self):
        if self.head is None:
            return None
        if self.head.next is None:       # একটাই node
            removed = self.head.data
            self.head = None
            return removed
        cur = self.head
        while cur.next.next:             # শেষের আগের node-এ থামো
            cur = cur.next
        removed = cur.next.data
        cur.next = None
        return removed
```

**`cur.next.next` কেন?** শেষ node মুছতে হলে **শেষের আগের** node-এর `.next = None` করতে হবে। তাই এমন জায়গায় থামি যেখানে পরের-পরেরটা None।

### 7.3 Value দিয়ে delete (প্রথম match) — O(n)

```python
    def delete_value(self, value):
        if self.head is None:
            return False
        if self.head.data == value:      # head নিজেই মুছতে হবে
            self.head = self.head.next
            return True
        prev = self.head
        while prev.next and prev.next.data != value:
            prev = prev.next
        if prev.next is None:            # পাওয়া যায়নি
            return False
        prev.next = prev.next.next       # bypass করো
        return True
```

### 7.4 Index দিয়ে delete — O(n)

```python
    def delete_at(self, index):
        if index < 0 or self.head is None:
            raise IndexError("Index out of range")
        if index == 0:
            return self.delete_first()
        prev = self.head
        for _ in range(index - 1):
            if prev.next is None:
                raise IndexError("Index out of range")
            prev = prev.next
        if prev.next is None:
            raise IndexError("Index out of range")
        removed = prev.next.data
        prev.next = prev.next.next
        return removed
```

**Data sample ও Output (সব delete একসাথে):**
```python
ll = LinkedList()
for x in [10, 20, 30, 40, 50, 60]:
    ll.append(x)
ll.display()

print("delete_first:", ll.delete_first())
ll.display()

print("delete_last:", ll.delete_last())
ll.display()

print("delete_value(30):", ll.delete_value(30))
ll.display()

print("delete_value(999):", ll.delete_value(999))

print("delete_at(1):", ll.delete_at(1))
ll.display()
```
```
10 -> 20 -> 30 -> 40 -> 50 -> 60 -> None
delete_first: 10
20 -> 30 -> 40 -> 50 -> 60 -> None
delete_last: 60
20 -> 30 -> 40 -> 50 -> None
delete_value(30): True
20 -> 40 -> 50 -> None
delete_value(999): False
delete_at(1): 40
20 -> 50 -> None
```

> 🧠 **Edge case checklist** (interview-এ এগুলো জিজ্ঞেস করবেই):
> 1. List খালি হলে?
> 2. একটাই node থাকলে?
> 3. Head নিজেই মুছতে হলে?
> 4. Value/index পাওয়া না গেলে?

---

## 8. Search ও Get by Index

```python
    def search(self, value):
        """value-এর index return করে, না পেলে -1"""
        cur = self.head
        index = 0
        while cur:
            if cur.data == value:
                return index
            cur = cur.next
            index += 1
        return -1

    def get(self, index):
        cur = self.head
        for _ in range(index):
            if cur is None:
                raise IndexError("Index out of range")
            cur = cur.next
        if cur is None:
            raise IndexError("Index out of range")
        return cur.data
```

**Data sample ও Output:**
```python
ll = LinkedList()
for x in ["apple", "banana", "mango"]:
    ll.append(x)

print(ll.search("banana"))
print(ll.search("grape"))
print(ll.get(2))
```
```
1
-1
mango
```

---

## 9. Reverse a Linked List ⭐ (সবচেয়ে বিখ্যাত প্রশ্ন)

### 9.1 Iterative — O(n) time, O(1) space

```python
    def reverse(self):
        prev = None
        cur = self.head
        while cur:
            nxt = cur.next     # ১. পরেরটা মনে রাখো (নইলে হারিয়ে যাবে)
            cur.next = prev    # ২. তীর উল্টে দাও
            prev = cur         # ৩. prev এক ধাপ এগোও
            cur = nxt          # ৪. cur এক ধাপ এগোও
        self.head = prev       # শেষে prev-ই নতুন head
```

### 🔍 ধাপে ধাপে trace (data: 1 → 2 → 3 → None)

| ধাপ | prev | cur | nxt | কী হলো | অবস্থা |
|---|---|---|---|---|---|
| শুরু | None | 1 | – | – | `1→2→3→None` |
| 1 | 1 | 2 | 2 | 1-এর তীর None-এর দিকে | `None←1   2→3` |
| 2 | 2 | 3 | 3 | 2-এর তীর 1-এর দিকে | `None←1←2   3` |
| 3 | 3 | None | None | 3-এর তীর 2-এর দিকে | `None←1←2←3` |
| শেষ | head = 3 | | | | `3→2→1→None` ✅ |

**মনে রাখার কৌশল:** "**সেভ করো, উল্টাও, এগোও, এগোও**" (nxt save → reverse → prev move → cur move)।

**কেন `nxt` লাগে?** `cur.next = prev` করার সাথে সাথে cur-এর পুরানো next-এর সাথে যোগাযোগ কেটে যায়। আগে থেকে `nxt`-এ রেখে না দিলে বাকি list চিরতরে হারিয়ে যাবে।

**Data sample ও Output:**
```python
ll = LinkedList()
for x in [1, 2, 3, 4, 5]:
    ll.append(x)
ll.display()
ll.reverse()
ll.display()
```
```
1 -> 2 -> 3 -> 4 -> 5 -> None
5 -> 4 -> 3 -> 2 -> 1 -> None
```

### 9.2 Recursive — O(n) time, O(n) space (call stack)

```python
def reverse_recursive(node):
    # Base case: খালি বা একটাই node — এটাই নতুন head
    if node is None or node.next is None:
        return node
    new_head = reverse_recursive(node.next)  # বাকি অংশ উল্টাও
    node.next.next = node   # আমার পরের node এখন আমাকে point করবে
    node.next = None        # আমি এখন শেষ, তাই None
    return new_head

# ব্যবহার
ll.head = reverse_recursive(ll.head)
```

### 🔍 Recursive কিভাবে কাজ করে (data: 1 → 2 → 3)

Recursion আগে **একদম শেষ পর্যন্ত নেমে যায়**, তারপর ফেরার পথে কাজ করে:

```
reverse(1) → reverse(2) → reverse(3)  ← base case, return 3 (new_head)

reverse(2)-এ ফিরে এসে:  node=2, node.next=3
    3.next = 2      →  3 → 2
    2.next = None   →  3 → 2 → None
    return 3

reverse(1)-এ ফিরে এসে:  node=1, node.next=2
    2.next = 1      →  3 → 2 → 1
    1.next = None   →  3 → 2 → 1 → None
    return 3  ✅
```

`node.next.next = node` লাইনটাই সবচেয়ে কঠিন। মানে হলো: "**আমার পরের যে node, সে এখন থেকে আমাকে point করবে।**"

> ⚠️ Python-এ default recursion limit ~1000। তাই অনেক বড় list-এ recursive version `RecursionError` দেবে। Production-এ iterative version ব্যবহার করো।

---

## 10. Pythonic করা — Magic (Dunder) Methods

`ll.length()` না লিখে `len(ll)`, `for x in ll`, `print(ll)`, `5 in ll` — এগুলো চালাতে চাইলে dunder methods লাগবে। নিচে **পুরো final Singly Linked List class** দিলাম (সব কিছু একসাথে):

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self, iterable=None):
        self.head = None
        self.size = 0                 # O(1) length-এর জন্য
        if iterable:
            for item in iterable:
                self.append(item)

    # ---------- Magic methods ----------
    def __len__(self):
        return self.size

    def __iter__(self):
        cur = self.head
        while cur:
            yield cur.data            # generator — for loop-এ কাজ করবে
            cur = cur.next

    def __repr__(self):
        return " -> ".join(str(x) for x in self) + " -> None"

    def __contains__(self, value):
        return any(x == value for x in self)

    def __getitem__(self, index):
        if index < 0:
            index += self.size        # negative index সাপোর্ট: ll[-1]
        if not 0 <= index < self.size:
            raise IndexError("Index out of range")
        cur = self.head
        for _ in range(index):
            cur = cur.next
        return cur.data

    # ---------- Insert ----------
    def prepend(self, data):
        node = Node(data)
        node.next = self.head
        self.head = node
        self.size += 1

    def append(self, data):
        node = Node(data)
        if self.head is None:
            self.head = node
        else:
            cur = self.head
            while cur.next:
                cur = cur.next
            cur.next = node
        self.size += 1

    def insert_at(self, index, data):
        if not 0 <= index <= self.size:
            raise IndexError("Index out of range")
        if index == 0:
            return self.prepend(data)
        cur = self.head
        for _ in range(index - 1):
            cur = cur.next
        node = Node(data)
        node.next = cur.next
        cur.next = node
        self.size += 1

    # ---------- Delete ----------
    def delete_value(self, value):
        if self.head is None:
            return False
        if self.head.data == value:
            self.head = self.head.next
            self.size -= 1
            return True
        prev = self.head
        while prev.next and prev.next.data != value:
            prev = prev.next
        if prev.next is None:
            return False
        prev.next = prev.next.next
        self.size -= 1
        return True

    # ---------- Others ----------
    def reverse(self):
        prev, cur = None, self.head
        while cur:
            cur.next, prev, cur = prev, cur, cur.next
        self.head = prev
```

> 💡 `cur.next, prev, cur = prev, cur, cur.next` — এটা Python-এর **tuple unpacking**। ডানপাশের সব মান **আগে** হিসাব হয়, তারপর বামে assign হয়। তাই `nxt` variable লাগে না। তবে শেখার সময় ৪ লাইনের version-টাই পরিষ্কার।

**Data sample ও Output:**
```python
ll = LinkedList([3, 6, 9, 12])

print(ll)               # __repr__
print(len(ll))          # __len__
print(9 in ll)          # __contains__
print(100 in ll)
print(ll[0], ll[-1])    # __getitem__

for value in ll:        # __iter__
    print(value * 10, end=" ")
print()

print(list(ll))         # iterable তাই list() এ convert করা যায়
print(sum(ll))

ll.insert_at(2, 7)
ll.delete_value(3)
ll.reverse()
print(ll, "| size:", len(ll))
```
```
3 -> 6 -> 9 -> 12 -> None
4
True
False
3 12
30 60 90 120 
[3, 6, 9, 12]
30
12 -> 9 -> 7 -> 6 -> None | size: 4
```

---

## 11. Doubly Linked List

প্রতিটা node এখন **দুই দিকে** চেনে: `prev` আর `next`।

```
        ┌──────┬────┬──────┐    ┌──────┬────┬──────┐    ┌──────┬────┬──────┐
None ◄──┤ prev │ 10 │ next ├───►│ prev │ 20 │ next ├───►│ prev │ 30 │ next ├──► None
        └──────┴────┴──────┘◄───┴──────┴────┴──────┘◄───┴──────┴────┴──────┘
          ▲ head                                          ▲ tail
```

**সুবিধা:** পিছনে যাওয়া যায়, node জানা থাকলে নিজেকে O(1)-এ delete করা যায়, `tail` রাখলে শেষে insert/delete O(1)।
**অসুবিধা:** প্রতি node-এ extra pointer → বেশি memory, আর প্রতিটা operation-এ **দুইটা link** ঠিক করতে হয়।

```python
class DNode:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None


class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0

    def append(self, data):                 # O(1) — tail আছে বলে
        node = DNode(data)
        if self.head is None:
            self.head = self.tail = node
        else:
            node.prev = self.tail
            self.tail.next = node
            self.tail = node
        self.size += 1

    def prepend(self, data):                # O(1)
        node = DNode(data)
        if self.head is None:
            self.head = self.tail = node
        else:
            node.next = self.head
            self.head.prev = node
            self.head = node
        self.size += 1

    def _remove_node(self, node):           # O(1) — DLL-এর আসল শক্তি
        if node.prev:
            node.prev.next = node.next
        else:                               # node নিজেই head
            self.head = node.next
        if node.next:
            node.next.prev = node.prev
        else:                               # node নিজেই tail
            self.tail = node.prev
        self.size -= 1

    def delete_value(self, value):
        cur = self.head
        while cur:
            if cur.data == value:
                self._remove_node(cur)
                return True
            cur = cur.next
        return False

    def pop_last(self):                     # O(1) — Singly-তে এটা O(n) ছিল
        if self.tail is None:
            return None
        data = self.tail.data
        self._remove_node(self.tail)
        return data

    def forward(self):
        cur, out = self.head, []
        while cur:
            out.append(str(cur.data))
            cur = cur.next
        return "None <-> " + " <-> ".join(out) + " <-> None"

    def backward(self):
        cur, out = self.tail, []
        while cur:
            out.append(str(cur.data))
            cur = cur.prev                  # পিছনের দিকে হাঁটা
        return " <-> ".join(out)
```

### 🔍 `_remove_node` বোঝা
মাঝের node X মুছতে: `A ⇄ X ⇄ B`
1. `A.next = B` (X.prev.next = X.next)
2. `B.prev = A` (X.next.prev = X.prev)

ফলাফল: `A ⇄ B`। কোনো loop লাগেনি — তাই **O(1)**। শুধু খেয়াল রাখতে হবে X যদি head বা tail হয়, তাহলে head/tail update করতে হবে।

**Data sample ও Output:**
```python
dll = DoublyLinkedList()
for x in [10, 20, 30, 40]:
    dll.append(x)
dll.prepend(5)

print(dll.forward())
print(dll.backward())

dll.delete_value(20)
print(dll.forward())

print("pop_last:", dll.pop_last())
dll.delete_value(5)                  # head মুছলাম
print(dll.forward())
print("head:", dll.head.data, "| tail:", dll.tail.data, "| size:", dll.size)
```
```
None <-> 5 <-> 10 <-> 20 <-> 30 <-> 40 <-> None
40 <-> 30 <-> 20 <-> 10 <-> 5
None <-> 5 <-> 10 <-> 30 <-> 40 <-> None
pop_last: 40
None <-> 10 <-> 30 <-> None
head: 10 | tail: 30 | size: 2
```

**বাস্তব ব্যবহার:** Browser-এর Back/Forward button, Undo/Redo, Music player (আগের/পরের গান), LRU Cache (Section 15)।

---

## 12. Circular Linked List

শেষ node-এর `next` আবার **head**-এ point করে। কোনো `None` নেই!

```
  head
   ▼
  [1] → [2] → [3] → [4]
   ▲                 │
   └─────────────────┘
```

> ⚠️ **বিপদ:** সাধারণ `while cur:` লুপ চালালে **infinite loop** হবে, কারণ cur কখনো None হয় না। তাই থামতে হবে যখন **আবার head-এ ফিরে আসবো**।

```python
class CircularLinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        node = Node(data)
        if self.head is None:
            self.head = node
            node.next = node           # একা node নিজেকেই point করে
            return
        cur = self.head
        while cur.next != self.head:   # শেষ node খোঁজো (যে head-কে point করে)
            cur = cur.next
        cur.next = node
        node.next = self.head          # চক্র বন্ধ করো

    def display(self):
        if self.head is None:
            print("Empty")
            return
        out = []
        cur = self.head
        while True:                    # do-while স্টাইল
            out.append(str(cur.data))
            cur = cur.next
            if cur == self.head:       # এক চক্কর শেষ
                break
        print(" -> ".join(out) + " -> (back to " + str(self.head.data) + ")")

    def rounds(self, steps):
        """steps বার ঘুরে ঘুরে মান দেখায় — চক্র প্রমাণ করতে"""
        cur, out = self.head, []
        for _ in range(steps):
            out.append(str(cur.data))
            cur = cur.next
        print(" ".join(out))
```

**Data sample ও Output:**
```python
cll = CircularLinkedList()
for x in [1, 2, 3, 4]:
    cll.append(x)

cll.display()
cll.rounds(10)
```
```
1 -> 2 -> 3 -> 4 -> (back to 1)
1 2 3 4 1 2 3 4 1 2
```

**বাস্তব ব্যবহার:** Round-robin CPU scheduling, multiplayer game-এ turn ঘোরানো (Ludo-তে কার চাল), playlist repeat mode।

### 🎯 Classic Problem: Josephus Problem
n জন গোল হয়ে বসে আছে, প্রতি k-তম জন বাদ পড়ে। শেষে কে থাকবে?

```python
def josephus(n, k):
    # 1..n দিয়ে circular list বানাও
    head = Node(1)
    cur = head
    for i in range(2, n + 1):
        cur.next = Node(i)
        cur = cur.next
    cur.next = head            # চক্র বন্ধ; cur এখন শেষ node (head-এর আগেরটা)

    prev = cur
    cur = head
    eliminated = []
    while cur.next != cur:     # যতক্ষণ একজনের বেশি আছে
        for _ in range(k - 1): # k-1 ধাপ এগোও
            prev = cur
            cur = cur.next
        eliminated.append(cur.data)
        prev.next = cur.next   # cur বাদ
        cur = cur.next
    return cur.data, eliminated


winner, order = josephus(7, 3)
print("বাদ পড়ার ক্রম:", order)
print("বিজয়ী:", winner)
```
```
বাদ পড়ার ক্রম: [3, 6, 2, 7, 5, 1]
বিজয়ী: 4
```

---

## 13. Advanced Technique: Two Pointer (Slow & Fast) 🐢🐇

এটা Linked List-এর **সবচেয়ে শক্তিশালী কৌশল**। দুইটা pointer নিই:
- **slow** — প্রতিবার ১ ধাপ
- **fast** — প্রতিবার ২ ধাপ

### Helper (পরের সব section-এ ব্যবহার করবো)

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def build(values):
    """Python list থেকে linked list বানায়, head return করে"""
    dummy = ListNode()
    cur = dummy
    for v in values:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next


def to_list(head):
    """Linked list থেকে Python list (print-এর সুবিধার জন্য)"""
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out
```

> 💡 এখানে `ListNode` নামটা দিলাম কারণ **LeetCode** ঠিক এই নাম আর structure ব্যবহার করে। এখানে practice করলে সরাসরি LeetCode-এ চালাতে পারবে।

### 13.1 Middle Node খোঁজা — O(n), O(1) space

```python
def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next          # ১ ধাপ
        fast = fast.next.next     # ২ ধাপ
    return slow
```

**কেন কাজ করে?** fast যখন শেষে পৌঁছায়, slow তখন ঠিক অর্ধেক পথ গেছে (কারণ fast-এর গতি দ্বিগুণ)। একটা দৌড়ের কথা ভাবো — একজন দ্বিগুণ গতিতে দৌড়ালে সে finish line-এ পৌঁছানোর সময় অন্যজন মাঝপথে।

**Data sample ও Output:**
```python
print(middle_node(build([1, 2, 3, 4, 5])).val)     # বিজোড়
print(middle_node(build([1, 2, 3, 4, 5, 6])).val)  # জোড় → দ্বিতীয় middle
```
```
3
4
```

### 13.2 Cycle Detection — Floyd's Tortoise and Hare

একটা list-এ যদি কোথাও loop থাকে (কোনো node আগের কোনো node-কে point করে), সেটা কিভাবে ধরবো?

```
1 → 2 → 3 → 4 → 5
        ▲       │
        └───────┘   (5 আবার 3-কে point করে)
```

```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:          # দেখা হয়ে গেছে → cycle আছে!
            return True
    return False                  # fast শেষে পৌঁছেছে → cycle নেই
```

**কেন কাজ করে?** গোল দৌড়ের মাঠে দ্রুত দৌড়বিদ একসময় ধীরজনকে পিছন থেকে **ধরে ফেলবেই** (lap দেবে)। প্রতি ধাপে fast আর slow-এর দূরত্ব ১ করে কমে, তাই অবশ্যই একসময় দূরত্ব ০ হবে। আর cycle না থাকলে fast সোজা None-এ পৌঁছে যাবে।

> 💡 `is` ব্যবহার করেছি `==` না, কারণ আমরা দেখতে চাই **একই object** কিনা (একই node), শুধু একই value কিনা না।

**Data sample ও Output:**
```python
# cycle-ছাড়া
print(has_cycle(build([1, 2, 3, 4, 5])))

# cycle বানানো: 5 → 3
head = build([1, 2, 3, 4, 5])
node3 = head.next.next
tail = head
while tail.next:
    tail = tail.next
tail.next = node3

print(has_cycle(head))
```
```
False
True
```

> ⚠️ Cycle থাকা list-এ কখনো `to_list()` বা display চালাবে না — infinite loop হবে!

### 13.3 Cycle-এর শুরু কোথায়? (Advanced)

```python
def detect_cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            # Phase 2: একজনকে head-এ ফেরত পাঠাও, দুজনেই ১ ধাপ করে চলো
            slow = head
            while slow is not fast:
                slow = slow.next
                fast = fast.next
            return slow           # যেখানে আবার দেখা হলো = cycle-এর শুরু
    return None
```

**কেন কাজ করে? (গাণিতিক যুক্তি — ধীরে পড়ো)**
- ধরো head থেকে cycle-এর শুরু পর্যন্ত দূরত্ব = **a**
- cycle-এর শুরু থেকে দেখা হওয়ার জায়গা পর্যন্ত = **b**
- cycle-এর মোট দৈর্ঘ্য = **c**

দেখা হওয়ার সময়:
- slow গেছে: `a + b`
- fast গেছে: `a + b + k·c` (k বার বেশি চক্কর দিয়েছে)
- fast-এর গতি দ্বিগুণ, তাই: `2(a + b) = a + b + k·c` → **`a = k·c − b`**

মানে: দেখা হওয়ার জায়গা থেকে আরো `a` ধাপ গেলে আবার cycle-এর শুরুতে পৌঁছাবো (কারণ `k·c − b` ধাপ = চক্কর পূরণ)। আর head থেকেও `a` ধাপ গেলে cycle-এর শুরুতে পৌঁছাই। তাই দুজনকে ১ ধাপ করে চালালে **ঠিক cycle-এর শুরুতে দেখা হবে**। 🎯

**Data sample ও Output:**
```python
head = build([1, 2, 3, 4, 5])
node3 = head.next.next
tail = head
while tail.next:
    tail = tail.next
tail.next = node3           # 5 → 3

start = detect_cycle_start(head)
print("Cycle starts at:", start.val)
print(detect_cycle_start(build([1, 2, 3])))
```
```
Cycle starts at: 3
None
```

### 13.4 শেষ থেকে n-তম node মুছে ফেলা (এক pass-এ)

```python
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)     # dummy head — head মুছতে হলেও সমস্যা নেই
    fast = slow = dummy
    for _ in range(n + 1):        # fast-কে n+1 ধাপ এগিয়ে রাখো
        fast = fast.next
    while fast:                   # দুজনে একসাথে চলো
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next    # slow এখন মুছতে হবে এমন node-এর আগে
    return dummy.next
```

**কৌশল:** fast আর slow-এর মধ্যে সবসময় **n+1 ধাপের ফাঁক** রাখি। fast যখন None-এ পৌঁছায়, slow ঠিক মুছতে হবে এমন node-এর **আগের node**-এ থাকে।

**Dummy node কেন?** যদি head নিজেই মুছতে হয় (যেমন ৫টা node, n=5), তখন head-এর আগে কোনো node নেই। Dummy node সেই "আগের node"-এর কাজ করে। **Dummy node Linked List-এর edge case কমানোর সবচেয়ে বড় trick।**

**Data sample ও Output:**
```python
print(to_list(remove_nth_from_end(build([1, 2, 3, 4, 5]), 2)))
print(to_list(remove_nth_from_end(build([1, 2, 3, 4, 5]), 5)))  # head মুছলাম
print(to_list(remove_nth_from_end(build([1]), 1)))
```
```
[1, 2, 3, 5]
[2, 3, 4, 5]
[]
```

---

## 14. Advanced Problems

### 14.1 দুইটা Sorted List Merge করা

```python
def merge_sorted(l1, l2):
    dummy = ListNode()
    tail = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 if l1 else l2   # বাকি থাকা অংশ সরাসরি জুড়ে দাও
    return dummy.next
```

**ব্যাখ্যা:** দুইটা লাইনে দাঁড়ানো মানুষ উচ্চতা অনুযায়ী sorted। প্রতিবার দুই লাইনের সামনের দুজনকে তুলনা করি, ছোটজনকে নতুন লাইনে পাঠাই। একটা লাইন শেষ হলে অন্যটার বাকি সবাইকে একবারে জুড়ে দিই (তারা আগে থেকেই sorted)। কোনো নতুন node বানাইনি — শুধু pointer বদলেছি, তাই O(1) extra space।

**Data sample ও Output:**
```python
print(to_list(merge_sorted(build([1, 3, 5, 7]), build([2, 4, 6, 8, 10]))))
print(to_list(merge_sorted(build([]), build([1, 2]))))
```
```
[1, 2, 3, 4, 5, 6, 7, 8, 10]
[1, 2]
```

### 14.2 Palindrome Check — O(n) time, O(1) space

```python
def is_palindrome(head):
    if head is None or head.next is None:
        return True

    # ধাপ ১: middle খোঁজো
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

    # ধাপ ২: দ্বিতীয় অর্ধেক reverse করো
    prev, cur = None, slow
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt

    # ধাপ ৩: দুই দিক থেকে তুলনা করো
    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left = left.next
        right = right.next
    return True
```

**ব্যাখ্যা:** Palindrome মানে সামনে থেকে আর পিছন থেকে একই (যেমন "madam", 1-2-3-2-1)। Singly LL-এ পিছনে যাওয়া যায় না, তাই **দ্বিতীয় অর্ধেক উল্টে দিয়ে** দুই দিক থেকে একসাথে মিলাই। এখানে আগের শেখা দুইটা technique (middle + reverse) মিলে একটা নতুন সমস্যা সমাধান করলো — এভাবেই advanced problem বানানো হয়।

> 💡 সহজ উপায়: সব value একটা Python list-এ নিয়ে `values == values[::-1]` — কিন্তু তাতে O(n) extra space লাগে। Interview-এ O(1) space version চাইবে।

**Data sample ও Output:**
```python
print(is_palindrome(build([1, 2, 3, 2, 1])))
print(is_palindrome(build([1, 2, 2, 1])))
print(is_palindrome(build([1, 2, 3])))
```
```
True
True
False
```

### 14.3 Sorted List থেকে Duplicate মুছা

```python
def remove_duplicates(head):
    cur = head
    while cur and cur.next:
        if cur.val == cur.next.val:
            cur.next = cur.next.next   # duplicate বাদ, cur সরবে না!
        else:
            cur = cur.next
    return head
```

**ব্যাখ্যা:** Duplicate পেলে `cur` সামনে সরাই না, কারণ পরেরটাও duplicate হতে পারে (যেমন 1,1,1)। শুধু ভিন্ন মান পেলে সরি।

**Data sample ও Output:**
```python
print(to_list(remove_duplicates(build([1, 1, 2, 3, 3, 3, 4]))))
```
```
[1, 2, 3, 4]
```

**Unsorted list হলে?** একটা `set` ব্যবহার করো:
```python
def remove_duplicates_unsorted(head):
    seen = set()
    dummy = ListNode(0, head)
    prev, cur = dummy, head
    while cur:
        if cur.val in seen:
            prev.next = cur.next
        else:
            seen.add(cur.val)
            prev = cur
        cur = cur.next
    return dummy.next

print(to_list(remove_duplicates_unsorted(build([4, 2, 4, 1, 2, 5]))))
```
```
[4, 2, 1, 5]
```

### 14.4 Rotate List (ডানে k বার ঘোরানো)

```python
def rotate_right(head, k):
    if head is None or head.next is None or k == 0:
        return head

    # ধাপ ১: length আর শেষ node বের করো
    length, tail = 1, head
    while tail.next:
        tail = tail.next
        length += 1

    k %= length                 # k = 7, length = 5 হলে আসলে 2 বার ঘোরানো
    if k == 0:
        return head

    # ধাপ ২: সাময়িকভাবে circular বানাও
    tail.next = head

    # ধাপ ৩: নতুন tail = (length - k - 1) index-এ
    new_tail = head
    for _ in range(length - k - 1):
        new_tail = new_tail.next
    new_head = new_tail.next
    new_tail.next = None        # চক্র ভাঙো
    return new_head
```

**ব্যাখ্যা:** list-টাকে একটা গোল মালা বানাই, তারপর সঠিক জায়গায় কেটে দিই। `k %= length` জরুরি — ৫টা node-এর list ৫ বার ঘোরালে আগের মতোই থাকে।

**Data sample ও Output:**
```python
print(to_list(rotate_right(build([1, 2, 3, 4, 5]), 2)))
print(to_list(rotate_right(build([0, 1, 2]), 4)))
```
```
[4, 5, 1, 2, 3]
[2, 0, 1]
```

### 14.5 Add Two Numbers (LeetCode #2)

সংখ্যাগুলো **উল্টো ক্রমে** digit হিসেবে রাখা। যোগ করতে হবে।
`342 + 465 = 807` → `[2,4,3] + [5,6,4] = [7,0,8]`

```python
def add_two_numbers(l1, l2):
    dummy = ListNode()
    cur = dummy
    carry = 0
    while l1 or l2 or carry:
        a = l1.val if l1 else 0
        b = l2.val if l2 else 0
        total = a + b + carry
        carry = total // 10        # হাতে কত থাকলো
        cur.next = ListNode(total % 10)  # এই ঘরের digit
        cur = cur.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next
```

**ব্যাখ্যা:** ছোটবেলায় যেভাবে হাতে যোগ করতাম — একক ঘর থেকে শুরু, ১০ বা বেশি হলে "হাতে ১"। উল্টো ক্রমে রাখার কারণে head-এই একক ঘর, তাই সরাসরি শুরু করা যায়। `or carry` শর্তটা জরুরি — `99 + 1 = 100`-এ শেষে একটা বাড়তি digit আসে।

**Data sample ও Output:**
```python
print(to_list(add_two_numbers(build([2, 4, 3]), build([5, 6, 4]))))
print(to_list(add_two_numbers(build([9, 9]), build([1]))))
```
```
[7, 0, 8]
[0, 0, 1]
```

### 14.6 Merge Sort on Linked List — O(n log n)

Linked List sort করার **সবচেয়ে ভালো** algorithm হলো Merge Sort (কারণ random access লাগে না, আর merge-এ extra array লাগে না)।

```python
def sort_list(head):
    if head is None or head.next is None:
        return head

    # ধাপ ১: মাঝখান থেকে দুই ভাগ করো
    slow, fast = head, head.next   # fast = head.next দিলে জোড় length-এ প্রথম middle পাই
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    right = slow.next
    slow.next = None               # list দুই টুকরো

    # ধাপ ২: দুই ভাগ আলাদাভাবে sort করো (recursion)
    left_sorted = sort_list(head)
    right_sorted = sort_list(right)

    # ধাপ ৩: merge করো (14.1-এর function)
    return merge_sorted(left_sorted, right_sorted)
```

**ব্যাখ্যা (Divide & Conquer):**
```
[4, 2, 1, 3]
   ↙      ↘
[4, 2]   [1, 3]        ← ভাগ
 ↙ ↘      ↙ ↘
[4] [2]  [1] [3]       ← একটা করে = already sorted
 ↘ ↙      ↘ ↙
[2, 4]   [1, 3]        ← merge
    ↘    ↙
[1, 2, 3, 4]           ← merge
```

**`fast = head.next` কেন?** ২টা node থাকলে `fast = head` দিলে slow দ্বিতীয় node-এ যাবে, `slow.next = None` হবে, আর বাম ভাগে দুইটাই থেকে যাবে → infinite recursion! `head.next` দিলে slow প্রথম node-এ থামে, ঠিকমতো ১+১ ভাগ হয়।

**Data sample ও Output:**
```python
print(to_list(sort_list(build([4, 2, 1, 3]))))
print(to_list(sort_list(build([-1, 5, 3, 4, 0, 5, -7]))))
```
```
[1, 2, 3, 4]
[-7, -1, 0, 3, 4, 5, 5]
```

---

## 15. Real-world Project: LRU Cache 🚀

**LRU (Least Recently Used) Cache** — একটা নির্দিষ্ট সংখ্যক item রাখে। জায়গা ভরে গেলে **যেটা সবচেয়ে বেশি সময় ধরে ব্যবহার হয়নি** সেটা বাদ দেয়। Redis, browser cache, CDN সব জায়গায় এই ধারণা ব্যবহৃত। (Next.js/Node-এ যখন API response cache করো, ভেতরে এই রকম কিছুই চলে।)

**চাহিদা:** `get` আর `put` দুইটাই **O(1)** হতে হবে।

**সমাধান:**
- **Dict (hash map)** → key দিয়ে O(1)-এ node খুঁজে পাওয়া
- **Doubly Linked List** → ব্যবহারের ক্রম রাখা; সামনে = সবচেয়ে নতুন, পিছনে = সবচেয়ে পুরানো। node জানা থাকলে O(1)-এ সরানো যায়

```python
class DNode:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}                    # key -> DNode
        # Dummy head ও tail — edge case বাঁচাতে
        self.head = DNode()
        self.tail = DNode()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)               # ব্যবহার হলো → সামনে নিয়ে আসো
        self._add_front(node)
        return node.val

    def put(self, key, val):
        if key in self.map:
            self._remove(self.map[key])
        node = DNode(key, val)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:     # জায়গা শেষ → পিছনেরটা বাদ
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]        # এজন্যই node-এ key রাখা দরকার

    def order(self):
        cur, out = self.head.next, []
        while cur is not self.tail:
            out.append(cur.key)
            cur = cur.next
        return out
```

**Data sample ও Output:**
```python
cache = LRUCache(2)
cache.put(1, "A")
cache.put(2, "B")
print(cache.get(1), cache.order())   # 1 ব্যবহার হলো → সামনে
cache.put(3, "C")                    # জায়গা নেই → 2 বাদ (LRU)
print(cache.get(2))
cache.put(4, "D")                    # 1 বাদ
print(cache.get(1))
print(cache.get(3), cache.get(4), cache.order())
```
```
A [1, 2]
-1
-1
C D [4, 3]
```

> 💡 Python-এ বাস্তবে `functools.lru_cache` decorator বা `collections.OrderedDict` দিয়েই এটা হয়। কিন্তু interview-এ (LeetCode #146) নিজে বানাতে বলবে — আর এটা Doubly LL-এর সবচেয়ে সুন্দর বাস্তব প্রয়োগ।

---

## 16. Python-এর built-in: `collections.deque`

বাস্তব project-এ নিজে Linked List না বানিয়ে **`deque`** ব্যবহার করো। এটা ভেতরে **doubly linked list of blocks** দিয়ে বানানো, C-তে লেখা, তাই অনেক দ্রুত।

```python
from collections import deque

dq = deque([10, 20, 30])
dq.append(40)          # ডানে — O(1)
dq.appendleft(5)       # বামে — O(1)
print(dq)

print(dq.pop())        # ডান থেকে — O(1)
print(dq.popleft())    # বাম থেকে — O(1)
print(dq)

dq.rotate(1)           # ডানে ১ ঘর ঘোরাও
print(dq)

recent = deque(maxlen=3)   # সীমিত সাইজ — পুরানো নিজে থেকেই বাদ পড়ে
for page in ["home", "about", "blog", "contact"]:
    recent.append(page)
print(recent)
```
**Output:**
```
deque([5, 10, 20, 30, 40])
40
5
deque([10, 20, 30])
deque([30, 10, 20])
deque(['about', 'blog', 'contact'], maxlen=3)
```

**কখন কোনটা?**
| পরিস্থিতি | ব্যবহার করো |
|---|---|
| Queue / Stack, দুই প্রান্তে add/remove | `deque` |
| Index দিয়ে বারবার access | `list` |
| Interview / DSA শেখা | নিজে Linked List বানাও |

---

## 17. Time Complexity Cheat Sheet

| Operation | Singly LL | Singly LL (tail সহ) | Doubly LL (head+tail) | Python list |
|---|---|---|---|---|
| শুরুতে insert | O(1) | O(1) | O(1) | O(n) |
| শেষে insert | O(n) | **O(1)** | O(1) | O(1)* |
| শুরু থেকে delete | O(1) | O(1) | O(1) | O(n) |
| শেষ থেকে delete | O(n) | O(n) ❗ | **O(1)** | O(1) |
| Index দিয়ে access | O(n) | O(n) | O(n) | **O(1)** |
| Search by value | O(n) | O(n) | O(n) | O(n) |
| Node জানা থাকলে delete | O(n) | O(n) | **O(1)** | – |
| Reverse | O(n) | O(n) | O(n) | O(n) |

\* amortized

❗ **কেন Singly LL-এ tail থাকলেও শেষ থেকে delete O(n)?** কারণ শেষ node মুছতে **শেষের আগের** node লাগে, আর Singly-তে পিছনে যাওয়া যায় না। তাই head থেকে হেঁটে যেতে হয়। Doubly-তে `tail.prev` দিয়ে সরাসরি পাওয়া যায়।

### 🧠 Pattern Summary (মুখস্থ রাখো)

| Pattern | কখন ব্যবহার | উদাহরণ |
|---|---|---|
| **Dummy node** | head বদলাতে পারে এমন সমস্যা | merge, remove nth, delete |
| **Slow/Fast pointer** | middle, cycle, দূরত্ব | middle, cycle, palindrome |
| **Gap pointer** | শেষ থেকে k-তম | remove nth from end |
| **Reverse in place** | উল্টানো লাগলে | reverse, palindrome, k-group |
| **Hash map + LL** | O(1) lookup + ক্রম | LRU cache |
| **Divide & conquer** | sort | merge sort |

---

## 18. Practice Problems (LeetCode — সহজ থেকে কঠিন)

| # | Problem | Level | কোন technique |
|---|---|---|---|
| 206 | Reverse Linked List | Easy | Reverse |
| 21 | Merge Two Sorted Lists | Easy | Dummy node |
| 876 | Middle of the Linked List | Easy | Slow/Fast |
| 141 | Linked List Cycle | Easy | Floyd |
| 83 | Remove Duplicates from Sorted List | Easy | Traverse |
| 234 | Palindrome Linked List | Easy | Middle + Reverse |
| 160 | Intersection of Two Linked Lists | Easy | Two pointer switch |
| 19 | Remove Nth Node From End | Medium | Gap pointer |
| 2 | Add Two Numbers | Medium | Carry + Dummy |
| 142 | Linked List Cycle II | Medium | Floyd phase 2 |
| 61 | Rotate List | Medium | Circular trick |
| 148 | Sort List | Medium | Merge sort |
| 146 | LRU Cache | Medium | Hash map + DLL |
| 25 | Reverse Nodes in k-Group | Hard | Reverse + Dummy |
| 23 | Merge k Sorted Lists | Hard | Heap / Divide & conquer |

### ✅ শেখার পরামর্শ
1. **কাগজে-কলমে আঁকো।** Box আর তীর এঁকে প্রতিটা pointer কোথায় যাচ্ছে দেখো — Linked List-এর ৯০% bug এভাবে ধরা পড়ে।
2. প্রতিটা solution-এ **৪টা edge case** test করো: খালি list, একটা node, দুইটা node, head বদলায় এমন case।
3. প্রথমে Section 1–10 পুরোপুরি নিজে লিখতে পারো কিনা দেখো (না দেখে)। তারপর Section 13–15।
4. Easy problem-গুলো ৩–৪ দিন ধরে করো, তারপর Medium।

---

**Happy Coding! 🔗🐍**

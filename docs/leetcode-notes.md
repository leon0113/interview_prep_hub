# LeetCode Pattern Notes (JavaScript)

> Rule: every new solution is added at the bottom under "New Notes", then moved into the right pattern section.
> Each note = এক লাইনে মনে রাখো → সমস্যাটা সহজ ভাষায় → বাস্তব উদাহরণ → Trigger → Brute force → Invariant → Steps → Template → Solution → লাইন ধরে ব্যাখ্যা → Sample → Trace → Edge cases → সাধারণ ভুল → Complexity → নিজেকে প্রশ্ন → Pattern to remember.

---

## Index

| # | Problem (jump to note) | Difficulty | LeetCode | Pattern |
|---|---------|------------|----------|---------|
| 27 | [Remove Element](#leetcode-27--remove-element) | Easy | [Open](https://leetcode.com/problems/remove-element/) | Two Pointers (read/write) |
| 26 | [Remove Duplicates from Sorted Array](#leetcode-26--remove-duplicates-from-sorted-array) | Easy | [Open](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) | Two Pointers (read/write) |
| 283 | [Move Zeroes](#leetcode-283--move-zeroes) | Easy | [Open](https://leetcode.com/problems/move-zeroes/) | Two Pointers (read/write) + fill |
| 344 | [Reverse String](#leetcode-344--reverse-string) | Easy | [Open](https://leetcode.com/problems/reverse-string/) | Two Pointers (swap from both ends) |
| 88 | [Merge Sorted Array](#leetcode-88--merge-sorted-array) | Easy | [Open](https://leetcode.com/problems/merge-sorted-array/) | Two Pointers (merge from right) |
| 121 | [Best Time to Buy and Sell Stock](#leetcode-121--best-time-to-buy-and-sell-stock) | Easy | [Open](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) | One Pass / Min-so-far / Greedy |
| 485 | [Max Consecutive Ones](#leetcode-485--max-consecutive-ones) | Easy | [Open](https://leetcode.com/problems/max-consecutive-ones/) | Single Pass / Streak Counting |
| 268 | [Missing Number](#leetcode-268--missing-number) | Easy | [Open](https://leetcode.com/problems/missing-number/) | Math / Sum Formula (XOR alternative) |
| 136 | [Single Number](#leetcode-136--single-number) | Easy | [Open](https://leetcode.com/problems/single-number/) | Hash Map Frequency Count (XOR alternative) |
| 231 | [Power of Two](#leetcode-231--power-of-two) | Easy | [Open](https://leetcode.com/problems/power-of-two/) | Recursion (halving) / Bit trick alternative |
| 509 | [Fibonacci Number](#leetcode-509--fibonacci-number) | Easy | [Open](https://leetcode.com/problems/fibonacci-number/) | Tree Recursion → Memoization / Iterative DP |
| 704 | [Binary Search](#leetcode-704--binary-search) | Easy | [Open](https://leetcode.com/problems/binary-search/) | Binary Search (halve the search range) |
| 912 | [Sort an Array](#leetcode-912--sort-an-array) | Medium | [Open](https://leetcode.com/problems/sort-an-array/) | Divide and Conquer (Merge Sort) |

---

## Pattern Family Cheat Sheet

<details>
<summary><b>Show / hide cheat sheet and templates</b></summary>

| Pattern | Trigger words | Skeleton idea |
|---------|---------------|---------------|
| Read/Write pointers | "in-place", "O(1) extra space", "return new length k" | `i` reads, `x` writes only when KEEP condition is true |
| Swap from both ends | "reverse in-place", "palindrome-like symmetry" | `left` and `right` move inward, swap |
| Merge from right | "merge sorted in-place", "empty space at the end" | 3 pointers, fill from the back |
| Min-so-far + Greedy | "buy before sell", "best so far" | track best-so-far, compare with current |
| Streak counting | "consecutive", "longest run" | count current streak, reset on break, track max |
| Sum formula | "one number missing from 0..n / 1..n" | expected sum (formula) − actual sum = missing |
| Hash map counting | "frequency", "appears k times", "first unique" | pass 1: build counts, pass 2: look up / scan |
| XOR (pairs cancel) | "every element twice except one", "missing number" with O(1) space | `a ^ a = 0`, `a ^ 0 = a`, XOR everything |
| Recursion (shrink the problem) | "power of", "n depends on n-1 / n/2" | base case → shrink input → recursive call |
| Tree recursion → DP | "each value = sum of previous values" (Fibonacci, stairs) | brute recursion, then memoize or go bottom-up |
| Bit trick `n & (n-1)` | "power of two", "count set bits" | `n & (n-1)` removes the lowest set bit |
| Binary search | "sorted", "O(log n)", "find position / first true" | `left`, `right`, `mid`; throw away the half that cannot contain the answer |
| Divide and conquer | "sort", "split in halves and combine" | split → solve each half recursively → merge results |

### Binary Search Template (reuse for #704, #35, #278, #34, ...)

```python
left, right = 0, len(nums) - 1
while left <= right:
    mid = left + (right - left) // 2
    if nums[mid] == target:
        return mid
    elif nums[mid] > target:
        right = mid - 1      # answer can only be on the left
    else:
        left = mid + 1       # answer can only be on the right
return -1
```

Only the comparison changes per problem (e.g. "is this version bad?", "is mid*mid > x?").

### Recursion Template (reuse for #231, #509, ...)

```
function solve(input):
    if BASE_CASE: return answer          # stop condition(s)
    return combine(solve(SMALLER_INPUT))   # shrink and recurse
```

Always ask: (1) what is the base case? (2) how does the input shrink each call? (3) does every path reach the base case?

### Read/Write Template (reuse this for #26, #27, #283, #80, ...)

```javascript
let x = 0;
for (let i = 0; i < nums.length; i++) {
    if (KEEP_CONDITION) {
        nums[x] = nums[i];
        x++;
    }
}
return x; // new length
```

Only `KEEP_CONDITION` changes per problem.

</details>

---

## Practice Problems (solve these with the same templates)

<details>
<summary><b>Show / hide practice list</b></summary>

Listed roughly easy → harder inside each pattern. Solve one, write the note, then add it to this file.

### Read/Write pointers (keep condition + overwrite)
- 80 — Remove Duplicates from Sorted Array II
- 905 — Sort Array By Parity
- 922 — Sort Array By Parity II
- 1089 — Duplicate Zeros
- 75 — Sort Colors

### Swap from both ends (left / right pointers)
- 125 — Valid Palindrome
- 345 — Reverse Vowels of a String
- 541 — Reverse String II
- 557 — Reverse Words in a String III
- 917 — Reverse Only Letters
- 680 — Valid Palindrome II
- 977 — Squares of a Sorted Array
- 167 — Two Sum II - Input Array Is Sorted
- 11 — Container With Most Water

### Merge / two sorted inputs
- 21 — Merge Two Sorted Lists
- 350 — Intersection of Two Arrays II
- 986 — Interval List Intersections
- 977 — Squares of a Sorted Array (fill the result from the right)

### Min-so-far / Greedy one pass
- 122 — Best Time to Buy and Sell Stock II
- 724 — Find Pivot Index
- 53 — Maximum Subarray
- 55 — Jump Game
- 238 — Product of Array Except Self

### Streak counting
- 1446 — Consecutive Characters
- 674 — Longest Continuous Increasing Subsequence
- 1869 — Longer Contiguous Segments of Ones than Zeros
- 1004 — Max Consecutive Ones III
- 128 — Longest Consecutive Sequence

### Sum formula / XOR
- 389 — Find the Difference
- 448 — Find All Numbers Disappeared in an Array
- 645 — Set Mismatch
- 287 — Find the Duplicate Number
- 137 — Single Number II
- 260 — Single Number III
- 41 — First Missing Positive

### Hash map frequency counting
- 1 — Two Sum
- 217 — Contains Duplicate
- 242 — Valid Anagram
- 387 — First Unique Character in a String
- 383 — Ransom Note
- 349 — Intersection of Two Arrays
- 169 — Majority Element
- 205 — Isomorphic Strings
- 219 — Contains Duplicate II
- 49 — Group Anagrams

### Bit tricks
- 191 — Number of 1 Bits
- 338 — Counting Bits
- 461 — Hamming Distance
- 476 — Number Complement
- 190 — Reverse Bits
- 326 — Power of Three
- 342 — Power of Four

### Recursion / Fibonacci-style DP
- 70 — Climbing Stairs
- 1137 — N-th Tribonacci Number
- 746 — Min Cost Climbing Stairs
- 198 — House Robber
- 206 — Reverse Linked List
- 50 — Pow(x, n)

### Binary search
- 35 — Search Insert Position
- 278 — First Bad Version
- 69 — Sqrt(x)
- 367 — Valid Perfect Square
- 34 — Find First and Last Position of Element in Sorted Array
- 74 — Search a 2D Matrix
- 153 — Find Minimum in Rotated Sorted Array
- 33 — Search in Rotated Sorted Array
- 875 — Koko Eating Bananas

### Divide and conquer / sorting
- 148 — Sort List
- 23 — Merge k Sorted Lists
- 215 — Kth Largest Element in an Array
- 169 — Majority Element (divide and conquer version)
- 493 — Reverse Pairs

</details>

---

# Section 1 — Two Pointers: Read/Write (In-place Overwrite)

---

## LeetCode #27 — Remove Element

> **এক লাইনে মনে রাখো:** `i` পড়ে, `x` লেখে। ভালো element পেলেই `nums[x]` এ বসাও, `x++`। শেষে `x` = নতুন length।

**সমস্যাটা সহজ ভাষায়:**
একটা array আর একটা সংখ্যা `val` দেওয়া আছে। array থেকে সব `val` সরাতে হবে, তবে নতুন array বানানো যাবে না (in-place)। যতগুলো element থাকলো সেই সংখ্যা `k` return করো। প্রথম `k` টা ঘরে বাকি element গুলো থাকলেই চলবে, পেছনে কী আছে তাতে কিছু যায় আসে না।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
একটা লাইনে মানুষ দাঁড়িয়ে আছে, লাল জামা পরা সবাইকে বাদ দিতে হবে। তুমি (`i`) একজন একজন করে দেখো। লাল জামা না হলে তাকে সামনের পরের খালি জায়গায় (`x`) দাঁড় করাও। শেষে সামনে যতজন দাঁড়িয়ে আছে, সেটাই উত্তর।

**Pattern:** Two Pointers (read/write) / In-place overwrite

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "in-place", "O(1) extra space": নতুন array বানানো যাবে না
- "return k, প্রথম k টা element দেখা হবে": পেছনের ঘরগুলো নিয়ে ভাবতে হবে না

**Brute force:** কাজের element গুলো একটা নতুন array তে নিয়ে আবার কপি করা। এতে O(n) extra space লাগে। এখানে একই array তে overwrite করলে O(1) space লাগে।

**Pointers:**
| Pointer | কাজ | কখন এগোয় |
|---------|-----|-----------|
| `i` | read: প্রতিটা element পড়ে | প্রতি step এ |
| `x` | write: পরের element কোথায় বসবে | শুধু ভালো element পেলে |

**Invariant:** `nums[0...x-1]` এ সবসময় এখন পর্যন্ত পাওয়া ভালো element গুলো ঠিক order এ থাকে।

**Steps:**
1. `x = 0` দিয়ে শুরু।
2. `i` দিয়ে পুরো array ঘোরো।
3. `nums[i] !== val` হলে `nums[x] = nums[i]`, তারপর `x++`।
4. `nums[i] === val` হলে কিছুই করো না, শুধু `i` এগিয়ে যাবে।
5. `x` return করো।

**Template:** Read/Write template, এখানে `KEEP_CONDITION = nums[i] !== val`। বাকি সব skeleton একই থাকে (#26, #283, #80 এও শুধু এই condition বদলায়)।

**Solution:**
```javascript
var removeElement = function (nums, val) {
    let x = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== val) {
            nums[x] = nums[i];
            x++;
        }
    }

    return x;
};
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `let x = 0` | এখনো কিছু লেখা হয়নি, প্রথম লেখা হবে index 0 তে |
| `if (nums[i] !== val)` | এটা রাখার মতো element কিনা (**শুধু এই লাইনটা problem অনুযায়ী বদলায়**) |
| `nums[x] = nums[i]` | ভালো element টা সামনে টেনে আনো |
| `x++` | পরের লেখার জায়গা এক ঘর সামনে |
| `return x` | `x` = কতগুলো ভালো element লেখা হয়েছে = নতুন length |

**Sample:**
```
Input : nums = [3,2,2,3], val = 3
Output: 2, nums = [2,2,_,_]

Input : nums = [0,1,2,2,3,0,4,2], val = 2
Output: 5, nums = [0,1,3,0,4,_,_,_]
```

**Trace** (`nums = [0,1,2,2,3,0,4,2]`, `val = 2`):
| i | nums[i] | রাখবো? | কাজ | x (পরে) | array |
|---|---------|--------|-----|---------|-------|
| 0 | 0 | হ্যাঁ | nums[0]=0 | 1 | [0,1,2,2,3,0,4,2] |
| 1 | 1 | হ্যাঁ | nums[1]=1 | 2 | [0,1,2,2,3,0,4,2] |
| 2 | 2 | না | skip | 2 | একই |
| 3 | 2 | না | skip | 2 | একই |
| 4 | 3 | হ্যাঁ | nums[2]=3 | 3 | [0,1,**3**,2,3,0,4,2] |
| 5 | 0 | হ্যাঁ | nums[3]=0 | 4 | [0,1,3,**0**,3,0,4,2] |
| 6 | 4 | হ্যাঁ | nums[4]=4 | 5 | [0,1,3,0,**4**,0,4,2] |
| 7 | 2 | না | skip | 5 | একই |

```
Final: [0,1,3,0,4 | 0,4,2]
        ← k = 5 →   (এই অংশ ignore)
```

**Edge cases:**
- Empty array → 0
- সব element = `val` → 0
- কোনো element `val` না → n (প্রতিটা element নিজের উপরেই কপি হয়)

**সাধারণ ভুল (Common mistakes):**
- `x` এর বদলে `x + 1` return করা (`x` নিজেই count, কারণ লেখার পরে `x++` হয়)
- loop এর ভেতরে `splice` দিয়ে delete করা: এতে O(n²) লাগে, আর index গুলো সরে যায়

**Alternative:** Swap-with-last। `nums[i] === val` হলে শেষের element দিয়ে replace করো আর `n--` করো। `val` কম থাকলে লেখা কম হয়, কিন্তু order বদলে যায়।

**Complexity:** Time O(n) | Space O(1)

**বাংলায় (কেন overwrite নিরাপদ):**
`x` শুধু ভালো element পেলে এগোয়, কিন্তু `i` প্রতি step এ এগোয়। তাই সবসময় `x <= i` থাকে। মানে আমরা যে ঘরে লিখছি সেটা আগেই পড়া হয়ে গেছে, তাই এখনো না পড়া কোনো element হারিয়ে যায় না।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. `x` কখন এগোয়, আর `i` কখন? *(উত্তর: `x` শুধু ভালো element পেলে, `i` প্রতিবার)*
2. #26 এ কোন লাইনটা বদলাবে? *(উত্তর: শুধু `KEEP_CONDITION`)*

**Pattern to remember:** "Read with `i`, write with `x`. Copy every element that is not `val`, then `x` is the new length."

**Related:** #26 (same template, keep condition = নতুন unique), #283 (same template + শেষে 0 দিয়ে fill), #80

---

## LeetCode #26 — Remove Duplicates from Sorted Array

> **এক লাইনে মনে রাখো:** `x` = শেষ unique এর ঘর। নতুন বড় মান পেলে আগে `x++`, তারপর লেখো। শেষে `x + 1` return।

**সমস্যাটা সহজ ভাষায়:**
একটা **sorted** array তে একই সংখ্যা পাশাপাশি একাধিকবার আছে। প্রতিটা সংখ্যা একবার করে রেখে বাকি duplicate গুলো সরাতে হবে, in-place। কতগুলো unique সংখ্যা থাকলো (`k`) সেটা return করো। প্রথম `k` টা ঘরে unique গুলো order এ থাকলেই হবে।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
উচ্চতা অনুযায়ী লাইনে দাঁড়ানো ছাত্রদের থেকে প্রতিটা উচ্চতার একজন করে নিয়ে একটা দল বানাতে হবে। দলের সবশেষে যে আছে (`x`) তার চেয়ে লম্বা কাউকে পেলেই তাকে দলে নাও। সমান উচ্চতার হলে বাদ, কারণ সেই উচ্চতার একজন আগেই আছে।

**Pattern:** Two Pointers (read/write) / In-place overwrite

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "sorted array" + "remove duplicates in-place"
- "return the number of unique elements k"

**Brute force:** একটা `Set` বা নতুন array তে unique গুলো রাখা → O(n) space। Array sorted, তাই শুধু শেষ unique মানের সাথে তুলনা করলেই হয়, extra জায়গা লাগে না।

**Pointers:**
| Pointer | কাজ | কখন এগোয় |
|---------|-----|-----------|
| `i` | read: প্রতিটা element পড়ে | প্রতি step এ |
| `x` | **শেষ বসানো unique element** এর ঘর | নতুন বড় মান পেলে |

**Invariant:** `nums[0...x]` এ সবসময় এখন পর্যন্ত পাওয়া unique মানগুলো sorted order এ থাকে।

**Steps:**
1. `x = 0` দিয়ে শুরু (প্রথম element সবসময় unique)।
2. `i` দিয়ে পুরো array ঘোরো।
3. `nums[i] > nums[x]` হলে (sorted, তাই বড় মানেই নতুন মান): আগে `x++`, তারপর `nums[x] = nums[i]`।
4. না হলে skip।
5. `x + 1` return করো।

**Template:** Read/Write template, এখানে `KEEP_CONDITION = nums[i] > nums[x]`।
#27 থেকে পার্থক্য: এখানে `x` শেষ লেখা ঘরকে দেখায়, তাই **আগে `x++`, পরে লেখা**, আর শেষে `x + 1`।

**Solution:**
```javascript
var removeDuplicates = function (nums) {
    let x = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] > nums[x]) {
            x = x + 1;
            nums[x] = nums[i];
        }
    }

    return x + 1
};
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `let x = 0` | `nums[0]` প্রথম unique, সেটা আগে থেকেই ঠিক জায়গায় |
| `if (nums[i] > nums[x])` | শেষ unique এর চেয়ে বড় = নতুন মান (**শুধু এই লাইনটা problem অনুযায়ী বদলায়**) |
| `x = x + 1` | নতুন unique এর জন্য পরের ঘর |
| `nums[x] = nums[i]` | নতুন মানটা সেখানে বসাও |
| `return x + 1` | `x` হলো index, count = index + 1 |

**Sample:**
```
Input : nums = [1,1,2]
Output: 2, nums = [1,2,_]

Input : nums = [0,0,1,1,1,2,2,3]
Output: 4, nums = [0,1,2,3,_,_,_,_]
```

**Trace** (`nums = [0,0,1,1,1,2,2,3]`):
| i | nums[i] | nums[x] | নতুন? | কাজ | x (পরে) | array |
|---|---------|---------|-------|-----|---------|-------|
| 0 | 0 | 0 | না | skip | 0 | [0,0,1,1,1,2,2,3] |
| 1 | 0 | 0 | না | skip | 0 | একই |
| 2 | 1 | 0 | হ্যাঁ | x=1, nums[1]=1 | 1 | [0,**1**,1,1,1,2,2,3] |
| 3 | 1 | 1 | না | skip | 1 | একই |
| 4 | 1 | 1 | না | skip | 1 | একই |
| 5 | 2 | 1 | হ্যাঁ | x=2, nums[2]=2 | 2 | [0,1,**2**,1,1,2,2,3] |
| 6 | 2 | 2 | না | skip | 2 | একই |
| 7 | 3 | 2 | হ্যাঁ | x=3, nums[3]=3 | 3 | [0,1,2,**3**,1,2,2,3] |

```
Final: [0,1,2,3 | 1,2,2,3]
              ↑
              x=3  → return x + 1 = 4
```

**Edge cases:**
- একটা element → 1
- সব একই (`[2,2,2]`) → 1
- আগে থেকেই সব unique → n
- Empty array তে এই code `1` return করে (ভুল)। LeetCode এ length ≥ 1, তাই সমস্যা নেই, কিন্তু অন্য জায়গায় ব্যবহার করলে guard দিতে হবে
- Array **sorted** হতে হবে। Unsorted হলে `>` দিয়ে কাজ হবে না

**সাধারণ ভুল (Common mistakes):**
- `x + 1` এর বদলে `x` return করা
- আগে লিখে পরে `x++` করা: তাহলে শেষ unique মানটাই overwrite হয়ে যায়

**Alternative:** আগের element এর সাথে তুলনা: `if (i === 0 || nums[i] !== nums[i-1])` হলে `nums[x++] = nums[i]`। এতে #27 এর মতো "`x` = পরের লেখার ঘর" থাকে, আর শেষে শুধু `x` return।

**Complexity:** Time O(n) | Space O(1)

**বাংলায় (এখানে `x` আলাদা কেন):**
#27 এ `x` হলো "পরের লেখার জায়গা", আর #26 এ `x` হলো "শেষ unique element এর জায়গা"। তাই #26 এ আগে `x++` করে তারপর লিখতে হয়, আর শেষে `x + 1` return করতে হয় (index 0 থেকে শুরু, count = index + 1)। Array sorted বলেই শুধু শেষ unique এর সাথে তুলনা করা যথেষ্ট, কারণ একই মানগুলো সবসময় পাশাপাশি থাকে।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. কেন `x + 1` return করি, `x` না? *(উত্তর: `x` শেষ unique এর index, count = index + 1)*
2. Array sorted না হলে কী হতো? *(উত্তর: `>` দিয়ে নতুন মান চেনা যেত না, `Set` লাগতো)*

**Pattern to remember:** "Scan with `i`. Whenever you see a value bigger than the last unique one at `x`, move `x` forward and place it there."

**Related:** #27 (same template, `x` = পরের লেখার ঘর), #283 (same template + fill), #80 (সর্বোচ্চ 2 বার রাখা যাবে)

---

## LeetCode #283 — Move Zeroes

> **এক লাইনে মনে রাখো:** non-zero গুলো `p` দিয়ে সামনে লেখো, তারপর `p` থেকে শেষ পর্যন্ত `0` বসাও।

**সমস্যাটা সহজ ভাষায়:**
Array এর সব `0` শেষে পাঠাতে হবে, আর বাকি (non-zero) সংখ্যাগুলোর আগের order ঠিক রাখতে হবে। নতুন array বানানো যাবে না (in-place)। কিছু return করতে হয় না।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
তাকে বই আর খালি বাক্স মেশানো আছে। বইগুলো একটা একটা করে বাম দিক থেকে সাজাও (`p`)। সব বই সাজানো হয়ে গেলে ডান দিকের বাকি সব জায়গায় খালি বাক্স (`0`) রেখে দাও।

**Pattern:** Two Pointers (read/write) / In-place overwrite + fill

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "move all 0s to the end", "maintain relative order"
- "in-place", "do not make a copy"

**Brute force:** নতুন array তে আগে non-zero, পরে zero push করা → O(n) space।

**Pointers:**
| Pointer | কাজ | কখন এগোয় |
|---------|-----|-----------|
| `i` | read: প্রতিটা element পড়ে | প্রতি step এ |
| `p` | write: পরের non-zero কোথায় বসবে | শুধু non-zero পেলে |

**Invariant:** `nums[0...p-1]` এ সবসময় এখন পর্যন্ত পাওয়া সব non-zero মান আসল order এ থাকে।

**Steps:**
1. `p = 0` দিয়ে শুরু।
2. `i` দিয়ে ঘোরো। `nums[i] !== 0` হলে `nums[p] = nums[i]`, `p++`।
3. Loop শেষে `p` থেকে শেষ পর্যন্ত সব ঘরে `0` বসাও।

**Template:** Read/Write template, `KEEP_CONDITION = nums[i] !== 0`, সাথে দ্বিতীয় একটা loop যেটা বাকি ঘরগুলো `0` দিয়ে ভরে।

**Solution:**
```javascript
var moveZeroes = function (nums) {
    let p = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            nums[p] = nums[i];
            p++;
        }
    }

    for (let i = p; i < nums.length; i++) {
        nums[i] = 0;
    }
};
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `let p = 0` | প্রথম non-zero বসবে index 0 তে |
| `if (nums[i] !== 0)` | রাখার condition (**এই লাইনটা problem অনুযায়ী বদলায়**) |
| `nums[p] = nums[i]; p++` | non-zero সামনে টেনে আনো, লেখার ঘর এক ধাপ সামনে |
| `for (let i = p; ...) nums[i] = 0` | পেছনের পুরনো মান মুছে `0` বসাও |

**Sample:**
```
Input : nums = [0,1,0,3,12]
Output: nums = [1,3,12,0,0]

Input : nums = [0]
Output: nums = [0]
```

**Trace** (`nums = [0,1,0,3,12]`):

প্রথম loop:
| i | nums[i] | non-zero? | কাজ | p (পরে) | array |
|---|---------|-----------|-----|---------|-------|
| 0 | 0 | না | skip | 0 | [0,1,0,3,12] |
| 1 | 1 | হ্যাঁ | nums[0]=1 | 1 | [**1**,1,0,3,12] |
| 2 | 0 | না | skip | 1 | একই |
| 3 | 3 | হ্যাঁ | nums[1]=3 | 2 | [1,**3**,0,3,12] |
| 4 | 12 | হ্যাঁ | nums[2]=12 | 3 | [1,3,**12**,3,12] |

দ্বিতীয় loop (`p = 3` থেকে fill):
```
[1,3,12 | 3,12]  →  [1,3,12 | 0,0]
         ↑
         p=3
```

**Edge cases:**
- `[0]` → `[0]`
- কোনো zero নেই (`[1,2,3]`) → একই থাকে
- সব zero → একই থাকে

**সাধারণ ভুল (Common mistakes):**
- দ্বিতীয় loop (fill) ভুলে যাওয়া: তাহলে শেষে পুরনো মান থেকে যায় (`[1,3,12,3,12]`)
- `splice` দিয়ে zero সরিয়ে `push(0)` করা: O(n²), আর loop চলার সময় index সরে যায়

**Alternative:** Swap version: `if (nums[i] !== 0) { [nums[i], nums[p]] = [nums[p], nums[i]]; p++ }`। এক loop এই হয়, fill লাগে না। কিন্তু zero না থাকলেও প্রতিটা element নিজের সাথে swap হয়।

**Complexity:** Time O(n) | Space O(1)

**বাংলায় (শেষে fill কেন লাগে):**
প্রথম loop এ আমরা non-zero গুলো সামনে এনে লিখি, কিন্তু পিছনের পুরনো মানগুলো মুছে যায় না (যেমন `[1,3,12,3,12]` এর শেষের `3,12`)। `p` পর্যন্ত সব ঠিক আছে, আর `p` এর পরে যতগুলো ঘর, ঠিক ততগুলোই zero ছিল। তাই `p` থেকে শেষ পর্যন্ত সব জায়গায় `0` বসালেই উত্তর।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. প্রথম loop শেষে array দেখতে কেমন? *(উত্তর: সামনে সব non-zero, পেছনে পুরনো মান, `0` না)*
2. #27 থেকে এখানে বাড়তি কী? *(উত্তর: শেষে `p` থেকে `0` fill)*

**Pattern to remember:** "Scan with `i`, place valid elements with `p`, then fill the remaining positions."

**Related:** #27 (same template, fill নেই), #26 (same template)

---

# Section 2 — Two Pointers: Swap From Both Ends

---

## LeetCode #344 — Reverse String

> **এক লাইনে মনে রাখো:** দুই মাথা swap করো, ভেতরে আসো, মাঝে থামো। Mirror index = `n - 1 - i`।

**সমস্যাটা সহজ ভাষায়:**
Character এর একটা array দেওয়া আছে। সেটা উল্টে দিতে হবে, একই array তে (in-place, O(1) extra memory)। কিছু return করতে হয় না।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
একটা লাইনে দাঁড়ানো মানুষদের উল্টো order এ দাঁড় করাতে হবে। প্রথম আর শেষ জন জায়গা বদলায়, তারপর দ্বিতীয় আর শেষের আগের জন, এভাবে মাঝখান পর্যন্ত। মাঝের জন (বেজোড় হলে) নিজের জায়গাতেই থাকে।

**Pattern:** Two Pointers / Swap from both ends

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "reverse in-place"
- array/string, O(1) extra memory
- palindrome বা দুই দিক থেকে মিলিয়ে দেখার মতো problem

**Brute force:** নতুন উল্টো array বানানো (O(n) space), বা `.reverse()` ব্যবহার করা (logic লুকিয়ে যায়, interview তে চলে না)।

**Pointers:**
| Pointer | কাজ | কখন এগোয় |
|---------|-----|-----------|
| `i` | বাম দিকের ঘর | প্রতি step এ ডানে (`i++`) |
| `n - 1 - i` | ডান দিকের mirror ঘর | `i` বাড়লে নিজে থেকেই বামে সরে |

**Invariant:** `i` টা swap এর পরে প্রথম `i` টা আর শেষ `i` টা ঘর তাদের শেষ (উল্টানো) জায়গায় আছে।

**Steps:**
1. `temp` এ বাম মান রাখো।
2. ডান মান বাম ঘরে বসাও।
3. `temp` ডান ঘরে বসাও।
4. `i++` করে ভেতরে আসো।
5. `i < floor(n / 2)` হওয়া পর্যন্ত চলবে।

**Template:**
```javascript
for (let i = 0; i < Math.floor(n / 2); i++) {
    const j = n - 1 - i;      // mirror position
    [arr[i], arr[j]] = [arr[j], arr[i]];
}
```
Problem অনুযায়ী বদলায়: swap এর বদলে তুলনা (palindrome), বা কোন element skip করবে (শুধু vowel, শুধু letter)।

**Solution:**
```javascript
var reverseString = function (s) {
    const n = s.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
        const temp = s[i];
        s[i] = s[n - 1 - i];
        s[n - 1 - i] = temp;
    }
};
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `i < Math.floor(n / 2)` | শুধু অর্ধেক পর্যন্ত, কারণ প্রতি swap এ দুইটা ঘর ঠিক হয় |
| `const temp = s[i]` | বাম মান হারিয়ে না যায় তাই আগে রেখে দাও |
| `s[i] = s[n - 1 - i]` | ডান মান বামে |
| `s[n - 1 - i] = temp` | বাম মান (temp থেকে) ডানে |

**Sample:**
```
Input : s = ["h","e","l","l","o"]
Output: s = ["o","l","l","e","h"]

Input : s = ["H","a","n","n","a","h"]
Output: s = ["h","a","n","n","a","H"]
```

**Trace** (`["h","e","l","l","o"]`, n = 5, loop চলে `floor(5/2) = 2` বার):
| i | mirror (`n-1-i`) | swap | array |
|---|------------------|------|-------|
| 0 | 4 | h ↔ o | [**"o"**,"e","l","l",**"h"**] |
| 1 | 3 | e ↔ l | ["o",**"l"**,"l",**"e"**,"h"] |
| — | — | index 2 (মাঝ) নড়ে না | ["o","l","l","e","h"] |

**Edge cases:**
- Length 1 → loop 0 বার চলে, কিছু বদলায় না
- জোড় length (`n = 6`) → 3 টা swap, মাঝের element নেই
- বেজোড় length → মাঝের element নিজের জায়গায় থাকে

**সাধারণ ভুল (Common mistakes):**
- পুরো array (`i < n`) loop করা: দ্বিতীয় অর্ধেকে আবার swap হয়ে array আগের মতো হয়ে যায়
- `temp` ছাড়া `s[i] = s[n-1-i]; s[n-1-i] = s[i]` লেখা: বাম মান হারিয়ে যায়

**Alternative:** `let left = 0, right = n - 1; while (left < right) { swap; left++; right--; }`। একই logic, `n/2` formula মনে রাখতে হয় না, আর এটাই বেশিরভাগ two-pointer problem এ লাগে।

**Complexity:** Time O(n) | Space O(1)

**বাংলায় (`n/2` কেন):**
একটা swap এ দুইটা জায়গা ঠিক হয়ে যায় (বাম আর ডান)। তাই array এর অর্ধেক পর্যন্ত গেলেই পুরো array ঠিক হয়ে যায়। যদি পুরোটা loop করো, তাহলে দ্বিতীয় অর্ধেকে গিয়ে আবার একই জোড়া swap হবে, ফলে আগের কাজ উল্টে যাবে। বেজোড় সংখ্যায় মাঝের element নিজের জায়গাতেই থাকে, তাই সেটা swap করা লাগে না।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. Index `i` এর mirror কোনটা? *(উত্তর: `n - 1 - i`)*
2. পুরো array loop করলে কী হবে? *(উত্তর: সব swap দুইবার হয়ে array আগের মতো হয়ে যাবে)*

**Pattern to remember:** "Mirror index = `n - 1 - i`. Swap pairs until the middle."

**Related:** #88 (two pointers, কিন্তু একই দিকে পিছন থেকে), #125 (Valid Palindrome, swap এর বদলে তুলনা), #345 (Reverse Vowels)

---

# Section 3 — Two Pointers: Merge From the Right

---

## LeetCode #88 — Merge Sorted Array

> **এক লাইনে মনে রাখো:** খালি জায়গা শেষে, তাই পিছন থেকে ভরো। দুইজনের মধ্যে বড়টা `nums1[i]` এ, `p2 < 0` হলে থামো।

**সমস্যাটা সহজ ভাষায়:**
দুইটা sorted array আছে: `nums1` (প্রথম `m` টা আসল মান, পেছনে `n` টা `0` খালি জায়গা হিসেবে) আর `nums2` (`n` টা মান)। দুইটা মিলিয়ে একটা sorted array বানাতে হবে, `nums1` এর ভেতরেই। কিছু return করতে হয় না।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
দুইটা লাইনে খাটো থেকে লম্বা ছাত্র দাঁড়ানো। প্রথম লাইনের পেছনে খালি জায়গা আছে। দুই লাইনের সবচেয়ে লম্বা দুইজনকে (শেষের জন) তুলনা করো, যে বেশি লম্বা তাকে একদম শেষের খালি জায়গায় পাঠাও। এভাবে পেছন থেকে ভরলে কাউকে ধাক্কা দিয়ে সরাতে হয় না।

**Pattern:** Two Pointers / In-place merge / Merge from right to left

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "merge two sorted arrays in-place"
- `nums1` এর শেষে extra খালি জায়গা আছে (0 দিয়ে ভরা)

**Brute force:** `nums1` কপি করে সামনে থেকে merge করা → O(m) extra space। অথবা জোড়া লাগিয়ে sort করা → O((m+n) log(m+n))।

**Pointers:**
| Pointer | কাজ | কখন এগোয় (পিছনে) |
|---------|-----|-------------------|
| `p1 = m - 1` | `nums1` এর শেষ আসল element | `nums1[p1]` বসানো হলে |
| `p2 = n - 1` | `nums2` এর শেষ element | `nums2[p2]` বসানো হলে |
| `i = m + n - 1` | write: পরের বড় মান কোথায় বসবে | প্রতি step এ |

**Invariant:** `nums1[i+1 ... m+n-1]` এ সবসময় সবচেয়ে বড় মানগুলো চূড়ান্ত sorted order এ বসে আছে।

**Steps:**
1. `nums1[p1]` আর `nums2[p2]` তুলনা করো।
2. যেটা বড় সেটা `nums1[i]` এ বসাও।
3. যার মান বসালে তার pointer এক ঘর পিছাও।
4. `i--`।
5. `p2 < 0` হলে থামো।

**Template:** Merge template: দুইটা reader + একটা writer, প্রতি step এ "ভালো" টা বেছে লেখো। এখানে "ভালো" = বড়, আর দিক = ডান থেকে বাম। #912 এর merge এ "ভালো" = ছোট, দিক = বাম থেকে ডান।

**Solution:**
```javascript
var merge = function (nums1, m, nums2, n) {
    let p1 = m - 1;
    let p2 = n - 1;
    let i = m + n - 1;

    while (p2 >= 0) {
        if (p1 >= 0 && nums1[p1] > nums2[p2]) {
            nums1[i] = nums1[p1];
            p1--;
        } else {
            nums1[i] = nums2[p2];
            p2--;
        }
        i--;
    }
};
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `while (p2 >= 0)` | `nums2` তে কিছু বাকি থাকা পর্যন্ত চলবে |
| `p1 >= 0 && nums1[p1] > nums2[p2]` | `nums1` এ কিছু বাকি আছে এবং তার মান বড় |
| `nums1[i] = nums1[p1]; p1--` | `nums1` এর বড় মান পেছনে সরাও |
| `else ... nums2[p2]; p2--` | `nums2` এর মান বড় (বা সমান), অথবা `nums1` শেষ |
| `i--` | পরের খালি ঘর |

**Sample:**
```
Input : nums1 = [1,2,3,0,0,0], m = 3
        nums2 = [2,5,6],       n = 3
Output: nums1 = [1,2,2,3,5,6]

Input : nums1 = [0], m = 0, nums2 = [1], n = 1
Output: nums1 = [1]
```

**Trace** (শুরু `p1=2, p2=2, i=5`):
| step | nums1[p1] | nums2[p2] | বড় কোনটা | লেখা | p1 | p2 | i (পরে) | nums1 |
|------|-----------|-----------|-----------|------|----|----|---------|-------|
| 1 | 3 | 6 | nums2 | nums1[5]=6 | 2 | 1 | 4 | [1,2,3,0,0,**6**] |
| 2 | 3 | 5 | nums2 | nums1[4]=5 | 2 | 0 | 3 | [1,2,3,0,**5**,6] |
| 3 | 3 | 2 | nums1 | nums1[3]=3 | 1 | 0 | 2 | [1,2,3,**3**,5,6] |
| 4 | 2 | 2 | সমান → nums2 | nums1[2]=2 | 1 | -1 | 1 | [1,2,**2**,3,5,6] |

`p2 < 0` → থামো। `nums1[0..1] = [1,2]` আগে থেকেই ঠিক জায়গায়।

**Edge cases:**
- `n = 0` → loop চলে না, `nums1` একই থাকে
- `m = 0` → `p1 = -1`, সব মান `nums2` থেকে আসে (`p1 >= 0` check এটা সামলায়)
- `nums2` এর সব মান `nums1` এর চেয়ে ছোট → আগে `nums1` এর মানগুলো ডানে সরে, তারপর `nums2` সামনে ভরে

**সাধারণ ভুল (Common mistakes):**
- সামনে থেকে merge করা: `nums1` এর না পড়া মান overwrite হয়ে যায়
- `p1 >= 0` check ভুলে যাওয়া: `nums1[-1]` হলো `undefined`, তুলনা ভুল হয়
- `while (p1 >= 0 && p2 >= 0)` লিখে শেষে `nums2` এর বাকি অংশ কপি করতে ভুলে যাওয়া

**Alternative:** `nums1.splice(m, n, ...nums2); nums1.sort((a, b) => a - b)`। ছোট আর সহজ, কিন্তু O((m+n) log(m+n)), আর interviewer O(m+n) চায়।

**Complexity:** Time O(m + n) | Space O(1)

**বাংলায় (পিছন থেকে কেন, আর শুধু `p2` কেন):**
`nums1` এর শেষে খালি জায়গা আছে। সামনে থেকে merge করলে `nums1` এর যে element গুলো এখনো পড়া হয়নি সেগুলো overwrite হয়ে যেত। পিছন থেকে সবচেয়ে বড় element আগে বসালে খালি জায়গাতেই লেখা হয়, কোনো দরকারি মান নষ্ট হয় না। আর `p2 < 0` হলে `nums2` শেষ, `nums1` এর বাকি অংশ আগে থেকেই সঠিক জায়গায় আছে, তাই `p1` নিয়ে আলাদা loop লাগে না।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. Loop এর condition এ শুধু `p2 >= 0` কেন? *(উত্তর: `nums2` শেষ হলে `nums1` এর বাকি মান আগে থেকেই ঠিক জায়গায়)*
2. সামনে থেকে merge করলে কী সমস্যা? *(উত্তর: `nums1` এর না পড়া মান মুছে যায়)*

**Pattern to remember:** "SORTED + EMPTY SPACE AT END = MERGE FROM RIGHT."

**Related:** #912 (merge sort এর merge step, বাম থেকে ছোটটা), #344 (two pointers, দুই দিক থেকে), #21 (Merge Two Sorted Lists)

---

# Section 4 — One Pass / Greedy

---

## LeetCode #121 — Best Time to Buy and Sell Stock

> **এক লাইনে মনে রাখো:** এখন পর্যন্ত সবচেয়ে কম দাম (`lowest`) মনে রাখো। প্রতিদিন "আজ বেচলে লাভ কত" দেখো, সর্বোচ্চটা রাখো।

**সমস্যাটা সহজ ভাষায়:**
প্রতিদিনের stock এর দাম একটা array তে আছে। একবার কিনবে, একবার বেচবে, আর কেনা অবশ্যই বেচার আগে। সর্বোচ্চ কত লাভ করা যায় return করো। লাভ না হলে `0`।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
তুমি প্রতিদিন বাজারে যাও আর একটা খাতায় লিখে রাখো "এখন পর্যন্ত সবচেয়ে সস্তা দাম কত ছিল"। আজকের দাম দেখে হিসাব করো "সেই সস্তা দিনে কিনে আজ বেচলে কত লাভ"। সবচেয়ে বেশি লাভটা মনে রাখো।

**Pattern:** One pass / Minimum-so-far / Greedy

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "buy once, sell once", "buy before sell"
- একটা sequence এ "maximum profit / difference", যেখানে ছোটটা আগে আর বড়টা পরে আসতে হবে

**Brute force:** প্রতিটা জোড়া (কেনার দিন, বেচার দিন) চেষ্টা করা → O(n²)। আসলে প্রতিদিনের জন্য শুধু আগের সবচেয়ে কম দামটা জানলেই হয়।

**Variables:**
| Variable | মানে | কখন বদলায় |
|----------|------|-----------|
| `lowest` | এখন পর্যন্ত সবচেয়ে কম দাম | আজকের দাম আরও কম হলে |
| `profit` | এখন পর্যন্ত সর্বোচ্চ লাভ | আজ বেচলে লাভ বেশি হলে |

**Invariant:** দিন `i` তে `lowest` = দিন `0...i` এর সবচেয়ে কম দাম, আর `profit` = দিন `0...i` ব্যবহার করে সর্বোচ্চ লাভ।

**Steps:**
1. `lowest = prices[0]`, `profit = 0`।
2. দিন 1 থেকে প্রতিটা দামের জন্য:
   - `lowest` update (আজ সস্তা হলে)
   - আজকের লাভ = `price - lowest`
   - `profit` update (বেশি হলে)
3. `profit` return।

**Template:**
```javascript
let best = arr[0], ans = 0;
for (let i = 1; i < arr.length; i++) {
    best = UPDATE_BEST(best, arr[i]);       // এখন পর্যন্ত সেরা (min/max)
    ans = Math.max(ans, COMPARE(arr[i], best));
}
```
Problem অনুযায়ী বদলায়: কী "সেরা" ধরে রাখবে (min দাম, max sum ...) আর আজকের মানের সাথে কীভাবে তুলনা করবে।

**Solution:**
```javascript
var maxProfit = function (prices) {
    let lowest = prices[0];
    let profit = 0;

    for (let i = 1; i < prices.length; i++) {
        lowest = Math.min(lowest, prices[i]);
        profit = Math.max(profit, prices[i] - lowest);
    }

    return profit;
};
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `let lowest = prices[0]` | প্রথম দিনের দামই এখন পর্যন্ত সবচেয়ে কম |
| `let profit = 0` | লাভ না হলে উত্তর 0 |
| `lowest = Math.min(lowest, prices[i])` | সস্তা কেনার দিন update |
| `profit = Math.max(profit, prices[i] - lowest)` | আজ বেচলে লাভ, আগের সেরার সাথে তুলনা |

**Sample:**
```
Input : prices = [7,1,5,3,6,4]
Output: 5          (দিন 1 এ 1 টাকায় কেনো, দিন 4 এ 6 টাকায় বেচো)

Input : prices = [7,6,4,3,1]
Output: 0          (দাম শুধু কমে, লাভ নেই)
```

**Trace** (`prices = [7,1,5,3,6,4]`, শুরু `lowest=7, profit=0`):

| i | price | lowest | আজ বেচলে লাভ | profit |
|---|-------|--------|--------------|--------|
| 1 | 1 | 1 | 0 | 0 |
| 2 | 5 | 1 | 4 | 4 |
| 3 | 3 | 1 | 2 | 4 |
| 4 | 6 | 1 | 5 | **5** |
| 5 | 4 | 1 | 3 | 5 |

Answer = 5

**Edge cases:**
- একটা দাম → loop চলে না, 0
- দাম শুধু কমে → 0
- সবচেয়ে কম দাম শেষ দিনে → তারপর বেচার দিন নেই, formula নিজে থেকেই সামলায় (লাভ 0)

**সাধারণ ভুল (Common mistakes):**
- `max(prices) - min(prices)` করা: max যদি min এর আগে আসে তাহলে ভুল (বেচা কেনার আগে হয়ে যায়)
- `profit` কে `-Infinity` দিয়ে শুরু করা: লাভ না হলে উত্তর 0 হওয়ার কথা, negative না

**Alternative:** Kadane এর মতো করে: পরপর দুই দিনের দামের পার্থক্যের array তে maximum subarray sum। একই O(n), কিন্তু বোঝা কঠিন। এই problem এর জন্য min-so-far ই সবচেয়ে পরিষ্কার।

**Complexity:** Time O(n) | Space O(1)

**বাংলায় (greedy কেন কাজ করে):**
প্রতিটা দিনকে "বেচার দিন" ধরলে, সবচেয়ে ভালো লাভ পেতে হলে ওই দিনের আগের সবচেয়ে কম দামে কেনা উচিত। তাই আমাদের সব জোড়া মেলানো লাগে না, শুধু "এখন পর্যন্ত সবচেয়ে কম দাম" মনে রাখলেই হয়। আর `lowest` সবসময় আজ বা আগের দিনের, তাই "কেনা বেচার আগে" নিয়ম নিজে থেকেই মানা হয়।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. কেন `max - min` দিয়ে হয় না? *(উত্তর: max টা min এর আগের দিনে হতে পারে)*
2. প্রতিটা দিনে কোন দুইটা জিনিস update হয়? *(উত্তর: `lowest` আর `profit`)*

**Pattern to remember:** "Track the cheapest price so far, check today's profit against it, keep the max."

**Related:** #485 (একই রকম one pass, "এখন পর্যন্ত সেরা" ধরে রাখা), #122 (একাধিকবার কেনা বেচা), #53 (Maximum Subarray)

---

# Section 5 — Single Pass / Counting

---

## LeetCode #485 — Max Consecutive Ones

> **এক লাইনে মনে রাখো:** `1` পেলে `count++` আর `maxCount` update, `0` পেলে `count = 0`।

**সমস্যাটা সহজ ভাষায়:**
শুধু `0` আর `1` দিয়ে বানানো একটা array। পাশাপাশি (একটানা) সবচেয়ে বেশি কয়টা `1` আছে, সেটা return করো।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
প্রতিদিন gym এ গেলে `1`, না গেলে `0`। একটানা সবচেয়ে বেশি কত দিন গিয়েছ (streak)? একদিন মিস করলে streak আবার 0 থেকে শুরু, কিন্তু "সেরা streak" এর রেকর্ড থেকে যায়।

**Pattern:** Single pass / Streak counting

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "consecutive", "longest run / streak"
- binary array, সবচেয়ে লম্বা `1` এর block

**Brute force:** প্রতিটা index থেকে শুরু করে যতক্ষণ `1` ততক্ষণ গোনা → worst case O(n²)। একটা চলমান `count` দিয়ে এক pass এই হয়।

**Variables:**
| Variable | মানে | কখন বদলায় |
|----------|------|-----------|
| `count` | বর্তমান streak | `1` এ বাড়ে, `0` এ শূন্য |
| `maxCount` | এখন পর্যন্ত সবচেয়ে বড় streak | `count` এর চেয়ে ছোট হলে |

**Invariant:** `count` = index `i` তে শেষ হওয়া streak এর length, আর সবসময় `maxCount >= count`।

**Steps:**
1. `count = 0`, `maxCount = 0`।
2. প্রতিটা element:
   - `1` হলে: `count++`, তারপর `maxCount = max(maxCount, count)`
   - `0` হলে: `count = 0` (streak ভেঙে গেছে)
3. `maxCount` return।

**Template (streak counting):**
```javascript
let count = 0, best = 0;
for (const x of arr) {
    if (STREAK_CONDITION) {
        count++;
        best = Math.max(best, count);
    } else {
        count = 0;
    }
}
return best;
```
শুধু `STREAK_CONDITION` বদলায় (`x === 1`, `s[i] === s[i-1]`, `nums[i] > nums[i-1]` ...)।

**Solution:**
```javascript
var findMaxConsecutiveOnes = function (nums) {
    let count = 0;
    let maxCount = 0;

    for (let i = 0; i < nums.length; i++) {
        if (nums[i] === 1) {
            count++;
            maxCount = Math.max(maxCount, count);
        } else {
            count = 0;
        }
    }

    return maxCount;
};
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `if (nums[i] === 1)` | streak চলছে কিনা (**এই লাইনটা problem অনুযায়ী বদলায়**) |
| `count++` | streak এক বাড়লো |
| `maxCount = Math.max(maxCount, count)` | রেকর্ড ভাঙলো কিনা, সাথে সাথে দেখো |
| `count = 0` | streak ভেঙেছে, আবার শূন্য থেকে |

**Sample:**
```
Input : nums = [1,1,0,1,1,1]
Output: 3

Input : nums = [1,0,1,1,0,1]
Output: 2
```

**Trace** (`[1,1,0,1,1,1]`):

| i | nums[i] | count | maxCount |
|---|---------|-------|----------|
| 0 | 1 | 1 | 1 |
| 1 | 1 | 2 | 2 |
| 2 | 0 | 0 (reset) | 2 |
| 3 | 1 | 1 | 2 |
| 4 | 1 | 2 | 2 |
| 5 | 1 | 3 | **3** |

**Edge cases:**
- সব `0` → 0
- সব `1` → n
- সবচেয়ে বড় streak একদম শেষে → সমস্যা নেই, কারণ `maxCount` loop এর ভেতরেই update হয়, শুধু reset এর সময় না

**সাধারণ ভুল (Common mistakes):**
- শুধু `0` পেলে `maxCount` update করা: শেষের streak মিস হয় (`[1,1,0,1,1,1]` এ 2 আসবে, 3 না)
- `0` পেলে `count` reset করতে ভুলে যাওয়া: তাহলে মোট `1` এর সংখ্যা আসে, streak না

**Alternative:** `nums.join('').split('0')` করে সবচেয়ে লম্বা টুকরার length। ছোট code, কিন্তু string বানায় → O(n) extra space।

**Complexity:** Time O(n) | Space O(1)

**বাংলায় (`maxCount` কখন update করব):**
`count` হলো বর্তমান streak, আর `maxCount` হলো এখন পর্যন্ত সবচেয়ে বড় streak। `0` পেলে `count` শূন্য হয়ে যায়, কিন্তু `maxCount` একই থাকে। প্রতিবার `count` বাড়ার সাথে সাথে `maxCount` update করলে শেষের streak ও মিস হয় না।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. `0` পেলে কোন variable বদলায়, কোনটা বদলায় না? *(উত্তর: `count` শূন্য হয়, `maxCount` থাকে)*
2. শুধু reset এর সময় `maxCount` update করলে কোন case ভুল হবে? *(উত্তর: শেষে `1` দিয়ে শেষ হওয়া array)*

**Pattern to remember:** "Count the current streak, reset when it breaks, keep the maximum."

**Related:** #121 (একই রকম one pass, "এখন পর্যন্ত সেরা" ধরে রাখা), #1446 (Consecutive Characters), #1004 (Max Consecutive Ones III)

---

# Section 6 — Math: Sum Formula

---

## LeetCode #268 — Missing Number

> **এক লাইনে মনে রাখো:** যা হওয়ার কথা (`n * (n + 1) / 2`) − যা আছে (array এর যোগফল) = হারানো সংখ্যা।

**সমস্যাটা সহজ ভাষায়:**
Array তে `n` টা আলাদা সংখ্যা আছে, সবগুলো `0` থেকে `n` এর মধ্যে। `0...n` এ মোট `n + 1` টা সংখ্যা, তাই ঠিক একটা নেই। সেই হারানো সংখ্যাটা return করো।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
ক্লাসে roll `0` থেকে `n` পর্যন্ত, একজন অনুপস্থিত। সবার roll যোগ করলে কত হওয়ার কথা তুমি formula দিয়ে জানো। যারা আছে তাদের roll যোগ করো। যতটুকু কম পড়লো, সেটাই অনুপস্থিত ছাত্রের roll।

**Pattern:** Math / Sum formula (expected sum − actual sum)

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- `[0, n]` (বা `[1, n]`) range থেকে নেওয়া `n` টা আলাদা সংখ্যা, ঠিক একটা নেই
- "find the missing number"

**Brute force:**
- Sort করে প্রথম যে index এ `nums[i] !== i` সেটা খোঁজা → O(n log n)
- সব `Set` এ রেখে `0...n` check করা → O(n) extra space

**Variables:**
| Variable | মানে |
|----------|------|
| `n` | array এর length (আর সবচেয়ে বড় সম্ভাব্য সংখ্যা) |
| `sum` | `0...n` এর যোগফল যা হওয়ার কথা: `n * (n + 1) / 2` |
| `sumWithMissingNum` | array এর আসল যোগফল (একটা সংখ্যা কম) |

**Invariant:** `sum − sumWithMissingNum` = `0...n` থেকে যে একটা মান সরানো হয়েছে।

**Steps:**
1. Formula দিয়ে expected sum বের করো: `n * (n + 1) / 2`।
2. Loop করে array এর সব element যোগ করো।
3. Expected − actual return করো।

**Template:**
```javascript
const expected = n * (n + 1) / 2;
let actual = 0;
for (const x of nums) actual += x;
return expected - actual;
```
Range `1...n` হলে formula বদলাবে (length তখন `n - 1`), বাকি একই।

**Solution:**
```javascript
var missingNumber = function (nums) {
    const n = nums.length;
    const sum = n * (n + 1) / 2;
    let sumWithMissingNum = 0;

    for (let i = 0; i < n; i++) {
        sumWithMissingNum = sumWithMissingNum + nums[i]
    }

    return sum - sumWithMissingNum;
};
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `const n = nums.length` | `n` টা সংখ্যা আছে, তাই range `0...n` |
| `const sum = n * (n + 1) / 2` | `0 + 1 + ... + n` এর formula |
| `sumWithMissingNum = sumWithMissingNum + nums[i]` | আসলে যা আছে তার যোগফল |
| `return sum - sumWithMissingNum` | পার্থক্য = হারানো সংখ্যা |

**Sample:**
```
Input : nums = [3,0,1]
Output: 2          (n=3, expected 6, actual 4, 6-4 = 2)

Input : nums = [0,1]
Output: 2          (n=2, expected 3, actual 1, 3-1 = 2)

Input : nums = [9,6,4,2,3,5,7,0,1]
Output: 8          (n=9, expected 45, actual 37, 45-37 = 8)
```

**Trace** (`[3,0,1]`):
| step | কাজ | মান |
|------|-----|-----|
| 1 | `n = nums.length` | 3 |
| 2 | `sum = 3 * 4 / 2` | 6 |
| 3 | যোগ `+3` | 3 |
| 4 | যোগ `+0` | 3 |
| 5 | যোগ `+1` | 4 |
| 6 | `6 - 4` | **2** |

**Edge cases:**
- `[0]` → n=1, expected 1, actual 0 → 1
- `[1]` → n=1, expected 1, actual 1 → 0
- হারানো সংখ্যা `n` নিজেও হতে পারে (`[0,1]` → 2), তাই range `0...n`, `0...n-1` না
- JS এ LeetCode এর limit (n ≤ 10⁴) এ overflow হয় না, কিন্তু 32-bit int এর ভাষায় অনেক বড় `n` এ হতে পারে

**সাধারণ ভুল (Common mistakes):**
- `n` এর বদলে `n - 1` দিয়ে formula লেখা: range `0...n`, শেষ সংখ্যা `n`
- ধরে নেওয়া যে array sorted: sorted না, তাই index দিয়ে সরাসরি খোঁজা যায় না

**Alternative (XOR, overflow এর ভয় নেই):**
```javascript
var missingNumber = function (nums) {
    let xor = nums.length;
    for (let i = 0; i < nums.length; i++) {
        xor ^= i ^ nums[i];
    }
    return xor;
};
```
`0...n` এর প্রতিটা সংখ্যা দুইবার আসে (একবার index হিসেবে, একবার value হিসেবে), শুধু হারানোটা একবার। জোড়াগুলো কেটে যায়, হারানোটা থেকে যায়।

**Complexity:** Time O(n) | Space O(1)

**বাংলায় (formula কেন কাজ করে):**
`0` থেকে `n` পর্যন্ত সব সংখ্যা থাকলে তাদের যোগফল হতো `n * (n + 1) / 2`। কিন্তু একটা সংখ্যা নেই, তাই আসল যোগফল ঠিক ততটাই কম। এই পার্থক্যটাই হলো হারানো সংখ্যা। যেমন `[3,0,1]` এ হওয়ার কথা ছিল `6`, আছে `4`, তাই `6 − 4 = 2` হারিয়েছে।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. `0...n` এর যোগফলের formula কী? *(উত্তর: `n * (n + 1) / 2`)*
2. XOR version এ `xor` কে `nums.length` দিয়ে শুরু করি কেন? *(উত্তর: index শুধু `0...n-1` পর্যন্ত যায়, `n` টা আলাদা করে যোগ করতে হয়)*

**Pattern to remember:** "Expected sum from the formula minus the actual sum gives the missing number."

**Related:** #136 (XOR দিয়ে জোড়া কাটা), #448 (Find All Numbers Disappeared in an Array), #41 (First Missing Positive)

---

# Section 7 — Hash Map: Frequency Counting

---

## LeetCode #136 — Single Number

> **এক লাইনে মনে রাখো:** তোমার উপায়: hash map এ গুনে count `1` খোঁজো। ভালো উপায়: সব XOR করো, জোড়া কেটে একা টা থাকে।

**সমস্যাটা সহজ ভাষায়:**
Array তে প্রতিটা সংখ্যা দুইবার করে আছে, শুধু একটা সংখ্যা একবার। সেই একা সংখ্যাটা return করো। শর্ত: O(n) time আর O(1) extra space।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
একটা ঝুড়িতে মোজা জোড়ায় জোড়ায় আছে, একটা মোজার জোড়া হারিয়ে গেছে। Hash map উপায়: প্রতিটা রঙের মোজা গুনে দেখো কোনটা 1 টা। XOR উপায়: একই রঙের দুইটা মোজা পেলেই দুইটাই ফেলে দাও, শেষে যেটা হাতে থাকে সেটাই উত্তর।

**Pattern:** Hash map frequency count (two passes)। Optimal alternative: XOR।

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "every element appears twice except one"
- "find the element that appears once"
- frequency বা "কতবার আছে" জাতীয় প্রশ্ন → hash map
- "twice" + "O(1) extra space" → XOR

**Brute force:** প্রতিটা element এর জন্য বাকি array scan করে গোনা → O(n²)।

**Variables:**
| Variable | মানে |
|----------|------|
| `hash` | object: `সংখ্যা → কতবার এসেছে` |

**Invariant:** Pass 1 শেষে `hash[x]` = array তে `x` ঠিক কতবার আছে।

**Steps:**
1. **Pass 1 (গোনা):** প্রতিটা সংখ্যা `hash` এ না থাকলে 1 বসাও, থাকলে বাড়াও।
2. **Pass 2 (খোঁজা):** আবার array ঘোরো, যার count `1` সেটা return।

**Template (frequency map):**
```javascript
const freq = {};
for (const x of arr) freq[x] = (freq[x] || 0) + 1;   // pass 1: count
for (const x of arr) if (freq[x] === 1) return x;     // pass 2: look up
```
Pass 2 এর condition বদলায় (`=== 1`, `> 1`, `> n/2` ...)।

**Solution:**
```javascript
var singleNumber = function (nums) {
    let hash = {}

    for (let i = 0; i < nums.length; i++) {
        if (!hash[nums[i]]) {
            hash[nums[i]] = 1;
        } else {
            hash[nums[i]]++;
        }
    }

    for (let i = 0; i < nums.length; i++) {
        if (hash[nums[i]] === 1) {
            return nums[i];
        }
    }

};
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `let hash = {}` | খালি গোনার খাতা |
| `if (!hash[nums[i]]) hash[nums[i]] = 1` | প্রথমবার দেখা, count 1 |
| `else hash[nums[i]]++` | আগে দেখা, count বাড়াও |
| `if (hash[nums[i]] === 1) return nums[i]` | যার count 1, সেই উত্তর (**এই condition problem অনুযায়ী বদলায়**) |

**Sample:**
```
Input : nums = [2,2,1]
Output: 1

Input : nums = [4,1,2,1,2]
Output: 4

Input : nums = [1]
Output: 1
```

**Trace** (`[4,1,2,1,2]`):

Pass 1 (গোনা):

| i | nums[i] | hash |
|---|---------|------|
| 0 | 4 | {4:1} |
| 1 | 1 | {4:1, 1:1} |
| 2 | 2 | {4:1, 1:1, 2:1} |
| 3 | 1 | {4:1, 1:2, 2:1} |
| 4 | 2 | {4:1, 1:2, 2:2} |

Pass 2 (খোঁজা): i=0, `hash[4] === 1` → return **4**

**Edge cases:**
- একটা element → সেটাই উত্তর
- Negative সংখ্যা কাজ করে, কারণ object key string হয়ে যায় (`"-3"`)
- `!hash[x]` এখানে নিরাপদ, কারণ count 1 থেকে শুরু হয় (truthy), কখনো 0 হয় না

**সাধারণ ভুল (Common mistakes):**
- Hash map দিয়ে শেষ করে দেওয়া: problem O(1) extra space চায়, hash map O(n) নেয়
- XOR এ `result` কে `0` এর বদলে `nums[0]` দিয়ে শুরু করে আবার index 0 থেকে loop করা: `nums[0]` দুইবার XOR হয়ে কেটে যায়

**Alternative (XOR, interviewer যেটা চায়):**
```javascript
var singleNumber = function (nums) {
    let result = 0;
    for (let i = 0; i < nums.length; i++) {
        result ^= nums[i];
    }
    return result;
};
```
`[4,1,2,1,2]` এর trace:
| step | result ^ nums[i] | result |
|------|------------------|--------|
| 1 | 0 ^ 4 | 4 |
| 2 | 4 ^ 1 | 5 |
| 3 | 5 ^ 2 | 7 |
| 4 | 7 ^ 1 | 6 |
| 5 | 6 ^ 2 | **4** |

**Complexity:**
- Hash map (তোমার): Time O(n) | Space **O(n)**
- XOR: Time O(n) | Space **O(1)**

Problem টা linear time আর **constant extra space** চায়। Hash map solution সঠিক কিন্তু O(n) space নেয়, তাই interview তে আগে hash map এর idea বলো, তারপর XOR এ উন্নত করো।

**বাংলায় (XOR কেন কাজ করে):**
XOR এর দুইটা নিয়ম মনে রাখো: `a ^ a = 0` (একই সংখ্যা দুইবার XOR করলে শূন্য) আর `a ^ 0 = a` (শূন্যের সাথে XOR করলে সংখ্যাটাই থাকে)। সব সংখ্যা XOR করলে যেগুলো দুইবার আছে সেগুলো একে অপরকে কেটে শূন্য হয়ে যায়, আর শুধু যেটা একবার আছে সেটা বাকি থাকে। XOR এর ক্রম বদলালেও ফল একই থাকে, তাই জোড়াগুলো পাশাপাশি না থাকলেও কাজ করে।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. XOR এর কোন দুইটা নিয়ম এখানে কাজে লাগে? *(উত্তর: `a ^ a = 0`, `a ^ 0 = a`)*
2. তোমার solution problem এর কোন শর্ত মানে না? *(উত্তর: O(1) extra space)*

**Pattern to remember:** "Count with a hash map, then find the count of 1. Better: XOR cancels pairs, so only the single number survives."

**Related:** #268 (XOR version), #137 (Single Number II), #260 (Single Number III), #217 (Contains Duplicate), #387 (First Unique Character)

---

# Section 8 — Recursion

---

## LeetCode #231 — Power of Two

> **এক লাইনে মনে রাখো:** বারবার 2 দিয়ে ভাগ করো। `1` এ পৌঁছালে true, বিজোড় বা `1` এর নিচে গেলে false।

**সমস্যাটা সহজ ভাষায়:**
একটা integer `n` দেওয়া আছে। `n` কি `2` এর কোনো power (`1, 2, 4, 8, 16, ...`)? হ্যাঁ হলে `true`, না হলে `false`।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
একটা চকলেট বার বারবার সমান দুই ভাগ করছো। যদি প্রতিবার ঠিক সমান ভাগ হয় আর শেষে ঠিক 1 টা টুকরা থাকে, তাহলে এটা 2 এর power। কোনো ধাপে সমান ভাগ না হলে (বিজোড়), তাহলে না।

**Pattern:** Recursion (halving)। Optimal alternative: Bit trick।

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "is `n` a power of two / three / four?"
- যে সংখ্যা বারবার একই সংখ্যা দিয়ে ভাগ করা যায়

**Brute force:** `1, 2, 4, 8, ...` বানাতে থাকা যতক্ষণ না `n` এ পৌঁছায় বা পার হয় → O(log n)। নিচের recursion একই idea, শুধু উল্টো দিক থেকে (`n` কে ভাগ করে নামানো)।

**Base cases:**
| Condition | উত্তর | কেন |
|-----------|-------|-----|
| `n === 1` | `true` | `2⁰ = 1` |
| `n < 1` | `false` | 0 আর negative কখনো 2 এর power না |
| `n % 2 !== 0` | `false` | বিজোড় আর `1` না |

**Recursive step:** `isPowerOfTwo(n / 2)`

**Invariant:** প্রতিটা call এ `n` = আসল সংখ্যা ÷ `2^(এখন পর্যন্ত call সংখ্যা)`, আর এটা এখনো পূর্ণ সংখ্যা।

**Steps:**
1. `n === 1` হলে `true`।
2. `n < 1` বা `n` বিজোড় হলে `false`।
3. না হলে `n / 2` দিয়ে একই প্রশ্ন আবার করো।

**Template:** Recursion template (cheat sheet এ)। এখানে base case = `1`, shrink = `n / 2`। Power of Three / Four এ শুধু `2` এর জায়গায় `3` / `4` বসবে।

**Solution:**
```javascript
var isPowerOfTwo = function (n) {
    if (n === 1) return true;
    else if (n < 1 || (n % 2 !== 0)) return false;
    return isPowerOfTwo(n / 2);
};
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `if (n === 1) return true` | ভাগ করতে করতে 1 এ পৌঁছেছি, তাই হ্যাঁ (**সবার আগে check করতে হবে**) |
| `n < 1` | 0 বা negative, কখনো হবে না (এটা না থাকলে 0 তে অসীম recursion) |
| `n % 2 !== 0` | বিজোড়, সমান দুই ভাগ হয় না |
| `return isPowerOfTwo(n / 2)` | অর্ধেক করে আবার একই প্রশ্ন |

**Sample:**
```
Input : n = 1    Output: true     (2^0)
Input : n = 16   Output: true     (2^4)
Input : n = 3    Output: false
Input : n = 6    Output: false    (6 → 3, তারপর 3 বিজোড়)
Input : n = 0    Output: false
Input : n = -16  Output: false
```

**Trace:**
| call | n | কোন check মিললো | ফল |
|------|---|-----------------|-----|
| 1 | 16 | কোনোটা না → `n / 2` | → |
| 2 | 8 | কোনোটা না → `n / 2` | → |
| 3 | 4 | কোনোটা না → `n / 2` | → |
| 4 | 2 | কোনোটা না → `n / 2` | → |
| 5 | 1 | `n === 1` | **true** |

```
n = 6:   6 → 3   → 3 বিজোড় আর ≠ 1 → false
```

**Edge cases:**
- `n = 1` → true (**সবার আগে** check করতে হবে)
- `n = 0` → false। `n < 1` check না থাকলে `0 / 2 = 0`, অসীম recursion
- Negative → false
- Check এর order গুরুত্বপূর্ণ: `1` বিজোড়, তাই বিজোড় check এর আগে `n === 1` না দেখলে ভুল উত্তর আসবে

**সাধারণ ভুল (Common mistakes):**
- বিজোড় check আগে, `n === 1` পরে লেখা: `1` এর জন্য `false` আসে
- `n <= 0` check ভুলে যাওয়া: `n = 0` তে stack overflow

**Alternative (bit trick, O(1)):**
```javascript
var isPowerOfTwo = function (n) {
    return n > 0 && (n & (n - 1)) === 0;
};
```
```
n = 8:   1000       n = 6:   110
n-1 = 7: 0111       n-1 = 5: 101
AND    = 0000 → true      AND = 100 → false
```

**Complexity:**
- Recursion (তোমার): Time O(log n) | Space O(log n) (call stack)
- Bit trick: Time O(1) | Space O(1)

**বাংলায় (bit trick কেন কাজ করে):**
2 এর power এর binary তে ঠিক একটাই `1` থাকে (যেমন `8 = 1000`)। তার থেকে `1` কমালে ওই `1` টা `0` হয়ে যায়, আর তার ডানের সব `0` গুলো `1` হয়ে যায় (`7 = 0111`)। তাই দুটোকে `&` করলে সব বিট `0` হয়ে যায়। আর যদি একাধিক `1` থাকে (যেমন `6 = 110`), তাহলে উপরের `1` টা থেকে যায় এবং ফল `0` হয় না।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. তিনটা base case কী কী, আর কোনটা সবার আগে? *(উত্তর: `n === 1` → true আগে, তারপর `n < 1` আর বিজোড় → false)*
2. 2 এর power এর binary তে কয়টা `1` থাকে? *(উত্তর: ঠিক একটা)*

**Pattern to remember:** "Keep halving. If it hits 1, yes. If it turns odd or drops below 1, no."

**Related:** #509 (আরেকটা recursion, base case + ছোট input), #326 (Power of Three), #342 (Power of Four), #191 (Number of 1 Bits)

---

## LeetCode #509 — Fibonacci Number

> **এক লাইনে মনে রাখো:** `n <= 1` হলে `n`, না হলে আগের দুইটার যোগফল। একই হিসাব বারবার হয়, তাই memo বা loop দিয়ে বাঁচাও।

**সমস্যাটা সহজ ভাষায়:**
Fibonacci sequence: `0, 1, 1, 2, 3, 5, 8, ...`। প্রথম দুইটা `F(0) = 0`, `F(1) = 1`, তারপর প্রতিটা = আগের দুইটার যোগফল। `n` দেওয়া আছে, `F(n)` return করো।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
সিঁড়িতে প্রতিবার 1 বা 2 ধাপ উঠতে পারো। `n` তম ধাপে পৌঁছানোর উপায় = (`n-1` থেকে 1 ধাপে আসার উপায়) + (`n-2` থেকে 2 ধাপে আসার উপায়)। এটাই Fibonacci (#70 Climbing Stairs)।

**Pattern:** Tree recursion → Memoization / Iterative DP

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "each value is the sum of the previous two"
- নিজের ছোট version দিয়ে সংজ্ঞায়িত formula: `F(n) = F(n-1) + F(n-2)`
- "how many ways" + প্রতি step এ কয়েকটা choice → প্রায়ই Fibonacci-style DP

**Brute force:** নিচের recursive solution টাই সংজ্ঞার সরাসরি রূপ। সঠিক, কিন্তু ধীর (একই subproblem বারবার হিসাব করে)।

**Base cases:**
| Condition | উত্তর |
|-----------|-------|
| `n <= 1` | `n` (`F(0) = 0`, `F(1) = 1`) |

**Recursive step:** `fib(n - 1) + fib(n - 2)`

**Invariant:** `n` এর চেয়ে ছোট যেকোনো `k` এর জন্য `fib(k)` সঠিক Fibonacci মান দেয়, তাই দুইটা ছোট উত্তর যোগ করলে বড়টা পাওয়া যায়।

**Steps:**
1. `n <= 1` হলে `n` return।
2. না হলে `fib(n - 1) + fib(n - 2)` return।

**Template:** Recursion template (cheat sheet এ)। DP তে রূপান্তর: (1) recursion লেখো → (2) একই call বারবার হলে `memo` তে রাখো → (3) ছোট থেকে বড় loop এ বানাও, শুধু দরকারি শেষ কয়টা মান রাখো।

**Solution (Python):**
```python
class Solution:
    def fib(self, n: int) -> int:
        if n <= 1:
            return n
        return self.fib(n -1) + self.fib(n -2)
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `if n <= 1: return n` | base case: `F(0) = 0`, `F(1) = 1` |
| `return self.fib(n -1) + self.fib(n -2)` | আগের দুইটা Fibonacci যোগ করো (দুইটা call → tree এর মতো ছড়ায়) |

**Sample:**
```
Input : n = 2    Output: 1     (1 + 0)
Input : n = 3    Output: 2     (1 + 1)
Input : n = 4    Output: 3     (2 + 1)
Input : n = 10   Output: 55
```

**Trace** (`fib(4)` recursion tree):
```
                  fib(4)
                /        \
           fib(3)         fib(2)
          /      \        /     \
      fib(2)   fib(1)  fib(1)  fib(0)
      /    \
  fib(1)  fib(0)

Leaves:  fib(1)=1, fib(0)=0
fib(2) = 1 + 0 = 1
fib(3) = fib(2) + fib(1) = 1 + 1 = 2
fib(4) = fib(3) + fib(2) = 2 + 1 = 3
```
খেয়াল করো `fib(2)` **দুইবার** হিসাব হয়েছে। এই পুনরাবৃত্তিই ধীর হওয়ার কারণ।

**Edge cases:**
- `n = 0` → 0
- `n = 1` → 1
- Constraint `0 ≤ n ≤ 30`, তাই সাধারণ recursion pass করে, কিন্তু `n = 50` এর মতো মানে খুব ধীর হবে

**সাধারণ ভুল (Common mistakes):**
- Base case শুধু `n == 1` রাখা: `fib(0)` থেকে `fib(-1)`, `fib(-2)` ... অসীম recursion
- Memo dictionary কে function এর ভেতরে প্রতি call এ নতুন করে বানানো: তাহলে memo কোনো কাজে আসে না

**Alternative 1 — Memoization (top-down):**
```python
class Solution:
    def fib(self, n: int) -> int:
        memo = {}
        def helper(k):
            if k <= 1:
                return k
            if k in memo:
                return memo[k]
            memo[k] = helper(k - 1) + helper(k - 2)
            return memo[k]
        return helper(n)
```
Time O(n) | Space O(n)

**Alternative 2 — Iterative (bottom-up, সবচেয়ে ভালো):**
```python
class Solution:
    def fib(self, n: int) -> int:
        if n <= 1:
            return n
        prev, curr = 0, 1
        for _ in range(2, n + 1):
            prev, curr = curr, prev + curr
        return curr
```
`n = 5` এর trace:
| step | prev | curr |
|------|------|------|
| শুরু | 0 | 1 |
| 2 | 1 | 1 |
| 3 | 1 | 2 |
| 4 | 2 | 3 |
| 5 | 3 | **5** |

Time O(n) | Space O(1)

**Complexity:**

| Version | Time | Space |
|---------|------|-------|
| সাধারণ recursion (তোমার) | O(2ⁿ) | O(n) call stack |
| Memoization | O(n) | O(n) |
| Iterative | O(n) | O(1) |

**বাংলায় (recursion ধীর কেন):**
`fib(4)` বের করতে `fib(3)` আর `fib(2)` লাগে, আবার `fib(3)` বের করতে নতুন করে `fib(2)` লাগে। অর্থাৎ একই হিসাব বারবার হয়, আর `n` বাড়লে call সংখ্যা প্রায় দ্বিগুণ হারে বাড়ে (তাই O(2ⁿ))। Memoization এ একবার হিসাব করা উত্তর `memo` তে রেখে পরেরবার সরাসরি নেওয়া হয়। Iterative এ শুধু শেষ দুইটা মান (`prev`, `curr`) মনে রাখলেই চলে, তাই extra জায়গা লাগে না।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. Recursion O(2ⁿ) কেন? *(উত্তর: প্রতিটা call দুইটা call করে, আর একই subproblem বারবার হয়)*
2. Iterative version এ কয়টা variable লাগে? *(উত্তর: দুইটা, `prev` আর `curr`)*

**Pattern to remember:** "Base cases `0` and `1`, then add the previous two. If the same subproblem repeats, save it (memoize) or build upward."

**Related:** #231 (আরেকটা recursion), #70 (Climbing Stairs), #1137 (N-th Tribonacci Number), #746 (Min Cost Climbing Stairs), #198 (House Robber)

---

# Section 9 — Binary Search

---

## LeetCode #704 — Binary Search

> **এক লাইনে মনে রাখো:** মাঝখানে দেখো। বড় হলে `right = mid - 1`, ছোট হলে `left = mid + 1`। `left <= right` পর্যন্ত চলবে।

**সমস্যাটা সহজ ভাষায়:**
একটা sorted (ছোট থেকে বড়) array আর একটা `target` দেওয়া আছে। `target` কোন index এ আছে return করো, না থাকলে `-1`। O(log n) এ করতে হবে।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
অভিধানে একটা শব্দ খুঁজছো। মাঝখান থেকে খোলো। তোমার শব্দ যদি এই পাতার আগে আসে, ডান অর্ধেক পুরোটা বাদ, বাম অর্ধেকের মাঝখান খোলো। প্রতিবার অর্ধেক বাদ দিতে দিতে শব্দটা পেয়ে যাবে।

**Pattern:** Binary search (search range অর্ধেক করা)

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "sorted array"
- "O(log n) runtime"
- "find the position of a target" / "first / last position" / "smallest value that works"

**Brute force:** বাম থেকে ডানে একটা একটা দেখা → O(n)। Sorted বলে প্রতি তুলনায় অর্ধেক array বাদ দেওয়া যায়।

**Pointers:**
| Pointer | কাজ | কখন বদলায় |
|---------|-----|-----------|
| `left_pointer` | যে range এ target থাকতে পারে তার শুরু | `nums[middle] < target` হলে `middle + 1` |
| `right_pointer` | সেই range এর শেষ | `nums[middle] > target` হলে `middle - 1` |
| `middle` | এখন যে element দেখছি | প্রতি step এ নতুন করে হিসাব |

**Invariant:** Target যদি থাকে, তাহলে সবসময় `nums[left ... right]` এর ভেতরে আছে।

**Steps:**
1. `left = 0`, `right = n - 1`।
2. যতক্ষণ `left <= right`, `middle` বের করো।
3. `nums[middle] == target` → `middle` return।
4. `nums[middle] > target` → target বামে, `right = middle - 1`।
5. না হলে → target ডানে, `left = middle + 1`।
6. Loop শেষ হলে `-1`।

**Template:** Cheat sheet এর "Binary Search Template"। শুধু তুলনাটা problem অনুযায়ী বদলায় ("এই version কি bad?", "`mid * mid > x`?")।

**Solution (Python):**
```python
class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left_pointer = 0
        right_pointer = len(nums) - 1

        while left_pointer <= right_pointer:
            middle = (right_pointer + left_pointer) // 2
            if nums[middle] == target:
                return middle
            elif nums[middle] > target:
                right_pointer = middle - 1
            else:
                left_pointer = middle + 1

        return -1
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `while left_pointer <= right_pointer` | range এ অন্তত একটা element বাকি (`=` দরকার, শেষ একটাও check করতে হবে) |
| `middle = (right_pointer + left_pointer) // 2` | range এর মাঝখান |
| `if nums[middle] == target: return middle` | পেয়ে গেছি |
| `elif nums[middle] > target: right_pointer = middle - 1` | মাঝেরটা বড়, তাই ডান অর্ধেক (মাঝসহ) বাদ |
| `else: left_pointer = middle + 1` | মাঝেরটা ছোট, তাই বাম অর্ধেক (মাঝসহ) বাদ |
| `return -1` | range খালি, target নেই |

**Sample:**
```
Input : nums = [-1,0,3,5,9,12], target = 9
Output: 4

Input : nums = [-1,0,3,5,9,12], target = 2
Output: -1
```

**Trace** (`target = 9`):

| step | left | right | middle | nums[middle] | decision |
|------|------|-------|--------|--------------|----------|
| 1 | 0 | 5 | 2 | 3 | 3 < 9 → `left = 3` |
| 2 | 3 | 5 | 4 | 9 | পেয়েছি → return **4** |

**Trace** (`target = 2`, পাওয়া যায় না):

| step | left | right | middle | nums[middle] | decision |
|------|------|-------|--------|--------------|----------|
| 1 | 0 | 5 | 2 | 3 | 3 > 2 → `right = 1` |
| 2 | 0 | 1 | 0 | -1 | -1 < 2 → `left = 1` |
| 3 | 1 | 1 | 1 | 0 | 0 < 2 → `left = 2` |
| 4 | 2 | 1 | — | — | `left > right` → loop শেষ → return **-1** |

**Edge cases:**
- Empty array → `right = -1`, loop চলে না → `-1`
- একটা element → `left == right`, তাই `left <= right` এ `=` না থাকলে সেটা check হবে না
- Target সবার চেয়ে ছোট বা সবার চেয়ে বড় → `-1`
- Overflow: Python এ `(left + right) // 2` ঠিক আছে। Java/C++ এ `left + (right - left) / 2` লিখতে হয়

**সাধারণ ভুল (Common mistakes):**
- `while left < right` লেখা (`=` বাদ): শেষ একটা element check হয় না
- `right = middle` বা `left = middle` লেখা (`± 1` বাদ): range ছোট না হয়ে অসীম loop হতে পারে
- Unsorted array তে binary search চালানো

**Alternative:** Recursive binary search (একই logic, `left` আর `right` argument হিসেবে পাঠানো)। O(log n) stack space নেয়, তাই iterative version ভালো।

**Complexity:** Time O(log n) | Space O(1)

**বাংলায় (binary search কেন কাজ করে):**
Array sorted থাকলে মাঝের element দেখেই বোঝা যায় target কোন দিকে আছে। মাঝের মান target এর চেয়ে বড় হলে target বামে, ছোট হলে ডানে। তাই প্রতিবার অর্ধেক array বাদ দেওয়া যায়, আর `n` থেকে `1` এ নামতে `log₂ n` ধাপ লাগে (যেমন 1000 টা element এ মাত্র প্রায় 10 ধাপ)। `left <= right` এ `=` রাখতে হয় কারণ শেষ একটা element বাকি থাকলেও সেটা check করতে হবে।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. Loop condition এ `<=` কেন, `<` না? *(উত্তর: `left == right` হলে একটা element বাকি, সেটাও check করতে হবে)*
2. `middle ± 1` কেন, শুধু `middle` না? *(উত্তর: `middle` আগেই check হয়েছে, আর `± 1` না দিলে range ছোট না হয়ে অসীম loop হতে পারে)*

**Pattern to remember:** "Look at the middle, throw away the half that cannot contain the answer, repeat until the range is empty."

**Related:** #35 (Search Insert Position), #278 (First Bad Version), #34 (First and Last Position), #69 (Sqrt(x)), #33 (Search in Rotated Sorted Array)

---

# Section 10 — Divide and Conquer (Sorting)

---

## LeetCode #912 — Sort an Array

> **এক লাইনে মনে রাখো:** অর্ধেক করো → দুই অর্ধেক আলাদা sort করো (recursion) → দুই sorted অর্ধেক merge করো।

**সমস্যাটা সহজ ভাষায়:**
একটা integer array কে ছোট থেকে বড় order এ sort করে return করো। Built-in sort ছাড়া, O(n log n) time এ।

**বাস্তব উদাহরণ (মনে রাখার জন্য):**
শিক্ষকের কাছে 100 টা খাতা roll অনুযায়ী সাজাতে হবে। দুইজন সহকারীকে 50 টা করে দিলেন, তারা আবার আরও দুইজনকে অর্ধেক দিলো ... যতক্ষণ না একজনের কাছে 1 টা খাতা (সেটা তো সাজানোই)। তারপর ফেরার পথে প্রত্যেকে দুইটা সাজানো স্তূপ এক করে: দুই স্তূপের উপরের খাতা দেখে ছোট roll টা আগে রাখে।

**Pattern:** Divide and Conquer (Merge Sort)

**কখন এই pattern মাথায় আসবে (Trigger clues):**
- "sort the array" + O(n log n) দরকার
- এমন problem যেটা দুই অর্ধেক আলাদা solve হয়ে গেলে সহজ, শুধু জোড়া লাগাতে হয়

**Brute force:** Bubble / selection / insertion sort → O(n²), বড় input এ খুব ধীর। Merge sort সবসময় O(n log n)।

**Pointers / Variables (merge step):**
| Variable | কাজ | কখন এগোয় |
|----------|-----|-----------|
| `mid` | কোথায় ভাগ হবে | প্রতি call এ একবার |
| `i` | `left` থেকে পড়ে | `left[i]` নেওয়া হলে |
| `j` | `right` থেকে পড়ে | `right[j]` নেওয়া হলে |
| `res` | merge করা ফল | প্রতি step এ একটা push |

**Invariant:** `res` এ সবসময় `left` আর `right` এর সবচেয়ে ছোট element গুলো sorted order এ থাকে।

**Steps:**
1. **Base case:** length `<= 1` হলে আগে থেকেই sorted, return।
2. **Divide:** মাঝখানে ভাগ করো।
3. **Conquer:** বাম আর ডান অর্ধেক recursion দিয়ে sort করো।
4. **Combine (merge):** দুই pointer দিয়ে প্রতিবার ছোটটা `res` এ push করো। এক দিক শেষ হলে অন্য দিকের বাকিটা জুড়ে দাও।

**Template (merge sort):**
```javascript
function sort(arr) {
    if (arr.length <= 1) return arr;           // base case
    const mid = Math.floor(arr.length / 2);
    const left = sort(arr.slice(0, mid));      // conquer left
    const right = sort(arr.slice(mid));        // conquer right
    return merge(left, right);                 // combine
}
```
Divide and conquer এর অন্য problem এ শুধু base case আর combine (merge) step বদলায়।

**Solution:**
```javascript
var sortArray = function(nums) {
    if(nums.length <= 1) return nums;

   let mid = Math.floor(nums.length / 2);
   let left = sortArray(nums.slice(0, mid));
   let right = sortArray(nums.slice(mid));

    return mergeSortedArray(left, right);
};

function mergeSortedArray(left, right){
   let res = []
   let i = 0
   let j = 0
    while(i < left.length && j < right.length){
        if(left[i] < right[j]){
            res.push(left[i])
            i++;
        }else{
             res.push(right[j])
            j++;
        }
    }

    return [...res, ...left.slice(i), ...right.slice(j)]
}
```

**লাইন ধরে ব্যাখ্যা:**
| লাইন | মানে |
|------|------|
| `if(nums.length <= 1) return nums` | base case: 0 বা 1 টা element নিজেই sorted |
| `nums.slice(0, mid)` / `nums.slice(mid)` | বাম আর ডান অর্ধেকের কপি |
| `sortArray(...)` | প্রতিটা অর্ধেক recursion দিয়ে sort |
| `while(i < left.length && j < right.length)` | দুই দিকেই কিছু বাকি থাকা পর্যন্ত |
| `if(left[i] < right[j])` | ছোটটা আগে push |
| `[...res, ...left.slice(i), ...right.slice(j)]` | যেদিকে কিছু বাকি, সেটা শেষে জুড়ে দাও (একটা দিক সবসময় খালি) |

**Sample:**
```
Input : nums = [5,2,3,1]
Output: [1,2,3,5]

Input : nums = [5,1,1,2,0,0]
Output: [0,0,1,1,2,5]
```

**Trace** (`[5,2,3,1]`):
```
              [5,2,3,1]
             /         \
        [5,2]           [3,1]          ← divide
        /   \           /   \
      [5]   [2]       [3]   [1]        ← base case (length 1)
        \   /           \   /
       [2,5]            [1,3]          ← merge
            \          /
            [1,2,3,5]                  ← merge
```

শেষ merge (`left = [2,5]`, `right = [1,3]`):
| step | left[i] | right[j] | ছোট | res | i | j |
|------|---------|----------|-----|-----|---|---|
| 1 | 2 | 1 | 1 (right) | [1] | 0 | 1 |
| 2 | 2 | 3 | 2 (left) | [1,2] | 1 | 1 |
| 3 | 5 | 3 | 3 (right) | [1,2,3] | 1 | 2 |
| শেষ | — | `right` শেষ | `left` এর বাকি `[5]` জুড়ে দাও | [1,2,3,5] | | |

**Edge cases:**
- Empty বা একটা element → সরাসরি return (base case)
- সব element সমান → কাজ করে, অসীম recursion হয় না
- Duplicate → ঠিক আছে, তবে stability দেখো (নিচে)
- Negative সংখ্যা → কাজ করে, কারণ তুলনা numeric
- **Stability:** `left[i] < right[j]` এ সমান হলে **right** এরটা আগে যায়, তাই সমান element এর আসল order বদলে যেতে পারে। শুধু সংখ্যার জন্য সমস্যা নেই। Object কে key দিয়ে sort করলে `<=` লিখে stable করো

**সাধারণ ভুল (Common mistakes):**
- Merge এর শেষে বাকি element জুড়তে ভুলে যাওয়া: কিছু element হারিয়ে যায়
- Base case `length === 0` রাখা: length 1 এ `slice(0, 0)` আর `slice(0)` হয়ে অসীম recursion
- `nums.sort()` comparator ছাড়া: **string** হিসেবে sort করে (`[10,9,1]` → `[1,10,9]`)। সবসময় `nums.sort((a, b) => a - b)`

**Alternative:**
- Quick sort (average O(n log n), worst O(n²), in-place)
- Heap sort (O(n log n), O(1) extra space, stable না)
- আসল project এ built-in `nums.sort((a, b) => a - b)`

**Complexity:**
- Time O(n log n): ভাগ করতে `log n` টা স্তর, আর প্রতিটা স্তরে মোট O(n) merge এর কাজ
- Space O(n): `res` array আর `slice` কপি, সাথে O(log n) recursion depth

**বাংলায় (O(n log n) কেন):**
Array কে বারবার অর্ধেক করলে `log n` টা স্তর (level) হয়। প্রতিটা স্তরে সব element মিলিয়ে মোট `n` টা element merge করতে হয়। তাই মোট কাজ = `n × log n`। Merge এর সময় দুইটা অংশই আগে থেকে sorted, তাই দুই pointer দিয়ে শুধু ছোটটা বেছে নিলেই হয়, আবার সব তুলনা করতে হয় না।

**নিজেকে প্রশ্ন (revision এর সময়):**
1. Merge sort এর তিনটা ধাপ কী? *(উত্তর: divide, conquer (recursion), combine (merge))*
2. Merge এর while loop শেষে কেন `left.slice(i)` আর `right.slice(j)` জুড়তে হয়? *(উত্তর: একটা দিক শেষ হলে অন্য দিকের বাকি element গুলো আগে থেকেই sorted আর সবচেয়ে বড়)*

**Pattern to remember:** "Split in half, sort each half, merge the two sorted halves."

**Related:** #88 (merge step, তবে পিছন থেকে), #21 (Merge Two Sorted Lists), #148 (Sort List), #23 (Merge k Sorted Lists), #215 (Kth Largest Element)

---

# New Notes

<!-- Add new solutions below. Format per note:
## LeetCode #N — Title
এক লাইনে মনে রাখো / সমস্যাটা সহজ ভাষায় / বাস্তব উদাহরণ / Pattern / Trigger clues / Brute force / Pointers or Variables (table) / Invariant / Steps / Template / Solution / লাইন ধরে ব্যাখ্যা / Sample / Trace (table) / Edge cases / সাধারণ ভুল / Alternative / Complexity / বাংলায় (hard part) / নিজেকে প্রশ্ন / Pattern to remember / Related
-->

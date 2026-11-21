/**
 * The "Pattern Family Cheat Sheet" from docs/leetcode-notes.md: every pattern with its trigger
 * words, skeleton idea and (where the notes have one) a reusable template. Problems point here
 * through `patternId` / `alsoPatterns`; the patterns page lists them automatically.
 */

export interface LcTemplate {
  title: string;
  lang: 'javascript' | 'python' | 'text';
  code: string;
  /** "Only X changes per problem" — what you edit when reusing the template. */
  whatChanges: string;
  /** Extra advice that came with the template in the notes. */
  note?: string;
}

export interface LcPattern {
  id: string;
  name: string;
  /** "Trigger words" column of the cheat sheet. */
  triggers: string[];
  /** "Skeleton idea" column of the cheat sheet. */
  skeleton: string;
  templates: LcTemplate[];
}

export const READ_WRITE_TEMPLATE = `let x = 0;
for (let i = 0; i < nums.length; i++) {
    if (KEEP_CONDITION) {
        nums[x] = nums[i];
        x++;
    }
}
return x; // new length`;

export const patterns: LcPattern[] = [
  {
    id: 'read-write-pointers',
    name: 'Read/Write pointers',
    triggers: ['in-place', 'O(1) extra space', 'return new length k'],
    skeleton: '`i` reads, `x` writes only when KEEP condition is true',
    templates: [
      {
        title: 'Read/Write Template (reuse this for #26, #27, #283, #80, ...)',
        lang: 'javascript',
        code: READ_WRITE_TEMPLATE,
        whatChanges: 'Only `KEEP_CONDITION` changes per problem.',
      },
    ],
  },
  {
    id: 'swap-both-ends',
    name: 'Swap from both ends',
    triggers: ['reverse in-place', 'palindrome-like symmetry'],
    skeleton: '`left` and `right` move inward, swap',
    templates: [
      {
        title: 'Swap from both ends (from #344)',
        lang: 'javascript',
        code: `for (let i = 0; i < Math.floor(n / 2); i++) {
    const j = n - 1 - i;      // mirror position
    [arr[i], arr[j]] = [arr[j], arr[i]];
}`,
        whatChanges:
          'Problem অনুযায়ী বদলায়: swap এর বদলে তুলনা (palindrome), বা কোন element skip করবে (শুধু vowel, শুধু letter)।',
      },
    ],
  },
  {
    id: 'merge-from-right',
    name: 'Merge from right',
    triggers: ['merge sorted in-place', 'empty space at the end'],
    skeleton: '3 pointers, fill from the back',
    templates: [
      {
        title: 'Merge (two readers + one writer, from #88)',
        lang: 'text',
        code: `reader p1 = end of A's real values
reader p2 = end of B
writer i  = last slot
while B has values left (p2 >= 0):
    write the BIGGER of A[p1], B[p2] at i
    move that reader back, i--`,
        whatChanges:
          'Merge template: দুইটা reader + একটা writer, প্রতি step এ "ভালো" টা বেছে লেখো। এখানে "ভালো" = বড়, আর দিক = ডান থেকে বাম। #912 এর merge এ "ভালো" = ছোট, দিক = বাম থেকে ডান।',
      },
    ],
  },
  {
    id: 'min-so-far-greedy',
    name: 'Min-so-far + Greedy',
    triggers: ['buy before sell', 'best so far'],
    skeleton: 'track best-so-far, compare with current',
    templates: [
      {
        title: 'Min-so-far (from #121)',
        lang: 'javascript',
        code: `let best = arr[0], ans = 0;
for (let i = 1; i < arr.length; i++) {
    best = UPDATE_BEST(best, arr[i]);       // এখন পর্যন্ত সেরা (min/max)
    ans = Math.max(ans, COMPARE(arr[i], best));
}`,
        whatChanges:
          'Problem অনুযায়ী বদলায়: কী "সেরা" ধরে রাখবে (min দাম, max sum ...) আর আজকের মানের সাথে কীভাবে তুলনা করবে।',
      },
    ],
  },
  {
    id: 'streak-counting',
    name: 'Streak counting',
    triggers: ['consecutive', 'longest run'],
    skeleton: 'count current streak, reset on break, track max',
    templates: [
      {
        title: 'Streak counting (from #485)',
        lang: 'javascript',
        code: `let count = 0, best = 0;
for (const x of arr) {
    if (STREAK_CONDITION) {
        count++;
        best = Math.max(best, count);
    } else {
        count = 0;
    }
}
return best;`,
        whatChanges:
          'শুধু `STREAK_CONDITION` বদলায় (`x === 1`, `s[i] === s[i-1]`, `nums[i] > nums[i-1]` ...)।',
      },
    ],
  },
  {
    id: 'sum-formula',
    name: 'Sum formula',
    triggers: ['one number missing from 0..n / 1..n'],
    skeleton: 'expected sum (formula) − actual sum = missing',
    templates: [
      {
        title: 'Sum formula (from #268)',
        lang: 'javascript',
        code: `const expected = n * (n + 1) / 2;
let actual = 0;
for (const x of nums) actual += x;
return expected - actual;`,
        whatChanges: 'Range `1...n` হলে formula বদলাবে (length তখন `n - 1`), বাকি একই।',
      },
    ],
  },
  {
    id: 'hash-map-counting',
    name: 'Hash map counting',
    triggers: ['frequency', 'appears k times', 'first unique'],
    skeleton: 'pass 1: build counts, pass 2: look up / scan',
    templates: [
      {
        title: 'Frequency map (from #136)',
        lang: 'javascript',
        code: `const freq = {};
for (const x of arr) freq[x] = (freq[x] || 0) + 1;   // pass 1: count
for (const x of arr) if (freq[x] === 1) return x;     // pass 2: look up`,
        whatChanges: 'Pass 2 এর condition বদলায় (`=== 1`, `> 1`, `> n/2` ...)।',
      },
    ],
  },
  {
    id: 'xor-pairs-cancel',
    name: 'XOR (pairs cancel)',
    triggers: ['every element twice except one', '"missing number" with O(1) space'],
    skeleton: '`a ^ a = 0`, `a ^ 0 = a`, XOR everything',
    templates: [],
  },
  {
    id: 'recursion-shrink',
    name: 'Recursion (shrink the problem)',
    triggers: ['power of', 'n depends on n-1 / n/2'],
    skeleton: 'base case → shrink input → recursive call',
    templates: [
      {
        title: 'Recursion Template (reuse for #231, #509, ...)',
        lang: 'text',
        code: `function solve(input):
    if BASE_CASE: return answer          # stop condition(s)
    return combine(solve(SMALLER_INPUT))   # shrink and recurse`,
        whatChanges: 'Base case আর input কীভাবে ছোট হবে (shrink), এই দুইটা বদলায়।',
        note: 'Always ask: (1) what is the base case? (2) how does the input shrink each call? (3) does every path reach the base case?',
      },
    ],
  },
  {
    id: 'tree-recursion-dp',
    name: 'Tree recursion → DP',
    triggers: ['each value = sum of previous values (Fibonacci, stairs)'],
    skeleton: 'brute recursion, then memoize or go bottom-up',
    templates: [],
  },
  {
    id: 'bit-trick',
    name: 'Bit trick `n & (n-1)`',
    triggers: ['power of two', 'count set bits'],
    skeleton: '`n & (n-1)` removes the lowest set bit',
    templates: [],
  },
  {
    id: 'binary-search',
    name: 'Binary search',
    triggers: ['sorted', 'O(log n)', 'find position / first true'],
    skeleton: '`left`, `right`, `mid`; throw away the half that cannot contain the answer',
    templates: [
      {
        title: 'Binary Search Template (reuse for #704, #35, #278, #34, ...)',
        lang: 'python',
        code: `left, right = 0, len(nums) - 1
while left <= right:
    mid = left + (right - left) // 2
    if nums[mid] == target:
        return mid
    elif nums[mid] > target:
        right = mid - 1      # answer can only be on the left
    else:
        left = mid + 1       # answer can only be on the right
return -1`,
        whatChanges:
          'Only the comparison changes per problem (e.g. "is this version bad?", "is mid*mid > x?").',
      },
    ],
  },
  {
    id: 'divide-and-conquer',
    name: 'Divide and conquer',
    triggers: ['sort', 'split in halves and combine'],
    skeleton: 'split → solve each half recursively → merge results',
    templates: [
      {
        title: 'Merge sort (from #912)',
        lang: 'javascript',
        code: `function sort(arr) {
    if (arr.length <= 1) return arr;           // base case
    const mid = Math.floor(arr.length / 2);
    const left = sort(arr.slice(0, mid));      // conquer left
    const right = sort(arr.slice(mid));        // conquer right
    return merge(left, right);                 // combine
}`,
        whatChanges:
          'Divide and conquer এর অন্য problem এ শুধু base case আর combine (merge) step বদলায়।',
      },
    ],
  },
  {
    id: 'linked-list-traversal',
    name: 'Linked list traversal (walk with cur)',
    triggers: ['design a linked list', 'get / insert / delete at index', 'walk to the node before'],
    skeleton: '`cur = head`, move `cur = cur.next`; stop at the node **before** the one you change',
    templates: [
      {
        title: 'Traverse (from the Linked List notes, section 4)',
        lang: 'python',
        code: `cur = self.head
while cur:
    ...
    cur = cur.next`,
        whatChanges:
          '`while cur:` সব node ঘোরে; `while cur.next:` শেষ node-এ থামে। Insert / delete-এ index-এর **আগের** node-এ থামো (`index - 1` ধাপ), কারণ তার `.next` বদলাতে হয়।',
        note: 'কখনো `self.head` নিজে সরাবে না! সবসময় `cur = self.head` নিয়ে `cur` সরাও।',
      },
    ],
  },
  {
    id: 'slow-fast-pointers',
    name: 'Slow / fast pointers',
    triggers: ['middle of the list', 'cycle in a linked list', 'one pass, O(1) space on a list'],
    skeleton: '`slow` moves 1 step, `fast` moves 2; loop `while fast and fast.next`',
    templates: [
      {
        title: 'Middle node (from the Linked List notes, section 13.1)',
        lang: 'python',
        code: `def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next          # ১ ধাপ
        fast = fast.next.next     # ২ ধাপ
    return slow`,
        whatChanges:
          'Cycle detection-এ loop-এর ভেতরে `if slow is fast: return True` যোগ হয়; middle-এ loop শেষে `slow`-ই উত্তর।',
      },
    ],
  },
  {
    id: 'reverse-in-place',
    name: 'Reverse in place',
    triggers: [
      'reverse a linked list',
      'compare from both ends of a list',
      'reverse part of a list',
    ],
    skeleton: 'save next → flip the arrow → move prev → move cur',
    templates: [
      {
        title: 'Iterative reverse (from the Linked List notes, section 9.1)',
        lang: 'python',
        code: `prev = None
cur = self.head
while cur:
    nxt = cur.next     # ১. পরেরটা মনে রাখো (নইলে হারিয়ে যাবে)
    cur.next = prev    # ২. তীর উল্টে দাও
    prev = cur         # ৩. prev এক ধাপ এগোও
    cur = nxt          # ৪. cur এক ধাপ এগোও
self.head = prev       # শেষে prev-ই নতুন head`,
        whatChanges:
          'মনে রাখার কৌশল: "সেভ করো, উল্টাও, এগোও, এগোও"। Palindrome-এ শুধু দ্বিতীয় অর্ধেক (middle থেকে) উল্টানো হয়।',
      },
    ],
  },
  {
    id: 'dummy-node',
    name: 'Dummy node',
    triggers: ['the head itself may change', 'merge lists', 'delete nodes including the head'],
    skeleton: 'a fake node before head, so "the node before" always exists; return `dummy.next`',
    templates: [
      {
        title: 'Merge two sorted lists (from the Linked List notes, section 14.1)',
        lang: 'python',
        code: `dummy = ListNode()
tail = dummy
while l1 and l2:
    if l1.val <= l2.val:
        tail.next = l1
        l1 = l1.next
    else:
        tail.next = l2
        l2 = l2.next
    tail = tail.next
tail.next = l1 if l1 else l2
return dummy.next`,
        whatChanges:
          'Dummy node Linked List-এর edge case কমানোর সবচেয়ে বড় trick: head বদলালেও "আগের node" সবসময় থাকে।',
      },
    ],
  },
  {
    id: 'gap-pointer',
    name: 'Gap pointer',
    triggers: ['k-th / n-th node from the end', 'one pass from the end'],
    skeleton: 'move `fast` n+1 steps ahead, then move both until `fast` is None',
    templates: [
      {
        title: 'Remove n-th from end (from the Linked List notes, section 13.4)',
        lang: 'python',
        code: `dummy = ListNode(0, head)
fast = slow = dummy
for _ in range(n + 1):
    fast = fast.next
while fast:
    fast = fast.next
    slow = slow.next
slow.next = slow.next.next
return dummy.next`,
        whatChanges:
          'fast আর slow-এর মধ্যে সবসময় n+1 ধাপের ফাঁক; fast None-এ পৌঁছালে slow মুছতে হবে এমন node-এর আগে।',
      },
    ],
  },
  {
    id: 'two-pointer-switch',
    name: 'Two pointers that switch lists',
    triggers: [
      'where do two linked lists meet',
      'intersection node, O(1) memory',
      'two lists of different lengths',
    ],
    skeleton:
      '`a` walks A then B, `b` walks B then A; same total distance, so they meet at the shared node (or both reach None)',
    templates: [
      {
        title: 'Intersection of two lists (#160, O(1) space)',
        lang: 'python',
        code: `a, b = headA, headB
while a is not b:
    a = a.next if a else headB   # A শেষ? B-তে চলে যাও
    b = b.next if b else headA   # B শেষ? A-তে চলে যাও
return a                         # মিলনের node, বা None`,
        whatChanges:
          'দুইজনেই মোট `lenA + lenB` ধাপ হাঁটে, তাই length আলাদা হলেও একই সময়ে মিলনের node-এ পৌঁছায়। মিলন না থাকলে দুইজনেই একসাথে None হয়, loop থামে।',
        note: 'Hash set দিয়েও হয় (B-র সব node set-এ রেখে A হাঁটা), কিন্তু তাতে O(n) memory লাগে।',
      },
    ],
  },
  {
    id: 'split-and-rejoin',
    name: 'Split into two chains, then rejoin',
    triggers: [
      'group odd and even positions',
      'partition a list keeping relative order',
      'O(1) extra space reorder',
    ],
    skeleton:
      'two chain tails move together, each skipping one node; remember where the second chain starts and link it after the first chain',
    templates: [
      {
        title: 'Odd even list (#328)',
        lang: 'python',
        code: `odd, even = head, head.next
evenStart = even
while even and even.next:
    odd.next = odd.next.next     # odd chain একটা টপকে
    even.next = even.next.next   # even chain একটা টপকে
    odd = odd.next
    even = even.next
odd.next = evenStart             # শেষে জোড়া লাগাও`,
        whatChanges:
          'Partition (#86)-এ একই idea: দুইটা dummy দিয়ে "ছোট" আর "বড়" chain বানিয়ে শেষে জোড়া। মূল কথা: দ্বিতীয় chain-এর শুরু আগেই মনে রাখা।',
      },
    ],
  },
];

/**
 * The sections of the notes ("Section 1 — Two Pointers: Read/Write" ...), in order. The
 * "by pattern" list view groups problems like this. A new pattern gets a new family here.
 */
export const patternFamilies: { id: string; title: string; patternIds: string[] }[] = [
  {
    id: 'two-pointers-read-write',
    title: 'Two Pointers: Read/Write (In-place Overwrite)',
    patternIds: ['read-write-pointers'],
  },
  {
    id: 'two-pointers-swap',
    title: 'Two Pointers: Swap From Both Ends',
    patternIds: ['swap-both-ends'],
  },
  {
    id: 'two-pointers-merge',
    title: 'Two Pointers: Merge From the Right',
    patternIds: ['merge-from-right'],
  },
  { id: 'one-pass-greedy', title: 'One Pass / Greedy', patternIds: ['min-so-far-greedy'] },
  { id: 'single-pass-counting', title: 'Single Pass / Counting', patternIds: ['streak-counting'] },
  { id: 'math-sum-formula', title: 'Math: Sum Formula', patternIds: ['sum-formula'] },
  {
    id: 'hash-map-frequency',
    title: 'Hash Map: Frequency Counting',
    patternIds: ['hash-map-counting'],
  },
  { id: 'recursion', title: 'Recursion', patternIds: ['recursion-shrink', 'tree-recursion-dp'] },
  { id: 'binary-search', title: 'Binary Search', patternIds: ['binary-search'] },
  {
    id: 'divide-and-conquer',
    title: 'Divide and Conquer (Sorting)',
    patternIds: ['divide-and-conquer'],
  },
  { id: 'bits-xor', title: 'Bits & XOR', patternIds: ['xor-pairs-cancel', 'bit-trick'] },
  {
    id: 'linked-list',
    title: 'Linked List',
    patternIds: [
      'linked-list-traversal',
      'slow-fast-pointers',
      'reverse-in-place',
      'dummy-node',
      'gap-pointer',
      'two-pointer-switch',
      'split-and-rejoin',
    ],
  },
];

export function getPattern(id: string): LcPattern | undefined {
  return patterns.find((p) => p.id === id);
}

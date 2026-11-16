import type { LcProblem } from '../schema';

const problem: LcProblem = {
  id: 'lc-234-palindrome-linked-list',
  number: 234,
  title: 'Palindrome Linked List',
  slug: '234-palindrome-linked-list',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/palindrome-linked-list/',
  patternId: 'slow-fast-pointers',
  alsoPatterns: ['reverse-in-place'],
  patternLabel: 'Middle (slow / fast) + Reverse second half + Compare',
  topicId: 'linked-list',
  tags: ['linked-list', 'two-pointers', 'slow-fast', 'reverse', 'palindrome'],
  solvedIn: ['python'],
  dateAdded: '2026-11-16',

  problem: {
    oneLineReminder:
      'তিন ধাপ: (১) `slow = fast = head` দিয়ে middle খোঁজো, (২) `slow` থেকে দ্বিতীয় অর্ধেক reverse (`prev`, `temp`), (৩) `first = head`, `second = prev` নিয়ে `while second:` এ value তুলনা।',
    statementBn:
      'একটা singly linked list-এর `head` দেওয়া আছে। List টা palindrome কিনা বলো, মানে সামনে থেকে আর পিছন থেকে পড়লে একই (যেমন 1→2→2→1)। Follow-up: O(n) time আর O(1) space।',
    realLifeExample:
      '"madam" শব্দটা সামনে-পিছনে একই। কিন্তু singly linked list-এ পিছনে যাওয়া যায় না। তাই মাঝখান থেকে বাকি অর্ধেকটা উল্টে দাও, তারপর দুই মাথা থেকে একসাথে হেঁটে মিলিয়ে দেখো, যেন একটা কাগজ মাঝখান থেকে ভাঁজ করে দুই পাশ মেলানো।',
    samples: [
      { input: 'head = [1,2,2,1]', output: 'true' },
      { input: 'head = [1,2]', output: 'false' },
      { input: 'head = [1,2,3,2,1]', output: 'true', note: 'notes section 14.2-এর example' },
    ],
  },

  approach: {
    triggers: [
      '"is the linked list a palindrome?"',
      'singly list-এ শেষ থেকে তুলনা করতে হবে, O(1) space',
    ],
    bruteForce:
      'সব value একটা Python list-এ নিয়ে `values == values[::-1]`। সহজ, কিন্তু O(n) extra space; interview-এ O(1) space version চাইবে।',
    idea: 'আগে শেখা দুইটা technique জোড়া লাগাও: slow/fast দিয়ে middle খোঁজো, তারপর middle থেকে দ্বিতীয় অর্ধেক reverse করো। এখন দ্বিতীয় অর্ধেকের head (`prev`) শেষ থেকে শুরু হওয়া list, তাই `head` আর `prev` থেকে একসাথে হেঁটে value মেলাও।',
    steps: [
      '**Middle:** `slow = fast = head`; `while fast and fast.next`: `slow = slow.next`, `fast = fast.next.next`। এখন `slow` দ্বিতীয় অর্ধেকের শুরু।',
      '**Reverse:** `prev = None`; `while slow`: `temp = slow.next`, `slow.next = prev`, `prev = slow`, `slow = temp`। এখন `prev` উল্টানো দ্বিতীয় অর্ধেকের head।',
      '**Compare:** `first = head`, `second = prev`; `while second`: value না মিললে `return False`, নাহলে দুজনেই এক ধাপ এগোও।',
      'সব মিললে `return True`।',
    ],
  },

  breakdown: {
    variables: [
      { name: 'slow, fast', role: 'ধাপ ১: middle খোঁজা; শেষে slow = দ্বিতীয় অর্ধেকের শুরু' },
      { name: 'prev, temp', role: 'ধাপ ২: দ্বিতীয় অর্ধেক উল্টানো; শেষে prev = উল্টানো অংশের head' },
      { name: 'first', role: 'ধাপ ৩: head থেকে সামনে হাঁটে' },
      { name: 'second', role: 'ধাপ ৩: list-এর শেষ থেকে (উল্টানো অংশ) হাঁটে; None হলে তুলনা শেষ' },
    ],
    invariant:
      'তুলনার সময় `first` আর `second` সবসময় মূল list-এর সামনে থেকে আর পিছন থেকে একই দূরত্বে থাকে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`[1,2,2,1]`)',
        columns: ['ধাপ', 'কী হলো', 'ফল'],
        rows: [
          ['১. middle', 'slow: 1 → 2 → 2(দ্বিতীয়), fast: 1 → 2(দ্বিতীয়) → None', 'slow = দ্বিতীয় 2'],
          ['২. reverse', 'দ্বিতীয় অর্ধেক 2 → 1 উল্টে 1 → 2', 'prev = শেষের 1'],
          [
            '৩. compare',
            'first 1 vs second 1 ✓, first 2 vs second 2 ✓, second = None',
            'return True',
          ],
        ],
        highlightCells: [[2, 2]],
      },
      {
        kind: 'diagram',
        title: 'Reverse-এর পরে দুই দিক',
        text: `first  → 1 → 2 ─┐
                 ▼
second → 1 → 2 → None

(প্রথম অর্ধেকের শেষ 2 এখনো দ্বিতীয় 2-কে point করে; তুলনা থামে second None হলে)`,
      },
    ],
    edgeCases: [
      'একটা node → middle = সেই node, reverse = নিজে, তুলনা 1 বার → True',
      'দুইটা node `[1,2]` → slow = 2, তুলনা 1 vs 2 → False',
      'বিজোড় length: মাঝের node দ্বিতীয় অর্ধেকে পড়ে, নিজের সাথেই তুলনা হয়, তাই সমস্যা নেই',
      'এই solution input list বদলে দেয় (দ্বিতীয় অর্ধেক উল্টানো থাকে); দরকার হলে শেষে আবার reverse করে ফিরিয়ে দাও',
    ],
    deepDiveBn: {
      heading: 'কেন while second, while first না',
      body: 'Reverse করার পরে প্রথম অর্ধেক কাটা হয় না: প্রথম অর্ধেকের শেষ node এখনো দ্বিতীয় অর্ধেকের প্রথম node-কে (যেটা এখন উল্টানো list-এর শেষ) point করে। তাই `first` থেকে হাঁটলে প্রথম অর্ধেক পেরিয়েও কিছু node পাওয়া যায়। কিন্তু `second` (উল্টানো অর্ধেক) ঠিক অর্ধেক দৈর্ঘ্যের পরে None হয়, তাই loop `second` দিয়ে থামালে ঠিক যতগুলো জোড়া মেলানো দরকার ততগুলোই মেলে। এখানে আগের দুইটা technique (middle + reverse) মিলে নতুন সমস্যার সমাধান।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'python',
      code: `class Solution:
    def isPalindrome(self, head: ListNode | None) -> bool:
        slow = fast = head
        # finding the middle
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        prev = None
        while slow:
            temp = slow.next
            slow.next = prev
            prev = slow
            slow = temp

        first = head
        second = prev

        while second:
            if first.val != second.val:
                return False

            first = first.next
            second = second.next

        return True`,
      lineByLine: [
        { line: 'slow = fast = head', meaning: 'ধাপ ১ শুরু: দুজনেই head থেকে' },
        {
          line: 'while fast and fast.next: ...',
          meaning: 'slow ১, fast ২ ধাপ; শেষে slow = middle',
        },
        { line: 'prev = None; while slow:', meaning: 'ধাপ ২: middle থেকে reverse' },
        {
          line: 'temp = slow.next; slow.next = prev; prev = slow; slow = temp',
          meaning: 'সেভ, উল্টাও, এগোও, এগোও',
        },
        { line: 'first = head; second = prev', meaning: 'ধাপ ৩: দুই মাথা' },
        { line: 'while second:', meaning: 'উল্টানো অর্ধেক শেষ হওয়া পর্যন্ত তুলনা' },
        { line: 'if first.val != second.val: return False', meaning: 'একটা অমিলই যথেষ্ট' },
        { line: 'return True', meaning: 'সব জোড়া মিলেছে' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: copy values (from my notes)',
      isMine: false,
      lang: 'python',
      code: `class Solution:
    def isPalindrome(self, head: ListNode | None) -> bool:
        values = []
        while head:
            values.append(head.val)
            head = head.next
        return values == values[::-1]`,
      complexity: { time: 'O(n)', space: 'O(n)' },
      note: 'Notes section 14.2-এর "সহজ উপায়": সব value list-এ নিয়ে উল্টো list-এর সাথে তুলনা। O(n) extra space লাগে, follow-up O(1) চায়।',
    },
  ],
  commonMistakes: [
    '`while first:` দিয়ে তুলনা করা: প্রথম অর্ধেক কাটা নেই, তাই second None হলে `second.val` error',
    'Reverse করার পরে কোন pointer নতুন head সেটা গুলিয়ে ফেলা: উল্টানো অর্ধেকের head হলো `prev`, `slow` তখন None',
    'Reverse loop-এ `temp` ভুলে যাওয়া: দ্বিতীয় অর্ধেক হারিয়ে যায়',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'Solution-এর তিনটা ধাপ কী কী?',
        a: 'middle (slow/fast) → slow থেকে reverse → head আর prev থেকে তুলনা',
      },
      {
        q: 'তুলনার loop কোন pointer দিয়ে থামে, কেন?',
        a: '`second`, কারণ উল্টানো অর্ধেকই ঠিক অর্ধেক দৈর্ঘ্যে None-এ শেষ হয়',
      },
      { q: 'Space O(1) কেন?', a: 'নতুন list বানাইনি, শুধু pointer উল্টেছি' },
    ],
    patternToRemember:
      'Find the middle with slow/fast, reverse the second half, then walk from both ends comparing values.',
    related: [
      { number: 876, title: 'Middle of the Linked List', note: 'ধাপ ১' },
      { number: 206, title: 'Reverse Linked List', note: 'ধাপ ২' },
      { number: 143, title: 'Reorder List', note: 'middle + reverse + merge' },
    ],
  },

  visualizationId: 'lc-ll-palindrome',
  acceptedOnLeetCode: true,
  meta: { generated: ['note', 'approach.idea'] },
};

export default problem;

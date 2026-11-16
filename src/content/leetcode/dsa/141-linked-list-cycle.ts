import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const slowFast = patterns.find((p) => p.id === 'slow-fast-pointers')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-141-linked-list-cycle',
  number: 141,
  title: 'Linked List Cycle',
  slug: '141-linked-list-cycle',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/linked-list-cycle/',
  patternId: 'slow-fast-pointers',
  patternLabel: "Slow / Fast Pointers (Floyd's cycle detection)",
  topicId: 'linked-list',
  tags: ['linked-list', 'two-pointers', 'slow-fast', 'floyd'],
  solvedIn: ['python'],
  dateAdded: '2026-11-16',

  problem: {
    oneLineReminder:
      '`slow` ১ ধাপ, `fast` ২ ধাপ, `while fast and fast.next`। ভেতরে `if slow is fast: return True`। Loop শেষ হলে (fast শেষে পৌঁছালো) `False`।',
    statementBn:
      'একটা linked list-এর `head` দেওয়া আছে। List-এ কোনো cycle আছে কিনা বলো: কোনো node-এর `next` যদি আগের কোনো node-কে point করে, তাহলে `next` ধরে হাঁটলে কখনো শেষ হবে না। (`pos` শুধু test বানাতে ব্যবহার হয়, function-এ দেওয়া হয় না।)',
    realLifeExample:
      'গোল দৌড়ের মাঠে একজন দ্বিগুণ গতিতে দৌড়ায়। মাঠ গোল হলে দ্রুতজন একসময় ধীরজনকে পিছন থেকে ধরে ফেলবেই। আর রাস্তা সোজা হলে দ্রুতজন সোজা শেষ মাথায় পৌঁছে যাবে।',
    samples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true', note: '-4-এর next আবার 2 (index 1)' },
      { input: 'head = [1,2], pos = 0', output: 'true' },
      { input: 'head = [1], pos = -1', output: 'false' },
    ],
  },

  approach: {
    triggers: ['"does the linked list have a cycle?"', 'O(1) memory-তে loop ধরতে হবে'],
    bruteForce:
      'দেখা সব node একটা `set`-এ রাখো; কোনো node দ্বিতীয়বার পেলে cycle। O(n) time কিন্তু O(n) extra space। Follow-up O(1) memory চায়।',
    idea: "Floyd's tortoise and hare: দুইটা pointer, একটা ১ ধাপ আরেকটা ২ ধাপ। Cycle থাকলে দুজনেই চক্রে আটকে যায় আর প্রতি ধাপে দূরত্ব ১ করে কমে, তাই একসময় একই node-এ দেখা হবে। Cycle না থাকলে fast None-এ পৌঁছে যায়।",
    steps: [
      '`slow = head`, `fast = head`।',
      'যতক্ষণ `fast and fast.next`: `slow = slow.next`, `fast = fast.next.next`।',
      'সরানোর **পরে** check: `if slow is fast: return True`।',
      'Loop থেকে বের হলে (fast শেষে) `return False`।',
    ],
    template: { lang: slowFast.lang, code: slowFast.code, whatChanges: slowFast.whatChanges },
  },

  breakdown: {
    variables: [
      { name: 'slow', role: '১ ধাপ করে', whenChanges: 'প্রতি loop-এ' },
      { name: 'fast', role: '২ ধাপ করে; None-এ পৌঁছালে cycle নেই', whenChanges: 'প্রতি loop-এ' },
    ],
    invariant:
      'Cycle-এর ভেতরে দুজনেই ঢুকে গেলে প্রতি ধাপে fast আর slow-এর দূরত্ব ১ করে কমে, তাই ব্যবধান কখনো "লাফিয়ে পার" হয় না।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`[3,2,0,-4]`, pos = 1: -4 → 2)',
        columns: ['ধাপ', 'slow', 'fast', 'slow is fast?'],
        rows: [
          ['শুরু', '3', '3', '— (check loop-এর ভেতরে, সরানোর পরে)'],
          ['1', '2', '0', 'না'],
          ['2', '0', '2', 'না (fast: 0 → -4 → 2)'],
          ['3', '-4', '-4', 'হ্যাঁ → return True'],
        ],
        highlightCells: [[3, 3]],
      },
      {
        kind: 'diagram',
        title: 'Cycle-টা দেখতে',
        text: `3 → 2 → 0 → -4
    ▲        │
    └────────┘   (-4 আবার 2-কে point করে)`,
      },
    ],
    edgeCases: [
      'খালি list বা একটা node (cycle ছাড়া) → loop চলে না, `False`',
      'একটা node যার next নিজেই → fast.next আছে; এক ধাপে দুজনেই সেই node-এ → `True`',
      'Check-টা সরানোর **পরে** করতে হয়, কারণ শুরুতে দুজনেই head-এ (একই node)',
    ],
    deepDiveBn: {
      heading: 'কেন is, == না',
      body: 'আমরা দেখতে চাই দুইটা pointer **একই node object**-এ আছে কিনা, শুধু একই value কিনা না। দুইটা আলাদা node-এর value একই হতে পারে (যেমন দুইটা 2), তাতে cycle প্রমাণ হয় না। Python-এ `is` object identity দেখে। আর cycle থাকা list-এ কখনো সাধারণ `while cur:` দিয়ে print করবে না, infinite loop হবে।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'python',
      code: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = head
        fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

            if slow is fast:
                return True

        return False`,
      lineByLine: [
        { line: 'slow = head; fast = head', meaning: 'দুজনেই head থেকে' },
        {
          line: 'while fast and fast.next:',
          meaning: 'fast-এর সামনে দুই ধাপ আছে কিনা; না থাকলে list শেষ, cycle নেই',
        },
        { line: 'slow = slow.next; fast = fast.next.next', meaning: '১ ধাপ আর ২ ধাপ' },
        { line: 'if slow is fast: return True', meaning: 'একই node-এ দেখা হলো → cycle' },
        { line: 'return False', meaning: 'fast None-এ পৌঁছেছে → সোজা রাস্তা' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: visited set',
      isMine: false,
      lang: 'python',
      code: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        seen = set()
        cur = head
        while cur:
            if cur in seen:
                return True
            seen.add(cur)
            cur = cur.next
        return False`,
      complexity: { time: 'O(n)', space: 'O(n)' },
      note: 'সহজ, কিন্তু প্রতিটা node মনে রাখতে O(n) memory লাগে। Follow-up ("O(1) memory") Floyd-এর algorithm চায়।',
    },
  ],
  commonMistakes: [
    'Loop-এর শুরুতে `if slow is fast` check করা: প্রথমবারই দুজনেই head-এ, ভুল করে `True`',
    '`while fast.next:` লেখা: fast None হলে error',
    '`==` দিয়ে value তুলনা: আলাদা node-এর একই value হলে ভুল `True`',
  ],

  revise: {
    selfQuestions: [
      { q: 'দেখা হওয়ার check কোথায়: সরানোর আগে না পরে?', a: 'পরে, কারণ শুরুতে দুজনেই head-এ' },
      { q: 'Cycle না থাকলে loop কীভাবে শেষ হয়?', a: 'fast বা fast.next None হয়ে যায়' },
      { q: 'কেন `is`?', a: 'একই node object কিনা দেখতে, শুধু একই value না' },
    ],
    patternToRemember:
      'Slow one step, fast two steps: if they ever meet, there is a cycle; if fast hits the end, there is none.',
    related: [
      { number: 142, title: 'Linked List Cycle II', note: 'cycle কোথায় শুরু (notes 13.3)' },
      { number: 876, title: 'Middle of the Linked List', note: 'একই slow/fast loop' },
      { number: 202, title: 'Happy Number', note: 'সংখ্যার ক্রমে cycle' },
    ],
  },

  visualizationId: 'lc-ll-slow-fast',
  acceptedOnLeetCode: true,
  meta: { generated: ['note', 'approach.idea', 'solutions.Alternative: visited set'] },
};

export default problem;

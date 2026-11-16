import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const slowFast = patterns.find((p) => p.id === 'slow-fast-pointers')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-876-middle-of-the-linked-list',
  number: 876,
  title: 'Middle of the Linked List',
  slug: '876-middle-of-the-linked-list',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/middle-of-the-linked-list/',
  patternId: 'slow-fast-pointers',
  patternLabel: 'Slow / Fast Pointers (middle)',
  topicId: 'linked-list',
  tags: ['linked-list', 'two-pointers', 'slow-fast'],
  solvedIn: ['python'],
  dateAdded: '2026-11-16',

  problem: {
    oneLineReminder:
      '`s` এক ধাপ, `f` দুই ধাপ। `while f is not None and f.next is not None`। `f` শেষে পৌঁছালে `s`-ই middle (জোড় হলে দ্বিতীয় middle)।',
    statementBn:
      'একটা singly linked list-এর `head` দেওয়া আছে। মাঝের node return করো। Node সংখ্যা জোড় হলে দুইটা middle থাকে, তখন **দ্বিতীয়টা** return করতে হবে।',
    realLifeExample:
      'দুইজন একই জায়গা থেকে দৌড় শুরু করলো, একজন দ্বিগুণ গতিতে। দ্রুতজন যখন finish line-এ পৌঁছায়, ধীরজন তখন ঠিক মাঝপথে। আগে পুরো দৈর্ঘ্য মাপতে হয় না।',
    samples: [
      { input: 'head = [1,2,3,4,5]', output: '[3,4,5]', note: 'middle node 3' },
      { input: 'head = [1,2,3,4,5,6]', output: '[4,5,6]', note: 'দুইটা middle (3, 4), দ্বিতীয়টা 4' },
    ],
  },

  approach: {
    triggers: [
      '"middle of a linked list"',
      'list-এর length জানা নেই, এক pass-এ O(1) space-এ কিছু খুঁজতে হবে',
    ],
    bruteForce:
      'প্রথম pass-এ node গুনে `n`, দ্বিতীয় pass-এ `n // 2` ধাপ হাঁটা। ঠিক আছে (O(n)), কিন্তু দুই pass লাগে। বা সব node একটা list-এ রেখে `nodes[len // 2]`, তাতে O(n) extra space।',
    idea: 'দুইটা pointer একসাথে head থেকে: `s` প্রতিবার ১ ধাপ, `f` ২ ধাপ। `f` শেষে (None বা শেষ node-এ) পৌঁছালে `s` ঠিক অর্ধেক পথ গেছে, সেটাই middle।',
    steps: [
      '`s = head`, `f = head`।',
      'যতক্ষণ `f is not None and f.next is not None`: `s = s.next`, `f = f.next.next`।',
      'Loop শেষে `s` return করো।',
    ],
    template: { lang: slowFast.lang, code: slowFast.code, whatChanges: slowFast.whatChanges },
  },

  breakdown: {
    variables: [
      { name: 's (slow)', role: 'প্রতি ধাপে ১ node এগোয়; শেষে middle', whenChanges: 'প্রতি loop-এ' },
      { name: 'f (fast)', role: 'প্রতি ধাপে ২ node এগোয়', whenChanges: 'প্রতি loop-এ' },
    ],
    invariant: 'প্রতি ধাপের পরে `f`, head থেকে `s`-এর দ্বিগুণ দূরে থাকে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`[1,2,3,4,5]`, বিজোড়)',
        columns: ['ধাপ', 's', 'f', 'loop চলবে?'],
        rows: [
          ['শুরু', '1', '1', 'হ্যাঁ (f আর f.next আছে)'],
          ['1', '2', '3', 'হ্যাঁ'],
          ['2', '3', '5', 'না: f.next = None'],
        ],
        highlightCells: [[2, 1]],
      },
      {
        kind: 'table',
        title: 'Trace (`[1,2,3,4,5,6]`, জোড়)',
        columns: ['ধাপ', 's', 'f', 'loop চলবে?'],
        rows: [
          ['শুরু', '1', '1', 'হ্যাঁ'],
          ['1', '2', '3', 'হ্যাঁ'],
          ['2', '3', '5', 'হ্যাঁ (5.next = 6)'],
          ['3', '4', 'None', 'না: f = None'],
        ],
        highlightCells: [[3, 1]],
      },
    ],
    edgeCases: [
      'একটা node → loop চলে না, head নিজেই middle',
      'দুইটা node → `s` এক ধাপ যায়, দ্বিতীয় node (দ্বিতীয় middle) return',
      'জোড় length-এ প্রথম middle চাইলে শুরুতে `f = head.next` দাও (notes-এর merge sort section)',
    ],
    deepDiveBn: {
      heading: 'loop condition-এ দুইটা check কেন',
      body: '`f = f.next.next` লেখার আগে নিশ্চিত হতে হবে যে `f` আর `f.next` দুইটাই আছে। বিজোড় length-এ `f` শেষ node-এ থামে (`f.next` None), জোড় length-এ `f` নিজেই None হয়ে যায়। প্রথম check না থাকলে None-এর `.next` চাইতে গিয়ে error হতো, দ্বিতীয়টা না থাকলে `f.next.next`-এ। আর জোড় length-এ `s` দ্বিতীয় middle-এ থামে, যেটা ঠিক এই problem-এর চাওয়া।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'python',
      code: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def middleNode(self, head: ListNode | None) -> ListNode | None:
        s = head
        f = head
        while f is not None and f.next is not None:
            s = s.next
            f = f.next.next

        return s`,
      lineByLine: [
        { line: 's = head; f = head', meaning: 'দুইজনেই একই জায়গা থেকে শুরু' },
        {
          line: 'while f is not None and f.next is not None:',
          meaning: 'fast-এর সামনে দুই ধাপ যাওয়ার জায়গা আছে কিনা',
        },
        { line: 's = s.next', meaning: 'slow ১ ধাপ' },
        { line: 'f = f.next.next', meaning: 'fast ২ ধাপ' },
        { line: 'return s', meaning: 'fast শেষে, তাই slow মাঝখানে' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: count, then walk',
      isMine: false,
      lang: 'python',
      code: `class Solution:
    def middleNode(self, head: ListNode | None) -> ListNode | None:
        n = 0
        cur = head
        while cur:
            n += 1
            cur = cur.next
        cur = head
        for _ in range(n // 2):
            cur = cur.next
        return cur`,
      complexity: { time: 'O(n), two passes', space: 'O(1)' },
      note: 'আগে length গুনে তারপর `n // 2` ধাপ। সহজ, কিন্তু list দুইবার হাঁটতে হয়।',
    },
  ],
  commonMistakes: [
    'শুধু `while f.next:` লেখা: জোড় length-এ `f` None হয়ে গেলে `None.next` error',
    'জোড় length-এ কোন middle চাই সেটা না দেখা: এই problem দ্বিতীয়টা চায়',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'Loop-এর শর্তে কোন দুইটা check?',
        a: '`f is not None and f.next is not None`',
      },
      { q: 'জোড় length-এ `s` কোন middle-এ থামে?', a: 'দ্বিতীয় middle-এ' },
    ],
    patternToRemember: 'Slow moves one, fast moves two; when fast runs out, slow is in the middle.',
    related: [
      { number: 141, title: 'Linked List Cycle', note: 'একই slow/fast, শুধু দেখা হলে cycle' },
      { number: 234, title: 'Palindrome Linked List', note: 'middle → তারপর reverse' },
      { number: 148, title: 'Sort List', note: 'merge sort-এ middle থেকে ভাগ' },
    ],
  },

  visualizationId: 'lc-ll-slow-fast',
  acceptedOnLeetCode: true,
  meta: { generated: ['note', 'approach.idea', 'solutions.Alternative: count, then walk'] },
};

export default problem;

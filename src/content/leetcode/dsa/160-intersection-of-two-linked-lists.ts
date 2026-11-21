import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const switchPattern = patterns.find((p) => p.id === 'two-pointer-switch')!;

const problem: LcProblem = {
  id: 'lc-160-intersection-of-two-linked-lists',
  number: 160,
  title: 'Intersection of Two Linked Lists',
  slug: '160-intersection-of-two-linked-lists',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/intersection-of-two-linked-lists/',
  patternId: 'two-pointer-switch',
  alsoPatterns: ['hash-map-counting'],
  patternLabel: 'Hash set of nodes (optimal: two pointers switch)',
  topicId: 'linked-list',
  tags: ['linked-list', 'hash-set', 'two-pointers'],
  solvedIn: ['python'],
  dateAdded: '2026-11-21',

  problem: {
    oneLineReminder:
      'B-র সব **node** একটা set-এ (`listB`), তারপর A হাঁটো: প্রথম যে node `listB`-তে আছে সেটাই উত্তর। Value না, node নিজে মিলাতে হবে।',
    statementBn:
      'দুইটা singly linked list-এর `headA` আর `headB` দেওয়া আছে। কোনো এক জায়গা থেকে দুইটা list একই node শেয়ার করতে পারে (Y আকৃতি)। যে node থেকে তারা মিলেছে সেটা return করো, না মিললে `None`। List দুইটা বদলানো যাবে না।',
    realLifeExample:
      'দুইটা আলাদা রাস্তা এক মোড়ে এসে একটা রাস্তা হয়ে গেছে। প্রথম রাস্তার সব মোড়ের নাম একটা খাতায় লিখে রাখলাম, তারপর দ্বিতীয় রাস্তা ধরে হাঁটলাম: প্রথম যে মোড় খাতায় আছে, সেটাই মিলনের জায়গা। নাম না, আসল মোড়টা মিলাতে হবে (দুই শহরে একই নামের মোড় থাকতে পারে)।',
    samples: [
      {
        input: 'listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], skipA = 2, skipB = 3',
        output: "Intersected at '8'",
        note: 'দুই list-এই value 1 আছে, কিন্তু সেগুলো আলাদা node। মিলন শুরু 8 থেকে',
      },
      {
        input: 'listA = [1,9,1,2,4], listB = [3,2,4], skipA = 3, skipB = 1',
        output: "Intersected at '2'",
      },
      { input: 'listA = [2,6,4], listB = [1,5]', output: 'No intersection', note: 'return None' },
    ],
  },

  approach: {
    triggers: [
      '"দুইটা list কোথায় মিলেছে" / intersection node',
      'node-এর **identity** দেখতে হবে, value না',
      'আগে দেখা node আবার এসেছে কিনা → set',
    ],
    bruteForce:
      'A-র প্রতিটা node-এর জন্য পুরো B হেঁটে দেখা একই node কিনা: O(m·n) time। Set দিয়ে B-কে একবার মনে রাখলে প্রতিটা খোঁজ O(1)।',
    idea: 'দুই ধাপ। প্রথমে `curr` দিয়ে B-র প্রতিটা node `listB` set-এ রাখো (node object নিজেই, তাই `in` চেক identity দিয়ে হয়)। তারপর `currNew` দিয়ে A হাঁটো: প্রথম যে node `listB`-তে পাওয়া যায় সেটাই মিলনের node, কারণ সেখান থেকে বাকিটা দুই list-এর common। A শেষ হয়ে গেলে মিলন নেই।',
    steps: [
      '`curr = headB`, `listB = set()`।',
      'যতক্ষণ `curr`: `listB.add(curr)`, `curr = curr.next`। (B-র সব node set-এ)',
      '`currNew = headA`।',
      'যতক্ষণ `currNew`: `if currNew in listB: return currNew`, না হলে `currNew = currNew.next`।',
      'Loop শেষ হলে `return None`।',
    ],
    template: {
      lang: 'python',
      code: `seen = set()
cur = headB
while cur:                # ১. B-র সব node মনে রাখো
    seen.add(cur)
    cur = cur.next
cur = headA
while cur:                # ২. A-তে প্রথম চেনা node
    if cur in seen:
        return cur
    cur = cur.next
return None`,
      whatChanges: `Set-এ node রাখলে O(n) memory লাগে। Follow-up O(1) memory চাইলে: ${switchPattern.skeleton}।`,
    },
  },

  breakdown: {
    variables: [
      { name: 'curr', role: 'B হাঁটার pointer (Part 1)', whenChanges: 'প্রতি loop-এ' },
      {
        name: 'listB',
        role: 'B-র সব node-এর set; `in` চেক O(1), identity দিয়ে',
        whenChanges: 'Part 1-এ প্রতি node-এ একটা add',
      },
      { name: 'currNew', role: 'A হাঁটার pointer (Part 2)', whenChanges: 'প্রতি loop-এ' },
    ],
    invariant: 'Part 2-এ `currNew`-এর আগের A-র কোনো node B-তে নেই; তাই প্রথম match-টাই মিলনের শুরু।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (Sample 1: A = 4 → 1 → [8 → 4 → 5], B = 5 → 6 → 1 → [8 → 4 → 5])',
        columns: ['ধাপ', 'pointer', 'node', 'listB-তে?', 'কাজ'],
        rows: [
          ['Part 1', 'curr', 'B-র 5, 6, 1, 8, 4, 5', '—', 'সব add, `listB`-তে 6টা node'],
          ['Part 2.1', 'currNew', 'A-র 4', 'না', 'এগোও'],
          ['Part 2.2', 'currNew', 'A-র 1', 'না (B-র 1 আলাদা node)', 'এগোও'],
          ['Part 2.3', 'currNew', 'shared 8', 'হ্যাঁ', 'return 8'],
        ],
        highlightCells: [[3, 2]],
      },
    ],
    edgeCases: [
      'মিলন নেই → A শেষ পর্যন্ত হেঁটে `None`',
      'দুইটা list শুরু থেকেই একই (headA is headB) → Part 2-এর প্রথম ধাপেই return',
      'একটা list খালি → Part 1 বা Part 2-এর loop চলেই না, `None`',
      'একই value কিন্তু আলাদা node → মিলন না (sample 1-এর 1)',
    ],
    deepDiveBn: {
      heading: 'Set-এ value না রেখে node কেন',
      body: '`listB.add(curr)` node object নিজেই রাখে। Python-এ custom class-এর object-এর hash আর `==` ডিফল্টভাবে identity দিয়ে হয় (`id()`), তাই `currNew in listB` সত্যি হয় শুধু যখন একই node, একই value-র অন্য node না। যদি `curr.val` রাখতাম, sample 1-এ A-র 1 দেখে ভুল করে 1 return করতাম। মিলনের পর থেকে দুই list-এর সব node একই, তাই A-তে প্রথম match-টাই intersection। খরচ: B-র জন্য O(n) memory; LeetCode-এর follow-up O(1) memory চায়, সেটা two-pointer switch দিয়ে হয়।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'python',
      code: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None
class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        curr = headB
        listB = set()

        while curr:
            listB.add(curr)
            curr = curr.next


        currNew = headA

        while currNew:
            if currNew in listB:
                return currNew

            currNew = currNew.next

        return None`,
      lineByLine: [
        { line: 'curr = headB; listB = set()', meaning: 'B হাঁটার pointer আর খালি set' },
        { line: 'listB.add(curr)', meaning: 'node নিজেকে রাখো (value না)' },
        { line: 'currNew = headA', meaning: 'এবার A-র শুরু থেকে' },
        { line: 'if currNew in listB: return currNew', meaning: 'B-তেও আছে → এখান থেকেই মিলন' },
        { line: 'return None', meaning: 'A শেষ, কোনো common node নেই' },
      ],
      complexity: { time: 'O(m + n)', space: 'O(n) for the set' },
      note: 'সঠিক আর সহজ, কিন্তু B-র সব node set-এ রাখায় O(n) memory লাগে। LeetCode-এর follow-up O(1) memory চায়: তখন পাশের "Two pointers switch" tab।',
    },
    {
      label: 'Two pointers switch',
      isMine: false,
      optimal: true,
      lang: 'python',
      code: `class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        a, b = headA, headB
        while a is not b:
            a = a.next if a else headB
            b = b.next if b else headA
        return a`,
      complexity: { time: 'O(m + n)', space: 'O(1)' },
      note: '`a` হাঁটে A তারপর B, `b` হাঁটে B তারপর A। দুইজনেই মোট `m + n` ধাপ, তাই length আলাদা হলেও একসাথে মিলনের node-এ পৌঁছায়; মিলন না থাকলে দুইজনেই একসাথে None।',
    },
  ],
  commonMistakes: [
    'Set-এ `curr.val` রাখা: আলাদা node-এর একই value ভুল উত্তর দেয় (sample 1-এর 1)',
    'Two-pointer version-এ `a = a.next if a.next else headB` লেখা: None-এ না থেমে switch করলে মিলন না থাকলে loop কখনো শেষ হয় না',
    'List বদলে ফেলা (যেমন node mark করা): problem list অপরিবর্তিত রাখতে বলে',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'Set-এ কী রাখি, node না value?',
        a: 'Node নিজে (`listB.add(curr)`), identity দিয়ে মিলাতে',
      },
      {
        q: 'O(1) memory-তে কীভাবে?',
        a: 'Two pointers: শেষে পৌঁছালে অন্য list-এর head-এ switch; `while a is not b`',
      },
      { q: 'মিলন না থাকলে switch version কেন থামে?', a: 'দুইজনেই `m + n` ধাপ পরে একসাথে None হয়' },
    ],
    patternToRemember:
      'Seen-set of nodes works; for O(1) space, walk A then B and B then A until the pointers meet.',
    related: [
      { number: 141, title: 'Linked List Cycle', note: 'একই "দেখা node" idea, set বা slow/fast' },
      { number: 142, title: 'Linked List Cycle II', note: 'মিলনের node খোঁজা, Floyd phase 2' },
      { number: 599, title: 'Minimum Index Sum of Two Lists', note: 'একটা মনে রেখে অন্যটা হাঁটা' },
    ],
  },

  visualizationId: 'lc-ll-intersection',
  acceptedOnLeetCode: true,
  meta: {
    generated: ['note', 'approach.idea', 'approach.template', 'solutions.Two pointers switch'],
  },
};

export default problem;

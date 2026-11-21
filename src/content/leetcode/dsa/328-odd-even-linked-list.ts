import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const split = patterns.find((p) => p.id === 'split-and-rejoin')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-328-odd-even-linked-list',
  number: 328,
  title: 'Odd Even Linked List',
  slug: '328-odd-even-linked-list',
  category: 'dsa',
  difficulty: 'Medium',
  url: 'https://leetcode.com/problems/odd-even-linked-list/',
  patternId: 'split-and-rejoin',
  patternLabel: 'Split into odd / even chains, rejoin',
  topicId: 'linked-list',
  tags: ['linked-list', 'in-place', 'reorder'],
  solvedIn: ['python'],
  dateAdded: '2026-11-21',

  problem: {
    oneLineReminder:
      '`odd = head`, `even = head.next`, `evenStart = even`। `while even and even.next`: দুইটার `.next = .next.next`, তারপর দুইটাই এগোয়। শেষে `odd.next = evenStart`।',
    statementBn:
      'একটা singly linked list-এর `head` দেওয়া আছে। বিজোড় **position**-এর (১ম, ৩য়, ৫ম…) সব node আগে, তারপর জোড় position-এর সব node, এভাবে সাজাও। প্রতিটা দলের ভেতরে আগের ক্রম থাকবে। O(1) extra space আর O(n) time-এ করতে হবে। (value না, position।)',
    realLifeExample:
      'লাইনে দাঁড়ানো মানুষদের ১, ২, ১, ২ করে গোনা হলো। "১" রা একটা দলে, "২" রা আরেক দলে হাত ধরে, প্রত্যেকে নিজের দলের পরের জনের হাত ধরে (একজন বাদ দিয়ে)। শেষে "১" দলের শেষ জন "২" দলের প্রথম জনের হাত ধরে।',
    samples: [
      { input: 'head = [1,2,3,4,5]', output: '[1,3,5,2,4]' },
      {
        input: 'head = [2,1,3,5,6,4,7]',
        output: '[2,3,6,7,1,5,4]',
        note: 'position দেখে, value না',
      },
    ],
  },

  approach: {
    triggers: ['odd / even **position** আলাদা করে সাজাও', 'relative order রেখে দুই ভাগ, O(1) space'],
    bruteForce:
      'সব node দুইটা Python list-এ (odd, even) রেখে তারপর নতুন করে জুড়ে দেওয়া: O(n) extra space, problem O(1) চায়।',
    idea: 'একই list-কে দুইটা chain-এ ভাগ করো: `odd` chain (১, ৩, ৫…) আর `even` chain (২, ৪…)। প্রতি ধাপে দুইটা chain-এর শেষ node একটা করে node টপকে নিজের দলের পরের node-এ link করে, তারপর দুইটাই এগোয়। Even chain-এর শুরু (`evenStart`) আগেই মনে রাখো, কারণ শেষে odd chain-এর শেষ node-কে সেখানে জুড়তে হবে।',
    steps: [
      '`if not head or not head.next: return head` (০ বা ১ node)।',
      '`odd = head`, `even = head.next`, `evenStart = even`।',
      '`while even and even.next`: `odd.next = odd.next.next`, `even.next = even.next.next`।',
      '— তারপর `odd = odd.next`, `even = even.next`।',
      '`odd.next = evenStart`, `return head`।',
    ],
    template: { lang: split.lang, code: split.code, whatChanges: split.whatChanges },
  },

  breakdown: {
    variables: [
      {
        name: 'odd',
        role: 'odd chain-এর শেষ node',
        whenChanges: 'প্রতি loop-এ এক ধাপ (দুই node পার)',
      },
      { name: 'even', role: 'even chain-এর শেষ node', whenChanges: 'প্রতি loop-এ' },
      {
        name: 'evenStart',
        role: 'even chain-এর প্রথম node (head.next); শেষে জোড়ার জন্য',
        whenChanges: 'কখনো না',
      },
    ],
    invariant:
      'প্রতি loop-এর পর `head … odd` শুধু odd position, `evenStart … even` শুধু even position, দুইটাই আগের ক্রমে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`[1,2,3,4,5]`)',
        columns: ['ধাপ', 'odd', 'even', 'odd chain', 'even chain'],
        rows: [
          ['শুরু', '1', '2', '1', '2'],
          ['loop 1', '3', '4', '1 → 3', '2 → 4'],
          ['loop 2', '5', 'None', '1 → 3 → 5', '2 → 4'],
          ['জোড়া', '5', 'None', '1 → 3 → 5 → 2 → 4', '(evenStart = 2)'],
        ],
        highlightCells: [[3, 3]],
      },
    ],
    edgeCases: [
      'খালি list বা এক node → শুরুতেই `return head`',
      'দুই node → loop চলে না, `odd.next = evenStart` আগের মতোই, `[1,2]`',
      'জোড় length (শেষ node even) → `even.next` None-এ loop থামে',
      'বিজোড় length (শেষ node odd) → `even` None-এ loop থামে',
    ],
    deepDiveBn: {
      heading: 'Loop-এর শর্ত `even and even.next` কেন',
      body: 'Loop-এর ভেতরে `odd.next.next` মানে `even.next`, আর `even.next.next`। তাই এগোনোর আগে `even` আর `even.next` দুইটাই থাকতে হবে। বিজোড় length-এ শেষে `even` None হয়ে যায়; জোড় length-এ `even` শেষ node-এ থামে (`even.next` None)। দুই অবস্থাতেই `odd` odd chain-এর শেষ node-এ থাকে, আর even chain-এর শেষ `.next` ইতিমধ্যে None (শেষ `even.next = even.next.next` সেটা করে দিয়েছে), তাই cycle হয় না। `evenStart` আগে না রাখলে শেষে even chain-এর শুরু খুঁজে পাওয়া যেত না, কারণ `head.next` ততক্ষণে বদলে odd node-এ চলে গেছে।',
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
    def oddEvenList(self, head: ListNode | None) -> ListNode | None:
        if not head or not head.next:
            return head

        odd = head
        even = head.next
        evenStart = even

        while even and even.next:
            odd.next = odd.next.next
            even.next = even.next.next

            odd = odd.next
            even = even.next

        odd.next = evenStart

        return head`,
      lineByLine: [
        {
          line: 'if not head or not head.next: return head',
          meaning: '০ বা ১ node: কিছু সাজানোর নেই',
        },
        { line: 'odd = head; even = head.next', meaning: 'দুইটা chain-এর শুরু' },
        { line: 'evenStart = even', meaning: 'even chain-এর মাথা মনে রাখো' },
        { line: 'while even and even.next:', meaning: 'দুইটা chain-ই আরেক ধাপ যেতে পারবে' },
        { line: 'odd.next = odd.next.next', meaning: 'odd পরের odd-এ link (even টপকে)' },
        { line: 'even.next = even.next.next', meaning: 'even পরের even-এ link' },
        { line: 'odd = odd.next; even = even.next', meaning: 'দুইটা chain-এর শেষ এগোয়' },
        { line: 'odd.next = evenStart', meaning: 'odd chain-এর পরে even chain জুড়ে দাও' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
  ],
  commonMistakes: [
    '`evenStart` না রেখে শেষে `odd.next = head.next` লেখা: `head.next` ততক্ষণে তৃতীয় node',
    'Value দেখে odd/even ভাগ করা: problem position চায় (sample 2)',
    'Loop শর্তে শুধু `even.next`: বিজোড় length-এ `even` None হলে error',
  ],

  revise: {
    selfQuestions: [
      { q: 'কোন তিনটা variable?', a: '`odd`, `even`, `evenStart`' },
      { q: 'Loop-এর শর্ত?', a: '`while even and even.next`' },
      { q: 'শেষ লাইন কী?', a: '`odd.next = evenStart`' },
    ],
    patternToRemember:
      'Grow two chains in place, each skipping one node; remember the second head and link it last.',
    related: [
      { number: 86, title: 'Partition List', note: 'একই split + rejoin, দুইটা dummy দিয়ে' },
      { number: 143, title: 'Reorder List', note: 'middle + reverse + weave' },
      { number: 725, title: 'Split Linked List in Parts', note: 'list ভাগ করা' },
    ],
  },

  visualizationId: 'lc-ll-odd-even',
  acceptedOnLeetCode: true,
  meta: { generated: ['note', 'approach.idea'] },
};

export default problem;

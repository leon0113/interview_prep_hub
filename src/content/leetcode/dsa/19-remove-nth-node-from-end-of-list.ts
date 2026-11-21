import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const gap = patterns.find((p) => p.id === 'gap-pointer')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-19-remove-nth-node-from-end-of-list',
  number: 19,
  title: 'Remove Nth Node From End of List',
  slug: '19-remove-nth-node-from-end-of-list',
  category: 'dsa',
  difficulty: 'Medium',
  url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
  patternId: 'gap-pointer',
  alsoPatterns: ['dummy-node'],
  patternLabel: 'Gap pointer + dummy (one pass)',
  topicId: 'linked-list',
  tags: ['linked-list', 'two-pointers', 'dummy-node'],
  solvedIn: ['python'],
  dateAdded: '2026-11-21',

  problem: {
    oneLineReminder:
      '`x = y = dummy`; `x` আগে `n` ধাপ; তারপর `while x.next` দুইজন একসাথে; শেষে `y.next = y.next.next`, return `dummy.next`।',
    statementBn:
      'একটা linked list-এর `head` আর `n` দেওয়া আছে। শেষ থেকে `n`-তম node মুছে head return করো। Follow-up: এক pass-এ করতে পারবে?',
    realLifeExample:
      'একটা লম্বা লাইনে শেষ থেকে দ্বিতীয় জনকে বের করতে চাই, কিন্তু লাইন কত লম্বা জানি না। একজন বন্ধুকে আমার ২ জন সামনে দাঁড় করিয়ে দুইজন একসাথে হাঁটি। বন্ধু যখন লাইনের শেষ মানুষের কাছে পৌঁছায়, আমি ঠিক যাকে বের করতে হবে তার আগে দাঁড়িয়ে আছি।',
    samples: [
      { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]', note: 'শেষ থেকে ২য় = 4' },
      { input: 'head = [1], n = 1', output: '[]', note: 'head নিজেই মুছে যায়' },
      { input: 'head = [1,2], n = 1', output: '[1]' },
    ],
  },

  approach: {
    triggers: [
      '"n-th node from the end"',
      'length জানা নেই, এক pass-এ',
      'head নিজেও মুছতে পারে → dummy',
    ],
    bruteForce:
      'প্রথম pass-এ length `L` গুনে, দ্বিতীয় pass-এ `L - n` ধাপ গিয়ে পরেরটা মুছে দেওয়া। O(n), কিন্তু দুই pass।',
    idea: 'দুইটা pointer `x` আর `y`, দুইটাই `dummy` থেকে। আগে `x`-কে `n` ধাপ এগিয়ে দাও, তাহলে দুইজনের মধ্যে ফাঁক `n`। তারপর `x.next` থাকা পর্যন্ত দুইজনকে একসাথে এগোও। `x` যখন শেষ node-এ, `y` ঠিক মুছতে হবে এমন node-এর **আগে**, তাই `y.next = y.next.next`। Dummy থাকায় head মুছলেও `y` (dummy) থাকে।',
    steps: [
      '`dummy = ListNode(0)`, `dummy.next = head`, `x = y = dummy`।',
      '`for _ in range(n): x = x.next` (x আগে n ধাপ)।',
      '`while x.next`: `x = x.next`, `y = y.next`।',
      '`y.next = y.next.next` (শেষ থেকে n-তম মুছে গেল)।',
      '`return dummy.next`।',
    ],
    template: {
      lang: gap.lang,
      code: gap.code,
      whatChanges: `${gap.whatChanges} তোমার কোডে \`x\` n ধাপ যায় আর loop \`while x.next\`; template-এ n+1 ধাপ আর \`while fast\`। দুইটাই একই জায়গায় থামে।`,
    },
  },

  breakdown: {
    variables: [
      { name: 'dummy', role: 'head-এর আগের node; head মুছলেও `y` এখানে থাকতে পারে' },
      {
        name: 'x',
        role: 'সামনের pointer; শেষে শেষ node-এ',
        whenChanges: 'প্রথমে একা n ধাপ, পরে y-র সাথে',
      },
      {
        name: 'y',
        role: 'পেছনের pointer; শেষে মুছতে হবে এমন node-এর আগে',
        whenChanges: 'শুধু while loop-এ',
      },
    ],
    invariant: 'For loop-এর পর থেকে `x` সবসময় `y`-র ঠিক `n` node সামনে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`[1,2,3,4,5]`, n = 2)',
        columns: ['ধাপ', 'x', 'y', 'কাজ'],
        rows: [
          ['শুরু', 'dummy', 'dummy', 'x = y = dummy'],
          ['for 1', '1', 'dummy', 'x = x.next'],
          ['for 2', '2', 'dummy', 'ফাঁক এখন 2'],
          ['while 1', '3', '1', 'দুইজন এগোয়'],
          ['while 2', '4', '2', ''],
          ['while 3', '5', '3', 'x.next = None → থামো'],
          ['মুছো', '5', '3', '3.next = 5 → [1,2,3,5]'],
        ],
        highlightCells: [[6, 2]],
      },
      {
        kind: 'table',
        title: 'Trace (`[1]`, n = 1): head মুছে যায়',
        columns: ['ধাপ', 'x', 'y', 'কাজ'],
        rows: [
          ['শুরু', 'dummy', 'dummy', ''],
          ['for 1', '1', 'dummy', 'x.next = None, while চলে না'],
          ['মুছো', '1', 'dummy', 'dummy.next = None → []'],
        ],
      },
    ],
    edgeCases: [
      '`n` = list-এর length (head মুছতে হবে) → `y` dummy-তেই থাকে, dummy থাকায় কাজ করে',
      'এক node, n = 1 → খালি list',
      'n = 1 → শেষ node মুছে যায়',
      'Constraint অনুযায়ী `1 <= n <= length`, তাই `x` for loop-এ None হয় না',
    ],
    deepDiveBn: {
      heading: 'n ধাপের ফাঁক কেন ঠিক জায়গায় থামায়',
      body: 'Length `L` হলে শেষ থেকে n-তম node হলো শুরু থেকে `L - n + 1`-তম। `x` আগে n ধাপ গেছে, তারপর `while x.next` চলে যতক্ষণ না `x` শেষ node-এ (dummy থেকে L ধাপ দূরে) পৌঁছায়, মানে আরও `L - n` ধাপ। `y`-ও ঠিক `L - n` ধাপ গেছে, অর্থাৎ শুরু থেকে `L - n`-তম node-এ (বা dummy-তে, যদি `L = n`)। তার পরেরটাই শেষ থেকে n-তম, তাই `y.next = y.next.next`। Dummy না থাকলে head মুছার case (`L = n`)-এ `y`-র আগে কোনো node থাকত না।',
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
    def removeNthFromEnd(self, head: ListNode | None, n: int) -> ListNode | None:
        dummy = ListNode(0)
        dummy.next = head
        x = y = dummy

        for _ in range(n):
            x = x.next

        while x.next:
            x = x.next
            y = y.next

        y.next = y.next.next

        return dummy.next`,
      lineByLine: [
        { line: 'dummy = ListNode(0); dummy.next = head', meaning: 'head মুছলেও আগের node থাকে' },
        { line: 'x = y = dummy', meaning: 'দুইজন একই জায়গা থেকে' },
        { line: 'for _ in range(n): x = x.next', meaning: 'x-কে n ধাপ এগিয়ে ফাঁক তৈরি' },
        { line: 'while x.next:', meaning: 'x শেষ node-এ না পৌঁছানো পর্যন্ত' },
        { line: 'x = x.next; y = y.next', meaning: 'একসাথে এগোয়, ফাঁক n-ই থাকে' },
        { line: 'y.next = y.next.next', meaning: 'শেষ থেকে n-তম node বাদ' },
        { line: 'return dummy.next', meaning: 'নতুন head' },
      ],
      complexity: { time: 'O(n), one pass', space: 'O(1)' },
    },
    {
      label: 'Two passes: count, then walk',
      isMine: false,
      lang: 'python',
      code: `class Solution:
    def removeNthFromEnd(self, head: ListNode | None, n: int) -> ListNode | None:
        length = 0
        cur = head
        while cur:
            length += 1
            cur = cur.next
        dummy = ListNode(0, head)
        cur = dummy
        for _ in range(length - n):
            cur = cur.next
        cur.next = cur.next.next
        return dummy.next`,
      complexity: { time: 'O(n), two passes', space: 'O(1)' },
      note: 'সহজ, কিন্তু list দুইবার হাঁটে। Interviewer সাধারণত follow-up-এ এক pass চায়, সেটা তোমার solution।',
    },
  ],
  commonMistakes: [
    'Dummy ছাড়া `x = y = head` দিয়ে শুরু করা: n = length হলে head মুছার জন্য আগের node থাকে না',
    'Loop `while x:` দিয়ে n ধাপ ফাঁকে চালানো: y এক ধাপ বেশি চলে যায়, ভুল node মুছে (তখন x-কে n+1 ধাপ দিতে হয়)',
    '`return head`: head মুছে গেলে পুরনো head return হয়',
  ],

  revise: {
    selfQuestions: [
      { q: 'x প্রথমে কত ধাপ যায়?', a: '`n` ধাপ (dummy থেকে)' },
      { q: 'While loop-এর শর্ত?', a: '`while x.next` (x শেষ node-এ থামে)' },
      { q: 'y কোথায় থামে?', a: 'মুছতে হবে এমন node-এর ঠিক আগে' },
    ],
    patternToRemember:
      'Give the front pointer an n-step head start; when it hits the end, the back pointer is just before the target.',
    related: [
      { number: 876, title: 'Middle of the Linked List', note: 'আরেক দুই-pointer trick: slow/fast' },
      { number: 61, title: 'Rotate List', note: 'শেষ থেকে k-তম জায়গায় কাটা' },
      { number: 203, title: 'Remove Linked List Elements', note: 'dummy দিয়ে মুছা' },
    ],
  },

  visualizationId: 'lc-ll-remove-nth',
  acceptedOnLeetCode: true,
  meta: { generated: ['note', 'approach.idea', 'solutions.Two passes: count, then walk'] },
};

export default problem;

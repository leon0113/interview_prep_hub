import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const dummyNode = patterns.find((p) => p.id === 'dummy-node')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-203-remove-linked-list-elements',
  number: 203,
  title: 'Remove Linked List Elements',
  slug: '203-remove-linked-list-elements',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/remove-linked-list-elements/',
  patternId: 'dummy-node',
  patternLabel: 'Dummy node + prev',
  topicId: 'linked-list',
  tags: ['linked-list', 'dummy-node', 'deletion'],
  solvedIn: ['python'],
  dateAdded: '2026-11-21',

  problem: {
    oneLineReminder:
      '`dummy.next = head`, `prev = dummy`। `prev.next.val == val` হলে `prev.next = prev.next.next` (prev থাকে), না হলে `prev = prev.next`। শেষে `dummy.next`।',
    statementBn:
      'একটা linked list-এর `head` আর একটা সংখ্যা `val` দেওয়া আছে। যে সব node-এর value `val`-এর সমান, সব মুছে ফেলো, তারপর নতুন head return করো।',
    realLifeExample:
      'ট্রেন থেকে নষ্ট বগিগুলো খুলে ফেলা। একটা বগি খুলতে হলে তার **আগের** বগির হুক পরের বগিতে লাগাতে হয়। প্রথম বগিটাই নষ্ট হলে আগের বগি নেই, তাই সামনে একটা নকল ইঞ্জিন (dummy) জুড়ে দিই: এখন সব বগির আগেই কিছু একটা আছে।',
    samples: [
      { input: 'head = [1,2,6,3,4,5,6], val = 6', output: '[1,2,3,4,5]' },
      { input: 'head = [], val = 1', output: '[]' },
      { input: 'head = [7,7,7,7], val = 7', output: '[]', note: 'head সহ সব মুছে যায়' },
    ],
  },

  approach: {
    triggers: [
      'linked list থেকে node মুছতে হবে, head নিজেও মুছতে পারে',
      '"আগের node" লাগে (তার `.next` বদলাতে হয়)',
    ],
    bruteForce:
      'Dummy ছাড়া: আগে head-এ যতক্ষণ match ততক্ষণ `head = head.next`, তারপর বাকি list-এ আলাদা loop। কাজ করে, কিন্তু দুইটা আলাদা case লিখতে হয়।',
    idea: 'Head-এর আগে একটা `dummy` node বসাও, তাহলে প্রতিটা node-এর আগে একটা node থাকে, head-ও আলাদা case না। `prev` সবসময় সেই node-এ থাকে যার **পরেরটা** পরীক্ষা করছি। পরেরটা match করলে link টপকে দাও কিন্তু `prev` সরাবে না (নতুন পরেরটাও match করতে পারে); না করলে `prev` এক ধাপ এগোও।',
    steps: [
      '`dummy = ListNode(0)`, `dummy.next = head`, `prev = dummy`।',
      'যতক্ষণ `prev and prev.next`:',
      '— `prev.next.val == val` হলে `prev.next = prev.next.next` (prev একই জায়গায়)।',
      '— না হলে `prev = prev.next`।',
      '`return dummy.next` (head মুছে গেলেও ঠিক head)।',
    ],
    template: { lang: dummyNode.lang, code: dummyNode.code, whatChanges: dummyNode.whatChanges },
  },

  breakdown: {
    variables: [
      { name: 'dummy', role: 'head-এর আগের নকল node; শেষে `dummy.next` = নতুন head' },
      {
        name: 'prev',
        role: 'যে node-এর পরেরটা পরীক্ষা হচ্ছে',
        whenChanges: 'শুধু পরেরটা রাখলে এগোয়; মুছলে একই জায়গায় থাকে',
      },
    ],
    invariant: '`dummy` থেকে `prev` পর্যন্ত কোনো node-এর value `val` না।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`[1,2,6,3,4,5,6]`, val = 6)',
        columns: ['prev', 'prev.next', 'match?', 'কাজ'],
        rows: [
          ['dummy', '1', 'না', 'prev = 1'],
          ['1', '2', 'না', 'prev = 2'],
          ['2', '6', 'হ্যাঁ', '2.next = 3 (prev থাকে)'],
          ['2', '3', 'না', 'prev = 3'],
          ['3', '4', 'না', 'prev = 4'],
          ['4', '5', 'না', 'prev = 5'],
          ['5', '6', 'হ্যাঁ', '5.next = None'],
          ['5', 'None', '—', 'loop শেষ → [1,2,3,4,5]'],
        ],
        highlightCells: [
          [2, 3],
          [6, 3],
        ],
      },
      {
        kind: 'table',
        title: 'Trace (`[7,7,7,7]`, val = 7): head নিজেই মুছে যায়',
        columns: ['prev', 'prev.next', 'match?', 'কাজ'],
        rows: [
          ['dummy', '7', 'হ্যাঁ', 'dummy.next = দ্বিতীয় 7'],
          ['dummy', '7', 'হ্যাঁ', 'dummy.next = তৃতীয় 7'],
          ['dummy', '7', 'হ্যাঁ', 'dummy.next = চতুর্থ 7'],
          ['dummy', '7', 'হ্যাঁ', 'dummy.next = None'],
          ['dummy', 'None', '—', 'return dummy.next = []'],
        ],
      },
    ],
    edgeCases: [
      'খালি list → loop চলে না, `dummy.next` = None',
      'সব node মুছে যায় (`[7,7,7,7]`) → prev dummy-তেই থাকে, return None',
      'পরপর কয়েকটা match → prev না সরানোয় সবগুলো মুছে যায়',
      'কোনো match নেই → list অপরিবর্তিত',
    ],
    deepDiveBn: {
      heading: 'মুছলে prev কেন সরে না',
      body: '`prev.next = prev.next.next` করার পর `prev.next` একটা নতুন node, যেটা এখনো পরীক্ষা হয়নি। যদি সাথে সাথে `prev = prev.next` করতাম, সেই নতুন node পরীক্ষা ছাড়াই পার হয়ে যেত, তাই `[1,6,6,2]`-এ দ্বিতীয় 6 থেকে যেত। এজন্য if/else: মুছলে prev থাকে, রাখলে এগোয়। আর dummy থাকায় head-এর জন্য আলাদা কোড লাগে না, শেষে `dummy.next`-ই সঠিক head, এমনকি head মুছে গেলেও।',
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
    def removeElements(self, head: ListNode | None, val: int) -> ListNode | None:
        dummy = ListNode(0)
        dummy.next = head
        prev = dummy

        while prev and prev.next:
            if prev.next.val == val:
                prev.next = prev.next.next
            else:
                prev = prev.next

        return dummy.next`,
      lineByLine: [
        { line: 'dummy = ListNode(0); dummy.next = head', meaning: 'head-এর আগে নকল node' },
        { line: 'prev = dummy', meaning: 'পরীক্ষা শুরু head থেকে (prev-এর পরেরটা)' },
        { line: 'while prev and prev.next:', meaning: 'পরীক্ষা করার মতো পরের node আছে' },
        { line: 'prev.next = prev.next.next', meaning: 'match: link টপকে মুছে দাও, prev থাকে' },
        { line: 'prev = prev.next', meaning: 'match না: node রাখো, এগোও' },
        { line: 'return dummy.next', meaning: 'নতুন head (মুছে গেলেও ঠিক)' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
      note: 'Paste করা কোডে প্রথম লাইনটা `dummy = ListNode(0)`-এর বদলে শুধু `6` এসেছিল, যেটা চালালে `NameError: dummy` হয়। তোমার #19-এর মতো `dummy = ListNode(0)` বসিয়েছি; বাকি সব হুবহু।',
    },
    {
      label: 'Without a dummy node',
      isMine: false,
      lang: 'python',
      code: `class Solution:
    def removeElements(self, head: ListNode | None, val: int) -> ListNode | None:
        while head and head.val == val:   # শুরুর match গুলো আলাদা করে
            head = head.next
        cur = head
        while cur and cur.next:
            if cur.next.val == val:
                cur.next = cur.next.next
            else:
                cur = cur.next
        return head`,
      complexity: { time: 'O(n)', space: 'O(1)' },
      note: 'একই কাজ, কিন্তু head-এর জন্য আলাদা loop লাগে। Dummy node ঠিক এই extra case-টা মুছে দেয়।',
    },
  ],
  commonMistakes: [
    'মুছার পরেও `prev = prev.next` করা: পরপর দুইটা match-এর দ্বিতীয়টা থেকে যায়',
    '`return head` করা: head নিজে মুছে গেলে পুরনো (মুছে যাওয়া) node return হয়',
    'Loop-এ শুধু `while prev.next` না দিয়ে `while prev` দেওয়া আর ভেতরে `prev.next.val` পড়া: শেষে None-এর `.val` error',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'Dummy কেন লাগে?',
        a: 'Head নিজেও মুছতে পারে; dummy থাকলে সব node-এর আগে একটা node থাকে',
      },
      { q: 'মুছার পর prev এগোয়?', a: 'না, নতুন `prev.next` আবার পরীক্ষা করতে হয়' },
      { q: 'কী return করি?', a: '`dummy.next`' },
    ],
    patternToRemember:
      'Dummy before head; look at prev.next; delete by skipping, advance only when you keep.',
    related: [
      {
        number: 83,
        title: 'Remove Duplicates from Sorted List',
        note: 'একই skip, শর্ত পাশের value',
      },
      { number: 19, title: 'Remove Nth Node From End of List', note: 'dummy + gap pointer' },
      { number: 27, title: 'Remove Element', note: 'array version: read/write pointers' },
    ],
  },

  visualizationId: 'lc-ll-remove-val',
  acceptedOnLeetCode: true,
  meta: { generated: ['note', 'approach.idea', 'solutions.Without a dummy node'] },
};

export default problem;

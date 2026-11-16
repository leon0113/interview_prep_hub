import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const reverse = patterns.find((p) => p.id === 'reverse-in-place')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-206-reverse-linked-list',
  number: 206,
  title: 'Reverse Linked List',
  slug: '206-reverse-linked-list',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/reverse-linked-list/',
  patternId: 'reverse-in-place',
  patternLabel: 'Reverse in Place (prev / curr / temp)',
  topicId: 'linked-list',
  tags: ['linked-list', 'reverse', 'pointers'],
  solvedIn: ['python'],
  dateAdded: '2026-11-16',

  problem: {
    oneLineReminder:
      '`prev = None`, `curr = head`। প্রতি ধাপে: `temp = curr.next` (সেভ), `curr.next = prev` (উল্টাও), `prev = curr`, `curr = temp` (এগোও, এগোও)। শেষে `prev`-ই নতুন head।',
    statementBn:
      'একটা singly linked list-এর `head` দেওয়া আছে। পুরো list উল্টে দিয়ে নতুন head return করো।',
    realLifeExample:
      'লাইনে দাঁড়ানো প্রত্যেকে সামনের জনের কাঁধে হাত রেখেছে। উল্টাতে হলে একজন একজন করে হাতটা পেছনের জনের কাঁধে সরাও। হাত সরানোর আগে সামনের জন কে ছিল মনে রাখতে হয় (`temp`), নইলে বাকি লাইন হারিয়ে যাবে।',
    samples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
  },

  approach: {
    triggers: ['"reverse a linked list"', 'list-এর দিক উল্টাতে হবে, O(1) extra space'],
    bruteForce:
      'সব value একটা Python list-এ নিয়ে উল্টো ক্রমে নতুন node বানানো, বা value গুলো উল্টো করে আবার লেখা। O(n) extra space, আর interviewer pointer উল্টানোটাই দেখতে চায়।',
    idea: 'তিনটা pointer: `prev` (উল্টানো অংশের head), `curr` (এখন যে node), `temp` (পরেরটা যাতে না হারায়)। প্রতিটা node-এর তীর এক এক করে পিছনের দিকে ঘুরিয়ে দাও। `curr` None হলে সব উল্টানো শেষ, `prev` নতুন head।',
    steps: [
      '`prev = None`, `curr = head`।',
      'যতক্ষণ `curr`:',
      '`temp = curr.next` — পরের node মনে রাখো।',
      '`curr.next = prev` — তীর উল্টাও।',
      '`prev = curr`, তারপর `curr = temp` — দুজনেই এক ধাপ এগোও।',
      'Loop শেষে `head = prev`, return `head`।',
    ],
    template: { lang: reverse.lang, code: reverse.code, whatChanges: reverse.whatChanges },
  },

  breakdown: {
    variables: [
      {
        name: 'prev',
        role: 'উল্টানো অংশের head (শুরুতে None)',
        whenChanges: 'প্রতি ধাপে `prev = curr`',
      },
      { name: 'curr', role: 'এখন যে node-এর তীর উল্টাবো', whenChanges: 'প্রতি ধাপে `curr = temp`' },
      {
        name: 'temp',
        role: 'curr-এর পুরানো next, যাতে বাকি list না হারায়',
        whenChanges: 'প্রতি ধাপের শুরুতে',
      },
    ],
    invariant:
      'প্রতি ধাপের পরে: `prev` থেকে শুরু করলে এখন পর্যন্ত দেখা সব node উল্টো ক্রমে পাওয়া যায়, আর `curr` থেকে বাকি (এখনো না-উল্টানো) list।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`1 → 2 → 3 → None`, notes section 9.1-এর মতো)',
        columns: ['ধাপ', 'prev', 'curr', 'temp', 'কী হলো', 'অবস্থা'],
        rows: [
          ['শুরু', 'None', '1', '–', '–', '1→2→3→None'],
          ['1', '1', '2', '2', '1-এর তীর None-এর দিকে', 'None←1   2→3'],
          ['2', '2', '3', '3', '2-এর তীর 1-এর দিকে', 'None←1←2   3'],
          ['3', '3', 'None', 'None', '3-এর তীর 2-এর দিকে', 'None←1←2←3'],
          ['শেষ', 'head = 3', '', '', '', '3→2→1→None'],
        ],
        highlightCells: [[4, 5]],
      },
    ],
    edgeCases: [
      'খালি list → loop চলে না, `prev = None` return',
      'একটা node → এক ধাপে `1.next = None`, head = 1',
      '`temp` ছাড়া `curr.next = prev` লিখলে বাকি list চিরতরে হারিয়ে যায়',
    ],
    deepDiveBn: {
      heading: 'কেন temp লাগে',
      body: '`curr.next = prev` লেখার সাথে সাথে `curr`-এর পুরানো next-এর সাথে যোগাযোগ কেটে যায়। আগে থেকে `temp`-এ রেখে না দিলে বাকি list-এ আর পৌঁছানো যাবে না। তাই ক্রম সবসময়: **সেভ করো (temp), উল্টাও (curr.next = prev), এগোও (prev = curr), এগোও (curr = temp)**। Loop শেষে `curr` None, আর `prev` শেষ node-এ, যেটা এখন নতুন head।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'python',
      code: `#         self.next = next
class Solution:
    def reverseList(self, head: ListNode | None) -> ListNode | None:
        prev = None
        curr = head
        while curr:
            temp = curr.next
            curr.next = prev
            prev = curr
            curr = temp
        head = prev

        return head`,
      lineByLine: [
        { line: 'prev = None', meaning: 'উল্টানো list শুরুতে খালি; প্রথম node-এর তীর None-এ যাবে' },
        { line: 'curr = head', meaning: 'প্রথম node থেকে শুরু' },
        { line: 'temp = curr.next', meaning: '১. পরেরটা মনে রাখো' },
        { line: 'curr.next = prev', meaning: '২. তীর উল্টে দাও' },
        { line: 'prev = curr', meaning: '৩. prev এক ধাপ এগোও' },
        { line: 'curr = temp', meaning: '৪. curr এক ধাপ এগোও' },
        { line: 'head = prev', meaning: 'শেষ node-ই এখন head' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'Recursive (from my notes)',
      isMine: false,
      lang: 'python',
      code: `def reverse_recursive(node):
    # Base case: খালি বা একটাই node — এটাই নতুন head
    if node is None or node.next is None:
        return node
    new_head = reverse_recursive(node.next)  # বাকি অংশ উল্টাও
    node.next.next = node   # আমার পরের node এখন আমাকে point করবে
    node.next = None        # আমি এখন শেষ, তাই None
    return new_head`,
      complexity: { time: 'O(n)', space: 'O(n) call stack' },
      note: 'Linked List notes, section 9.2। Recursion আগে একদম শেষ পর্যন্ত নামে, ফেরার পথে তীর উল্টায়। Python-এর recursion limit (~1000) এর কারণে বড় list-এ `RecursionError`, তাই iterative version ভালো।',
    },
  ],
  commonMistakes: [
    '`temp` না রেখে আগে `curr.next = prev` করা: বাকি list হারিয়ে যায়',
    'শেষে `curr` return করা: সেটা None; নতুন head হলো `prev`',
    '`prev`-কে `head` দিয়ে শুরু করা: প্রথম node নিজেকেই point করে cycle হয়ে যায়',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'Loop-এর চারটা লাইন কোন ক্রমে?',
        a: '`temp = curr.next`, `curr.next = prev`, `prev = curr`, `curr = temp` (সেভ, উল্টাও, এগোও, এগোও)',
      },
      { q: 'Loop শেষে নতুন head কোনটা?', a: '`prev`' },
    ],
    patternToRemember:
      'Save next, flip the arrow, move prev, move curr; prev ends as the new head.',
    related: [
      { number: 234, title: 'Palindrome Linked List', note: 'দ্বিতীয় অর্ধেক reverse' },
      { number: 92, title: 'Reverse Linked List II' },
      { number: 25, title: 'Reverse Nodes in k-Group' },
    ],
  },

  visualizationId: 'lc-ll-reverse',
  acceptedOnLeetCode: true,
  meta: { generated: ['note', 'approach.idea'] },
};

export default problem;

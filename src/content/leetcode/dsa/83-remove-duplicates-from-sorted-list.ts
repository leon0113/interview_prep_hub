import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const traverse = patterns.find((p) => p.id === 'linked-list-traversal')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-83-remove-duplicates-from-sorted-list',
  number: 83,
  title: 'Remove Duplicates from Sorted List',
  slug: '83-remove-duplicates-from-sorted-list',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list/',
  patternId: 'linked-list-traversal',
  patternLabel: 'Traverse + skip equal neighbour',
  topicId: 'linked-list',
  tags: ['linked-list', 'sorted', 'deletion'],
  solvedIn: ['python'],
  dateAdded: '2026-11-21',

  problem: {
    oneLineReminder:
      '`curr = head`; `while curr and curr.next`: সমান হলে `curr.next = curr.next.next` (curr থাকে), না হলে `curr = curr.next`। Return `head`।',
    statementBn:
      'একটা **sorted** linked list-এর `head` দেওয়া আছে। Duplicate মুছে দাও যাতে প্রতিটা value একবারই থাকে, তারপর sorted list-টাই return করো।',
    realLifeExample:
      'উচ্চতা অনুযায়ী সাজানো লাইনে একই উচ্চতার মানুষ পাশাপাশিই থাকে। প্রত্যেকে শুধু ঠিক পেছনের জনের দিকে তাকায়: একই উচ্চতা হলে তাকে বের করে দেয়, আলাদা হলে পরের জনের পালা।',
    samples: [
      { input: 'head = [1,1,2]', output: '[1,2]' },
      { input: 'head = [1,1,2,3,3]', output: '[1,2,3]' },
    ],
  },

  approach: {
    triggers: ['"sorted" list থেকে duplicate বাদ', 'সমান value গুলো পাশাপাশি'],
    bruteForce:
      'Set-এ দেখা value রেখে প্রতিটা node পরীক্ষা: O(n) extra space। কিন্তু list sorted, তাই শুধু পাশের node-এর সাথে তুলনাই যথেষ্ট।',
    idea: 'Sorted হওয়ায় duplicate গুলো সবসময় পাশাপাশি। `curr` দিয়ে হাঁটো আর শুধু `curr.next`-এর সাথে তুলনা করো: সমান হলে `curr.next`-কে টপকে দাও এবং `curr` জায়গায় রাখো (পরেরটাও সমান হতে পারে); আলাদা হলে `curr` এগোও। Head কখনো মুছে না (প্রথম copy থাকে), তাই dummy লাগে না।',
    steps: [
      '`curr = head`।',
      'যতক্ষণ `curr and curr.next`:',
      '— `curr.val == curr.next.val` হলে `curr.next = curr.next.next`।',
      '— না হলে `curr = curr.next`।',
      '`return head`।',
    ],
    template: { lang: traverse.lang, code: traverse.code, whatChanges: traverse.whatChanges },
  },

  breakdown: {
    variables: [
      {
        name: 'curr',
        role: 'প্রতিটা value-র প্রথম node; তার পরের duplicate গুলো মুছে',
        whenChanges: 'শুধু পরের value আলাদা হলে এগোয়',
      },
    ],
    invariant: '`head` থেকে `curr` পর্যন্ত সব value আলাদা (strictly increasing)।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`[1,1,2,3,3]`)',
        columns: ['curr', 'curr.next', 'সমান?', 'কাজ'],
        rows: [
          ['1', '1', 'হ্যাঁ', '1.next = 2 (curr থাকে)'],
          ['1', '2', 'না', 'curr = 2'],
          ['2', '3', 'না', 'curr = 3'],
          ['3', '3', 'হ্যাঁ', '3.next = None'],
          ['3', 'None', '—', 'loop শেষ → [1,2,3]'],
        ],
        highlightCells: [
          [0, 2],
          [3, 2],
        ],
      },
    ],
    edgeCases: [
      'খালি list → loop চলে না, `None` return',
      'সব একই (`[1,1,1]`) → curr head-এই থাকে, সব পরেরটা মুছে যায়',
      'কোনো duplicate নেই → শুধু হাঁটা, কিছু বদলায় না',
    ],
    deepDiveBn: {
      heading: 'কেন শুধু পাশেরটার সাথে তুলনা যথেষ্ট',
      body: 'List sorted, তাই একই value-র সব node একটা টানা অংশে থাকে। `curr` সেই অংশের প্রথম node; যতক্ষণ `curr.next`-এর value একই, ততক্ষণ সেটা টপকে দাও। মুছার পর `curr` সরে না, কারণ নতুন `curr.next`-ও একই value হতে পারে (`[1,1,1]`)। আলাদা value এলে সেই অংশ শেষ, `curr` এগোয়। প্রতিটা value-র প্রথম node কখনো মুছে না, তাই head একই থাকে, dummy লাগে না। (#82, যেখানে duplicate-এর সব copy মুছতে হয়, সেখানে head মুছতে পারে, তখন dummy লাগে।)',
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
    def deleteDuplicates(self, head: ListNode | None) -> ListNode | None:
        curr = head

        while curr and curr.next:
            if curr.val == curr.next.val:
                curr.next = curr.next.next
            else:
                curr = curr.next

        return head`,
      lineByLine: [
        { line: 'curr = head', meaning: 'শুরু থেকে হাঁটো' },
        { line: 'while curr and curr.next:', meaning: 'তুলনার জন্য পাশের node আছে' },
        { line: 'if curr.val == curr.next.val:', meaning: 'পাশেরটা duplicate' },
        { line: 'curr.next = curr.next.next', meaning: 'duplicate টপকে দাও, curr থাকে' },
        { line: 'curr = curr.next', meaning: 'নতুন value, এগোও' },
        { line: 'return head', meaning: 'head কখনো মুছে না' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
  ],
  commonMistakes: [
    'মুছার পরও `curr = curr.next` করা: তিনটা একই value থাকলে একটা duplicate থেকে যায়',
    'শুধু `while curr.next:` লেখা: খালি list-এ `None.next` error',
    'Unsorted list-এও একই কোড চালানো: পাশে না থাকা duplicate ধরা পড়ে না (তখন set লাগে)',
  ],

  revise: {
    selfQuestions: [
      { q: 'Dummy লাগে না কেন?', a: 'প্রতিটা value-র প্রথম node থাকে, তাই head কখনো মুছে না' },
      { q: 'মুছার পর curr এগোয়?', a: 'না, নতুন `curr.next`-ও একই হতে পারে' },
    ],
    patternToRemember:
      'Sorted list: compare with the next node; skip it while equal, advance when different.',
    related: [
      {
        number: 82,
        title: 'Remove Duplicates from Sorted List II',
        note: 'সব copy মুছো → dummy লাগে',
      },
      {
        number: 26,
        title: 'Remove Duplicates from Sorted Array',
        note: 'array version: read/write pointers',
      },
      { number: 203, title: 'Remove Linked List Elements', note: 'একই skip, শর্ত value' },
    ],
  },

  visualizationId: 'lc-ll-dedupe',
  acceptedOnLeetCode: true,
  meta: { generated: ['note', 'approach.idea'] },
};

export default problem;

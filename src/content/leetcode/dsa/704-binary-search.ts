import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const binaryTemplate = patterns.find((p) => p.id === 'binary-search')!.templates[0]!;
const NUMS = [-1, 0, 3, 5, 9, 12];

const problem: LcProblem = {
  id: 'lc-704-binary-search',
  number: 704,
  title: 'Binary Search',
  slug: '704-binary-search',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/binary-search/',
  patternId: 'binary-search',
  patternLabel: 'Binary Search (halve the search range)',
  tags: ['array', 'binary-search', 'sorted'],
  solvedIn: ['python'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder:
      'মাঝখানে দেখো। বড় হলে `right = mid - 1`, ছোট হলে `left = mid + 1`। `left <= right` পর্যন্ত চলবে।',
    statementBn:
      'একটা sorted (ছোট থেকে বড়) array আর একটা `target` দেওয়া আছে। `target` কোন index এ আছে return করো, না থাকলে `-1`। O(log n) এ করতে হবে।',
    realLifeExample:
      'অভিধানে একটা শব্দ খুঁজছো। মাঝখান থেকে খোলো। তোমার শব্দ যদি এই পাতার আগে আসে, ডান অর্ধেক পুরোটা বাদ, বাম অর্ধেকের মাঝখান খোলো। প্রতিবার অর্ধেক বাদ দিতে দিতে শব্দটা পেয়ে যাবে।',
    samples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
  },

  approach: {
    triggers: [
      '"sorted array"',
      '"O(log n) runtime"',
      '"find the position of a target" / "first / last position" / "smallest value that works"',
    ],
    bruteForce:
      'বাম থেকে ডানে একটা একটা দেখা → O(n)। Sorted বলে প্রতি তুলনায় অর্ধেক array বাদ দেওয়া যায়।',
    idea: 'যে range এ target থাকতে পারে সেটা `left...right` দিয়ে ধরে রাখো। মাঝের মান দেখে যে অর্ধেকে target থাকতে পারে না সেটা বাদ দাও। Range খালি হলে target নেই।',
    steps: [
      '`left = 0`, `right = n - 1`।',
      'যতক্ষণ `left <= right`, `middle` বের করো।',
      '`nums[middle] == target` → `middle` return।',
      '`nums[middle] > target` → target বামে, `right = middle - 1`।',
      'না হলে → target ডানে, `left = middle + 1`।',
      'Loop শেষ হলে `-1`।',
    ],
    template: {
      lang: binaryTemplate.lang,
      code: binaryTemplate.code,
      whatChanges:
        'Cheat sheet এর "Binary Search Template"। শুধু তুলনাটা problem অনুযায়ী বদলায় ("এই version কি bad?", "`mid * mid > x`?")।',
    },
  },

  breakdown: {
    variables: [
      {
        name: 'left_pointer',
        role: 'যে range এ target থাকতে পারে তার শুরু',
        whenChanges: '`nums[middle] < target` হলে `middle + 1`',
      },
      {
        name: 'right_pointer',
        role: 'সেই range এর শেষ',
        whenChanges: '`nums[middle] > target` হলে `middle - 1`',
      },
      { name: 'middle', role: 'এখন যে element দেখছি', whenChanges: 'প্রতি step এ নতুন করে হিসাব' },
    ],
    invariant: 'Target যদি থাকে, তাহলে সবসময় `nums[left ... right]` এর ভেতরে আছে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`target = 9`)',
        columns: ['step', 'left', 'right', 'middle', 'nums[middle]', 'decision'],
        rows: [
          ['1', '0', '5', '2', '3', '3 < 9 → `left = 3`'],
          ['2', '3', '5', '4', '9', 'পেয়েছি → return 4'],
        ],
        highlightCells: [[1, 5]],
      },
      {
        kind: 'table',
        title: 'Trace (`target = 2`, পাওয়া যায় না)',
        columns: ['step', 'left', 'right', 'middle', 'nums[middle]', 'decision'],
        rows: [
          ['1', '0', '5', '2', '3', '3 > 2 → `right = 1`'],
          ['2', '0', '1', '0', '-1', '-1 < 2 → `left = 1`'],
          ['3', '1', '1', '1', '0', '0 < 2 → `left = 2`'],
          ['4', '2', '1', '—', '—', '`left > right` → loop শেষ → return -1'],
        ],
        highlightCells: [[3, 5]],
      },
      {
        kind: 'steps',
        title: 'Step by step (`target = 9`)',
        arrayStates: [
          {
            array: NUMS,
            pointers: { left: 0, right: 5, middle: 2 },
            highlight: [2],
            vars: { target: 9 },
            caption:
              '`middle = (0 + 5) // 2 = 2`, `nums[2] = 3`। `3 < 9`, তাই বাম অর্ধেক বাদ: `left = 3`।',
          },
          {
            array: NUMS,
            pointers: { left: 3, right: 5, middle: 4 },
            highlight: [4],
            vars: { target: 9, return: 4 },
            caption: '`middle = (3 + 5) // 2 = 4`, `nums[4] = 9`। পেয়েছি, return 4।',
          },
        ],
      },
      {
        kind: 'steps',
        title: 'Step by step (`target = 2`, পাওয়া যায় না)',
        arrayStates: [
          {
            array: NUMS,
            pointers: { left: 0, right: 5, middle: 2 },
            highlight: [2],
            vars: { target: 2 },
            caption: '`nums[2] = 3 > 2`, ডান অর্ধেক বাদ: `right = 1`।',
          },
          {
            array: NUMS,
            pointers: { left: 0, right: 1, middle: 0 },
            highlight: [0],
            vars: { target: 2 },
            caption: '`middle = 0`, `nums[0] = -1 < 2`: `left = 1`।',
          },
          {
            array: NUMS,
            pointers: { left: 1, right: 1, middle: 1 },
            highlight: [1],
            vars: { target: 2 },
            caption: '`left == right`, শেষ একটা element: `nums[1] = 0 < 2`: `left = 2`।',
          },
          {
            array: NUMS,
            pointers: { left: 2, right: 1 },
            vars: { target: 2, return: -1 },
            caption: '`left > right`, range খালি। Target নেই, return -1।',
          },
        ],
      },
    ],
    edgeCases: [
      'Empty array → `right = -1`, loop চলে না → `-1`',
      'একটা element → `left == right`, তাই `left <= right` এ `=` না থাকলে সেটা check হবে না',
      'Target সবার চেয়ে ছোট বা সবার চেয়ে বড় → `-1`',
      'Overflow: Python এ `(left + right) // 2` ঠিক আছে। Java/C++ এ `left + (right - left) / 2` লিখতে হয়',
    ],
    deepDiveBn: {
      heading: 'binary search কেন কাজ করে',
      body: 'Array sorted থাকলে মাঝের element দেখেই বোঝা যায় target কোন দিকে আছে। মাঝের মান target এর চেয়ে বড় হলে target বামে, ছোট হলে ডানে। তাই প্রতিবার অর্ধেক array বাদ দেওয়া যায়, আর `n` থেকে `1` এ নামতে `log₂ n` ধাপ লাগে (যেমন 1000 টা element এ মাত্র প্রায় 10 ধাপ)। `left <= right` এ `=` রাখতে হয় কারণ শেষ একটা element বাকি থাকলেও সেটা check করতে হবে।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'python',
      code: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left_pointer = 0
        right_pointer = len(nums) - 1

        while left_pointer <= right_pointer:
            middle = (right_pointer + left_pointer) // 2
            if nums[middle] == target:
                return middle
            elif nums[middle] > target:
                right_pointer = middle - 1
            else:
                left_pointer = middle + 1

        return -1`,
      lineByLine: [
        {
          line: 'while left_pointer <= right_pointer',
          meaning: 'range এ অন্তত একটা element বাকি (`=` দরকার, শেষ একটাও check করতে হবে)',
        },
        { line: 'middle = (right_pointer + left_pointer) // 2', meaning: 'range এর মাঝখান' },
        { line: 'if nums[middle] == target: return middle', meaning: 'পেয়ে গেছি' },
        {
          line: 'elif nums[middle] > target: right_pointer = middle - 1',
          meaning: 'মাঝেরটা বড়, তাই ডান অর্ধেক (মাঝসহ) বাদ',
        },
        {
          line: 'else: left_pointer = middle + 1',
          meaning: 'মাঝেরটা ছোট, তাই বাম অর্ধেক (মাঝসহ) বাদ',
        },
        { line: 'return -1', meaning: 'range খালি, target নেই' },
      ],
      complexity: { time: 'O(log n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: recursive',
      isMine: false,
      lang: 'python',
      code: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        def helper(left, right):
            if left > right:
                return -1
            middle = (left + right) // 2
            if nums[middle] == target:
                return middle
            if nums[middle] > target:
                return helper(left, middle - 1)
            return helper(middle + 1, right)
        return helper(0, len(nums) - 1)`,
      complexity: { time: 'O(log n)', space: 'O(log n) (call stack)' },
      note: 'একই logic, `left` আর `right` argument হিসেবে পাঠানো। O(log n) stack space নেয়, তাই iterative version ভালো।',
    },
  ],
  commonMistakes: [
    '`while left < right` লেখা (`=` বাদ): শেষ একটা element check হয় না',
    '`right = middle` বা `left = middle` লেখা (`± 1` বাদ): range ছোট না হয়ে অসীম loop হতে পারে',
    'Unsorted array তে binary search চালানো',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'Loop condition এ `<=` কেন, `<` না?',
        a: '`left == right` হলে একটা element বাকি, সেটাও check করতে হবে',
      },
      {
        q: '`middle ± 1` কেন, শুধু `middle` না?',
        a: '`middle` আগেই check হয়েছে, আর `± 1` না দিলে range ছোট না হয়ে অসীম loop হতে পারে',
      },
    ],
    patternToRemember:
      'Look at the middle, throw away the half that cannot contain the answer, repeat until the range is empty.',
    related: [
      { number: 35, title: 'Search Insert Position' },
      { number: 278, title: 'First Bad Version' },
      { number: 34, title: 'Find First and Last Position of Element in Sorted Array' },
      { number: 69, title: 'Sqrt(x)' },
      { number: 33, title: 'Search in Rotated Sorted Array' },
    ],
  },

  visualizationId: 'lc-binary-search-range',
  verify: {
    entry: { python: 'search' },
    cases: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], returns: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], returns: -1 },
    ],
  },
  meta: {
    generated: ['approach.idea', 'breakdown.steps', 'solutions.Alternative: recursive'],
  },
};

export default problem;

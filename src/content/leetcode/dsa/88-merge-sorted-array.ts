import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const mergeTemplate = patterns.find((p) => p.id === 'merge-from-right')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-88-merge-sorted-array',
  number: 88,
  title: 'Merge Sorted Array',
  slug: '88-merge-sorted-array',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/merge-sorted-array/',
  patternId: 'merge-from-right',
  patternLabel: 'Two Pointers (merge from right)',
  tags: ['array', 'two-pointers', 'in-place', 'sorted', 'merge'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder:
      'খালি জায়গা শেষে, তাই পিছন থেকে ভরো। দুইজনের মধ্যে বড়টা `nums1[i]` এ, `p2 < 0` হলে থামো।',
    statementBn:
      'দুইটা sorted array আছে: `nums1` (প্রথম `m` টা আসল মান, পেছনে `n` টা `0` খালি জায়গা হিসেবে) আর `nums2` (`n` টা মান)। দুইটা মিলিয়ে একটা sorted array বানাতে হবে, `nums1` এর ভেতরেই। কিছু return করতে হয় না।',
    realLifeExample:
      'দুইটা লাইনে খাটো থেকে লম্বা ছাত্র দাঁড়ানো। প্রথম লাইনের পেছনে খালি জায়গা আছে। দুই লাইনের সবচেয়ে লম্বা দুইজনকে (শেষের জন) তুলনা করো, যে বেশি লম্বা তাকে একদম শেষের খালি জায়গায় পাঠাও। এভাবে পেছন থেকে ভরলে কাউকে ধাক্কা দিয়ে সরাতে হয় না।',
    samples: [
      {
        input: 'nums1 = [1,2,3,0,0,0], m = 3\nnums2 = [2,5,6],       n = 3',
        output: 'nums1 = [1,2,2,3,5,6]',
      },
      { input: 'nums1 = [0], m = 0, nums2 = [1], n = 1', output: 'nums1 = [1]' },
    ],
  },

  approach: {
    triggers: [
      '"merge two sorted arrays in-place"',
      '`nums1` এর শেষে extra খালি জায়গা আছে (0 দিয়ে ভরা)',
    ],
    bruteForce:
      '`nums1` কপি করে সামনে থেকে merge করা → O(m) extra space। অথবা জোড়া লাগিয়ে sort করা → O((m+n) log(m+n))।',
    idea: 'সবচেয়ে বড় মান কোথায় যাবে জানা আছে: একদম শেষের খালি ঘরে। তাই দুই array এর শেষ থেকে তুলনা করে বড়টা পেছন থেকে বসাও; এতে কোনো না-পড়া মান overwrite হয় না।',
    steps: [
      '`nums1[p1]` আর `nums2[p2]` তুলনা করো।',
      'যেটা বড় সেটা `nums1[i]` এ বসাও।',
      'যার মান বসালে তার pointer এক ঘর পিছাও।',
      '`i--`।',
      '`p2 < 0` হলে থামো।',
    ],
    template: {
      lang: mergeTemplate.lang,
      code: mergeTemplate.code,
      whatChanges: mergeTemplate.whatChanges,
    },
  },

  breakdown: {
    variables: [
      {
        name: 'p1 = m - 1',
        role: '`nums1` এর শেষ আসল element',
        whenChanges: '`nums1[p1]` বসানো হলে (পিছনে)',
      },
      {
        name: 'p2 = n - 1',
        role: '`nums2` এর শেষ element',
        whenChanges: '`nums2[p2]` বসানো হলে (পিছনে)',
      },
      {
        name: 'i = m + n - 1',
        role: 'write: পরের বড় মান কোথায় বসবে',
        whenChanges: 'প্রতি step এ (পিছনে)',
      },
    ],
    invariant: '`nums1[i+1 ... m+n-1]` এ সবসময় সবচেয়ে বড় মানগুলো চূড়ান্ত sorted order এ বসে আছে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (শুরু `p1=2, p2=2, i=5`)',
        columns: [
          'step',
          'nums1[p1]',
          'nums2[p2]',
          'বড় কোনটা',
          'লেখা',
          'p1',
          'p2',
          'i (পরে)',
          'nums1',
        ],
        rows: [
          ['1', '3', '6', 'nums2', 'nums1[5]=6', '2', '1', '4', '[1,2,3,0,0,6]'],
          ['2', '3', '5', 'nums2', 'nums1[4]=5', '2', '0', '3', '[1,2,3,0,5,6]'],
          ['3', '3', '2', 'nums1', 'nums1[3]=3', '1', '0', '2', '[1,2,3,3,5,6]'],
          ['4', '2', '2', 'সমান → nums2', 'nums1[2]=2', '1', '-1', '1', '[1,2,2,3,5,6]'],
        ],
        highlightCells: [
          [0, 8],
          [1, 8],
          [2, 8],
          [3, 8],
        ],
      },
      {
        kind: 'diagram',
        title: 'শেষ',
        text: '`p2 < 0` → থামো। `nums1[0..1] = [1,2]` আগে থেকেই ঠিক জায়গায়।',
      },
      {
        kind: 'steps',
        title: 'Step by step (`nums1 = [1,2,3,0,0,0]`, `nums2 = [2,5,6]`)',
        arrayStates: [
          {
            label: 'nums1',
            array: [1, 2, 3, 0, 0, 0],
            pointers: { p1: 2, i: 5 },
            dividerAt: 3,
            secondary: { label: 'nums2', array: [2, 5, 6], pointers: { p2: 2 } },
            caption: 'শুরু: `p1 = 2`, `p2 = 2`, `i = 5`। divider এর পরের `0` গুলো খালি জায়গা।',
          },
          {
            label: 'nums1',
            array: [1, 2, 3, 0, 0, 6],
            pointers: { p1: 2, i: 4 },
            highlight: [5],
            secondary: { label: 'nums2', array: [2, 5, 6], pointers: { p2: 1 }, highlight: [2] },
            move: { from: { array: 'secondary', index: 2 }, to: { array: 'primary', index: 5 } },
            caption: '`3` বনাম `6`: `6` বড়, `nums1[5] = 6`। `p2--`, `i--`।',
          },
          {
            label: 'nums1',
            array: [1, 2, 3, 0, 5, 6],
            pointers: { p1: 2, i: 3 },
            highlight: [4],
            secondary: { label: 'nums2', array: [2, 5, 6], pointers: { p2: 0 }, highlight: [1] },
            move: { from: { array: 'secondary', index: 1 }, to: { array: 'primary', index: 4 } },
            caption: '`3` বনাম `5`: `5` বড়, `nums1[4] = 5`।',
          },
          {
            label: 'nums1',
            array: [1, 2, 3, 3, 5, 6],
            pointers: { p1: 1, i: 2 },
            highlight: [3],
            secondary: { label: 'nums2', array: [2, 5, 6], pointers: { p2: 0 } },
            move: { from: { array: 'primary', index: 2 }, to: { array: 'primary', index: 3 } },
            caption: '`3` বনাম `2`: `3` বড়, `nums1[3] = 3` (nums1 থেকে পিছনে সরলো)। `p1--`।',
          },
          {
            label: 'nums1',
            array: [1, 2, 2, 3, 5, 6],
            pointers: { p1: 1, i: 1 },
            highlight: [2],
            secondary: { label: 'nums2', array: [2, 5, 6], pointers: { p2: -1 }, highlight: [0] },
            move: { from: { array: 'secondary', index: 0 }, to: { array: 'primary', index: 2 } },
            caption:
              '`2` বনাম `2`: সমান, তাই `else` → nums2 থেকে, `nums1[2] = 2`। `p2 = -1`, loop শেষ।',
          },
        ],
      },
    ],
    edgeCases: [
      '`n = 0` → loop চলে না, `nums1` একই থাকে',
      '`m = 0` → `p1 = -1`, সব মান `nums2` থেকে আসে (`p1 >= 0` check এটা সামলায়)',
      '`nums2` এর সব মান `nums1` এর চেয়ে ছোট → আগে `nums1` এর মানগুলো ডানে সরে, তারপর `nums2` সামনে ভরে',
    ],
    deepDiveBn: {
      heading: 'পিছন থেকে কেন, আর শুধু `p2` কেন',
      body: '`nums1` এর শেষে খালি জায়গা আছে। সামনে থেকে merge করলে `nums1` এর যে element গুলো এখনো পড়া হয়নি সেগুলো overwrite হয়ে যেত। পিছন থেকে সবচেয়ে বড় element আগে বসালে খালি জায়গাতেই লেখা হয়, কোনো দরকারি মান নষ্ট হয় না। আর `p2 < 0` হলে `nums2` শেষ, `nums1` এর বাকি অংশ আগে থেকেই সঠিক জায়গায় আছে, তাই `p1` নিয়ে আলাদা loop লাগে না।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var merge = function (nums1, m, nums2, n) {
    let p1 = m - 1;
    let p2 = n - 1;
    let i = m + n - 1;

    while (p2 >= 0) {
        if (p1 >= 0 && nums1[p1] > nums2[p2]) {
            nums1[i] = nums1[p1];
            p1--;
        } else {
            nums1[i] = nums2[p2];
            p2--;
        }
        i--;
    }
};`,
      lineByLine: [
        { line: 'while (p2 >= 0)', meaning: '`nums2` তে কিছু বাকি থাকা পর্যন্ত চলবে' },
        {
          line: 'p1 >= 0 && nums1[p1] > nums2[p2]',
          meaning: '`nums1` এ কিছু বাকি আছে এবং তার মান বড়',
        },
        { line: 'nums1[i] = nums1[p1]; p1--', meaning: '`nums1` এর বড় মান পেছনে সরাও' },
        {
          line: 'else ... nums2[p2]; p2--',
          meaning: '`nums2` এর মান বড় (বা সমান), অথবা `nums1` শেষ',
        },
        { line: 'i--', meaning: 'পরের খালি ঘর' },
      ],
      complexity: { time: 'O(m + n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: splice + sort',
      isMine: false,
      lang: 'javascript',
      code: `var merge = function (nums1, m, nums2, n) {
    nums1.splice(m, n, ...nums2);
    nums1.sort((a, b) => a - b);
};`,
      complexity: { time: 'O((m+n) log(m+n))', space: 'O(1)' },
      note: 'ছোট আর সহজ, কিন্তু O((m+n) log(m+n)), আর interviewer O(m+n) চায়।',
    },
  ],
  commonMistakes: [
    'সামনে থেকে merge করা: `nums1` এর না পড়া মান overwrite হয়ে যায়',
    '`p1 >= 0` check ভুলে যাওয়া: `nums1[-1]` হলো `undefined`, তুলনা ভুল হয়',
    '`while (p1 >= 0 && p2 >= 0)` লিখে শেষে `nums2` এর বাকি অংশ কপি করতে ভুলে যাওয়া',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'Loop এর condition এ শুধু `p2 >= 0` কেন?',
        a: '`nums2` শেষ হলে `nums1` এর বাকি মান আগে থেকেই ঠিক জায়গায়',
      },
      { q: 'সামনে থেকে merge করলে কী সমস্যা?', a: '`nums1` এর না পড়া মান মুছে যায়' },
    ],
    patternToRemember: 'SORTED + EMPTY SPACE AT END = MERGE FROM RIGHT.',
    related: [
      { number: 912, title: 'Sort an Array', note: 'merge sort এর merge step, বাম থেকে ছোটটা' },
      { number: 344, title: 'Reverse String', note: 'two pointers, দুই দিক থেকে' },
      { number: 21, title: 'Merge Two Sorted Lists' },
    ],
  },

  visualizationId: 'lc-merge-from-right',
  verify: {
    entry: { javascript: 'merge' },
    cases: [
      {
        args: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3],
        mutates: { arg: 0, value: [1, 2, 2, 3, 5, 6] },
      },
      { args: [[0], 0, [1], 1], mutates: { arg: 0, value: [1] } },
    ],
  },
  meta: {
    generated: [
      'approach.idea',
      'approach.template',
      'breakdown.steps',
      'solutions.Alternative: splice + sort',
    ],
  },
};

export default problem;

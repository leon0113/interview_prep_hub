import { READ_WRITE_TEMPLATE } from '../patterns';
import type { LcProblem } from '../schema';

const problem: LcProblem = {
  id: 'lc-283-move-zeroes',
  number: 283,
  title: 'Move Zeroes',
  slug: '283-move-zeroes',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/move-zeroes/',
  patternId: 'read-write-pointers',
  patternLabel: 'Two Pointers (read/write) + fill',
  tags: ['array', 'two-pointers', 'in-place'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder: 'non-zero গুলো `p` দিয়ে সামনে লেখো, তারপর `p` থেকে শেষ পর্যন্ত `0` বসাও।',
    statementBn:
      'Array এর সব `0` শেষে পাঠাতে হবে, আর বাকি (non-zero) সংখ্যাগুলোর আগের order ঠিক রাখতে হবে। নতুন array বানানো যাবে না (in-place)। কিছু return করতে হয় না।',
    realLifeExample:
      'তাকে বই আর খালি বাক্স মেশানো আছে। বইগুলো একটা একটা করে বাম দিক থেকে সাজাও (`p`)। সব বই সাজানো হয়ে গেলে ডান দিকের বাকি সব জায়গায় খালি বাক্স (`0`) রেখে দাও।',
    samples: [
      { input: 'nums = [0,1,0,3,12]', output: 'nums = [1,3,12,0,0]' },
      { input: 'nums = [0]', output: 'nums = [0]' },
    ],
  },

  approach: {
    triggers: [
      '"move all 0s to the end", "maintain relative order"',
      '"in-place", "do not make a copy"',
    ],
    bruteForce: 'নতুন array তে আগে non-zero, পরে zero push করা → O(n) space।',
    idea: 'Read/Write দিয়ে non-zero গুলো order ঠিক রেখে সামনে আনো। `p` এর পরে যতগুলো ঘর বাকি, ঠিক ততগুলোই zero ছিল, তাই শেষে সেগুলো `0` দিয়ে ভরে দাও।',
    steps: [
      '`p = 0` দিয়ে শুরু।',
      '`i` দিয়ে ঘোরো। `nums[i] !== 0` হলে `nums[p] = nums[i]`, `p++`।',
      'Loop শেষে `p` থেকে শেষ পর্যন্ত সব ঘরে `0` বসাও।',
    ],
    template: {
      lang: 'javascript',
      code: READ_WRITE_TEMPLATE,
      whatChanges:
        'Read/Write template, `KEEP_CONDITION = nums[i] !== 0`, সাথে দ্বিতীয় একটা loop যেটা বাকি ঘরগুলো `0` দিয়ে ভরে।',
    },
  },

  breakdown: {
    variables: [
      { name: 'i', role: 'read: প্রতিটা element পড়ে', whenChanges: 'প্রতি step এ' },
      { name: 'p', role: 'write: পরের non-zero কোথায় বসবে', whenChanges: 'শুধু non-zero পেলে' },
    ],
    invariant: '`nums[0...p-1]` এ সবসময় এখন পর্যন্ত পাওয়া সব non-zero মান আসল order এ থাকে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`nums = [0,1,0,3,12]`): প্রথম loop',
        columns: ['i', 'nums[i]', 'non-zero?', 'কাজ', 'p (পরে)', 'array'],
        rows: [
          ['0', '0', 'না', 'skip', '0', '[0,1,0,3,12]'],
          ['1', '1', 'হ্যাঁ', 'nums[0]=1', '1', '[1,1,0,3,12]'],
          ['2', '0', 'না', 'skip', '1', 'একই'],
          ['3', '3', 'হ্যাঁ', 'nums[1]=3', '2', '[1,3,0,3,12]'],
          ['4', '12', 'হ্যাঁ', 'nums[2]=12', '3', '[1,3,12,3,12]'],
        ],
        highlightCells: [
          [1, 5],
          [3, 5],
          [4, 5],
        ],
      },
      {
        kind: 'diagram',
        title: 'দ্বিতীয় loop (`p = 3` থেকে fill)',
        text: `[1,3,12 | 3,12]  →  [1,3,12 | 0,0]
         ↑
         p=3`,
      },
      {
        kind: 'steps',
        title: 'Step by step (`nums = [0,1,0,3,12]`)',
        arrayStates: [
          { array: [0, 1, 0, 3, 12], pointers: { i: 0, p: 0 }, caption: 'শুরু: `p = 0`।' },
          {
            array: [0, 1, 0, 3, 12],
            pointers: { i: 0, p: 0 },
            caption: 'i = 0: `0`, skip। `p` একই থাকে।',
          },
          {
            array: [1, 1, 0, 3, 12],
            pointers: { i: 1, p: 1 },
            highlight: [0],
            caption: 'i = 1: `1` non-zero। `nums[0] = 1`, `p` হলো 1।',
          },
          {
            array: [1, 1, 0, 3, 12],
            pointers: { i: 2, p: 1 },
            caption: 'i = 2: `0`, skip।',
          },
          {
            array: [1, 3, 0, 3, 12],
            pointers: { i: 3, p: 2 },
            highlight: [1],
            caption: 'i = 3: `3` non-zero। `nums[1] = 3`, `p` হলো 2।',
          },
          {
            array: [1, 3, 12, 3, 12],
            pointers: { i: 4, p: 3 },
            highlight: [2],
            dividerAt: 3,
            caption:
              'i = 4: `12` non-zero। `nums[2] = 12`, `p` হলো 3। প্রথম loop শেষ, পেছনে পুরনো মান রয়ে গেছে।',
          },
          {
            array: [1, 3, 12, 0, 12],
            pointers: { i: 3, p: 3 },
            highlight: [3],
            dividerAt: 3,
            caption: 'দ্বিতীয় loop: `i = p = 3` থেকে, `nums[3] = 0`।',
          },
          {
            array: [1, 3, 12, 0, 0],
            pointers: { i: 4, p: 3 },
            highlight: [4],
            dividerAt: 3,
            caption: '`nums[4] = 0`। শেষ: `[1,3,12,0,0]`।',
          },
        ],
      },
    ],
    edgeCases: ['`[0]` → `[0]`', 'কোনো zero নেই (`[1,2,3]`) → একই থাকে', 'সব zero → একই থাকে'],
    deepDiveBn: {
      heading: 'শেষে fill কেন লাগে',
      body: 'প্রথম loop এ আমরা non-zero গুলো সামনে এনে লিখি, কিন্তু পিছনের পুরনো মানগুলো মুছে যায় না (যেমন `[1,3,12,3,12]` এর শেষের `3,12`)। `p` পর্যন্ত সব ঠিক আছে, আর `p` এর পরে যতগুলো ঘর, ঠিক ততগুলোই zero ছিল। তাই `p` থেকে শেষ পর্যন্ত সব জায়গায় `0` বসালেই উত্তর।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var moveZeroes = function (nums) {
    let p = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            nums[p] = nums[i];
            p++;
        }
    }

    for (let i = p; i < nums.length; i++) {
        nums[i] = 0;
    }
};`,
      lineByLine: [
        { line: 'let p = 0', meaning: 'প্রথম non-zero বসবে index 0 তে' },
        {
          line: 'if (nums[i] !== 0)',
          meaning: 'রাখার condition (**এই লাইনটা problem অনুযায়ী বদলায়**)',
        },
        {
          line: 'nums[p] = nums[i]; p++',
          meaning: 'non-zero সামনে টেনে আনো, লেখার ঘর এক ধাপ সামনে',
        },
        {
          line: 'for (let i = p; ...) nums[i] = 0',
          meaning: 'পেছনের পুরনো মান মুছে `0` বসাও',
        },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: swap version',
      isMine: false,
      lang: 'javascript',
      code: `var moveZeroes = function (nums) {
    let p = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            [nums[i], nums[p]] = [nums[p], nums[i]];
            p++;
        }
    }
};`,
      complexity: { time: 'O(n)', space: 'O(1)' },
      note: 'Swap version: এক loop এই হয়, fill লাগে না। কিন্তু zero না থাকলেও প্রতিটা element নিজের সাথে swap হয়।',
    },
  ],
  commonMistakes: [
    'দ্বিতীয় loop (fill) ভুলে যাওয়া: তাহলে শেষে পুরনো মান থেকে যায় (`[1,3,12,3,12]`)',
    '`splice` দিয়ে zero সরিয়ে `push(0)` করা: O(n²), আর loop চলার সময় index সরে যায়',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'প্রথম loop শেষে array দেখতে কেমন?',
        a: 'সামনে সব non-zero, পেছনে পুরনো মান, `0` না',
      },
      { q: '#27 থেকে এখানে বাড়তি কী?', a: 'শেষে `p` থেকে `0` fill' },
    ],
    patternToRemember:
      'Scan with `i`, place valid elements with `p`, then fill the remaining positions.',
    related: [
      { number: 27, title: 'Remove Element', note: 'same template, fill নেই' },
      { number: 26, title: 'Remove Duplicates from Sorted Array', note: 'same template' },
    ],
  },

  visualizationId: 'lc-array-pointers',
  verify: {
    entry: { javascript: 'moveZeroes' },
    cases: [
      { args: [[0, 1, 0, 3, 12]], mutates: { arg: 0, value: [1, 3, 12, 0, 0] } },
      { args: [[0]], mutates: { arg: 0, value: [0] } },
    ],
  },
  meta: {
    generated: ['approach.idea', 'breakdown.steps', 'solutions.Alternative: swap version'],
  },
};

export default problem;

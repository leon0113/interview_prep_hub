import { READ_WRITE_TEMPLATE } from '../patterns';
import type { LcProblem } from '../schema';

const problem: LcProblem = {
  id: 'lc-27-remove-element',
  number: 27,
  title: 'Remove Element',
  slug: '27-remove-element',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/remove-element/',
  patternId: 'read-write-pointers',
  patternLabel: 'Two Pointers (read/write)',
  tags: ['array', 'two-pointers', 'in-place'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder:
      '`i` পড়ে, `x` লেখে। ভালো element পেলেই `nums[x]` এ বসাও, `x++`। শেষে `x` = নতুন length।',
    statementBn:
      'একটা array আর একটা সংখ্যা `val` দেওয়া আছে। array থেকে সব `val` সরাতে হবে, তবে নতুন array বানানো যাবে না (in-place)। যতগুলো element থাকলো সেই সংখ্যা `k` return করো। প্রথম `k` টা ঘরে বাকি element গুলো থাকলেই চলবে, পেছনে কী আছে তাতে কিছু যায় আসে না।',
    realLifeExample:
      'একটা লাইনে মানুষ দাঁড়িয়ে আছে, লাল জামা পরা সবাইকে বাদ দিতে হবে। তুমি (`i`) একজন একজন করে দেখো। লাল জামা না হলে তাকে সামনের পরের খালি জায়গায় (`x`) দাঁড় করাও। শেষে সামনে যতজন দাঁড়িয়ে আছে, সেটাই উত্তর।',
    samples: [
      { input: 'nums = [3,2,2,3], val = 3', output: '2, nums = [2,2,_,_]' },
      { input: 'nums = [0,1,2,2,3,0,4,2], val = 2', output: '5, nums = [0,1,3,0,4,_,_,_]' },
    ],
  },

  approach: {
    triggers: [
      '"in-place", "O(1) extra space": নতুন array বানানো যাবে না',
      '"return k, প্রথম k টা element দেখা হবে": পেছনের ঘরগুলো নিয়ে ভাবতে হবে না',
    ],
    bruteForce:
      'কাজের element গুলো একটা নতুন array তে নিয়ে আবার কপি করা। এতে O(n) extra space লাগে। এখানে একই array তে overwrite করলে O(1) space লাগে।',
    idea: 'দুইটা pointer একই দিকে চলে: `i` প্রতিটা element পড়ে, `x` শুধু রাখার মতো element (`nums[i] !== val`) সামনে লেখে। ফলে উত্তর array এর সামনের অংশেই জমা হয়, extra array লাগে না।',
    steps: [
      '`x = 0` দিয়ে শুরু।',
      '`i` দিয়ে পুরো array ঘোরো।',
      '`nums[i] !== val` হলে `nums[x] = nums[i]`, তারপর `x++`।',
      '`nums[i] === val` হলে কিছুই করো না, শুধু `i` এগিয়ে যাবে।',
      '`x` return করো।',
    ],
    template: {
      lang: 'javascript',
      code: READ_WRITE_TEMPLATE,
      whatChanges:
        'Read/Write template, এখানে `KEEP_CONDITION = nums[i] !== val`। বাকি সব skeleton একই থাকে (#26, #283, #80 এও শুধু এই condition বদলায়)।',
    },
  },

  breakdown: {
    variables: [
      { name: 'i', role: 'read: প্রতিটা element পড়ে', whenChanges: 'প্রতি step এ' },
      { name: 'x', role: 'write: পরের element কোথায় বসবে', whenChanges: 'শুধু ভালো element পেলে' },
    ],
    invariant: '`nums[0...x-1]` এ সবসময় এখন পর্যন্ত পাওয়া ভালো element গুলো ঠিক order এ থাকে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`nums = [0,1,2,2,3,0,4,2]`, `val = 2`)',
        columns: ['i', 'nums[i]', 'রাখবো?', 'কাজ', 'x (পরে)', 'array'],
        rows: [
          ['0', '0', 'হ্যাঁ', 'nums[0]=0', '1', '[0,1,2,2,3,0,4,2]'],
          ['1', '1', 'হ্যাঁ', 'nums[1]=1', '2', '[0,1,2,2,3,0,4,2]'],
          ['2', '2', 'না', 'skip', '2', 'একই'],
          ['3', '2', 'না', 'skip', '2', 'একই'],
          ['4', '3', 'হ্যাঁ', 'nums[2]=3', '3', '[0,1,3,2,3,0,4,2]'],
          ['5', '0', 'হ্যাঁ', 'nums[3]=0', '4', '[0,1,3,0,3,0,4,2]'],
          ['6', '4', 'হ্যাঁ', 'nums[4]=4', '5', '[0,1,3,0,4,0,4,2]'],
          ['7', '2', 'না', 'skip', '5', 'একই'],
        ],
        highlightCells: [
          [4, 5],
          [5, 5],
          [6, 5],
        ],
      },
      {
        kind: 'diagram',
        title: 'Final',
        text: `Final: [0,1,3,0,4 | 0,4,2]
        ← k = 5 →   (এই অংশ ignore)`,
      },
      {
        kind: 'steps',
        title: 'Step by step (`nums = [0,1,2,2,3,0,4,2]`, `val = 2`)',
        arrayStates: [
          {
            array: [0, 1, 2, 2, 3, 0, 4, 2],
            pointers: { i: 0, x: 0 },
            vars: { val: 2 },
            caption: 'শুরু: `x = 0`, `i = 0`। এখনো কিছু লেখা হয়নি।',
          },
          {
            array: [0, 1, 2, 2, 3, 0, 4, 2],
            pointers: { i: 0, x: 1 },
            highlight: [0],
            vars: { val: 2 },
            caption: 'i = 0: `0 !== 2`, রাখো। `nums[0] = 0`, `x` হলো 1।',
          },
          {
            array: [0, 1, 2, 2, 3, 0, 4, 2],
            pointers: { i: 1, x: 2 },
            highlight: [1],
            vars: { val: 2 },
            caption: 'i = 1: `1 !== 2`, রাখো। `nums[1] = 1`, `x` হলো 2।',
          },
          {
            array: [0, 1, 2, 2, 3, 0, 4, 2],
            pointers: { i: 2, x: 2 },
            vars: { val: 2 },
            caption: 'i = 2: এটা `val`, skip। `x` একই থাকে।',
          },
          {
            array: [0, 1, 2, 2, 3, 0, 4, 2],
            pointers: { i: 3, x: 2 },
            vars: { val: 2 },
            caption: 'i = 3: আবার `val`, skip।',
          },
          {
            array: [0, 1, 3, 2, 3, 0, 4, 2],
            pointers: { i: 4, x: 3 },
            highlight: [2],
            vars: { val: 2 },
            caption: 'i = 4: `3` রাখো। `nums[2] = 3` (সামনে টেনে আনা), `x` হলো 3।',
          },
          {
            array: [0, 1, 3, 0, 3, 0, 4, 2],
            pointers: { i: 5, x: 4 },
            highlight: [3],
            vars: { val: 2 },
            caption: 'i = 5: `0` রাখো। `nums[3] = 0`, `x` হলো 4।',
          },
          {
            array: [0, 1, 3, 0, 4, 0, 4, 2],
            pointers: { i: 6, x: 5 },
            highlight: [4],
            vars: { val: 2 },
            caption: 'i = 6: `4` রাখো। `nums[4] = 4`, `x` হলো 5।',
          },
          {
            array: [0, 1, 3, 0, 4, 0, 4, 2],
            pointers: { i: 7, x: 5 },
            dividerAt: 5,
            vars: { val: 2, return: 5 },
            caption: 'i = 7: `val`, skip। শেষ: `return x` = 5। divider এর পরের অংশ ignore।',
          },
        ],
      },
    ],
    edgeCases: [
      'Empty array → 0',
      'সব element = `val` → 0',
      'কোনো element `val` না → n (প্রতিটা element নিজের উপরেই কপি হয়)',
    ],
    deepDiveBn: {
      heading: 'কেন overwrite নিরাপদ',
      body: '`x` শুধু ভালো element পেলে এগোয়, কিন্তু `i` প্রতি step এ এগোয়। তাই সবসময় `x <= i` থাকে। মানে আমরা যে ঘরে লিখছি সেটা আগেই পড়া হয়ে গেছে, তাই এখনো না পড়া কোনো element হারিয়ে যায় না।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var removeElement = function (nums, val) {
    let x = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== val) {
            nums[x] = nums[i];
            x++;
        }
    }

    return x;
};`,
      lineByLine: [
        { line: 'let x = 0', meaning: 'এখনো কিছু লেখা হয়নি, প্রথম লেখা হবে index 0 তে' },
        {
          line: 'if (nums[i] !== val)',
          meaning: 'এটা রাখার মতো element কিনা (**শুধু এই লাইনটা problem অনুযায়ী বদলায়**)',
        },
        { line: 'nums[x] = nums[i]', meaning: 'ভালো element টা সামনে টেনে আনো' },
        { line: 'x++', meaning: 'পরের লেখার জায়গা এক ঘর সামনে' },
        { line: 'return x', meaning: '`x` = কতগুলো ভালো element লেখা হয়েছে = নতুন length' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: swap with last',
      isMine: false,
      lang: 'javascript',
      code: `var removeElement = function (nums, val) {
    let i = 0;
    let n = nums.length;
    while (i < n) {
        if (nums[i] === val) {
            nums[i] = nums[n - 1];
            n--;
        } else {
            i++;
        }
    }
    return n;
};`,
      complexity: { time: 'O(n)', space: 'O(1)' },
      note: 'Swap-with-last। `nums[i] === val` হলে শেষের element দিয়ে replace করো আর `n--` করো। `val` কম থাকলে লেখা কম হয়, কিন্তু order বদলে যায়।',
    },
  ],
  commonMistakes: [
    '`x` এর বদলে `x + 1` return করা (`x` নিজেই count, কারণ লেখার পরে `x++` হয়)',
    'loop এর ভেতরে `splice` দিয়ে delete করা: এতে O(n²) লাগে, আর index গুলো সরে যায়',
  ],

  revise: {
    selfQuestions: [
      { q: '`x` কখন এগোয়, আর `i` কখন?', a: '`x` শুধু ভালো element পেলে, `i` প্রতিবার' },
      { q: '#26 এ কোন লাইনটা বদলাবে?', a: 'শুধু `KEEP_CONDITION`' },
    ],
    patternToRemember:
      'Read with `i`, write with `x`. Copy every element that is not `val`, then `x` is the new length.',
    related: [
      {
        number: 26,
        title: 'Remove Duplicates from Sorted Array',
        note: 'same template, keep condition = নতুন unique',
      },
      { number: 283, title: 'Move Zeroes', note: 'same template + শেষে 0 দিয়ে fill' },
      { number: 80, title: 'Remove Duplicates from Sorted Array II' },
    ],
  },

  visualizationId: 'lc-array-pointers',
  verify: {
    entry: { javascript: 'removeElement' },
    cases: [
      {
        args: [[3, 2, 2, 3], 3],
        returns: 2,
        mutates: { arg: 0, value: [2, 2], prefix: 2, unordered: true },
      },
      {
        args: [[0, 1, 2, 2, 3, 0, 4, 2], 2],
        returns: 5,
        mutates: { arg: 0, value: [0, 1, 3, 0, 4], prefix: 5, unordered: true },
      },
    ],
  },
  meta: {
    generated: ['approach.idea', 'breakdown.steps', 'solutions.Alternative: swap with last'],
  },
};

export default problem;

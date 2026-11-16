import { READ_WRITE_TEMPLATE } from '../patterns';
import type { LcProblem } from '../schema';

const problem: LcProblem = {
  id: 'lc-26-remove-duplicates-from-sorted-array',
  number: 26,
  title: 'Remove Duplicates from Sorted Array',
  slug: '26-remove-duplicates-from-sorted-array',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
  patternId: 'read-write-pointers',
  patternLabel: 'Two Pointers (read/write)',
  tags: ['array', 'two-pointers', 'in-place', 'sorted'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder:
      '`x` = শেষ unique এর ঘর। নতুন বড় মান পেলে আগে `x++`, তারপর লেখো। শেষে `x + 1` return।',
    statementBn:
      'একটা **sorted** array তে একই সংখ্যা পাশাপাশি একাধিকবার আছে। প্রতিটা সংখ্যা একবার করে রেখে বাকি duplicate গুলো সরাতে হবে, in-place। কতগুলো unique সংখ্যা থাকলো (`k`) সেটা return করো। প্রথম `k` টা ঘরে unique গুলো order এ থাকলেই হবে।',
    realLifeExample:
      'উচ্চতা অনুযায়ী লাইনে দাঁড়ানো ছাত্রদের থেকে প্রতিটা উচ্চতার একজন করে নিয়ে একটা দল বানাতে হবে। দলের সবশেষে যে আছে (`x`) তার চেয়ে লম্বা কাউকে পেলেই তাকে দলে নাও। সমান উচ্চতার হলে বাদ, কারণ সেই উচ্চতার একজন আগেই আছে।',
    samples: [
      { input: 'nums = [1,1,2]', output: '2, nums = [1,2,_]' },
      { input: 'nums = [0,0,1,1,1,2,2,3]', output: '4, nums = [0,1,2,3,_,_,_,_]' },
    ],
  },

  approach: {
    triggers: [
      '"sorted array" + "remove duplicates in-place"',
      '"return the number of unique elements k"',
    ],
    bruteForce:
      'একটা `Set` বা নতুন array তে unique গুলো রাখা → O(n) space। Array sorted, তাই শুধু শেষ unique মানের সাথে তুলনা করলেই হয়, extra জায়গা লাগে না।',
    idea: 'Array sorted, তাই একই মানগুলো পাশাপাশি থাকে। শুধু শেষ বসানো unique মানের (`nums[x]`) সাথে তুলনা করো: বড় হলেই সেটা নতুন মান, তাকে `x` এর পরের ঘরে লেখো।',
    steps: [
      '`x = 0` দিয়ে শুরু (প্রথম element সবসময় unique)।',
      '`i` দিয়ে পুরো array ঘোরো।',
      '`nums[i] > nums[x]` হলে (sorted, তাই বড় মানেই নতুন মান): আগে `x++`, তারপর `nums[x] = nums[i]`।',
      'না হলে skip।',
      '`x + 1` return করো।',
    ],
    template: {
      lang: 'javascript',
      code: READ_WRITE_TEMPLATE,
      whatChanges:
        'Read/Write template, এখানে `KEEP_CONDITION = nums[i] > nums[x]`। #27 থেকে পার্থক্য: এখানে `x` শেষ লেখা ঘরকে দেখায়, তাই **আগে `x++`, পরে লেখা**, আর শেষে `x + 1`।',
    },
  },

  breakdown: {
    variables: [
      { name: 'i', role: 'read: প্রতিটা element পড়ে', whenChanges: 'প্রতি step এ' },
      { name: 'x', role: '**শেষ বসানো unique element** এর ঘর', whenChanges: 'নতুন বড় মান পেলে' },
    ],
    invariant: '`nums[0...x]` এ সবসময় এখন পর্যন্ত পাওয়া unique মানগুলো sorted order এ থাকে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`nums = [0,0,1,1,1,2,2,3]`)',
        columns: ['i', 'nums[i]', 'nums[x]', 'নতুন?', 'কাজ', 'x (পরে)', 'array'],
        rows: [
          ['0', '0', '0', 'না', 'skip', '0', '[0,0,1,1,1,2,2,3]'],
          ['1', '0', '0', 'না', 'skip', '0', 'একই'],
          ['2', '1', '0', 'হ্যাঁ', 'x=1, nums[1]=1', '1', '[0,1,1,1,1,2,2,3]'],
          ['3', '1', '1', 'না', 'skip', '1', 'একই'],
          ['4', '1', '1', 'না', 'skip', '1', 'একই'],
          ['5', '2', '1', 'হ্যাঁ', 'x=2, nums[2]=2', '2', '[0,1,2,1,1,2,2,3]'],
          ['6', '2', '2', 'না', 'skip', '2', 'একই'],
          ['7', '3', '2', 'হ্যাঁ', 'x=3, nums[3]=3', '3', '[0,1,2,3,1,2,2,3]'],
        ],
        highlightCells: [
          [2, 6],
          [5, 6],
          [7, 6],
        ],
      },
      {
        kind: 'diagram',
        title: 'Final',
        text: `Final: [0,1,2,3 | 1,2,2,3]
              ↑
              x=3  → return x + 1 = 4`,
      },
      {
        kind: 'steps',
        title: 'Step by step (`nums = [0,0,1,1,1,2,2,3]`)',
        arrayStates: [
          {
            array: [0, 0, 1, 1, 1, 2, 2, 3],
            pointers: { i: 0, x: 0 },
            caption: 'শুরু: `x = 0`, `nums[0]` প্রথম unique, আগে থেকেই ঠিক জায়গায়।',
          },
          {
            array: [0, 0, 1, 1, 1, 2, 2, 3],
            pointers: { i: 1, x: 0 },
            caption: 'i = 1: `0` বড় না `nums[x] = 0` এর চেয়ে, skip।',
          },
          {
            array: [0, 1, 1, 1, 1, 2, 2, 3],
            pointers: { i: 2, x: 1 },
            highlight: [1],
            caption: 'i = 2: `1 > 0`, নতুন মান। আগে `x++` (x = 1), তারপর `nums[1] = 1`।',
          },
          {
            array: [0, 1, 1, 1, 1, 2, 2, 3],
            pointers: { i: 3, x: 1 },
            caption: 'i = 3: `1` আর `nums[x] = 1` সমান, skip।',
          },
          {
            array: [0, 1, 1, 1, 1, 2, 2, 3],
            pointers: { i: 4, x: 1 },
            caption: 'i = 4: আবার `1`, skip।',
          },
          {
            array: [0, 1, 2, 1, 1, 2, 2, 3],
            pointers: { i: 5, x: 2 },
            highlight: [2],
            caption: 'i = 5: `2 > 1`, নতুন মান। `x = 2`, `nums[2] = 2`।',
          },
          {
            array: [0, 1, 2, 1, 1, 2, 2, 3],
            pointers: { i: 6, x: 2 },
            caption: 'i = 6: `2` সমান, skip।',
          },
          {
            array: [0, 1, 2, 3, 1, 2, 2, 3],
            pointers: { i: 7, x: 3 },
            highlight: [3],
            dividerAt: 4,
            vars: { return: 'x + 1 = 4' },
            caption: 'i = 7: `3 > 2`, নতুন মান। `x = 3`, `nums[3] = 3`। শেষ: `return x + 1` = 4।',
          },
        ],
      },
    ],
    edgeCases: [
      'একটা element → 1',
      'সব একই (`[2,2,2]`) → 1',
      'আগে থেকেই সব unique → n',
      'Empty array তে এই code `1` return করে (ভুল)। LeetCode এ length ≥ 1, তাই সমস্যা নেই, কিন্তু অন্য জায়গায় ব্যবহার করলে guard দিতে হবে',
      'Array **sorted** হতে হবে। Unsorted হলে `>` দিয়ে কাজ হবে না',
    ],
    deepDiveBn: {
      heading: 'এখানে `x` আলাদা কেন',
      body: '#27 এ `x` হলো "পরের লেখার জায়গা", আর #26 এ `x` হলো "শেষ unique element এর জায়গা"। তাই #26 এ আগে `x++` করে তারপর লিখতে হয়, আর শেষে `x + 1` return করতে হয় (index 0 থেকে শুরু, count = index + 1)। Array sorted বলেই শুধু শেষ unique এর সাথে তুলনা করা যথেষ্ট, কারণ একই মানগুলো সবসময় পাশাপাশি থাকে।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var removeDuplicates = function (nums) {
    let x = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] > nums[x]) {
            x = x + 1;
            nums[x] = nums[i];
        }
    }

    return x + 1
};`,
      lineByLine: [
        { line: 'let x = 0', meaning: '`nums[0]` প্রথম unique, সেটা আগে থেকেই ঠিক জায়গায়' },
        {
          line: 'if (nums[i] > nums[x])',
          meaning: 'শেষ unique এর চেয়ে বড় = নতুন মান (**শুধু এই লাইনটা problem অনুযায়ী বদলায়**)',
        },
        { line: 'x = x + 1', meaning: 'নতুন unique এর জন্য পরের ঘর' },
        { line: 'nums[x] = nums[i]', meaning: 'নতুন মানটা সেখানে বসাও' },
        { line: 'return x + 1', meaning: '`x` হলো index, count = index + 1' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: compare with previous',
      isMine: false,
      lang: 'javascript',
      code: `var removeDuplicates = function (nums) {
    let x = 0;
    for (let i = 0; i < nums.length; i++) {
        if (i === 0 || nums[i] !== nums[i - 1]) {
            nums[x++] = nums[i];
        }
    }
    return x;
};`,
      complexity: { time: 'O(n)', space: 'O(1)' },
      note: 'আগের element এর সাথে তুলনা: `if (i === 0 || nums[i] !== nums[i-1])` হলে `nums[x++] = nums[i]`। এতে #27 এর মতো "`x` = পরের লেখার ঘর" থাকে, আর শেষে শুধু `x` return।',
    },
  ],
  commonMistakes: [
    '`x + 1` এর বদলে `x` return করা',
    'আগে লিখে পরে `x++` করা: তাহলে শেষ unique মানটাই overwrite হয়ে যায়',
  ],

  revise: {
    selfQuestions: [
      { q: 'কেন `x + 1` return করি, `x` না?', a: '`x` শেষ unique এর index, count = index + 1' },
      {
        q: 'Array sorted না হলে কী হতো?',
        a: '`>` দিয়ে নতুন মান চেনা যেত না, `Set` লাগতো',
      },
    ],
    patternToRemember:
      'Scan with `i`. Whenever you see a value bigger than the last unique one at `x`, move `x` forward and place it there.',
    related: [
      { number: 27, title: 'Remove Element', note: 'same template, `x` = পরের লেখার ঘর' },
      { number: 283, title: 'Move Zeroes', note: 'same template + fill' },
      {
        number: 80,
        title: 'Remove Duplicates from Sorted Array II',
        note: 'সর্বোচ্চ 2 বার রাখা যাবে',
      },
    ],
  },

  visualizationId: 'lc-array-pointers',
  verify: {
    entry: { javascript: 'removeDuplicates' },
    cases: [
      { args: [[1, 1, 2]], returns: 2, mutates: { arg: 0, value: [1, 2], prefix: 2 } },
      {
        args: [[0, 0, 1, 1, 1, 2, 2, 3]],
        returns: 4,
        mutates: { arg: 0, value: [0, 1, 2, 3], prefix: 4 },
      },
    ],
  },
  meta: {
    generated: ['approach.idea', 'breakdown.steps', 'solutions.Alternative: compare with previous'],
  },
};

export default problem;

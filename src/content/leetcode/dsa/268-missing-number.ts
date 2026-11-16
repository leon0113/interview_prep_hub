import type { LcProblem } from '../schema';

const problem: LcProblem = {
  id: 'lc-268-missing-number',
  number: 268,
  title: 'Missing Number',
  slug: '268-missing-number',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/missing-number/',
  patternId: 'sum-formula',
  alsoPatterns: ['xor-pairs-cancel'],
  patternLabel: 'Math / Sum Formula (XOR alternative)',
  tags: ['array', 'math', 'bit-manipulation'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder: 'যা হওয়ার কথা (`n * (n + 1) / 2`) − যা আছে (array এর যোগফল) = হারানো সংখ্যা।',
    statementBn:
      'Array তে `n` টা আলাদা সংখ্যা আছে, সবগুলো `0` থেকে `n` এর মধ্যে। `0...n` এ মোট `n + 1` টা সংখ্যা, তাই ঠিক একটা নেই। সেই হারানো সংখ্যাটা return করো।',
    realLifeExample:
      'ক্লাসে roll `0` থেকে `n` পর্যন্ত, একজন অনুপস্থিত। সবার roll যোগ করলে কত হওয়ার কথা তুমি formula দিয়ে জানো। যারা আছে তাদের roll যোগ করো। যতটুকু কম পড়লো, সেটাই অনুপস্থিত ছাত্রের roll।',
    samples: [
      { input: 'nums = [3,0,1]', output: '2', note: 'n=3, expected 6, actual 4, 6-4 = 2' },
      { input: 'nums = [0,1]', output: '2', note: 'n=2, expected 3, actual 1, 3-1 = 2' },
      {
        input: 'nums = [9,6,4,2,3,5,7,0,1]',
        output: '8',
        note: 'n=9, expected 45, actual 37, 45-37 = 8',
      },
    ],
  },

  approach: {
    triggers: [
      '`[0, n]` (বা `[1, n]`) range থেকে নেওয়া `n` টা আলাদা সংখ্যা, ঠিক একটা নেই',
      '"find the missing number"',
    ],
    bruteForce:
      'Sort করে প্রথম যে index এ `nums[i] !== i` সেটা খোঁজা → O(n log n)। অথবা সব `Set` এ রেখে `0...n` check করা → O(n) extra space।',
    idea: 'পুরো range এর যোগফল formula দিয়ে আগেই জানা যায়। আসল যোগফল ঠিক হারানো সংখ্যাটুকু কম হবে, তাই দুইটার পার্থক্যই উত্তর।',
    steps: [
      'Formula দিয়ে expected sum বের করো: `n * (n + 1) / 2`।',
      'Loop করে array এর সব element যোগ করো।',
      'Expected − actual return করো।',
    ],
    template: {
      lang: 'javascript',
      code: `const expected = n * (n + 1) / 2;
let actual = 0;
for (const x of nums) actual += x;
return expected - actual;`,
      whatChanges: 'Range `1...n` হলে formula বদলাবে (length তখন `n - 1`), বাকি একই।',
    },
  },

  breakdown: {
    variables: [
      { name: 'n', role: 'array এর length (আর সবচেয়ে বড় সম্ভাব্য সংখ্যা)' },
      { name: 'sum', role: '`0...n` এর যোগফল যা হওয়ার কথা: `n * (n + 1) / 2`' },
      { name: 'sumWithMissingNum', role: 'array এর আসল যোগফল (একটা সংখ্যা কম)' },
    ],
    invariant: '`sum − sumWithMissingNum` = `0...n` থেকে যে একটা মান সরানো হয়েছে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`[3,0,1]`)',
        columns: ['step', 'কাজ', 'মান'],
        rows: [
          ['1', '`n = nums.length`', '3'],
          ['2', '`sum = 3 * 4 / 2`', '6'],
          ['3', 'যোগ `+3`', '3'],
          ['4', 'যোগ `+0`', '3'],
          ['5', 'যোগ `+1`', '4'],
          ['6', '`6 - 4`', '2'],
        ],
        highlightCells: [[5, 2]],
      },
      {
        kind: 'steps',
        title: 'Step by step (`[3,0,1]`)',
        arrayStates: [
          {
            array: [3, 0, 1],
            pointers: {},
            vars: { n: 3, sum: 6, sumWithMissingNum: 0 },
            caption: '`n = 3`, তাই range `0...3`। `sum = 3 * 4 / 2 = 6`।',
          },
          {
            array: [3, 0, 1],
            pointers: { i: 0 },
            highlight: [0],
            vars: { n: 3, sum: 6, sumWithMissingNum: 3 },
            caption: 'i = 0: `+3`, আসল যোগফল 3।',
          },
          {
            array: [3, 0, 1],
            pointers: { i: 1 },
            highlight: [1],
            vars: { n: 3, sum: 6, sumWithMissingNum: 3 },
            caption: 'i = 1: `+0`, যোগফল 3 ই।',
          },
          {
            array: [3, 0, 1],
            pointers: { i: 2 },
            highlight: [2],
            vars: { n: 3, sum: 6, sumWithMissingNum: 4 },
            caption: 'i = 2: `+1`, যোগফল 4।',
          },
          {
            array: [3, 0, 1],
            pointers: {},
            vars: { n: 3, sum: 6, sumWithMissingNum: 4, return: '6 - 4 = 2' },
            caption: 'হওয়ার কথা 6, আছে 4। হারানো সংখ্যা `6 - 4 = 2`।',
          },
        ],
      },
    ],
    edgeCases: [
      '`[0]` → n=1, expected 1, actual 0 → 1',
      '`[1]` → n=1, expected 1, actual 1 → 0',
      'হারানো সংখ্যা `n` নিজেও হতে পারে (`[0,1]` → 2), তাই range `0...n`, `0...n-1` না',
      'JS এ LeetCode এর limit (n ≤ 10⁴) এ overflow হয় না, কিন্তু 32-bit int এর ভাষায় অনেক বড় `n` এ হতে পারে',
    ],
    deepDiveBn: {
      heading: 'formula কেন কাজ করে',
      body: '`0` থেকে `n` পর্যন্ত সব সংখ্যা থাকলে তাদের যোগফল হতো `n * (n + 1) / 2`। কিন্তু একটা সংখ্যা নেই, তাই আসল যোগফল ঠিক ততটাই কম। এই পার্থক্যটাই হলো হারানো সংখ্যা। যেমন `[3,0,1]` এ হওয়ার কথা ছিল `6`, আছে `4`, তাই `6 − 4 = 2` হারিয়েছে।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var missingNumber = function (nums) {
    const n = nums.length;
    const sum = n * (n + 1) / 2;
    let sumWithMissingNum = 0;

    for (let i = 0; i < n; i++) {
        sumWithMissingNum = sumWithMissingNum + nums[i]
    }

    return sum - sumWithMissingNum;
};`,
      lineByLine: [
        { line: 'const n = nums.length', meaning: '`n` টা সংখ্যা আছে, তাই range `0...n`' },
        { line: 'const sum = n * (n + 1) / 2', meaning: '`0 + 1 + ... + n` এর formula' },
        {
          line: 'sumWithMissingNum = sumWithMissingNum + nums[i]',
          meaning: 'আসলে যা আছে তার যোগফল',
        },
        { line: 'return sum - sumWithMissingNum', meaning: 'পার্থক্য = হারানো সংখ্যা' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'XOR (no overflow risk)',
      isMine: false,
      lang: 'javascript',
      code: `var missingNumber = function (nums) {
    let xor = nums.length;
    for (let i = 0; i < nums.length; i++) {
        xor ^= i ^ nums[i];
    }
    return xor;
};`,
      complexity: { time: 'O(n)', space: 'O(1)' },
      note: '`0...n` এর প্রতিটা সংখ্যা দুইবার আসে (একবার index হিসেবে, একবার value হিসেবে), শুধু হারানোটা একবার। জোড়াগুলো কেটে যায়, হারানোটা থেকে যায়।',
    },
  ],
  commonMistakes: [
    '`n` এর বদলে `n - 1` দিয়ে formula লেখা: range `0...n`, শেষ সংখ্যা `n`',
    'ধরে নেওয়া যে array sorted: sorted না, তাই index দিয়ে সরাসরি খোঁজা যায় না',
  ],

  revise: {
    selfQuestions: [
      { q: '`0...n` এর যোগফলের formula কী?', a: '`n * (n + 1) / 2`' },
      {
        q: 'XOR version এ `xor` কে `nums.length` দিয়ে শুরু করি কেন?',
        a: 'index শুধু `0...n-1` পর্যন্ত যায়, `n` টা আলাদা করে যোগ করতে হয়',
      },
    ],
    patternToRemember:
      'Expected sum from the formula minus the actual sum gives the missing number.',
    related: [
      { number: 136, title: 'Single Number', note: 'XOR দিয়ে জোড়া কাটা' },
      { number: 448, title: 'Find All Numbers Disappeared in an Array' },
      { number: 41, title: 'First Missing Positive' },
    ],
  },

  visualizationId: 'lc-array-pointers',
  verify: {
    entry: { javascript: 'missingNumber' },
    cases: [
      { args: [[3, 0, 1]], returns: 2 },
      { args: [[0, 1]], returns: 2 },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], returns: 8 },
    ],
  },
  meta: { generated: ['approach.idea', 'breakdown.steps'] },
};

export default problem;

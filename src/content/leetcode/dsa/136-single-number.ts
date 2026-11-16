import type { LcProblem } from '../schema';

const problem: LcProblem = {
  id: 'lc-136-single-number',
  number: 136,
  title: 'Single Number',
  slug: '136-single-number',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/single-number/',
  patternId: 'hash-map-counting',
  alsoPatterns: ['xor-pairs-cancel'],
  patternLabel: 'Hash Map Frequency Count (XOR alternative)',
  tags: ['array', 'hash-map', 'bit-manipulation', 'xor'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder:
      'তোমার উপায়: hash map এ গুনে count `1` খোঁজো। ভালো উপায়: সব XOR করো, জোড়া কেটে একা টা থাকে।',
    statementBn:
      'Array তে প্রতিটা সংখ্যা দুইবার করে আছে, শুধু একটা সংখ্যা একবার। সেই একা সংখ্যাটা return করো। শর্ত: O(n) time আর O(1) extra space।',
    realLifeExample:
      'একটা ঝুড়িতে মোজা জোড়ায় জোড়ায় আছে, একটা মোজার জোড়া হারিয়ে গেছে। Hash map উপায়: প্রতিটা রঙের মোজা গুনে দেখো কোনটা 1 টা। XOR উপায়: একই রঙের দুইটা মোজা পেলেই দুইটাই ফেলে দাও, শেষে যেটা হাতে থাকে সেটাই উত্তর।',
    samples: [
      { input: 'nums = [2,2,1]', output: '1' },
      { input: 'nums = [4,1,2,1,2]', output: '4' },
      { input: 'nums = [1]', output: '1' },
    ],
  },

  approach: {
    triggers: [
      '"every element appears twice except one"',
      '"find the element that appears once"',
      'frequency বা "কতবার আছে" জাতীয় প্রশ্ন → hash map',
      '"twice" + "O(1) extra space" → XOR',
    ],
    bruteForce: 'প্রতিটা element এর জন্য বাকি array scan করে গোনা → O(n²)।',
    idea: 'Hash map দিয়ে প্রতিটা সংখ্যা কতবার এসেছে গুনে count `1` যার, সেটা খোঁজো। O(1) space চাইলে XOR: একই সংখ্যা দুইবার XOR করলে 0 হয়, তাই সব XOR করলে শুধু একা সংখ্যাটা থাকে।',
    steps: [
      '**Pass 1 (গোনা):** প্রতিটা সংখ্যা `hash` এ না থাকলে 1 বসাও, থাকলে বাড়াও।',
      '**Pass 2 (খোঁজা):** আবার array ঘোরো, যার count `1` সেটা return।',
    ],
    template: {
      lang: 'javascript',
      code: `const freq = {};
for (const x of arr) freq[x] = (freq[x] || 0) + 1;   // pass 1: count
for (const x of arr) if (freq[x] === 1) return x;     // pass 2: look up`,
      whatChanges: 'Pass 2 এর condition বদলায় (`=== 1`, `> 1`, `> n/2` ...)।',
    },
  },

  breakdown: {
    variables: [{ name: 'hash', role: 'object: `সংখ্যা → কতবার এসেছে`' }],
    invariant: 'Pass 1 শেষে `hash[x]` = array তে `x` ঠিক কতবার আছে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`[4,1,2,1,2]`): Pass 1 (গোনা)',
        columns: ['i', 'nums[i]', 'hash'],
        rows: [
          ['0', '4', '{4:1}'],
          ['1', '1', '{4:1, 1:1}'],
          ['2', '2', '{4:1, 1:1, 2:1}'],
          ['3', '1', '{4:1, 1:2, 2:1}'],
          ['4', '2', '{4:1, 1:2, 2:2}'],
        ],
      },
      {
        kind: 'diagram',
        title: 'Pass 2 (খোঁজা)',
        text: 'i=0, `hash[4] === 1` → return **4**',
      },
    ],
    edgeCases: [
      'একটা element → সেটাই উত্তর',
      'Negative সংখ্যা কাজ করে, কারণ object key string হয়ে যায় (`"-3"`)',
      '`!hash[x]` এখানে নিরাপদ, কারণ count 1 থেকে শুরু হয় (truthy), কখনো 0 হয় না',
    ],
    deepDiveBn: {
      heading: 'XOR কেন কাজ করে',
      body: 'XOR এর দুইটা নিয়ম মনে রাখো: `a ^ a = 0` (একই সংখ্যা দুইবার XOR করলে শূন্য) আর `a ^ 0 = a` (শূন্যের সাথে XOR করলে সংখ্যাটাই থাকে)। সব সংখ্যা XOR করলে যেগুলো দুইবার আছে সেগুলো একে অপরকে কেটে শূন্য হয়ে যায়, আর শুধু যেটা একবার আছে সেটা বাকি থাকে। XOR এর ক্রম বদলালেও ফল একই থাকে, তাই জোড়াগুলো পাশাপাশি না থাকলেও কাজ করে।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var singleNumber = function (nums) {
    let hash = {}

    for (let i = 0; i < nums.length; i++) {
        if (!hash[nums[i]]) {
            hash[nums[i]] = 1;
        } else {
            hash[nums[i]]++;
        }
    }

    for (let i = 0; i < nums.length; i++) {
        if (hash[nums[i]] === 1) {
            return nums[i];
        }
    }

};`,
      lineByLine: [
        { line: 'let hash = {}', meaning: 'খালি গোনার খাতা' },
        { line: 'if (!hash[nums[i]]) hash[nums[i]] = 1', meaning: 'প্রথমবার দেখা, count 1' },
        { line: 'else hash[nums[i]]++', meaning: 'আগে দেখা, count বাড়াও' },
        {
          line: 'if (hash[nums[i]] === 1) return nums[i]',
          meaning: 'যার count 1, সেই উত্তর (**এই condition problem অনুযায়ী বদলায়**)',
        },
      ],
      complexity: { time: 'O(n)', space: 'O(n)' },
      note: 'Problem টা linear time আর **constant extra space** চায়। Hash map solution সঠিক কিন্তু O(n) space নেয়, তাই interview তে আগে hash map এর idea বলো, তারপর XOR এ উন্নত করো।',
    },
    {
      label: 'Optimal (XOR)',
      isMine: false,
      optimal: true,
      lang: 'javascript',
      code: `var singleNumber = function (nums) {
    let result = 0;
    for (let i = 0; i < nums.length; i++) {
        result ^= nums[i];
    }
    return result;
};`,
      complexity: { time: 'O(n)', space: 'O(1)' },
      note: 'Interviewer যেটা চায়।',
      trace: {
        kind: 'table',
        title: '`[4,1,2,1,2]` এর trace',
        columns: ['step', 'result ^ nums[i]', 'result'],
        rows: [
          ['1', '0 ^ 4', '4'],
          ['2', '4 ^ 1', '5'],
          ['3', '5 ^ 2', '7'],
          ['4', '7 ^ 1', '6'],
          ['5', '6 ^ 2', '4'],
        ],
        highlightCells: [[4, 2]],
      },
    },
  ],
  commonMistakes: [
    'Hash map দিয়ে শেষ করে দেওয়া: problem O(1) extra space চায়, hash map O(n) নেয়',
    'XOR এ `result` কে `0` এর বদলে `nums[0]` দিয়ে শুরু করে আবার index 0 থেকে loop করা: `nums[0]` দুইবার XOR হয়ে কেটে যায়',
  ],

  revise: {
    selfQuestions: [
      { q: 'XOR এর কোন দুইটা নিয়ম এখানে কাজে লাগে?', a: '`a ^ a = 0`, `a ^ 0 = a`' },
      { q: 'তোমার solution problem এর কোন শর্ত মানে না?', a: 'O(1) extra space' },
    ],
    patternToRemember:
      'Count with a hash map, then find the count of 1. Better: XOR cancels pairs, so only the single number survives.',
    related: [
      { number: 268, title: 'Missing Number', note: 'XOR version' },
      { number: 137, title: 'Single Number II' },
      { number: 260, title: 'Single Number III' },
      { number: 217, title: 'Contains Duplicate' },
      { number: 387, title: 'First Unique Character in a String' },
    ],
  },

  visualizationId: 'lc-hash-map-count',
  verify: {
    entry: { javascript: 'singleNumber' },
    cases: [
      { args: [[2, 2, 1]], returns: 1 },
      { args: [[4, 1, 2, 1, 2]], returns: 4 },
      { args: [[1]], returns: 1 },
    ],
  },
  meta: { generated: ['approach.idea'] },
};

export default problem;

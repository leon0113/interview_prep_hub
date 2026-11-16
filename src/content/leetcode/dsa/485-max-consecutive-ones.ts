import type { LcProblem } from '../schema';

const problem: LcProblem = {
  id: 'lc-485-max-consecutive-ones',
  number: 485,
  title: 'Max Consecutive Ones',
  slug: '485-max-consecutive-ones',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/max-consecutive-ones/',
  patternId: 'streak-counting',
  patternLabel: 'Single Pass / Streak Counting',
  tags: ['array', 'one-pass', 'counting'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder: '`1` পেলে `count++` আর `maxCount` update, `0` পেলে `count = 0`।',
    statementBn:
      'শুধু `0` আর `1` দিয়ে বানানো একটা array। পাশাপাশি (একটানা) সবচেয়ে বেশি কয়টা `1` আছে, সেটা return করো।',
    realLifeExample:
      'প্রতিদিন gym এ গেলে `1`, না গেলে `0`। একটানা সবচেয়ে বেশি কত দিন গিয়েছ (streak)? একদিন মিস করলে streak আবার 0 থেকে শুরু, কিন্তু "সেরা streak" এর রেকর্ড থেকে যায়।',
    samples: [
      { input: 'nums = [1,1,0,1,1,1]', output: '3' },
      { input: 'nums = [1,0,1,1,0,1]', output: '2' },
    ],
  },

  approach: {
    triggers: ['"consecutive", "longest run / streak"', 'binary array, সবচেয়ে লম্বা `1` এর block'],
    bruteForce:
      'প্রতিটা index থেকে শুরু করে যতক্ষণ `1` ততক্ষণ গোনা → worst case O(n²)। একটা চলমান `count` দিয়ে এক pass এই হয়।',
    idea: 'একটা চলমান `count` রাখো যেটা streak ভাঙলে শূন্য হয়, আর আলাদা `maxCount` এ সবচেয়ে বড় streak এর রেকর্ড রাখো। প্রতিবার `count` বাড়লেই রেকর্ড মিলিয়ে দেখো।',
    steps: [
      '`count = 0`, `maxCount = 0`।',
      'প্রতিটা element: `1` হলে `count++`, তারপর `maxCount = max(maxCount, count)`; `0` হলে `count = 0` (streak ভেঙে গেছে)।',
      '`maxCount` return।',
    ],
    template: {
      lang: 'javascript',
      code: `let count = 0, best = 0;
for (const x of arr) {
    if (STREAK_CONDITION) {
        count++;
        best = Math.max(best, count);
    } else {
        count = 0;
    }
}
return best;`,
      whatChanges:
        'শুধু `STREAK_CONDITION` বদলায় (`x === 1`, `s[i] === s[i-1]`, `nums[i] > nums[i-1]` ...)।',
    },
  },

  breakdown: {
    variables: [
      { name: 'count', role: 'বর্তমান streak', whenChanges: '`1` এ বাড়ে, `0` এ শূন্য' },
      {
        name: 'maxCount',
        role: 'এখন পর্যন্ত সবচেয়ে বড় streak',
        whenChanges: '`count` এর চেয়ে ছোট হলে',
      },
    ],
    invariant: '`count` = index `i` তে শেষ হওয়া streak এর length, আর সবসময় `maxCount >= count`।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`[1,1,0,1,1,1]`)',
        columns: ['i', 'nums[i]', 'count', 'maxCount'],
        rows: [
          ['0', '1', '1', '1'],
          ['1', '1', '2', '2'],
          ['2', '0', '0 (reset)', '2'],
          ['3', '1', '1', '2'],
          ['4', '1', '2', '2'],
          ['5', '1', '3', '3'],
        ],
        highlightCells: [[5, 3]],
      },
      {
        kind: 'steps',
        title: 'Step by step (`[1,1,0,1,1,1]`)',
        arrayStates: [
          {
            array: [1, 1, 0, 1, 1, 1],
            pointers: { i: 0 },
            highlight: [0],
            vars: { count: 1, maxCount: 1 },
            caption: 'i = 0: `1`, `count = 1`, `maxCount = 1`।',
          },
          {
            array: [1, 1, 0, 1, 1, 1],
            pointers: { i: 1 },
            highlight: [0, 1],
            vars: { count: 2, maxCount: 2 },
            caption: 'i = 1: `1`, `count = 2`, নতুন রেকর্ড `maxCount = 2`।',
          },
          {
            array: [1, 1, 0, 1, 1, 1],
            pointers: { i: 2 },
            vars: { count: 0, maxCount: 2 },
            caption: 'i = 2: `0`, streak ভাঙলো, `count = 0`। `maxCount` 2 ই থাকে।',
          },
          {
            array: [1, 1, 0, 1, 1, 1],
            pointers: { i: 3 },
            highlight: [3],
            vars: { count: 1, maxCount: 2 },
            caption: 'i = 3: নতুন streak শুরু, `count = 1`।',
          },
          {
            array: [1, 1, 0, 1, 1, 1],
            pointers: { i: 4 },
            highlight: [3, 4],
            vars: { count: 2, maxCount: 2 },
            caption: 'i = 4: `count = 2`, রেকর্ডের সমান, ভাঙেনি।',
          },
          {
            array: [1, 1, 0, 1, 1, 1],
            pointers: { i: 5 },
            highlight: [3, 4, 5],
            vars: { count: 3, maxCount: 3 },
            caption: 'i = 5: `count = 3`, নতুন রেকর্ড `maxCount = 3`। শেষের streak ও ধরা পড়লো।',
          },
        ],
      },
    ],
    edgeCases: [
      'সব `0` → 0',
      'সব `1` → n',
      'সবচেয়ে বড় streak একদম শেষে → সমস্যা নেই, কারণ `maxCount` loop এর ভেতরেই update হয়, শুধু reset এর সময় না',
    ],
    deepDiveBn: {
      heading: '`maxCount` কখন update করব',
      body: '`count` হলো বর্তমান streak, আর `maxCount` হলো এখন পর্যন্ত সবচেয়ে বড় streak। `0` পেলে `count` শূন্য হয়ে যায়, কিন্তু `maxCount` একই থাকে। প্রতিবার `count` বাড়ার সাথে সাথে `maxCount` update করলে শেষের streak ও মিস হয় না।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var findMaxConsecutiveOnes = function (nums) {
    let count = 0;
    let maxCount = 0;

    for (let i = 0; i < nums.length; i++) {
        if (nums[i] === 1) {
            count++;
            maxCount = Math.max(maxCount, count);
        } else {
            count = 0;
        }
    }

    return maxCount;
};`,
      lineByLine: [
        {
          line: 'if (nums[i] === 1)',
          meaning: 'streak চলছে কিনা (**এই লাইনটা problem অনুযায়ী বদলায়**)',
        },
        { line: 'count++', meaning: 'streak এক বাড়লো' },
        {
          line: 'maxCount = Math.max(maxCount, count)',
          meaning: 'রেকর্ড ভাঙলো কিনা, সাথে সাথে দেখো',
        },
        { line: 'count = 0', meaning: 'streak ভেঙেছে, আবার শূন্য থেকে' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: join + split',
      isMine: false,
      lang: 'javascript',
      code: `var findMaxConsecutiveOnes = function (nums) {
    return Math.max(...nums.join('').split('0').map((part) => part.length));
};`,
      complexity: { time: 'O(n)', space: 'O(n)' },
      note: "`nums.join('').split('0')` করে সবচেয়ে লম্বা টুকরার length। ছোট code, কিন্তু string বানায় → O(n) extra space।",
    },
  ],
  commonMistakes: [
    'শুধু `0` পেলে `maxCount` update করা: শেষের streak মিস হয় (`[1,1,0,1,1,1]` এ 2 আসবে, 3 না)',
    '`0` পেলে `count` reset করতে ভুলে যাওয়া: তাহলে মোট `1` এর সংখ্যা আসে, streak না',
  ],

  revise: {
    selfQuestions: [
      {
        q: '`0` পেলে কোন variable বদলায়, কোনটা বদলায় না?',
        a: '`count` শূন্য হয়, `maxCount` থাকে',
      },
      {
        q: 'শুধু reset এর সময় `maxCount` update করলে কোন case ভুল হবে?',
        a: 'শেষে `1` দিয়ে শেষ হওয়া array',
      },
    ],
    patternToRemember: 'Count the current streak, reset when it breaks, keep the maximum.',
    related: [
      {
        number: 121,
        title: 'Best Time to Buy and Sell Stock',
        note: 'একই রকম one pass, "এখন পর্যন্ত সেরা" ধরে রাখা',
      },
      { number: 1446, title: 'Consecutive Characters' },
      { number: 1004, title: 'Max Consecutive Ones III' },
    ],
  },

  visualizationId: 'lc-array-pointers',
  verify: {
    entry: { javascript: 'findMaxConsecutiveOnes' },
    cases: [
      { args: [[1, 1, 0, 1, 1, 1]], returns: 3 },
      { args: [[1, 0, 1, 1, 0, 1]], returns: 2 },
    ],
  },
  meta: {
    generated: ['approach.idea', 'breakdown.steps', 'solutions.Alternative: join + split'],
  },
};

export default problem;

import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const recursionTemplate = patterns.find((p) => p.id === 'recursion-shrink')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-231-power-of-two',
  number: 231,
  title: 'Power of Two',
  slug: '231-power-of-two',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/power-of-two/',
  patternId: 'recursion-shrink',
  alsoPatterns: ['bit-trick'],
  patternLabel: 'Recursion (halving) / Bit trick alternative',
  tags: ['math', 'recursion', 'bit-manipulation'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder: 'বারবার 2 দিয়ে ভাগ করো। `1` এ পৌঁছালে true, বিজোড় বা `1` এর নিচে গেলে false।',
    statementBn:
      'একটা integer `n` দেওয়া আছে। `n` কি `2` এর কোনো power (`1, 2, 4, 8, 16, ...`)? হ্যাঁ হলে `true`, না হলে `false`।',
    realLifeExample:
      'একটা চকলেট বার বারবার সমান দুই ভাগ করছো। যদি প্রতিবার ঠিক সমান ভাগ হয় আর শেষে ঠিক 1 টা টুকরা থাকে, তাহলে এটা 2 এর power। কোনো ধাপে সমান ভাগ না হলে (বিজোড়), তাহলে না।',
    samples: [
      { input: 'n = 1', output: 'true', note: '2^0' },
      { input: 'n = 16', output: 'true', note: '2^4' },
      { input: 'n = 3', output: 'false' },
      { input: 'n = 6', output: 'false', note: '6 → 3, তারপর 3 বিজোড়' },
      { input: 'n = 0', output: 'false' },
      { input: 'n = -16', output: 'false' },
    ],
  },

  approach: {
    triggers: [
      '"is `n` a power of two / three / four?"',
      'যে সংখ্যা বারবার একই সংখ্যা দিয়ে ভাগ করা যায়',
    ],
    bruteForce:
      '`1, 2, 4, 8, ...` বানাতে থাকা যতক্ষণ না `n` এ পৌঁছায় বা পার হয় → O(log n)। নিচের recursion একই idea, শুধু উল্টো দিক থেকে (`n` কে ভাগ করে নামানো)।',
    idea: '2 এর power হলে বারবার অর্ধেক করলে প্রতিবার জোড় থাকবে আর শেষে ঠিক 1 এ পৌঁছাবে। তাই base case (1 → true; 1 এর নিচে বা বিজোড় → false) দিয়ে `n / 2` তে recursion করো।',
    steps: [
      '`n === 1` হলে `true`।',
      '`n < 1` বা `n` বিজোড় হলে `false`।',
      'না হলে `n / 2` দিয়ে একই প্রশ্ন আবার করো।',
    ],
    template: {
      lang: recursionTemplate.lang,
      code: recursionTemplate.code,
      whatChanges:
        'Recursion template (cheat sheet এ)। এখানে base case = `1`, shrink = `n / 2`। Power of Three / Four এ শুধু `2` এর জায়গায় `3` / `4` বসবে।',
    },
  },

  breakdown: {
    baseCases: [
      { condition: '`n === 1`', result: '`true`', why: '`2⁰ = 1`' },
      { condition: '`n < 1`', result: '`false`', why: '0 আর negative কখনো 2 এর power না' },
      { condition: '`n % 2 !== 0`', result: '`false`', why: 'বিজোড় আর `1` না' },
    ],
    recursiveStep: '`isPowerOfTwo(n / 2)`',
    invariant: 'প্রতিটা call এ `n` = আসল সংখ্যা ÷ `2^(এখন পর্যন্ত call সংখ্যা)`, আর এটা এখনো পূর্ণ সংখ্যা।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`n = 16`)',
        columns: ['call', 'n', 'কোন check মিললো', 'ফল'],
        rows: [
          ['1', '16', 'কোনোটা না → `n / 2`', '→'],
          ['2', '8', 'কোনোটা না → `n / 2`', '→'],
          ['3', '4', 'কোনোটা না → `n / 2`', '→'],
          ['4', '2', 'কোনোটা না → `n / 2`', '→'],
          ['5', '1', '`n === 1`', 'true'],
        ],
        highlightCells: [[4, 3]],
      },
      { kind: 'diagram', title: '`n = 6`', text: 'n = 6:   6 → 3   → 3 বিজোড় আর ≠ 1 → false' },
    ],
    edgeCases: [
      '`n = 1` → true (**সবার আগে** check করতে হবে)',
      '`n = 0` → false। `n < 1` check না থাকলে `0 / 2 = 0`, অসীম recursion',
      'Negative → false',
      'Check এর order গুরুত্বপূর্ণ: `1` বিজোড়, তাই বিজোড় check এর আগে `n === 1` না দেখলে ভুল উত্তর আসবে',
    ],
    deepDiveBn: {
      heading: 'bit trick কেন কাজ করে',
      body: '2 এর power এর binary তে ঠিক একটাই `1` থাকে (যেমন `8 = 1000`)। তার থেকে `1` কমালে ওই `1` টা `0` হয়ে যায়, আর তার ডানের সব `0` গুলো `1` হয়ে যায় (`7 = 0111`)। তাই দুটোকে `&` করলে সব বিট `0` হয়ে যায়। আর যদি একাধিক `1` থাকে (যেমন `6 = 110`), তাহলে উপরের `1` টা থেকে যায় এবং ফল `0` হয় না।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var isPowerOfTwo = function (n) {
    if (n === 1) return true;
    else if (n < 1 || (n % 2 !== 0)) return false;
    return isPowerOfTwo(n / 2);
};`,
      lineByLine: [
        {
          line: 'if (n === 1) return true',
          meaning: 'ভাগ করতে করতে 1 এ পৌঁছেছি, তাই হ্যাঁ (**সবার আগে check করতে হবে**)',
        },
        {
          line: 'n < 1',
          meaning: '0 বা negative, কখনো হবে না (এটা না থাকলে 0 তে অসীম recursion)',
        },
        { line: 'n % 2 !== 0', meaning: 'বিজোড়, সমান দুই ভাগ হয় না' },
        { line: 'return isPowerOfTwo(n / 2)', meaning: 'অর্ধেক করে আবার একই প্রশ্ন' },
      ],
      complexity: { time: 'O(log n)', space: 'O(log n) (call stack)' },
      note: 'সঠিক, কিন্তু O(log n) call stack নেয়। Bit trick O(1) এ করে।',
    },
    {
      label: 'Optimal (bit trick)',
      isMine: false,
      optimal: true,
      lang: 'javascript',
      code: `var isPowerOfTwo = function (n) {
    return n > 0 && (n & (n - 1)) === 0;
};`,
      complexity: { time: 'O(1)', space: 'O(1)' },
      trace: {
        kind: 'diagram',
        title: 'Binary তে',
        text: `n = 8:   1000       n = 6:   110
n-1 = 7: 0111       n-1 = 5: 101
AND    = 0000 → true      AND = 100 → false`,
      },
    },
  ],
  commonMistakes: [
    'বিজোড় check আগে, `n === 1` পরে লেখা: `1` এর জন্য `false` আসে',
    '`n <= 0` check ভুলে যাওয়া: `n = 0` তে stack overflow',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'তিনটা base case কী কী, আর কোনটা সবার আগে?',
        a: '`n === 1` → true আগে, তারপর `n < 1` আর বিজোড় → false',
      },
      { q: '2 এর power এর binary তে কয়টা `1` থাকে?', a: 'ঠিক একটা' },
    ],
    patternToRemember: 'Keep halving. If it hits 1, yes. If it turns odd or drops below 1, no.',
    related: [
      { number: 509, title: 'Fibonacci Number', note: 'আরেকটা recursion, base case + ছোট input' },
      { number: 326, title: 'Power of Three' },
      { number: 342, title: 'Power of Four' },
      { number: 191, title: 'Number of 1 Bits' },
    ],
  },

  visualizationId: 'lc-recursion-tree',
  verify: {
    entry: { javascript: 'isPowerOfTwo' },
    cases: [
      { args: [1], returns: true },
      { args: [16], returns: true },
      { args: [3], returns: false },
      { args: [6], returns: false },
      { args: [0], returns: false },
      { args: [-16], returns: false },
    ],
  },
  meta: { generated: ['approach.idea'] },
};

export default problem;

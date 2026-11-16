import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const recursionTemplate = patterns.find((p) => p.id === 'recursion-shrink')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-509-fibonacci-number',
  number: 509,
  title: 'Fibonacci Number',
  slug: '509-fibonacci-number',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/fibonacci-number/',
  patternId: 'tree-recursion-dp',
  patternLabel: 'Tree Recursion → Memoization / Iterative DP',
  tags: ['math', 'recursion', 'dynamic-programming', 'memoization'],
  solvedIn: ['python'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder:
      '`n <= 1` হলে `n`, না হলে আগের দুইটার যোগফল। একই হিসাব বারবার হয়, তাই memo বা loop দিয়ে বাঁচাও।',
    statementBn:
      'Fibonacci sequence: `0, 1, 1, 2, 3, 5, 8, ...`। প্রথম দুইটা `F(0) = 0`, `F(1) = 1`, তারপর প্রতিটা = আগের দুইটার যোগফল। `n` দেওয়া আছে, `F(n)` return করো।',
    realLifeExample:
      'সিঁড়িতে প্রতিবার 1 বা 2 ধাপ উঠতে পারো। `n` তম ধাপে পৌঁছানোর উপায় = (`n-1` থেকে 1 ধাপে আসার উপায়) + (`n-2` থেকে 2 ধাপে আসার উপায়)। এটাই Fibonacci (#70 Climbing Stairs)।',
    samples: [
      { input: 'n = 2', output: '1', note: '1 + 0' },
      { input: 'n = 3', output: '2', note: '1 + 1' },
      { input: 'n = 4', output: '3', note: '2 + 1' },
      { input: 'n = 10', output: '55' },
    ],
  },

  approach: {
    triggers: [
      '"each value is the sum of the previous two"',
      'নিজের ছোট version দিয়ে সংজ্ঞায়িত formula: `F(n) = F(n-1) + F(n-2)`',
      '"how many ways" + প্রতি step এ কয়েকটা choice → প্রায়ই Fibonacci-style DP',
    ],
    bruteForce:
      'নিচের recursive solution টাই সংজ্ঞার সরাসরি রূপ। সঠিক, কিন্তু ধীর (একই subproblem বারবার হিসাব করে)।',
    idea: 'সংজ্ঞাটা সরাসরি recursion: base case `0` আর `1`, বাকিটা আগের দুইটার যোগফল। একই subproblem বারবার আসে, তাই উত্তর মনে রাখো (memo), অথবা ছোট থেকে বড় loop এ শুধু শেষ দুইটা মান রাখো।',
    steps: ['`n <= 1` হলে `n` return।', 'না হলে `fib(n - 1) + fib(n - 2)` return।'],
    template: {
      lang: recursionTemplate.lang,
      code: recursionTemplate.code,
      whatChanges:
        'Recursion template (cheat sheet এ)। DP তে রূপান্তর: (1) recursion লেখো → (2) একই call বারবার হলে `memo` তে রাখো → (3) ছোট থেকে বড় loop এ বানাও, শুধু দরকারি শেষ কয়টা মান রাখো।',
    },
  },

  breakdown: {
    baseCases: [{ condition: '`n <= 1`', result: '`n` (`F(0) = 0`, `F(1) = 1`)' }],
    recursiveStep: '`fib(n - 1) + fib(n - 2)`',
    invariant:
      '`n` এর চেয়ে ছোট যেকোনো `k` এর জন্য `fib(k)` সঠিক Fibonacci মান দেয়, তাই দুইটা ছোট উত্তর যোগ করলে বড়টা পাওয়া যায়।',
    trace: [
      {
        kind: 'diagram',
        title: 'Trace (`fib(4)` recursion tree)',
        text: `                  fib(4)
                /        \\
           fib(3)         fib(2)
          /      \\        /     \\
      fib(2)   fib(1)  fib(1)  fib(0)
      /    \\
  fib(1)  fib(0)

Leaves:  fib(1)=1, fib(0)=0
fib(2) = 1 + 0 = 1
fib(3) = fib(2) + fib(1) = 1 + 1 = 2
fib(4) = fib(3) + fib(2) = 2 + 1 = 3`,
      },
      {
        kind: 'diagram',
        title: 'খেয়াল করো',
        text: '`fib(2)` **দুইবার** হিসাব হয়েছে। এই পুনরাবৃত্তিই ধীর হওয়ার কারণ।',
      },
    ],
    edgeCases: [
      '`n = 0` → 0',
      '`n = 1` → 1',
      'Constraint `0 ≤ n ≤ 30`, তাই সাধারণ recursion pass করে, কিন্তু `n = 50` এর মতো মানে খুব ধীর হবে',
    ],
    deepDiveBn: {
      heading: 'recursion ধীর কেন',
      body: '`fib(4)` বের করতে `fib(3)` আর `fib(2)` লাগে, আবার `fib(3)` বের করতে নতুন করে `fib(2)` লাগে। অর্থাৎ একই হিসাব বারবার হয়, আর `n` বাড়লে call সংখ্যা প্রায় দ্বিগুণ হারে বাড়ে (তাই O(2ⁿ))। Memoization এ একবার হিসাব করা উত্তর `memo` তে রেখে পরেরবার সরাসরি নেওয়া হয়। Iterative এ শুধু শেষ দুইটা মান (`prev`, `curr`) মনে রাখলেই চলে, তাই extra জায়গা লাগে না।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'python',
      code: `class Solution:
    def fib(self, n: int) -> int:
        if n <= 1:
            return n
        return self.fib(n -1) + self.fib(n -2)`,
      lineByLine: [
        { line: 'if n <= 1: return n', meaning: 'base case: `F(0) = 0`, `F(1) = 1`' },
        {
          line: 'return self.fib(n -1) + self.fib(n -2)',
          meaning: 'আগের দুইটা Fibonacci যোগ করো (দুইটা call → tree এর মতো ছড়ায়)',
        },
      ],
      complexity: { time: 'O(2ⁿ)', space: 'O(n) call stack' },
      note: 'সঠিক, কিন্তু একই subproblem বারবার হিসাব করে, তাই exponential time।',
    },
    {
      label: 'Memoization (top-down)',
      isMine: false,
      lang: 'python',
      code: `class Solution:
    def fib(self, n: int) -> int:
        memo = {}
        def helper(k):
            if k <= 1:
                return k
            if k in memo:
                return memo[k]
            memo[k] = helper(k - 1) + helper(k - 2)
            return memo[k]
        return helper(n)`,
      complexity: { time: 'O(n)', space: 'O(n)' },
    },
    {
      label: 'Iterative (bottom-up)',
      isMine: false,
      optimal: true,
      lang: 'python',
      code: `class Solution:
    def fib(self, n: int) -> int:
        if n <= 1:
            return n
        prev, curr = 0, 1
        for _ in range(2, n + 1):
            prev, curr = curr, prev + curr
        return curr`,
      complexity: { time: 'O(n)', space: 'O(1)' },
      note: 'সবচেয়ে ভালো।',
      trace: {
        kind: 'table',
        title: '`n = 5` এর trace',
        columns: ['step', 'prev', 'curr'],
        rows: [
          ['শুরু', '0', '1'],
          ['2', '1', '1'],
          ['3', '1', '2'],
          ['4', '2', '3'],
          ['5', '3', '5'],
        ],
        highlightCells: [[4, 2]],
      },
    },
  ],
  commonMistakes: [
    'Base case শুধু `n == 1` রাখা: `fib(0)` থেকে `fib(-1)`, `fib(-2)` ... অসীম recursion',
    'Memo dictionary কে function এর ভেতরে প্রতি call এ নতুন করে বানানো: তাহলে memo কোনো কাজে আসে না',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'Recursion O(2ⁿ) কেন?',
        a: 'প্রতিটা call দুইটা call করে, আর একই subproblem বারবার হয়',
      },
      { q: 'Iterative version এ কয়টা variable লাগে?', a: 'দুইটা, `prev` আর `curr`' },
    ],
    patternToRemember:
      'Base cases `0` and `1`, then add the previous two. If the same subproblem repeats, save it (memoize) or build upward.',
    related: [
      { number: 231, title: 'Power of Two', note: 'আরেকটা recursion' },
      { number: 70, title: 'Climbing Stairs' },
      { number: 1137, title: 'N-th Tribonacci Number' },
      { number: 746, title: 'Min Cost Climbing Stairs' },
      { number: 198, title: 'House Robber' },
    ],
  },

  visualizationId: 'lc-recursion-tree',
  verify: {
    entry: { python: 'fib' },
    cases: [
      { args: [0], returns: 0 },
      { args: [1], returns: 1 },
      { args: [2], returns: 1 },
      { args: [3], returns: 2 },
      { args: [4], returns: 3 },
      { args: [10], returns: 55 },
    ],
  },
  meta: { generated: ['approach.idea'] },
};

export default problem;

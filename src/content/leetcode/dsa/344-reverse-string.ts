import type { LcProblem } from '../schema';

const problem: LcProblem = {
  id: 'lc-344-reverse-string',
  number: 344,
  title: 'Reverse String',
  slug: '344-reverse-string',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/reverse-string/',
  patternId: 'swap-both-ends',
  patternLabel: 'Two Pointers (swap from both ends)',
  tags: ['array', 'string', 'two-pointers', 'in-place'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder: 'দুই মাথা swap করো, ভেতরে আসো, মাঝে থামো। Mirror index = `n - 1 - i`।',
    statementBn:
      'Character এর একটা array দেওয়া আছে। সেটা উল্টে দিতে হবে, একই array তে (in-place, O(1) extra memory)। কিছু return করতে হয় না।',
    realLifeExample:
      'একটা লাইনে দাঁড়ানো মানুষদের উল্টো order এ দাঁড় করাতে হবে। প্রথম আর শেষ জন জায়গা বদলায়, তারপর দ্বিতীয় আর শেষের আগের জন, এভাবে মাঝখান পর্যন্ত। মাঝের জন (বেজোড় হলে) নিজের জায়গাতেই থাকে।',
    samples: [
      { input: 's = ["h","e","l","l","o"]', output: 's = ["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: 's = ["h","a","n","n","a","H"]' },
    ],
  },

  approach: {
    triggers: [
      '"reverse in-place"',
      'array/string, O(1) extra memory',
      'palindrome বা দুই দিক থেকে মিলিয়ে দেখার মতো problem',
    ],
    bruteForce:
      'নতুন উল্টো array বানানো (O(n) space), বা `.reverse()` ব্যবহার করা (logic লুকিয়ে যায়, interview তে চলে না)।',
    idea: 'বাম থেকে `i` আর ডান থেকে তার mirror `n - 1 - i` এর মান swap করো। প্রতি swap এ দুইটা ঘর চূড়ান্ত জায়গায় যায়, তাই অর্ধেক পর্যন্ত গেলেই পুরো array উল্টে যায়।',
    steps: [
      '`temp` এ বাম মান রাখো।',
      'ডান মান বাম ঘরে বসাও।',
      '`temp` ডান ঘরে বসাও।',
      '`i++` করে ভেতরে আসো।',
      '`i < floor(n / 2)` হওয়া পর্যন্ত চলবে।',
    ],
    template: {
      lang: 'javascript',
      code: `for (let i = 0; i < Math.floor(n / 2); i++) {
    const j = n - 1 - i;      // mirror position
    [arr[i], arr[j]] = [arr[j], arr[i]];
}`,
      whatChanges:
        'Problem অনুযায়ী বদলায়: swap এর বদলে তুলনা (palindrome), বা কোন element skip করবে (শুধু vowel, শুধু letter)।',
    },
  },

  breakdown: {
    variables: [
      { name: 'i', role: 'বাম দিকের ঘর', whenChanges: 'প্রতি step এ ডানে (`i++`)' },
      {
        name: 'n - 1 - i',
        role: 'ডান দিকের mirror ঘর',
        whenChanges: '`i` বাড়লে নিজে থেকেই বামে সরে',
      },
    ],
    invariant: '`i` টা swap এর পরে প্রথম `i` টা আর শেষ `i` টা ঘর তাদের শেষ (উল্টানো) জায়গায় আছে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`["h","e","l","l","o"]`, n = 5, loop চলে `floor(5/2) = 2` বার)',
        columns: ['i', 'mirror (`n-1-i`)', 'swap', 'array'],
        rows: [
          ['0', '4', 'h ↔ o', '["o","e","l","l","h"]'],
          ['1', '3', 'e ↔ l', '["o","l","l","e","h"]'],
          ['—', '—', 'index 2 (মাঝ) নড়ে না', '["o","l","l","e","h"]'],
        ],
        highlightCells: [
          [0, 3],
          [1, 3],
        ],
      },
      {
        kind: 'steps',
        title: 'Step by step (`["h","e","l","l","o"]`)',
        arrayStates: [
          {
            array: ['h', 'e', 'l', 'l', 'o'],
            pointers: { i: 0, mirror: 4 },
            vars: { n: 5, 'floor(n/2)': 2 },
            caption: 'শুরু: `i = 0`, mirror = `n - 1 - i` = 4। Loop চলবে 2 বার।',
          },
          {
            array: ['o', 'e', 'l', 'l', 'h'],
            pointers: { i: 0, mirror: 4 },
            highlight: [0, 4],
            vars: { n: 5, 'floor(n/2)': 2 },
            caption: 'i = 0: `h ↔ o` swap।',
          },
          {
            array: ['o', 'l', 'l', 'e', 'h'],
            pointers: { i: 1, mirror: 3 },
            highlight: [1, 3],
            vars: { n: 5, 'floor(n/2)': 2 },
            caption: 'i = 1: `e ↔ l` swap।',
          },
          {
            array: ['o', 'l', 'l', 'e', 'h'],
            pointers: { i: 2, mirror: 2 },
            highlight: [2],
            vars: { n: 5, 'floor(n/2)': 2 },
            caption: '`i = 2` আর `floor(5/2) = 2` এর চেয়ে ছোট না, loop শেষ। মাঝের `l` নড়ে না।',
          },
        ],
      },
    ],
    edgeCases: [
      'Length 1 → loop 0 বার চলে, কিছু বদলায় না',
      'জোড় length (`n = 6`) → 3 টা swap, মাঝের element নেই',
      'বেজোড় length → মাঝের element নিজের জায়গায় থাকে',
    ],
    deepDiveBn: {
      heading: '`n/2` কেন',
      body: 'একটা swap এ দুইটা জায়গা ঠিক হয়ে যায় (বাম আর ডান)। তাই array এর অর্ধেক পর্যন্ত গেলেই পুরো array ঠিক হয়ে যায়। যদি পুরোটা loop করো, তাহলে দ্বিতীয় অর্ধেকে গিয়ে আবার একই জোড়া swap হবে, ফলে আগের কাজ উল্টে যাবে। বেজোড় সংখ্যায় মাঝের element নিজের জায়গাতেই থাকে, তাই সেটা swap করা লাগে না।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var reverseString = function (s) {
    const n = s.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
        const temp = s[i];
        s[i] = s[n - 1 - i];
        s[n - 1 - i] = temp;
    }
};`,
      lineByLine: [
        {
          line: 'i < Math.floor(n / 2)',
          meaning: 'শুধু অর্ধেক পর্যন্ত, কারণ প্রতি swap এ দুইটা ঘর ঠিক হয়',
        },
        { line: 'const temp = s[i]', meaning: 'বাম মান হারিয়ে না যায় তাই আগে রেখে দাও' },
        { line: 's[i] = s[n - 1 - i]', meaning: 'ডান মান বামে' },
        { line: 's[n - 1 - i] = temp', meaning: 'বাম মান (temp থেকে) ডানে' },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: left/right while loop',
      isMine: false,
      lang: 'javascript',
      code: `var reverseString = function (s) {
    let left = 0, right = s.length - 1;
    while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
};`,
      complexity: { time: 'O(n)', space: 'O(1)' },
      note: 'একই logic, `n/2` formula মনে রাখতে হয় না, আর এটাই বেশিরভাগ two-pointer problem এ লাগে।',
    },
  ],
  commonMistakes: [
    'পুরো array (`i < n`) loop করা: দ্বিতীয় অর্ধেকে আবার swap হয়ে array আগের মতো হয়ে যায়',
    '`temp` ছাড়া `s[i] = s[n-1-i]; s[n-1-i] = s[i]` লেখা: বাম মান হারিয়ে যায়',
  ],

  revise: {
    selfQuestions: [
      { q: 'Index `i` এর mirror কোনটা?', a: '`n - 1 - i`' },
      {
        q: 'পুরো array loop করলে কী হবে?',
        a: 'সব swap দুইবার হয়ে array আগের মতো হয়ে যাবে',
      },
    ],
    patternToRemember: 'Mirror index = `n - 1 - i`. Swap pairs until the middle.',
    related: [
      {
        number: 88,
        title: 'Merge Sorted Array',
        note: 'two pointers, কিন্তু একই দিকে পিছন থেকে',
      },
      { number: 125, title: 'Valid Palindrome', note: 'swap এর বদলে তুলনা' },
      { number: 345, title: 'Reverse Vowels of a String' },
    ],
  },

  visualizationId: 'lc-array-pointers',
  verify: {
    entry: { javascript: 'reverseString' },
    cases: [
      {
        args: [['h', 'e', 'l', 'l', 'o']],
        mutates: { arg: 0, value: ['o', 'l', 'l', 'e', 'h'] },
      },
      {
        args: [['H', 'a', 'n', 'n', 'a', 'h']],
        mutates: { arg: 0, value: ['h', 'a', 'n', 'n', 'a', 'H'] },
      },
    ],
  },
  meta: {
    generated: ['approach.idea', 'breakdown.steps', 'solutions.Alternative: left/right while loop'],
  },
};

export default problem;

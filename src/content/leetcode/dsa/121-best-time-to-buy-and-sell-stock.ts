import type { LcProblem } from '../schema';

const problem: LcProblem = {
  id: 'lc-121-best-time-to-buy-and-sell-stock',
  number: 121,
  title: 'Best Time to Buy and Sell Stock',
  slug: '121-best-time-to-buy-and-sell-stock',
  category: 'dsa',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
  patternId: 'min-so-far-greedy',
  patternLabel: 'One Pass / Min-so-far / Greedy',
  tags: ['array', 'greedy', 'one-pass'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder:
      'এখন পর্যন্ত সবচেয়ে কম দাম (`lowest`) মনে রাখো। প্রতিদিন "আজ বেচলে লাভ কত" দেখো, সর্বোচ্চটা রাখো।',
    statementBn:
      'প্রতিদিনের stock এর দাম একটা array তে আছে। একবার কিনবে, একবার বেচবে, আর কেনা অবশ্যই বেচার আগে। সর্বোচ্চ কত লাভ করা যায় return করো। লাভ না হলে `0`।',
    realLifeExample:
      'তুমি প্রতিদিন বাজারে যাও আর একটা খাতায় লিখে রাখো "এখন পর্যন্ত সবচেয়ে সস্তা দাম কত ছিল"। আজকের দাম দেখে হিসাব করো "সেই সস্তা দিনে কিনে আজ বেচলে কত লাভ"। সবচেয়ে বেশি লাভটা মনে রাখো।',
    samples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        note: 'দিন 1 এ 1 টাকায় কেনো, দিন 4 এ 6 টাকায় বেচো',
      },
      { input: 'prices = [7,6,4,3,1]', output: '0', note: 'দাম শুধু কমে, লাভ নেই' },
    ],
  },

  approach: {
    triggers: [
      '"buy once, sell once", "buy before sell"',
      'একটা sequence এ "maximum profit / difference", যেখানে ছোটটা আগে আর বড়টা পরে আসতে হবে',
    ],
    bruteForce:
      'প্রতিটা জোড়া (কেনার দিন, বেচার দিন) চেষ্টা করা → O(n²)। আসলে প্রতিদিনের জন্য শুধু আগের সবচেয়ে কম দামটা জানলেই হয়।',
    idea: 'প্রতিটা দিনকে "বেচার দিন" ধরো। সেদিন সেরা লাভ = আজকের দাম − আগের সবচেয়ে কম দাম। তাই এক pass এ `lowest` আর `profit` দুইটা চলমান মান রাখলেই হয়।',
    steps: [
      '`lowest = prices[0]`, `profit = 0`।',
      'দিন 1 থেকে প্রতিটা দামের জন্য: `lowest` update (আজ সস্তা হলে), আজকের লাভ = `price - lowest`, `profit` update (বেশি হলে)।',
      '`profit` return।',
    ],
    template: {
      lang: 'javascript',
      code: `let best = arr[0], ans = 0;
for (let i = 1; i < arr.length; i++) {
    best = UPDATE_BEST(best, arr[i]);       // এখন পর্যন্ত সেরা (min/max)
    ans = Math.max(ans, COMPARE(arr[i], best));
}`,
      whatChanges:
        'Problem অনুযায়ী বদলায়: কী "সেরা" ধরে রাখবে (min দাম, max sum ...) আর আজকের মানের সাথে কীভাবে তুলনা করবে।',
    },
  },

  breakdown: {
    variables: [
      {
        name: 'lowest',
        role: 'এখন পর্যন্ত সবচেয়ে কম দাম',
        whenChanges: 'আজকের দাম আরও কম হলে',
      },
      { name: 'profit', role: 'এখন পর্যন্ত সর্বোচ্চ লাভ', whenChanges: 'আজ বেচলে লাভ বেশি হলে' },
    ],
    invariant:
      'দিন `i` তে `lowest` = দিন `0...i` এর সবচেয়ে কম দাম, আর `profit` = দিন `0...i` ব্যবহার করে সর্বোচ্চ লাভ।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (`prices = [7,1,5,3,6,4]`, শুরু `lowest=7, profit=0`)',
        columns: ['i', 'price', 'lowest', 'আজ বেচলে লাভ', 'profit'],
        rows: [
          ['1', '1', '1', '0', '0'],
          ['2', '5', '1', '4', '4'],
          ['3', '3', '1', '2', '4'],
          ['4', '6', '1', '5', '5'],
          ['5', '4', '1', '3', '5'],
        ],
        highlightCells: [[3, 4]],
      },
      { kind: 'diagram', title: 'Answer', text: 'Answer = 5' },
      {
        kind: 'steps',
        title: 'Step by step (`prices = [7,1,5,3,6,4]`)',
        arrayStates: [
          {
            array: [7, 1, 5, 3, 6, 4],
            pointers: { i: 0 },
            vars: { lowest: 7, profit: 0 },
            caption: 'শুরু: `lowest = prices[0] = 7`, `profit = 0`।',
          },
          {
            array: [7, 1, 5, 3, 6, 4],
            pointers: { i: 1 },
            highlight: [1],
            vars: { lowest: 1, 'আজ বেচলে': 0, profit: 0 },
            caption: 'i = 1: দাম 1, নতুন সবচেয়ে কম। `lowest = 1`, আজ বেচলে লাভ 0।',
          },
          {
            array: [7, 1, 5, 3, 6, 4],
            pointers: { i: 2 },
            highlight: [1, 2],
            vars: { lowest: 1, 'আজ বেচলে': 4, profit: 4 },
            caption: 'i = 2: দাম 5। `5 - 1 = 4`, `profit = 4`।',
          },
          {
            array: [7, 1, 5, 3, 6, 4],
            pointers: { i: 3 },
            highlight: [1, 3],
            vars: { lowest: 1, 'আজ বেচলে': 2, profit: 4 },
            caption: 'i = 3: দাম 3। `3 - 1 = 2`, আগের 4 এর চেয়ে কম, `profit` একই।',
          },
          {
            array: [7, 1, 5, 3, 6, 4],
            pointers: { i: 4 },
            highlight: [1, 4],
            vars: { lowest: 1, 'আজ বেচলে': 5, profit: 5 },
            caption: 'i = 4: দাম 6। `6 - 1 = 5`, নতুন সর্বোচ্চ, `profit = 5`।',
          },
          {
            array: [7, 1, 5, 3, 6, 4],
            pointers: { i: 5 },
            highlight: [1, 5],
            vars: { lowest: 1, 'আজ বেচলে': 3, profit: 5 },
            caption: 'i = 5: দাম 4। `4 - 1 = 3`, `profit` 5 ই থাকে। উত্তর 5।',
          },
        ],
      },
    ],
    edgeCases: [
      'একটা দাম → loop চলে না, 0',
      'দাম শুধু কমে → 0',
      'সবচেয়ে কম দাম শেষ দিনে → তারপর বেচার দিন নেই, formula নিজে থেকেই সামলায় (লাভ 0)',
    ],
    deepDiveBn: {
      heading: 'greedy কেন কাজ করে',
      body: 'প্রতিটা দিনকে "বেচার দিন" ধরলে, সবচেয়ে ভালো লাভ পেতে হলে ওই দিনের আগের সবচেয়ে কম দামে কেনা উচিত। তাই আমাদের সব জোড়া মেলানো লাগে না, শুধু "এখন পর্যন্ত সবচেয়ে কম দাম" মনে রাখলেই হয়। আর `lowest` সবসময় আজ বা আগের দিনের, তাই "কেনা বেচার আগে" নিয়ম নিজে থেকেই মানা হয়।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var maxProfit = function (prices) {
    let lowest = prices[0];
    let profit = 0;

    for (let i = 1; i < prices.length; i++) {
        lowest = Math.min(lowest, prices[i]);
        profit = Math.max(profit, prices[i] - lowest);
    }

    return profit;
};`,
      lineByLine: [
        { line: 'let lowest = prices[0]', meaning: 'প্রথম দিনের দামই এখন পর্যন্ত সবচেয়ে কম' },
        { line: 'let profit = 0', meaning: 'লাভ না হলে উত্তর 0' },
        { line: 'lowest = Math.min(lowest, prices[i])', meaning: 'সস্তা কেনার দিন update' },
        {
          line: 'profit = Math.max(profit, prices[i] - lowest)',
          meaning: 'আজ বেচলে লাভ, আগের সেরার সাথে তুলনা',
        },
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      label: 'Alternative: Kadane on daily differences',
      isMine: false,
      lang: 'javascript',
      code: `var maxProfit = function (prices) {
    let current = 0;
    let best = 0;
    for (let i = 1; i < prices.length; i++) {
        current = Math.max(0, current + prices[i] - prices[i - 1]);
        best = Math.max(best, current);
    }
    return best;
};`,
      complexity: { time: 'O(n)', space: 'O(1)' },
      note: 'Kadane এর মতো করে: পরপর দুই দিনের দামের পার্থক্যের array তে maximum subarray sum। একই O(n), কিন্তু বোঝা কঠিন। এই problem এর জন্য min-so-far ই সবচেয়ে পরিষ্কার।',
    },
  ],
  commonMistakes: [
    '`max(prices) - min(prices)` করা: max যদি min এর আগে আসে তাহলে ভুল (বেচা কেনার আগে হয়ে যায়)',
    '`profit` কে `-Infinity` দিয়ে শুরু করা: লাভ না হলে উত্তর 0 হওয়ার কথা, negative না',
  ],

  revise: {
    selfQuestions: [
      { q: 'কেন `max - min` দিয়ে হয় না?', a: 'max টা min এর আগের দিনে হতে পারে' },
      { q: 'প্রতিটা দিনে কোন দুইটা জিনিস update হয়?', a: '`lowest` আর `profit`' },
    ],
    patternToRemember:
      "Track the cheapest price so far, check today's profit against it, keep the max.",
    related: [
      {
        number: 485,
        title: 'Max Consecutive Ones',
        note: 'একই রকম one pass, "এখন পর্যন্ত সেরা" ধরে রাখা',
      },
      {
        number: 122,
        title: 'Best Time to Buy and Sell Stock II',
        note: 'একাধিকবার কেনা বেচা',
      },
      { number: 53, title: 'Maximum Subarray' },
    ],
  },

  visualizationId: 'lc-array-pointers',
  verify: {
    entry: { javascript: 'maxProfit' },
    cases: [
      { args: [[7, 1, 5, 3, 6, 4]], returns: 5 },
      { args: [[7, 6, 4, 3, 1]], returns: 0 },
    ],
  },
  meta: {
    generated: [
      'approach.idea',
      'breakdown.steps',
      'solutions.Alternative: Kadane on daily differences',
    ],
  },
};

export default problem;

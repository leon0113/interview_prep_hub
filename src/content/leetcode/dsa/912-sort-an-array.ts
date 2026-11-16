import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const mergeSortTemplate = patterns.find((p) => p.id === 'divide-and-conquer')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-912-sort-an-array',
  number: 912,
  title: 'Sort an Array',
  slug: '912-sort-an-array',
  category: 'dsa',
  difficulty: 'Medium',
  url: 'https://leetcode.com/problems/sort-an-array/',
  patternId: 'divide-and-conquer',
  patternLabel: 'Divide and Conquer (Merge Sort)',
  tags: ['array', 'sorting', 'merge-sort', 'divide-and-conquer', 'recursion'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-15',

  problem: {
    oneLineReminder: 'অর্ধেক করো → দুই অর্ধেক আলাদা sort করো (recursion) → দুই sorted অর্ধেক merge করো।',
    statementBn:
      'একটা integer array কে ছোট থেকে বড় order এ sort করে return করো। Built-in sort ছাড়া, O(n log n) time এ।',
    realLifeExample:
      'শিক্ষকের কাছে 100 টা খাতা roll অনুযায়ী সাজাতে হবে। দুইজন সহকারীকে 50 টা করে দিলেন, তারা আবার আরও দুইজনকে অর্ধেক দিলো ... যতক্ষণ না একজনের কাছে 1 টা খাতা (সেটা তো সাজানোই)। তারপর ফেরার পথে প্রত্যেকে দুইটা সাজানো স্তূপ এক করে: দুই স্তূপের উপরের খাতা দেখে ছোট roll টা আগে রাখে।',
    samples: [
      { input: 'nums = [5,2,3,1]', output: '[1,2,3,5]' },
      { input: 'nums = [5,1,1,2,0,0]', output: '[0,0,1,1,2,5]' },
    ],
  },

  approach: {
    triggers: [
      '"sort the array" + O(n log n) দরকার',
      'এমন problem যেটা দুই অর্ধেক আলাদা solve হয়ে গেলে সহজ, শুধু জোড়া লাগাতে হয়',
    ],
    bruteForce:
      'Bubble / selection / insertion sort → O(n²), বড় input এ খুব ধীর। Merge sort সবসময় O(n log n)।',
    idea: 'একটা element এর array সবসময় sorted। তাই বারবার অর্ধেক করে সেখানে পৌঁছাও, তারপর দুইটা sorted অর্ধেক দুই pointer দিয়ে জোড়া লাগাও: প্রতি step এ দুই মাথার মধ্যে ছোটটা নাও।',
    steps: [
      '**Base case:** length `<= 1` হলে আগে থেকেই sorted, return।',
      '**Divide:** মাঝখানে ভাগ করো।',
      '**Conquer:** বাম আর ডান অর্ধেক recursion দিয়ে sort করো।',
      '**Combine (merge):** দুই pointer দিয়ে প্রতিবার ছোটটা `res` এ push করো। এক দিক শেষ হলে অন্য দিকের বাকিটা জুড়ে দাও।',
    ],
    template: {
      lang: mergeSortTemplate.lang,
      code: mergeSortTemplate.code,
      whatChanges: mergeSortTemplate.whatChanges,
    },
  },

  breakdown: {
    variables: [
      { name: 'mid', role: 'কোথায় ভাগ হবে', whenChanges: 'প্রতি call এ একবার' },
      { name: 'i', role: '`left` থেকে পড়ে', whenChanges: '`left[i]` নেওয়া হলে' },
      { name: 'j', role: '`right` থেকে পড়ে', whenChanges: '`right[j]` নেওয়া হলে' },
      { name: 'res', role: 'merge করা ফল', whenChanges: 'প্রতি step এ একটা push' },
    ],
    invariant: '`res` এ সবসময় `left` আর `right` এর সবচেয়ে ছোট element গুলো sorted order এ থাকে।',
    trace: [
      {
        kind: 'diagram',
        title: 'Trace (`[5,2,3,1]`)',
        text: `              [5,2,3,1]
             /         \\
        [5,2]           [3,1]          ← divide
        /   \\           /   \\
      [5]   [2]       [3]   [1]        ← base case (length 1)
        \\   /           \\   /
       [2,5]            [1,3]          ← merge
            \\          /
            [1,2,3,5]                  ← merge`,
      },
      {
        kind: 'table',
        title: 'শেষ merge (`left = [2,5]`, `right = [1,3]`)',
        columns: ['step', 'left[i]', 'right[j]', 'ছোট', 'res', 'i', 'j'],
        rows: [
          ['1', '2', '1', '1 (right)', '[1]', '0', '1'],
          ['2', '2', '3', '2 (left)', '[1,2]', '1', '1'],
          ['3', '5', '3', '3 (right)', '[1,2,3]', '1', '2'],
          ['শেষ', '—', '`right` শেষ', '`left` এর বাকি `[5]` জুড়ে দাও', '[1,2,3,5]', '', ''],
        ],
      },
    ],
    edgeCases: [
      'Empty বা একটা element → সরাসরি return (base case)',
      'সব element সমান → কাজ করে, অসীম recursion হয় না',
      'Duplicate → ঠিক আছে, তবে stability দেখো (নিচে)',
      'Negative সংখ্যা → কাজ করে, কারণ তুলনা numeric',
      '**Stability:** `left[i] < right[j]` এ সমান হলে **right** এরটা আগে যায়, তাই সমান element এর আসল order বদলে যেতে পারে। শুধু সংখ্যার জন্য সমস্যা নেই। Object কে key দিয়ে sort করলে `<=` লিখে stable করো',
    ],
    deepDiveBn: {
      heading: 'O(n log n) কেন',
      body: 'Array কে বারবার অর্ধেক করলে `log n` টা স্তর (level) হয়। প্রতিটা স্তরে সব element মিলিয়ে মোট `n` টা element merge করতে হয়। তাই মোট কাজ = `n × log n`। Merge এর সময় দুইটা অংশই আগে থেকে sorted, তাই দুই pointer দিয়ে শুধু ছোটটা বেছে নিলেই হয়, আবার সব তুলনা করতে হয় না।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `var sortArray = function(nums) {
    if(nums.length <= 1) return nums;

   let mid = Math.floor(nums.length / 2);
   let left = sortArray(nums.slice(0, mid));
   let right = sortArray(nums.slice(mid));

    return mergeSortedArray(left, right);
};

function mergeSortedArray(left, right){
   let res = []
   let i = 0
   let j = 0
    while(i < left.length && j < right.length){
        if(left[i] < right[j]){
            res.push(left[i])
            i++;
        }else{
             res.push(right[j])
            j++;
        }
    }

    return [...res, ...left.slice(i), ...right.slice(j)]
}`,
      lineByLine: [
        {
          line: 'if(nums.length <= 1) return nums',
          meaning: 'base case: 0 বা 1 টা element নিজেই sorted',
        },
        { line: 'nums.slice(0, mid) / nums.slice(mid)', meaning: 'বাম আর ডান অর্ধেকের কপি' },
        { line: 'sortArray(...)', meaning: 'প্রতিটা অর্ধেক recursion দিয়ে sort' },
        {
          line: 'while(i < left.length && j < right.length)',
          meaning: 'দুই দিকেই কিছু বাকি থাকা পর্যন্ত',
        },
        { line: 'if(left[i] < right[j])', meaning: 'ছোটটা আগে push' },
        {
          line: '[...res, ...left.slice(i), ...right.slice(j)]',
          meaning: 'যেদিকে কিছু বাকি, সেটা শেষে জুড়ে দাও (একটা দিক সবসময় খালি)',
        },
      ],
      complexity: {
        time: 'O(n log n)',
        space: 'O(n) (`res` আর `slice` কপি, সাথে O(log n) recursion depth)',
      },
    },
    {
      label: 'Built-in sort (real projects)',
      isMine: false,
      lang: 'javascript',
      code: `var sortArray = function (nums) {
    return nums.sort((a, b) => a - b);
};`,
      complexity: { time: 'O(n log n)', space: 'O(log n) to O(n), engine dependent' },
      note: 'আসল project এ built-in `nums.sort((a, b) => a - b)`। Interview তে অন্য option: Quick sort (average O(n log n), worst O(n²), in-place), Heap sort (O(n log n), O(1) extra space, stable না)।',
    },
  ],
  commonMistakes: [
    'Merge এর শেষে বাকি element জুড়তে ভুলে যাওয়া: কিছু element হারিয়ে যায়',
    'Base case `length === 0` রাখা: length 1 এ `slice(0, 0)` আর `slice(0)` হয়ে অসীম recursion',
    '`nums.sort()` comparator ছাড়া: **string** হিসেবে sort করে (`[10,9,1]` → `[1,10,9]`)। সবসময় `nums.sort((a, b) => a - b)`',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'Merge sort এর তিনটা ধাপ কী?',
        a: 'divide, conquer (recursion), combine (merge)',
      },
      {
        q: 'Merge এর while loop শেষে কেন `left.slice(i)` আর `right.slice(j)` জুড়তে হয়?',
        a: 'একটা দিক শেষ হলে অন্য দিকের বাকি element গুলো আগে থেকেই sorted আর সবচেয়ে বড়',
      },
    ],
    patternToRemember: 'Split in half, sort each half, merge the two sorted halves.',
    related: [
      { number: 88, title: 'Merge Sorted Array', note: 'merge step, তবে পিছন থেকে' },
      { number: 21, title: 'Merge Two Sorted Lists' },
      { number: 148, title: 'Sort List' },
      { number: 23, title: 'Merge k Sorted Lists' },
      { number: 215, title: 'Kth Largest Element in an Array' },
    ],
  },

  visualizationId: 'lc-merge-sort-tree',
  verify: {
    entry: { javascript: 'sortArray' },
    cases: [
      { args: [[5, 2, 3, 1]], returns: [1, 2, 3, 5] },
      { args: [[5, 1, 1, 2, 0, 0]], returns: [0, 0, 1, 1, 2, 5] },
    ],
  },
  meta: { generated: ['approach.idea', 'solutions.Built-in sort (real projects)'] },
};

export default problem;

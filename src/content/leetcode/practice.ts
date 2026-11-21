/**
 * "Practice Problems (solve these with the same templates)" from docs/leetcode-notes.md.
 * Listed roughly easy → harder inside each group. A problem shows as solved automatically
 * when a problem with the same number exists in the app.
 */

export interface PracticeGroup {
  title: string;
  /** Pattern(s) from patterns.ts these problems train. */
  patternIds: string[];
  /** Extra hint from the notes for one problem, keyed by number. */
  problems: { number: number; title: string; note?: string }[];
}

export const practiceIntro =
  'Listed roughly easy → harder inside each pattern. Solve one, write the note, then add it to the app.';

export const practiceGroups: PracticeGroup[] = [
  {
    // "18. Practice Problems" of the Linked List notes (topics/linked-list.md).
    title: 'Linked list',
    patternIds: [
      'linked-list-traversal',
      'slow-fast-pointers',
      'reverse-in-place',
      'dummy-node',
      'gap-pointer',
      'two-pointer-switch',
      'split-and-rejoin',
    ],
    problems: [
      { number: 707, title: 'Design Linked List', note: 'Traversal + size' },
      { number: 206, title: 'Reverse Linked List', note: 'Reverse' },
      { number: 21, title: 'Merge Two Sorted Lists', note: 'Dummy node' },
      { number: 876, title: 'Middle of the Linked List', note: 'Slow/Fast' },
      { number: 141, title: 'Linked List Cycle', note: 'Floyd' },
      { number: 203, title: 'Remove Linked List Elements', note: 'Dummy node' },
      { number: 83, title: 'Remove Duplicates from Sorted List', note: 'Traverse' },
      { number: 234, title: 'Palindrome Linked List', note: 'Middle + Reverse' },
      { number: 160, title: 'Intersection of Two Linked Lists', note: 'Two pointer switch' },
      { number: 19, title: 'Remove Nth Node From End of List', note: 'Gap pointer' },
      { number: 328, title: 'Odd Even Linked List', note: 'Split + rejoin' },
      { number: 2, title: 'Add Two Numbers', note: 'Carry + Dummy' },
      { number: 142, title: 'Linked List Cycle II', note: 'Floyd phase 2' },
      { number: 61, title: 'Rotate List', note: 'Circular trick' },
      { number: 148, title: 'Sort List', note: 'Merge sort' },
      { number: 146, title: 'LRU Cache', note: 'Hash map + DLL' },
      { number: 25, title: 'Reverse Nodes in k-Group', note: 'Reverse + Dummy' },
      { number: 23, title: 'Merge k Sorted Lists', note: 'Heap / Divide & conquer' },
    ],
  },
  {
    title: 'Read/Write pointers (keep condition + overwrite)',
    patternIds: ['read-write-pointers'],
    problems: [
      { number: 80, title: 'Remove Duplicates from Sorted Array II' },
      { number: 905, title: 'Sort Array By Parity' },
      { number: 922, title: 'Sort Array By Parity II' },
      { number: 1089, title: 'Duplicate Zeros' },
      { number: 75, title: 'Sort Colors' },
    ],
  },
  {
    title: 'Swap from both ends (left / right pointers)',
    patternIds: ['swap-both-ends'],
    problems: [
      { number: 125, title: 'Valid Palindrome' },
      { number: 345, title: 'Reverse Vowels of a String' },
      { number: 541, title: 'Reverse String II' },
      { number: 557, title: 'Reverse Words in a String III' },
      { number: 917, title: 'Reverse Only Letters' },
      { number: 680, title: 'Valid Palindrome II' },
      { number: 977, title: 'Squares of a Sorted Array' },
      { number: 167, title: 'Two Sum II - Input Array Is Sorted' },
      { number: 11, title: 'Container With Most Water' },
    ],
  },
  {
    title: 'Merge / two sorted inputs',
    patternIds: ['merge-from-right'],
    problems: [
      { number: 21, title: 'Merge Two Sorted Lists' },
      { number: 350, title: 'Intersection of Two Arrays II' },
      { number: 986, title: 'Interval List Intersections' },
      {
        number: 977,
        title: 'Squares of a Sorted Array',
        note: 'fill the result from the right',
      },
    ],
  },
  {
    title: 'Min-so-far / Greedy one pass',
    patternIds: ['min-so-far-greedy'],
    problems: [
      { number: 122, title: 'Best Time to Buy and Sell Stock II' },
      { number: 724, title: 'Find Pivot Index' },
      { number: 53, title: 'Maximum Subarray' },
      { number: 55, title: 'Jump Game' },
      { number: 238, title: 'Product of Array Except Self' },
    ],
  },
  {
    title: 'Streak counting',
    patternIds: ['streak-counting'],
    problems: [
      { number: 1446, title: 'Consecutive Characters' },
      { number: 674, title: 'Longest Continuous Increasing Subsequence' },
      { number: 1869, title: 'Longer Contiguous Segments of Ones than Zeros' },
      { number: 1004, title: 'Max Consecutive Ones III' },
      { number: 128, title: 'Longest Consecutive Sequence' },
    ],
  },
  {
    title: 'Sum formula / XOR',
    patternIds: ['sum-formula', 'xor-pairs-cancel'],
    problems: [
      { number: 389, title: 'Find the Difference' },
      { number: 448, title: 'Find All Numbers Disappeared in an Array' },
      { number: 645, title: 'Set Mismatch' },
      { number: 287, title: 'Find the Duplicate Number' },
      { number: 137, title: 'Single Number II' },
      { number: 260, title: 'Single Number III' },
      { number: 41, title: 'First Missing Positive' },
    ],
  },
  {
    title: 'Hash map frequency counting',
    patternIds: ['hash-map-counting'],
    problems: [
      { number: 1, title: 'Two Sum' },
      { number: 217, title: 'Contains Duplicate' },
      { number: 242, title: 'Valid Anagram' },
      { number: 387, title: 'First Unique Character in a String' },
      { number: 383, title: 'Ransom Note' },
      { number: 349, title: 'Intersection of Two Arrays' },
      { number: 169, title: 'Majority Element' },
      { number: 205, title: 'Isomorphic Strings' },
      { number: 219, title: 'Contains Duplicate II' },
      { number: 49, title: 'Group Anagrams' },
    ],
  },
  {
    title: 'Bit tricks',
    patternIds: ['bit-trick'],
    problems: [
      { number: 191, title: 'Number of 1 Bits' },
      { number: 338, title: 'Counting Bits' },
      { number: 461, title: 'Hamming Distance' },
      { number: 476, title: 'Number Complement' },
      { number: 190, title: 'Reverse Bits' },
      { number: 326, title: 'Power of Three' },
      { number: 342, title: 'Power of Four' },
    ],
  },
  {
    title: 'Recursion / Fibonacci-style DP',
    patternIds: ['recursion-shrink', 'tree-recursion-dp'],
    problems: [
      { number: 70, title: 'Climbing Stairs' },
      { number: 1137, title: 'N-th Tribonacci Number' },
      { number: 746, title: 'Min Cost Climbing Stairs' },
      { number: 198, title: 'House Robber' },
      { number: 206, title: 'Reverse Linked List' },
      { number: 50, title: 'Pow(x, n)' },
    ],
  },
  {
    title: 'Binary search',
    patternIds: ['binary-search'],
    problems: [
      { number: 35, title: 'Search Insert Position' },
      { number: 278, title: 'First Bad Version' },
      { number: 69, title: 'Sqrt(x)' },
      { number: 367, title: 'Valid Perfect Square' },
      { number: 34, title: 'Find First and Last Position of Element in Sorted Array' },
      { number: 74, title: 'Search a 2D Matrix' },
      { number: 153, title: 'Find Minimum in Rotated Sorted Array' },
      { number: 33, title: 'Search in Rotated Sorted Array' },
      { number: 875, title: 'Koko Eating Bananas' },
    ],
  },
  {
    title: 'Divide and conquer / sorting',
    patternIds: ['divide-and-conquer'],
    problems: [
      { number: 148, title: 'Sort List' },
      { number: 23, title: 'Merge k Sorted Lists' },
      { number: 215, title: 'Kth Largest Element in an Array' },
      { number: 169, title: 'Majority Element', note: 'divide and conquer version' },
      { number: 493, title: 'Reverse Pairs' },
    ],
  },
];

/** LeetCode problem URL from its title (LeetCode slugs are the kebab-cased title). */
export function leetcodeUrl(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[(),']/g, '') // "Pow(x, n)" -> "powx-n", "Sqrt(x)" -> "sqrtx"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://leetcode.com/problems/${slug}/`;
}

/** Number -> title, from the practice list, for "related" links to problems not in the app. */
export const knownTitles: ReadonlyMap<number, string> = new Map(
  practiceGroups.flatMap((g) => g.problems.map((p) => [p.number, p.title] as const)),
);

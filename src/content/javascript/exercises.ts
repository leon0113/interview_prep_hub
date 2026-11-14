import type { Exercise } from '../schema';

/**
 * JavaScript coding-round exercises. `npm run verify:outputs` runs every solution followed by
 * the sample run on Node and checks the output, so all approaches define the same names.
 */
export const exercises: Exercise[] = [
  // ───────────────────────────── Foundation ─────────────────────────────
  {
    id: 'js-ex-reverse-string',
    title: 'Reverse a string',
    level: 'foundation',
    category: 'strings',
    tags: ['strings', 'arrays', 'two-pointers'],
    prompt: `Write a function \`reverseString(str)\` that returns the characters of \`str\` in reverse order.

First solve it with built-in methods, then again **without** \`Array.prototype.reverse\` — interviewers usually ask for both.`,
    examples: [
      { input: '"hello"', output: '"olleh"' },
      { input: '"JavaScript"', output: '"tpircSavaJ"' },
      { input: '""', output: '""' },
    ],
    constraints: ['0 ≤ str.length ≤ 10⁵'],
    hints: [
      'A string is immutable, but an array of its characters is not — convert, reverse, then join.',
      'Without `reverse()`: loop over the characters and put each new one at the FRONT of the result.',
      'For an in-place style answer, swap the characters at two indexes that move toward the middle.',
      'Prefer `[...str]` over `str.split("")`: spreading keeps emoji and other surrogate pairs intact.',
    ],
    solutions: [
      {
        label: 'Built-ins',
        code: `function reverseString(str) {
  return [...str].reverse().join("");
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Loop',
        code: `function reverseString(str) {
  let reversed = "";
  for (const ch of str) {
    reversed = ch + reversed;
  }
  return reversed;
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Two pointers',
        code: `function reverseString(str) {
  const chars = [...str];
  let left = 0;
  let right = chars.length - 1;
  while (left < right) {
    [chars[left], chars[right]] = [chars[right], chars[left]];
    left++;
    right--;
  }
  return chars.join("");
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `console.log(reverseString("hello"));
console.log(reverseString("JavaScript"));
console.log(reverseString("hi 👋"));`,
      output: `olleh
tpircSavaJ
👋 ih`,
    },
    explanationBn: `JavaScript-এ string immutable — তাই string-কে সরাসরি উল্টানো যায় না, আগে character-এর array বানাতে হয়।

**Built-in approach:** \`[...str]\` দিয়ে character-এর array, \`reverse()\` দিয়ে উল্টানো, \`join("")\` দিয়ে আবার string। এক লাইনেই কাজ শেষ, কিন্তু interviewer সাধারণত এরপরই বলে "\`reverse()\` ছাড়া করুন"।

**Loop approach:** খালি string দিয়ে শুরু করে প্রতিটা character-কে result-এর **সামনে** বসাই (\`ch + reversed\`)। শেষ character সবার সামনে চলে আসে — string উল্টে যায়।

**Two pointers:** array-র দুই প্রান্ত থেকে দুটো index নিয়ে swap করতে করতে মাঝখানে আসি। Array reverse করার এই কৌশলটা অনেক সমস্যায় কাজে লাগে।

একটা bonus point: \`str.split("")\` emoji-র মতো character-কে দুই টুকরো করে ফেলে (surrogate pair), তাই উল্টানোর পর emoji ভেঙে যায়। \`[...str]\` বা \`for...of\` code point ধরে চলে, তাই emoji ঠিক থাকে — sample run-এর শেষ লাইনে সেটাই দেখানো হয়েছে।`,
  },
  {
    id: 'js-ex-palindrome',
    title: 'Valid palindrome',
    level: 'foundation',
    category: 'strings',
    tags: ['strings', 'two-pointers', 'regex'],
    prompt: `Write \`isPalindrome(text)\` that returns \`true\` if \`text\` reads the same forwards and backwards, ignoring case and any character that is not a letter or digit.`,
    examples: [
      { input: '"A man, a plan, a canal: Panama"', output: 'true' },
      { input: '"race a car"', output: 'false' },
      { input: '""', output: 'true' },
    ],
    hints: [
      'Normalise first: lower-case and keep only `[a-z0-9]`.',
      'A palindrome equals its own reverse.',
      'Without building a cleaned copy, move two pointers inward and skip characters that do not count.',
    ],
    solutions: [
      {
        label: 'Clean + reverse',
        code: `function isPalindrome(text) {
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === [...clean].reverse().join("");
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Two pointers',
        code: `function isPalindrome(text) {
  const ok = (ch) => /[a-z0-9]/i.test(ch);
  let left = 0;
  let right = text.length - 1;
  while (left < right) {
    if (!ok(text[left])) left++;
    else if (!ok(text[right])) right--;
    else if (text[left].toLowerCase() !== text[right].toLowerCase()) return false;
    else { left++; right--; }
  }
  return true;
}`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `console.log(isPalindrome("A man, a plan, a canal: Panama"));
console.log(isPalindrome("race a car"));
console.log(isPalindrome(""));`,
      output: `true
false
true`,
    },
    explanationBn: `দুটো ধাপ: কোন character গোনায় ধরব ঠিক করা, তারপর দুই দিক থেকে মেলানো।

**Clean + reverse:** lowercase করে regex দিয়ে letter-digit ছাড়া সব বাদ দিই (\`/[^a-z0-9]/g\` — \`^\` মানে "এগুলো ছাড়া")। তারপর উল্টো করে তুলনা। পরিষ্কার কিন্তু বাড়তি O(n) memory।

**Two pointers:** কোনো copy না বানিয়ে দুই প্রান্ত থেকে ভেতরে আসি। গোনায় না ধরা character টপকে যাই, না মিললে সাথে সাথে \`false\`। O(1) memory — "extra space ছাড়া করুন" প্রশ্নের উত্তর।`,
  },
  {
    id: 'js-ex-anagram',
    title: 'Check if two strings are anagrams',
    level: 'foundation',
    category: 'hashing',
    tags: ['strings', 'hash-map', 'sorting'],
    prompt: `Write \`isAnagram(a, b)\` that returns \`true\` when \`b\` is a rearrangement of the letters of \`a\`, ignoring case and spaces.`,
    examples: [
      { input: '"Listen", "Silent"', output: 'true' },
      { input: '"Dormitory", "Dirty room"', output: 'true' },
      { input: '"hello", "world"', output: 'false' },
    ],
    hints: [
      'Normalise: lower-case and remove spaces.',
      'Sorting both strings gives the same result for anagrams.',
      'For O(n), count each character with a `Map` or object, incrementing for `a` and decrementing for `b`.',
    ],
    solutions: [
      {
        label: 'Sort',
        code: `function isAnagram(a, b) {
  const norm = (s) => [...s.toLowerCase().replace(/\\s/g, "")].sort().join("");
  return norm(a) === norm(b);
}`,
        complexity: { time: 'O(n log n)', space: 'O(n)' },
      },
      {
        label: 'Character count',
        code: `function isAnagram(a, b) {
  const clean = (s) => s.toLowerCase().replace(/\\s/g, "");
  a = clean(a);
  b = clean(b);
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const ch of a) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of b) {
    const left = counts.get(ch);
    if (!left) return false;
    counts.set(ch, left - 1);
  }
  return true;
}`,
        complexity: { time: 'O(n)', space: 'O(k)' },
      },
    ],
    sampleRun: {
      code: `console.log(isAnagram("Listen", "Silent"));
console.log(isAnagram("Dormitory", "Dirty room"));
console.log(isAnagram("hello", "world"));`,
      output: `true
true
false`,
    },
    explanationBn: `দুটো শব্দ anagram যদি একই অক্ষর **একই সংখ্যায়** থাকে।

**Sort:** দুটোকে sort করলে একই অক্ষরের সমষ্টি একই sequence দেয়। সহজ, O(n log n)। খেয়াল করুন, \`sort()\` string-এর array-তে কাজ করে — তাই আগে \`[...s]\` দিয়ে array বানাই।

**Count:** \`Map\`-এ প্রথম শব্দের অক্ষর গুনি, দ্বিতীয় শব্দে কমাই। কোনো অক্ষর না পাওয়া গেলে বা শূন্যে নেমে গেলে \`false\`। দৈর্ঘ্য আগে মিলিয়ে নিলে শেষে আবার সব count শূন্য কি না দেখতে হয় না। O(n)।`,
  },
  {
    id: 'js-ex-char-frequency',
    title: 'Character frequency',
    level: 'foundation',
    category: 'hashing',
    tags: ['hash-map', 'strings', 'reduce'],
    prompt: `Write \`charFrequency(str)\` that returns an object mapping each character to how many times it appears, and \`mostFrequent(str)\` that returns the most common character (the first one if there is a tie).`,
    examples: [
      { input: 'charFrequency("banana")', output: '{ b: 1, a: 3, n: 2 }' },
      { input: 'mostFrequent("banana")', output: '"a"' },
    ],
    hints: [
      '`counts[ch] = (counts[ch] ?? 0) + 1` handles both new and existing keys.',
      '`reduce` with `{}` as the initial value builds the object in one expression.',
      'For the most frequent, scan the entries once and keep the best so far (use `>` so ties keep the first).',
    ],
    solutions: [
      {
        label: 'Loop',
        code: `function charFrequency(str) {
  const counts = {};
  for (const ch of str) counts[ch] = (counts[ch] ?? 0) + 1;
  return counts;
}

function mostFrequent(str) {
  let best = null;
  let bestCount = 0;
  for (const [ch, count] of Object.entries(charFrequency(str))) {
    if (count > bestCount) {
      best = ch;
      bestCount = count;
    }
  }
  return best;
}`,
        complexity: { time: 'O(n)', space: 'O(k)' },
      },
      {
        label: 'reduce',
        code: `const charFrequency = (str) =>
  [...str].reduce((acc, ch) => {
    acc[ch] = (acc[ch] ?? 0) + 1;
    return acc;
  }, {});

const mostFrequent = (str) =>
  Object.entries(charFrequency(str)).reduce(
    (best, entry) => (entry[1] > best[1] ? entry : best),
    [null, 0],
  )[0];`,
        complexity: { time: 'O(n)', space: 'O(k)' },
      },
    ],
    sampleRun: {
      code: `console.log(charFrequency("banana"));
console.log(mostFrequent("banana"), mostFrequent("aabb"), mostFrequent(""));`,
      output: `{ b: 1, a: 3, n: 2 }
a a null`,
    },
    explanationBn: `Frequency count প্রায় সব coding round-এ কোনো না কোনো রূপে থাকে।

\`(counts[ch] ?? 0) + 1\` — key না থাকলে \`undefined\`, \`??\` সেটাকে 0 বানায়, তারপর 1 যোগ। \`||\` দিলেও এখানে কাজ করত, কিন্তু \`??\` অভিপ্রায়টা আরও স্পষ্ট বলে।

**সবচেয়ে বেশিবার আসা অক্ষর:** entries একবার ঘুরে "এ পর্যন্ত সেরা" মনে রাখি। \`>\` (না \`>=\`) ব্যবহার করায় সমান হলে আগেরটাই থাকে — tie-তে প্রথমটা।

খালি string-এর edge case: কোনো অক্ষর নেই, তাই \`null\` ফেরত — interview-তে edge case উল্লেখ করা সবসময় ভালো।`,
  },
  {
    id: 'js-ex-first-non-repeating',
    title: 'First non-repeating character',
    level: 'foundation',
    category: 'hashing',
    tags: ['hash-map', 'strings'],
    prompt: `Write \`firstUnique(str)\` that returns the first character that appears exactly once, or \`null\` if there is none.`,
    examples: [
      { input: '"swiss"', output: '"w"' },
      { input: '"aabbcc"', output: 'null' },
      { input: '"leetcode"', output: '"l"' },
    ],
    hints: [
      'Two passes: first count every character, then scan again in order.',
      'The second pass must follow the original string order, not the order of the counts.',
      '`indexOf(ch) === lastIndexOf(ch)` also works, but it is O(n²).',
    ],
    solutions: [
      {
        label: 'Count, then scan',
        code: `function firstUnique(str) {
  const counts = new Map();
  for (const ch of str) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of str) {
    if (counts.get(ch) === 1) return ch;
  }
  return null;
}`,
        complexity: { time: 'O(n)', space: 'O(k)' },
      },
      {
        label: 'indexOf / lastIndexOf',
        code: `function firstUnique(str) {
  for (const ch of str) {
    if (str.indexOf(ch) === str.lastIndexOf(ch)) return ch;
  }
  return null;
}`,
        complexity: { time: 'O(n²)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `console.log(firstUnique("swiss"), firstUnique("aabbcc"), firstUnique("leetcode"));`,
      output: `w null l`,
    },
    explanationBn: `**দুই pass:**
1. প্রথমবার পুরো string ঘুরে প্রতিটা অক্ষর কতবার আছে গুনি।
2. দ্বিতীয়বার **মূল string-এর ক্রমে** ঘুরি — প্রথম যার count 1, সেটাই উত্তর।

দ্বিতীয় pass কেন string-এর ওপর, Map-এর ওপর না? কারণ "প্রথম" মানে string-এ প্রথম। (Map-ও insertion order রাখে, তাই Map-এর ওপর ঘুরলেও এখানে ঠিক উত্তর আসত — কিন্তু string-এর ওপর ঘোরা অভিপ্রায়টা স্পষ্ট করে।)

**\`indexOf === lastIndexOf\`:** প্রথম আর শেষ অবস্থান একই হলে অক্ষরটা একবারই আছে। ছোট আর চতুর, কিন্তু প্রতিটা অক্ষরের জন্য পুরো string খোঁজে — O(n²)। Interview-তে এটা বলে তারপর O(n) সমাধান দেখানো ভালো।`,
  },
  {
    id: 'js-ex-remove-duplicates',
    title: 'Remove duplicates from an array',
    level: 'foundation',
    category: 'arrays',
    tags: ['arrays', 'set', 'filter'],
    prompt: `Write \`unique(arr)\` that returns a new array without duplicates, keeping the first occurrence order. Then write \`uniqueBy(arr, keyFn)\` that removes objects with the same key.`,
    examples: [
      { input: 'unique([3, 1, 3, 2, 1])', output: '[3, 1, 2]' },
      { input: 'uniqueBy(users, u => u.email)', output: 'the first user for each email' },
    ],
    hints: [
      '`new Set(arr)` keeps unique values in insertion order.',
      'Without Set: `filter((x, i) => arr.indexOf(x) === i)` — simple but O(n²).',
      'For objects, keep a `Set` of keys you have already seen.',
    ],
    solutions: [
      {
        label: 'Set',
        code: `const unique = (arr) => [...new Set(arr)];

function uniqueBy(arr, keyFn) {
  const seen = new Set();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'filter + indexOf',
        code: `const unique = (arr) => arr.filter((x, i) => arr.indexOf(x) === i);

const uniqueBy = (arr, keyFn) =>
  arr.filter((item, i) => arr.findIndex((other) => keyFn(other) === keyFn(item)) === i);`,
        complexity: { time: 'O(n²)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `console.log(unique([3, 1, 3, 2, 1]), unique([]));
const users = [
  { id: 1, email: "a@x.com" },
  { id: 2, email: "b@x.com" },
  { id: 3, email: "a@x.com" },
];
console.log(uniqueBy(users, (u) => u.email).map((u) => u.id));`,
      output: `[ 3, 1, 2 ] []
[ 1, 2 ]`,
    },
    explanationBn: `**Set:** \`Set\` শুধু unique value রাখে আর insertion order মনে রাখে — spread দিয়ে আবার array। O(n), এক লাইন।

**Object-এর ক্ষেত্রে:** Set reference দিয়ে তুলনা করে, তাই একই content-এর দুটো object আলাদা ধরে। তাই একটা key (email, id) বের করে সেটার Set রাখি, আর \`filter\`-এ শুধু প্রথমবার দেখা key-র item রাখি।

**filter + indexOf:** "এই item-এর প্রথম অবস্থান কি এখানেই?" — হ্যাঁ হলে রাখো। Set ছাড়া কাজ করে, কিন্তু প্রতিটা item-এর জন্য \`indexOf\` পুরো array খোঁজে — O(n²)। বড় data-য় ধীর।`,
  },
  {
    id: 'js-ex-largest-second-largest',
    title: 'Largest and second largest number',
    level: 'foundation',
    category: 'arrays',
    tags: ['arrays', 'single-pass', 'edge-cases'],
    prompt: `Write \`topTwo(nums)\` that returns \`[largest, secondLargest]\` of the **distinct** values, using \`null\` when a value does not exist. Do it in a single pass.`,
    examples: [
      { input: '[10, 5, 20, 20, 8]', output: '[20, 10]' },
      { input: '[7, 7]', output: '[7, null]' },
      { input: '[]', output: '[null, null]' },
    ],
    hints: [
      'Start both trackers at `-Infinity` or `null` — not `0`, which breaks for negative numbers.',
      'A new maximum pushes the old maximum down to second place.',
      'Ignore values equal to the current maximum, because the second largest must be distinct.',
    ],
    solutions: [
      {
        label: 'Single pass',
        code: `function topTwo(nums) {
  let first = -Infinity;
  let second = -Infinity;
  for (const n of nums) {
    if (n > first) {
      second = first;
      first = n;
    } else if (n < first && n > second) {
      second = n;
    }
  }
  const orNull = (v) => (v === -Infinity ? null : v);
  return [orNull(first), orNull(second)];
}`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
      {
        label: 'Set + sort',
        code: `function topTwo(nums) {
  const sorted = [...new Set(nums)].sort((a, b) => b - a);
  return [sorted[0] ?? null, sorted[1] ?? null];
}`,
        complexity: { time: 'O(n log n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `console.log(topTwo([10, 5, 20, 20, 8]));
console.log(topTwo([7, 7]), topTwo([]), topTwo([-3, -1, -2]));`,
      output: `[ 20, 10 ]
[ 7, null ] [ null, null ] [ -1, -2 ]`,
    },
    explanationBn: `এই সমস্যায় আসল পরীক্ষা edge case:
- **Duplicate maximum:** \`[20, 20]\` — দ্বিতীয় বৃহত্তম 20 না।
- **Negative সংখ্যা:** শুরুর মান \`0\` ধরলে \`[-3, -1]\`-এ ভুল উত্তর। তাই \`-Infinity\`।
- **খালি বা এক element-এর array।**

**Single pass:** নতুন সংখ্যা \`first\`-এর চেয়ে বড় হলে পুরনো \`first\` নেমে \`second\` হয়। \`first\`-এর সমান হলে উপেক্ষা (distinct চাই)। নইলে \`second\`-এর চেয়ে বড় হলে \`second\` আপডেট। শেষে \`-Infinity\` থাকলে মানে পাওয়া যায়নি → \`null\`।

**Set + sort:** পড়তে সহজ, কিন্তু O(n log n)। মনে রাখবেন \`sort\`-এ comparator দিতেই হবে, নইলে সংখ্যা string হিসেবে sort হয়।`,
  },
  {
    id: 'js-ex-fizzbuzz',
    title: 'FizzBuzz',
    level: 'foundation',
    category: 'logic',
    tags: ['loops', 'modulo'],
    prompt: `Write \`fizzBuzz(n)\` that returns an array for 1 to \`n\`: \`"Fizz"\` for multiples of 3, \`"Buzz"\` for multiples of 5, \`"FizzBuzz"\` for both, otherwise the number.`,
    examples: [{ input: 'fizzBuzz(5)', output: "[1, 2, 'Fizz', 4, 'Buzz']" }],
    hints: [
      'Test "divisible by both" (or by 15) before 3 and 5 individually.',
      'Alternatively build the word from parts and fall back to the number when the word is empty.',
    ],
    solutions: [
      {
        label: 'if / else',
        code: `function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push("FizzBuzz");
    else if (i % 3 === 0) out.push("Fizz");
    else if (i % 5 === 0) out.push("Buzz");
    else out.push(i);
  }
  return out;
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'String building',
        code: `const fizzBuzz = (n) =>
  Array.from({ length: n }, (_, k) => {
    const i = k + 1;
    return (i % 3 === 0 ? "Fizz" : "") + (i % 5 === 0 ? "Buzz" : "") || i;
  });`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `console.log(fizzBuzz(15).join(" "));`,
      output: `1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz`,
    },
    explanationBn: `FizzBuzz-এ ক্লাসিক ভুল হলো শর্তের ক্রম: আগে \`% 3\` চেক করলে 15 কখনো "FizzBuzz" পায় না। তাই "দুটো দিয়েই বিভাজ্য" সবার আগে।

দ্বিতীয় solution-এ combined check-ই লাগে না: দুটো অংশ ("Fizz", "Buzz") আলাদা করে জোড়া দিই। দুটোই খালি হলে \`"" || i\` — খালি string falsy, তাই সংখ্যাটা আসে। \`Array.from({ length: n }, fn)\` দিয়ে n-টা element-এর array বানানোর পরিচিত কৌশলও এখানে দেখা যায়।`,
  },
  {
    id: 'js-ex-fibonacci',
    title: 'Fibonacci',
    level: 'foundation',
    category: 'recursion',
    tags: ['recursion', 'memoization', 'generators', 'dynamic-programming'],
    prompt: `Write \`fib(n)\` returning the n-th Fibonacci number (\`fib(0) = 0\`, \`fib(1) = 1\`). Implement it iteratively, recursively with memoization, and with a generator.`,
    examples: [
      { input: 'fib(10)', output: '55' },
      { input: 'fib(50)', output: '12586269025' },
    ],
    hints: [
      'Iterative: keep only the last two numbers — `[a, b] = [b, a + b]`.',
      'Naive recursion is O(2ⁿ); cache results in a `Map` so each `fib(k)` is computed once.',
      'A generator can yield the sequence forever; take the n-th value from it.',
    ],
    solutions: [
      {
        label: 'Iterative',
        code: `function fib(n) {
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
      {
        label: 'Memoized recursion',
        code: `const fib = (() => {
  const cache = new Map();
  return function fib(n) {
    if (n < 2) return n;
    if (!cache.has(n)) cache.set(n, fib(n - 1) + fib(n - 2));
    return cache.get(n);
  };
})();`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Generator',
        code: `function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function fib(n) {
  let i = 0;
  for (const value of fibonacci()) {
    if (i++ === n) return value;
  }
}`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `console.log(Array.from({ length: 10 }, (_, i) => fib(i)).join(", "));
console.log(fib(50));`,
      output: `0, 1, 1, 2, 3, 5, 8, 13, 21, 34
12586269025`,
    },
    explanationBn: `**Iterative:** শুধু শেষ দুটো সংখ্যা রাখি। \`[a, b] = [b, a + b]\` — destructuring দিয়ে একসাথে দুটো আপডেট, temp variable লাগে না। O(n) সময়, O(1) memory — সবচেয়ে ব্যবহারিক।

**Memoized recursion:** সাধারণ recursion-এ \`fib(n-1)\` আর \`fib(n-2)\` দুজনেই একই subproblem বারবার হিসাব করে — O(2ⁿ), \`fib(50)\` কার্যত শেষই হয় না। IIFE-র closure-এ একটা \`Map\` cache রাখলে প্রতিটা \`fib(k)\` একবারই হিসাব হয় — O(n)। এটাই dynamic programming-এর মূল ধারণা।

**Generator:** \`function*\` আর \`yield\` দিয়ে অসীম Fibonacci sequence — দরকার মতো একটা একটা করে। \`for...of\`-এ n-তম value পেয়ে \`return\` করলে generator থেমে যায়।

খেয়াল করুন: \`fib(78)\`-এর পরে সংখ্যা \`Number.MAX_SAFE_INTEGER\` ছাড়িয়ে যায় — তখন নির্ভুলতার জন্য \`BigInt\` লাগবে।`,
  },
  {
    id: 'js-ex-chunk-array',
    title: 'Chunk an array',
    level: 'foundation',
    category: 'arrays',
    tags: ['arrays', 'slice', 'pagination'],
    prompt: `Write \`chunk(arr, size)\` that splits an array into groups of \`size\`; the last group may be smaller. Throw a \`RangeError\` for a size below 1.`,
    examples: [
      { input: 'chunk([1, 2, 3, 4, 5], 2)', output: '[[1, 2], [3, 4], [5]]' },
      { input: 'chunk([], 3)', output: '[]' },
    ],
    hints: [
      'Step through the array in increments of `size` and `slice` each piece.',
      '`slice` handles the short last chunk automatically.',
      '`Array.from({ length: Math.ceil(arr.length / size) }, ...)` builds it in one expression.',
    ],
    solutions: [
      {
        label: 'Loop + slice',
        code: `function chunk(arr, size) {
  if (size < 1) throw new RangeError("size must be at least 1");
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Array.from',
        code: `function chunk(arr, size) {
  if (size < 1) throw new RangeError("size must be at least 1");
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `console.log(JSON.stringify(chunk([1, 2, 3, 4, 5], 2)));
console.log(JSON.stringify(chunk([1, 2, 3], 5)), JSON.stringify(chunk([], 3)));
try {
  chunk([1], 0);
} catch (e) {
  console.log(e.name, "-", e.message);
}`,
      output: `[[1,2],[3,4],[5]]
[[1,2,3]] []
RangeError - size must be at least 1`,
    },
    explanationBn: `**Loop + slice:** \`i\` প্রতিবার \`size\` করে বাড়ে, আর \`slice(i, i + size)\` একটা টুকরো দেয়। শেষ টুকরো ছোট হলে \`slice\` নিজেই সামলায় — array-র বাইরে গেলে শুধু যতটুকু আছে ততটুকু দেয়।

**Array.from:** মোট কয়টা টুকরো হবে আগে হিসাব — \`Math.ceil(length / size)\` — তারপর প্রতিটা index-এর জন্য একটা slice।

Edge case: \`size\` 0 বা negative হলে loop কখনো শেষ হতো না (0 করে বাড়ছে) — তাই শুরুতেই \`RangeError\`। বাস্তবে pagination বা batch করে API-তে পাঠানোর জন্য এটা খুব কাজের।`,
  },
  {
    id: 'js-ex-group-by',
    title: 'Implement groupBy',
    level: 'foundation',
    category: 'hashing',
    tags: ['arrays', 'reduce', 'objects', 'grouping'],
    prompt: `Write \`groupBy(items, keyFn)\` that returns an object whose keys are \`keyFn(item)\` and whose values are arrays of the matching items, in their original order. \`keyFn\` may also be a property name string.`,
    examples: [
      { input: 'groupBy([1.2, 1.8, 2.1], Math.floor)', output: '{ 1: [1.2, 1.8], 2: [2.1] }' },
      { input: 'groupBy(users, "city")', output: '{ Dhaka: [...], Sylhet: [...] }' },
    ],
    hints: [
      'Normalise the second argument: if it is a string, turn it into `item => item[key]`.',
      'For each item, create the group array the first time you see its key.',
      'ES2024 adds `Object.groupBy` — know it, but be ready to write your own.',
    ],
    solutions: [
      {
        label: 'reduce',
        code: `function groupBy(items, keyFn) {
  const getKey = typeof keyFn === "function" ? keyFn : (item) => item[keyFn];
  return items.reduce((groups, item) => {
    (groups[getKey(item)] ??= []).push(item);
    return groups;
  }, {});
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Object.groupBy',
        code: `function groupBy(items, keyFn) {
  const getKey = typeof keyFn === "function" ? keyFn : (item) => item[keyFn];
  return { ...Object.groupBy(items, getKey) };
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `console.log(groupBy([1.2, 1.8, 2.1], Math.floor));
const users = [
  { name: "Rafi", city: "Dhaka" },
  { name: "Nadia", city: "Sylhet" },
  { name: "Sam", city: "Dhaka" },
];
const byCity = groupBy(users, "city");
console.log(Object.keys(byCity), byCity.Dhaka.map((u) => u.name));`,
      output: `{ '1': [ 1.2, 1.8 ], '2': [ 2.1 ] }
[ 'Dhaka', 'Sylhet' ] [ 'Rafi', 'Sam' ]`,
    },
    explanationBn: `**মূল ধারণা:** প্রতিটা item-এর key বের করি; সেই key-র group আগে না থাকলে খালি array বানাই, তারপর item push করি।

\`(groups[key] ??= []).push(item)\` — এক লাইনে দুই কাজ: \`??=\` key না থাকলে খালি array বসায়, আর expression-টা সেই array-টাই ফেরত দেয়, যেখানে push হয়।

**String বা function — দুটোই নেওয়া:** শুরুতে normalise করে নিই, যাতে বাকি code একটাই ধরনের function নিয়ে কাজ করে। Lodash-এর \`groupBy\` ঠিক এভাবে কাজ করে।

ES2024-এর \`Object.groupBy\` একই কাজ করে, কিন্তু null-prototype object ফেরত দেয় — তাই spread দিয়ে সাধারণ object বানিয়ে নিয়েছি। Interview-তে built-in জানা ভালো, তবে নিজে লিখতে পারাটাই আসল পরীক্ষা।`,
  },
  {
    id: 'js-ex-flatten-array',
    title: 'Flatten a nested array (recursive and iterative)',
    level: 'foundation',
    category: 'recursion',
    tags: ['arrays', 'recursion', 'stack', 'flat'],
    prompt: `Write \`flatten(arr, depth = Infinity)\` without using \`Array.prototype.flat\`. It should flatten up to \`depth\` levels. Write a recursive version and an iterative version.`,
    examples: [
      { input: 'flatten([1, [2, [3, [4]]]])', output: '[1, 2, 3, 4]' },
      { input: 'flatten([1, [2, [3, [4]]]], 1)', output: '[1, 2, [3, [4]]]' },
    ],
    hints: [
      'Recursive: for each element, if it is an array and depth > 0, flatten it with `depth - 1`; otherwise push it.',
      'Iterative: use a stack of `[value, depth]` pairs. Popping from the end reverses order — push in reverse or `unshift` results.',
      '`Array.isArray` is the right test.',
    ],
    solutions: [
      {
        label: 'Recursive',
        code: `function flatten(arr, depth = Infinity) {
  const out = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) out.push(...flatten(item, depth - 1));
    else out.push(item);
  }
  return out;
}`,
        complexity: { time: 'O(n)', space: 'O(depth) recursion' },
      },
      {
        label: 'Iterative (stack)',
        code: `function flatten(arr, depth = Infinity) {
  const stack = arr.map((item) => [item, depth]);
  const out = [];
  while (stack.length) {
    const [item, d] = stack.pop();
    if (Array.isArray(item) && d > 0) {
      stack.push(...item.map((child) => [child, d - 1]));
    } else {
      out.push(item);
    }
  }
  return out.reverse();
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `console.log(JSON.stringify(flatten([1, [2, [3, [4]]], 5])));
console.log(JSON.stringify(flatten([1, [2, [3, [4]]]], 1)));
console.log(JSON.stringify(flatten([[], [[]], 6])));`,
      output: `[1,2,3,4,5]
[1,2,[3,[4]]]
[6]`,
    },
    explanationBn: `**Recursive:** প্রতিটা element দেখি — array হলে (আর depth বাকি থাকলে) সেটাকেও flatten করি \`depth - 1\` দিয়ে, তারপর spread করে result-এ ঢোকাই; না হলে সরাসরি push। Depth শূন্যে পৌঁছালে nested array যেমন আছে তেমন থাকে — এভাবে \`flat(depth)\`-এর আচরণ নকল হয়।

**Iterative (stack):** Recursion-এর সীমা এড়াতে নিজেই একটা stack চালাই, প্রতিটা item-এর সাথে তার বাকি depth রাখি। Array পেলে তার child গুলো stack-এ ঢোকাই, না হলে result-এ।

একটা কৌশলের বিষয়: stack-এর শেষ থেকে \`pop\` করি, তাই item গুলো উল্টো ক্রমে বের হয়। শেষে \`reverse()\` করে মূল ক্রম ফিরিয়ে আনি। (বিকল্প: \`shift\` দিয়ে queue — কিন্তু \`shift\` O(n), তাই ধীর।)`,
  },

  // ──────────────────────────── Intermediate ────────────────────────────
  {
    id: 'js-ex-deep-clone',
    title: 'Deep clone',
    level: 'intermediate',
    category: 'recursion',
    tags: ['objects', 'recursion', 'copy', 'weakmap'],
    prompt: `Write \`deepClone(value)\` that deeply copies plain objects, arrays, \`Date\`, \`Map\` and \`Set\`, and handles circular references. Primitives and functions are returned as-is.`,
    examples: [
      {
        input: '{ a: { b: [1, 2] } }',
        output: 'an equal object that shares nothing with the original',
      },
      {
        input: 'an object that references itself',
        output: 'a copy whose self-reference points to the copy',
      },
    ],
    hints: [
      'Base case: anything that is not an object (or is `null`) is returned directly.',
      'Handle the special types (`Date`, `Map`, `Set`) before generic objects.',
      'Circular references: keep a `WeakMap` from original → copy, and return the existing copy when you see an object again.',
    ],
    solutions: [
      {
        label: 'Recursive with WeakMap',
        code: `function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);

  if (value instanceof Date) return new Date(value);
  if (value instanceof Map) {
    const copy = new Map();
    seen.set(value, copy);
    value.forEach((v, k) => copy.set(deepClone(k, seen), deepClone(v, seen)));
    return copy;
  }
  if (value instanceof Set) {
    const copy = new Set();
    seen.set(value, copy);
    value.forEach((v) => copy.add(deepClone(v, seen)));
    return copy;
  }

  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) copy[key] = deepClone(value[key], seen);
  return copy;
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'structuredClone (built-in)',
        code: `function deepClone(value) {
  return structuredClone(value);
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `const original = {
  name: "Rafi",
  tags: new Set(["admin"]),
  joined: new Date(0),
  nested: { list: [1, { deep: true }] },
};
original.self = original;

const copy = deepClone(original);
copy.nested.list[1].deep = false;

console.log(original.nested.list[1].deep, copy.nested.list[1].deep);
console.log(copy.self === copy, copy !== original, copy.joined instanceof Date);
console.log(copy.tags.has("admin"), copy.tags !== original.tags);`,
      output: `true false
true true true
true true`,
    },
    explanationBn: `**মূল কাঠামো — recursion:** primitive হলে সরাসরি ফেরত। Object হলে নতুন একটা খালি container বানাই, তারপর প্রতিটা property recursively কপি।

**বিশেষ type:** \`Date\`, \`Map\`, \`Set\` সাধারণ object-এর মতো property-তে data রাখে না — তাই আলাদা করে সামলাতে হয়। সাধারণ loop দিয়ে কপি করলে খালি object পাওয়া যেত।

**Circular reference — আসল কঠিন অংশ:** object যদি নিজেকেই ধরে রাখে (\`obj.self = obj\`), সাধারণ recursion অসীম loop-এ পড়ে stack overflow। সমাধান: একটা \`WeakMap\`-এ "কোন original-এর copy কোনটা" লিখে রাখি। আবার একই object দেখলে নতুন copy না বানিয়ে আগেরটা ফেরত দিই। গুরুত্বপূর্ণ: copy তৈরির **সাথে সাথেই** WeakMap-এ রাখতে হয়, ভেতরের property কপি করার আগে — নইলে cycle ধরা পড়বে না।

WeakMap কেন, Map না? Clone শেষে original object গুলো garbage collect হতে বাধা দেয় না।

বাস্তবে built-in \`structuredClone\` এই সব (circular সহ) সামলায় — interview-তে এটার কথা বলুন, তারপর নিজে লিখে দেখান।`,
  },
  {
    id: 'js-ex-deep-equal',
    title: 'Deep equal',
    level: 'intermediate',
    category: 'recursion',
    tags: ['objects', 'recursion', 'equality'],
    prompt: `Write \`deepEqual(a, b)\` that returns \`true\` when two values are structurally equal: same primitive values (treat \`NaN\` as equal to \`NaN\`), arrays with equal elements in order, plain objects with the same keys and equal values, and \`Date\`s with the same time.`,
    examples: [
      { input: '{ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }', output: 'true' },
      { input: '{ a: 1 }, { a: 1, b: undefined }', output: 'false' },
      { input: 'NaN, NaN', output: 'true' },
    ],
    hints: [
      '`Object.is` handles primitives, including `NaN`.',
      'If either value is not an object, the answer is `Object.is(a, b)`.',
      'Check types/prototypes first, then compare key counts, then recurse into each key.',
    ],
    solutions: [
      {
        label: 'Recursive',
        code: `function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (a instanceof Date) return a.getTime() === b.getTime();

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
}`,
        complexity: { time: 'O(n)', space: 'O(depth)' },
      },
    ],
    sampleRun: {
      code: `console.log(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }));
console.log(deepEqual({ a: 1 }, { a: 1, b: undefined }));
console.log(deepEqual(NaN, NaN), deepEqual([1, 2], [2, 1]), deepEqual([1], { 0: 1 }));
console.log(deepEqual(new Date(5), new Date(5)), deepEqual(null, {}));`,
      output: `true
false
true false false
true false`,
    },
    explanationBn: `\`===\` object-এ reference মেলায়; deep equal মেলায় **গঠন আর content**।

ধাপগুলো:
1. **\`Object.is(a, b)\`** — একই value বা একই object হলে সাথে সাথে \`true\`। \`===\`-এর বদলে \`Object.is\` কেন? যাতে \`NaN\` নিজের সমান ধরা হয়।
2. **দুটোর কোনোটা object না** (বা \`null\`) — আর ধাপ ১-এ মেলেনি, তাই \`false\`।
3. **Prototype মেলানো** — এতে \`[1]\` আর \`{0: 1}\` আলাদা ধরা পড়ে (array বনাম object), আর Date-কে সাধারণ object-এর সাথে গুলিয়ে ফেলা হয় না।
4. **Date** — সময় মেলাই।
5. **Key-এর সংখ্যা** — আলাদা হলে \`false\`। এখানেই \`{a: 1}\` বনাম \`{a: 1, b: undefined}\` ধরা পড়ে — দ্বিতীয়টায় key দুটো, যদিও \`b\` undefined।
6. প্রতিটা key দুটোতেই আছে কি না আর value recursively সমান কি না।

\`every\` প্রথম অমিলেই থেমে যায় — অপ্রয়োজনীয় তুলনা হয় না।`,
  },
  {
    id: 'js-ex-debounce',
    title: 'Implement debounce',
    level: 'intermediate',
    category: 'implementation',
    tags: ['debounce', 'closures', 'timers'],
    prompt: `Write \`debounce(fn, wait)\` that returns a function which delays calling \`fn\` until \`wait\` ms have passed **since the last call**. It must pass along the latest arguments and \`this\`, and expose a \`cancel()\` method.`,
    examples: [
      {
        input: 'calls at 0, 10 and 20 ms with wait = 50',
        output: 'fn runs once, at about 70 ms, with the last arguments',
      },
    ],
    hints: [
      'Keep the timer id in a closure.',
      'Every call clears the previous timer and starts a new one.',
      'Use `fn.apply(this, args)` inside the timeout so context and arguments are preserved — the returned function must be a regular `function` to receive `this`.',
    ],
    solutions: [
      {
        label: 'Closure + timer',
        code: `function debounce(fn, wait) {
  let timeoutId;
  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), wait);
  }
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}`,
        complexity: { time: 'O(1) per call', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `const editor = {
  name: "draft",
  save: debounce(function (version) {
    console.log("saved", this.name, "v" + version);
  }, 50),
};

[1, 2, 3].forEach((v, i) => setTimeout(() => editor.save(v), i * 10));
setTimeout(() => editor.save(4), 200);
setTimeout(() => editor.save(5), 210);
setTimeout(() => editor.save.cancel(), 220);
setTimeout(() => console.log("done"), 400);`,
      output: `saved draft v3
done`,
    },
    explanationBn: `**Debounce = "থামার পরে একবার"।** প্রতিটা call আগের অপেক্ষমাণ timer বাতিল করে নতুন timer শুরু করে। তাই call গুলো ঘনঘন আসতে থাকলে কিছুই চলে না; শেষ call-এর পর \`wait\` সময় চুপ থাকলে তবেই চলে — শেষ argument দিয়ে।

**Implementation-এর তিনটা বিষয়:**
1. **Closure-এ timer id** — প্রতিটা call আগের timer খুঁজে বাতিল করতে পারে।
2. **\`this\` আর argument:** ফেরত দেওয়া function অবশ্যই সাধারণ \`function\` — arrow হলে নিজের \`this\` পেত না। আর timeout-এর ভেতরে arrow function ব্যবহার করেছি, যাতে বাইরের সেই \`this\` ধরে রাখে। \`fn.apply(this, args)\` দুটোই পাস করে। Sample-এ \`this.name\` ("draft") সঠিকভাবে আসা সেটাই প্রমাণ করে।
3. **\`cancel()\`** — component বন্ধ হলে বা user navigate করলে অপেক্ষমাণ call বাতিল করতে।

Sample run: 0, 10, 20ms-এ তিনটা call → শেষটা (v3) ~70ms-এ চলে। তারপর 200 আর 210ms-এ দুটো call, কিন্তু 220ms-এ cancel — তাই v5 আর save হয় না।`,
  },
  {
    id: 'js-ex-throttle',
    title: 'Implement throttle',
    level: 'intermediate',
    category: 'implementation',
    tags: ['throttle', 'closures', 'timers'],
    prompt: `Write \`throttle(fn, wait)\` that calls \`fn\` immediately on the first call, then ignores further calls until \`wait\` ms have passed. Preserve \`this\` and arguments.

Bonus: a trailing version that also runs once at the end of the window with the latest arguments if calls were ignored.`,
    examples: [
      { input: '26 calls over 250 ms, wait = 100', output: 'fn runs 3 times (leading edge)' },
    ],
    hints: [
      'Remember the timestamp of the last run in a closure.',
      'Run only if `Date.now() - lastRun >= wait`.',
      'Trailing version: when a call is ignored, save its arguments and schedule one timer for the end of the window.',
    ],
    solutions: [
      {
        label: 'Leading (timestamp)',
        code: `function throttle(fn, wait) {
  let lastRun = -Infinity;
  return function (...args) {
    const now = Date.now();
    if (now - lastRun >= wait) {
      lastRun = now;
      fn.apply(this, args);
    }
  };
}`,
        complexity: { time: 'O(1) per call', space: 'O(1)' },
      },
      {
        label: 'Leading + trailing',
        code: `function throttle(fn, wait, { trailing = false } = {}) {
  let lastRun = -Infinity;
  let timer = null;
  let pendingArgs = null;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastRun);
    if (remaining <= 0) {
      lastRun = now;
      fn.apply(this, args);
    } else if (trailing) {
      pendingArgs = args;
      timer ??= setTimeout(() => {
        timer = null;
        lastRun = Date.now();
        fn.apply(this, pendingArgs);
      }, remaining);
    }
  };
}`,
        complexity: { time: 'O(1) per call', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `let calls = 0;
const onScroll = throttle(() => calls++, 100);
for (let t = 0; t <= 250; t += 10) setTimeout(onScroll, t);
setTimeout(() => console.log("handled", calls, "of 26 scroll events"), 400);`,
      output: `handled 3 of 26 scroll events`,
    },
    explanationBn: `**Throttle = "চলতে থাকলেও নির্দিষ্ট বিরতিতে একবার"।**

**Leading version:** closure-এ শেষবার চলার সময় মনে রাখি। নতুন call এলে দেখি \`wait\` পার হয়েছে কি না — হলে চালাই আর সময় আপডেট করি, না হলে উপেক্ষা। ২৫০ms ধরে প্রতি ১০ms-এ event → প্রায় 0, 100, 200ms-এ তিনবার চলে।

**সমস্যা:** শেষের event গুলো উপেক্ষিত হলে শেষ অবস্থাটা (যেমন scroll-এর শেষ অবস্থান) কখনো process হয় না।

**Trailing version:** কোনো call উপেক্ষিত হলে তার argument রেখে দিই, আর window শেষে একটা timer-এ শেষবার চালাই। \`??=\` নিশ্চিত করে যে একটাই timer থাকে। এভাবে প্রথম event সাথে সাথে আর শেষ event-ও অবশ্যই process হয় — Lodash-এর default আচরণ এটাই।

Debounce-এর সাথে পার্থক্য: debounce একটানা event-এ **একবারও** চলে না যতক্ষণ না থামে; throttle **নিয়মিত** চলতে থাকে।`,
  },
  {
    id: 'js-ex-once',
    title: 'Implement once',
    level: 'intermediate',
    category: 'implementation',
    tags: ['closures', 'higher-order-functions'],
    prompt: `Write \`once(fn)\` that returns a function which calls \`fn\` only the first time and returns that first result on every later call. Preserve \`this\` and arguments.`,
    examples: [{ input: 'const init = once(setup); init(); init();', output: 'setup runs once' }],
    hints: [
      'Store "has it run?" and the result in the closure.',
      'After the first call you can drop the reference to `fn` so it can be garbage-collected.',
    ],
    solutions: [
      {
        label: 'Closure',
        code: `function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
      fn = null;                 // release the original function
    }
    return result;
  };
}`,
        complexity: { time: 'O(1)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `let setups = 0;
const init = once((config) => {
  setups++;
  return "connected to " + config;
});

console.log(init("db-1"));
console.log(init("db-2"));
console.log("setups:", setups);`,
      output: `connected to db-1
connected to db-1
setups: 1`,
    },
    explanationBn: `\`once\` closure-এর সবচেয়ে পরিষ্কার উদাহরণগুলোর একটা: function-এর ব্যক্তিগত memory-তে দুটো জিনিস — "আগে চলেছে কি না" আর "প্রথমবারের ফলাফল"।

প্রথম call-এ \`called = true\` করে আসল function চালাই, ফলাফল রাখি। পরের সব call সরাসরি সেই রাখা ফলাফল ফেরত দেয় — argument যা-ই হোক।

\`called\` flag আলাদা রাখার কারণ: শুধু \`result\` দেখে বোঝা যেত না, কারণ function নিজে \`undefined\` return করতে পারে।

\`fn = null\` — একটা ছোট্ট সূক্ষ্মতা: আর কখনো লাগবে না, তাই reference ছেড়ে দিই যাতে garbage collect হতে পারে।

ব্যবহার: payment submit দুবার না হওয়া, একবারের initialization, event listener একবারই চালানো।`,
  },
  {
    id: 'js-ex-memoize',
    title: 'Implement memoize',
    level: 'intermediate',
    category: 'implementation',
    tags: ['memoization', 'closures', 'map', 'caching'],
    prompt: `Write \`memoize(fn, resolver?)\` that caches results by argument. By default use the first argument as the cache key; an optional \`resolver(...args)\` builds a custom key. Expose the cache as \`memoized.cache\` (a \`Map\`).`,
    examples: [{ input: 'memoized slow function called twice with 9', output: 'computed once' }],
    hints: [
      'Keep a `Map` in the closure.',
      'Key: `resolver ? resolver(...args) : args[0]`.',
      'Use `cache.has(key)` rather than checking for a truthy value, so `0`, `""` and `undefined` results are cached too.',
    ],
    solutions: [
      {
        label: 'Map cache',
        code: `function memoize(fn, resolver) {
  const cache = new Map();
  function memoized(...args) {
    const key = resolver ? resolver(...args) : args[0];
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  }
  memoized.cache = cache;
  return memoized;
}`,
        complexity: { time: 'O(1) per cached call', space: 'O(distinct keys)' },
      },
    ],
    sampleRun: {
      code: `let work = 0;
const square = memoize((n) => { work++; return n * n; });
console.log(square(9), square(9), square(0), square(0), "work:", work);

const add = memoize((a, b) => { work++; return a + b; }, (a, b) => a + "," + b);
console.log(add(1, 2), add(1, 2), add(2, 1), "work:", work, "keys:", [...add.cache.keys()]);`,
      output: `81 81 0 0 work: 2
3 3 3 work: 4 keys: [ '1,2', '2,1' ]`,
    },
    explanationBn: `**গঠন:** closure-এ একটা \`Map\`। প্রতিটা call-এ key বানাই, cache-এ না থাকলে হিসাব করে রাখি, তারপর cache থেকে ফেরত দিই।

**দুটো সূক্ষ্ম বিষয়, যেগুলো interviewer খেয়াল করেন:**
1. **\`cache.has(key)\`, \`cache.get(key)\` না।** যদি লিখতেন \`if (!cache.get(key))\`, তাহলে result \`0\`, \`""\` বা \`false\` হলে সেটা falsy বলে প্রতিবার আবার হিসাব হতো — cache অকেজো। Sample-এ \`square(0)\` একবারই হিসাব হওয়া সেটাই দেখায়।
2. **একাধিক argument:** default-এ শুধু প্রথম argument key — তাই \`add(1, 2)\` আর \`add(1, 5)\` একই key পেত! \`resolver\` দিয়ে সব argument মিলিয়ে key বানাতে হয়। (Lodash-এর \`memoize\` ঠিক এই নকশা।)

\`memoized.cache\` বাইরে দেখানোয় দরকার হলে cache খালি বা পরীক্ষা করা যায়। Long-running app-এ cache-এর সর্বোচ্চ আকার রাখা উচিত, নইলে memory বাড়তেই থাকে।`,
  },
  {
    id: 'js-ex-curry',
    title: 'Implement curry',
    level: 'intermediate',
    category: 'implementation',
    tags: ['currying', 'closures', 'functional-programming'],
    prompt: `Write \`curry(fn)\` so that a function of N arguments can be called with them one at a time or in any grouping: \`f(1)(2)(3)\`, \`f(1, 2)(3)\`, \`f(1)(2, 3)\`, \`f(1, 2, 3)\`.`,
    examples: [{ input: 'curry((a, b, c) => a + b + c)(1)(2)(3)', output: '6' }],
    hints: [
      '`fn.length` tells you how many arguments the function expects.',
      'Return a function that collects arguments; once it has at least `fn.length`, call `fn`.',
      'Each partial call must return a new function and not share collected arguments with other partial calls.',
    ],
    solutions: [
      {
        label: 'Recursive collector',
        code: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}`,
        complexity: { time: 'O(n) per call', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `const sum3 = curry((a, b, c) => a + b + c);
console.log(sum3(1)(2)(3), sum3(1, 2)(3), sum3(1)(2, 3), sum3(1, 2, 3));

const addOne = sum3(1);          // partial calls are independent
console.log(addOne(10)(100), addOne(20)(200));

const greet = curry((greeting, name) => greeting + ", " + name);
const hello = greet("Hello");
console.log(["Rafi", "Nadia"].map(hello));`,
      output: `6 6 6 6
111 221
[ 'Hello, Rafi', 'Hello, Nadia' ]`,
    },
    explanationBn: `**মূল কৌশল:** argument জমাতে থাকা, যতক্ষণ না যথেষ্ট জমে।

- \`fn.length\` বলে আসল function কয়টা argument চায়।
- \`curried(...args)\` — যথেষ্ট argument থাকলে সাথে সাথে \`fn\` চালাও।
- না থাকলে একটা নতুন function ফেরত দাও, যেটা পরের argument গুলো নিয়ে **আগের গুলোর সাথে জুড়ে** আবার \`curried\` ডাকে।

**গুরুত্বপূর্ণ:** \`[...args, ...more]\` প্রতিবার **নতুন** array বানায়, আগেরটা বদলায় না। তাই \`addOne\` থেকে দুটো আলাদা শাখা (\`addOne(10)\` আর \`addOne(20)\`) একে অপরকে প্রভাবিত করে না। যদি একটা shared array-তে push করতাম, দ্বিতীয় call প্রথমটার argument দেখে ভুল ফল দিত — এটা একটা common bug।

সীমাবদ্ধতা: default বা rest parameter থাকলে \`fn.length\` সঠিক সংখ্যা দেয় না, তাই এমন function curry করা যায় না।`,
  },
  {
    id: 'js-ex-array-polyfills',
    title: 'Polyfill map, filter and reduce',
    level: 'intermediate',
    category: 'implementation',
    tags: ['polyfills', 'prototypes', 'arrays', 'higher-order-functions'],
    prompt: `Implement \`Array.prototype.myMap\`, \`myFilter\` and \`myReduce\` that behave like the built-ins:

- callbacks receive \`(element, index, array)\` (and the accumulator first for reduce),
- \`map\`/\`filter\` accept an optional \`thisArg\`,
- \`reduce\` without an initial value uses the first element, and throws \`TypeError("Reduce of empty array with no initial value")\` on an empty array,
- holes in sparse arrays are skipped.`,
    examples: [
      { input: '[1, 2, 3].myMap(x => x * 2)', output: '[2, 4, 6]' },
      { input: '[1, 2, 3, 4].myReduce((a, b) => a + b)', output: '10' },
    ],
    hints: [
      'Inside a prototype method, `this` is the array.',
      'Use `i in this` to skip holes, like the built-ins do.',
      'For reduce, track whether you already have an accumulator; when there is no initial value, the first existing element becomes it.',
    ],
    solutions: [
      {
        label: 'Prototype methods',
        code: `Array.prototype.myMap = function (callback, thisArg) {
  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) result[i] = callback.call(thisArg, this[i], i, this);
  }
  return result;
};

Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) result.push(this[i]);
  }
  return result;
};

Array.prototype.myReduce = function (callback, ...initial) {
  let hasAcc = initial.length > 0;
  let acc = initial[0];
  for (let i = 0; i < this.length; i++) {
    if (!(i in this)) continue;
    if (!hasAcc) {
      acc = this[i];
      hasAcc = true;
    } else {
      acc = callback(acc, this[i], i, this);
    }
  }
  if (!hasAcc) throw new TypeError("Reduce of empty array with no initial value");
  return acc;
};`,
        complexity: { time: 'O(n)', space: 'O(n) for map/filter' },
      },
    ],
    sampleRun: {
      code: `console.log([1, 2, 3].myMap((x, i) => x * 10 + i));
console.log([1, 2, 3, 4, 5].myFilter((x) => x % 2));
console.log([1, 2, 3, 4].myReduce((a, b) => a + b), [1, 2].myReduce((a, b) => a + b, 100));
const ctx = { factor: 3 };
console.log([1, 2].myMap(function (x) { return x * this.factor; }, ctx));
console.log([1, , 3].myMap((x) => x * 2), [, , 5].myReduce((a, b) => a + b));
try {
  [].myReduce((a, b) => a + b);
} catch (e) {
  console.log(e.name, "-", e.message);
}`,
      output: `[ 10, 21, 32 ]
[ 1, 3, 5 ]
10 103
[ 3, 6 ]
[ 2, <1 empty item>, 6 ] 5
TypeError - Reduce of empty array with no initial value`,
    },
    explanationBn: `Polyfill লেখা দেখায় আপনি built-in method গুলো ভেতরে কীভাবে কাজ করে তা বোঝেন কি না।

**সাধারণ গঠন:** prototype-এ method যোগ করি — ভেতরে \`this\` হলো যে array-র ওপর call হয়েছে। Loop চালিয়ে প্রতিটা element-এ callback ডাকি \`(element, index, array)\` দিয়ে।

**তিনটা খুঁটিনাটি, যেগুলো "ভালো" উত্তরকে আলাদা করে:**
1. **\`thisArg\`** — \`callback.call(thisArg, ...)\` দিয়ে callback-এর \`this\` সেট করা।
2. **ফাঁকা ঘর (holes)** — \`i in this\` দিয়ে চেক। Built-in গুলো hole এড়িয়ে যায়; \`map\` ফলাফলেও hole রেখে দেয় (sample-এ \`<1 empty item>\`)।
3. **\`reduce\`-এর initial value** — "দেওয়া হয়নি" আর "\`undefined\` দেওয়া হয়েছে" আলাদা! তাই \`...initial\` rest parameter দিয়ে argument-এর **সংখ্যা** দেখি। না দেওয়া থাকলে প্রথম বিদ্যমান element accumulator হয়, আর loop দ্বিতীয়টা থেকে callback চালায়। খালি array-তে initial ছাড়া — built-in-এর মতোই হুবহু একই message দিয়ে \`TypeError\`।

(বাস্তব code-এ built-in prototype বদলানো উচিত না — এটা শুধু শেখার/interview-এর জন্য।)`,
  },
  {
    id: 'js-ex-bind-polyfill',
    title: 'Polyfill Function.prototype.bind',
    level: 'intermediate',
    category: 'implementation',
    tags: ['bind', 'this', 'polyfills', 'closures'],
    prompt: `Implement \`Function.prototype.myBind(thisArg, ...presetArgs)\` that returns a new function which:

- calls the original with \`this = thisArg\`,
- prepends \`presetArgs\` to the arguments it receives (partial application),
- (bonus) when called with \`new\`, ignores \`thisArg\` and creates an instance of the original function.`,
    examples: [
      {
        input: 'greet.myBind(user, "Hi")("!")',
        output: 'greet called with this = user and args ("Hi", "!")',
      },
    ],
    hints: [
      'Inside `myBind`, `this` is the function being bound — save it.',
      'Return a function that calls `original.apply(thisArg, [...presetArgs, ...args])`.',
      "For `new` support: detect `this instanceof bound` (or `new.target`) and link `bound.prototype` to the original's prototype.",
    ],
    solutions: [
      {
        label: 'Basic',
        code: `Function.prototype.myBind = function (thisArg, ...presetArgs) {
  const original = this;
  if (typeof original !== "function") throw new TypeError("myBind must be called on a function");
  return function (...args) {
    return original.apply(thisArg, [...presetArgs, ...args]);
  };
};`,
        complexity: { time: 'O(n) arguments', space: 'O(n)' },
      },
      {
        label: 'With new support',
        code: `Function.prototype.myBind = function (thisArg, ...presetArgs) {
  const original = this;
  if (typeof original !== "function") throw new TypeError("myBind must be called on a function");
  function bound(...args) {
    const calledWithNew = new.target !== undefined;
    return original.apply(calledWithNew ? this : thisArg, [...presetArgs, ...args]);
  }
  if (original.prototype) bound.prototype = Object.create(original.prototype);
  return bound;
};`,
        complexity: { time: 'O(n) arguments', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `function greet(greeting, punctuation) {
  return greeting + ", " + this.name + punctuation;
}
const user = { name: "Rafi" };

const hiRafi = greet.myBind(user, "Hi");
console.log(hiRafi("!"), hiRafi("?"));

const detached = { name: "Nadia", say: hiRafi };
console.log(detached.say("."));              // bound this wins over the method call

const multiply = (a, b) => a * b;
console.log(multiply.myBind(null, 6)(7));`,
      output: `Hi, Rafi! Hi, Rafi?
Hi, Rafi.
42`,
    },
    explanationBn: `**মূল ধারণা:** \`myBind\` একটা নতুন function ফেরত দেয়, যেটা closure-এ তিনটা জিনিস মনে রাখে — মূল function, \`thisArg\`, আর আগে থেকে দেওয়া argument গুলো। Call হলে \`original.apply(thisArg, [...preset, ...নতুন])\`।

\`myBind\`-এর ভেতরে \`this\` হলো যে function-এর ওপর \`myBind\` ডাকা হয়েছে (\`greet.myBind(...)\` → \`this = greet\`)। তাই প্রথমেই \`original\`-এ রেখে দিই, কারণ ভেতরের function-এ \`this\` বদলে যাবে।

Sample-এর দ্বিতীয় লাইন bind-এর শক্তি দেখায়: bound function-কে অন্য object-এর method হিসেবে call করলেও \`this\` বদলায় না — Rafi-ই থাকে।

**Bonus — \`new\`:** আসল \`bind\`-এর একটা নিয়ম: bound function-কে \`new\` দিয়ে call করলে bind করা \`this\` উপেক্ষা হয়, নতুন instance তৈরি হয়। \`new.target\` দিয়ে বোঝা যায় \`new\` দিয়ে call হয়েছে কি না; তখন \`this\` (নতুন object) ব্যবহার করি। আর \`bound.prototype\`-কে মূল function-এর prototype-এর সাথে জুড়ে দিই, যাতে \`instanceof\` সঠিক কাজ করে।`,
  },
  {
    id: 'js-ex-promise-all',
    title: 'Implement Promise.all',
    level: 'intermediate',
    category: 'implementation',
    tags: ['promises', 'async', 'polyfills'],
    prompt: `Write \`promiseAll(iterable)\` that behaves like \`Promise.all\`:

- resolves with an array of results **in input order** (not completion order),
- rejects as soon as any input rejects,
- accepts plain values as well as promises,
- resolves immediately with \`[]\` for an empty input.`,
    examples: [
      { input: '[delay(30, "a"), "b", delay(10, "c")]', output: "['a', 'b', 'c']" },
      { input: 'one rejected input', output: 'rejects with that reason' },
    ],
    hints: [
      'Return `new Promise((resolve, reject) => { ... })`.',
      'Store each result at its own index and count how many have finished; resolve when the count reaches the total.',
      'Wrap every item with `Promise.resolve(item)` so plain values work, and pass `reject` directly as the error handler.',
    ],
    solutions: [
      {
        label: 'Counter + indexes',
        code: `function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = [...iterable];
    const results = new Array(items.length);
    let remaining = items.length;
    if (remaining === 0) return resolve(results);

    items.forEach((item, index) => {
      Promise.resolve(item).then((value) => {
        results[index] = value;
        remaining -= 1;
        if (remaining === 0) resolve(results);
      }, reject);
    });
  });
}`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `const delay = (ms, value) => new Promise((r) => setTimeout(() => r(value), ms));
const fail = (ms, msg) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));

(async () => {
  console.log(await promiseAll([delay(30, "a"), "b", delay(10, "c")]));
  console.log(await promiseAll([]));
  try {
    await promiseAll([delay(50, "slow"), fail(10, "network down")]);
  } catch (e) {
    console.log("rejected:", e.message);
  }
})();`,
      output: `[ 'a', 'b', 'c' ]
[]
rejected: network down`,
    },
    explanationBn: `**তিনটা চাবি:**

**১. Input-এর ক্রম রাখা:** promise গুলো যে ক্রমে **শেষ** হয় সেই ক্রমে push করলে ফল ভুল হবে ("c" আগে শেষ হয়)। তাই প্রতিটা ফল তার নিজের **index-এ** বসাই: \`results[index] = value\`।

**২. কখন শেষ:** \`results.length\` দিয়ে বোঝা যায় না (আগে থেকেই length দেওয়া)। তাই একটা আলাদা counter — কয়টা বাকি। শূন্য হলে \`resolve\`।

**৩. Fail-fast:** যেকোনো একটা reject হলেই সাথে সাথে বাইরের promise reject — তাই সরাসরি \`reject\`-কে error handler হিসেবে দিই। একবার settle হওয়ার পর আর resolve/reject করলে promise উপেক্ষা করে, তাই বাকিরা পরে শেষ হলেও সমস্যা নেই।

**Edge case:**
- **সাধারণ value:** \`Promise.resolve(item)\` সবকিছুকে promise বানায় — "b" সরাসরি কাজ করে।
- **খালি input:** কোনো item না থাকলে কোনো callback-ই চলবে না, ফলে promise চিরকাল pending থাকত! তাই শুরুতেই \`[]\` দিয়ে resolve।`,
  },
  {
    id: 'js-ex-sleep-retry',
    title: 'Sleep and retry with promises',
    level: 'intermediate',
    category: 'implementation',
    tags: ['promises', 'async-await', 'retry', 'backoff'],
    prompt: `Write:

- \`sleep(ms)\` — a promise that resolves after \`ms\` milliseconds.
- \`retry(fn, { retries, delay, factor = 2 })\` — calls the async function \`fn\`; on failure waits \`delay\` ms (multiplying the delay by \`factor\` each time — exponential backoff) and tries again, up to \`retries\` extra attempts. Resolve with the first success, or reject with the last error.`,
    examples: [
      { input: 'fn fails twice then succeeds; retries = 3', output: 'resolves after 3 attempts' },
      {
        input: 'fn always fails; retries = 2',
        output: 'rejects with the last error after 3 attempts',
      },
    ],
    hints: [
      '`sleep` is a one-liner around `setTimeout`.',
      'A `for` loop from 0 to `retries` with `try { return await fn() } catch { ... }` is clearer than recursion.',
      'Do not sleep after the final failed attempt.',
    ],
    solutions: [
      {
        label: 'Loop with await',
        code: `const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retry(fn, { retries, delay, factor = 2 }) {
  let wait = delay;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt + 1);
    } catch (error) {
      if (attempt === retries) throw error;
      console.log("attempt " + (attempt + 1) + " failed, retrying in " + wait + "ms");
      await sleep(wait);
      wait *= factor;
    }
  }
}`,
        complexity: { time: 'O(retries) attempts', space: 'O(1)' },
      },
      {
        label: 'Recursive',
        code: `const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function retry(fn, { retries, delay, factor = 2 }, attempt = 1) {
  return fn(attempt).catch(async (error) => {
    if (attempt > retries) throw error;
    console.log("attempt " + attempt + " failed, retrying in " + delay + "ms");
    await sleep(delay);
    return retry(fn, { retries, delay: delay * factor, factor }, attempt + 1);
  });
}`,
        complexity: { time: 'O(retries) attempts', space: 'O(retries) promise chain' },
      },
    ],
    sampleRun: {
      code: `(async () => {
  const flaky = async (attempt) => {
    if (attempt < 3) throw new Error("timeout on attempt " + attempt);
    return "data on attempt " + attempt;
  };
  console.log(await retry(flaky, { retries: 3, delay: 10 }));

  try {
    await retry(async () => { throw new Error("server down"); }, { retries: 1, delay: 10 });
  } catch (e) {
    console.log("gave up:", e.message);
  }
})();`,
      output: `attempt 1 failed, retrying in 10ms
attempt 2 failed, retrying in 20ms
data on attempt 3
attempt 1 failed, retrying in 10ms
gave up: server down`,
    },
    explanationBn: `**\`sleep\`:** \`setTimeout\`-কে promise-এ মোড়ানো — \`await sleep(1000)\` দিয়ে async function-এর ভেতরে থামা যায়, thread আটকে না।

**\`retry\` — loop version:** \`for\` loop-এ \`try { return await fn() }\` — সফল হলে সাথে সাথে \`return\`, loop শেষ। ব্যর্থ হলে \`catch\`-এ: শেষ চেষ্টা হলে error ছুড়ে দিই; না হলে অপেক্ষা করি আর delay দ্বিগুণ করি।

**Exponential backoff কেন?** Server overloaded থাকলে সবাই একই বিরতিতে বারবার চেষ্টা করলে চাপ আরও বাড়ে। প্রতিবার অপেক্ষা দ্বিগুণ (10 → 20 → 40ms) করলে server-কে সেরে ওঠার সময় দেওয়া হয়। Production-এ সাথে একটু random "jitter" যোগ করা হয়, যাতে হাজারো client একসাথে আবার চেষ্টা না করে।

**শেষ ব্যর্থতার পরে sleep না** — অযথা অপেক্ষা করে তারপর ব্যর্থতা জানানোর মানে নেই।

**Recursive version:** \`.catch\`-এর ভেতরে অপেক্ষা করে নিজেকেই আবার ডাকে, বাড়ানো delay আর attempt সংখ্যা দিয়ে। কাজ একই, তবে loop version পড়তে সহজ।`,
  },

  // ────────────────────────────── Advanced ──────────────────────────────
  {
    id: 'js-ex-event-emitter',
    title: 'Implement an event emitter',
    level: 'advanced',
    category: 'implementation',
    tags: ['events', 'observer-pattern', 'classes', 'map'],
    prompt: `Implement an \`EventEmitter\` class with:

- \`on(event, listener)\` — subscribe; returns an \`unsubscribe\` function,
- \`off(event, listener)\` — remove a listener,
- \`once(event, listener)\` — listen for one call only,
- \`emit(event, ...args)\` — call every listener in subscription order; return \`true\` if there were listeners.

A listener that removes itself (or another listener) during \`emit\` must not break the current emission.`,
    examples: [{ input: 'on("msg", fn); emit("msg", "hi")', output: 'fn("hi") is called' }],
    hints: [
      'Store listeners in a `Map` from event name to an array (or Set) of functions.',
      'In `emit`, iterate over a **copy** of the listener list so changes during emission are safe.',
      '`once`: wrap the listener in a function that unsubscribes itself before calling the original.',
    ],
    solutions: [
      {
        label: 'Map of arrays',
        code: `class EventEmitter {
  #listeners = new Map();

  on(event, listener) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    const list = this.#listeners.get(event);
    if (!list) return;
    const index = list.indexOf(listener);
    if (index !== -1) list.splice(index, 1);
    if (list.length === 0) this.#listeners.delete(event);
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }

  emit(event, ...args) {
    const list = this.#listeners.get(event);
    if (!list) return false;
    for (const listener of [...list]) listener(...args);   // copy: safe to unsubscribe while emitting
    return true;
  }
}`,
        complexity: { time: 'emit O(listeners), off O(listeners)', space: 'O(listeners)' },
      },
    ],
    sampleRun: {
      code: `const bus = new EventEmitter();
const log = (who) => (msg) => console.log(who, "got", msg);

const unsubscribeA = bus.on("chat", log("A"));
bus.on("chat", log("B"));
bus.once("chat", log("once"));

console.log(bus.emit("chat", "hello"));
unsubscribeA();
bus.emit("chat", "second");
console.log(bus.emit("nobody-listens"));

const selfRemoving = () => { console.log("self-removing ran"); bus.off("tick", selfRemoving); };
bus.on("tick", selfRemoving);
bus.on("tick", () => console.log("next listener still runs"));
bus.emit("tick");
bus.emit("tick");`,
      output: `A got hello
B got hello
once got hello
true
B got second
false
self-removing ran
next listener still runs
next listener still runs`,
    },
    explanationBn: `Event emitter হলো **observer pattern** — Node.js-এর \`EventEmitter\`, browser-এর event, Redux store — সবকিছুর ভিত্তি।

**গঠন:** \`Map\`-এ event-এর নাম → listener-দের array। \`#listeners\` private, তাই বাইরে থেকে কেউ সরাসরি বদলাতে পারে না।

**গুরুত্বপূর্ণ design সিদ্ধান্ত:**

1. **\`on\` একটা unsubscribe function ফেরত দেয়** — React-এর \`useEffect\` cleanup-এর মতো আধুনিক API-তে খুব সুবিধাজনক: \`const stop = bus.on(...); stop();\`।

2. **\`once\`:** আসল listener-কে একটা wrapper-এ মুড়ে দিই, যে প্রথমবার চলেই নিজেকে সরিয়ে ফেলে, তারপর আসলটা ডাকে।

3. **\`emit\`-এ list-এর copy-র ওপর loop — সবচেয়ে সূক্ষ্ম অংশ।** কোনো listener চলার সময় যদি নিজেকে (বা অন্যকে) সরিয়ে দেয় (\`once\` ঠিক এটাই করে), তাহলে মূল array থেকে element সরে যায়, আর loop পরের listener এড়িয়ে যায় — "array বদলানো অবস্থায় iterate করার" সেই পুরনো bug। Copy-র ওপর ঘুরলে চলমান emission নিরাপদ থাকে। Sample-এর "self-removing" অংশ এটাই প্রমাণ করে: পরের listener ঠিকই চলে।

4. খালি হয়ে গেলে event-এর entry মুছে দিই — অপ্রয়োজনীয় memory রাখি না।`,
  },
  {
    id: 'js-ex-lru-cache',
    title: 'Implement an LRU cache',
    level: 'advanced',
    category: 'implementation',
    tags: ['map', 'caching', 'classes', 'data-structures'],
    prompt: `Implement \`LRUCache\` with a fixed \`capacity\`:

- \`get(key)\` returns the value (or \`undefined\`) and marks the key as most recently used,
- \`put(key, value)\` inserts or updates; when the cache is full, it evicts the **least recently used** key first.

Both operations must be O(1).`,
    examples: [
      {
        input: 'capacity 2: put(a), put(b), get(a), put(c)',
        output: 'b is evicted (a was used more recently)',
      },
    ],
    hints: [
      'A `Map` iterates keys in insertion order — the first key is the oldest.',
      'To mark a key as recently used, delete it and set it again so it moves to the end.',
      '`map.keys().next().value` gives the oldest key in O(1).',
    ],
    solutions: [
      {
        label: 'Map insertion order',
        code: `class LRUCache {
  #map = new Map();

  constructor(capacity) {
    this.capacity = capacity;
  }

  get(key) {
    if (!this.#map.has(key)) return undefined;
    const value = this.#map.get(key);
    this.#map.delete(key);          // move to the "most recent" end
    this.#map.set(key, value);
    return value;
  }

  put(key, value) {
    this.#map.delete(key);
    this.#map.set(key, value);
    if (this.#map.size > this.capacity) {
      const oldest = this.#map.keys().next().value;
      this.#map.delete(oldest);
    }
  }

  keys() {
    return [...this.#map.keys()];
  }
}`,
        complexity: { time: 'O(1) per operation', space: 'O(capacity)' },
      },
    ],
    sampleRun: {
      code: `const cache = new LRUCache(2);
cache.put("a", 1);
cache.put("b", 2);
console.log(cache.get("a"));   // a becomes most recent
cache.put("c", 3);             // evicts b
console.log(cache.get("b"), cache.keys());
cache.put("a", 10);            // update moves a to the end
cache.put("d", 4);             // evicts c
console.log(cache.keys(), cache.get("a"));`,
      output: `1
undefined [ 'a', 'c' ]
[ 'a', 'd' ] 10`,
    },
    explanationBn: `**LRU (Least Recently Used):** cache ভরে গেলে সবচেয়ে বেশি সময় ধরে ব্যবহার না হওয়া item বাদ দাও। Browser cache, CDN, database buffer — সব জায়গায় এই নীতি।

ক্লাসিক সমাধান হলো hash map + doubly linked list। কিন্তু JavaScript-এ একটা চমৎকার শর্টকাট আছে: **\`Map\` insertion order মনে রাখে।** তাই:
- Map-এর **প্রথম** key = সবচেয়ে পুরনো (least recently used)।
- কোনো key ব্যবহার হলে \`delete\` করে আবার \`set\` — সেটা Map-এর **শেষে** চলে যায় (most recent)।
- ভরে গেলে \`keys().next().value\` দিয়ে প্রথম key পেয়ে মুছে ফেলি।

\`delete\`, \`set\`, \`has\` আর প্রথম key পাওয়া — সবই O(1), তাই পুরো cache O(1)।

Interview tip: এই Map-ভিত্তিক সমাধান দিয়ে শুরু করুন, তারপর বলুন অন্য ভাষায় (বা interviewer চাইলে) hash map + doubly linked list দিয়ে কীভাবে করতেন — linked list-এ node সরানো আর শেষে বসানো O(1), আর map node-টা সরাসরি খুঁজে দেয়।`,
  },
];

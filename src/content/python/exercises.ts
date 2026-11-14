import type { Exercise } from '../schema';

/**
 * Python coding-round exercises. `npm run verify:outputs` runs every solution followed by
 * the sample run and checks the output, so all approaches must define the same names.
 */
export const exercises: Exercise[] = [
  // ───────────────────────────── Foundation ─────────────────────────────
  {
    id: 'py-ex-reverse-string-number',
    title: 'Reverse a string and a number',
    level: 'foundation',
    category: 'strings',
    tags: ['strings', 'slicing', 'math'],
    prompt: `Write two functions:

- \`reverse_string(s)\` returns the characters of \`s\` in reverse order.
- \`reverse_number(n)\` reverses the digits of an integer and **keeps its sign** (\`-560\` → \`-65\`).

Solve it once with slicing, then again **without** slicing or \`str()\` for the number — interviewers usually ask for both.`,
    examples: [
      { input: 'reverse_string("hello")', output: '"olleh"' },
      { input: 'reverse_number(1234)', output: '4321' },
      { input: 'reverse_number(-560)', output: '-65', note: 'leading zeros disappear' },
    ],
    hints: [
      '`s[::-1]` walks the string backwards with a step of -1.',
      'For the number, handle the sign first: work with `abs(n)` and put the sign back at the end.',
      'Without strings: `n % 10` gives the last digit and `n // 10` drops it. Build the result with `result * 10 + digit`.',
    ],
    solutions: [
      {
        label: 'Slicing',
        code: `def reverse_string(s):
    return s[::-1]

def reverse_number(n):
    sign = -1 if n < 0 else 1
    return sign * int(str(abs(n))[::-1])`,
        complexity: { time: 'O(d)', space: 'O(d)' },
      },
      {
        label: 'Loop and arithmetic',
        code: `def reverse_string(s):
    result = ""
    for ch in s:
        result = ch + result
    return result

def reverse_number(n):
    sign = -1 if n < 0 else 1
    n = abs(n)
    result = 0
    while n:
        result = result * 10 + n % 10
        n //= 10
    return sign * result`,
        complexity: { time: 'O(d)', space: 'O(1) for the number' },
      },
    ],
    sampleRun: {
      code: `print(reverse_string("hello"))
print(reverse_number(1234), reverse_number(-560), reverse_number(0))`,
      output: `olleh
4321 -65 0`,
    },
    explanationBn: `**String:** \`s[::-1]\` মানে পুরো string, পেছন থেকে এক ঘর করে। Loop version-এ প্রতিটা character result-এর **সামনে** বসাই, তাই শেষ character সবার সামনে চলে আসে। (Loop-এ string জোড়া O(n²) হতে পারে — ছোট input-এ সমস্যা নেই, তবে interview-তে এটা উল্লেখ করা ভালো।)

**Number:** আগে চিহ্ন আলাদা করে রাখি, তারপর \`abs(n)\` নিয়ে কাজ করি। গণিতের কৌশল:
- \`n % 10\` → শেষ digit (1234 → 4)
- \`n // 10\` → শেষ digit বাদ (1234 → 123)
- \`result * 10 + digit\` → result-এর ডানে নতুন digit বসানো

1234 → 4 → 43 → 432 → 4321। শেষে চিহ্ন ফিরিয়ে দিই। -560-এর ক্ষেত্রে শুরুর শূন্য স্বাভাবিকভাবেই হারিয়ে যায় (0 → 6 → 65)।`,
  },
  {
    id: 'py-ex-palindrome',
    title: 'Valid palindrome',
    level: 'foundation',
    category: 'strings',
    tags: ['strings', 'two-pointers', 'slicing'],
    prompt: `Write a function \`is_palindrome(text)\` that returns \`True\` if \`text\` reads the same forwards and backwards.

Ignore letter case and every character that is not a letter or a digit. An empty string counts as a palindrome.`,
    examples: [
      { input: '"A man, a plan, a canal: Panama"', output: 'True' },
      { input: '"race a car"', output: 'False', note: '"raceacar" reversed is "racaecar"' },
      { input: '""', output: 'True' },
    ],
    constraints: ['0 ≤ len(text) ≤ 10⁵', 'text may contain any printable characters'],
    hints: [
      'First decide what counts: `str.isalnum()` tells you whether a character is a letter or a digit.',
      'If you build a cleaned, lower-cased copy, a palindrome is simply equal to its own reverse (`[::-1]`).',
      'To avoid the extra copy, walk two indexes inward from both ends and skip characters that do not count.',
    ],
    solutions: [
      {
        label: 'Clean + reverse',
        code: `def is_palindrome(text: str) -> bool:
    cleaned = [ch.lower() for ch in text if ch.isalnum()]
    return cleaned == cleaned[::-1]`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Two pointers',
        code: `def is_palindrome(text: str) -> bool:
    left, right = 0, len(text) - 1
    while left < right:
        if not text[left].isalnum():
            left += 1
        elif not text[right].isalnum():
            right -= 1
        elif text[left].lower() != text[right].lower():
            return False
        else:
            left += 1
            right -= 1
    return True`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `print(is_palindrome("A man, a plan, a canal: Panama"))
print(is_palindrome("race a car"))
print(is_palindrome(""))`,
      output: `True
False
True`,
    },
    explanationBn: `Palindrome মানে সামনে থেকে আর পেছন থেকে পড়লে একই। এখানে আসল কাজ দুইটা: (১) কোন character গুলো গোনায় ধরব সেটা ঠিক করা, (২) দুই দিক থেকে মিলিয়ে দেখা।

**প্রথম approach**-এ আমরা শুধু letter আর digit গুলো lowercase করে একটা list-এ নিই, তারপর \`cleaned[::-1]\` দিয়ে উল্টো করে তুলনা করি। পড়তে সহজ, interview-তে প্রথমে এটাই বলা ভালো — তবে বাড়তি O(n) memory লাগে।

**Two pointers approach**-এ কোনো copy বানাই না। \`left\` শুরু থেকে আর \`right\` শেষ থেকে ভেতরের দিকে আসে; যে character গোনায় ধরা হয় না সেটা টপকে যায়, আর দুই পাশের character না মিললেই \`False\`। দুটো pointer মাঝখানে মিলে গেলে string-টা palindrome। Interviewer যখন জিজ্ঞেস করে "extra space ছাড়া পারবেন?" — এটাই সেই উত্তর।`,
  },
  {
    id: 'py-ex-anagram',
    title: 'Check if two strings are anagrams',
    level: 'foundation',
    category: 'hashing',
    tags: ['strings', 'counter', 'sorting', 'hashing'],
    prompt: `Write \`is_anagram(a, b)\` that returns \`True\` when \`b\` is a rearrangement of the letters of \`a\`.

Ignore case and spaces.`,
    examples: [
      { input: '"Listen", "Silent"', output: 'True' },
      { input: '"Dormitory", "Dirty room"', output: 'True' },
      { input: '"hello", "world"', output: 'False' },
    ],
    hints: [
      'Normalise both strings first: lower-case and remove spaces.',
      'Two anagrams contain exactly the same letters the same number of times.',
      'Sorting both strings works in O(n log n); counting letters with a dict or `Counter` is O(n).',
    ],
    solutions: [
      {
        label: 'Sort',
        code: `def is_anagram(a, b):
    clean = lambda s: s.replace(" ", "").lower()
    return sorted(clean(a)) == sorted(clean(b))`,
        complexity: { time: 'O(n log n)', space: 'O(n)' },
      },
      {
        label: 'Counter',
        code: `from collections import Counter

def is_anagram(a, b):
    clean = lambda s: s.replace(" ", "").lower()
    return Counter(clean(a)) == Counter(clean(b))`,
        complexity: { time: 'O(n)', space: 'O(k) distinct letters' },
      },
      {
        label: 'Manual counting',
        code: `def is_anagram(a, b):
    a = a.replace(" ", "").lower()
    b = b.replace(" ", "").lower()
    if len(a) != len(b):
        return False
    counts = {}
    for ch in a:
        counts[ch] = counts.get(ch, 0) + 1
    for ch in b:
        if counts.get(ch, 0) == 0:
            return False
        counts[ch] -= 1
    return True`,
        complexity: { time: 'O(n)', space: 'O(k)' },
      },
    ],
    sampleRun: {
      code: `print(is_anagram("Listen", "Silent"))
print(is_anagram("Dormitory", "Dirty room"))
print(is_anagram("hello", "world"))`,
      output: `True
True
False`,
    },
    explanationBn: `দুটো শব্দ anagram হবে যদি একই অক্ষর **একই সংখ্যায়** থাকে — শুধু ক্রম আলাদা।

**Sort:** দুটোকে sort করলে একই অক্ষরের সমষ্টি হলে একই sequence পাওয়া যায়। সহজ, কিন্তু sorting-এর জন্য O(n log n)।

**Counter / manual count:** প্রতিটা অক্ষর কতবার আছে গুনে তুলনা করি — O(n)। Manual version-এ প্রথম শব্দের অক্ষর গুনে রাখি, তারপর দ্বিতীয় শব্দের প্রতিটা অক্ষরে count কমাই; কোনো অক্ষর না পেলে বা শূন্যে নেমে গেলে সাথে সাথে \`False\`। শুরুতে দৈর্ঘ্য না মিললে কাজই করতে হয় না — ছোট একটা optimization।

Interview-তে প্রথমে sort-এর উত্তর দিন, তারপর "O(n)-এ করতে পারি" বলে counting দেখান।`,
  },
  {
    id: 'py-ex-vowel-count',
    title: 'Count the vowels in a string',
    level: 'foundation',
    category: 'strings',
    tags: ['strings', 'sets', 'generators'],
    prompt: `Write \`count_vowels(text)\` that returns how many vowels (\`a e i o u\`, any case) the text contains.`,
    examples: [
      { input: '"Programming in Python"', output: '5' },
      { input: '"rhythm"', output: '0' },
      { input: '"AEIOU"', output: '5' },
    ],
    hints: [
      'Lower-case the text once so you only compare against lowercase vowels.',
      'Membership in a set (`ch in "aeiou"` or `in {"a", ...}`) is the check you need for each character.',
      '`sum(1 for ch in text if ...)` counts matches without building a list.',
    ],
    solutions: [
      {
        label: 'Generator + sum',
        code: `VOWELS = set("aeiou")

def count_vowels(text):
    return sum(1 for ch in text.lower() if ch in VOWELS)`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
      {
        label: 'Explicit loop',
        code: `def count_vowels(text):
    count = 0
    for ch in text.lower():
        if ch in "aeiou":
            count += 1
    return count`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `print(count_vowels("Programming in Python"))
print(count_vowels("rhythm"), count_vowels("AEIOU"), count_vowels(""))`,
      output: `5
0 5 0`,
    },
    explanationBn: `কাজটা সহজ, কিন্তু interviewer দেখতে চান code কতটা পরিষ্কার আর Pythonic।

একবার \`lower()\` করে নিলে শুধু ছোট হাতের vowel-এর সাথে মেলাতে হয়। প্রতিটা character-এর জন্য "এটা কি vowel?" — এটা একটা membership check, তাই set বা ছোট string-এ \`in\` ব্যবহার করি।

\`sum(1 for ch in ... if ...)\` একটা generator expression — প্রতিটা vowel-এর জন্য 1 দেয়, আর \`sum\` সেগুলো যোগ করে। কোনো অস্থায়ী list তৈরি হয় না, তাই memory O(1)।

Follow-up হিসেবে প্রায়ই আসে: "প্রতিটা vowel আলাদাভাবে কতবার আছে?" — তখন \`Counter(ch for ch in text.lower() if ch in VOWELS)\`।`,
  },
  {
    id: 'py-ex-char-word-frequency',
    title: 'Character and word frequency',
    level: 'foundation',
    category: 'hashing',
    tags: ['dict', 'counter', 'strings', 'regex'],
    prompt: `Write two functions that return a **dict** of counts, in order of first appearance:

- \`char_frequency(text)\` — how many times each character appears.
- \`word_frequency(text)\` — how many times each word appears, case-insensitive, ignoring punctuation.

Solve it with a plain dict first, then with \`collections.Counter\`.`,
    examples: [
      { input: 'char_frequency("banana")', output: "{'b': 1, 'a': 3, 'n': 2}" },
      {
        input: 'word_frequency("The cat and the hat. The end!")',
        output: "{'the': 3, 'cat': 1, 'and': 1, 'hat': 1, 'end': 1}",
      },
    ],
    hints: [
      '`counts[key] = counts.get(key, 0) + 1` increments a count whether or not the key exists yet.',
      'For words, lower-case first, then extract words with `re.findall(r"[a-z\']+", text)` so punctuation is dropped.',
      '`Counter(iterable)` does the counting in one call; wrap it in `dict()` to return a plain dict.',
    ],
    solutions: [
      {
        label: 'Plain dict',
        code: `import re

def char_frequency(text):
    counts = {}
    for ch in text:
        counts[ch] = counts.get(ch, 0) + 1
    return counts

def word_frequency(text):
    counts = {}
    for word in re.findall(r"[a-z']+", text.lower()):
        counts[word] = counts.get(word, 0) + 1
    return counts`,
        complexity: { time: 'O(n)', space: 'O(k) distinct keys' },
      },
      {
        label: 'Counter',
        code: `import re
from collections import Counter

def char_frequency(text):
    return dict(Counter(text))

def word_frequency(text):
    return dict(Counter(re.findall(r"[a-z']+", text.lower())))`,
        complexity: { time: 'O(n)', space: 'O(k)' },
      },
    ],
    sampleRun: {
      code: `print(char_frequency("banana"))
freq = word_frequency("The cat and the hat. The end!")
print(freq)
print(max(freq, key=freq.get))`,
      output: `{'b': 1, 'a': 3, 'n': 2}
{'the': 3, 'cat': 1, 'and': 1, 'hat': 1, 'end': 1}
the`,
    },
    explanationBn: `Frequency count প্রায় সব interview-তে কোনো না কোনো রূপে আসে — anagram, প্রথম non-repeating character, top-k word।

**Plain dict:** \`counts.get(key, 0) + 1\` — key না থাকলে \`0\` ধরে নিয়ে 1 যোগ করে। আলাদা করে \`if key in counts\` লিখতে হয় না।

**Word-এর ক্ষেত্রে:** প্রথমে সব lowercase, যাতে "The" আর "the" একই শব্দ হয়। তারপর \`re.findall(r"[a-z']+", ...)\` শুধু অক্ষরের টানা অংশগুলো তুলে আনে — ফলে "hat." থেকে "hat", "end!" থেকে "end"। Apostrophe রাখা হয়েছে যাতে "don't" ভেঙে না যায়।

**Counter:** একই কাজ এক লাইনে। Counter নিজেও dict-এর subclass এবং প্রথম দেখার ক্রম রাখে; আমরা \`dict()\` দিয়ে সাধারণ dict-এ রূপান্তর করি।

সবচেয়ে বেশিবার আসা word পেতে \`max(freq, key=freq.get)\`, বা Counter-এ \`most_common(1)\`।`,
  },
  {
    id: 'py-ex-fizzbuzz',
    title: 'FizzBuzz',
    level: 'foundation',
    category: 'logic',
    tags: ['loops', 'modulo', 'conditionals'],
    prompt: `Write \`fizzbuzz(n)\` that returns a list for the numbers 1 to \`n\`:

- \`"Fizz"\` for multiples of 3,
- \`"Buzz"\` for multiples of 5,
- \`"FizzBuzz"\` for multiples of both,
- the number itself otherwise.`,
    examples: [{ input: 'fizzbuzz(5)', output: "[1, 2, 'Fizz', 4, 'Buzz']" }],
    hints: [
      'Check divisibility with `%`.',
      'Order matters: test "divisible by both" before testing 3 or 5 alone — or check `% 15` first.',
      'An alternative avoids the combined check: build the string from parts and fall back to the number when it is empty.',
    ],
    solutions: [
      {
        label: 'if / elif',
        code: `def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(i)
    return result`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'String building',
        code: `def fizzbuzz(n):
    return [("Fizz" * (i % 3 == 0) + "Buzz" * (i % 5 == 0)) or i
            for i in range(1, n + 1)]`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `print(fizzbuzz(15))`,
      output: `[1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz']`,
    },
    explanationBn: `FizzBuzz সহজ, কিন্তু একটা ক্লাসিক ভুল ধরার জন্য দেওয়া হয়: **শর্তের ক্রম**। প্রথমে \`% 3\` চেক করলে 15 পায় "Fizz", কখনো "FizzBuzz" পায় না। তাই "দুটো দিয়েই বিভাজ্য" (\`% 15\`) সবার আগে চেক করতে হয়।

দ্বিতীয় solution একটা সুন্দর Python কৌশল দেখায়:
- \`"Fizz" * True\` = \`"Fizz"\`, আর \`"Fizz" * False\` = \`""\` (bool হলো int!)।
- দুটো অংশ জোড়া দিলে 15-এর জন্য "FizzBuzz" নিজে থেকেই তৈরি হয় — combined check লাগে না।
- \`"" or i\` → খালি string falsy, তাই সংখ্যাটা ফেরত আসে।

নতুন নিয়ম যোগ করা সহজ হয় এই design-এ (যেমন 7-এর জন্য "Bazz") — interviewer এটা পছন্দ করেন।`,
  },
  {
    id: 'py-ex-prime-sieve',
    title: 'Prime check and Sieve of Eratosthenes',
    level: 'foundation',
    category: 'logic',
    tags: ['math', 'primes', 'sieve'],
    prompt: `Write two functions:

- \`is_prime(n)\` — \`True\` if \`n\` is a prime number.
- \`primes_up_to(n)\` — a list of all primes \`≤ n\`.

Make \`is_prime\` faster than checking every number below \`n\`, and use the Sieve of Eratosthenes for \`primes_up_to\`.`,
    examples: [
      { input: 'is_prime(97)', output: 'True' },
      { input: 'is_prime(1)', output: 'False', note: '0 and 1 are not prime' },
      { input: 'primes_up_to(10)', output: '[2, 3, 5, 7]' },
    ],
    hints: [
      'A divisor larger than √n would pair with one smaller than √n, so you only need to test up to √n.',
      'After handling 2, you can skip all even numbers.',
      'Sieve: assume every number is prime, then for each prime p cross out p², p² + p, p² + 2p, …',
    ],
    solutions: [
      {
        label: 'Trial division + sieve',
        code: `import math

def is_prime(n):
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    for d in range(3, math.isqrt(n) + 1, 2):
        if n % d == 0:
            return False
    return True

def primes_up_to(n):
    if n < 2:
        return []
    is_p = [True] * (n + 1)
    is_p[0] = is_p[1] = False
    for p in range(2, math.isqrt(n) + 1):
        if is_p[p]:
            for multiple in range(p * p, n + 1, p):
                is_p[multiple] = False
    return [i for i, prime in enumerate(is_p) if prime]`,
        complexity: { time: 'is_prime O(√n), sieve O(n log log n)', space: 'sieve O(n)' },
      },
      {
        label: 'Sieve with slice assignment',
        code: `import math

def is_prime(n):
    return n >= 2 and all(n % d for d in range(2, math.isqrt(n) + 1))

def primes_up_to(n):
    if n < 2:
        return []
    sieve = bytearray([1]) * (n + 1)
    sieve[0:2] = b"\\x00\\x00"
    for p in range(2, math.isqrt(n) + 1):
        if sieve[p]:
            sieve[p * p::p] = bytes(len(range(p * p, n + 1, p)))
    return [i for i in range(n + 1) if sieve[i]]`,
        complexity: { time: 'O(n log log n)', space: 'O(n) bytes' },
      },
    ],
    sampleRun: {
      code: `print([n for n in range(20) if is_prime(n)])
print(primes_up_to(30))
print(is_prime(97), is_prime(1), is_prime(2))`,
      output: `[2, 3, 5, 7, 11, 13, 17, 19]
[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
True False True`,
    },
    explanationBn: `**\`is_prime\` — √n পর্যন্ত কেন যথেষ্ট?** যদি \`n = a × b\` হয়, তাহলে \`a\` আর \`b\`-এর মধ্যে একটা অবশ্যই √n-এর সমান বা ছোট। তাই √n পর্যন্ত কোনো ভাজক না পেলে, এর ওপরেও পাওয়া যাবে না। 2-এর পরে জোড় সংখ্যা বাদ দিলে কাজ আরও অর্ধেক হয়। \`math.isqrt\` integer square root দেয় — float-এর rounding সমস্যা ছাড়াই।

**Sieve of Eratosthenes:** অনেকগুলো prime একসাথে দরকার হলে প্রতিটা আলাদাভাবে চেক করার চেয়ে অনেক দ্রুত। ধারণাটা: প্রথমে সবাইকে prime ধরে নিই। তারপর ছোট থেকে প্রতিটা prime \`p\`-এর জন্য তার সব গুণিতক কেটে দিই। \`p²\` থেকে কেন শুরু? কারণ \`p\`-এর ছোট গুণিতকগুলো (\`2p\`, \`3p\`…) আগেই ছোট prime-রা কেটে ফেলেছে।

দ্বিতীয় solution-এ slice assignment দিয়ে এক লাইনে সব গুণিতক কেটে দেওয়া হয় — Python-এ loop-এর চেয়ে অনেক দ্রুত।`,
  },
  {
    id: 'py-ex-factorial',
    title: 'Factorial',
    level: 'foundation',
    category: 'recursion',
    tags: ['recursion', 'loops', 'math'],
    prompt: `Write \`factorial(n)\` that returns \`n!\` (\`n × (n-1) × … × 1\`, with \`0! = 1\`).

Raise \`ValueError("n must be >= 0")\` for negative input. Write an iterative and a recursive version.`,
    examples: [
      { input: 'factorial(5)', output: '120' },
      { input: 'factorial(0)', output: '1' },
      { input: 'factorial(-1)', output: 'ValueError: n must be >= 0' },
    ],
    hints: [
      'The base case is `n == 0` (or `n <= 1`), returning `1`.',
      'Recursive step: `n * factorial(n - 1)`.',
      'Iterative: multiply a running product by every number from 2 to n.',
    ],
    solutions: [
      {
        label: 'Iterative',
        code: `def factorial(n):
    if n < 0:
        raise ValueError("n must be >= 0")
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
      {
        label: 'Recursive',
        code: `def factorial(n):
    if n < 0:
        raise ValueError("n must be >= 0")
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
        complexity: { time: 'O(n)', space: 'O(n) call stack' },
      },
      {
        label: 'Standard library',
        code: `import math

def factorial(n):
    if n < 0:
        raise ValueError("n must be >= 0")
    return math.prod(range(1, n + 1))`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `print(factorial(0), factorial(5), factorial(10))
try:
    factorial(-1)
except ValueError as e:
    print("ValueError:", e)`,
      output: `1 120 3628800
ValueError: n must be >= 0`,
    },
    explanationBn: `Factorial recursion শেখানোর সবচেয়ে প্রচলিত উদাহরণ।

**Recursion-এর দুটো অংশ:**
1. **Base case** — কখন থামবে: \`n <= 1\` হলে 1।
2. **Recursive step** — সমস্যাটাকে ছোট করা: \`n! = n × (n-1)!\`।

\`factorial(3)\` → \`3 * factorial(2)\` → \`3 * 2 * factorial(1)\` → \`3 * 2 * 1\` = 6।

**Recursive version-এর সীমাবদ্ধতা:** প্রতিটা call stack-এ একটা frame যোগ করে। Python-এর default recursion limit প্রায় ১০০০, তাই \`factorial(5000)\` লিখলে \`RecursionError\`। Python tail-call optimization করে না। তাই production-এ iterative version বা \`math.factorial\` ভালো।

Python-এর int যত খুশি বড় হতে পারে, তাই বড় factorial-এও overflow হয় না — অন্য language-এ এটা একটা আলাদা সমস্যা।`,
  },
  {
    id: 'py-ex-find-duplicates',
    title: 'Find duplicates in a list',
    level: 'foundation',
    category: 'hashing',
    tags: ['sets', 'counter', 'hashing'],
    prompt: `Write \`find_duplicates(items)\` that returns every value appearing more than once, **each listed once**, in the order the values first appeared.`,
    examples: [
      { input: '[3, 1, 3, 2, 1, 3, 5]', output: '[3, 1]' },
      { input: '["a", "b"]', output: '[]' },
    ],
    hints: [
      'A set remembers what you have already seen in O(1) per lookup.',
      'You need a second container for values already reported, so a value seen three times is not reported twice.',
      "`Counter(items)` gives every value's count in first-appearance order.",
    ],
    solutions: [
      {
        label: 'Seen set',
        code: `def find_duplicates(items):
    seen, dupes = set(), {}
    for item in items:
        if item in seen:
            dupes[item] = None        # dict keeps insertion order
        seen.add(item)
    return list(dupes)`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Counter',
        code: `from collections import Counter

def find_duplicates(items):
    return [item for item, count in Counter(items).items() if count > 1]`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `print(find_duplicates([3, 1, 3, 2, 1, 3, 5]))
print(find_duplicates(["a", "b"]))`,
      output: `[3, 1]
[]`,
    },
    explanationBn: `সহজ কিন্তু ধীর উপায় হলো প্রতিটা item-এর জন্য \`items.count(x)\` — সেটা O(n²)। Interview-তে লক্ষ্য হলো O(n)।

**Seen set approach:** list একবার ঘুরি। প্রতিটা item আগে দেখেছি কি না set-এ দেখি (O(1))। আগে দেখে থাকলে সেটা duplicate। Duplicate রাখার জন্য set না রেখে dict ব্যবহার করেছি, কারণ dict ক্রম মনে রাখে — তাই ফলাফল আসে যে ক্রমে duplicate পাওয়া গেছে। একই value তিনবার এলেও dict-এ একবারই থাকে।

**Counter approach:** আগে সবকিছু গুনে নিই, তারপর যাদের count 1-এর বেশি তাদের রাখি। Counter প্রথম দেখার ক্রম রাখে, তাই output-ও প্রথম দেখার ক্রমে।

দুটোতেই item গুলো hashable হতে হবে।`,
  },
  {
    id: 'py-ex-second-largest',
    title: 'Second largest number',
    level: 'foundation',
    category: 'arrays',
    tags: ['arrays', 'single-pass', 'edge-cases'],
    prompt: `Write \`second_largest(nums)\` that returns the second largest **distinct** value, or \`None\` if there is none.`,
    examples: [
      { input: '[10, 5, 20, 20, 8]', output: '10', note: 'duplicates of the maximum do not count' },
      { input: '[7, 7]', output: 'None' },
      { input: '[-3, -1, -2]', output: '-2' },
    ],
    constraints: ['Do it in a single pass for the optimal answer.'],
    hints: [
      'Edge cases first: empty list, one element, all elements equal, negative numbers.',
      'Keep two variables, `first` and `second`, starting at `None` (not `0`, which breaks negatives).',
      'When a number beats `first`, the old `first` becomes `second`. Skip numbers equal to `first`.',
    ],
    solutions: [
      {
        label: 'Single pass',
        code: `def second_largest(nums):
    first = second = None
    for n in nums:
        if first is None or n > first:
            first, second = n, first
        elif n != first and (second is None or n > second):
            second = n
    return second`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
      {
        label: 'Set + sort',
        code: `def second_largest(nums):
    distinct = sorted(set(nums))
    return distinct[-2] if len(distinct) >= 2 else None`,
        complexity: { time: 'O(n log n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `print(second_largest([10, 5, 20, 20, 8]))
print(second_largest([7, 7]), second_largest([]))
print(second_largest([-3, -1, -2]))`,
      output: `10
None None
-2`,
    },
    explanationBn: `এই প্রশ্নের আসল পরীক্ষা হলো **edge case** সামলানো:
- সর্বোচ্চ সংখ্যা একাধিকবার থাকলে (\`[20, 20]\`) — দ্বিতীয় বৃহত্তম 20 না।
- সব সংখ্যা সমান হলে বা একটাই সংখ্যা থাকলে — উত্তর নেই, \`None\`।
- সব সংখ্যা negative হলে — শুরুর মান \`0\` ধরলে ভুল উত্তর আসবে, তাই \`None\` দিয়ে শুরু।

**Single pass:** দুটো variable রাখি। নতুন সংখ্যা \`first\`-এর চেয়ে বড় হলে পুরনো \`first\` নেমে \`second\` হয়। \`first\`-এর সমান হলে উপেক্ষা করি (distinct চাই)। নইলে \`second\`-এর চেয়ে বড় হলে \`second\` আপডেট। একবারেই O(n)।

**Set + sort:** পড়তে সহজ, কিন্তু O(n log n)। Interview-তে আগে এটা বলে তারপর single pass-এ উন্নত করা ভালো কৌশল।`,
  },
  {
    id: 'py-ex-two-sum',
    title: 'Two Sum',
    level: 'foundation',
    category: 'hashing',
    tags: ['hash-map', 'arrays', 'classic'],
    prompt: `Given a list \`nums\` and a \`target\`, return the indices \`[i, j]\` (\`i < j\`) of two numbers that add up to \`target\`, or \`None\` if no pair exists. Each element can be used at most once.`,
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
      { input: 'nums = [1, 2], target = 7', output: 'None' },
    ],
    hints: [
      'The brute-force answer checks every pair — O(n²).',
      'For each number `x`, the partner you need is `target - x`.',
      'Store each number\'s index in a dict as you go; then "have I seen the partner?" is an O(1) lookup.',
    ],
    solutions: [
      {
        label: 'Brute force',
        code: `def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return None`,
        complexity: { time: 'O(n²)', space: 'O(1)' },
      },
      {
        label: 'Hash map (one pass)',
        code: `def two_sum(nums, target):
    index_of = {}
    for i, x in enumerate(nums):
        partner = target - x
        if partner in index_of:
            return [index_of[partner], i]
        index_of[x] = i
    return None`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `print(two_sum([2, 7, 11, 15], 9))
print(two_sum([3, 2, 4], 6))
print(two_sum([1, 2], 7))`,
      output: `[0, 1]
[1, 2]
None`,
    },
    explanationBn: `Two Sum সম্ভবত সবচেয়ে বেশি জিজ্ঞেস করা coding প্রশ্ন, কারণ এটা দেখায় আপনি hash map দিয়ে O(n²)-কে O(n)-এ নামাতে পারেন কি না।

**Brute force:** সব জুটি পরীক্ষা করি — দুটো nested loop, O(n²)। সঠিক, কিন্তু বড় input-এ ধীর।

**Hash map:** প্রতিটা সংখ্যা \`x\`-এর জন্য প্রশ্ন একটাই: "আমার জুটি \`target - x\` কি আগে দেখেছি?" আগে দেখা সংখ্যা আর তাদের index একটা dict-এ রাখলে এই প্রশ্নের উত্তর O(1)-এ পাওয়া যায়। তাই পুরো list একবার ঘুরলেই হয়।

একটা সূক্ষ্ম বিষয়: dict-এ বর্তমান সংখ্যা যোগ করি জুটি খোঁজার **পরে**। তাহলে একই element দুবার ব্যবহার হয় না — যেমন \`[3, 2, 4]\`, target 6-এ প্রথম 3 নিজেকে জুটি হিসেবে পাবে না।`,
  },
  {
    id: 'py-ex-merge-sort-dicts',
    title: 'Merge two dicts and sort by value',
    level: 'foundation',
    category: 'hashing',
    tags: ['dict', 'sorting', 'counter', 'merge'],
    prompt: `Two shops report fruit sales as dicts. Write \`merge_counts(a, b)\` that returns one dict where values for the same key are **added**, sorted by value (highest first), ties broken alphabetically by key.

Also show the built-in merge \`a | b\` and explain how it differs.`,
    examples: [
      {
        input: 'a = {"apple": 3, "pear": 1}, b = {"apple": 2, "kiwi": 4, "pear": 1}',
        output: "{'apple': 5, 'kiwi': 4, 'pear': 2}",
      },
    ],
    hints: [
      'Start with a copy of `a`, then add each value of `b` with `.get(key, 0)`.',
      'Sort `.items()` with a key that sorts by value descending and key ascending: `lambda kv: (-kv[1], kv[0])`.',
      '`dict(sorted_pairs)` keeps the sorted order because dicts preserve insertion order.',
    ],
    solutions: [
      {
        label: 'Manual merge',
        code: `def merge_counts(a, b):
    merged = dict(a)
    for key, value in b.items():
        merged[key] = merged.get(key, 0) + value
    return dict(sorted(merged.items(), key=lambda kv: (-kv[1], kv[0])))`,
        complexity: { time: 'O((n + m) log(n + m))', space: 'O(n + m)' },
      },
      {
        label: 'Counter',
        code: `from collections import Counter

def merge_counts(a, b):
    total = Counter(a) + Counter(b)
    return dict(sorted(total.items(), key=lambda kv: (-kv[1], kv[0])))`,
        complexity: { time: 'O((n + m) log(n + m))', space: 'O(n + m)' },
      },
    ],
    sampleRun: {
      code: `a = {"apple": 3, "pear": 1}
b = {"apple": 2, "kiwi": 4, "pear": 1}
print(merge_counts(a, b))
print(a | b)          # plain merge: the right side wins, nothing is added`,
      output: `{'apple': 5, 'kiwi': 4, 'pear': 2}
{'apple': 2, 'pear': 1, 'kiwi': 4}`,
    },
    explanationBn: `দুই ধরনের "merge" আলাদা করে বোঝা জরুরি:
- **\`a | b\`** — একই key থাকলে ডান পাশের value **প্রতিস্থাপন** করে। যোগ হয় না।
- **এই সমস্যায় চাই যোগফল** — তাই নিজে merge করতে হয়।

**Manual:** \`a\`-এর একটা copy নিই (যাতে মূলটা না বদলায়), তারপর \`b\`-এর প্রতিটা key-র value \`.get(key, 0)\` দিয়ে যোগ করি।

**Counter:** দুটো Counter-এ \`+\` করলে একই key-র value যোগ হয়ে যায় — এক লাইনে কাজ। (খেয়াল রাখবেন, Counter-এর \`+\` শূন্য বা negative ফলাফল বাদ দেয়।)

**Sort:** \`key=lambda kv: (-kv[1], kv[0])\` — tuple দিয়ে দুই স্তরের sort। প্রথমে value-এর negative (তাই বড় value আগে), সমান হলে key অনুযায়ী বর্ণানুক্রমে। Sorted pair গুলো \`dict()\`-এ দিলে ক্রম ঠিক থাকে, কারণ dict insertion order রাখে।`,
  },
  {
    id: 'py-ex-binary-search',
    title: 'Binary search',
    level: 'foundation',
    category: 'arrays',
    tags: ['binary-search', 'divide-and-conquer', 'bisect'],
    prompt: `Write \`binary_search(nums, target)\` for a **sorted** list. Return the index of \`target\`, or \`-1\` if it is absent.

Write an iterative version, then a recursive one, then use the standard library.`,
    examples: [
      { input: 'nums = [1, 3, 5, 7, 9, 11], target = 7', output: '3' },
      { input: 'target = 4', output: '-1' },
    ],
    constraints: ['Required: O(log n) time.'],
    hints: [
      'Keep a search window `low..high` and look at the middle element.',
      'If the middle is too small, the answer must be to the right: `low = mid + 1`; if too big, `high = mid - 1`.',
      'Stop when `low > high` — the window is empty. `bisect.bisect_left` finds the insertion point for you.',
    ],
    solutions: [
      {
        label: 'Iterative',
        code: `def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
        complexity: { time: 'O(log n)', space: 'O(1)' },
      },
      {
        label: 'Recursive',
        code: `def binary_search(nums, target, low=0, high=None):
    if high is None:
        high = len(nums) - 1
    if low > high:
        return -1
    mid = (low + high) // 2
    if nums[mid] == target:
        return mid
    if nums[mid] < target:
        return binary_search(nums, target, mid + 1, high)
    return binary_search(nums, target, low, mid - 1)`,
        complexity: { time: 'O(log n)', space: 'O(log n) call stack' },
      },
      {
        label: 'bisect',
        code: `from bisect import bisect_left

def binary_search(nums, target):
    i = bisect_left(nums, target)
    return i if i < len(nums) and nums[i] == target else -1`,
        complexity: { time: 'O(log n)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `nums = [1, 3, 5, 7, 9, 11]
print(binary_search(nums, 7), binary_search(nums, 1), binary_search(nums, 11))
print(binary_search(nums, 4), binary_search([], 5))`,
      output: `3 0 5
-1 -1`,
    },
    explanationBn: `Binary search কাজ করে শুধু **sorted** data-য়। প্রতিটা ধাপে খোঁজার এলাকা অর্ধেক হয়ে যায়: মাঝের element দেখি — target বড় হলে বাঁ অর্ধেক বাদ, ছোট হলে ডান অর্ধেক বাদ। ১০ লাখ element-এ মাত্র ~২০ ধাপ — O(log n)।

Analogy: অভিধানে শব্দ খোঁজা। প্রথম পাতা থেকে একটা একটা করে পড়েন না — মাঝখানে খুলে দেখেন, তারপর আগে না পরে যাবেন ঠিক করেন।

**সাধারণ ভুল:**
- \`while low < high\` লেখা (\`<=\` হতে হবে) — তাহলে এক element-এর window পরীক্ষা হয় না।
- \`low = mid\` লেখা (\`mid + 1\` হতে হবে) — infinite loop হতে পারে।

**bisect:** Python-এর standard library-তে binary search তৈরি আছে। \`bisect_left\` বলে target কোন index-এ বসানো যায়; সেখানে সত্যিই target আছে কি না চেক করলেই উত্তর।`,
  },
  {
    id: 'py-ex-stack-queue',
    title: 'Implement a stack and a queue',
    level: 'foundation',
    category: 'implementation',
    tags: ['stack', 'queue', 'deque', 'oop', 'data-structures'],
    prompt: `Implement two classes:

- \`Stack\` (LIFO) with \`push\`, \`pop\`, \`peek\`, \`is_empty\` and \`len()\` support. \`pop\`/\`peek\` on an empty stack raise \`IndexError("pop from empty stack")\` / \`IndexError("peek from empty stack")\`.
- \`Queue\` (FIFO) with \`enqueue\`, \`dequeue\` and \`len()\` support. \`dequeue\` on an empty queue raises \`IndexError("dequeue from empty queue")\`.

All operations should be O(1) (amortized). Bonus: build the queue from two stacks.`,
    examples: [
      { input: 'push 1, 2, 3 → pop()', output: '3' },
      { input: 'enqueue a, b, c → dequeue()', output: "'a'" },
    ],
    hints: [
      'A list is a good stack: `append` and `pop()` both work at the end in O(1).',
      'A list is a poor queue — `pop(0)` is O(n). Use `collections.deque` and `popleft()`.',
      'Two-stack queue: push into an "in" stack; when the "out" stack is empty, move everything across, which reverses the order.',
    ],
    solutions: [
      {
        label: 'list + deque',
        code: `from collections import deque

class Stack:
    def __init__(self):
        self._items = []
    def push(self, item):
        self._items.append(item)
    def pop(self):
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()
    def peek(self):
        if not self._items:
            raise IndexError("peek from empty stack")
        return self._items[-1]
    def is_empty(self):
        return not self._items
    def __len__(self):
        return len(self._items)

class Queue:
    def __init__(self):
        self._items = deque()
    def enqueue(self, item):
        self._items.append(item)
    def dequeue(self):
        if not self._items:
            raise IndexError("dequeue from empty queue")
        return self._items.popleft()
    def __len__(self):
        return len(self._items)`,
        complexity: { time: 'O(1) per operation', space: 'O(n)' },
      },
      {
        label: 'Queue from two stacks',
        code: `class Stack:
    def __init__(self):
        self._items = []
    def push(self, item):
        self._items.append(item)
    def pop(self):
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()
    def peek(self):
        if not self._items:
            raise IndexError("peek from empty stack")
        return self._items[-1]
    def is_empty(self):
        return not self._items
    def __len__(self):
        return len(self._items)

class Queue:
    def __init__(self):
        self._in, self._out = Stack(), Stack()
    def enqueue(self, item):
        self._in.push(item)
    def dequeue(self):
        if self._out.is_empty():
            while not self._in.is_empty():     # reverse the order once
                self._out.push(self._in.pop())
        if self._out.is_empty():
            raise IndexError("dequeue from empty queue")
        return self._out.pop()
    def __len__(self):
        return len(self._in) + len(self._out)`,
        complexity: { time: 'O(1) amortized', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `s = Stack()
for x in (1, 2, 3):
    s.push(x)
print(s.pop(), s.peek(), len(s), s.is_empty())

q = Queue()
for x in "abc":
    q.enqueue(x)
print(q.dequeue(), q.dequeue(), len(q))

try:
    Stack().pop()
except IndexError as e:
    print("IndexError:", e)`,
      output: `3 2 2 False
a b 1
IndexError: pop from empty stack`,
    },
    explanationBn: `**Stack (LIFO — শেষে ঢুকলে আগে বের হয়):** থালার স্তূপের মতো। Python list এর জন্য একদম মানানসই — \`append\` আর \`pop()\` দুটোই শেষ প্রান্তে কাজ করে, O(1)।

**Queue (FIFO — আগে ঢুকলে আগে বের হয়):** লাইনে দাঁড়ানোর মতো। List দিয়ে করলে \`pop(0)\` লাগে, যেটা O(n) — কারণ বাকি সবাইকে এক ঘর সরাতে হয়। তাই \`deque\`-এর \`popleft()\`, যেটা O(1)।

**Bonus — দুটো stack দিয়ে queue:** একটা classic interview প্রশ্ন। নতুন item যায় "in" stack-এ। বের করার সময় "out" stack খালি থাকলে "in"-এর সব item একটা একটা করে "out"-এ সরাই — এতে ক্রম উল্টে যায়, ফলে সবচেয়ে পুরনো item উপরে চলে আসে। প্রতিটা item জীবনে মাত্র একবার সরানো হয়, তাই গড়ে প্রতিটা operation O(1) (amortized)।

Empty অবস্থায় স্পষ্ট message সহ \`IndexError\` দেওয়া ভালো API design — caller বুঝতে পারে কী ভুল হয়েছে।`,
  },

  // ──────────────────────────── Intermediate ────────────────────────────
  {
    id: 'py-ex-fibonacci',
    title: 'Fibonacci: iterative, recursive, memoized and generator',
    level: 'intermediate',
    category: 'recursion',
    tags: ['recursion', 'memoization', 'generators', 'dynamic-programming'],
    prompt: `Write \`fib(n)\` returning the n-th Fibonacci number (\`fib(0) = 0\`, \`fib(1) = 1\`, \`fib(n) = fib(n-1) + fib(n-2)\`).

Implement it four ways and be ready to compare them: iterative, naive recursive, memoized recursive, and with an infinite generator.`,
    examples: [
      { input: '[fib(i) for i in range(10)]', output: '[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]' },
      { input: 'fib(30)', output: '832040' },
    ],
    hints: [
      'Iterative: keep only the last two values, `a, b = b, a + b`.',
      'Naive recursion recomputes the same values exponentially many times — draw the call tree for fib(5).',
      'Memoize with `functools.lru_cache` (or a dict) so each `fib(k)` is computed once.',
      'A generator can yield Fibonacci numbers forever; `itertools.islice` picks the n-th.',
    ],
    solutions: [
      {
        label: 'Iterative',
        code: `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
      {
        label: 'Naive recursive',
        code: `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`,
        complexity: { time: 'O(2ⁿ)', space: 'O(n) call stack' },
      },
      {
        label: 'Memoized',
        code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Generator',
        code: `from itertools import islice

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

def fib(n):
    return next(islice(fibonacci(), n, None))`,
        complexity: { time: 'O(n)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `print([fib(i) for i in range(10)])
print(fib(30))`,
      output: `[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
832040`,
    },
    explanationBn: `একই সমস্যার চারটা সমাধান — interview-তে তুলনা করাটাই আসল পরীক্ষা।

**১. Iterative:** শুধু শেষ দুটো সংখ্যা মনে রাখি। \`a, b = b, a + b\` — tuple unpacking দিয়ে একসাথে আপডেট, temporary variable লাগে না। O(n) সময়, O(1) memory — সবচেয়ে বাস্তবসম্মত।

**২. Naive recursive:** সংজ্ঞাটা হুবহু code-এ। কিন্তু ভয়ংকর ধীর — \`fib(5)\` ডাকে \`fib(4)\` আর \`fib(3)\`, আবার \`fib(4)\` ডাকে \`fib(3)\` — একই হিসাব বারবার। Call-এর সংখ্যা প্রায় দ্বিগুণ হয় প্রতি ধাপে: O(2ⁿ)। \`fib(40)\` চালাতে কয়েক মিনিট লাগে।

**৩. Memoized:** একই recursive code, কিন্তু \`@lru_cache\` প্রতিটা ফলাফল মনে রাখে। প্রতিটা \`fib(k)\` একবারই হিসাব হয় → O(n)। এটাই **dynamic programming**-এর মূল ধারণা: overlapping subproblem-এর উত্তর জমিয়ে রাখা।

**৪. Generator:** অসীম Fibonacci sequence, দরকার মতো একটা একটা করে। \`islice\` দিয়ে n-তম টা নেওয়া হয়। পুরো sequence-এর ওপর loop চালাতে চাইলে এটাই সবচেয়ে সুন্দর।`,
  },
  {
    id: 'py-ex-flatten-nested',
    title: 'Flatten an arbitrarily nested list',
    level: 'intermediate',
    category: 'recursion',
    tags: ['recursion', 'generators', 'stack', 'yield-from'],
    prompt: `Write \`flatten(items)\` that turns a list nested to **any depth** into a flat list, keeping the order.

Write a recursive version, a generator version with \`yield from\`, and an iterative version that does not use recursion.`,
    examples: [{ input: '[1, [2, [3, [4, []]], 5], [[6]]]', output: '[1, 2, 3, 4, 5, 6]' }],
    hints: [
      'For each item: if it is a list, flatten it too; otherwise keep it.',
      '`yield from flatten(item)` passes every value from the recursive call straight through.',
      'Iterative: keep a stack of iterators; when you meet a nested list, push its iterator and continue with it.',
    ],
    solutions: [
      {
        label: 'Recursive',
        code: `def flatten(items):
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result`,
        complexity: { time: 'O(n)', space: 'O(depth) call stack' },
      },
      {
        label: 'Generator',
        code: `def _walk(items):
    for item in items:
        if isinstance(item, list):
            yield from _walk(item)
        else:
            yield item

def flatten(items):
    return list(_walk(items))`,
        complexity: { time: 'O(n)', space: 'O(depth)' },
      },
      {
        label: 'Iterative (stack of iterators)',
        code: `def flatten(items):
    result = []
    stack = [iter(items)]
    while stack:
        for item in stack[-1]:
            if isinstance(item, list):
                stack.append(iter(item))   # descend, keep our place in the parent
                break
            result.append(item)
        else:
            stack.pop()                    # this level is finished
    return result`,
        complexity: { time: 'O(n)', space: 'O(depth)' },
      },
    ],
    sampleRun: {
      code: `print(flatten([1, [2, [3, [4, []]], 5], [[6]]]))
print(flatten([]), flatten([[[]]]))`,
      output: `[1, 2, 3, 4, 5, 6]
[] []`,
    },
    explanationBn: `এক স্তরের flatten-এর জন্য comprehension যথেষ্ট, কিন্তু **যেকোনো গভীরতার** nesting-এর জন্য recursion লাগে — কারণ আগে থেকে জানা নেই কত স্তর আছে।

**Recursive:** প্রতিটা item দেখি — list হলে সেটাকেও flatten করি (নিজেকেই ডেকে), না হলে result-এ রাখি। Base case লুকানো আছে: list-এ আর কোনো nested list না থাকলে recursion থেমে যায়।

**Generator + \`yield from\`:** একই logic, কিন্তু result list না বানিয়ে value গুলো একটা একটা করে yield করে। \`yield from\` ভেতরের recursive call-এর সব value সরাসরি বাইরে পাঠায়। বড় data-য় memory বাঁচে।

**Iterative:** Recursion-এর সীমা (~১০০০ স্তর) এড়াতে চাইলে। Call stack-এর কাজটা আমরা নিজে একটা list দিয়ে করি — প্রতিটা স্তরের একটা iterator রাখি। Nested list পেলে তার iterator stack-এ ঢোকাই; কোনো স্তর শেষ হলে (\`for...else\`) সেটা বের করে দিই। Iterator ব্যবহারের কারণে parent list-এ কোথায় ছিলাম তা হারায় না, তাই ক্রম ঠিক থাকে।`,
  },
  {
    id: 'py-ex-matrix-transpose-rotate',
    title: 'Transpose and rotate a matrix',
    level: 'intermediate',
    category: 'arrays',
    tags: ['matrix', 'zip', '2d-arrays'],
    prompt: `Write two functions for a matrix given as a list of rows:

- \`transpose(m)\` — rows become columns.
- \`rotate_clockwise(m)\` — rotate 90° clockwise.

Both must work for non-square matrices and return new lists (do not modify the input).`,
    examples: [
      { input: 'transpose([[1, 2, 3], [4, 5, 6]])', output: '[[1, 4], [2, 5], [3, 6]]' },
      { input: 'rotate_clockwise([[1, 2], [3, 4]])', output: '[[3, 1], [4, 2]]' },
    ],
    hints: [
      'Transpose: element `m[r][c]` moves to `result[c][r]`.',
      '`zip(*m)` groups the first items of every row, then the second items, and so on — that is a transpose.',
      'Rotating clockwise = reverse the order of the rows, then transpose.',
    ],
    solutions: [
      {
        label: 'zip',
        code: `def transpose(m):
    return [list(col) for col in zip(*m)]

def rotate_clockwise(m):
    return [list(col) for col in zip(*m[::-1])]`,
        complexity: { time: 'O(r × c)', space: 'O(r × c)' },
      },
      {
        label: 'Index loops',
        code: `def transpose(m):
    rows, cols = len(m), len(m[0]) if m else 0
    return [[m[r][c] for r in range(rows)] for c in range(cols)]

def rotate_clockwise(m):
    rows, cols = len(m), len(m[0]) if m else 0
    return [[m[rows - 1 - r][c] for r in range(rows)] for c in range(cols)]`,
        complexity: { time: 'O(r × c)', space: 'O(r × c)' },
      },
    ],
    sampleRun: {
      code: `m = [[1, 2, 3], [4, 5, 6]]
print(transpose(m))
print(rotate_clockwise([[1, 2], [3, 4]]))
print(rotate_clockwise(m))
print(m)                     # the input is unchanged`,
      output: `[[1, 4], [2, 5], [3, 6]]
[[3, 1], [4, 2]]
[[4, 1], [5, 2], [6, 3]]
[[1, 2, 3], [4, 5, 6]]`,
    },
    explanationBn: `**Transpose:** row আর column অদলবদল — \`m[r][c]\` চলে যায় \`result[c][r]\`-এ।

\`zip(*m)\` একটা চমৎকার Python কৌশল। \`*m\` matrix-এর প্রতিটা row-কে আলাদা argument হিসেবে \`zip\`-এ পাঠায়: \`zip([1,2,3], [4,5,6])\`। \`zip\` প্রতিটা row থেকে প্রথম element নিয়ে \`(1, 4)\`, তারপর দ্বিতীয়গুলো নিয়ে \`(2, 5)\` বানায় — এগুলোই নতুন row।

**Clockwise rotation:** একটা সুন্দর পর্যবেক্ষণ — 90° ঘোরানো মানে **row গুলোর ক্রম উল্টে তারপর transpose**। \`[[1,2],[3,4]]\` → উল্টালে \`[[3,4],[1,2]]\` → transpose \`[[3,1],[4,2]]\`।

Loop version-এ সূত্রটা সরাসরি লেখা: নতুন matrix-এর \`[c][r]\` ঘরে বসে \`m[rows-1-r][c]\`। Non-square matrix-এ নতুন matrix-এর আকার উল্টে যায় (2×3 → 3×2) — অনেকে এখানে ভুল করেন।

Follow-up প্রায়ই আসে: "in-place করুন (square matrix-এ)" — তখন transpose করে প্রতিটা row উল্টাতে হয়।`,
  },
  {
    id: 'py-ex-sorting',
    title: 'Implement bubble sort and merge sort',
    level: 'intermediate',
    category: 'arrays',
    tags: ['sorting', 'divide-and-conquer', 'recursion', 'algorithms'],
    prompt: `Write \`sort_numbers(nums)\` that returns a **new** sorted list, without using \`sort\` or \`sorted\`.

Implement it twice: bubble sort (with an early exit when nothing was swapped) and merge sort. Be ready to compare their complexity.`,
    examples: [
      { input: '[5, 2, 9, 1, 5, 6]', output: '[1, 2, 5, 5, 6, 9]' },
      { input: '[]', output: '[]' },
    ],
    hints: [
      'Bubble sort: repeatedly swap neighbours that are out of order; after each pass the largest remaining value is in place.',
      'If a whole pass makes no swaps, the list is sorted — stop early.',
      'Merge sort: split in half, sort each half recursively, then merge two sorted lists with two pointers.',
    ],
    solutions: [
      {
        label: 'Bubble sort',
        code: `def sort_numbers(nums):
    items = list(nums)
    n = len(items)
    for end in range(n - 1, 0, -1):
        swapped = False
        for i in range(end):
            if items[i] > items[i + 1]:
                items[i], items[i + 1] = items[i + 1], items[i]
                swapped = True
        if not swapped:                 # already sorted
            break
    return items`,
        complexity: { time: 'O(n²), O(n) if already sorted', space: 'O(n) for the copy' },
      },
      {
        label: 'Merge sort',
        code: `def sort_numbers(nums):
    if len(nums) <= 1:
        return list(nums)
    mid = len(nums) // 2
    left, right = sort_numbers(nums[:mid]), sort_numbers(nums[mid:])
    merged, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:         # <= keeps the sort stable
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged`,
        complexity: { time: 'O(n log n)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `print(sort_numbers([5, 2, 9, 1, 5, 6]))
print(sort_numbers([]), sort_numbers([3, -1]))
data = [3, 2, 1]
print(sort_numbers(data), data)`,
      output: `[1, 2, 5, 5, 6, 9]
[] [-1, 3]
[1, 2, 3] [3, 2, 1]`,
    },
    explanationBn: `**Bubble sort:** পাশাপাশি দুটো element তুলনা করে, ভুল ক্রমে থাকলে swap। প্রতিটা pass-এর শেষে সবচেয়ে বড় element "বুদবুদের মতো" শেষে উঠে যায়। দুটো nested loop → O(n²)। Optimization: কোনো pass-এ একটাও swap না হলে list ইতিমধ্যে sorted — থেমে যাই। তাই আগে থেকে sorted list-এ O(n)। শেখার জন্য ভালো, বাস্তবে প্রায় অব্যবহৃত।

**Merge sort:** "Divide and conquer"।
1. List-কে দুই ভাগ করি।
2. প্রতিটা ভাগ recursively sort করি (এক element-এর list তো এমনিতেই sorted — base case)।
3. দুটো sorted list **merge** করি: দুই list-এর শুরুতে দুটো pointer, যেটা ছোট সেটা নিই আর সেই pointer এগোই।

প্রতি স্তরে মোট n কাজ, আর স্তর log n টা → O(n log n)। \`<=\` ব্যবহার করায় সমান element-এর ক্রম ঠিক থাকে (stable sort)।

Python-এর নিজের \`sorted()\` Timsort ব্যবহার করে — merge sort আর insertion sort-এর মিশ্রণ।`,
  },
  {
    id: 'py-ex-balanced-brackets',
    title: 'Balanced parentheses',
    level: 'intermediate',
    category: 'implementation',
    tags: ['stack', 'strings', 'parsing'],
    prompt: `Write \`is_balanced(text)\` that returns \`True\` if every \`(\`, \`[\` and \`{\` is closed by the matching bracket in the correct order. Other characters are ignored.`,
    examples: [
      { input: '"{[()()]}"', output: 'True' },
      { input: '"([)]"', output: 'False', note: 'closed in the wrong order' },
      { input: '"(("', output: 'False', note: 'never closed' },
      { input: '"a(b)c"', output: 'True' },
    ],
    hints: [
      'The most recently opened bracket must be closed first — that is LIFO, so use a stack.',
      'Push opening brackets; on a closing bracket, the top of the stack must be its matching opener.',
      'At the end, the stack must be empty.',
    ],
    solutions: [
      {
        label: 'Stack',
        code: `PAIRS = {")": "(", "]": "[", "}": "{"}

def is_balanced(text):
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in PAIRS:
            if not stack or stack.pop() != PAIRS[ch]:
                return False
    return not stack`,
        complexity: { time: 'O(n)', space: 'O(n)' },
      },
      {
        label: 'Remove pairs (simple, slower)',
        code: `def is_balanced(text):
    s = "".join(ch for ch in text if ch in "()[]{}")
    while True:
        shorter = s.replace("()", "").replace("[]", "").replace("{}", "")
        if shorter == s:
            return s == ""
        s = shorter`,
        complexity: { time: 'O(n²)', space: 'O(n)' },
      },
    ],
    sampleRun: {
      code: `for text in ["{[()()]}", "([)]", "((", "", "a(b)c", "}"]:
    print(repr(text), is_balanced(text))`,
      output: `'{[()()]}' True
'([)]' False
'((' False
'' True
'a(b)c' True
'}' False`,
    },
    explanationBn: `Bracket মেলানোর নিয়ম: **সবচেয়ে শেষে খোলা bracket সবার আগে বন্ধ হতে হবে।** "শেষে ঢুকলে আগে বের হয়" — এটাই stack (LIFO)।

**Stack approach:**
- খোলা bracket পেলে stack-এ রাখি।
- বন্ধ bracket পেলে stack-এর উপরেরটা বের করে দেখি — সেটা কি এর জোড়া? না হলে (বা stack খালি থাকলে) → \`False\`।
- শেষে stack খালি থাকতে হবে — না থাকলে কিছু bracket কখনো বন্ধ হয়নি।

\`"([)]"\`-এ দেখুন: \`(\` আর \`[\` stack-এ, তারপর \`)\` আসে কিন্তু উপরে আছে \`[\` — না মেলায় \`False\`। শুধু সংখ্যা গুনলে (তিন ধরনের bracket-ই দুটো করে) এই ভুল ধরা পড়ত না — এজন্যই stack লাগে।

**Remove pairs:** বারবার \`()\`, \`[]\`, \`{}\` মুছতে থাকি যতক্ষণ কিছু মোছা যায়। শেষে খালি হলে balanced। বোঝা সহজ, কিন্তু O(n²) — stack version-টাই interview-এর প্রত্যাশিত উত্তর।`,
  },
  {
    id: 'py-ex-group-anagrams',
    title: 'Group anagrams',
    level: 'intermediate',
    category: 'hashing',
    tags: ['hash-map', 'strings', 'defaultdict', 'sorting'],
    prompt: `Write \`group_anagrams(words)\` that groups words that are anagrams of each other. Return a list of groups; keep groups in the order their first word appears, and words in their original order.`,
    examples: [
      {
        input: '["eat", "tea", "tan", "ate", "nat", "bat"]',
        output: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]",
      },
    ],
    hints: [
      'Anagrams share a "signature" — something identical for every word in the group.',
      'Sorting the letters gives such a signature: `"".join(sorted(word))` → `"aet"` for eat/tea/ate.',
      'Use the signature as a dict key and append each word to its group (`defaultdict(list)`).',
      'O(k) signature: a tuple of 26 letter counts instead of sorting.',
    ],
    solutions: [
      {
        label: 'Sorted-letters key',
        code: `from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        groups["".join(sorted(word))].append(word)
    return list(groups.values())`,
        complexity: { time: 'O(n · k log k)', space: 'O(n · k)' },
      },
      {
        label: 'Letter-count key',
        code: `def group_anagrams(words):
    groups = {}
    for word in words:
        counts = [0] * 26
        for ch in word:
            counts[ord(ch) - ord("a")] += 1
        groups.setdefault(tuple(counts), []).append(word)
    return list(groups.values())`,
        complexity: { time: 'O(n · k)', space: 'O(n · k)' },
      },
    ],
    sampleRun: {
      code: `print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
print(group_anagrams([]))`,
      output: `[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
[]`,
    },
    explanationBn: `মূল ধারণা: প্রতিটা anagram group-এর একটা **"signature"** খুঁজে বের করা — এমন কিছু যেটা group-এর সব শব্দের জন্য একই, আর অন্য group-এর জন্য আলাদা। তারপর signature-কে dict-এর key বানিয়ে শব্দগুলো জমা করা।

**Signature ১ — sorted letters:** "eat", "tea", "ate" — তিনটাকেই sort করলে "aet"। k অক্ষরের শব্দ sort করতে O(k log k)।

**Signature ২ — letter count:** ২৬টা অক্ষরের প্রতিটা কতবার আছে তার একটা tuple। Anagram-দের count হুবহু এক। Sort লাগে না, তাই O(k)। List-কে key বানানো যায় না (unhashable), তাই \`tuple\`-এ রূপান্তর করতে হয় — interview-তে এটা উল্লেখ করা ভালো।

\`defaultdict(list)\` বা \`setdefault\` — দুটোই "key না থাকলে খালি list বানাও" কাজটা করে। Dict insertion order রাখে বলে group গুলো প্রথম শব্দের ক্রমে আসে।`,
  },
  {
    id: 'py-ex-timing-decorator',
    title: 'Write a timing decorator',
    level: 'intermediate',
    category: 'language-feature',
    tags: ['decorators', 'functools', 'timing'],
    prompt: `Write a decorator \`@timed\` that:

- works with any function signature,
- prints \`"<function name> took <seconds>s"\` with one decimal place after every call (even if the call raises),
- returns the wrapped function's result unchanged,
- preserves the function's name and docstring.`,
    examples: [{ input: '@timed on a function that sleeps 0.2s', output: 'slow_square took 0.2s' }],
    hints: [
      'Use `time.perf_counter()` — it is the right clock for measuring durations.',
      'Accept `*args, **kwargs` in the wrapper and pass them straight through.',
      'Print in a `finally` block so failures are timed too, and decorate the wrapper with `functools.wraps`.',
    ],
    solutions: [
      {
        label: 'Function decorator',
        code: `import functools
import time

def timed(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__} took {time.perf_counter() - start:.1f}s")
    return wrapper`,
        complexity: { time: 'O(1) overhead', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `@timed
def slow_square(x):
    """Square a number, slowly."""
    time.sleep(0.2)
    return x * x

print(slow_square(7))
print(slow_square.__name__, "-", slow_square.__doc__)`,
      output: `slow_square took 0.2s
49
slow_square - Square a number, slowly.`,
    },
    explanationBn: `এই exercise-এ decorator লেখার সব নিয়ম একসাথে পরীক্ষা হয়:

1. **\`*args, **kwargs\`** — যেকোনো function-এ বসানো যাবে।
2. **Return value ফেরত দেওয়া** — \`return fn(...)\` না লিখলে decorated function সবসময় \`None\` দেবে।
3. **\`functools.wraps\`** — নইলে \`slow_square.__name__\` হয়ে যাবে "wrapper"।
4. **\`try/finally\`** — function exception raise করলেও সময় print হবে। লক্ষ্য করুন \`try\`-এর ভেতরে \`return\` থাকলেও \`finally\` চলে — আর return value ঠিকই caller-এর কাছে যায়।

**\`perf_counter\` কেন, \`time.time\` কেন না?** \`time.time()\` system clock — কেউ ঘড়ি বদলালে বা NTP sync হলে লাফ দিতে পারে। \`perf_counter()\` শুধু সময়ের ব্যবধান মাপার জন্য তৈরি, সবচেয়ে সূক্ষ্ম আর কখনো পেছনে যায় না।

Follow-up: "decorator-টা যেন print না করে logger-এ লেখে, আর threshold-এর বেশি হলে শুধু তখন" — তখন decorator factory (\`@timed(threshold=1.0)\`) লাগবে।`,
  },
  {
    id: 'py-ex-retry-decorator',
    title: 'Write a retry decorator',
    level: 'intermediate',
    category: 'language-feature',
    tags: ['decorators', 'decorator-factory', 'exceptions', 'resilience'],
    prompt: `Write a decorator factory \`retry(times, exceptions=(Exception,), delay=0)\`:

- Call the function; if it raises one of \`exceptions\`, print \`"attempt N failed: <error>"\`, wait \`delay\` seconds and try again.
- After \`times\` failed attempts, re-raise the **last** exception.
- Exceptions not listed must propagate immediately, without retrying.
- Return the function's result as soon as an attempt succeeds.`,
    examples: [
      {
        input: 'a function that fails twice, then succeeds; times=3',
        output: 'two "failed" lines, then the result',
      },
    ],
    hints: [
      'Three layers: `retry(...)` returns `decorator(fn)`, which returns `wrapper(*args, **kwargs)`.',
      'Loop over `range(1, times + 1)` and `return` from inside the `try` on success.',
      'Only catch `exceptions`; after the loop, `raise` the exception you saved.',
    ],
    solutions: [
      {
        label: 'Decorator factory',
        code: `import functools
import time

def retry(times, exceptions=(Exception,), delay=0):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except exceptions as e:
                    last_error = e
                    print(f"attempt {attempt} failed: {e}")
                    if attempt < times:
                        time.sleep(delay)
            raise last_error
        return wrapper
    return decorator`,
        complexity: { time: 'O(times) calls', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `calls = {"n": 0}

@retry(times=3, exceptions=(ConnectionError,))
def fetch():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("timeout")
    return "data"

print(fetch())

@retry(times=2, exceptions=(ConnectionError,))
def always_down():
    raise ConnectionError("server down")

try:
    always_down()
except ConnectionError as e:
    print("gave up:", e)

@retry(times=5, exceptions=(ConnectionError,))
def bug():
    raise ValueError("not retried")

try:
    bug()
except ValueError as e:
    print("ValueError:", e)`,
      output: `attempt 1 failed: timeout
attempt 2 failed: timeout
data
attempt 1 failed: server down
attempt 2 failed: server down
gave up: server down
ValueError: not retried`,
    },
    explanationBn: `Argument নেওয়া decorator মানে **তিন স্তর**:
1. \`retry(times=3)\` — setting নেয়, decorator ফেরত দেয়।
2. \`decorator(fn)\` — function নেয়, wrapper ফেরত দেয়।
3. \`wrapper(*args, **kwargs)\` — আসল call-এ চলে।

Wrapper-এর logic:
- Loop-এ চেষ্টা করি। সফল হলে \`try\`-এর ভেতর থেকেই সাথে সাথে \`return\` — বাকি চেষ্টা হয় না।
- **শুধু নির্দিষ্ট exception ধরি।** এটা খুব গুরুত্বপূর্ণ: network error (\`ConnectionError\`) আবার চেষ্টা করলে ঠিক হতে পারে, কিন্তু programming bug (\`ValueError\`, \`TypeError\`) হাজারবার চেষ্টা করলেও একই থাকবে — সেগুলো সাথে সাথে বাইরে যাওয়া উচিত।
- সব চেষ্টা ব্যর্থ হলে শেষ exception আবার raise করি, যাতে caller আসল কারণ জানতে পারে।

বাস্তবে delay প্রতিবার দ্বিগুণ করা হয় (exponential backoff) আর একটু random যোগ করা হয় (jitter), যাতে হাজারো client একসাথে আবার চেষ্টা করে server-কে চাপে না ফেলে।`,
  },
  {
    id: 'py-ex-custom-range',
    title: 'Write your own `range` as a generator',
    level: 'intermediate',
    category: 'language-feature',
    tags: ['generators', 'iterators', 'yield'],
    prompt: `Write \`my_range(start, stop=None, step=1)\` that behaves like the built-in \`range\` when iterated:

- one argument means \`0..start\`,
- negative steps count down,
- \`step=0\` raises \`ValueError("step must not be zero")\`.

Write it as a generator function, then as a class that implements the iterator protocol.`,
    examples: [
      { input: 'list(my_range(5))', output: '[0, 1, 2, 3, 4]' },
      { input: 'list(my_range(5, 0, -2))', output: '[5, 3, 1]' },
    ],
    hints: [
      'If `stop` is `None`, the single argument was really the stop: `start, stop = 0, start`.',
      'For a positive step keep going while `current < stop`; for a negative step while `current > stop`.',
      'A class version needs `__iter__` returning an object with `__next__` that raises `StopIteration`.',
    ],
    solutions: [
      {
        label: 'Generator function',
        code: `def my_range(start, stop=None, step=1):
    if stop is None:
        start, stop = 0, start
    if step == 0:
        raise ValueError("step must not be zero")
    current = start
    while (step > 0 and current < stop) or (step < 0 and current > stop):
        yield current
        current += step`,
        complexity: { time: 'O(1) per item', space: 'O(1)' },
      },
      {
        label: 'Iterator class',
        code: `class _RangeIterator:
    def __init__(self, start, stop, step):
        self.current, self.stop, self.step = start, stop, step
    def __iter__(self):
        return self
    def __next__(self):
        done = self.current >= self.stop if self.step > 0 else self.current <= self.stop
        if done:
            raise StopIteration
        value = self.current
        self.current += self.step
        return value

class my_range:
    def __init__(self, start, stop=None, step=1):
        if stop is None:
            start, stop = 0, start
        if step == 0:
            raise ValueError("step must not be zero")
        self.start, self.stop, self.step = start, stop, step
    def __iter__(self):                  # a fresh iterator each time: reusable
        return _RangeIterator(self.start, self.stop, self.step)`,
        complexity: { time: 'O(1) per item', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `print(list(my_range(5)))
print(list(my_range(2, 10, 3)))
print(list(my_range(5, 0, -2)))
print(list(my_range(3, 3)))
try:
    list(my_range(1, 5, 0))
except ValueError as e:
    print("ValueError:", e)`,
      output: `[0, 1, 2, 3, 4]
[2, 5, 8]
[5, 3, 1]
[]
ValueError: step must not be zero`,
    },
    explanationBn: `**Generator version:** \`yield\` দিয়ে একটা একটা সংখ্যা দিই, পুরো list কখনো বানাই না — তাই \`my_range(10**9)\`-ও memory-তে প্রায় কিছুই নেয় না। Loop-এর শর্তটা step-এর চিহ্নের ওপর নির্ভর করে: বাড়তে থাকলে \`< stop\`, কমতে থাকলে \`> stop\`।

একটা সূক্ষ্ম বিষয়: generator function-এ \`ValueError\` raise হয় প্রথম \`next()\`-এ, \`my_range(1, 5, 0)\` call করার মুহূর্তে না — কারণ call করলে body চলেই না। আসল \`range\` সাথে সাথে error দেয়।

**Class version:** দুটো class কেন? \`my_range\` হলো **iterable** — প্রতিবার \`__iter__\` ডাকলে নতুন একটা **iterator** (\`_RangeIterator\`) বানায়। তাই একই object-এর ওপর বারবার loop চালানো যায়, ঠিক আসল \`range\`-এর মতো। Iterator নিজে state রাখে (\`current\`), আর শেষে \`StopIteration\` raise করে \`for\` loop-কে থামতে বলে। এখানে validation constructor-এ, তাই error সাথে সাথে আসে।

এই পার্থক্যটা (iterable বনাম iterator, generator-এর lazy start) interview-তে বললে খুব ভালো লাগে।`,
  },
  {
    id: 'py-ex-context-manager',
    title: 'Write a context manager that temporarily changes a value',
    level: 'intermediate',
    category: 'language-feature',
    tags: ['context-managers', 'contextlib', 'with', 'testing'],
    prompt: `Write \`temporarily(obj, attr, value)\`, a context manager that sets \`obj.attr = value\` inside a \`with\` block and **always** restores the original value afterwards — even if the block raises.

Write it as a class (\`__enter__\`/\`__exit__\`) and with \`@contextmanager\`. (This is a tiny version of \`unittest.mock.patch.object\`.)`,
    examples: [
      {
        input: 'with temporarily(Config, "debug", True): ...',
        output: 'Config.debug is True inside, False after',
      },
    ],
    hints: [
      'Save the old value with `getattr` before changing it.',
      'Restore it in `__exit__`, which always runs — return `False` (or nothing) so exceptions are not swallowed.',
      'With `@contextmanager`, put the restore in a `finally` after the `yield`.',
    ],
    solutions: [
      {
        label: 'Class-based',
        code: `class temporarily:
    def __init__(self, obj, attr, value):
        self.obj, self.attr, self.value = obj, attr, value

    def __enter__(self):
        self.old = getattr(self.obj, self.attr)
        setattr(self.obj, self.attr, self.value)
        return self.obj

    def __exit__(self, exc_type, exc, tb):
        setattr(self.obj, self.attr, self.old)
        return False                          # never suppress errors`,
        complexity: { time: 'O(1)', space: 'O(1)' },
      },
      {
        label: '@contextmanager',
        code: `from contextlib import contextmanager

@contextmanager
def temporarily(obj, attr, value):
    old = getattr(obj, attr)
    setattr(obj, attr, value)
    try:
        yield obj
    finally:
        setattr(obj, attr, old)              # runs even if the block raised`,
        complexity: { time: 'O(1)', space: 'O(1)' },
      },
    ],
    sampleRun: {
      code: `class Config:
    debug = False

with temporarily(Config, "debug", True):
    print("inside:", Config.debug)
print("after:", Config.debug)

try:
    with temporarily(Config, "debug", True):
        raise RuntimeError("boom")
except RuntimeError as e:
    print(f"{e} -> restored: {Config.debug}")`,
      output: `inside: True
after: False
boom -> restored: False`,
    },
    explanationBn: `Context manager-এর মূল প্রতিশ্রুতি: **setup-এর পর cleanup অবশ্যই হবে।** এখানে setup = নতুন value বসানো, cleanup = পুরনো value ফিরিয়ে দেওয়া।

**Class version:**
- \`__enter__\`-এ পুরনো value \`getattr\` দিয়ে রেখে দিই, তারপর নতুন value বসাই।
- \`__exit__\` সবসময় চলে — block সফল হোক বা exception হোক। এখানে পুরনো value ফেরত দিই।
- \`return False\` — exception হলে সেটা গিলে ফেলি না, caller-এর কাছে যেতে দিই। এটা ভুলে \`True\` দিলে bug লুকিয়ে যেত।

**\`@contextmanager\` version:** \`yield\`-এর আগে setup, পরে cleanup। কিন্তু খেয়াল করুন cleanup **\`finally\`-এর ভেতরে** — এটা না দিলে block-এ exception হলে \`yield\`-এর পরের code চলবেই না, আর value চিরকাল বদলে থাকবে। এটা খুব সাধারণ ভুল।

বাস্তব ব্যবহার: test-এ কোনো setting অস্থায়ীভাবে বদলানো, যাতে এক test অন্য test-কে প্রভাবিত না করে।`,
  },

  // ────────────────────────────── Advanced ──────────────────────────────
  {
    id: 'py-ex-lru-cache',
    title: 'Implement an LRU cache',
    level: 'advanced',
    category: 'implementation',
    tags: ['lru-cache', 'ordereddict', 'linked-list', 'hash-map', 'design'],
    prompt: `Design \`LRUCache(capacity)\` with:

- \`get(key)\` → the value, or \`-1\` if missing. A successful \`get\` marks the key as most recently used.
- \`put(key, value)\` → insert or update. If this exceeds \`capacity\`, evict the **least recently used** key.

Both operations must be **O(1)**. First use \`OrderedDict\`, then build it yourself with a dict and a doubly linked list.`,
    examples: [
      {
        input: 'cap 2: put(1,1), put(2,2), get(1), put(3,3), get(2)',
        output: '1, then -1',
        note: 'key 2 was least recently used when 3 arrived',
      },
    ],
    hints: [
      'You need fast lookup by key (a dict) AND fast "move to most-recent" / "drop least-recent" (an ordered structure).',
      '`OrderedDict.move_to_end(key)` and `popitem(last=False)` are both O(1).',
      'From scratch: a doubly linked list keeps usage order; the dict maps key → node so you can unlink a node in O(1). Sentinel head/tail nodes remove edge cases.',
    ],
    solutions: [
      {
        label: 'OrderedDict',
        code: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)          # now most recently used
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)   # evict least recently used`,
        complexity: { time: 'O(1) per operation', space: 'O(capacity)' },
      },
      {
        label: 'Dict + doubly linked list',
        code: `class _Node:
    __slots__ = ("key", "value", "prev", "next")
    def __init__(self, key=None, value=None):
        self.key, self.value = key, value
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.nodes = {}
        self.head, self.tail = _Node(), _Node()     # sentinels
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _push_front(self, node):                      # most recent = after head
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        node = self.nodes.get(key)
        if node is None:
            return -1
        self._unlink(node)
        self._push_front(node)
        return node.value

    def put(self, key, value):
        node = self.nodes.get(key)
        if node:
            node.value = value
            self._unlink(node)
        else:
            node = self.nodes[key] = _Node(key, value)
        self._push_front(node)
        if len(self.nodes) > self.capacity:
            lru = self.tail.prev                      # least recent = before tail
            self._unlink(lru)
            del self.nodes[lru.key]`,
        complexity: { time: 'O(1) per operation', space: 'O(capacity)' },
      },
    ],
    sampleRun: {
      code: `cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))       # 1 becomes most recent
cache.put(3, 3)           # evicts 2
print(cache.get(2))
cache.put(4, 4)           # evicts 1
print(cache.get(1), cache.get(3), cache.get(4))
cache.put(3, 30)          # update moves 3 to the front
print(cache.get(3))`,
      output: `1
-1
-1 3 4
30`,
    },
    explanationBn: `LRU (Least Recently Used) cache: জায়গা ফুরিয়ে গেলে **সবচেয়ে দীর্ঘ সময় ব্যবহার না হওয়া** item বাদ দাও। Browser cache, database buffer, CDN — সবখানে এই নীতি।

চ্যালেঞ্জ হলো দুটো কাজই O(1)-এ করা:
1. Key দিয়ে দ্রুত value খোঁজা → **dict**।
2. ব্যবহারের ক্রম রাখা, আর যেকোনো item-কে দ্রুত "সবচেয়ে নতুন" জায়গায় সরানো, আর "সবচেয়ে পুরনো"-টা দ্রুত বাদ দেওয়া → **doubly linked list**।

**OrderedDict:** Python-এ দুটো একসাথেই আছে। \`move_to_end\` আর \`popitem(last=False)\` দুটোই O(1)। Interview-তে প্রথমে এটা বলুন।

**নিজে বানানো (interviewer প্রায়ই এটাই চান):**
- Dict রাখে \`key → node\`, যাতে যেকোনো node সরাসরি পাওয়া যায়।
- Linked list-এ node গুলো ব্যবহারের ক্রমে সাজানো: head-এর ঠিক পরে সবচেয়ে নতুন, tail-এর ঠিক আগে সবচেয়ে পুরনো।
- Doubly linked (prev আর next দুটোই) কেন? কারণ মাঝখান থেকে একটা node সরাতে তার আগের node জানতে হয় — singly linked list-এ সেটা O(n)।
- **Sentinel node** (খালি head আর tail): এদের কারণে "list খালি" বা "প্রথম/শেষ node" — এসব বিশেষ ক্ষেত্র আলাদা করে সামলাতে হয় না।

\`get\`: node খুঁজে list থেকে খুলে সামনে বসাই। \`put\`: নতুন node সামনে বসাই; capacity পার হলে tail-এর আগেরটা বাদ।`,
  },
];

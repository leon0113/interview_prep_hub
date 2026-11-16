import { defineSection } from '../../define';

export const querying = defineSection({
  id: 'sql-querying',
  title: 'Querying & Filtering',
  description:
    'How a SELECT is evaluated, filtering with comparisons, pattern matching and NULL-safe operators, sorting and limiting, DISTINCT, and CASE expressions.',
  order: 2,
  questions: [
    {
      id: 'sql-select-execution-order',
      level: 'foundation',
      priority: 3,
      question: 'In what order is a SELECT query evaluated?',
      tags: ['select', 'execution-order', 'where', 'group-by', 'having'],
      answer: {
        interview: `**Logically, a SELECT runs in this order: FROM / JOIN → WHERE → GROUP BY → HAVING → window functions → SELECT list → DISTINCT → ORDER BY → LIMIT / OFFSET.**

- That order explains most "why doesn't this work" errors:
  - A \`SELECT\` alias can't be used in \`WHERE\`: WHERE runs before the alias exists.
  - Aggregates can't go in \`WHERE\`: groups don't exist yet, so use \`HAVING\`.
  - \`ORDER BY\` *can* use aliases: it runs after SELECT.
  - Window functions can't be filtered in \`WHERE\`; wrap them in a CTE.
- It is the *logical* order. The planner may physically reorder work (push filters down, use an index for ORDER BY) as long as the result is the same.`,
        explanationBn: `আমরা SQL লিখি \`SELECT\` দিয়ে শুরু করে, কিন্তু database পড়ে অন্য ক্রমে। রান্নার উদাহরণ:

1. **FROM / JOIN**: বাজার থেকে সব উপকরণ আনা (কোন table)।
2. **WHERE**: পচা গুলো ফেলে দেওয়া (row ছাঁটাই)।
3. **GROUP BY**: একই ধরনের জিনিস আলাদা ঝুড়িতে রাখা।
4. **HAVING**: ছোট ঝুড়িগুলো বাদ দেওয়া (group ছাঁটাই)।
5. **SELECT**: প্লেটে কী কী দেখাবে ঠিক করা, নাম দেওয়া (alias)।
6. **ORDER BY**, **LIMIT**: সাজানো আর কয়টা পরিবেশন করবে।

উদাহরণে: আগে \`WHERE\` 130000-এর বেশি বেতনের doctor রাখে (Shirin, Imran, Rafiq বাদ), তারপর department ধরে group, তারপর \`HAVING\` শুধু ২ জন বা বেশি doctor-এর group রাখে। Pediatrics-এ একজন (Kamal), তাই বাদ।

এই ক্রম মুখস্থ থাকলে অনেক error-এর কারণ সাথে সাথে বোঝা যায়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'WHERE filters rows, GROUP BY groups them, HAVING filters groups',
            code: `SELECT department_id, COUNT(*) AS doctors
FROM doctors
WHERE salary > 130000
GROUP BY department_id
HAVING COUNT(*) >= 2
ORDER BY department_id;`,
            resultTable: {
              columns: ['department_id', 'doctors'],
              rows: [
                [1, 4],
                [2, 2],
                [4, 2],
              ],
            },
          },
        ],
        pitfalls: [
          'Assuming the written order is the execution order.',
          'Filtering on an aggregate in WHERE instead of HAVING.',
        ],
        followUps: [
          'Why can you use a SELECT alias in ORDER BY but not in WHERE?',
          'What is the difference between WHERE and HAVING?',
        ],
      },
      related: ['sql-where-vs-having', 'sql-out-alias-in-where', 'sql-window-in-where'],
    },
    {
      id: 'sql-pattern-matching',
      level: 'foundation',
      priority: 2,
      question: 'How do LIKE, ILIKE and the % and _ wildcards work?',
      tags: ['like', 'ilike', 'pattern-matching', 'strings'],
      answer: {
        interview: `**\`LIKE\` matches a string against a pattern where \`%\` means "any sequence of characters" and \`_\` means "exactly one character"; \`ILIKE\` is PostgreSQL's case-insensitive version.**

- \`'Ra%'\` starts with Ra; \`'%das'\` ends with das; \`'%has%'\` contains has; \`'R_pa%'\` has any single character in position 2.
- Match a literal \`%\` or \`_\` by escaping it: \`LIKE '50\\%%'\`.
- Performance: a pattern with a fixed prefix can use a B-tree index (with \`text_pattern_ops\` in non-C collations); a leading \`%\` cannot. For contains-search at scale use \`pg_trgm\` or full-text search.
- Also available: \`SIMILAR TO\` (SQL regex-like) and POSIX regex \`~\`, \`~*\`.`,
        explanationBn: `\`LIKE\`-এর দুইটা "wildcard":
- \`%\`: যেকোনো কয়টা অক্ষর (শূন্যও হতে পারে)।
- \`_\`: ঠিক একটা অক্ষর।

\`ILIKE\` একই, শুধু বড়-ছোট হাতের অক্ষর আলাদা ধরে না। তাই \`'%hasan%'\` দিয়ে "Sabbir Hasan" আর "Hasan Mahmud" দুজনকেই পাওয়া গেছে।

দ্বিতীয় উদাহরণে \`'R_pa%'\`: R, তারপর যেকোনো একটা অক্ষর, তারপর "pa", তারপর যা খুশি। "Rupa Das" মেলে।

সতর্কতা: শুরুতে \`%\` থাকলে সাধারণ index কাজে লাগে না, পুরো table পড়তে হয়। বড় table-এ "ভেতরে আছে কিনা" খোঁজার জন্য \`pg_trgm\` index বা full-text search।`,
        examples: [
          {
            lang: 'sql',
            caption: 'ILIKE ignores case; % matches anything',
            code: `SELECT id, name
FROM patients
WHERE name ILIKE '%hasan%'
ORDER BY id;`,
            resultTable: {
              columns: ['id', 'name'],
              rows: [
                [4, 'Sabbir Hasan'],
                [13, 'Hasan Mahmud'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: '_ matches exactly one character',
            code: `SELECT id, name FROM patients WHERE name LIKE 'R_pa%';`,
            resultTable: { columns: ['id', 'name'], rows: [[12, 'Rupa Das']] },
          },
        ],
        pitfalls: [
          'LIKE is case-sensitive in PostgreSQL; "hasan" does not match "Hasan" without ILIKE or lower().',
          "A leading wildcard ('%term') cannot use a normal B-tree index.",
        ],
        followUps: [
          'How would you make a contains-search fast on a large table?',
          'When would you use full-text search instead of LIKE?',
        ],
      },
      related: ['sql-index-not-used', 'sql-full-text-search'],
    },
    {
      id: 'sql-null-safe-comparison',
      level: 'foundation',
      priority: 2,
      question: 'How do comparisons behave with NULL, and what is IS DISTINCT FROM?',
      tags: ['null', 'is-distinct-from', 'comparison', 'where'],
      answer: {
        interview: `**Any ordinary comparison with NULL (\`=\`, \`<>\`, \`<\`, \`IN\`) is unknown, and WHERE drops unknown rows; \`IS [NOT] DISTINCT FROM\` is the NULL-safe comparison that treats two NULLs as equal and NULL vs a value as different.**

| Expression | \`city = 'Dhaka'\` | \`city <> 'Dhaka'\` | \`city IS DISTINCT FROM 'Dhaka'\` |
| --- | --- | --- | --- |
| city = 'Dhaka' | true | false | false |
| city = 'Sylhet' | false | true | true |
| city IS NULL | unknown | unknown (row dropped!) | true |

- \`col <> 'x'\` silently excludes rows where \`col\` is NULL. Use \`IS DISTINCT FROM\`, or add \`OR col IS NULL\`.
- \`IN\` / \`BETWEEN\` are shorthands: \`x IN (a, b)\` = \`x = a OR x = b\`; \`BETWEEN a AND b\` = \`>= a AND <= b\` (inclusive).`,
        explanationBn: `NULL মানে "জানা নেই"। "জানা নেই কি Dhaka-র সমান না?" এর উত্তরও "জানা নেই", তাই \`city <> 'Dhaka'\` দুই শহর-বিহীন রোগীকে (Tania, Rupa) বাদ দিয়ে দেয়। উদাহরণে \`<>\` দিয়ে 7 জন, অথচ Dhaka-র বাইরে আসলে 9 জন।

\`IS DISTINCT FROM\` প্রশ্নটা অন্যভাবে করে: "এই দুইটা মান কি আলাদা?" NULL আর 'Dhaka' আলাদা, তাই true। দুইটা NULL-কে সে সমান ধরে।

বাস্তব উদাহরণ: "যাদের status 'cancelled' না" খুঁজতে \`<>\` লিখলে status NULL row গুলো হারিয়ে যাবে, আর কেউ টেরও পাবে না।`,
        examples: [
          {
            lang: 'sql',
            caption: '<> drops the NULL cities; IS DISTINCT FROM keeps them',
            code: `SELECT COUNT(*) FILTER (WHERE city <> 'Dhaka') AS not_equal,
       COUNT(*) FILTER (WHERE city IS DISTINCT FROM 'Dhaka') AS is_distinct
FROM patients;`,
            resultTable: { columns: ['not_equal', 'is_distinct'], rows: [[7, 9]] },
          },
        ],
        pitfalls: [
          'WHERE col <> value silently skips NULLs.',
          'IS DISTINCT FROM cannot use a normal index as well as = can; keep it for nullable comparisons.',
        ],
        followUps: ['Why does NOT IN with a NULL return no rows?', 'What does COALESCE do?'],
      },
      related: ['sql-out-null-logic', 'sql-out-not-in-null'],
    },
    {
      id: 'sql-order-limit-offset',
      level: 'foundation',
      priority: 2,
      question: 'How do ORDER BY, NULLS FIRST / LAST, LIMIT and OFFSET work?',
      tags: ['order-by', 'limit', 'offset', 'nulls-first', 'sorting'],
      answer: {
        interview: `**ORDER BY sorts the final result by one or more keys (each ASC or DESC); LIMIT keeps the first n rows and OFFSET skips rows before that.**

- Without ORDER BY, row order is **not guaranteed**, even if it looks stable.
- Multiple keys break ties left to right: \`ORDER BY city, name\`.
- NULLs sort as larger than any value in PostgreSQL: last in ASC, first in DESC. Override with \`NULLS FIRST\` / \`NULLS LAST\`.
- LIMIT without a deterministic ORDER BY returns arbitrary rows; add a unique tie-breaker (usually the primary key).
- Deep OFFSET is slow (rows are read and discarded); use keyset pagination for large lists.
- \`FETCH FIRST n ROWS ONLY\` / \`WITH TIES\` is the SQL-standard form; \`WITH TIES\` also returns rows tied with the last one.`,
        explanationBn: `\`ORDER BY\` ছাড়া database যেকোনো ক্রমে row দিতে পারে, আজ যেটা সাজানো দেখাচ্ছে কাল সেটা বদলাতে পারে। তাই ক্রম দরকার হলে সবসময় লিখে দাও।

একাধিক key: প্রথমটা দিয়ে সাজায়, সমান হলে দ্বিতীয়টা দিয়ে। উদাহরণে আগে শহর, তারপর নাম।

NULL কোথায় যাবে: Postgres-এ ছোট থেকে বড় (ASC) সাজালে NULL শেষে থাকে। \`NULLS FIRST\` দিয়ে শুরুতে আনা হয়েছে, তাই শহর-বিহীন Rupa আর Tania আগে, তারপর Chattogram-এর রোগীরা। \`LIMIT 4\` প্রথম চারজন রেখেছে।

খেয়াল: Chattogram-এ দুইজন "Rahim Uddin", নাম একই। পুরোপুরি নির্দিষ্ট ক্রমের জন্য শেষে \`id\` যোগ করা উচিত।`,
        examples: [
          {
            lang: 'sql',
            caption: 'NULL cities first, then by city and name, first 4 rows',
            code: `SELECT name, city
FROM patients
ORDER BY city NULLS FIRST, name
LIMIT 4;`,
            resultTable: {
              columns: ['name', 'city'],
              rows: [
                ['Rupa Das', null],
                ['Tania Rahman', null],
                ['Hasan Mahmud', 'Chattogram'],
                ['Rahim Uddin', 'Chattogram'],
              ],
            },
          },
        ],
        pitfalls: [
          'Relying on insertion order without ORDER BY.',
          'LIMIT with a non-unique sort key: pages can repeat or skip rows.',
          'ORDER BY ... DESC puts NULLs first in PostgreSQL (but last in MySQL).',
        ],
        followUps: ['Why is OFFSET slow on deep pages?', 'What does FETCH FIRST ... WITH TIES do?'],
      },
      related: ['sql-keyset-pagination', 'sql-out-null-sorting-distinct'],
    },
    {
      id: 'sql-distinct-vs-group-by',
      level: 'intermediate',
      priority: 2,
      question: 'What is the difference between DISTINCT and GROUP BY?',
      tags: ['distinct', 'group-by', 'duplicates'],
      answer: {
        interview: `**Both collapse duplicate rows; DISTINCT just removes duplicates from the result, while GROUP BY forms groups so you can compute aggregates per group.**

| Aspect | DISTINCT | GROUP BY |
| --- | --- | --- |
| Purpose | Remove duplicate output rows | Group rows for aggregation |
| Aggregates per group | No | Yes: \`COUNT\`, \`SUM\`, \`AVG\`… |
| Filter groups | No | \`HAVING\` |
| Same result for plain dedup? | \`SELECT DISTINCT city\` | \`SELECT city … GROUP BY city\` |
| NULLs | Treated as one value | Treated as one group |

For simple deduplication they usually produce the same plan. Use GROUP BY when you need counts or other aggregates. \`DISTINCT\` on a big join is often a sign of an accidental fan-out that should be fixed in the join instead. PostgreSQL also has \`DISTINCT ON (...)\` to keep one whole row per key.`,
        explanationBn: `\`DISTINCT\` শুধু বলে "একই row দুইবার দেখিও না"। \`GROUP BY\` বলে "একই মানের row গুলো এক ঝুড়িতে রাখো", যাতে প্রতিটা ঝুড়ির উপর গোনা, যোগ, গড় করা যায়।

উদাহরণে \`SELECT DISTINCT city\` 14 জন রোগী থেকে 6টা আলাদা শহর দিয়েছে। NULL একটা আলাদা মান হিসেবে একবার এসেছে, আর ASC sort-এ শেষে। একই ফল \`GROUP BY city\` দিয়েও পাওয়া যেত, সাথে \`COUNT(*)\` যোগ করলে কোন শহরে কতজন সেটাও।

সাবধান: JOIN-এর পর হঠাৎ duplicate দেখে \`DISTINCT\` বসিয়ে দেওয়া একটা bad smell। আসল সমস্যা সাধারণত join-এ (row গুণ হয়ে যাওয়া), সেটা ঠিক করা উচিত।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Distinct cities; NULL counts as one value',
            code: `SELECT DISTINCT city
FROM patients
ORDER BY city;`,
            resultTable: {
              columns: ['city'],
              rows: [['Chattogram'], ['Dhaka'], ['Khulna'], ['Rajshahi'], ['Sylhet'], [null]],
            },
          },
        ],
        pitfalls: [
          'Using DISTINCT to hide duplicate rows caused by a wrong join.',
          'COUNT(DISTINCT col) ignores NULL, while SELECT DISTINCT col keeps one NULL row.',
        ],
        followUps: ['What does DISTINCT ON do?', 'Why might a join return duplicate rows?'],
      },
      related: ['sql-distinct-on', 'sql-join-fan-out', 'sql-out-null-sorting-distinct'],
    },
    {
      id: 'sql-case-expression',
      level: 'intermediate',
      priority: 2,
      question: 'How does the CASE expression work, and where can you use it?',
      tags: ['case', 'conditional-logic', 'expressions'],
      answer: {
        interview: `**CASE is SQL's if/else expression: it evaluates WHEN conditions in order and returns the first matching THEN value, or ELSE (NULL if there is no ELSE).**

- **Searched** form: \`CASE WHEN fee > 1500 THEN 'high' WHEN fee > 1000 THEN 'mid' ELSE 'low' END\`.
- **Simple** form: \`CASE status WHEN 'completed' THEN 1 ELSE 0 END\`.
- It is an expression, so it works anywhere a value does: SELECT list, WHERE, GROUP BY, ORDER BY (custom sort orders), inside aggregates (conditional counts), and in UPDATE ... SET.
- All branches must return compatible types.`,
        explanationBn: `\`CASE\` হলো SQL-এর if/else। উপর থেকে নিচে শর্ত দেখে, **প্রথম যেটা মেলে** সেটার মান দেয়; কোনোটা না মিললে \`ELSE\`, আর \`ELSE\` না থাকলে NULL।

উদাহরণে রোগীর metadata-য় insurance আছে কিনা দেখে "insured" বা "self-pay" লেবেল দেওয়া হয়েছে, তারপর সেই লেবেল ধরে গোনা। যাদের \`"insurance": null\` আর যার metadata একদম খালি \`{}\` (Hasan), সবাই \`->>\` দিয়ে NULL পায়, তাই 5 জন self-pay।

CASE যেকোনো জায়গায় চলে যেখানে একটা মান লেখা যায়: \`ORDER BY CASE ... END\` দিয়ে নিজের পছন্দের ক্রম (যেমন status: scheduled আগে), \`SUM(CASE ...)\` দিয়ে শর্তসাপেক্ষ গোনা।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Label rows with CASE, then group by the label',
            code: `SELECT CASE
         WHEN metadata->>'insurance' IS NULL THEN 'self-pay'
         ELSE 'insured'
       END AS payer,
       COUNT(*) AS patients
FROM patients
GROUP BY payer
ORDER BY payer;`,
            resultTable: {
              columns: ['payer', 'patients'],
              rows: [
                ['insured', 9],
                ['self-pay', 5],
              ],
            },
          },
        ],
        pitfalls: [
          'Overlapping conditions: only the first matching WHEN counts, so order them from most to least specific.',
          'A missing ELSE returns NULL, which can then disappear from counts or comparisons.',
        ],
        followUps: [
          'How would you sort statuses in a custom order?',
          'How do you count several conditions in one query?',
        ],
      },
      related: ['sql-filter-clause'],
    },
  ],
});

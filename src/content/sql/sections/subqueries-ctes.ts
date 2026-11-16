import { defineSection } from '../../define';

export const subqueriesCtes = defineSection({
  id: 'sql-subqueries-ctes',
  title: 'Subqueries & CTEs',
  description:
    'Scalar, table and correlated subqueries, EXISTS vs IN, common table expressions (WITH), recursive CTEs, and when CTEs are materialized.',
  order: 5,
  questions: [
    {
      id: 'sql-subquery-types',
      level: 'foundation',
      priority: 2,
      question: 'What is a subquery, and what kinds are there?',
      tags: ['subquery', 'scalar-subquery', 'derived-table'],
      answer: {
        interview: `**A subquery is a SELECT nested inside another statement; it is classified by what it returns and where it is used.**

| Kind | Returns | Typical place | Example |
| --- | --- | --- | --- |
| Scalar | One value | SELECT list, WHERE comparisons | \`salary > (SELECT AVG(salary) FROM doctors)\` |
| Row | One row, several columns | Row comparisons | \`(a, b) = (SELECT x, y …)\` |
| Table (derived table) | A set of rows | FROM, joined like a table | \`FROM (SELECT …) AS t\` |
| List | One column, many rows | \`IN\`, \`ANY\`, \`ALL\` | \`id IN (SELECT doctor_id …)\` |
| Correlated | Depends on the outer row | WHERE / SELECT, re-evaluated per row | \`WHERE EXISTS (… WHERE x.id = outer.id)\` |

A scalar subquery that returns more than one row is an error; one that returns no row yields NULL.`,
        explanationBn: `Subquery হলো query-র ভেতরে আরেকটা query, যার ফল বাইরের query ব্যবহার করে। কী ফেরত দেয় তার উপর নাম:

- **Scalar**: একটাই মান। উদাহরণে \`(SELECT AVG(salary) FROM doctors)\` সব doctor-এর গড় বেতন (প্রায় 152916.67) দেয়, আর বাইরের query সেটার চেয়ে বেশি বেতনের doctor বের করে।
- **Table / derived table**: অনেক row; \`FROM\`-এ table-এর মতো ব্যবহার হয়, alias দিতে হয়।
- **List**: এক column-এর অনেক মান, \`IN\` দিয়ে।
- **Correlated**: বাইরের row-এর উপর নির্ভর করে, তাই প্রতিটা row-এর জন্য আলাদা করে চলে (ধারণাগতভাবে)।

Scalar subquery একাধিক row দিলে error ("more than one row returned"), আর কোনো row না দিলে NULL।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A scalar subquery: doctors paid above the overall average',
            code: `SELECT id, name, salary
FROM doctors
WHERE salary > (SELECT AVG(salary) FROM doctors)
ORDER BY id;`,
            resultTable: {
              columns: ['id', 'name', 'salary'],
              rows: [
                [1, 'Dr. Nusrat Rahman', '250000.00'],
                [2, 'Dr. Arif Hossain', '180000.00'],
                [3, 'Dr. Farzana Akter', '180000.00'],
                [9, 'Dr. Laila Haque', '160000.00'],
                [10, 'Dr. Mahbub Alam', '165000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'A derived table in FROM must have an alias in most databases (optional only since PostgreSQL 16).',
          'A scalar subquery that can return two rows fails at runtime, often only in production data.',
        ],
        followUps: ['What is a correlated subquery?', 'When would you use a CTE instead?'],
      },
      related: ['sql-correlated-subquery', 'sql-cte'],
    },
    {
      id: 'sql-correlated-subquery',
      level: 'intermediate',
      priority: 2,
      question: 'What is a correlated subquery, and how is it different from a non-correlated one?',
      tags: ['subquery', 'correlated-subquery', 'performance'],
      answer: {
        interview: `**A correlated subquery refers to columns of the outer query, so its result depends on the current outer row; a non-correlated subquery is independent and can be computed once.**

| Aspect | Non-correlated | Correlated |
| --- | --- | --- |
| Refers to outer columns | No | Yes (\`WHERE d2.department_id = d.department_id\`) |
| Evaluated | Once | Conceptually once per outer row |
| Runs on its own | Yes | No |
| Typical use | Compare with a global value | Per-row checks: above own group's average, EXISTS |

The planner often turns correlated \`EXISTS\` into a join, but correlated scalar subqueries in the SELECT list really can run per row. Alternatives: a window function (\`AVG(salary) OVER (PARTITION BY department_id)\`) or a join to a pre-aggregated CTE.`,
        explanationBn: `**Non-correlated**: ভেতরের query নিজে নিজেই চলে, একবার। যেমন "সব doctor-এর গড়"।

**Correlated**: ভেতরের query বাইরের row-এর কোনো মান ব্যবহার করে, যেমন "**এই** doctor-এর department-এর গড়"। প্রতিটা doctor-এর জন্য আলাদা গড় লাগে, তাই ধারণাগতভাবে প্রতিটা row-এর জন্য subquery আবার চলে।

উদাহরণে প্রতিটা doctor-কে তার নিজের department-এর গড়ের সাথে তুলনা করা হয়েছে: Cardiology-র গড় 161000, তাই Nusrat আর Arif; Neurology 157500, তাই Farzana; Orthopedics 162500, তাই Mahbub। Kamal (Pediatrics) গড়ের সমান, বেশি না। Rafiq-এর department NULL, \`= NULL\` কিছু মেলে না, তাই তার গড় NULL আর তিনি বাদ।

বড় table-এ একই কাজ window function দিয়ে প্রায়ই দ্রুত হয়, কারণ table একবার পড়ে সব group-এর গড় পাওয়া যায়।`,
        examples: [
          {
            lang: 'sql',
            caption: "Doctors paid above their own department's average",
            code: `SELECT d.id, d.name, d.salary
FROM doctors AS d
WHERE d.salary > (
  SELECT AVG(d2.salary)
  FROM doctors AS d2
  WHERE d2.department_id = d.department_id
)
ORDER BY d.id;`,
            resultTable: {
              columns: ['id', 'name', 'salary'],
              rows: [
                [1, 'Dr. Nusrat Rahman', '250000.00'],
                [2, 'Dr. Arif Hossain', '180000.00'],
                [3, 'Dr. Farzana Akter', '180000.00'],
                [10, 'Dr. Mahbub Alam', '165000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Correlated scalar subqueries in the SELECT list over large tables: one query per row.',
          'Rows whose correlation column is NULL never match (d2.department_id = NULL is unknown).',
        ],
        followUps: [
          'How would you rewrite this with a window function?',
          'What is the difference between EXISTS and IN?',
        ],
      },
      related: ['sql-subquery-types', 'sql-exists-vs-in', 'sql-window-function-basics'],
    },
    {
      id: 'sql-exists-vs-in',
      level: 'intermediate',
      priority: 3,
      question: 'What is the difference between EXISTS and IN?',
      tags: ['exists', 'in', 'subquery', 'semi-join', 'null'],
      answer: {
        interview: `**Both test membership; \`IN\` compares a value with the list a subquery returns, while \`EXISTS\` asks whether a correlated subquery returns at least one row. Their negated forms behave differently with NULLs.**

| Aspect | IN (subquery) | EXISTS (subquery) |
| --- | --- | --- |
| Checks | Value is in the returned list | At least one row exists |
| Correlated | Usually not | Usually yes |
| Stops early | Planner-dependent | Yes, at the first matching row |
| Negated with NULLs | \`NOT IN\` returns no rows if the list has a NULL | \`NOT EXISTS\` is NULL-safe |
| Planning in PostgreSQL | Semi-join (like EXISTS) for subqueries | Semi-join / anti-join |

In PostgreSQL, \`IN\` and \`EXISTS\` usually get the same plan. The practical rule: use \`EXISTS\` / \`NOT EXISTS\` for "is there a related row", and \`IN\` for short literal lists (\`status IN ('scheduled', 'completed')\`).`,
        explanationBn: `দুটোই প্রশ্ন করে "সম্পর্কিত কিছু আছে কি?"

- **IN**: ভেতরের query একটা তালিকা বানায়, তারপর দেখে মানটা তালিকায় আছে কিনা।
- **EXISTS**: প্রতিটা বাইরের row-এর জন্য জিজ্ঞেস করে "এমন একটা row-ও কি আছে?" প্রথমটা পেলেই থেমে যায়।

উদাহরণে: কোন department-এ অন্তত একজন doctor-এর বেতন 170000-এর বেশি? Cardiology (Nusrat, Arif) আর Neurology (Farzana)। দুই পদ্ধতিই একই উত্তর দেয়।

আসল পার্থক্য উল্টো রূপে: \`NOT IN\`-এর তালিকায় একটা NULL থাকলেই (যেমন Rafiq-এর department) কোনো row আসে না। \`NOT EXISTS\`-এ এই ফাঁদ নেই। তাই "নেই" খুঁজতে সবসময় \`NOT EXISTS\`।`,
        examples: [
          {
            lang: 'sql',
            caption: 'EXISTS: departments with at least one doctor earning over 170,000',
            code: `SELECT dep.name
FROM departments AS dep
WHERE EXISTS (
  SELECT 1 FROM doctors AS d
  WHERE d.department_id = dep.id AND d.salary > 170000
)
ORDER BY dep.id;`,
            resultTable: { columns: ['name'], rows: [['Cardiology'], ['Neurology']] },
          },
          {
            lang: 'sql',
            caption: 'IN: the same question as a list',
            code: `SELECT name
FROM departments
WHERE id IN (SELECT department_id FROM doctors WHERE salary > 170000)
ORDER BY id;`,
            resultTable: { columns: ['name'], rows: [['Cardiology'], ['Neurology']] },
          },
        ],
        pitfalls: [
          'NOT IN with a nullable subquery column returns no rows.',
          'SELECT * inside EXISTS is fine (the columns are never read); SELECT 1 is just a convention.',
        ],
        followUps: [
          'Why does NOT IN return nothing when the list contains NULL?',
          'What is a semi-join?',
        ],
      },
      related: ['sql-anti-join', 'sql-out-not-in-null', 'sql-correlated-subquery'],
    },
    {
      id: 'sql-cte',
      level: 'intermediate',
      priority: 3,
      question:
        'What is a CTE (WITH clause), and how does it compare with a subquery, a temp table and a view?',
      tags: ['cte', 'with', 'subquery', 'temp-table', 'view'],
      answer: {
        interview: `**A CTE (common table expression) names a query with \`WITH name AS (…)\` so the main query can use it like a table; it exists only for that one statement.**

| Option | Lifetime | Reusable | Indexable | Best for |
| --- | --- | --- | --- | --- |
| Subquery | One place in one query | No | No | Small, one-off pieces |
| CTE | One statement | Within the statement, by name | No | Readable step-by-step logic, recursion, data-modifying steps |
| Temp table | Session (or transaction) | Many statements | Yes | Large intermediate results reused several times |
| View | Permanent | By everyone | Uses base tables' indexes | Shared, stable query logic |

CTEs make complex queries readable top to bottom, can be referenced several times, enable recursion (\`WITH RECURSIVE\`) and can contain INSERT/UPDATE/DELETE with RETURNING.`,
        explanationBn: `CTE হলো query-র ভেতরের একটা ধাপকে নাম দেওয়া: "আগে department-এর হিসাব বের করো, নাম দাও \`dept_stats\`, তারপর সেটা থেকে যা লাগে নাও।" ফলে লম্বা query উপর থেকে নিচে গল্পের মতো পড়া যায়, nested subquery-র ভেতর-বাইরে ঘুরতে হয় না।

উদাহরণে \`dept_stats\` প্রতিটা department-এর doctor সংখ্যা আর সর্বোচ্চ বেতন হিসাব করে; মূল query সেটা departments-এর সাথে জুড়ে শুধু ২ জন বা বেশি doctor-এর department রাখে।

কখন কী:
- একবার লাগে, ছোট: subquery।
- পড়ার সুবিধা, একই ফল একাধিকবার, recursion: CTE।
- বড় মাঝামাঝি ফল, অনেক query-তে বারবার, index দরকার: temp table।
- সবার জন্য স্থায়ী, নামযুক্ত query: view।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Name a step with WITH, then use it like a table',
            code: `WITH dept_stats AS (
  SELECT department_id, COUNT(*) AS doctors, MAX(salary) AS top_salary
  FROM doctors
  WHERE department_id IS NOT NULL
  GROUP BY department_id
)
SELECT dep.name, s.doctors, s.top_salary
FROM dept_stats AS s
JOIN departments AS dep ON dep.id = s.department_id
WHERE s.doctors >= 2
ORDER BY dep.name;`,
            resultTable: {
              columns: ['name', 'doctors', 'top_salary'],
              rows: [
                ['Cardiology', 5, '250000.00'],
                ['Neurology', 2, '180000.00'],
                ['Orthopedics', 2, '165000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Believing a CTE is always computed once and cached: since PostgreSQL 12, simple CTEs are inlined like subqueries.',
          'Very long chains of CTEs can hide expensive steps; check EXPLAIN.',
        ],
        followUps: ['What is a recursive CTE?', 'What do MATERIALIZED and NOT MATERIALIZED do?'],
      },
      related: ['sql-recursive-cte', 'sql-cte-materialization', 'sql-view-vs-materialized-view'],
    },
    {
      id: 'sql-recursive-cte',
      level: 'advanced',
      priority: 2,
      question: 'How does a recursive CTE work?',
      tags: ['cte', 'recursive-cte', 'hierarchy', 'with-recursive'],
      answer: {
        interview: `**\`WITH RECURSIVE\` has an anchor query that produces the starting rows and a recursive query that joins to the CTE itself; PostgreSQL repeats the recursive part on the rows found in the previous step until it adds no new rows.**

- Shape: \`anchor UNION ALL recursive_part\`.
- Uses: org charts and category trees, bill of materials, graph traversal, generating series.
- Always make sure it terminates: a stop condition (\`WHERE level < 10\`), or cycle detection with \`UNION\` (dedupe) or the \`CYCLE\` clause (PostgreSQL 14+).
- Add a \`level\` / \`depth\` column to know how far each row is from the start.`,
        explanationBn: `Recursive CTE দুই অংশের:

1. **Anchor**: শুরুর row। উদাহরণে Dr. Arif (level 0)।
2. **Recursive অংশ**: আগের ধাপে পাওয়া row-গুলোর সাথে table জোড়া দিয়ে পরের ধাপ বানায়। এখানে "যাদের manager আগের ধাপের কেউ"।

Postgres বারবার দ্বিতীয় অংশ চালায়: প্রথমবার Arif-এর অধীনস্থ Sadia আর Tanvir (level 1), তারপর Sadia-র অধীনস্থ Shirin (level 2)। Shirin-এর অধীনে কেউ নেই, নতুন row আসে না, তাই থামে।

দ্বিতীয় উদাহরণ দেখায় recursion দিয়ে সংখ্যা বানানো: 1 থেকে শুরু, প্রতিবার +1, 5-এ থামে। এখানে \`WHERE x < 5\` না থাকলে অসীম loop হতো, তাই থামার শর্ত সবসময় নিশ্চিত করো।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Everyone who reports to Dr. Arif Hossain, directly or indirectly',
            code: `WITH RECURSIVE team AS (
  SELECT id, name, 0 AS level
  FROM doctors
  WHERE id = 2
  UNION ALL
  SELECT d.id, d.name, t.level + 1
  FROM doctors AS d
  JOIN team AS t ON d.manager_id = t.id
)
SELECT level, name FROM team ORDER BY level, id;`,
            resultTable: {
              columns: ['level', 'name'],
              rows: [
                [0, 'Dr. Arif Hossain'],
                [1, 'Dr. Sadia Islam'],
                [1, 'Dr. Tanvir Ahmed'],
                [2, 'Dr. Shirin Sultana'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'Generating numbers with recursion',
            code: `WITH RECURSIVE n(x) AS (
  SELECT 1
  UNION ALL
  SELECT x + 1 FROM n WHERE x < 5
)
SELECT x FROM n;`,
            resultTable: { columns: ['x'], rows: [[1], [2], [3], [4], [5]] },
          },
        ],
        pitfalls: [
          'No stop condition and a cycle in the data: the query runs until it fails.',
          'UNION instead of UNION ALL deduplicates (stopping some cycles) but costs extra work.',
        ],
        followUps: [
          'How would you show the full path ("Nusrat > Arif > Sadia") for each doctor?',
          'How do you protect against cycles?',
        ],
      },
      related: ['sql-cte', 'sql-self-join'],
    },
    {
      id: 'sql-cte-materialization',
      level: 'advanced',
      priority: 1,
      question:
        'Are CTEs materialized in PostgreSQL? What do MATERIALIZED and NOT MATERIALIZED do?',
      tags: ['cte', 'materialized', 'performance', 'planner'],
      answer: {
        interview: `**Since PostgreSQL 12, a non-recursive, side-effect-free CTE that is referenced once is inlined into the main query (optimized like a subquery); before 12, every CTE was materialized as an "optimization fence".**

- \`WITH x AS MATERIALIZED (…)\` forces it to be computed once and stored: useful when it is expensive and referenced several times, or to stop the planner pushing conditions into it.
- \`WITH x AS NOT MATERIALIZED (…)\` forces inlining even when referenced more than once.
- Referenced two or more times (without a keyword) → materialized by default.
- Recursive CTEs and data-modifying CTEs (INSERT/UPDATE/DELETE) are always materialized.

Check with \`EXPLAIN\`: a "CTE Scan" node means it was materialized.`,
        explanationBn: `পুরনো PostgreSQL-এ (11 পর্যন্ত) প্রতিটা CTE আলাদা করে পুরোটা হিসাব হয়ে জমা থাকত, বাইরের query-র \`WHERE\` ভেতরে ঢুকতে পারত না। একে বলা হতো "optimization fence"। ফলে CTE দিয়ে লেখা query কখনো কখনো অনেক ধীর হতো।

PostgreSQL 12 থেকে: একবার ব্যবহার হওয়া সাধারণ CTE subquery-র মতো মূল query-র সাথে মিশে যায় (inline), planner স্বাধীনভাবে optimize করে।

নিজে নিয়ন্ত্রণ করতে চাইলে:
- \`MATERIALIZED\`: একবার হিসাব করে রেখে দাও (ভারী হিসাব, বারবার ব্যবহার)।
- \`NOT MATERIALIZED\`: মিশিয়ে দাও।

সন্দেহ হলে \`EXPLAIN\`-এ "CTE Scan" খোঁজো।`,
        pitfalls: [
          'Advice from old blog posts ("CTEs are always slow fences") no longer applies from PostgreSQL 12 on.',
        ],
        followUps: ['How do you read an EXPLAIN plan?'],
      },
      related: ['sql-cte', 'sql-explain-analyze'],
    },
  ],
});

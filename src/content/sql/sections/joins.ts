import { defineSection } from '../../define';

export const joins = defineSection({
  id: 'sql-joins',
  title: 'Joins',
  description:
    'Inner, outer and cross joins, finding rows without a match, self-joins, and the row multiplication (fan-out) that breaks aggregates.',
  order: 3,
  questions: [
    {
      id: 'sql-join-types',
      level: 'foundation',
      priority: 3,
      question: 'What are the types of JOIN, and how do INNER, LEFT, RIGHT and FULL joins differ?',
      tags: ['joins', 'inner-join', 'left-join', 'full-join', 'outer-join'],
      answer: {
        interview: `**A join combines rows from two tables using a condition; the join type decides what happens to rows that have no match.**

| Join | Keeps | Unmatched rows |
| --- | --- | --- |
| \`INNER JOIN\` | Only matching pairs | Dropped from both sides |
| \`LEFT [OUTER] JOIN\` | Every row of the left table | Right-side columns are NULL |
| \`RIGHT [OUTER] JOIN\` | Every row of the right table | Left-side columns are NULL |
| \`FULL [OUTER] JOIN\` | Every row of both tables | NULLs on whichever side is missing |
| \`CROSS JOIN\` | Every combination (no condition) | — |

In the clinic: 12 doctors, 6 departments. Rafiq Mia has no department, and Oncology has no doctors. An inner join gives 11 rows, \`doctors LEFT JOIN departments\` 12, and a full join 13 (12 doctors + Oncology).

Most teams write LEFT joins only and swap table order instead of using RIGHT JOIN, which reads more naturally.`,
        explanationBn: `দুইটা table জোড়া লাগানোর সময় প্রশ্ন একটাই: **যার জোড়া নেই, তার কী হবে?**

- **INNER**: শুধু যাদের জোড়া আছে। Rafiq (department নেই) আর Oncology (doctor নেই) দুজনেই বাদ, তাই 11 row।
- **LEFT**: বাম table-এর সবাই থাকবে। doctors বাম দিকে হলে Rafiq-ও থাকে, department-এর column NULL। 12 row।
- **RIGHT**: উল্টো, ডান table-এর সবাই।
- **FULL**: দুই দিকের সবাই, যার যেদিকে জোড়া নেই সেদিকে NULL। Rafiq আর Oncology দুজনেই আসে, 13 row।
- **CROSS**: শর্ত ছাড়া প্রতিটা row-এর সাথে প্রতিটা row।

দ্বিতীয় উদাহরণে FULL JOIN করে শুধু "জোড়াহীন" row গুলো রাখা হয়েছে: data-র অসঙ্গতি খোঁজার সহজ উপায়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Row counts for the same tables with different join types',
            code: `SELECT
  (SELECT COUNT(*) FROM doctors d
     JOIN departments dep ON dep.id = d.department_id) AS inner_join,
  (SELECT COUNT(*) FROM doctors d
     LEFT JOIN departments dep ON dep.id = d.department_id) AS left_join,
  (SELECT COUNT(*) FROM doctors d
     FULL JOIN departments dep ON dep.id = d.department_id) AS full_join;`,
            resultTable: {
              columns: ['inner_join', 'left_join', 'full_join'],
              rows: [[11, 12, 13]],
            },
          },
          {
            lang: 'sql',
            caption: 'FULL JOIN: the rows that have no partner on either side',
            code: `SELECT d.name AS doctor, dep.name AS department
FROM doctors AS d
FULL JOIN departments AS dep ON dep.id = d.department_id
WHERE d.id IS NULL OR dep.id IS NULL
ORDER BY doctor NULLS LAST;`,
            resultTable: {
              columns: ['doctor', 'department'],
              rows: [
                ['Dr. Rafiq Mia', null],
                [null, 'Oncology'],
              ],
            },
          },
        ],
        pitfalls: [
          'A WHERE condition on the right table turns a LEFT JOIN into an INNER JOIN.',
          'Joining on a nullable column: NULL never equals NULL, so those rows never match.',
        ],
        followUps: [
          'How do you find rows in one table that have no match in another?',
          'Where should a filter on the right table go in a LEFT JOIN?',
        ],
      },
      related: ['sql-anti-join', 'sql-out-left-join-where', 'sql-out-count-star-left-join'],
    },
    {
      id: 'sql-anti-join',
      level: 'foundation',
      priority: 3,
      question: 'How do you find rows in one table that have no matching rows in another?',
      tags: ['joins', 'anti-join', 'left-join', 'not-exists'],
      answer: {
        interview: `**Use an anti-join: \`LEFT JOIN … WHERE right.key IS NULL\`, or (usually clearer) \`WHERE NOT EXISTS (correlated subquery)\`.**

- \`LEFT JOIN\` keeps every left row; for rows without a match, the right side is all NULL, so filtering on the right table's primary key being NULL leaves only the unmatched ones.
- \`NOT EXISTS\` expresses the intent directly and is NULL-safe; PostgreSQL plans both as an anti-join.
- Avoid \`NOT IN (subquery)\`: one NULL in the subquery makes it return no rows.

Real-world: patients who never booked, customers with no orders, products never sold.`,
        explanationBn: `"যাদের X নেই" ধরনের প্রশ্ন খুব common: কোন রোগী কখনো appointment নেয়নি?

**LEFT JOIN + IS NULL**: patients বাম দিকে, তাই সবাই থাকে। যার কোনো appointment নেই, তার appointment-এর সব column NULL। তখন \`WHERE a.id IS NULL\` শুধু তাদেরই রাখে। এখানে শুধু Hasan Mahmud।

খেয়াল: NULL check করতে হবে ডান table-এর এমন column-এ যেটা আসলে কখনো NULL হয় না (primary key), নইলে "মিলেছে কিন্তু মানটা NULL" আর "মেলেনি" গুলিয়ে যাবে।

**NOT EXISTS** একই কাজ পড়তে আরও সহজ ভাষায়: "এমন কোনো appointment নেই যার patient_id এই রোগী।" NULL-এর ফাঁদও নেই।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Patients who never had an appointment',
            code: `SELECT p.name
FROM patients AS p
LEFT JOIN appointments AS a ON a.patient_id = p.id
WHERE a.id IS NULL;`,
            resultTable: { columns: ['name'], rows: [['Hasan Mahmud']] },
          },
          {
            lang: 'sql',
            caption: 'The same with NOT EXISTS',
            code: `SELECT p.name
FROM patients AS p
WHERE NOT EXISTS (SELECT 1 FROM appointments AS a WHERE a.patient_id = p.id);`,
            resultTable: { columns: ['name'], rows: [['Hasan Mahmud']] },
          },
        ],
        pitfalls: [
          'Checking a nullable right-side column for IS NULL: a matched row with a NULL value is miscounted as unmatched.',
          'NOT IN with a nullable subquery returns nothing.',
        ],
        followUps: [
          'What is the difference between EXISTS and IN?',
          'Why does NOT IN fail with NULLs?',
        ],
      },
      related: ['sql-join-types', 'sql-exists-vs-in', 'sql-out-not-in-null'],
    },
    {
      id: 'sql-self-join',
      level: 'intermediate',
      priority: 2,
      question: 'What is a self-join, and when do you need one?',
      tags: ['joins', 'self-join', 'hierarchy'],
      answer: {
        interview: `**A self-join joins a table to itself under two aliases, for rows that relate to other rows of the same table: employees and managers, previous and next events, pairs of similar records.**

- Give each copy a clear alias (\`e\` for employee, \`m\` for manager).
- Use \`LEFT JOIN\` to keep rows with no partner (the top manager has \`manager_id\` NULL).
- One self-join climbs one level; for a whole hierarchy use a recursive CTE.
- For "previous/next row" comparisons, window functions (\`LAG\`/\`LEAD\`) are usually simpler than a self-join.`,
        explanationBn: `\`doctors\` table-এ \`manager_id\` একই table-এর অন্য row-কে দেখায়। তাই কর্মী আর তার manager-এর নাম পাশাপাশি দেখাতে table-কে নিজের সাথেই JOIN করতে হয়।

কৌশল: একই table-কে দুটো আলাদা নামে ভাবো, \`e\` (কর্মী) আর \`m\` (manager), যেন দুটো আলাদা কপি। \`m.id = e.manager_id\` জোড়া মেলায়।

LEFT JOIN দেওয়ায় Dr. Nusrat (যার manager নেই) বাদ পড়েননি, তার manager NULL। Inner join হলে তিনি হারিয়ে যেতেন।

পুরো chain (manager-এর manager-এর manager...) দরকার হলে প্রতিটা ধাপের জন্য আলাদা join না লিখে recursive CTE ব্যবহার করো।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Each Cardiology doctor with their manager',
            code: `SELECT e.name AS doctor, m.name AS manager
FROM doctors AS e
LEFT JOIN doctors AS m ON m.id = e.manager_id
WHERE e.department_id = 1
ORDER BY e.id;`,
            resultTable: {
              columns: ['doctor', 'manager'],
              rows: [
                ['Dr. Nusrat Rahman', null],
                ['Dr. Arif Hossain', 'Dr. Nusrat Rahman'],
                ['Dr. Sadia Islam', 'Dr. Arif Hossain'],
                ['Dr. Tanvir Ahmed', 'Dr. Arif Hossain'],
                ['Dr. Shirin Sultana', 'Dr. Sadia Islam'],
              ],
            },
          },
        ],
        pitfalls: [
          'Forgetting aliases: the column references become ambiguous.',
          'Using an inner join and losing the root of the hierarchy.',
        ],
        followUps: [
          'How would you list the whole management chain?',
          'Which doctors earn more than their manager?',
        ],
      },
      related: ['sql-out-employee-vs-manager', 'sql-recursive-cte', 'sql-lag-lead'],
    },
    {
      id: 'sql-join-fan-out',
      level: 'intermediate',
      priority: 2,
      question: 'Why can a join make SUM or COUNT too large, and how do you fix it?',
      tags: ['joins', 'fan-out', 'aggregation', 'duplicates'],
      answer: {
        interview: `**Joining a one-to-many relationship repeats the "one" side once per matching row (fan-out), so aggregating a column from that side counts it several times.**

- Example: summing department budgets after joining to doctors counts Cardiology's budget 5 times.
- Fixes:
  - Aggregate before joining (pre-aggregate in a subquery/CTE, then join the totals).
  - Use \`EXISTS\` when you only need to filter by the other table.
  - Join two independent one-to-many tables separately, never both at once (that multiplies them by each other).
- \`DISTINCT\` inside the aggregate (\`SUM(DISTINCT …)\`) is a trap: it also merges genuinely equal values.`,
        explanationBn: `ধরো জানতে চাও "যেসব department-এ doctor আছে, তাদের মোট budget কত?" departments আর doctors JOIN করলে Cardiology-র row আসে 5 বার (5 জন doctor), প্রতিটায় একই budget 500000। তারপর \`SUM\` করলে Cardiology-র budget গোনা হয় পাঁচবার। ফল 4,520,000, অথচ আসল যোগফল 1,750,000।

একে বলে **fan-out**: one-to-many join-এ "one" দিকের row গুণ হয়ে যায়।

সমাধান: যেটা গুনতে চাও সেটা যেন গুণ না হয়। এখানে শুধু "doctor আছে কিনা" জানা দরকার, তাই JOIN না করে \`EXISTS\` দিয়ে filter। অথবা আগে আলাদাভাবে aggregate করে তারপর join।

\`SUM(DISTINCT budget)\` লিখে "ঠিক" করার চেষ্টা বিপজ্জনক: দুই department-এর budget সমান হলে তাদের একটাকে বাদ দিয়ে দেবে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Wrong: each budget is repeated once per doctor',
            code: `SELECT SUM(dep.budget) AS total_budget
FROM departments AS dep
JOIN doctors AS d ON d.department_id = dep.id;`,
            resultTable: { columns: ['total_budget'], rows: [['4520000.00']] },
          },
          {
            lang: 'sql',
            caption: 'Right: filter with EXISTS, no multiplication',
            code: `SELECT SUM(dep.budget) AS total_budget
FROM departments AS dep
WHERE EXISTS (SELECT 1 FROM doctors AS d WHERE d.department_id = dep.id);`,
            resultTable: { columns: ['total_budget'], rows: [['1750000.00']] },
          },
        ],
        pitfalls: [
          'Joining orders and payments and shipments together in one query: the counts multiply.',
          'Adding DISTINCT to hide duplicates instead of fixing the join.',
        ],
        followUps: [
          'How would you show each department with its doctor count and its total payments in one query?',
        ],
      },
      related: ['sql-distinct-vs-group-by', 'sql-exists-vs-in'],
    },
    {
      id: 'sql-cross-join',
      level: 'intermediate',
      priority: 1,
      question: 'What is a CROSS JOIN, and when is it useful?',
      tags: ['joins', 'cross-join', 'cartesian-product'],
      answer: {
        interview: `**A CROSS JOIN returns every combination of rows from both tables (the Cartesian product): m × n rows, with no join condition.**

- Useful on purpose: generating all combinations (every doctor × every weekday for a schedule grid), a calendar × groups for gap-filling reports, or attaching a one-row settings/total row to every row.
- Dangerous by accident: a missing join condition (or old-style \`FROM a, b\` without WHERE) silently produces a huge result.`,
        explanationBn: `CROSS JOIN মানে প্রতিটা row-এর সাথে অন্য table-এর প্রতিটা row জোড়া। 6 department × 12 doctor = 72 row।

কাজের জায়গা: সব সম্ভাব্য জোড়া বানানো। যেমন প্রতিটা doctor-এর সপ্তাহের প্রতিটা দিনের জন্য একটা schedule ঘর, বা প্রতিটা দিন × প্রতিটা department-এর report, যেখানে ফাঁকা ঘরেও 0 দেখাতে হবে।

বিপদ: ভুল করে join-এর শর্ত বাদ পড়লে (যেমন \`FROM a, b\` লিখে WHERE ভুলে গেলে) একই ঘটনা ঘটে, আর বড় table-এ কোটি কোটি row তৈরি হয়ে query আটকে যায়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Every department paired with every doctor',
            code: `SELECT COUNT(*) AS combinations
FROM departments
CROSS JOIN doctors;`,
            resultTable: { columns: ['combinations'], rows: [[72]] },
          },
        ],
        pitfalls: ['FROM a, b without a WHERE condition is an implicit cross join.'],
        followUps: ['How would you report appointments per day per department, including zeros?'],
      },
      related: ['sql-generate-series', 'sql-join-types'],
    },
  ],
});

import { defineSection, type SectionQuestion } from '../../define';
import type { CodeExample, Level, Priority, ResultTable } from '../../schema';

/** A result table as markdown, for the revealed answer (NULL shown like psql's \pset null). */
function markdownTable(table: ResultTable): string {
  if (table.rows.length === 0)
    return `| ${table.columns.join(' | ')} |\n| ${table.columns.map(() => '---').join(' | ')} |\n\n*(0 rows)*`;
  const cell = (value: ResultTable['rows'][number][number]) =>
    value === null ? '*NULL*' : String(value);
  return [
    `| ${table.columns.join(' | ')} |`,
    `| ${table.columns.map(() => '---').join(' | ')} |`,
    ...table.rows.map((row) => `| ${row.map(cell).join(' | ')} |`),
  ].join('\n');
}

/**
 * "What does this query return?" puzzles. The query is shown in the question and repeated as
 * the first example, so `npm run verify:outputs` checks the revealed result against PostgreSQL.
 */
function puzzle(p: {
  id: string;
  level: Level;
  priority: Priority;
  title: string;
  tags: string[];
  code: string;
  resultTable?: ResultTable;
  output?: string;
  why: string;
  explanationBn: string;
  more?: CodeExample[];
  pitfalls?: string[];
  followUps?: string[];
  related?: string[];
}): SectionQuestion {
  const revealed = [
    p.output ? `\`\`\`text\n${p.output}\n\`\`\`` : '',
    p.resultTable ? markdownTable(p.resultTable) : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  return {
    id: p.id,
    level: p.level,
    priority: p.priority,
    question: `${p.title}\n\n\`\`\`sql\n${p.code}\n\`\`\``,
    tags: ['output-prediction', ...p.tags],
    answer: {
      interview: `**Result:**\n\n${revealed}\n\n${p.why}`,
      explanationBn: p.explanationBn,
      examples: [
        {
          lang: 'sql',
          code: p.code,
          ...(p.output ? { output: p.output } : {}),
          ...(p.resultTable ? { resultTable: p.resultTable } : {}),
          caption: 'The puzzle, with its real result (PostgreSQL)',
        },
        ...(p.more ?? []),
      ],
      pitfalls: p.pitfalls,
      followUps: p.followUps,
    },
    related: p.related,
  };
}

export const outputPrediction = defineSection({
  id: 'sql-output-prediction',
  title: 'Output Prediction',
  description:
    'Classic "what does this query return?" puzzles: NULL logic, COUNT variants, NOT IN with NULLs, integer division, LEFT JOIN filters, BETWEEN on timestamps and more. Predict first, then reveal.',
  order: 14,
  questions: [
    // ───────────────────────────── Foundation ─────────────────────────────
    puzzle({
      id: 'sql-out-null-logic',
      level: 'foundation',
      priority: 3,
      title: 'NULL comparisons and three-valued logic: what does this return?',
      tags: ['null', 'three-valued-logic', 'coalesce'],
      code: `SELECT NULL = NULL        AS equals,
       NULL IS NULL       AS is_null,
       NULL <> 1          AS not_equal,
       NULL OR true       AS or_true,
       NULL AND false     AS and_false,
       COALESCE(NULL, 'x') AS coalesced;`,
      resultTable: {
        columns: ['equals', 'is_null', 'not_equal', 'or_true', 'and_false', 'coalesced'],
        rows: [[null, true, null, true, false, 'x']],
      },
      why: `- NULL means "unknown", so any comparison with it (\`=\`, \`<>\`, \`<\`) is **unknown**, shown as NULL, not false.
- Test for NULL with \`IS NULL\` / \`IS NOT NULL\` (or \`IS DISTINCT FROM\` to compare two possibly-NULL values).
- \`unknown OR true\` is true and \`unknown AND false\` is false: the result is decided regardless of the unknown.
- A \`WHERE\` clause keeps only rows where the condition is **true**, so unknown rows are dropped just like false ones.`,
      explanationBn: `SQL-এ NULL মানে "মান জানা নেই", শূন্য বা খালি string না। তাই SQL তিন ধরনের সত্য মানে: true, false, আর **unknown**।

- \`NULL = NULL\`: দুটো অজানা মান কি সমান? জানা নেই, তাই NULL (unknown)। এটাই সবচেয়ে বড় ফাঁদ।
- \`NULL IS NULL\`: "এটা কি অজানা?" হ্যাঁ, true। NULL পরীক্ষার একমাত্র সঠিক উপায়।
- \`NULL <> 1\`: অজানা মান 1 কিনা জানা নেই, তাই NULL।
- \`NULL OR true\`: একটা দিক true হলেই OR true, অন্যটা যা-ই হোক।
- \`NULL AND false\`: একটা দিক false হলেই AND false।
- \`COALESCE\`: প্রথম non-NULL মান দেয়, তাই 'x'।

বাস্তব প্রভাব: \`WHERE email = NULL\` কখনো কোনো row দেবে না। \`WHERE email IS NULL\` লিখতে হয়।`,
      pitfalls: [
        "WHERE col = NULL never matches; WHERE col <> 'x' also silently skips rows where col is NULL.",
      ],
      followUps: ['What does IS DISTINCT FROM do?', 'Why does NOT IN behave strangely with NULLs?'],
      related: ['sql-out-not-in-null', 'sql-out-count-null'],
    }),
    puzzle({
      id: 'sql-out-count-null',
      level: 'foundation',
      priority: 3,
      title: 'COUNT(*) vs COUNT(column) vs COUNT(DISTINCT): what does this return?',
      tags: ['count', 'null', 'aggregation', 'distinct'],
      code: `SELECT COUNT(*)                      AS all_rows,
       COUNT(email)                  AS with_email,
       COUNT(department_id)          AS with_dept,
       COUNT(DISTINCT department_id) AS departments
FROM doctors;`,
      resultTable: {
        columns: ['all_rows', 'with_email', 'with_dept', 'departments'],
        rows: [[12, 9, 11, 5]],
      },
      why: `- \`COUNT(*)\` counts **rows**: all 12 doctors.
- \`COUNT(column)\` counts rows where that column is **not NULL**: 3 doctors have no email, Rafiq Mia has no department.
- \`COUNT(DISTINCT column)\` counts distinct non-NULL values: doctors work in 5 departments (Oncology has none, and NULL isn't counted).
- Every aggregate except \`COUNT(*)\` ignores NULLs.`,
      explanationBn: `তিনটা COUNT দেখতে একই রকম, কিন্তু প্রশ্ন আলাদা:

- \`COUNT(*)\`: "কয়টা row আছে?" NULL থাকুক বা না থাকুক, 12।
- \`COUNT(email)\`: "কয়টা row-এ email আছে?" NULL বাদ। Kamal, Rumana আর Rafiq-এর email নেই, তাই 9।
- \`COUNT(department_id)\`: Rafiq-এর department NULL, তাই 11।
- \`COUNT(DISTINCT department_id)\`: আলাদা আলাদা department কয়টা? 1, 2, 3, 4, 5, মোট 5। NULL গোনা হয় না, আর Oncology (6)-এ কোনো doctor নেই।

মনে রাখো: \`COUNT(*)\` ছাড়া সব aggregate (\`SUM\`, \`AVG\`, \`MAX\`, \`COUNT(col)\`) NULL উপেক্ষা করে।`,
      pitfalls: ['COUNT(column) is not a faster COUNT(*); it answers a different question.'],
      followUps: ['What does AVG do with NULL values?'],
      related: ['sql-out-null-logic', 'sql-out-avg-null'],
    }),
    puzzle({
      id: 'sql-out-integer-division',
      level: 'foundation',
      priority: 2,
      title: 'Integer division: what does this return?',
      tags: ['integer-division', 'numeric', 'data-types', 'casting'],
      code: `SELECT 7 / 2       AS int_div,
       7 % 2       AS remainder,
       7 / 2.0     AS numeric_div,
       7::numeric / 2 AS cast_div,
       -7 / 2      AS negative;`,
      resultTable: {
        columns: ['int_div', 'remainder', 'numeric_div', 'cast_div', 'negative'],
        rows: [[3, 1, '3.5000000000000000', '3.5000000000000000', -3]],
      },
      why: `- \`integer / integer\` is integer division: the fraction is discarded, so \`7 / 2 = 3\`.
- It truncates **toward zero**: \`-7 / 2 = -3\`, not -4.
- If either side is \`numeric\` (\`2.0\`, or a cast), the result is \`numeric\`: \`3.5000000000000000\`.
- Classic bug: \`completed / total\` for a percentage returns 0. Write \`100.0 * completed / total\` or cast first.`,
      explanationBn: `PostgreSQL-এ দুটো integer ভাগ করলে ফলও integer, দশমিক অংশ কেটে ফেলা হয়। তাই \`7 / 2\` = 3, 3.5 না।

- \`7 % 2\`: ভাগশেষ, 1।
- \`7 / 2.0\`: একটা দিক \`numeric\`, তাই পুরো হিসাব numeric, 3.5 (অনেক দশমিক ঘর সহ)।
- \`7::numeric / 2\`: cast করেও একই ফল।
- \`-7 / 2\`: শূন্যের দিকে কাটে, তাই -3 (গণিতের floor হলে -4 হতো)।

বাস্তবে সবচেয়ে common bug: "no-show rate" বের করতে \`no_shows / total\` লিখলে 2/6 = 0 আসে। \`100.0 * no_shows / total\` লিখলে ঠিক 33.33।`,
      pitfalls: [
        'COUNT(...) returns bigint, so COUNT(a) / COUNT(b) is integer division too.',
        'MySQL’s / always returns a decimal (it has DIV for integer division), so the same query behaves differently there.',
      ],
      followUps: ['How would you compute a percentage rounded to one decimal place?'],
      related: ['sql-out-avg-null'],
    }),
    puzzle({
      id: 'sql-out-alias-in-where',
      level: 'foundation',
      priority: 2,
      title: 'Using a SELECT alias in WHERE: what does this return?',
      tags: ['alias', 'execution-order', 'where'],
      code: `SELECT name, salary * 12 AS annual
FROM doctors
WHERE annual > 2000000;`,
      output: `ERROR:  column "annual" does not exist`,
      why: `- \`WHERE\` is evaluated **before** the SELECT list, so the alias \`annual\` doesn't exist yet.
- Logical order: \`FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT\`.
- Fix: repeat the expression (\`WHERE salary * 12 > 2000000\`) or compute it in a subquery/CTE.
- \`ORDER BY annual\` **does** work, because ORDER BY runs after SELECT.`,
      explanationBn: `আমরা SQL লিখি \`SELECT\` দিয়ে শুরু করে, কিন্তু database চালায় অন্য ক্রমে: আগে \`FROM\`, তারপর \`WHERE\`, অনেক পরে \`SELECT\`।

তাই \`WHERE\` চলার সময় \`annual\` নামটা তখনো জন্মায়নি; Postgres খোঁজে \`doctors\` table-এ \`annual\` নামের column, পায় না, error দেয়।

সমাধান:
- Expression আবার লেখো: \`WHERE salary * 12 > 2000000\`।
- অথবা CTE/subquery-তে আগে \`annual\` বানাও, তারপর বাইরে filter।

\`ORDER BY annual\` কিন্তু ঠিকঠাক চলে, কারণ \`ORDER BY\` চলে \`SELECT\`-এর পরে। একই কারণে \`HAVING\`-এও alias দেওয়া যায় না (PostgreSQL-এ)।`,
      followUps: ['Can you use a SELECT alias in GROUP BY in PostgreSQL?'],
      related: ['sql-window-in-where'],
    }),
    puzzle({
      id: 'sql-out-union-vs-union-all',
      level: 'foundation',
      priority: 2,
      title: 'UNION removes duplicates, including NULLs: what does this return?',
      tags: ['union', 'union-all', 'set-operations', 'null'],
      code: `SELECT city FROM patients WHERE gender = 'F'
UNION
SELECT city FROM patients WHERE gender = 'M'
ORDER BY city NULLS LAST;`,
      resultTable: {
        columns: ['city'],
        rows: [['Chattogram'], ['Dhaka'], ['Khulna'], ['Rajshahi'], ['Sylhet'], [null]],
      },
      why: `- \`UNION\` combines both results and **removes duplicate rows**: 14 patients, but only 6 distinct cities.
- For duplicate removal, two NULLs count as the same, so NULL appears once (unlike \`NULL = NULL\`).
- \`UNION ALL\` keeps every row (14) and is faster, because it skips the sort/hash needed to deduplicate.
- The \`ORDER BY\` applies to the whole combined result, not just the second query.`,
      explanationBn: `\`UNION\` দুটো query-র ফল জোড়া লাগায় **আর duplicate মুছে দেয়**। মহিলা patient-দের শহর আর পুরুষদের শহর মিলিয়ে অনেক Dhaka, Chattogram, কিন্তু ফলাফলে প্রতিটা একবার।

মজার ব্যাপার: \`NULL = NULL\` unknown হলেও, duplicate মোছার সময় দুটো NULL-কে একই ধরা হয়। Tania আর Rupa দুজনেরই শহর NULL, কিন্তু ফলে NULL একবারই আছে। (\`DISTINCT\` আর \`GROUP BY\`-ও এভাবেই NULL-কে এক group-এ রাখে।)

\`UNION ALL\` কিছু মোছে না, সব 14টা row রাখে। Duplicate মোছার জন্য sort বা hash লাগে না বলে এটা দ্রুত। তাই duplicate থাকবে না জানলে বা থাকলেও সমস্যা না হলে \`UNION ALL\` ব্যবহার করো।

শেষের \`ORDER BY\` পুরো জোড়া লাগানো ফলের উপর কাজ করে।`,
      more: [
        {
          lang: 'sql',
          caption: 'UNION ALL keeps every row',
          code: `SELECT COUNT(*) AS union_all_rows FROM (
  SELECT city FROM patients WHERE gender = 'F'
  UNION ALL
  SELECT city FROM patients WHERE gender = 'M'
) AS t;`,
          resultTable: { columns: ['union_all_rows'], rows: [[14]] },
        },
      ],
      pitfalls: [
        'Using UNION by habit where UNION ALL is correct adds an unnecessary sort or hash step.',
      ],
      followUps: ['What do INTERSECT and EXCEPT do?'],
      related: ['sql-out-null-sorting-distinct'],
    }),
    puzzle({
      id: 'sql-out-string-null',
      level: 'foundation',
      priority: 1,
      title: 'String concatenation with NULL: what does this return?',
      tags: ['null', 'strings', 'concat', 'coalesce'],
      code: `SELECT 'Dr. ' || NULL            AS pipe_concat,
       concat('Dr. ', NULL, 'X') AS concat_fn,
       concat_ws(', ', 'Dhaka', NULL, 'BD') AS concat_ws_fn,
       length('')                AS empty_len,
       '' IS NULL                AS empty_is_null;`,
      resultTable: {
        columns: ['pipe_concat', 'concat_fn', 'concat_ws_fn', 'empty_len', 'empty_is_null'],
        rows: [[null, 'Dr. X', 'Dhaka, BD', 0, false]],
      },
      why: `- The \`||\` operator returns NULL if any operand is NULL.
- \`concat()\` treats NULL as an empty string; \`concat_ws()\` (with separator) skips NULLs entirely, so there's no double comma.
- An empty string \`''\` is a real value in PostgreSQL, not NULL (Oracle treats them as the same).
- Use \`COALESCE(col, '')\` or \`concat\` when building display names from optional columns.`,
      explanationBn: `- \`'Dr. ' || NULL\`: \`||\` operator-এ কোনো একটা অংশ NULL হলে পুরো ফলই NULL। "Dr. + অজানা = অজানা"।
- \`concat()\`: NULL-কে খালি string ধরে, তাই "Dr. X"।
- \`concat_ws(', ', ...)\`: প্রথম argument হলো separator; NULL পুরোপুরি বাদ দেয়, তাই "Dhaka, , BD" না হয়ে "Dhaka, BD"। ঠিকানা জোড়া লাগাতে খুব কাজের।
- \`''\` (খালি string) PostgreSQL-এ সত্যিকারের একটা মান, দৈর্ঘ্য 0, NULL না। (Oracle-এ \`''\` আর NULL একই জিনিস, তাই সেখান থেকে আসা লোকেরা প্রায়ই অবাক হয়।)`,
      pitfalls: ["first_name || ' ' || last_name returns NULL for everyone without a last name."],
      related: ['sql-out-null-logic'],
    }),

    // ──────────────────────────── Intermediate ────────────────────────────
    puzzle({
      id: 'sql-out-not-in-null',
      level: 'intermediate',
      priority: 3,
      title: 'NOT IN with a subquery: which departments have no doctors?',
      tags: ['not-in', 'null', 'subquery', 'not-exists', 'anti-join'],
      code: `SELECT name FROM departments
WHERE id NOT IN (SELECT department_id FROM doctors);`,
      resultTable: { columns: ['name'], rows: [] },
      why: `- Zero rows, even though Oncology has no doctors.
- The subquery returns a NULL (Rafiq Mia has no department). \`6 NOT IN (1, 2, ..., NULL)\` means \`6 <> 1 AND ... AND 6 <> NULL\`, and \`6 <> NULL\` is unknown, so the whole condition is unknown for **every** row.
- Fix: \`NOT EXISTS\` (NULL-safe, and usually planned as an efficient anti-join), or filter \`WHERE department_id IS NOT NULL\` in the subquery.
- \`IN\` is not affected the same way; only the negated form breaks.`,
      explanationBn: `এটা SQL interview-এর সবচেয়ে প্রিয় ফাঁদগুলোর একটা। Oncology-তে কোনো doctor নেই, তবুও ফল খালি!

কারণ: subquery-র ফলে একটা NULL আছে (Rafiq Mia-র department নেই)। \`NOT IN\` আসলে অনেকগুলো \`<>\`-এর AND:
\`6 <> 1 AND 6 <> 2 AND ... AND 6 <> NULL\`
শেষ অংশটা unknown। "সব true AND একটা unknown" = unknown। আর \`WHERE\` শুধু true row রাখে, তাই Oncology বাদ। প্রতিটা department-এর ক্ষেত্রেই একই ঘটনা, তাই 0 row।

Analogy: "এই তালিকার কারো সাথে তোমার নাম মেলে না তো?" তালিকায় একটা নাম ঝাপসা (NULL) হলে তুমি নিশ্চিতভাবে "না" বলতে পারো না।

সমাধান: \`NOT EXISTS\`। এটা প্রতিটা department-এর জন্য জিজ্ঞেস করে "এমন কোনো doctor আছে কি যার department এটা?" NULL এখানে কোনো ঝামেলা করে না, আর Oncology ঠিকঠাক আসে।`,
      more: [
        {
          lang: 'sql',
          caption: 'NOT EXISTS is NULL-safe',
          code: `SELECT name FROM departments AS dep
WHERE NOT EXISTS (SELECT 1 FROM doctors AS d WHERE d.department_id = dep.id);`,
          resultTable: { columns: ['name'], rows: [['Oncology']] },
        },
      ],
      pitfalls: [
        'A column that has no NULLs today can get one tomorrow; prefer NOT EXISTS for anti-joins.',
      ],
      followUps: [
        'What is the difference between EXISTS and IN?',
        'How else can you find rows with no match (LEFT JOIN ... IS NULL)?',
      ],
      related: ['sql-out-null-logic', 'sql-out-count-star-left-join'],
    }),
    puzzle({
      id: 'sql-out-left-join-where',
      level: 'intermediate',
      priority: 3,
      title: 'LEFT JOIN with a filter in WHERE: does every department appear?',
      tags: ['left-join', 'where-vs-on', 'outer-join', 'null'],
      code: `SELECT dep.name, COUNT(d.id) AS senior_doctors
FROM departments AS dep
LEFT JOIN doctors AS d ON d.department_id = dep.id
WHERE d.salary >= 150000
GROUP BY dep.name
ORDER BY dep.name;`,
      resultTable: {
        columns: ['name', 'senior_doctors'],
        rows: [
          ['Cardiology', 2],
          ['Neurology', 1],
          ['Orthopedics', 2],
          ['Pediatrics', 1],
        ],
      },
      why: `- Dermatology and Oncology disappear, even though it is a LEFT JOIN.
- The LEFT JOIN keeps Oncology with \`d.salary = NULL\`; then \`WHERE d.salary >= 150000\` is unknown for that row and removes it. Dermatology's only doctor earns 120000, so its row is removed too.
- A WHERE condition on the right table turns a LEFT JOIN into an inner join.
- Fix: move the condition into \`ON\`, so it only decides which doctors match, not which departments survive.`,
      explanationBn: `LEFT JOIN-এর প্রতিশ্রুতি: বাম table-এর (departments) প্রতিটা row থাকবে। তাহলে Dermatology আর Oncology গেল কোথায়?

ধাপে ধাপে:
1. LEFT JOIN: Oncology-র কোনো doctor নেই, তাই তার row-এ doctor-এর সব column NULL।
2. তারপর \`WHERE d.salary >= 150000\`: Oncology-র salary NULL, তুলনা unknown, row বাদ। Dermatology-র একমাত্র doctor-এর salary 120000, শর্ত false, row বাদ।

মানে \`WHERE\` চলে join শেষ হওয়ার **পরে**, আর ডান table-এর column-এ শর্ত দিয়ে সে LEFT JOIN-এর রেখে দেওয়া row-গুলো মুছে ফেলে। ফল inner join-এর মতো।

সমাধান: শর্তটা \`ON\`-এ নাও। তখন শর্ত শুধু ঠিক করে "কোন doctor মিলবে"; department সবসময় থাকে। মেলে না এমন department-এ \`COUNT(d.id)\` = 0।

নিয়ম: LEFT JOIN-এ **ডান table-এর filter \`ON\`-এ, বাম table-এর filter \`WHERE\`-এ।**`,
      more: [
        {
          lang: 'sql',
          caption: 'The filter in ON keeps every department',
          code: `SELECT dep.name, COUNT(d.id) AS senior_doctors
FROM departments AS dep
LEFT JOIN doctors AS d ON d.department_id = dep.id AND d.salary >= 150000
GROUP BY dep.name
ORDER BY dep.name;`,
          resultTable: {
            columns: ['name', 'senior_doctors'],
            rows: [
              ['Cardiology', 2],
              ['Dermatology', 0],
              ['Neurology', 1],
              ['Oncology', 0],
              ['Orthopedics', 2],
              ['Pediatrics', 1],
            ],
          },
        },
      ],
      pitfalls: [
        'WHERE right_table.col IS NULL is the one right-table WHERE condition that is intended: it finds unmatched rows.',
      ],
      followUps: ['When is it correct to filter the right table in WHERE?'],
      related: ['sql-out-count-star-left-join', 'sql-generate-series'],
    }),
    puzzle({
      id: 'sql-out-between-timestamp',
      level: 'intermediate',
      priority: 2,
      title: 'BETWEEN on a timestamp column: how many payments from March 4 to March 6?',
      tags: ['between', 'timestamp', 'date-ranges', 'half-open-interval'],
      code: `SELECT COUNT(*) AS payments
FROM payments
WHERE paid_at BETWEEN '2024-03-04' AND '2024-03-06';`,
      resultTable: { columns: ['payments'], rows: [[2]] },
      why: `- There are three payments on those days, but the query finds 2.
- \`'2024-03-06'\` compared with a timestamp means \`2024-03-06 00:00:00\`, so the payment at \`2024-03-06 23:59:30\` is outside the range.
- \`BETWEEN\` is inclusive on both ends: \`>= low AND <= high\`.
- Fix: a half-open range, \`paid_at >= '2024-03-04' AND paid_at < '2024-03-07'\`. It is exact for any precision and can use an index (unlike \`paid_at::date BETWEEN ...\`, which wraps the column in a cast).`,
      explanationBn: `4, 5 আর 6 মার্চে তিনটা payment, কিন্তু query বলছে 2। কেন?

\`paid_at\` হলো timestamp (তারিখ + সময়)। \`'2024-03-06'\`-কে timestamp-এর সাথে তুলনা করলে সেটা হয়ে যায় \`2024-03-06 00:00:00\`, মানে 6 তারিখের **শুরু**। Payment 17 হয়েছে 6 মার্চ রাত 11:59:30-এ, যা 00:00:00-এর পরে, তাই বাদ।

এই ফাঁদ বাস্তবে খুব হয়: "আজকের বিক্রি" report-এ দিনের প্রায় সব data বাদ পড়ে যায়।

সমাধান: **half-open range**: শুরু \`>=\`, শেষ \`<\` পরের দিন। \`>= '2024-03-04' AND < '2024-03-07'\` মানে 4 তারিখের শুরু থেকে 7 তারিখের শুরুর ঠিক আগ পর্যন্ত। সময়ের precision যা-ই হোক (সেকেন্ড, মাইক্রোসেকেন্ড), এটা নির্ভুল। আর column-এ কোনো function নেই, তাই index-ও কাজ করে।`,
      more: [
        {
          lang: 'sql',
          caption: 'A half-open range includes the whole last day',
          code: `SELECT COUNT(*) AS payments
FROM payments
WHERE paid_at >= '2024-03-04' AND paid_at < '2024-03-07';`,
          resultTable: { columns: ['payments'], rows: [[3]] },
        },
      ],
      pitfalls: ["Patching it with '2024-03-06 23:59:59' still misses fractional seconds."],
      followUps: [
        'How would you get all payments made "this month" so the query can use an index?',
      ],
      related: ['sql-timestamp-vs-timestamptz'],
    }),
    puzzle({
      id: 'sql-out-count-star-left-join',
      level: 'intermediate',
      priority: 2,
      title: 'COUNT(*) after a LEFT JOIN: how many doctors does Oncology have?',
      tags: ['count', 'left-join', 'null', 'aggregation'],
      code: `SELECT dep.name,
       COUNT(*)    AS count_star,
       COUNT(d.id) AS count_doctors
FROM departments AS dep
LEFT JOIN doctors AS d ON d.department_id = dep.id
GROUP BY dep.name
ORDER BY dep.name;`,
      resultTable: {
        columns: ['name', 'count_star', 'count_doctors'],
        rows: [
          ['Cardiology', 5, 5],
          ['Dermatology', 1, 1],
          ['Neurology', 2, 2],
          ['Oncology', 1, 0],
          ['Orthopedics', 2, 2],
          ['Pediatrics', 1, 1],
        ],
      },
      why: `- \`COUNT(*)\` says Oncology has 1 doctor; \`COUNT(d.id)\` correctly says 0.
- The LEFT JOIN produces one row for Oncology with all doctor columns NULL. \`COUNT(*)\` counts that row; \`COUNT(d.id)\` skips it because \`d.id\` is NULL.
- After an outer join, count a non-nullable column from the optional side (usually its primary key).`,
      explanationBn: `LEFT JOIN-এ যে department-এর কোনো doctor নেই, সেটাও একটা row পায়, যেখানে doctor-এর সব column NULL। Oncology-র ক্ষেত্রে ঠিক এমন একটা row।

- \`COUNT(*)\` row গোনে, তাই সেই NULL-ভরা row-টাও গুনে 1 বলে। ভুল উত্তর!
- \`COUNT(d.id)\` শুধু সেই row গোনে যেখানে \`d.id\` NULL না। Oncology-তে 0। সঠিক।

বাকি department-এ দুটো সংখ্যা একই, কারণ সেখানে প্রতিটা row-এ সত্যিকারের doctor আছে। পার্থক্য শুধু "খালি" group-এ, আর ঠিক সেই জায়গাতেই bug লুকিয়ে থাকে, কারণ test data-য় প্রায়ই খালি group থাকে না।

নিয়ম: outer join-এর পরে গুনতে হলে ডান table-এর primary key গোনো।`,
      pitfalls: ['Tests with no empty groups hide this bug; include an empty parent in test data.'],
      related: ['sql-n-plus-one', 'sql-out-left-join-where'],
    }),
    puzzle({
      id: 'sql-out-avg-null',
      level: 'intermediate',
      priority: 2,
      title: 'AVG with NULL values: what does this return?',
      tags: ['avg', 'null', 'aggregation', 'coalesce'],
      code: `SELECT AVG(x)              AS avg_ignores_null,
       SUM(x) / COUNT(*)   AS sum_over_all_rows,
       AVG(COALESCE(x, 0)) AS avg_null_as_zero
FROM (VALUES (10), (20), (NULL)) AS t(x);`,
      resultTable: {
        columns: ['avg_ignores_null', 'sum_over_all_rows', 'avg_null_as_zero'],
        rows: [['15.0000000000000000', 10, '10.0000000000000000']],
      },
      why: `- \`AVG(x)\` ignores the NULL: \`(10 + 20) / 2 = 15\`.
- \`SUM(x) / COUNT(*)\` divides by all 3 rows: \`30 / 3 = 10\` (and it is integer division, since both sides are integers).
- \`AVG(COALESCE(x, 0))\` treats the missing value as 0: also 10.
- \`AVG\` of integers returns \`numeric\`, hence the many decimal places.
- Which one is "right" depends on what NULL means: "unknown" (ignore it) or "zero" (count it).`,
      explanationBn: `তিনটা row: 10, 20, আর NULL। গড় কত?

- \`AVG(x)\`: NULL উপেক্ষা করে, শুধু 10 আর 20-এর গড়, 15।
- \`SUM(x) / COUNT(*)\`: SUM-ও NULL উপেক্ষা করে (30), কিন্তু \`COUNT(*)\` তিনটা row-ই গোনে, তাই 30 / 3 = 10। (দুটোই integer, তাই integer division।)
- \`AVG(COALESCE(x, 0))\`: NULL-কে 0 বানিয়ে গড়: (10 + 20 + 0) / 3 = 10।

কোনটা সঠিক? নির্ভর করে NULL মানে কী তার উপর:
- একজন patient-এর rating দেওয়া হয়নি (অজানা): উপেক্ষা করাই ঠিক, \`AVG(x)\`।
- কোনো দিন বিক্রি হয়নি (মানে 0): গোনা উচিত, \`COALESCE(x, 0)\`।

\`AVG\` integer-এর উপর চালালেও \`numeric\` ফেরত দেয়, তাই অনেক দশমিক ঘর। দেখানোর জন্য \`ROUND(AVG(x), 2)\`।`,
      pitfalls: [
        'A hand-written SUM / COUNT(*) silently disagrees with AVG whenever NULLs are present.',
      ],
      related: ['sql-out-count-null', 'sql-out-integer-division'],
    }),
    puzzle({
      id: 'sql-out-employee-vs-manager',
      level: 'intermediate',
      priority: 2,
      title: 'Self-join: which doctors earn more than their manager?',
      tags: ['self-join', 'join', 'hierarchy'],
      code: `SELECT e.name AS doctor, e.salary, m.name AS manager, m.salary AS manager_salary
FROM doctors AS e
JOIN doctors AS m ON m.id = e.manager_id
WHERE e.salary > m.salary;`,
      resultTable: {
        columns: ['doctor', 'salary', 'manager', 'manager_salary'],
        rows: [['Dr. Mahbub Alam', '165000.00', 'Dr. Laila Haque', '160000.00']],
      },
      why: `- A **self-join** joins the table to itself under two aliases: \`e\` for the employee row, \`m\` for the manager row.
- \`ON m.id = e.manager_id\` pairs each doctor with their manager; the inner join drops Dr. Nusrat, who has no manager.
- Only Mahbub Alam (165000) earns more than his manager Laila Haque (160000).
- The aliases are required: without them, \`doctors.salary > doctors.salary\` would be ambiguous.`,
      explanationBn: `একই table-এ employee আর manager দুজনেই আছে: \`manager_id\` একই table-এর অন্য row-এর \`id\`-কে নির্দেশ করে। তাই table-কে নিজের সাথেই JOIN করতে হয়, এটাই **self-join**।

কৌশলটা হলো একই table-কে দুটো আলাদা নাম দেওয়া, যেন দুটো আলাদা কপি:
- \`e\` (employee): যে doctor-কে দেখছি।
- \`m\` (manager): তার manager-এর row।

\`ON m.id = e.manager_id\` প্রতিটা doctor-এর পাশে তার manager-কে বসায়। Dr. Nusrat-এর কোনো manager নেই (NULL), তাই inner join-এ সে বাদ। তারপর \`WHERE e.salary > m.salary\` শুধু সেই জোড়া রাখে যেখানে কর্মীর বেতন বেশি।

একমাত্র উত্তর Dr. Mahbub Alam: তার বেতন 1,65,000, তার manager Dr. Laila-র 1,60,000।`,
      followUps: [
        'How would you list each doctor’s full management chain (recursive CTE)?',
        'How would you include doctors without a manager?',
      ],
      related: ['sql-relationship-types'],
    }),

    // ────────────────────────────── Advanced ──────────────────────────────
    puzzle({
      id: 'sql-out-null-sorting-distinct',
      level: 'advanced',
      priority: 1,
      title: 'NULLs in COUNT(DISTINCT), DISTINCT and ORDER BY: what does this return?',
      tags: ['null', 'distinct', 'order-by', 'nulls-last'],
      code: `SELECT COUNT(DISTINCT city) AS distinct_cities,
       (SELECT COUNT(*) FROM (SELECT DISTINCT city FROM patients) AS t) AS distinct_rows,
       (SELECT city FROM patients ORDER BY city LIMIT 1) AS first_asc,
       (SELECT city FROM patients ORDER BY city DESC LIMIT 1) AS first_desc
FROM patients;`,
      resultTable: {
        columns: ['distinct_cities', 'distinct_rows', 'first_asc', 'first_desc'],
        rows: [[5, 6, 'Chattogram', null]],
      },
      why: `- \`COUNT(DISTINCT city)\` ignores NULL: 5 cities.
- \`SELECT DISTINCT city\` keeps NULL as one more distinct row: 6.
- PostgreSQL sorts NULLs as **larger than any value**: last in \`ASC\`, first in \`DESC\`. So the first row of \`ORDER BY city DESC\` is NULL.
- Control it explicitly with \`NULLS FIRST\` / \`NULLS LAST\`. (MySQL and SQL Server do the opposite by default: NULLs first in ASC.)`,
      explanationBn: `একই column, তিনভাবে NULL-এর সাথে আচরণ:

- \`COUNT(DISTINCT city)\`: aggregate, তাই NULL উপেক্ষা। Chattogram, Dhaka, Khulna, Rajshahi, Sylhet, মোট 5।
- \`SELECT DISTINCT city\`: row বাছাই, এখানে NULL-ও একটা আলাদা "মান" হিসেবে একবার থাকে, তাই 6টা row। একই column, একই শব্দ (DISTINCT), কিন্তু উত্তর আলাদা!
- **Sorting**: PostgreSQL NULL-কে সবচেয়ে বড় মান হিসেবে ধরে। ASC-তে NULL শেষে, তাই প্রথমে Chattogram। DESC-এ NULL সবার আগে, তাই "সবচেয়ে বড় শহর" খুঁজতে গিয়ে NULL পাওয়া গেল।

বাস্তব ফাঁদ: "সর্বোচ্চ বেতনের 5 জন" খুঁজতে \`ORDER BY salary DESC LIMIT 5\` লিখলে, salary NULL এমন row সবার উপরে চলে আসে। সমাধান: \`ORDER BY salary DESC NULLS LAST\`।

অন্য database (MySQL, SQL Server) default-এ উল্টো করে, তাই portable code-এ সবসময় \`NULLS FIRST/LAST\` লিখে দেওয়া ভালো।`,
      pitfalls: [
        'ORDER BY x DESC LIMIT n returns rows with NULL x first in PostgreSQL unless you add NULLS LAST.',
      ],
      related: ['sql-out-union-vs-union-all', 'sql-out-count-null'],
    }),
  ],
});

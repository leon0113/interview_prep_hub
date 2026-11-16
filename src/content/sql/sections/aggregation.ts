import { defineSection } from '../../define';

export const aggregation = defineSection({
  id: 'sql-aggregation',
  title: 'Aggregation & Grouping',
  description:
    'Aggregate functions and GROUP BY, WHERE vs HAVING, the "must appear in GROUP BY" rule, aggregates over empty sets, and ROLLUP / CUBE / GROUPING SETS.',
  order: 4,
  questions: [
    {
      id: 'sql-group-by-basics',
      level: 'foundation',
      priority: 3,
      question: 'How do GROUP BY and aggregate functions work?',
      tags: ['group-by', 'aggregation', 'count', 'avg', 'sum'],
      answer: {
        interview: `**GROUP BY splits rows into groups that share the same values in the listed columns, and aggregate functions (\`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`, \`string_agg\`, \`array_agg\`…) reduce each group to one value.**

- One output row per group; without GROUP BY, an aggregate turns the whole table into one row.
- Every selected column must be grouped or aggregated.
- Aggregates ignore NULL inputs (except \`COUNT(*)\`); NULL in a grouping column forms its own group.
- Filter rows before grouping with WHERE, filter groups after with HAVING.`,
        explanationBn: `\`GROUP BY department_id\` মানে: একই department-এর doctor-দের এক ঝুড়িতে রাখো। তারপর প্রতিটা ঝুড়ির উপর aggregate: কয়জন (\`COUNT\`), গড় বেতন (\`AVG\`)।

ফলাফলে প্রতিটা ঝুড়ির জন্য একটা row। Rafiq Mia-র department NULL, তাই NULL-এর জন্য আলাদা একটা ঝুড়ি তৈরি হয়েছে (শেষ row)। \`NULLS LAST\` দিয়ে সেটা শেষে রাখা হয়েছে।

\`AVG\` integer বা numeric-এর উপর numeric দেয়, অনেক দশমিক ঘর সহ, তাই \`ROUND(..., 2)\`।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Doctors and average salary per department',
            code: `SELECT department_id,
       COUNT(*) AS doctors,
       ROUND(AVG(salary), 2) AS avg_salary
FROM doctors
GROUP BY department_id
ORDER BY department_id NULLS LAST;`,
            resultTable: {
              columns: ['department_id', 'doctors', 'avg_salary'],
              rows: [
                [1, 5, '161000.00'],
                [2, 2, '157500.00'],
                [3, 1, '150000.00'],
                [4, 2, '162500.00'],
                [5, 1, '120000.00'],
                [null, 1, '120000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Forgetting that NULL forms its own group.',
          'Assuming GROUP BY sorts the output: add ORDER BY.',
        ],
        followUps: [
          'What is the difference between WHERE and HAVING?',
          'What is the difference between COUNT(*) and COUNT(column)?',
        ],
      },
      related: ['sql-where-vs-having', 'sql-out-count-null', 'sql-window-vs-group-by'],
    },
    {
      id: 'sql-where-vs-having',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between WHERE and HAVING?',
      tags: ['where', 'having', 'group-by', 'aggregation'],
      answer: {
        interview: `**WHERE filters rows before they are grouped; HAVING filters groups after aggregation, so only HAVING can use aggregate functions.**

| Aspect | WHERE | HAVING |
| --- | --- | --- |
| Filters | Individual rows | Groups |
| Runs | Before GROUP BY | After GROUP BY |
| Aggregates allowed | No | Yes: \`HAVING AVG(salary) > 150000\` |
| Works without GROUP BY | Yes | Yes (treats the whole result as one group), rarely used |
| Performance | Reduces rows early | Runs after the grouping work |

Put every condition that does not need an aggregate in WHERE: fewer rows are grouped, and indexes can help.`,
        explanationBn: `দুটোই filter, কিন্তু সময় আলাদা:
- **WHERE**: ঝুড়িতে রাখার **আগে** প্রতিটা row দেখে বাদ দেয়।
- **HAVING**: ঝুড়ি বানানো আর গোনা **শেষে** পুরো ঝুড়ি বাদ দেয়।

তাই "গড় বেতন 150000-এর বেশি" এমন শর্ত শুধু HAVING-এ চলে, কারণ গড় তখনই জানা যায়। উদাহরণে Pediatrics-এর গড় ঠিক 150000 (বেশি না) আর Dermatology 120000, তাই বাদ; বাকি তিন department থাকে।

আর যে শর্তে aggregate লাগে না (যেমন \`department_id IS NOT NULL\`), সেটা WHERE-এ দাও: কম row group করতে হয়, index-ও কাজে লাগে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'HAVING keeps only departments with a high average',
            code: `SELECT department_id, ROUND(AVG(salary), 2) AS avg_salary
FROM doctors
GROUP BY department_id
HAVING AVG(salary) > 150000
ORDER BY department_id;`,
            resultTable: {
              columns: ['department_id', 'avg_salary'],
              rows: [
                [1, '161000.00'],
                [2, '157500.00'],
                [4, '162500.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Writing WHERE AVG(salary) > 150000: aggregates are not allowed in WHERE.',
          'Putting plain row conditions in HAVING: correct, but slower and harder to read.',
        ],
        followUps: [
          'In what order is a SELECT evaluated?',
          'Can you use a SELECT alias in HAVING?',
        ],
      },
      related: ['sql-select-execution-order', 'sql-group-by-basics'],
    },
    {
      id: 'sql-group-by-rule',
      level: 'intermediate',
      priority: 2,
      question: 'Why does PostgreSQL say a column "must appear in the GROUP BY clause"?',
      tags: ['group-by', 'errors', 'functional-dependency'],
      answer: {
        interview: `**After grouping there is one output row per group, so every selected column must have one value per group: it must be in GROUP BY, be inside an aggregate, or be functionally dependent on a grouped primary key.**

- \`SELECT department_id, name, COUNT(*) … GROUP BY department_id\` fails: which of the five Cardiology names would it show?
- Fixes: add the column to GROUP BY, aggregate it (\`string_agg(name, ', ')\`, \`MIN(name)\`), or use a window function if you need every row.
- PostgreSQL allows columns of a table whose **primary key** is in GROUP BY (\`GROUP BY d.id\` lets you select \`d.name\`).
- MySQL with \`ONLY_FULL_GROUP_BY\` disabled returns an arbitrary value instead of an error, which hides bugs.`,
        explanationBn: `Group করার পর প্রতিটা group থেকে একটাই row বের হয়। Cardiology group-এ 5 জন doctor, তাই "name" column-এ কার নাম দেখাবে? Postgres অনুমান না করে error দেয়।

সমাধান তিনটা:
- নামটাও group-এ দাও (তাহলে প্রতিটা নাম আলাদা group, গোনাটা অর্থহীন হয়ে যেতে পারে)।
- নামগুলোকে aggregate করো: \`string_agg(name, ', ')\` সব নাম একসাথে জুড়ে দেয়।
- প্রতিটা row রেখে পাশে গোনা চাইলে window function: \`COUNT(*) OVER (PARTITION BY department_id)\`।

ব্যতিক্রম: কোনো table-এর primary key group-এ থাকলে সেই table-এর বাকি column নিশ্চিতভাবে একটাই মান, তাই Postgres সেগুলো select করতে দেয়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A non-grouped, non-aggregated column is rejected',
            code: `SELECT department_id, name, COUNT(*)
FROM doctors
GROUP BY department_id;`,
            output: `ERROR:  column "doctors.name" must appear in the GROUP BY clause or be used in an aggregate function`,
          },
        ],
        pitfalls: [
          'Adding every column to GROUP BY just to silence the error, which changes the groups.',
        ],
        followUps: ['How would you list the doctors of each department in one row?'],
      },
      related: ['sql-group-by-basics', 'sql-window-vs-group-by'],
    },
    {
      id: 'sql-aggregate-empty-set',
      level: 'intermediate',
      priority: 2,
      question: 'What do aggregates return when no rows match?',
      tags: ['aggregation', 'null', 'coalesce', 'edge-cases'],
      answer: {
        interview: `**Without GROUP BY, an aggregate query always returns exactly one row: \`COUNT\` gives 0, while \`SUM\`, \`AVG\`, \`MIN\` and \`MAX\` give NULL. With GROUP BY, no rows means no groups and no output rows at all.**

- Wrap sums in \`COALESCE(SUM(x), 0)\` when the caller expects a number.
- With GROUP BY, groups that have no rows don't appear; to show them with 0, start from the full list (LEFT JOIN or generate_series).
- The same applies after filtering: \`WHERE\` can remove every row of a group.`,
        explanationBn: `কোনো row না মিললে:
- **GROUP BY ছাড়া**: তবুও ঠিক একটা row আসে। \`COUNT\` বলে 0, কিন্তু \`SUM\`/\`AVG\`/\`MAX\` বলে NULL, কারণ "কিছু না-র যোগফল" অজানা। উদাহরণে 'crypto' পদ্ধতিতে কোনো payment নেই: n = 0, total = NULL।
- **GROUP BY সহ**: কোনো group-ই তৈরি হয় না, তাই কোনো row-ই আসে না।

Application যদি সংখ্যা আশা করে, NULL পেলে ভেঙে পড়তে পারে বা ভুল দেখাতে পারে। \`COALESCE(SUM(amount), 0)\` সেটাকে 0 বানায়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'COUNT says 0, SUM says NULL',
            code: `SELECT COUNT(*) AS n,
       SUM(amount) AS total,
       COALESCE(SUM(amount), 0) AS total_or_zero
FROM payments
WHERE method = 'crypto';`,
            resultTable: {
              columns: ['n', 'total', 'total_or_zero'],
              rows: [[0, null, '0']],
            },
          },
        ],
        pitfalls: [
          'Displaying a NULL total as an empty cell instead of 0.',
          'Expecting GROUP BY to return a row with 0 for a group that has no rows.',
        ],
        followUps: ['How would you show every payment method, including ones never used, with 0?'],
      },
      related: ['sql-out-avg-null', 'sql-generate-series'],
    },
    {
      id: 'sql-rollup-cube-grouping-sets',
      level: 'advanced',
      priority: 1,
      question: 'What do ROLLUP, CUBE and GROUPING SETS do?',
      tags: ['rollup', 'cube', 'grouping-sets', 'subtotals', 'reporting'],
      answer: {
        interview: `**They compute several groupings in one query, producing subtotals and grand totals; the "rolled-up" columns are NULL in those rows.**

| Clause | Groupings produced for \`(a, b)\` |
| --- | --- |
| \`GROUPING SETS ((a), (b))\` | Exactly the sets you list |
| \`ROLLUP (a, b)\` | \`(a, b)\`, \`(a)\`, \`()\`: hierarchical subtotals + grand total |
| \`CUBE (a, b)\` | \`(a, b)\`, \`(a)\`, \`(b)\`, \`()\`: every combination |

- \`GROUPING(col)\` returns 1 when the row is a subtotal for that column, so you can tell a subtotal NULL from a real NULL and label it ("TOTAL").
- One pass over the data instead of several \`UNION ALL\` queries.`,
        explanationBn: `Report-এ প্রায়ই লাগে: প্রতিটা ভাগের মোট, আর নিচে সব মিলিয়ে grand total। আলাদা আলাদা query লিখে \`UNION ALL\` করার বদলে একটাই query:

- **ROLLUP (method)**: প্রতিটা method-এর মোট + একটা grand total row (যেখানে method NULL)।
- **CUBE**: সব সম্ভাব্য combination-এর subtotal।
- **GROUPING SETS**: ঠিক যেগুলো চাও, সেগুলো।

Subtotal row-এ group-এর column NULL হয়। \`GROUPING(method)\` বলে দেয় এই NULL "সব মিলিয়ে" অর্থে কিনা, তাই উদাহরণে সেটাকে 'TOTAL' লেবেল দেওয়া হয়েছে আর সবার শেষে সাজানো হয়েছে। মোট 35400, যা চার পদ্ধতির যোগফল।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Revenue per payment method plus a grand total',
            code: `SELECT CASE WHEN GROUPING(method) = 1 THEN 'TOTAL' ELSE method END AS payment_method,
       SUM(amount) AS revenue
FROM payments
GROUP BY ROLLUP (method)
ORDER BY GROUPING(method), method;`,
            resultTable: {
              columns: ['payment_method', 'revenue'],
              rows: [
                ['bkash', '10000.00'],
                ['card', '12100.00'],
                ['cash', '7000.00'],
                ['insurance', '6300.00'],
                ['TOTAL', '35400.00'],
              ],
            },
          },
        ],
        pitfalls: [
          "Using COALESCE(col, 'TOTAL') when the column itself can be NULL: real NULL groups get mislabelled. Use GROUPING().",
        ],
        followUps: [
          'What is a star schema?',
          'How would you add a subtotal per month and department?',
        ],
      },
      related: ['sql-star-vs-snowflake', 'sql-group-by-basics'],
    },
  ],
});

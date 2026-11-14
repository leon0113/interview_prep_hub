import { defineSection } from '../../define';

export const windowFunctions = defineSection({
  id: 'sql-window-functions',
  title: 'Window Functions',
  description:
    'OVER, PARTITION BY and ORDER BY, ranking functions, LAG/LEAD, running totals, frame clauses, and the classic top-N-per-group pattern.',
  order: 8,
  questions: [
    {
      id: 'sql-window-function-basics',
      level: 'foundation',
      priority: 3,
      question: 'What is a window function, and what do OVER, PARTITION BY and ORDER BY do?',
      tags: ['window-functions', 'over', 'partition-by', 'analytics'],
      answer: {
        interview: `**A window function computes a value for each row from a set of related rows (its "window") without collapsing those rows into one.**

- \`OVER (...)\` turns a function into a window function. An empty \`OVER ()\` means the window is the whole result.
- \`PARTITION BY\` splits rows into groups; the function restarts for each group, like \`GROUP BY\` but every row stays.
- \`ORDER BY\` inside \`OVER\` orders rows within the partition. Ranking and \`LAG\`/\`LEAD\` need it, and with aggregates it makes the result *cumulative* (a running total).
- Any aggregate (\`SUM\`, \`AVG\`, \`COUNT\`, \`MAX\`) can be a window function, plus dedicated ones: \`ROW_NUMBER\`, \`RANK\`, \`DENSE_RANK\`, \`LAG\`, \`LEAD\`, \`NTILE\`, \`FIRST_VALUE\`.
- They run after \`WHERE\`, \`GROUP BY\` and \`HAVING\`, just before the final \`ORDER BY\` and \`LIMIT\`.

Real-world: "show each doctor's salary next to their department average" or "percent of total" in a single query, with no self-join.`,
        explanationBn: `সাধারণ aggregate (\`AVG\`, \`SUM\`) অনেকগুলো row মিলিয়ে **একটা** row বানায়। কিন্তু অনেক সময় আমরা প্রতিটা row রাখতে চাই, আর পাশে একটা হিসাব দেখাতে চাই: "এই doctor-এর salary, আর তার department-এর গড় salary"। এটাই **window function**-এর কাজ।

**Window** মানে: current row-এর জন্য যে row-গুলো দেখা হচ্ছে, সেই "জানালা"।
- \`OVER ()\`: জানালা = পুরো result। তাই \`COUNT(*) OVER ()\` প্রতিটা row-এ মোট row সংখ্যা বসায়।
- \`OVER (PARTITION BY department_id)\`: জানালা = একই department-এর row-গুলো। প্রতিটা department-এর জন্য হিসাব আলাদা করে শুরু হয়।
- \`OVER (ORDER BY ...)\`: জানালার ভেতরে row-গুলোর একটা ক্রম তৈরি হয়। ranking বা "আগের row" (\`LAG\`) এর জন্য এটা লাগে।

Analogy: একটা ক্লাসের result sheet ভাবো। \`GROUP BY\` হলো শুধু প্রতিটা section-এর গড় নম্বরের একটা ছোট তালিকা। Window function হলো পুরো sheet রেখে প্রতিটা ছাত্রের পাশে "তার section-এর গড়" লিখে দেওয়া।

Internally, PostgreSQL আগে \`FROM\`/\`WHERE\`/\`GROUP BY\` শেষ করে, তারপর row-গুলোকে partition আর order অনুযায়ী sort করে **WindowAgg** node-এ একবার পার হয়ে প্রতিটা row-এর মান বের করে। তাই window function \`WHERE\`-এ ব্যবহার করা যায় না, কারণ তখনো সেটা হিসাবই হয়নি।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Every doctor keeps their row; the department average sits beside it',
            code: `SELECT name, department_id, salary,
       ROUND(AVG(salary) OVER (PARTITION BY department_id), 2) AS dept_avg
FROM doctors
WHERE department_id IN (1, 2)
ORDER BY department_id, salary DESC, id;`,
            resultTable: {
              columns: ['name', 'department_id', 'salary', 'dept_avg'],
              rows: [
                ['Dr. Nusrat Rahman', 1, '250000.00', '161000.00'],
                ['Dr. Arif Hossain', 1, '180000.00', '161000.00'],
                ['Dr. Sadia Islam', 1, '140000.00', '161000.00'],
                ['Dr. Tanvir Ahmed', 1, '140000.00', '161000.00'],
                ['Dr. Shirin Sultana', 1, '95000.00', '161000.00'],
                ['Dr. Farzana Akter', 2, '180000.00', '157500.00'],
                ['Dr. Rumana Chowdhury', 2, '135000.00', '157500.00'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'An empty OVER () makes the whole result the window',
            code: `SELECT name, salary,
       COUNT(*) OVER () AS doctors_total,
       salary - MIN(salary) OVER () AS above_lowest
FROM doctors
ORDER BY salary DESC, id
LIMIT 4;`,
            resultTable: {
              columns: ['name', 'salary', 'doctors_total', 'above_lowest'],
              rows: [
                ['Dr. Nusrat Rahman', '250000.00', 12, '155000.00'],
                ['Dr. Arif Hossain', '180000.00', 12, '85000.00'],
                ['Dr. Farzana Akter', '180000.00', 12, '85000.00'],
                ['Dr. Mahbub Alam', '165000.00', 12, '70000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Window functions see the rows left after WHERE: doctors_total above is 12 because LIMIT runs later, not because the window ignores it.',
          'ORDER BY inside OVER only orders the window; it does not sort the output. Add a final ORDER BY for that.',
          'Adding ORDER BY to an aggregate window changes its meaning from "whole partition" to "running so far".',
        ],
        followUps: [
          'How is a window function different from GROUP BY?',
          'What is the difference between ROW_NUMBER, RANK and DENSE_RANK?',
          'Why can’t you use a window function in WHERE?',
        ],
      },
      related: ['sql-window-vs-group-by', 'sql-row-number-rank-dense-rank'],
    },
    {
      id: 'sql-window-vs-group-by',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between a window function and GROUP BY?',
      tags: ['window-functions', 'group-by', 'aggregation'],
      answer: {
        interview: `**GROUP BY collapses each group into one output row; a window function keeps every input row and attaches the group's value to each one.**

| Aspect | GROUP BY | Window function |
| --- | --- | --- |
| Output rows | One per group | One per input row |
| Non-grouped columns | Not allowed in SELECT (unless aggregated) | Allowed: every column is still there |
| Grouping keyword | \`GROUP BY col\` | \`OVER (PARTITION BY col)\` |
| Filter on the result | \`HAVING\` | Wrap in a CTE/subquery, then \`WHERE\` |
| Ordering-aware functions | No | Yes: ranking, \`LAG\`, \`LEAD\`, running totals |
| Runs | Before \`HAVING\` | After \`HAVING\`, before final \`ORDER BY\` |

They also combine: you can window over grouped results, e.g. \`SUM(SUM(amount)) OVER (ORDER BY day)\` for a running total of daily revenue.

Real-world: GROUP BY for a report of totals per department; a window function when you need each doctor *and* their department's numbers.`,
        explanationBn: `দুটোই row-গুলোকে group করে হিসাব করে, পার্থক্য **output-এর আকারে**।

- \`GROUP BY department_id\`: প্রতিটা department-এর জন্য **একটা** row। কে কোন doctor, সেটা হারিয়ে যায়। তাই \`SELECT name\` লিখলে error দেয়, কারণ group-এ পাঁচজনের নাম থাকলে কোনটা দেখাবে?
- \`MAX(salary) OVER (PARTITION BY department_id)\`: প্রতিটা doctor-এর row থেকে যায়, শুধু পাশে তার department-এর max বসে যায়।

Window function না থাকলে একই কাজ করতে হতো GROUP BY করা একটা subquery বানিয়ে আবার মূল table-এর সাথে JOIN করে। Window function সেটা এক ধাপে করে, আর সাধারণত table একবারই পড়ে।

মনে রাখার উপায়: **GROUP BY = সারাংশ, window = সারাংশ + বিস্তারিত একসাথে।**

Execution order-ও গুরুত্বপূর্ণ: \`GROUP BY\` আর \`HAVING\` আগে চলে, window function পরে। তাই grouped result-এর উপর window চালানো যায় (\`SUM(SUM(x)) OVER (...)\`), কিন্তু window-এর result দিয়ে \`HAVING\` বা \`WHERE\` করা যায় না।`,
        examples: [
          {
            lang: 'sql',
            caption: 'GROUP BY: one row per department, individual doctors are gone',
            code: `SELECT department_id, COUNT(*) AS doctors, MAX(salary) AS top_salary
FROM doctors
WHERE department_id IS NOT NULL
GROUP BY department_id
ORDER BY department_id;`,
            resultTable: {
              columns: ['department_id', 'doctors', 'top_salary'],
              rows: [
                [1, 5, '250000.00'],
                [2, 2, '180000.00'],
                [3, 1, '150000.00'],
                [4, 2, '165000.00'],
                [5, 1, '120000.00'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'Window: the same numbers, but every doctor row is kept',
            code: `SELECT name, department_id, salary,
       MAX(salary) OVER (PARTITION BY department_id) AS top_salary,
       COUNT(*) OVER (PARTITION BY department_id) AS doctors
FROM doctors
WHERE department_id IN (1, 4)
ORDER BY department_id, salary DESC, id;`,
            resultTable: {
              columns: ['name', 'department_id', 'salary', 'top_salary', 'doctors'],
              rows: [
                ['Dr. Nusrat Rahman', 1, '250000.00', '250000.00', 5],
                ['Dr. Arif Hossain', 1, '180000.00', '250000.00', 5],
                ['Dr. Sadia Islam', 1, '140000.00', '250000.00', 5],
                ['Dr. Tanvir Ahmed', 1, '140000.00', '250000.00', 5],
                ['Dr. Shirin Sultana', 1, '95000.00', '250000.00', 5],
                ['Dr. Mahbub Alam', 4, '165000.00', '165000.00', 2],
                ['Dr. Laila Haque', 4, '160000.00', '165000.00', 2],
              ],
            },
          },
        ],
        pitfalls: [
          'Selecting a non-aggregated column with GROUP BY is an error in PostgreSQL (unless it is functionally dependent on the grouped primary key).',
          'DISTINCT on top of a window query is a code smell: you probably wanted GROUP BY.',
        ],
        followUps: [
          'How would you show each doctor’s salary as a percentage of their department total?',
          'Can you use a window function inside HAVING?',
        ],
      },
      related: ['sql-window-function-basics', 'sql-window-in-where'],
    },
    {
      id: 'sql-row-number-rank-dense-rank',
      level: 'intermediate',
      priority: 3,
      question: 'What is the difference between ROW_NUMBER, RANK and DENSE_RANK?',
      tags: ['window-functions', 'ranking', 'row-number', 'rank', 'dense-rank'],
      answer: {
        interview: `**All three number rows in the window's ORDER BY; they differ only in how they treat ties.**

| Function | Ties | Gaps after a tie | Salaries 250k, 180k, 180k, 165k |
| --- | --- | --- | --- |
| \`ROW_NUMBER()\` | Different numbers (arbitrary unless you add a tie-breaker) | No | 1, 2, 3, 4 |
| \`RANK()\` | Same number | Yes, skips | 1, 2, 2, 4 |
| \`DENSE_RANK()\` | Same number | No | 1, 2, 2, 3 |

- **ROW_NUMBER**: exactly one row per position: deduplication, pagination, "pick one row per group".
- **RANK**: competition ranking ("joint 2nd, then 4th").
- **DENSE_RANK**: "Nth highest distinct value", e.g. the second-highest salary even when the top is tied.

Real-world: \`DENSE_RANK() ... = 2\` is the standard answer to "find the second-highest salary".`,
        explanationBn: `তিনটাই row-গুলোকে \`ORDER BY\` অনুযায়ী নম্বর দেয়। পার্থক্য শুধু **tie** (সমান মান) হলে।

আমাদের data-তে Dr. Arif আর Dr. Farzana দুজনের salary 180000:
- **ROW_NUMBER**: সমান হলেও আলাদা নম্বর দেয় (2, 3)। কে আগে পাবে সেটা নিশ্চিত নয়, তাই \`ORDER BY salary DESC, id\` এর মতো tie-breaker দিতে হয়।
- **RANK**: দুজনেই 2, আর পরের জন 4। দৌড় প্রতিযোগিতার মতো: দুজন যৌথ দ্বিতীয় হলে তৃতীয় কেউ থাকে না।
- **DENSE_RANK**: দুজনেই 2, পরের জন 3। কোনো ফাঁক থাকে না।

কখন কোনটা:
- Duplicate row মুছতে বা প্রতিটা group থেকে ঠিক একটা row নিতে: \`ROW_NUMBER\`।
- "দ্বিতীয় সর্বোচ্চ salary কত?": \`DENSE_RANK\`, কারণ \`RANK\` হলে tie-এর পর 2 নম্বরটাই হয়তো থাকবে না।

\`PARTITION BY\` দিলে প্রতিটা group-এ ranking আবার 1 থেকে শুরু হয়। Cardiology-তে Sadia আর Tanvir দুজনেই 140000, তাই RANK দেয় 1, 2, 3, 3, 5।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Three rankings side by side on tied salaries',
            code: `SELECT name, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC, id) AS row_number,
       RANK()       OVER (ORDER BY salary DESC) AS rank,
       DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank
FROM doctors
ORDER BY salary DESC, id
LIMIT 7;`,
            resultTable: {
              columns: ['name', 'salary', 'row_number', 'rank', 'dense_rank'],
              rows: [
                ['Dr. Nusrat Rahman', '250000.00', 1, 1, 1],
                ['Dr. Arif Hossain', '180000.00', 2, 2, 2],
                ['Dr. Farzana Akter', '180000.00', 3, 2, 2],
                ['Dr. Mahbub Alam', '165000.00', 4, 4, 3],
                ['Dr. Laila Haque', '160000.00', 5, 5, 4],
                ['Dr. Kamal Uddin', '150000.00', 6, 6, 5],
                ['Dr. Sadia Islam', '140000.00', 7, 7, 6],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'PARTITION BY restarts the ranking in each department',
            code: `SELECT d.name AS department, doc.name, doc.salary,
       RANK() OVER (PARTITION BY d.name ORDER BY doc.salary DESC) AS rank_in_dept
FROM doctors AS doc
JOIN departments AS d ON d.id = doc.department_id
WHERE d.name IN ('Cardiology', 'Neurology')
ORDER BY department, rank_in_dept, doc.id;`,
            resultTable: {
              columns: ['department', 'name', 'salary', 'rank_in_dept'],
              rows: [
                ['Cardiology', 'Dr. Nusrat Rahman', '250000.00', 1],
                ['Cardiology', 'Dr. Arif Hossain', '180000.00', 2],
                ['Cardiology', 'Dr. Sadia Islam', '140000.00', 3],
                ['Cardiology', 'Dr. Tanvir Ahmed', '140000.00', 3],
                ['Cardiology', 'Dr. Shirin Sultana', '95000.00', 5],
                ['Neurology', 'Dr. Farzana Akter', '180000.00', 1],
                ['Neurology', 'Dr. Rumana Chowdhury', '135000.00', 2],
              ],
            },
          },
        ],
        pitfalls: [
          'ROW_NUMBER without a unique tie-breaker in ORDER BY is nondeterministic: tied rows can swap numbers between runs.',
          'Using RANK for "Nth highest" fails after ties: with two people tied for 2nd there is no rank 3.',
        ],
        followUps: [
          'Find the second-highest salary in each department.',
          'How would you delete duplicate patients but keep one row each?',
          'What does NTILE do?',
        ],
      },
      related: ['sql-top-n-per-group', 'sql-ntile-first-last-value'],
    },
    {
      id: 'sql-top-n-per-group',
      level: 'intermediate',
      priority: 3,
      question:
        'How do you get the top N rows per group, for example the two highest-paid doctors in each department?',
      tags: ['window-functions', 'top-n', 'ranking', 'lateral', 'cte'],
      answer: {
        interview: `**Rank rows inside each group with a window function in a CTE or subquery, then filter on the rank in the outer query.**

1. \`ROW_NUMBER() / DENSE_RANK() OVER (PARTITION BY group ORDER BY metric DESC)\` in a CTE.
2. \`WHERE rank_col <= N\` outside, because window functions cannot appear in \`WHERE\`.
3. Choose the function by how you want ties: \`ROW_NUMBER\` gives exactly N rows; \`DENSE_RANK\` includes everyone tied.

Alternatives in PostgreSQL:
- \`LEFT JOIN LATERAL (... ORDER BY ... LIMIT N)\`: runs a small subquery per group; with an index on \`(group, metric)\` it is very fast, and \`LEFT\` keeps groups with no rows.
- \`DISTINCT ON (group) ... ORDER BY group, metric DESC\`: Postgres-only shortcut for N = 1.

Real-world: latest order per customer, top 3 products per category, most recent appointment per patient.`,
        explanationBn: `এটা interview-এর সবচেয়ে common SQL প্রশ্নগুলোর একটা। কৌশল দুই ধাপের:

1. **প্রতিটা group-এর ভেতরে ranking দাও**: \`PARTITION BY department ORDER BY salary DESC\`। প্রতিটা department-এ সর্বোচ্চ বেতনের জন পায় 1।
2. **বাইরে থেকে filter করো**: \`WHERE pos <= 2\`। সরাসরি \`WHERE DENSE_RANK() ... <= 2\` লেখা যায় না, কারণ \`WHERE\` চলে window function-এর আগে। তাই CTE বা subquery-তে ranking করে বাইরে filter করতে হয়।

Tie নিয়ে সিদ্ধান্ত নিতে হবে: \`ROW_NUMBER\` প্রতিটা group থেকে ঠিক N জন দেবে, \`DENSE_RANK\` সমান বেতনের সবাইকে আনবে। Interviewer-কে এটা জিজ্ঞেস করলে ভালো impression পড়ে।

**LATERAL** পদ্ধতিটা ভাবো এভাবে: প্রতিটা department-এর জন্য আলাদা করে একটা ছোট query চালানো হচ্ছে, "এই department-এর top N দাও"। \`LEFT JOIN\` হওয়ায় Oncology-র মতো doctor-হীন department-ও আসে, NULL সহ। Group কম আর প্রতিটা group-এ row অনেক হলে, index থাকলে, LATERAL প্রায়ই window-এর চেয়ে দ্রুত, কারণ পুরো table sort করতে হয় না।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Top 2 salaries per department (ties included with DENSE_RANK)',
            code: `WITH ranked AS (
  SELECT dep.name AS department, d.name AS doctor, d.salary,
         DENSE_RANK() OVER (PARTITION BY dep.id ORDER BY d.salary DESC) AS pos
  FROM doctors AS d
  JOIN departments AS dep ON dep.id = d.department_id
)
SELECT department, doctor, salary, pos
FROM ranked
WHERE pos <= 2
ORDER BY department, pos, doctor;`,
            resultTable: {
              columns: ['department', 'doctor', 'salary', 'pos'],
              rows: [
                ['Cardiology', 'Dr. Nusrat Rahman', '250000.00', 1],
                ['Cardiology', 'Dr. Arif Hossain', '180000.00', 2],
                ['Dermatology', 'Dr. Imran Kabir', '120000.00', 1],
                ['Neurology', 'Dr. Farzana Akter', '180000.00', 1],
                ['Neurology', 'Dr. Rumana Chowdhury', '135000.00', 2],
                ['Orthopedics', 'Dr. Mahbub Alam', '165000.00', 1],
                ['Orthopedics', 'Dr. Laila Haque', '160000.00', 2],
                ['Pediatrics', 'Dr. Kamal Uddin', '150000.00', 1],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'LEFT JOIN LATERAL: top 1 per department, keeping departments with no doctors',
            code: `SELECT dep.name AS department, top.name AS top_doctor, top.salary
FROM departments AS dep
LEFT JOIN LATERAL (
  SELECT d.name, d.salary
  FROM doctors AS d
  WHERE d.department_id = dep.id
  ORDER BY d.salary DESC, d.id
  LIMIT 1
) AS top ON true
ORDER BY dep.name;`,
            resultTable: {
              columns: ['department', 'top_doctor', 'salary'],
              rows: [
                ['Cardiology', 'Dr. Nusrat Rahman', '250000.00'],
                ['Dermatology', 'Dr. Imran Kabir', '120000.00'],
                ['Neurology', 'Dr. Farzana Akter', '180000.00'],
                ['Oncology', null, null],
                ['Orthopedics', 'Dr. Mahbub Alam', '165000.00'],
                ['Pediatrics', 'Dr. Kamal Uddin', '150000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'An inner JOIN silently drops groups with no rows (Oncology); use LEFT JOIN LATERAL if they must appear.',
          'Clarify ties before writing the query: "top 2" with ROW_NUMBER can hide someone tied for 2nd place.',
        ],
        followUps: [
          'How does DISTINCT ON work in PostgreSQL?',
          'Which index would make the LATERAL version fast?',
          'How would you get the most recent appointment for every patient?',
        ],
      },
      related: ['sql-row-number-rank-dense-rank', 'sql-window-in-where'],
    },
    {
      id: 'sql-lag-lead',
      level: 'intermediate',
      priority: 2,
      question: 'What do LAG and LEAD do? Show a month-over-month comparison.',
      tags: ['window-functions', 'lag', 'lead', 'time-series'],
      answer: {
        interview: `**\`LAG(expr, n)\` reads a value from n rows *before* the current row and \`LEAD(expr, n)\` from n rows *after*, in the window's ORDER BY, so you can compare a row with its neighbours without a self-join.**

- Default offset is 1; the default value when no such row exists is \`NULL\`, or pass a third argument: \`LAG(revenue, 1, 0)\`.
- Combine with \`PARTITION BY\` to stay inside a group, e.g. each patient's previous visit.
- Typical uses: month-over-month growth, gaps between events, detecting status changes, consecutive-day streaks.

Real-world: \`(revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month)\` gives growth per month; the first month has nothing to compare, so it is \`NULL\`.`,
        explanationBn: `\`LAG\` মানে "পেছনের row-এর দিকে তাকাও", \`LEAD\` মানে "সামনের row-এর দিকে তাকাও"। কোনটা পেছন আর কোনটা সামনে, সেটা ঠিক করে \`OVER (ORDER BY ...)\`।

আগে এই কাজের জন্য table-কে নিজের সাথে JOIN করতে হতো (\`t1.month = t2.month + 1 month\`), যা লেখা কঠিন আর ধীর। \`LAG\`/\`LEAD\` sort করা row-গুলোর উপর দিয়ে একবার হেঁটে পাশের মান তুলে নেয়।

উদাহরণে:
- মাসিক revenue বের করে প্রতিটা মাসের পাশে আগের মাসের revenue বসানো হয়েছে, তারপর growth % হিসাব। জানুয়ারির আগে কোনো মাস নেই, তাই \`NULL\`।
- Patient 4 (Sabbir)-এর প্রতিটা visit-এর পরের visit কবে, আর মাঝে কত দিন। \`date - date\` PostgreSQL-এ integer দিন দেয়। শেষ visit-এর পরে কিছু নেই, তাই \`NULL\`। 1 দিনের gap গুলো দেখায় টানা কয়েক দিন visit, যা "consecutive days" ধরনের প্রশ্নের ভিত্তি।

Tip: একই \`OVER (...)\` বারবার না লিখে \`WINDOW w AS (ORDER BY month)\` দিয়ে নাম দিয়ে \`LAG(revenue) OVER w\` লেখা যায়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Monthly revenue with the previous month and growth',
            code: `WITH monthly AS (
  SELECT date_trunc('month', paid_at)::date AS month, SUM(amount) AS revenue
  FROM payments
  GROUP BY 1
)
SELECT month, revenue,
       LAG(revenue) OVER (ORDER BY month) AS prev_month,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
             / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM monthly
ORDER BY month;`,
            resultTable: {
              columns: ['month', 'revenue', 'prev_month', 'growth_pct'],
              rows: [
                ['2024-01-01', '8700.00', null, null],
                ['2024-02-01', '8600.00', '8700.00', '-1.1'],
                ['2024-03-01', '11400.00', '8600.00', '32.6'],
                ['2024-04-01', '6700.00', '11400.00', '-41.2'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'LEAD: days until the patient’s next visit',
            code: `SELECT appointment_date,
       LEAD(appointment_date) OVER (ORDER BY appointment_date) AS next_visit,
       LEAD(appointment_date) OVER (ORDER BY appointment_date) - appointment_date AS days_until_next
FROM appointments
WHERE patient_id = 4
ORDER BY appointment_date;`,
            resultTable: {
              columns: ['appointment_date', 'next_visit', 'days_until_next'],
              rows: [
                ['2024-01-10', '2024-02-20', 41],
                ['2024-02-20', '2024-03-04', 13],
                ['2024-03-04', '2024-03-05', 1],
                ['2024-03-05', '2024-03-06', 1],
                ['2024-03-06', '2024-03-07', 1],
                ['2024-03-07', '2024-03-18', 11],
                ['2024-03-18', '2024-03-19', 1],
                ['2024-03-19', null, null],
              ],
            },
          },
        ],
        pitfalls: [
          'LAG/LEAD follow the window ORDER BY, not the output ORDER BY; forgetting it inside OVER gives arbitrary neighbours.',
          'Without PARTITION BY, the first row of one patient reads the last row of the previous patient.',
          'Dividing by a LAG value can hit NULL (first row) or zero; guard with NULLIF(prev, 0).',
        ],
        followUps: [
          'How would you find patients with visits on three consecutive days?',
          'How do you name a window once and reuse it?',
        ],
      },
      related: ['sql-running-total', 'sql-window-function-basics'],
    },
    {
      id: 'sql-running-total',
      level: 'intermediate',
      priority: 2,
      question: 'How do you calculate a running total and a moving average in SQL?',
      tags: ['window-functions', 'running-total', 'moving-average', 'cumulative'],
      answer: {
        interview: `**Use an aggregate as a window function with ORDER BY: \`SUM(x) OVER (ORDER BY day)\` is a running total, and adding a frame such as \`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\` makes it a moving window.**

- Running total: \`SUM(amount) OVER (ORDER BY day)\`; add \`PARTITION BY patient_id\` for a total per patient.
- Moving average: \`AVG(x) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)\` averages the current and two previous rows.
- On grouped data, nest the aggregates: \`SUM(SUM(amount)) OVER (ORDER BY day)\`; the inner SUM is the GROUP BY, the outer one is the window.
- Make the ORDER BY unique (or use \`ROWS\`), otherwise tied rows get the same total because the default frame is \`RANGE\`.

Real-world: cumulative revenue charts, account balances, 7-day moving averages on dashboards.`,
        explanationBn: `Aggregate-এর \`OVER\`-এর ভেতরে \`ORDER BY\` দিলে, প্রতিটা row-এর জন্য হিসাব হয় **শুরু থেকে এই row পর্যন্ত**। তাই \`SUM\` হয়ে যায় running total: খাতায় প্রতিদিনের আয় লিখে পাশে "এখন পর্যন্ত মোট" লেখার মতো।

**Moving average** চায় শুধু শেষ কয়েকটা row। এর জন্য **frame clause**: \`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\` মানে "আগের দুটো আর বর্তমান row"। প্রথম দুই row-এ এর চেয়ে কম row থাকে, তাই সেখানে গড় হয় যতগুলো আছে তার উপর।

\`SUM(SUM(amount))\` দেখে ঘাবড়ানোর কিছু নেই। ভেতরের \`SUM\` হলো \`GROUP BY\`-এর aggregate (দিনের মোট আয়), আর বাইরেরটা window function, যে সেই দৈনিক মোটগুলো জমিয়ে যায়। এটা সম্ভব কারণ window function চলে \`GROUP BY\`-এর পরে।

খেয়াল রাখতে হবে: একটা নির্দিষ্ট "দিন" হিসেবে \`ROWS\` আর "শেষ 3টা row" এক জিনিস নয়। মাঝে কোনো দিন payment না থাকলে \`ROWS\` সেই ফাঁক বোঝে না। Calendar-ভিত্তিক window লাগলে \`RANGE BETWEEN INTERVAL '2 days' PRECEDING AND CURRENT ROW\` ব্যবহার করো।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Daily revenue in March, its running total and a 3-row moving average',
            code: `SELECT paid_at::date AS day,
       SUM(amount) AS revenue,
       SUM(SUM(amount)) OVER (ORDER BY paid_at::date) AS running_total,
       ROUND(AVG(SUM(amount)) OVER (ORDER BY paid_at::date
                                    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3
FROM payments
WHERE paid_at >= '2024-03-01' AND paid_at < '2024-04-01'
GROUP BY paid_at::date
ORDER BY day;`,
            resultTable: {
              columns: ['day', 'revenue', 'running_total', 'moving_avg_3'],
              rows: [
                ['2024-03-04', '1100.00', '1100.00', '1100.00'],
                ['2024-03-05', '1100.00', '2200.00', '1100.00'],
                ['2024-03-06', '1100.00', '3300.00', '1100.00'],
                ['2024-03-07', '1100.00', '4400.00', '1100.00'],
                ['2024-03-11', '1300.00', '5700.00', '1166.67'],
                ['2024-03-13', '2000.00', '7700.00', '1466.67'],
                ['2024-03-18', '1100.00', '8800.00', '1466.67'],
                ['2024-03-19', '1100.00', '9900.00', '1400.00'],
                ['2024-03-26', '1500.00', '11400.00', '1233.33'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'PARTITION BY: a separate running total for each patient',
            code: `SELECT a.patient_id, a.appointment_date, a.fee,
       SUM(a.fee) OVER (PARTITION BY a.patient_id ORDER BY a.appointment_date) AS spent_so_far
FROM appointments AS a
WHERE a.patient_id IN (1, 3) AND a.status = 'completed'
ORDER BY a.patient_id, a.appointment_date;`,
            resultTable: {
              columns: ['patient_id', 'appointment_date', 'fee', 'spent_so_far'],
              rows: [
                [1, '2024-01-05', '1500.00', '1500.00'],
                [1, '2024-02-02', '1500.00', '3000.00'],
                [1, '2024-03-13', '2000.00', '5000.00'],
                [1, '2024-04-19', '1500.00', '6500.00'],
                [3, '2024-01-08', '1200.00', '1200.00'],
                [3, '2024-02-06', '2000.00', '3200.00'],
                [3, '2024-04-02', '1200.00', '4400.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'With duplicate ORDER BY values the default RANGE frame gives tied rows the same running total; add a tie-breaker or use ROWS.',
          'ROWS BETWEEN 6 PRECEDING is "last 7 rows", not "last 7 days", when some days have no rows.',
        ],
        followUps: [
          'What is the difference between ROWS and RANGE?',
          'How would you compute each day’s share of the month’s revenue?',
        ],
      },
      related: ['sql-window-frame', 'sql-lag-lead'],
    },
    {
      id: 'sql-window-in-where',
      level: 'intermediate',
      priority: 2,
      question:
        'Why can’t you use a window function in WHERE, and how do you filter on its result?',
      tags: ['window-functions', 'execution-order', 'cte', 'qualify'],
      answer: {
        interview: `**Because of the logical order of execution: WHERE filters rows before window functions are computed, so their values do not exist yet; compute them in a CTE or subquery and filter outside.**

Logical order: \`FROM/JOIN → WHERE → GROUP BY → HAVING → window functions → SELECT list → DISTINCT → ORDER BY → LIMIT\`.

- Window functions are also not allowed in \`GROUP BY\` or \`HAVING\` for the same reason.
- Fix: put the window function in a CTE (or derived table) and use \`WHERE\` on its alias in the outer query.
- Some warehouses (Snowflake, BigQuery, DuckDB) add \`QUALIFY\` for this; PostgreSQL does not have it.
- A CTE is not slower here: PostgreSQL inlines simple CTEs since version 12.

Real-world: "top 3 earners", "latest row per group", "remove duplicates where row_number > 1".`,
        explanationBn: `SQL আমরা যে ক্রমে লিখি (\`SELECT ... FROM ... WHERE\`), database সেই ক্রমে চালায় না। Logical ক্রমটা হলো: আগে \`FROM\`, তারপর \`WHERE\` দিয়ে row ছাঁটাই, তারপর \`GROUP BY\`/\`HAVING\`, **তারপর** window function।

তাহলে \`WHERE RANK() OVER (...) <= 3\` লিখলে সমস্যাটা হলো: \`WHERE\` চলার সময় rank এখনো হিসাবই হয়নি। তাছাড়া rank নির্ভর করে কোন row গুলো আছে তার উপর। যদি \`WHERE\` rank দিয়ে row বাদ দিত, তাহলে rank আবার বদলে যেত, এটা একটা চক্র। তাই PostgreSQL সরাসরি error দেয়: "window functions are not allowed in WHERE"।

সমাধান: আগে একটা CTE-তে rank হিসাব করো, তারপর বাইরে থেকে সেই column ধরে \`WHERE\`। বাইরের query-র কাছে \`r\` তখন সাধারণ একটা column।

এই একই কারণে \`SELECT\`-এ দেওয়া alias \`WHERE\`-এ ব্যবহার করা যায় না, কিন্তু \`ORDER BY\`-এ যায়, কারণ \`ORDER BY\` চলে \`SELECT\`-এর পরে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Filtering on a window function directly is rejected',
            code: `SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS r
FROM doctors
WHERE RANK() OVER (ORDER BY salary DESC) <= 3;`,
            output: `ERROR:  window functions are not allowed in WHERE`,
          },
          {
            lang: 'sql',
            caption: 'Compute it in a CTE, filter outside',
            code: `WITH ranked AS (
  SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS r
  FROM doctors
)
SELECT name, salary, r
FROM ranked
WHERE r <= 3
ORDER BY r, name;`,
            resultTable: {
              columns: ['name', 'salary', 'r'],
              rows: [
                ['Dr. Nusrat Rahman', '250000.00', 1],
                ['Dr. Arif Hossain', '180000.00', 2],
                ['Dr. Farzana Akter', '180000.00', 2],
              ],
            },
          },
        ],
        pitfalls: [
          'Filtering inside the CTE changes the ranking itself; filter the rows you want ranked inside, the ranks you want outside.',
          'QUALIFY is not PostgreSQL syntax; mention it only as something other engines offer.',
        ],
        followUps: [
          'What is the logical order of execution of a SELECT?',
          'Why can you use a SELECT alias in ORDER BY but not in WHERE?',
        ],
      },
      related: ['sql-top-n-per-group', 'sql-window-vs-group-by'],
    },
    {
      id: 'sql-window-frame',
      level: 'advanced',
      priority: 2,
      question: 'What is a window frame? Explain ROWS vs RANGE and the LAST_VALUE trap.',
      tags: ['window-functions', 'frame', 'rows', 'range', 'last-value'],
      answer: {
        interview: `**The frame is the subset of the partition that an aggregate or value function looks at for the current row; when the window has an ORDER BY, the default is \`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\`.**

| Aspect | ROWS | RANGE |
| --- | --- | --- |
| Counts in | Physical rows | Values of the ORDER BY column |
| Tied rows (peers) | Each row has its own frame | Peers are always in the frame together |
| \`2 PRECEDING\` means | Two rows back | Values within 2 (or an interval) of the current value |
| Default with ORDER BY | No | Yes: \`RANGE UNBOUNDED PRECEDING\` to \`CURRENT ROW\` |

- Because the default frame ends at the current row (and its peers), \`LAST_VALUE(x) OVER (ORDER BY ...)\` returns the *current* row's value, not the partition's last.
- Fix: \`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\`, or flip the order and use \`FIRST_VALUE\`.
- Without ORDER BY the frame is the whole partition.
- \`GROUPS\` mode (count peer groups) and \`EXCLUDE CURRENT ROW\` also exist in PostgreSQL.`,
        explanationBn: `Partition হলো group, আর **frame** হলো সেই group-এর ভেতরে current row-এর জন্য কোন অংশটা দেখা হবে। \`SUM\`, \`AVG\`, \`FIRST_VALUE\`, \`LAST_VALUE\` frame মেনে চলে; \`RANK\`, \`LAG\` frame মানে না।

**Default frame**-টাই সবচেয়ে বড় ফাঁদ। \`ORDER BY\` দিলে default হয় "শুরু থেকে current row পর্যন্ত", আর mode হয় **RANGE**।

- **ROWS**: সত্যিকারের row গুনে। Sadia আর Tanvir দুজনের salary 140000 হলেও, Sadia-র row-এ শুধু Sadia পর্যন্ত যোগ হয় (570000), Tanvir-এর row-এ দুজনই (710000)।
- **RANGE**: মান দেখে। সমান মানের row (peer) সবসময় একসাথে frame-এ ঢোকে। তাই দুজনের row-এই 710000।

**LAST_VALUE trap**: \`LAST_VALUE(name) OVER (ORDER BY salary DESC)\` দিয়ে সবচেয়ে কম বেতনের নাম চাইলে আসে current row-এর নিজের নাম, কারণ frame current row-তেই শেষ। (Sadia-র row-এ Tanvir আসে, কারণ RANGE-এ সে peer।) সমাধান হলো frame-কে পুরো partition পর্যন্ত বাড়ানো: \`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\`।

Analogy: ট্রেনের জানালা দিয়ে তাকালে তুমি শুধু এখন পর্যন্ত পার হওয়া স্টেশনগুলো দেখো; "শেষ স্টেশন" জানতে হলে পুরো রুটের ম্যাপ লাগবে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'RANGE (the default) treats tied salaries as one step; ROWS does not',
            code: `SELECT name, salary,
       SUM(salary) OVER (ORDER BY salary DESC) AS range_default,
       SUM(salary) OVER (ORDER BY salary DESC ROWS UNBOUNDED PRECEDING) AS rows_frame
FROM doctors
WHERE department_id = 1
ORDER BY salary DESC, id;`,
            resultTable: {
              columns: ['name', 'salary', 'range_default', 'rows_frame'],
              rows: [
                ['Dr. Nusrat Rahman', '250000.00', '250000.00', '250000.00'],
                ['Dr. Arif Hossain', '180000.00', '430000.00', '430000.00'],
                ['Dr. Sadia Islam', '140000.00', '710000.00', '570000.00'],
                ['Dr. Tanvir Ahmed', '140000.00', '710000.00', '710000.00'],
                ['Dr. Shirin Sultana', '95000.00', '805000.00', '805000.00'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'LAST_VALUE with the default frame vs the full partition',
            code: `SELECT name, salary,
       LAST_VALUE(name) OVER (ORDER BY salary DESC) AS last_default,
       LAST_VALUE(name) OVER (ORDER BY salary DESC
                              ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_paid
FROM doctors
WHERE department_id = 1
ORDER BY salary DESC, id;`,
            resultTable: {
              columns: ['name', 'salary', 'last_default', 'lowest_paid'],
              rows: [
                ['Dr. Nusrat Rahman', '250000.00', 'Dr. Nusrat Rahman', 'Dr. Shirin Sultana'],
                ['Dr. Arif Hossain', '180000.00', 'Dr. Arif Hossain', 'Dr. Shirin Sultana'],
                ['Dr. Sadia Islam', '140000.00', 'Dr. Tanvir Ahmed', 'Dr. Shirin Sultana'],
                ['Dr. Tanvir Ahmed', '140000.00', 'Dr. Tanvir Ahmed', 'Dr. Shirin Sultana'],
                ['Dr. Shirin Sultana', '95000.00', 'Dr. Shirin Sultana', 'Dr. Shirin Sultana'],
              ],
            },
          },
        ],
        pitfalls: [
          'LAST_VALUE and NTH_VALUE almost always need an explicit frame.',
          "RANGE with an offset (e.g. INTERVAL '7 days' PRECEDING) needs exactly one ORDER BY column of a numeric or date/time type.",
        ],
        followUps: [
          'What does the GROUPS frame mode do?',
          'Which window functions ignore the frame?',
        ],
      },
      related: ['sql-running-total', 'sql-ntile-first-last-value'],
    },
    {
      id: 'sql-ntile-first-last-value',
      level: 'advanced',
      priority: 1,
      question: 'What do NTILE, FIRST_VALUE and PERCENT_RANK do?',
      tags: ['window-functions', 'ntile', 'first-value', 'percent-rank', 'distribution'],
      answer: {
        interview: `**They are distribution and value window functions: NTILE splits ordered rows into N buckets, FIRST_VALUE returns the first row's value in the frame, and PERCENT_RANK gives a row's relative position from 0 to 1.**

- \`NTILE(4) OVER (ORDER BY salary DESC)\`: quartiles; bucket sizes differ by at most one, and earlier buckets get the extra rows (12 rows → 3, 3, 3, 3).
- \`FIRST_VALUE(x)\`: safe with the default frame, since the frame always starts at the partition's first row. \`LAST_VALUE\` and \`NTH_VALUE(x, n)\` need a wider frame.
- \`PERCENT_RANK()\` = \`(rank - 1) / (rows - 1)\`; \`CUME_DIST()\` = share of rows at or below the current value.
- For a single percentile value use the ordered-set aggregate \`percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)\`.

Real-world: customer segmentation into quartiles, "how far is each value from the best", percentile reports.`,
        explanationBn: `এগুলো কম জিজ্ঞেস হয়, তবে জানা থাকলে advanced প্রশ্নে কাজে লাগে।

- **NTILE(n)**: sort করা row-গুলোকে n টা প্রায়-সমান ভাগে ভাগ করে, প্রতিটা row-কে তার ভাগের নম্বর দেয়। 12 জন doctor, 4 ভাগ → প্রতি ভাগে 3 জন। ভাগ সমান না হলে প্রথম দিকের ভাগগুলো একজন করে বেশি পায়। খেয়াল করো: NTILE tie বোঝে না, তাই Sadia আর Tanvir (একই salary) একই ভাগে পড়েছে কাকতালীয়ভাবে; tie ভাগের সীমানায় পড়লে আলাদা bucket-এও যেতে পারত।
- **FIRST_VALUE(x)**: frame-এর প্রথম row-এর মান। Default frame সবসময় partition-এর শুরু থেকে শুরু হয়, তাই এটা নিরাপদে "সর্বোচ্চ বেতনের নাম" দেয়, যেখানে \`LAST_VALUE\` ফাঁদে ফেলে।
- **PERCENT_RANK()**: \`(rank - 1) / (মোট row - 1)\`। সবচেয়ে কম মানের row 0, সবচেয়ে বেশি 1। Tie থাকলে একই মান (Arif আর Farzana দুজনেই 0.82)।

\`PERCENT_RANK\` double precision দেয়, তাই \`ROUND(...::numeric, 2)\` করে দেখানো হয়েছে, কারণ PostgreSQL-এ \`ROUND(double, int)\` নেই।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Quartiles, the top earner on every row, and percent rank',
            code: `SELECT name, salary,
       NTILE(4) OVER (ORDER BY salary DESC, id) AS quartile,
       FIRST_VALUE(name) OVER (ORDER BY salary DESC, id) AS top_earner,
       ROUND(PERCENT_RANK() OVER (ORDER BY salary)::numeric, 2) AS pct_rank
FROM doctors
ORDER BY salary DESC, id;`,
            resultTable: {
              columns: ['name', 'salary', 'quartile', 'top_earner', 'pct_rank'],
              rows: [
                ['Dr. Nusrat Rahman', '250000.00', 1, 'Dr. Nusrat Rahman', '1.00'],
                ['Dr. Arif Hossain', '180000.00', 1, 'Dr. Nusrat Rahman', '0.82'],
                ['Dr. Farzana Akter', '180000.00', 1, 'Dr. Nusrat Rahman', '0.82'],
                ['Dr. Mahbub Alam', '165000.00', 2, 'Dr. Nusrat Rahman', '0.73'],
                ['Dr. Laila Haque', '160000.00', 2, 'Dr. Nusrat Rahman', '0.64'],
                ['Dr. Kamal Uddin', '150000.00', 2, 'Dr. Nusrat Rahman', '0.55'],
                ['Dr. Sadia Islam', '140000.00', 3, 'Dr. Nusrat Rahman', '0.36'],
                ['Dr. Tanvir Ahmed', '140000.00', 3, 'Dr. Nusrat Rahman', '0.36'],
                ['Dr. Rumana Chowdhury', '135000.00', 3, 'Dr. Nusrat Rahman', '0.27'],
                ['Dr. Imran Kabir', '120000.00', 4, 'Dr. Nusrat Rahman', '0.09'],
                ['Dr. Rafiq Mia', '120000.00', 4, 'Dr. Nusrat Rahman', '0.09'],
                ['Dr. Shirin Sultana', '95000.00', 4, 'Dr. Nusrat Rahman', '0.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'NTILE ignores ties: equal values can land in different buckets at a boundary.',
          'ROUND(double precision, 2) does not exist in PostgreSQL; cast to numeric first.',
        ],
        followUps: [
          'How do you compute the median salary in PostgreSQL?',
          'What is the difference between PERCENT_RANK and CUME_DIST?',
        ],
      },
      related: ['sql-row-number-rank-dense-rank', 'sql-window-frame'],
    },
  ],
});

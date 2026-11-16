import type { Exercise } from '../schema';

/**
 * Coding-round exercises on the clinic sample database (see the Sample database page).
 * Ordered foundation → intermediate → advanced.
 */
export const exercises: Exercise[] = [
  // ───────────────────────────── Foundation ─────────────────────────────
  {
    id: 'sql-ex-second-highest-salary',
    title: 'Second highest salary',
    level: 'foundation',
    category: 'implementation',
    tags: ['subquery', 'max', 'dense-rank', 'classic'],
    prompt: `Return the **second highest distinct salary** from \`doctors\` as a single column \`second_highest\`.

Two doctors share the top-but-one salary, and the answer must still be one value. If there were no second salary, the query should return \`NULL\` rather than no row.`,
    examples: [
      {
        input: 'doctors (12 rows, top salaries 250000, 180000, 180000, 165000…)',
        output: 'second_highest = 180000.00',
      },
    ],
    hints: [
      'The second highest is the highest salary that is lower than the maximum.',
      'An aggregate over zero rows returns one row with NULL, which is exactly the "no second salary" case.',
      'Alternative: DENSE_RANK() over salaries, then keep rank 2.',
    ],
    solutions: [
      {
        label: 'MAX below the MAX',
        code: `SELECT MAX(salary) AS second_highest
FROM doctors
WHERE salary < (SELECT MAX(salary) FROM doctors);`,
      },
      {
        label: 'DENSE_RANK',
        code: `SELECT MAX(salary) AS second_highest
FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM doctors
) AS ranked
WHERE rnk = 2;`,
      },
    ],
    sampleRun: {
      code: `SELECT MAX(salary) AS second_highest
FROM doctors
WHERE salary < (SELECT MAX(salary) FROM doctors);`,
      resultTable: { columns: ['second_highest'], rows: [['180000.00']] },
    },
    explanationBn: `সবচেয়ে বড় salary 250000। তার চেয়ে **ছোট** salary গুলোর মধ্যে সবচেয়ে বড়টাই দ্বিতীয় সর্বোচ্চ: 180000।

দুজনের (Arif আর Farzana) salary 180000, তবুও উত্তর একটাই মান, কারণ \`MAX\` একটা মান দেয়। \`ORDER BY salary DESC LIMIT 1 OFFSET 1\` লিখলে ভুল হতো: সেটা দ্বিতীয় **row** দেয়, যেটা আবার 180000 হলেও tie-এর ক্ষেত্রে "দ্বিতীয় আলাদা মান" না।

আরেকটা সূক্ষ্ম সুবিধা: কোনো row না মিললেও aggregate একটা row ফেরত দেয় (NULL), তাই "দ্বিতীয় salary নেই" হলে NULL আসে, খালি ফল না।`,
  },
  {
    id: 'sql-ex-missing-emails',
    title: 'Doctors without an email (the = NULL trap)',
    level: 'foundation',
    category: 'output-prediction',
    tags: ['null', 'is-null', 'where'],
    prompt: `A colleague wrote:

\`\`\`sql
SELECT name FROM doctors WHERE email = NULL;
\`\`\`

It returns **no rows**, although some doctors have no email. Explain why, then write the correct query listing those doctors by \`id\`.`,
    examples: [
      { input: 'WHERE email = NULL', output: '0 rows' },
      { input: 'correct query', output: 'Dr. Kamal Uddin, Dr. Rumana Chowdhury, Dr. Rafiq Mia' },
    ],
    hints: [
      'What does any comparison with NULL evaluate to?',
      'WHERE keeps only rows where the condition is true, not unknown.',
      'Use IS NULL.',
    ],
    solutions: [
      {
        label: 'IS NULL',
        code: `SELECT name
FROM doctors
WHERE email IS NULL
ORDER BY id;`,
      },
    ],
    sampleRun: {
      code: `SELECT name
FROM doctors
WHERE email IS NULL
ORDER BY id;`,
      resultTable: {
        columns: ['name'],
        rows: [['Dr. Kamal Uddin'], ['Dr. Rumana Chowdhury'], ['Dr. Rafiq Mia']],
      },
    },
    explanationBn: `\`email = NULL\` মানে "email কি অজানা মানের সমান?" এর উত্তর true বা false না, **unknown** (NULL)। আর \`WHERE\` শুধু true row রাখে, তাই একটা row-ও আসে না, কোনো error-ও না। এটাই ফাঁদ: query চুপচাপ ভুল ফল দেয়।

NULL পরীক্ষার একমাত্র সঠিক উপায় \`IS NULL\` / \`IS NOT NULL\`। আমাদের data-তে Kamal, Rumana আর Rafiq-এর email নেই।`,
  },
  {
    id: 'sql-ex-doctors-per-department',
    title: 'Doctors per department, including empty ones',
    level: 'foundation',
    category: 'implementation',
    tags: ['left-join', 'count', 'group-by'],
    prompt: `List **every** department with the number of doctors in it, ordered by department name. Departments without doctors must show \`0\`.`,
    examples: [{ input: 'departments + doctors', output: 'Cardiology 5, …, Oncology 0, …' }],
    hints: [
      'An inner JOIN drops departments with no doctors. Which join keeps every department?',
      'COUNT(*) counts the NULL-filled row of an empty department as 1.',
      'Count a column from the doctors side instead.',
    ],
    solutions: [
      {
        label: 'LEFT JOIN + COUNT(column)',
        code: `SELECT dep.name AS department, COUNT(d.id) AS doctors
FROM departments AS dep
LEFT JOIN doctors AS d ON d.department_id = dep.id
GROUP BY dep.name
ORDER BY dep.name;`,
      },
    ],
    sampleRun: {
      code: `SELECT dep.name AS department, COUNT(d.id) AS doctors
FROM departments AS dep
LEFT JOIN doctors AS d ON d.department_id = dep.id
GROUP BY dep.name
ORDER BY dep.name;`,
      resultTable: {
        columns: ['department', 'doctors'],
        rows: [
          ['Cardiology', 5],
          ['Dermatology', 1],
          ['Neurology', 2],
          ['Oncology', 0],
          ['Orthopedics', 2],
          ['Pediatrics', 1],
        ],
      },
    },
    explanationBn: `দুইটা জিনিস একসাথে ঠিক রাখতে হয়:

1. **LEFT JOIN**: departments বাম দিকে, তাই Oncology-র মতো doctor-হীন department-ও থাকে (doctor-এর column NULL সহ)।
2. **COUNT(d.id)**: \`COUNT(*)\` ওই NULL-ভরা row-টাও গুনে Oncology-তে 1 দেখাত। \`COUNT(d.id)\` NULL গোনে না, তাই 0।

Rafiq Mia-র department NULL, তাই সে কোনো department-এ গোনা হয়নি; মোট 11 জন doctor department-এ আছে।`,
  },
  {
    id: 'sql-ex-salary-bands',
    title: 'Salary bands with CASE',
    level: 'foundation',
    category: 'logic',
    tags: ['case', 'group-by', 'buckets'],
    prompt: `Put every doctor into a band and count them:

- \`senior\`: salary ≥ 160,000
- \`mid\`: salary ≥ 130,000
- \`junior\`: everything else

Return \`band\`, \`doctors\`, \`lowest\` and \`highest\` salary per band, from the lowest band up.`,
    examples: [{ input: 'doctors', output: 'junior 3, mid 4, senior 5' }],
    hints: [
      'CASE checks its WHEN branches in order and takes the first match.',
      'You can GROUP BY the CASE expression (or its alias in PostgreSQL).',
      'Order the bands by their lowest salary rather than alphabetically.',
    ],
    solutions: [
      {
        label: 'CASE + GROUP BY',
        code: `SELECT CASE
         WHEN salary >= 160000 THEN 'senior'
         WHEN salary >= 130000 THEN 'mid'
         ELSE 'junior'
       END AS band,
       COUNT(*) AS doctors,
       MIN(salary) AS lowest,
       MAX(salary) AS highest
FROM doctors
GROUP BY band
ORDER BY MIN(salary);`,
      },
    ],
    sampleRun: {
      code: `SELECT CASE
         WHEN salary >= 160000 THEN 'senior'
         WHEN salary >= 130000 THEN 'mid'
         ELSE 'junior'
       END AS band,
       COUNT(*) AS doctors,
       MIN(salary) AS lowest,
       MAX(salary) AS highest
FROM doctors
GROUP BY band
ORDER BY MIN(salary);`,
      resultTable: {
        columns: ['band', 'doctors', 'lowest', 'highest'],
        rows: [
          ['junior', 3, '95000.00', '120000.00'],
          ['mid', 4, '135000.00', '150000.00'],
          ['senior', 5, '160000.00', '250000.00'],
        ],
      },
    },
    explanationBn: `\`CASE\` উপর থেকে নিচে শর্ত দেখে, **প্রথম যেটা মেলে** সেটাই নেয়। তাই \`mid\`-এর শর্তে "160000-এর নিচে" লিখতে হয়নি: 160000 বা বেশি হলে আগের branch-ই ধরে ফেলেছে।

এই একই কৌশলে বয়সের group, দামের range, rating-এর ভাগ বানানো যায়। Band-গুলো বর্ণানুক্রমে না সাজিয়ে \`ORDER BY MIN(salary)\` দিয়ে সাজানো হয়েছে, যাতে junior → mid → senior ক্রম ঠিক থাকে।`,
  },
  {
    id: 'sql-ex-duplicate-patients',
    title: 'Find duplicate patients',
    level: 'foundation',
    category: 'hashing',
    tags: ['group-by', 'having', 'duplicates', 'data-quality'],
    prompt: `The same person may have registered twice. Find every \`(name, birth_date)\` that appears more than once in \`patients\`, with how many rows it has.`,
    examples: [{ input: 'patients', output: 'Rahim Uddin, 1985-07-30, 2' }],
    hints: [
      'Group by the columns that identify a person.',
      'Filter groups (not rows) with HAVING.',
    ],
    solutions: [
      {
        label: 'GROUP BY + HAVING',
        code: `SELECT name, birth_date, COUNT(*) AS rows_for_same_person
FROM patients
GROUP BY name, birth_date
HAVING COUNT(*) > 1;`,
      },
    ],
    sampleRun: {
      code: `SELECT name, birth_date, COUNT(*) AS rows_for_same_person
FROM patients
GROUP BY name, birth_date
HAVING COUNT(*) > 1;`,
      resultTable: {
        columns: ['name', 'birth_date', 'rows_for_same_person'],
        rows: [['Rahim Uddin', '1985-07-30', 2]],
      },
    },
    explanationBn: `একই মানুষকে চেনার জন্য যে column গুলো লাগে (নাম + জন্মতারিখ), সেগুলো দিয়ে group করো। প্রতিটা group-এ যতগুলো row, সেটাই \`COUNT(*)\`।

\`WHERE\` চলে group বানানোর আগে, প্রতিটা row-এর উপর; তাই "group-এ 1-এর বেশি row" বলতে \`HAVING\` লাগে, যেটা group বানানোর পরে চলে।

শুধু নাম দিয়ে group করলে একই নামের দুজন আলাদা মানুষকেও duplicate ধরে ফেলত, তাই জন্মতারিখও রাখা হয়েছে।`,
  },
  {
    id: 'sql-ex-doctor-initials',
    title: 'Initials from full names',
    level: 'foundation',
    category: 'strings',
    tags: ['strings', 'split-part', 'left', 'concatenation'],
    prompt: `Doctor names look like \`Dr. Nusrat Rahman\`. For doctors with \`id <= 4\`, return the name and the initials of the first and last name (\`NR\`), ordered by \`id\`.`,
    examples: [{ input: "'Dr. Nusrat Rahman'", output: "'NR'" }],
    hints: [
      "split_part(text, ' ', n) returns the n-th space-separated word.",
      "'Dr.' is word 1, so the first name is word 2 and the last name word 3.",
      'left(text, 1) takes the first character; || concatenates.',
    ],
    solutions: [
      {
        label: 'split_part + left',
        code: `SELECT name,
       left(split_part(name, ' ', 2), 1) || left(split_part(name, ' ', 3), 1) AS initials
FROM doctors
WHERE id <= 4
ORDER BY id;`,
      },
    ],
    sampleRun: {
      code: `SELECT name,
       left(split_part(name, ' ', 2), 1) || left(split_part(name, ' ', 3), 1) AS initials
FROM doctors
WHERE id <= 4
ORDER BY id;`,
      resultTable: {
        columns: ['name', 'initials'],
        rows: [
          ['Dr. Nusrat Rahman', 'NR'],
          ['Dr. Arif Hossain', 'AH'],
          ['Dr. Farzana Akter', 'FA'],
          ['Dr. Kamal Uddin', 'KU'],
        ],
      },
    },
    explanationBn: `\`split_part(name, ' ', n)\` নামটাকে space দিয়ে টুকরো করে n-তম টুকরো দেয়: 1 = "Dr.", 2 = প্রথম নাম, 3 = শেষ নাম। তারপর \`left(..., 1)\` প্রথম অক্ষর নেয়, আর \`||\` দুইটা জোড়া লাগায়।

মনে রাখো: কোনো অংশ NULL হলে \`||\`-এর পুরো ফল NULL হয়ে যায়। নামের গঠন অনিশ্চিত হলে \`concat()\` বা \`COALESCE\` নিরাপদ। আর বাস্তবে প্রথম/শেষ নাম আলাদা column-এ রাখাই ভালো design।`,
  },

  // ──────────────────────────── Intermediate ────────────────────────────
  {
    id: 'sql-ex-nth-highest-salary',
    title: 'N-th highest salary',
    level: 'intermediate',
    category: 'implementation',
    tags: ['distinct', 'offset', 'dense-rank', 'classic'],
    prompt: `Return the **3rd highest distinct salary** from \`doctors\`. The query should be easy to change for any N.`,
    examples: [
      {
        input: 'distinct salaries: 250000, 180000, 165000, 160000…',
        output: '165000.00',
      },
    ],
    hints: [
      'Ties must not count twice: work on DISTINCT salaries.',
      'Skip N - 1 values with OFFSET.',
      'Or use DENSE_RANK() and keep rank N.',
    ],
    solutions: [
      {
        label: 'DISTINCT + OFFSET',
        code: `SELECT DISTINCT salary
FROM doctors
ORDER BY salary DESC
OFFSET 2   -- N - 1
LIMIT 1;`,
      },
      {
        label: 'DENSE_RANK',
        code: `SELECT DISTINCT salary
FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM doctors
) AS ranked
WHERE rnk = 3;`,
      },
    ],
    sampleRun: {
      code: `SELECT DISTINCT salary
FROM doctors
ORDER BY salary DESC
OFFSET 2
LIMIT 1;`,
      resultTable: { columns: ['salary'], rows: [['165000.00']] },
    },
    explanationBn: `আলাদা আলাদা salary বড় থেকে ছোট: 250000, 180000, 165000, ... (180000 দুজনের, কিন্তু একবারই গোনা)। তৃতীয়টা 165000।

\`DISTINCT\` না দিলে 180000 দুইবার আসত আর তৃতীয় row হতো 180000, ভুল উত্তর। \`DENSE_RANK\` সংস্করণ একই কাজ করে: tie-তে একই rank, আর পরের rank-এ কোনো ফাঁক থাকে না।

খেয়াল: N-এর চেয়ে কম আলাদা salary থাকলে OFFSET সংস্করণ কোনো row দেয় না; NULL দরকার হলে বাইরে \`SELECT (...) AS nth\` দিয়ে মুড়ে দাও।`,
  },
  {
    id: 'sql-ex-departments-above-average',
    title: 'Departments paying above the overall average',
    level: 'intermediate',
    category: 'implementation',
    tags: ['group-by', 'having', 'subquery', 'avg'],
    prompt: `Return each department whose **average doctor salary** is higher than the average salary of **all** doctors. Show \`department\` and \`avg_salary\` rounded to 2 decimals, ordered by department.`,
    examples: [
      {
        input: 'overall average ≈ 152916.67',
        output: 'Cardiology 161000.00, Neurology 157500.00, Orthopedics 162500.00',
      },
    ],
    hints: [
      'Average per department: JOIN + GROUP BY.',
      'Compare an aggregate, so the filter goes in HAVING.',
      'The overall average comes from a scalar subquery.',
    ],
    solutions: [
      {
        label: 'HAVING with a scalar subquery',
        code: `SELECT dep.name AS department, ROUND(AVG(d.salary), 2) AS avg_salary
FROM doctors AS d
JOIN departments AS dep ON dep.id = d.department_id
GROUP BY dep.name
HAVING AVG(d.salary) > (SELECT AVG(salary) FROM doctors)
ORDER BY dep.name;`,
      },
    ],
    sampleRun: {
      code: `SELECT dep.name AS department, ROUND(AVG(d.salary), 2) AS avg_salary
FROM doctors AS d
JOIN departments AS dep ON dep.id = d.department_id
GROUP BY dep.name
HAVING AVG(d.salary) > (SELECT AVG(salary) FROM doctors)
ORDER BY dep.name;`,
      resultTable: {
        columns: ['department', 'avg_salary'],
        rows: [
          ['Cardiology', '161000.00'],
          ['Neurology', '157500.00'],
          ['Orthopedics', '162500.00'],
        ],
      },
    },
    explanationBn: `সব 12 জনের মোট salary 1,835,000, গড় প্রায় 152916.67। Department ভিত্তিক গড়: Cardiology 161000, Neurology 157500, Orthopedics 162500, Pediatrics 150000, Dermatology 120000। প্রথম তিনটাই গড়ের উপরে।

\`AVG(d.salary)\` একটা aggregate, তাই তুলনা \`WHERE\`-এ হয় না, \`HAVING\`-এ হয়। বাইরের subquery-টা একটাই সংখ্যা ফেরত দেয় (scalar subquery), যেটার সাথে প্রতিটা group মেলানো হয়।

Rafiq Mia-র department নেই, তাই JOIN-এ সে কোনো department-এ পড়েনি, কিন্তু সার্বিক গড়ে সে গোনা হয়েছে।`,
  },
  {
    id: 'sql-ex-earns-more-than-manager',
    title: 'Doctors who earn more than their manager',
    level: 'intermediate',
    category: 'implementation',
    tags: ['self-join', 'hierarchy', 'classic'],
    prompt: `\`doctors.manager_id\` points to another doctor. List every doctor whose salary is higher than their manager's, with both salaries.`,
    examples: [
      { input: 'doctors', output: 'Dr. Mahbub Alam 165000.00, manager Dr. Laila Haque 160000.00' },
    ],
    hints: [
      'The manager is a row of the same table: join doctors to itself.',
      'Give the two copies different aliases (e for employee, m for manager).',
    ],
    solutions: [
      {
        label: 'Self-join',
        code: `SELECT e.name AS doctor, e.salary, m.name AS manager, m.salary AS manager_salary
FROM doctors AS e
JOIN doctors AS m ON m.id = e.manager_id
WHERE e.salary > m.salary;`,
      },
    ],
    sampleRun: {
      code: `SELECT e.name AS doctor, e.salary, m.name AS manager, m.salary AS manager_salary
FROM doctors AS e
JOIN doctors AS m ON m.id = e.manager_id
WHERE e.salary > m.salary;`,
      resultTable: {
        columns: ['doctor', 'salary', 'manager', 'manager_salary'],
        rows: [['Dr. Mahbub Alam', '165000.00', 'Dr. Laila Haque', '160000.00']],
      },
    },
    explanationBn: `একই table-এ কর্মী আর manager দুজনেই আছে, তাই table-কে নিজের সাথে JOIN করতে হয় (**self-join**)। \`e\` = কর্মীর row, \`m\` = তার manager-এর row; \`m.id = e.manager_id\` জোড়া মেলায়।

Inner join হওয়ায় যার manager নেই (Dr. Nusrat) সে বাদ পড়ে, যেটা এখানে ঠিক আছে। শেষে শুধু সেই জোড়া রাখা হয় যেখানে কর্মীর বেতন বেশি: Mahbub (165000) > Laila (160000)।`,
  },
  {
    id: 'sql-ex-departments-without-doctors',
    title: 'Departments with no doctors (anti-join)',
    level: 'intermediate',
    category: 'logic',
    tags: ['not-exists', 'anti-join', 'null', 'not-in'],
    prompt: `Return the departments that have **no** doctors.

A first attempt with \`NOT IN (SELECT department_id FROM doctors)\` returns nothing. Write a version that works, and explain what broke.`,
    examples: [
      { input: 'NOT IN version', output: '0 rows' },
      { input: 'correct version', output: 'Oncology' },
    ],
    hints: [
      'One doctor has department_id = NULL. What is 6 <> NULL?',
      'NOT EXISTS asks "is there any matching row?" and is not affected by NULLs.',
      'LEFT JOIN … WHERE d.id IS NULL also works.',
    ],
    solutions: [
      {
        label: 'NOT EXISTS',
        code: `SELECT name FROM departments AS dep
WHERE NOT EXISTS (SELECT 1 FROM doctors AS d WHERE d.department_id = dep.id);`,
      },
      {
        label: 'LEFT JOIN … IS NULL',
        code: `SELECT dep.name
FROM departments AS dep
LEFT JOIN doctors AS d ON d.department_id = dep.id
WHERE d.id IS NULL;`,
      },
    ],
    sampleRun: {
      code: `SELECT name FROM departments AS dep
WHERE NOT EXISTS (SELECT 1 FROM doctors AS d WHERE d.department_id = dep.id);`,
      resultTable: { columns: ['name'], rows: [['Oncology']] },
    },
    explanationBn: `\`NOT IN (1, 2, 3, 4, 5, NULL)\` আসলে \`<> 1 AND <> 2 AND ... AND <> NULL\`। শেষ অংশটা unknown, তাই পুরো শর্ত unknown, আর কোনো row আসে না। Rafiq Mia-র NULL department-ই এর কারণ।

\`NOT EXISTS\` প্রতিটা department-এর জন্য জিজ্ঞেস করে "এমন কোনো doctor আছে কি?" NULL এখানে কোনো ঝামেলা করে না, আর PostgreSQL এটাকে দক্ষ **anti-join** হিসেবে চালায়। LEFT JOIN সংস্করণে মেলেনি এমন department-এর doctor column NULL থাকে, সেটাই \`IS NULL\` দিয়ে ধরা হয়।`,
  },
  {
    id: 'sql-ex-rows-to-delete',
    title: 'Which duplicate rows to delete',
    level: 'intermediate',
    category: 'implementation',
    tags: ['row-number', 'duplicates', 'window-functions'],
    prompt: `For duplicated patients (same \`name\` and \`birth_date\`), keep the row with the **lowest id** and list the ids that should be deleted.

(Don't delete them here: the duplicates still have appointments pointing at them, so a real cleanup must first move those references.)`,
    examples: [{ input: 'Rahim Uddin: ids 2 and 8', output: 'delete id 8' }],
    hints: [
      'Number the rows inside each (name, birth_date) group.',
      'ROW_NUMBER() OVER (PARTITION BY … ORDER BY id) gives the oldest row 1.',
      'Everything with a number above 1 is a duplicate.',
    ],
    solutions: [
      {
        label: 'ROW_NUMBER in a subquery',
        code: `SELECT id, name
FROM (
  SELECT id, name,
         ROW_NUMBER() OVER (PARTITION BY name, birth_date ORDER BY id) AS rn
  FROM patients
) AS numbered
WHERE rn > 1;`,
      },
    ],
    sampleRun: {
      code: `SELECT id, name
FROM (
  SELECT id, name,
         ROW_NUMBER() OVER (PARTITION BY name, birth_date ORDER BY id) AS rn
  FROM patients
) AS numbered
WHERE rn > 1;`,
      resultTable: { columns: ['id', 'name'], rows: [[8, 'Rahim Uddin']] },
    },
    explanationBn: `\`PARTITION BY name, birth_date\` প্রতিটা "একই মানুষ"-এর জন্য আলাদা group বানায়, আর \`ORDER BY id\` সেই group-এ পুরনোটাকে 1 নম্বর দেয়। যার নম্বর 1-এর বেশি, সে duplicate।

এখানে \`ROW_NUMBER\` লাগবে, \`RANK\` না: দুই row-এর ক্রম-মান সমান হলে RANK দুজনকেই 1 দিত, আর কাউকেই মুছতে বলত না।

বাস্তবে মোছার আগে duplicate-এর appointment গুলো রাখার row (id 2)-তে সরাতে হয়, নইলে foreign key আটকে দেবে।`,
  },
  {
    id: 'sql-ex-revenue-by-method',
    title: 'Revenue share by payment method',
    level: 'intermediate',
    category: 'implementation',
    tags: ['group-by', 'window-functions', 'percent-of-total'],
    prompt: `For each payment \`method\`, return the number of payments, the total \`revenue\`, and its share of all revenue as a percentage (\`pct\`, 2 decimals). Highest revenue first.`,
    examples: [
      { input: 'payments (28 rows, 35400.00 in total)', output: 'card 8 12100.00 34.18, …' },
    ],
    hints: [
      'GROUP BY method gives the per-method sums.',
      'The grand total is the sum of those sums: a window over the grouped rows, SUM(SUM(amount)) OVER ().',
      'Multiply by 100.0 so the division is not integer division.',
    ],
    solutions: [
      {
        label: 'Window over an aggregate',
        code: `SELECT method,
       COUNT(*) AS payments,
       SUM(amount) AS revenue,
       ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 2) AS pct
FROM payments
GROUP BY method
ORDER BY revenue DESC;`,
      },
      {
        label: 'Scalar subquery for the total',
        code: `SELECT method,
       COUNT(*) AS payments,
       SUM(amount) AS revenue,
       ROUND(100.0 * SUM(amount) / (SELECT SUM(amount) FROM payments), 2) AS pct
FROM payments
GROUP BY method
ORDER BY revenue DESC;`,
      },
    ],
    sampleRun: {
      code: `SELECT method,
       COUNT(*) AS payments,
       SUM(amount) AS revenue,
       ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 2) AS pct
FROM payments
GROUP BY method
ORDER BY revenue DESC;`,
      resultTable: {
        columns: ['method', 'payments', 'revenue', 'pct'],
        rows: [
          ['card', 8, '12100.00', '34.18'],
          ['bkash', 9, '10000.00', '28.25'],
          ['cash', 7, '7000.00', '19.77'],
          ['insurance', 4, '6300.00', '17.80'],
        ],
      },
    },
    explanationBn: `প্রথমে \`GROUP BY method\` প্রতিটা পদ্ধতির মোট টাকা দেয়। শতাংশের জন্য সব পদ্ধতির **মোট** লাগে (35400)। Window function চলে \`GROUP BY\`-এর পরে, তাই \`SUM(SUM(amount)) OVER ()\` মানে "সব group-এর যোগফলের যোগফল", একবারেই।

লক্ষ্য করো: bKash-এ payment সংখ্যা সবচেয়ে বেশি (9), কিন্তু টাকা card-এ বেশি, কারণ card payment গুলো বড়। "কয়টা" আর "কত টাকা" আলাদা প্রশ্ন।

\`100.0\` দেওয়ায় হিসাব numeric-এ হয়; integer হলে ভাগফলের দশমিক হারিয়ে যেত।`,
  },
  {
    id: 'sql-ex-top-medicines',
    title: 'Most prescribed medicines',
    level: 'intermediate',
    category: 'hashing',
    tags: ['group-by', 'count', 'order-by', 'limit'],
    prompt: `Return the 3 medicines prescribed most often, with the count. Break ties alphabetically so the answer is deterministic.`,
    examples: [
      { input: 'prescriptions (22 rows)', output: 'Atorvastatin 4, Ibuprofen 3, Sumatriptan 3' },
    ],
    hints: [
      'Count rows per medicine.',
      'ORDER BY the count descending, then by name, before LIMIT.',
    ],
    solutions: [
      {
        label: 'GROUP BY + ORDER BY + LIMIT',
        code: `SELECT medicine, COUNT(*) AS prescriptions
FROM prescriptions
GROUP BY medicine
ORDER BY prescriptions DESC, medicine
LIMIT 3;`,
      },
    ],
    sampleRun: {
      code: `SELECT medicine, COUNT(*) AS prescriptions
FROM prescriptions
GROUP BY medicine
ORDER BY prescriptions DESC, medicine
LIMIT 3;`,
      resultTable: {
        columns: ['medicine', 'prescriptions'],
        rows: [
          ['Atorvastatin', 4],
          ['Ibuprofen', 3],
          ['Sumatriptan', 3],
        ],
      },
    },
    explanationBn: `এটা SQL-এর "frequency map": \`GROUP BY medicine\` প্রতিটা ওষুধের জন্য একটা group, \`COUNT(*)\` কতবার লেখা হয়েছে।

শুধু \`ORDER BY prescriptions DESC LIMIT 3\` লিখলে Ibuprofen আর Sumatriptan (দুটোই 3) কোন ক্রমে আসবে নিশ্চিত না, আর 3-এ tie থাকলে কোনটা বাদ পড়বে তাও এলোমেলো। দ্বিতীয় sort key (\`medicine\`) ফলকে deterministic করে।

Tie-তে থাকা সবাইকে চাইলে \`RANK() ... <= 3\` ব্যবহার করো।`,
  },
  {
    id: 'sql-ex-unpaid-appointments',
    title: 'Completed appointments that were never paid',
    level: 'intermediate',
    category: 'logic',
    tags: ['not-exists', 'anti-join', 'data-quality'],
    prompt: `Every completed appointment should have a payment. Find the ids of completed appointments that have **no** row in \`payments\`.`,
    examples: [{ input: 'appointments + payments', output: '26, 33' }],
    hints: [
      'Filter appointments to status = completed.',
      'Keep those for which no payment exists: NOT EXISTS with a correlated subquery.',
    ],
    solutions: [
      {
        label: 'NOT EXISTS',
        code: `SELECT a.id
FROM appointments AS a
WHERE a.status = 'completed'
  AND NOT EXISTS (SELECT 1 FROM payments AS p WHERE p.appointment_id = a.id)
ORDER BY a.id;`,
      },
      {
        label: 'LEFT JOIN … IS NULL',
        code: `SELECT a.id
FROM appointments AS a
LEFT JOIN payments AS p ON p.appointment_id = a.id
WHERE a.status = 'completed' AND p.id IS NULL
ORDER BY a.id;`,
      },
    ],
    sampleRun: {
      code: `SELECT a.id
FROM appointments AS a
WHERE a.status = 'completed'
  AND NOT EXISTS (SELECT 1 FROM payments AS p WHERE p.appointment_id = a.id)
ORDER BY a.id;`,
      resultTable: { columns: ['id'], rows: [[26], [33]] },
    },
    explanationBn: `"এমন X যার Y নেই" ধরনের প্রশ্ন মানেই **anti-join**। \`NOT EXISTS\` প্রতিটা completed appointment-এর জন্য দেখে payments-এ তার কোনো row আছে কিনা; না থাকলে রাখে।

LEFT JOIN সংস্করণে payment না থাকলে \`p.id\` NULL হয়। খেয়াল করো, \`status = 'completed'\` শর্ত বাম table-এর, তাই \`WHERE\`-এ রাখা ঠিক আছে; ডান table-এর শর্ত \`WHERE\`-এ দিলে LEFT JOIN-এর উদ্দেশ্য নষ্ট হতো।

বাস্তবে এমন query দিয়ে billing-এর ফাঁক ধরা হয়। এখানে appointment 26 আর 33-এর payment নেই।`,
  },
  {
    id: 'sql-ex-patients-by-city-pivot',
    title: 'Pivot: patients by city and gender',
    level: 'intermediate',
    category: 'implementation',
    tags: ['pivot', 'filter', 'conditional-aggregation', 'coalesce'],
    prompt: `Build a report with one row per city (\`Unknown\` when the city is missing) and the columns \`female\`, \`male\` and \`total\`. Largest total first, then by city name.`,
    examples: [{ input: 'patients (14 rows)', output: 'Dhaka 5 0 5, Chattogram 0 3 3, …' }],
    hints: [
      "COALESCE(city, 'Unknown') turns the missing city into a group of its own.",
      "One conditional aggregate per output column: COUNT(*) FILTER (WHERE gender = 'F').",
      "Portable alternative: SUM(CASE WHEN gender = 'F' THEN 1 ELSE 0 END).",
    ],
    solutions: [
      {
        label: 'FILTER (PostgreSQL)',
        code: `SELECT COALESCE(city, 'Unknown') AS city,
       COUNT(*) FILTER (WHERE gender = 'F') AS female,
       COUNT(*) FILTER (WHERE gender = 'M') AS male,
       COUNT(*) AS total
FROM patients
GROUP BY 1
ORDER BY 4 DESC, 1;`,
      },
      {
        label: 'SUM(CASE …) (portable)',
        code: `SELECT COALESCE(city, 'Unknown') AS city,
       SUM(CASE WHEN gender = 'F' THEN 1 ELSE 0 END) AS female,
       SUM(CASE WHEN gender = 'M' THEN 1 ELSE 0 END) AS male,
       COUNT(*) AS total
FROM patients
GROUP BY 1
ORDER BY 4 DESC, 1;`,
      },
    ],
    sampleRun: {
      code: `SELECT COALESCE(city, 'Unknown') AS city,
       COUNT(*) FILTER (WHERE gender = 'F') AS female,
       COUNT(*) FILTER (WHERE gender = 'M') AS male,
       COUNT(*) AS total
FROM patients
GROUP BY 1
ORDER BY 4 DESC, 1;`,
      resultTable: {
        columns: ['city', 'female', 'male', 'total'],
        rows: [
          ['Dhaka', 5, 0, 5],
          ['Chattogram', 0, 3, 3],
          ['Sylhet', 0, 2, 2],
          ['Unknown', 2, 0, 2],
          ['Khulna', 0, 1, 1],
          ['Rajshahi', 0, 1, 1],
        ],
      },
    },
    explanationBn: `**Pivot** মানে row-এ থাকা মান (gender) কে column বানানো। প্রতিটা নতুন column-এর জন্য একটা শর্তযুক্ত aggregate: \`COUNT(*) FILTER (WHERE gender = 'F')\` শুধু মহিলা row গোনে।

\`COALESCE(city, 'Unknown')\` দুজন শহর-বিহীন রোগীকে (Tania, Rupa) একটা নামযুক্ত group দেয়। \`GROUP BY 1\`, \`ORDER BY 4 DESC, 1\` মানে SELECT-এর প্রথম আর চতুর্থ column; লেখা ছোট হয়, তবে column-এর ক্রম বদলালে ভুল হওয়ার ঝুঁকি আছে।

SUM(CASE ...) সংস্করণ সব database-এ চলে; MySQL-এ FILTER নেই।`,
  },
  {
    id: 'sql-ex-penicillin-allergy',
    title: 'Patients allergic to penicillin (JSONB)',
    level: 'intermediate',
    category: 'language-feature',
    tags: ['jsonb', 'operators', 'postgresql'],
    prompt: `\`patients.metadata\` is JSONB like \`{"allergies": ["penicillin"], "tags": [...], "insurance": ...}\`. Return the \`id\` and \`name\` of every patient whose allergies include \`penicillin\`, ordered by id.`,
    examples: [
      { input: 'metadata.allergies', output: '1 Ayesha Siddiqua, 5 Mim Akter, 12 Rupa Das' },
    ],
    hints: [
      "metadata->'allergies' returns the JSON array (as jsonb).",
      'The ? operator checks whether a jsonb array contains a string element.',
      'Alternative: containment, metadata @> \'{"allergies": ["penicillin"]}\' (can use a GIN index).',
    ],
    solutions: [
      {
        label: '? (element exists)',
        code: `SELECT id, name
FROM patients
WHERE metadata->'allergies' ? 'penicillin'
ORDER BY id;`,
      },
      {
        label: '@> (containment, GIN-indexable)',
        code: `SELECT id, name
FROM patients
WHERE metadata @> '{"allergies": ["penicillin"]}'
ORDER BY id;`,
      },
    ],
    sampleRun: {
      code: `SELECT id, name
FROM patients
WHERE metadata->'allergies' ? 'penicillin'
ORDER BY id;`,
      resultTable: {
        columns: ['id', 'name'],
        rows: [
          [1, 'Ayesha Siddiqua'],
          [5, 'Mim Akter'],
          [12, 'Rupa Das'],
        ],
      },
    },
    explanationBn: `\`metadata->'allergies'\` JSON থেকে allergies array বের করে (এক তীর → jsonb থাকে)। \`?\` operator jsonb array-তে ঐ string টা আছে কিনা দেখে।

\`@>\` (contains) একই কাজ করে পুরো document-এর উপর: "metadata-র ভেতরে কি এই অংশটা আছে?" বড় table-এ \`metadata\`-র উপর GIN index থাকলে \`@>\` সেটা ব্যবহার করতে পারে।

Hasan Mahmud-এর metadata \`{}\`: allergies key নেই, তাই \`->\` NULL দেয় আর সে বাদ পড়ে। Rupa-র দুইটা allergy (penicillin, sulfa) থাকলেও মিলেছে।`,
  },
  {
    id: 'sql-ex-calendar-gaps',
    title: 'Daily report including empty days',
    level: 'intermediate',
    category: 'implementation',
    tags: ['generate-series', 'left-join', 'time-series'],
    prompt: `Show the number of appointments for **every day** from 2024-03-01 to 2024-03-10, including days with none (as 0).`,
    examples: [{ input: 'March 1–10', output: '1–3: 0, 4–8: 1 each, 9–10: 0' }],
    hints: [
      'GROUP BY appointment_date alone only returns days that have rows.',
      'Generate the calendar with generate_series, then LEFT JOIN the appointments onto it.',
      'Count a column from appointments so empty days give 0.',
    ],
    solutions: [
      {
        label: 'generate_series + LEFT JOIN',
        code: `SELECT d::date AS day, COUNT(a.id) AS appointments
FROM generate_series(DATE '2024-03-01', DATE '2024-03-10', INTERVAL '1 day') AS d
LEFT JOIN appointments AS a ON a.appointment_date = d::date
GROUP BY d
ORDER BY d;`,
      },
    ],
    sampleRun: {
      code: `SELECT d::date AS day, COUNT(a.id) AS appointments
FROM generate_series(DATE '2024-03-01', DATE '2024-03-10', INTERVAL '1 day') AS d
LEFT JOIN appointments AS a ON a.appointment_date = d::date
GROUP BY d
ORDER BY d;`,
      resultTable: {
        columns: ['day', 'appointments'],
        rows: [
          ['2024-03-01', 0],
          ['2024-03-02', 0],
          ['2024-03-03', 0],
          ['2024-03-04', 1],
          ['2024-03-05', 1],
          ['2024-03-06', 1],
          ['2024-03-07', 1],
          ['2024-03-08', 1],
          ['2024-03-09', 0],
          ['2024-03-10', 0],
        ],
      },
    },
    explanationBn: `শুধু appointments group করলে যেদিন কিছু নেই সেদিনের row-ই তৈরি হয় না। তাই আগে \`generate_series\` দিয়ে প্রতিটা দিনের একটা "ক্যালেন্ডার" বানাও, তারপর LEFT JOIN।

যেদিন appointment নেই, সেদিন appointment-এর column NULL; \`COUNT(a.id)\` NULL গোনে না, তাই 0। \`COUNT(*)\` দিলে ক্যালেন্ডারের row-টাই গুনে 1 দেখাত।

Chart বা dashboard-এ এই ফাঁকা দিনগুলো দেখানোই আসল লক্ষ্য, নইলে graph ভুল ধারণা দেয়।`,
  },

  // ────────────────────────────── Advanced ──────────────────────────────
  {
    id: 'sql-ex-top-two-per-department',
    title: 'Top 2 earners per department',
    level: 'advanced',
    category: 'implementation',
    tags: ['window-functions', 'dense-rank', 'top-n-per-group', 'classic'],
    prompt: `For each department, return the doctors with the **two highest distinct salaries** (ties included). Show department, doctor, salary and position, ordered by department, position and doctor name.`,
    examples: [
      { input: 'Cardiology salaries 250000, 180000, 140000…', output: 'Nusrat (1), Arif (2)' },
    ],
    hints: [
      'Rank inside each department: PARTITION BY the department.',
      'DENSE_RANK keeps everyone tied for a position.',
      'Window functions cannot go in WHERE: rank in a CTE, filter outside.',
    ],
    solutions: [
      {
        label: 'DENSE_RANK in a CTE',
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
      },
    ],
    sampleRun: {
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
    explanationBn: `দুই ধাপ: (1) প্রতিটা department-এর ভেতরে salary অনুযায়ী rank, (2) বাইরে থেকে rank ≤ 2 রাখা। Window function \`WHERE\`-এর পরে চলে, তাই সরাসরি filter করা যায় না; CTE-তে হিসাব করে বাইরে filter করতে হয়।

\`DENSE_RANK\` বেছে নেওয়া হয়েছে যাতে কেউ দ্বিতীয় স্থানে tie করলে দুজনেই আসে। ঠিক 2 জন চাইলে \`ROW_NUMBER\`। Dermatology আর Pediatrics-এ একজন করে doctor, তাই সেখানে একটাই row; Oncology-তে কেউ নেই বলে inner join-এ বাদ।`,
  },
  {
    id: 'sql-ex-month-over-month',
    title: 'Month-over-month revenue growth',
    level: 'advanced',
    category: 'implementation',
    tags: ['lag', 'date-trunc', 'cte', 'window-functions'],
    prompt: `From \`payments\`, compute revenue per month, the previous month's revenue, and the growth in percent (1 decimal). The first month has nothing to compare with.`,
    examples: [
      {
        input: 'Jan 8700, Feb 8600, Mar 11400, Apr 6700',
        output: 'growth: NULL, -1.1, 32.6, -41.2',
      },
    ],
    hints: [
      "date_trunc('month', paid_at) puts every payment into its month.",
      'Aggregate per month in a CTE first.',
      'LAG(revenue) OVER (ORDER BY month) reads the previous month.',
    ],
    solutions: [
      {
        label: 'CTE + LAG',
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
      },
    ],
    sampleRun: {
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
    explanationBn: `প্রথমে CTE-তে মাসভিত্তিক মোট আয়: \`date_trunc('month', ...)\` প্রতিটা payment-কে মাসের প্রথম দিনে নামিয়ে আনে, তাই একই মাসের সব একসাথে group হয়।

তারপর \`LAG(revenue) OVER (ORDER BY month)\` প্রতিটা মাসের পাশে আগের মাসের আয় বসায়। জানুয়ারির আগে কিছু নেই, তাই NULL, আর NULL দিয়ে হিসাব করলে growth-ও NULL।

একই \`OVER (...)\` তিনবার না লিখে \`WINDOW w AS (ORDER BY month)\` দিয়ে নাম দিয়ে \`LAG(revenue) OVER w\` লেখা যায়। শূন্য দিয়ে ভাগের ভয় থাকলে \`NULLIF(prev, 0)\`।`,
  },
  {
    id: 'sql-ex-running-total',
    title: 'Daily revenue with a running total',
    level: 'advanced',
    category: 'implementation',
    tags: ['running-total', 'window-functions', 'moving-average'],
    prompt: `For March 2024, return each day that had payments, that day's revenue, the running total so far, and a 3-day moving average (current day and the two previous payment days), rounded to 2 decimals.`,
    examples: [
      { input: 'March payments', output: 'last row: 2024-03-26, 1500.00, 11400.00, 1233.33' },
    ],
    hints: [
      'Group by the date part of paid_at first.',
      'A running total is SUM(...) OVER (ORDER BY day); on grouped data that is SUM(SUM(amount)) OVER (...).',
      'The moving average needs a frame: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW.',
      'Use a half-open range for March so the last second of the month is included.',
    ],
    solutions: [
      {
        label: 'Window frames over grouped rows',
        code: `SELECT paid_at::date AS day,
       SUM(amount) AS revenue,
       SUM(SUM(amount)) OVER (ORDER BY paid_at::date) AS running_total,
       ROUND(AVG(SUM(amount)) OVER (ORDER BY paid_at::date
                                    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3
FROM payments
WHERE paid_at >= '2024-03-01' AND paid_at < '2024-04-01'
GROUP BY paid_at::date
ORDER BY day;`,
      },
    ],
    sampleRun: {
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
    explanationBn: `\`SUM(SUM(amount))\` দেখে ঘাবড়ানোর কিছু নেই: ভেতরের SUM হলো GROUP BY-এর দৈনিক মোট, বাইরের SUM window function যেটা সেগুলো জমিয়ে যায়। Window \`GROUP BY\`-এর পরে চলে বলেই এটা সম্ভব।

Moving average-এ frame \`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\` মানে "এই দিন আর আগের দুইটা **row**", ক্যালেন্ডারের দুই দিন না। মাঝে ফাঁকা দিন থাকলে (৭ থেকে ১১ মার্চ) এটা আগের payment-এর দিনগুলোই নেয়। ক্যালেন্ডার-ভিত্তিক চাইলে RANGE সহ interval লাগে।

\`paid_at < '2024-04-01'\` (half-open range) দেওয়ায় মাসের শেষ মুহূর্তের payment-ও বাদ পড়ে না।`,
  },
  {
    id: 'sql-ex-management-chain',
    title: 'Management chain with a recursive CTE',
    level: 'advanced',
    category: 'recursion',
    tags: ['recursive-cte', 'hierarchy', 'with-recursive'],
    prompt: `Starting from **Dr. Shirin Sultana** (id 11), walk up \`manager_id\` to the top of the hierarchy. Return each person's \`level\` (1 = Shirin) and \`name\`.`,
    examples: [{ input: 'id 11', output: 'Shirin → Sadia → Arif → Nusrat' }],
    hints: [
      'A recursive CTE has an anchor query (the starting row) and a recursive query joined to the CTE itself.',
      'Join doctors to the previous level on d.id = chain.manager_id.',
      'It stops by itself when the top doctor has manager_id NULL (no more matches).',
    ],
    solutions: [
      {
        label: 'WITH RECURSIVE',
        code: `WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 1 AS level
  FROM doctors
  WHERE id = 11
  UNION ALL
  SELECT d.id, d.name, d.manager_id, c.level + 1
  FROM doctors AS d
  JOIN chain AS c ON d.id = c.manager_id
)
SELECT level, name
FROM chain
ORDER BY level;`,
      },
    ],
    sampleRun: {
      code: `WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 1 AS level
  FROM doctors
  WHERE id = 11
  UNION ALL
  SELECT d.id, d.name, d.manager_id, c.level + 1
  FROM doctors AS d
  JOIN chain AS c ON d.id = c.manager_id
)
SELECT level, name
FROM chain
ORDER BY level;`,
      resultTable: {
        columns: ['level', 'name'],
        rows: [
          [1, 'Dr. Shirin Sultana'],
          [2, 'Dr. Sadia Islam'],
          [3, 'Dr. Arif Hossain'],
          [4, 'Dr. Nusrat Rahman'],
        ],
      },
    },
    explanationBn: `Recursive CTE দুই অংশের:

1. **Anchor**: শুরুর row, Shirin (level 1)।
2. **Recursive অংশ**: আগের ধাপে পাওয়া row-এর \`manager_id\` ধরে তার manager-কে আনে, level এক বাড়িয়ে।

PostgreSQL দ্বিতীয় অংশটা বারবার চালায়, প্রতিবার শুধু আগের ধাপে নতুন পাওয়া row-এর উপর। Nusrat-এর manager NULL, তাই পরের ধাপে কোনো row মেলে না আর recursion নিজেই থেমে যায়। Shirin → Sadia → Arif → Nusrat।

উল্টো দিকে (একজন manager-এর অধীনে সবাই) একই কৌশল, শুধু join হয় \`d.manager_id = c.id\`। Data-তে চক্র (cycle) থাকলে অসীম loop এড়াতে level-এর সীমা বা \`CYCLE\` clause দাও।`,
  },
];

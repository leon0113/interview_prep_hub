import { defineSection } from '../../define';

export const dml = defineSection({
  id: 'sql-dml',
  title: 'Modifying Data',
  description:
    'INSERT in its different forms, UPDATE and DELETE based on other tables, RETURNING, creating tables from queries, and changing tables with ALTER TABLE.',
  order: 7,
  questions: [
    {
      id: 'sql-insert-forms',
      level: 'foundation',
      priority: 2,
      question:
        'What are the different ways to INSERT rows, and how do you get the generated ids back?',
      tags: ['insert', 'returning', 'dml', 'identity'],
      answer: {
        interview: `**\`INSERT … VALUES\` adds literal rows (one or many per statement), \`INSERT … SELECT\` copies rows produced by a query, and \`RETURNING\` sends back the inserted rows, including generated ids and defaults.**

- List the target columns explicitly; don't rely on column order.
- Multi-row VALUES (\`VALUES (…), (…), (…)\`) is much faster than one INSERT per row; \`COPY\` is faster still for bulk loads.
- \`RETURNING id\` avoids a second query and the race of "select the max id".
- \`DEFAULT\` or omitted columns get their default value; \`ON CONFLICT\` turns the insert into an upsert.`,
        explanationBn: `Row ঢোকানোর তিনটা সাধারণ উপায়:

- **INSERT … VALUES**: হাতে লেখা মান। একটা statement-এ অনেক row দেওয়া যায়, প্রতিটা row আলাদা INSERT করার চেয়ে অনেক দ্রুত (কম round trip, কম commit)।
- **INSERT … SELECT**: অন্য query-র ফল সরাসরি ঢোকানো, যেমন archive table-এ পুরনো data কপি করা।
- **COPY**: ফাইল থেকে বিশাল পরিমাণ data।

\`RETURNING\` ঢোকানো row-গুলো ফেরত দেয়। উদাহরণে দুইটা department ঢুকিয়ে সাথে সাথে তাদের নতুন id (7, 8) পাওয়া গেছে, আলাদা query ছাড়াই। "সবচেয়ে বড় id খুঁজে নাও" পদ্ধতি বিপজ্জনক, কারণ একই সময়ে অন্য কেউ insert করলে তার id পেয়ে যেতে পারো।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A multi-row insert that returns the new ids',
            code: `INSERT INTO departments (name, location, budget)
VALUES ('Radiology', 'Building D', 900000),
       ('ENT', 'Building D', 250000)
RETURNING id, name;`,
            resultTable: {
              columns: ['id', 'name'],
              rows: [
                [7, 'Radiology'],
                [8, 'ENT'],
              ],
            },
          },
        ],
        pitfalls: [
          'INSERT INTO t VALUES (…) without a column list breaks when columns are added or reordered.',
          'Inserting thousands of rows one statement at a time with autocommit.',
        ],
        followUps: ['How do you do an upsert?', 'How would you load a million rows quickly?'],
      },
      related: ['sql-upsert', 'sql-returning-dml-cte', 'sql-surrogate-vs-natural-key'],
    },
    {
      id: 'sql-update-from-join',
      level: 'intermediate',
      priority: 2,
      question: 'How do you UPDATE rows using values or conditions from another table?',
      tags: ['update', 'update-from', 'join', 'dml'],
      answer: {
        interview: `**In PostgreSQL, use \`UPDATE target SET … FROM other_table WHERE join_condition AND filter\`; the FROM clause works like a join.**

- Example: give every Neurology doctor a 10% raise by joining to departments on the department name.
- Alternatives: a subquery in WHERE (\`WHERE department_id = (SELECT id FROM departments WHERE name = 'Neurology')\`), or \`MERGE\`.
- Every target row must match **at most one** row from FROM; with several matches, one is applied arbitrarily.
- Run the same condition as a SELECT first, and use \`RETURNING\` or the \`UPDATE n\` count to confirm what changed.
- Syntax differs by database: MySQL uses \`UPDATE a JOIN b ON … SET …\`; SQL Server uses \`UPDATE a SET … FROM a JOIN b …\`.`,
        explanationBn: `কখনো কখনো কোন row বদলাবে সেটা অন্য table দেখে ঠিক করতে হয়: "Neurology department-এর সব doctor-এর বেতন 10% বাড়াও"। কিন্তু doctors table-এ department-এর নাম নেই, শুধু id।

Postgres-এ \`UPDATE ... FROM\` দিয়ে অন্য table জোড়া লাগিয়ে শর্ত দেওয়া যায়, JOIN-এর মতো। উদাহরণে দুজন (Farzana, Rumana) বদলেছে, তাই "UPDATE 2"। তারপর SELECT দিয়ে নতুন বেতন: 180000 → 198000, 135000 → 148500।

নিরাপদ অভ্যাস: UPDATE চালানোর আগে একই WHERE দিয়ে SELECT চালিয়ে দেখো কোন row-গুলো বদলাবে। আর যদি target row-এর সাথে FROM-এর একাধিক row মেলে, Postgres যেকোনো একটা ব্যবহার করবে, কোনো error ছাড়াই; তাই join-এর শর্ত যেন একটাই মেলায়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A 10% raise for one department, matched by name',
            code: `UPDATE doctors AS d
SET salary = d.salary * 1.10
FROM departments AS dep
WHERE dep.id = d.department_id AND dep.name = 'Neurology';

SELECT name, salary FROM doctors WHERE department_id = 2 ORDER BY id;`,
            output: `UPDATE 2`,
            resultTable: {
              columns: ['name', 'salary'],
              rows: [
                ['Dr. Farzana Akter', '198000.00'],
                ['Dr. Rumana Chowdhury', '148500.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Forgetting the join condition in WHERE: every target row is updated.',
          'A join that matches several rows per target: the result is unpredictable.',
          'UPDATE without WHERE updates the whole table.',
        ],
        followUps: [
          'How would you do the same in MySQL?',
          'How do you avoid lost updates when two requests change the same row?',
        ],
      },
      related: ['sql-lost-update', 'sql-upsert'],
    },
    {
      id: 'sql-delete-returning',
      level: 'intermediate',
      priority: 2,
      question: 'How do you delete rows safely, and how do you see what was deleted?',
      tags: ['delete', 'returning', 'using', 'dml', 'safety'],
      answer: {
        interview: `**Write the WHERE as a SELECT first, run the DELETE inside a transaction, and use \`RETURNING\` to see (or archive) exactly which rows were removed.**

- \`DELETE … RETURNING *\` returns the deleted rows; combined with a data-modifying CTE you can move them into an archive table in one statement.
- \`DELETE FROM a USING b WHERE …\` deletes based on another table (PostgreSQL's join syntax for DELETE).
- Check the \`DELETE n\` count against what you expected before committing.
- Large deletes: delete in batches (e.g. 10,000 rows per transaction) to avoid long locks and huge transactions; for whole tables use TRUNCATE; for time-based data, drop partitions.
- Remember ON DELETE rules: CASCADE can remove rows in other tables too.`,
        explanationBn: `ভুল DELETE ফিরিয়ে আনা কঠিন, তাই অভ্যাস তৈরি করো:

1. আগে একই WHERE দিয়ে **SELECT** চালাও, দেখো কয়টা আর কোন row।
2. **BEGIN** দিয়ে transaction শুরু করো, DELETE চালাও, সংখ্যা মিলিয়ে তারপর **COMMIT** (না মিললে ROLLBACK)।
3. **RETURNING** দিয়ে ঠিক কোন row গুলো মুছলো দেখো।

উদাহরণে insurance-এর চারটা payment মোছা হয়েছে, আর RETURNING তাদের id আর amount ফেরত দিয়েছে। এই ফল সরাসরি archive table-এ ঢোকানো যায় (\`WITH moved AS (DELETE ... RETURNING *) INSERT INTO archive SELECT * FROM moved\`)।

লাখো row মুছতে হলে এক ধাক্কায় না করে ছোট ছোট batch-এ করো, যাতে table দীর্ঘক্ষণ lock না থাকে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'RETURNING shows exactly what was removed',
            code: `DELETE FROM payments
WHERE method = 'insurance'
RETURNING id, amount;`,
            resultTable: {
              columns: ['id', 'amount'],
              rows: [
                [5, '1000.00'],
                [9, '2000.00'],
                [19, '1300.00'],
                [25, '2000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'DELETE without WHERE, or with a WHERE that matches more than intended.',
          'One huge DELETE: long locks, bloat and a long VACUUM afterwards.',
        ],
        followUps: [
          'What is the difference between DELETE, TRUNCATE and DROP?',
          'How would you archive rows older than a year?',
        ],
      },
      related: ['sql-delete-truncate-drop', 'sql-returning-dml-cte', 'sql-foreign-key-on-delete'],
    },
    {
      id: 'sql-create-table-as',
      level: 'intermediate',
      priority: 1,
      question:
        'How do you create a table from a query? CREATE TABLE AS vs SELECT INTO vs INSERT … SELECT?',
      tags: ['create-table-as', 'select-into', 'insert-select', 'ddl'],
      answer: {
        interview: `**\`CREATE TABLE new AS SELECT …\` creates a table and fills it with the query result in one step; \`INSERT INTO existing SELECT …\` fills a table you already defined.**

| Option | Creates the table | Copies constraints and indexes | Notes |
| --- | --- | --- | --- |
| \`CREATE TABLE … AS SELECT\` | Yes | No: only column names and types | Preferred form |
| \`SELECT … INTO new_table\` | Yes | No | Same effect, legacy syntax; avoid in PostgreSQL (and inside PL/pgSQL it means something else) |
| \`INSERT INTO t SELECT …\` | No | Uses the existing table's definition | Best when the target needs keys, constraints, defaults |
| \`CREATE TABLE t (LIKE src INCLUDING ALL)\` | Yes, empty | Yes | Copy structure, then INSERT … SELECT |

Use CREATE TABLE AS for quick snapshots and analysis; define the table properly (keys, constraints) when it is part of the application schema.`,
        explanationBn: `কোনো query-র ফল থেকে নতুন table বানানোর কয়েকটা উপায়:

- **CREATE TABLE … AS SELECT**: এক ধাপে table বানিয়ে data ভরে দেয়। উদাহরণে Cardiology-র 5 জন doctor কপি হয়েছে, তাই output "SELECT 5"। তবে primary key, constraint, index কিছুই কপি হয় না, শুধু column আর type।
- **SELECT … INTO**: একই কাজ, পুরনো syntax। PL/pgSQL-এর ভেতরে \`SELECT INTO\` মানে variable-এ মান রাখা, তাই গুলিয়ে যায়; এড়িয়ে চলো।
- **INSERT … SELECT**: table আগে থেকে ঠিকমতো বানানো (key, constraint সহ), শুধু data ভরো।
- **LIKE … INCLUDING ALL**: শুধু কাঠামো (constraint, index সহ) কপি, খালি table।

Snapshot বা analysis-এর জন্য CREATE TABLE AS ঠিক আছে; app-এর আসল table হলে ঠিকমতো নকশা করে বানাও।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A snapshot table built from a query',
            code: `CREATE TABLE cardiology_doctors AS
SELECT id, name, salary
FROM doctors
WHERE department_id = 1;`,
            output: `SELECT 5`,
          },
        ],
        pitfalls: [
          'Expecting CREATE TABLE AS to copy the primary key, NOT NULL constraints or indexes.',
        ],
        followUps: [
          'What is the difference between a table created this way and a materialized view?',
        ],
      },
      related: ['sql-view-vs-materialized-view', 'sql-insert-forms'],
    },
    {
      id: 'sql-alter-table',
      level: 'intermediate',
      priority: 1,
      question:
        'How do you change an existing table with ALTER TABLE, and which changes are expensive?',
      tags: ['alter-table', 'ddl', 'migrations', 'locking'],
      answer: {
        interview: `**ALTER TABLE adds, drops, renames or changes columns and constraints; some changes only update the catalog (instant), others rewrite or scan the whole table under a strong lock.**

| Change | Cost in PostgreSQL |
| --- | --- |
| Add a nullable column | Instant |
| Add a column with a constant DEFAULT (PG 11+) | Instant (the default is stored once) |
| Add a column with a volatile default (\`now()\`, \`random()\`) | Rewrites the table |
| Drop a column | Instant (space reclaimed later) |
| Rename a column or table | Instant, but breaks queries that use the old name |
| Change a column type | Usually rewrites the table (some, like varchar widening, don't) |
| Add NOT NULL / CHECK / FK | Scans the table, unless added NOT VALID and validated later |

Every ALTER TABLE takes a lock; even an instant one waits behind long-running queries and blocks others meanwhile, so set a \`lock_timeout\` in migrations.`,
        explanationBn: `\`ALTER TABLE\` দিয়ে চালু table-এর কাঠামো বদলানো যায়। মূল কথা: কোন বদল সাথে সাথে হয়, আর কোনটা পুরো table নতুন করে লেখে।

- নতুন column যোগ (default ছাড়া বা স্থির default সহ): মুহূর্তে হয়। PostgreSQL 11 থেকে স্থির default একবারই জমা রাখা হয়, প্রতিটা row-এ লিখতে হয় না। উদাহরণে \`is_active\` column যোগ করার সাথে সাথে সব 14 জন রোগী \`true\` পেয়ে গেছে।
- Column-এর type বদলানো বা \`now()\` মতো পরিবর্তনশীল default: পুরো table নতুন করে লেখা হয়, বড় table-এ অনেক সময় আর পুরো সময় table lock।

আরেকটা লুকানো বিপদ: মুহূর্তের ALTER-ও lock পেতে অপেক্ষা করে। কোনো লম্বা query চললে ALTER তার পেছনে আটকে থাকে, আর ALTER-এর পেছনে বাকি সব query আটকে যায়। তাই migration-এ \`lock_timeout\` দাও।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Adding a column with a constant default is instant and fills every row',
            code: `ALTER TABLE patients ADD COLUMN is_active boolean NOT NULL DEFAULT true;
SELECT COUNT(*) FILTER (WHERE is_active) AS active FROM patients;`,
            output: `ALTER TABLE`,
            resultTable: { columns: ['active'], rows: [[14]] },
          },
        ],
        pitfalls: [
          'Renaming a column the running application still uses: deploy code that reads both names first.',
          'Running ALTER TABLE without lock_timeout behind a long transaction, freezing the table.',
        ],
        followUps: [
          'How would you rename a column with zero downtime?',
          'How do you add a constraint to a large table safely?',
        ],
      },
      related: ['sql-add-constraint-safely', 'sql-command-families'],
    },
  ],
});

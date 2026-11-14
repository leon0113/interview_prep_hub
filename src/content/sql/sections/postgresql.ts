import { defineSection } from '../../define';

export const postgresql = defineSection({
  id: 'sql-postgresql',
  title: 'PostgreSQL Features',
  description:
    'What sets PostgreSQL apart: JSONB and GIN indexes, upserts and MERGE, DISTINCT ON, RETURNING, arrays, generate_series, FILTER, enums, time zones, MVCC and VACUUM, full-text search and partitioning.',
  order: 12,
  questions: [
    {
      id: 'sql-postgres-vs-mysql',
      level: 'foundation',
      priority: 2,
      question: 'Why choose PostgreSQL? How does it compare with MySQL?',
      tags: ['postgresql', 'mysql', 'comparison', 'transactional-ddl'],
      answer: {
        interview: `**PostgreSQL is a standards-focused, extensible open-source RDBMS with strong correctness guarantees and rich data types; MySQL is simpler and very popular for web workloads, with fewer advanced features.**

| Aspect | PostgreSQL | MySQL (InnoDB) |
| --- | --- | --- |
| SQL standard compliance | High: CTEs, window functions, \`MERGE\`, \`FILTER\`, \`LATERAL\` | Good, fewer advanced features |
| Data types | JSONB (indexable), arrays, ranges, enums, custom types, \`uuid\`, \`inet\` | JSON, fewer specialized types |
| Transactional DDL | Yes: \`CREATE\`/\`ALTER\` can be rolled back | No: most DDL commits implicitly |
| Concurrency | MVCC with old row versions in the table, cleaned by VACUUM | MVCC with undo logs |
| Table storage | Heap; all indexes secondary | Clustered on the primary key |
| Index types | B-tree, Hash, GIN, GiST, SP-GiST, BRIN, partial, expression | Mainly B-tree, full-text, spatial |
| Extensibility | Extensions: PostGIS, pg_trgm, pgvector, TimescaleDB | Plugins, more limited |
| \`RETURNING\` | Yes | No (MariaDB has it) |

Real-world: pick PostgreSQL when data integrity, complex queries, JSON or geospatial features matter; MySQL is a fine choice for simple, read-heavy CRUD with existing MySQL expertise.`,
        explanationBn: `দুটোই ভালো, জনপ্রিয় open-source RDBMS। Interview-এ "কোনটা ভালো" না বলে **কোন কাজে কোনটা** বলা উচিত।

PostgreSQL-এর শক্তি:
- **Correctness**: SQL standard কড়াভাবে মানে। ভুল type-এর data চুপচাপ বদলে ঢুকিয়ে দেয় না।
- **Rich types**: JSONB (index করা যায়), array, range, enum, নিজের বানানো type।
- **Transactional DDL**: table বানানো বা column যোগ করাও rollback করা যায়। Migration-এর মাঝে ভুল হলে database অর্ধেক-বদলানো অবস্থায় আটকে থাকে না। উদাহরণে \`CREATE TABLE\` আর \`ALTER TABLE\` দুটোই rollback হয়ে গেছে: table নেই (\`NULL\`), column-ও নেই।
- **Extension**: PostGIS (map/location), pgvector (AI embedding search), pg_trgm (fuzzy search), এগুলো database-এর ভেতরেই নতুন ক্ষমতা যোগ করে।

MySQL-এর সুবিধা: setup সহজ, অনেক hosting-এ default, সাধারণ read-heavy web app-এ খুব দ্রুত, আর বিশাল community।

Internal পার্থক্যও জানা ভালো: InnoDB primary key অনুযায়ী data সাজিয়ে রাখে (clustered), Postgres heap-এ রাখে। Postgres update করলে row-এর নতুন version বানায়, পুরনোটা পরে VACUUM পরিষ্কার করে; InnoDB পুরনো version undo log-এ রাখে।`,
        examples: [
          {
            lang: 'sql',
            caption:
              'Transactional DDL: the new table and the new column both disappear on ROLLBACK',
            code: `BEGIN;
CREATE TABLE audit_log (id int, note text);
ALTER TABLE doctors ADD COLUMN phone text;
ROLLBACK;
SELECT to_regclass('audit_log') AS audit_log_table,
       (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_name = 'doctors' AND column_name = 'phone') AS phone_columns;`,
            output: `BEGIN
CREATE TABLE
ALTER TABLE
ROLLBACK`,
            resultTable: {
              columns: ['audit_log_table', 'phone_columns'],
              rows: [[null, 0]],
            },
          },
        ],
        pitfalls: [
          'Claiming one is "faster" in general; it depends entirely on the workload and schema.',
          'Some statements cannot run inside a transaction even in PostgreSQL, e.g. CREATE INDEX CONCURRENTLY and VACUUM.',
        ],
        followUps: [
          'What is MVCC, and why does PostgreSQL need VACUUM?',
          'What is JSONB?',
          'Which PostgreSQL extensions have you used?',
        ],
      },
      related: ['sql-mvcc-vacuum', 'sql-jsonb'],
    },
    {
      id: 'sql-jsonb',
      level: 'intermediate',
      priority: 3,
      question: 'What is the difference between JSON and JSONB, and how do you query JSONB?',
      tags: ['postgresql', 'jsonb', 'json', 'operators', 'semi-structured'],
      answer: {
        interview: `**\`json\` stores the input text as is; \`jsonb\` stores a parsed binary form, which is slightly slower to write but much faster to query and can be indexed. Use \`jsonb\` almost always.**

| Aspect | json | jsonb |
| --- | --- | --- |
| Storage | Exact text | Decomposed binary |
| Key order, whitespace | Preserved | Not preserved (keys sorted) |
| Duplicate keys | Kept | Last one wins |
| Containment and existence operators (\`@>\`, \`?\`) | No | Yes |
| GIN indexing | No | Yes |

Key operators:
- \`->\` returns JSON, \`->>\` returns text: \`metadata->>'insurance'\`; chain for nesting: \`metadata->'tags'->>0\`.
- \`@>\` containment: \`metadata @> '{"tags": ["chronic"]}'\`.
- \`?\` key exists; \`?|\` / \`?&\` any / all keys exist.
- Modify with \`jsonb_set\`, \`||\` (merge), \`-\` (remove key); expand with \`jsonb_array_elements\`, \`jsonb_each\`.

Use JSONB for genuinely variable attributes; keep fields you filter, join or constrain on as real columns.`,
        explanationBn: `PostgreSQL-এ JSON রাখার দুটো type:

- **json**: যা দিয়েছ হুবহু text হিসেবে রাখে, space, key-এর ক্রম, এমনকি duplicate key পর্যন্ত। প্রতিবার query করলে আবার parse করতে হয়।
- **jsonb**: ঢোকানোর সময়ই parse করে binary আকারে রাখে। key sorted হয়ে যায়, duplicate key-এর শেষটা থাকে। লেখায় সামান্য বেশি সময়, কিন্তু পড়া অনেক দ্রুত, আর **index করা যায়**। উদাহরণে দেখো, \`"a"\` দুবার দেওয়ায় jsonb শুধু শেষটা (3) রেখেছে আর key-গুলো সাজিয়ে ফেলেছে।

Operator গুলো মনে রাখার কৌশল: **এক তীর (\`->\`) JSON ফেরত দেয়, দুই তীর (\`->>\`) text।** তাই তুলনা বা দেখানোর সময় \`->>\`, আরও ভেতরে ঢুকতে \`->\`।

\`@>\` (contains): "এই JSON-এর ভেতরে কি এই অংশটা আছে?" \`{"tags": ["chronic"]}\` মানে tags array-তে "chronic" আছে এমন patient। GIN index এই operator-কে দ্রুত করে।

\`?\` key আছে কিনা দেখে। Hasan Mahmud-এর metadata \`{}\`, তাই সে বাদ পড়েছে; আর যাদের \`"insurance": null\`, তাদের key আছে, তাই তারা NULL group-এ।

সতর্কতা: সবকিছু JSONB-তে ঢোকালে type check, constraint, foreign key সব হারাবে। যেটা দিয়ে নিয়মিত filter বা JOIN করো, সেটা আলাদা column হওয়া উচিত।`,
        examples: [
          {
            lang: 'sql',
            caption: 'jsonb normalizes the input; json keeps it verbatim',
            code: `SELECT '{"b": 1, "a": 2, "a": 3}'::json  AS as_json,
       '{"b": 1, "a": 2, "a": 3}'::jsonb AS as_jsonb;`,
            resultTable: {
              columns: ['as_json', 'as_jsonb'],
              rows: [['{"b": 1, "a": 2, "a": 3}', '{"a": 3, "b": 1}']],
            },
          },
          {
            lang: 'sql',
            caption: '->, ->> and containment with @>',
            code: `SELECT name,
       metadata->>'insurance' AS insurance,
       metadata->'tags' AS tags,
       metadata->'tags'->>0 AS first_tag
FROM patients
WHERE metadata @> '{"tags": ["chronic"]}'
ORDER BY id;`,
            resultTable: {
              columns: ['name', 'insurance', 'tags', 'first_tag'],
              rows: [
                ['Sabbir Hasan', 'MetLife', '["chronic"]', 'chronic'],
                ['Jamal Hossain', null, '["chronic", "senior"]', 'chronic'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'Key existence with ?: patients whose metadata has an insurance key',
            code: `SELECT metadata->>'insurance' AS insurance, COUNT(*) AS patients
FROM patients
WHERE metadata ? 'insurance'
GROUP BY 1
ORDER BY patients DESC, insurance NULLS LAST;`,
            resultTable: {
              columns: ['insurance', 'patients'],
              rows: [
                ['MetLife', 4],
                [null, 4],
                ['Green Delta', 3],
                ['Pragati', 2],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'Updating inside a document: jsonb_set and || merge',
            code: `UPDATE patients
SET metadata = jsonb_set(metadata, '{insurance}', '"Pragati"')
             || '{"verified": true}'
WHERE id = 2
RETURNING metadata;`,
            resultTable: {
              columns: ['metadata'],
              rows: [['{"tags": [], "verified": true, "allergies": [], "insurance": "Pragati"}']],
            },
          },
        ],
        pitfalls: [
          "Comparing with -> instead of ->>: metadata->'insurance' = 'MetLife' fails, because the left side is jsonb.",
          'A JSON null ("insurance": null) and a missing key are different: ? tells them apart, ->> returns NULL for both.',
          'Updating one key rewrites the whole JSONB value; large, frequently updated documents are expensive.',
        ],
        followUps: [
          'How do you index a JSONB column?',
          'When would you use JSONB instead of separate columns?',
        ],
      },
      related: ['sql-jsonb-indexing', 'sql-postgres-vs-mysql'],
    },
    {
      id: 'sql-upsert',
      level: 'intermediate',
      priority: 3,
      question: 'How do you do an upsert in PostgreSQL? What about MERGE?',
      tags: ['postgresql', 'upsert', 'on-conflict', 'merge', 'excluded'],
      answer: {
        interview: `**Use \`INSERT ... ON CONFLICT\`: insert the row, and if it would violate a unique constraint, either update the existing row (\`DO UPDATE\`) or skip it (\`DO NOTHING\`), atomically.**

- The conflict target must match a unique index or constraint: \`ON CONFLICT (doctor_id)\` or \`ON CONFLICT ON CONSTRAINT name\`.
- \`EXCLUDED\` refers to the row that was proposed for insertion; the table name (or alias) refers to the existing row.
- Add \`WHERE\` to \`DO UPDATE\` to update only when something actually changed.
- It is safe under concurrency: no "check then insert" race.
- \`MERGE\` (PostgreSQL 15+; \`RETURNING\` with \`merge_action()\` since 17) syncs a source into a target with several \`WHEN MATCHED / NOT MATCHED\` branches, including deletes. It does not use the same conflict-handling, so under concurrent inserts \`ON CONFLICT\` is the safer upsert.

Real-world: counters, "last seen" timestamps, idempotent imports and webhook handlers.`,
        explanationBn: `**Upsert** = **up**date + in**sert**: "row থাকলে update করো, না থাকলে insert করো।"

নিজে হাতে করলে: আগে \`SELECT\` করে দেখো আছে কিনা, তারপর \`INSERT\` বা \`UPDATE\`। সমস্যা: দুটো request একসাথে এলে দুজনেই দেখবে "নেই", দুজনেই insert করবে, একজন unique error খাবে। এটা race condition।

\`ON CONFLICT\` এই পুরো কাজটা একটা atomic statement-এ করে:
- \`DO NOTHING\`: আগে থেকেই থাকলে চুপচাপ বাদ। উদাহরণে Cardiology আগেই আছে, তাই \`INSERT 0 0\`, error নেই। Idempotent import-এ খুব কাজের।
- \`DO UPDATE\`: আগে থাকলে update। \`EXCLUDED\` হলো "যেটা ঢোকাতে চেয়েছিলাম" সেই row, আর table-এর alias (\`r\`) হলো "যেটা আগে থেকে ছিল"। উদাহরণে doctor 1-এর rating আগে ছিল (1টা, মোট 5), নতুনটা যোগ হয়ে 2টা, মোট 9। Doctor 2 নতুন, তাই সোজা insert।

**MERGE** আরও সাধারণ: একটা source table-এর সাথে target মিলিয়ে, মিললে update (বা delete), না মিললে insert। Data warehouse-এ sync করার কাজে সুবিধাজনক। PostgreSQL 17 থেকে \`RETURNING merge_action()\` বলে দেয় কোন row-এ কী হয়েছে। তবে একসাথে অনেক insert চলার সময় MERGE-ও unique error দিতে পারে; সেখানে \`ON CONFLICT\` নিরাপদ।`,
        examples: [
          {
            lang: 'sql',
            caption: 'ON CONFLICT DO UPDATE: add to the existing row, or insert a new one',
            code: `CREATE TABLE doctor_ratings (
  doctor_id int PRIMARY KEY REFERENCES doctors (id),
  ratings   int NOT NULL,
  total     int NOT NULL
);
INSERT INTO doctor_ratings VALUES (1, 1, 5);
INSERT INTO doctor_ratings AS r (doctor_id, ratings, total)
VALUES (1, 1, 4), (2, 1, 3)
ON CONFLICT (doctor_id) DO UPDATE
SET ratings = r.ratings + EXCLUDED.ratings,
    total   = r.total + EXCLUDED.total;
SELECT doctor_id, ratings, total FROM doctor_ratings ORDER BY doctor_id;`,
            output: `CREATE TABLE
INSERT 0 1
INSERT 0 2`,
            resultTable: {
              columns: ['doctor_id', 'ratings', 'total'],
              rows: [
                [1, 2, 9],
                [2, 1, 3],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'DO NOTHING: an idempotent insert',
            code: `INSERT INTO departments (name, location, budget)
VALUES ('Cardiology', 'Building A', 1)
ON CONFLICT (name) DO NOTHING;`,
            output: `INSERT 0 0`,
          },
          {
            lang: 'sql',
            caption: 'MERGE with RETURNING merge_action() (PostgreSQL 17+)',
            code: `MERGE INTO departments AS d
USING (VALUES ('Cardiology', 550000.00), ('Radiology', 250000.00)) AS s(name, budget)
ON d.name = s.name
WHEN MATCHED THEN UPDATE SET budget = s.budget
WHEN NOT MATCHED THEN INSERT (name, location, budget) VALUES (s.name, 'Building D', s.budget)
RETURNING merge_action(), d.id, d.name, d.budget;`,
            resultTable: {
              columns: ['merge_action', 'id', 'name', 'budget'],
              rows: [
                ['UPDATE', 1, 'Cardiology', '550000.00'],
                ['INSERT', 7, 'Radiology', '250000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'ON CONFLICT needs a unique index or constraint on exactly the conflict columns; otherwise it errors.',
          'One INSERT ... ON CONFLICT DO UPDATE cannot touch the same row twice: duplicate keys in the VALUES list raise an error.',
          'A failed conflict still consumes identity/sequence values, so ids get gaps.',
        ],
        followUps: [
          'What does EXCLUDED refer to?',
          'How would you make an API endpoint idempotent?',
        ],
      },
      related: ['sql-returning-dml-cte', 'sql-lost-update'],
    },
    {
      id: 'sql-distinct-on',
      level: 'intermediate',
      priority: 2,
      question: 'What does DISTINCT ON do in PostgreSQL?',
      tags: ['postgresql', 'distinct-on', 'top-n', 'latest-per-group'],
      answer: {
        interview: `**\`DISTINCT ON (expr)\` keeps only the first row for each distinct value of \`expr\`, where "first" is defined by the ORDER BY; it is PostgreSQL's shortcut for "one row per group".**

- The \`ORDER BY\` must start with the \`DISTINCT ON\` expressions, followed by the column that picks the winner: \`ORDER BY patient_id, appointment_date DESC\` gives each patient's latest visit.
- Unlike \`GROUP BY\`, it returns whole rows, so you can select any columns of the winning row.
- Equivalent portable version: \`ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY appointment_date DESC) = 1\` in a subquery.
- Only handles "top 1"; for top N use a window function or \`LATERAL ... LIMIT N\`.
- Groups with no rows don't appear (patient 13 has no appointments).`,
        explanationBn: `"প্রতিটা patient-এর শেষ visit" ধরনের প্রশ্ন খুব common। Window function দিয়ে করা যায় (\`ROW_NUMBER() ... = 1\`), কিন্তু PostgreSQL-এ একটা সংক্ষিপ্ত উপায় আছে: **DISTINCT ON**।

কীভাবে কাজ করে:
1. Row-গুলোকে \`ORDER BY patient_id, appointment_date DESC\` অনুযায়ী sort করে। ফলে প্রতিটা patient-এর row একসাথে, আর তার মধ্যে সবচেয়ে নতুন তারিখ আগে।
2. প্রতিটা নতুন \`patient_id\` দেখলে **প্রথম row-টা রাখে**, বাকিগুলো ফেলে দেয়।

তাই \`ORDER BY\`-এর শুরু অবশ্যই \`DISTINCT ON\`-এর column হতে হবে, আর পরের column ঠিক করে কোন row "জিতবে"। দ্বিতীয় অংশ না দিলে কোন row আসবে নিশ্চিত না।

\`GROUP BY patient_id\` দিয়ে \`MAX(appointment_date)\` পাওয়া যেত, কিন্তু সেই visit-এর status পেতে আবার JOIN লাগত। DISTINCT ON পুরো row দিয়ে দেয়।

Patient 13 (Hasan)-এর কোনো appointment নেই, তাই সে আসেনি। তাকে রাখতে হলে \`patients LEFT JOIN LATERAL (...)\` লাগবে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Each patient’s most recent appointment, as a whole row',
            code: `SELECT DISTINCT ON (patient_id)
       patient_id, appointment_date AS last_visit, status
FROM appointments
WHERE patient_id IN (1, 4, 5, 13)
ORDER BY patient_id, appointment_date DESC;`,
            resultTable: {
              columns: ['patient_id', 'last_visit', 'status'],
              rows: [
                [1, '2024-04-19', 'completed'],
                [4, '2024-03-19', 'completed'],
                [5, '2024-04-29', 'scheduled'],
              ],
            },
          },
        ],
        pitfalls: [
          'ORDER BY that does not start with the DISTINCT ON expressions is an error.',
          'Without a tie-breaker after the DISTINCT ON columns, which row wins is arbitrary.',
          'It is not portable SQL; mention the ROW_NUMBER version for other databases.',
        ],
        followUps: [
          'How would you get the latest two visits per patient?',
          'How would you include patients with no appointments?',
        ],
      },
      related: ['sql-top-n-per-group', 'sql-row-number-rank-dense-rank'],
    },
    {
      id: 'sql-returning-dml-cte',
      level: 'intermediate',
      priority: 2,
      question: 'What does RETURNING do, and what are data-modifying CTEs?',
      tags: ['postgresql', 'returning', 'cte', 'dml'],
      answer: {
        interview: `**\`RETURNING\` makes INSERT, UPDATE, DELETE and MERGE return the rows they changed, so you get generated ids or new values without a second query; a data-modifying CTE puts such a statement inside \`WITH\` so its returned rows feed the next statement.**

- \`INSERT ... RETURNING id\` replaces "insert, then SELECT the last id" (and avoids races).
- \`UPDATE ... RETURNING *\` shows post-update values; \`DELETE ... RETURNING *\` shows what was removed.
- \`WITH moved AS (DELETE FROM a ... RETURNING *) INSERT INTO archive SELECT * FROM moved\`: move rows in one atomic statement.
- All sub-statements see the same snapshot and run together; they cannot see each other's changes except through the \`RETURNING\` rows.

Real-world: archive old appointments, or cancel and rebook in one round trip.`,
        explanationBn: `**RETURNING**: সাধারণত INSERT/UPDATE/DELETE শুধু বলে "কয়টা row বদলেছে"। \`RETURNING\` বললে বদলানো row-গুলোই ফেরত দেয়। নতুন row-এর id জানতে আলাদা query লাগে না, আর "সর্বশেষ id" খুঁজতে গিয়ে অন্য কারো insert ধরে ফেলার ভয়ও নেই।

**Data-modifying CTE**: \`WITH\`-এর ভেতরে শুধু SELECT না, UPDATE/INSERT/DELETE-ও রাখা যায়। তাদের \`RETURNING\`-এর row-গুলো পরের অংশে table-এর মতো ব্যবহার করা যায়।

উদাহরণে এক statement-এ দুটো কাজ:
1. সব scheduled appointment cancel করা (id 39 আর 40), আর তাদের patient_id ফেরত দেওয়া।
2. সেই patient-দের জন্য Dr. Arif-এর সাথে নতুন appointment বানানো, নতুন id সহ (41, 42)।

পুরোটা একটা statement, তাই atomic: হয় দুটোই হবে, নয় কোনোটাই না।

একটা সূক্ষ্ম নিয়ম: সব অংশ একই snapshot দেখে। মানে মূল query যদি সরাসরি \`appointments\` পড়ে, সে CTE-র update দেখতে পাবে না, শুধু \`RETURNING\`-এর মাধ্যমে পরিবর্তন জানা যায়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Cancel and rebook in one atomic statement',
            code: `WITH cancelled AS (
  UPDATE appointments SET status = 'cancelled'
  WHERE status = 'scheduled'
  RETURNING id, patient_id
)
INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, fee)
SELECT patient_id, 2, DATE '2024-05-06', 'scheduled', 1200
FROM cancelled
RETURNING id, patient_id, appointment_date, status;`,
            resultTable: {
              columns: ['id', 'patient_id', 'appointment_date', 'status'],
              rows: [
                [41, 5, '2024-05-06', 'scheduled'],
                [42, 14, '2024-05-06', 'scheduled'],
              ],
            },
          },
        ],
        pitfalls: [
          'Two sub-statements updating the same row in one query: only one change applies, unpredictably. Don’t do it.',
          'The main query does not see the CTE’s changes in the base table; use the RETURNING rows.',
        ],
        followUps: [
          'How would you move rows older than a year into an archive table?',
          'How do you get the id of a newly inserted row?',
        ],
      },
      related: ['sql-upsert'],
    },
    {
      id: 'sql-generate-series',
      level: 'intermediate',
      priority: 2,
      question: 'How do you include days with no data in a time-series report?',
      tags: ['postgresql', 'generate-series', 'time-series', 'gaps', 'left-join'],
      answer: {
        interview: `**Generate every date in the range with \`generate_series\` and LEFT JOIN the data onto it, so empty days appear with 0 instead of disappearing.**

- \`GROUP BY day\` on the data alone only returns days that have rows; charts then skip dates silently.
- \`generate_series(start, stop, step)\` returns a set of numbers or timestamps; cast to \`date\` when needed.
- Count a column from the joined table (\`COUNT(a.id)\`) so empty days give 0, not 1; use \`COALESCE(SUM(x), 0)\` for sums.
- The same pattern fills gaps per group: cross join the calendar with the groups, then left join the facts.

Real-world: daily signups, revenue per day, a heatmap of appointments where quiet days must show as zero.`,
        explanationBn: `ধরো মার্চের প্রথম 10 দিনের appointment chart বানাবে। শুধু \`GROUP BY appointment_date\` করলে যেদিন কোনো appointment নেই, সেদিনের row-ই আসবে না। Chart-এ 3 তারিখের পর সরাসরি 4 দেখাবে, আর মনে হবে সব দিনই কিছু ছিল।

সমাধান: আগে একটা "ক্যালেন্ডার" বানাও, তারপর data সেটার সাথে জোড়া লাগাও।
- \`generate_series(DATE '2024-03-01', DATE '2024-03-10', INTERVAL '1 day')\` প্রতিটা দিনের একটা row বানায়।
- \`LEFT JOIN\` দিয়ে appointments জোড়া: যেদিন appointment নেই, সেদিন appointment-এর column NULL।
- \`COUNT(a.id)\` NULL গোনে না, তাই সেই দিন 0। \`COUNT(*)\` লিখলে ভুল করে 1 আসত, কারণ ক্যালেন্ডারের row-টা তো আছে।

ফলে 1–3 আর 9–10 তারিখে 0, আর 4–8 তারিখে 1 করে (Sabbir-এর টানা visit আর একটা no-show)।

\`generate_series\` সংখ্যা দিয়েও কাজ করে: \`generate_series(1, 5)\`, test data বানাতে খুব কাজের।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A calendar LEFT JOIN data: empty days show 0',
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
        ],
        pitfalls: [
          'COUNT(*) after a LEFT JOIN counts the calendar row: empty days show 1.',
          'Putting a filter on the joined table in WHERE turns the LEFT JOIN back into an inner join; put it in the ON clause.',
          'generate_series with dates returns timestamps; cast to date before joining on a date column.',
        ],
        followUps: [
          'How would you fill gaps per doctor, not just per day?',
          'How do you generate test data quickly in PostgreSQL?',
        ],
      },
      related: ['sql-running-total', 'sql-filter-clause'],
    },
    {
      id: 'sql-filter-clause',
      level: 'intermediate',
      priority: 2,
      question:
        'How do you compute several conditional counts in one query (conditional aggregation)?',
      tags: ['postgresql', 'filter', 'conditional-aggregation', 'pivot', 'string-agg'],
      answer: {
        interview: `**Aggregate once over all rows and attach a condition to each aggregate: \`COUNT(*) FILTER (WHERE status = 'completed')\` in PostgreSQL, or the portable \`SUM(CASE WHEN ... THEN 1 ELSE 0 END)\`.**

- One pass over the table instead of one query (or subquery) per condition.
- \`FILTER\` works with any aggregate: \`SUM(fee) FILTER (WHERE ...)\`, \`array_agg(...) FILTER (...)\`, and in \`HAVING\`.
- This is how you pivot rows into columns: one aggregate per output column.
- \`string_agg(expr, ', ' ORDER BY ...)\` concatenates values into one text per group; \`array_agg\` collects an array.

Real-world: a dashboard row per doctor with total, completed and no-show counts, or revenue by payment method as columns.`,
        explanationBn: `ধরো প্রতিটা doctor-এর জন্য দেখাতে চাও: মোট appointment, কয়টা completed, কয়টা no-show। প্রতিটার জন্য আলাদা query বা subquery লিখলে table বারবার পড়তে হয়।

**Conditional aggregation**: table একবার পড়ো, আর প্রতিটা aggregate-কে বলো কোন row গুনবে।
- PostgreSQL-এ: \`COUNT(*) FILTER (WHERE a.status = 'completed')\`। পড়তে সহজ।
- সব database-এ চলে এমন: \`SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END)\`।

এটাই **pivot** করার মূল কৌশল: row-এ থাকা মানগুলো (status) column হয়ে যায়।

\`HAVING COUNT(*) FILTER (WHERE a.status <> 'completed') > 0\` শুধু সেই doctor-দের রাখে যাদের অন্তত একটা non-completed appointment আছে।

\`string_agg(DISTINCT ..., ', ' ORDER BY ...)\` group-এর মানগুলো জুড়ে একটা text বানায়, report-এ পড়তে সুবিধা। Enum-কে \`::text\` করা হয়েছে যাতে বর্ণানুক্রমে সাজায়; enum নিজে তার ঘোষণার ক্রমে sort হয়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Several conditional counts per doctor in one pass',
            code: `SELECT d.name AS doctor,
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE a.status = 'completed') AS completed,
       COUNT(*) FILTER (WHERE a.status = 'no_show')   AS no_shows,
       string_agg(DISTINCT a.status::text, ', ' ORDER BY a.status::text) AS statuses
FROM appointments AS a
JOIN doctors AS d ON d.id = a.doctor_id
GROUP BY d.name
HAVING COUNT(*) FILTER (WHERE a.status <> 'completed') > 0
ORDER BY d.name;`,
            resultTable: {
              columns: ['doctor', 'total', 'completed', 'no_shows', 'statuses'],
              rows: [
                ['Dr. Imran Kabir', 3, 2, 0, 'completed, scheduled'],
                ['Dr. Kamal Uddin', 5, 2, 1, 'cancelled, completed, no_show, scheduled'],
                ['Dr. Laila Haque', 3, 2, 0, 'cancelled, completed'],
                ['Dr. Rumana Chowdhury', 4, 3, 1, 'completed, no_show'],
                ['Dr. Sadia Islam', 6, 4, 2, 'completed, no_show'],
                ['Dr. Tanvir Ahmed', 3, 1, 1, 'cancelled, completed, no_show'],
              ],
            },
          },
        ],
        pitfalls: [
          'COUNT(CASE WHEN ... THEN 1 END) works, but COUNT(CASE WHEN ... THEN 1 ELSE 0 END) counts every row, because 0 is not NULL.',
          'string_agg with DISTINCT requires the ORDER BY expression to match the aggregated expression.',
        ],
        followUps: [
          'How would you show revenue per payment method as columns?',
          'What is the difference between WHERE and FILTER here?',
        ],
      },
      related: ['sql-generate-series', 'sql-window-vs-group-by'],
    },
    {
      id: 'sql-timestamp-vs-timestamptz',
      level: 'intermediate',
      priority: 2,
      question: 'What is the difference between timestamp and timestamptz in PostgreSQL?',
      tags: ['postgresql', 'timestamptz', 'time-zones', 'data-types'],
      answer: {
        interview: `**\`timestamptz\` represents an absolute instant: input is converted to UTC for storage and shown in the session's time zone; \`timestamp\` (without time zone) is just a wall-clock date and time with no zone, and any offset in the input is ignored.**

| Aspect | timestamp | timestamptz |
| --- | --- | --- |
| Meaning | Local wall-clock time, zone unknown | A single point in time |
| Input \`'... 23:59:30+06'\` | Offset silently dropped | Converted to UTC |
| Stored | As given | UTC (8 bytes, no zone name stored) |
| Output | As stored | Converted to the session \`TimeZone\` |
| Use for | Calendar values: "clinic opens at 09:00" | Events: payments, logins, created_at |

- Default to \`timestamptz\` for anything that happened at a moment.
- \`AT TIME ZONE\` converts between them: \`timestamptz AT TIME ZONE 'Asia/Dhaka'\` gives Dhaka wall-clock time.
- \`timestamptz\` does not remember the original zone; store it in a separate column if you need it.`,
        explanationBn: `নাম দেখে মনে হয় \`timestamptz\` time zone **জমা রাখে**, কিন্তু আসলে রাখে না। ব্যাপারটা হলো:

- **timestamptz**: ঢোকানোর সময় offset দেখে মানটাকে **UTC**-তে বদলে রাখে। দেখানোর সময় session-এর \`TimeZone\` অনুযায়ী আবার বদলে দেখায়। মানে এটা একটা নির্দিষ্ট মুহূর্ত, পৃথিবীর যেখান থেকেই দেখো একই মুহূর্ত, শুধু ঘড়ির কাঁটা আলাদা দেখায়।
- **timestamp**: শুধু দেয়ালঘড়ির সময়, কোন দেশের সেটা জানে না। \`+06\` লিখলেও চুপচাপ ফেলে দেয়।

প্রথম উদাহরণে session UTC: ঢাকার রাত 11:59:30 (+06) timestamptz-এ হয়ে গেছে UTC বিকেল 5:59:30। Plain timestamp offset ফেলে 23:59:30-ই রেখেছে, যেটা এখন ভুল মুহূর্ত বোঝায়।

দ্বিতীয় উদাহরণে session \`Asia/Dhaka\`: একই UTC মুহূর্ত এবার দেখাচ্ছে \`23:59:30+06\`। Data বদলায়নি, শুধু দেখানো বদলেছে।

এটা গুরুত্বপূর্ণ কেন: server UTC-তে, user ঢাকায়, আরেক user লন্ডনে। Payment-এর সময় timestamp-এ রাখলে কে কোন zone ধরে লিখেছিল জানার উপায় নেই। "আজকের payment" হিসাবে রাত 12টার কাছাকাছি payment ভুল দিনে পড়বে।

নিয়ম: যা একটা মুহূর্তে ঘটেছে (payment, login), তার জন্য \`timestamptz\`। (আমাদের sample dataset সরলতার জন্য \`paid_at\`-এ timestamp ব্যবহার করে।)`,
        examples: [
          {
            lang: 'sql',
            caption: 'Same input: timestamptz converts the offset, timestamp drops it',
            code: `SET TimeZone = 'UTC';
SELECT TIMESTAMPTZ '2024-03-06 23:59:30+06' AS stored_utc,
       TIMESTAMP   '2024-03-06 23:59:30+06' AS plain_ignores_offset;`,
            output: `SET`,
            resultTable: {
              columns: ['stored_utc', 'plain_ignores_offset'],
              rows: [['2024-03-06 17:59:30+00', '2024-03-06 23:59:30']],
            },
          },
          {
            lang: 'sql',
            caption: 'The session time zone changes only how the instant is displayed',
            code: `SET TimeZone = 'Asia/Dhaka';
SELECT TIMESTAMPTZ '2024-03-06 17:59:30+00' AS shown_in_dhaka,
       (TIMESTAMPTZ '2024-03-06 17:59:30+00') AT TIME ZONE 'UTC' AS utc_wall_clock;`,
            output: `SET`,
            resultTable: {
              columns: ['shown_in_dhaka', 'utc_wall_clock'],
              rows: [['2024-03-06 23:59:30+06', '2024-03-06 17:59:30']],
            },
          },
        ],
        pitfalls: [
          'Grouping timestamptz by ::date uses the session time zone; the same data gives different daily totals on servers with different settings.',
          'Using fixed offsets (+06) instead of zone names (Asia/Dhaka) breaks for zones with daylight saving time.',
          'Comparing a timestamp column with now() (a timestamptz) applies an implicit conversion using the session zone.',
        ],
        followUps: [
          'How would you report daily revenue in the clinic’s local time zone?',
          'Why might BETWEEN be a bad idea for timestamp ranges?',
        ],
      },
      related: ['sql-generate-series'],
    },
    {
      id: 'sql-arrays',
      level: 'intermediate',
      priority: 1,
      question: 'How do arrays work in PostgreSQL, and when should you use them?',
      tags: ['postgresql', 'arrays', 'array-agg', 'unnest', 'any'],
      answer: {
        interview: `**Any PostgreSQL type can be an array (\`int[]\`, \`text[]\`), with functions to build, search and expand them; they are convenient for small, self-contained lists and for passing lists as one parameter.**

- Build: \`ARRAY[1, 2, 3]\`, or \`array_agg(x ORDER BY ...)\` across rows.
- Search: \`x = ANY (arr)\`, containment \`arr @> ARRAY['a']\`, overlap \`&&\`; GIN indexes support \`@>\` and \`&&\`.
- Expand to rows: \`unnest(arr)\`. Size: \`cardinality(arr)\`. Arrays are 1-based.
- Passing a list from an application: \`WHERE id = ANY ($1)\` with one array parameter instead of building \`IN (?, ?, ?)\` dynamically.

Don't use arrays for relationships: an array of foreign keys can't have FK constraints and is awkward to update; use a junction table.`,
        explanationBn: `PostgreSQL-এ যেকোনো type-এর array রাখা যায়: \`text[]\`, \`int[]\`। কয়েকটা কাজের জিনিস:

- \`array_agg\`: অনেক row-এর মান জড়ো করে একটা array। উদাহরণে প্রতিটা doctor-এর appointment status-গুলো। Output-এ \`{completed,no_show}\` হলো Postgres-এর array লেখার ধরন।
- \`= ANY(array)\`: "array-এর কোনো একটার সমান"। \`IN (...)\`-এর মতো, কিন্তু application থেকে একটাই parameter (পুরো list) পাঠানো যায়। 99 নম্বর patient নেই, তাই শুধু দুজন এসেছে।
- \`unnest\`: উল্টো কাজ, array ভেঙে row বানায়।

কখন array ব্যবহার করবে: ছোট, নিজের মধ্যে সম্পূর্ণ list, যেমন tag বা কয়েকটা phone number, যেগুলো সাধারণত একসাথে পড়া হয়।

কখন করবে না: অন্য table-এর id-এর list (যেমন doctor-এর \`patient_ids int[]\`)। Array element-এ foreign key দেওয়া যায় না, মুছে যাওয়া patient-এর id থেকে যাবে, আর একটা id যোগ/বাদ দিতে পুরো array লিখতে হবে। সেখানে junction table।`,
        examples: [
          {
            lang: 'sql',
            caption: 'array_agg collects values per group',
            code: `SELECT d.name AS doctor,
       array_agg(DISTINCT a.status ORDER BY a.status) AS statuses,
       cardinality(array_agg(a.id)) AS visits
FROM doctors AS d
JOIN appointments AS a ON a.doctor_id = d.id
WHERE d.id IN (2, 5)
GROUP BY d.name
ORDER BY d.name;`,
            resultTable: {
              columns: ['doctor', 'statuses', 'visits'],
              rows: [
                ['Dr. Arif Hossain', '{completed}', 4],
                ['Dr. Sadia Islam', '{completed,no_show}', 6],
              ],
            },
          },
          {
            lang: 'sql',
            caption: '= ANY(array): one parameter instead of a dynamic IN list',
            code: `SELECT id, name FROM patients
WHERE id = ANY (ARRAY[3, 5, 99])
ORDER BY id;`,
            resultTable: {
              columns: ['id', 'name'],
              rows: [
                [3, 'Nadia Karim'],
                [5, 'Mim Akter'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'unnest turns an array back into rows',
            code: `SELECT x, x * x AS squared
FROM unnest(ARRAY[1, 2, 3]) AS x;`,
            resultTable: {
              columns: ['x', 'squared'],
              rows: [
                [1, 1],
                [2, 4],
                [3, 9],
              ],
            },
          },
        ],
        pitfalls: [
          'Arrays are 1-based: arr[0] returns NULL, not an error.',
          'x <> ALL(arr) with a NULL inside the array returns NULL for every row, like NOT IN.',
        ],
        followUps: [
          'How would you index an array column?',
          'When would you choose an array over a JSONB array?',
        ],
      },
      related: ['sql-jsonb', 'sql-relationship-types'],
    },
    {
      id: 'sql-enum-vs-check',
      level: 'intermediate',
      priority: 1,
      question:
        'Enum type, CHECK constraint or lookup table: how do you restrict a column to fixed values?',
      tags: ['postgresql', 'enum', 'check-constraint', 'lookup-table', 'design'],
      answer: {
        interview: `**All three restrict values; choose by how often the list changes and whether the values need their own data.**

| Aspect | ENUM type | CHECK (status IN (...)) | Lookup table + FK |
| --- | --- | --- | --- |
| Add a value | \`ALTER TYPE ... ADD VALUE\` (fast) | Drop and re-add the constraint | \`INSERT\` a row |
| Remove or rename | Rename yes; remove no | Easy | Easy (if unused) |
| Extra attributes (label, color) | No | No | Yes |
| Sort order | Declaration order | Text order | Any column you choose |
| Storage | 4 bytes | Text | Key size |

- Enums suit small, stable sets with a meaningful order (\`scheduled < completed < cancelled < no_show\`).
- CHECK is simplest and portable.
- A lookup table is best when business users manage the list or values carry metadata.`,
        explanationBn: `\`status\` column-এ যেকোনো text ঢুকতে দিলে একদিন কেউ "complete", "Completed", "done" লিখবে, আর report ভেঙে যাবে। তাই মান সীমিত রাখতে হয়। তিনটা উপায়:

- **ENUM type**: Postgres-এ নিজস্ব type বানানো, যেমন আমাদের \`appointment_status\`। ভুল মান দিলে সাথে সাথে error ("pending" বলে কিছু নেই)। Enum-এর একটা ক্রম আছে, যে ক্রমে ঘোষণা করা হয়েছে; তাই \`status > 'completed'\` মানে "completed-এর পরে ঘোষিত": cancelled আর no_show। নতুন মান যোগ করা সহজ, কিন্তু একটা মান **মুছে ফেলা যায় না**।
- **CHECK constraint**: \`CHECK (status IN ('scheduled', 'completed', ...))\`। সহজ, সব database-এ চলে। বদলাতে হলে constraint মুছে নতুন করে দিতে হয়।
- **Lookup table**: \`statuses\` নামে আলাদা table, আর foreign key। মান যোগ-বাদ শুধু row insert/delete; সাথে label, রং, ক্রমের মতো বাড়তি তথ্যও রাখা যায়। Admin panel থেকে list বদলানো দরকার হলে এটাই সেরা।

সাধারণ নিয়ম: list প্রায় কখনো বদলায় না আর ক্রম গুরুত্বপূর্ণ হলে enum; সাধারণ ক্ষেত্রে CHECK; ব্যবসায়িকভাবে বদলায় বা বাড়তি তথ্য লাগে হলে lookup table।`,
        examples: [
          {
            lang: 'sql',
            caption: 'An enum rejects values it doesn’t know',
            code: `INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, fee)
VALUES (1, 1, '2024-05-02', 'pending', 1500);`,
            output: `ERROR:  invalid input value for enum appointment_status: "pending"`,
          },
          {
            lang: 'sql',
            caption: 'The allowed values, in declaration order',
            code: `SELECT enum_range(NULL::appointment_status) AS allowed;`,
            resultTable: {
              columns: ['allowed'],
              rows: [['{scheduled,completed,cancelled,no_show}']],
            },
          },
          {
            lang: 'sql',
            caption: 'Enums compare by declaration order, not alphabetically',
            code: `SELECT status, COUNT(*) FROM appointments WHERE status > 'completed' GROUP BY status ORDER BY status;`,
            resultTable: {
              columns: ['status', 'count'],
              rows: [
                ['cancelled', 3],
                ['no_show', 5],
              ],
            },
          },
        ],
        pitfalls: [
          'Removing an enum value requires creating a new type and migrating the column.',
          'ORDER BY on an enum sorts by declaration order, which surprises people expecting alphabetical order.',
        ],
        followUps: [
          'How would you add a "rescheduled" status safely?',
          'What other constraint types does PostgreSQL support?',
        ],
      },
      related: ['sql-schema-design-approach'],
    },
    {
      id: 'sql-mvcc-vacuum',
      level: 'advanced',
      priority: 2,
      question: 'What is MVCC in PostgreSQL, and why does it need VACUUM?',
      tags: ['postgresql', 'mvcc', 'vacuum', 'autovacuum', 'bloat', 'internals'],
      answer: {
        interview: `**MVCC (multi-version concurrency control) keeps multiple versions of a row so readers never block writers and writers never block readers; in PostgreSQL an UPDATE writes a new row version and marks the old one dead, and VACUUM later reclaims the dead versions.**

- Each row version carries \`xmin\` (the transaction that created it) and \`xmax\` (the one that deleted or replaced it). A transaction's **snapshot** decides which versions it can see.
- UPDATE = insert new version + mark old version dead. DELETE only marks it dead. The row physically moves: its \`ctid\` (page, slot) changes.
- **VACUUM** removes dead versions no snapshot can see and makes the space reusable; it also updates the visibility map (needed for index-only scans) and freezes old transaction ids to prevent **transaction ID wraparound**.
- **Autovacuum** runs this automatically based on how many rows changed.
- Without it: **bloat** (tables and indexes grow, scans slow down). Long-running or idle-in-transaction sessions block cleanup.
- \`VACUUM FULL\` rewrites the table compactly but takes an exclusive lock.`,
        explanationBn: `**MVCC**-এর মূল ধারণা: data-র ওপর "লেখা হচ্ছে, অপেক্ষা করো" না বলে, প্রতিটা পরিবর্তনে row-এর **নতুন version** বানাও। যে transaction আগে শুরু হয়েছে, সে পুরনো version দেখতে থাকে; নতুনরা নতুনটা। ফলে পড়া আর লেখা একে অপরকে আটকায় না।

PostgreSQL-এ প্রতিটা row version-এ দুটো লুকানো তথ্য থাকে: \`xmin\` (কোন transaction বানিয়েছে) আর \`xmax\` (কোন transaction মুছেছে বা বদলেছে)। প্রতিটা transaction-এর একটা **snapshot** আছে, যেটা দেখে ঠিক করে কোন version তার কাছে visible।

উদাহরণে দেখো: \`ctid\` হলো row-এর physical ঠিকানা (page, slot)। Update-এর আগে Cardiology ছিল \`(0,1)\`-এ। Budget বদলানোর পর সেটা \`(0,7)\`-এ: Postgres জায়গায় বদলায়নি, নতুন একটা copy লিখেছে। পুরনো \`(0,1)\` এখন **dead tuple**, জায়গা দখল করে আছে।

এই মৃত row-গুলো পরিষ্কারের কাজ **VACUUM**-এর। না করলে table আর index ফুলে যায় (**bloat**), scan ধীর হয়। **Autovacuum** background-এ নিজেই এটা চালায়।

একটা বিপদ: কোনো transaction ঘণ্টার পর ঘণ্টা খোলা থাকলে ("idle in transaction"), VACUUM পুরনো version মুছতে পারে না, কারণ সেই transaction হয়তো এখনো সেগুলো দেখতে চায়। তাই transaction ছোট রাখো।

আরেকটা কারণ: transaction id 32-bit, একসময় ঘুরে আসে (**wraparound**)। VACUUM পুরনো row-কে "freeze" করে এই বিপদ এড়ায়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'ctid is a row version’s physical location (page, slot)',
            code: `SELECT ctid, id, budget FROM departments WHERE id <= 2 ORDER BY id;`,
            resultTable: {
              columns: ['ctid', 'id', 'budget'],
              rows: [
                ['(0,1)', 1, '500000.00'],
                ['(0,2)', 2, '420000.00'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'After an UPDATE the row lives at a new location; (0,1) is now a dead version',
            code: `UPDATE departments SET budget = budget + 1 WHERE id = 1;
SELECT ctid, id, budget FROM departments WHERE id <= 2 ORDER BY id;`,
            output: `UPDATE 1`,
            resultTable: {
              columns: ['ctid', 'id', 'budget'],
              rows: [
                ['(0,7)', 1, '500001.00'],
                ['(0,2)', 2, '420000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Disabling autovacuum to "save resources" leads to bloat and, eventually, wraparound shutdowns.',
          'Long-running transactions, including forgotten idle-in-transaction sessions, stop VACUUM from cleaning up.',
          'Plain VACUUM does not shrink the file on disk; it makes space reusable. VACUUM FULL shrinks it but locks the table.',
        ],
        followUps: [
          'What is a HOT update?',
          'What is transaction ID wraparound?',
          'How would you detect table bloat?',
        ],
      },
      related: ['sql-isolation-levels', 'sql-postgres-vs-mysql'],
    },
    {
      id: 'sql-jsonb-indexing',
      level: 'advanced',
      priority: 1,
      question: 'How do you index JSONB data, and which queries can use the index?',
      tags: ['postgresql', 'jsonb', 'gin', 'expression-index', 'indexes'],
      answer: {
        interview: `**A GIN index on the whole JSONB column speeds up containment and key-existence operators; an expression B-tree index on one extracted key speeds up equality and range comparisons on that key.**

| Index | Speeds up | Not used for |
| --- | --- | --- |
| \`USING gin (metadata)\` (default \`jsonb_ops\`) | \`@>\`, \`?\`, \`?|\`, \`?&\`, jsonpath \`@?\` / \`@@\` | \`metadata->>'k' = 'v'\` |
| \`USING gin (metadata jsonb_path_ops)\` | \`@>\` and jsonpath, smaller and faster | \`?\` existence operators |
| \`((metadata->>'insurance'))\` B-tree | \`=\`, \`<\`, \`ORDER BY\` on that key | Other keys |

- Write queries to match the index: with a GIN index, use \`metadata @> '{"insurance": "MetLife"}'\` rather than \`->>\` equality.
- If one key is filtered constantly, consider promoting it to a real (possibly generated) column.`,
        explanationBn: `JSONB index-এর দুই ধরন, আর কোন query কোনটা ব্যবহার করবে সেটা মেলানোটাই আসল কৌশল।

**GIN (Generalized Inverted Index)**: বইয়ের index-এর মতো উল্টো তালিকা: প্রতিটা key আর value থেকে "কোন কোন row-এ আছে"। তাই "এই JSON-এ কি \`insurance: MetLife\` আছে?" (\`@>\`) বা "এই key আছে কি?" (\`?\`) খুব দ্রুত। Plan-এ **Bitmap Index Scan** দেখা যাচ্ছে: GIN থেকে মিলে যাওয়া row-এর তালিকা বানায়, তারপর Bitmap Heap Scan সেগুলো পড়ে (\`Recheck Cond\` দিয়ে আবার মিলিয়ে নেয়)।

কিন্তু একই GIN index \`metadata->>'insurance' = 'MetLife'\` query-তে কাজে লাগে না! কারণ GIN \`@>\` operator চেনে, \`->>\` দিয়ে বের করা text-এর \`=\` চেনে না। দ্বিতীয় উদাহরণে তাই Seq Scan।

সমাধান দুটো:
1. Query বদলে \`@>\` লেখো, যাতে GIN কাজে লাগে।
2. নির্দিষ্ট key-এর জন্য **expression index**: \`CREATE INDEX ON patients ((metadata->>'insurance'))\`। তৃতীয় উদাহরণে সাধারণ Index Scan। এটা \`=\`, range, sort সব পারে, কিন্তু শুধু ওই একটা key-এর জন্য।

\`jsonb_path_ops\` GIN-এর আরেকটা রূপ: ছোট আর দ্রুত, কিন্তু শুধু \`@>\` (আর jsonpath) পারে, \`?\` পারে না।`,
        examples: [
          {
            lang: 'sql',
            caption: 'GIN index used for containment (@>)',
            code: `CREATE INDEX patients_metadata_gin ON patients USING gin (metadata);
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT id FROM patients WHERE metadata @> '{"insurance": "MetLife"}';`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Bitmap Heap Scan on patients'],
                ['  Recheck Cond: (metadata @> \'{"insurance": "MetLife"}\'::jsonb)'],
                ['  ->  Bitmap Index Scan on patients_metadata_gin'],
                ['        Index Cond: (metadata @> \'{"insurance": "MetLife"}\'::jsonb)'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'The same GIN index cannot serve ->> equality',
            code: `CREATE INDEX patients_metadata_gin ON patients USING gin (metadata);
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT id FROM patients WHERE metadata->>'insurance' = 'MetLife';`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Seq Scan on patients'],
                ['  Disabled: true'],
                ["  Filter: ((metadata ->> 'insurance'::text) = 'MetLife'::text)"],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'An expression index on the extracted key does',
            code: `CREATE INDEX patients_insurance_idx ON patients ((metadata->>'insurance'));
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT id FROM patients WHERE metadata->>'insurance' = 'MetLife';`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Index Scan using patients_insurance_idx on patients'],
                ["  Index Cond: ((metadata ->> 'insurance'::text) = 'MetLife'::text)"],
              ],
            },
          },
        ],
        pitfalls: [
          "Expression indexes need double parentheses: ((metadata->>'insurance')).",
          'GIN indexes are slower to update than B-trees; heavy write workloads feel it (fastupdate and the pending list help).',
        ],
        followUps: [
          'What is the difference between jsonb_ops and jsonb_path_ops?',
          'What is a Bitmap Heap Scan?',
        ],
      },
      related: ['sql-jsonb', 'sql-index-not-used', 'sql-partial-covering-index'],
    },
    {
      id: 'sql-full-text-search',
      level: 'advanced',
      priority: 1,
      question: 'How does full-text search work in PostgreSQL, and how is it better than LIKE?',
      tags: ['postgresql', 'full-text-search', 'tsvector', 'tsquery', 'gin'],
      answer: {
        interview: `**PostgreSQL turns text into a \`tsvector\` of normalized lexemes and the search into a \`tsquery\`, then matches them with \`@@\`; unlike LIKE it understands word forms, ignores stop words, supports AND/OR/NOT and ranking, and can use a GIN index.**

- \`to_tsvector('english', text)\`: lowercase, drop stop words ("the", "were"), stem ("patients" → "patient", "running" → "run"), keep positions.
- Build queries with \`to_tsquery('patient & run')\`, \`plainto_tsquery\` or \`websearch_to_tsquery\` (accepts user-style input like \`"exact phrase" -word\`).
- \`ts_rank\` / \`ts_rank_cd\` order results by relevance; \`ts_headline\` highlights matches.
- Index with \`GIN (to_tsvector('english', col))\`, or store a generated \`tsvector\` column and index it.
- For typo-tolerant or substring search add \`pg_trgm\`; for large-scale search with facets, a dedicated engine (Elasticsearch, OpenSearch) may still fit better.`,
        explanationBn: `\`LIKE '%run%'\` শুধু অক্ষর মেলায়: "running" পাবে, কিন্তু "ran" পাবে না; আবার "prune"-ও ধরে ফেলবে। আর শুরুতে \`%\` থাকায় সাধারণ index-ও কাজ করে না।

**Full-text search** text-কে ভাষা অনুযায়ী বিশ্লেষণ করে:
- **tsvector**: document থেকে "শব্দের মূল রূপ" (lexeme) আর তাদের অবস্থান। "The patients were running tests" থেকে "the", "were" (stop word) বাদ, "patients" → \`patient\`, "running" → \`run\`, "tests" → \`test\`। সংখ্যাগুলো হলো শব্দের position।
- **tsquery**: খোঁজার শর্ত, একইভাবে normalize করা। \`&\` (AND), \`|\` (OR), \`!\` (NOT)।
- \`@@\`: vector কি query-র সাথে মেলে?

তাই "patient & run" লিখে "patients were running" খুঁজে পাওয়া যায়, যা LIKE কখনো পারত না।

প্রথম উদাহরণে prescriptions থেকে "cream" বা "aspirin" আছে এমন ওষুধ। দ্বিতীয়টায় \`ts_rank\` দিয়ে relevance score, ফলাফল সাজানোর জন্য।

বড় table-এ \`to_tsvector(...)\`-এর উপর GIN index দিলে এটা খুব দ্রুত হয়। ছোটখাটো app-এ এতেই কাজ চলে যায়, আলাদা search server লাগে না।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Stemming and stop words: "patients … running" matches "patient & run"',
            code: `SELECT to_tsvector('english', 'The patients were running tests') AS vector,
       to_tsquery('english', 'patient & run') AS query,
       to_tsvector('english', 'The patients were running tests') @@ to_tsquery('english', 'patient & run') AS matches;`,
            resultTable: {
              columns: ['vector', 'query', 'matches'],
              rows: [["'patient':2 'run':4 'test':5", "'patient' & 'run'", true]],
            },
          },
          {
            lang: 'sql',
            caption: 'OR search over medicine names',
            code: `SELECT id, medicine, dosage
FROM prescriptions
WHERE to_tsvector('english', medicine) @@ to_tsquery('english', 'cream | aspirin')
ORDER BY id;`,
            resultTable: {
              columns: ['id', 'medicine', 'dosage'],
              rows: [
                [2, 'Aspirin', '75mg'],
                [8, 'Hydrocortisone cream', '1%'],
                [18, 'Hydrocortisone cream', '1%'],
                [19, 'Aspirin', '75mg'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'Ranking matches with ts_rank',
            code: `SELECT id, medicine,
       ts_rank(to_tsvector('english', medicine || ' ' || dosage),
               plainto_tsquery('english', 'aspirin 75mg'))::numeric(4,3) AS rank
FROM prescriptions
WHERE to_tsvector('english', medicine || ' ' || dosage) @@ plainto_tsquery('english', 'aspirin 75mg')
ORDER BY id;`,
            resultTable: {
              columns: ['id', 'medicine', 'rank'],
              rows: [
                [2, 'Aspirin', '0.099'],
                [19, 'Aspirin', '0.099'],
              ],
            },
          },
        ],
        pitfalls: [
          'Using to_tsvector without a configuration name depends on default_text_search_config; the index and query must use the same one.',
          'to_tsquery errors on raw user input with stray operators; use websearch_to_tsquery or plainto_tsquery.',
          'Stemming is language-specific; Bangla text needs a different configuration (or the simple one).',
        ],
        followUps: [
          'How would you index full-text search on two columns with different weights?',
          'When would you use pg_trgm instead?',
        ],
      },
      related: ['sql-index-not-used', 'sql-jsonb-indexing'],
    },
    {
      id: 'sql-partitioning',
      level: 'advanced',
      priority: 1,
      question: 'What is table partitioning in PostgreSQL, and when does it help?',
      tags: ['postgresql', 'partitioning', 'partition-pruning', 'scalability'],
      answer: {
        interview: `**Declarative partitioning splits one logical table into child tables by a key (RANGE, LIST or HASH); queries that filter on the key touch only the matching partitions (partition pruning), and old data can be dropped a whole partition at a time.**

- \`PARTITION BY RANGE (visited_on)\` with monthly partitions is the classic time-series setup.
- **Pruning**: \`WHERE visited_on >= '2024-04-10'\` scans only the April partition.
- **Retention**: \`DROP TABLE\` or \`DETACH PARTITION\` on an old month is instant, versus a huge \`DELETE\` that bloats the table.
- Each partition has its own indexes and is vacuumed separately.
- A row with no matching partition is rejected unless a \`DEFAULT\` partition exists.
- Costs: primary keys and unique constraints must include the partition key; too many partitions slow planning; queries without the key scan every partition.

Use it for very large tables (tens or hundreds of millions of rows) with a natural key such as time or tenant, not as a substitute for indexes.`,
        explanationBn: `ধরো \`visits_log\`-এ 5 বছরের কোটি কোটি row। প্রায় সব query শুধু সাম্প্রতিক মাসগুলো দেখে, আর প্রতি মাসে 5 বছরের পুরনো data মুছতে হয়।

**Partitioning**: একটা বড় table-কে অনেক ছোট child table-এ ভাগ করা, যেমন মাসপ্রতি একটা। বাইরে থেকে এখনো একটাই table (\`visits_log\`), insert করলে Postgres নিজেই ঠিক partition-এ রাখে। উদাহরণে মার্চের 12টা আর এপ্রিলের 10টা row নিজে থেকেই আলাদা হয়ে গেছে।

লাভ:
- **Partition pruning**: \`visited_on >= '2024-04-10'\` হলে Postgres জানে মার্চের partition-এ এমন row থাকতেই পারে না, তাই সেটা ছোঁয়ই না। Plan-এ শুধু \`visits_log_2024_04\`।
- **পুরনো data মুছা**: লাখো row \`DELETE\` না করে পুরো partition \`DROP\` করা, যা মুহূর্তে হয়, আর কোনো dead tuple রাখে না।

খরচ:
- Unique/primary key-তে partition key থাকতে হয়।
- Partition key ছাড়া query সব partition ঘাঁটে, হয়তো আগের চেয়েও ধীর।
- কোনো partition-এ না মেলা row reject হয় (জুনের partition নেই, তাই error), যদি না \`DEFAULT\` partition থাকে।

তাই partitioning index-এর বিকল্প না; এটা সত্যিই বিশাল, সময় বা tenant ধরে ভাগ করা যায় এমন table-এর জন্য।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Monthly range partitions; rows are routed automatically',
            code: `CREATE TABLE visits_log (
  id          bigint GENERATED ALWAYS AS IDENTITY,
  visited_on  date NOT NULL,
  patient_id  int  NOT NULL
) PARTITION BY RANGE (visited_on);
CREATE TABLE visits_log_2024_03 PARTITION OF visits_log
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE visits_log_2024_04 PARTITION OF visits_log
  FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
INSERT INTO visits_log (visited_on, patient_id)
SELECT appointment_date, patient_id FROM appointments
WHERE appointment_date >= '2024-03-01';
SELECT tableoid::regclass AS partition, COUNT(*) AS rows
FROM visits_log GROUP BY 1 ORDER BY 1;`,
            output: `CREATE TABLE
CREATE TABLE
CREATE TABLE
INSERT 0 22`,
            resultTable: {
              columns: ['partition', 'rows'],
              rows: [
                ['visits_log_2024_03', 12],
                ['visits_log_2024_04', 10],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'Partition pruning: only the April partition is scanned',
            code: `CREATE TABLE visits_log (
  id          bigint GENERATED ALWAYS AS IDENTITY,
  visited_on  date NOT NULL,
  patient_id  int  NOT NULL
) PARTITION BY RANGE (visited_on);
CREATE TABLE visits_log_2024_03 PARTITION OF visits_log
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE visits_log_2024_04 PARTITION OF visits_log
  FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
INSERT INTO visits_log (visited_on, patient_id)
SELECT appointment_date, patient_id FROM appointments
WHERE appointment_date >= '2024-03-01';
EXPLAIN (COSTS OFF)
SELECT COUNT(*) FROM visits_log WHERE visited_on >= '2024-04-10';`,
            output: `CREATE TABLE
CREATE TABLE
CREATE TABLE
INSERT 0 22`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Aggregate'],
                ['  ->  Seq Scan on visits_log_2024_04 visits_log'],
                ["        Filter: (visited_on >= '2024-04-10'::date)"],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'No partition covers June, so the row is rejected',
            code: `CREATE TABLE visits_log (
  id          bigint GENERATED ALWAYS AS IDENTITY,
  visited_on  date NOT NULL,
  patient_id  int  NOT NULL
) PARTITION BY RANGE (visited_on);
CREATE TABLE visits_log_2024_03 PARTITION OF visits_log
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
INSERT INTO visits_log (visited_on, patient_id) VALUES ('2024-06-01', 1);`,
            output: `CREATE TABLE
CREATE TABLE
ERROR:  no partition of relation "visits_log" found for row
DETAIL:  Partition key of the failing row contains (visited_on) = (2024-06-01).`,
          },
        ],
        pitfalls: [
          'Partitioning a table of a few million rows usually adds complexity without speed-up; indexes are enough.',
          'Queries that don’t filter on the partition key scan every partition.',
          'Forgetting to create future partitions: inserts start failing on the first day of the new month (automate it, e.g. with pg_partman).',
        ],
        followUps: [
          'What is the difference between partitioning and sharding?',
          'How would you choose between RANGE, LIST and HASH partitioning?',
        ],
      },
      related: ['sql-optimize-slow-query', 'sql-mvcc-vacuum'],
    },
  ],
});

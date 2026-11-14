import { defineSection } from '../../define';

export const indexesPerformance = defineSection({
  id: 'sql-indexes-performance',
  title: 'Indexes & Performance',
  description:
    'How indexes work, B-tree and clustered indexes, composite indexes, why an index is ignored, reading EXPLAIN, tuning a slow query, N+1 queries and keyset pagination.',
  order: 10,
  questions: [
    {
      id: 'sql-what-is-index',
      level: 'foundation',
      priority: 3,
      question: 'What is an index, how does it speed up queries, and what does it cost?',
      tags: ['indexes', 'b-tree', 'performance', 'explain'],
      answer: {
        interview: `**An index is a separate, sorted data structure (a B-tree by default) that maps column values to row locations, so the database can find matching rows without reading the whole table.**

- Without an index a filter needs a **sequential scan**: read every row, O(n). A B-tree lookup is O(log n) plus the matching rows.
- Indexes also speed up \`ORDER BY\`, \`JOIN\` conditions, \`MIN/MAX\` and uniqueness checks (\`PRIMARY KEY\` and \`UNIQUE\` create one automatically).
- **Costs**: extra disk space, and every \`INSERT\`, \`UPDATE\` of an indexed column and \`DELETE\` must update each index; too many indexes slow writes.
- The planner decides whether to use one. On a tiny table or a filter matching most rows, a sequential scan is cheaper, and Postgres rightly ignores the index.
- PostgreSQL does **not** index foreign key columns automatically; add those yourself.

Real-world: index \`appointments (patient_id)\` so "a patient's history" stays fast as the table grows to millions of rows.`,
        explanationBn: `Index-কে বইয়ের শেষের **সূচিপত্র** ভাবো। "Normalization" শব্দটা কোথায় আছে জানতে পুরো বই পড়তে হয় না; সূচিপত্রে বর্ণানুক্রমে খুঁজে page নম্বর পাও, তারপর সরাসরি সেই page-এ যাও।

Database-ও তাই করে। Index ছাড়া \`WHERE patient_id = 4\` চালাতে প্রতিটা row পড়তে হয়, একে বলে **Seq Scan**। B-tree index-এ \`patient_id\`-গুলো sorted অবস্থায় একটা tree-তে থাকে, প্রতিটার সাথে row-এর ঠিকানা (TID)। কয়েক ধাপে tree বেয়ে নেমে মিলে যাওয়া row-গুলো পাওয়া যায়, এটা **Index Scan**।

কিন্তু index বিনামূল্যে না:
- প্রতিটা insert/update/delete-এ index-ও বদলাতে হয়, তাই লেখা ধীর হয়।
- Disk আর memory লাগে।

উদাহরণে প্রথম plan Seq Scan, কারণ table-এ মাত্র 40টা row আর কোনো index নেই। Index বানানোর পরেও 40 row-এর table-এ planner হয়তো Seq Scan-ই বাছত, কারণ সেটাই সস্তা। তাই শুধু দেখানোর জন্য \`enable_seqscan = off\` দেওয়া হয়েছে। Real system-এ এটা কখনো করো না; planner-এর হিসাব সাধারণত ঠিক।

মনে রাখো: PostgreSQL foreign key column-এ নিজে থেকে index বানায় না। JOIN আর ON DELETE-এর জন্য সাধারণত সেটা নিজে বানাতে হয়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'No index on patient_id: every row is read and filtered',
            code: `EXPLAIN (COSTS OFF)
SELECT * FROM appointments WHERE patient_id = 4;`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [['Seq Scan on appointments'], ['  Filter: (patient_id = 4)']],
            },
          },
          {
            lang: 'sql',
            caption: 'With an index the planner can jump straight to the matching rows',
            code: `CREATE INDEX appointments_patient_id_idx ON appointments (patient_id);
SET enable_seqscan = off;  -- tiny table: force the planner to show the index path
EXPLAIN (COSTS OFF)
SELECT * FROM appointments WHERE patient_id = 4;`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Index Scan using appointments_patient_id_idx on appointments'],
                ['  Index Cond: (patient_id = 4)'],
              ],
            },
          },
        ],
        pitfalls: [
          'Indexing every column: each index slows every write and is rarely all used.',
          'Expecting the index to be used on a small table or a non-selective filter; a Seq Scan there is the correct plan.',
          'Forgetting indexes on foreign key columns: joins and parent deletes get slow.',
        ],
        followUps: [
          'What is a composite index, and does column order matter?',
          'When does PostgreSQL ignore an index?',
          'What is the difference between a clustered and a non-clustered index?',
        ],
      },
      related: ['sql-composite-index', 'sql-index-not-used', 'sql-btree-clustered-index'],
    },
    {
      id: 'sql-composite-index',
      level: 'intermediate',
      priority: 3,
      question: 'What is a composite index, and why does the column order matter?',
      tags: ['indexes', 'composite-index', 'leftmost-prefix', 'b-tree'],
      answer: {
        interview: `**A composite (multi-column) index sorts by the first column, then by the second within it, and so on, so it is efficient for filters on a leftmost prefix of its columns.**

For \`(doctor_id, appointment_date)\`:

| Query filter | Can use the index efficiently? |
| --- | --- |
| \`doctor_id = 1\` | Yes: leftmost column |
| \`doctor_id = 1 AND appointment_date >= ...\` | Yes: equality then range, the ideal case |
| \`doctor_id = 1 ORDER BY appointment_date\` | Yes: rows come out already sorted |
| \`appointment_date = ...\` only | Poorly: the dates are scattered across every doctor |

- Put **equality** columns first and the **range** or sort column last.
- Among equality columns, lead with the one that also appears alone in other queries.
- PostgreSQL can still scan a B-tree on a non-leading column (the whole index is read; PostgreSQL 18 adds *skip scan*, which helps when the leading column has few distinct values), but a dedicated index is usually far better.
- One composite index often replaces several single-column ones.`,
        explanationBn: `Composite index-কে টেলিফোন ডিরেক্টরির মতো ভাবো, যেটা প্রথমে **পদবি**, তারপর **নাম** অনুযায়ী সাজানো।

- "Hossain" পদবির সবাইকে খোঁজা সহজ: সব একসাথে আছে। (leftmost column)
- "Hossain, Arif" খোঁজা আরও সহজ। (দুটো column-ই)
- কিন্তু শুধু "Arif" নামের সবাইকে খুঁজতে গেলে পুরো ডিরেক্টরি ঘাঁটতে হবে, কারণ Arif-রা প্রতিটা পদবির ভেতরে ছড়িয়ে আছে।

\`(doctor_id, appointment_date)\` index-ও তাই: আগে doctor অনুযায়ী, তারপর প্রতিটা doctor-এর ভেতরে তারিখ অনুযায়ী সাজানো। তাই \`doctor_id = 1 AND appointment_date >= ...\` হলে index-এ doctor 1-এর অংশে গিয়ে তারিখ ধরে একটানা পড়ে ফেলা যায়। আবার \`ORDER BY appointment_date\` থাকলে আলাদা sort-ও লাগে না।

শুধু তারিখ দিয়ে filter করলে উদাহরণে দেখা যাচ্ছে Postgres তবুও index ব্যবহার করেছে (কারণ seq scan বন্ধ), কিন্তু পুরো index পড়তে হয়েছে। PostgreSQL 18-এর **skip scan** প্রতিটা doctor-এর অংশে লাফিয়ে লাফিয়ে খোঁজে, যা doctor কম হলে ভালো কাজ করে। তবুও এটা নিয়মিত query হলে \`appointment_date\`-এর আলাদা index বানানোই ঠিক।

নিয়ম: **equality আগে, range/sort পরে।**`,
        examples: [
          {
            lang: 'sql',
            caption:
              'Equality on the first column, range on the second: both used in the Index Cond',
            code: `CREATE INDEX appt_doctor_date_idx ON appointments (doctor_id, appointment_date);
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT id FROM appointments
WHERE doctor_id = 1 AND appointment_date >= '2024-03-01';`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Index Scan using appt_doctor_date_idx on appointments'],
                ["  Index Cond: ((doctor_id = 1) AND (appointment_date >= '2024-03-01'::date))"],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'Only the second column: allowed, but the whole index has to be scanned',
            code: `CREATE INDEX appt_doctor_date_idx ON appointments (doctor_id, appointment_date);
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT id FROM appointments WHERE appointment_date = '2024-03-05';`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Index Scan using appt_doctor_date_idx on appointments'],
                ["  Index Cond: (appointment_date = '2024-03-05'::date)"],
              ],
            },
          },
        ],
        pitfalls: [
          'Putting the range column first: (appointment_date, doctor_id) cannot narrow by doctor inside a date range efficiently.',
          'Creating (a), (a, b) and (a, b, c) separately: the last one already serves the first two.',
          'The plan text looks the same for a full-index scan and a targeted one; judge with EXPLAIN ANALYZE on realistic data.',
        ],
        followUps: [
          'How would you index "a doctor’s appointments in a date range, newest first"?',
          'What is a covering index?',
        ],
      },
      related: ['sql-what-is-index', 'sql-optimize-slow-query', 'sql-partial-covering-index'],
    },
    {
      id: 'sql-btree-clustered-index',
      level: 'intermediate',
      priority: 2,
      question:
        'What is a B-tree index, and what is the difference between a clustered and a non-clustered index?',
      tags: ['indexes', 'b-tree', 'clustered-index', 'heap', 'index-types'],
      answer: {
        interview: `**A B-tree is a balanced, sorted tree that supports equality, range and sorted access in O(log n); "clustered" means the table rows themselves are stored in index order, "non-clustered" means the index is separate and points to rows stored elsewhere.**

| Aspect | Clustered | Non-clustered |
| --- | --- | --- |
| Row storage | Rows are physically in key order | Separate structure with pointers to rows |
| Per table | At most one | Many |
| Range scans on the key | Very fast, rows are adjacent | Fast lookup, then scattered row reads |
| Examples | SQL Server clustered index, MySQL InnoDB primary key | Every secondary index; every PostgreSQL index |

- **PostgreSQL has no clustered indexes.** Tables are unordered *heaps*; every index, including the primary key, is secondary and points to a row's TID.
- \`CLUSTER table USING index\` rewrites the heap in index order once, but it is not maintained as new rows arrive.
- Other PostgreSQL index types: Hash (equality only), GIN (JSONB, arrays, full-text), GiST (ranges, geometry), BRIN (huge, naturally ordered tables like logs).`,
        explanationBn: `**B-tree** (balanced tree): প্রতিটা node-এ অনেকগুলো sorted key, আর tree সবসময় balanced, মানে root থেকে যেকোনো leaf পর্যন্ত দূরত্ব সমান। লাখো row হলেও মাত্র 3-4 ধাপে নির্দিষ্ট মানে পৌঁছানো যায়। Leaf-গুলো sorted আর একে অপরের সাথে যুক্ত, তাই \`BETWEEN\`, \`>\`, \`ORDER BY\`-ও দ্রুত।

**Clustered vs non-clustered**:
- Clustered index-এ table-এর row-গুলোই index-এর ক্রমে সাজানো থাকে। অভিধানের মতো: শব্দগুলো নিজেরাই বর্ণানুক্রমে, আলাদা সূচিপত্র লাগে না। তাই table-প্রতি একটাই হতে পারে।
- Non-clustered index হলো বইয়ের শেষের সূচিপত্র: আলাদা জায়গায়, শুধু page নম্বর বলে দেয়। যত খুশি বানানো যায়।

**PostgreSQL-এ সব index-ই non-clustered।** Table হলো একটা **heap**, যেখানে row যেখানে জায়গা পায় সেখানে বসে। Primary key-ও একটা আলাদা B-tree, যা row-এর ঠিকানা (TID) রাখে। উদাহরণে দেখো, \`PRIMARY KEY\` আর \`UNIQUE\` থেকে Postgres নিজেই \`USING btree\` index বানিয়েছে।

\`CLUSTER\` command একবার table-কে index-এর ক্রমে সাজিয়ে দেয়, কিন্তু পরে নতুন row আবার এলোমেলো জায়গায় বসে, তাই এটা স্থায়ী না। MySQL (InnoDB) বা SQL Server থেকে আসলে এই পার্থক্যটা interview-এ বলতে পারলে ভালো।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Primary keys and UNIQUE constraints are backed by B-tree indexes',
            code: `SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('appointments', 'payments')
ORDER BY tablename, indexname;`,
            resultTable: {
              columns: ['tablename', 'indexname', 'indexdef'],
              rows: [
                [
                  'appointments',
                  'appointments_pkey',
                  'CREATE UNIQUE INDEX appointments_pkey ON public.appointments USING btree (id)',
                ],
                [
                  'payments',
                  'payments_appointment_id_key',
                  'CREATE UNIQUE INDEX payments_appointment_id_key ON public.payments USING btree (appointment_id)',
                ],
                [
                  'payments',
                  'payments_pkey',
                  'CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id)',
                ],
              ],
            },
          },
        ],
        pitfalls: [
          'Saying "the primary key is the clustered index" is true for MySQL InnoDB and SQL Server, not for PostgreSQL.',
          'Using a Hash or GIN index for range queries: only B-tree (and BRIN, coarsely) support < and >.',
        ],
        followUps: [
          'When would you use a GIN index?',
          'What is a BRIN index good for?',
          'What is an index-only scan?',
        ],
      },
      related: ['sql-what-is-index', 'sql-partial-covering-index'],
    },
    {
      id: 'sql-index-not-used',
      level: 'intermediate',
      priority: 2,
      question: 'Why might PostgreSQL not use an index that exists on a column?',
      tags: ['indexes', 'sargable', 'expression-index', 'planner', 'like'],
      answer: {
        interview: `**Either the index cannot match the condition as written, or the planner estimates that a different plan is cheaper.**

The condition cannot use it ("non-sargable"):
- A **function or cast on the column**: \`lower(name) = ...\`, \`birth_date::text LIKE '1985%'\`. Fix: an expression index on \`lower(name)\`, or rewrite as a range on the raw column.
- **Leading wildcard**: \`LIKE '%Das'\`. A B-tree only helps a prefix (\`'Ra%'\`, and with a non-C collation it needs \`text_pattern_ops\`); for infix search use \`pg_trgm\` with a GIN index.
- **Not the leftmost column** of a composite index.
- \`OR\` across different columns, or \`<>\` / \`NOT IN\` conditions.

The planner chooses not to:
- The table is small, or the filter matches a large share of rows: a sequential scan is cheaper.
- **Stale statistics** after big data changes: run \`ANALYZE\`.

How to check: \`EXPLAIN\` (or \`EXPLAIN ANALYZE\`) the exact query with realistic data.`,
        explanationBn: `Index থাকলেই ব্যবহার হবে, এমন না। দুই ধরনের কারণ আছে।

**১. Query-টা এমনভাবে লেখা যে index মিলবেই না।** Index-এ রাখা আছে \`name\`-এর মান, sorted। কিন্তু query চাইছে \`lower(name)\`। Postgres জানে না \`lower\` করার পর sorted ক্রম কেমন হবে, তাই index-এ খুঁজতে পারে না। একে বলে **non-sargable** condition। সমাধান: হুবহু সেই expression-এর উপর index (\`CREATE INDEX ON patients (lower(name))\`)।

একইভাবে \`birth_date::text LIKE '1985%'\`: column-কে text বানালে date-এর index অকেজো। Range-এ লেখো: \`birth_date >= '1985-01-01' AND birth_date < '1986-01-01'\`, তাহলে index কাজে লাগে।

\`LIKE '%Das'\`: শুরুটাই অজানা, তাই sorted index-এ কোথা থেকে খুঁজবে জানা নেই। ডিরেক্টরিতে "যাদের নাম 'Das' দিয়ে শেষ" খোঁজার মতো, পুরোটা পড়তে হয়।

**২. Planner হিসাব করে দেখল index ছাড়াই সস্তা।** ছোট table, বা এমন filter যেটা অর্ধেক row ফেরত দেয়, সেখানে index-এ লাফালাফির চেয়ে পুরো table একটানা পড়া দ্রুত। এটা ভুল না, ঠিক সিদ্ধান্ত। তবে statistics পুরনো হলে planner ভুল হিসাব করতে পারে, তখন \`ANALYZE\` চালাতে হয়।

উদাহরণে \`Disabled: true\` লাইনটা (PostgreSQL 18) বলছে: seq scan বন্ধ করা থাকলেও কোনো index কাজে না লাগায় Postgres বাধ্য হয়ে seq scan-ই করেছে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A function on the column hides it from a plain index',
            code: `CREATE INDEX patients_name_idx ON patients (name);
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT id FROM patients WHERE lower(name) = 'rupa das';`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Seq Scan on patients'],
                ['  Disabled: true'],
                ["  Filter: (lower(name) = 'rupa das'::text)"],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'An expression index on lower(name) matches the query',
            code: `CREATE INDEX patients_lower_name_idx ON patients (lower(name));
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT id FROM patients WHERE lower(name) = 'rupa das';`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Index Scan using patients_lower_name_idx on patients'],
                ["  Index Cond: (lower(name) = 'rupa das'::text)"],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'A leading wildcard cannot use a B-tree, even one built for LIKE',
            code: `CREATE INDEX patients_name_pattern_idx ON patients (name text_pattern_ops);
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT id FROM patients WHERE name LIKE '%Das';`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Seq Scan on patients'],
                ['  Disabled: true'],
                ["  Filter: (name ~~ '%Das'::text)"],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'Rewrite a cast as a range on the raw column',
            code: `CREATE INDEX patients_birth_idx ON patients (birth_date);
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT id FROM patients
WHERE birth_date >= '1985-01-01' AND birth_date < '1986-01-01';`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Index Scan using patients_birth_idx on patients'],
                [
                  "  Index Cond: ((birth_date >= '1985-01-01'::date) AND (birth_date < '1986-01-01'::date))",
                ],
              ],
            },
          },
        ],
        pitfalls: [
          'enable_seqscan = off is a teaching and debugging switch only; never set it in production.',
          'An expression index is used only when the query uses the identical expression.',
          'Comparing a column with a value of a different type can add an implicit cast on the column side.',
        ],
        followUps: [
          'How would you support case-insensitive email lookups?',
          "How do you speed up LIKE '%term%' searches in PostgreSQL?",
          'What does ANALYZE do?',
        ],
      },
      related: ['sql-what-is-index', 'sql-explain-analyze', 'sql-composite-index'],
    },
    {
      id: 'sql-explain-analyze',
      level: 'intermediate',
      priority: 2,
      question:
        'What is the difference between EXPLAIN and EXPLAIN ANALYZE, and how do you read a plan?',
      tags: ['explain', 'query-plan', 'performance', 'planner'],
      answer: {
        interview: `**EXPLAIN shows the plan the optimizer chose with its estimates; EXPLAIN ANALYZE actually runs the query and adds real row counts and timings to every node.**

| Aspect | EXPLAIN | EXPLAIN ANALYZE |
| --- | --- | --- |
| Runs the query | No | Yes (wrap writes in \`BEGIN ... ROLLBACK\`) |
| Shows | Plan shape, estimated cost and rows | Plus actual rows, loops, time, buffers |
| Use for | Quick check of the plan | Finding where time really goes |

Reading a plan:
- It is a tree; read from the **innermost** (most indented) nodes outward: they run first and feed their parents.
- Scan nodes: Seq Scan, Index Scan, Index Only Scan, Bitmap Heap Scan. Join nodes: Nested Loop, Hash Join, Merge Join.
- Compare **estimated vs actual rows**: a large mismatch means bad statistics and usually a bad plan.
- Look for big Seq Scans with a selective \`Filter\` and high "Rows Removed by Filter", sorts spilling to disk, and nested loops over many rows.`,
        explanationBn: `SQL লিখলে আমরা বলি **কী** চাই; **কীভাবে** আনবে সেটা ঠিক করে planner। \`EXPLAIN\` সেই পরিকল্পনাটা দেখায়, যেন রান্নার আগে recipe পড়া।

- \`EXPLAIN\`: query **চালায় না**, শুধু plan আর আনুমানিক খরচ (cost) আর row সংখ্যা দেখায়।
- \`EXPLAIN ANALYZE\`: query সত্যিই **চালায়**, তারপর প্রতিটা ধাপে আসলে কত row এলো, কতবার চলল (loops), কত সময় লাগল দেখায়। তাই \`DELETE\` বা \`UPDATE\`-এ ব্যবহার করলে data সত্যিই বদলাবে, \`BEGIN ... ROLLBACK\`-এর ভেতরে চালাও।

**Plan পড়ার নিয়ম**: এটা একটা tree। সবচেয়ে ভেতরের (বেশি indent করা) node আগে চলে, row তুলে উপরের node-কে দেয়। প্রথম উদাহরণে: আগে \`appointments\` scan করে no_show বাছাই, সেটা দিয়ে Hash বানানো, \`doctors\` scan করে Hash Join, তারপর নাম ধরে Sort, শেষে GroupAggregate।

দ্বিতীয় উদাহরণে \`Rows Removed by Filter: 35\`: 40টা row পড়ে 35টা ফেলে দেওয়া হয়েছে। বড় table-এ এই সংখ্যা বিশাল হলে বোঝা যায় একটা index দরকার।

সবচেয়ে কাজের সংকেত: **estimated rows বনাম actual rows**। Planner যদি ভাবে 10 row আসবে কিন্তু আসে 1 লাখ, তাহলে সে ভুল join পদ্ধতি বেছে নেবে। তখন \`ANALYZE\` চালিয়ে statistics ঠিক করো।

(এখানে \`COSTS OFF\`, \`TIMING OFF\` দেওয়া হয়েছে যাতে output প্রতিবার একই থাকে। বাস্তবে cost আর time দেখাই আসল উদ্দেশ্য। PostgreSQL 18 actual rows দশমিকসহ দেখায়, যেমন \`5.00\`।)`,
        examples: [
          {
            lang: 'sql',
            caption: 'EXPLAIN: the plan tree, read from the innermost node outwards',
            code: `EXPLAIN (COSTS OFF)
SELECT d.name, COUNT(*) AS visits
FROM appointments AS a
JOIN doctors AS d ON d.id = a.doctor_id
WHERE a.status = 'no_show'
GROUP BY d.name;`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['GroupAggregate'],
                ['  Group Key: d.name'],
                ['  ->  Sort'],
                ['        Sort Key: d.name'],
                ['        ->  Hash Join'],
                ['              Hash Cond: (d.id = a.doctor_id)'],
                ['              ->  Seq Scan on doctors d'],
                ['              ->  Hash'],
                ['                    ->  Seq Scan on appointments a'],
                ["                          Filter: (status = 'no_show'::appointment_status)"],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'EXPLAIN ANALYZE runs it and reports actual rows per node',
            code: `EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF, BUFFERS OFF)
SELECT COUNT(*) FROM appointments WHERE status = 'no_show';`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Aggregate (actual rows=1.00 loops=1)'],
                ['  ->  Seq Scan on appointments (actual rows=5.00 loops=1)'],
                ["        Filter: (status = 'no_show'::appointment_status)"],
                ['        Rows Removed by Filter: 35'],
              ],
            },
          },
        ],
        pitfalls: [
          'EXPLAIN ANALYZE on INSERT/UPDATE/DELETE really modifies data unless you roll back.',
          'Plans on a small development database can differ completely from production; test with realistic volumes.',
          '“cost” is in arbitrary planner units, not milliseconds.',
        ],
        followUps: [
          'What is the difference between a Hash Join, a Merge Join and a Nested Loop?',
          'What is a Bitmap Heap Scan?',
          'How would you find the slowest queries in production?',
        ],
      },
      related: ['sql-optimize-slow-query', 'sql-index-not-used'],
    },
    {
      id: 'sql-n-plus-one',
      level: 'intermediate',
      priority: 2,
      question: 'What is the N+1 query problem, and why is SELECT * discouraged?',
      tags: ['performance', 'n-plus-one', 'orm', 'select-star'],
      answer: {
        interview: `**N+1 is running one query to fetch a list and then one more query per row to fetch related data; it turns one round trip into N+1 and is the most common ORM performance bug.**

- Example: load 5 doctors, then for each doctor run \`SELECT COUNT(*) FROM appointments WHERE doctor_id = ?\`: 6 queries, and 1,001 for 1,000 doctors.
- Each query pays network latency, parsing and planning; the total grows linearly with N.
- Fix: one query with a \`JOIN\` + \`GROUP BY\`, or a second batched query with \`WHERE doctor_id = ANY($1)\`; in ORMs, eager loading (\`include\`, \`select_related\`/\`prefetch_related\`, \`with\`).

**Why avoid \`SELECT *\`**:
- Transfers columns you don't need (large text, JSONB), using memory and bandwidth.
- Prevents index-only scans.
- Breaks or silently changes when columns are added, renamed or reordered.
- Fine for ad-hoc exploration, not for application code.`,
        explanationBn: `**N+1** সমস্যা: প্রথমে 1টা query দিয়ে list আনা (যেমন Cardiology-র 5 জন doctor), তারপর loop-এ প্রতিটা doctor-এর জন্য আলাদা query ("এই doctor-এর কয়টা appointment?")। মোট 1 + N টা query।

প্রতিটা query আলাদা করে database-এ যায়, parse হয়, plan হয়, ফিরে আসে। একটা query 2ms হলেও 1000 doctor-এ 2 সেকেন্ড। ORM-এ এটা চোখে পড়ে না, কারণ code-এ শুধু \`doctor.appointments.length\` লেখা থাকে, পেছনে query চলে যায়।

Analogy: বাজারে গিয়ে প্রতিটা জিনিস কিনে বাসায় রেখে আবার বাজারে যাওয়া, একবারে list নিয়ে সব না কিনে।

সমাধান: database-কে একবারেই পুরো কাজ দাও। উদাহরণে \`LEFT JOIN\` + \`GROUP BY\` দিয়ে একটা query-তেই প্রতিটা doctor-এর appointment সংখ্যা। \`LEFT JOIN\` আর \`COUNT(a.id)\` হওয়ায় যে doctor-এর কোনো appointment নেই (Dr. Nusrat), সে-ও 0 সহ আসে। \`COUNT(*)\` দিলে সেখানে ভুল করে 1 আসত।

**\`SELECT *\`**: দরকার নেই এমন column-ও আনে (বড় JSONB-ও), index-only scan-এর সুযোগ নষ্ট করে, আর table-এ column যোগ হলে application-এর আচরণ নিঃশব্দে বদলে যেতে পারে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'One query instead of 1 + N: counts per doctor with a LEFT JOIN',
            code: `SELECT d.id, d.name, COUNT(a.id) AS appointments
FROM doctors AS d
LEFT JOIN appointments AS a ON a.doctor_id = d.id
WHERE d.department_id = 1
GROUP BY d.id, d.name
ORDER BY d.id;`,
            resultTable: {
              columns: ['id', 'name', 'appointments'],
              rows: [
                [1, 'Dr. Nusrat Rahman', 0],
                [2, 'Dr. Arif Hossain', 4],
                [5, 'Dr. Sadia Islam', 6],
                [6, 'Dr. Tanvir Ahmed', 3],
                [11, 'Dr. Shirin Sultana', 1],
              ],
            },
          },
        ],
        pitfalls: [
          'COUNT(*) with a LEFT JOIN counts the NULL-extended row: a doctor with no appointments shows 1; count a column from the right table instead.',
          'Eager loading everything "just in case" swings to the opposite problem: huge result sets.',
        ],
        followUps: [
          'How do you detect N+1 queries in an application?',
          'What is the difference between eager and lazy loading?',
        ],
      },
      related: ['sql-optimize-slow-query', 'sql-what-is-index'],
    },
    {
      id: 'sql-optimize-slow-query',
      level: 'advanced',
      priority: 3,
      question: 'A query is slow in production. How do you find the cause and fix it?',
      tags: ['performance', 'explain', 'indexes', 'query-tuning', 'pg-stat-statements'],
      answer: {
        interview: `**Measure first, find the expensive step in the real plan, fix that one thing, and measure again.**

1. **Find it**: \`pg_stat_statements\` (total and mean time per query), slow query log (\`log_min_duration_statement\`), APM traces.
2. **Reproduce** with the real parameters and \`EXPLAIN (ANALYZE, BUFFERS)\`.
3. **Read the plan**: where is most time spent? Seq Scan with a selective filter, estimated vs actual rows far apart, sort or hash spilling to disk, nested loop over many rows.
4. **Fix the cause**:
   - Missing or wrong index: composite with equality columns first, covering, partial, expression.
   - Non-sargable predicates: functions or casts on columns, leading wildcards.
   - Stale statistics: \`ANALYZE\`, raise the statistics target on skewed columns.
   - Query shape: avoid N+1, select only needed columns, keyset pagination instead of large OFFSET, pre-aggregate before joining.
   - Data volume: partitioning, archiving, materialized views.
5. **Verify** the new plan and timing; watch write cost and lock impact of new indexes (\`CREATE INDEX CONCURRENTLY\`).`,
        explanationBn: `এই প্রশ্নে interviewer একটা **পদ্ধতি** শুনতে চায়, অনুমান না। "Index দিয়ে দেব" দিয়ে শুরু করলে দুর্বল শোনায়।

**১. কোন query ধীর, খুঁজে বের করো।** \`pg_stat_statements\` extension প্রতিটা query কতবার চলেছে আর মোট কত সময় নিয়েছে রাখে। অনেক সময় দেখা যায় একটা 5ms-এর query দিনে 10 লাখ বার চলছে, সেটাই আসল সমস্যা।

**২. আসল parameter দিয়ে \`EXPLAIN (ANALYZE, BUFFERS)\` চালাও।** Plan-এ কোন node-এ সবচেয়ে বেশি সময়, সেটাই লক্ষ্য।

**৩. কারণ অনুযায়ী সমাধান।** উদাহরণে query-টা একজন doctor-এর মার্চের পরের appointment, তারিখ ধরে sorted। আগে plan ছিল পুরো table Seq Scan + আলাদা Sort। \`(doctor_id, appointment_date)\` composite index দেওয়ার পর: doctor দিয়ে সরাসরি index-এ, তারিখের range একটানা, আর index আগে থেকেই sorted বলে **Sort node-ই উধাও**।

**৪. আবার মাপো।** নতুন index লেখা ধীর করে, তাই লাভ-ক্ষতি দেখো। Production-এ বড় table-এ index বানাতে \`CREATE INDEX CONCURRENTLY\`, যাতে table lock না হয়।

ধাপগুলো মনে রাখার সহজ উপায়: **Find → Explain → Fix one thing → Measure।**`,
        examples: [
          {
            lang: 'sql',
            caption: 'Before: scan everything, then sort',
            code: `EXPLAIN (COSTS OFF)
SELECT a.id, a.appointment_date, a.status
FROM appointments AS a
WHERE a.doctor_id = 5 AND a.appointment_date >= '2024-03-01'
ORDER BY a.appointment_date;`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Sort'],
                ['  Sort Key: appointment_date'],
                ['  ->  Seq Scan on appointments a'],
                ["        Filter: ((appointment_date >= '2024-03-01'::date) AND (doctor_id = 5))"],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'After: one composite index serves the filter and the ORDER BY',
            code: `CREATE INDEX appt_doctor_date_idx ON appointments (doctor_id, appointment_date);
ANALYZE appointments;
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT a.id, a.appointment_date, a.status
FROM appointments AS a
WHERE a.doctor_id = 5 AND a.appointment_date >= '2024-03-01'
ORDER BY a.appointment_date;`,
            output: `CREATE INDEX
ANALYZE
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Index Scan using appt_doctor_date_idx on appointments a'],
                ["  Index Cond: ((doctor_id = 5) AND (appointment_date >= '2024-03-01'::date))"],
              ],
            },
          },
        ],
        pitfalls: [
          'Tuning a query that runs once a day while a fast query running a million times dominates the load.',
          'Adding indexes without checking write overhead and whether an existing index already covers the case.',
          'Plain CREATE INDEX blocks writes on the table for the whole build; use CONCURRENTLY in production.',
        ],
        followUps: [
          'What does pg_stat_statements show?',
          'When would partitioning help, and when would it not?',
          'How do you add an index to a large production table safely?',
        ],
      },
      related: ['sql-explain-analyze', 'sql-composite-index', 'sql-n-plus-one'],
    },
    {
      id: 'sql-keyset-pagination',
      level: 'advanced',
      priority: 2,
      question:
        'Why is OFFSET pagination slow on deep pages, and how does keyset (cursor) pagination fix it?',
      tags: ['performance', 'pagination', 'keyset', 'offset', 'row-comparison'],
      answer: {
        interview: `**OFFSET n still reads and throws away the first n rows, so page 10,000 costs as much as reading 10,000 pages; keyset pagination remembers the last row's sort key and asks for rows after it, which an index answers directly.**

| Aspect | OFFSET / LIMIT | Keyset (seek) |
| --- | --- | --- |
| Query | \`ORDER BY date, id LIMIT 5 OFFSET 10\` | \`WHERE (date, id) > (:last_date, :last_id) ORDER BY date, id LIMIT 5\` |
| Cost on deep pages | Grows with the offset | Constant with an index on \`(date, id)\` |
| Stable when rows are inserted or deleted | No: rows shift, duplicates or gaps appear | Yes |
| Jump to page N | Yes | No: next/previous only |
| Typical UI | Numbered pages in admin tables | Infinite scroll, APIs, exports |

- The sort must be unique: add the primary key as a tie-breaker.
- PostgreSQL's row comparison \`(a, b) > (x, y)\` expresses "after this position" exactly and can use a composite index.`,
        explanationBn: `\`OFFSET 10000\` মানে database-কে বলা: "প্রথম 10000টা row বের করো, তারপর ফেলে দাও, তারপর পরের 20টা দাও।" যত গভীর page, তত বেশি অকাজের পড়া। শেষের page গুলো সবচেয়ে ধীর।

আরেকটা সমস্যা: user page 1 দেখার সময় কেউ নতুন row ঢোকালে, page 2-তে আগের page-এর শেষ row আবার দেখা যায় (সব এক ঘর সরে গেছে)।

**Keyset pagination**: "কত row বাদ দেব" না বলে, বলো "**কোথায়** থেমেছিলাম"। আগের page-এর শেষ row ছিল \`(2024-02-02, id 10)\`, তাই পরের page: \`WHERE (appointment_date, id) > ('2024-02-02', 10)\`। \`(appointment_date, id)\`-এর উপর index থাকলে Postgres সরাসরি সেই জায়গায় লাফ দেয়, আগের row গুলো ছোঁয়ই না।

বইয়ে bookmark রাখার মতো: পরের বার পড়তে শুরু থেকে page গুনতে হয় না, bookmark-এ খুলে ফেলো।

উদাহরণে দুই পদ্ধতিই একই page দেয়, কিন্তু বড় table-এ keyset প্রতিটা page-এ সমান দ্রুত। \`id\` যোগ করা জরুরি, কারণ একই তারিখে একাধিক appointment থাকলে শুধু তারিখ দিয়ে "কোথায় থেমেছি" অস্পষ্ট।

সীমাবদ্ধতা: সরাসরি "page 57"-এ যাওয়া যায় না। তাই infinite scroll বা API-তে keyset, আর ছোট admin table-এ OFFSET চলে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'OFFSET: reads 15 rows to return the third page of 5',
            code: `SELECT id, appointment_date, patient_id
FROM appointments
ORDER BY appointment_date, id
LIMIT 5 OFFSET 10;`,
            resultTable: {
              columns: ['id', 'appointment_date', 'patient_id'],
              rows: [
                [11, '2024-02-06', 3],
                [12, '2024-02-09', 6],
                [13, '2024-02-12', 7],
                [14, '2024-02-14', 8],
                [15, '2024-02-16', 10],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'Keyset: continue after the last row of page 2 (2024-02-02, id 10)',
            code: `SELECT id, appointment_date, patient_id
FROM appointments
WHERE (appointment_date, id) > ('2024-02-02', 10)
ORDER BY appointment_date, id
LIMIT 5;`,
            resultTable: {
              columns: ['id', 'appointment_date', 'patient_id'],
              rows: [
                [11, '2024-02-06', 3],
                [12, '2024-02-09', 6],
                [13, '2024-02-12', 7],
                [14, '2024-02-14', 8],
                [15, '2024-02-16', 10],
              ],
            },
          },
        ],
        pitfalls: [
          'Keyset on a non-unique sort key skips or repeats rows; always end the ORDER BY with a unique column.',
          'Writing the condition as date > x OR (date = x AND id > y) is correct but harder for the planner than the row comparison.',
          'Mixed sort directions (date DESC, id ASC) need matching index directions and a hand-written condition.',
        ],
        followUps: [
          'How would you implement a "previous page" with keyset pagination?',
          'How do you show a total count without making every page slow?',
        ],
      },
      related: ['sql-composite-index', 'sql-optimize-slow-query'],
    },
    {
      id: 'sql-partial-covering-index',
      level: 'advanced',
      priority: 1,
      question: 'What are partial indexes and covering indexes in PostgreSQL?',
      tags: ['indexes', 'partial-index', 'covering-index', 'index-only-scan', 'include'],
      answer: {
        interview: `**A partial index only contains rows matching a WHERE condition; a covering index stores extra columns (with INCLUDE) so a query can be answered from the index alone, an index-only scan.**

- **Partial**: \`CREATE INDEX ... ON appointments (appointment_date) WHERE status = 'scheduled'\`. Small and cheap to maintain when queries target a small subset (upcoming appointments, unprocessed jobs, non-deleted rows). The query's WHERE must imply the index condition.
- Partial **unique** indexes enforce rules on a subset: \`UNIQUE (email) WHERE deleted_at IS NULL\`.
- **Covering**: \`CREATE INDEX ... ON appointments (patient_id) INCLUDE (appointment_date, fee)\`. INCLUDE columns are stored in leaf entries but not part of the search key.
- An **index-only scan** still checks the *visibility map*; it is only effective on tables that are vacuumed regularly.`,
        explanationBn: `**Partial index**: পুরো table-এর জন্য না, শুধু দরকারি অংশের জন্য index। ক্লিনিকে বেশিরভাগ query "আসন্ন (scheduled) appointment" নিয়ে, কিন্তু scheduled মাত্র 2টা আর completed 30টা। শুধু scheduled row-এর index ছোট, দ্রুত, আর completed row লেখার সময় সেটা update-ও করতে হয় না। শর্ত: query-র \`WHERE\`-এও \`status = 'scheduled'\` থাকতে হবে, নইলে planner এই index ব্যবহার করতে পারবে না।

Partial **unique** index-ও খুব কাজের: "soft delete করা row বাদে email unique" নিয়ম এভাবেই লেখা যায়।

**Covering index**: সাধারণ index থেকে row-এর ঠিকানা নিয়ে আবার table (heap)-এ গিয়ে বাকি column পড়তে হয়। \`INCLUDE (appointment_date, fee)\` দিলে সেই column গুলোও index-এ রাখা থাকে, ফলে table-এ যাওয়াই লাগে না: **Index Only Scan**।

একটা সূক্ষ্ম ব্যাপার: PostgreSQL-এ row visible কিনা (MVCC) সেই তথ্য থাকে heap-এ। Index-only scan **visibility map** দেখে নিশ্চিত হয় page-এর সব row সবার কাছে visible। তাই উদাহরণে আগে \`VACUUM\` চালানো হয়েছে; নিয়মিত vacuum না হলে "index-only" scan-ও heap-এ যেতে বাধ্য হয়।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A partial index used because the query repeats its condition',
            code: `CREATE INDEX appt_scheduled_idx ON appointments (appointment_date)
  WHERE status = 'scheduled';
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT id FROM appointments
WHERE status = 'scheduled' AND appointment_date < '2024-05-01';`,
            output: `CREATE INDEX
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Index Scan using appt_scheduled_idx on appointments'],
                ["  Index Cond: (appointment_date < '2024-05-01'::date)"],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'INCLUDE columns let the query skip the table: Index Only Scan',
            code: `CREATE INDEX appt_patient_cover_idx ON appointments (patient_id) INCLUDE (appointment_date, fee);
VACUUM appointments;
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT appointment_date, fee FROM appointments WHERE patient_id = 4;`,
            output: `CREATE INDEX
VACUUM
SET`,
            resultTable: {
              columns: ['QUERY PLAN'],
              rows: [
                ['Index Only Scan using appt_patient_cover_idx on appointments'],
                ['  Index Cond: (patient_id = 4)'],
              ],
            },
          },
        ],
        pitfalls: [
          'A partial index is ignored when the query uses a parameter the planner cannot prove matches the index condition.',
          'Including many or wide columns makes the index nearly as large as the table.',
        ],
        followUps: [
          'How would you enforce "one active subscription per user"?',
          'What is the visibility map?',
        ],
      },
      related: ['sql-composite-index', 'sql-btree-clustered-index'],
    },
  ],
});

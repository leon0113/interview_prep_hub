import { defineSection } from '../../define';

export const viewsFunctionsSecurity = defineSection({
  id: 'sql-views-functions-security',
  title: 'Views, Functions & Security',
  description:
    'SQL injection and parameterized queries, views vs materialized views, functions vs procedures, roles, privileges and row-level security, and triggers.',
  order: 13,
  questions: [
    {
      id: 'sql-injection',
      level: 'foundation',
      priority: 3,
      question: 'What is SQL injection, and how do you prevent it?',
      tags: ['security', 'sql-injection', 'parameterized-queries', 'prepared-statements'],
      answer: {
        interview: `**SQL injection is when user input is concatenated into SQL text and ends up being executed as SQL; the fix is to never build SQL from input strings and to send values as parameters instead.**

- Vulnerable: \`"... WHERE name = '" + input + "'"\`. Input \`' OR '1'='1\` turns the filter into "always true" and returns every row; worse input can read other tables or modify data.
- **Parameterized queries / prepared statements**: the SQL text is fixed (\`WHERE name = $1\`) and the value travels separately, so it is always treated as data, never as code. Every driver and ORM supports this.
- Identifiers (table or column names) cannot be parameters: pick them from an **allow-list** in code, or quote them with \`format('%I', ...)\` in PL/pgSQL; quote literals with \`%L\`.
- Defense in depth: least-privilege database roles, no superuser for the app, input validation, and ORMs used without raw string building.

Real-world: a search box that sends \`' OR '1'='1\` must return zero patients, not all of them.`,
        explanationBn: `SQL injection হয় যখন user-এর দেওয়া লেখা সরাসরি SQL-এর ভেতরে জুড়ে দেওয়া হয়। Database তখন আলাদা করতে পারে না কোনটা আমার লেখা SQL আর কোনটা user-এর data।

ধরো code: \`"SELECT ... WHERE name = '" + input + "'"\`। User নামের ঘরে লিখল \`' OR '1'='1\`। জোড়া লাগানোর পর query হলো:
\`WHERE name = '' OR '1'='1'\`
\`'1'='1'\` সবসময় সত্য, তাই **সব patient**-এর data বেরিয়ে গেল। প্রথম উদাহরণে ঠিক এটাই দেখানো হয়েছে। আরও খারাপ input দিয়ে অন্য table পড়া, data বদলানো, এমনকি table মুছে ফেলাও সম্ভব।

**সমাধান: parameterized query।** SQL-এর কাঠামো আগেই ঠিক করা থাকে (\`WHERE name = $1\`), আর value আলাদা পথে যায়। Database জানে \`$1\` শুধুই একটা মান; তার ভেতরে যত quote বা \`OR\` থাকুক, সেটা code হিসেবে চলবে না। তাই একই ক্ষতিকর input দিয়ে prepared statement-এ কোনো patient পাওয়া যায়নি, কারণ ওই অদ্ভুত নামে কেউ নেই।

Analogy: ফর্মের "নাম" ঘরে কেউ "এবং আমাকে ম্যানেজার বানাও" লিখলে অফিস সেটা নাম হিসেবেই পড়ে, নির্দেশ হিসেবে মানে না।

Table বা column-এর নাম parameter হতে পারে না। সেগুলো code-এর allow-list থেকে নাও, অথবা PL/pgSQL-এ \`format('%I')\` (identifier) আর \`%L\` (literal) দিয়ে নিরাপদে quote করো। শেষ উদাহরণে \`%L\` quote দ্বিগুণ করে পুরো input-কে একটা নিরীহ string বানিয়ে ফেলেছে।`,
        examples: [
          {
            lang: 'sql',
            caption:
              "What the database receives when input ' OR '1'='1 is pasted into the SQL string",
            code: `SELECT id, name FROM patients WHERE name = '' OR '1'='1' ORDER BY id LIMIT 3;`,
            resultTable: {
              columns: ['id', 'name'],
              rows: [
                [1, 'Ayesha Siddiqua'],
                [2, 'Rahim Uddin'],
                [3, 'Nadia Karim'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'A prepared statement treats the same input as a plain value: no match',
            code: `PREPARE find_patient(text) AS
  SELECT id, name FROM patients WHERE name = $1;
EXECUTE find_patient(''' OR ''1''=''1');`,
            output: `PREPARE`,
            resultTable: {
              columns: ['id', 'name'],
              rows: [],
            },
          },
          {
            lang: 'sql',
            caption: 'Dynamic SQL inside the database: format() with %L quotes a literal safely',
            code: `DO $$
DECLARE
  v_input text := 'x''; DROP TABLE patients; --';
BEGIN
  RAISE NOTICE '%', format('SELECT * FROM patients WHERE name = %L', v_input);
END $$;`,
            output: `NOTICE:  SELECT * FROM patients WHERE name = 'x''; DROP TABLE patients; --'
DO`,
          },
        ],
        pitfalls: [
          'Escaping quotes by hand instead of using parameters: encodings and edge cases make it unreliable.',
          'ORMs are safe only until someone writes raw SQL with string interpolation (e.g. a template literal into query()).',
          'ORDER BY and table names cannot be bound as parameters; validate them against a fixed list.',
        ],
        followUps: [
          'How do prepared statements also help performance?',
          'How would you let users choose the sort column safely?',
          'What is the principle of least privilege for a database user?',
        ],
      },
      related: ['sql-roles-privileges-rls', 'sql-function-vs-procedure'],
    },
    {
      id: 'sql-view-vs-materialized-view',
      level: 'intermediate',
      priority: 2,
      question: 'What is the difference between a view and a materialized view?',
      tags: ['views', 'materialized-view', 'refresh', 'performance'],
      answer: {
        interview: `**A view is a saved query that runs every time you select from it, so it is always current; a materialized view stores the query's result on disk, so it is fast to read but stale until you refresh it.**

| Aspect | View | Materialized view |
| --- | --- | --- |
| Stores data | No, only the query | Yes, the result rows |
| Freshness | Always current | As of the last \`REFRESH\` |
| Read speed | Same as the underlying query | Fast, like a table |
| Indexes | Uses the base tables' indexes | Can have its own indexes |
| Writes through it | Simple views are updatable | No |
| Refresh | Not needed | \`REFRESH MATERIALIZED VIEW [CONCURRENTLY]\` |

- Views: hide complexity, give a stable interface, restrict columns or rows for a role.
- Materialized views: expensive aggregations read often and changed rarely (dashboards, reports); refresh on a schedule. \`CONCURRENTLY\` avoids blocking readers but needs a unique index.`,
        explanationBn: `**View** হলো একটা query-কে নাম দিয়ে রাখা। \`doctor_workload\` থেকে select করলে Postgres আসলে ভেতরের JOIN + GROUP BY আবার চালায়। তাই data সবসময় টাটকা, কিন্তু query যত ভারী, view-ও তত ধীর। View নিজে data রাখে না; এটা যেন একটা জানালা, যেখান দিয়ে table-গুলো একটা নির্দিষ্ট কোণ থেকে দেখা যায়।

**Materialized view** query-র ফলাফল **ছবি তুলে রেখে দেয়** (disk-এ সত্যিকারের row)। পড়া খুব দ্রুত, index-ও বানানো যায়। কিন্তু মূল table বদলালে ছবি বদলায় না।

উদাহরণে \`monthly_revenue\` বানানোর পর এপ্রিলে নতুন 1300 টাকার payment যোগ হলো, কিন্তু materialized view তখনো পুরনো 6700 দেখাচ্ছে। \`REFRESH MATERIALIZED VIEW\` চালানোর পর 8000।

কখন কোনটা:
- জটিল JOIN লুকাতে, বা কোনো role-কে শুধু কিছু column/row দেখাতে: **view**।
- Dashboard-এর ভারী aggregation, যেটা দিনে হাজারবার পড়া হয় কিন্তু কয়েক মিনিট পুরনো হলেও চলে: **materialized view**, cron দিয়ে নিয়মিত refresh।

\`REFRESH ... CONCURRENTLY\` refresh-এর সময় পাঠকদের আটকায় না, তবে এর জন্য materialized view-তে একটা unique index লাগে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A view: a named query, recomputed on every read',
            code: `CREATE VIEW doctor_workload AS
SELECT d.id, d.name, COUNT(a.id) AS appointments
FROM doctors AS d
LEFT JOIN appointments AS a ON a.doctor_id = d.id
GROUP BY d.id, d.name;

SELECT name, appointments FROM doctor_workload
ORDER BY appointments DESC, name
LIMIT 3;`,
            output: `CREATE VIEW`,
            resultTable: {
              columns: ['name', 'appointments'],
              rows: [
                ['Dr. Mahbub Alam', 7],
                ['Dr. Sadia Islam', 6],
                ['Dr. Kamal Uddin', 5],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'A materialized view keeps its old result after new data arrives',
            code: `CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT date_trunc('month', paid_at)::date AS month, SUM(amount) AS revenue
FROM payments
GROUP BY 1;

INSERT INTO payments (appointment_id, amount, paid_at, method)
VALUES (26, 1300, '2024-04-25 10:00', 'cash');

SELECT month, revenue FROM monthly_revenue WHERE month = '2024-04-01';`,
            output: `SELECT 4
INSERT 0 1`,
            resultTable: {
              columns: ['month', 'revenue'],
              rows: [['2024-04-01', '6700.00']],
            },
          },
          {
            lang: 'sql',
            caption: 'REFRESH recomputes and stores the new result',
            code: `CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT date_trunc('month', paid_at)::date AS month, SUM(amount) AS revenue
FROM payments
GROUP BY 1;

INSERT INTO payments (appointment_id, amount, paid_at, method)
VALUES (26, 1300, '2024-04-25 10:00', 'cash');

REFRESH MATERIALIZED VIEW monthly_revenue;
SELECT month, revenue FROM monthly_revenue WHERE month = '2024-04-01';`,
            output: `SELECT 4
INSERT 0 1
REFRESH MATERIALIZED VIEW`,
            resultTable: {
              columns: ['month', 'revenue'],
              rows: [['2024-04-01', '8000.00']],
            },
          },
        ],
        pitfalls: [
          'Assuming a view caches anything: it is exactly as fast as its query.',
          'Forgetting to schedule refreshes: the materialized view silently serves old numbers.',
          'Stacking views on views hides very expensive queries behind innocent-looking names.',
        ],
        followUps: [
          'How would you refresh a materialized view without blocking readers?',
          'Can you INSERT into a view?',
        ],
      },
      related: ['sql-denormalization', 'sql-roles-privileges-rls'],
    },
    {
      id: 'sql-function-vs-procedure',
      level: 'intermediate',
      priority: 2,
      question: 'What is the difference between a function and a stored procedure in PostgreSQL?',
      tags: ['functions', 'procedures', 'plpgsql', 'stored-procedures'],
      answer: {
        interview: `**A function returns a value and is called inside a query; a procedure is invoked with CALL, returns no value (only OUT parameters), and can commit or roll back transactions inside its body.**

| Aspect | Function | Procedure (PostgreSQL 11+) |
| --- | --- | --- |
| Invoked with | \`SELECT f(...)\`, anywhere an expression fits | \`CALL p(...)\` |
| Returns | A value, a row, or a set of rows | Nothing (OUT parameters only) |
| Transaction control | No: runs inside the caller's transaction | Yes: \`COMMIT\` / \`ROLLBACK\` in the body |
| Typical use | Calculations, reusable query logic, triggers | Batch jobs, maintenance, multi-step processes |

- Languages: \`sql\` (simple, can be inlined by the planner), \`plpgsql\` (variables, IF, loops, exceptions), and others via extensions.
- Volatility matters: \`IMMUTABLE\` (same input, same output, usable in indexes), \`STABLE\` (reads but doesn't modify within a query), \`VOLATILE\` (default).
- Keep business logic in the database only where it protects integrity or saves round trips; it is harder to version, test and debug than application code.`,
        explanationBn: `দুটোই database-এর ভেতরে রাখা reusable code, কিন্তু কাজের ধরন আলাদা।

**Function**: ইনপুট নেয়, একটা মান ফেরত দেয়, আর query-র ভেতরে যেকোনো জায়গায় ব্যবহার করা যায়, যেমন \`SELECT patient_age(birth_date)\`। Excel-এর formula-র মতো। Function caller-এর transaction-এর ভেতরে চলে, নিজে COMMIT করতে পারে না।

**Procedure**: \`CALL\` দিয়ে চালাতে হয়, কোনো মান ফেরত দেয় না, কিন্তু ভেতরে \`COMMIT\` করতে পারে। ধরো লাখো row প্রতি 1000টা করে update করে commit করতে চাও, যাতে একটা বিশাল transaction না হয়: এটা procedure-এর কাজ।

উদাহরণগুলো:
- \`patient_age\`: সাধারণ \`sql\` function, \`IMMUTABLE\` কারণ একই তারিখে সবসময় একই উত্তর। Sumaiya-র জন্মদিন 29 ফেব্রুয়ারি, তবুও \`age()\` সঠিক বয়স দেয়।
- \`doctor_no_show_rate\`: \`plpgsql\` function, variable আর \`IF\` সহ। যে doctor-এর কোনো appointment নেই (Dr. Nusrat), তার জন্য শূন্য দিয়ে ভাগ না করে NULL ফেরত দেয়।
- \`close_past_appointments\`: procedure। পুরনো scheduled appointment-কে no_show বানায়, কয়টা বদলাল \`RAISE NOTICE\` দিয়ে জানায়, তারপর commit।

**Volatility** label planner-কে বলে function-কে কতটা বিশ্বাস করা যায়: \`IMMUTABLE\` হলে index-এ ব্যবহার করা যায়; ভুল করে \`IMMUTABLE\` লিখলে (যেমন \`now()\` ব্যবহার করে) ভুল ফল আসতে পারে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A SQL-language function used inside a query',
            code: `CREATE FUNCTION patient_age(p_birth date, p_on date DEFAULT DATE '2024-12-31')
RETURNS int
LANGUAGE sql
IMMUTABLE
RETURN EXTRACT(YEAR FROM age(p_on, p_birth))::int;

SELECT name, birth_date, patient_age(birth_date) AS age
FROM patients
WHERE id IN (5, 6, 10)
ORDER BY id;`,
            output: `CREATE FUNCTION`,
            resultTable: {
              columns: ['name', 'birth_date', 'age'],
              rows: [
                ['Mim Akter', '2015-06-14', 9],
                ['Jamal Hossain', '1962-03-03', 62],
                ['Sumaiya Islam', '1988-02-29', 36],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'A PL/pgSQL function with variables and a guard against division by zero',
            code: `CREATE FUNCTION doctor_no_show_rate(p_doctor int)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_total   int;
  v_noshow  int;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'no_show')
  INTO v_total, v_noshow
  FROM appointments WHERE doctor_id = p_doctor;

  IF v_total = 0 THEN
    RETURN NULL;
  END IF;
  RETURN ROUND(100.0 * v_noshow / v_total, 1);
END;
$$;

SELECT id, name, doctor_no_show_rate(id) AS no_show_pct
FROM doctors WHERE id IN (1, 5, 7) ORDER BY id;`,
            output: `CREATE FUNCTION`,
            resultTable: {
              columns: ['id', 'name', 'no_show_pct'],
              rows: [
                [1, 'Dr. Nusrat Rahman', null],
                [5, 'Dr. Sadia Islam', '33.3'],
                [7, 'Dr. Rumana Chowdhury', '25.0'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'A procedure: invoked with CALL and allowed to COMMIT',
            code: `CREATE PROCEDURE close_past_appointments(p_today date)
LANGUAGE plpgsql
AS $$
DECLARE
  v_closed int;
BEGIN
  UPDATE appointments SET status = 'no_show'
  WHERE status = 'scheduled' AND appointment_date < p_today;
  GET DIAGNOSTICS v_closed = ROW_COUNT;
  RAISE NOTICE 'closed % appointment(s)', v_closed;
  COMMIT;
END;
$$;

CALL close_past_appointments(DATE '2024-04-30');
SELECT id, status FROM appointments WHERE id IN (39, 40) ORDER BY id;`,
            output: `CREATE PROCEDURE
NOTICE:  closed 1 appointment(s)
CALL`,
            resultTable: {
              columns: ['id', 'status'],
              rows: [
                [39, 'no_show'],
                [40, 'scheduled'],
              ],
            },
          },
        ],
        pitfalls: [
          'Marking a function IMMUTABLE when it reads tables or calls now(): indexes and cached plans can return wrong results.',
          'A procedure that COMMITs cannot be CALLed inside an explicit transaction block that the caller opened.',
          'SECURITY DEFINER functions run with the owner’s rights; always set search_path on them.',
        ],
        followUps: [
          'What do IMMUTABLE, STABLE and VOLATILE mean?',
          'What is SECURITY DEFINER, and why is it risky?',
        ],
      },
      related: ['sql-triggers', 'sql-injection'],
    },
    {
      id: 'sql-roles-privileges-rls',
      level: 'advanced',
      priority: 2,
      question: 'How do roles, privileges and row-level security work in PostgreSQL?',
      tags: ['security', 'roles', 'grant', 'row-level-security', 'least-privilege'],
      answer: {
        interview: `**Roles are users and groups; GRANT gives a role specific privileges on specific objects, down to individual columns, and row-level security (RLS) adds per-row policies that filter what a role can see or change.**

- Create roles per purpose: an app role with only \`SELECT/INSERT/UPDATE/DELETE\` on its tables, a read-only reporting role, a migration role that owns the schema. No superuser for applications.
- \`GRANT SELECT ON appointments TO reporting_user\`; anything not granted is denied (\`permission denied for table ...\`).
- Column privileges: \`GRANT SELECT (id, name, city) ON patients TO front_desk\` hides sensitive columns such as medical metadata.
- **RLS**: \`ALTER TABLE ... ENABLE ROW LEVEL SECURITY\` + \`CREATE POLICY ... USING (doctor_id = current_setting('app.doctor_id')::int)\`. Every query by that role is filtered automatically; with RLS on and no policy, the role sees nothing.
- Table owners and superusers bypass RLS unless \`FORCE ROW LEVEL SECURITY\` is set.

Real-world: multi-tenant SaaS (\`tenant_id\` policy) and "doctors see only their own patients" without trusting every query in the app.`,
        explanationBn: `**Least privilege**: প্রতিটা user বা app শুধু ততটুকুই পারবে যতটুকু তার কাজের জন্য দরকার। Application যদি superuser হিসেবে connect করে, তাহলে একটা SQL injection-এই পুরো database শেষ।

PostgreSQL-এ তিন স্তরের নিয়ন্ত্রণ:

**১. Role আর GRANT**: \`reporting_user\` শুধু \`appointments\` আর \`doctors\` পড়তে পারে। সে appointment গুনতে পারল (40), কিন্তু update করতে গেলে বা \`patients\` পড়তে গেলে "permission denied"। যা দেওয়া হয়নি, তা নিষেধ।

**২. Column privilege**: Front desk-এর কর্মী রোগীর নাম আর শহর দেখবে, কিন্তু \`metadata\`-তে থাকা allergy বা insurance-এর মতো সংবেদনশীল তথ্য না। \`GRANT SELECT (id, name, city)\` দিলে অন্য column চাইলেই error।

**৩. Row-level security (RLS)**: একই table, কিন্তু প্রত্যেকে নিজের row দেখবে। Policy বলছে "doctor_id = এই session-এর doctor"। Application login-এর পর \`SET app.doctor_id = '7'\` করে; এরপর \`SELECT * FROM appointments\` লিখলেও Dr. Rumana শুধু নিজের 4টা appointment দেখেন। Developer \`WHERE doctor_id = ...\` লিখতে ভুলে গেলেও data ফাঁস হবে না, কারণ filter database নিজেই বসায়।

সতর্কতা: table-এর owner আর superuser সাধারণত RLS এড়িয়ে যায়। তাই app যেন table-এর owner role দিয়ে connect না করে, অথবা \`FORCE ROW LEVEL SECURITY\` দাও।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A read-only role: SELECT works, anything not granted is denied',
            code: `CREATE ROLE reporting_user;
GRANT SELECT ON appointments, doctors TO reporting_user;
SET ROLE reporting_user;
SELECT COUNT(*) AS visible_appointments FROM appointments;
UPDATE appointments SET fee = 0 WHERE id = 1;
SELECT COUNT(*) FROM patients;`,
            output: `CREATE ROLE
GRANT
SET
ERROR:  permission denied for table appointments
ERROR:  permission denied for table patients`,
            resultTable: {
              columns: ['visible_appointments'],
              rows: [[40]],
            },
          },
          {
            lang: 'sql',
            caption: 'Column privileges hide sensitive columns',
            code: `CREATE ROLE front_desk;
GRANT SELECT (id, name, city) ON patients TO front_desk;
SET ROLE front_desk;
SELECT metadata FROM patients WHERE id = 1;`,
            output: `CREATE ROLE
GRANT
SET
ERROR:  permission denied for table patients`,
          },
          {
            lang: 'sql',
            caption: 'Row-level security: the same query returns only this doctor’s rows',
            code: `CREATE ROLE doctor_app;
GRANT SELECT ON appointments TO doctor_app;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_appointments ON appointments
  FOR SELECT TO doctor_app
  USING (doctor_id = current_setting('app.doctor_id')::int);

SET ROLE doctor_app;
SET app.doctor_id = '7';
SELECT id, doctor_id, appointment_date, status FROM appointments ORDER BY id;`,
            output: `CREATE ROLE
GRANT
ALTER TABLE
CREATE POLICY
SET
SET`,
            resultTable: {
              columns: ['id', 'doctor_id', 'appointment_date', 'status'],
              rows: [
                [2, 7, '2024-01-08', 'completed'],
                [15, 7, '2024-02-16', 'completed'],
                [29, 7, '2024-03-21', 'no_show'],
                [31, 7, '2024-04-02', 'completed'],
              ],
            },
          },
        ],
        pitfalls: [
          'Connecting the application as the table owner or a superuser silently bypasses RLS.',
          'Enabling RLS without any policy hides every row from non-owners; it looks like data loss.',
          'Granting on existing tables does not cover tables created later; use ALTER DEFAULT PRIVILEGES.',
        ],
        followUps: [
          'How would you implement multi-tenancy with RLS?',
          'What is the difference between a role and a user in PostgreSQL?',
        ],
      },
      related: ['sql-injection', 'sql-view-vs-materialized-view'],
    },
    {
      id: 'sql-triggers',
      level: 'advanced',
      priority: 1,
      question: 'What are triggers, and when should (and shouldn’t) you use them?',
      tags: ['triggers', 'plpgsql', 'audit', 'data-integrity'],
      answer: {
        interview: `**A trigger runs a function automatically when rows are inserted, updated or deleted (or a table is truncated), BEFORE or AFTER the change, once per row or once per statement.**

- **BEFORE ROW**: validate or modify \`NEW\` before it is written (normalize input, set \`updated_at\`); raising an exception aborts the statement.
- **AFTER ROW**: react to a committed-to-be change: audit logs, maintaining counters or denormalized copies.
- **Statement-level** with transition tables (\`REFERENCING NEW TABLE AS ...\`) handles bulk changes efficiently.
- \`INSTEAD OF\` triggers make complex views writable.

Use them for rules that must hold no matter which code path writes the data. Avoid them for business workflows: they are invisible from application code, can cascade into other triggers, slow down bulk writes, and are hard to debug. Prefer constraints when a constraint can express the rule.`,
        explanationBn: `**Trigger** হলো database-এর "যখন এটা হবে, তখন এটা করো" নিয়ম। কেউ row insert/update/delete করলেই নির্দিষ্ট function নিজে থেকে চলে, কোন application বা script পরিবর্তনটা করল তাতে কিছু যায় আসে না।

দুই সময়ে চলতে পারে:
- **BEFORE**: row লেখার আগে। \`NEW\` (নতুন row) দেখে আটকাতে বা বদলাতে পারে। দ্বিতীয় উদাহরণে fee negative হলে exception, পুরো UPDATE বাতিল।
- **AFTER**: row লেখার পরে। অন্য কাজ করতে, যেমন audit log লেখা বা counter বাড়ানো। প্রথম উদাহরণে নতুন appointment ঢুকলেই সেই patient-এর \`visit_count\` 1 বাড়ে। Hasan Mahmud-এর আগে 0টা visit ছিল, এখন 1।

এটা আগের denormalization প্রশ্নের সমাধান: cached counter-কে সঠিক রাখার একটা উপায়।

তবে সাবধান: trigger **অদৃশ্য**। Developer application code পড়ে বুঝবে না কেন একটা INSERT-এর পর অন্য table বদলে গেল। Trigger থেকে trigger, তার থেকে আরেক trigger চললে debug করা দুঃস্বপ্ন। লাখো row bulk insert-এ প্রতিটার জন্য function চলায় ধীরও হয়।

নিয়ম: যে নিয়ম constraint (\`CHECK\`, FK) দিয়ে লেখা যায়, সেটা constraint দিয়েই লেখো (fee-র উদাহরণটা আসলে \`CHECK (fee >= 0)\` দিয়েই ভালো হতো)। Trigger রাখো audit, \`updated_at\`, আর এমন invariant-এর জন্য যা সব write path-এ অবশ্যই মানতে হবে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'AFTER INSERT: keep a cached counter in sync automatically',
            code: `ALTER TABLE patients ADD COLUMN visit_count int NOT NULL DEFAULT 0;
UPDATE patients AS p
SET visit_count = (SELECT COUNT(*) FROM appointments AS a WHERE a.patient_id = p.id);

CREATE FUNCTION bump_visit_count() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE patients SET visit_count = visit_count + 1 WHERE id = NEW.patient_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER appointments_bump_visits
AFTER INSERT ON appointments
FOR EACH ROW EXECUTE FUNCTION bump_visit_count();

INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, fee)
VALUES (13, 4, '2024-05-02', 'scheduled', 1000);
SELECT id, name, visit_count FROM patients WHERE id = 13;`,
            output: `ALTER TABLE
UPDATE 14
CREATE FUNCTION
CREATE TRIGGER
INSERT 0 1`,
            resultTable: {
              columns: ['id', 'name', 'visit_count'],
              rows: [[13, 'Hasan Mahmud', 1]],
            },
          },
          {
            lang: 'sql',
            caption: 'BEFORE UPDATE: reject an invalid row by raising an exception',
            code: `CREATE FUNCTION reject_negative_fee() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.fee < 0 THEN
    RAISE EXCEPTION 'fee must not be negative (got %)', NEW.fee;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER appointments_check_fee
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION reject_negative_fee();
UPDATE appointments SET fee = -5 WHERE id = 1;`,
            output: `CREATE FUNCTION
CREATE TRIGGER
ERROR:  fee must not be negative (got -5.00)`,
          },
        ],
        pitfalls: [
          'A BEFORE ROW trigger that returns NULL silently skips the row.',
          'Counter triggers also need UPDATE and DELETE handling, or the cached value drifts.',
          'Row-level triggers run once per row: a 1-million-row import runs the function a million times.',
        ],
        followUps: [
          'How would you build an audit log of changes to appointments?',
          'What are transition tables in statement-level triggers?',
        ],
      },
      related: ['sql-function-vs-procedure', 'sql-denormalization'],
    },
  ],
});

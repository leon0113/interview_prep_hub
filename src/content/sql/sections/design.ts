import { defineSection } from '../../define';

export const design = defineSection({
  id: 'sql-design',
  title: 'Database Design',
  description:
    'Relationships, normalization and when to break it, surrogate vs natural keys, OLTP vs OLAP, star and snowflake schemas, and how to approach a schema-design question.',
  order: 9,
  questions: [
    {
      id: 'sql-relationship-types',
      level: 'foundation',
      priority: 2,
      question:
        'What are one-to-one, one-to-many and many-to-many relationships, and how do you implement each?',
      tags: ['design', 'relationships', 'foreign-key', 'junction-table'],
      answer: {
        interview: `**The relationship type says how many rows on each side can be linked; you implement it with where you put the foreign key and which constraints you add.**

| Type | Example in the clinic | Implementation |
| --- | --- | --- |
| One-to-many | A department has many doctors | FK on the "many" side: \`doctors.department_id → departments.id\` |
| One-to-one | An appointment has at most one payment | FK plus \`UNIQUE\`: \`payments.appointment_id\` is unique |
| Many-to-many | Patients see many doctors; doctors see many patients | A junction table with two FKs: \`appointments (patient_id, doctor_id)\` |

- Make the FK \`NOT NULL\` when the child cannot exist without the parent ("must belong to"); leave it nullable for an optional link (Rafiq Mia has no department).
- A junction table often carries its own data (date, fee, status), and then it is an entity in its own right, like \`appointments\`.
- One-to-one is often a sign the tables could be merged; keep them separate when the second part is optional, large, or has different access rules.`,
        explanationBn: `Relationship বোঝায়, একপাশের একটা row অন্যপাশের কতগুলো row-এর সাথে যুক্ত হতে পারে।

- **One-to-many (1:N)**: সবচেয়ে common। একটা department-এ অনেক doctor, কিন্তু একজন doctor একটাই department-এ। Foreign key বসে "many" দিকের table-এ, মানে \`doctors.department_id\`। উল্টো দিকে (department-এ doctor-এর list) রাখলে একটা cell-এ অনেক মান রাখতে হতো, যা 1NF ভাঙে।
- **One-to-one (1:1)**: FK-র উপর \`UNIQUE\` constraint। প্রতিটা appointment-এর payment সর্বোচ্চ একটা, তাই \`payments.appointment_id\` unique। একই appointment-এর দ্বিতীয় payment ঢোকাতে গেলে Postgres আটকে দেয়।
- **Many-to-many (M:N)**: সরাসরি সম্ভব না; মাঝে একটা **junction table** লাগে, যার দুটো FK থাকে। আমাদের \`appointments\` table-ই patient আর doctor-এর মাঝের সেতু, আর সাথে date, fee, status-এর মতো নিজস্ব তথ্যও রাখে।

Optional নাকি mandatory, সেটা ঠিক করে FK column-এর \`NOT NULL\`। Rafiq Mia-র \`department_id\` NULL, কারণ আমাদের design-এ department ছাড়া doctor থাকা সম্ভব।`,
        examples: [
          {
            lang: 'sql',
            caption: 'One-to-one is enforced by UNIQUE on the foreign key',
            code: `INSERT INTO payments (appointment_id, amount, method, paid_at)
VALUES (1, 100, 'cash', '2024-05-01 10:00');`,
            output: `ERROR:  duplicate key value violates unique constraint "payments_appointment_id_key"
DETAIL:  Key (appointment_id)=(1) already exists.`,
          },
          {
            lang: 'sql',
            caption: 'Many-to-many through the appointments junction table',
            code: `SELECT p.name AS patient,
       COUNT(DISTINCT a.doctor_id) AS doctors_seen
FROM patients AS p
JOIN appointments AS a ON a.patient_id = p.id
GROUP BY p.id, p.name
HAVING COUNT(DISTINCT a.doctor_id) >= 3
ORDER BY doctors_seen DESC, patient;`,
            resultTable: {
              columns: ['patient', 'doctors_seen'],
              rows: [['Ayesha Siddiqua', 3]],
            },
          },
        ],
        pitfalls: [
          'Storing a comma-separated list of ids in one column instead of a junction table: no FK checks, no indexes, painful queries.',
          'Forgetting the UNIQUE (or composite primary key) on a junction table lets the same pair be inserted twice.',
        ],
        followUps: [
          'What does ON DELETE CASCADE do, and when is it dangerous?',
          'How would you model a doctor having several specialties?',
        ],
      },
      related: ['sql-schema-design-approach', 'sql-normalization'],
    },
    {
      id: 'sql-normalization',
      level: 'intermediate',
      priority: 3,
      question: 'What is normalization? Explain 1NF, 2NF and 3NF.',
      tags: ['design', 'normalization', '1nf', '2nf', '3nf', 'anomalies'],
      answer: {
        interview: `**Normalization organizes tables so each fact is stored exactly once, which prevents update, insert and delete anomalies.**

- **1NF**: every column holds a single atomic value, no repeating groups (\`allergy1, allergy2\` or comma lists), and each row is identifiable by a key.
- **2NF**: 1NF, and every non-key column depends on the *whole* key, not part of a composite key. Only relevant with composite keys.
- **3NF**: 2NF, and non-key columns depend *only* on the key, not on other non-key columns (no transitive dependency). \`department_location\` in \`doctors\` would break it: it depends on \`department_id\`, not on the doctor.
- **BCNF**: a stricter 3NF where every determinant is a candidate key.

Rule of thumb: "every non-key column depends on the key, the whole key, and nothing but the key."

Real-world: OLTP schemas aim for 3NF; analytics schemas deliberately denormalize for read speed.`,
        explanationBn: `Normalization-এর মূল লক্ষ্য একটাই: **একটা তথ্য একটাই জায়গায় থাকবে।** একই তথ্য অনেক জায়গায় থাকলে কোথাও বদলাবে, কোথাও বদলাবে না, আর data নিজের সাথেই অমিল হয়ে যাবে। একে বলে **update anomaly**।

উদাহরণে প্রথমে একটা "flat" table বানানো হয়েছে, যেখানে প্রতিটা appointment-এর সাথে department-এর location-ও কপি করা। একটা row-এ Cardiology-র location বদলালে এখন Cardiology-র দুটো location: 13টা row-এ Building A, 1টায় Building Z। কোনটা সত্যি?

Normalized design-এ location থাকে শুধু \`departments\` table-এ, একবার। একটা \`UPDATE\` করলেই 14টা visit-ই নতুন location দেখায়।

ধাপগুলো:
- **1NF**: প্রতিটা cell-এ একটাই মান। "penicillin, sulfa" একটা text-এ না রেখে আলাদা row-এ রাখো। (আমাদের dataset-এ allergies JSONB array-এ আছে; এটা pragmatic, কিন্তু কঠোর অর্থে 1NF না। দরকার হলে \`jsonb_array_elements_text\` দিয়ে row-এ ভাঙা যায়।)
- **2NF**: composite key থাকলে, প্রতিটা column পুরো key-র উপর নির্ভর করবে। \`(doctor_id, specialty)\` key-এর table-এ \`doctor_name\` রাখলে সেটা শুধু \`doctor_id\`-এর উপর নির্ভর করে, তাই 2NF ভাঙে।
- **3NF**: non-key column অন্য non-key column-এর উপর নির্ভর করবে না। location নির্ভর করে department-এর উপর, doctor বা appointment-এর উপর না, তাই সেটা নিজের table-এ।

মনে রাখার লাইন: "the key, the whole key, and nothing but the key"।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Denormalized copy: one UPDATE leaves Cardiology with two locations',
            code: `CREATE TABLE visits_flat AS
SELECT a.id AS appointment_id, a.appointment_date, d.name AS doctor,
       dep.name AS department, dep.location
FROM appointments AS a
JOIN doctors AS d ON d.id = a.doctor_id
JOIN departments AS dep ON dep.id = d.department_id;

UPDATE visits_flat SET location = 'Building Z'
WHERE appointment_id = 1;

SELECT location, COUNT(*) AS visits
FROM visits_flat
WHERE department = 'Cardiology'
GROUP BY location
ORDER BY location;`,
            output: `SELECT 40
UPDATE 1`,
            resultTable: {
              columns: ['location', 'visits'],
              rows: [
                ['Building A', 13],
                ['Building Z', 1],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'Normalized: the fact lives in one row, so one UPDATE is enough',
            code: `UPDATE departments SET location = 'Building Z' WHERE name = 'Cardiology';

SELECT dep.location, COUNT(*) AS visits
FROM appointments AS a
JOIN doctors AS d ON d.id = a.doctor_id
JOIN departments AS dep ON dep.id = d.department_id
WHERE dep.name = 'Cardiology'
GROUP BY dep.location;`,
            output: `UPDATE 1`,
            resultTable: {
              columns: ['location', 'visits'],
              rows: [['Building Z', 14]],
            },
          },
          {
            lang: 'sql',
            caption: 'Back to 1NF: one allergy per row',
            code: `SELECT p.name, allergy
FROM patients AS p,
     jsonb_array_elements_text(p.metadata->'allergies') AS allergy
ORDER BY p.name, allergy;`,
            resultTable: {
              columns: ['name', 'allergy'],
              rows: [
                ['Ayesha Siddiqua', 'penicillin'],
                ['Jamal Hossain', 'aspirin'],
                ['Mim Akter', 'penicillin'],
                ['Nadia Karim', 'latex'],
                ['Nadia Karim', 'peanuts'],
                ['Rupa Das', 'penicillin'],
                ['Rupa Das', 'sulfa'],
                ['Sumaiya Islam', 'latex'],
              ],
            },
          },
        ],
        pitfalls: [
          'Over-normalizing lookups (a table for every two-value field) adds joins with no integrity benefit; a CHECK or enum is often enough.',
          '2NF only matters for composite keys; a table with a single-column key that is in 1NF is automatically in 2NF.',
        ],
        followUps: [
          'When would you denormalize on purpose?',
          'What are insert and delete anomalies?',
          'What is BCNF, and how is it different from 3NF?',
        ],
      },
      related: ['sql-denormalization', 'sql-relationship-types'],
    },
    {
      id: 'sql-denormalization',
      level: 'intermediate',
      priority: 2,
      question: 'What is denormalization, and when would you choose it over a normalized design?',
      tags: ['design', 'denormalization', 'performance', 'trade-offs'],
      answer: {
        interview: `**Denormalization deliberately stores redundant or precomputed data to make reads faster or simpler, accepting extra write cost and the risk of inconsistency.**

| Aspect | Normalized | Denormalized |
| --- | --- | --- |
| Each fact stored | Once | Possibly many times |
| Reads | More joins | Fewer joins, precomputed values |
| Writes | Simple, one place | Must update every copy |
| Consistency | Guaranteed by design | Must be maintained (triggers, jobs, app code) |
| Typical use | OLTP: orders, bookings, payments | Reporting, dashboards, read-heavy feeds |

- Normalize first, then denormalize a *measured* hot path.
- Common forms: cached counters (\`visit_count\`), copied columns (customer name on an invoice), summary tables, materialized views, JSON documents for read models.
- Some copies are correct by design, not redundancy: the price *at the time of sale* on an order line must not change when the product price changes.`,
        explanationBn: `Normalization data-কে পরিষ্কার রাখে, কিন্তু পড়ার সময় অনেক JOIN লাগে। খুব বেশি পড়া হয় এমন জায়গায় সেই JOIN বা হিসাব বারবার করা খরচসাপেক্ষ। **Denormalization** মানে জেনেবুঝে কিছু তথ্য কপি বা আগেই হিসাব করে রাখা।

উদাহরণে \`patients\`-এ \`visit_count\` column যোগ করা হয়েছে। এখন "কে সবচেয়ে বেশি এসেছে" দেখাতে \`appointments\` গুনতে হয় না। কিন্তু দাম আছে: প্রতিবার appointment যোগ বা মুছলে এই সংখ্যাটাও ঠিক করতে হবে (trigger, background job বা application code দিয়ে)। ভুলে গেলে সংখ্যাটা মিথ্যা হয়ে যাবে।

Analogy: রান্নাঘরে লবণের একটা ছোট কৌটা রাখা, যদিও বড় বস্তাটা store room-এ আছে। হাতের কাছে পাওয়া সহজ, কিন্তু খেয়াল রাখতে হয় কৌটা খালি হলো কিনা।

একটা গুরুত্বপূর্ণ পার্থক্য: invoice-এ বিক্রির সময়ের দাম কপি রাখা denormalization না, সেটা আলাদা একটা তথ্য ("তখনকার দাম")। Product-এর দাম পরে বদলালেও পুরনো invoice বদলানো উচিত না।

Interview-এ বলার মতো নিয়ম: আগে normalize করো, তারপর profiling-এ যেটা সত্যিই ধীর, শুধু সেটা denormalize করো।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A cached counter: fast to read, but every new appointment must update it',
            code: `ALTER TABLE patients ADD COLUMN visit_count int NOT NULL DEFAULT 0;
UPDATE patients AS p
SET visit_count = (SELECT COUNT(*) FROM appointments AS a WHERE a.patient_id = p.id);
SELECT name, visit_count FROM patients ORDER BY visit_count DESC, id LIMIT 3;`,
            output: `ALTER TABLE
UPDATE 14`,
            resultTable: {
              columns: ['name', 'visit_count'],
              rows: [
                ['Sabbir Hasan', 8],
                ['Ayesha Siddiqua', 5],
                ['Jamal Hossain', 4],
              ],
            },
          },
        ],
        pitfalls: [
          'Denormalizing before measuring: you pay the consistency cost for a speed-up you may not need.',
          'Updating copies from application code only: any write that bypasses that code path leaves stale data.',
        ],
        followUps: [
          'What is a materialized view, and how is it refreshed?',
          'How would you keep visit_count correct automatically?',
        ],
      },
      related: ['sql-normalization', 'sql-oltp-vs-olap'],
    },
    {
      id: 'sql-surrogate-vs-natural-key',
      level: 'intermediate',
      priority: 2,
      question:
        'What is the difference between a surrogate key and a natural key? Which would you use?',
      tags: ['design', 'primary-key', 'surrogate-key', 'natural-key', 'identity'],
      answer: {
        interview: `**A natural key is a real-world attribute that identifies a row (national ID, email, medicine code); a surrogate key is a meaningless generated value (identity integer or UUID) used only as the identifier.**

| Aspect | Natural key | Surrogate key |
| --- | --- | --- |
| Meaning | Business data | None |
| Can change? | Yes (emails, codes change) | Never |
| Size in FKs and indexes | Often wide (text, composite) | Small (\`int\`/\`bigint\`, 16-byte UUID) |
| Prevents duplicates | Yes, by definition | No, needs an extra \`UNIQUE\` |
| Examples | \`code 'AMX500'\`, ISBN | \`id int GENERATED ALWAYS AS IDENTITY\` |

My default: a surrogate primary key **plus** a \`UNIQUE\` constraint on the natural key. That keeps joins small and stable while still blocking duplicates.

In PostgreSQL prefer \`GENERATED ALWAYS AS IDENTITY\` (SQL standard) over \`serial\`; use UUIDs (v7 for index locality) when ids are created outside the database or must not be guessable.`,
        explanationBn: `**Natural key** বাস্তব জগতের কোনো তথ্য, যেটা নিজেই row-কে আলাদা করে চেনায়: medicine-এর code, বইয়ের ISBN। **Surrogate key** একটা অর্থহীন নম্বর, database বানিয়ে দেয় (\`1, 2, 3...\`), শুধু row চেনানোর জন্য।

কেন বেশিরভাগ সময় surrogate key primary key হয়:
- বাস্তবের তথ্য বদলায়। email বদলালে সেটা যদি primary key হতো, তাহলে যত table-এ FK হিসেবে আছে, সব জায়গায় বদলাতে হতো।
- ছোট integer দিয়ে JOIN আর index দ্রুত।

কিন্তু surrogate key duplicate আটকায় না! আমাদের dataset-এ Rahim Uddin দুবার আছে (id 2 আর 8): একই নাম, জন্মতারিখ, শহর। id আলাদা হওয়ায় database কিছু বলেনি। তাই natural key-এর উপর \`UNIQUE\` constraint রাখা দরকার, যেমন \`medicines.code\`-এ রাখা হয়েছে।

\`GENERATED ALWAYS AS IDENTITY\`: ভুল করে হাতে id দিলে Postgres আটকে দেয়, তাই sequence-এর সাথে সংঘর্ষ হয় না। \`BY DEFAULT\` হাতে id দিতে দেয় (আমাদের seed এটা ব্যবহার করে, পরে \`setval\` দিয়ে sequence ঠিক করে)।`,
        examples: [
          {
            lang: 'sql',
            caption: 'The identity column fills the id; RETURNING shows it',
            code: `INSERT INTO departments (name, location, budget)
VALUES ('Radiology', 'Building D', 900000)
RETURNING id, name;`,
            resultTable: {
              columns: ['id', 'name'],
              rows: [[7, 'Radiology']],
            },
          },
          {
            lang: 'sql',
            caption: 'Surrogate PK plus UNIQUE natural key; ALWAYS rejects hand-written ids',
            code: `CREATE TABLE medicines (
  id    int  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code  text NOT NULL UNIQUE,
  name  text NOT NULL
);
INSERT INTO medicines (code, name) VALUES ('AMX500', 'Amoxicillin 500mg');
INSERT INTO medicines (id, code, name) VALUES (99, 'PCM500', 'Paracetamol 500mg');`,
            output: `CREATE TABLE
INSERT 0 1
ERROR:  cannot insert a non-DEFAULT value into column "id"
DETAIL:  Column "id" is an identity column defined as GENERATED ALWAYS.
HINT:  Use OVERRIDING SYSTEM VALUE to override.`,
          },
          {
            lang: 'sql',
            caption: 'Without a natural unique key, the same person was stored twice',
            code: `SELECT id, name, birth_date, city FROM patients WHERE name = 'Rahim Uddin' ORDER BY id;`,
            resultTable: {
              columns: ['id', 'name', 'birth_date', 'city'],
              rows: [
                [2, 'Rahim Uddin', '1985-07-30', 'Chattogram'],
                [8, 'Rahim Uddin', '1985-07-30', 'Chattogram'],
              ],
            },
          },
        ],
        pitfalls: [
          'A surrogate key alone does not stop duplicate business records; add UNIQUE on the natural key.',
          'Random UUIDv4 primary keys scatter inserts across the B-tree; prefer UUIDv7 or bigint identity for large tables.',
          'serial is legacy: its sequence is a separate object with looser ownership and permission rules.',
        ],
        followUps: [
          'When would you choose a UUID over an integer id?',
          'What is a composite key, and when is it the right primary key?',
        ],
      },
      related: ['sql-relationship-types', 'sql-schema-design-approach'],
    },
    {
      id: 'sql-oltp-vs-olap',
      level: 'intermediate',
      priority: 1,
      question: 'What is the difference between OLTP and OLAP?',
      tags: ['design', 'oltp', 'olap', 'data-warehouse'],
      answer: {
        interview: `**OLTP systems run the business with many small, concurrent reads and writes; OLAP systems analyze it with fewer, large read-only queries over history.**

| Aspect | OLTP | OLAP |
| --- | --- | --- |
| Purpose | Day-to-day operations | Reporting and analytics |
| Typical query | Touch a few rows by key | Scan and aggregate millions of rows |
| Writes | Constant inserts and updates | Bulk loads (ETL/ELT), mostly append |
| Schema | Normalized (3NF) | Denormalized: star or snowflake |
| Storage | Row-oriented | Usually columnar |
| Priority | Low latency, concurrency, ACID | Throughput on big scans |
| Examples | PostgreSQL, MySQL | BigQuery, Snowflake, ClickHouse, Redshift |

Real-world: the clinic app books appointments in PostgreSQL (OLTP); nightly jobs copy the data to a warehouse where finance runs revenue-by-age-group reports (OLAP).`,
        explanationBn: `**OLTP (Online Transaction Processing)**: দোকানের ক্যাশ কাউন্টার। প্রতি মুহূর্তে ছোট ছোট কাজ: একটা appointment book, একটা status update, একটা payment। প্রতিটা কাজ কয়েকটা row ছোঁয়, কিন্তু একসাথে হাজারো user, তাই দ্রুত response আর ACID সবচেয়ে জরুরি।

**OLAP (Online Analytical Processing)**: মাস শেষে হিসাবরক্ষকের টেবিল। প্রশ্নগুলো বড়: "কোন বয়সের রোগী গড়ে কত fee দেয়?" এমন query লাখো row পড়ে aggregate করে, কিন্তু খুব কম বার চলে।

কেন একই database-এ দুটো না করা ভালো: বড় analytics query CPU আর disk দখল করে, তখন booking ধীর হয়ে যায়। তাই data সাধারণত ETL দিয়ে আলাদা **data warehouse**-এ যায়। Warehouse-গুলো **columnar storage** ব্যবহার করে: একটা column-এর সব মান পাশাপাশি থাকে, ফলে "শুধু fee column-এর গড়" পড়তে পুরো row পড়তে হয় না, আর compression-ও ভালো হয়।

ছোট system-এ PostgreSQL-এই দুটো চলতে পারে; read replica-তে report চালানো একটা মাঝামাঝি সমাধান।`,
        examples: [
          {
            lang: 'sql',
            caption: 'OLTP: change one row by key and return it',
            code: `UPDATE appointments SET status = 'completed'
WHERE id = 40
RETURNING id, patient_id, appointment_date, status;`,
            resultTable: {
              columns: ['id', 'patient_id', 'appointment_date', 'status'],
              rows: [[40, 14, '2024-04-30', 'completed']],
            },
          },
          {
            lang: 'sql',
            caption: 'OLAP: scan everything and aggregate by a derived dimension',
            code: `SELECT EXTRACT(YEAR FROM age(DATE '2024-12-31', p.birth_date))::int / 10 * 10 AS age_band,
       COUNT(*) AS visits,
       ROUND(AVG(a.fee), 2) AS avg_fee
FROM appointments AS a
JOIN patients AS p ON p.id = a.patient_id
WHERE a.status = 'completed'
GROUP BY age_band
ORDER BY age_band;`,
            resultTable: {
              columns: ['age_band', 'visits', 'avg_fee'],
              rows: [
                [0, 1, '800.00'],
                [10, 1, '800.00'],
                [20, 8, '1175.00'],
                [30, 8, '1587.50'],
                [40, 8, '1125.00'],
                [50, 1, '1300.00'],
                [60, 3, '1000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Running heavy reports on the primary OLTP database at peak hours slows every user.',
          'Copying a 3NF OLTP schema 1:1 into a warehouse loses most of the benefit of a dimensional model.',
        ],
        followUps: ['What is a star schema?', 'What is the difference between ETL and ELT?'],
      },
      related: ['sql-star-vs-snowflake', 'sql-denormalization'],
    },
    {
      id: 'sql-schema-design-approach',
      level: 'advanced',
      priority: 2,
      question:
        'How would you approach designing a database schema, for example for a clinic booking system?',
      tags: ['design', 'schema-design', 'constraints', 'junction-table'],
      answer: {
        interview: `**Start from the entities and the questions the system must answer, model relationships with keys, then let constraints enforce the business rules.**

1. **Entities and attributes**: departments, doctors, patients, appointments, prescriptions, payments.
2. **Relationships and cardinality**: department 1:N doctors; patients M:N doctors through \`appointments\`; appointment 1:N prescriptions; appointment 1:0..1 payment.
3. **Keys**: identity surrogate keys, \`UNIQUE\` on natural keys, composite PKs on pure junction tables.
4. **Constraints as rules**: \`NOT NULL\`, \`CHECK (fee >= 0)\`, enums for status, FKs with a deliberate \`ON DELETE\` (\`RESTRICT\` for money, \`CASCADE\` for owned children).
5. **Types**: \`numeric\` for money, \`date\`/\`timestamptz\` for time, \`jsonb\` only for genuinely flexible attributes.
6. **Access patterns**: index FKs and frequent filters (\`appointments (doctor_id, appointment_date)\`); normalize to 3NF, denormalize only measured hot paths.
7. **Evolution**: migrations, soft delete or history tables if audits are needed.

Say your assumptions out loud: can a doctor be in two departments? Can an appointment be paid in instalments? Each answer changes a relationship.`,
        explanationBn: `Schema design প্রশ্নে interviewer দেখতে চায় তুমি কীভাবে চিন্তা করো, শুধু table-এর নাম না।

প্রথমে **noun** খোঁজো: department, doctor, patient, appointment... এগুলো entity, মানে table। তারপর প্রতিটা জোড়ার মধ্যে প্রশ্ন করো: "একটা A-র কতগুলো B থাকতে পারে, আর উল্টোটা?" উত্তর থেকেই 1:N, M:N, 1:1 বেরিয়ে আসে, আর সেটা থেকেই FK কোথায় বসবে।

তারপর **business rule-কে constraint বানাও**। Rule যদি শুধু application code-এ থাকে, তাহলে কোনো script বা অন্য service সেটা ভেঙে ফেলতে পারে। Database-এ রাখলে সবাই মানতে বাধ্য। উদাহরণে \`doctor_specialties\` junction table-এ composite primary key \`(doctor_id, specialty)\`, তাই একই specialty দুবার যোগ করা যায় না।

**Assumption** বলাটা খুব গুরুত্বপূর্ণ। "একজন doctor কি দুই department-এ কাজ করতে পারে?" হ্যাঁ হলে \`doctors.department_id\` আর চলবে না, একটা \`doctor_departments\` junction table লাগবে। Interviewer প্রায়ই এই requirement বদলে দেখে তুমি design কীভাবে মানিয়ে নাও।

শেষে **query pattern** দেখো: কোন screen-এ কোন query চলবে, সেই অনুযায়ী index।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A many-to-many junction table with a composite primary key',
            code: `CREATE TABLE doctor_specialties (
  doctor_id  int  NOT NULL REFERENCES doctors (id) ON DELETE CASCADE,
  specialty  text NOT NULL,
  PRIMARY KEY (doctor_id, specialty)
);
INSERT INTO doctor_specialties VALUES (1, 'Echocardiography'), (1, 'Heart failure');
INSERT INTO doctor_specialties VALUES (1, 'Heart failure');`,
            output: `CREATE TABLE
INSERT 0 2
ERROR:  duplicate key value violates unique constraint "doctor_specialties_pkey"
DETAIL:  Key (doctor_id, specialty)=(1, Heart failure) already exists.`,
          },
        ],
        pitfalls: [
          'Jumping to tables before clarifying requirements; the cardinality questions are what the interviewer is grading.',
          'Using float for money: use numeric(12,2) or integer minor units.',
          'Putting every optional attribute in one JSONB blob: you lose types, constraints and simple indexing.',
        ],
        followUps: [
          'How would you prevent double-booking a doctor for the same slot?',
          'How would you keep a history of status changes?',
          'Which indexes would you add first?',
        ],
      },
      related: ['sql-relationship-types', 'sql-normalization', 'sql-surrogate-vs-natural-key'],
    },
    {
      id: 'sql-star-vs-snowflake',
      level: 'advanced',
      priority: 1,
      question: 'What are star and snowflake schemas? What are fact and dimension tables?',
      tags: ['design', 'data-warehouse', 'star-schema', 'snowflake-schema', 'olap'],
      answer: {
        interview: `**Both are dimensional models for analytics: a central fact table of measurable events surrounded by dimension tables that describe them; a snowflake normalizes the dimensions further.**

- **Fact table**: one row per event at a declared *grain* (one completed appointment), holding measures (\`fee\`, \`duration\`) and FKs to dimensions. Very tall.
- **Dimension table**: descriptive context to filter and group by: date, doctor, patient, department. Wide and relatively small.

| Aspect | Star | Snowflake |
| --- | --- | --- |
| Dimensions | Denormalized: \`dim_doctor\` includes department name and location | Normalized: \`dim_doctor → dim_department\` |
| Joins per query | One per dimension | More, through dimension chains |
| Query simplicity | Simpler, usually faster | More complex |
| Storage / redundancy | More repetition in dimensions | Less |
| Typical choice | Default for BI tools | Very large or shared dimensions |

Real-world: "revenue by department by month" is a fact table joined to the doctor and date dimensions, grouped with \`ROLLUP\` for subtotals.`,
        explanationBn: `Data warehouse-এ data সাজানো হয় প্রশ্নের সুবিধা অনুযায়ী, OLTP-র মতো normalization অনুযায়ী না।

- **Fact table** হলো ঘটনার খাতা: প্রতিটা completed appointment একটা row, সাথে সংখ্যা (fee) আর বিভিন্ন dimension-এর key। কোটি কোটি row হতে পারে। শুরুতেই **grain** ঠিক করতে হয়: একটা row মানে ঠিক কী? (একটা visit? নাকি দিনে একটা doctor?)
- **Dimension table** হলো সেই ঘটনার "কে, কোথায়, কখন": doctor, department, patient, date। এদের দিয়েই filter আর group করা হয়।

**Star schema**-য় fact table মাঝখানে, চারপাশে সরাসরি dimension, তারার মতো। Dimension গুলো denormalized: \`dim_doctor\`-এর ভেতরেই department-এর নাম আর location। এক JOIN-এ সব পাওয়া যায়।

**Snowflake**-এ dimension-ও normalized: doctor → department → building। দেখতে বরফকণার মতো শাখা-প্রশাখা। জায়গা কম লাগে, কিন্তু query-তে JOIN বেশি।

উদাহরণের query-টা star-style প্রশ্ন: department আর month ধরে visit আর revenue, সাথে \`ROLLUP\` দিয়ে department-এর subtotal (month NULL) আর সব মিলিয়ে grand total (দুটোই NULL)।`,
        examples: [
          {
            lang: 'sql',
            caption:
              'A typical dimensional query: measures by two dimensions, with ROLLUP subtotals',
            code: `SELECT dep.name AS department,
       date_trunc('month', a.appointment_date)::date AS month,
       COUNT(*) AS visits,
       SUM(a.fee) AS revenue
FROM appointments AS a
JOIN doctors AS d ON d.id = a.doctor_id
JOIN departments AS dep ON dep.id = d.department_id
WHERE a.status = 'completed' AND dep.name IN ('Cardiology', 'Neurology')
GROUP BY ROLLUP (dep.name, month)
ORDER BY department NULLS LAST, month NULLS LAST;`,
            resultTable: {
              columns: ['department', 'month', 'visits', 'revenue'],
              rows: [
                ['Cardiology', '2024-01-01', 2, '2500.00'],
                ['Cardiology', '2024-02-01', 3, '3500.00'],
                ['Cardiology', '2024-03-01', 1, '1500.00'],
                ['Cardiology', '2024-04-01', 4, '4200.00'],
                ['Cardiology', null, 10, '11700.00'],
                ['Neurology', '2024-01-01', 2, '3200.00'],
                ['Neurology', '2024-02-01', 2, '3200.00'],
                ['Neurology', '2024-03-01', 1, '2000.00'],
                ['Neurology', '2024-04-01', 2, '3200.00'],
                ['Neurology', null, 7, '11600.00'],
                [null, null, 17, '23300.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Mixing grains in one fact table (some rows per visit, some per day) makes every SUM wrong.',
          'NULL from ROLLUP means "all values" in that row; use GROUPING() to tell it apart from a real NULL.',
        ],
        followUps: [
          'What is a slowly changing dimension (SCD Type 2)?',
          'What is the difference between ROLLUP, CUBE and GROUPING SETS?',
        ],
      },
      related: ['sql-oltp-vs-olap', 'sql-denormalization'],
    },
  ],
});

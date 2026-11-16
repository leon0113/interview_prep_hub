import { defineSection } from '../../define';

export const constraints = defineSection({
  id: 'sql-constraints',
  title: 'Keys & Constraints',
  description:
    'Primary keys and UNIQUE, foreign keys and ON DELETE rules, NOT NULL and CHECK, the kinds of keys, and adding constraints to a live table.',
  order: 6,
  questions: [
    {
      id: 'sql-primary-key-vs-unique',
      level: 'foundation',
      priority: 3,
      question: 'What is a primary key, and how is it different from a UNIQUE constraint?',
      tags: ['primary-key', 'unique', 'constraints', 'indexes'],
      answer: {
        interview: `**A primary key is the column (or columns) that identifies each row: unique and never NULL, one per table. A UNIQUE constraint also forbids duplicates, but a table can have many and they allow NULLs.**

| Aspect | PRIMARY KEY | UNIQUE |
| --- | --- | --- |
| Per table | One | Any number |
| NULLs | Not allowed | Allowed; by default multiple NULLs are fine (\`NULLS NOT DISTINCT\` in PG 15+ changes that) |
| Purpose | Row identity; target of foreign keys | Business rules: email, code, name |
| Index | Unique B-tree, created automatically | Unique B-tree, created automatically |
| Referenced by FKs | Usually | Also allowed |

In the clinic: \`departments.id\` is the primary key, and \`departments.name\` is UNIQUE, so a second "Cardiology" is rejected.`,
        explanationBn: `**Primary key** হলো প্রতিটা row-এর পরিচয়পত্র নম্বর: প্রতিটা আলাদা, কখনো ফাঁকা (NULL) না, আর table-প্রতি একটাই। অন্য table এই নম্বর দিয়েই এই row-কে খুঁজে নেয় (foreign key)।

**UNIQUE** বলে "এই column-এ একই মান দুইবার থাকবে না", যেমন email বা department-এর নাম। একটা table-এ অনেক UNIQUE থাকতে পারে, আর NULL চলে। একাধিক NULL-ও চলে, কারণ NULL = NULL সত্য না। আমাদের তিনজন doctor-এর email NULL, তবুও \`email UNIQUE\` ভাঙেনি।

দুটোই নিজে থেকে একটা unique index বানায়, তাই এগুলো দিয়ে খোঁজাও দ্রুত। উদাহরণে দ্বিতীয় "Cardiology" ঢোকাতে গেলে UNIQUE constraint আটকে দিয়েছে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'UNIQUE rejects a second department with the same name',
            code: `INSERT INTO departments (name, location, budget)
VALUES ('Cardiology', 'Building A', 1);`,
            output: `ERROR:  duplicate key value violates unique constraint "departments_name_key"
DETAIL:  Key (name)=(Cardiology) already exists.`,
          },
        ],
        pitfalls: [
          'Expecting UNIQUE to stop several NULLs: it doesn’t, unless you use NULLS NOT DISTINCT or a partial index.',
          'Using a changeable business value (email) as the primary key: every foreign key must change with it.',
        ],
        followUps: [
          'What is the difference between a surrogate and a natural key?',
          'What is a composite primary key?',
        ],
      },
      related: ['sql-surrogate-vs-natural-key', 'sql-key-kinds', 'sql-btree-clustered-index'],
    },
    {
      id: 'sql-foreign-key-on-delete',
      level: 'foundation',
      priority: 3,
      question: 'What is a foreign key, and what do the ON DELETE options do?',
      tags: ['foreign-key', 'on-delete', 'cascade', 'referential-integrity'],
      answer: {
        interview: `**A foreign key says a column's values must exist in another table's key (referential integrity); ON DELETE decides what happens to the child rows when the parent row is deleted.**

| Option | When the parent is deleted | Typical use |
| --- | --- | --- |
| \`NO ACTION\` (default) / \`RESTRICT\` | The delete fails while children exist | Records you must not lose (patients with appointments) |
| \`CASCADE\` | Children are deleted too | Owned data (an appointment's prescriptions, payments) |
| \`SET NULL\` | Child column becomes NULL | Optional links (a doctor's department) |
| \`SET DEFAULT\` | Child column gets its default | Rare |

\`NO ACTION\` checks at the end of the statement (and can be deferred); \`RESTRICT\` checks immediately. \`ON UPDATE\` works the same way for key changes. PostgreSQL does not index the child column automatically: add an index, or every parent delete scans the child table.`,
        explanationBn: `Foreign key বলে: "এই column-এর মান অবশ্যই ওই table-এ থাকতে হবে।" যে department নেই, তার id দিয়ে doctor ঢোকানো যায় না।

প্রশ্ন হলো, parent row মুছে ফেললে child row-গুলোর কী হবে? আমাদের clinic-এ তিনটা আলাদা নিয়ম আছে, আর তিনটা উদাহরণে তিনটাই দেখা যাচ্ছে:

- **appointments → patients: NO ACTION (default)**। Ayesha-র appointment আছে, তাই তাকে মুছতে দেওয়া হয়নি। রোগীর ইতিহাস হারিয়ে যাওয়া চলবে না।
- **doctors → departments: SET NULL**। Dermatology মুছলে Dr. Imran থেকে যান, শুধু তার department NULL হয়।
- **prescriptions/payments → appointments: CASCADE**। Appointment 1 মুছলে তার 2টা prescription আর 1টা payment-ও মুছে যায়: 22 থেকে 20, আর 28 থেকে 27।

কোন নিয়ম বাছবে সেটা business-এর প্রশ্ন: child কি parent ছাড়া অর্থবহ?`,
        examples: [
          {
            lang: 'sql',
            caption: 'NO ACTION: a patient with appointments cannot be deleted',
            code: `DELETE FROM patients WHERE id = 1;`,
            output: `ERROR:  update or delete on table "patients" violates foreign key constraint "appointments_patient_id_fkey" on table "appointments"
DETAIL:  Key (id)=(1) is still referenced from table "appointments".`,
          },
          {
            lang: 'sql',
            caption: 'SET NULL: the doctor stays, without a department',
            code: `DELETE FROM departments WHERE name = 'Dermatology';
SELECT name, department_id FROM doctors WHERE id = 8;`,
            output: `DELETE 1`,
            resultTable: { columns: ['name', 'department_id'], rows: [['Dr. Imran Kabir', null]] },
          },
          {
            lang: 'sql',
            caption: 'CASCADE: deleting an appointment deletes its prescriptions and payment',
            code: `DELETE FROM appointments WHERE id = 1;
SELECT (SELECT COUNT(*) FROM prescriptions) AS prescriptions,
       (SELECT COUNT(*) FROM payments) AS payments;`,
            output: `DELETE 1`,
            resultTable: { columns: ['prescriptions', 'payments'], rows: [[20, 27]] },
          },
        ],
        pitfalls: [
          'CASCADE chains can delete far more than expected; reserve it for data that is truly owned.',
          'Missing index on the foreign key column: deleting a parent scans the whole child table.',
        ],
        followUps: [
          'Why should foreign key columns be indexed?',
          'What is a deferrable constraint?',
        ],
      },
      related: ['sql-what-is-database', 'sql-relationship-types', 'sql-delete-truncate-drop'],
    },
    {
      id: 'sql-not-null-check',
      level: 'foundation',
      priority: 2,
      question: 'What do NOT NULL and CHECK constraints do?',
      tags: ['not-null', 'check', 'constraints', 'data-integrity'],
      answer: {
        interview: `**NOT NULL forbids missing values in a column; CHECK enforces a boolean rule on each row, such as \`salary > 0\` or \`gender IN ('F', 'M')\`.**

- A CHECK passes when its expression is true **or NULL**: combine with NOT NULL if the value is required.
- A CHECK can compare columns of the same row (\`end_date >= start_date\`) but cannot look at other rows or tables (use a foreign key, a unique constraint, an exclusion constraint or a trigger for that).
- Constraints in the database protect the data from every code path: the app, scripts, migrations, admin tools.

The clinic uses \`CHECK (budget >= 0)\`, \`CHECK (gender IN ('F', 'M'))\`, \`CHECK (amount > 0)\` and NOT NULL on required fields.`,
        explanationBn: `**NOT NULL**: এই ঘর ফাঁকা রাখা যাবে না। Department-এর budget দেওয়া বাধ্যতামূলক, তাই budget ছাড়া Radiology ঢোকানো যায়নি। Error-এ পুরো row-টাও দেখানো হয়েছে, id 7 সহ।

**CHECK**: প্রতিটা row-কে একটা শর্ত মানতে হবে। রোগীর gender শুধু 'F' বা 'M' হতে পারে, তাই 'X' দিলে error।

একটা সূক্ষ্ম ব্যাপার: CHECK-এর শর্ত NULL হলে (অজানা) সেটা পাশ ধরা হয়। তাই "মান থাকতেই হবে আর সঠিক হতে হবে" চাইলে NOT NULL আর CHECK দুটোই লাগে।

এই নিয়ম database-এ রাখার লাভ: application, script, admin panel, যেই লিখুক, ভুল data ঢুকতে পারবে না।`,
        examples: [
          {
            lang: 'sql',
            caption: 'NOT NULL: a department needs a budget',
            code: `INSERT INTO departments (name, location) VALUES ('Radiology', 'Building D');`,
            output: `ERROR:  null value in column "budget" of relation "departments" violates not-null constraint
DETAIL:  Failing row contains (7, Radiology, Building D, null).`,
          },
          {
            lang: 'sql',
            caption: "CHECK: gender must be 'F' or 'M'",
            code: `INSERT INTO patients (name, gender, birth_date, signup_date)
VALUES ('Test Patient', 'X', '2000-01-01', '2024-05-01');`,
            output: `ERROR:  new row for relation "patients" violates check constraint "patients_gender_check"
DETAIL:  Failing row contains (15, Test Patient, X, 2000-01-01, null, 2024-05-01, {}).`,
          },
        ],
        pitfalls: [
          'A CHECK alone does not reject NULL.',
          'Trying to enforce cross-row rules (no overlapping bookings) with CHECK; use an exclusion constraint.',
          'Failed inserts still consume identity values: the next row will not get id 7.',
        ],
        followUps: [
          'How would you prevent two bookings for the same doctor at overlapping times?',
          'Enum, CHECK or lookup table?',
        ],
      },
      related: ['sql-enum-vs-check', 'sql-acid'],
    },
    {
      id: 'sql-key-kinds',
      level: 'intermediate',
      priority: 2,
      question: 'What are super keys, candidate keys, alternate keys and composite keys?',
      tags: ['keys', 'candidate-key', 'composite-key', 'design', 'theory'],
      answer: {
        interview: `**They describe which column sets can identify a row.**

| Key | Definition | Clinic example |
| --- | --- | --- |
| Super key | Any set of columns that uniquely identifies a row | \`(id)\`, \`(id, name)\`, \`(email)\` on doctors |
| Candidate key | A minimal super key: remove any column and it stops being unique | \`id\`, \`email\` on doctors |
| Primary key | The candidate key chosen as the main identifier | \`doctors.id\` |
| Alternate key | A candidate key not chosen as primary; enforce with UNIQUE | \`doctors.email\`, \`departments.name\` |
| Composite key | A key made of two or more columns | \`(doctor_id, specialty)\` in a junction table |
| Foreign key | Column(s) referencing another table's key | \`doctors.department_id\` |

Normalization (2NF, 3NF) is defined in terms of candidate keys, so this vocabulary comes up in design questions.`,
        explanationBn: `সব "key"-এর মূল প্রশ্ন: কোন column (বা column-এর দল) দিয়ে একটা row-কে নিশ্চিতভাবে চেনা যায়?

- **Super key**: যেকোনো দল যেটা row চেনাতে পারে, অপ্রয়োজনীয় column থাকলেও। \`(id, name)\` চেনায়, কিন্তু name বাড়তি।
- **Candidate key**: সবচেয়ে ছোট দল যেটা চেনায়, কিছু বাদ দিলে আর চেনাতে পারে না। doctors-এ \`id\` আর \`email\` দুটোই candidate (email-এ NULL থাকায় বাস্তবে এটা পুরো key না, UNIQUE হিসেবে আছে)।
- **Primary key**: candidate গুলোর মধ্যে যেটা বেছে নেওয়া হয়েছে।
- **Alternate key**: বাকি candidate গুলো, UNIQUE দিয়ে রক্ষা করা হয়।
- **Composite key**: একাধিক column মিলে একটা key, যেমন junction table-এ \`(doctor_id, specialty)\`।

Normalization-এর সংজ্ঞা এই শব্দগুলো দিয়েই লেখা, তাই design প্রশ্নে কাজে লাগে।`,
        pitfalls: [
          'Calling every unique column a primary key.',
          'A nullable unique column (doctors.email) is not a true candidate key: two rows can both be NULL.',
        ],
        followUps: ['What is normalization?', 'When is a composite primary key the right choice?'],
      },
      related: ['sql-primary-key-vs-unique', 'sql-normalization', 'sql-surrogate-vs-natural-key'],
    },
    {
      id: 'sql-add-constraint-safely',
      level: 'advanced',
      priority: 1,
      question: 'How do you add a constraint to a large, live table without long locks?',
      tags: ['constraints', 'migrations', 'not-valid', 'locking', 'deferrable'],
      answer: {
        interview: `**Add the constraint as \`NOT VALID\` (fast: only new and changed rows are checked), then run \`VALIDATE CONSTRAINT\` separately, which checks existing rows under a weaker lock that does not block reads or writes.**

- Works for CHECK and FOREIGN KEY constraints.
- For UNIQUE: \`CREATE UNIQUE INDEX CONCURRENTLY\`, then \`ALTER TABLE … ADD CONSTRAINT … UNIQUE USING INDEX\`.
- For NOT NULL on a big table: add a \`CHECK (col IS NOT NULL) NOT VALID\`, validate it, then \`SET NOT NULL\` (PostgreSQL 12+ uses the validated check to skip the full scan).
- Fix the bad rows first, or validation fails.
- **DEFERRABLE INITIALLY DEFERRED** constraints are checked at COMMIT instead of per statement, which is useful for circular references or swapping unique values inside one transaction.`,
        explanationBn: `বড় table-এ সরাসরি \`ADD CONSTRAINT\` দিলে Postgres পুরো table check করে, আর সেই সময় table-এ লেখা আটকে থাকে। লাখো row হলে কয়েক মিনিট app বন্ধ!

কৌশল দুই ধাপে:
1. \`NOT VALID\` দিয়ে যোগ করো: সাথে সাথে শেষ হয়, পুরনো row check হয় না, কিন্তু এখন থেকে নতুন বা বদলানো row-কে নিয়ম মানতে হবে।
2. পরে \`VALIDATE CONSTRAINT\`: পুরনো row গুলো check করে, কিন্তু হালকা lock নিয়ে, তাই app চলতে থাকে।

উদাহরণে doctors-এর email-এ "@" থাকতে হবে এমন নিয়ম যোগ করা হয়েছে। সব email-এ @ আছে (আর NULL গুলো CHECK পাশ করে), তাই validation সফল।

**Deferrable** constraint transaction-এর শেষে (COMMIT-এ) check হয়, প্রতিটা statement-এর পরে না। দুই row-এর unique মান অদলবদল করতে বা দুই table-এ একে অপরকে reference করে এমন row ঢোকাতে কাজে লাগে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Add without scanning, then validate separately',
            code: `ALTER TABLE doctors
  ADD CONSTRAINT doctors_email_format CHECK (email LIKE '%@%') NOT VALID;
ALTER TABLE doctors VALIDATE CONSTRAINT doctors_email_format;`,
            output: `ALTER TABLE
ALTER TABLE`,
          },
        ],
        pitfalls: [
          'Running a plain ADD CONSTRAINT or CREATE INDEX on a busy production table during peak hours.',
          'Forgetting the VALIDATE step: the constraint then does not guarantee anything about old rows.',
        ],
        followUps: [
          'How do you add an index to a large table safely?',
          'What is a deferrable constraint useful for?',
        ],
      },
      related: ['sql-not-null-check', 'sql-optimize-slow-query'],
    },
  ],
});

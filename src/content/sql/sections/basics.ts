import { defineSection } from '../../define';

export const basics = defineSection({
  id: 'sql-basics',
  title: 'Database Basics',
  description:
    'What a database and an RDBMS are, SQL vs NoSQL, the SQL command families, DELETE vs TRUNCATE vs DROP, and choosing data types.',
  order: 1,
  questions: [
    {
      id: 'sql-what-is-database',
      level: 'foundation',
      priority: 2,
      question: 'What is a database, and what is the difference between a DBMS and an RDBMS?',
      tags: ['basics', 'dbms', 'rdbms', 'relational-model'],
      answer: {
        interview: `**A database is an organized, persistent collection of data; a DBMS is the software that stores, queries and protects it; an RDBMS is a DBMS that stores data as related tables and enforces those relationships.**

| Aspect | DBMS | RDBMS |
| --- | --- | --- |
| Data model | Any: files, documents, key-value, hierarchical | Tables of rows and columns |
| Relationships | Handled by the application | Primary and foreign keys, enforced by the engine |
| Integrity | Basic | Constraints: \`NOT NULL\`, \`UNIQUE\`, \`CHECK\`, foreign keys |
| Query language | Engine-specific | SQL |
| Transactions | Varies | ACID |
| Examples | Older file-based systems, many NoSQL stores | PostgreSQL, MySQL, SQL Server, Oracle |

Real-world: PostgreSQL is an RDBMS. In the sample database, a doctor row points to a department row through \`department_id\`, and Postgres refuses a \`department_id\` that does not exist.`,
        explanationBn: `**Database** হলো গুছিয়ে রাখা data-র ভাণ্ডার, যা program বন্ধ হলেও হারিয়ে যায় না। **DBMS (Database Management System)** হলো সেই software, যে data রাখে, খুঁজে দেয়, একসাথে অনেক user-কে সামলায় আর data-কে নষ্ট হওয়া থেকে বাঁচায়।

**RDBMS** হলো একটা বিশেষ ধরনের DBMS, যেখানে data থাকে **table**-এ (row আর column), আর table গুলো একে অপরের সাথে **key** দিয়ে যুক্ত। যেমন আমাদের sample database-এ \`doctors\` table-এর \`department_id\` column \`departments\` table-এর \`id\`-কে নির্দেশ করে।

মূল পার্থক্য হলো **সম্পর্ক রক্ষার দায়িত্ব কার**:
- সাধারণ DBMS-এ (বা অনেক NoSQL store-এ) এই নিয়ম application-কে মানতে হয়।
- RDBMS নিজেই নিয়ম পাহারা দেয়: যে department নেই, তার id দিয়ে doctor ঢোকাতে গেলে PostgreSQL error দেবে।

একটা analogy: DBMS যেন একটা আলমারি, যেখানে যা খুশি রাখা যায়। RDBMS যেন লাইব্রেরির ক্যাটালগ: প্রতিটা বইয়ের নির্দিষ্ট ঘর আর নম্বর আছে, আর ভুল নম্বরে বই রাখতে দেওয়া হয় না।

SQL হলো RDBMS-এর সাথে কথা বলার standard ভাষা। প্রতিটা RDBMS-এর নিজস্ব কিছু বাড়তি feature থাকে, তবে মূল SQL সবখানে প্রায় একই।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Rows in two tables, related through a foreign key',
            code: `SELECT d.name AS doctor, dep.name AS department, dep.location
FROM doctors AS d
JOIN departments AS dep ON dep.id = d.department_id
WHERE d.id <= 3
ORDER BY d.id;`,
            resultTable: {
              columns: ['doctor', 'department', 'location'],
              rows: [
                ['Dr. Nusrat Rahman', 'Cardiology', 'Building A'],
                ['Dr. Arif Hossain', 'Cardiology', 'Building A'],
                ['Dr. Farzana Akter', 'Neurology', 'Building B'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'The RDBMS enforces the relationship: department 99 does not exist',
            code: `INSERT INTO doctors (name, department_id, salary, hire_date)
VALUES ('Dr. New Hire', 99, 90000, '2024-05-01');`,
            output: `ERROR:  insert or update on table "doctors" violates foreign key constraint "doctors_department_id_fkey"
DETAIL:  Key (department_id)=(99) is not present in table "departments".`,
          },
        ],
        pitfalls: [
          '“Database” and “DBMS” are often used interchangeably in conversation; in an interview, keep them distinct.',
          'Relational does not mean "has relationships between tables": the name comes from the mathematical *relation*, which is a table.',
        ],
        followUps: [
          'What is the difference between SQL and NoSQL databases?',
          'What does ACID mean?',
          'What is a foreign key?',
        ],
      },
      related: ['sql-sql-vs-nosql', 'sql-foreign-key-on-delete'],
    },
    {
      id: 'sql-sql-vs-nosql',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between SQL and NoSQL databases? When would you pick each?',
      tags: ['basics', 'nosql', 'comparison', 'data-modeling'],
      answer: {
        interview: `**SQL databases store data in tables with a fixed schema and relationships enforced by the engine; NoSQL databases use other models (documents, key-value, wide-column, graph) with flexible schemas, usually trading some guarantees for easier horizontal scaling.**

| Aspect | SQL (relational) | NoSQL |
| --- | --- | --- |
| Data model | Tables, rows, columns | Documents, key-value, wide-column, graph |
| Schema | Defined up front, enforced | Flexible, often enforced by the app |
| Relationships | Foreign keys, JOINs | Embedded data or references, few joins |
| Transactions | ACID across tables | Varies; often per document/key |
| Scaling | Vertical first; replicas, partitioning, sharding with effort | Built for horizontal scaling |
| Query language | SQL (standard) | Product-specific APIs |
| Examples | PostgreSQL, MySQL | MongoDB, Redis, Cassandra, Neo4j |

Pick SQL for related data with integrity rules and reporting needs (orders, payments, bookings). Pick NoSQL for very high write volume, simple access by key, or truly variable document shapes (caching, sessions, event logs). Many systems use both; PostgreSQL's JSONB also covers many "flexible document" needs.`,
        explanationBn: `**SQL (relational)** database-এ data থাকে table-এ, আর কোন table-এ কোন column থাকবে সেটা আগে থেকে ঠিক করা (schema)। Table গুলো key দিয়ে যুক্ত, আর database নিজেই নিয়ম পাহারা দেয়: ভুল department-এ doctor ঢোকানো যাবে না।

**NoSQL** একটা ছাতার নাম, এর ভেতরে অনেক ধরন:
- **Document** (MongoDB): প্রতিটা record একটা JSON-এর মতো document, একেকটার আকার আলাদা হতে পারে।
- **Key-value** (Redis): শুধু key দিয়ে মান খোঁজা, খুব দ্রুত।
- **Wide-column** (Cassandra): বিশাল পরিমাণ লেখার জন্য।
- **Graph** (Neo4j): সম্পর্কই মূল তথ্য (social network)।

Analogy: SQL হলো ছক কাটা খাতা, প্রতিটা ঘরের নিয়ম আছে; NoSQL হলো ফাইলের বাক্স, যেখানে যে আকারের কাগজ খুশি রাখা যায়, কিন্তু নিয়ম মানার দায়িত্ব তোমার।

Interview-এ "কোনটা ভালো" না বলে **কাজ অনুযায়ী** বেছে নেওয়ার কারণ বলো। আর মনে রাখো, PostgreSQL-এর JSONB দিয়ে অনেক "flexible" data relational database-এর ভেতরেই রাখা যায়।`,
        pitfalls: [
          'Calling NoSQL "schema-less": the schema still exists, it just lives in application code.',
          'Choosing NoSQL for scale before measuring: a single well-indexed PostgreSQL server handles a lot.',
        ],
        followUps: [
          'When would you store data as JSONB in PostgreSQL instead of using MongoDB?',
          'What does the CAP theorem say?',
        ],
      },
      related: ['sql-what-is-database', 'sql-jsonb', 'sql-oltp-vs-olap'],
    },
    {
      id: 'sql-command-families',
      level: 'foundation',
      priority: 2,
      question: 'What are DDL, DML, DQL, DCL and TCL?',
      tags: ['basics', 'ddl', 'dml', 'dcl', 'tcl'],
      answer: {
        interview: `**They are the families of SQL commands, grouped by what they act on.**

| Family | Stands for | Commands | Acts on |
| --- | --- | --- | --- |
| DDL | Data Definition Language | \`CREATE\`, \`ALTER\`, \`DROP\`, \`TRUNCATE\` | Structure: tables, indexes, views |
| DML | Data Manipulation Language | \`INSERT\`, \`UPDATE\`, \`DELETE\`, \`MERGE\` | Rows |
| DQL | Data Query Language | \`SELECT\` | Reading rows (often counted as DML) |
| DCL | Data Control Language | \`GRANT\`, \`REVOKE\` | Permissions |
| TCL | Transaction Control Language | \`BEGIN\`, \`COMMIT\`, \`ROLLBACK\`, \`SAVEPOINT\` | Transactions |

A PostgreSQL-specific point worth mentioning: DDL is transactional, so \`CREATE\` and \`ALTER\` can be rolled back (in MySQL most DDL commits implicitly).`,
        explanationBn: `SQL-এর command গুলোকে কাজ অনুযায়ী পাঁচটা দলে ভাগ করা হয়:

- **DDL**: কাঠামো বানানো/বদলানো। বাড়ির নকশা: ঘর বানাও (\`CREATE TABLE\`), দেয়াল সরাও (\`ALTER\`), ভেঙে ফেলো (\`DROP\`)।
- **DML**: ঘরের ভেতরের জিনিস বদলানো: row ঢোকানো, বদলানো, মোছা।
- **DQL**: শুধু দেখা, \`SELECT\`।
- **DCL**: কে কোন ঘরে ঢুকতে পারবে, \`GRANT\`/\`REVOKE\`।
- **TCL**: কয়েকটা কাজকে একটা প্যাকেট বানানো, \`BEGIN\`/\`COMMIT\`/\`ROLLBACK\`।

উদাহরণে এক script-এ DDL (\`CREATE TABLE\`), DML (\`INSERT\`) আর DQL (\`SELECT\`) পরপর চলেছে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'DDL, then DML, then DQL',
            code: `CREATE TABLE notes (id int PRIMARY KEY, body text);
INSERT INTO notes VALUES (1, 'hello');
SELECT * FROM notes;`,
            output: `CREATE TABLE
INSERT 0 1`,
            resultTable: { columns: ['id', 'body'], rows: [[1, 'hello']] },
          },
        ],
        pitfalls: [
          'TRUNCATE looks like a DML delete but is DDL-like: it takes a stronger lock and does not fire row-level DELETE triggers.',
        ],
        followUps: [
          'What is the difference between DELETE, TRUNCATE and DROP?',
          'Can DDL be rolled back?',
        ],
      },
      related: ['sql-delete-truncate-drop', 'sql-transaction-control'],
    },
    {
      id: 'sql-delete-truncate-drop',
      level: 'foundation',
      priority: 3,
      question: 'What is the difference between DELETE, TRUNCATE and DROP?',
      tags: ['basics', 'delete', 'truncate', 'drop', 'ddl', 'dml'],
      answer: {
        interview: `**DELETE removes selected rows, TRUNCATE removes all rows at once, and DROP removes the table itself.**

| Aspect | DELETE | TRUNCATE | DROP |
| --- | --- | --- | --- |
| Removes | Rows matching \`WHERE\` (or all) | All rows | The table: structure, data, indexes |
| WHERE clause | Yes | No | No |
| Speed on big tables | Slow: row by row, leaves dead rows for VACUUM | Fast: replaces the files | Fast |
| Row triggers | Fires \`ON DELETE\` triggers | No row triggers | No |
| Foreign keys | Checks each referencing row | Refused if referenced (unless \`CASCADE\`) | Refused if referenced (unless \`CASCADE\`) |
| Identity / sequence | Keeps counting | Keeps counting, or \`RESTART IDENTITY\` | Gone |
| Rollback (PostgreSQL) | Yes | Yes, inside a transaction | Yes, inside a transaction |

Use DELETE for selected rows, TRUNCATE to empty staging or test tables quickly, and DROP when the table is no longer needed.`,
        explanationBn: `তিনটার পার্থক্য বোঝার জন্য একটা আলমারি ভাবো:

- **DELETE**: আলমারি থেকে বেছে বেছে কিছু জিনিস সরানো (\`WHERE\`)। প্রতিটা row আলাদা করে মোছা হয়, trigger চলে, foreign key-ও একে একে check হয়, তাই বড় table-এ ধীর।
- **TRUNCATE**: আলমারি পুরো খালি করে দেওয়া, এক ঝটকায়। Row ধরে কাজ করে না, তাই খুব দ্রুত। কিন্তু অন্য table যদি এটাকে reference করে, Postgres আটকে দেয়, কারণ খালি করলে সেই reference গুলো ভেঙে যেত।
- **DROP**: আলমারিটাই ফেলে দেওয়া: table, তার index, constraint সব।

উদাহরণে \`prescriptions\` কাউকে reference করা হয় না, তাই TRUNCATE সফল। কিন্তু \`departments\`-কে \`doctors\` reference করে, তাই TRUNCATE refuse করেছে আর hint দিয়েছে \`CASCADE\` বা দুটো একসাথে truncate করতে।

PostgreSQL-এ তিনটাই transaction-এর ভেতরে rollback করা যায়, যেটা অনেক database-এ হয় না।`,
        examples: [
          {
            lang: 'sql',
            caption: 'TRUNCATE empties a table at once',
            code: `TRUNCATE prescriptions;
SELECT COUNT(*) AS rows_left FROM prescriptions;`,
            output: `TRUNCATE TABLE`,
            resultTable: { columns: ['rows_left'], rows: [[0]] },
          },
          {
            lang: 'sql',
            caption: 'A table that other tables reference cannot be truncated alone',
            code: `TRUNCATE departments;`,
            output: `ERROR:  cannot truncate a table referenced in a foreign key constraint
DETAIL:  Table "doctors" references "departments".
HINT:  Truncate table "doctors" at the same time, or use TRUNCATE ... CASCADE.`,
          },
        ],
        pitfalls: [
          'TRUNCATE ... CASCADE also empties every referencing table: it can wipe far more than intended.',
          'DELETE without WHERE removes every row; run the WHERE as a SELECT first.',
        ],
        followUps: [
          'Why is DELETE of millions of rows slow, and how would you do it instead?',
          'What does RESTART IDENTITY do?',
        ],
      },
      related: ['sql-command-families', 'sql-foreign-key-on-delete', 'sql-mvcc-vacuum'],
    },
    {
      id: 'sql-choosing-data-types',
      level: 'foundation',
      priority: 2,
      question: 'How do you choose data types? Why not use float for money?',
      tags: ['basics', 'data-types', 'numeric', 'float', 'money'],
      answer: {
        interview: `**Pick the narrowest type that represents every valid value exactly, so the database rejects invalid data and stores it efficiently.**

- **Money and exact decimals**: \`numeric(p, s)\`. \`float\`/\`real\` are binary floating point and cannot represent most decimals exactly (\`0.1 + 0.2\` is not \`0.3\`).
- **Whole numbers**: \`integer\`; \`bigint\` for ids and counters that may pass 2 billion.
- **Text**: \`text\` in PostgreSQL (no speed difference from \`varchar\`); add a \`CHECK\` for real length limits.
- **Dates and times**: \`date\`, \`timestamptz\` for moments, never text.
- **Flags**: \`boolean\`. **Fixed sets**: enum, \`CHECK\` or a lookup table. **Variable attributes**: \`jsonb\`. **Identifiers**: \`uuid\` or identity integers.

Real-world: the clinic stores fees as \`NUMERIC(8,2)\` and payments as \`NUMERIC(8,2)\`, so totals add up to the paisa.`,
        explanationBn: `ঠিক data type বেছে নিলে database নিজেই ভুল data আটকায়: date column-এ "next tuesday" ঢুকবে না, integer column-এ "abc" না।

টাকার জন্য \`float\` কেন ভুল: float সংখ্যা binary (২-ভিত্তিক) ভগ্নাংশে রাখে। আমরা যেমন ১/৩ কে দশমিকে ঠিকঠাক লিখতে পারি না (০.৩৩৩...), কম্পিউটারও তেমন ০.১-কে binary-তে ঠিকঠাক রাখতে পারে না। তাই \`0.1 + 0.2\` হয় \`0.30000000000000004\`। হাজার হাজার লেনদেন যোগ করলে এই ছোট ভুল জমে হিসাব মেলে না।

\`numeric\` দশমিক সংখ্যা হুবহু রাখে, তাই \`0.3\`। একটু ধীর, কিন্তু টাকার হিসাবে নির্ভুলতাই আসল। (বিকল্প: পয়সায় integer হিসেবে রাখা।)

Float তাহলে কোথায়? বৈজ্ঞানিক মাপ, sensor data, যেখানে সামান্য ভুল চলে কিন্তু বিশাল range লাগে।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Binary floating point vs exact numeric',
            code: `SELECT 0.1::float8 + 0.2::float8 AS float_sum,
       0.1::numeric + 0.2::numeric AS numeric_sum;`,
            resultTable: {
              columns: ['float_sum', 'numeric_sum'],
              rows: [['0.30000000000000004', '0.3']],
            },
          },
        ],
        pitfalls: [
          'Storing dates as text breaks sorting ("10/02" vs "9/12") and allows invalid values.',
          'The money type depends on the lc_monetary setting; prefer numeric.',
          'Integer columns that overflow (ids, counters) are painful to migrate later; use bigint early when in doubt.',
        ],
        followUps: [
          'What is the difference between timestamp and timestamptz?',
          'CHAR vs VARCHAR vs TEXT in PostgreSQL?',
        ],
      },
      related: ['sql-timestamp-vs-timestamptz', 'sql-enum-vs-check', 'sql-out-integer-division'],
    },
  ],
});

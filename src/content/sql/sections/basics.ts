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
    },
  ],
});

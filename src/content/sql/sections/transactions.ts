import { defineSection } from '../../define';

export const transactions = defineSection({
  id: 'sql-transactions',
  title: 'Transactions & Concurrency',
  description:
    'ACID, BEGIN / COMMIT / ROLLBACK and savepoints, isolation levels and their anomalies, lost updates, optimistic vs pessimistic locking, and deadlocks.',
  order: 11,
  questions: [
    {
      id: 'sql-acid',
      level: 'foundation',
      priority: 3,
      question: 'What does ACID mean?',
      tags: ['transactions', 'acid', 'atomicity', 'consistency', 'isolation', 'durability'],
      answer: {
        interview: `**ACID is the set of guarantees a transaction gives: Atomicity, Consistency, Isolation and Durability.**

- **Atomicity**: all statements in the transaction take effect, or none do. A failure halfway rolls everything back.
- **Consistency**: a transaction moves the database from one valid state to another; constraints (\`CHECK\`, \`FOREIGN KEY\`, \`UNIQUE\`) are never left violated.
- **Isolation**: concurrent transactions don't see each other's uncommitted work; how strictly is set by the isolation level.
- **Durability**: once \`COMMIT\` returns, the change survives a crash. PostgreSQL writes it to the write-ahead log (WAL) and flushes it to disk first.

Real-world: moving budget between two departments must never leave money added to one but not taken from the other.`,
        explanationBn: `Transaction হলো কয়েকটা কাজের একটা "প্যাকেট", যেটা পুরোটা হবে নয়তো কিছুই হবে না। ACID সেই প্যাকেটের চারটা প্রতিশ্রুতি।

- **Atomicity (অবিভাজ্যতা)**: bKash-এ টাকা পাঠানো ভাবো। তোমার account থেকে কাটা আর বন্ধুর account-এ যোগ, দুটোই হবে, নয়তো কোনোটাই না। মাঝপথে বিদ্যুৎ গেলেও টাকা "হাওয়া" হবে না।
- **Consistency**: database-এর নিয়ম (constraint) কখনো ভাঙবে না। উদাহরণে budget negative হতে পারবে না (\`CHECK\`)। Pediatrics থেকে বেশি টাকা সরাতে গেলে error, আর পুরো transaction বাতিল, তাই Neurology-তে যোগ করা টাকাও ফেরত গেছে।
- **Isolation**: একসাথে অনেক transaction চললেও প্রত্যেকে এমনভাবে কাজ করে যেন একা চলছে; অন্যের অর্ধেক-শেষ কাজ দেখে না।
- **Durability**: \`COMMIT\` সফল হলে, ঠিক পরেই server crash করলেও data থাকবে। PostgreSQL আগে **WAL (write-ahead log)**-এ লিখে disk-এ flush করে, তারপর COMMIT-এর উত্তর দেয়। Crash-এর পর WAL replay করে data ফেরত আনে।

উদাহরণে খেয়াল করো: \`COMMIT\` লিখলেও Postgres \`ROLLBACK\` বলেছে, কারণ transaction-এর ভেতরে error হয়েছিল। ভুল অবস্থায় commit হওয়ার সুযোগই নেই।`,
        examples: [
          {
            lang: 'sql',
            caption: 'A transfer that breaks a constraint is rolled back as a whole',
            code: `ALTER TABLE departments ADD CONSTRAINT budget_non_negative CHECK (budget >= 0);

BEGIN;
UPDATE departments SET budget = budget + 400000 WHERE name = 'Neurology';
UPDATE departments SET budget = budget - 400000 WHERE name = 'Pediatrics';
COMMIT;

SELECT name, budget FROM departments
WHERE name IN ('Neurology', 'Pediatrics')
ORDER BY name;`,
            output: `ALTER TABLE
BEGIN
UPDATE 1
ERROR:  new row for relation "departments" violates check constraint "budget_non_negative"
DETAIL:  Failing row contains (3, Pediatrics, Building A, -100000.00).
ROLLBACK`,
            resultTable: {
              columns: ['name', 'budget'],
              rows: [
                ['Neurology', '420000.00'],
                ['Pediatrics', '300000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'The C in ACID is about database rules (constraints), not the C in the CAP theorem.',
          'Autocommit: without BEGIN every statement is its own transaction, so a multi-step change is not atomic.',
          'Durability can be weakened on purpose (synchronous_commit = off) for speed; know that trade-off exists.',
        ],
        followUps: [
          'What are the isolation levels in PostgreSQL?',
          'What is a savepoint?',
          'What is the write-ahead log?',
        ],
      },
      related: ['sql-transaction-control', 'sql-isolation-levels'],
    },
    {
      id: 'sql-transaction-control',
      level: 'foundation',
      priority: 2,
      question: 'How do BEGIN, COMMIT, ROLLBACK and SAVEPOINT work?',
      tags: ['transactions', 'commit', 'rollback', 'savepoint', 'autocommit'],
      answer: {
        interview: `**BEGIN starts a transaction, COMMIT makes its changes permanent and visible, ROLLBACK discards them, and SAVEPOINT marks a point you can roll back to without abandoning the whole transaction.**

- Without \`BEGIN\`, PostgreSQL runs in **autocommit**: each statement is its own transaction.
- In PostgreSQL, **any error aborts the transaction**: every following statement fails with "current transaction is aborted" until \`ROLLBACK\`, and a \`COMMIT\` at that point actually rolls back.
- \`SAVEPOINT name\` / \`ROLLBACK TO SAVEPOINT name\` undo only the work after the savepoint and clear the error state, so the transaction can continue. \`RELEASE SAVEPOINT\` forgets it.
- Most DDL is transactional in PostgreSQL too: \`CREATE TABLE\` or \`ALTER TABLE\` can be rolled back.

Real-world: import 1,000 rows in one transaction, with a savepoint per row so a bad row is skipped and logged instead of failing the import.`,
        explanationBn: `- \`BEGIN\`: "এখন থেকে যা করব, একটা প্যাকেট।"
- \`COMMIT\`: "প্যাকেট পাকা করো, সবাই দেখুক।"
- \`ROLLBACK\`: "প্যাকেট ফেলে দাও, যেন কিছুই হয়নি।"
- \`SAVEPOINT\`: ভিডিও গেমের checkpoint। মরলে পুরো level শুরু থেকে না খেলে checkpoint থেকে আবার খেলো।

PostgreSQL-এর একটা বিশেষ আচরণ যেটা অনেককে অবাক করে: transaction-এর ভেতরে একটা statement-এ error হলে পুরো transaction **aborted** অবস্থায় চলে যায়। এরপর যত statement দাও, সব reject: "current transaction is aborted"। শেষে \`COMMIT\` লিখলেও Postgres আসলে \`ROLLBACK\` করে। প্রথম উদাহরণে তাই id 1-এর fee update-টাও টেকেনি।

দ্বিতীয় উদাহরণে error-এর আগে savepoint রাখা ছিল। \`ROLLBACK TO SAVEPOINT\` শুধু ভুল insert-টা বাতিল করে, error অবস্থা মুছে দেয়, আর আগের update রেখে দেয়। তারপর বাকি কাজ চলে, আর COMMIT সফল হয়।

MySQL-এর মতো কিছু database-এ error হলে শুধু সেই statement fail করে, transaction চলতে থাকে। Postgres-এর আচরণ বেশি কড়া, কিন্তু নিরাপদ।`,
        examples: [
          {
            lang: 'sql',
            caption: 'One error aborts the transaction; COMMIT then rolls back',
            code: `BEGIN;
UPDATE appointments SET fee = 1600 WHERE id = 1;
INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, fee)
VALUES (999, 1, '2024-05-02', 'scheduled', 1500);
UPDATE appointments SET fee = 1700 WHERE id = 2;
COMMIT;
SELECT id, fee FROM appointments WHERE id IN (1, 2) ORDER BY id;`,
            output: `BEGIN
UPDATE 1
ERROR:  insert or update on table "appointments" violates foreign key constraint "appointments_patient_id_fkey"
DETAIL:  Key (patient_id)=(999) is not present in table "patients".
ERROR:  current transaction is aborted, commands ignored until end of transaction block
ROLLBACK`,
            resultTable: {
              columns: ['id', 'fee'],
              rows: [
                [1, '1500.00'],
                [2, '1200.00'],
              ],
            },
          },
          {
            lang: 'sql',
            caption: 'A savepoint undoes only the failed step',
            code: `BEGIN;
UPDATE appointments SET fee = 1600 WHERE id = 1;
SAVEPOINT before_insert;
INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, fee)
VALUES (999, 1, '2024-05-02', 'scheduled', 1500);
ROLLBACK TO SAVEPOINT before_insert;
UPDATE appointments SET fee = 1700 WHERE id = 2;
COMMIT;
SELECT id, fee FROM appointments WHERE id IN (1, 2) ORDER BY id;`,
            output: `BEGIN
UPDATE 1
SAVEPOINT
ERROR:  insert or update on table "appointments" violates foreign key constraint "appointments_patient_id_fkey"
DETAIL:  Key (patient_id)=(999) is not present in table "patients".
ROLLBACK
UPDATE 1
COMMIT`,
            resultTable: {
              columns: ['id', 'fee'],
              rows: [
                [1, '1600.00'],
                [2, '1700.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Leaving a transaction open ("idle in transaction") holds locks and blocks VACUUM; always commit or roll back promptly.',
          'Savepoints are not free: thousands per transaction add overhead; batch where you can.',
        ],
        followUps: [
          'Can DDL be rolled back in PostgreSQL?',
          'What does "idle in transaction" mean, and why is it a problem?',
        ],
      },
      related: ['sql-acid', 'sql-isolation-levels'],
    },
    {
      id: 'sql-isolation-levels',
      level: 'intermediate',
      priority: 3,
      question: 'What are the transaction isolation levels, and which anomalies does each prevent?',
      tags: ['transactions', 'isolation-levels', 'dirty-read', 'phantom-read', 'serializable'],
      answer: {
        interview: `**Isolation levels trade concurrency for protection against anomalies; higher levels prevent more anomalies but can block or abort more transactions.**

| Level | Dirty read | Non-repeatable read | Phantom read | Serialization anomaly |
| --- | --- | --- | --- | --- |
| Read Uncommitted | Possible (never in PostgreSQL) | Possible | Possible | Possible |
| **Read Committed** (PG default) | No | Possible | Possible | Possible |
| Repeatable Read | No | No | Possible (never in PostgreSQL) | Possible |
| Serializable | No | No | No | No |

- **Dirty read**: seeing another transaction's uncommitted change.
- **Non-repeatable read**: reading the same row twice and getting different values.
- **Phantom read**: re-running a query and getting new or missing rows.
- **Serialization anomaly**: the result could not happen in any one-at-a-time order (e.g. write skew).

In PostgreSQL, Read Committed takes a new snapshot per statement; Repeatable Read keeps one snapshot for the whole transaction; Serializable adds conflict detection and aborts one transaction with a serialization failure, which the application must **retry**.`,
        explanationBn: `একসাথে অনেক transaction চললে একটা অন্যটার কাজ কতটা দেখবে, সেটা ঠিক করে **isolation level**। যত কড়া level, তত কম অদ্ভুত ঘটনা (anomaly), কিন্তু তত বেশি অপেক্ষা বা retry।

Anomaly-গুলো সহজ ভাষায়:
- **Dirty read**: অন্য কেউ এখনো commit করেনি, এমন পরিবর্তন দেখে ফেলা। সে পরে rollback করলে তুমি এমন data দেখেছ যেটা কখনো ছিলই না।
- **Non-repeatable read**: একই row দুবার পড়ে দুই রকম মান, কারণ মাঝে কেউ update করে commit করেছে।
- **Phantom read**: একই \`WHERE\` দুবার চালিয়ে নতুন row "ভূতের মতো" হাজির।
- **Serialization anomaly**: দুটো transaction আলাদাভাবে ঠিক, কিন্তু একসাথে মিলে এমন ফল দেয় যা পরপর চালালে কখনো হতো না। Classic উদাহরণ: on-call-এ অন্তত একজন doctor থাকতে হবে; দুজন doctor একসাথে দেখল "আরেকজন আছে" আর দুজনেই ছুটি নিল (write skew)।

PostgreSQL **MVCC** দিয়ে কাজ করে: প্রতিটা transaction data-র একটা **snapshot** দেখে।
- **Read Committed** (default): প্রতিটা statement নতুন snapshot নেয়।
- **Repeatable Read**: পুরো transaction একটাই snapshot। তাই Postgres-এ এখানে phantom-ও হয় না।
- **Serializable**: snapshot + নজরদারি। সংঘর্ষ ধরা পড়লে একটা transaction-কে "could not serialize access" error দিয়ে বাতিল করে; application-কে আবার চেষ্টা (retry) করতে হয়।

Postgres-এ Read Uncommitted লিখলেও আসলে Read Committed-ই চলে, dirty read কখনো হয় না।`,
        examples: [
          {
            lang: 'sql',
            caption: 'The default level',
            code: `SHOW transaction_isolation;`,
            resultTable: {
              columns: ['transaction_isolation'],
              rows: [['read committed']],
            },
          },
          {
            lang: 'sql',
            caption: 'Choosing a stricter level for one transaction',
            code: `BEGIN;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT current_setting('transaction_isolation') AS level;
COMMIT;`,
            output: `BEGIN
SET
COMMIT`,
            resultTable: {
              columns: ['level'],
              rows: [['serializable']],
            },
          },
        ],
        pitfalls: [
          'Using Serializable without retry logic: serialization failures (SQLSTATE 40001) are expected, not bugs.',
          'Assuming Read Committed protects read-then-write logic: two transactions can both read the old value and both write.',
          'SET TRANSACTION must be the first statement after BEGIN.',
        ],
        followUps: [
          'What is MVCC?',
          'What is write skew, and which level prevents it?',
          'How would you prevent two people booking the same slot?',
        ],
      },
      related: ['sql-acid', 'sql-lost-update', 'sql-optimistic-vs-pessimistic-locking'],
    },
    {
      id: 'sql-lost-update',
      level: 'intermediate',
      priority: 2,
      question:
        'What is a lost update, and how do you safely decrement a balance when many requests run at once?',
      tags: ['transactions', 'lost-update', 'concurrency', 'atomic-update', 'race-condition'],
      answer: {
        interview: `**A lost update happens when two transactions read the same value, each computes a new value in the application, and the second write silently overwrites the first.**

- Bad pattern: \`SELECT budget\` → compute \`budget - 100000\` in code → \`UPDATE ... SET budget = <computed>\`. Two requests both read 180000 and both write 80000; one deduction is lost.
- **Fix 1, atomic update**: let the database compute it: \`SET budget = budget - 100000\`. Concurrent updates of the same row are serialized by the row lock, and the second one sees the first one's result.
- **Fix 2, guard in WHERE**: \`AND budget >= 100000\` makes the check and the change one atomic step; \`UPDATE 0\` means "rejected".
- **Fix 3**: \`SELECT ... FOR UPDATE\` when the logic must happen in application code, or optimistic locking with a version column.
- Backstop: a \`CHECK (budget >= 0)\` constraint so a bug can never produce an invalid state.`,
        explanationBn: `ধরো দুজন accountant একসাথে Dermatology-র budget থেকে 1 লাখ করে কাটবে। Budget 1,80,000।

ভুল পদ্ধতিতে:
1. A পড়ল: 1,80,000। B-ও পড়ল: 1,80,000।
2. A হিসাব করল 80,000, লিখল। B-ও হিসাব করল 80,000, লিখল।
3. ফল: 80,000। কিন্তু হওয়ার কথা ছিল -20,000 (অথবা দ্বিতীয়টা আটকানো)। একটা কাটা **হারিয়ে গেছে**, এটাই **lost update**।

সমস্যাটা হলো "পড়া" আর "লেখা"র মাঝে ফাঁক, যেখানে অন্যজন ঢুকে পড়ে।

সমাধান: ফাঁকটাই রাখো না। \`SET budget = budget - 100000\` database-এর ভেতরে একটা ধাপে হয়। দুটো UPDATE একই row-তে এলে দ্বিতীয়টা row lock-এর জন্য অপেক্ষা করে, তারপর **নতুন** মান থেকে কাটে।

\`WHERE budget >= 100000\` যোগ করলে শর্ত যাচাই আর কাটা একসাথে হয়। উদাহরণে প্রথম UPDATE সফল (\`UPDATE 1\`), দ্বিতীয়টায় budget 80,000, শর্ত মেলে না, তাই \`UPDATE 0\`। Application এই সংখ্যা দেখে বুঝবে "পর্যাপ্ত budget নেই"।

Ticket booking, stock কমানো, wallet balance: সব জায়গায় একই নীতি।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Compute in the database, and return the new value',
            code: `UPDATE departments
SET budget = budget - 100000
WHERE name = 'Dermatology' AND budget >= 100000
RETURNING name, budget;`,
            resultTable: {
              columns: ['name', 'budget'],
              rows: [['Dermatology', '80000.00']],
            },
          },
          {
            lang: 'sql',
            caption: 'The guard rejects the second deduction instead of overdrawing',
            code: `UPDATE departments
SET budget = budget - 100000
WHERE name = 'Dermatology' AND budget >= 100000;
UPDATE departments
SET budget = budget - 100000
WHERE name = 'Dermatology' AND budget >= 100000;
SELECT name, budget FROM departments WHERE name = 'Dermatology';`,
            output: `UPDATE 1
UPDATE 0`,
            resultTable: {
              columns: ['name', 'budget'],
              rows: [['Dermatology', '80000.00']],
            },
          },
        ],
        pitfalls: [
          'ORMs often generate the read-modify-write pattern (load entity, change field, save); use an atomic update expression.',
          'Ignoring the affected-row count: UPDATE 0 is the signal that the guard rejected the change.',
        ],
        followUps: [
          'When is SELECT ... FOR UPDATE necessary instead?',
          'How does optimistic locking detect a conflict?',
        ],
      },
      related: ['sql-optimistic-vs-pessimistic-locking', 'sql-isolation-levels'],
    },
    {
      id: 'sql-optimistic-vs-pessimistic-locking',
      level: 'advanced',
      priority: 2,
      question: 'What is the difference between optimistic and pessimistic locking?',
      tags: ['transactions', 'locking', 'optimistic-locking', 'for-update', 'skip-locked'],
      answer: {
        interview: `**Pessimistic locking locks the row before changing it so others wait; optimistic locking does not lock, but detects at write time whether someone else changed the row and then retries or reports a conflict.**

| Aspect | Pessimistic | Optimistic |
| --- | --- | --- |
| Mechanism | \`SELECT ... FOR UPDATE\` inside a transaction | \`version\` (or \`updated_at\`) column checked in \`UPDATE ... WHERE version = :v\` |
| Conflicts | Prevented: others block | Detected: \`UPDATE 0\` |
| Best when | Contention is high, retries are expensive | Conflicts are rare, long user "think time" |
| Costs | Waiting, deadlock risk, locks held | Retries, conflict messages to users |
| Spans user interaction? | No, never hold locks while a user edits | Yes, works across HTTP requests |

Variants: \`FOR UPDATE NOWAIT\` fails immediately instead of waiting; \`FOR UPDATE SKIP LOCKED\` skips rows locked by others, the standard way to build a job queue in PostgreSQL.`,
        explanationBn: `দুটোই একই সমস্যার সমাধান: দুজন একই row একসাথে বদলাতে চাইলে কী হবে।

**Pessimistic ("নিরাশাবাদী")**: ধরে নেয় সংঘর্ষ হবেই, তাই আগেই তালা দেয়। \`SELECT ... FOR UPDATE\` row-টা lock করে; অন্য কেউ সেই row বদলাতে বা lock করতে চাইলে অপেক্ষা করবে যতক্ষণ না তুমি COMMIT বা ROLLBACK করো। বাথরুমের দরজায় ছিটকিনি দেওয়ার মতো।

**Optimistic ("আশাবাদী")**: ধরে নেয় সংঘর্ষ কমই হবে, তাই তালা দেয় না। প্রতিটা row-এ একটা \`version\` নম্বর থাকে। পড়ার সময় version মনে রাখো (ধরো 1)। লেখার সময় বলো "শুধু তখনই বদলাও যদি version এখনো 1 থাকে", আর সাথে version বাড়াও। উদাহরণে প্রথম জন সফল (version 2), দ্বিতীয় জন পুরনো version 1 দিয়ে চেষ্টা করায় \`UPDATE 0\`: সে বুঝল মাঝে কেউ বদলেছে, তাই আবার পড়ে চেষ্টা করবে বা user-কে জানাবে।

কোনটা কখন:
- Web form-এ user 5 মিনিট ধরে edit করে: optimistic। এতক্ষণ lock ধরে রাখা অসম্ভব।
- খুব ব্যস্ত row (একটা counter, সীমিত seat): pessimistic বা atomic update, নইলে retry-র বন্যা।

**SKIP LOCKED**: job queue-তে অনেক worker একসাথে "পরের কাজ" নেয়। যে row অন্য worker lock করে রেখেছে, সেটা এড়িয়ে পরেরটা নেয়, কেউ কারো জন্য অপেক্ষা করে না।`,
        examples: [
          {
            lang: 'sql',
            caption: 'Pessimistic: lock the row, then change it inside the same transaction',
            code: `BEGIN;
SELECT id, status FROM appointments WHERE id = 40 FOR UPDATE;
UPDATE appointments SET status = 'completed' WHERE id = 40;
COMMIT;`,
            output: `BEGIN
UPDATE 1
COMMIT`,
            resultTable: {
              columns: ['id', 'status'],
              rows: [[40, 'scheduled']],
            },
          },
          {
            lang: 'sql',
            caption: 'Optimistic: the second writer still has version 1, so nothing is updated',
            code: `ALTER TABLE appointments ADD COLUMN version int NOT NULL DEFAULT 1;
UPDATE appointments SET status = 'cancelled', version = version + 1
WHERE id = 40 AND version = 1;
UPDATE appointments SET status = 'completed', version = version + 1
WHERE id = 40 AND version = 1;
SELECT id, status, version FROM appointments WHERE id = 40;`,
            output: `ALTER TABLE
UPDATE 1
UPDATE 0`,
            resultTable: {
              columns: ['id', 'status', 'version'],
              rows: [[40, 'cancelled', 2]],
            },
          },
          {
            lang: 'sql',
            caption: 'A worker claims the next job without waiting on rows other workers hold',
            code: `SELECT id, appointment_date FROM appointments
WHERE status = 'scheduled'
ORDER BY appointment_date
LIMIT 1
FOR UPDATE SKIP LOCKED;`,
            resultTable: {
              columns: ['id', 'appointment_date'],
              rows: [[39, '2024-04-29']],
            },
          },
        ],
        pitfalls: [
          'FOR UPDATE outside an explicit transaction releases the lock as soon as the statement ends.',
          'Optimistic locking only works if every writer checks and bumps the version.',
          'Holding a pessimistic lock across a network call or user input blocks everyone else.',
        ],
        followUps: [
          'How would you build a job queue in PostgreSQL?',
          'What is the difference between FOR UPDATE and FOR SHARE?',
          'How do you avoid deadlocks?',
        ],
      },
      related: ['sql-lost-update', 'sql-deadlocks'],
    },
    {
      id: 'sql-deadlocks',
      level: 'advanced',
      priority: 2,
      question: 'What is a deadlock, how does PostgreSQL handle it, and how do you prevent one?',
      tags: ['transactions', 'deadlock', 'locking', 'lock-ordering'],
      answer: {
        interview: `**A deadlock is two (or more) transactions each holding a lock the other needs, so neither can continue; PostgreSQL detects the cycle and aborts one of them with a deadlock error.**

Classic case:
- T1 locks department 1, T2 locks department 3.
- T1 now wants department 3 (waits for T2); T2 wants department 1 (waits for T1).
- After \`deadlock_timeout\` (1 s by default) PostgreSQL checks for a cycle and cancels one: \`ERROR: deadlock detected\` (SQLSTATE 40P01). The other proceeds.

Prevention:
- **Lock in a consistent order**: e.g. always by primary key, \`SELECT ... WHERE id IN (...) ORDER BY id FOR UPDATE\`.
- Keep transactions **short**; no network calls or user input while holding locks.
- Touch as few rows as needed; use atomic single-statement updates where possible.
- Use \`NOWAIT\` or \`lock_timeout\` to fail fast instead of waiting.
- **Retry** the aborted transaction; deadlocks can't be ruled out entirely in a busy system.`,
        explanationBn: `Deadlock হলো এক সরু রাস্তায় দুই গাড়ি মুখোমুখি: কেউ পিছোবে না, তাই কেউ এগোতেও পারবে না।

Database-এ: T1 department 1-এর row lock করেছে, T2 department 3-এর। এখন T1-এর দরকার 3, যেটা T2-এর হাতে; T2-এর দরকার 1, যেটা T1-এর হাতে। দুজনেই চিরকাল অপেক্ষা করবে।

PostgreSQL এটা নিজেই সামলায়। কোনো lock-এর জন্য \`deadlock_timeout\` (default 1 সেকেন্ড) অপেক্ষার পর সে দেখে অপেক্ষার একটা চক্র (cycle) তৈরি হয়েছে কিনা। হলে একটা transaction-কে \`deadlock detected\` error দিয়ে বাতিল করে, অন্যটা এগিয়ে যায়। Application-কে বাতিল হওয়াটা retry করতে হয়।

**প্রতিরোধের সবচেয়ে কার্যকর উপায়: সবাই একই ক্রমে lock নেবে।** যদি সবাই সবসময় ছোট id আগে lock করে, তাহলে T2-ও department 1 আগে চাইবে, আর T1-এর জন্য অপেক্ষা করবে; চক্র তৈরিই হবে না। উদাহরণে \`ORDER BY id FOR UPDATE\` ঠিক এটাই করে: \`IN (3, 1)\` লিখলেও lock নেওয়া হয় id ক্রমে।

এছাড়া transaction ছোট রাখো: যত কম সময় lock ধরে রাখবে, সংঘর্ষের সম্ভাবনা তত কম।

(একটা session-এ deadlock দেখানো যায় না, কারণ দুটো আলাদা connection লাগে। তাই এখানে প্রতিরোধের pattern দেখানো হয়েছে।)`,
        examples: [
          {
            lang: 'sql',
            caption:
              'Lock several rows in a fixed order (by id) so transactions can’t form a cycle',
            code: `BEGIN;
SELECT id, budget FROM departments
WHERE id IN (3, 1)
ORDER BY id
FOR UPDATE;`,
            output: `BEGIN`,
            resultTable: {
              columns: ['id', 'budget'],
              rows: [
                [1, '500000.00'],
                [3, '300000.00'],
              ],
            },
          },
        ],
        pitfalls: [
          'Assuming deadlocks only come from explicit locks: UPDATEs and foreign key checks take row locks too.',
          'Treating a deadlock error as fatal; the right response is usually to retry the whole transaction.',
          'Raising deadlock_timeout to "fix" deadlocks only delays detection.',
        ],
        followUps: [
          'What is the difference between a deadlock and lock contention?',
          'How would you find which queries are blocking others (pg_locks, pg_stat_activity)?',
        ],
      },
      related: ['sql-optimistic-vs-pessimistic-locking', 'sql-acid'],
    },
  ],
});

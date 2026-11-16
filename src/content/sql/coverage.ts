import type { Coverage, Level, Priority, QuickConcept } from '../schema';

function concept(c: {
  id: string;
  question: string;
  level: Level;
  priority?: Priority;
  tags: string[];
  interview: string;
  bn: string;
  related?: string[];
}): QuickConcept {
  return {
    id: c.id,
    sectionId: 'sql-coverage',
    level: c.level,
    priority: c.priority ?? 1,
    question: c.question,
    tags: c.tags,
    answer: { interview: c.interview, explanationBn: c.bn },
    related: c.related,
  };
}

export const coverage: Coverage = {
  quickConcepts: [
    concept({
      id: 'sql-qc-coalesce-nullif',
      question: 'What do COALESCE, NULLIF and GREATEST / LEAST do?',
      level: 'foundation',
      priority: 2,
      tags: ['null', 'functions', 'coalesce'],
      interview:
        '`COALESCE(a, b, …)` returns the first non-NULL argument (default values). `NULLIF(a, b)` returns NULL when `a = b`, otherwise `a`; the classic use is avoiding division by zero: `x / NULLIF(total, 0)`. `GREATEST` / `LEAST` pick the largest / smallest of their arguments and, in PostgreSQL, ignore NULLs.',
      bn: '`COALESCE` হলো "এটা না থাকলে ওটা": প্রথম non-NULL মান। `NULLIF` উল্টো কাজ করে: দুইটা মান সমান হলে NULL বানায়, তাই শূন্য দিয়ে ভাগের আগে `NULLIF(total, 0)` দিলে error না হয়ে NULL আসে।',
    }),
    concept({
      id: 'sql-qc-char-varchar-text',
      question: 'CHAR vs VARCHAR vs TEXT in PostgreSQL?',
      level: 'foundation',
      tags: ['data-types', 'strings', 'postgresql'],
      interview:
        'In PostgreSQL all three are stored the same way, with no performance difference. `char(n)` pads with spaces to n characters (rarely what you want), `varchar(n)` enforces a maximum length, and `text` has no limit. Use `text`, and add a `CHECK (length(col) <= n)` when a real business limit exists. (Other databases differ: in MySQL and SQL Server the choice affects storage and indexing.)',
      bn: 'Postgres-এ তিনটা ভেতরে একইভাবে রাখা হয়, তাই দ্রুততায় পার্থক্য নেই। `char(n)` space দিয়ে ভরিয়ে দেয় বলে ঝামেলা করে। সাধারণত `text`, আর সত্যিকারের সীমা থাকলে `CHECK` constraint।',
    }),
    concept({
      id: 'sql-qc-schema-vs-database',
      question: 'What is a schema in PostgreSQL, and how is it different from a database?',
      level: 'intermediate',
      tags: ['postgresql', 'schema', 'search-path', 'organization'],
      interview:
        'A cluster holds databases; a database holds schemas; a schema holds tables, views and functions. Schemas are namespaces: `billing.invoices` and `public.invoices` can coexist, and one query can join across schemas but not across databases (without extensions such as postgres_fdw). `search_path` decides which schemas unqualified names resolve in. Uses: separating modules, per-tenant schemas, and granting permissions per schema.',
      bn: 'Database একটা বাড়ি হলে schema তার ঘরগুলো। একই নামের table আলাদা ঘরে থাকতে পারে (`billing.invoices`, `public.invoices`)। এক query-তে আলাদা schema জোড়া যায়, কিন্তু আলাদা database না।',
    }),
    concept({
      id: 'sql-qc-serial-vs-identity',
      question: 'serial vs GENERATED AS IDENTITY?',
      level: 'intermediate',
      tags: ['identity', 'sequences', 'primary-key'],
      interview:
        '`serial` is a shorthand that creates a separate sequence and a default; it is PostgreSQL-specific and its sequence has its own ownership and permissions. `GENERATED { ALWAYS | BY DEFAULT } AS IDENTITY` is the SQL standard, keeps the sequence tied to the column, and with `ALWAYS` rejects hand-written ids unless you say `OVERRIDING SYSTEM VALUE`. Prefer identity columns in new schemas. Either way, ids can have gaps (rolled-back inserts still consume values).',
      bn: 'দুটোই auto-increment id দেয়, কিন্তু identity হলো standard আর column-এর সাথে sequence-কে শক্তভাবে বাঁধে। `ALWAYS` দিলে ভুল করে হাতে id দেওয়া আটকায়। Rollback হলেও sequence-এর নম্বর খরচ হয়, তাই id-তে ফাঁক থাকা স্বাভাবিক।',
      related: ['sql-surrogate-vs-natural-key'],
    }),
    concept({
      id: 'sql-qc-generated-columns',
      question: 'What are generated columns?',
      level: 'intermediate',
      tags: ['generated-columns', 'denormalization', 'ddl'],
      interview:
        'A column computed from other columns of the same row: `total numeric GENERATED ALWAYS AS (price * qty) STORED`. PostgreSQL stores the value and keeps it correct on every write; you cannot write to it directly. The expression must be immutable and can only use the current row. Good for derived values you filter or index on, like a lower-cased email or a full-text `tsvector`.',
      bn: 'Generated column হলো একই row-এর অন্য column থেকে নিজে থেকে হিসাব হওয়া মান। Trigger ছাড়াই denormalized মান সবসময় ঠিক থাকে, আর তার উপর index-ও বানানো যায়।',
      related: ['sql-denormalization', 'sql-full-text-search'],
    }),
    concept({
      id: 'sql-qc-copy',
      question: 'How do you load or export large amounts of data quickly in PostgreSQL?',
      level: 'intermediate',
      tags: ['copy', 'bulk-load', 'performance'],
      interview:
        '`COPY table FROM … / TO …` (or `\\copy` in psql, which reads files on the client) streams rows in CSV or text format and is far faster than many single-row INSERTs. For big loads: use multi-row INSERT or COPY inside one transaction, create indexes and foreign keys after loading, and run `ANALYZE` afterwards so the planner has statistics.',
      bn: 'হাজারো আলাদা INSERT প্রতিটার জন্য আলাদা round trip আর commit খরচ করে। `COPY` একটা stream-এ সব row ঢোকায়, তাই অনেক গুণ দ্রুত। Load শেষে `ANALYZE` চালাতে ভুলো না।',
    }),
    concept({
      id: 'sql-qc-connection-pooling',
      question: 'Why do applications use a connection pool (e.g. PgBouncer)?',
      level: 'intermediate',
      priority: 2,
      tags: ['connection-pooling', 'pgbouncer', 'scalability'],
      interview:
        'Each PostgreSQL connection is a separate server process with its own memory, and opening one is relatively slow, so thousands of direct connections exhaust the server. A pool keeps a small set of open connections and lends them to requests. App-side pools (in the driver) and PgBouncer (in front of the database, often in transaction mode) are common. In transaction pooling, session state (prepared statements, `SET`, advisory locks) does not survive between transactions.',
      bn: 'Postgres প্রতিটা connection-এর জন্য আলাদা process চালায়, তাই হাজার হাজার connection server-কে বসিয়ে দেয়। Pool কয়েকটা connection খোলা রেখে request-গুলোকে ধার দেয়, যেমন রিকশা stand-এ নির্দিষ্ট কয়েকটা রিকশা সবাইকে সেবা দেয়।',
    }),
    concept({
      id: 'sql-qc-replication',
      question: 'What are read replicas, and what is replication lag?',
      level: 'advanced',
      tags: ['replication', 'read-replica', 'high-availability', 'scalability'],
      interview:
        'With streaming replication the primary ships its WAL to standby servers, which replay it and can serve read-only queries. Replicas scale reads (reports, search) and provide failover. Replication is usually asynchronous, so a replica can be slightly behind: reading your own write from a replica right after writing may return old data. Route read-after-write paths to the primary, or use synchronous replication where the trade-off is acceptable.',
      bn: 'Primary-র প্রতিটা পরিবর্তন (WAL) replica-তে পাঠানো হয়, আর replica শুধু পড়ার কাজে লাগে। সমস্যা: replica একটু পিছিয়ে থাকতে পারে, তাই এইমাত্র লেখা data replica থেকে পড়লে পুরনো দেখাতে পারে।',
      related: ['sql-mvcc-vacuum'],
    }),
    concept({
      id: 'sql-qc-sharding',
      question: 'What is the difference between partitioning and sharding?',
      level: 'advanced',
      tags: ['sharding', 'partitioning', 'scalability'],
      interview:
        'Partitioning splits a table into pieces inside **one** database server; sharding spreads data across **several** servers, each holding a subset (by tenant, region or hash of a key). Sharding scales writes and storage beyond one machine but makes cross-shard joins, transactions and unique constraints hard. In PostgreSQL it is done in the application or with extensions such as Citus. Shard only after indexes, partitioning, replicas and caching are not enough.',
      bn: 'Partitioning একটা server-এর ভেতরে table ভাগ করা; sharding data-কে কয়েকটা আলাদা server-এ ছড়িয়ে দেওয়া। Sharding বড় scale দেয়, কিন্তু server পেরিয়ে JOIN আর transaction কঠিন হয়ে যায়, তাই এটা একদম শেষ উপায়।',
      related: ['sql-partitioning'],
    }),
    concept({
      id: 'sql-qc-cap-theorem',
      question: 'What does the CAP theorem say?',
      level: 'intermediate',
      tags: ['distributed-systems', 'cap', 'consistency'],
      interview:
        'In a distributed data store, during a network **P**artition you must choose between **C**onsistency (every read sees the latest write or gets an error) and **A**vailability (every request gets a non-error answer, possibly stale). Without a partition you can have both. A single PostgreSQL primary is consistent; adding async replicas trades some consistency for availability of reads. Note the C in CAP is not the C in ACID.',
      bn: 'Network ভাগ হয়ে গেলে system-কে বেছে নিতে হয়: পুরনো data দিয়ে উত্তর দেবে (available), নাকি নিশ্চিত না হলে error দেবে (consistent)। দুটো একসাথে সম্ভব না।',
      related: ['sql-acid'],
    }),
    concept({
      id: 'sql-qc-soft-delete',
      question: 'What is a soft delete, and what are its trade-offs?',
      level: 'intermediate',
      tags: ['soft-delete', 'design', 'partial-index'],
      interview:
        'Instead of deleting a row you mark it, e.g. `deleted_at timestamptz`. It enables undo and auditing, but every query must filter `WHERE deleted_at IS NULL` (a view helps), unique constraints must become partial (`UNIQUE (email) WHERE deleted_at IS NULL`), foreign keys no longer prevent "deleted" parents, and tables keep growing. For audit needs, a separate history table is often cleaner.',
      bn: 'Row মুছে না ফেলে "মুছে ফেলা হয়েছে" বলে চিহ্ন দেওয়া। ফেরত আনা সহজ, কিন্তু প্রতিটা query-তে filter মনে রাখতে হয়, আর unique নিয়ম partial index দিয়ে নতুন করে লিখতে হয়।',
      related: ['sql-partial-covering-index'],
    }),
    concept({
      id: 'sql-qc-uuid-keys',
      question: 'UUID or bigint for primary keys? What about UUIDv7?',
      level: 'advanced',
      tags: ['uuid', 'primary-key', 'indexes'],
      interview:
        '`bigint` identity keys are small (8 bytes), fast to index and naturally ordered, but guessable and assigned by the database. UUIDs (16 bytes) can be generated anywhere (clients, other services) and do not leak counts. Random UUIDv4 values scatter inserts across the B-tree, causing page splits and poor cache use on large tables; time-ordered **UUIDv7** keeps inserts near the end of the index like a sequence. PostgreSQL 18 adds `uuidv7()`.',
      bn: 'বড় table-এ random UUID (v4) index-এর এলোমেলো জায়গায় ঢোকে, তাই index ধীর আর বড় হয়। UUIDv7 সময় অনুযায়ী বাড়ে, তাই sequence-এর মতো শেষে ঢোকে, আবার যেকোনো জায়গায় বানানোও যায়।',
      related: ['sql-surrogate-vs-natural-key', 'sql-btree-clustered-index'],
    }),
    concept({
      id: 'sql-qc-extensions',
      question: 'Which PostgreSQL extensions are worth knowing?',
      level: 'intermediate',
      tags: ['extensions', 'postgresql', 'pg-trgm', 'pgvector', 'postgis'],
      interview:
        "`pg_stat_statements` (find slow and frequent queries), `pg_trgm` (fuzzy and `LIKE '%x%'` search with GIN/GiST indexes), `PostGIS` (geospatial types and queries), `pgvector` (vector similarity search for embeddings), `pgcrypto` (hashing and encryption helpers), `postgres_fdw` (query other PostgreSQL servers), `pg_partman` (manage partitions), `TimescaleDB` (time-series). Install with `CREATE EXTENSION name;` when the package is available on the server.",
      bn: 'Extension Postgres-এ নতুন ক্ষমতা যোগ করে, আলাদা database ছাড়াই: map/location-এর জন্য PostGIS, AI embedding খোঁজার জন্য pgvector, ধীর query খুঁজতে pg_stat_statements।',
      related: ['sql-postgres-vs-mysql', 'sql-optimize-slow-query'],
    }),
    concept({
      id: 'sql-qc-listen-notify',
      question: 'What are LISTEN and NOTIFY?',
      level: 'advanced',
      tags: ['listen-notify', 'pub-sub', 'postgresql'],
      interview:
        "A lightweight publish/subscribe built into PostgreSQL: sessions `LISTEN channel`, and `NOTIFY channel, 'payload'` (or `pg_notify()`, often from a trigger) delivers a message to them when the sending transaction commits. Useful for cache invalidation and waking workers. Messages are not stored: a listener that is disconnected misses them, so it is not a durable queue.",
      bn: 'Postgres-এর ভেতরেই ছোট একটা "ঘোষণা" ব্যবস্থা: কেউ channel শুনছে, কেউ commit-এর সাথে বার্তা পাঠায়। তবে বার্তা জমা থাকে না, তাই নির্ভরযোগ্য queue-এর বদলে এটা চলবে না।',
    }),
  ],
  notCovered: [
    {
      topic: 'Vendor dialects in depth (T-SQL, PL/SQL, MySQL-specific syntax)',
      reason:
        'The track targets PostgreSQL 16+. Differences that come up in interviews are mentioned inside answers instead.',
    },
    {
      topic: 'ORMs (Prisma, Sequelize, TypeORM, SQLAlchemy, Django ORM)',
      reason:
        'Library-specific; the underlying ideas (N+1 queries, transactions, parameterized queries) are covered in plain SQL.',
    },
    {
      topic: 'Database administration: backups, point-in-time recovery, upgrades, server tuning',
      reason:
        'Operations work rather than developer interviews; only the concepts that affect application code (VACUUM, replication lag, pooling) are included.',
    },
    {
      topic: 'Query planner internals and cost formulas',
      reason:
        'Reading EXPLAIN and fixing slow queries is covered; how costs are computed is rarely asked outside database-engineer roles.',
    },
    {
      topic: 'NoSQL databases (MongoDB, Redis, Cassandra)',
      reason: 'Out of scope for this track; MongoDB is planned as its own track.',
    },
    {
      topic: 'Distributed SQL (Citus, CockroachDB, Spanner)',
      reason: 'Specialized; sharding and the CAP trade-off are covered as quick concepts.',
    },
  ],
  studyTips: [
    'Write every query against the sample database and press Run: predicting the result before running is the fastest way to find gaps.',
    'Say the logical order out loud: FROM → WHERE → GROUP BY → HAVING → window functions → SELECT → ORDER BY → LIMIT. Most "why doesn\'t this work" questions are answered by it.',
    'For every query, ask what happens with NULLs, ties and empty groups. Interviewers love those three edge cases.',
    'Learn the classic patterns by heart: second / N-th highest, top-N per group, duplicates, anti-join (NOT EXISTS), running totals, month-over-month with LAG, and a recursive hierarchy.',
    'When asked to optimize, follow a method: measure → EXPLAIN (ANALYZE) → fix one cause → measure again. Mention indexes last, not first.',
    'For "difference between X and Y" questions, answer with a small comparison table: it shows structured thinking.',
    'Practice explaining in plain words: a one-line definition, then why it matters, then a real example from an app you built.',
  ],
};

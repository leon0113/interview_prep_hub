import { describe, expect, it } from 'vitest';
import {
  createSqlSession,
  lastTable,
  outputText,
  toCell,
  type PgLike,
  type RunResult,
} from '@/lib/sql/session';
import { splitStatements } from '@/lib/sql/split';

describe('splitStatements', () => {
  it('splits on semicolons and drops empty or comment-only fragments', () => {
    expect(splitStatements('SELECT 1; SELECT 2;\n-- done\n;')).toEqual(['SELECT 1', 'SELECT 2']);
  });

  it('ignores semicolons inside strings, quoted identifiers, dollar quotes and comments', () => {
    const script = `INSERT INTO t VALUES ('a;b', 'it''s; fine');
SELECT "weird;name" FROM t; -- trailing; comment
/* block; /* nested; */ still comment; */ SELECT 3;
CREATE FUNCTION f() RETURNS int LANGUAGE sql AS $$ SELECT 1; $$;
DO $body$ BEGIN PERFORM 1; END $body$`;
    expect(splitStatements(script)).toEqual([
      `INSERT INTO t VALUES ('a;b', 'it''s; fine')`,
      `SELECT "weird;name" FROM t`,
      `-- trailing; comment\n/* block; /* nested; */ still comment; */ SELECT 3`,
      `CREATE FUNCTION f() RETURNS int LANGUAGE sql AS $$ SELECT 1; $$`,
      `DO $body$ BEGIN PERFORM 1; END $body$`,
    ]);
  });

  it('keeps a positional parameter like $1 as normal text', () => {
    expect(splitStatements('SELECT $1; SELECT 2')).toEqual(['SELECT $1', 'SELECT 2']);
  });
});

describe('toCell', () => {
  it('turns integers and booleans into JS values and keeps other types as Postgres text', () => {
    expect(toCell('42', 23)).toBe(42);
    expect(toCell('9007199254740993', 20)).toBe('9007199254740993');
    expect(toCell('t', 16)).toBe(true);
    expect(toCell('1500.00', 1700)).toBe('1500.00');
    expect(toCell('2024-03-06 23:59:30', 1114)).toBe('2024-03-06 23:59:30');
    expect(toCell(null, 23)).toBeNull();
  });
});

describe('outputText and lastTable', () => {
  const result: RunResult = {
    ms: 1,
    statements: [
      { kind: 'command', sql: 'BEGIN', tag: 'BEGIN', notices: [] },
      {
        kind: 'rows',
        sql: 'SELECT 1',
        table: { columns: ['n'], rows: [[1]] },
        tag: 'SELECT 1',
        notices: [],
      },
      {
        kind: 'command',
        sql: 'DROP …',
        tag: 'DROP TABLE',
        notices: ['table "x" does not exist, skipping'],
      },
      {
        kind: 'error',
        sql: 'INSERT …',
        message: 'duplicate key value violates unique constraint "t_pkey"',
        detail: 'Key (id)=(1) already exists.',
        notices: [],
      },
    ],
  };

  it('prints command tags, notices and errors like psql (tables are shown separately)', () => {
    expect(outputText(result)).toBe(
      [
        'BEGIN',
        'NOTICE:  table "x" does not exist, skipping',
        'DROP TABLE',
        'ERROR:  duplicate key value violates unique constraint "t_pkey"',
        'DETAIL:  Key (id)=(1) already exists.',
      ].join('\n'),
    );
  });

  it('returns the last result set', () => {
    expect(lastTable(result)).toEqual({ columns: ['n'], rows: [[1]] });
  });
});

describe('createSqlSession', () => {
  /** A stand-in for PGlite that records exec() calls and replays canned protocol messages. */
  function fakePg(messages: unknown[], callbackNotices: string[]) {
    const execs: string[] = [];
    const pg: PgLike = {
      exec: async (sql) => {
        execs.push(sql);
      },
      execProtocol: async (_message, options) => {
        for (const message of callbackNotices) options?.onNotice?.({ message });
        return { messages };
      },
    };
    return { pg, execs };
  }
  const protocol = { serialize: { query: (sql: string) => new TextEncoder().encode(sql) } };

  it('reports a notice once, even though PGlite delivers it twice', async () => {
    const notice = 'closed 1 appointment(s)';
    const { pg } = fakePg(
      [
        { name: 'notice', message: notice },
        { name: 'commandComplete', text: 'CALL' },
      ],
      [notice],
    );
    const run = await createSqlSession(pg, protocol, '').run('CALL p()');
    expect(outputText(run)).toBe(`NOTICE:  ${notice}\nCALL`);
  });

  it('falls back to the notice callback when the messages carry none', async () => {
    const { pg } = fakePg([{ name: 'commandComplete', text: 'DO' }], ['hello']);
    const run = await createSqlSession(pg, protocol, '').run('DO $$ BEGIN END $$');
    expect(outputText(run)).toBe('NOTICE:  hello\nDO');
  });

  it('recreates the public schema with its default USAGE grant on reset', async () => {
    const { pg, execs } = fakePg([], []);
    await createSqlSession(pg, protocol, 'SELECT 1').reset();
    expect(execs.join('\n')).toContain('GRANT USAGE ON SCHEMA public TO PUBLIC');
  });
});

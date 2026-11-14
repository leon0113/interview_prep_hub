import { splitStatements } from './split';

/*
 * Runs SQL against PGlite (PostgreSQL compiled to WebAssembly) and reports results the way
 * psql shows them. Shared by the in-browser Run button / Playground and by the Vitest verifier
 * (tests/verify/sql.verify.ts), so what a reader sees when they press Run is exactly what the
 * content was verified against.
 */

export type Cell = string | number | boolean | null;

export interface Table {
  columns: string[];
  rows: Cell[][];
}

export type StatementResult =
  | { kind: 'rows'; sql: string; table: Table; tag: string; notices: string[] }
  | { kind: 'command'; sql: string; tag: string; notices: string[] }
  | {
      kind: 'error';
      sql: string;
      message: string;
      detail?: string;
      hint?: string;
      notices: string[];
    };

export interface RunResult {
  statements: StatementResult[];
  /** Wall-clock time spent executing the statements. */
  ms: number;
}

/** The part of PGlite this module needs (keeps PGlite itself out of this module's imports). */
export interface PgLike {
  exec(sql: string): Promise<unknown>;
  execProtocol(
    message: Uint8Array,
    options?: { throwOnError?: boolean; onNotice?: (notice: { message?: string }) => void },
  ): Promise<{ messages: unknown[] }>;
}
export interface ProtocolLike {
  serialize: { query(sql: string): Uint8Array };
}

interface BackendMessage {
  name: string;
  fields?: unknown[];
  text?: string;
  message?: string;
  detail?: string;
  hint?: string;
}

const BOOL_OID = 16;
const INTEGER_OIDS = new Set([20, 21, 23, 26]); // int8, int2, int4, oid

/**
 * A raw text value from Postgres -> a cell. Integers become numbers and booleans true/false;
 * every other type keeps Postgres's own text (`1500.00`, `2024-03-06 23:59:30`, JSONB text,
 * `{1,2}` arrays), exactly as psql prints it.
 */
export function toCell(raw: string | null, oid: number): Cell {
  if (raw === null) return null;
  if (oid === BOOL_OID) return raw === 't';
  if (INTEGER_OIDS.has(oid)) {
    const value = Number(raw);
    return Number.isSafeInteger(value) ? value : raw;
  }
  return raw;
}

async function runStatement(pg: PgLike, protocol: ProtocolLike, sql: string) {
  // PGlite reports a notice both through onNotice and in the returned messages. Prefer the
  // messages (they keep their order relative to the result) and fall back to the callback only
  // when the messages carry none, so each notice is reported exactly once.
  const notices: string[] = [];
  const callbackNotices: string[] = [];
  const { messages } = await pg.execProtocol(protocol.serialize.query(sql), {
    throwOnError: false,
    onNotice: (notice) => {
      if (notice.message) callbackNotices.push(notice.message);
    },
  });
  if (!(messages as BackendMessage[]).some((m) => m.name === 'notice')) {
    notices.push(...callbackNotices);
  }
  let columns: { name: string; oid: number }[] | undefined;
  const rows: Cell[][] = [];
  let tag = '';
  for (const raw of messages as BackendMessage[]) {
    if (raw.name === 'rowDescription') {
      columns = (raw.fields as { name: string; dataTypeID: number }[]).map((f) => ({
        name: f.name,
        oid: f.dataTypeID,
      }));
    } else if (raw.name === 'dataRow' && columns) {
      const cols = columns;
      rows.push((raw.fields as (string | null)[]).map((value, i) => toCell(value, cols[i]!.oid)));
    } else if (raw.name === 'commandComplete') {
      tag = raw.text ?? '';
    } else if (raw.name === 'error') {
      return {
        kind: 'error' as const,
        sql,
        message: raw.message ?? 'error',
        ...(raw.detail ? { detail: raw.detail } : {}),
        ...(raw.hint ? { hint: raw.hint } : {}),
        notices,
      };
    } else if (raw.name === 'notice' && raw.message) {
      notices.push(raw.message);
    }
  }
  return columns
    ? {
        kind: 'rows' as const,
        sql,
        table: { columns: columns.map((c) => c.name), rows },
        tag,
        notices,
      }
    : { kind: 'command' as const, sql, tag, notices };
}

export interface SqlSession {
  /** Runs a script statement by statement, keeping database state between runs. */
  run(script: string): Promise<RunResult>;
  /** Drops everything and re-creates the sample database from its seed. */
  reset(): Promise<void>;
}

export function createSqlSession(pg: PgLike, protocol: ProtocolLike, seedSql: string): SqlSession {
  // One connection: run scripts strictly one after another, even if callers overlap.
  let queue: Promise<unknown> = Promise.resolve();
  const exclusive = <T>(task: () => Promise<T>): Promise<T> => {
    const next = queue.then(task, task);
    queue = next.catch(() => undefined);
    return next;
  };

  return {
    run: (script) =>
      exclusive(async () => {
        const started = performance.now();
        const statements: StatementResult[] = [];
        for (const sql of splitStatements(script)) {
          statements.push(await runStatement(pg, protocol, sql));
        }
        return { statements, ms: performance.now() - started };
      }),
    reset: () =>
      exclusive(async () => {
        // Leave any transaction a previous script left open, clear session state (settings,
        // temp tables, prepared statements), then rebuild the schema from the seed.
        await runStatement(pg, protocol, 'ROLLBACK');
        await pg.exec('DISCARD ALL');
        // Recreate public with the grant PostgreSQL gives it by default, so roles an example
        // creates (GRANT ... TO reporting_user; SET ROLE reporting_user) can still see the tables.
        await pg.exec(
          'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT USAGE ON SCHEMA public TO PUBLIC;',
        );
        // Roles are cluster-wide, so they survive the schema drop: remove any an example made.
        await pg.exec(`DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT rolname FROM pg_roles
           WHERE rolname NOT LIKE 'pg\\_%' AND rolname <> current_user LOOP
    EXECUTE format('DROP ROLE %I', r.rolname);
  END LOOP;
END $$;`);
        await pg.exec("SET TimeZone TO 'UTC'; SET DateStyle TO 'ISO, YMD';");
        await pg.exec(seedSql);
      }),
  };
}

/** psql-style text for everything except result tables: command tags, notices and errors. */
export function outputText(result: RunResult): string {
  const lines: string[] = [];
  for (const statement of result.statements) {
    for (const notice of statement.notices) lines.push(`NOTICE:  ${notice}`);
    if (statement.kind === 'command') lines.push(statement.tag);
    if (statement.kind === 'error') {
      lines.push(`ERROR:  ${statement.message}`);
      if (statement.detail) lines.push(`DETAIL:  ${statement.detail}`);
      if (statement.hint) lines.push(`HINT:  ${statement.hint}`);
    }
  }
  return lines.join('\n');
}

/** The rows of the last statement that returned a result set (what an example shows). */
export function lastTable(result: RunResult): Table | undefined {
  const tables = result.statements.filter((s) => s.kind === 'rows');
  const last = tables.at(-1);
  return last && last.kind === 'rows' ? last.table : undefined;
}

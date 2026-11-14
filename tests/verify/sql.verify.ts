import { PGlite, protocol } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildSeedSql } from '@/content/dataset';
import type { CodeExample, Question, ResultTable } from '@/content/schema';
import track from '@/content/sql';
import { dataset } from '@/content/sql/dataset';
import {
  createSqlSession,
  lastTable,
  outputText,
  type RunResult,
  type SqlSession,
} from '@/lib/sql/session';
import { normalize } from './run';

/**
 * Runs every SQL example and exercise solution against the clinic sample database in real
 * PostgreSQL (PGlite) and compares the result with what the content shows.
 *
 *   npm run verify:outputs
 *
 * Each case starts from a freshly seeded database, so examples that change data, create
 * objects or manage their own transactions cannot affect each other. The runner is the same
 * one the in-browser Run button and Playground use (src/lib/sql/session.ts).
 */

let session: SqlSession;

beforeAll(async () => {
  const pg = await PGlite.create();
  session = createSqlSession(pg, protocol, buildSeedSql(dataset));
}, 60_000);

const questions: Question[] = [
  ...track.sections.flatMap((section) => section.questions),
  ...track.coverage.quickConcepts,
];

const examples = questions.flatMap((question) =>
  (question.answer.examples ?? []).flatMap((example: CodeExample, index) =>
    example.lang === 'sql' ? [{ key: `${question.id}#${index + 1}`, example }] : [],
  ),
);

function errorsOf(result: RunResult): string[] {
  return result.statements.flatMap((s) => (s.kind === 'error' ? [s.message] : []));
}

function expectTable(result: RunResult, expected: ResultTable) {
  expect(lastTable(result), 'the query returned no rows').toEqual({
    columns: expected.columns,
    rows: expected.rows,
  });
}

async function fresh(script: string): Promise<RunResult> {
  await session.reset();
  return session.run(script);
}

describe('sql', () => {
  it('seeds every table with exactly its dataset rows', async () => {
    await session.reset();
    for (const table of dataset.tables) {
      const result = await session.run(`SELECT count(*) AS n FROM ${table.name}`);
      expect(lastTable(result)?.rows, table.name).toEqual([[table.rows.length]]);
    }
  });

  it.each(examples)('$key', async ({ example }) => {
    const result = await fresh(example.code);
    if (example.resultTable) expectTable(result, example.resultTable);
    if (example.output !== undefined) {
      expect(normalize(outputText(result))).toBe(normalize(example.output));
    } else {
      // Errors are only allowed when the example documents them in `output`.
      expect(errorsOf(result)).toEqual([]);
    }
  });

  describe('exercises: every solution + the sample run', () => {
    const cases = track.exercises.flatMap((exercise) =>
      [
        { label: 'sample run', code: exercise.sampleRun.code },
        ...exercise.solutions.map((s) => ({ label: s.label, code: s.code })),
      ].map((c) => ({ key: `${exercise.id} · ${c.label}`, code: c.code, run: exercise.sampleRun })),
    );
    if (cases.length === 0) it.todo('no SQL exercises yet');
    else
      it.each(cases)('$key', async ({ code, run }) => {
        const result = await fresh(code);
        expect(errorsOf(result)).toEqual([]);
        if (run.resultTable) expectTable(result, run.resultTable);
        if (run.output !== undefined)
          expect(normalize(outputText(result))).toBe(normalize(run.output));
      });
  });
});

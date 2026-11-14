import { describe, expect, it } from 'vitest';
import track from '@/content/javascript';
import type { CodeExample, Question } from '@/content/schema';
import { normalize, runCode } from './run';

/**
 * Runs every JavaScript example and exercise on Node and checks the written output.
 *
 *   npm run verify:outputs
 *
 * Code runs as a classic (sloppy-mode) script, like a browser <script> tag. Examples that
 * need strict mode say "use strict" themselves; code with import/export runs as an ES module.
 * Examples that cannot give the same output twice are listed in SKIP with the reason.
 */

/** `${questionId}#${exampleIndex}` (1-based) -> why it cannot be checked automatically. */
const SKIP: Record<string, string> = {};

const isModule = (code: string) => /^\s*(import|export)\s/m.test(code);
const run = (code: string) => runCode('node', [], code, isModule(code) ? '.mjs' : '.cjs');

const questions: Question[] = [
  ...track.sections.flatMap((section) => section.questions),
  ...track.coverage.quickConcepts,
];

const examples = questions.flatMap((question) =>
  (question.answer.examples ?? []).flatMap((example: CodeExample, index) =>
    example.lang === 'javascript' && example.output !== undefined
      ? [{ key: `${question.id}#${index + 1}`, example }]
      : [],
  ),
);

describe('javascript outputs', () => {
  it.each(examples)('$key', ({ key, example }) => {
    if (SKIP[key]) return;
    const result = run(example.code);
    expect(result.output, result.stderr).toBe(normalize(example.output ?? ''));
  });

  describe('exercises: every solution + sample run', () => {
    const cases = track.exercises.flatMap((exercise) =>
      exercise.solutions.map((solution) => ({
        key: `${exercise.id} · ${solution.label}`,
        code: `${solution.code}\n\n${exercise.sampleRun.code}\n`,
        expected: exercise.sampleRun.output ?? '',
      })),
    );
    it.each(cases)('$key', ({ key, code, expected }) => {
      if (SKIP[key]) return;
      const result = run(code);
      expect(result.output, result.stderr).toBe(normalize(expected));
    });
  });

  it('only skips examples that exist', () => {
    const keys = new Set([
      ...examples.map((e) => e.key),
      ...track.exercises.flatMap((e) => e.solutions.map((s) => `${e.id} · ${s.label}`)),
    ]);
    for (const key of Object.keys(SKIP)) expect(keys, key).toContain(key);
  });
});

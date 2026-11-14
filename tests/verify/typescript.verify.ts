import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import ts from 'typescript';
import { beforeAll, describe, expect, it } from 'vitest';
import track from '@/content/typescript';
import type { CodeExample, Question } from '@/content/schema';
import { normalize, runCode } from './run';

/**
 * Checks every TypeScript example and exercise:
 *
 * 1. **Type-check** — all snippets are compiled together by `tsc` with `strict: true`, each as
 *    its own module. A snippet must compile cleanly; lines that are *meant* to fail are marked
 *    `// @ts-expect-error`, which makes tsc fail if the error ever disappears.
 * 2. **Documented errors** — `// @ts-expect-error ❌ <message>` shows readers the compiler
 *    error. A copy of the snippet with those directives blanked out is compiled as well, and
 *    tsc must report a diagnostic containing <message> on the line that follows.
 * 3. **Run** — snippets with an `output` are transpiled by TypeScript (`transpileModule`,
 *    ES2023 target, so enums, decorators and `using` behave exactly as tsc emits them), run on
 *    Node as an ES module, and stdout must equal the written output.
 *
 *   npm run verify:outputs
 */

/** `${key}` -> why it cannot be run automatically (it is still type-checked). */
const SKIP_RUN: Record<string, string> = {};

const DOCUMENTED_ERROR = /\/\/ @ts-expect-error ❌ (.+)$/;

interface Case {
  key: string;
  code: string;
  output?: string;
  file: string;
}

const questions: Question[] = [
  ...track.sections.flatMap((section) => section.questions),
  ...track.coverage.quickConcepts,
];

const cases: Case[] = [
  ...questions.flatMap((question) =>
    (question.answer.examples ?? []).flatMap((example: CodeExample, index) =>
      example.lang === 'typescript'
        ? [{ key: `${question.id}#${index + 1}`, code: example.code, output: example.output }]
        : [],
    ),
  ),
  ...track.exercises.flatMap((exercise) =>
    exercise.solutions.map((solution) => ({
      key: `${exercise.id} · ${solution.label}`,
      code: `${solution.code}\n\n${exercise.sampleRun.code}\n`,
      output: exercise.sampleRun.output,
    })),
  ),
].map((c, i) => ({ ...c, file: `case-${i}.ts` }));

const bareFile = (file: string) => file.replace(/\.ts$/, '.bare.ts');

const documentedErrors = cases.flatMap((c) =>
  c.code.split('\n').flatMap((line, index) => {
    const message = DOCUMENTED_ERROR.exec(line)?.[1]?.trim();
    // Diagnostics are 1-based; the error belongs to the line after the directive.
    const target = index + 2;
    return message
      ? [{ key: `${c.key} (line ${target})`, file: bareFile(c.file), line: target, message }]
      : [];
  }),
);

// Inside the project so snippets can import installed packages (e.g. zod) in tsc and in Node.
const dir = join(process.cwd(), 'node_modules', '.cache', 'iph-verify-ts');
const diagnostics = new Map<string, string[]>();

beforeAll(() => {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const c of cases) {
    writeFileSync(join(dir, c.file), c.code, 'utf8');
    if (c.code.split('\n').some((line) => DOCUMENTED_ERROR.test(line))) {
      const bare = c.code
        .split('\n')
        .map((line) => line.replace(DOCUMENTED_ERROR, '//'))
        .join('\n');
      writeFileSync(join(dir, bareFile(c.file)), bare, 'utf8');
    }
  }
  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        target: 'ES2023',
        lib: ['ESNext', 'DOM'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        moduleDetection: 'force',
        types: [],
        noEmit: true,
        skipLibCheck: true,
      },
      include: ['*.ts'],
    }),
  );
  const tsc = createRequire(import.meta.url).resolve('typescript/lib/tsc.js');
  const result = spawnSync(process.execPath, [tsc, '-p', '.', '--pretty', 'false'], {
    cwd: dir,
    encoding: 'utf8',
  });
  for (const line of normalize(result.stdout ?? '').split('\n')) {
    const match = /^(case-\d+(?:\.bare)?\.ts)\((\d+),\d+\): (error TS\d+: .*)$/.exec(line);
    if (!match) continue;
    const [, file, lineNo, message] = match;
    diagnostics.set(file!, [...(diagnostics.get(file!) ?? []), `line ${lineNo}: ${message}`]);
  }
}, 120_000);

describe('typescript', () => {
  it.each(cases)('type-checks $key', ({ file }) => {
    expect(diagnostics.get(file) ?? []).toEqual([]);
  });

  it.each(documentedErrors)('reports the documented error: $key', ({ file, line, message }) => {
    const onLine = (diagnostics.get(file) ?? []).filter((d) => d.startsWith(`line ${line}:`));
    expect(onLine.join('\n')).toContain(message);
  });

  it.each(cases.filter((c) => c.output !== undefined))('runs $key', ({ key, code, output }) => {
    if (SKIP_RUN[key]) return;
    const js = ts.transpileModule(code, {
      compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
    }).outputText;
    const result = runCode('node', [], js, '.mjs', dir);
    expect(result.output, result.stderr).toBe(normalize(output ?? ''));
  });

  it('only skips cases that exist', () => {
    const keys = new Set(cases.map((c) => c.key));
    for (const key of Object.keys(SKIP_RUN)) expect(keys, key).toContain(key);
  });
});

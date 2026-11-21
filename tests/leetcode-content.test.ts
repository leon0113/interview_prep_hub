import { describe, expect, it } from 'vitest';
import { lcProblems } from '@/content/leetcode';
import committedOutline from '@/content/leetcode/lc-outline.generated.json';
import { buildLcOutline, serializeLcOutline } from '@/content/leetcode/outline';
import { getPattern, patternFamilies, patterns } from '@/content/leetcode/patterns';
import { practiceGroups } from '@/content/leetcode/practice';
import { getTopicMeta } from '@/content/leetcode/topics';
import {
  GENERATED_KEYS,
  LcProblemSchema,
  type ArrayState,
  type LcProblem,
} from '@/content/leetcode/schema';
import { LC_ARRAY_POINTERS, vizIds } from '@/visualizations/registry';
import { fibonacciRun, layoutTree, powerOfTwoRun } from '@/visualizations/leetcode/recursionSteps';
import { stepsTraces } from '@/visualizations/leetcode/steps';

/** Every problem file on disk, keyed by path, to check names and registration. */
const files = import.meta.glob<LcProblem>('/src/content/leetcode/*/[0-9]*.ts', {
  import: 'default',
  eager: true,
});

const byId = (p: LcProblem) => p.id;

describe('LeetCode content', () => {
  it.each(lcProblems.map((p) => [p.id, p] as const))('%s matches the schema', (_, problem) => {
    const result = LcProblemSchema.safeParse(problem);
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
  });

  it('every problem file is registered, lives in its category folder and is named <number>-<slug>', () => {
    const registered = new Set(lcProblems.map(byId));
    for (const [path, problem] of Object.entries(files)) {
      expect(registered.has(problem.id), `${path} is not listed in its category index.ts`).toBe(
        true,
      );
      expect(path).toBe(`/src/content/leetcode/${problem.category}/${problem.slug}.ts`);
    }
    expect(Object.keys(files)).toHaveLength(lcProblems.length);
  });

  it('numbers, ids and slugs are unique', () => {
    for (const key of ['number', 'id', 'slug'] as const) {
      const values = lcProblems.map((p) => p[key]);
      expect(new Set(values).size, key).toBe(values.length);
    }
  });

  it('topic ids exist in topics/index.ts', () => {
    for (const p of lcProblems) {
      if (p.topicId) expect(getTopicMeta(p.topicId), `${p.id} → ${p.topicId}`).toBeDefined();
    }
  });

  it('pattern ids exist in patterns.ts', () => {
    for (const p of lcProblems) {
      expect(getPattern(p.patternId), `${p.id} → ${p.patternId}`).toBeDefined();
      for (const id of p.alsoPatterns ?? [])
        expect(getPattern(id), `${p.id} → ${id}`).toBeDefined();
    }
  });

  it('every pattern belongs to exactly one family, and practice groups use real patterns', () => {
    const inFamilies = patternFamilies.flatMap((f) => f.patternIds);
    expect([...inFamilies].sort()).toEqual(patterns.map((p) => p.id).sort());
    for (const group of practiceGroups) {
      for (const id of group.patternIds) expect(getPattern(id), group.title).toBeDefined();
    }
  });

  it('visualization ids are registered (or mean "animate the steps traces")', () => {
    for (const p of lcProblems) {
      if (!p.visualizationId) continue;
      if (p.visualizationId === LC_ARRAY_POINTERS) {
        expect(
          stepsTraces(p).length,
          `${p.id} uses ${LC_ARRAY_POINTERS} without steps`,
        ).toBeGreaterThan(0);
      } else {
        expect(vizIds, p.id).toContain(p.visualizationId);
      }
    }
  });

  it('related links point at other problems, and generated-block keys are known', () => {
    for (const p of lcProblems) {
      for (const rel of p.revise.related) expect(rel.number, p.id).not.toBe(p.number);
      const labels = p.solutions.map((s) => GENERATED_KEYS.solution(s.label));
      const known = new Set<string>([
        GENERATED_KEYS.idea,
        GENERATED_KEYS.template,
        GENERATED_KEYS.steps,
        GENERATED_KEYS.related,
        GENERATED_KEYS.note,
        ...labels,
      ]);
      for (const key of p.meta?.generated ?? [])
        expect(known.has(key), `${p.id}: ${key}`).toBe(true);
      if (p.meta?.generated?.includes(GENERATED_KEYS.steps)) {
        expect(stepsTraces(p).length, p.id).toBeGreaterThan(0);
      }
    }
  });

  it('my own solution comes first, and only one solution per problem is optimal', () => {
    for (const p of lcProblems) {
      expect(p.solutions[0]?.isMine, p.id).toBe(true);
      expect(p.solutions.filter((s) => s.optimal).length, p.id).toBeLessThanOrEqual(1);
    }
  });

  it('every solution states its time and space complexity', () => {
    for (const p of lcProblems) {
      for (const s of p.solutions) {
        expect(s.complexity.time.trim(), `${p.id}: ${s.label}`).not.toBe('');
        expect(s.complexity.space.trim(), `${p.id}: ${s.label}`).not.toBe('');
      }
    }
  });

  it('lc-outline.generated.json is up to date (run npm run gen:outlines)', () => {
    expect(serializeLcOutline(committedOutline as ReturnType<typeof buildLcOutline>)).toBe(
      serializeLcOutline(buildLcOutline(lcProblems)),
    );
  });
});

describe('LeetCode steps traces', () => {
  const traces = lcProblems.flatMap((p) =>
    stepsTraces(p).map((block, i) => ({ key: `${p.id} steps #${i + 1}`, problem: p, block })),
  );

  function checkBounds(key: string, state: ArrayState) {
    const within = (array: readonly unknown[], pointers: Record<string, number>, where: string) => {
      for (const [name, at] of Object.entries(pointers)) {
        expect(at, `${key} ${where} pointer ${name}`).toBeGreaterThanOrEqual(-1);
        expect(at, `${key} ${where} pointer ${name}`).toBeLessThanOrEqual(array.length);
      }
    };
    within(state.array, state.pointers, 'main');
    for (const i of state.highlight ?? [])
      expect(i, `${key} highlight`).toBeLessThan(state.array.length);
    if (state.dividerAt !== undefined) {
      expect(state.dividerAt, `${key} divider`).toBeLessThanOrEqual(state.array.length);
    }
    if (state.secondary) {
      within(state.secondary.array, state.secondary.pointers, 'secondary');
      for (const i of state.secondary.highlight ?? []) {
        expect(i, `${key} secondary highlight`).toBeLessThan(state.secondary.array.length);
      }
    }
    if (state.move) {
      for (const end of [state.move.from, state.move.to]) {
        const array = end.array === 'primary' ? state.array : (state.secondary?.array ?? []);
        expect(end.index, `${key} move`).toBeGreaterThanOrEqual(0);
        expect(end.index, `${key} move`).toBeLessThan(array.length);
      }
    }
  }

  it.each(traces)(
    '$key: pointers, highlights and dividers stay inside the arrays',
    ({ key, block }) => {
      for (const state of block.arrayStates) checkBounds(key, state);
    },
  );

  it.each(traces)('$key: every step keeps the array length', ({ key, block }) => {
    const length = block.arrayStates[0]!.array.length;
    for (const state of block.arrayStates) expect(state.array.length, key).toBe(length);
  });

  it.each(traces)(
    '$key: the walk-through ends where the solution does (same input as a verified case)',
    ({ key, problem, block }) => {
      const first = block.arrayStates[0]!.array;
      const last = block.arrayStates.at(-1)!.array;
      const match = problem.verify?.cases.find(
        (c) => c.mutates?.arg === 0 && JSON.stringify(c.args[0]) === JSON.stringify(first),
      );
      if (!match?.mutates) return;
      const { value, prefix, unordered } = match.mutates;
      const part = prefix === undefined ? last : last.slice(0, prefix);
      const norm = (xs: readonly unknown[]) =>
        unordered ? [...xs].map((x) => JSON.stringify(x)).sort() : xs.map((x) => JSON.stringify(x));
      expect(norm(part), key).toEqual(norm(value));
    },
  );
});

describe('recursion visualization steps', () => {
  it('fib(4) makes 9 calls, 4 of them repeated work; with a memo, 7 calls', () => {
    const plain = fibonacciRun(4, false);
    expect(plain.nodes).toHaveLength(9);
    const last = plain.steps.at(-1)!.state;
    // Call order: fib(4) fib(3) fib(2) fib(1) fib(0) | fib(1) fib(2) fib(1) fib(0) — the
    // second half recomputes arguments already seen.
    expect(last.repeated.map((id) => plain.nodes[id]!.label)).toEqual([
      'fib(1)',
      'fib(2)',
      'fib(1)',
      'fib(0)',
    ]);
    expect(last.value[0]).toBe('3');
    const memo = fibonacciRun(4, true);
    expect(memo.nodes).toHaveLength(7);
    expect(Object.values(memo.steps.at(-1)!.state.status)).toContain('memo');
  });

  it('isPowerOfTwo runs match the #231 trace', () => {
    expect(powerOfTwoRun(16).nodes.map((n) => n.arg)).toEqual([16, 8, 4, 2, 1]);
    expect(powerOfTwoRun(6).nodes.map((n) => n.arg)).toEqual([6, 3]);
    expect(powerOfTwoRun(16).steps.at(-1)!.state.value[0]).toBe('true');
    expect(powerOfTwoRun(6).steps.at(-1)!.state.value[0]).toBe('false');
  });

  it('lays the tree out with leaves left to right and parents centred', () => {
    const { nodes } = fibonacciRun(4, false);
    const { x, width } = layoutTree(nodes);
    expect(width).toBe(5);
    expect(x[0]).toBeGreaterThan(0);
  });
});

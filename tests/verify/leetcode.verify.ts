import { describe, expect, it } from 'vitest';
import { lcProblems } from '@/content/leetcode';
import type { LcProblem, LcSolution } from '@/content/leetcode/schema';
import { pythonAvailable, runCode } from './run';

/**
 * Runs every LeetCode solution (mine and the alternatives) against the problem's samples
 * (`verify.cases`) on Node / CPython and compares the return value and any array the
 * solution changes in place.
 *
 *   npm run verify:outputs
 */

type Case = NonNullable<LcProblem['verify']>['cases'][number];
interface Outcome {
  ret: unknown;
  args: unknown[];
}

function jsProgram(solution: LcSolution, entry: string, cases: Case[]): string {
  return `${solution.code}
const __cases = ${JSON.stringify(cases.map((c) => c.args))};
const __out = __cases.map((args) => {
  const ret = ${entry}(...args);
  return { ret: ret === undefined ? null : ret, args };
});
console.log(JSON.stringify(__out));
`;
}

function pyProgram(solution: LcSolution, entry: string, cases: Case[]): string {
  return `${solution.code}

import json as __json
__out = []
for __args in __json.loads(${JSON.stringify(JSON.stringify(cases.map((c) => c.args)))}):
    __ret = Solution().${entry}(*__args)
    __out.append({"ret": __ret, "args": __args})
print(__json.dumps(__out))
`;
}

const hasPython = pythonAvailable();

const runs = lcProblems.flatMap((problem) => {
  const verify = problem.verify;
  if (!verify) return [];
  return problem.solutions.flatMap((solution) => {
    const entry =
      solution.lang === 'javascript'
        ? verify.entry.javascript
        : solution.lang === 'python'
          ? verify.entry.python
          : undefined;
    return entry
      ? [{ key: `${problem.id} · ${solution.label}`, solution, entry, cases: verify.cases }]
      : [];
  });
});

const norm = (xs: readonly unknown[], unordered?: boolean) => {
  const items = xs.map((x) => JSON.stringify(x));
  return unordered ? items.sort() : items;
};

describe('LeetCode solutions', () => {
  it('every problem with code has verify cases', () => {
    // Problems accepted on LeetCode (e.g. linked lists, which need ListNode input) may skip them.
    const missing = lcProblems.filter(
      (p) => p.category === 'dsa' && !p.verify && !p.acceptedOnLeetCode,
    );
    expect(missing.map((p) => p.id)).toEqual([]);
  });

  it.each(runs)('$key', ({ solution, entry, cases }) => {
    if (solution.lang === 'python' && !hasPython) return;
    const program =
      solution.lang === 'javascript'
        ? jsProgram(solution, entry, cases)
        : pyProgram(solution, entry, cases);
    const result =
      solution.lang === 'javascript'
        ? runCode('node', [], program, '.cjs')
        : runCode('python', [], program, '.py');
    expect(result.ok, result.stderr).toBe(true);
    const outcomes = JSON.parse(result.output) as Outcome[];

    cases.forEach((testCase, i) => {
      const outcome = outcomes[i]!;
      const label = `case ${i + 1}: ${JSON.stringify(testCase.args)}`;
      if (testCase.returns !== undefined) expect(outcome.ret, label).toEqual(testCase.returns);
      if (testCase.mutates) {
        const { arg, value, prefix, unordered } = testCase.mutates;
        const changed = outcome.args[arg] as unknown[];
        const part = prefix === undefined ? changed : changed.slice(0, prefix);
        expect(norm(part, unordered), label).toEqual(norm(value, unordered));
      }
    });
  });
});

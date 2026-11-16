import type { ArrayState, LcProblem, TraceBlock } from '@/content/leetcode/schema';

type StepsBlock = Extract<TraceBlock, { kind: 'steps' }>;

/** The `steps` traces of a problem, in order (the array visualizer animates these). */
export function stepsTraces(problem: Pick<LcProblem, 'breakdown'>): StepsBlock[] {
  return problem.breakdown.trace.filter((block): block is StepsBlock => block.kind === 'steps');
}

/** The array states of a problem's n-th `steps` trace. Throws if it is missing. */
export function stepsOf(problem: Pick<LcProblem, 'breakdown' | 'id'>, n = 0): ArrayState[] {
  const block = stepsTraces(problem)[n];
  if (!block) throw new Error(`${problem.id} has no steps trace #${n}`);
  return block.arrayStates;
}

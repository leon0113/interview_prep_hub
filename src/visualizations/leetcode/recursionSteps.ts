/**
 * Builds the step list for the recursion-tree visualization by actually running the
 * recursion and recording every call and return. Pure, so tests can check it.
 */

export type NodeStatus = 'active' | 'waiting' | 'done' | 'memo';

export interface CallNode {
  id: number;
  parent: number | null;
  label: string;
  /** Argument, used to spot repeated subproblems. */
  arg: number;
  depth: number;
}

export interface RecursionState {
  /** Nodes created so far (the tree grows). */
  visible: number[];
  status: Record<number, NodeStatus>;
  /** Return value once known. */
  value: Record<number, string>;
  /** Nodes whose argument was already computed earlier: wasted repeated work. */
  repeated: number[];
  /** Call stack, bottom first. */
  stack: string[];
}

export interface RecursionStep {
  state: RecursionState;
  text: string;
  bn?: string;
}

export interface RecursionRun {
  nodes: CallNode[];
  steps: RecursionStep[];
}

interface Recorder {
  nodes: CallNode[];
  steps: RecursionStep[];
  visible: number[];
  status: Record<number, NodeStatus>;
  value: Record<number, string>;
  repeated: number[];
  stack: number[];
  seen: Set<number>;
}

function snapshot(r: Recorder, text: string, bn?: string) {
  r.steps.push({
    state: {
      visible: [...r.visible],
      status: { ...r.status },
      value: { ...r.value },
      repeated: [...r.repeated],
      stack: r.stack.map((id) => r.nodes[id]!.label),
    },
    text,
    bn,
  });
}

function open(r: Recorder, label: string, arg: number, parent: number | null): number {
  const id = r.nodes.length;
  r.nodes.push({
    id,
    parent,
    label,
    arg,
    depth: parent === null ? 0 : r.nodes[parent]!.depth + 1,
  });
  r.visible.push(id);
  if (parent !== null) r.status[parent] = 'waiting';
  r.status[id] = 'active';
  r.stack.push(id);
  if (r.seen.has(arg)) r.repeated.push(id);
  r.seen.add(arg);
  return id;
}

function close(r: Recorder, id: number, result: string, status: NodeStatus = 'done') {
  r.status[id] = status;
  r.value[id] = result;
  r.stack.pop();
  const parent = r.nodes[id]!.parent;
  if (parent !== null) r.status[parent] = 'active';
}

function recorder(): Recorder {
  return {
    nodes: [],
    steps: [],
    visible: [],
    status: {},
    value: {},
    repeated: [],
    stack: [],
    seen: new Set(),
  };
}

/** fib(n) as plain tree recursion, or with a memo that cuts repeated calls. */
export function fibonacciRun(n: number, withMemo: boolean): RecursionRun {
  const r = recorder();
  const memo = new Map<number, number>();

  function fib(k: number, parent: number | null): number {
    const id = open(r, `fib(${k})`, k, parent);
    if (withMemo && memo.has(k)) {
      const cached = memo.get(k)!;
      snapshot(
        r,
        `fib(${k}) is already in the memo: return ${cached} without recursing.`,
        'memo তে আগেই আছে, আর ভাঙতে হয় না।',
      );
      close(r, id, String(cached), 'memo');
      return cached;
    }
    if (k <= 1) {
      snapshot(r, `fib(${k}): base case, return ${k}.`, 'base case, এখানেই থামে।');
      close(r, id, String(k));
      return k;
    }
    const repeatedNote = r.repeated.includes(id)
      ? ` fib(${k}) was already computed once: this whole subtree is repeated work.`
      : '';
    snapshot(r, `Call fib(${k}): needs fib(${k - 1}) + fib(${k - 2}).${repeatedNote}`);
    const a = fib(k - 1, id);
    const b = fib(k - 2, id);
    const result = a + b;
    if (withMemo) memo.set(k, result);
    r.status[id] = 'active';
    snapshot(
      r,
      `fib(${k}) = ${a} + ${b} = ${result}${withMemo ? `, saved in the memo` : ''}. Return it.`,
    );
    close(r, id, String(result));
    return result;
  }

  const answer = fib(n, null);
  snapshot(
    r,
    withMemo
      ? `Done: fib(${n}) = ${answer} with ${r.nodes.length} calls. Repeated calls end immediately.`
      : `Done: fib(${n}) = ${answer} with ${r.nodes.length} calls, ${r.repeated.length} of them repeated work.`,
    withMemo
      ? 'memo থাকায় প্রতিটা subproblem একবারই হিসাব হয়।'
      : 'একই subproblem বারবার হিসাব হওয়াই O(2ⁿ) এর কারণ।',
  );
  return { nodes: r.nodes, steps: r.steps };
}

/** isPowerOfTwo(n) from #231: a chain of halving calls. */
export function powerOfTwoRun(n: number): RecursionRun {
  const r = recorder();

  function isPowerOfTwo(k: number, parent: number | null): boolean {
    const id = open(r, `isPowerOfTwo(${k})`, k, parent);
    if (k === 1) {
      snapshot(r, `n === 1: base case, return true.`, '2⁰ = 1, তাই true।');
      close(r, id, 'true');
      return true;
    }
    if (k < 1 || k % 2 !== 0) {
      snapshot(
        r,
        k < 1 ? `n < 1: return false.` : `${k} is odd and not 1: return false.`,
        k < 1 ? '0 বা negative কখনো 2 এর power না।' : 'বিজোড়, সমান দুই ভাগ হয় না।',
      );
      close(r, id, 'false');
      return false;
    }
    snapshot(r, `${k} is even: ask isPowerOfTwo(${k / 2}).`);
    const result = isPowerOfTwo(k / 2, id);
    r.status[id] = 'active';
    snapshot(r, `isPowerOfTwo(${k}) returns ${result} (passed up unchanged).`);
    close(r, id, String(result));
    return result;
  }

  const answer = isPowerOfTwo(n, null);
  snapshot(r, `Done: isPowerOfTwo(${n}) = ${answer}, ${r.nodes.length} calls deep.`);
  return { nodes: r.nodes, steps: r.steps };
}

/** x position (in leaf units) of every node: leaves left to right, parents centred. */
export function layoutTree(nodes: readonly CallNode[]): {
  x: Record<number, number>;
  width: number;
} {
  const children = new Map<number, number[]>();
  for (const node of nodes) {
    if (node.parent !== null)
      children.set(node.parent, [...(children.get(node.parent) ?? []), node.id]);
  }
  const x: Record<number, number> = {};
  let next = 0;
  function place(id: number): number {
    const kids = children.get(id) ?? [];
    if (kids.length === 0) {
      x[id] = next++;
    } else {
      const xs = kids.map(place);
      x[id] = (xs[0]! + xs.at(-1)!) / 2;
    }
    return x[id]!;
  }
  for (const node of nodes) if (node.parent === null) place(node.id);
  return { x, width: Math.max(next, 1) };
}

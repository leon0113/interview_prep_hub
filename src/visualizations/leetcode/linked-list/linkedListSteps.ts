import type { VizStep } from '../../shared/StepViz';
import type { LLNode, LLState } from './LinkedListDiagram';

/**
 * Step lists for the linked-list visualizations, produced by running each algorithm on a
 * small list and recording every pointer change. Pure, so tests can check them.
 */

type Step = VizStep<LLState>;

function nodesOf(values: readonly (string | number)[]): LLNode[] {
  return values.map((val, i) => ({ id: `n${i}`, val }));
}

function linear(nodes: readonly LLNode[]): Record<string, string | null> {
  return Object.fromEntries(nodes.map((n, i) => [n.id, nodes[i + 1]?.id ?? null]));
}

function snap(
  nodes: LLNode[],
  next: Record<string, string | null>,
  pointers: Record<string, string | null>,
  extra: Partial<LLState> = {},
): LLState {
  return { nodes: [...nodes], next: { ...next }, pointers: { ...pointers }, ...extra };
}

/* ───────────────────────────── #206 Reverse ───────────────────────────── */

export function reverseSteps(values: readonly number[]): Step[] {
  const nodes = nodesOf(values);
  const next = linear(nodes);
  const steps: Step[] = [];
  const val = (id: string | null) => (id ? nodes.find((n) => n.id === id)!.val : 'None');
  let prev: string | null = null;
  let curr: string | null = nodes[0]?.id ?? null;

  steps.push({
    state: snap(nodes, next, { head: curr, prev, curr }),
    text: '`prev = None`, `curr = head`.',
    bn: 'উল্টানো অংশ শুরুতে খালি।',
    rich: true,
  });
  while (curr) {
    const temp: string | null = next[curr] ?? null;
    steps.push({
      state: snap(nodes, next, { head: nodes[0]!.id, prev, curr, temp }, { highlight: [curr] }),
      text: `\`temp = curr.next\`: remember node ${val(temp)} before breaking the link.`,
      bn: 'পরেরটা মনে রাখো।',
      rich: true,
    });
    next[curr] = prev;
    steps.push({
      state: snap(nodes, next, { head: nodes[0]!.id, prev, curr, temp }, { highlight: [curr] }),
      text: `\`curr.next = prev\`: node ${val(curr)} now points back to ${val(prev)}.`,
      bn: 'তীর উল্টে দাও।',
      rich: true,
    });
    prev = curr;
    curr = temp;
    steps.push({
      state: snap(nodes, next, { head: nodes[0]!.id, prev, curr }),
      text: `\`prev = curr\`, \`curr = temp\`: both move one step (prev = ${val(prev)}, curr = ${val(curr)}).`,
      bn: 'এগোও, এগোও।',
      rich: true,
    });
  }
  steps.push({
    state: snap(nodes, next, { head: prev, prev, curr }, { highlight: prev ? [prev] : [] }),
    text: '`curr` is None: done. `head = prev`, the old last node is the new head.',
    bn: 'prev-ই নতুন head।',
    rich: true,
  });
  return steps;
}

/* ─────────────────────── #876 / #141 Slow and fast ─────────────────────── */

/** Middle of the list (#876): returns the step list and the middle value. */
export function middleSteps(values: readonly number[]): Step[] {
  const nodes = nodesOf(values);
  const next = linear(nodes);
  const val = (id: string | null) => (id ? nodes.find((n) => n.id === id)!.val : 'None');
  let slow: string | null = nodes[0]!.id;
  let fast: string | null = nodes[0]!.id;
  const steps: Step[] = [
    {
      state: snap(nodes, next, { slow, fast }),
      text: '`slow = fast = head` (`s` and `f` in #876).',
      rich: true,
    },
  ];
  while (fast && next[fast]) {
    slow = next[slow!] ?? null;
    fast = next[next[fast]!] ?? null;
    steps.push({
      state: snap(nodes, next, { slow, fast }, { highlight: slow ? [slow] : [] }),
      text: `slow moves 1 step to ${val(slow)}, fast moves 2 steps to ${val(fast)}.`,
      bn: 'slow ১ ধাপ, fast ২ ধাপ।',
      rich: true,
    });
  }
  steps.push({
    state: snap(nodes, next, { slow, fast }, { highlight: slow ? [slow] : [] }),
    text: `${fast ? '`fast.next` is None' : '`fast` is None'}: the loop stops. \`slow\` (${val(slow)}) is the middle.`,
    bn: values.length % 2 === 0 ? 'জোড় length: দ্বিতীয় middle।' : 'fast শেষে, slow মাঝখানে।',
    rich: true,
  });
  return steps;
}

/** Floyd's cycle detection (#141). `pos` = index the tail points back to, or -1. */
export function cycleSteps(values: readonly number[], pos: number): Step[] {
  const nodes = nodesOf(values);
  const next = linear(nodes);
  if (pos >= 0) next[nodes.at(-1)!.id] = nodes[pos]!.id;
  const val = (id: string | null) => (id ? nodes.find((n) => n.id === id)!.val : 'None');
  let slow: string | null = nodes[0]!.id;
  let fast: string | null = nodes[0]!.id;
  const steps: Step[] = [
    {
      state: snap(nodes, next, { slow, fast }),
      text:
        pos >= 0
          ? `\`slow = fast = head\`. The tail points back to ${val(nodes[pos]!.id)}: a cycle (dashed curve).`
          : '`slow = fast = head`. No cycle: the tail points to null.',
      rich: true,
    },
  ];
  while (fast && next[fast]) {
    slow = next[slow!] ?? null;
    fast = next[next[fast]!] ?? null;
    const met = slow !== null && slow === fast;
    steps.push({
      state: snap(nodes, next, { slow, fast }, { highlight: met && slow ? [slow] : [] }),
      text: met
        ? `slow and fast meet at node ${val(slow)}: \`slow is fast\` → return True.`
        : `slow → ${val(slow)}, fast → ${val(fast)}. Not the same node yet.`,
      bn: met ? 'একই node-এ দেখা হলো: cycle আছে।' : undefined,
      rich: true,
    });
    if (met) return steps;
  }
  steps.push({
    state: snap(nodes, next, { slow, fast }),
    text: 'fast reached the end (`fast` or `fast.next` is None): return False.',
    bn: 'সোজা রাস্তা, cycle নেই।',
    rich: true,
  });
  return steps;
}

/* ─────────────────────────── #234 Palindrome ─────────────────────────── */

export function palindromeSteps(values: readonly number[]): Step[] {
  const nodes = nodesOf(values);
  const next = linear(nodes);
  const val = (id: string | null) => (id ? nodes.find((n) => n.id === id)!.val : 'None');
  const head = nodes[0]!.id;
  const steps: Step[] = [];

  // Phase 1: middle
  let slow: string | null = head;
  let fast: string | null = head;
  steps.push({
    state: snap(nodes, next, { head, slow, fast }),
    text: 'Phase 1, middle: `slow = fast = head`.',
    rich: true,
  });
  while (fast && next[fast]) {
    slow = next[slow!] ?? null;
    fast = next[next[fast]!] ?? null;
    steps.push({
      state: snap(nodes, next, { head, slow, fast }, { highlight: slow ? [slow] : [] }),
      text: `slow → ${val(slow)}, fast → ${val(fast)}.`,
      rich: true,
    });
  }

  // Phase 2: reverse from slow
  let prev: string | null = null;
  steps.push({
    state: snap(nodes, next, { head, slow, prev }, { highlight: slow ? [slow] : [] }),
    text: 'Phase 2, reverse the second half starting at `slow`: `prev = None`.',
    bn: 'দ্বিতীয় অর্ধেক উল্টাও।',
    rich: true,
  });
  while (slow) {
    const temp: string | null = next[slow] ?? null;
    next[slow] = prev;
    prev = slow;
    slow = temp;
    steps.push({
      state: snap(nodes, next, { head, slow, prev }, { highlight: [prev] }),
      text: `\`temp = slow.next\`, \`slow.next = prev\`, \`prev = slow\`, \`slow = temp\`: node ${val(prev)} flipped.`,
      rich: true,
    });
  }

  // Phase 3: compare
  let first: string | null = head;
  let second: string | null = prev;
  steps.push({
    state: snap(nodes, next, { first, second }, { highlight: [first!, second!] }),
    text: 'Phase 3, compare: `first = head`, `second = prev` (the end of the original list).',
    bn: 'দুই মাথা থেকে তুলনা।',
    rich: true,
  });
  while (second) {
    const a = val(first);
    const b = val(second);
    if (a !== b) {
      steps.push({
        state: snap(nodes, next, { first, second }, { highlight: [first!, second] }),
        text: `${a} ≠ ${b}: return False.`,
        bn: 'অমিল: palindrome না।',
        rich: true,
      });
      return steps;
    }
    first = next[first!] ?? null;
    second = next[second] ?? null;
    steps.push({
      state: snap(
        nodes,
        next,
        { first, second },
        { highlight: [first, second].filter(Boolean) as string[] },
      ),
      text: `${a} = ${b} ✓. Both move on${second ? '' : '; `second` is None'}.`,
      rich: true,
    });
  }
  steps.push({
    state: snap(nodes, next, { first, second }),
    text: 'Every pair matched: return True.',
    bn: 'সব মিলেছে: palindrome।',
    rich: true,
  });
  return steps;
}

/* ─────────────────────────── #707 Design ─────────────────────────── */

/** The LeetCode example for #707, operation by operation. */
export function designSteps(): Step[] {
  const a = { id: 'a', val: 1 };
  const b = { id: 'b', val: 3 };
  const c = { id: 'c', val: 2 };
  const s = (
    nodes: LLNode[],
    next: Record<string, string | null>,
    pointers: Record<string, string | null>,
    vars: Record<string, string | number>,
    text: string,
    extra: Partial<LLState> = {},
  ): Step => ({ state: { nodes, next, pointers, vars, ...extra }, text, rich: true });

  return [
    s([], {}, { head: null }, { size: 0 }, '`new MyLinkedList()`: `head = null`, `size = 0`.'),
    s(
      [a],
      { a: null },
      { head: 'a', newNode: 'a' },
      { size: 1 },
      '`addAtHead(1)`: `newNode.next = head` (null), `head = newNode`, `size++`.',
      { highlight: ['a'] },
    ),
    s(
      [a, b],
      { a: null, b: null },
      { head: 'a', curr: 'a', newNode: 'b' },
      { size: 1 },
      '`addAtTail(3)`: walk `curr` while `curr.next !== null`: node 1 is the last.',
    ),
    s(
      [a, b],
      { a: 'b', b: null },
      { head: 'a', curr: 'a', newNode: 'b' },
      { size: 2 },
      '`curr.next = newNode`, `size++`. List: 1 → 3.',
      { highlight: ['b'] },
    ),
    s(
      [a, c, b],
      { a: 'b', c: null, b: null },
      { head: 'a', curr: 'a', newNode: 'c' },
      { size: 2, index: 1 },
      '`addAtIndex(1, 2)`: not 0, not size. Walk `curr` `index - 1` = 0 steps: stays at node 1.',
    ),
    s(
      [a, c, b],
      { a: 'b', c: 'b', b: null },
      { head: 'a', curr: 'a', newNode: 'c' },
      { size: 2, index: 1 },
      'First `newNode.next = curr.next`: 2 points to 3 (nothing is lost).',
      { highlight: ['c'] },
    ),
    s(
      [a, c, b],
      { a: 'c', c: 'b', b: null },
      { head: 'a', curr: 'a', newNode: 'c' },
      { size: 3 },
      'Then `curr.next = newNode`: 1 → 2 → 3. `size++`.',
      { highlight: ['c'] },
    ),
    s(
      [a, c, b],
      { a: 'c', c: 'b', b: null },
      { head: 'a', curr: 'c' },
      { size: 3, return: 2 },
      '`get(1)`: index is valid (< size); `curr` walks 1 step to node 2 → return 2.',
      { highlight: ['c'] },
    ),
    s(
      [a, c, b],
      { a: 'b', c: 'b', b: null },
      { head: 'a', curr: 'a' },
      { size: 3, index: 1 },
      '`deleteAtIndex(1)`: `curr` at node 1 (index - 1); `curr.next = curr.next.next` skips node 2.',
      { faded: ['c'] },
    ),
    s(
      [a, b],
      { a: 'b', b: null },
      { head: 'a' },
      { size: 2 },
      'Node 2 is unreachable (garbage collected). `size--`. List: 1 → 3.',
    ),
    s(
      [a, b],
      { a: 'b', b: null },
      { head: 'a', curr: 'b' },
      { size: 2, return: 3 },
      '`get(1)`: `curr` walks 1 step to node 3 → return 3.',
      { highlight: ['b'] },
    ),
  ];
}

import type { VizStep } from '../../shared/StepViz';
import type { LLNode, LLState } from './llState';

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

/* ──────────────── #203 / #83 / #19 Removing nodes ──────────────── */

const DUMMY: LLNode = { id: 'd', val: 'D' };

/** #203: delete every node with `val`, using a dummy node and `prev`. */
export function removeValSteps(values: readonly number[], target: number): Step[] {
  const nodes = [DUMMY, ...nodesOf(values)];
  const next = linear(nodes);
  const val = (id: string | null) => (id ? nodes.find((n) => n.id === id)!.val : 'None');
  const faded: string[] = [];
  const vars = { val: target };
  const steps: Step[] = [];
  let prev: string = DUMMY.id;
  steps.push({
    state: snap(nodes, next, { dummy: DUMMY.id, prev }, { vars }),
    text: `\`dummy.next = head\`, \`prev = dummy\`. Delete every ${target}.`,
    bn: 'dummy থাকায় head মুছলেও "আগের node" আছে।',
    rich: true,
  });
  while (next[prev]) {
    const ahead = next[prev]!;
    if (val(ahead) === target) {
      next[prev] = next[ahead] ?? null;
      faded.push(ahead);
      steps.push({
        state: snap(
          nodes,
          next,
          { dummy: DUMMY.id, prev },
          { faded: [...faded], highlight: [prev], vars },
        ),
        text: `\`prev.next.val == ${target}\`: \`prev.next = prev.next.next\`. \`prev\` stays: the new next may match too.`,
        bn: 'মুছলাম, prev নড়ে না।',
        rich: true,
      });
    } else {
      prev = ahead;
      steps.push({
        state: snap(
          nodes,
          next,
          { dummy: DUMMY.id, prev },
          { faded: [...faded], highlight: [prev], vars },
        ),
        text: `${val(ahead)} ≠ ${target}: keep it, \`prev = prev.next\`.`,
        bn: 'রাখলাম, prev এগোয়।',
        rich: true,
      });
    }
  }
  steps.push({
    state: snap(nodes, next, { dummy: DUMMY.id, prev }, { faded: [...faded], vars }),
    text: '`prev.next` is None: done. Return `dummy.next`.',
    bn: 'dummy.next-ই নতুন head।',
    rich: true,
  });
  return steps;
}

/** #83: sorted list; skip the next node while it equals `curr`. */
export function dedupeSteps(values: readonly number[]): Step[] {
  const nodes = nodesOf(values);
  const next = linear(nodes);
  const val = (id: string | null) => (id ? nodes.find((n) => n.id === id)!.val : 'None');
  const faded: string[] = [];
  const head = nodes[0]?.id ?? null;
  const steps: Step[] = [];
  let curr = head;
  steps.push({
    state: snap(nodes, next, { head, curr }),
    text: '`curr = head`. The list is sorted, so duplicates sit next to each other.',
    bn: 'sorted, তাই duplicate পাশাপাশি।',
    rich: true,
  });
  while (curr && next[curr]) {
    const ahead = next[curr]!;
    if (val(curr) === val(ahead)) {
      next[curr] = next[ahead] ?? null;
      faded.push(ahead);
      steps.push({
        state: snap(nodes, next, { head, curr }, { faded: [...faded], highlight: [curr] }),
        text: `\`curr.val == curr.next.val\` (${val(curr)}): \`curr.next = curr.next.next\`. \`curr\` stays.`,
        bn: 'duplicate বাদ, curr নড়ে না।',
        rich: true,
      });
    } else {
      curr = ahead;
      steps.push({
        state: snap(nodes, next, { head, curr }, { faded: [...faded], highlight: [curr] }),
        text: `Different values: \`curr = curr.next\` (${val(curr)}).`,
        bn: 'আলাদা, curr এগোয়।',
        rich: true,
      });
    }
  }
  steps.push({
    state: snap(nodes, next, { head, curr }, { faded: [...faded] }),
    text: '`curr.next` is None: done. Return `head` (it never changes).',
    bn: 'head একই থাকে।',
    rich: true,
  });
  return steps;
}

const ordinal = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

/** #19: `x` goes n steps ahead of `y`; both walk until `x.next` is None; delete `y.next`. */
export function removeNthSteps(values: readonly number[], n: number): Step[] {
  const nodes = [DUMMY, ...nodesOf(values)];
  const next = linear(nodes);
  const val = (id: string | null) => (id ? nodes.find((node) => node.id === id)!.val : 'None');
  const steps: Step[] = [];
  let x: string = DUMMY.id;
  let y: string = DUMMY.id;
  steps.push({
    state: snap(nodes, next, { dummy: DUMMY.id, x, y }, { vars: { n } }),
    text: `\`x = y = dummy\`. Remove the ${ordinal(n)} node from the end.`,
    bn: 'দুইজনেই dummy থেকে।',
    rich: true,
  });
  for (let i = 1; i <= n; i++) {
    x = next[x]!;
    steps.push({
      state: snap(nodes, next, { dummy: DUMMY.id, x, y }, { highlight: [x], vars: { n, gap: i } }),
      text: `\`for\` loop ${i}/${n}: \`x = x.next\` (${val(x)}).`,
      bn: 'x আগে n ধাপ এগোয়।',
      rich: true,
    });
  }
  while (next[x]) {
    x = next[x]!;
    y = next[y]!;
    steps.push({
      state: snap(nodes, next, { dummy: DUMMY.id, x, y }, { vars: { n, gap: n } }),
      text: `\`x.next\` exists: both move (x = ${val(x)}, y = ${val(y)}). The gap stays ${n}.`,
      bn: 'দুইজন একসাথে, ফাঁক একই।',
      rich: true,
    });
  }
  const removed = next[y]!;
  steps.push({
    state: snap(nodes, next, { dummy: DUMMY.id, x, y }, { highlight: [y, removed], vars: { n } }),
    text: `\`x.next\` is None, so \`x\` is the last node and \`y.next\` (${val(removed)}) is the one to delete.`,
    bn: 'y থামে মুছতে হবে এমন node-এর আগে।',
    rich: true,
  });
  next[y] = next[removed] ?? null;
  steps.push({
    state: snap(
      nodes,
      next,
      { dummy: DUMMY.id, y },
      { faded: [removed], highlight: [y], vars: { n } },
    ),
    text: '`y.next = y.next.next`. Return `dummy.next`.',
    bn: 'মুছে dummy.next return।',
    rich: true,
  });
  return steps;
}

/* ─────────────────────── #160 Intersection ─────────────────────── */

/**
 * #160 with my hash-set approach: store every node of list B, then walk A until a node is in
 * the set. Nodes are compared by identity, so an equal value in a different node is no match.
 */
export function intersectionSteps(
  a: readonly number[],
  b: readonly number[],
  common: readonly number[],
): Step[] {
  const aNodes = a.map((val, i) => ({ id: `a${i}`, val }));
  const bNodes = b.map((val, i) => ({ id: `b${i}`, val }));
  const cNodes = common.map((val, i) => ({ id: `c${i}`, val }));
  const nodes = [...aNodes, ...bNodes, ...cNodes];
  const next: Record<string, string | null> = {};
  const chain = (list: LLNode[], tail: string | null) =>
    list.forEach((node, i) => (next[node.id] = list[i + 1]?.id ?? tail));
  chain(cNodes, null);
  chain(aNodes, cNodes[0]?.id ?? null);
  chain(bNodes, cNodes[0]?.id ?? null);
  const headA = aNodes[0]?.id ?? cNodes[0]?.id ?? null;
  const headB = bNodes[0]?.id ?? cNodes[0]?.id ?? null;
  const val = (id: string | null) => (id ? nodes.find((n) => n.id === id)!.val : 'None');
  const listB: string[] = [];
  const size = () => ({ 'len(listB)': listB.length });
  const steps: Step[] = [];

  let curr = headB;
  steps.push({
    state: snap(nodes, next, { headA, headB, curr }),
    text: 'Part 1: `curr = headB`, `listB = set()`. Store every node of list B (the node itself, not its value).',
    bn: 'B-র সব node set-এ রাখো।',
    rich: true,
  });
  while (curr) {
    listB.push(curr);
    curr = next[curr] ?? null;
    steps.push({
      state: snap(nodes, next, { headA, headB, curr }, { highlight: [...listB], vars: size() }),
      text: `\`listB.add(curr)\` (node ${val(listB.at(-1)!)}), \`curr = curr.next\`.`,
      rich: true,
    });
  }
  let currNew = headA;
  steps.push({
    state: snap(nodes, next, { headA, headB, currNew }, { highlight: [...listB], vars: size() }),
    text: 'Part 2: `currNew = headA`. Walk A and ask the set: is this exact node in B?',
    bn: 'A হাঁটো, প্রতিটা node set-এ আছে কিনা দেখো।',
    rich: true,
  });
  while (currNew) {
    if (listB.includes(currNew)) {
      steps.push({
        state: snap(nodes, next, { headA, headB, currNew }, { highlight: [currNew], vars: size() }),
        text: `Node ${val(currNew)} is in \`listB\`: return it. This is where the lists meet.`,
        bn: 'পাওয়া গেছে: intersection।',
        rich: true,
      });
      return steps;
    }
    const passed = currNew;
    currNew = next[currNew] ?? null;
    steps.push({
      state: snap(nodes, next, { headA, headB, currNew }, { highlight: [...listB], vars: size() }),
      text: `Node ${val(passed)} is not in \`listB\`: \`currNew = currNew.next\`.`,
      rich: true,
    });
  }
  steps.push({
    state: snap(nodes, next, { headA, headB, currNew }, { vars: size() }),
    text: '`currNew` is None: no shared node. Return None.',
    bn: 'মিলন নেই।',
    rich: true,
  });
  return steps;
}

/* ─────────────────────── #328 Odd Even ─────────────────────── */

/** #328: the odd chain and the even chain grow side by side; then odd's tail → evenStart. */
export function oddEvenSteps(values: readonly number[]): Step[] {
  const nodes = nodesOf(values);
  const next = linear(nodes);
  const val = (id: string | null) => (id ? nodes.find((n) => n.id === id)!.val : 'None');
  const head = nodes[0]?.id ?? null;
  const steps: Step[] = [];
  if (!head || !next[head]) {
    steps.push({
      state: snap(nodes, next, { head }),
      text: '`not head or not head.next`: nothing to reorder, return `head`.',
      rich: true,
    });
    return steps;
  }
  let odd: string = head;
  let even: string | null = next[head]!;
  const evenStart = even;
  steps.push({
    state: snap(nodes, next, { odd, even, evenStart }),
    text: '`odd = head`, `even = head.next`, `evenStart = even` (where the even chain starts).',
    bn: 'evenStart মনে রাখো, শেষে জোড়া লাগাতে লাগবে।',
    rich: true,
  });
  while (even && next[even]) {
    next[odd] = next[next[odd]!] ?? null;
    next[even] = next[next[even]!] ?? null;
    steps.push({
      state: snap(nodes, next, { odd, even, evenStart }, { highlight: [odd, even] }),
      text: `\`odd.next = odd.next.next\` (${val(odd)} → ${val(next[odd] ?? null)}), \`even.next = even.next.next\` (${val(even)} → ${val(next[even] ?? null)}).`,
      bn: 'দুইটা chain-ই একটা করে node টপকে যায়।',
      rich: true,
    });
    odd = next[odd]!;
    even = next[even] ?? null;
    steps.push({
      state: snap(nodes, next, { odd, even, evenStart }),
      text: `\`odd = odd.next\` (${val(odd)}), \`even = even.next\` (${val(even)}).`,
      rich: true,
    });
  }
  next[odd] = evenStart;
  steps.push({
    state: snap(nodes, next, { head, odd, evenStart }, { highlight: [odd, evenStart] }),
    text: `Loop ends. \`odd.next = evenStart\`: ${val(odd)} → ${val(evenStart)}. Return \`head\`.`,
    bn: 'odd chain-এর শেষে even chain জুড়ে দাও।',
    rich: true,
  });
  return steps;
}

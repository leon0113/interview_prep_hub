/** Data shapes and helpers for the linked-list visualizations. */

export interface LLNode {
  id: string;
  val: string | number;
}

/** One snapshot of a linked list: nodes in display order plus the real `next` pointers. */
export interface LLState {
  nodes: LLNode[];
  /** node id -> next node id, or null. Anything not adjacent is drawn as a curve. */
  next: Record<string, string | null>;
  /** pointer name -> node id, or null (drawn over a "null" slot). */
  pointers: Record<string, string | null>;
  highlight?: string[];
  /** Nodes no longer reachable (just deleted), drawn faded. */
  faded?: string[];
  vars?: Record<string, string | number>;
}

/** Follows `next` from a start node and describes the list, stopping at a repeat (cycle). */
export function describeList(state: LLState, start: string | null): string {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const parts: string[] = [];
  let cur = start;
  while (cur && byId.has(cur)) {
    if (seen.has(cur)) {
      parts.push(`back to ${byId.get(cur)!.val}`);
      return parts.join(' → ');
    }
    seen.add(cur);
    parts.push(String(byId.get(cur)!.val));
    cur = state.next[cur] ?? null;
  }
  parts.push('null');
  return parts.join(' → ');
}

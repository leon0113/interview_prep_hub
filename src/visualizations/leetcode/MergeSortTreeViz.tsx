import type { ArrayState } from '@/content/leetcode/schema';
import { cn } from '@/lib/cn';
import { StepViz, type VizStep } from '../shared/StepViz';
import { ArrayStateView } from './ArrayPointersViz';

interface Row {
  label: string;
  groups: number[][];
  merged?: boolean;
}

interface MergeSortState {
  rows: Row[];
  /** The zoomed-in final merge, with its i / j pointers. */
  zoom?: ArrayState;
}

const SPLIT: Row[] = [
  { label: 'start', groups: [[5, 2, 3, 1]] },
  {
    label: 'divide',
    groups: [
      [5, 2],
      [3, 1],
    ],
  },
  { label: 'base case', groups: [[5], [2], [3], [1]] },
];

function withRow(index: number, row: Row): Row[] {
  return SPLIT.map((r, i) => (i === index ? row : r));
}

const MERGED_LEVEL_1: Row = {
  label: 'merge ↑',
  groups: [
    [2, 5],
    [1, 3],
  ],
  merged: true,
};
const MERGED_LEVEL_0: Row = { label: 'merge ↑', groups: [[1, 2, 3, 5]], merged: true };
const AFTER_MERGES = [MERGED_LEVEL_0, MERGED_LEVEL_1, SPLIT[2]!];

function zoom(i: number, j: number, res: number[], caption: string): ArrayState {
  return {
    label: 'left',
    array: [2, 5],
    pointers: { i },
    secondary: { label: 'right', array: [1, 3], pointers: { j } },
    vars: { res: `[${res.join(',')}]` },
    caption,
  };
}

/** Steps for [5,2,3,1], matching the trace in the #912 note. */
const STEPS: VizStep<MergeSortState>[] = [
  { state: { rows: SPLIT.slice(0, 1) }, text: 'Start with the whole array [5,2,3,1].' },
  {
    state: { rows: SPLIT.slice(0, 2) },
    text: 'Divide: split in the middle into [5,2] and [3,1].',
    bn: 'মাঝখানে ভাগ করো।',
  },
  {
    state: { rows: SPLIT.slice(0, 3) },
    text: 'Divide again until every piece has one element: the base case, already sorted.',
    bn: 'একটা element এর array নিজেই sorted।',
  },
  {
    state: { rows: withRow(1, MERGED_LEVEL_1) },
    text: 'Merge going up: [5]+[2] → [2,5] and [3]+[1] → [1,3].',
    bn: 'ফেরার পথে দুইটা sorted টুকরা জোড়া লাগে।',
  },
  {
    state: { rows: AFTER_MERGES },
    text: 'Merge [2,5] and [1,3] → [1,2,3,5]. Next: zoom into this last merge.',
  },
  {
    state: { rows: AFTER_MERGES, zoom: zoom(0, 0, [], 'শেষ merge') },
    text: 'Final merge: left = [2,5], right = [1,3], i = 0, j = 0, res = [].',
  },
  {
    state: { rows: AFTER_MERGES, zoom: zoom(0, 1, [1], '') },
    text: '2 vs 1: 1 is smaller, push it from right. j moves to 1.',
  },
  {
    state: { rows: AFTER_MERGES, zoom: zoom(1, 1, [1, 2], '') },
    text: '2 vs 3: 2 is smaller, push it from left. i moves to 1.',
  },
  {
    state: { rows: AFTER_MERGES, zoom: zoom(1, 2, [1, 2, 3], '') },
    text: '5 vs 3: 3 is smaller, push it. right is now used up (j = 2).',
  },
  {
    state: { rows: AFTER_MERGES, zoom: zoom(2, 2, [1, 2, 3, 5], '') },
    text: 'Append what is left of left ([5]): res = [1,2,3,5].',
    bn: 'এক দিক শেষ হলে অন্য দিকের বাকিটা জুড়ে দাও।',
  },
];

/** #912: split tree going down, merges going up, then the last merge step by step. */
export default function MergeSortTreeViz() {
  return (
    <StepViz
      title="Merge sort: split, then merge"
      caption="Rows going down split the array; merged rows (green) replace them on the way back up. The last steps zoom into one merge."
      steps={STEPS}
    >
      {(state) => (
        <div className="flex flex-col gap-4">
          <ol className="flex flex-col gap-2.5">
            {state.rows.map((row, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-16 shrink-0 text-right font-mono text-[0.6875rem]',
                    row.merged ? 'text-level-foundation' : 'text-subtle',
                  )}
                >
                  {row.label}
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap justify-center gap-2">
                  {row.groups.map((group, g) => (
                    <span
                      key={g}
                      className={cn(
                        'inline-flex rounded-lg border p-0.5',
                        row.merged
                          ? 'border-level-foundation bg-level-foundation/10'
                          : 'border-border-strong bg-surface',
                      )}
                    >
                      {group.map((value, v) => (
                        <span
                          key={v}
                          className="flex size-8 items-center justify-center font-mono text-sm"
                        >
                          {value}
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          {state.zoom ? (
            <div className="rounded-lg border border-border p-3">
              <ArrayStateView state={state.zoom} name="Final merge" />
            </div>
          ) : null}
        </div>
      )}
    </StepViz>
  );
}

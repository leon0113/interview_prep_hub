import { LLPresetViz, type LLPreset } from './LLPresetViz';
import { intersectionSteps } from './linkedListSteps';

const PRESETS: LLPreset[] = [
  {
    label: 'A 4,1 · B 5,6,1 · shared 8,4,5',
    build: () => intersectionSteps([4, 1], [5, 6, 1], [8, 4, 5]),
  },
  { label: 'no intersection', build: () => intersectionSteps([2, 6, 4], [1, 5], []) },
];

/** #160 Intersection of Two Linked Lists. */
export default function LinkedListIntersectionViz() {
  return (
    <LLPresetViz
      title="Intersection (hash set of nodes)"
      caption="Put every node of B in a set, then walk A until a node is in the set. Shared nodes are drawn after both lists."
      presets={PRESETS}
    />
  );
}

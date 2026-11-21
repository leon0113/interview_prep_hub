import { LLPresetViz, type LLPreset } from './LLPresetViz';
import { removeValSteps } from './linkedListSteps';

const PRESETS: LLPreset[] = [
  { label: '[1,2,6,3,4,5,6], val 6', build: () => removeValSteps([1, 2, 6, 3, 4, 5, 6], 6) },
  { label: '[7,7,7,7], val 7', build: () => removeValSteps([7, 7, 7, 7], 7) },
];

/** #203 Remove Linked List Elements. */
export default function LinkedListRemoveValViz() {
  return (
    <LLPresetViz
      title="Remove by value (dummy + prev)"
      caption="A dummy node before head, and prev deletes prev.next while it matches. prev only moves when it keeps a node."
      presets={PRESETS}
    />
  );
}

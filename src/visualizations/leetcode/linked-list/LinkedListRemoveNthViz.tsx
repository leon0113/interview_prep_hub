import { LLPresetViz, type LLPreset } from './LLPresetViz';
import { removeNthSteps } from './linkedListSteps';

const PRESETS: LLPreset[] = [
  { label: '[1,2,3,4,5], n 2', build: () => removeNthSteps([1, 2, 3, 4, 5], 2) },
  { label: '[1,2], n 2', build: () => removeNthSteps([1, 2], 2) },
];

/** #19 Remove Nth Node From End. */
export default function LinkedListRemoveNthViz() {
  return (
    <LLPresetViz
      title="Remove n-th from end (gap pointers)"
      caption="First x walks n steps ahead, then x and y move together until x.next is None; y stops right before the node to delete."
      presets={PRESETS}
    />
  );
}

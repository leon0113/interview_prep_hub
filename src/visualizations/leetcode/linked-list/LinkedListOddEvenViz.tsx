import { LLPresetViz, type LLPreset } from './LLPresetViz';
import { oddEvenSteps } from './linkedListSteps';

const PRESETS: LLPreset[] = [
  { label: '[1,2,3,4,5]', build: () => oddEvenSteps([1, 2, 3, 4, 5]) },
  { label: '[2,1,3,5,6,4,7]', build: () => oddEvenSteps([2, 1, 3, 5, 6, 4, 7]) },
];

/** #328 Odd Even Linked List. */
export default function LinkedListOddEvenViz() {
  return (
    <LLPresetViz
      title="Odd even reorder"
      caption="Odd and even chains each skip one node per step; at the end the odd chain's tail points to evenStart."
      presets={PRESETS}
    />
  );
}

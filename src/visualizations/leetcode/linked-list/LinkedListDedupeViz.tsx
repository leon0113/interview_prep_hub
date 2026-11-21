import { LLPresetViz, type LLPreset } from './LLPresetViz';
import { dedupeSteps } from './linkedListSteps';

const PRESETS: LLPreset[] = [
  { label: '[1,1,2,3,3]', build: () => dedupeSteps([1, 1, 2, 3, 3]) },
  { label: '[1,1,1]', build: () => dedupeSteps([1, 1, 1]) },
];

/** #83 Remove Duplicates from Sorted List. */
export default function LinkedListDedupeViz() {
  return (
    <LLPresetViz
      title="Remove duplicates (sorted list)"
      caption="Duplicates are neighbours, so curr skips curr.next while the values match."
      presets={PRESETS}
    />
  );
}

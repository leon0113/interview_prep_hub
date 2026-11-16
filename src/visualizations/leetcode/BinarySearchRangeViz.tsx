import { useState } from 'react';
import problem from '@/content/leetcode/dsa/704-binary-search';
import { PresetChips } from '../shared/parts';
import ArrayPointersViz from './ArrayPointersViz';
import { stepsOf } from './steps';

const PRESETS = {
  found: { label: 'target = 9 (found)', states: stepsOf(problem, 0) },
  missing: { label: 'target = 2 (not found)', states: stepsOf(problem, 1) },
} as const;
type Preset = keyof typeof PRESETS;
const OPTIONS = (Object.keys(PRESETS) as Preset[]).map((value) => ({
  value,
  label: PRESETS[value].label,
}));

/** #704: the active range [left, right] shrinking; the discarded half fades out. */
export default function BinarySearchRangeViz() {
  const [preset, setPreset] = useState<Preset>('found');
  return (
    <ArrayPointersViz
      key={preset}
      title="Binary search: the range shrinks"
      caption="Cells outside [left, right] are thrown away. Each step looks at the middle and keeps only the half that can still hold the target."
      states={PRESETS[preset].states}
      rangePointers={['left', 'right']}
      toolbar={
        <PresetChips label="Example" options={OPTIONS} value={preset} onChange={setPreset} />
      }
    />
  );
}

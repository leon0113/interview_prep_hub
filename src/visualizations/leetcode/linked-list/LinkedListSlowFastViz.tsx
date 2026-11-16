import { useMemo, useState } from 'react';
import { PresetChips } from '../../shared/parts';
import { cycleSteps, middleSteps } from './linkedListSteps';
import { LLStepViz } from './LLStepViz';

const PRESETS = {
  odd: { label: 'middle: 1–5', build: () => middleSteps([1, 2, 3, 4, 5]) },
  even: { label: 'middle: 1–6', build: () => middleSteps([1, 2, 3, 4, 5, 6]) },
  cycle: { label: 'cycle: 3,2,0,-4 (pos 1)', build: () => cycleSteps([3, 2, 0, -4], 1) },
  none: { label: 'no cycle: 1,2,3', build: () => cycleSteps([1, 2, 3], -1) },
} as const;
type Preset = keyof typeof PRESETS;
const OPTIONS = (Object.keys(PRESETS) as Preset[]).map((value) => ({
  value,
  label: PRESETS[value].label,
}));

/** #876 / #141 and notes §13: slow moves 1, fast moves 2; middle, or meeting inside a cycle. */
export default function LinkedListSlowFastViz() {
  const [preset, setPreset] = useState<Preset>('odd');
  const steps = useMemo(() => PRESETS[preset].build(), [preset]);
  return (
    <LLStepViz
      key={preset}
      title="Slow and fast pointers"
      caption="slow moves one node, fast moves two. When fast runs out, slow is the middle; in a cycle, fast catches slow."
      steps={steps}
      toolbar={
        <PresetChips label="Example" options={OPTIONS} value={preset} onChange={setPreset} />
      }
    />
  );
}

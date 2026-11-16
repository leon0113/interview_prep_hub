import { useMemo, useState } from 'react';
import { PresetChips } from '../../shared/parts';
import { reverseSteps } from './linkedListSteps';
import { LLStepViz } from './LLStepViz';

const PRESETS = { four: [1, 2, 3, 4], three: [1, 2, 3], two: [1, 2] } as const;
type Preset = keyof typeof PRESETS;
const OPTIONS = (Object.keys(PRESETS) as Preset[]).map((value) => ({
  value,
  label: PRESETS[value].join(' → '),
}));

/** #206 and notes §9: prev / curr / temp, one arrow flipped at a time. */
export default function LinkedListReverseViz() {
  const [preset, setPreset] = useState<Preset>('four');
  const steps = useMemo(() => reverseSteps(PRESETS[preset]), [preset]);
  return (
    <LLStepViz
      key={preset}
      title="Reverse a linked list"
      caption="Save next (temp), flip the arrow (curr.next = prev), move prev, move curr. Flipped arrows point left."
      steps={steps}
      toolbar={
        <PresetChips label="Example" options={OPTIONS} value={preset} onChange={setPreset} />
      }
    />
  );
}

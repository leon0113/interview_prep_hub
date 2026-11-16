import { useMemo, useState } from 'react';
import { PresetChips } from '../../shared/parts';
import { palindromeSteps } from './linkedListSteps';
import { LLStepViz } from './LLStepViz';

const PRESETS = { even: [1, 2, 2, 1], odd: [1, 2, 3, 2, 1], no: [1, 2] } as const;
type Preset = keyof typeof PRESETS;
const OPTIONS = (Object.keys(PRESETS) as Preset[]).map((value) => ({
  value,
  label: PRESETS[value].join(','),
}));

/** #234 and notes §14.2: middle (slow/fast) → reverse the second half → compare from both ends. */
export default function LinkedListPalindromeViz() {
  const [preset, setPreset] = useState<Preset>('even');
  const steps = useMemo(() => palindromeSteps(PRESETS[preset]), [preset]);
  return (
    <LLStepViz
      key={preset}
      title="Palindrome linked list"
      caption="Three phases: find the middle, reverse the second half, then walk first (from head) and second (from the old tail) together."
      steps={steps}
      toolbar={
        <PresetChips label="Example" options={OPTIONS} value={preset} onChange={setPreset} />
      }
    />
  );
}

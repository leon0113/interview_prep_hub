import { useMemo, useState } from 'react';
import type { VizStep } from '../../shared/StepViz';
import { PresetChips } from '../../shared/parts';
import type { LLState } from './llState';
import { LLStepViz } from './LLStepViz';

export interface LLPreset {
  label: string;
  build: () => readonly VizStep<LLState>[];
}

/** A linked-list step visualization with example chips (the first preset is shown first). */
export function LLPresetViz({
  title,
  caption,
  presets,
}: {
  title: string;
  caption: string;
  presets: readonly LLPreset[];
}) {
  const [index, setIndex] = useState(0);
  const steps = useMemo(() => presets[index]!.build(), [presets, index]);
  const options = presets.map((p, i) => ({ value: String(i), label: p.label }));
  return (
    <LLStepViz
      key={index}
      title={title}
      caption={caption}
      steps={steps}
      toolbar={
        presets.length > 1 ? (
          <PresetChips
            label="Example"
            options={options}
            value={String(index)}
            onChange={(v) => setIndex(Number(v))}
          />
        ) : undefined
      }
    />
  );
}

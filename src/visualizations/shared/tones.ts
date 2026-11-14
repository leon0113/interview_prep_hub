/** Semantic colours for diagrams. All resolve to theme tokens, so both themes work. */
export type Tone = 'accent' | 'green' | 'amber' | 'pink' | 'muted';

export const TONE: Record<
  Tone,
  {
    text: string;
    border: string;
    bg: string;
    fill: string;
    stroke: string;
    solid: string;
    /** Solid SVG fill, for arrowheads. */
    arrow: string;
  }
> = {
  accent: {
    text: 'text-accent-text',
    border: 'border-accent',
    bg: 'bg-accent-soft',
    fill: 'fill-accent-soft',
    stroke: 'stroke-accent',
    solid: 'bg-accent',
    arrow: 'fill-accent',
  },
  green: {
    text: 'text-level-foundation',
    border: 'border-level-foundation',
    bg: 'bg-level-foundation/10',
    fill: 'fill-level-foundation/10',
    stroke: 'stroke-level-foundation',
    solid: 'bg-level-foundation',
    arrow: 'fill-level-foundation',
  },
  amber: {
    text: 'text-level-intermediate',
    border: 'border-level-intermediate',
    bg: 'bg-level-intermediate/10',
    fill: 'fill-level-intermediate/10',
    stroke: 'stroke-level-intermediate',
    solid: 'bg-level-intermediate',
    arrow: 'fill-level-intermediate',
  },
  pink: {
    text: 'text-level-advanced',
    border: 'border-level-advanced',
    bg: 'bg-level-advanced/10',
    fill: 'fill-level-advanced/10',
    stroke: 'stroke-level-advanced',
    solid: 'bg-level-advanced',
    arrow: 'fill-level-advanced',
  },
  muted: {
    text: 'text-fg',
    border: 'border-border-strong',
    bg: 'bg-surface',
    fill: 'fill-surface',
    stroke: 'stroke-border-strong',
    solid: 'bg-border-strong',
    arrow: 'fill-subtle',
  },
};

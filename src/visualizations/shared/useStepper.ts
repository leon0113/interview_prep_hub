import { useEffect, useState } from 'react';

export interface Stepper {
  index: number;
  count: number;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  next: () => void;
  prev: () => void;
  reset: () => void;
  togglePlay: () => void;
  goTo: (index: number) => void;
}

/**
 * Step state for a visualization: manual prev/next plus optional auto-advance.
 * Nothing plays on its own — playback only starts when the user presses Play.
 */
export function useStepper(count: number, intervalMs = 2200): Stepper {
  const [index, setIndex] = useState(0);
  const [wantsPlay, setWantsPlay] = useState(false);
  const last = Math.max(count - 1, 0);
  const atEnd = index >= last;
  const playing = wantsPlay && !atEnd;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setIndex((i) => Math.min(i + 1, last)), intervalMs);
    return () => window.clearTimeout(id);
  }, [playing, index, last, intervalMs]);

  return {
    index,
    count,
    playing,
    atStart: index === 0,
    atEnd,
    next: () => {
      setWantsPlay(false);
      setIndex((i) => Math.min(i + 1, last));
    },
    prev: () => {
      setWantsPlay(false);
      setIndex((i) => Math.max(i - 1, 0));
    },
    reset: () => {
      setWantsPlay(false);
      setIndex(0);
    },
    togglePlay: () => {
      if (playing) {
        setWantsPlay(false);
        return;
      }
      // Pressing Play on the last step starts over.
      if (atEnd) setIndex(0);
      setWantsPlay(true);
    },
    goTo: (target) => {
      setWantsPlay(false);
      setIndex(Math.min(Math.max(target, 0), last));
    },
  };
}

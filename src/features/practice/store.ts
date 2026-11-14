import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PracticeState {
  /** When on, every answer on the page is hidden until revealed one by one. */
  practiceMode: boolean;
  togglePracticeMode: () => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      practiceMode: false,
      togglePracticeMode: () => set((state) => ({ practiceMode: !state.practiceMode })),
    }),
    {
      name: 'iph:practice',
      version: 1,
      skipHydration: true,
    } /* Loaded after the first render (see app/providers.tsx) so prerendered HTML hydrates cleanly. */,
  ),
);

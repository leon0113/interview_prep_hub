import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LastVisited {
  trackSlug: string;
  /** Path to resume at, including any `#anchor`. */
  path: string;
  /** Human-readable label, e.g. the section or question title. */
  title: string;
  kind: 'section' | 'question' | 'exercise' | 'coverage';
  at: number;
}

interface ProgressState {
  /** question/exercise id -> learned */
  learned: Record<string, true>;
  /** question id -> time bookmarked (ms) */
  bookmarks: Record<string, number>;
  lastVisited: LastVisited | null;

  toggleLearned: (id: string) => void;
  toggleBookmark: (id: string) => void;
  setLastVisited: (visit: Omit<LastVisited, 'at'>) => void;
  resetProgress: () => void;
}

export const PROGRESS_STORAGE_KEY = 'iph:progress';

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      learned: {},
      bookmarks: {},
      lastVisited: null,

      toggleLearned: (id) =>
        set((state) => {
          const learned = { ...state.learned };
          if (learned[id]) delete learned[id];
          else learned[id] = true;
          return { learned };
        }),

      toggleBookmark: (id) =>
        set((state) => {
          const bookmarks = { ...state.bookmarks };
          if (bookmarks[id]) delete bookmarks[id];
          else bookmarks[id] = Date.now();
          return { bookmarks };
        }),

      setLastVisited: (visit) => set({ lastVisited: { ...visit, at: Date.now() } }),

      resetProgress: () => set({ learned: {}, bookmarks: {}, lastVisited: null }),
    }),
    {
      name: PROGRESS_STORAGE_KEY,
      version: 1,
      // Loaded after the first render (see app/providers.tsx) so prerendered HTML hydrates cleanly.
      skipHydration: true,
      partialize: ({ learned, bookmarks, lastVisited }) => ({ learned, bookmarks, lastVisited }),
    },
  ),
);

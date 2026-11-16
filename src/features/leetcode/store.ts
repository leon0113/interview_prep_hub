import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** How well I remembered a problem, from the Revise stage or a revision session. */
export const CONFIDENCES = ['forgot', 'hard', 'good', 'easy'] as const;
export type Confidence = (typeof CONFIDENCES)[number];

/** Days until the next review for each answer. The one place to tune the schedule. */
export const REVIEW_INTERVAL_DAYS: Record<Confidence, number> = {
  forgot: 1,
  hard: 3,
  good: 7,
  easy: 21,
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  forgot: 'Forgot',
  hard: 'Hard',
  good: 'Good',
  easy: 'Easy',
};

const DAY_MS = 24 * 60 * 60 * 1000;

export interface Review {
  confidence: Confidence;
  /** ms timestamps */
  lastReviewed: number;
  nextReview: number;
  /** How many times it was rated. */
  count: number;
}

interface LcReviewState {
  /** problem id -> latest review */
  reviews: Record<string, Review>;
  rate: (id: string, confidence: Confidence, now?: number) => void;
  clearReview: (id: string) => void;
}

export const LC_STORAGE_KEY = 'iph:leetcode';

export const useLcReviewStore = create<LcReviewState>()(
  persist(
    (set) => ({
      reviews: {},
      rate: (id, confidence, now = Date.now()) =>
        set((state) => ({
          reviews: {
            ...state.reviews,
            [id]: {
              confidence,
              lastReviewed: now,
              nextReview: now + REVIEW_INTERVAL_DAYS[confidence] * DAY_MS,
              count: (state.reviews[id]?.count ?? 0) + 1,
            },
          },
        })),
      clearReview: (id) =>
        set((state) => {
          const reviews = { ...state.reviews };
          delete reviews[id];
          return { reviews };
        }),
    }),
    {
      name: LC_STORAGE_KEY,
      version: 1,
      // Loaded after the first render (app/providers.tsx), like the other persisted stores.
      skipHydration: true,
      partialize: ({ reviews }) => ({ reviews }),
    },
  ),
);

/** A problem is due once its next review time has passed. Never-reviewed problems are "new". */
export function isDue(review: Review | undefined, now: number): boolean {
  return review !== undefined && review.nextReview <= now;
}

/** True once saved reviews are loaded. Always false while prerendering and on the first render. */
export function useLcHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useLcReviewStore.persist.onFinishHydration(onChange),
    () => useLcReviewStore.persist.hasHydrated(),
    () => false,
  );
}

/* The current time as an external store, so render stays pure: refreshed every minute while
 * something is subscribed, and 0 on the server and before subscription. */
let nowCache = 0;
function subscribeNow(onChange: () => void): () => void {
  nowCache = Date.now();
  const timer = window.setInterval(() => {
    nowCache = Date.now();
    onChange();
  }, 60_000);
  return () => window.clearInterval(timer);
}

/** The current time (ms), or null until saved reviews are loaded (prerendered HTML stays stable). */
export function useNow(): number | null {
  const hydrated = useLcHydrated();
  const now = useSyncExternalStore(
    subscribeNow,
    () => nowCache,
    () => 0,
  );
  return hydrated && now > 0 ? now : null;
}

/** Ids due for review now, or null until saved state is loaded (keeps prerendered HTML stable). */
export function useDueIds(ids: readonly string[]): string[] | null {
  const now = useNow();
  const reviews = useLcReviewStore((s) => s.reviews);
  if (now === null) return null;
  return ids.filter((id) => isDue(reviews[id], now));
}

/** Days from `now` until `time`, for "due in 3 days" labels (negative = overdue). */
export function daysUntil(time: number, now: number): number {
  return Math.ceil((time - now) / DAY_MS);
}

/* ─────────────── Per-session reveal state (not persisted, survives navigation) ────────────── */

/** Stages of the problem page, in order. */
export const STAGES = ['problem', 'approach', 'breakdown', 'solution', 'revise'] as const;
export const STAGE_TITLES = ['Problem', 'Approach', 'Breakdown', 'Solution', 'Revise'] as const;
export type Stage = (typeof STAGES)[number];

interface LcSessionState {
  /** problem id -> index of the last revealed stage (0 = only the problem). */
  revealed: Record<string, number>;
  /** Reading mode: every stage open on every problem. */
  showEverything: boolean;
  reveal: (id: string, stageIndex: number) => void;
  hideAll: (id: string) => void;
  setShowEverything: (on: boolean) => void;
}

export const useLcSessionStore = create<LcSessionState>()((set) => ({
  revealed: {},
  showEverything: false,
  reveal: (id, stageIndex) =>
    set((state) => ({
      revealed: { ...state.revealed, [id]: Math.max(state.revealed[id] ?? 0, stageIndex) },
    })),
  hideAll: (id) =>
    set((state) => {
      const revealed = { ...state.revealed };
      delete revealed[id];
      return { revealed };
    }),
  setShowEverything: (on) => set({ showEverything: on }),
}));

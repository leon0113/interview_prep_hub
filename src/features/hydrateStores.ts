import { useLcReviewStore } from './leetcode/store';
import { usePracticeStore } from './practice/store';
import { useProgressStore } from './progress/store';
import { useThemeStore } from './theme/store';

/**
 * Loads the saved user state (theme, progress, practice mode) from localStorage. The stores
 * use `skipHydration`, so the first render on the client matches the prerendered HTML (which
 * knows nothing about this browser); this runs right after that render, before paint.
 */
export function rehydrateStores(): void {
  void useThemeStore.persist.rehydrate();
  void useProgressStore.persist.rehydrate();
  void usePracticeStore.persist.rehydrate();
  void useLcReviewStore.persist.rehydrate();
}

import { useEffect } from 'react';
import { create } from 'zustand';

export interface TocItem {
  id: string;
  title: string;
  /** Small trailing label, e.g. the level. */
  hint?: string;
}

interface UiState {
  mobileNavOpen: boolean;
  searchOpen: boolean;
  shortcutsOpen: boolean;
  tocItems: readonly TocItem[];
  setMobileNavOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setTocItems: (items: readonly TocItem[]) => void;
}

/** Ephemeral UI state shared across the shell (not persisted). */
export const useUiStore = create<UiState>()((set) => ({
  mobileNavOpen: false,
  searchOpen: false,
  shortcutsOpen: false,
  tocItems: [],
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
  setTocItems: (tocItems) => set({ tocItems }),
}));

const NO_ITEMS: readonly TocItem[] = [];

/**
 * Publishes the current page's "On this page" entries to the right-hand TOC.
 * Pass a memoized array.
 */
export function useRegisterToc(items: readonly TocItem[]): void {
  useEffect(() => {
    useUiStore.getState().setTocItems(items);
    return () => useUiStore.getState().setTocItems(NO_ITEMS);
  }, [items]);
}

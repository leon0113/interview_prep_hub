import { useEffect } from 'react';
import { useProgressStore, type LastVisited } from './store';

export function useIsLearned(id: string): boolean {
  return useProgressStore((state) => Boolean(state.learned[id]));
}

export function useIsBookmarked(id: string): boolean {
  return useProgressStore((state) => Boolean(state.bookmarks[id]));
}

/** How many of the given ids are marked as learned. */
export function useLearnedCount(ids: readonly string[]): number {
  return useProgressStore((state) =>
    ids.reduce((count, id) => count + (state.learned[id] ? 1 : 0), 0),
  );
}

export function useBookmarkCount(): number {
  return useProgressStore((state) => Object.keys(state.bookmarks).length);
}

/** Records the current page as the place to resume from on the home page. */
export function useTrackVisit(visit: Omit<LastVisited, 'at'> | undefined): void {
  const setLastVisited = useProgressStore((state) => state.setLastVisited);
  const { trackSlug, path, title, kind } = visit ?? {};

  useEffect(() => {
    if (trackSlug && path && title && kind) setLastVisited({ trackSlug, path, title, kind });
  }, [trackSlug, path, title, kind, setLastVisited]);
}

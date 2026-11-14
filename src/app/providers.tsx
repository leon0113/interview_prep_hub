import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { rehydrateStores } from '@/features/hydrateStores';
import { useApplyTheme } from '@/features/theme/useTheme';

// useLayoutEffect does nothing on the server (prerender); useEffect keeps React quiet there.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * App-wide providers. User state lives in zustand stores (no context needed). Saved state is
 * loaded in a layout effect: after hydration (so the prerendered HTML matches the first render)
 * but before paint and before any component's effects could write to storage.
 */
export function Providers({ children }: { children: ReactNode }) {
  useIsomorphicLayoutEffect(rehydrateStores, []);
  useApplyTheme();
  return children;
}

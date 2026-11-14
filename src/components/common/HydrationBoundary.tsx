import { Suspense, type ReactNode } from 'react';

/**
 * Splits hydration of a prerendered page into smaller units. React hydrates each Suspense
 * boundary separately and yields to the browser between them, instead of hydrating the whole
 * page in one long task (which blocks input on slow phones). The server HTML stays on screen
 * meanwhile, so there is no fallback to show: wrap independent, heavy parts of a page.
 */
export function HydrationBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

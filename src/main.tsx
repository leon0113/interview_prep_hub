import './styles/fonts.css';
import './styles/globals.css';

import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { matchRoutes, RouterProvider } from 'react-router';
import { Providers } from './app/providers';
import { preloadAnswerContent } from './components/question/lazyContent';
import { createAppRouter, routes } from './app/router';
import { primeOutline } from './content/loader';
import type { TrackOutline } from './content/outline';
import { TRACK_ROUTE_ID } from './features/tracks/useTrack';
import { hideSplash } from './lib/splash';

declare global {
  interface Window {
    /** Set by scripts/prerender.mjs: the path this HTML was prerendered for. */
    __PRERENDERED_PATH?: string;
    /** Loader data written by React Router's StaticRouterProvider. */
    __staticRouterHydrationData?: { loaderData?: Record<string, unknown> };
  }
}

const container = document.getElementById('root')!;
const normalize = (path: string) => path.replace(/\/+$/, '') || '/';
// Prerendered pages hydrate. The SPA fallback (bookmarks, unknown URLs) renders from scratch;
// if a host served some other page's HTML here, its markup and data are discarded.
const prerendered =
  window.__PRERENDERED_PATH !== undefined &&
  normalize(window.__PRERENDERED_PATH) === normalize(window.location.pathname);

if (prerendered) {
  // Route modules are lazy; load the ones on this page before hydrating so the first client
  // render matches the HTML instead of showing a fallback.
  // Same for the answer panel / markdown when the HTML shows them (an open answer, a puzzle's
  // code): suspending mid-hydration would swap the server HTML for a fallback and shift layout.
  const matches = matchRoutes(routes, window.location) ?? [];
  const showsAnswerContent = container.querySelector('article[data-question] .md') !== null;
  await Promise.all([
    ...matches.map(async ({ route }) => {
      if (typeof route.lazy !== 'function') return;
      Object.assign(route, await route.lazy(), { lazy: undefined });
    }),
    showsAnswerContent ? preloadAnswerContent() : undefined,
  ]);
  const outline = window.__staticRouterHydrationData?.loaderData?.[TRACK_ROUTE_ID];
  if (outline) primeOutline(outline as TrackOutline);
  hydrateRoot(
    container,
    <StrictMode>
      <Providers>
        <RouterProvider router={createAppRouter()} />
      </Providers>
    </StrictMode>,
  );
} else {
  delete window.__staticRouterHydrationData;
  createRoot(container).render(
    <StrictMode>
      <Providers>
        <RouterProvider router={createAppRouter()} />
      </Providers>
    </StrictMode>,
  );
}

hideSplash();

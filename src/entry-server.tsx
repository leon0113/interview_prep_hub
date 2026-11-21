/**
 * Build-time renderer for prerendering (see scripts/prerender.mjs). Built with
 * `vite build --ssr src/entry-server.tsx` and never shipped to the browser.
 */
import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { Providers } from './app/providers';
import { routes } from './app/router';
import { buildCrumbs } from './components/layout/useCrumbs';
import { lcOutline } from './content/leetcode/loader';
import { topicMetas } from './content/leetcode/topics';
import { guideMetas } from './content/guides';
import { loadAllOutlines } from './content/loader';
import type { TrackOutline } from './content/outline';
import { TRACK_ROUTE_ID, type RouteParams } from './features/tracks/useTrack';
import { paths } from './lib/content';
import { titleFromCrumbs } from './lib/documentTitle';

const handler = createStaticHandler(routes);

export interface RenderResult {
  /** Markup for <div id="root">, including React Router's hydration-data script. */
  html: string;
  title: string;
  status: number;
}

export async function render(pathname: string): Promise<RenderResult> {
  const context = await handler.query(new Request(new URL(pathname, 'http://prerender.local')));
  if (context instanceof Response) throw new Error(`${pathname} redirected (${context.status})`);

  const router = createStaticRouter(handler.dataRoutes, context);
  // `prerender` waits for every Suspense boundary (lazy pages, the answer panel) to resolve.
  const { prelude } = await prerender(
    <StrictMode>
      <Providers>
        <StaticRouterProvider router={router} context={context} />
      </Providers>
    </StrictMode>,
    // Write every Suspense boundary in place. By default React outlines large boundaries: it
    // emits a fallback and moves the content to the end of the HTML, swapped in by a script —
    // on a slow connection the fallback paints first and the layout shifts when it is replaced.
    { progressiveChunkSize: Number.POSITIVE_INFINITY },
  );
  const html = await new Response(prelude).text();

  const params = (context.matches.at(-1)?.params ?? {}) as RouteParams;
  const outline = context.loaderData[TRACK_ROUTE_ID] as TrackOutline | undefined;
  const title = titleFromCrumbs(buildCrumbs(pathname, params, outline).map((c) => c.label));

  return { html, title, status: context.statusCode };
}

/**
 * Every content URL: home, tracks, sections, questions, exercises and coverage pages, plus the
 * LeetCode area (the revision session is client-only, like /bookmarks).
 */
export async function prerenderPaths(): Promise<string[]> {
  const outlines = await loadAllOutlines();
  return [
    paths.home(),
    ...outlines.flatMap((track) => [
      paths.track(track.slug),
      ...track.sections.flatMap((section) => [
        paths.section(track.slug, section.id),
        ...section.questions.map((question) => paths.question(track.slug, question.id)),
      ]),
      paths.exercises(track.slug),
      ...track.exercises.map((exercise) => paths.exercise(track.slug, exercise.id)),
      paths.coverage(track.slug),
      ...(track.dataset ? [paths.dataset(track.slug)] : []),
    ]),
    paths.leetcode(),
    paths.lcList('dsa'),
    paths.lcList('database'),
    paths.lcPatterns(),
    paths.lcPractice(),
    paths.lcTopics(),
    ...topicMetas.map((t) => paths.lcTopic(t.id)),
    ...lcOutline.problems.map((p) => paths.lcProblem(p.category, p.slug)),
    paths.guides(),
    ...guideMetas.map((g) => paths.guide(g.id)),
  ];
}

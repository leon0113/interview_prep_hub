import type { ComponentType } from 'react';
import { createBrowserRouter, type LoaderFunctionArgs, type RouteObject } from 'react-router';
import { InitialFallback } from '@/components/common/InitialFallback';
import { loadAnswerPanel } from '@/components/question/lazyContent';
import { RouteError } from '@/components/common/RouteError';
import { AppShell } from '@/components/layout/AppShell';
import {
  loadCoverage,
  loadDataset,
  loadExercises,
  loadOutline,
  loadSection,
} from '@/content/loader';
import { loadLcProblem } from '@/content/leetcode/loader';
import type { LcProblem } from '@/content/leetcode/schema';
import { getTopicMeta, loadTopic } from '@/content/leetcode/topics';
import type { LcTopicData } from '@/pages/leetcode/LcTopicPage';
import type { TrackOutline } from '@/content/outline';
import type {
  CoverageData,
  DatasetData,
  ExerciseData,
  QuestionData,
  SectionData,
} from '@/features/tracks/routeData';
import { TRACK_ROUTE_ID } from '@/features/tracks/useTrack';

/** Route-level code splitting: each page is its own chunk. */
function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default });
}

/** Loads the track outline before any page under `/:trackSlug` renders. */
async function trackLoader({ params }: LoaderFunctionArgs): Promise<TrackOutline> {
  const outline = params.trackSlug ? loadOutline(params.trackSlug) : undefined;
  if (!outline) throw new Response('Track not found', { status: 404 });
  return outline;
}

/*
 * Page loaders fetch only the content chunk a page shows. They run in parallel with the track
 * loader and the page's code chunk. "Not found" is returned as null and rendered by the page,
 * so the shell and navigation stay visible.
 */
async function sectionLoader({ params }: LoaderFunctionArgs): Promise<SectionData> {
  return { section: (await loadSection(params.trackSlug!, params.sectionId!)) ?? null };
}

async function questionLoader({ params }: LoaderFunctionArgs): Promise<QuestionData> {
  // The answer is open by default here, so fetch its code in parallel with the data.
  void loadAnswerPanel();
  const outline = await loadOutline(params.trackSlug!);
  const sectionId = outline?.sections.find((s) =>
    s.questions.some((q) => q.id === params.questionId),
  )?.id;
  const section = sectionId ? await loadSection(params.trackSlug!, sectionId) : undefined;
  // Only this question: prerendered pages embed loader data in their HTML.
  return { question: section?.questions.find((q) => q.id === params.questionId) ?? null };
}

async function exerciseLoader({ params }: LoaderFunctionArgs): Promise<ExerciseData> {
  const exercises = (await loadExercises(params.trackSlug!)) ?? [];
  return { exercise: exercises.find((e) => e.id === params.exerciseId) ?? null };
}

async function coverageLoader({ params }: LoaderFunctionArgs): Promise<CoverageData> {
  return { coverage: (await loadCoverage(params.trackSlug!)) ?? null };
}

async function datasetLoader({ params }: LoaderFunctionArgs): Promise<DatasetData> {
  return { dataset: (await loadDataset(params.trackSlug!)) ?? null };
}

/** Data for a LeetCode problem page: the full problem, or null so the page shows "not found". */
export interface LcProblemData {
  problem: LcProblem | null;
}

async function lcProblemLoader({ params }: LoaderFunctionArgs): Promise<LcProblemData> {
  return { problem: (await loadLcProblem(params.category!, params.slug!)) ?? null };
}

async function lcTopicLoader({ params }: LoaderFunctionArgs): Promise<LcTopicData> {
  const meta = getTopicMeta(params.topicId) ?? null;
  return { meta, topic: meta ? ((await loadTopic(meta.id)) ?? null) : null };
}

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: AppShell,
    ErrorBoundary: RouteError,
    HydrateFallback: InitialFallback,
    children: [
      { index: true, lazy: page(() => import('@/pages/HomePage')) },
      { path: 'bookmarks', lazy: page(() => import('@/pages/BookmarksPage')) },
      {
        // The LeetCode area: not a track, so it is matched before `:trackSlug`.
        path: 'leetcode',
        children: [
          { index: true, lazy: page(() => import('@/pages/leetcode/LeetCodePage')) },
          { path: 'patterns', lazy: page(() => import('@/pages/leetcode/LcPatternsPage')) },
          { path: 'practice', lazy: page(() => import('@/pages/leetcode/LcPracticePage')) },
          // Revision session: driven by saved state, so it is not prerendered.
          { path: 'revise', lazy: page(() => import('@/pages/leetcode/LcRevisePage')) },
          { path: 'topics', lazy: page(() => import('@/pages/leetcode/LcTopicsPage')) },
          {
            path: 'topics/:topicId',
            loader: lcTopicLoader,
            lazy: page(() => import('@/pages/leetcode/LcTopicPage')),
          },
          { path: ':category', lazy: page(() => import('@/pages/leetcode/LcListPage')) },
          {
            path: ':category/:slug',
            loader: lcProblemLoader,
            lazy: page(() => import('@/pages/leetcode/LcProblemPage')),
          },
        ],
      },
      // Development-only review page; the import is dropped from production builds.
      ...(import.meta.env.DEV
        ? [
            {
              path: 'dev/visualizations',
              lazy: page(() => import('@/pages/dev/VizGalleryPage')),
            },
            {
              path: 'dev/components',
              lazy: page(() => import('@/pages/dev/ComponentsPage')),
            },
          ]
        : []),
      {
        id: TRACK_ROUTE_ID,
        path: ':trackSlug',
        loader: trackLoader,
        // Rendered inside the shell, so navigation stays available on a bad URL.
        ErrorBoundary: RouteError,
        children: [
          { index: true, lazy: page(() => import('@/pages/TrackPage')) },
          {
            path: 'q/:questionId',
            loader: questionLoader,
            lazy: page(() => import('@/pages/QuestionPage')),
          },
          { path: 'exercises', lazy: page(() => import('@/pages/ExercisesPage')) },
          {
            path: 'exercises/:exerciseId',
            loader: exerciseLoader,
            lazy: page(() => import('@/pages/ExercisePage')),
          },
          {
            path: 'coverage',
            loader: coverageLoader,
            lazy: page(() => import('@/pages/CoveragePage')),
          },
          {
            // Only for tracks with a sample database (src/content/<track>/dataset.ts).
            path: 'dataset',
            loader: datasetLoader,
            lazy: page(() => import('@/pages/DatasetPage')),
          },
          {
            // In-browser PostgreSQL for tracks with a sample database. Not prerendered.
            path: 'playground',
            lazy: page(() => import('@/pages/PlaygroundPage')),
          },
          {
            path: ':sectionId',
            loader: sectionLoader,
            lazy: page(() => import('@/pages/SectionPage')),
          },
        ],
      },
      { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}

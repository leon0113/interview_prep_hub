import { useLocation } from 'react-router';
import type { TrackOutline } from '@/content/outline';
import { useOptionalTrack, useRouteParams, type RouteParams } from '@/features/tracks/useTrack';
import { findExercise, findQuestion, findSection, paths } from '@/lib/content';
import { questionTitle } from '@/lib/text';

export interface Crumb {
  label: string;
  to?: string;
}

/** Home / Track / Section / Question — used by the breadcrumbs and the document title. */
export function useCrumbs(): Crumb[] {
  return buildCrumbs(useLocation().pathname, useRouteParams(), useOptionalTrack());
}

/** Pure version of useCrumbs, so prerendering can compute page titles without React. */
export function buildCrumbs(
  pathname: string,
  { sectionId, questionId, exerciseId }: RouteParams,
  track: TrackOutline | undefined,
): Crumb[] {
  if (pathname === '/') return [];

  const crumbs: Crumb[] = [{ label: 'Home', to: paths.home() }];

  if (pathname === paths.bookmarks()) {
    crumbs.push({ label: 'Bookmarks' });
    return crumbs;
  }
  if (!track) return [];
  const meta = track;

  crumbs.push({ label: meta.name, to: paths.track(meta.slug) });

  if (questionId) {
    const hit = findQuestion(track, questionId);
    if (hit) {
      crumbs.push({ label: hit.section.title, to: paths.section(meta.slug, hit.section.id) });
      crumbs.push({ label: questionTitle(hit.question.question) });
    }
  } else if (exerciseId) {
    crumbs.push({ label: 'Exercises', to: paths.exercises(meta.slug) });
    const exercise = findExercise(track.exercises, exerciseId);
    if (exercise) crumbs.push({ label: exercise.title });
  } else if (pathname === paths.exercises(meta.slug)) {
    crumbs.push({ label: 'Exercises' });
  } else if (pathname === paths.coverage(meta.slug)) {
    crumbs.push({ label: 'Coverage' });
  } else if (pathname === paths.dataset(meta.slug)) {
    crumbs.push({ label: 'Sample database' });
  } else if (pathname === paths.playground(meta.slug)) {
    crumbs.push({ label: 'Playground' });
  } else if (sectionId) {
    const section = findSection(track, sectionId);
    if (section) crumbs.push({ label: section.title });
  }

  // The last crumb is the current page, never a link.
  const last = crumbs.at(-1);
  if (last) delete last.to;
  return crumbs;
}

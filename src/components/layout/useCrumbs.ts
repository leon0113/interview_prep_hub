import { useLocation } from 'react-router';
import { findLcProblem, LC_CATEGORY_SHORT } from '@/content/leetcode/loader';
import { getTopicMeta } from '@/content/leetcode/topics';
import { getGuideMeta } from '@/content/guides';
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
  { sectionId, questionId, exerciseId, category, slug, topicId, guideId }: RouteParams,
  track: TrackOutline | undefined,
): Crumb[] {
  if (pathname === '/') return [];

  const crumbs: Crumb[] = [{ label: 'Home', to: paths.home() }];

  if (pathname === paths.bookmarks()) {
    crumbs.push({ label: 'Bookmarks' });
    return crumbs;
  }
  if (pathname === paths.guides() || pathname.startsWith(`${paths.guides()}/`)) {
    crumbs.push({ label: 'Guides', to: paths.guides() });
    const guide = getGuideMeta(guideId);
    if (guide) crumbs.push({ label: guide.title });
    return endCrumbs(crumbs);
  }
  if (pathname === paths.leetcode() || pathname.startsWith(`${paths.leetcode()}/`)) {
    return leetcodeCrumbs(crumbs, pathname, category, slug, topicId);
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

  return endCrumbs(crumbs);
}

/** The last crumb is the current page, never a link. */
function endCrumbs(crumbs: Crumb[]): Crumb[] {
  const last = crumbs.at(-1);
  if (last) delete last.to;
  return crumbs;
}

/** Home / LeetCode / DSA / #27 Remove Element (and Patterns, Practice, Revise). */
function leetcodeCrumbs(
  crumbs: Crumb[],
  pathname: string,
  category: string | undefined,
  slug: string | undefined,
  topicId: string | undefined,
): Crumb[] {
  crumbs.push({ label: 'LeetCode', to: paths.leetcode() });
  if (pathname.startsWith(paths.lcTopics())) {
    crumbs.push({ label: 'Topics', to: paths.lcTopics() });
    const topic = getTopicMeta(topicId);
    if (topic) crumbs.push({ label: topic.title });
    return endCrumbs(crumbs);
  }
  const fixed: Record<string, string> = {
    [paths.lcPatterns()]: 'Patterns',
    [paths.lcPractice()]: 'Practice',
    [paths.lcRevise()]: 'Revise',
  };
  if (fixed[pathname]) {
    crumbs.push({ label: fixed[pathname] });
  } else if (category === 'dsa' || category === 'database') {
    crumbs.push({ label: LC_CATEGORY_SHORT[category], to: paths.lcList(category) });
    const problem = slug ? findLcProblem(category, slug) : undefined;
    if (problem) crumbs.push({ label: `#${problem.number} ${problem.title}` });
  }
  return endCrumbs(crumbs);
}

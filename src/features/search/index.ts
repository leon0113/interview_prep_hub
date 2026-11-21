import Fuse from 'fuse.js';
import type { GuideSearchEntry } from '@/content/guides';
import type { LcProblemOutline } from '@/content/leetcode/outline';
import type { TrackOutline } from '@/content/outline';
import type { Accent, Level } from '@/content/schema';
import { paths, sortedSections } from '@/lib/content';
import { questionTitle } from '@/lib/text';

export type SearchItemType =
  | 'section'
  | 'question'
  | 'exercise'
  | 'concept'
  | 'problem'
  | 'topic'
  | 'recipe'
  | 'guide-section';

/** Results from the LeetCode area are grouped under this pseudo-track. */
export const LEETCODE_GROUP = 'leetcode';

/** Results from a guide are grouped under `guide:<id>`. */
export const guideGroup = (guideId: string) => `guide:${guideId}`;

export interface SearchItem {
  id: string;
  type: SearchItemType;
  /** Plain-text title (markdown markers stripped). */
  title: string;
  /** Where it lives: section title, "Exercise", "Quick concept"… */
  context: string;
  tags: string[];
  level?: Level;
  /** LeetCode problems only. */
  difficulty?: LcProblemOutline['difficulty'];
  trackSlug: string;
  trackName: string;
  accent: Accent;
  /** Where Enter takes you — for questions, the anchor on the section page. */
  path: string;
}

export interface SearchFilters {
  /** Track slug. */
  track?: string;
  level?: Level;
  /** `guide` matches guide recipes and guide sections. */
  type?: 'question' | 'exercise' | 'problem' | 'guide';
}

export const TYPE_LABEL: Record<SearchItemType, string> = {
  section: 'Section',
  question: 'Question',
  exercise: 'Exercise',
  concept: 'Quick concept',
  problem: 'LeetCode problem',
  topic: 'LeetCode topic',
  recipe: 'Recipe',
  'guide-section': 'Notes',
};

/**
 * Flattens every track (and the LeetCode problems) into searchable items. Adding a track or a
 * problem needs no changes here.
 */
export function buildSearchIndex(
  tracks: readonly TrackOutline[],
  problems: readonly LcProblemOutline[] = [],
  topics: readonly { id: string; title: string; description: string }[] = [],
  guideEntries: readonly GuideSearchEntry[] = [],
): SearchItem[] {
  const trackItems = tracks.flatMap((track) => {
    const base = { trackSlug: track.slug, trackName: track.name, accent: track.accent };
    const items: SearchItem[] = [];

    for (const section of sortedSections(track)) {
      items.push({
        ...base,
        id: section.id,
        type: 'section',
        title: section.title,
        context: `${section.questions.length} questions`,
        tags: [],
        path: paths.section(track.slug, section.id),
      });
      for (const question of section.questions) {
        items.push({
          ...base,
          id: question.id,
          type: 'question',
          title: questionTitle(question.question),
          context: section.title,
          tags: question.tags,
          level: question.level,
          path: paths.section(track.slug, section.id, question.id),
        });
      }
    }

    for (const exercise of track.exercises) {
      items.push({
        ...base,
        id: exercise.id,
        type: 'exercise',
        title: exercise.title,
        context: 'Exercise',
        tags: [...new Set([...exercise.tags, exercise.category])],
        level: exercise.level,
        path: paths.exercise(track.slug, exercise.id),
      });
    }

    for (const concept of track.quickConcepts) {
      items.push({
        ...base,
        id: concept.id,
        type: 'concept',
        title: questionTitle(concept.question),
        context: 'Quick concept',
        tags: concept.tags,
        level: concept.level,
        path: `${paths.coverage(track.slug)}#${concept.id}`,
      });
    }

    return items;
  });

  const problemItems: SearchItem[] = problems.map((problem) => ({
    id: problem.id,
    type: 'problem',
    // "#27 Remove Element": typing "27" or a title word finds it.
    title: `#${problem.number} ${problem.title}`,
    context: problem.patternLabel,
    difficulty: problem.difficulty,
    tags: [...problem.tags, problem.patternId, problem.category, String(problem.number)],
    trackSlug: LEETCODE_GROUP,
    trackName: 'LeetCode',
    accent: 'violet',
    path: `/leetcode/${problem.category}/${problem.slug}`,
  }));

  const topicItems: SearchItem[] = topics.map((topic) => ({
    id: `lc-topic-${topic.id}`,
    type: 'topic',
    title: topic.title,
    context: 'Topic: theory and problems',
    tags: [topic.id, 'theory', 'data structure'],
    trackSlug: LEETCODE_GROUP,
    trackName: 'LeetCode',
    accent: 'violet',
    path: `/leetcode/topics/${topic.id}`,
  }));

  const guideItems: SearchItem[] = guideEntries.map((entry) => ({
    id: entry.id,
    type: entry.kind === 'recipe' ? 'recipe' : 'guide-section',
    title: entry.title,
    context: entry.context,
    tags: entry.keywords,
    trackSlug: guideGroup(entry.guide.id),
    trackName: entry.guide.title,
    accent: entry.guide.accent,
    path: paths.guide(entry.guide.id, entry.anchor),
  }));

  return [...trackItems, ...topicItems, ...problemItems, ...guideItems];
}

function matchesFilters(item: SearchItem, filters: SearchFilters): boolean {
  if (filters.track && item.trackSlug !== filters.track) return false;
  if (filters.level && item.level !== filters.level) return false;
  if (filters.type === 'guide') return item.type === 'recipe' || item.type === 'guide-section';
  if (filters.type && item.type !== filters.type) return false;
  return true;
}

export const MAX_RESULTS = 40;

/** Returns a search function over the items: fuzzy when there is a query, a browsable list when not. */
export function createSearcher(items: readonly SearchItem[]) {
  const fuse = new Fuse(items, {
    keys: [
      { name: 'title', weight: 0.6 },
      { name: 'tags', weight: 0.25 },
      { name: 'context', weight: 0.15 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  return function search(query: string, filters: SearchFilters = {}): SearchItem[] {
    const trimmed = query.trim();
    // With no query, browse: every track's sections, or every item of the chosen type.
    const pool = trimmed
      ? fuse.search(trimmed).map((result) => result.item)
      : items.filter((item) => (filters.type ? true : item.type === 'section'));
    return pool.filter((item) => matchesFilters(item, filters)).slice(0, MAX_RESULTS);
  };
}

/** Groups results by track, keeping both the track order and the rank order inside a track. */
export function groupByTrack(
  results: readonly SearchItem[],
  trackOrder: readonly string[],
): { trackSlug: string; items: SearchItem[] }[] {
  return trackOrder
    .map((trackSlug) => ({
      trackSlug,
      items: results.filter((item) => item.trackSlug === trackSlug),
    }))
    .filter((group) => group.items.length > 0);
}

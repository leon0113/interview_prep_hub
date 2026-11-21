import type { Exercise, Level, Question } from '@/content/schema';
import type { ExerciseOutline, QuestionOutline, TrackOutline } from '@/content/outline';
import { LEVELS } from '@/content/constants';
import { questionTitle } from './text';

/*
 * Helpers are typed structurally so they work on both a track outline (titles and ids only)
 * and on fully loaded content (a full Section has every field an outline section has).
 */
export interface SectionLike {
  id: string;
  title: string;
  order: number;
  questions: readonly QuestionOutline[];
}
type TrackLike = Pick<TrackOutline, 'slug'> & { sections: readonly SectionLike[] };

export const LEVEL_LABEL: Record<Level, string> = {
  foundation: 'Foundation',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function sectionQuestionIds(section: Pick<SectionLike, 'questions'>): string[] {
  return section.questions.map((q) => q.id);
}

export function trackQuestionIds(track: Pick<TrackLike, 'sections'>): string[] {
  return track.sections.flatMap(sectionQuestionIds);
}

export function sortedSections<S extends SectionLike>(track: { sections: readonly S[] }): S[] {
  return [...track.sections].sort((a, b) => a.order - b.order);
}

export function findSection<S extends SectionLike>(
  track: { sections: readonly S[] },
  sectionId: string | undefined,
): S | undefined {
  return track.sections.find((s) => s.id === sectionId);
}

export interface QuestionLocation<S extends SectionLike = SectionLike> {
  question: S['questions'][number];
  section: S;
  /** Previous / next question across the whole track, in reading order. */
  prev?: S['questions'][number];
  next?: S['questions'][number];
}

export function findQuestion<S extends SectionLike>(
  track: { sections: readonly S[] },
  questionId: string | undefined,
): QuestionLocation<S> | undefined {
  const sections = sortedSections(track);
  const flat = sections.flatMap((section) =>
    section.questions.map((question) => ({ question, section })),
  );
  const index = flat.findIndex((item) => item.question.id === questionId);
  const hit = flat[index];
  if (!hit) return undefined;
  return { ...hit, prev: flat[index - 1]?.question, next: flat[index + 1]?.question };
}

export function findExercise<E extends Pick<ExerciseOutline, 'id'>>(
  exercises: readonly E[],
  exerciseId: string | undefined,
): E | undefined {
  return exercises.find((e) => e.id === exerciseId);
}

export function countByLevel(questions: readonly { level: Level }[]): Record<Level, number> {
  const counts: Record<Level, number> = { foundation: 0, intermediate: 0, advanced: 0 };
  for (const q of questions) counts[q.level] += 1;
  return counts;
}

export function levelRank(level: Level): number {
  return LEVELS.indexOf(level);
}

/** Canonical URLs — keep every link in the app going through these. */
export const paths = {
  home: () => '/',
  bookmarks: () => '/bookmarks',
  track: (trackSlug: string) => `/${trackSlug}`,
  section: (trackSlug: string, sectionId: string, questionId?: string) =>
    `/${trackSlug}/${sectionId}${questionId ? `#${questionId}` : ''}`,
  question: (trackSlug: string, questionId: string) => `/${trackSlug}/q/${questionId}`,
  exercises: (trackSlug: string) => `/${trackSlug}/exercises`,
  exercise: (trackSlug: string, exerciseId: string) => `/${trackSlug}/exercises/${exerciseId}`,
  coverage: (trackSlug: string) => `/${trackSlug}/coverage`,
  dataset: (trackSlug: string) => `/${trackSlug}/dataset`,
  playground: (trackSlug: string) => `/${trackSlug}/playground`,

  // LeetCode area (not a track)
  leetcode: () => '/leetcode',
  lcList: (category: 'dsa' | 'database') => `/leetcode/${category}`,
  lcProblem: (category: 'dsa' | 'database', slug: string) => `/leetcode/${category}/${slug}`,
  lcPatterns: (patternId?: string) => `/leetcode/patterns${patternId ? `#${patternId}` : ''}`,
  lcPractice: () => '/leetcode/practice',
  lcRevise: () => '/leetcode/revise',
  lcTopics: () => '/leetcode/topics',
  lcTopic: (topicId: string) => `/leetcode/topics/${topicId}`,

  // Guides (tool handbooks from my notes, e.g. Docker)
  guides: () => '/guides',
  guide: (guideId: string, anchor?: string) => `/guides/${guideId}${anchor ? `#${anchor}` : ''}`,
};

export interface RelatedLink {
  id: string;
  title: string;
  to: string;
}

/** Resolves a question's `related` ids (within the same track) to titled links. */
export function relatedLinks(
  track: TrackLike,
  question: Pick<Question, 'related'>,
  mode: 'anchor' | 'page' = 'anchor',
): RelatedLink[] {
  return (question.related ?? []).flatMap((id) => {
    const hit = findQuestion(track, id);
    if (!hit) return [];
    return [
      {
        id,
        title: questionTitle(hit.question.question),
        to:
          mode === 'page'
            ? paths.question(track.slug, id)
            : paths.section(track.slug, hit.section.id, id),
      },
    ];
  });
}

/** Previous / next section in reading order. */
export function sectionNeighbours<S extends SectionLike>(
  track: { sections: readonly S[] },
  sectionId: string,
): { prev?: S; next?: S } {
  const sections = sortedSections(track);
  const index = sections.findIndex((s) => s.id === sectionId);
  return { prev: sections[index - 1], next: sections[index + 1] };
}

export const CATEGORY_LABEL: Record<Exercise['category'], string> = {
  logic: 'Logic',
  strings: 'Strings',
  arrays: 'Arrays',
  hashing: 'Hashing',
  recursion: 'Recursion',
  'language-feature': 'Language feature',
  'output-prediction': 'Output prediction',
  implementation: 'Implementation',
};

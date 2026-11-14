import type { Dataset, Exercise, Question, Section, Track, TrackMeta } from './schema';

/**
 * A track outline is the light, always-needed part of a track: titles, ids, levels and tags,
 * without answers, code or explanations. It powers the home page, sidebar, search, track page
 * and bookmarks; full content is loaded per section only when a page needs it.
 *
 * Outlines are GENERATED from the content (`npm run gen:outlines`, also run automatically by the
 * Vite plugin in dev/build) into `src/content/<track>/outline.generated.json`.
 * `tests/outline.test.ts` fails if a committed outline is out of date.
 */

export type QuestionOutline = Pick<
  Question,
  'id' | 'sectionId' | 'level' | 'priority' | 'question' | 'tags'
>;

export interface SectionOutline extends Omit<Section, 'questions'> {
  /** File name in `sections/` (without `.ts`) that holds the full section. */
  module: string;
  questions: QuestionOutline[];
}

export interface ExerciseOutline extends Pick<
  Exercise,
  'id' | 'title' | 'level' | 'category' | 'tags'
> {
  solutionCount: number;
}

export interface TrackOutline extends TrackMeta {
  sections: SectionOutline[];
  exercises: ExerciseOutline[];
  quickConcepts: QuestionOutline[];
  /** Present when the track has a sample database (`src/content/<track>/dataset.ts`). */
  dataset?: { title: string; tables: string[] };
}

function questionOutline(q: Question): QuestionOutline {
  return {
    id: q.id,
    sectionId: q.sectionId,
    level: q.level,
    priority: q.priority,
    question: q.question,
    tags: q.tags,
  };
}

/** Builds the outline of a full track. `moduleOf` maps a section id to its file name. */
export function buildOutline(
  track: Track,
  moduleOf: (sectionId: string) => string,
  dataset?: Dataset,
): TrackOutline {
  const meta: TrackMeta = {
    id: track.id,
    name: track.name,
    slug: track.slug,
    accent: track.accent,
    icon: track.icon,
    description: track.description,
  };
  return {
    ...meta,
    sections: track.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      order: section.order,
      module: moduleOf(section.id),
      questions: section.questions.map(questionOutline),
    })),
    exercises: track.exercises.map((exercise) => ({
      id: exercise.id,
      title: exercise.title,
      level: exercise.level,
      category: exercise.category,
      tags: exercise.tags,
      solutionCount: exercise.solutions.length,
    })),
    quickConcepts: track.coverage.quickConcepts.map(questionOutline),
    ...(dataset
      ? { dataset: { title: dataset.title, tables: dataset.tables.map((table) => table.name) } }
      : {}),
  };
}

/** True for a value that looks like a `Section` export of a section module. */
export function isSection(value: unknown): value is Section {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'questions' in value &&
    Array.isArray(value.questions)
  );
}

/** Serialises an outline exactly as it is written to disk (stable, diff-friendly). */
export function serializeOutline(outline: TrackOutline): string {
  return `${JSON.stringify(outline, null, 2)}\n`;
}

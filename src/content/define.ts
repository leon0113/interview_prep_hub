import { LEVELS } from './constants';
import type { Question, Section } from './schema';

/** A question as written inside a section file: `sectionId` is filled in by defineSection. */
export type SectionQuestion = Omit<Question, 'sectionId'>;

interface SectionInput extends Omit<Section, 'questions'> {
  questions: SectionQuestion[];
}

/**
 * Builds a Section: stamps every question with the section's id and orders the questions
 * foundation → intermediate → advanced, then by priority (high first). The sort is stable,
 * so questions with the same level and priority keep the order they were written in.
 */
export function defineSection({ questions, ...section }: SectionInput): Section {
  return {
    ...section,
    questions: questions
      .map((question) => ({ ...question, sectionId: section.id }))
      .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || b.priority - a.priority),
  };
}

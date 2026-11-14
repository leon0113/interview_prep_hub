import { useLoaderData } from 'react-router';
import type { Coverage, Dataset, Exercise, Question, Section } from '@/content/schema';

/*
 * Data returned by the per-page route loaders in app/router.tsx. Each page gets only the
 * content it shows (prerendered pages embed it in their HTML); "not found" is `null`,
 * rendered by the page inside the shell.
 */
export type SectionData = { section: Section | null };
export type QuestionData = { question: Question | null };
export type ExerciseData = { exercise: Exercise | null };
export type CoverageData = { coverage: Coverage | null };
export type DatasetData = { dataset: Dataset | null };

export const useSectionData = () => useLoaderData() as SectionData;
export const useQuestionData = () => useLoaderData() as QuestionData;
export const useExerciseData = () => useLoaderData() as ExerciseData;
export const useCoverageData = () => useLoaderData() as CoverageData;
export const useDatasetData = () => useLoaderData() as DatasetData;

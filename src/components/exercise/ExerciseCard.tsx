import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router';
import { LevelBadge } from '@/components/question/LevelBadge';
import type { ExerciseOutline } from '@/content/outline';
import { useIsLearned } from '@/features/progress/hooks';
import { cn } from '@/lib/cn';
import { CATEGORY_LABEL, paths } from '@/lib/content';

interface ExerciseCardProps {
  trackSlug: string;
  exercise: ExerciseOutline;
  /** Position in the full list. */
  index: number;
}

/** One row in the exercise list. */
export function ExerciseCard({ trackSlug, exercise, index }: ExerciseCardProps) {
  const solved = useIsLearned(exercise.id);

  return (
    <Link
      to={paths.exercise(trackSlug, exercise.id)}
      className={cn(
        'group flex items-center gap-3 rounded-xl border bg-surface p-4 shadow-card transition-colors hover:border-accent-border',
        solved ? 'border-accent-border' : 'border-border',
      )}
    >
      <span className="font-mono text-sm text-subtle tabular-nums">
        {String(index).padStart(2, '0')}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{exercise.title}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-2">
          <LevelBadge level={exercise.level} />
          <span className="text-xs text-muted">{CATEGORY_LABEL[exercise.category]}</span>
          <span className="text-xs text-subtle">
            {exercise.solutionCount > 1 ? `${exercise.solutionCount} approaches` : null}
          </span>
        </span>
      </span>
      {solved ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-text">
          <Check className="size-3.5" aria-hidden />
          Solved
        </span>
      ) : null}
      <ArrowRight
        className="size-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-accent-text"
        aria-hidden
      />
    </Link>
  );
}

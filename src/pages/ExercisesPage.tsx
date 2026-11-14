import { Dumbbell, FilterX } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { Button } from '@/components/ui/button';
import { Chip, ChipDivider } from '@/components/ui/chip';
import { EXERCISE_CATEGORIES, LEVELS } from '@/content/constants';
import type { ExerciseCategory, Level } from '@/content/schema';
import { useLearnedCount } from '@/features/progress/hooks';
import { useTrack } from '@/features/tracks/useTrack';
import { CATEGORY_LABEL, LEVEL_LABEL } from '@/lib/content';

function oneOf<T extends string>(options: readonly T[], value: string | null): T | undefined {
  return options.find((option) => option === value);
}

export default function ExercisesPage() {
  const track = useTrack();
  const [searchParams, setSearchParams] = useSearchParams();
  const level: Level | undefined = oneOf(LEVELS, searchParams.get('level'));
  const category: ExerciseCategory | undefined = oneOf(
    EXERCISE_CATEGORIES,
    searchParams.get('category'),
  );
  const solved = useLearnedCount(track.exercises.map((exercise) => exercise.id));

  const numbered = track.exercises.map((exercise, index) => ({ exercise, number: index + 1 }));
  const visible = numbered.filter(
    ({ exercise }) =>
      (!level || exercise.level === level) && (!category || exercise.category === category),
  );
  const levelsPresent = LEVELS.filter((value) => track.exercises.some((e) => e.level === value));
  const categoriesPresent = EXERCISE_CATEGORIES.filter((value) =>
    track.exercises.some((e) => e.category === value),
  );

  function setFilter(key: 'level' | 'category', value: string | undefined) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={track.name}
        title="Exercises"
        description="Logic-building and coding-round problems. Try each one before opening the hints — they are revealed one at a time."
      >
        <p className="mt-4 text-sm text-muted">
          <span className="font-medium text-fg tabular-nums">
            {solved}/{track.exercises.length}
          </span>{' '}
          solved
        </p>
      </PageHeader>

      {track.exercises.length === 0 ? (
        <EmptyState icon={Dumbbell} title="No exercises yet" />
      ) : (
        <>
          <div className="sticky top-14 z-30 -mx-4 mb-5 border-b border-border bg-bg/90 backdrop-blur-md sm:-mx-6 lg:-mx-10">
            <div
              role="group"
              aria-label="Filter exercises"
              className="flex scrollbar-none items-center gap-1.5 overflow-x-auto px-4 py-2 sm:px-6 lg:px-10"
            >
              <Chip
                selected={!level}
                count={track.exercises.length}
                onClick={() => setFilter('level', undefined)}
              >
                All
              </Chip>
              {levelsPresent.map((value) => (
                <Chip
                  key={value}
                  selected={level === value}
                  onClick={() => setFilter('level', level === value ? undefined : value)}
                >
                  {LEVEL_LABEL[value]}
                </Chip>
              ))}
              <ChipDivider />
              {categoriesPresent.map((value) => (
                <Chip
                  key={value}
                  selected={category === value}
                  onClick={() => setFilter('category', category === value ? undefined : value)}
                >
                  {CATEGORY_LABEL[value]}
                </Chip>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={FilterX}
              title="No exercises match these filters"
              action={
                <Button variant="outline" onClick={() => setSearchParams({}, { replace: true })}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ol className="flex flex-col gap-3">
              {visible.map(({ exercise, number }) => (
                <li key={exercise.id}>
                  <ExerciseCard trackSlug={track.slug} exercise={exercise} index={number} />
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}

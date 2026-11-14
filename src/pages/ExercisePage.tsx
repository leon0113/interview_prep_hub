import { HydrationBoundary } from '@/components/common/HydrationBoundary';
import type { ReactNode } from 'react';
import { InlineMarkdown, Markdown } from '@/components/common/Markdown';
import { NotFound } from '@/components/common/NotFound';
import { PageHeader } from '@/components/common/PageHeader';
import { Pager } from '@/components/common/Pager';
import { HintList } from '@/components/exercise/HintList';
import { SolutionPanel } from '@/components/exercise/SolutionPanel';
import { LearnedCheckbox } from '@/components/question/LearnedCheckbox';
import { LevelBadge } from '@/components/question/LevelBadge';
import { CODE_LANGS } from '@/content/constants';
import type { CodeLang } from '@/content/schema';
import { useTrackVisit } from '@/features/progress/hooks';
import { useExerciseData } from '@/features/tracks/routeData';
import { useTrack } from '@/features/tracks/useTrack';
import { CATEGORY_LABEL, paths } from '@/lib/content';

const SOLVED_LABELS = { off: 'Mark as solved', on: 'Solved' };

/** Exercise code is written in the track's own language. */
function trackLang(trackId: string): CodeLang {
  return (CODE_LANGS as readonly string[]).includes(trackId) ? (trackId as CodeLang) : 'text';
}

export default function ExercisePage() {
  const track = useTrack();
  const { exercise } = useExerciseData();

  useTrackVisit(
    exercise
      ? {
          trackSlug: track.slug,
          path: paths.exercise(track.slug, exercise.id),
          title: exercise.title,
          kind: 'exercise',
        }
      : undefined,
  );

  if (!exercise) return <NotFound />;

  const lang = trackLang(track.id);
  // Position and neighbours come from the outline; the loader only sends this exercise.
  const index = track.exercises.findIndex((e) => e.id === exercise.id);
  const prev = track.exercises[index - 1];
  const next = track.exercises[index + 1];

  return (
    <div>
      <PageHeader
        eyebrow={`${track.name} · Exercise ${index + 1} of ${track.exercises.length}`}
        title={exercise.title}
      >
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <LevelBadge level={exercise.level} />
          <span className="text-xs text-muted">{CATEGORY_LABEL[exercise.category]}</span>
          <LearnedCheckbox id={exercise.id} labels={SOLVED_LABELS} className="ml-auto" />
        </div>
      </PageHeader>

      {/* Keyed so revealed hints and the solution hide again on the next exercise. */}
      <div key={exercise.id} className="space-y-9">
        <Markdown className="text-[0.9375rem]">{exercise.prompt}</Markdown>

        {exercise.examples.length > 0 ? (
          <Block title="Examples">
            <ul className="space-y-2">
              {exercise.examples.map((example, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-surface p-3.5 font-mono text-[0.8125rem] leading-6 shadow-card"
                >
                  <div
                    tabIndex={0}
                    aria-label={`Example ${i + 1} input`}
                    className="flex scrollbar-thin gap-3 overflow-x-auto whitespace-nowrap"
                  >
                    <span className="w-12 shrink-0 font-sans text-xs leading-6 text-subtle">
                      Input
                    </span>
                    <span>{example.input}</span>
                  </div>
                  <div
                    tabIndex={0}
                    aria-label={`Example ${i + 1} output`}
                    className="flex scrollbar-thin gap-3 overflow-x-auto whitespace-nowrap"
                  >
                    <span className="w-12 shrink-0 font-sans text-xs leading-6 text-subtle">
                      Output
                    </span>
                    <span>{example.output}</span>
                  </div>
                  {example.note ? (
                    <div className="mt-1.5 border-t border-border pt-1.5 font-sans text-xs text-muted">
                      {example.note}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        {exercise.constraints?.length ? (
          <Block title="Constraints">
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
              {exercise.constraints.map((constraint) => (
                <li key={constraint}>
                  <InlineMarkdown>{constraint}</InlineMarkdown>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        <Block title="Hints">
          <HintList hints={exercise.hints} />
        </Block>

        <Block title={exercise.solutions.length > 1 ? 'Solutions' : 'Solution'}>
          <SolutionPanel exercise={exercise} lang={lang} />
        </Block>
      </div>

      <Pager
        label="Previous and next exercise"
        prev={prev && { to: paths.exercise(track.slug, prev.id), title: prev.title }}
        next={next && { to: paths.exercise(track.slug, next.id), title: next.title }}
      />
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold tracking-wider text-accent-text uppercase">
        {title}
      </h2>
      {/* Each block hydrates on its own (see HydrationBoundary). */}
      <HydrationBoundary>{children}</HydrationBoundary>
    </section>
  );
}

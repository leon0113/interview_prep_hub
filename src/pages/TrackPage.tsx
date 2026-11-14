import {
  ArrowRight,
  Compass,
  Dumbbell,
  SquareTerminal,
  Table2,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { ProgressRing } from '@/components/common/ProgressRing';
import { TrackIcon } from '@/components/common/TrackIcon';
import { LevelBadge } from '@/components/question/LevelBadge';
import { LEVELS } from '@/content/constants';
import type { SectionOutline } from '@/content/outline';
import { useLearnedCount } from '@/features/progress/hooks';
import { useTrack } from '@/features/tracks/useTrack';
import {
  countByLevel,
  paths,
  sectionQuestionIds,
  sortedSections,
  trackQuestionIds,
} from '@/lib/content';
import { pluralize } from '@/lib/text';

export default function TrackPage() {
  const track = useTrack();
  const questionIds = trackQuestionIds(track);
  const exerciseIds = track.exercises.map((exercise) => exercise.id);
  const learned = useLearnedCount(questionIds);
  const solved = useLearnedCount(exerciseIds);
  const levels = countByLevel(track.sections.flatMap((section) => section.questions));

  return (
    <div>
      <PageHeader
        icon={<TrackIcon meta={track} size="lg" />}
        title={track.name}
        description={track.description}
      >
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5">
          <ProgressRing
            value={learned}
            max={questionIds.length}
            label={`${track.name} progress`}
            size={64}
            strokeWidth={6}
          />
          <dl className="grid flex-1 grid-cols-3 gap-4 text-sm">
            <Stat label="Learned" value={`${learned}/${questionIds.length}`} />
            <Stat label="Exercises solved" value={`${solved}/${exerciseIds.length}`} />
            <Stat label="Sections" value={String(track.sections.length)} />
          </dl>
          <div className="flex w-full flex-wrap gap-2 border-t border-border pt-4">
            {LEVELS.filter((level) => levels[level] > 0).map((level) => (
              <span key={level} className="inline-flex items-center gap-1.5 text-xs text-muted">
                <LevelBadge level={level} />
                <span className="tabular-nums">{levels[level]}</span>
              </span>
            ))}
          </div>
        </div>
      </PageHeader>

      <section aria-labelledby="sections-heading">
        <h2
          id="sections-heading"
          className="mb-3 text-xs font-semibold tracking-wider text-subtle uppercase"
        >
          Sections
        </h2>
        <ol className="flex flex-col gap-3">
          {sortedSections(track).map((section) => (
            <li key={section.id}>
              <SectionCard trackSlug={track.slug} section={section} />
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="more-heading" className="mt-10">
        <h2
          id="more-heading"
          className="mb-3 text-xs font-semibold tracking-wider text-subtle uppercase"
        >
          Practice &amp; review
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <MoreCard
            to={paths.exercises(track.slug)}
            icon={Dumbbell}
            title="Exercises"
            description={`${pluralize(track.exercises.length, 'coding-round problem')} with hints and solutions.`}
          />
          <MoreCard
            to={paths.coverage(track.slug)}
            icon={Compass}
            title="Coverage"
            description="Quick concepts, what is intentionally skipped, and study tips."
          />
          {track.dataset ? (
            <MoreCard
              to={paths.dataset(track.slug)}
              icon={Table2}
              title="Sample database"
              description={`The ${pluralize(track.dataset.tables.length, 'table')} every example runs against, with an ER diagram and the seed SQL.`}
            />
          ) : null}
          {track.dataset ? (
            <MoreCard
              to={paths.playground(track.slug)}
              icon={SquareTerminal}
              title="SQL Playground"
              description="Run your own queries on real PostgreSQL in the browser."
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-lg font-semibold tracking-tight tabular-nums">{value}</dd>
    </div>
  );
}

function SectionCard({ trackSlug, section }: { trackSlug: string; section: SectionOutline }) {
  const ids = sectionQuestionIds(section);
  const learned = useLearnedCount(ids);
  const levels = countByLevel(section.questions);

  return (
    <Link
      to={paths.section(trackSlug, section.id)}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-accent-border sm:p-5"
    >
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 font-semibold">
          <span className="font-mono text-sm font-normal text-subtle tabular-nums">
            {String(section.order).padStart(2, '0')}
          </span>
          <span className="min-w-0">{section.title}</span>
          <ArrowRight
            className="size-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-accent-text"
            aria-hidden
          />
        </h3>
        <p className="mt-1 text-sm leading-6 text-pretty text-muted">{section.description}</p>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {LEVELS.filter((level) => levels[level] > 0).map((level) => (
            <span key={level} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${
                  level === 'foundation'
                    ? 'bg-level-foundation'
                    : level === 'intermediate'
                      ? 'bg-level-intermediate'
                      : 'bg-level-advanced'
                }`}
              />
              <span className="font-medium text-fg tabular-nums">{levels[level]}</span>
              <span className="capitalize">{level}</span>
            </span>
          ))}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <ProgressRing value={learned} max={ids.length} label={`${section.title} progress`} />
        <span className="text-[0.6875rem] text-subtle tabular-nums">
          {learned}/{ids.length}
        </span>
      </div>
    </Link>
  );
}

function MoreCard({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="flex gap-3 rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-accent-border"
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
        <Icon className="size-[1.125rem]" aria-hidden />
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm leading-6 text-muted">{description}</span>
      </span>
    </Link>
  );
}

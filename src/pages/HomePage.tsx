import { ArrowRight, History } from 'lucide-react';
import { Suspense, use } from 'react';
import { Link } from 'react-router';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ProgressRing } from '@/components/common/ProgressRing';
import { TrackIcon } from '@/components/common/TrackIcon';
import { getTrackMeta, loadAllOutlines, loadOutline, trackMetas } from '@/content/loader';
import type { TrackMeta } from '@/content/schema';
import { useBookmarkCount, useLearnedCount } from '@/features/progress/hooks';
import { useProgressStore } from '@/features/progress/store';
import { paths, trackQuestionIds } from '@/lib/content';
import { pluralize } from '@/lib/text';

const sectionHeading = 'mb-3 text-xs font-semibold tracking-wider text-subtle uppercase';

export default function HomePage() {
  return (
    <div>
      <header className="pt-4 pb-10 sm:pt-8">
        <p className="mb-3 text-xs font-semibold tracking-wider text-accent-text uppercase">
          {trackMetas.map((meta) => meta.name).join(' · ')}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Walk into the interview knowing what to say.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-pretty text-muted">
          Language-level questions ordered from foundation to advanced. Every answer comes as a
          short interview answer in English, a deeper{' '}
          <span lang="bn" className="text-fg">
            ব্যাখ্যা
          </span>{' '}
          in Bangla, and code with its real output.
        </p>
      </header>

      <ContinueCard />

      <section aria-labelledby="progress-heading" className="mb-10">
        <h2 id="progress-heading" className={sectionHeading}>
          Overall progress
        </h2>
        <Suspense fallback={<div className="h-[5.5rem] rounded-xl border border-border" />}>
          <OverallProgress />
        </Suspense>
      </section>

      <section aria-labelledby="tracks-heading">
        <h2 id="tracks-heading" className={sectionHeading}>
          Tracks
        </h2>
        <ul className="flex flex-col gap-3">
          {trackMetas.map((meta) => (
            <li key={meta.slug}>
              <TrackCard meta={meta} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ContinueCard() {
  const lastVisited = useProgressStore((state) => state.lastVisited);
  const meta = getTrackMeta(lastVisited?.trackSlug);
  if (!lastVisited || !meta) return null;

  return (
    <section aria-labelledby="continue-heading" data-accent={meta.accent} className="mb-10">
      <h2 id="continue-heading" className={sectionHeading}>
        Continue where you left off
      </h2>
      <Link
        to={lastVisited.path}
        className="group flex items-center gap-4 rounded-xl border border-accent-border bg-accent-soft p-4 transition-colors sm:p-5"
      >
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-accent-text">
          <History className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-accent-text capitalize">
            {meta.name} · {lastVisited.kind}
          </span>
          <span className="block truncate font-medium">{lastVisited.title}</span>
        </span>
        <ArrowRight
          className="size-5 shrink-0 text-accent-text transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </section>
  );
}

function OverallProgress() {
  const tracks = use(loadAllOutlines());
  const questionIds = tracks.flatMap(trackQuestionIds);
  const exerciseIds = tracks.flatMap((track) => track.exercises.map((exercise) => exercise.id));
  const learned = useLearnedCount(questionIds);
  const solved = useLearnedCount(exerciseIds);
  const bookmarks = useBookmarkCount();

  return (
    <div className="flex items-center gap-5 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <ProgressRing
        value={learned}
        max={questionIds.length}
        label="Overall progress"
        size={56}
        strokeWidth={5}
      />
      <dl className="grid flex-1 grid-cols-3 gap-3">
        <Stat label="Questions learned" value={`${learned}/${questionIds.length}`} />
        <Stat label="Exercises solved" value={`${solved}/${exerciseIds.length}`} />
        <Stat label="Bookmarks" value={String(bookmarks)} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs leading-4 text-muted">{label}</dt>
      <dd className="text-lg font-semibold tracking-tight tabular-nums">{value}</dd>
    </div>
  );
}

function TrackCard({ meta }: { meta: TrackMeta }) {
  return (
    <Link
      to={paths.track(meta.slug)}
      data-accent={meta.accent}
      className="group flex gap-4 rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-accent-border sm:p-5"
    >
      <TrackIcon meta={meta} size="lg" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">{meta.name}</span>
          <ArrowRight
            className="size-4 text-subtle transition group-hover:translate-x-0.5 group-hover:text-accent-text"
            aria-hidden
          />
        </span>
        <span className="mt-1 block text-sm leading-6 text-pretty text-muted">
          {meta.description}
        </span>
        <Suspense fallback={<span className="mt-4 block h-[2.375rem]" aria-hidden />}>
          <TrackStats meta={meta} />
        </Suspense>
      </span>
    </Link>
  );
}

function TrackStats({ meta }: { meta: TrackMeta }) {
  const track = use(loadOutline(meta.slug)!);
  const ids = trackQuestionIds(track);
  const learned = useLearnedCount(ids);

  return (
    <span className="mt-4 block">
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span>{pluralize(track.sections.length, 'section')}</span>
        <span aria-hidden>·</span>
        <span>{pluralize(ids.length, 'question')}</span>
        <span aria-hidden>·</span>
        <span>{pluralize(track.exercises.length, 'exercise')}</span>
        <span className="ml-auto font-medium text-fg tabular-nums">
          {learned}/{ids.length} learned
        </span>
      </span>
      <ProgressBar
        value={learned}
        max={ids.length}
        label={`${meta.name} progress`}
        className="mt-2"
      />
    </span>
  );
}

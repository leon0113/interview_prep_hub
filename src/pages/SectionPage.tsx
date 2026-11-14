import { HydrationBoundary } from '@/components/common/HydrationBoundary';
import { ChevronsDownUp, ChevronsUpDown, FilterX, GraduationCap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { NotFound } from '@/components/common/NotFound';
import { PageHeader } from '@/components/common/PageHeader';
import { Pager, type PagerTarget } from '@/components/common/Pager';
import { ProgressRing } from '@/components/common/ProgressRing';
import { QuestionCard } from '@/components/question/QuestionCard';
import { Button } from '@/components/ui/button';
import { Chip, ChipDivider } from '@/components/ui/chip';
import { LEVELS } from '@/content/constants';
import type { TrackOutline } from '@/content/outline';
import type { Level, Section } from '@/content/schema';
import { usePracticeStore } from '@/features/practice/store';
import { useLearnedCount, useTrackVisit } from '@/features/progress/hooks';
import { useQuestionShortcuts } from '@/features/shortcuts/useQuestionShortcuts';
import { useSectionData } from '@/features/tracks/routeData';
import { useTrack } from '@/features/tracks/useTrack';
import { useRegisterToc } from '@/features/ui/store';
import {
  countByLevel,
  LEVEL_LABEL,
  paths,
  relatedLinks,
  sectionNeighbours,
  sectionQuestionIds,
} from '@/lib/content';
import { pluralize, questionTitle } from '@/lib/text';

type LevelFilter = Level | 'all';
type MinPriority = 1 | 2 | 3;

const PRIORITY_OPTIONS: { value: MinPriority; label: string; title: string }[] = [
  { value: 1, label: 'Any ★', title: 'All priorities' },
  { value: 2, label: '★★+', title: 'Asked often or more' },
  { value: 3, label: '★★★', title: 'Asked in almost every interview' },
];

function parseLevel(value: string | null): LevelFilter {
  return (LEVELS as readonly string[]).includes(value ?? '') ? (value as Level) : 'all';
}

function parsePriority(value: string | null): MinPriority {
  return value === '2' ? 2 : value === '3' ? 3 : 1;
}

export default function SectionPage() {
  const track = useTrack();
  // Full questions of this section come from the route loader (one small chunk per section).
  const { section } = useSectionData();

  if (!section) return <NotFound />;
  // Keyed so filters' derived state and bulk-expand reset when switching sections.
  return <SectionView key={section.id} track={track} section={section} />;
}

function SectionView({ track, section }: { track: TrackOutline; section: Section }) {
  const practiceMode = usePracticeStore((state) => state.practiceMode);
  const [searchParams, setSearchParams] = useSearchParams();
  const hash = decodeURIComponent(useLocation().hash.slice(1));
  // `nonce` changes on every Expand/Collapse all so the cards remount with the new default.
  const [bulk, setBulk] = useState({ open: false, nonce: 0 });

  const level = parseLevel(searchParams.get('level'));
  const minPriority = parsePriority(searchParams.get('priority'));
  const filtered = level !== 'all' || minPriority > 1;

  const visible = useMemo(
    () =>
      section.questions
        .map((question, index) => ({ question, number: index + 1 }))
        .filter(
          ({ question }) =>
            (level === 'all' || question.level === level) && question.priority >= minPriority,
        ),
    [section, level, minPriority],
  );

  const tocItems = useMemo(
    () =>
      visible.map(({ question }) => ({
        id: question.id,
        title: questionTitle(question.question),
        hint: LEVEL_LABEL[question.level],
      })),
    [visible],
  );
  useRegisterToc(tocItems);
  useQuestionShortcuts();
  useTrackVisit({
    trackSlug: track.slug,
    path: paths.section(track.slug, section.id),
    title: section.title,
    kind: 'section',
  });

  const ids = sectionQuestionIds(section);
  const learned = useLearnedCount(ids);
  const levelCounts = countByLevel(section.questions);

  function setFilter(key: 'level' | 'priority', value: string | null) {
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

  const { prev, next } = sectionNeighbours(track, section.id);
  const prevTarget: PagerTarget | undefined = prev && {
    to: paths.section(track.slug, prev.id),
    title: prev.title,
    label: 'Previous section',
  };
  const nextTarget: PagerTarget = next
    ? { to: paths.section(track.slug, next.id), title: next.title, label: 'Next section' }
    : { to: paths.exercises(track.slug), title: `${track.name} exercises`, label: 'Up next' };

  return (
    <div>
      <PageHeader
        eyebrow={`${track.name} · Section ${section.order}`}
        title={section.title}
        description={section.description}
      >
        <div className="mt-5 flex items-center gap-3">
          <ProgressRing
            value={learned}
            max={ids.length}
            label={`${section.title} progress`}
            size={40}
          />
          <p className="text-sm text-muted">
            <span className="font-medium text-fg tabular-nums">
              {learned}/{ids.length}
            </span>{' '}
            learned · {pluralize(ids.length, 'question')}
          </p>
        </div>
      </PageHeader>

      {/* Sticky filters: one row that scrolls sideways on narrow screens. */}
      <div className="sticky top-14 z-30 -mx-4 mb-5 border-b border-border bg-bg/90 backdrop-blur-md sm:-mx-6 lg:-mx-10">
        <div
          role="group"
          aria-label="Filter questions"
          className="flex scrollbar-none items-center gap-1.5 overflow-x-auto px-4 py-2 sm:px-6 lg:px-10"
        >
          <Chip
            selected={level === 'all'}
            count={section.questions.length}
            onClick={() => setFilter('level', null)}
          >
            All
          </Chip>
          {LEVELS.filter((value) => levelCounts[value] > 0).map((value) => (
            <Chip
              key={value}
              selected={level === value}
              count={levelCounts[value]}
              onClick={() => setFilter('level', level === value ? null : value)}
            >
              {LEVEL_LABEL[value]}
            </Chip>
          ))}
          <ChipDivider />
          {PRIORITY_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              selected={minPriority === option.value}
              title={option.title}
              aria-label={option.title}
              onClick={() =>
                setFilter('priority', option.value === 1 ? null : String(option.value))
              }
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mb-4 flex min-h-11 flex-wrap items-center justify-between gap-2 lg:min-h-9">
        <p className="text-sm text-muted" aria-live="polite">
          {filtered
            ? `Showing ${visible.length} of ${section.questions.length} questions`
            : pluralize(section.questions.length, 'question')}
        </p>
        {practiceMode ? (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent-text">
            <GraduationCap className="size-4" aria-hidden />
            Practice mode: answers stay hidden until you reveal them
          </p>
        ) : visible.length > 0 ? (
          <Button
            size="sm"
            className="h-11 lg:h-9"
            onClick={() => setBulk((state) => ({ open: !state.open, nonce: state.nonce + 1 }))}
          >
            {bulk.open ? (
              <ChevronsDownUp className="size-4" aria-hidden />
            ) : (
              <ChevronsUpDown className="size-4" aria-hidden />
            )}
            {bulk.open ? 'Collapse all' : 'Expand all'}
          </Button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={FilterX}
          title="No questions match these filters"
          action={
            <Button variant="outline" onClick={() => setSearchParams({}, { replace: true })}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ol className="flex flex-col gap-4">
          {visible.map(({ question, number }) => (
            <li key={question.id}>
              <HydrationBoundary>
                <QuestionCard
                  // Remount to reset the open state when practice mode or expand-all changes.
                  key={`${practiceMode}-${bulk.nonce}`}
                  question={question}
                  trackSlug={track.slug}
                  index={number}
                  defaultOpen={!practiceMode && bulk.open}
                  highlighted={hash === question.id}
                  related={relatedLinks(track, question)}
                />
              </HydrationBoundary>
            </li>
          ))}
        </ol>
      )}

      <Pager prev={prevTarget} next={nextTarget} label="Previous and next section" />
    </div>
  );
}

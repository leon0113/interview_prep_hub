import { Bookmark } from 'lucide-react';
import { Suspense, use } from 'react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { TrackIcon } from '@/components/common/TrackIcon';
import { QuestionCard } from '@/components/question/QuestionCard';
import { loadAllOutlines, loadQuestions } from '@/content/loader';
import type { TrackOutline } from '@/content/outline';
import { usePracticeStore } from '@/features/practice/store';
import { useProgressStore } from '@/features/progress/store';
import { useQuestionShortcuts } from '@/features/shortcuts/useQuestionShortcuts';
import { paths, relatedLinks, sortedSections } from '@/lib/content';
import { pluralize } from '@/lib/text';

export default function BookmarksPage() {
  useQuestionShortcuts();

  return (
    <div>
      <PageHeader
        title="Bookmarks"
        description="Questions you starred for another look, across every track."
      />
      <Suspense fallback={<p className="text-sm text-muted">Loading bookmarks…</p>}>
        <BookmarkList />
      </Suspense>
    </div>
  );
}

function BookmarkList() {
  const outlines = use(loadAllOutlines());
  const bookmarks = useProgressStore((state) => state.bookmarks);

  // Outlines tell us which questions are bookmarked; full cards load only those sections.
  const groups = outlines
    .map((track) => ({
      track,
      ids: sortedSections(track)
        .flatMap((section) => section.questions)
        .filter((question) => bookmarks[question.id])
        .sort((a, b) => (bookmarks[b.id] ?? 0) - (bookmarks[a.id] ?? 0))
        .map((question) => question.id),
    }))
    .filter((group) => group.ids.length > 0);

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="No bookmarks yet"
        description="Tap the bookmark icon on any question to collect it here for revision."
        action={
          <Link
            to={paths.home()}
            className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg lg:h-10"
          >
            Browse tracks
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-10">
      {groups.map(({ track, ids }) => (
        <section key={track.slug} data-accent={track.accent} aria-label={track.name}>
          <h2 className="mb-3 flex items-center gap-2.5 font-semibold">
            <TrackIcon meta={track} size="sm" />
            <Link to={paths.track(track.slug)} className="py-2.5 hover:text-accent-text">
              {track.name}
            </Link>
            <span className="text-xs font-normal text-subtle">
              {pluralize(ids.length, 'question')}
            </span>
          </h2>
          <BookmarkedQuestions track={track} ids={ids} />
        </section>
      ))}
    </div>
  );
}

function BookmarkedQuestions({ track, ids }: { track: TrackOutline; ids: string[] }) {
  // Cached per id list by the loader, so `use` sees a stable promise.
  const questions = use(loadQuestions(track.slug, ids));
  const practiceMode = usePracticeStore((state) => state.practiceMode);

  return (
    <ul className="flex flex-col gap-4">
      {questions.map((question) => (
        <li key={question.id}>
          <QuestionCard
            key={String(practiceMode)}
            question={question}
            trackSlug={track.slug}
            headingLevel={3}
            related={relatedLinks(track, question)}
          />
        </li>
      ))}
    </ul>
  );
}

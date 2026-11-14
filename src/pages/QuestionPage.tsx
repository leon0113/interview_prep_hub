import { HydrationBoundary } from '@/components/common/HydrationBoundary';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { NotFound } from '@/components/common/NotFound';
import { Pager } from '@/components/common/Pager';
import { QuestionCard } from '@/components/question/QuestionCard';
import { usePracticeStore } from '@/features/practice/store';
import { useTrackVisit } from '@/features/progress/hooks';
import { useQuestionShortcuts } from '@/features/shortcuts/useQuestionShortcuts';
import { useQuestionData } from '@/features/tracks/routeData';
import { useRouteParams, useTrack } from '@/features/tracks/useTrack';
import { findQuestion, paths, relatedLinks } from '@/lib/content';
import { questionTitle } from '@/lib/text';

export default function QuestionPage() {
  const track = useTrack();
  const { questionId } = useRouteParams();
  const practiceMode = usePracticeStore((state) => state.practiceMode);
  // The outline gives the position (section, prev/next); the loader gives the full question.
  const hit = findQuestion(track, questionId);
  const { question: fullQuestion } = useQuestionData();

  useQuestionShortcuts({
    routeMode: true,
    prevTo: hit?.prev && paths.question(track.slug, hit.prev.id),
    nextTo: hit?.next && paths.question(track.slug, hit.next.id),
  });

  useTrackVisit(
    hit && {
      trackSlug: track.slug,
      path: paths.question(track.slug, hit.question.id),
      title: questionTitle(hit.question.question),
      kind: 'question',
    },
  );

  if (!hit || !fullQuestion) return <NotFound />;
  const { section, prev, next } = hit;
  const question = fullQuestion;

  return (
    <div>
      <Link
        to={paths.section(track.slug, section.id, question.id)}
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All questions in {section.title}
      </Link>

      <HydrationBoundary>
        <QuestionCard
          // Remount when the question or practice mode changes so the open state resets.
          key={`${question.id}-${practiceMode}`}
          question={question}
          trackSlug={track.slug}
          defaultOpen={!practiceMode}
          showPermalink={false}
          headingLevel={1}
          related={relatedLinks(track, question, 'page')}
        />
      </HydrationBoundary>

      <Pager
        label="Previous and next question"
        prev={
          prev && { to: paths.question(track.slug, prev.id), title: questionTitle(prev.question) }
        }
        next={
          next && { to: paths.question(track.slug, next.id), title: questionTitle(next.question) }
        }
      />
    </div>
  );
}

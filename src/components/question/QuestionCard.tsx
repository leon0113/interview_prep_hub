import { ChevronDown, Link2 } from 'lucide-react';
import { Suspense, useEffect, useId, useState } from 'react';
import { Link } from 'react-router';
import { InlineText } from '@/components/common/InlineText';
import type { Question, QuickConcept } from '@/content/schema';
import { useIsLearned } from '@/features/progress/hooks';
import { cn } from '@/lib/cn';
import { paths, type RelatedLink } from '@/lib/content';
import { splitQuestion } from '@/lib/text';
import { BookmarkButton } from './BookmarkButton';
import { LearnedCheckbox } from './LearnedCheckbox';
import { LazyAnswerPanel, LazyMarkdown, prefetchAnswerPanelWhenIdle } from './lazyContent';
import { LevelBadge } from './LevelBadge';
import { PriorityStars } from './PriorityStars';

interface QuestionCardProps {
  question: Question | QuickConcept;
  trackSlug: string;
  /** Position in the section, shown before the question. */
  index?: number;
  /**
   * Initial answer visibility. To reset it (practice mode, expand all), change the
   * card's `key` so it remounts — the card owns its open state.
   */
  defaultOpen?: boolean;
  /** Link to the single-question page. */
  showPermalink?: boolean;
  /** Draws attention to the card, e.g. when it is the URL's #anchor. */
  highlighted?: boolean;
  related?: RelatedLink[];
  /** 1 on the single-question page, 2 directly under a page h1, 3 under a group heading. */
  headingLevel?: 1 | 2 | 3;
}

export function QuestionCard({
  question,
  trackSlug,
  index,
  defaultOpen = false,
  showPermalink = true,
  highlighted = false,
  related,
  headingLevel = 2,
}: QuestionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const Heading = (['h1', 'h2', 'h3'] as const)[headingLevel - 1]!;
  useEffect(prefetchAnswerPanelWhenIdle, []);
  const panelId = useId();
  const learned = useIsLearned(question.id);
  const { title, body } = splitQuestion(question.question);

  return (
    <article
      id={question.id}
      data-question
      tabIndex={-1}
      aria-label={`Question${index !== undefined ? ` ${index}` : ''}`}
      className={cn(
        'scroll-mt-16 rounded-xl border bg-surface shadow-card transition-colors',
        learned ? 'border-accent-border' : 'border-border',
        highlighted && 'ring-2 ring-accent/60',
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <LevelBadge level={question.level} />
          <PriorityStars priority={question.priority} />
          <div className="flex-1" />
          {showPermalink ? (
            <Link
              to={paths.question(trackSlug, question.id)}
              aria-label="Open this question on its own page"
              title="Open on its own page"
              className="-my-1.5 inline-flex size-11 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-fg lg:size-9"
            >
              <Link2 className="size-4" aria-hidden />
            </Link>
          ) : null}
          <BookmarkButton id={question.id} className="-my-1.5 -mr-2" />
        </div>

        <Heading className="mt-3 text-base leading-7 font-semibold text-pretty sm:text-[1.0625rem]">
          {index !== undefined ? (
            <span className="mr-2 font-mono text-sm font-normal text-subtle tabular-nums">
              {String(index).padStart(2, '0')}
            </span>
          ) : null}
          <InlineText>{title}</InlineText>
        </Heading>
        {/* e.g. the code of an output-prediction puzzle */}
        {body ? (
          <Suspense fallback={<BodyFallback body={body} />}>
            <LazyMarkdown className="mt-3 text-[0.9375rem]">{body}</LazyMarkdown>
          </Suspense>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-answer-toggle
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-accent-soft pr-2.5 pl-3.5 text-sm font-medium text-accent-text transition hover:brightness-[0.97] lg:h-9 dark:hover:brightness-125"
          >
            {open ? 'Hide answer' : 'Show answer'}
            <ChevronDown
              className={cn('size-4 transition-transform duration-200', open && 'rotate-180')}
              aria-hidden
            />
          </button>
          <LearnedCheckbox id={question.id} />
        </div>
      </div>

      {open ? (
        <div id={panelId} className="border-t border-border">
          <Suspense
            fallback={<p className="px-4 py-6 text-sm text-muted sm:px-5">Loading answer…</p>}
          >
            <LazyAnswerPanel question={question} />
          </Suspense>
          {related?.length ? (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border px-4 py-3 text-sm sm:px-5">
              <span className="text-xs font-semibold tracking-wider text-subtle uppercase">
                Related
              </span>
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="py-3 text-accent-text underline-offset-4 hover:underline lg:py-1.5"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/** Plain text stand-in (same footprint) while the markdown chunk loads. */
function BodyFallback({ body }: { body: string }) {
  const text = body.replace(/^```\w*\n|\n```$/g, '');
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border">
      <div className="h-11 border-b border-border bg-surface-2 lg:h-9" />
      <pre className="overflow-x-auto bg-surface p-3.5 font-mono text-[0.8125rem] leading-[1.7]">
        {text}
      </pre>
    </div>
  );
}

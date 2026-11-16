import { BookOpenText, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { Link, useLoaderData } from 'react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { InlineText } from '@/components/common/InlineText';
import { Markdown } from '@/components/common/Markdown';
import { PageHeader } from '@/components/common/PageHeader';
import { ProblemRow } from '@/components/leetcode/ProblemRow';
import { lcOutline } from '@/content/leetcode/loader';
import { leetcodeUrl, practiceGroups } from '@/content/leetcode/practice';
import {
  markOutputFences,
  splitNotes,
  type LcTopicContent,
  type LcTopicMeta,
} from '@/content/leetcode/topics';
import { useLcReviewStore, useNow } from '@/features/leetcode/store';
import { useRegisterToc } from '@/features/ui/store';
import { paths } from '@/lib/content';
import { vizRegistry } from '@/visualizations/registry';

export interface LcTopicData {
  meta: LcTopicMeta | null;
  topic: LcTopicContent | null;
}

/** A data-structure topic: problems first (for revision), then the theory from my notes. */
export default function LcTopicPage() {
  const { meta, topic } = useLoaderData() as LcTopicData;
  if (!meta || !topic) {
    return (
      <EmptyState
        icon={BookOpenText}
        title="Topic not found"
        action={
          <Link to={paths.lcTopics()} className="text-sm font-medium text-accent-text underline">
            All topics
          </Link>
        }
      />
    );
  }
  return <TopicView meta={meta} topic={topic} />;
}

function TopicView({ meta, topic }: { meta: LcTopicMeta; topic: LcTopicContent }) {
  const { intro, sections } = useMemo(() => splitNotes(topic.notes), [topic.notes]);
  const problems = lcOutline.problems.filter((p) => p.topicId === meta.id);
  const practice = practiceGroups.find((g) => g.title === meta.practiceGroupTitle);
  const now = useNow();
  const reviews = useLcReviewStore((s) => s.reviews);

  const toc = useMemo(
    () => [
      { id: 'problems', title: 'Solved problems', hint: String(problems.length) },
      ...(practice ? [{ id: 'practice', title: 'Practice next' }] : []),
      ...sections.map((s) => ({ id: s.id, title: s.title.replace(/[`*]/g, '') })),
    ],
    [problems.length, practice, sections],
  );
  useRegisterToc(toc);

  const solvedNumbers = new Set(lcOutline.problems.map((p) => p.number));

  return (
    <>
      <PageHeader eyebrow="LeetCode · Topic" title={meta.title} description={meta.description} />

      <section id="problems" aria-labelledby="problems-title" className="scroll-mt-24">
        <h2 id="problems-title" className="mb-3 text-lg font-semibold">
          Solved problems
        </h2>
        {problems.length ? (
          <ul className="flex flex-col gap-2">
            {problems.map((p) => (
              <li key={p.id}>
                <ProblemRow problem={p} review={now !== null ? reviews[p.id] : undefined} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No problems solved in this topic yet.</p>
        )}
      </section>

      {practice ? (
        <section id="practice" aria-labelledby="practice-title" className="mt-8 scroll-mt-24">
          <h2 id="practice-title" className="mb-3 text-lg font-semibold">
            Practice next
          </h2>
          <ul className="grid gap-1 sm:grid-cols-2">
            {practice.problems.map((item) => {
              const solved = solvedNumbers.has(item.number);
              const inApp = lcOutline.problems.find((p) => p.number === item.number);
              const body = (
                <>
                  {solved ? (
                    <CheckCircle2
                      className="size-4 shrink-0 text-level-foundation"
                      aria-label="Solved"
                    />
                  ) : (
                    <Circle className="size-4 shrink-0 text-subtle" aria-label="Not solved yet" />
                  )}
                  <span className="font-mono text-muted tabular-nums">#{item.number}</span>
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  {item.note ? (
                    <span className="shrink-0 text-xs text-subtle">{item.note}</span>
                  ) : null}
                </>
              );
              const rowClass =
                'flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-surface-2';
              return (
                <li key={item.number}>
                  {inApp ? (
                    <Link to={paths.lcProblem(inApp.category, inApp.slug)} className={rowClass}>
                      {body}
                    </Link>
                  ) : (
                    <a
                      href={leetcodeUrl(item.title)}
                      target="_blank"
                      rel="noreferrer"
                      className={rowClass}
                    >
                      {body}
                      <ExternalLink className="size-3 shrink-0 text-subtle" aria-hidden />
                      <span className="sr-only">(LeetCode, opens in a new tab)</span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="mt-12 border-t border-border pt-8">
        <p className="mb-6 text-xs font-semibold tracking-wider text-accent-text uppercase">
          Theory (my notes)
        </p>
        {intro ? (
          <Markdown lang="bn" className="mb-8 text-[0.9375rem]">
            {markOutputFences(intro)}
          </Markdown>
        ) : null}
        <div className="flex flex-col gap-12">
          {sections.map((section) => {
            const vizIds = section.number
              ? (topic.sectionVisualizations[section.number] ?? [])
              : [];
            return (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-24"
              >
                <h2
                  id={`${section.id}-title`}
                  className="mb-4 text-xl font-semibold tracking-tight text-balance"
                >
                  <InlineText>{section.title}</InlineText>
                </h2>
                <Markdown lang="bn" className="text-[0.9375rem]">
                  {markOutputFences(section.body)}
                </Markdown>
                {vizIds.map((id) => {
                  const Viz = vizRegistry[id];
                  return Viz ? (
                    <div key={id} className="mt-6">
                      <Suspense
                        fallback={
                          <div
                            aria-hidden
                            className="h-72 animate-pulse rounded-xl border border-border bg-surface"
                          />
                        }
                      >
                        <Viz />
                      </Suspense>
                    </div>
                  ) : null;
                })}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}

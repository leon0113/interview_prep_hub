import { HydrationBoundary } from '@/components/common/HydrationBoundary';
import { useMemo, type ReactNode } from 'react';
import { InlineMarkdown, Markdown } from '@/components/common/Markdown';
import { PageHeader } from '@/components/common/PageHeader';
import { CodeBlock } from '@/components/question/CodeBlock';
import { LevelBadge } from '@/components/question/LevelBadge';
import { NotFound } from '@/components/common/NotFound';
import { useCoverageData } from '@/features/tracks/routeData';
import { useTrack } from '@/features/tracks/useTrack';
import { useRegisterToc } from '@/features/ui/store';

const SECTIONS = [
  { id: 'quick-concepts', title: 'Quick concepts' },
  { id: 'not-covered', title: 'Not covered' },
  { id: 'study-tips', title: 'Study tips' },
] as const;

export default function CoveragePage() {
  const track = useTrack();
  const { coverage } = useCoverageData();
  const tocItems = useMemo(() => [...SECTIONS], []);
  useRegisterToc(tocItems);

  if (!coverage) return <NotFound />;
  const { quickConcepts, notCovered, studyTips } = coverage;

  return (
    <div>
      <PageHeader
        eyebrow={track.name}
        title="Coverage"
        description="What this track covers in one line each, what it deliberately leaves out, and how to study it."
      />

      <div className="space-y-12">
        <Block id="quick-concepts" title="Quick concepts">
          <ul className="flex flex-col gap-3">
            {quickConcepts.map((concept) => (
              <li
                key={concept.id}
                id={concept.id}
                className="rounded-xl border border-border bg-surface p-4 shadow-card"
              >
                <HydrationBoundary>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      <InlineMarkdown>{concept.question}</InlineMarkdown>
                    </h3>
                    <LevelBadge level={concept.level} />
                  </div>
                  <Markdown className="mt-2 text-sm text-muted">
                    {concept.answer.interview}
                  </Markdown>
                  <Markdown lang="bn" className="mt-2 text-sm text-muted">
                    {concept.answer.explanationBn}
                  </Markdown>
                  {concept.answer.examples?.map((example, i) => (
                    <div key={i} className="mt-3">
                      <CodeBlock {...example} />
                    </div>
                  ))}
                </HydrationBoundary>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="not-covered" title="Not covered">
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
            {notCovered.map((item) => (
              <li key={item.topic} className="p-4">
                <p className="text-sm font-medium">
                  <InlineMarkdown>{item.topic}</InlineMarkdown>
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">{item.reason}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="study-tips" title="Study tips">
          <ol className="flex flex-col gap-3">
            {studyTips.map((tip, index) => (
              <li key={tip} className="flex gap-3 text-[0.9375rem] leading-7">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text">
                  {index + 1}
                </span>
                <InlineMarkdown>{tip}</InlineMarkdown>
              </li>
            ))}
          </ol>
        </Block>
      </div>
    </div>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="mb-4 text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

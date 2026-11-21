import { ArrowLeft, ArrowRight, Brain, ExternalLink, Lightbulb } from 'lucide-react';
import { Suspense } from 'react';
import { Link, useLoaderData } from 'react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { InlineText } from '@/components/common/InlineText';
import {
  DifficultyBadge,
  GeneratedBadge,
  LangBadges,
  PatternChip,
} from '@/components/leetcode/badges';
import { ConfidenceButtons, FlipCard } from '@/components/leetcode/ReviseParts';
import { Callout, StageBlock, StageCard } from '@/components/leetcode/StageCard';
import { TraceView } from '@/components/leetcode/TraceView';
import { CodeBlock } from '@/components/question/CodeBlock';
import { ResultTable } from '@/components/question/ResultTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LC_CATEGORY_SHORT, lcOutline } from '@/content/leetcode/loader';
import { getTopicMeta } from '@/content/leetcode/topics';
import { knownTitles, leetcodeUrl } from '@/content/leetcode/practice';
import { GENERATED_KEYS, isGenerated, type LcProblem } from '@/content/leetcode/schema';
import type { CodeLang } from '@/content/schema';
import type { LcProblemData } from '@/app/router';
import { STAGE_TITLES, STAGES, useLcSessionStore } from '@/features/leetcode/store';
import { cn } from '@/lib/cn';
import { paths } from '@/lib/content';
import { LC_ARRAY_POINTERS, vizRegistry } from '@/visualizations/registry';

export default function LcProblemPage() {
  const { problem } = useLoaderData() as LcProblemData;
  if (!problem) {
    return (
      <EmptyState
        icon={Brain}
        title="Problem not found"
        description="It may have been renamed. Browse the list instead."
        action={
          <Link to={paths.leetcode()} className="text-sm font-medium text-accent-text underline">
            Back to LeetCode
          </Link>
        }
      />
    );
  }
  return <ProblemView key={problem.id} problem={problem} />;
}

function ProblemView({ problem }: { problem: LcProblem }) {
  const revealedIndex = useLcSessionStore((s) => s.revealed[problem.id] ?? 0);
  const showEverything = useLcSessionStore((s) => s.showEverything);
  const reveal = useLcSessionStore((s) => s.reveal);
  const hideAll = useLcSessionStore((s) => s.hideAll);
  const setShowEverything = useLcSessionStore((s) => s.setShowEverything);
  const openUpTo = showEverything ? STAGES.length - 1 : revealedIndex;

  function revealStage(index: number) {
    reveal(problem.id, index);
    // Move focus to the stage that just opened, for keyboard and screen-reader users.
    requestAnimationFrame(() => {
      const heading = document.getElementById(`stage-${index + 1}-title`);
      heading?.closest('section')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }

  const stages = [
    <ProblemStage key="problem" problem={problem} />,
    <ApproachStage key="approach" problem={problem} />,
    <BreakdownStage key="breakdown" problem={problem} />,
    <SolutionStage key="solution" problem={problem} />,
    <ReviseStage key="revise" problem={problem} />,
  ];
  const hints = [
    '',
    'Recall first: which pattern is it, and what is the brute force?',
    'Can you name the pointers or variables and the invariant before opening this?',
    'Try writing the code yourself, then compare.',
    'Answer the self-check questions and rate how well you remembered.',
  ];

  return (
    <article>
      <Header problem={problem} />

      <div className="sticky top-14 z-10 -mx-4 mb-5 flex flex-wrap items-center gap-2 border-b border-border bg-bg/90 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:top-16 lg:-mx-10 lg:px-10">
        <nav
          aria-label="Stages"
          className="flex min-w-0 flex-1 scrollbar-none gap-1 overflow-x-auto"
        >
          {STAGE_TITLES.map((title, i) => {
            const open = i <= openUpTo;
            return (
              <a
                key={title}
                href={open ? `#stage-${i + 1}` : undefined}
                aria-disabled={!open}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium',
                  open ? 'bg-accent-soft text-accent-text hover:underline' : 'text-subtle',
                )}
              >
                <span className="tabular-nums">{i + 1}</span>
                {title}
              </a>
            );
          })}
        </nav>
        <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 text-xs font-medium text-muted">
          <input
            type="checkbox"
            checked={showEverything}
            onChange={(e) => setShowEverything(e.target.checked)}
            className="size-4 accent-accent"
          />
          Show everything
        </label>
        {revealedIndex > 0 && !showEverything ? (
          <button
            type="button"
            onClick={() => hideAll(problem.id)}
            className="min-h-9 rounded-md px-2 text-xs text-muted hover:text-fg"
          >
            Hide again
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {stages.map((content, i) => (
          <StageCard
            key={i}
            index={i}
            open={i <= openUpTo}
            isNext={i === openUpTo + 1}
            onReveal={() => revealStage(i)}
            hint={hints[i]}
          >
            {content}
          </StageCard>
        ))}
      </div>

      <PatternPager problem={problem} />
    </article>
  );
}

function Header({ problem }: { problem: LcProblem }) {
  const topic = getTopicMeta(problem.topicId);
  return (
    <header className="mb-6">
      <p className="mb-1.5 text-xs font-semibold tracking-wider text-accent-text uppercase">
        LeetCode {LC_CATEGORY_SHORT[problem.category]}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        <span className="text-muted tabular-nums">#{problem.number}</span> {problem.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={problem.difficulty} />
        <PatternChip patternId={problem.patternId} label={problem.patternLabel} />
        <LangBadges langs={problem.solvedIn} />
        {topic ? (
          <Link
            to={paths.lcTopic(topic.id)}
            className="inline-flex min-h-6 items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[0.6875rem] font-medium text-muted hover:text-fg"
          >
            Topic: {topic.title}
          </Link>
        ) : null}
        <a
          href={problem.url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-medium shadow-card hover:border-border-strong"
        >
          Open on LeetCode
          <ExternalLink className="size-3.5" aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
      {isGenerated(problem, GENERATED_KEYS.note) ? (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <GeneratedBadge />
          The explanation was written by the assistant from your accepted code; your code is
          verbatim.
        </p>
      ) : null}
    </header>
  );
}

function Bn({ children, className }: { children: string; className?: string }) {
  return (
    <p lang="bn" className={cn('text-[0.9375rem] leading-7 text-pretty', className)}>
      <InlineText>{children}</InlineText>
    </p>
  );
}

function BulletList({ items, numbered }: { items: readonly string[]; numbered?: boolean }) {
  const List = numbered ? 'ol' : 'ul';
  return (
    <List
      lang="bn"
      className={cn(
        'flex flex-col gap-1.5 pl-5 text-[0.9375rem] leading-7',
        numbered ? 'list-decimal' : 'list-disc',
      )}
    >
      {items.map((item, i) => (
        <li key={i}>
          <InlineText>{item}</InlineText>
        </li>
      ))}
    </List>
  );
}

/* ───────────────────────────── 1. Problem ───────────────────────────── */

function ProblemStage({ problem }: { problem: LcProblem }) {
  const { statementBn, realLifeExample, samples, schema, sampleTables, expectedResult } =
    problem.problem;
  return (
    <>
      <StageBlock title="সমস্যাটা সহজ ভাষায়">
        <Bn>{statementBn}</Bn>
      </StageBlock>
      <StageBlock title="বাস্তব উদাহরণ">
        <Bn className="rounded-xl bg-surface-2 px-4 py-3">{realLifeExample}</Bn>
      </StageBlock>

      {schema?.length ? (
        <StageBlock title="Schema">
          <div className="flex flex-col gap-3">
            {schema.map((table) => (
              <ResultTable
                key={table.table}
                note={`Table: ${table.table}`}
                columns={['Column', 'Type', 'Note']}
                rows={table.columns.map((c) => [c.name, c.type, c.note ?? ''])}
              />
            ))}
          </div>
        </StageBlock>
      ) : null}
      {sampleTables?.length ? (
        <StageBlock title="Sample data">
          <div className="flex flex-col gap-3">
            {sampleTables.map((table) => (
              <ResultTable
                key={table.table}
                note={`Table: ${table.table}`}
                columns={table.columns}
                rows={table.rows}
              />
            ))}
          </div>
        </StageBlock>
      ) : null}
      {expectedResult ? (
        <StageBlock title="Expected result">
          <ResultTable columns={expectedResult.columns} rows={expectedResult.rows} />
        </StageBlock>
      ) : null}

      <StageBlock title="Sample">
        <div className="flex flex-col gap-2">
          {samples.map((sample, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-bg p-3 font-mono text-[0.8125rem] leading-6"
            >
              <p className="[overflow-wrap:anywhere] whitespace-pre-wrap">
                <span className="text-subtle">Input : </span>
                {sample.input}
              </p>
              <p className="[overflow-wrap:anywhere] whitespace-pre-wrap">
                <span className="text-subtle">Output: </span>
                {sample.output}
              </p>
              {sample.note ? (
                <p lang="bn" className="mt-1 font-sans text-xs text-muted">
                  ({sample.note})
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </StageBlock>

      <div className="flex gap-3 rounded-xl border border-dashed border-accent-border px-4 py-3 text-sm">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden />
        <p>
          <span className="font-semibold">Think first:</span> which pattern is it? What is the brute
          force, and why is it not enough?
        </p>
      </div>
    </>
  );
}

/* ───────────────────────────── 2. Approach ───────────────────────────── */

function ApproachStage({ problem }: { problem: LcProblem }) {
  const { approach } = problem;
  return (
    <>
      <Callout label="এক লাইনে মনে রাখো">
        <InlineText>{problem.problem.oneLineReminder}</InlineText>
      </Callout>
      <StageBlock title="কখন এই pattern মাথায় আসবে (Trigger clues)">
        <BulletList items={approach.triggers} />
      </StageBlock>
      <StageBlock title="Brute force">
        <Bn>{approach.bruteForce}</Bn>
      </StageBlock>
      <StageBlock
        title="Idea"
        badge={isGenerated(problem, GENERATED_KEYS.idea) ? <GeneratedBadge /> : null}
      >
        <Bn>{approach.idea}</Bn>
      </StageBlock>
      <StageBlock title="Steps">
        <BulletList items={approach.steps} numbered />
      </StageBlock>
      {approach.template ? (
        <StageBlock
          title="Template (pattern skeleton, not the solution)"
          badge={isGenerated(problem, GENERATED_KEYS.template) ? <GeneratedBadge /> : null}
        >
          <CodeBlock code={approach.template.code} lang={approach.template.lang as CodeLang} />
          <p lang="bn" className="mt-2 text-sm leading-6 text-muted">
            <InlineText>{approach.template.whatChanges}</InlineText>
          </p>
        </StageBlock>
      ) : null}
    </>
  );
}

/* ───────────────────────────── 3. Breakdown ───────────────────────────── */

const vizFallback = (
  <div aria-hidden className="h-72 animate-pulse rounded-xl border border-border bg-surface" />
);

function BreakdownStage({ problem }: { problem: LcProblem }) {
  const { breakdown, visualizationId } = problem;
  const Viz =
    visualizationId && visualizationId !== LC_ARRAY_POINTERS
      ? vizRegistry[visualizationId]
      : undefined;
  return (
    <>
      {breakdown.variables?.length ? (
        <StageBlock title="Pointers / Variables">
          <SimpleTable
            columns={['Name', 'কাজ', 'কখন বদলায়']}
            rows={breakdown.variables.map((v) => [`\`${v.name}\``, v.role, v.whenChanges ?? '—'])}
          />
        </StageBlock>
      ) : null}
      {breakdown.baseCases?.length ? (
        <StageBlock title="Base cases">
          <SimpleTable
            columns={['Condition', 'উত্তর', 'কেন']}
            rows={breakdown.baseCases.map((b) => [b.condition, b.result, b.why ?? '—'])}
          />
        </StageBlock>
      ) : null}
      {breakdown.recursiveStep ? (
        <StageBlock title="Recursive step">
          <Bn>{breakdown.recursiveStep}</Bn>
        </StageBlock>
      ) : null}
      {breakdown.invariant ? (
        <Callout label="Invariant" tone="amber">
          <InlineText>{breakdown.invariant}</InlineText>
        </Callout>
      ) : null}

      <StageBlock title="Trace">
        <div className="flex flex-col gap-4">
          {breakdown.trace.map((block, i) => (
            <div key={i}>
              {block.kind === 'steps' && isGenerated(problem, GENERATED_KEYS.steps) ? (
                <GeneratedBadge className="mb-2" />
              ) : null}
              <TraceView block={block} />
            </div>
          ))}
        </div>
      </StageBlock>

      {Viz ? (
        <StageBlock title="Visualize">
          <Suspense fallback={vizFallback}>
            <Viz />
          </Suspense>
        </StageBlock>
      ) : null}

      <StageBlock title="Edge cases">
        <BulletList items={breakdown.edgeCases} />
      </StageBlock>
      {breakdown.deepDiveBn ? (
        <StageBlock title={`বাংলায় (${stripTicks(breakdown.deepDiveBn.heading)})`}>
          <Bn>{breakdown.deepDiveBn.body}</Bn>
        </StageBlock>
      ) : null}
    </>
  );
}

function stripTicks(text: string): string {
  return text.replace(/`/g, '');
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div
      className="scrollbar-thin overflow-x-auto rounded-xl border border-border"
      tabIndex={0}
      role="region"
      aria-label={columns.join(', ')}
    >
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2 text-xs text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col" className="px-3 py-2 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody lang="bn">
          {rows.map((row, r) => (
            <tr key={r} className="border-t border-border align-top">
              {row.map((cell, c) => (
                <td key={c} className={cn('px-3 py-2 leading-6', c === 0 && 'whitespace-nowrap')}>
                  <InlineText>{cell}</InlineText>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────────── 4. Solution ───────────────────────────── */

function SolutionStage({ problem }: { problem: LcProblem }) {
  const { solutions } = problem;
  return (
    <>
      <Tabs defaultValue="0">
        <TabsList aria-label="Solutions" className="flex-wrap">
          {solutions.map((solution, i) => (
            <TabsTrigger key={i} value={String(i)}>
              {solution.label}
              {solution.optimal ? (
                <span className="ml-1.5 rounded-full bg-level-foundation/15 px-1.5 text-[0.625rem] font-semibold text-level-foundation">
                  Optimal
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
        {solutions.map((solution, i) => (
          <TabsContent key={i} value={String(i)} className="mt-4 flex flex-col gap-4">
            {isGenerated(problem, GENERATED_KEYS.solution(solution.label)) ? (
              <GeneratedBadge />
            ) : null}
            <CodeBlock code={solution.code} lang={solution.lang} />
            <p className="flex flex-wrap gap-2">
              <ComplexityBadge label="Time" value={solution.complexity.time} />
              <ComplexityBadge label="Space" value={solution.complexity.space} />
            </p>
            {solution.note ? (
              <Callout
                label={solution.isMine ? 'Note on my solution' : 'Note'}
                tone={solution.isMine && solutions.some((s) => s.optimal) ? 'amber' : 'accent'}
              >
                <InlineText>{solution.note}</InlineText>
              </Callout>
            ) : null}
            {solution.lineByLine?.length ? (
              <StageBlock title="লাইন ধরে ব্যাখ্যা">
                <SimpleTable
                  columns={['লাইন', 'মানে']}
                  rows={solution.lineByLine.map((l) => [`\`${l.line}\``, l.meaning])}
                />
              </StageBlock>
            ) : null}
            {solution.trace ? <TraceView block={solution.trace} /> : null}
          </TabsContent>
        ))}
      </Tabs>

      {solutions.length >= 2 ? (
        <StageBlock title="Compare">
          <SimpleTable
            columns={['Version', 'Time', 'Space']}
            rows={solutions.map((s) => [
              `${s.label}${s.optimal ? ' (optimal)' : ''}`,
              s.complexity.time,
              s.complexity.space,
            ])}
          />
        </StageBlock>
      ) : null}

      {problem.commonMistakes.length ? (
        <StageBlock title="সাধারণ ভুল (Common mistakes)">
          <BulletList items={problem.commonMistakes} />
        </StageBlock>
      ) : null}
    </>
  );
}

function ComplexityBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs">
      <span className="text-muted">{label}</span>
      <span className="font-mono font-semibold">
        <InlineText>{value}</InlineText>
      </span>
    </span>
  );
}

/* ───────────────────────────── 5. Revise ───────────────────────────── */

function ReviseStage({ problem }: { problem: LcProblem }) {
  const { revise } = problem;
  return (
    <>
      <StageBlock title="নিজেকে প্রশ্ন">
        <div className="grid gap-2 sm:grid-cols-2">
          {revise.selfQuestions.map((item, i) => (
            <FlipCard key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </StageBlock>
      <blockquote className="rounded-xl border border-border bg-surface-2 px-5 py-4">
        <p className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">
          Pattern to remember
        </p>
        <p className="text-lg leading-8 font-medium text-balance">
          “<InlineText>{revise.patternToRemember}</InlineText>”
        </p>
      </blockquote>
      {revise.related.length ? (
        <StageBlock title="Related">
          <ul className="flex flex-col gap-1.5">
            {revise.related.map((rel) => (
              <RelatedItem key={rel.number} rel={rel} />
            ))}
          </ul>
        </StageBlock>
      ) : null}
      <StageBlock title="How well did you remember it?">
        <ConfidenceButtons problemId={problem.id} />
      </StageBlock>
    </>
  );
}

function RelatedItem({ rel }: { rel: LcProblem['revise']['related'][number] }) {
  const inApp = lcOutline.problems.find((p) => p.number === rel.number);
  const title = inApp?.title ?? rel.title ?? knownTitles.get(rel.number) ?? 'LeetCode problem';
  const label = (
    <>
      <span className="font-mono text-muted tabular-nums">#{rel.number}</span> {title}
    </>
  );
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 text-sm">
      {inApp ? (
        <Link
          to={paths.lcProblem(inApp.category, inApp.slug)}
          className="min-h-8 font-medium text-accent-text hover:underline"
        >
          {label}
        </Link>
      ) : (
        <a
          href={leetcodeUrl(title)}
          target="_blank"
          rel="noreferrer"
          className="min-h-8 font-medium hover:underline"
        >
          {label}
          <ExternalLink className="ml-1 inline size-3 text-subtle" aria-hidden />
          <span className="sr-only">(LeetCode, opens in a new tab)</span>
        </a>
      )}
      {rel.note ? (
        <span lang="bn" className="text-muted">
          (<InlineText>{rel.note}</InlineText>)
        </span>
      ) : null}
    </li>
  );
}

/* ───────────────────────────── Prev / next ───────────────────────────── */

function PatternPager({ problem }: { problem: LcProblem }) {
  const same = lcOutline.problems.filter(
    (p) => p.category === problem.category && p.patternId === problem.patternId,
  );
  const index = same.findIndex((p) => p.id === problem.id);
  const prev = same[index - 1];
  const next = same[index + 1];
  if (!prev && !next) return null;
  return (
    <nav aria-label="Same pattern" className="mt-10 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          to={paths.lcProblem(prev.category, prev.slug)}
          className="flex min-h-16 flex-col justify-center rounded-xl border border-border bg-surface px-4 py-3 shadow-card hover:border-border-strong"
        >
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <ArrowLeft className="size-3.5" aria-hidden /> Previous in pattern
          </span>
          <span className="text-sm font-medium">
            #{prev.number} {prev.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link
          to={paths.lcProblem(next.category, next.slug)}
          className="flex min-h-16 flex-col items-end justify-center rounded-xl border border-border bg-surface px-4 py-3 text-right shadow-card hover:border-border-strong"
        >
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            Next in pattern <ArrowRight className="size-3.5" aria-hidden />
          </span>
          <span className="text-sm font-medium">
            #{next.number} {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

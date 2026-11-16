import { Brain, CheckCircle2, ExternalLink, Shapes, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { InlineText } from '@/components/common/InlineText';
import { PageHeader } from '@/components/common/PageHeader';
import { DifficultyBadge } from '@/components/leetcode/badges';
import { ConfidenceButtons } from '@/components/leetcode/ReviseParts';
import { Callout } from '@/components/leetcode/StageCard';
import { CodeBlock } from '@/components/question/CodeBlock';
import { Button } from '@/components/ui/button';
import { lcOutline, loadLcProblem } from '@/content/leetcode/loader';
import type { LcProblemOutline } from '@/content/leetcode/outline';
import { getPattern, patterns } from '@/content/leetcode/patterns';
import { LC_DIFFICULTIES, type LcProblem } from '@/content/leetcode/schema';
import { isDue, useLcReviewStore, useNow, type Review } from '@/features/leetcode/store';
import { cn } from '@/lib/cn';
import { paths } from '@/lib/content';

type Mode = 'recall' | 'quiz';
type Source = 'due' | 'new' | 'random' | `pattern:${string}` | `difficulty:${string}`;

const RANDOM_COUNT = 5;

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function pickProblems(
  source: Source,
  reviews: Record<string, Review>,
  now: number,
): LcProblemOutline[] {
  const all = lcOutline.problems;
  if (source === 'due') return all.filter((p) => isDue(reviews[p.id], now));
  if (source === 'new') return all.filter((p) => !reviews[p.id]);
  if (source === 'random') return shuffle(all).slice(0, RANDOM_COUNT);
  if (source.startsWith('pattern:')) {
    const id = source.slice('pattern:'.length);
    return all.filter((p) => p.patternId === id);
  }
  const difficulty = source.slice('difficulty:'.length);
  return all.filter((p) => p.difficulty === difficulty);
}

export default function LcRevisePage() {
  const nowOrNull = useNow();
  const hydrated = nowOrNull !== null;
  const now = nowOrNull ?? 0;
  const reviews = useLcReviewStore((s) => s.reviews);
  const [mode, setMode] = useState<Mode>('recall');
  const [source, setSource] = useState<Source>('due');
  const [queue, setQueue] = useState<LcProblemOutline[] | null>(null);

  const counts = useMemo(() => {
    if (!hydrated) return null;
    return {
      due: pickProblems('due', reviews, now).length,
      new: pickProblems('new', reviews, now).length,
    };
  }, [hydrated, reviews, now]);

  if (queue) {
    return <Session mode={mode} queue={queue} onExit={() => setQueue(null)} />;
  }

  const usedPatterns = [...new Set(lcOutline.problems.map((p) => p.patternId))];
  const preview = hydrated ? pickProblems(source, reviews, now) : [];
  const startable = source === 'random' ? lcOutline.problems.length > 0 : preview.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="LeetCode"
        title="Revise"
        description="Recall a problem from its statement alone, then reveal only as much as you need. Ratings schedule the next review: Forgot 1 day, Hard 3, Good 7, Easy 21."
      />

      <div role="group" aria-label="Mode" className="mb-6 grid gap-3 sm:grid-cols-2">
        <ModeCard
          active={mode === 'recall'}
          onClick={() => setMode('recall')}
          icon={Brain}
          title="Recall session"
          text="Problem only → name the pattern in your head → reveal the approach → (solution) → rate."
        />
        <ModeCard
          active={mode === 'quiz'}
          onClick={() => setMode('quiz')}
          icon={Shapes}
          title="Pattern quiz"
          text="Read the statement and samples, pick the pattern from four options, then see the trigger clues."
        />
      </div>

      <fieldset className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <legend className="px-1 text-sm font-semibold">Which problems?</legend>
        <div className="flex flex-wrap gap-2">
          <SourceOption current={source} value="due" onChange={setSource}>
            Due now{counts ? ` (${counts.due})` : ''}
          </SourceOption>
          <SourceOption current={source} value="new" onChange={setSource}>
            Never reviewed{counts ? ` (${counts.new})` : ''}
          </SourceOption>
          <SourceOption current={source} value="random" onChange={setSource}>
            Random {RANDOM_COUNT}
          </SourceOption>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-muted">
            Pattern
            <select
              value={source.startsWith('pattern:') ? source : ''}
              onChange={(e) => e.target.value && setSource(e.target.value as Source)}
              className="h-10 max-w-60 rounded-lg border border-border bg-surface px-2 text-sm text-fg"
            >
              <option value="">Choose…</option>
              {usedPatterns.map((id) => (
                <option key={id} value={`pattern:${id}`}>
                  {getPattern(id)?.name.replace(/`/g, '') ?? id}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            Difficulty
            <select
              value={source.startsWith('difficulty:') ? source : ''}
              onChange={(e) => e.target.value && setSource(e.target.value as Source)}
              className="h-10 rounded-lg border border-border bg-surface px-2 text-sm text-fg"
            >
              <option value="">Choose…</option>
              {LC_DIFFICULTIES.map((d) => (
                <option key={d} value={`difficulty:${d}`}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="solid"
            disabled={!hydrated || !startable}
            onClick={() => setQueue(pickProblems(source, reviews, Date.now()))}
          >
            Start {mode === 'recall' ? 'session' : 'quiz'}
          </Button>
          {hydrated && !startable ? (
            <p className="text-sm text-muted">
              {source === 'due'
                ? 'Nothing is due. Try “Never reviewed” or “Random 5”.'
                : 'No problems match.'}
            </p>
          ) : null}
        </div>
      </fieldset>
    </>
  );
}

function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  text,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Brain;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
        active
          ? 'border-accent bg-accent-soft'
          : 'border-border bg-surface hover:border-border-strong',
      )}
    >
      <Icon
        className={cn('mt-0.5 size-5 shrink-0', active ? 'text-accent-text' : 'text-muted')}
        aria-hidden
      />
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted">{text}</span>
      </span>
    </button>
  );
}

function SourceOption({
  current,
  value,
  onChange,
  children,
}: {
  current: Source;
  value: Source;
  onChange: (value: Source) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={current === value}
      onClick={() => onChange(value)}
      className={cn(
        'inline-flex h-10 items-center rounded-full border px-3.5 text-sm transition-colors',
        current === value
          ? 'border-accent-border bg-accent-soft font-medium text-accent-text'
          : 'border-border bg-surface text-muted hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}

/* ───────────────────────────── Session ───────────────────────────── */

function useProblem(outline: LcProblemOutline | undefined): LcProblem | undefined {
  const [loaded, setLoaded] = useState<LcProblem | undefined>();
  useEffect(() => {
    if (!outline) return;
    let alive = true;
    void loadLcProblem(outline.category, outline.slug).then((p) => {
      if (alive) setLoaded(p);
    });
    return () => {
      alive = false;
    };
  }, [outline]);
  return loaded?.id === outline?.id ? loaded : undefined;
}

function Session({
  mode,
  queue,
  onExit,
}: {
  mode: Mode;
  queue: LcProblemOutline[];
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const current = queue[index];
  const problem = useProblem(current);

  if (!current) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title={mode === 'quiz' ? `Quiz done: ${correct} / ${queue.length}` : 'Session done'}
        description={
          mode === 'quiz'
            ? 'Missed patterns are worth a Recall session next.'
            : `${queue.length} problem${queue.length === 1 ? '' : 's'} reviewed. They come back when they are due.`
        }
        action={
          <Button variant="soft" onClick={onExit}>
            Back to revise
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <p className="text-sm text-muted tabular-nums">
          {mode === 'quiz' ? 'Pattern quiz' : 'Recall'} · {index + 1} / {queue.length}
        </p>
        <div aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${(index / queue.length) * 100}%` }}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          End
        </Button>
      </div>

      {problem ? (
        mode === 'recall' ? (
          <RecallCard key={problem.id} problem={problem} onNext={() => setIndex((i) => i + 1)} />
        ) : (
          <QuizCard
            key={problem.id}
            problem={problem}
            onAnswered={(ok) => ok && setCorrect((c) => c + 1)}
            onNext={() => setIndex((i) => i + 1)}
          />
        )
      ) : (
        <div aria-busy className="h-64 animate-pulse rounded-xl border border-border bg-surface" />
      )}
    </div>
  );
}

function ProblemPrompt({ problem }: { problem: LcProblem }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
        <span className="text-muted tabular-nums">#{problem.number}</span> {problem.title}
        <DifficultyBadge difficulty={problem.difficulty} />
      </h2>
      <p lang="bn" className="text-[0.9375rem] leading-7">
        <InlineText>{problem.problem.statementBn}</InlineText>
      </p>
      <div className="flex flex-col gap-2">
        {problem.problem.samples.slice(0, 2).map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-bg p-3 font-mono text-[0.8125rem] leading-6"
          >
            <p className="whitespace-pre-wrap">
              <span className="text-subtle">Input : </span>
              {s.input}
            </p>
            <p className="whitespace-pre-wrap">
              <span className="text-subtle">Output: </span>
              {s.output}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecallCard({ problem, onNext }: { problem: LcProblem; onNext: () => void }) {
  const [stage, setStage] = useState(0);
  const mine = problem.solutions[0]!;
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6">
      <ProblemPrompt problem={problem} />
      {stage === 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-accent-border p-4">
          <p className="text-sm">
            Say the pattern and the key idea in your head first. Then check.
          </p>
          <Button variant="soft" onClick={() => setStage(1)} className="self-start">
            Reveal approach
          </Button>
        </div>
      ) : (
        <>
          <Callout label={`Pattern: ${problem.patternLabel}`}>
            <InlineText>{problem.problem.oneLineReminder}</InlineText>
          </Callout>
          <ol lang="bn" className="list-decimal pl-5 text-[0.9375rem] leading-7">
            {problem.approach.steps.map((step, i) => (
              <li key={i}>
                <InlineText>{step}</InlineText>
              </li>
            ))}
          </ol>
          {stage === 1 ? (
            <Button variant="ghost" onClick={() => setStage(2)} className="self-start">
              Reveal solution
            </Button>
          ) : (
            <CodeBlock code={mine.code} lang={mine.lang} caption={mine.label} />
          )}
          <div className="border-t border-border pt-4">
            <p className="mb-2.5 text-sm font-semibold">How well did you remember it?</p>
            <ConfidenceButtons problemId={problem.id} onRated={onNext} />
          </div>
          <Link
            to={paths.lcProblem(problem.category, problem.slug)}
            className="inline-flex items-center gap-1 self-start text-xs text-muted hover:text-fg"
          >
            Open the full page <ExternalLink className="size-3" aria-hidden />
          </Link>
        </>
      )}
    </section>
  );
}

function QuizCard({
  problem,
  onAnswered,
  onNext,
}: {
  problem: LcProblem;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
}) {
  // The right pattern plus three others, shuffled once per problem.
  const options = useMemo(() => {
    const others = shuffle(patterns.filter((p) => p.id !== problem.patternId)).slice(0, 3);
    return shuffle([getPattern(problem.patternId)!, ...others]);
  }, [problem.patternId]);
  const [choice, setChoice] = useState<string | null>(null);
  const answered = choice !== null;
  const right = choice === problem.patternId;

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6">
      <ProblemPrompt problem={problem} />
      <fieldset>
        <legend className="mb-2.5 text-sm font-semibold">Which pattern?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => {
            const isRight = option.id === problem.patternId;
            const picked = option.id === choice;
            return (
              <button
                key={option.id}
                type="button"
                disabled={answered}
                aria-pressed={picked}
                onClick={() => {
                  setChoice(option.id);
                  onAnswered(isRight);
                }}
                className={cn(
                  'flex min-h-12 items-center gap-2 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default',
                  !answered && 'border-border bg-surface hover:border-accent',
                  answered &&
                    isRight &&
                    'border-level-foundation bg-level-foundation/10 font-medium',
                  answered && picked && !isRight && 'border-level-advanced bg-level-advanced/10',
                  answered && !picked && !isRight && 'border-border opacity-60',
                )}
              >
                {answered && isRight ? (
                  <CheckCircle2
                    className="size-4 shrink-0 text-level-foundation"
                    aria-label="Correct"
                  />
                ) : null}
                {answered && picked && !isRight ? (
                  <XCircle
                    className="size-4 shrink-0 text-level-advanced"
                    aria-label="Your answer"
                  />
                ) : null}
                <InlineText>{option.name}</InlineText>
              </button>
            );
          })}
        </div>
      </fieldset>
      {answered ? (
        <>
          <p
            aria-live="polite"
            className={cn(
              'text-sm font-semibold',
              right ? 'text-level-foundation' : 'text-level-advanced',
            )}
          >
            {right ? 'Correct.' : `Not quite: it is ${problem.patternLabel}.`}
          </p>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Trigger clues</p>
            <ul lang="bn" className="list-disc pl-5 text-[0.9375rem] leading-7">
              {problem.approach.triggers.map((t, i) => (
                <li key={i}>
                  <InlineText>{t}</InlineText>
                </li>
              ))}
            </ul>
          </div>
          <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm italic">
            “<InlineText>{problem.revise.patternToRemember}</InlineText>”
          </p>
          <Button variant="solid" onClick={onNext} className="self-start">
            Next
          </Button>
        </>
      ) : null}
    </section>
  );
}

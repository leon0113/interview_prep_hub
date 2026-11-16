import {
  ArrowRight,
  Brain,
  Code2,
  Database,
  ListChecks,
  Network,
  Shapes,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { DifficultyBadge, PatternChip } from '@/components/leetcode/badges';
import { LC_CATEGORY_LABEL, lcOutline, lcProblemsIn } from '@/content/leetcode/loader';
import { practiceGroups } from '@/content/leetcode/practice';
import { topicMetas } from '@/content/leetcode/topics';
import { LC_DIFFICULTIES, type LcCategory } from '@/content/leetcode/schema';
import { useDueIds, useLcReviewStore, useNow } from '@/features/leetcode/store';
import { paths } from '@/lib/content';

const CATEGORY_ICON: Record<LcCategory, LucideIcon> = { dsa: Code2, database: Database };
const CATEGORY_TEXT: Record<LcCategory, string> = {
  dsa: 'Algorithms and data structures, solved in JavaScript and Python.',
  database: 'SQL problems with schemas, sample tables and expected results.',
};

export default function LeetCodePage() {
  const recent = [...lcOutline.problems]
    .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded) || a.number - b.number)
    .slice(0, 5);
  const practiceTotal = new Set(practiceGroups.flatMap((g) => g.problems.map((p) => p.number)))
    .size;

  return (
    <>
      <PageHeader
        eyebrow="LeetCode"
        title="Solved problems, ready to revise"
        description="Read the problem, recall the pattern, then reveal the approach, the breakdown and the solution one stage at a time. Rate how well you remembered and the problem comes back when it is due."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {(['dsa', 'database'] as const).map((category) => (
          <CategoryCard key={category} category={category} />
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <QuickLink
          to={paths.lcRevise()}
          icon={Brain}
          title="Revise"
          text="Due problems, or a pattern quiz"
        />
        <QuickLink
          to={paths.lcPatterns()}
          icon={Shapes}
          title="Patterns"
          text="Cheat sheet and templates"
        />
        <QuickLink
          to={paths.lcPractice()}
          icon={ListChecks}
          title="Practice"
          text={`${practiceTotal} next problems by pattern`}
        />
      </div>

      <section aria-labelledby="topics" className="mt-10">
        <h2 id="topics" className="mb-3 text-sm font-semibold">
          Topics
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {topicMetas.map((topic) => (
            <li key={topic.id}>
              <QuickLink
                to={paths.lcTopic(topic.id)}
                icon={Network}
                title={topic.title}
                text={`Theory + ${lcOutline.problems.filter((p) => p.topicId === topic.id).length} problems`}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent" className="mt-10">
        <h2 id="recent" className="mb-3 text-sm font-semibold">
          Recently added
        </h2>
        <ul className="flex flex-col gap-2">
          {recent.map((p) => (
            <li key={p.id}>
              <Link
                to={paths.lcProblem(p.category, p.slug)}
                className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-card hover:border-border-strong"
              >
                <span className="w-10 font-mono text-sm text-muted tabular-nums">#{p.number}</span>
                <span className="min-w-0 flex-1 basis-48 text-sm font-medium">{p.title}</span>
                <DifficultyBadge difficulty={p.difficulty} />
                <PatternChip patternId={p.patternId} link={false} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function CategoryCard({ category }: { category: LcCategory }) {
  const problems = lcProblemsIn(category);
  const ids = problems.map((p) => p.id);
  const due = useDueIds(ids);
  const now = useNow();
  const reviews = useLcReviewStore((s) => s.reviews);
  const newCount = now !== null ? ids.filter((id) => !reviews[id]).length : null;
  const Icon = CATEGORY_ICON[category];

  return (
    <Link
      to={paths.lcList(category)}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-border-strong"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{LC_CATEGORY_LABEL[category]}</h2>
          <p className="mt-0.5 text-sm text-muted">{CATEGORY_TEXT[category]}</p>
        </div>
        <ArrowRight
          className="mt-1 size-4 text-subtle transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
      <p className="text-3xl font-semibold tabular-nums">
        {problems.length}
        <span className="ml-1.5 text-sm font-normal text-muted">problems</span>
      </p>
      {problems.length ? (
        <div className="flex flex-wrap gap-1.5">
          {LC_DIFFICULTIES.map((d) => {
            const count = problems.filter((p) => p.difficulty === d).length;
            return count ? (
              <span key={d} className="inline-flex items-center gap-1">
                <DifficultyBadge difficulty={d} />
                <span className="text-xs text-muted tabular-nums">{count}</span>
              </span>
            ) : null;
          })}
        </div>
      ) : (
        <p className="text-sm text-muted">Empty for now: ready for the first SQL problem.</p>
      )}
      {problems.length ? (
        <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted">
          <span>
            Due for revision:{' '}
            <strong className="text-fg tabular-nums">{due === null ? '–' : due.length}</strong>
          </span>
          <span>
            Never reviewed:{' '}
            <strong className="text-fg tabular-nums">{newCount === null ? '–' : newCount}</strong>
          </span>
        </p>
      ) : null}
    </Link>
  );
}

function QuickLink({
  to,
  icon: Icon,
  title,
  text,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <Link
      to={to}
      className="flex min-h-16 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-card hover:border-border-strong"
    >
      <Icon className="size-5 shrink-0 text-accent-text" aria-hidden />
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted">{text}</span>
      </span>
    </Link>
  );
}

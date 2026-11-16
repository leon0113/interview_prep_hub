import { Link } from 'react-router';
import type { LcProblemOutline } from '@/content/leetcode/outline';
import type { Review } from '@/features/leetcode/store';
import { paths } from '@/lib/content';
import { ConfidenceDot, DifficultyBadge, LangBadges, PatternChip } from './badges';

/** One problem in a list: number, title, difficulty, pattern, languages, confidence. */
export function ProblemRow({
  problem,
  review,
}: {
  problem: LcProblemOutline;
  /** Undefined until saved reviews load, or when never reviewed. */
  review?: Review;
}) {
  return (
    <Link
      to={paths.lcProblem(problem.category, problem.slug)}
      className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-border bg-surface px-4 py-3 shadow-card transition-colors hover:border-border-strong"
    >
      <ConfidenceDot confidence={review?.confidence} />
      <span className="w-10 font-mono text-sm text-muted tabular-nums">#{problem.number}</span>
      <span className="min-w-0 flex-1 basis-40 text-sm font-medium">{problem.title}</span>
      <span className="flex flex-wrap items-center gap-1.5">
        <DifficultyBadge difficulty={problem.difficulty} />
        <PatternChip patternId={problem.patternId} link={false} />
        <LangBadges langs={problem.solvedIn} />
      </span>
    </Link>
  );
}

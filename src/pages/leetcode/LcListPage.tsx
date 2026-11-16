import { Database, LayoutList, Rows3, SearchX } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import {
  ConfidenceDot,
  DifficultyBadge,
  LangBadges,
  PatternChip,
} from '@/components/leetcode/badges';
import { ProblemRow } from '@/components/leetcode/ProblemRow';
import { Chip, ChipDivider } from '@/components/ui/chip';
import { LC_CATEGORY_LABEL, lcProblemsIn } from '@/content/leetcode/loader';
import type { LcProblemOutline } from '@/content/leetcode/outline';
import { getPattern, patternFamilies } from '@/content/leetcode/patterns';
import {
  LC_CATEGORIES,
  LC_DIFFICULTIES,
  type LcCategory,
  type LcDifficulty,
  type LcLang,
} from '@/content/leetcode/schema';
import {
  CONFIDENCE_LABEL,
  CONFIDENCES,
  isDue,
  useLcReviewStore,
  useNow,
  type Confidence,
  type Review,
} from '@/features/leetcode/store';
import { cn } from '@/lib/cn';
import { paths } from '@/lib/content';

type View = 'pattern' | 'table';
type SortKey = 'notes' | 'number' | 'date' | 'reviewed';
type ConfidenceFilter = Confidence | 'new';

interface Filters {
  difficulty?: LcDifficulty;
  pattern?: string;
  lang?: LcLang;
  confidence?: ConfidenceFilter;
  due?: boolean;
}

const NO_REVIEWS: Record<string, Review> = {};

const SORT_LABEL: Record<SortKey, string> = {
  notes: 'Notes order',
  number: 'Number',
  date: 'Date added',
  reviewed: 'Last reviewed',
};

export default function LcListPage() {
  const { category } = useParams();
  if (!LC_CATEGORIES.includes(category as LcCategory)) {
    return (
      <EmptyState
        icon={SearchX}
        title="No such list"
        description="LeetCode problems are grouped as DSA and Database."
        action={
          <Link to={paths.leetcode()} className="text-sm font-medium text-accent-text underline">
            Back to LeetCode
          </Link>
        }
      />
    );
  }
  return <ProblemList key={category} category={category as LcCategory} />;
}

function ProblemList({ category }: { category: LcCategory }) {
  const problems = lcProblemsIn(category);
  const now = useNow();
  const storedReviews = useLcReviewStore((s) => s.reviews);
  // Saved reviews only after hydration, so the prerendered list matches the first render.
  const reviews: Record<string, Review> = now !== null ? storedReviews : NO_REVIEWS;
  const [view, setView] = useState<View>('pattern');
  const [sort, setSort] = useState<SortKey>('notes');
  const [filters, setFilters] = useState<Filters>({});

  function toggle<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  }

  const usedPatterns = [...new Set(problems.map((p) => p.patternId))];
  const usedLangs = [...new Set(problems.flatMap((p) => p.solvedIn))];

  const visible = (() => {
    const filtered = problems.filter((p) => {
      const review = reviews[p.id];
      if (filters.difficulty && p.difficulty !== filters.difficulty) return false;
      if (filters.pattern && p.patternId !== filters.pattern) return false;
      if (filters.lang && !p.solvedIn.includes(filters.lang)) return false;
      if (filters.confidence === 'new' && review) return false;
      if (
        filters.confidence &&
        filters.confidence !== 'new' &&
        review?.confidence !== filters.confidence
      )
        return false;
      if (filters.due && (now === null || !isDue(review, now))) return false;
      return true;
    });
    return sortProblems(filtered, sort, reviews);
  })();

  const hasFilters = Object.values(filters).some(Boolean);
  const title = LC_CATEGORY_LABEL[category];

  if (problems.length === 0) {
    return (
      <>
        <PageHeader eyebrow="LeetCode" title={title} />
        <EmptyState
          icon={Database}
          title="No database problems yet"
          description="Solved SQL problems will appear here with their schema, sample tables, expected result, a clause-by-clause breakdown and MySQL / PostgreSQL solutions."
          action={
            <Link
              to={paths.lcList('dsa')}
              className="text-sm font-medium text-accent-text underline"
            >
              Revise DSA problems meanwhile
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="LeetCode"
        title={title}
        description={`${problems.length} solved problems. Open one to recall the approach before revealing the solution.`}
      />

      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="View"
            className="inline-flex rounded-lg border border-border bg-surface p-0.5"
          >
            <ViewButton
              active={view === 'pattern'}
              onClick={() => setView('pattern')}
              icon={LayoutList}
            >
              By pattern
            </ViewButton>
            <ViewButton active={view === 'table'} onClick={() => setView('table')} icon={Rows3}>
              Table
            </ViewButton>
          </div>
          <label className="ml-auto flex items-center gap-2 text-xs text-muted">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-lg border border-border bg-surface px-2 text-sm text-fg"
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABEL[key]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="flex scrollbar-none flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filters"
        >
          {LC_DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              selected={filters.difficulty === d}
              onClick={() => toggle('difficulty', d)}
            >
              {d}
            </Chip>
          ))}
          <ChipDivider />
          <select
            aria-label="Pattern"
            value={filters.pattern ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, pattern: e.target.value || undefined }))}
            className="h-9 max-w-48 rounded-full border border-border bg-surface px-3 text-xs"
          >
            <option value="">All patterns</option>
            {usedPatterns.map((id) => (
              <option key={id} value={id}>
                {getPattern(id)?.name ?? id}
              </option>
            ))}
          </select>
          {usedLangs.length > 1 ? (
            <select
              aria-label="Language"
              value={filters.lang ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  lang: (e.target.value || undefined) as LcLang | undefined,
                }))
              }
              className="h-9 rounded-full border border-border bg-surface px-3 text-xs"
            >
              <option value="">All languages</option>
              {usedLangs.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          ) : null}
          <ChipDivider />
          {(['new', ...CONFIDENCES] as ConfidenceFilter[]).map((c) => (
            <Chip
              key={c}
              selected={filters.confidence === c}
              onClick={() => toggle('confidence', c)}
            >
              {c === 'new' ? 'Never reviewed' : CONFIDENCE_LABEL[c]}
            </Chip>
          ))}
          <Chip selected={Boolean(filters.due)} onClick={() => toggle('due', true)}>
            Due for revision
          </Chip>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => setFilters({})}
              className="h-9 rounded-full px-2.5 text-xs font-medium text-muted hover:text-fg"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nothing matches these filters"
          description="Clear a filter to see more problems."
        />
      ) : view === 'pattern' ? (
        <ByPattern problems={visible} reviews={reviews} />
      ) : (
        <ProblemTable problems={visible} reviews={reviews} />
      )}
    </>
  );
}

function sortProblems(
  problems: LcProblemOutline[],
  sort: SortKey,
  reviews: Record<string, Review>,
): LcProblemOutline[] {
  if (sort === 'notes') return problems;
  const copy = [...problems];
  if (sort === 'number') copy.sort((a, b) => a.number - b.number);
  if (sort === 'date')
    copy.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded) || a.number - b.number);
  if (sort === 'reviewed')
    copy.sort((a, b) => (reviews[b.id]?.lastReviewed ?? 0) - (reviews[a.id]?.lastReviewed ?? 0));
  return copy;
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Rows3;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors lg:h-8',
        active ? 'bg-accent-soft text-accent-text' : 'text-muted hover:text-fg',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {children}
    </button>
  );
}

function ByPattern({
  problems,
  reviews,
}: {
  problems: LcProblemOutline[];
  reviews: Record<string, Review>;
}) {
  const groups = patternFamilies
    .map((family) => ({
      family,
      items: problems.filter((p) => family.patternIds.includes(p.patternId)),
    }))
    .filter((g) => g.items.length > 0);
  const grouped = new Set(groups.flatMap((g) => g.items.map((p) => p.id)));
  const other = problems.filter((p) => !grouped.has(p.id));

  return (
    <div className="flex flex-col gap-7">
      {groups.map(({ family, items }, i) => (
        <section key={family.id} aria-labelledby={`family-${family.id}`}>
          <h2
            id={`family-${family.id}`}
            className="mb-2.5 flex items-baseline gap-2 text-sm font-semibold"
          >
            <span className="text-subtle tabular-nums">{i + 1}.</span>
            {family.title}
            <span className="font-normal text-subtle tabular-nums">{items.length}</span>
          </h2>
          <ul className="flex flex-col gap-2">
            {items.map((p) => (
              <li key={p.id}>
                <ProblemRow problem={p} review={reviews[p.id]} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {other.length ? (
        <section aria-labelledby="family-other">
          <h2 id="family-other" className="mb-2.5 text-sm font-semibold">
            Other patterns
          </h2>
          <ul className="flex flex-col gap-2">
            {other.map((p) => (
              <li key={p.id}>
                <ProblemRow problem={p} review={reviews[p.id]} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ProblemTable({
  problems,
  reviews,
}: {
  problems: LcProblemOutline[];
  reviews: Record<string, Review>;
}) {
  return (
    <div
      className="scrollbar-thin overflow-x-auto rounded-xl border border-border bg-surface"
      tabIndex={0}
      role="region"
      aria-label="Problems"
    >
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2 text-xs text-muted">
          <tr>
            {[
              '#',
              'Title',
              'Difficulty',
              'Pattern',
              'Languages',
              'Last reviewed',
              'Confidence',
            ].map((h) => (
              <th key={h} scope="col" className="px-3 py-2 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {problems.map((p) => {
            const review = reviews[p.id];
            return (
              <tr key={p.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-muted tabular-nums">{p.number}</td>
                <td className="px-3 py-2 font-medium">
                  <Link
                    to={paths.lcProblem(p.category, p.slug)}
                    className="inline-flex min-h-8 items-center hover:text-accent-text hover:underline"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <DifficultyBadge difficulty={p.difficulty} />
                </td>
                <td className="px-3 py-2">
                  <PatternChip patternId={p.patternId} />
                </td>
                <td className="px-3 py-2">
                  <LangBadges langs={p.solvedIn} />
                </td>
                <td className="px-3 py-2 text-xs whitespace-nowrap text-muted">
                  {review ? new Date(review.lastReviewed).toLocaleDateString() : '—'}
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <ConfidenceDot confidence={review?.confidence} />
                    {review ? CONFIDENCE_LABEL[review.confidence] : 'New'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

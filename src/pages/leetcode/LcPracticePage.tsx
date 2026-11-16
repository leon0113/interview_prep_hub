import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { PatternChip } from '@/components/leetcode/badges';
import { lcOutline } from '@/content/leetcode/loader';
import { leetcodeUrl, practiceGroups, practiceIntro } from '@/content/leetcode/practice';
import { paths } from '@/lib/content';

/** Next problems to solve, by pattern. Solved ones (present in the app) are ticked. */
export default function LcPracticePage() {
  const byNumber = new Map(lcOutline.problems.map((p) => [p.number, p]));
  const all = new Set(practiceGroups.flatMap((g) => g.problems.map((p) => p.number)));
  const solved = [...all].filter((n) => byNumber.has(n)).length;

  return (
    <>
      <PageHeader
        eyebrow="LeetCode"
        title="Practice"
        description={`${practiceIntro} ${solved} of ${all.size} solved.`}
      />
      <div className="flex flex-col gap-8">
        {practiceGroups.map((group) => {
          const done = group.problems.filter((p) => byNumber.has(p.number)).length;
          return (
            <section key={group.title} aria-labelledby={`pg-${group.title}`}>
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <h2 id={`pg-${group.title}`} className="text-sm font-semibold">
                  {group.title}
                </h2>
                <span className="text-xs text-subtle tabular-nums">
                  {done}/{group.problems.length}
                </span>
                <span className="flex flex-wrap gap-1">
                  {group.patternIds.map((id) => (
                    <PatternChip key={id} patternId={id} />
                  ))}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {group.problems.map((item) => {
                  const inApp = byNumber.get(item.number);
                  return (
                    <li key={`${item.number}-${item.note ?? ''}`}>
                      {inApp ? (
                        <Link
                          to={paths.lcProblem(inApp.category, inApp.slug)}
                          className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm hover:bg-surface-2"
                        >
                          <CheckCircle2
                            className="size-4 shrink-0 text-level-foundation"
                            aria-label="Solved"
                          />
                          <span className="font-mono text-muted tabular-nums">#{item.number}</span>
                          <span className="font-medium">{item.title}</span>
                          {item.note ? (
                            <span className="text-xs text-muted">({item.note})</span>
                          ) : null}
                        </Link>
                      ) : (
                        <a
                          href={leetcodeUrl(item.title)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm hover:bg-surface-2"
                        >
                          <Circle
                            className="size-4 shrink-0 text-subtle"
                            aria-label="Not solved yet"
                          />
                          <span className="font-mono text-muted tabular-nums">#{item.number}</span>
                          <span>{item.title}</span>
                          {item.note ? (
                            <span className="text-xs text-muted">({item.note})</span>
                          ) : null}
                          <ExternalLink
                            className="ml-auto size-3.5 shrink-0 text-subtle"
                            aria-hidden
                          />
                          <span className="sr-only">(LeetCode, opens in a new tab)</span>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

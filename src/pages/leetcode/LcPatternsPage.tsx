import { Link } from 'react-router';
import { InlineText } from '@/components/common/InlineText';
import { PageHeader } from '@/components/common/PageHeader';
import { DifficultyBadge } from '@/components/leetcode/badges';
import { CodeBlock } from '@/components/question/CodeBlock';
import { lcOutline } from '@/content/leetcode/loader';
import { getPattern, patternFamilies, type LcPattern } from '@/content/leetcode/patterns';
import { paths } from '@/lib/content';

/** The Pattern Family Cheat Sheet and templates; every pattern lists its problems. */
export default function LcPatternsPage() {
  return (
    <>
      <PageHeader
        eyebrow="LeetCode"
        title="Patterns"
        description="Trigger words tell you which pattern a problem needs; the template is the skeleton you adapt. Each pattern lists the problems in the app that use it."
      />
      <nav aria-label="Patterns" className="mb-8 flex flex-wrap gap-1.5">
        {patternFamilies
          .flatMap((f) => f.patternIds)
          .map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex min-h-9 items-center rounded-full border border-border bg-surface px-3 text-xs font-medium hover:border-border-strong"
            >
              <InlineText>{getPattern(id)?.name ?? id}</InlineText>
            </a>
          ))}
      </nav>
      <div className="flex flex-col gap-10">
        {patternFamilies.map((family) => (
          <section key={family.id} aria-labelledby={`fam-${family.id}`}>
            <h2 id={`fam-${family.id}`} className="mb-4 text-lg font-semibold">
              {family.title}
            </h2>
            <div className="flex flex-col gap-4">
              {family.patternIds.map((id) => {
                const pattern = getPattern(id);
                return pattern ? <PatternCard key={id} pattern={pattern} /> : null;
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function PatternCard({ pattern }: { pattern: LcPattern }) {
  const primary = lcOutline.problems.filter((p) => p.patternId === pattern.id);
  const also = lcOutline.problems.filter((p) => p.alsoPatterns.includes(pattern.id));
  return (
    <article
      id={pattern.id}
      className="scroll-mt-24 rounded-xl border border-border bg-surface p-5 shadow-card"
    >
      <h3 className="text-base font-semibold">
        <InlineText>{pattern.name}</InlineText>
      </h3>
      <p className="mt-1 text-sm text-muted">
        <InlineText>{pattern.skeleton}</InlineText>
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Trigger words">
        {pattern.triggers.map((t) => (
          <span
            key={t}
            className="inline-flex min-h-6 items-center rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-text"
          >
            <InlineText>{t}</InlineText>
          </span>
        ))}
      </div>

      {pattern.templates.map((template) => (
        <div key={template.title} className="mt-4">
          <p className="mb-2 text-sm font-medium">{template.title}</p>
          <CodeBlock code={template.code} lang={template.lang} />
          <p lang="bn" className="mt-2 text-sm leading-6 text-muted">
            <InlineText>{template.whatChanges}</InlineText>
          </p>
          {template.note ? (
            <p className="mt-1 text-sm leading-6 text-muted">
              <InlineText>{template.note}</InlineText>
            </p>
          ) : null}
        </div>
      ))}

      <div className="mt-4 border-t border-border pt-3">
        {primary.length || also.length ? (
          <ul className="flex flex-col gap-1">
            {[...primary, ...also].map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-2 text-sm">
                <Link
                  to={paths.lcProblem(p.category, p.slug)}
                  className="inline-flex min-h-8 items-center gap-1.5 font-medium text-accent-text hover:underline"
                >
                  <span className="font-mono tabular-nums">#{p.number}</span> {p.title}
                </Link>
                <DifficultyBadge difficulty={p.difficulty} />
                {also.includes(p) ? (
                  <span className="text-xs text-muted">(alternative solution)</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            No solved problem uses it yet. See{' '}
            <Link to={paths.lcPractice()} className="text-accent-text underline">
              Practice
            </Link>
            .
          </p>
        )}
      </div>
    </article>
  );
}

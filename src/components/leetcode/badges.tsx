import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { getPattern } from '@/content/leetcode/patterns';
import type { LcDifficulty, LcLang } from '@/content/leetcode/schema';
import { CONFIDENCE_LABEL, type Confidence } from '@/features/leetcode/store';
import { cn } from '@/lib/cn';
import { paths } from '@/lib/content';

const DIFFICULTY_TONE: Record<LcDifficulty, string> = {
  Easy: 'text-level-foundation',
  Medium: 'text-level-intermediate',
  Hard: 'text-level-advanced',
};

/** Easy green / Medium amber / Hard red, in the same style as the level badges. */
export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: LcDifficulty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-surface px-2 text-[0.6875rem] font-medium',
        DIFFICULTY_TONE[difficulty],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {difficulty}
    </span>
  );
}

/** The pattern a problem uses; links to its entry on the patterns page. */
export function PatternChip({
  patternId,
  label,
  className,
  link = true,
}: {
  patternId: string;
  /** Defaults to the pattern's name from patterns.ts. */
  label?: string;
  className?: string;
  link?: boolean;
}) {
  const text = label ?? getPattern(patternId)?.name ?? patternId;
  const classes = cn(
    'inline-flex min-h-6 items-center rounded-full border border-accent-border bg-accent-soft px-2 py-0.5 text-[0.6875rem] font-medium text-accent-text',
    className,
  );
  return link ? (
    <Link to={paths.lcPatterns(patternId)} className={cn(classes, 'hover:underline')}>
      {text}
    </Link>
  ) : (
    <span className={classes}>{text}</span>
  );
}

const LANG_LABEL: Record<LcLang, string> = {
  javascript: 'JS',
  python: 'PY',
  sql: 'SQL',
  mysql: 'MySQL',
  postgresql: 'PG',
};
const LANG_NAME: Record<LcLang, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  sql: 'SQL',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
};

/** Small monospace badges for the languages a problem was solved in. */
export function LangBadges({ langs, className }: { langs: readonly LcLang[]; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      {langs.map((lang) => (
        <abbr
          key={lang}
          title={LANG_NAME[lang]}
          className="inline-flex h-5 items-center rounded-md border border-border bg-surface-2 px-1.5 font-mono text-[0.625rem] font-semibold text-muted no-underline"
        >
          {LANG_LABEL[lang]}
        </abbr>
      ))}
    </span>
  );
}

const CONFIDENCE_TONE: Record<Confidence, string> = {
  forgot: 'bg-level-advanced',
  hard: 'bg-level-intermediate',
  good: 'bg-accent',
  easy: 'bg-level-foundation',
};

/** Coloured dot for the last confidence rating; a hollow ring when never reviewed. */
export function ConfidenceDot({
  confidence,
  className,
}: {
  confidence: Confidence | undefined;
  className?: string;
}) {
  const label = confidence ? `Last rated: ${CONFIDENCE_LABEL[confidence]}` : 'Not reviewed yet';
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        'inline-block size-2.5 shrink-0 rounded-full',
        confidence ? CONFIDENCE_TONE[confidence] : 'border border-border-strong',
        className,
      )}
    />
  );
}

/** Marks a block the assistant wrote (not from my notes) until the problem is reviewed. */
export function GeneratedBadge({ className }: { className?: string }) {
  return (
    <span
      title="Written by the assistant, not taken from your notes. Set meta.reviewed when checked."
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 rounded-full border border-dashed border-level-intermediate px-1.5 text-[0.625rem] font-medium text-level-intermediate',
        className,
      )}
    >
      <Sparkles className="size-3" aria-hidden />
      AI-added, review
    </span>
  );
}

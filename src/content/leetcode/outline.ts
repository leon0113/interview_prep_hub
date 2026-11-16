import type { LcCategory, LcDifficulty, LcLang, LcProblem } from './schema';

/**
 * What lists, the sidebar, search and the revision queue need about each problem — no
 * approach, breakdown or solutions. Generated into `lc-outline.generated.json`.
 */
export interface LcProblemOutline {
  id: string;
  number: number;
  title: string;
  slug: string;
  category: LcCategory;
  difficulty: LcDifficulty;
  url: string;
  patternId: string;
  alsoPatterns: string[];
  patternLabel: string;
  topicId?: string;
  tags: string[];
  solvedIn: LcLang[];
  dateAdded: string;
  /** Count of blocks still marked "AI-added, review". */
  toReview: number;
}

export interface LcOutline {
  problems: LcProblemOutline[];
}

export function buildLcOutline(problems: readonly LcProblem[]): LcOutline {
  return {
    problems: problems.map((p) => ({
      id: p.id,
      number: p.number,
      title: p.title,
      slug: p.slug,
      category: p.category,
      difficulty: p.difficulty,
      url: p.url,
      patternId: p.patternId,
      alsoPatterns: p.alsoPatterns ?? [],
      patternLabel: p.patternLabel,
      ...(p.topicId ? { topicId: p.topicId } : {}),
      tags: p.tags,
      solvedIn: p.solvedIn,
      dateAdded: p.dateAdded,
      toReview: p.meta?.reviewed ? 0 : (p.meta?.generated?.length ?? 0),
    })),
  };
}

export function serializeLcOutline(outline: LcOutline): string {
  return `${JSON.stringify(outline, null, 2)}\n`;
}

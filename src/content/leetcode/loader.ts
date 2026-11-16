import outlineJson from './lc-outline.generated.json';
import type { LcOutline, LcProblemOutline } from './outline';
import type { LcCategory, LcProblem } from './schema';

/** Small and static: lists, the sidebar, search and the revision queue all read it. */
export const lcOutline = outlineJson as LcOutline;

/** One chunk per problem file, loaded only by its own page (or the revision session). */
const problemModules = import.meta.glob<LcProblem>(['./dsa/[0-9]*.ts', './database/[0-9]*.ts'], {
  import: 'default',
});

const cache = new Map<string, Promise<LcProblem>>();

export function findLcProblem(
  category: string | undefined,
  slug: string | undefined,
): LcProblemOutline | undefined {
  return lcOutline.problems.find((p) => p.category === category && p.slug === slug);
}

export function lcProblemsIn(category: LcCategory): LcProblemOutline[] {
  return lcOutline.problems.filter((p) => p.category === category);
}

/** Full problem content. Resolves to undefined for an unknown category/slug. */
export function loadLcProblem(category: string, slug: string): Promise<LcProblem | undefined> {
  const key = `./${category}/${slug}.ts`;
  const load = problemModules[key];
  if (!load) return Promise.resolve(undefined);
  let promise = cache.get(key);
  if (!promise) {
    promise = load();
    promise.catch(() => cache.delete(key));
    cache.set(key, promise);
  }
  return promise;
}

export const LC_CATEGORY_LABEL: Record<LcCategory, string> = {
  dsa: 'LeetCode DSA',
  database: 'LeetCode Database',
};

export const LC_CATEGORY_SHORT: Record<LcCategory, string> = {
  dsa: 'DSA',
  database: 'Database',
};

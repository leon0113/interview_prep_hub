import type { LucideIcon } from 'lucide-react';
import { isSection, type TrackOutline } from './outline';
import type { Coverage, Dataset, Exercise, Question, Section, TrackMeta } from './schema';
import { trackRegistry } from './tracks';

/*
 * Content is split into small lazy chunks, discovered by folder convention
 * (src/content/<track id>/...), so adding a track needs no changes here:
 *
 *   outline.generated.json  titles/ids/levels — home, sidebar, search, track page
 *   sections/<file>.ts      full questions of one section — section and question pages
 *   exercises.ts            full exercises — exercise page
 *   coverage.ts             quick concepts, not covered, study tips — coverage page
 */
const outlineModules = import.meta.glob<TrackOutline>('./*/outline.generated.json', {
  import: 'default',
});
const sectionModules = import.meta.glob<Record<string, unknown>>('./*/sections/*.ts');
const exerciseModules = import.meta.glob<Exercise[]>('./*/exercises.ts', { import: 'exercises' });
const coverageModules = import.meta.glob<Coverage>('./*/coverage.ts', { import: 'coverage' });
/** Optional sample database (e.g. the SQL track's clinic data). */
const datasetModules = import.meta.glob<Dataset>('./*/dataset.ts', { import: 'dataset' });

export const trackMetas: readonly TrackMeta[] = trackRegistry.map((entry) => entry.meta);

/** The lucide icon component registered for a track's `icon` name. */
export function getTrackIcon(iconName: string): LucideIcon | undefined {
  return trackRegistry.find((entry) => entry.meta.icon === iconName)?.Icon;
}

export function getTrackMeta(slug: string | undefined): TrackMeta | undefined {
  return trackMetas.find((meta) => meta.slug === slug);
}

/**
 * Memoises promises by key. A stable promise per key is what React's `use()` needs, and a
 * failed load (e.g. a flaky network) is evicted so the next attempt retries.
 */
const cache = new Map<string, Promise<unknown>>();
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let promise = cache.get(key) as Promise<T> | undefined;
  if (!promise) {
    promise = load();
    promise.catch(() => cache.delete(key));
    cache.set(key, promise);
  }
  return promise;
}

function required<T>(modules: Record<string, () => Promise<T>>, key: string): () => Promise<T> {
  const load = modules[key];
  if (!load) throw new Error(`Content module not found: ${key}`);
  return load;
}

/** The track's outline. Resolves to undefined for an unknown slug. */
export function loadOutline(slug: string): Promise<TrackOutline> | undefined {
  const meta = getTrackMeta(slug);
  if (!meta) return undefined;
  return cached(
    `outline:${meta.id}`,
    required(outlineModules, `./${meta.id}/outline.generated.json`),
  );
}

/**
 * Seeds the cache with an outline that is already in hand — a prerendered page embeds its
 * track's outline, so the sidebar and search need not download it again.
 */
export function primeOutline(outline: TrackOutline): void {
  if (!cache.has(`outline:${outline.id}`))
    cache.set(`outline:${outline.id}`, Promise.resolve(outline));
}

/** Every registered track's outline, in registry order. Stable promise, safe for `use()`. */
export function loadAllOutlines(): Promise<TrackOutline[]> {
  return cached('outline:*', () => Promise.all(trackMetas.map((meta) => loadOutline(meta.slug)!)));
}

/**
 * The full content of one section, or undefined if the track or section does not exist.
 * Section files are named after the section id without its track prefix (`js-async` lives
 * in `sections/async.ts`; tests/outline.test.ts enforces it), so the chunk can be fetched
 * straight away, in parallel with the outline, instead of after it.
 */
export function loadSection(slug: string, sectionId: string): Promise<Section | undefined> {
  return cached(`section:${slug}/${sectionId}`, async () => {
    const meta = getTrackMeta(slug);
    const load = meta && sectionModules[`./${meta.id}/sections/${sectionFile(sectionId)}.ts`];
    if (!load) return undefined;
    const mod = await load();
    return Object.values(mod).find(
      (value): value is Section => isSection(value) && value.id === sectionId,
    );
  });
}

/** `py-data-structures` -> `data-structures`: a section's file name in `sections/`. */
export function sectionFile(sectionId: string): string {
  return sectionId.slice(sectionId.indexOf('-') + 1);
}

/** Full questions by id (loading only the sections that contain them), in the given order. */
export function loadQuestions(slug: string, ids: readonly string[]): Promise<Question[]> {
  return cached(`questions:${slug}/${ids.join(',')}`, async () => {
    const outline = await loadOutline(slug);
    if (!outline) return [];
    const sectionIds = new Set(
      outline.sections
        .filter((section) => section.questions.some((q) => ids.includes(q.id)))
        .map((section) => section.id),
    );
    const sections = await Promise.all([...sectionIds].map((id) => loadSection(slug, id)));
    const byId = new Map(
      sections.flatMap((section) => section?.questions ?? []).map((q) => [q.id, q] as const),
    );
    return ids.flatMap((id) => byId.get(id) ?? []);
  });
}

export function loadExercises(slug: string): Promise<Exercise[]> | undefined {
  const meta = getTrackMeta(slug);
  if (!meta) return undefined;
  return cached(`exercises:${meta.id}`, required(exerciseModules, `./${meta.id}/exercises.ts`));
}

/** The track's sample database, or undefined if the track has none. */
export function loadDataset(slug: string): Promise<Dataset> | undefined {
  const meta = getTrackMeta(slug);
  const load = meta && datasetModules[`./${meta.id}/dataset.ts`];
  if (!meta || !load) return undefined;
  return cached(`dataset:${meta.id}`, load);
}

export function loadCoverage(slug: string): Promise<Coverage> | undefined {
  const meta = getTrackMeta(slug);
  if (!meta) return undefined;
  return cached(`coverage:${meta.id}`, required(coverageModules, `./${meta.id}/coverage.ts`));
}

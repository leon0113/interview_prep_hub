import type { TrackOutline } from '@/content/outline';
import type { Dataset, Track } from '@/content/schema';
import { trackRegistry } from '@/content/tracks';

/*
 * Full tracks (every section, exercise and concept) for tests. The app itself never loads a
 * whole track — it loads outlines and per-section chunks — but validation needs everything.
 */
const fullModules = import.meta.glob<Track>('/src/content/*/index.ts', {
  import: 'default',
  eager: true,
});
const outlineModules = import.meta.glob<TrackOutline>('/src/content/*/outline.generated.json', {
  import: 'default',
  eager: true,
});
/** Every section module, keyed by path — used to check outlines point at the right file. */
export const sectionModules = import.meta.glob<Record<string, unknown>>(
  '/src/content/*/sections/*.ts',
  { eager: true },
);

function pick<T>(modules: Record<string, T>, path: string): T {
  const value = modules[path];
  if (!value) throw new Error(`Missing ${path} — is the track folder named after its id?`);
  return value;
}

export const fullTracks: Track[] = trackRegistry.map((entry) =>
  pick(fullModules, `/src/content/${entry.meta.id}/index.ts`),
);

export const committedOutlines: TrackOutline[] = trackRegistry.map((entry) =>
  pick(outlineModules, `/src/content/${entry.meta.id}/outline.generated.json`),
);

/** Sample databases (src/content/<track>/dataset.ts), keyed by track id. */
const datasetModules = import.meta.glob<Dataset>('/src/content/*/dataset.ts', {
  import: 'dataset',
  eager: true,
});
export const datasets: Record<string, Dataset> = Object.fromEntries(
  Object.entries(datasetModules).map(([path, dataset]) => [path.split('/')[3] ?? '', dataset]),
);

/** Track folders that exist on disk (have an index.ts), registered or not. The LeetCode area
 * (src/content/leetcode) and the guides (src/content/guides) are not tracks. */
export const trackFolders: string[] = Object.keys(fullModules)
  .map((path) => path.split('/')[3] ?? '')
  .filter((folder) => folder !== 'leetcode' && folder !== 'guides');

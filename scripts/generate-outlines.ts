/**
 * Generates `src/content/<track>/outline.generated.json` for every track folder.
 *
 *   npm run gen:outlines
 *
 * The Vite plugin in vite.config.ts also calls `generateOutlines()` on dev-server start, on
 * content changes, and before production builds, so you rarely need to run it by hand.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';
import type * as LcRegistry from '../src/content/leetcode/index';
import type * as LcOutlineModule from '../src/content/leetcode/outline';
import type * as OutlineModule from '../src/content/outline';
import type { Dataset, Track } from '../src/content/schema';

const contentDir = fileURLToPath(new URL('../src/content/', import.meta.url));

/** The LeetCode area lives in src/content/leetcode but is not a language track. */
export const LEETCODE_FOLDER = 'leetcode';

/** Track folders: every directory in src/content with an index.ts, except the LeetCode area. */
export function trackFolders(): string[] {
  return readdirSync(contentDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        entry.name !== LEETCODE_FOLDER &&
        existsSync(join(contentDir, entry.name, 'index.ts')),
    )
    .map((entry) => entry.name);
}

/** Writes `text` to `target` unless it already holds exactly that; returns whether it changed. */
function writeIfChanged(target: string, text: string): boolean {
  if (existsSync(target) && readFileSync(target, 'utf8') === text) return false;
  writeFileSync(target, text, 'utf8');
  return true;
}

/** Regenerates src/content/leetcode/lc-outline.generated.json from the problem registry. */
async function generateLcOutline(jiti: ReturnType<typeof createJiti>): Promise<string[]> {
  const dir = join(contentDir, LEETCODE_FOLDER);
  const { lcProblems } = await jiti.import<typeof LcRegistry>(join(dir, 'index.ts'));
  const { buildLcOutline, serializeLcOutline } = await jiti.import<typeof LcOutlineModule>(
    join(dir, 'outline.ts'),
  );
  const target = join(dir, 'lc-outline.generated.json');
  return writeIfChanged(target, serializeLcOutline(buildLcOutline(lcProblems))) ? [target] : [];
}

/**
 * Regenerates the outlines of the given track folders (default: all). Returns the paths of
 * files whose content changed; unchanged files are not rewritten (no needless HMR).
 */
export async function generateOutlines(
  folders: string[] = [...trackFolders(), LEETCODE_FOLDER],
): Promise<string[]> {
  // A fresh jiti per run, without caches, so edited content files are re-read.
  const jiti = createJiti(import.meta.url, { moduleCache: false, fsCache: false });
  const { buildOutline, isSection, serializeOutline } = await jiti.import<typeof OutlineModule>(
    join(contentDir, 'outline.ts'),
  );

  const changed: string[] = [];
  for (const folder of folders) {
    if (folder === LEETCODE_FOLDER) {
      changed.push(...(await generateLcOutline(jiti)));
      continue;
    }
    const trackDir = join(contentDir, folder);
    const track = await jiti.import<Track>(join(trackDir, 'index.ts'), { default: true });

    const moduleBySection = new Map<string, string>();
    const sectionsDir = join(trackDir, 'sections');
    for (const file of readdirSync(sectionsDir).filter((f) => f.endsWith('.ts'))) {
      const mod = await jiti.import<Record<string, unknown>>(join(sectionsDir, file));
      for (const value of Object.values(mod)) {
        if (isSection(value)) moduleBySection.set(value.id, basename(file, '.ts'));
      }
    }

    const datasetFile = join(trackDir, 'dataset.ts');
    const dataset = existsSync(datasetFile)
      ? (await jiti.import<{ dataset: Dataset }>(datasetFile)).dataset
      : undefined;

    const outline = buildOutline(
      track,
      (sectionId) => {
        const module = moduleBySection.get(sectionId);
        if (!module)
          throw new Error(`${folder}: section "${sectionId}" is not exported from sections/*.ts`);
        return module;
      },
      dataset,
    );

    const target = join(trackDir, 'outline.generated.json');
    if (writeIfChanged(target, serializeOutline(outline))) changed.push(target);
  }
  return changed;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const changed = await generateOutlines();
  console.log(
    changed.length
      ? `Updated ${changed.length} outline(s):\n${changed.map((f) => `  ${f}`).join('\n')}`
      : 'Outlines are up to date.',
  );
}

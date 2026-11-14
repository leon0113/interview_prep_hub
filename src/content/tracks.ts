import { Braces, Database, FileType, SquareTerminal, type LucideIcon } from 'lucide-react';
import type { TrackMeta } from './schema';
import { javascriptMeta } from './javascript/meta';
import { pythonMeta } from './python/meta';
import { sqlMeta } from './sql/meta';
import { typescriptMeta } from './typescript/meta';

export interface TrackEntry {
  /** Small, statically bundled: enough to draw navigation and track cards. */
  meta: TrackMeta;
  /**
   * The lucide icon named by `meta.icon`. Imported here (not looked up by name at runtime)
   * so only the icons in use are bundled; tests/content.test.ts checks the two match.
   */
  Icon: LucideIcon;
}

/**
 * The ONLY place a track is registered. To add a track: create `src/content/<track id>/`
 * (index.ts, meta.ts, sections/*.ts, exercises.ts, coverage.ts) and add one line here.
 * Order = display order. Content chunks and the generated outline are found by folder name
 * (see loader.ts), so nothing else needs registering.
 */
export const trackRegistry: readonly TrackEntry[] = [
  { meta: pythonMeta, Icon: SquareTerminal },
  { meta: javascriptMeta, Icon: Braces },
  { meta: typescriptMeta, Icon: FileType },
  { meta: sqlMeta, Icon: Database },
];

import { describe, expect, it } from 'vitest';
import { sectionFile } from '@/content/loader';
import { buildOutline, isSection, serializeOutline } from '@/content/outline';
import { trackRegistry } from '@/content/tracks';
import {
  committedOutlines,
  datasets,
  fullTracks,
  sectionModules,
  trackFolders,
} from './helpers/tracks';

/**
 * The app reads `outline.generated.json` for navigation and search, so it must match the
 * content exactly. If this fails: `npm run gen:outlines` (the dev server and `npm run build`
 * also regenerate outlines automatically).
 */
describe('generated outlines', () => {
  it('every track folder is registered and every registered track has a folder', () => {
    expect([...trackFolders].sort()).toEqual(trackRegistry.map((e) => e.meta.id).sort());
  });

  it('section files are named after the section id without its track prefix', () => {
    for (const outline of committedOutlines) {
      for (const section of outline.sections) {
        expect(
          section.module,
          `${section.id} should live in sections/${sectionFile(section.id)}.ts`,
        ).toBe(sectionFile(section.id));
      }
    }
  });

  fullTracks.forEach((track, i) => {
    it(`${track.id}: outline.generated.json is up to date (run npm run gen:outlines)`, () => {
      const moduleOf = (sectionId: string) => {
        const path = Object.keys(sectionModules).find(
          (key) =>
            key.startsWith(`/src/content/${track.id}/sections/`) &&
            Object.values(sectionModules[key]!).some((v) => isSection(v) && v.id === sectionId),
        );
        if (!path) throw new Error(`section ${sectionId} has no module`);
        return path.split('/').at(-1)!.replace(/\.ts$/, '');
      };
      const expected = serializeOutline(buildOutline(track, moduleOf, datasets[track.id]));
      expect(serializeOutline(committedOutlines[i]!)).toBe(expected);
    });
  });
});

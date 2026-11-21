/**
 * Guides: tool handbooks built from my notes (Docker first). Not a track: no questions or
 * exercises, just the notes (verbatim, in their own order) plus a "quick find" list of recipes
 * that point into them. Add a guide by creating `<id>/notes.md` + `<id>/index.ts` and listing
 * it below.
 */
import type { Accent } from '@/content/schema';
import { guideHeadings, parseGuide } from './notes';

export type RecipeIcon =
  'checklist' | 'terminal' | 'server' | 'monitor' | 'database' | 'layers' | 'wrench' | 'book';

export interface GuideRecipe {
  id: string;
  /** English, task-shaped: what you are about to do ("Backend setup: Node + TypeScript"). */
  title: string;
  /** One line on what you get there. */
  summary: string;
  /** Anchor in the notes ("section-11-2"). */
  anchor: string;
  /** Extra search words: stack names, synonyms, the phrases you would type. */
  keywords: string[];
  /** Small chips on the card ("Next.js", "MongoDB"). */
  stack?: string[];
  icon: RecipeIcon;
}

export interface GuideRecipeGroup {
  title: string;
  recipes: GuideRecipe[];
}

export interface GuideMeta {
  id: string;
  title: string;
  description: string;
  accent: Accent;
  order: number;
}

export interface GuideContent {
  id: string;
  /** The notes, verbatim. */
  notes: string;
  recipeGroups: GuideRecipeGroup[];
  /** Search words for a notes section or subsection, keyed by its anchor. */
  sectionKeywords?: Record<string, string[]>;
}

export const guideMetas: GuideMeta[] = [
  {
    id: 'docker',
    title: 'Docker',
    description:
      'Images, containers, volumes, networking, Compose and ready-to-copy setups for FastAPI, React, Next.js, MongoDB and PostgreSQL.',
    accent: 'azure',
    order: 1,
  },
];

const guideModules: Record<string, () => Promise<{ default: GuideContent }>> = {
  docker: () => import('./docker'),
};

export function getGuideMeta(id: string | undefined): GuideMeta | undefined {
  return guideMetas.find((g) => g.id === id);
}

export async function loadGuide(id: string): Promise<GuideContent | undefined> {
  const load = guideModules[id];
  return load ? (await load()).default : undefined;
}

export interface GuideSearchEntry {
  guide: GuideMeta;
  kind: 'recipe' | 'section';
  id: string;
  title: string;
  context: string;
  keywords: string[];
  anchor: string;
}

let searchEntries: Promise<GuideSearchEntry[]> | undefined;

/** Recipes and every heading of every guide, for the command palette. Loaded once, on demand. */
export function loadGuideSearchEntries(): Promise<GuideSearchEntry[]> {
  searchEntries ??= Promise.all(
    guideMetas.map(async (guide) => {
      const content = await loadGuide(guide.id);
      if (!content) return [];
      const recipes: GuideSearchEntry[] = content.recipeGroups.flatMap((group) =>
        group.recipes.map((recipe) => ({
          guide,
          kind: 'recipe' as const,
          id: `${guide.id}-recipe-${recipe.id}`,
          title: recipe.title,
          context: `${group.title} · ${recipe.summary}`,
          keywords: [guide.title, ...recipe.keywords, ...(recipe.stack ?? [])],
          anchor: recipe.anchor,
        })),
      );
      const sections: GuideSearchEntry[] = guideHeadings(parseGuide(content.notes)).map((h) => ({
        guide,
        kind: 'section' as const,
        id: `${guide.id}-${h.id}`,
        title: h.title.replace(/[`*]/g, ''),
        context: h.context.replace(/[`*]/g, ''),
        keywords: [guide.title, ...(content.sectionKeywords?.[h.id] ?? [])],
        anchor: h.id,
      }));
      return [...recipes, ...sections];
    }),
  ).then((lists) => lists.flat());
  return searchEntries;
}

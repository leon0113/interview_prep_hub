import { describe, expect, it } from 'vitest';
import { LEVELS } from '@/content/constants';
import {
  DatasetSchema,
  TrackSchema,
  type CodeExample,
  type Question,
  type QuickConcept,
  type Track,
} from '@/content/schema';
import { iconNames } from 'lucide-react/dynamic';
import { trackRegistry } from '@/content/tracks';
import { vizIds } from '@/visualizations/registry';
import { datasets, fullTracks } from './helpers/tracks';

/**
 * Validates every registered track against the content contract in CLAUDE.md §5–6.
 * Run on its own with `npm run validate:content`.
 */

const tracks: Track[] = fullTracks;

const PRINT_PATTERNS: Partial<Record<CodeExample['lang'], RegExp>> = {
  python: /\bprint\s*\(/,
  javascript: /\bconsole\.(log|error|warn|info|table|dir)\s*\(/,
  typescript: /\bconsole\.(log|error|warn|info|table|dir)\s*\(/,
  bash: /^\s*echo\b/m,
  // A query that returns rows "prints" its result set.
  sql: /\b(SELECT|RETURNING)\b/i,
};

/** Drops comments so a commented-out `print(...)` does not demand an output. */
function stripComments(example: CodeExample): string {
  if (example.lang === 'python' || example.lang === 'bash') {
    return example.code.replace(/#.*$/gm, '');
  }
  if (example.lang === 'sql') {
    return example.code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '');
  }
  return example.code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function prints(example: CodeExample): boolean {
  const pattern = PRINT_PATTERNS[example.lang];
  return pattern ? pattern.test(stripComments(example)) : false;
}

function idPrefix(id: string): string {
  return id.split('-')[0] ?? '';
}

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes];
}

const allQuestions = (track: Track): Question[] => track.sections.flatMap((s) => s.questions);
const allConcepts = (track: Track): QuickConcept[] => track.coverage.quickConcepts;

describe('track registry', () => {
  it('registers at least one track', () => {
    expect(trackRegistry.length).toBeGreaterThan(0);
  });

  it('has unique track ids, slugs and id prefixes', () => {
    expect(duplicates(tracks.map((t) => t.id))).toEqual([]);
    expect(duplicates(tracks.map((t) => t.slug))).toEqual([]);
    expect(duplicates(tracks.map((t) => idPrefix(t.sections[0]?.id ?? t.id)))).toEqual([]);
  });

  it('does not use a slug that collides with an app route', () => {
    const reserved = ['bookmarks', 'q', 'exercises', 'coverage'];
    for (const track of tracks) expect(reserved).not.toContain(track.slug);
  });

  it('uses real lucide icon names that match the bound icon component', () => {
    const pascal = (name: string) =>
      name.replace(/(^|-)([a-z0-9])/g, (_match, _dash, char: string) => char.toUpperCase());
    for (const entry of trackRegistry) {
      expect(iconNames, entry.meta.slug).toContain(entry.meta.icon);
      expect(entry.Icon.displayName, entry.meta.slug).toBe(pascal(entry.meta.icon));
    }
  });

  it('keeps registry meta identical to the loaded track', () => {
    trackRegistry.forEach((entry, index) => {
      const track = tracks[index]!;
      for (const key of Object.keys(entry.meta) as (keyof typeof entry.meta)[]) {
        expect(track[key], `${entry.meta.slug}.${key}`).toBe(entry.meta[key]);
      }
    });
  });

  it('has globally unique question, quick-concept and exercise ids', () => {
    const ids = tracks.flatMap((t) => [
      ...allQuestions(t).map((q) => q.id),
      ...allConcepts(t).map((q) => q.id),
      ...t.exercises.map((e) => e.id),
    ]);
    expect(duplicates(ids)).toEqual([]);
  });
});

describe.each(tracks.map((track) => [track.slug, track] as const))('track: %s', (_slug, track) => {
  const prefix = idPrefix(track.sections[0]?.id ?? '');
  const questions = allQuestions(track);
  const concepts = allConcepts(track);
  const knownQuestionIds = new Set(tracks.flatMap((t) => allQuestions(t).map((q) => q.id)));

  it('matches the zod schema', () => {
    const result = TrackSchema.safeParse(track);
    if (!result.success) {
      throw new Error(
        result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'),
      );
    }
  });

  it('uses one id prefix for sections, questions and exercises', () => {
    expect(prefix).not.toBe('');
    const ids = [
      ...track.sections.map((s) => s.id),
      ...questions.map((q) => q.id),
      ...concepts.map((q) => q.id),
      ...concepts.map((q) => q.sectionId),
    ];
    for (const id of ids) expect(id.startsWith(`${prefix}-`), id).toBe(true);
    for (const exercise of track.exercises) {
      expect(exercise.id.startsWith(`${prefix}-ex-`), exercise.id).toBe(true);
    }
  });

  it('has unique section ids and section order', () => {
    expect(duplicates(track.sections.map((s) => s.id))).toEqual([]);
    expect(duplicates(track.sections.map((s) => String(s.order)))).toEqual([]);
  });

  it('keeps section ids clear of reserved route segments', () => {
    for (const section of track.sections) {
      expect(['q', 'exercises', 'coverage']).not.toContain(section.id);
    }
  });

  it("sets each question's sectionId to its containing section", () => {
    for (const section of track.sections) {
      for (const question of section.questions) {
        expect(question.sectionId, question.id).toBe(section.id);
      }
    }
  });

  it('sorts questions by level, then priority (desc)', () => {
    for (const section of track.sections) {
      const actual = section.questions.map((q) => q.id);
      const expected = [...section.questions]
        .sort(
          (a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || b.priority - a.priority,
        )
        .map((q) => q.id);
      expect(actual, `section ${section.id}`).toEqual(expected);
    }
  });

  it('references only registered visualizations', () => {
    for (const question of [...questions, ...concepts]) {
      if (question.visualizationId) {
        expect(vizIds, `${question.id} -> ${question.visualizationId}`).toContain(
          question.visualizationId,
        );
      }
    }
  });

  it('links `related` only to existing questions (and never to itself)', () => {
    for (const question of [...questions, ...concepts]) {
      for (const relatedId of question.related ?? []) {
        expect(relatedId, `${question.id} relates to itself`).not.toBe(question.id);
        expect(knownQuestionIds.has(relatedId), `${question.id} -> ${relatedId}`).toBe(true);
      }
    }
  });

  it('gives every printing code example an output', () => {
    for (const question of [...questions, ...concepts]) {
      (question.answer.examples ?? []).forEach((example, index) => {
        if (prints(example)) {
          // SQL queries that return rows show a result table instead of printed output.
          const shown =
            (example.output?.trim().length ?? 0) > 0 || example.resultTable !== undefined;
          expect(shown, `${question.id} example #${index + 1} prints but has no output`).toBe(true);
        }
      });
    }
  });

  it('backs every code block shown in a question with a verified example', () => {
    // Output-prediction puzzles show their code in the question; the same code must appear
    // as an example with an output, so verify:outputs checks what the reader actually sees.
    const fence = /```(\w+)\n([\s\S]*?)\n```/g;
    for (const question of questions) {
      for (const [, lang, code] of question.question.matchAll(fence)) {
        if (!['python', 'javascript', 'typescript', 'sql'].includes(lang!)) continue;
        const match = (question.answer.examples ?? []).find(
          (example) => example.code === code && example.lang === lang,
        );
        expect(match, `${question.id}: question code has no identical example`).toBeDefined();
        expect(
          Boolean(match?.output || match?.resultTable),
          `${question.id}: question code example has no output`,
        ).toBe(true);
      }
    }
  });

  it('does not mark everything as priority 3', () => {
    // Only meaningful once a track has real content.
    if (questions.length < 20) return;
    const top = questions.filter((q) => q.priority === 3).length;
    expect(top / questions.length).toBeLessThanOrEqual(0.4);
  });

  it('has no duplicate question text', () => {
    expect(duplicates(questions.map((q) => q.question.trim().toLowerCase()))).toEqual([]);
  });

  it('has unique solution labels per exercise', () => {
    for (const exercise of track.exercises) {
      expect(duplicates(exercise.solutions.map((s) => s.label)), exercise.id).toEqual([]);
    }
  });
});

describe('sample databases (src/content/<track>/dataset.ts)', () => {
  const entries = Object.entries(datasets);
  const KNOWN_TYPE =
    /^(SMALLINT|INT|INTEGER|BIGINT|NUMERIC(\(\d+,\s*\d+\))?|REAL|DOUBLE PRECISION|TEXT|VARCHAR\(\d+\)|CHAR\(\d+\)|BOOLEAN|DATE|TIMESTAMP|TIMESTAMPTZ|JSONB?|UUID)$/i;

  it('exists for the SQL track', () => {
    expect(entries.map(([id]) => id)).toContain('sql');
  });

  for (const [trackId, dataset] of entries) {
    describe(trackId, () => {
      it('matches the dataset schema', () => {
        expect(DatasetSchema.safeParse(dataset).error?.issues ?? []).toEqual([]);
      });

      it('uses known SQL types or declared enums', () => {
        const enums = new Set(dataset.enums.map((e) => e.name));
        for (const table of dataset.tables) {
          for (const column of table.columns) {
            expect(
              KNOWN_TYPE.test(column.type) || enums.has(column.type),
              `${table.name}.${column.name}: ${column.type}`,
            ).toBe(true);
          }
        }
      });

      it('points foreign keys at existing tables/columns declared earlier (or itself)', () => {
        const seen = new Map<string, Set<string>>();
        for (const table of dataset.tables) {
          seen.set(table.name, new Set(table.columns.map((c) => c.name)));
          for (const column of table.columns) {
            if (!column.references) continue;
            const target = seen.get(column.references.table);
            expect(
              target,
              `${table.name}.${column.name} -> ${column.references.table}`,
            ).toBeDefined();
            expect(target?.has(column.references.column)).toBe(true);
          }
        }
      });

      it('has unique ids, valid JSON cells, enum values and foreign-key values that exist', () => {
        const byName = new Map(dataset.tables.map((table) => [table.name, table]));
        const enums = new Map(dataset.enums.map((e) => [e.name, new Set(e.values)]));
        const valuesOf = (tableName: string, columnName: string) => {
          const table = byName.get(tableName)!;
          const index = table.columns.findIndex((c) => c.name === columnName);
          return new Set(table.rows.map((row) => row[index]));
        };
        for (const table of dataset.tables) {
          const ids = table.rows.map((row) => row[0]);
          expect(new Set(ids).size, `${table.name}: duplicate ids`).toBe(ids.length);
          table.columns.forEach((column, index) => {
            for (const row of table.rows) {
              const value = row[index] ?? null;
              if (value === null) continue;
              const where = `${table.name}.${column.name} = ${String(value)}`;
              if (/^jsonb?$/i.test(column.type)) {
                expect(() => JSON.parse(String(value)), where).not.toThrow();
              }
              const allowed = enums.get(column.type);
              if (allowed) expect(allowed.has(String(value)), where).toBe(true);
              if (column.references) {
                const { table: target, column: targetColumn } = column.references;
                expect(valuesOf(target, targetColumn).has(value), `${where} has no match`).toBe(
                  true,
                );
              }
            }
          });
        }
      });
    });
  }
});

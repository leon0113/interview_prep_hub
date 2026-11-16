import { z } from 'zod';

/**
 * Content contract for the LeetCode area (separate from the language tracks). One problem =
 * one file in `src/content/leetcode/<category>/<number>-<slug>.ts`. The fields map one-to-one
 * onto the sections of a note in docs/leetcode-notes.md; see CLAUDE.md, "LeetCode intake".
 */

export const LC_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export const LC_CATEGORIES = ['dsa', 'database'] as const;
export const LC_LANGS = ['javascript', 'python', 'sql', 'mysql', 'postgresql'] as const;
export const LC_SOLUTION_LANGS = ['javascript', 'python', 'sql'] as const;

const text = z.string().trim().min(1);
const cell = z.union([z.string(), z.number(), z.null()]);

/** One snapshot of an array walk-through, drawn by the generic array visualizer. */
export const ArrayStateSchema = z.object({
  /** Label above the main array, e.g. "nums1". */
  label: z.string().optional(),
  array: z.array(cell),
  /** Pointer name -> index. -1 or array.length draw just outside the array. */
  pointers: z.record(z.string(), z.number().int()),
  highlight: z.array(z.number().int().nonnegative()).optional(),
  /** Draws a divider before this index: everything from here on is "ignored". */
  dividerAt: z.number().int().nonnegative().optional(),
  /** Side variables shown next to the array: count, maxCount, lowest, profit, sum... */
  vars: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  /** A second array with its own pointers (#88 nums2). */
  secondary: z
    .object({
      label: text,
      array: z.array(cell),
      pointers: z.record(z.string(), z.number().int()),
      highlight: z.array(z.number().int().nonnegative()).optional(),
    })
    .optional(),
  /** "This value moves from here to there", drawn as an arrow badge (#88). */
  move: z
    .object({
      from: z.object({ array: z.enum(['primary', 'secondary']), index: z.number().int() }),
      to: z.object({ array: z.enum(['primary', 'secondary']), index: z.number().int() }),
    })
    .optional(),
  caption: text,
});

const ResultSchema = z.object({ columns: z.array(text).min(1), rows: z.array(z.array(cell)) });

export const TraceBlockSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('table'),
    title: z.string().optional(),
    columns: z.array(z.string()).min(1),
    rows: z.array(z.array(z.string())),
    /** [row, column] of cells that were bold in the notes. */
    highlightCells: z.array(z.tuple([z.number().int(), z.number().int()])).optional(),
  }),
  z.object({ kind: z.literal('diagram'), title: z.string().optional(), text }),
  z.object({
    kind: z.literal('steps'),
    title: z.string().optional(),
    arrayStates: z.array(ArrayStateSchema).min(1),
  }),
  /** Database problems: the intermediate result after each clause, in execution order. */
  z.object({
    kind: z.literal('sqlSteps'),
    title: z.string().optional(),
    steps: z
      .array(z.object({ clause: text, sql: text, table: ResultSchema, caption: text }))
      .min(1),
  }),
]);

const SolutionSchema = z.object({
  label: text,
  isMine: z.boolean(),
  lang: z.enum(LC_SOLUTION_LANGS),
  /** Verbatim for my own solutions: never reformat or "fix" it. */
  code: z.string().min(1),
  lineByLine: z.array(z.object({ line: text, meaning: text })).optional(),
  complexity: z.object({ time: text, space: text }),
  note: z.string().optional(),
  /** Marks the solution an interviewer expects when mine misses a requirement. */
  optimal: z.boolean().optional(),
  trace: TraceBlockSchema.optional(),
});

/** How `npm run verify:outputs` calls the solutions with the samples. */
const VerifySchema = z.object({
  /** JS function name / Python `Solution` method name. */
  entry: z.object({ javascript: z.string().optional(), python: z.string().optional() }),
  cases: z
    .array(
      z.object({
        args: z.array(z.unknown()),
        returns: z.unknown().optional(),
        /** The solution changes an argument in place; compare it (or its first `prefix` items). */
        mutates: z
          .object({
            arg: z.number().int().nonnegative(),
            value: z.array(z.unknown()),
            prefix: z.number().int().nonnegative().optional(),
            /** Order inside the compared part does not matter (LeetCode sorts it). */
            unordered: z.boolean().optional(),
          })
          .optional(),
      }),
    )
    .min(1),
});

export const LcProblemSchema = z
  .object({
    id: z.string().regex(/^lc-\d+-[a-z0-9]+(-[a-z0-9]+)*$/),
    number: z.number().int().positive(),
    title: text,
    slug: z.string().regex(/^\d+-[a-z0-9]+(-[a-z0-9]+)*$/),
    category: z.enum(LC_CATEGORIES),
    difficulty: z.enum(LC_DIFFICULTIES),
    url: z.url(),
    patternId: text,
    /** Other patterns the alternatives use (XOR, bit trick...), shown on the patterns page. */
    alsoPatterns: z.array(text).optional(),
    patternLabel: text,
    /** Data-structure topic this problem belongs to (topics/index.ts), e.g. 'linked-list'. */
    topicId: z.string().optional(),
    tags: z.array(text),
    solvedIn: z.array(z.enum(LC_LANGS)).min(1),
    dateAdded: z.iso.date(),

    problem: z.object({
      oneLineReminder: text,
      statementBn: text,
      realLifeExample: text,
      samples: z.array(z.object({ input: text, output: text, note: z.string().optional() })).min(1),
      schema: z
        .array(
          z.object({
            table: text,
            columns: z.array(z.object({ name: text, type: text, note: z.string().optional() })),
          }),
        )
        .optional(),
      sampleTables: z
        .array(z.object({ table: text, columns: z.array(text), rows: z.array(z.array(cell)) }))
        .optional(),
      expectedResult: ResultSchema.optional(),
    }),

    approach: z.object({
      triggers: z.array(text).min(1),
      bruteForce: text,
      idea: text,
      steps: z.array(text).min(1),
      template: z.object({ code: z.string().min(1), lang: text, whatChanges: text }).optional(),
    }),

    breakdown: z.object({
      variables: z
        .array(z.object({ name: text, role: text, whenChanges: z.string().optional() }))
        .optional(),
      baseCases: z
        .array(z.object({ condition: text, result: text, why: z.string().optional() }))
        .optional(),
      recursiveStep: z.string().optional(),
      invariant: z.string().optional(),
      trace: z.array(TraceBlockSchema).min(1),
      edgeCases: z.array(text).min(1),
      deepDiveBn: z.object({ heading: text, body: text }).optional(),
    }),

    solutions: z.array(SolutionSchema).min(1),
    commonMistakes: z.array(text),

    revise: z.object({
      selfQuestions: z.array(z.object({ q: text, a: text })).min(1),
      patternToRemember: text,
      related: z.array(
        z.object({
          number: z.number().int().positive(),
          title: z.string().optional(),
          note: z.string().optional(),
          /** Filled in by the app from the registry; leave out in content files. */
          inApp: z.boolean().optional(),
        }),
      ),
    }),

    /** 'lc-array-pointers' (renders the `steps` traces) or an id from visualizations/registry.ts. */
    visualizationId: z.string().optional(),
    verify: VerifySchema.optional(),
    /** Accepted on LeetCode; local verify cases are optional for such problems. */
    acceptedOnLeetCode: z.boolean().optional(),
    /** Parts written by the assistant rather than taken from my notes, until I review them. */
    meta: z
      .object({ generated: z.array(text).optional(), reviewed: z.boolean().optional() })
      .optional(),
  })
  .superRefine((p, ctx) => {
    if (!p.slug.startsWith(`${p.number}-`)) {
      ctx.addIssue({ code: 'custom', message: `slug must start with "${p.number}-"` });
    }
    if (p.id !== `lc-${p.slug}`) {
      ctx.addIssue({ code: 'custom', message: `id must be "lc-${p.slug}"` });
    }
    if (p.solutions[0] && !p.solutions[0].isMine) {
      ctx.addIssue({ code: 'custom', message: 'my own solution comes first' });
    }
  });

export type LcDifficulty = (typeof LC_DIFFICULTIES)[number];
export type LcCategory = (typeof LC_CATEGORIES)[number];
export type LcLang = (typeof LC_LANGS)[number];
export type ArrayState = z.infer<typeof ArrayStateSchema>;
export type TraceBlock = z.infer<typeof TraceBlockSchema>;
export type LcSolution = z.infer<typeof SolutionSchema>;
export type LcProblem = z.infer<typeof LcProblemSchema>;

/** Keys used in `meta.generated` for the blocks the UI marks as "AI-added, review". */
export const GENERATED_KEYS = {
  idea: 'approach.idea',
  template: 'approach.template',
  steps: 'breakdown.steps',
  solution: (label: string) => `solutions.${label}`,
  related: 'revise.related',
  /** The whole explanation (everything except my code) was written by the assistant. */
  note: 'note',
} as const;

export function isGenerated(problem: Pick<LcProblem, 'meta'>, key: string): boolean {
  return !problem.meta?.reviewed && (problem.meta?.generated ?? []).includes(key);
}

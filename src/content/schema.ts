import { z } from 'zod';
import { ACCENTS, CODE_LANGS, EXERCISE_CATEGORIES, LEVELS } from './constants';

/**
 * Content contract for every track. Types are inferred from these schemas —
 * if the schema changes, all tracks and tests/content.test.ts change with it.
 */

const kebabId = z
  .string()
  .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, 'must be kebab-case (lowercase letters, digits, "-")');

const nonEmpty = z.string().trim().min(1);

export const LevelSchema = z.enum(LEVELS);

export const PrioritySchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const CodeLangSchema = z.enum(CODE_LANGS);

export const AccentSchema = z.enum(ACCENTS);

/** A query result shown as a table (SQL track). Every row has one cell per column. */
export const ResultTableSchema = z
  .strictObject({
    columns: z.array(nonEmpty).min(1),
    rows: z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))),
    note: z.string().optional(),
  })
  .superRefine((table, ctx) => {
    table.rows.forEach((row, index) => {
      if (row.length !== table.columns.length) {
        ctx.addIssue({
          code: 'custom',
          path: ['rows', index],
          message: `row ${index + 1} has ${row.length} cells, expected ${table.columns.length}`,
        });
      }
    });
  });

export const CodeExampleSchema = z.strictObject({
  lang: CodeLangSchema,
  code: nonEmpty,
  /** REQUIRED whenever the code prints/returns something (enforced in tests). */
  output: z.string().optional(),
  /** For queries that return rows: the result set (use instead of `output`). */
  resultTable: ResultTableSchema.optional(),
  caption: z.string().optional(),
});

const AnswerSchema = z.strictObject({
  /** Markdown, English — what to SAY in the interview. */
  interview: nonEmpty,
  /** Markdown, Bangla — the deeper why/how. */
  explanationBn: nonEmpty,
  examples: z.array(CodeExampleSchema).optional(),
  pitfalls: z.array(nonEmpty).optional(),
  followUps: z.array(nonEmpty).optional(),
});

export const QuestionSchema = z.strictObject({
  id: kebabId,
  sectionId: kebabId,
  level: LevelSchema,
  priority: PrioritySchema,
  question: nonEmpty,
  tags: z.array(nonEmpty),
  answer: AnswerSchema,
  /** Must exist in src/visualizations/registry.ts. */
  visualizationId: kebabId.optional(),
  /** Other question ids. */
  related: z.array(kebabId).optional(),
});

/** Quick concepts on the coverage page: a short interview answer plus a short Bangla line. */
export const QuickConceptSchema = QuestionSchema;

export const SectionSchema = z.strictObject({
  id: kebabId,
  title: nonEmpty,
  description: nonEmpty,
  order: z.number().int().positive(),
  /** Sorted foundation → intermediate → advanced, then priority (desc). */
  questions: z.array(QuestionSchema).min(1),
});

export const ExerciseCategorySchema = z.enum(EXERCISE_CATEGORIES);

export const ExerciseSchema = z.strictObject({
  id: kebabId,
  title: nonEmpty,
  level: LevelSchema,
  category: ExerciseCategorySchema,
  tags: z.array(nonEmpty),
  /** Markdown. */
  prompt: nonEmpty,
  examples: z.array(
    z.strictObject({ input: z.string(), output: z.string(), note: z.string().optional() }),
  ),
  constraints: z.array(nonEmpty).optional(),
  /** Progressive, revealed one at a time. */
  hints: z.array(nonEmpty).min(1),
  solutions: z
    .array(
      z.strictObject({
        label: nonEmpty,
        code: nonEmpty,
        complexity: z.strictObject({ time: nonEmpty, space: nonEmpty }).optional(),
      }),
    )
    .min(1),
  /** What running the solution shows: printed `output`, or a `resultTable` for SQL. */
  sampleRun: z
    .strictObject({
      code: nonEmpty,
      output: nonEmpty.optional(),
      resultTable: ResultTableSchema.optional(),
    })
    .refine((run) => run.output !== undefined || run.resultTable !== undefined, {
      message: 'sampleRun needs an output or a resultTable',
    }),
  explanationBn: nonEmpty,
});

export const CoverageSchema = z.strictObject({
  quickConcepts: z.array(QuickConceptSchema),
  notCovered: z.array(z.strictObject({ topic: nonEmpty, reason: nonEmpty })),
  studyTips: z.array(nonEmpty),
});

export const TrackMetaSchema = z.strictObject({
  id: kebabId,
  name: nonEmpty,
  slug: kebabId,
  /** Accent palette name for the track. */
  accent: AccentSchema,
  /** A lucide icon name (kebab-case), e.g. "square-terminal". Its component is bound in tracks.ts. */
  icon: kebabId,
  description: nonEmpty,
});

/*
 * Optional per-track sample database (`src/content/<track>/dataset.ts`), e.g. for SQL. The
 * tables and rows are the single source of truth: the seed script is generated from them.
 */
const sqlIdentifier = z.string().regex(/^[a-z_][a-z0-9_]*$/, 'must be a lowercase SQL identifier');
const CellSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const DatasetColumnSchema = z.strictObject({
  name: sqlIdentifier,
  /** SQL type as written in CREATE TABLE, e.g. "NUMERIC(10,2)" or "appointment_status". */
  type: nonEmpty,
  /** Extra column constraints, e.g. "PRIMARY KEY", "NOT NULL", "UNIQUE", "CHECK (...)". */
  constraints: z.string().optional(),
  references: z
    .strictObject({
      table: sqlIdentifier,
      column: sqlIdentifier,
      onDelete: z.enum(['CASCADE', 'SET NULL', 'RESTRICT']).optional(),
    })
    .optional(),
  note: z.string().optional(),
});

export const DatasetTableSchema = z
  .strictObject({
    name: sqlIdentifier,
    purpose: nonEmpty,
    columns: z.array(DatasetColumnSchema).min(1),
    /** One cell per column. JSON/JSONB values are written as JSON text. */
    rows: z.array(z.array(CellSchema)),
  })
  .superRefine((table, ctx) => {
    table.rows.forEach((row, index) => {
      if (row.length !== table.columns.length) {
        ctx.addIssue({
          code: 'custom',
          path: ['rows', index],
          message: `${table.name} row ${index + 1} has ${row.length} cells, expected ${table.columns.length}`,
        });
      }
    });
  });

export const DatasetSchema = z.strictObject({
  title: nonEmpty,
  description: nonEmpty,
  /** Engine the seed targets, e.g. "PostgreSQL 16". */
  dialect: nonEmpty,
  enums: z.array(z.strictObject({ name: sqlIdentifier, values: z.array(nonEmpty).min(1) })),
  tables: z.array(DatasetTableSchema).min(1),
});

export const TrackSchema = TrackMetaSchema.extend({
  sections: z.array(SectionSchema).min(1),
  exercises: z.array(ExerciseSchema),
  coverage: CoverageSchema,
});

export type Level = z.infer<typeof LevelSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type CodeLang = z.infer<typeof CodeLangSchema>;
export type Accent = z.infer<typeof AccentSchema>;
export type CodeExample = z.infer<typeof CodeExampleSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuickConcept = z.infer<typeof QuickConceptSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type ExerciseCategory = z.infer<typeof ExerciseCategorySchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type ResultTable = z.infer<typeof ResultTableSchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
export type DatasetTable = z.infer<typeof DatasetTableSchema>;
export type DatasetColumn = z.infer<typeof DatasetColumnSchema>;
export type Coverage = z.infer<typeof CoverageSchema>;
export type TrackMeta = z.infer<typeof TrackMetaSchema>;
export type Track = z.infer<typeof TrackSchema>;

/**
 * Plain constants shared by the zod schema and the app.
 * Kept free of zod so UI code can import them without pulling the validator into the bundle.
 */

export const LEVELS = ['foundation', 'intermediate', 'advanced'] as const;

export const CODE_LANGS = [
  'python',
  'javascript',
  'typescript',
  'sql',
  'bash',
  'json',
  'text',
] as const;

/** Accent palettes defined in src/styles/globals.css (`[data-accent='…']`). */
export const ACCENTS = ['azure', 'amber', 'blue', 'teal', 'emerald', 'rose', 'violet'] as const;

export const EXERCISE_CATEGORIES = [
  'logic',
  'strings',
  'arrays',
  'hashing',
  'recursion',
  'language-feature',
  'output-prediction',
  'implementation',
] as const;

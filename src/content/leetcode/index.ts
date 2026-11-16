import { databaseProblems } from './database';
import { dsaProblems } from './dsa';
import type { LcProblem } from './schema';

/**
 * Registry of every LeetCode problem, both categories. Tests and the outline generator read it;
 * the app itself reads `lc-outline.generated.json` and loads one problem file per page.
 *
 * This folder is not a language track: scripts/generate-outlines.ts and the track tests skip it.
 */
export const lcProblems: LcProblem[] = [...dsaProblems, ...databaseProblems];

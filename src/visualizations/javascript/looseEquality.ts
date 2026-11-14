/**
 * Explains `a == b` by following the spec's IsLooselyEqual algorithm step by step.
 * Kept separate from the component so it can be unit-tested against the real `==`.
 */

export interface EqualityValue {
  /** How the value is written in source code. */
  label: string;
  value: unknown;
}

export const EQUALITY_VALUES: EqualityValue[] = [
  { label: 'true', value: true },
  { label: 'false', value: false },
  { label: '1', value: 1 },
  { label: '0', value: 0 },
  { label: '"1"', value: '1' },
  { label: '"0"', value: '0' },
  { label: '""', value: '' },
  { label: 'null', value: null },
  { label: 'undefined', value: undefined },
  { label: 'NaN', value: NaN },
  { label: '[]', value: [] },
  { label: '[0]', value: [0] },
];

export interface EqualityExplanation {
  result: boolean;
  steps: string[];
}

function show(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'number' && Number.isNaN(value)) return 'NaN';
  return String(value);
}

function typeName(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'object';
  return typeof value;
}

const isNullish = (value: unknown): value is null | undefined =>
  value === null || value === undefined;
const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

export function explainLooseEquality(a: unknown, b: unknown): EqualityExplanation {
  const steps: string[] = [];

  // Bounded loop: each pass converts one side, exactly as the spec recurses.
  for (let guard = 0; guard < 6; guard++) {
    if (typeName(a) === typeName(b)) {
      if (isObject(a) && isObject(b)) {
        const result = a === b;
        steps.push(
          `Both are objects, so == compares references: ${result ? 'the same object' : 'two different objects'} → ${result}.`,
        );
        return { result, steps };
      }
      const result = a === b;
      if (typeof a === 'number' && Number.isNaN(a)) {
        steps.push(
          'Both are numbers, but NaN is never equal to anything, including itself → false.',
        );
      } else {
        steps.push(
          `Same type (${typeName(a)}), so == behaves like ===: ${show(a)} === ${show(b)} → ${result}.`,
        );
      }
      return { result, steps };
    }

    if (isNullish(a) && isNullish(b)) {
      steps.push('null and undefined are loosely equal to each other → true.');
      return { result: true, steps };
    }
    if (isNullish(a) || isNullish(b)) {
      steps.push(
        'null and undefined are only loosely equal to each other — never to 0, "", false or anything else → false.',
      );
      return { result: false, steps };
    }

    if (typeof a === 'boolean') {
      steps.push(`A boolean is converted to a number first: ${show(a)} → ${Number(a)}.`);
      a = Number(a);
      continue;
    }
    if (typeof b === 'boolean') {
      steps.push(`A boolean is converted to a number first: ${show(b)} → ${Number(b)}.`);
      b = Number(b);
      continue;
    }

    if (isObject(a)) {
      const primitive = String(a);
      steps.push(
        `The object is converted to a primitive (via toString): ${show(a)} → ${show(primitive)}.`,
      );
      a = primitive;
      continue;
    }
    if (isObject(b)) {
      const primitive = String(b);
      steps.push(
        `The object is converted to a primitive (via toString): ${show(b)} → ${show(primitive)}.`,
      );
      b = primitive;
      continue;
    }

    if (typeof a === 'string' && typeof b === 'number') {
      steps.push(
        `String vs number: the string is converted to a number: ${show(a)} → ${show(Number(a))}.`,
      );
      a = Number(a);
      continue;
    }
    if (typeof a === 'number' && typeof b === 'string') {
      steps.push(
        `String vs number: the string is converted to a number: ${show(b)} → ${show(Number(b))}.`,
      );
      b = Number(b);
      continue;
    }

    break;
  }

  steps.push('No conversion rule applies → false.');
  return { result: false, steps };
}

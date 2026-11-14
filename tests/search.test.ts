import { describe, expect, it } from 'vitest';
import { buildSearchIndex, createSearcher, groupByTrack } from '@/features/search';
import { committedOutlines, fullTracks as tracks } from './helpers/tracks';

const index = buildSearchIndex(committedOutlines);
const search = createSearcher(index);

describe('search index', () => {
  it('indexes every section, question, exercise and quick concept', () => {
    const expected = tracks.reduce(
      (total, track) =>
        total +
        track.sections.length +
        track.sections.reduce((n, section) => n + section.questions.length, 0) +
        track.exercises.length +
        track.coverage.quickConcepts.length,
      0,
    );
    expect(index).toHaveLength(expected);
    expect(new Set(index.map((item) => item.id)).size).toBe(index.length);
  });

  it('strips markdown from titles and links questions to their section anchor', () => {
    const item = index.find((i) => i.id === 'py-is-vs-equals');
    expect(item?.title).toBe('What is the difference between is and == in Python?');
    expect(item?.path).toBe('/python/py-basics#py-is-vs-equals');
  });

  it('finds items by fuzzy title, tag and typo', () => {
    expect(search('palindrome')[0]?.id).toBe('py-ex-palindrome');
    expect(search('null undefined')[0]?.id).toBe('js-null-vs-undefined');
    expect(search('imutable').map((i) => i.id)).toContain('py-mutable-vs-immutable');
    expect(search('generics').map((i) => i.id)).toContain('ts-ex-generic-stack');
  });

  it('applies track, level and type filters', () => {
    expect(search('', { track: 'python' }).every((i) => i.trackSlug === 'python')).toBe(true);
    expect(search('', { type: 'exercise' }).every((i) => i.type === 'exercise')).toBe(true);
    expect(search('', { level: 'intermediate' }).every((i) => i.level === 'intermediate')).toBe(
      true,
    );
    const jsOnly = search('palindrome', { track: 'javascript' });
    expect(jsOnly.length).toBeGreaterThan(0);
    expect(jsOnly.every((i) => i.trackSlug === 'javascript')).toBe(true);
  });

  it('groups results by track in registry order', () => {
    const order = tracks.map((track) => track.slug);
    const groups = groupByTrack(search(''), order);
    expect(groups.map((group) => group.trackSlug)).toEqual(order);
  });
});

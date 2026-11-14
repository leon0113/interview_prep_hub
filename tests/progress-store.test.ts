import { beforeEach, describe, expect, it } from 'vitest';
import { PROGRESS_STORAGE_KEY, useProgressStore } from '@/features/progress/store';

describe('progress store', () => {
  beforeEach(() => {
    useProgressStore.getState().resetProgress();
  });

  it('toggles learned on and off', () => {
    const { toggleLearned } = useProgressStore.getState();
    toggleLearned('py-is-vs-equals');
    expect(useProgressStore.getState().learned).toEqual({ 'py-is-vs-equals': true });
    toggleLearned('py-is-vs-equals');
    expect(useProgressStore.getState().learned).toEqual({});
  });

  it('toggles bookmarks on and off', () => {
    const { toggleBookmark } = useProgressStore.getState();
    toggleBookmark('js-null-vs-undefined');
    expect(Object.keys(useProgressStore.getState().bookmarks)).toEqual(['js-null-vs-undefined']);
    toggleBookmark('js-null-vs-undefined');
    expect(useProgressStore.getState().bookmarks).toEqual({});
  });

  it('records the last visited page with a timestamp', () => {
    useProgressStore.getState().setLastVisited({
      trackSlug: 'python',
      path: '/python/py-basics',
      title: 'Basics & Data Types',
      kind: 'section',
    });
    const last = useProgressStore.getState().lastVisited;
    expect(last?.path).toBe('/python/py-basics');
    expect(last?.at).toBeTypeOf('number');
  });

  it('persists user state to localStorage', () => {
    useProgressStore.getState().toggleLearned('ts-what-is-typescript');
    const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '{}');
    expect(saved.state.learned).toEqual({ 'ts-what-is-typescript': true });
    expect(saved.state.toggleLearned).toBeUndefined();
  });
});

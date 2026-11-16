import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import removeElement from '@/content/leetcode/dsa/27-remove-element';
import { lcOutline } from '@/content/leetcode/loader';
import {
  isDue,
  REVIEW_INTERVAL_DAYS,
  useLcReviewStore,
  useLcSessionStore,
} from '@/features/leetcode/store';
import { buildSearchIndex, createSearcher } from '@/features/search';
import LcProblemPage from '@/pages/leetcode/LcProblemPage';

const DAY = 24 * 60 * 60 * 1000;

describe('spaced repetition', () => {
  beforeEach(() => useLcReviewStore.setState({ reviews: {} }));

  it('schedules the next review from the confidence rating', () => {
    const now = Date.UTC(2026, 0, 1);
    useLcReviewStore.getState().rate('lc-27-remove-element', 'good', now);
    const review = useLcReviewStore.getState().reviews['lc-27-remove-element']!;
    expect(review.nextReview - now).toBe(REVIEW_INTERVAL_DAYS.good * DAY);
    expect(review.count).toBe(1);
    expect(isDue(review, now + 6 * DAY)).toBe(false);
    expect(isDue(review, now + 7 * DAY)).toBe(true);
    expect(isDue(undefined, now)).toBe(false);
  });

  it('uses 1 / 3 / 7 / 21 days', () => {
    expect(REVIEW_INTERVAL_DAYS).toEqual({ forgot: 1, hard: 3, good: 7, easy: 21 });
  });
});

describe('search', () => {
  const search = createSearcher(buildSearchIndex([], lcOutline.problems));

  it('finds a problem by its number', () => {
    expect(search('27')[0]?.id).toBe('lc-27-remove-element');
  });

  it('finds problems by a word from the title or pattern', () => {
    const ids = search('merge').map((item) => item.id);
    expect(ids).toContain('lc-88-merge-sorted-array');
    expect(ids).toContain('lc-912-sort-an-array');
  });

  it('can be limited to LeetCode problems', () => {
    expect(search('binary', { type: 'problem' }).every((i) => i.type === 'problem')).toBe(true);
  });
});

describe('problem page', () => {
  beforeEach(() => useLcSessionStore.setState({ revealed: {}, showEverything: false }));

  function renderPage() {
    const router = createMemoryRouter(
      [
        {
          path: '/leetcode/:category/:slug',
          loader: () => ({ problem: removeElement }),
          Component: LcProblemPage,
        },
      ],
      { initialEntries: ['/leetcode/dsa/27-remove-element'] },
    );
    return render(<RouterProvider router={router} />);
  }

  it('shows only the problem until each stage is revealed in order', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Remove Element');

    // Nothing from later stages is in the page yet.
    expect(screen.queryByText(/এক লাইনে মনে রাখো/)).toBeNull();
    expect(document.body.textContent).not.toContain('var removeElement');
    expect(screen.queryByRole('button', { name: 'Reveal solution' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Reveal approach' }));
    expect(screen.getByText(/এক লাইনে মনে রাখো/)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('var removeElement');

    await user.click(screen.getByRole('button', { name: 'Reveal breakdown' }));
    await user.click(screen.getByRole('button', { name: 'Reveal solution' }));
    expect(await screen.findByRole('tab', { name: /My solution/ })).toBeInTheDocument();
  });

  it('"Show everything" opens every stage', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('checkbox', { name: 'Show everything' }));
    expect(await screen.findByRole('tab', { name: /My solution/ })).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'How well did you remember it?' }),
    ).toBeInTheDocument();
  });
});

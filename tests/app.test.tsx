import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { Providers } from '@/app/providers';
import { routes } from '@/app/router';
import { usePracticeStore } from '@/features/practice/store';
import { useProgressStore } from '@/features/progress/store';
import { useUiStore } from '@/features/ui/store';
import python from '@/content/python';
import typescript from '@/content/typescript';

// Expected counts come from the content, so these tests survive content growth.
const pyBasics = python.sections.find((s) => s.id === 'py-basics')!;
const tsBasics = typescript.sections.find((s) => s.id === 'ts-basics')!;
const [firstPy, secondPy] = pyBasics.questions;
const tsIntermediate = tsBasics.questions.filter((q) => q.level === 'intermediate').length;

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const view = render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { ...view, router };
}

beforeEach(() => {
  useProgressStore.getState().resetProgress();
  usePracticeStore.setState({ practiceMode: false });
  useUiStore.setState({ searchOpen: false, shortcutsOpen: false, mobileNavOpen: false });
});

describe('app routes', () => {
  it('renders the home page with every registered track', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    for (const name of ['Python', 'JavaScript', 'TypeScript']) {
      expect((await screen.findAllByText(name)).length).toBeGreaterThan(0);
    }
    expect(await screen.findByText('Questions learned')).toBeInTheDocument();
  });

  it('renders a section page with its questions and breadcrumbs', async () => {
    renderAt('/python/py-basics');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Basics & Data Types' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Show answer' })).toHaveLength(
      pyBasics.questions.length,
    );
  });

  it('shows the not-found page for an unknown track, section and path', async () => {
    for (const path of ['/rust', '/python/nope', '/python/q/nope', '/a/b/c/d']) {
      const view = renderAt(path);
      expect(await screen.findByText('Page not found')).toBeInTheDocument();
      view.unmount();
    }
  });
});

describe('question card', () => {
  it('reveals a tabbed answer and only shows tabs that have content', async () => {
    const user = userEvent.setup();
    renderAt('/python/py-basics');
    const [first] = await screen.findAllByRole('button', { name: 'Show answer' });
    await user.click(first!);

    // The answer panel is a lazy chunk, so wait for it.
    const tabs = (await screen.findAllByRole('tab')).map((tab) => tab.textContent);
    expect(tabs[0]).toBe('Interview Answer');
    expect(tabs).toContain('ব্যাখ্যা');
    expect(tabs.some((label) => label?.startsWith('Code'))).toBe(true);
    // This question links a visualization, so the Visualize tab appears.
    expect(tabs).toContain('Visualize');

    await user.click(screen.getByRole('tab', { name: /Code/ }));
    expect(screen.getAllByText('Output').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Copy code' }).length).toBeGreaterThan(0);
  });

  it('tracks learned and bookmarked state', async () => {
    const user = userEvent.setup();
    renderAt('/python/py-basics');
    const [checkbox] = await screen.findAllByRole('checkbox', { name: 'Mark as learned' });
    await user.click(checkbox!);
    expect(useProgressStore.getState().learned).toEqual({ [firstPy!.id]: true });

    const [bookmark] = screen.getAllByRole('button', { name: 'Bookmark this question' });
    await user.click(bookmark!);
    expect(Object.keys(useProgressStore.getState().bookmarks)).toEqual([firstPy!.id]);
  });

  it('opens the answer on a deep link, but not in practice mode', async () => {
    const first = renderAt('/javascript/q/js-null-vs-undefined');
    expect(await screen.findByRole('button', { name: 'Hide answer' })).toBeInTheDocument();
    first.unmount();

    usePracticeStore.setState({ practiceMode: true });
    renderAt('/javascript/q/js-null-vs-undefined');
    expect(await screen.findByRole('button', { name: 'Show answer' })).toBeInTheDocument();
  });
});

describe('section page', () => {
  it('filters by level and priority through the URL', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/typescript/ts-basics');
    await screen.findByRole('heading', { level: 1, name: 'Basics' });
    const filters = screen.getByRole('group', { name: 'Filter questions' });

    await user.click(within(filters).getByRole('button', { name: /Intermediate/ }));
    // Filter changes are router navigations, so wait for the transition to land.
    expect(
      await screen.findByText(
        `Showing ${tsIntermediate} of ${tsBasics.questions.length} questions`,
      ),
    ).toBeInTheDocument();
    expect(router.state.location.search).toBe('?level=intermediate');
    expect(screen.getAllByRole('button', { name: 'Show answer' })).toHaveLength(tsIntermediate);

    await user.click(within(filters).getByRole('button', { name: /^All\s*\d+$/ }));
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Show answer' })).toHaveLength(
        tsBasics.questions.length,
      ),
    );
  });

  it('expands all answers, and practice mode hides them again', async () => {
    const user = userEvent.setup();
    renderAt('/python/py-basics');
    await user.click(await screen.findByRole('button', { name: 'Expand all' }));
    expect(screen.getAllByRole('button', { name: 'Hide answer' })).toHaveLength(
      pyBasics.questions.length,
    );

    await user.click(screen.getByRole('button', { name: 'Practice mode' }));
    expect(screen.getAllByRole('button', { name: 'Show answer' })).toHaveLength(
      pyBasics.questions.length,
    );
    expect(screen.queryByRole('button', { name: 'Expand all' })).not.toBeInTheDocument();
  });

  it('toggles the current answer with Space and moves with j', async () => {
    const user = userEvent.setup();
    renderAt('/python/py-basics');
    await screen.findAllByRole('button', { name: 'Show answer' });

    await user.keyboard('j');
    expect(document.activeElement?.id).toBe(firstPy!.id);
    await user.keyboard('j');
    expect(document.activeElement?.id).toBe(secondPy!.id);
    await user.keyboard(' ');
    expect(screen.getAllByRole('button', { name: 'Hide answer' })).toHaveLength(1);
  });
});

describe('exercise page', () => {
  it('reveals hints one at a time and hides the solution until asked', async () => {
    const user = userEvent.setup();
    renderAt('/python/exercises/py-ex-palindrome');
    await screen.findByRole('heading', { level: 1, name: 'Valid palindrome' });

    expect(screen.queryByText('Two pointers')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Show a hint/ }));
    await user.click(screen.getByRole('button', { name: /Show next hint/ }));
    await user.click(screen.getByRole('button', { name: /Show next hint/ }));
    expect(screen.getByText('All 3 hints shown.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Show 2 solutions/ }));
    expect(screen.getByRole('tab', { name: 'Two pointers' })).toBeInTheDocument();
    expect(screen.getAllByText('O(n)').length).toBeGreaterThan(0);
  });
});

describe('search and shortcuts', () => {
  it('opens the command palette with Ctrl+K and navigates to a result', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/');
    await screen.findByRole('heading', { level: 1 });

    await user.keyboard('{Control>}k{/Control}');
    const input = await screen.findByPlaceholderText(/Search questions/);
    await user.type(input, 'palindrome');
    // Python is first in registry order, so its palindrome exercise is the first match.
    const [option] = await screen.findAllByRole('option', { name: /Valid palindrome/ });
    await user.click(option!);

    expect(router.state.location.pathname).toBe('/python/exercises/py-ex-palindrome');
  });

  it('opens the shortcuts dialog with ?', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await screen.findByRole('heading', { level: 1 });
    await user.keyboard('?');
    expect(await screen.findByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
  });
});

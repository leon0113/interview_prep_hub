import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CodeBlock } from '@/components/question/CodeBlock';
import { SqlRunnerContext } from '@/features/sql/context';

const RUN = { name: 'Run this query in your browser' };

function renderBlock(props: Partial<Parameters<typeof CodeBlock>[0]>, track: string | null) {
  return render(
    <MemoryRouter>
      <SqlRunnerContext value={track}>
        <CodeBlock lang="sql" code="SELECT 1;" {...props} />
      </SqlRunnerContext>
    </MemoryRouter>,
  );
}

describe('Run button on SQL code blocks', () => {
  it('appears on SQL when the current track has a sample database', () => {
    renderBlock({}, 'sql');
    expect(screen.getByRole('button', RUN)).toBeInTheDocument();
  });

  it('does not appear outside such a track, for other languages, or when disabled', () => {
    const { unmount } = renderBlock({}, null);
    expect(screen.queryByRole('button', RUN)).toBeNull();
    unmount();
    const other = renderBlock({ lang: 'python', code: 'print(1)' }, 'sql');
    expect(screen.queryByRole('button', RUN)).toBeNull();
    other.unmount();
    renderBlock({ runnable: false }, 'sql');
    expect(screen.queryByRole('button', RUN)).toBeNull();
  });
});

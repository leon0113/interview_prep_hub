import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CodeBlock } from '@/components/question/CodeBlock';
import { ResultTable } from '@/components/question/ResultTable';
import { CodeExampleSchema, ExerciseSchema } from '@/content/schema';

const table = {
  columns: ['id', 'name', 'email', 'salary', 'active'],
  rows: [
    [1, 'Dr. Rahman', 'rahman@clinic.test', 182000, true],
    [2, 'Dr. Akter', null, 150000, false],
  ],
};

describe('ResultTable', () => {
  it('renders headers, rows, a NULL badge and the row count', () => {
    render(<ResultTable {...table} note="Ordered by id." />);
    const region = screen.getByRole('region', { name: 'Query result, 2 rows' });
    const headers = within(region)
      .getAllByRole('columnheader')
      .map((th) => th.textContent);
    expect(headers).toEqual(['id', 'name', 'email', 'salary', 'active']);
    expect(within(region).getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('NULL')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('(2 rows)')).toBeInTheDocument();
    expect(screen.getByText('Ordered by id.')).toBeInTheDocument();
  });

  it('right-aligns numeric columns only', () => {
    render(<ResultTable {...table} />);
    const [id, name, , salary] = screen.getAllByRole('columnheader');
    expect(id).toHaveClass('text-right');
    expect(salary).toHaveClass('text-right');
    expect(name).toHaveClass('text-left');
  });

  it('says "(1 row)" and handles an empty result', () => {
    const { rerender } = render(<ResultTable columns={['n']} rows={[[1]]} />);
    expect(screen.getByText('(1 row)')).toBeInTheDocument();
    rerender(<ResultTable columns={['n']} rows={[]} />);
    expect(screen.getByText('(0 rows)')).toBeInTheDocument();
  });

  it('is shown under SQL code in a CodeBlock, with SQL highlighting', () => {
    const { container } = render(
      <CodeBlock lang="sql" code="SELECT id, name FROM doctors;" resultTable={table} />,
    );
    expect(screen.getByText('SQL')).toBeInTheDocument();
    expect(screen.getByText('Result')).toBeInTheDocument();
    expect(container.querySelector('.token.keyword')?.textContent).toBe('SELECT');
  });
});

describe('result table schema', () => {
  it('rejects rows whose width differs from the columns', () => {
    const result = CodeExampleSchema.safeParse({
      lang: 'sql',
      code: 'SELECT 1, 2;',
      resultTable: { columns: ['a', 'b'], rows: [[1]] },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('row 1 has 1 cells, expected 2');
  });

  it('requires an exercise sample run to show an output or a result table', () => {
    const exercise = {
      id: 'sql-ex-demo',
      title: 'Demo',
      level: 'foundation',
      category: 'logic',
      tags: ['demo'],
      prompt: 'Demo',
      examples: [],
      hints: ['Hint'],
      solutions: [{ label: 'Query', code: 'SELECT 1;' }],
      explanationBn: 'ডেমো',
    };
    expect(
      ExerciseSchema.safeParse({ ...exercise, sampleRun: { code: 'SELECT 1;' } }).success,
    ).toBe(false);
    expect(
      ExerciseSchema.safeParse({
        ...exercise,
        sampleRun: { code: 'SELECT 1;', resultTable: { columns: ['?column?'], rows: [[1]] } },
      }).success,
    ).toBe(true);
  });
});

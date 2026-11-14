import { PageHeader } from '@/components/common/PageHeader';
import { CodeBlock } from '@/components/question/CodeBlock';
import { ResultTable } from '@/components/question/ResultTable';

/*
 * Development-only page (registered only when import.meta.env.DEV) for reviewing shared
 * components in both themes and at every width. The fixtures below are preview data, not app
 * content, and are not part of production builds.
 */
const WIDE = {
  columns: ['id', 'name', 'department_id', 'manager_id', 'salary', 'hire_date', 'email', 'active'],
  rows: [
    [1, 'Dr. Nusrat Rahman', 1, null, 182000, '2014-03-01', 'n.rahman@clinic.test', true],
    [2, 'Dr. Arif Hossain', 1, 1, 150000, '2017-06-15', null, true],
    [3, 'Dr. Mitu Akter', null, 1, 150000, '2019-01-20', 'm.akter@clinic.test', false],
  ],
};

export default function ComponentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Development only"
        title="Component preview"
        description="Shared components with preview data. This page is not included in production builds."
      />
      <section className="space-y-3">
        <h2 className="font-semibold">SQL code block with a result table</h2>
        <CodeBlock
          lang="sql"
          code={`SELECT d.id, d.name, d.department_id, d.manager_id, d.salary, d.hire_date, d.email, d.active
FROM doctors AS d
WHERE d.salary >= 150000 -- ties on purpose
ORDER BY d.id;`}
          resultTable={{ ...WIDE, note: 'NULL department_id: a doctor without a department.' }}
          caption="A wide result scrolls sideways on phones; NULL is a badge, not text."
        />
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Command output (no rows)</h2>
        <CodeBlock
          lang="sql"
          code="UPDATE doctors SET salary = salary * 1.05 WHERE id = 3;"
          output="UPDATE 1"
        />
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Standalone, empty and single-row results</h2>
        <ResultTable standalone columns={['count']} rows={[[0]]} />
        <ResultTable
          standalone
          columns={['name', 'city']}
          rows={[]}
          note="Every patient has a city."
        />
      </section>
    </div>
  );
}

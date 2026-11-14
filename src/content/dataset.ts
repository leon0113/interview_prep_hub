import type { Dataset, DatasetColumn, DatasetTable } from './schema';

/*
 * Helpers for a track's sample database (src/content/<track>/dataset.ts). The dataset's
 * tables and rows are the single source of truth; the seed script is generated from them, so
 * the Sample Database page, the seed users copy, and the database the examples are verified
 * against can never drift apart.
 */

type Cell = DatasetTable['rows'][number][number];

/** Identity helper so dataset files get type checking without importing zod. */
export function defineDataset(dataset: Dataset): Dataset {
  return dataset;
}

const isJson = (column: DatasetColumn) => /^jsonb?$/i.test(column.type);

/** One value as a SQL literal, typed by its column. */
export function sqlLiteral(value: Cell, column: DatasetColumn): string {
  if (value === null) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return String(value);
  const quoted = `'${value.replaceAll("'", "''")}'`;
  return isJson(column) ? `${quoted}::${column.type.toLowerCase()}` : quoted;
}

function columnDefinition(column: DatasetColumn, width: number): string {
  const parts = [column.name.padEnd(width), column.type];
  if (column.constraints) parts.push(column.constraints);
  if (column.references) {
    const { table, column: target, onDelete } = column.references;
    parts.push(`REFERENCES ${table} (${target})${onDelete ? ` ON DELETE ${onDelete}` : ''}`);
  }
  return parts.join(' ');
}

function createTable(table: DatasetTable): string {
  const width = Math.max(...table.columns.map((column) => column.name.length));
  const columns = table.columns.map((column) => `  ${columnDefinition(column, width)}`);
  return `CREATE TABLE ${table.name} (\n${columns.join(',\n')}\n);`;
}

function insertRows(table: DatasetTable): string {
  if (table.rows.length === 0) return '';
  const names = table.columns.map((column) => column.name).join(', ');
  const values = table.rows.map(
    (row) => `  (${row.map((value, i) => sqlLiteral(value, table.columns[i]!)).join(', ')})`,
  );
  return `INSERT INTO ${table.name} (${names}) VALUES\n${values.join(',\n')};`;
}

/**
 * Identity columns are seeded with explicit ids; move their sequences past the highest id so
 * a later `INSERT` without an id does not collide.
 */
function resetIdentity(table: DatasetTable): string[] {
  return table.columns
    .filter((column) => /\bIDENTITY\b/i.test(column.constraints ?? ''))
    .map(
      (column) =>
        `SELECT setval(pg_get_serial_sequence('${table.name}', '${column.name}'), (SELECT max(${column.name}) FROM ${table.name}));`,
    );
}

/** The full CREATE + INSERT script for a dataset (tables in dependency order, as written). */
export function buildSeedSql(dataset: Dataset): string {
  const header = `-- ${dataset.title} (${dataset.dialect})\n-- ${dataset.description}`;
  const enums = dataset.enums.map(
    (e) => `CREATE TYPE ${e.name} AS ENUM (${e.values.map((v) => `'${v}'`).join(', ')});`,
  );
  const blocks = dataset.tables.map((table) =>
    [createTable(table), insertRows(table), ...resetIdentity(table)].filter(Boolean).join('\n\n'),
  );
  return [header, ...enums, ...blocks].join('\n\n') + '\n';
}

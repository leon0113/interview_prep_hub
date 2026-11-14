/**
 * Splits a SQL script into statements the way psql does: on `;` outside of string literals,
 * quoted identifiers, dollar-quoted bodies (`$$ … $$`, `$fn$ … $fn$`) and comments.
 *
 * Statements are run one by one (like psql) rather than as a single multi-statement query, so
 * an error does not silently skip the rest, and commands such as VACUUM or
 * CREATE INDEX CONCURRENTLY are not wrapped in an implicit transaction.
 */
export function splitStatements(script: string): string[] {
  const statements: string[] = [];
  let start = 0;
  let i = 0;
  const n = script.length;

  const push = (end: number) => {
    const text = script.slice(start, end).trim();
    if (stripComments(text).trim()) statements.push(text);
  };

  while (i < n) {
    const ch = script[i]!;
    const next = script[i + 1];

    if (ch === '-' && next === '-') {
      const end = script.indexOf('\n', i);
      i = end === -1 ? n : end + 1;
    } else if (ch === '/' && next === '*') {
      // Postgres block comments nest.
      let depth = 1;
      i += 2;
      while (i < n && depth > 0) {
        if (script[i] === '/' && script[i + 1] === '*') {
          depth++;
          i += 2;
        } else if (script[i] === '*' && script[i + 1] === '/') {
          depth--;
          i += 2;
        } else i++;
      }
    } else if (ch === "'" || ch === '"') {
      // '' or "" inside a literal is an escaped quote: skipping pairs handles it.
      i++;
      while (i < n) {
        if (script[i] === ch && script[i + 1] === ch) i += 2;
        else if (script[i] === ch) {
          i++;
          break;
        } else i++;
      }
    } else if (ch === '$') {
      const tag = /^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/.exec(script.slice(i))?.[0];
      if (tag) {
        const end = script.indexOf(tag, i + tag.length);
        i = end === -1 ? n : end + tag.length;
      } else i++;
    } else if (ch === ';') {
      push(i);
      start = i + 1;
      i++;
    } else i++;
  }
  push(n);
  return statements;
}

/** Removes `--` and `/* … *\/` comments (used to ignore comment-only fragments). */
export function stripComments(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '');
}

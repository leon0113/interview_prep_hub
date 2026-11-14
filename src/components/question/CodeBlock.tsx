import { Highlight } from 'prism-react-renderer';
import type { CodeLang, ResultTable as ResultTableData } from '@/content/schema';
import { useSqlRunnerTrack } from '@/features/sql/context';
import { useSqlRun } from '@/features/sql/useSqlRun';
import { codeTheme, LANG_LABEL, PRISM_LANG } from './codeTheme';
import { CopyButton } from './CopyButton';
import { LiveSqlResult, RunSqlButton } from './LiveSqlResult';
import { OutputBlock } from './OutputBlock';
import { ResultTable } from './ResultTable';

interface CodeBlockProps {
  code: string;
  lang: CodeLang;
  caption?: string;
  /** Printed result of the code; rendered as a visually distinct block underneath. */
  output?: string;
  /** Rows returned by a query (SQL); rendered as a table underneath. */
  resultTable?: ResultTableData;
  /** SQL only: offer "Run" when the track has a sample database (default true). */
  runnable?: boolean;
}

/** Syntax-highlighted code with a copy button, optional output and caption. */
export function CodeBlock({
  code,
  lang,
  caption,
  output,
  resultTable,
  runnable = true,
}: CodeBlockProps) {
  const source = code.replace(/\s+$/, '');
  // SQL examples can run in the browser against the track's sample database.
  const sqlTrack = useSqlRunnerTrack();
  const canRun = runnable && lang === 'sql' && sqlTrack !== null;
  const sql = useSqlRun(canRun ? sqlTrack : null, 'examples');

  return (
    <figure className="overflow-hidden rounded-xl border border-border">
      <div className="flex h-11 items-center justify-between border-b border-border bg-surface-2 pr-1 pl-3.5 text-[0.6875rem] font-medium tracking-wide text-subtle uppercase lg:h-9">
        <span className="flex-1">{LANG_LABEL[lang]}</span>
        {canRun ? (
          <RunSqlButton state={sql.state} onRun={() => sql.run(source, { reset: true })} />
        ) : null}
        <CopyButton text={source} />
      </div>
      <Highlight theme={codeTheme} code={source} language={PRISM_LANG[lang]}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre
            tabIndex={0}
            className="scrollbar-thin overflow-x-auto bg-surface p-3.5 text-[0.8125rem] leading-[1.7]"
          >
            <code className="inline-block min-w-full">
              {tokens.map((line, lineIndex) => (
                <div key={lineIndex} {...getLineProps({ line })}>
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
      {resultTable ? <ResultTable {...resultTable} /> : null}
      {output !== undefined ? <OutputBlock output={output} /> : null}
      {canRun && sqlTrack ? (
        <LiveSqlResult state={sql.state} code={source} trackSlug={sqlTrack} onClose={sql.clear} />
      ) : null}
      {caption ? (
        <figcaption className="border-t border-border px-3.5 py-2 text-xs leading-5 text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

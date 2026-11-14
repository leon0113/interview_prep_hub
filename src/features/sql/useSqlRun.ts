import { useCallback, useState } from 'react';
import type { RunResult } from '@/lib/sql/session';
import { getSqlSession, isSqlSessionStarted, type SqlPurpose } from './browserSession';

export type SqlRunState =
  | { status: 'idle' }
  | { status: 'starting' }
  | { status: 'running' }
  | { status: 'done'; result: RunResult; fresh: boolean }
  | { status: 'failed'; message: string };

/** Runs SQL in the in-browser database for a track; `reset` starts from a fresh seed. */
export function useSqlRun(trackSlug: string | null, purpose: SqlPurpose) {
  const [state, setState] = useState<SqlRunState>({ status: 'idle' });

  const run = useCallback(
    async (sql: string, { reset = false }: { reset?: boolean } = {}) => {
      if (!trackSlug) return;
      setState({ status: isSqlSessionStarted(trackSlug, purpose) ? 'running' : 'starting' });
      try {
        const session = await getSqlSession(trackSlug, purpose);
        setState({ status: 'running' });
        if (reset) await session.reset();
        const result = await session.run(sql);
        setState({ status: 'done', result, fresh: reset });
      } catch (error) {
        setState({
          status: 'failed',
          message: error instanceof Error ? error.message : 'Could not start PostgreSQL.',
        });
      }
    },
    [trackSlug, purpose],
  );

  const resetDatabase = useCallback(async () => {
    if (!trackSlug) return;
    const session = await getSqlSession(trackSlug, purpose);
    await session.reset();
  }, [trackSlug, purpose]);

  const clear = useCallback(() => setState({ status: 'idle' }), []);
  return { state, run, resetDatabase, clear };
}

import { loadDataset } from '@/content/loader';
import type { SqlSession } from '@/lib/sql/session';

/**
 * In-browser PostgreSQL (PGlite) for a track's sample database. Nothing here is loaded until
 * the first Run or Playground visit: PGlite (~4 MB of WebAssembly) is a dynamic import.
 *
 * Two databases per track:
 * - 'examples': reset before every Run, so a code block always reproduces its shown result;
 * - 'playground': keeps your changes until you press Reset.
 */
export type SqlPurpose = 'examples' | 'playground';

const sessions = new Map<string, Promise<SqlSession>>();

export function getSqlSession(trackSlug: string, purpose: SqlPurpose): Promise<SqlSession> {
  const key = `${trackSlug}:${purpose}`;
  let session = sessions.get(key);
  if (!session) {
    session = (async () => {
      const [{ PGlite, protocol }, { createSqlSession }, { buildSeedSql }, dataset] =
        await Promise.all([
          import('@electric-sql/pglite'),
          import('@/lib/sql/session'),
          import('@/content/dataset'),
          loadDataset(trackSlug),
        ]);
      if (!dataset) throw new Error(`Track "${trackSlug}" has no sample database`);
      const pg = await PGlite.create();
      const created = createSqlSession(pg, protocol, buildSeedSql(dataset));
      await created.reset();
      return created;
    })();
    // A failed start (e.g. offline) can be retried.
    session.catch(() => sessions.delete(key));
    sessions.set(key, session);
  }
  return session;
}

/** True once a database for this track/purpose has been started in this tab. */
export function isSqlSessionStarted(trackSlug: string, purpose: SqlPurpose): boolean {
  return sessions.has(`${trackSlug}:${purpose}`);
}

import { createContext, useContext } from 'react';

/**
 * The slug of the current track when it has a sample database (so SQL code blocks can offer
 * Run), else null. Provided by AppShell; a context keeps CodeBlock usable outside the router.
 */
export const SqlRunnerContext = createContext<string | null>(null);

export const useSqlRunnerTrack = () => useContext(SqlRunnerContext);

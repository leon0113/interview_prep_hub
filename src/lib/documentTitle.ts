import { useEffect } from 'react';

export const SITE_NAME = 'Interview Prep Hub';

/** Keeps `document.title` in sync on client-side navigation. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

/**
 * "Page · Track — Interview Prep Hub" from breadcrumb labels (Home first). Shared with the
 * prerender script, which writes the same title into each page's static HTML.
 */
export function titleFromCrumbs(labels: readonly string[]): string {
  const [, track, ...rest] = labels;
  const page = rest.at(-1);
  if (!track) return SITE_NAME;
  return `${page ? `${page} · ${track}` : track} — ${SITE_NAME}`;
}

import { useMatches, useRouteLoaderData } from 'react-router';
import { getTrackMeta } from '@/content/loader';
import type { TrackOutline } from '@/content/outline';
import type { TrackMeta } from '@/content/schema';

/** Id of the `/:trackSlug` route whose loader resolves the track outline. */
export const TRACK_ROUTE_ID = 'track';

export interface RouteParams {
  trackSlug?: string;
  sectionId?: string;
  questionId?: string;
  exerciseId?: string;
}

/** Params of the deepest matched route — usable from layout components too. */
export function useRouteParams(): RouteParams {
  const matches = useMatches();
  return (matches.at(-1)?.params ?? {}) as RouteParams;
}

/**
 * The track outline (titles, ids, levels — no answers) for pages under `/:trackSlug`.
 * Pages that need full content get it from their own route loader.
 */
export function useTrack(): TrackOutline {
  const track = useRouteLoaderData(TRACK_ROUTE_ID) as TrackOutline | undefined;
  if (!track) throw new Error('useTrack must be used under the /:trackSlug route');
  return track;
}

/** Like useTrack, but returns undefined outside a track route (for the shell). */
export function useOptionalTrack(): TrackOutline | undefined {
  return useRouteLoaderData(TRACK_ROUTE_ID) as TrackOutline | undefined;
}

export function useCurrentTrackMeta(): TrackMeta | undefined {
  return getTrackMeta(useRouteParams().trackSlug);
}

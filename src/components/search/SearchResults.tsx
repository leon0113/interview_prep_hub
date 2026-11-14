import { Command } from 'cmdk';
import { CircleHelp, Dumbbell, FolderOpen, Zap, type LucideIcon } from 'lucide-react';
import { use, useMemo } from 'react';
import { TrackIcon } from '@/components/common/TrackIcon';
import { LevelBadge } from '@/components/question/LevelBadge';
import { getTrackMeta, loadAllOutlines, trackMetas } from '@/content/loader';
import {
  buildSearchIndex,
  createSearcher,
  groupByTrack,
  TYPE_LABEL,
  type SearchFilters,
  type SearchItem,
  type SearchItemType,
} from '@/features/search';
import { useRouteParams } from '@/features/tracks/useTrack';

const TYPE_ICON: Record<SearchItemType, LucideIcon> = {
  section: FolderOpen,
  question: CircleHelp,
  exercise: Dumbbell,
  concept: Zap,
};

const TRACK_ORDER = trackMetas.map((meta) => meta.slug);

interface SearchResultsProps {
  query: string;
  filters: SearchFilters;
  onSelect: (item: SearchItem) => void;
}

/** Result list for the command palette, grouped by track. Suspends until all tracks are loaded. */
export function SearchResults({ query, filters, onSelect }: SearchResultsProps) {
  const tracks = use(loadAllOutlines());
  const { trackSlug } = useRouteParams();
  const search = useMemo(() => createSearcher(buildSearchIndex(tracks)), [tracks]);
  // The track you are reading comes first, so Enter picks the match you most likely meant.
  const order = useMemo(
    () =>
      trackSlug ? [trackSlug, ...TRACK_ORDER.filter((slug) => slug !== trackSlug)] : TRACK_ORDER,
    [trackSlug],
  );
  const groups = useMemo(
    () => groupByTrack(search(query, filters), order),
    [search, query, filters, order],
  );

  if (groups.length === 0) {
    return (
      <Command.Empty className="px-3 py-10 text-center text-sm text-muted">
        No results{query.trim() ? ` for “${query.trim()}”` : ''}. Try fewer words or clear the
        filters.
      </Command.Empty>
    );
  }

  return groups.map(({ trackSlug, items }) => {
    const meta = getTrackMeta(trackSlug);
    if (!meta) return null;
    return (
      <Command.Group
        key={trackSlug}
        data-accent={meta.accent}
        heading={
          <span className="flex items-center gap-2 px-2 pt-2 pb-1.5 text-xs font-semibold text-muted">
            <TrackIcon meta={meta} size="sm" className="size-5" />
            {meta.name}
            <span className="font-normal text-subtle tabular-nums">{items.length}</span>
          </span>
        }
      >
        {items.map((item) => {
          const Icon = TYPE_ICON[item.type];
          return (
            <Command.Item
              key={item.id}
              value={item.id}
              onSelect={() => onSelect(item)}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 data-[selected=true]:bg-accent-soft"
            >
              <Icon className="size-4 shrink-0 text-subtle" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm leading-5 font-medium sm:line-clamp-1">
                  {item.title}
                </span>
                <span className="block truncate text-xs text-muted">
                  {item.type === 'question' ? item.context : TYPE_LABEL[item.type]}
                </span>
              </span>
              {item.level ? <LevelBadge level={item.level} className="shrink-0" /> : null}
            </Command.Item>
          );
        })}
      </Command.Group>
    );
  });
}

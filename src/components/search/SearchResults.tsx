import { Command } from 'cmdk';
import {
  BookOpenText,
  CircleHelp,
  Code2,
  Container,
  Dumbbell,
  FolderOpen,
  ListChecks,
  Network,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { use, useMemo } from 'react';
import { TrackIcon } from '@/components/common/TrackIcon';
import { DifficultyBadge } from '@/components/leetcode/badges';
import { LevelBadge } from '@/components/question/LevelBadge';
import { lcOutline } from '@/content/leetcode/loader';
import { guideMetas, loadGuideSearchEntries } from '@/content/guides';
import { topicMetas } from '@/content/leetcode/topics';
import { getTrackMeta, loadAllOutlines, trackMetas } from '@/content/loader';
import {
  buildSearchIndex,
  createSearcher,
  groupByTrack,
  guideGroup,
  LEETCODE_GROUP,
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
  problem: Code2,
  topic: Network,
  recipe: ListChecks,
  'guide-section': BookOpenText,
};

// Guides come before the tracks: their recipes only match tool words ("compose", "mongodb").
const TRACK_ORDER = [
  ...guideMetas.map((g) => guideGroup(g.id)),
  ...trackMetas.map((meta) => meta.slug),
  LEETCODE_GROUP,
];

interface SearchResultsProps {
  query: string;
  filters: SearchFilters;
  onSelect: (item: SearchItem) => void;
}

/** Result list for the command palette, grouped by track. Suspends until all tracks are loaded. */
export function SearchResults({ query, filters, onSelect }: SearchResultsProps) {
  const tracks = use(loadAllOutlines());
  const guideEntries = use(loadGuideSearchEntries());
  const { trackSlug, guideId } = useRouteParams();
  const search = useMemo(
    () => createSearcher(buildSearchIndex(tracks, lcOutline.problems, topicMetas, guideEntries)),
    [tracks, guideEntries],
  );
  // The track (or guide) you are reading comes first, so Enter picks the match you most
  // likely meant.
  const current = trackSlug ?? (guideId ? guideGroup(guideId) : undefined);
  const order = useMemo(
    () => (current ? [current, ...TRACK_ORDER.filter((slug) => slug !== current)] : TRACK_ORDER),
    [current],
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
    const isLeetCode = trackSlug === LEETCODE_GROUP;
    const guide = guideMetas.find((g) => guideGroup(g.id) === trackSlug);
    if (!meta && !isLeetCode && !guide) return null;
    const GroupIcon = guide ? Container : Code2;
    return (
      <Command.Group
        key={trackSlug}
        data-accent={meta?.accent ?? guide?.accent ?? 'violet'}
        heading={
          <span className="flex items-center gap-2 px-2 pt-2 pb-1.5 text-xs font-semibold text-muted">
            {meta ? (
              <TrackIcon meta={meta} size="sm" className="size-5" />
            ) : (
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-accent-soft text-accent-text">
                <GroupIcon className="size-3.5" aria-hidden />
              </span>
            )}
            {meta?.name ?? guide?.title ?? 'LeetCode'}
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
                  {item.type === 'question' || item.type === 'problem'
                    ? item.context
                    : item.type === 'recipe' || item.type === 'guide-section'
                      ? `${TYPE_LABEL[item.type]} · ${item.context}`
                      : TYPE_LABEL[item.type]}
                </span>
              </span>
              {item.level ? <LevelBadge level={item.level} className="shrink-0" /> : null}
              {item.difficulty ? (
                <DifficultyBadge difficulty={item.difficulty} className="shrink-0" />
              ) : null}
            </Command.Item>
          );
        })}
      </Command.Group>
    );
  });
}

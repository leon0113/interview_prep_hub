import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { Search, X } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useNavigate } from 'react-router';
import { Kbd } from '@/components/common/KeyboardHint';
import { Chip, ChipDivider } from '@/components/ui/chip';
import { LEVELS } from '@/content/constants';
import { trackMetas } from '@/content/loader';
import type { SearchFilters, SearchItem } from '@/features/search';
import { useUiStore } from '@/features/ui/store';
import { LEVEL_LABEL } from '@/lib/content';
import { SearchResults } from './SearchResults';

const TYPE_OPTIONS: { value: NonNullable<SearchFilters['type']>; label: string }[] = [
  { value: 'question', label: 'Questions' },
  { value: 'exercise', label: 'Exercises' },
  { value: 'problem', label: 'LeetCode' },
  { value: 'guide', label: 'Docker & guides' },
];

/** Search dialog: fuzzy results grouped by track, with track / level / type filter chips. */
export default function CommandPaletteDialog() {
  const open = useUiStore((state) => state.searchOpen);
  const setOpen = useUiStore((state) => state.setSearchOpen);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  function toggle<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery('');
  }

  function onSelect(item: SearchItem) {
    onOpenChange(false);
    navigate(item.path);
  }

  const hasFilters = Boolean(filters.track || filters.level || filters.type);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=closed]:animate-[overlay-out_120ms_ease-in] data-[state=open]:animate-[overlay-in_150ms_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-2 top-2 z-50 mx-auto flex max-h-[calc(100dvh-1rem)] max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-pop outline-none data-[state=open]:animate-[overlay-in_150ms_ease-out] sm:top-[10vh] sm:max-h-[min(36rem,80vh)]"
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <Command
            shouldFilter={false}
            loop
            label="Search"
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex items-center gap-2.5 border-b border-border pr-1.5 pl-4">
              <Search className="size-[1.125rem] shrink-0 text-subtle" aria-hidden />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search questions, problems, Docker recipes…"
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-subtle"
              />
              <Dialog.Close
                aria-label="Close search"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
              >
                <X className="size-5 sm:hidden" aria-hidden />
                <Kbd className="hidden sm:inline-flex">Esc</Kbd>
              </Dialog.Close>
            </div>

            <div
              role="group"
              aria-label="Filter results"
              className="flex shrink-0 scrollbar-none items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-2"
            >
              {trackMetas.map((meta) => (
                <Chip
                  key={meta.slug}
                  data-accent={meta.accent}
                  selected={filters.track === meta.slug}
                  onClick={() => toggle('track', meta.slug)}
                  className="h-9"
                >
                  {meta.name}
                </Chip>
              ))}
              <ChipDivider />
              {LEVELS.map((level) => (
                <Chip
                  key={level}
                  selected={filters.level === level}
                  onClick={() => toggle('level', level)}
                  className="h-9"
                >
                  {LEVEL_LABEL[level]}
                </Chip>
              ))}
              <ChipDivider />
              {TYPE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={filters.type === option.value}
                  onClick={() => toggle('type', option.value)}
                  className="h-9"
                >
                  {option.label}
                </Chip>
              ))}
              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => setFilters({})}
                  className="h-9 shrink-0 rounded-full px-2.5 text-xs font-medium text-muted hover:text-fg"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <Command.List className="min-h-0 flex-1 scrollbar-thin overflow-y-auto overscroll-contain p-2">
              <Suspense
                fallback={
                  <Command.Loading>
                    <p className="px-3 py-8 text-center text-sm text-muted">Loading content…</p>
                  </Command.Loading>
                }
              >
                <SearchResults query={query} filters={filters} onSelect={onSelect} />
              </Suspense>
            </Command.List>

            <div className="hidden shrink-0 items-center gap-4 border-t border-border px-4 py-2 text-xs text-subtle sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> navigate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>↵</Kbd> open
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5">
                <Kbd>?</Kbd> all shortcuts
              </span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

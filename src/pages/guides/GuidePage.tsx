import {
  ArrowUp,
  BookOpen,
  Container,
  Database,
  Layers,
  ListChecks,
  Monitor,
  Search,
  Server,
  SquareTerminal,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { InlineText } from '@/components/common/InlineText';
import { Kbd } from '@/components/common/KeyboardHint';
import { Markdown } from '@/components/common/Markdown';
import { PageHeader } from '@/components/common/PageHeader';
import { Chip } from '@/components/ui/chip';
import type {
  GuideContent,
  GuideMeta,
  GuideRecipe,
  GuideRecipeGroup,
  RecipeIcon,
} from '@/content/guides';
import { linkSectionRefs, markGuideOutputs, parseGuide } from '@/content/guides/notes';
import { useRegisterToc, useUiStore } from '@/features/ui/store';
import { paths } from '@/lib/content';

export interface GuideData {
  meta: GuideMeta | null;
  guide: GuideContent | null;
}

const RECIPE_ICON: Record<RecipeIcon, LucideIcon> = {
  checklist: ListChecks,
  terminal: SquareTerminal,
  server: Server,
  monitor: Monitor,
  database: Database,
  layers: Layers,
  wrench: Wrench,
  book: BookOpen,
};

/** One-tap filters for the setups I reach for most. */
const QUICK_FILTERS = [
  'Backend',
  'Frontend',
  'Compose',
  'MongoDB',
  'Postgres',
  'Next.js',
  'React',
  'FastAPI',
];

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
/** "section-8-3" → "৮.৩", the way the notes number it. */
function sectionLabel(anchor: string): string {
  return anchor
    .replace(/^section-/, '')
    .replace(/-/g, '.')
    .replace(/\d/g, (d) => BN_DIGITS[Number(d)]!);
}

/** Notes Markdown → page Markdown: output blocks marked, "সেকশন ৫.৪" references linked. */
function prepare(markdown: string): string {
  return linkSectionRefs(markGuideOutputs(markdown));
}

/** A tool handbook: quick-find recipes, contents, then my notes in their own order. */
export default function GuidePage() {
  const { meta, guide } = useLoaderData() as GuideData;
  if (!meta || !guide) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Guide not found"
        action={
          <Link to={paths.guides()} className="text-sm font-medium text-accent-text underline">
            All guides
          </Link>
        }
      />
    );
  }
  return <GuideView meta={meta} guide={guide} />;
}

function GuideView({ meta, guide }: { meta: GuideMeta; guide: GuideContent }) {
  const parsed = useMemo(() => parseGuide(guide.notes), [guide.notes]);
  const openSearch = useUiStore((s) => s.setSearchOpen);

  const toc = useMemo(
    () => [
      { id: 'quick-find', title: 'Quick find' },
      { id: 'contents', title: 'Contents' },
      ...parsed.parts.flatMap((part) =>
        part.sections.map((s) => ({ id: s.id, title: s.title.replace(/[`*]/g, '') })),
      ),
    ],
    [parsed],
  );
  useRegisterToc(toc);

  return (
    <>
      <PageHeader
        eyebrow="Guide"
        title={meta.title}
        description={meta.description}
        icon={
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-text sm:inline-flex">
            <Container className="size-6" aria-hidden />
          </span>
        }
      >
        <button
          type="button"
          onClick={() => openSearch(true)}
          className="mt-5 flex min-h-11 w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 text-left text-sm text-muted shadow-card hover:border-border-strong hover:text-fg sm:max-w-md"
        >
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="flex-1">Search all of {meta.title}: “backend setup”, “compose”…</span>
          <Kbd className="hidden sm:inline-flex">Ctrl K</Kbd>
        </button>
      </PageHeader>

      {parsed.intro ? (
        <Markdown lang="bn" className="mb-10 text-[0.9375rem]">
          {prepare(parsed.intro)}
        </Markdown>
      ) : null}

      <QuickFind groups={guide.recipeGroups} />

      <section id="contents" aria-labelledby="contents-title" className="mt-12 scroll-mt-24">
        <h2 id="contents-title" className="mb-4 text-lg font-semibold">
          Contents
        </h2>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {parsed.parts.map((part) => (
            <li key={part.id} className="rounded-xl border border-border bg-surface p-4">
              <a
                href={`#${part.id}`}
                className="mb-2 flex items-baseline gap-2 text-sm font-semibold hover:text-accent-text"
                lang="bn"
              >
                <span className="text-xs text-accent-text">{part.label}</span>
                {part.title}
              </a>
              <ul className="flex flex-col" lang="bn">
                {part.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex min-h-9 items-center gap-2 rounded-md px-1.5 text-sm text-muted hover:bg-surface-2 hover:text-fg"
                    >
                      <span className="min-w-0 flex-1">
                        <InlineText>{section.title}</InlineText>
                      </span>
                      {section.subsections.length ? (
                        <span className="text-xs text-subtle tabular-nums">
                          {section.subsections.length}
                        </span>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6">
        {parsed.parts.map((part) => (
          <div key={part.id}>
            <div id={part.id} className="mt-14 mb-8 flex scroll-mt-24 items-center gap-3" lang="bn">
              <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-text">
                {part.label}
              </span>
              <span className="text-sm font-semibold text-muted">{part.title}</span>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col gap-14">
              {part.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="scroll-mt-24"
                >
                  <h2
                    id={`${section.id}-title`}
                    lang="bn"
                    className="mb-4 text-xl font-semibold tracking-tight text-balance sm:text-2xl"
                  >
                    <InlineText>{section.title}</InlineText>
                  </h2>
                  {section.body ? (
                    <Markdown lang="bn" className="text-[0.9375rem]">
                      {prepare(section.body)}
                    </Markdown>
                  ) : null}
                  {section.subsections.map((sub) => (
                    <section
                      key={sub.id}
                      id={sub.id}
                      aria-labelledby={`${sub.id}-title`}
                      className="mt-10 scroll-mt-24"
                    >
                      <h3
                        id={`${sub.id}-title`}
                        lang="bn"
                        className="mb-3 text-lg font-semibold tracking-tight text-balance"
                      >
                        <InlineText>{sub.title}</InlineText>
                      </h3>
                      <Markdown lang="bn" className="text-[0.9375rem]">
                        {prepare(sub.body)}
                      </Markdown>
                    </section>
                  ))}
                  <a
                    href="#quick-find"
                    className="mt-6 inline-flex min-h-9 items-center gap-1.5 rounded-md text-xs font-medium text-subtle hover:text-accent-text"
                  >
                    <ArrowUp className="size-3.5" aria-hidden />
                    Quick find
                  </a>
                </section>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function recipeText(recipe: GuideRecipe, group: string): string {
  return [recipe.title, recipe.summary, group, ...recipe.keywords, ...(recipe.stack ?? [])]
    .join(' ')
    .toLowerCase();
}

/** Recipe cards grouped by task, with a filter box and one-tap stack filters. */
function QuickFind({ groups }: { groups: GuideRecipeGroup[] }) {
  const [query, setQuery] = useState('');
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const visible = groups
    .map((group) => ({
      ...group,
      recipes: group.recipes.filter((recipe) => {
        const text = recipeText(recipe, group.title);
        return words.every((w) => text.includes(w));
      }),
    }))
    .filter((group) => group.recipes.length > 0);

  return (
    <section id="quick-find" aria-labelledby="quick-find-title" className="scroll-mt-24">
      <h2 id="quick-find-title" className="text-lg font-semibold">
        Quick find
      </h2>
      <p className="mt-1 text-sm text-muted">
        Jump straight to a ready setup. Each card opens the exact part of the notes.
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:border-accent-border focus-within:ring-2 focus-within:ring-accent/25">
        <Search className="size-4 shrink-0 text-subtle" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter: backend, react, mongodb, compose…"
          aria-label="Filter recipes"
          className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear filter"
            className="inline-flex size-9 items-center justify-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <div
        role="group"
        aria-label="Quick filters"
        className="mt-2 flex scrollbar-none gap-1.5 overflow-x-auto pb-1"
      >
        {QUICK_FILTERS.map((word) => {
          const selected = query.trim().toLowerCase() === word.toLowerCase();
          return (
            <Chip
              key={word}
              selected={selected}
              onClick={() => setQuery(selected ? '' : word)}
              className="lg:h-8"
            >
              {word}
            </Chip>
          );
        })}
      </div>

      {visible.length ? (
        <div className="mt-5 flex flex-col gap-6">
          {visible.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-xs font-semibold tracking-wider text-subtle uppercase">
                {group.title}
              </h3>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.recipes.map((recipe) => (
                  <li key={recipe.id}>
                    <RecipeCard recipe={recipe} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          No recipe matches “{query.trim()}”. Try one word, or press <Kbd>Ctrl K</Kbd> to search the
          whole notes.
        </p>
      )}
    </section>
  );
}

function RecipeCard({ recipe }: { recipe: GuideRecipe }) {
  const Icon = RECIPE_ICON[recipe.icon];
  return (
    <a
      href={`#${recipe.anchor}`}
      className="group flex h-full gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-card transition-colors hover:border-accent-border hover:bg-accent-soft/40"
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
        <Icon className="size-[1.125rem]" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-start gap-2">
          <span className="flex-1 text-sm leading-5 font-semibold group-hover:text-accent-text">
            {recipe.title}
          </span>
          <span
            lang="bn"
            className="shrink-0 rounded-md border border-border px-1.5 text-[0.6875rem] leading-5 text-subtle tabular-nums"
            aria-label={`section ${sectionLabel(recipe.anchor)}`}
          >
            §{sectionLabel(recipe.anchor)}
          </span>
        </span>
        <span className="text-xs leading-5 text-muted">{recipe.summary}</span>
        {recipe.stack?.length ? (
          <span className="mt-0.5 flex flex-wrap gap-1">
            {recipe.stack.map((s) => (
              <span
                key={s}
                className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.6875rem] font-medium text-muted"
              >
                {s}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </a>
  );
}

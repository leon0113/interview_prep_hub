import {
  Bookmark,
  Brain,
  ChevronRight,
  Code2,
  Compass,
  Database,
  Dumbbell,
  Home,
  LayoutGrid,
  ListChecks,
  Network,
  Shapes,
  SquareTerminal,
  Table2,
  type LucideIcon,
} from 'lucide-react';
import { Suspense, use, useId, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { GUIDE_ICONS } from '@/components/common/guideIcons';
import { TrackIcon } from '@/components/common/TrackIcon';
import { lcOutline, lcProblemsIn } from '@/content/leetcode/loader';
import { topicMetas } from '@/content/leetcode/topics';
import { guideMetas } from '@/content/guides';
import { roadmap } from '@/content/roadmap';
import { loadOutline, trackMetas } from '@/content/loader';
import type { SectionOutline } from '@/content/outline';
import type { TrackMeta } from '@/content/schema';
import { useDueIds } from '@/features/leetcode/store';
import { useBookmarkCount, useLearnedCount } from '@/features/progress/hooks';
import { useRouteParams } from '@/features/tracks/useTrack';
import { cn } from '@/lib/cn';
import { findQuestion, paths, sectionQuestionIds, sortedSections } from '@/lib/content';

const rowBase =
  'flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors lg:min-h-9';
const rowIdle = 'text-muted hover:bg-surface-2 hover:text-fg';
// Muted counts inside the active row take the accent text colour: grey on the tinted
// background falls below WCAG AA contrast.
const rowActive = 'bg-accent-soft text-accent-text font-medium [&_.text-subtle]:text-accent-text';

interface SidebarNavProps {
  /** Called after a link is followed — the mobile sheet uses it to close itself. */
  onNavigate?: () => void;
}

/** Navigation tree shared by the desktop sidebar and the mobile sheet. */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { trackSlug } = useRouteParams();
  const bookmarkCount = useBookmarkCount();
  // User's explicit expand/collapse choices; the current track is open by default.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      <TopLink to={paths.home()} icon={Home} onNavigate={onNavigate} end>
        Home
      </TopLink>
      <TopLink to={paths.bookmarks()} icon={Bookmark} onNavigate={onNavigate}>
        <span className="flex-1">Bookmarks</span>
        {bookmarkCount > 0 ? <Count>{bookmarkCount}</Count> : null}
      </TopLink>

      <p className="mt-5 mb-1.5 px-2.5 text-[0.6875rem] font-semibold tracking-wider text-subtle uppercase">
        Tracks
      </p>

      <ul className="flex flex-col gap-0.5">
        {trackMetas.map((meta) => {
          const isCurrent = meta.slug === trackSlug;
          const open = overrides[meta.slug] ?? isCurrent;
          return (
            <TrackItem
              key={meta.slug}
              meta={meta}
              open={open}
              isCurrent={isCurrent}
              onToggle={() => setOverrides((prev) => ({ ...prev, [meta.slug]: !open }))}
              onNavigate={onNavigate}
            />
          );
        })}
      </ul>

      <LeetCodeNav onNavigate={onNavigate} />
      <GuidesNav onNavigate={onNavigate} />
      <ComingNext />
    </nav>
  );
}

const ALL_LC_IDS = lcOutline.problems.map((p) => p.id);

/** The LeetCode area: its own heading, separate from the language tracks. */
function LeetCodeNav({ onNavigate }: { onNavigate?: () => void }) {
  const due = useDueIds(ALL_LC_IDS);
  return (
    <div data-accent="violet">
      <p className="mt-5 mb-1.5 px-2.5 text-[0.6875rem] font-semibold tracking-wider text-subtle uppercase">
        LeetCode
      </p>
      <ul className="flex flex-col gap-0.5">
        <li>
          <TopLink to={paths.leetcode()} icon={LayoutGrid} onNavigate={onNavigate} end>
            Overview
          </TopLink>
        </li>
        {topicMetas.map((topic) => (
          <li key={topic.id}>
            <TopLink to={paths.lcTopic(topic.id)} icon={Network} onNavigate={onNavigate}>
              <span className="flex-1">{topic.title}</span>
              <Count>{lcOutline.problems.filter((p) => p.topicId === topic.id).length}</Count>
            </TopLink>
          </li>
        ))}
        <li>
          <TopLink to={paths.lcList('dsa')} icon={Code2} onNavigate={onNavigate}>
            <span className="flex-1">DSA</span>
            <Count>{lcProblemsIn('dsa').length}</Count>
          </TopLink>
        </li>
        <li>
          <TopLink to={paths.lcList('database')} icon={Database} onNavigate={onNavigate}>
            <span className="flex-1">Database</span>
            <Count>{lcProblemsIn('database').length}</Count>
          </TopLink>
        </li>
        <li>
          <TopLink to={paths.lcPatterns()} icon={Shapes} onNavigate={onNavigate}>
            Patterns
          </TopLink>
        </li>
        <li>
          <TopLink to={paths.lcPractice()} icon={ListChecks} onNavigate={onNavigate}>
            Practice
          </TopLink>
        </li>
        <li>
          <TopLink to={paths.lcRevise()} icon={Brain} onNavigate={onNavigate}>
            <span className="flex-1">Revise</span>
            {due && due.length > 0 ? (
              <span
                className="rounded-full bg-accent px-1.5 text-[0.6875rem] font-semibold text-accent-fg tabular-nums"
                aria-label={`${due.length} due today`}
              >
                {due.length}
              </span>
            ) : null}
          </TopLink>
        </li>
      </ul>
    </div>
  );
}

/** Tool handbooks (Docker…). */
function GuidesNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div>
      <p className="mt-5 mb-1.5 px-2.5 text-[0.6875rem] font-semibold tracking-wider text-subtle uppercase">
        Guides
      </p>
      <ul className="flex flex-col gap-0.5">
        {guideMetas.map((guide) => (
          <li key={guide.id} data-accent={guide.accent}>
            <TopLink
              to={paths.guide(guide.id)}
              icon={GUIDE_ICONS[guide.icon]}
              onNavigate={onNavigate}
            >
              {guide.title}
            </TopLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Planned topics (src/content/roadmap.ts), in the order they will be added. Not links yet. */
function ComingNext() {
  const [open, setOpen] = useState(true);
  // Rendered twice on small screens (sidebar + mobile sheet), so the id must be unique.
  const listId = useId();
  return (
    <div className="mt-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
        className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-[0.6875rem] font-semibold tracking-wider text-subtle uppercase hover:bg-surface-2 hover:text-fg lg:min-h-8"
      >
        <span className="flex-1 text-left">Coming next</span>
        <span className="font-normal tracking-normal tabular-nums">{roadmap.length}</span>
        <ChevronRight
          className={cn('size-3.5 transition-transform duration-200', open && 'rotate-90')}
          aria-hidden
        />
      </button>
      {open ? (
        <ol id={listId} className="mt-1 flex flex-col">
          {roadmap.map((item, index) => (
            <li
              key={item.id}
              className="flex min-h-8 items-center gap-2.5 px-2.5 text-sm text-muted"
            >
              <span
                aria-hidden
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-border-strong text-[0.625rem] text-subtle tabular-nums"
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 py-1 leading-5">{item.title}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function TopLink({
  to,
  icon: Icon,
  end,
  onNavigate,
  children,
}: {
  to: string;
  icon: LucideIcon;
  end?: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => cn(rowBase, isActive ? rowActive : rowIdle)}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {children}
    </NavLink>
  );
}

function Count({ children }: { children: ReactNode }) {
  return <span className="text-xs font-normal text-subtle tabular-nums">{children}</span>;
}

interface TrackItemProps {
  meta: TrackMeta;
  open: boolean;
  isCurrent: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

function TrackItem({ meta, open, isCurrent, onToggle, onNavigate }: TrackItemProps) {
  const panelId = `nav-track-${meta.slug}`;
  return (
    <li data-accent={meta.accent}>
      <div className="flex items-center gap-0.5">
        <NavLink
          to={paths.track(meta.slug)}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              rowBase,
              'min-w-0 flex-1 font-medium',
              isActive ? rowActive : cn(rowIdle, isCurrent && 'text-fg'),
            )
          }
        >
          <TrackIcon meta={meta} size="sm" />
          <span className="truncate">{meta.name}</span>
        </NavLink>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? 'Collapse' : 'Expand'} ${meta.name} sections`}
          onClick={onToggle}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-fg lg:size-9"
        >
          <ChevronRight
            className={cn('size-4 transition-transform duration-200', open && 'rotate-90')}
            aria-hidden
          />
        </button>
      </div>

      {open ? (
        <div id={panelId} className="mt-0.5 mb-2 ml-[1.375rem] border-l border-border pl-2">
          <Suspense fallback={<SectionsSkeleton />}>
            <TrackSections meta={meta} onNavigate={onNavigate} />
          </Suspense>
        </div>
      ) : null}
    </li>
  );
}

function SectionsSkeleton() {
  return (
    <div className="flex flex-col gap-2 py-2 pl-2.5" aria-hidden>
      {[72, 56, 64].map((width) => (
        <span
          key={width}
          className="h-3 animate-pulse rounded bg-surface-2"
          style={{ width: `${width}%` }}
        />
      ))}
    </div>
  );
}

function TrackSections({ meta, onNavigate }: { meta: TrackMeta; onNavigate?: () => void }) {
  // The promise is cached by the loader, so `use` reads a stable reference.
  const track = use(loadOutline(meta.slug)!);
  const { trackSlug, sectionId, questionId } = useRouteParams();
  const isCurrentTrack = trackSlug === meta.slug;
  const activeSectionId = isCurrentTrack
    ? (sectionId ?? findQuestion(track, questionId)?.section.id)
    : undefined;

  return (
    <ul className="flex flex-col gap-0.5">
      {sortedSections(track).map((section) => (
        <li key={section.id}>
          <SectionLink
            trackSlug={meta.slug}
            section={section}
            active={section.id === activeSectionId}
            onNavigate={onNavigate}
          />
        </li>
      ))}
      <li className="mt-1 border-t border-border pt-1">
        <NavLink
          to={paths.exercises(meta.slug)}
          onClick={onNavigate}
          className={({ isActive }) => cn(rowBase, isActive ? rowActive : rowIdle)}
        >
          <Dumbbell className="size-4 shrink-0" aria-hidden />
          <span className="flex-1">Exercises</span>
          <Count>{track.exercises.length}</Count>
        </NavLink>
      </li>
      <li>
        <NavLink
          to={paths.coverage(meta.slug)}
          onClick={onNavigate}
          className={({ isActive }) => cn(rowBase, isActive ? rowActive : rowIdle)}
        >
          <Compass className="size-4 shrink-0" aria-hidden />
          <span className="flex-1">Coverage</span>
        </NavLink>
      </li>
      {track.dataset ? (
        <li>
          <NavLink
            to={paths.dataset(meta.slug)}
            onClick={onNavigate}
            className={({ isActive }) => cn(rowBase, isActive ? rowActive : rowIdle)}
          >
            <Table2 className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">Sample database</span>
            <Count>{track.dataset.tables.length}</Count>
          </NavLink>
        </li>
      ) : null}
      {track.dataset ? (
        <li>
          <NavLink
            to={paths.playground(meta.slug)}
            onClick={onNavigate}
            className={({ isActive }) => cn(rowBase, isActive ? rowActive : rowIdle)}
          >
            <SquareTerminal className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">Playground</span>
          </NavLink>
        </li>
      ) : null}
    </ul>
  );
}

function SectionLink({
  trackSlug,
  section,
  active,
  onNavigate,
}: {
  trackSlug: string;
  section: SectionOutline;
  active: boolean;
  onNavigate?: () => void;
}) {
  const ids = sectionQuestionIds(section);
  const learned = useLearnedCount(ids);
  const done = ids.length > 0 && learned === ids.length;

  return (
    <Link
      to={paths.section(trackSlug, section.id)}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(rowBase, active ? rowActive : rowIdle)}
    >
      <span className="min-w-0 flex-1 truncate">{section.title}</span>
      <span
        className={cn(
          'text-xs font-normal tabular-nums',
          done ? 'text-accent-text' : 'text-subtle',
        )}
        aria-label={`${learned} of ${ids.length} learned`}
      >
        {learned}/{ids.length}
      </span>
    </Link>
  );
}

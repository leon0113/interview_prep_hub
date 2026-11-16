import { HydrationBoundary } from '@/components/common/HydrationBoundary';
import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router';
import { ShortcutsDialog } from '@/components/common/ShortcutsDialog';
import { commandPalette, mobileNav, shortcutsDialog } from '@/components/overlayLoaders';
import { CommandPalette } from '@/components/search/CommandPalette';
import { useGlobalShortcuts } from '@/features/shortcuts/useGlobalShortcuts';
import { SqlRunnerContext } from '@/features/sql/context';
import { useCurrentTrackMeta, useOptionalTrack, useRouteParams } from '@/features/tracks/useTrack';
import { paths } from '@/lib/content';
import { titleFromCrumbs, useDocumentTitle } from '@/lib/documentTitle';
import { prefetchOnFirstInteraction } from '@/lib/prefetch';
import { Breadcrumbs } from './Breadcrumbs';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { TableOfContents } from './TableOfContents';
import { TopBar } from './TopBar';
import { useCrumbs } from './useCrumbs';

/** Root layout: top bar, sidebar, main column, right TOC. The track sets the accent colour. */
export function AppShell() {
  useGlobalShortcuts();
  // Overlays are lazy chunks; warm them on the first interaction so they open instantly.
  useEffect(
    () =>
      prefetchOnFirstInteraction([
        commandPalette.preload,
        shortcutsDialog.preload,
        mobileNav.preload,
      ]),
    [],
  );
  const meta = useCurrentTrackMeta();
  const navigation = useNavigation();
  const { pathname } = useLocation();
  const crumbs = useCrumbs();
  // Section and coverage pages publish an "On this page" list (see TableOfContents).
  const { sectionId } = useRouteParams();
  const hasToc =
    Boolean(sectionId) ||
    pathname.startsWith(`${paths.lcTopics()}/`) ||
    (meta !== undefined &&
      (pathname === paths.coverage(meta.slug) || pathname === paths.dataset(meta.slug)));
  useDocumentTitle(titleFromCrumbs(crumbs.map((crumb) => crumb.label)));

  // SQL code blocks offer "Run" on tracks that have a sample database.
  const outline = useOptionalTrack();
  const sqlRunnerTrack = outline?.dataset ? outline.slug : null;

  return (
    <SqlRunnerContext value={sqlRunnerTrack}>
      <div
        // The LeetCode area is not a track; it has its own accent.
        data-accent={meta?.accent ?? (pathname.startsWith(paths.leetcode()) ? 'violet' : undefined)}
        className="flex min-h-dvh flex-col"
      >
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-fg focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>

        {navigation.state === 'loading' ? (
          <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
            <div className="h-full animate-[nav-progress_1.5s_ease-out_forwards] bg-accent" />
          </div>
        ) : null}

        <TopBar />

        <div className="mx-auto flex w-full max-w-[88rem] flex-1">
          <HydrationBoundary>
            <Sidebar />
          </HydrationBoundary>
          <main
            id="main"
            tabIndex={-1}
            className="min-w-0 flex-1 px-4 pt-6 outline-none sm:px-6 lg:px-10 lg:pt-8"
          >
            <div className="mx-auto max-w-3xl">
              <Breadcrumbs />
              <Outlet />
            </div>
            <Footer />
          </main>
          <HydrationBoundary>
            <TableOfContents reserve={hasToc} />
          </HydrationBoundary>
        </div>

        <MobileNav />
        <CommandPalette />
        <ShortcutsDialog />
        <ScrollRestoration />
      </div>
    </SqlRunnerContext>
  );
}

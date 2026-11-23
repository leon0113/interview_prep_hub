import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useUiStore } from '@/features/ui/store';
import { cn } from '@/lib/cn';

/** Slack (px) below an entry's anchor-jump position that still counts as "reached". */
const LINE_TOLERANCE_PX = 24;

/**
 * Right-hand "On this page" list (desktop only). Pages publish entries with useRegisterToc.
 * `reserve` keeps the (empty) column on pages that will have entries: they are registered in
 * an effect, after hydration, and the main column must not narrow when they appear.
 */
export function TableOfContents({ reserve = false }: { reserve?: boolean }) {
  const items = useUiStore((state) => state.tocItems);
  const [visibleId, setVisibleId] = useState<string | null>(null);
  const { hash } = useLocation();

  useEffect(() => {
    if (items.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const elements = items
        .map((item) => document.getElementById(item.id))
        .filter((element): element is HTMLElement => element !== null);

      // Current = the last entry whose top has reached the line where an anchor jump lands it:
      // the page's scroll-padding-top plus the entry's own scroll-margin-top. The previous
      // entry's tail may still be on screen above it, but it no longer counts.
      const pagePadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
      let current: string | null = null;
      for (const element of elements) {
        const margin = parseFloat(getComputedStyle(element).scrollMarginTop);
        const line = (pagePadding || 0) + (margin || 0) + LINE_TOLERANCE_PX;
        if (element.getBoundingClientRect().top <= line) current = element.id;
        else break;
      }

      // At the bottom of the page the last short entries can never reach the line: prefer the
      // one that was just jumped to (the URL hash) when it is on screen.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        const hashId = decodeURIComponent(window.location.hash.slice(1));
        const target = elements.find((element) => element.id === hashId);
        if (target) {
          const top = target.getBoundingClientRect().top;
          if (top >= 0 && top < window.innerHeight) current = hashId;
        }
      }
      setVisibleId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
    // `hash`: a TOC click (pushState, no hashchange event) re-runs the check.
  }, [items, hash]);

  if (items.length === 0) {
    return reserve ? <aside aria-hidden className="hidden w-52 shrink-0 lg:block xl:w-60" /> : null;
  }

  const activeId = items.some((item) => item.id === visibleId) ? visibleId : items[0]?.id;

  return (
    <aside aria-label="Table of contents" className="hidden w-52 shrink-0 lg:block xl:w-60">
      <nav
        aria-label="On this page"
        className="sticky top-14 max-h-[calc(100dvh-3.5rem)] scrollbar-thin overflow-y-auto py-8 pr-4"
      >
        <p className="mb-2.5 pl-3 text-[0.6875rem] font-semibold tracking-wider text-subtle uppercase">
          On this page
        </p>
        <ul className="border-l border-border">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <li key={item.id}>
                <Link
                  to={`#${item.id}`}
                  aria-current={active ? 'location' : undefined}
                  className={cn(
                    '-ml-px block border-l py-1.5 pl-3 text-[0.8125rem] leading-snug transition-colors',
                    active
                      ? 'border-accent font-medium text-accent-text'
                      : 'border-transparent text-muted hover:border-border-strong hover:text-fg',
                  )}
                >
                  <span className="line-clamp-2">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

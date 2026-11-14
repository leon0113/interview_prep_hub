import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useUiStore } from '@/features/ui/store';
import { cn } from '@/lib/cn';

/**
 * Right-hand "On this page" list (desktop only). Pages publish entries with useRegisterToc.
 * `reserve` keeps the (empty) column on pages that will have entries: they are registered in
 * an effect, after hydration, and the main column must not narrow when they appear.
 */
export function TableOfContents({ reserve = false }: { reserve?: boolean }) {
  const items = useUiStore((state) => state.tocItems);
  const [visibleId, setVisibleId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const topMost = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (topMost) setVisibleId(topMost.target.id);
      },
      // A band below the sticky top bar: whatever heading sits in it is "current".
      { rootMargin: '-72px 0px -55% 0px' },
    );

    for (const item of items) {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [items]);

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

import { preloadable } from '@/lib/preloadable';
import { prefetchWhenIdle } from '@/lib/prefetch';

/*
 * The answer panel pulls in react-markdown and Prism (the heaviest client code), so it is
 * loaded on demand: when an answer opens, when the browser is idle after a page with question
 * cards renders, or in parallel with the data on the single-question route (see router.tsx).
 */
const answerPanel = preloadable(() => import('./AnswerPanel').then((m) => m.AnswerPanel));
const markdown = preloadable(() => import('@/components/common/Markdown').then((m) => m.Markdown));

export const LazyAnswerPanel = answerPanel.Component;
export const LazyMarkdown = markdown.Component;
export const loadAnswerPanel = answerPanel.preload;

/**
 * Loads the answer panel and markdown code now. Used before hydrating a prerendered page that
 * shows them: if they suspended during hydration, a re-render (e.g. saved state loading) would
 * make React drop the server HTML for a moment and shift the layout.
 */
export function preloadAnswerContent(): Promise<unknown> {
  return Promise.all([answerPanel.preload(), markdown.preload()]);
}

/** Warms the answer and markdown chunks once per session, after the first render. */
export function prefetchAnswerPanelWhenIdle(): void {
  prefetchWhenIdle([answerPanel.preload, markdown.preload], { delayMs: 1500 });
}

/**
 * Runs `loaders` (dynamic imports) when the browser is idle, so code kept out of the initial
 * bundle — dialogs, the search palette, the answer panel — is already cached when first used.
 * `delayMs` waits first, so prefetching never competes with the page's own first load.
 * Each loader runs at most once per session; failures are ignored (the real use retries).
 */
const started = new WeakSet<() => Promise<unknown>>();

export function prefetchWhenIdle(
  loaders: (() => Promise<unknown>)[],
  { delayMs = 0 }: { delayMs?: number } = {},
): void {
  if (typeof window === 'undefined') return;
  const pending = loaders.filter((load) => !started.has(load));
  if (pending.length === 0) return;
  pending.forEach((load) => started.add(load));
  const run = () => pending.forEach((load) => void load().catch(() => started.delete(load)));
  const whenIdle = () =>
    'requestIdleCallback' in window
      ? window.requestIdleCallback(run, { timeout: 4000 })
      : setTimeout(run, 1000);
  setTimeout(whenIdle, delayMs);
}

/**
 * Runs `loaders` once, on the visitor's first interaction (pointer, touch or key). For code
 * that is only needed after the user does something — dialogs, search, the mobile menu — this
 * avoids spending a slow connection's bandwidth during page load.
 */
export function prefetchOnFirstInteraction(loaders: (() => Promise<unknown>)[]): () => void {
  if (typeof window === 'undefined') return () => {};
  const events = ['pointerdown', 'touchstart', 'keydown', 'focusin'] as const;
  const run = () => {
    stop();
    prefetchWhenIdle(loaders);
  };
  const stop = () => events.forEach((type) => window.removeEventListener(type, run, true));
  events.forEach((type) => window.addEventListener(type, run, { capture: true, passive: true }));
  return stop;
}

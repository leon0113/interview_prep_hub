/**
 * The first-load splash lives in index.html (plain HTML + CSS, so it paints immediately).
 * Once the app has mounted, this fades it out: after the fonts are ready (so the page appears
 * in its final typography) and a short minimum time (so it doesn't just flicker), but never
 * later than MAX_WAIT_MS. It shows once per browser session.
 */
const MIN_VISIBLE_MS = 900;
const MAX_WAIT_MS = 2000;
const SEEN_KEY = 'iph:splash';

export function hideSplash(): void {
  const splash = document.getElementById('splash');
  if (!splash) return;
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* storage unavailable: the splash shows again next time, which is fine */
  }
  if (getComputedStyle(splash).display === 'none') {
    splash.remove();
    return;
  }

  const elapsed = performance.now();
  const minimum = new Promise((resolve) =>
    setTimeout(resolve, Math.max(0, MIN_VISIBLE_MS - elapsed)),
  );
  const ready = Promise.all([document.fonts?.ready, minimum]);
  const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));

  void Promise.race([ready, timeout]).then(() => {
    // Two frames: let the app's first render paint behind the splash before it fades.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        splash.classList.add('splash-out');
        splash.addEventListener('transitionend', () => splash.remove(), { once: true });
        setTimeout(() => splash.remove(), 800);
      }),
    );
  });
}

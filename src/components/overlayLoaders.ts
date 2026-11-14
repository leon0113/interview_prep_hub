import { preloadable } from '@/lib/preloadable';

/*
 * Overlays kept out of the initial bundle. The lazy mount points render `.Component` on first
 * open; AppShell calls `.preload` when the browser is idle so the first open is instant.
 */
export const commandPalette = preloadable(() =>
  import('./search/CommandPaletteDialog').then((m) => m.default),
);
export const shortcutsDialog = preloadable(() =>
  import('./common/ShortcutsDialogContent').then((m) => m.default),
);
export const mobileNav = preloadable(() =>
  import('./layout/MobileNavSheet').then((m) => m.default),
);

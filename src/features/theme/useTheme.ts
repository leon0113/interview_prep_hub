import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useThemeStore, type ResolvedTheme, type ThemePreference } from './store';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystemTheme(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

export function useResolvedTheme(): ResolvedTheme {
  const theme = useThemeStore((state) => state.theme);
  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemPrefersDark,
    () => false,
  );
  if (theme === 'system') return systemDark ? 'dark' : 'light';
  return theme;
}

/** Keeps the `dark` class on <html> in sync with the resolved theme. Mount once. */
export function useApplyTheme(): void {
  const resolved = useResolvedTheme();

  useEffect(() => {
    // Until saved state is loaded, `resolved` is a placeholder; the inline script in
    // index.html has already applied the right class, so leave it alone.
    if (!useThemeStore.persist.hasHydrated()) return;
    // Read live state rather than `resolved`: on the first run after hydration the value
    // captured during render predates the saved theme.
    const { theme } = useThemeStore.getState();
    const dark = theme === 'dark' || (theme === 'system' && getSystemPrefersDark());
    document.documentElement.classList.toggle('dark', dark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#0b0b0e' : '#fcfcfd');
  }, [resolved]);
}

export function useTheme(): {
  theme: ThemePreference;
  resolved: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  toggle: () => void;
} {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const resolved = useResolvedTheme();

  const toggle = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setTheme]);

  return { theme, resolved, setTheme, toggle };
}

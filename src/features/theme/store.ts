import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

/** Keep in sync with the inline script in index.html. */
export const THEME_STORAGE_KEY = 'iph:theme';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: THEME_STORAGE_KEY,
      version: 1,
      skipHydration: true,
    } /* Loaded after the first render (see app/providers.tsx) so prerendered HTML hydrates cleanly. */,
  ),
);

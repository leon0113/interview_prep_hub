import { useEffect } from 'react';
import { usePracticeStore } from '@/features/practice/store';
import { useTheme } from '@/features/theme/useTheme';
import { useUiStore } from '@/features/ui/store';
import { isTypingTarget } from './keys';

/**
 * App-wide keyboard shortcuts. Mount once in the shell.
 * Ctrl/Cmd+K and `/` open search, `p` toggles practice mode, `t` the theme, `?` the help dialog.
 * Question shortcuts (`j` / `k` / space) live in useQuestionShortcuts.
 */
export function useGlobalShortcuts(): void {
  const { toggle: toggleTheme } = useTheme();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const ui = useUiStore.getState();

      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        ui.setSearchOpen(!ui.searchOpen);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
      // Leave single-key shortcuts alone while a dialog or sheet is open.
      if (ui.searchOpen || ui.mobileNavOpen || ui.shortcutsOpen) return;

      if (key === '/') {
        event.preventDefault();
        ui.setSearchOpen(true);
      } else if (key === '?') {
        event.preventDefault();
        ui.setShortcutsOpen(true);
      } else if (key === 'p') {
        usePracticeStore.getState().togglePracticeMode();
      } else if (key === 't') {
        toggleTheme();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleTheme]);
}

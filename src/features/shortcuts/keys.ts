import { useUiStore } from '@/features/ui/store';

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/** True when the focused element handles Space/Enter itself (buttons, links, tabs…). */
export function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('button, a[href], summary, [role="tab"], [role="button"]'));
}

export function isOverlayOpen(): boolean {
  const { searchOpen, mobileNavOpen, shortcutsOpen } = useUiStore.getState();
  return searchOpen || mobileNavOpen || shortcutsOpen;
}

/** Every shortcut the app supports — rendered by the `?` dialog. */
export const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['Ctrl/⌘', 'K'], label: 'Open search' },
  { keys: ['/'], label: 'Open search' },
  { keys: ['J'], label: 'Next question' },
  { keys: ['K'], label: 'Previous question' },
  { keys: ['Space'], label: 'Show or hide the current answer' },
  { keys: ['P'], label: 'Toggle practice mode' },
  { keys: ['T'], label: 'Toggle light / dark theme' },
  { keys: ['?'], label: 'Show this list' },
];

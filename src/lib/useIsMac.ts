import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getSnapshot = () => /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
// Prerendered HTML cannot know the visitor's platform: render "Ctrl" there and during
// hydration, then React switches to the real value (avoids a hydration text mismatch on Macs).
const getServerSnapshot = () => false;

/** True on Apple platforms, for showing ⌘ instead of Ctrl in shortcut hints. */
export function useIsMac(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

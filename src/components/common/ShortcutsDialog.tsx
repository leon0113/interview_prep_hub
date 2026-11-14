import { shortcutsDialog } from '@/components/overlayLoaders';
import { useUiStore } from '@/features/ui/store';
import { LazyOnOpen } from './LazyOnOpen';

/** Mount point for the keyboard shortcuts dialog (`?`); its code loads on first open. */
export function ShortcutsDialog() {
  const open = useUiStore((state) => state.shortcutsOpen);
  return <LazyOnOpen open={open} overlay={shortcutsDialog} />;
}

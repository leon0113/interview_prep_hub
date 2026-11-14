import { LazyOnOpen } from '@/components/common/LazyOnOpen';
import { commandPalette } from '@/components/overlayLoaders';
import { useUiStore } from '@/features/ui/store';

/**
 * Mount point for search. The dialog (cmdk + Fuse.js + every track's outline) is downloaded
 * when the browser is idle or on first open, keeping it out of the initial bundle.
 */
export function CommandPalette() {
  const open = useUiStore((state) => state.searchOpen);
  return <LazyOnOpen open={open} overlay={commandPalette} />;
}

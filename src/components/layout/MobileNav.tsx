import { LazyOnOpen } from '@/components/common/LazyOnOpen';
import { mobileNav } from '@/components/overlayLoaders';
import { useUiStore } from '@/features/ui/store';

/** Mount point for the phone/tablet navigation sheet; its code loads on first open. */
export function MobileNav() {
  const open = useUiStore((state) => state.mobileNavOpen);
  return <LazyOnOpen open={open} overlay={mobileNav} />;
}

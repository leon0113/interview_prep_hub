import { Sheet } from '@/components/ui/sheet';
import { useUiStore } from '@/features/ui/store';
import { SidebarNav } from './SidebarNav';

/** Slide-in navigation sheet for phones and tablets (<1024px). Lazy-loaded by MobileNav. */
export default function MobileNavSheet() {
  const open = useUiStore((state) => state.mobileNavOpen);
  const setOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen} title="Interview Prep Hub">
      <SidebarNav onNavigate={() => setOpen(false)} />
    </Sheet>
  );
}

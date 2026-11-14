import { SidebarNav } from './SidebarNav';

/** Desktop (≥1024px) left sidebar. Below that the same nav lives in MobileNav. */
export function Sidebar() {
  return (
    <aside aria-label="Sidebar" className="hidden w-64 shrink-0 border-r border-border lg:block">
      <div className="sticky top-14 h-[calc(100dvh-3.5rem)] scrollbar-thin overflow-y-auto px-3 py-5">
        <SidebarNav />
      </div>
    </aside>
  );
}

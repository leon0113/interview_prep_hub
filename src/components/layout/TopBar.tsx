import { GraduationCap, Menu, Moon, Search, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePracticeStore } from '@/features/practice/store';
import { useTheme } from '@/features/theme/useTheme';
import { useUiStore } from '@/features/ui/store';
import { cn } from '@/lib/cn';
import { useIsMac } from '@/lib/useIsMac';
import { Logo } from './Logo';

export function TopBar() {
  const isMac = useIsMac();
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const practiceMode = usePracticeStore((state) => state.practiceMode);
  const togglePracticeMode = usePracticeStore((state) => state.togglePracticeMode);
  const { resolved, toggle } = useTheme();
  const nextTheme = resolved === 'dark' ? 'light' : 'dark';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[88rem] items-center gap-1 px-1.5 sm:px-3 lg:px-6">
        <Button
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="size-5" aria-hidden />
        </Button>

        <Logo className="min-w-0" />

        <div className="flex-1" />

        {/* Search: full pill from sm up, icon button on phones */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden h-11 w-56 items-center gap-2 rounded-lg border border-border bg-surface pr-1.5 pl-3 text-sm text-muted shadow-card transition-colors hover:border-border-strong hover:text-fg sm:flex lg:h-9 lg:w-64"
        >
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[0.6875rem] font-medium text-subtle">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>
        <Button
          size="icon"
          className="sm:hidden"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="size-5" aria-hidden />
        </Button>

        <button
          type="button"
          aria-pressed={practiceMode}
          aria-label="Practice mode"
          title={`Practice mode hides every answer (${practiceMode ? 'on' : 'off'})`}
          onClick={togglePracticeMode}
          className={cn(
            'inline-flex size-11 shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors md:w-auto md:px-3 lg:h-9',
            practiceMode
              ? 'bg-accent-soft text-accent-text'
              : 'text-muted hover:bg-surface-2 hover:text-fg',
          )}
        >
          <GraduationCap className="size-5 lg:size-[1.125rem]" aria-hidden />
          <span className="hidden md:inline">Practice</span>
          <span
            aria-hidden
            className={cn(
              'hidden h-1.5 w-1.5 rounded-full md:inline-block',
              practiceMode ? 'bg-accent' : 'bg-border-strong',
            )}
          />
        </button>

        <Button
          size="icon"
          aria-label={`Switch to ${nextTheme} theme`}
          title={`Switch to ${nextTheme} theme`}
          onClick={toggle}
        >
          {resolved === 'dark' ? (
            <Sun className="size-5 lg:size-[1.125rem]" aria-hidden />
          ) : (
            <Moon className="size-5 lg:size-[1.125rem]" aria-hidden />
          )}
        </Button>
      </div>
    </header>
  );
}

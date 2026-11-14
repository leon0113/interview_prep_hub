import { Link } from 'react-router';
import { cn } from '@/lib/cn';

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn('flex min-h-11 items-center gap-2.5 rounded-lg pr-2', className)}
    >
      <span
        aria-hidden
        className="inline-flex size-7 items-center justify-center rounded-lg bg-accent text-accent-fg transition-colors"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor">
          <path
            d="M9 7 4 12l5 5M15 7l5 5-5 5"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[0.9375rem] font-semibold tracking-tight whitespace-nowrap">
        Interview Prep <span className="font-medium text-muted max-[23.5rem]:hidden">Hub</span>
      </span>
    </Link>
  );
}

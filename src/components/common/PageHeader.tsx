import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Leading visual, e.g. a TrackIcon. */
  icon?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, icon, children }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-start gap-4">
        {icon}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1.5 text-xs font-semibold tracking-wider text-accent-text uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-7 text-pretty text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </header>
  );
}

import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router';
import { useCrumbs } from './useCrumbs';

export function Breadcrumbs() {
  const crumbs = useCrumbs();
  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-2 lg:mb-5">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[0.8125rem] text-muted">
        {crumbs.map((crumb, index) => (
          <Fragment key={`${index}-${crumb.label}`}>
            {index > 0 ? (
              <li aria-hidden className="flex text-subtle">
                <ChevronRight className="size-3.5" />
              </li>
            ) : null}
            <li className="flex min-w-0">
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="-mx-1 rounded px-1 py-3 transition-colors hover:text-fg lg:py-1.5"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="max-w-[16rem] truncate py-3 text-fg lg:py-1.5">
                  {crumb.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

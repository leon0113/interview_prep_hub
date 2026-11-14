import { TriangleAlert } from 'lucide-react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { NotFound } from './NotFound';
import { EmptyState } from './EmptyState';

/** Error boundary element for routes: 404s render the not-found page, anything else a retry. */
export function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        description="This page failed to load. Check your connection and try again."
        action={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg lg:h-10"
          >
            Reload
          </button>
        }
      />
    </div>
  );
}

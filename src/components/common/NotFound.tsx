import { SearchX } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState } from './EmptyState';
import { paths } from '@/lib/content';

export function NotFound() {
  return (
    <div className="pt-6">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description="That track, section or question does not exist — it may have been renamed."
        action={
          <Link
            to={paths.home()}
            className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg lg:h-10"
          >
            Back to home
          </Link>
        }
      />
    </div>
  );
}

import { Bookmark } from 'lucide-react';
import { useIsBookmarked } from '@/features/progress/hooks';
import { useProgressStore } from '@/features/progress/store';
import { cn } from '@/lib/cn';

export function BookmarkButton({ id, className }: { id: string; className?: string }) {
  const bookmarked = useIsBookmarked(id);
  const toggleBookmark = useProgressStore((state) => state.toggleBookmark);

  return (
    <button
      type="button"
      aria-pressed={bookmarked}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
      onClick={() => toggleBookmark(id)}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-lg transition-colors lg:size-9',
        bookmarked ? 'text-amber-500' : 'text-subtle hover:bg-surface-2 hover:text-fg',
        className,
      )}
    >
      <Bookmark className={cn('size-4', bookmarked && 'fill-current')} aria-hidden />
    </button>
  );
}

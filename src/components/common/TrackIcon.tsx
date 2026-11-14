import { createElement } from 'react';
import { getTrackIcon } from '@/content/loader';
import type { TrackMeta } from '@/content/schema';
import { cn } from '@/lib/cn';

const sizes = {
  sm: { tile: 'size-6 rounded-md', icon: 'size-3.5', text: 'text-[0.625rem]' },
  md: { tile: 'size-9 rounded-lg', icon: 'size-5', text: 'text-xs' },
  lg: { tile: 'size-12 rounded-xl', icon: 'size-6', text: 'text-base' },
} as const;

interface TrackIconProps {
  meta: Pick<TrackMeta, 'accent' | 'icon' | 'name'>;
  size?: keyof typeof sizes;
  className?: string;
}

/** Accent-coloured tile with the track's lucide icon. */
export function TrackIcon({ meta, size = 'md', className }: TrackIconProps) {
  const Icon = getTrackIcon(meta.icon);
  const s = sizes[size];
  return (
    <span
      data-accent={meta.accent}
      aria-hidden
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-accent font-mono font-semibold tracking-tight text-accent-fg',
        // Secondary accent stripe (visible on two-tone palettes such as Python's blue/yellow).
        'after:absolute after:inset-x-0 after:bottom-0 after:h-[12%] after:bg-accent-2',
        s.tile,
        className,
      )}
    >
      {/* createElement: the icon is a fixed import from tracks.ts, looked up by name. */}
      {Icon ? (
        createElement(Icon, { className: cn(s.icon, 'shrink-0'), strokeWidth: 2.25 })
      ) : (
        // Fallback for an unregistered icon name: the track's first two letters.
        <span className={s.text}>{meta.name.slice(0, 2)}</span>
      )}
    </span>
  );
}

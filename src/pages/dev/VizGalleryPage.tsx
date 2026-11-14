import { Suspense, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Chip } from '@/components/ui/chip';
import { vizIds, vizRegistry } from '@/visualizations/registry';

const TRACKS = [
  { prefix: 'py', label: 'Python', accent: 'azure' },
  { prefix: 'js', label: 'JavaScript', accent: 'amber' },
  { prefix: 'ts', label: 'TypeScript', accent: 'blue' },
] as const;

/**
 * Development-only page (registered only when import.meta.env.DEV) that renders every
 * registered visualization, so they can be reviewed before their questions exist.
 */
export default function VizGalleryPage() {
  const [prefix, setPrefix] = useState<string | null>(null);
  const ids = vizIds.filter((id) => !prefix || id.startsWith(`${prefix}-`));

  return (
    <div>
      <PageHeader
        eyebrow="Development only"
        title="Visualization gallery"
        description={`All ${vizIds.length} registered visualizations. This page is not included in production builds.`}
      />
      <div role="group" aria-label="Filter by track" className="mb-6 flex flex-wrap gap-1.5">
        <Chip selected={prefix === null} count={vizIds.length} onClick={() => setPrefix(null)}>
          All
        </Chip>
        {TRACKS.map((track) => (
          <Chip
            key={track.prefix}
            selected={prefix === track.prefix}
            count={vizIds.filter((id) => id.startsWith(`${track.prefix}-`)).length}
            onClick={() => setPrefix(track.prefix)}
          >
            {track.label}
          </Chip>
        ))}
      </div>
      <ul className="flex flex-col gap-8">
        {ids.map((id) => {
          const Viz = vizRegistry[id]!;
          const accent = TRACKS.find((track) => id.startsWith(`${track.prefix}-`))?.accent;
          return (
            <li key={id} id={id} data-accent={accent}>
              <p className="mb-2 font-mono text-xs text-subtle">{id}</p>
              <Suspense fallback={<p className="text-sm text-muted">Loading {id}…</p>}>
                <Viz />
              </Suspense>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

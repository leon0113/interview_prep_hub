import { ArrowRight, Container } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { guideMetas } from '@/content/guides';
import { paths } from '@/lib/content';

/** Tool handbooks built from my notes. */
export default function GuidesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Guides"
        title="Guides"
        description="Tool handbooks from my notes: the full theory in order, plus recipes you can copy the moment you need them."
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {[...guideMetas]
          .sort((a, b) => a.order - b.order)
          .map((guide) => (
            <li key={guide.id} data-accent={guide.accent}>
              <Link
                to={paths.guide(guide.id)}
                className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-card hover:border-border-strong"
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
                    <Container className="size-5" aria-hidden />
                  </span>
                  <span className="flex-1 font-semibold">{guide.title}</span>
                  <ArrowRight
                    className="size-4 text-subtle transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
                <span className="text-sm text-muted">{guide.description}</span>
              </Link>
            </li>
          ))}
      </ul>
    </>
  );
}

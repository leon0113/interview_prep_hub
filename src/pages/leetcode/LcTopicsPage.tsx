import { ArrowRight, Network } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { lcOutline } from '@/content/leetcode/loader';
import { topicMetas } from '@/content/leetcode/topics';
import { paths } from '@/lib/content';

/** Data-structure topics: theory from my notes plus the problems of each topic. */
export default function LcTopicsPage() {
  return (
    <>
      <PageHeader
        eyebrow="LeetCode"
        title="Topics"
        description="One data structure or algorithm at a time: the theory, then the problems that use it."
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {[...topicMetas]
          .sort((a, b) => a.order - b.order)
          .map((topic) => {
            const count = lcOutline.problems.filter((p) => p.topicId === topic.id).length;
            return (
              <li key={topic.id}>
                <Link
                  to={paths.lcTopic(topic.id)}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-card hover:border-border-strong"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
                      <Network className="size-5" aria-hidden />
                    </span>
                    <span className="flex-1 font-semibold">{topic.title}</span>
                    <ArrowRight
                      className="size-4 text-subtle transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className="text-sm text-muted">{topic.description}</span>
                  <span className="text-xs text-subtle">
                    {count} solved problem{count === 1 ? '' : 's'}
                  </span>
                </Link>
              </li>
            );
          })}
      </ul>
    </>
  );
}

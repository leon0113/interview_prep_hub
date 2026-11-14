import { Suspense, type ReactNode } from 'react';
import { InlineMarkdown, Markdown } from '@/components/common/Markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Question, QuickConcept } from '@/content/schema';
import { vizRegistry } from '@/visualizations/registry';
import { CodeBlock } from './CodeBlock';

interface AnswerPanelProps {
  question: Question | QuickConcept;
}

interface Tab {
  value: string;
  label: string;
  lang?: 'bn';
  count?: number;
  content: ReactNode;
}

/** The answer, split into tabs. A tab only exists when the question has content for it. */
export function AnswerPanel({ question }: AnswerPanelProps) {
  const { answer, visualizationId } = question;
  const Viz = visualizationId ? vizRegistry[visualizationId] : undefined;

  const tabs: Tab[] = [
    {
      value: 'interview',
      label: 'Interview Answer',
      content: <Markdown className="text-[0.9375rem]">{answer.interview}</Markdown>,
    },
  ];

  if (answer.explanationBn.trim()) {
    tabs.push({
      value: 'explanation',
      label: 'ব্যাখ্যা',
      lang: 'bn',
      content: (
        <Markdown lang="bn" className="text-[0.9375rem]">
          {answer.explanationBn}
        </Markdown>
      ),
    });
  }

  if (answer.examples?.length) {
    tabs.push({
      value: 'code',
      label: 'Code',
      count: answer.examples.length,
      content: (
        <div className="space-y-4">
          {answer.examples.map((example, index) => (
            <CodeBlock key={index} {...example} />
          ))}
        </div>
      ),
    });
  }

  if (answer.pitfalls?.length) {
    tabs.push({
      value: 'pitfalls',
      label: 'Pitfalls',
      count: answer.pitfalls.length,
      content: <BulletList items={answer.pitfalls} tone="warn" />,
    });
  }

  if (answer.followUps?.length) {
    tabs.push({
      value: 'follow-ups',
      label: 'Follow-ups',
      count: answer.followUps.length,
      content: <BulletList items={answer.followUps} />,
    });
  }

  if (Viz) {
    tabs.push({
      value: 'visualize',
      label: 'Visualize',
      content: (
        <Suspense fallback={<p className="text-sm text-muted">Loading visualization…</p>}>
          <Viz />
        </Suspense>
      ),
    });
  }

  return (
    <Tabs defaultValue="interview">
      <TabsList aria-label="Answer sections">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} lang={tab.lang}>
            {tab.label}
            {tab.count !== undefined && tab.count > 1 ? (
              <span className="text-xs font-normal text-subtle tabular-nums">{tab.count}</span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="p-4 sm:p-5">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function BulletList({ items, tone }: { items: string[]; tone?: 'warn' }) {
  return (
    <ul className="space-y-2.5 text-[0.9375rem] leading-7">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span
            aria-hidden
            className={
              tone === 'warn'
                ? 'mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-level-intermediate'
                : 'mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-accent'
            }
          />
          <InlineMarkdown>{item}</InlineMarkdown>
        </li>
      ))}
    </ul>
  );
}

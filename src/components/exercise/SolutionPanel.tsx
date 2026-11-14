import { Clock, Eye, EyeOff, HardDrive } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Markdown } from '@/components/common/Markdown';
import { CodeBlock } from '@/components/question/CodeBlock';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CodeLang, Exercise } from '@/content/schema';

interface SolutionPanelProps {
  exercise: Exercise;
  /** Language the solutions are written in (the track's language). */
  lang: CodeLang;
}

type Solution = Exercise['solutions'][number];

/** Hidden by default: solution approaches (tabs), complexity, a sample run and the Bangla walkthrough. */
export function SolutionPanel({ exercise, lang }: SolutionPanelProps) {
  const [open, setOpen] = useState(false);
  const { solutions, sampleRun, explanationBn } = exercise;
  const first = solutions[0];

  if (!open) {
    return (
      <div className="rounded-xl border border-dashed border-border-strong p-5 text-center">
        <p className="text-sm text-muted">
          Give it an honest attempt first — reading a solution feels like learning, writing one is.
        </p>
        <Button variant="soft" className="mt-4" aria-expanded={false} onClick={() => setOpen(true)}>
          <Eye className="size-4" aria-hidden />
          Show {solutions.length > 1 ? `${solutions.length} solutions` : 'solution'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        {solutions.length > 1 && first ? (
          <Tabs defaultValue={first.label}>
            <TabsList aria-label="Solution approaches">
              {solutions.map((solution) => (
                <TabsTrigger key={solution.label} value={solution.label}>
                  {solution.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {solutions.map((solution) => (
              <TabsContent key={solution.label} value={solution.label} className="p-4">
                <SolutionBody solution={solution} lang={lang} />
              </TabsContent>
            ))}
          </Tabs>
        ) : first ? (
          <div className="p-4">
            <p className="mb-3 text-sm font-medium">{first.label}</p>
            <SolutionBody solution={first} lang={lang} />
          </div>
        ) : null}
      </div>

      <Sub title="Sample run">
        <CodeBlock
          lang={lang}
          code={sampleRun.code}
          output={sampleRun.output}
          resultTable={sampleRun.resultTable}
        />
      </Sub>

      <Sub title="ব্যাখ্যা" lang="bn">
        <Markdown lang="bn" className="text-[0.9375rem]">
          {explanationBn}
        </Markdown>
      </Sub>

      <Button aria-expanded onClick={() => setOpen(false)}>
        <EyeOff className="size-4" aria-hidden />
        Hide solution
      </Button>
    </div>
  );
}

function SolutionBody({ solution, lang }: { solution: Solution; lang: CodeLang }) {
  return (
    <div className="space-y-3">
      {solution.complexity ? (
        <p className="flex flex-wrap gap-2">
          <ComplexityBadge icon={<Clock className="size-3.5" aria-hidden />} label="Time">
            {solution.complexity.time}
          </ComplexityBadge>
          <ComplexityBadge icon={<HardDrive className="size-3.5" aria-hidden />} label="Space">
            {solution.complexity.space}
          </ComplexityBadge>
        </p>
      ) : null}
      <CodeBlock lang={lang} code={solution.code} />
    </div>
  );
}

function ComplexityBadge({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 text-xs text-muted">
      {icon}
      {label}
      <span className="font-mono font-medium text-fg">{children}</span>
    </span>
  );
}

function Sub({ title, lang, children }: { title: string; lang?: 'bn'; children: ReactNode }) {
  return (
    <section>
      <h3
        lang={lang}
        className={
          lang
            ? 'mb-2.5 text-sm font-semibold text-accent-text'
            : 'mb-2.5 text-xs font-semibold tracking-wider text-accent-text uppercase'
        }
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

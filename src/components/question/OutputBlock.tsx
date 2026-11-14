import { cn } from '@/lib/cn';

interface OutputBlockProps {
  output: string;
  /** Standalone = its own rounded box; otherwise it sits flush under a CodeBlock. */
  standalone?: boolean;
  className?: string;
}

/** What the code prints: muted background and an explicit "Output" label. */
export function OutputBlock({ output, standalone, className }: OutputBlockProps) {
  return (
    <div
      className={cn(
        'bg-surface-2',
        standalone ? 'rounded-xl border border-border' : 'border-t border-border',
        className,
      )}
    >
      <p className="flex items-center gap-1.5 px-3.5 pt-2.5 text-[0.6875rem] font-semibold tracking-wide text-subtle uppercase">
        <span aria-hidden className="size-1.5 rounded-full bg-level-foundation" />
        Output
      </p>
      <pre
        tabIndex={0}
        className="scrollbar-thin overflow-x-auto px-3.5 pt-1 pb-3 text-[0.8125rem] leading-[1.7] text-muted"
      >
        <samp>{output}</samp>
      </pre>
    </div>
  );
}

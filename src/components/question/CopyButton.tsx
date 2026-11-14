import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useCopyToClipboard } from '@/lib/useCopyToClipboard';

/** Copies `text` to the clipboard and confirms for a moment. */
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={copied ? 'Copied' : 'Copy code'}
      className={cn(
        'inline-flex h-11 items-center gap-1.5 rounded-md px-2.5 text-[0.6875rem] font-medium tracking-normal normal-case transition-colors lg:h-7 lg:px-2',
        copied ? 'text-accent-text' : 'text-subtle hover:bg-border/60 hover:text-fg',
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

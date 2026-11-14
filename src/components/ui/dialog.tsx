import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Hide the title visually but keep it for screen readers. */
  hideTitle?: boolean;
  children?: ReactNode;
  className?: string;
}

/** Centered modal dialog. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  hideTitle,
  children,
  className,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=closed]:animate-[overlay-out_120ms_ease-in] data-[state=open]:animate-[overlay-in_150ms_ease-out]" />
        <RadixDialog.Content
          {...(description ? {} : { 'aria-describedby': undefined })}
          className={cn(
            'fixed top-[18vh] left-1/2 z-50 w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-border bg-surface p-5 shadow-pop outline-none',
            'data-[state=open]:animate-[pop-in_160ms_ease-out]',
            className,
          )}
        >
          <RadixDialog.Title className={cn('text-base font-semibold', hideTitle && 'sr-only')}>
            {title}
          </RadixDialog.Title>
          {description ? (
            <RadixDialog.Description className="mt-1.5 text-sm leading-6 text-muted">
              {description}
            </RadixDialog.Description>
          ) : null}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

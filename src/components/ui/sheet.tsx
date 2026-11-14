import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name; rendered visually in the sheet header. */
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Slide-in panel from the left edge (mobile / tablet navigation). */
export function Sheet({ open, onOpenChange, title, children, className }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=closed]:animate-[overlay-out_150ms_ease-in] data-[state=open]:animate-[overlay-in_150ms_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col border-r border-border bg-bg shadow-pop outline-none',
            'data-[state=closed]:animate-[sheet-out_150ms_ease-in] data-[state=open]:animate-[sheet-in_220ms_cubic-bezier(0.22,1,0.36,1)]',
            className,
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border pr-1.5 pl-4">
            <Dialog.Title className="text-sm font-semibold">{title}</Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="inline-flex size-11 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="pb-safe flex-1 scrollbar-thin overflow-y-auto overscroll-contain p-3">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import { Dialog } from '@/components/ui/dialog';
import { SHORTCUTS } from '@/features/shortcuts/keys';
import { useUiStore } from '@/features/ui/store';
import { Kbd } from './KeyboardHint';

/** Keyboard shortcut reference, opened with `?`. Lazy-loaded by ShortcutsDialog. */
export default function ShortcutsDialogContent() {
  const open = useUiStore((state) => state.shortcutsOpen);
  const setOpen = useUiStore((state) => state.setShortcutsOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen} title="Keyboard shortcuts" className="top-[12vh]">
      <dl className="mt-4 divide-y divide-border">
        {SHORTCUTS.map((shortcut) => (
          <div
            key={shortcut.keys.join('+')}
            className="flex items-center justify-between gap-4 py-2.5"
          >
            <dt className="text-sm text-muted">{shortcut.label}</dt>
            <dd className="flex shrink-0 items-center gap-1">
              {shortcut.keys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}

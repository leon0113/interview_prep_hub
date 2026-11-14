import { useEffect, useRef, useState } from 'react';

/** Copies text to the clipboard; `copied` stays true for a moment to confirm it. */
export function useCopyToClipboard(resetMs = 1600): {
  copied: boolean;
  copy: (text: string) => Promise<void>;
} {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), resetMs);
    } catch {
      // Clipboard unavailable (insecure context / denied): leave the button as is.
    }
  }

  return { copied, copy };
}

import { useEffect, useState, type ComponentType } from 'react';

interface Overlay {
  Component: ComponentType;
  preload: () => Promise<unknown>;
  isLoaded: () => boolean;
}

/**
 * Mounts a lazily loaded overlay (dialog, sheet) once it has been opened, then keeps it
 * mounted so its close animation and state work normally. Keeps Radix Dialog and friends out
 * of the initial bundle — most visits never open these.
 *
 * It waits for the code itself instead of suspending: a Suspense reveal is throttled by React
 * (~300 ms), which made the first open feel slow even when the chunk was already cached.
 */
export function LazyOnOpen({ open, overlay }: { open: boolean; overlay: Overlay }) {
  const [ready, setReady] = useState(overlay.isLoaded);

  useEffect(() => {
    if (!open || ready) return;
    let active = true;
    overlay.preload().then(
      () => active && setReady(true),
      () => {}, // network error: the next open retries
    );
    return () => {
      active = false;
    };
  }, [open, ready, overlay]);

  return ready ? <overlay.Component /> : null;
}

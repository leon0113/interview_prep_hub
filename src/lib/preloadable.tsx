import { lazy, type ComponentProps, type ComponentType } from 'react';

/**
 * Like `React.lazy`, but once the module has loaded (by prefetching or an earlier render) the
 * real component renders directly, without suspending. Suspending even on an already-cached
 * module makes React hold the reveal back ~300 ms (its Suspense fallback throttle), which made
 * the first dialog or answer open feel sluggish.
 */
export function preloadable<P extends object>(load: () => Promise<ComponentType<P>>) {
  let loaded: ComponentType<P> | undefined;
  let pending: Promise<ComponentType<P>> | undefined;

  const preload = (): Promise<ComponentType<P>> => {
    pending ??= load().then(
      (component) => (loaded = component),
      (error: unknown) => {
        pending = undefined; // allow a retry, e.g. after a network hiccup
        throw error;
      },
    );
    return pending;
  };

  const Lazy = lazy(async () => ({ default: await preload() }));

  function Preloadable(props: P) {
    const Component = (loaded ?? Lazy) as ComponentType<P>;
    return <Component {...(props as ComponentProps<ComponentType<P>>)} />;
  }

  return { Component: Preloadable, preload, isLoaded: () => loaded !== undefined };
}

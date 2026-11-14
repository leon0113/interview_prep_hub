import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Lazy route chunks are imported on first use, which can take a moment under test.
configure({ asyncUtilTimeout: 5000 });

afterEach(() => {
  cleanup();
});

/**
 * Node 22+ ships an experimental global `localStorage` that is unusable without
 * `--localstorage-file` and shadows jsdom's. Replace it with an in-memory Storage.
 */
class MemoryStorage implements Storage {
  #data = new Map<string, string>();
  get length(): number {
    return this.#data.size;
  }
  clear(): void {
    this.#data.clear();
  }
  getItem(key: string): string | null {
    return this.#data.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.#data.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.#data.delete(key);
  }
  setItem(key: string, value: string): void {
    this.#data.set(key, String(value));
  }
  [name: string]: unknown;
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, name, { value: storage, configurable: true });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, name, { value: storage, configurable: true });
  }
}

// jsdom does not implement these browser APIs.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  if (!window.IntersectionObserver) {
    class IntersectionObserverStub {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    }
    window.IntersectionObserver =
      IntersectionObserverStub as unknown as typeof IntersectionObserver;
  }

  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
}

if (typeof window !== 'undefined') {
  Element.prototype.scrollIntoView = vi.fn();
  if (!window.ResizeObserver) {
    class ResizeObserverStub {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
  }
}

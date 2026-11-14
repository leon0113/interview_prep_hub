import { RotateCcw, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { VizFrame } from '../shared/VizFrame';

const WAIT = 500;
/** How much time the timelines show (ms). */
const WINDOW = 6000;
const TICK = 50;

type Lane = 'raw' | 'debounced' | 'throttled';

interface Mark {
  id: number;
  lane: Lane;
  /** Time since the first event (ms). */
  at: number;
}

const LANES: { id: Lane; label: string; hint: string; dot: string; text: string }[] = [
  {
    id: 'raw',
    label: 'Raw events',
    hint: 'every keystroke / click',
    dot: 'bg-border-strong',
    text: 'text-muted',
  },
  {
    id: 'debounced',
    label: `Debounced (${WAIT} ms)`,
    hint: 'fires once, after you stop',
    dot: 'bg-level-foundation',
    text: 'text-level-foundation',
  },
  {
    id: 'throttled',
    label: `Throttled (${WAIT} ms)`,
    hint: 'fires at most once per interval',
    dot: 'bg-accent',
    text: 'text-accent-text',
  },
];

/**
 * Live demo (not step-based): the user generates events, and three timelines show how
 * debounce and throttle thin them out. The debounce/throttle logic here is the real thing.
 */
export default function DebounceThrottleViz() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [now, setNow] = useState(0);
  const [running, setRunning] = useState(false);

  const startedAt = useRef<number | null>(null);
  const nextId = useRef(0);
  const debounceTimer = useRef<number | undefined>(undefined);
  const lastThrottled = useRef(-Infinity);
  const lastActivity = useRef(0);

  // The clock only runs while there is something to show, then stops itself.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      if (startedAt.current === null) return;
      const elapsed = performance.now() - startedAt.current;
      setNow(elapsed);
      if (elapsed - lastActivity.current > WAIT + 400 || elapsed >= WINDOW) setRunning(false);
    }, TICK);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => () => window.clearTimeout(debounceTimer.current), []);

  function addMark(lane: Lane, at: number) {
    setMarks((prev) => [...prev, { id: nextId.current++, lane, at }]);
  }

  function reset() {
    window.clearTimeout(debounceTimer.current);
    startedAt.current = null;
    lastThrottled.current = -Infinity;
    lastActivity.current = 0;
    setMarks([]);
    setNow(0);
    setRunning(false);
  }

  function fire() {
    let start = startedAt.current;
    // Start (or restart once the window is full) on the first event.
    if (start === null || performance.now() - start >= WINDOW) {
      reset();
      start = performance.now();
      startedAt.current = start;
    }
    const at = performance.now() - start;
    lastActivity.current = at;
    setRunning(true);
    addMark('raw', at);

    // Throttle (leading edge): run now unless we already ran within the last WAIT ms.
    if (at - lastThrottled.current >= WAIT) {
      lastThrottled.current = at;
      addMark('throttled', at);
    }

    // Debounce: cancel the pending call and schedule a new one WAIT ms from now.
    window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      if (startedAt.current === start) addMark('debounced', performance.now() - start);
    }, WAIT);
  }

  const count = (lane: Lane) => marks.filter((mark) => mark.lane === lane).length;
  const full = now >= WINDOW;

  return (
    <VizFrame
      title="Debounce vs throttle"
      caption="Type or click quickly, then pause. Each dot is one function call."
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          aria-label="Type here to generate events"
          placeholder="Type fast here…"
          onInput={fire}
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none placeholder:text-subtle focus-visible:border-accent"
        />
        <button
          type="button"
          onClick={fire}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-sm font-medium text-accent-fg"
        >
          <Zap className="size-4" aria-hidden />
          Fire event
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset"
          title="Reset"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
        >
          <RotateCcw className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {LANES.map((lane) => (
          <div key={lane.id}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-medium">
                {lane.label} <span className="font-normal text-subtle">· {lane.hint}</span>
              </span>
              <span className={cn('font-mono font-semibold tabular-nums', lane.text)}>
                {count(lane.id)}
              </span>
            </div>
            <div className="relative mt-1.5 h-7 overflow-hidden rounded-md bg-surface-2">
              {/* "now" cursor */}
              <span
                aria-hidden
                className="absolute inset-y-0 w-px bg-border-strong"
                style={{ left: `${Math.min(now / WINDOW, 1) * 100}%` }}
              />
              {marks
                .filter((mark) => mark.lane === lane.id)
                .map((mark) => (
                  <span
                    key={mark.id}
                    aria-hidden
                    className={cn(
                      'absolute top-1/2 size-2.5 -translate-1/2 rounded-full',
                      lane.dot,
                    )}
                    style={{ left: `${Math.min(mark.at / WINDOW, 1) * 100}%` }}
                  />
                ))}
            </div>
          </div>
        ))}
        <p className="flex justify-between text-[0.6875rem] text-subtle tabular-nums">
          <span>0s</span>
          <span>{full ? 'window full — fire again to restart' : 'time →'}</span>
          <span>{WINDOW / 1000}s</span>
        </p>
      </div>

      <div className="mt-3 grid gap-1.5 border-t border-border pt-3 text-xs leading-5 text-muted">
        <p>
          <span className="font-semibold text-level-foundation">Debounce</span> waits until the
          events stop for {WAIT} ms, then runs once — search-as-you-type, auto-save, resize.
        </p>
        <p>
          <span className="font-semibold text-accent-text">Throttle</span> runs right away, then
          ignores calls for {WAIT} ms — scroll handlers, drag, rate-limited buttons.
        </p>
        <p lang="bn">Debounce: থামার পর একবার। Throttle: চলতে থাকলেও নির্দিষ্ট সময় পরপর একবার।</p>
      </div>
    </VizFrame>
  );
}

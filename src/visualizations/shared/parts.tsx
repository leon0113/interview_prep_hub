import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { TONE, type Tone } from './tones';

/** Numbered code listing with the current line(s) highlighted. Lines are 1-based. */
export function CodePane({
  code,
  active,
  className,
}: {
  code: string;
  active?: number | readonly number[] | null;
  className?: string;
}) {
  const activeLines = active == null ? [] : typeof active === 'number' ? [active] : active;
  return (
    <pre
      tabIndex={0}
      className={cn(
        'scrollbar-thin overflow-x-auto rounded-lg border border-border bg-surface py-2 text-xs leading-6',
        className,
      )}
    >
      <code className="inline-block min-w-full">
        {code.split('\n').map((line, i) => {
          const isActive = activeLines.includes(i + 1);
          return (
            <span
              key={i}
              className={cn(
                'block border-l-2 pr-3 pl-2 whitespace-pre transition-colors',
                isActive ? 'border-accent bg-accent-soft' : 'border-transparent',
              )}
            >
              <span className="mr-2.5 inline-block w-4 text-right text-subtle select-none">
                {i + 1}
              </span>
              {line || ' '}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

/** Small titled box: a queue, a scope, a memory area… */
export function Panel({
  title,
  hint,
  active,
  tone = 'accent',
  className,
  children,
}: {
  title: ReactNode;
  hint?: ReactNode;
  active?: boolean;
  tone?: Tone;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-surface p-2.5 transition-colors',
        active ? cn(TONE[tone].border, TONE[tone].bg) : 'border-border',
        className,
      )}
    >
      <p className="mb-1.5 flex items-baseline justify-between gap-2 text-[0.625rem] font-semibold tracking-wider text-subtle uppercase">
        <span>{title}</span>
        {hint ? <span className="font-normal tracking-normal normal-case">{hint}</span> : null}
      </p>
      {children}
    </div>
  );
}

/** A mono pill that animates in and out — an item in a stack, queue or list. */
export function Token({
  children,
  tone = 'muted',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'inline-flex min-h-7 items-center rounded-md border px-2 py-0.5 font-mono text-xs break-all',
        TONE[tone].border,
        TONE[tone].bg,
        TONE[tone].text,
        className,
      )}
    >
      {children}
    </motion.span>
  );
}

/** A list of tokens. `stack` grows upwards (last item on top); `queue` runs left to right. */
export function TokenList({
  items,
  kind = 'queue',
  tone,
  empty = 'empty',
}: {
  items: readonly string[];
  kind?: 'stack' | 'queue';
  tone?: Tone;
  empty?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-7 gap-1.5',
        kind === 'stack' ? 'flex-col-reverse' : 'flex-row flex-wrap',
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item, i) => (
          <Token key={`${i}-${item}`} tone={tone}>
            {item}
          </Token>
        ))}
      </AnimatePresence>
      {items.length === 0 ? <span className="text-xs text-subtle italic">{empty}</span> : null}
    </div>
  );
}

/** Console output area. */
export function ConsolePanel({
  lines,
  title = 'Console',
  className,
}: {
  lines: readonly string[];
  title?: string;
  className?: string;
}) {
  return (
    <Panel title={title} className={cn('bg-surface-2', className)}>
      <div className="min-h-7 font-mono text-xs leading-6">
        {lines.length === 0 ? (
          <span className="text-subtle italic">nothing yet</span>
        ) : (
          lines.map((line, i) => (
            <motion.div
              key={`${i}-${line}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn('break-words', /error/i.test(line) ? 'text-level-advanced' : 'text-fg')}
            >
              <span className="mr-1.5 text-subtle select-none">›</span>
              {line}
            </motion.div>
          ))
        )}
      </div>
    </Panel>
  );
}

/** Row of preset / option buttons for a visualization's toolbar. */
export function PresetChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex h-11 shrink-0 items-center rounded-full border px-3 font-mono text-xs whitespace-nowrap transition-colors lg:h-8',
            option.value === value
              ? 'border-accent-border bg-accent-soft text-accent-text'
              : 'border-border bg-surface text-muted hover:border-border-strong hover:text-fg',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

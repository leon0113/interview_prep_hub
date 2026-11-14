import { useState } from 'react';
import { cn } from '@/lib/cn';
import { VizFrame } from '../shared/VizFrame';
import { EQUALITY_VALUES, explainLooseEquality } from './looseEquality';

const VALUES = EQUALITY_VALUES;

/** Results computed once: grid[row][col] = explanation of VALUES[row] == VALUES[col]. */
const GRID = VALUES.map((left, row) =>
  VALUES.map((right, col) =>
    // The same array literal compared with itself would be the same object; use separate copies
    // so the diagonal answers the question people actually ask: is `[] == []` true?
    explainLooseEquality(
      left.value,
      row === col && typeof right.value === 'object' && right.value !== null
        ? structuredClone(right.value)
        : right.value,
    ),
  ),
);

export default function CoercionTableViz() {
  const [selected, setSelected] = useState<{ row: number; col: number }>({ row: 10, col: 1 });
  const left = VALUES[selected.row]!;
  const right = VALUES[selected.col]!;
  const explanation = GRID[selected.row]![selected.col]!;
  const strict =
    selected.row === selected.col &&
    !(typeof left.value === 'object' && left.value !== null) &&
    !Number.isNaN(left.value);

  return (
    <VizFrame
      title="The == comparison table"
      caption="Tap any cell to see how JavaScript coerces the two sides. Green = loosely equal."
    >
      <div className="grid gap-3 *:min-w-0 @xl:grid-cols-[auto_1fr]">
        <div className="scrollbar-thin overflow-x-auto pb-1">
          <table className="border-separate border-spacing-0.5 font-mono text-[0.625rem]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-bg p-0.5 text-right text-subtle">==</th>
                {VALUES.map((value, col) => (
                  <th
                    key={value.label}
                    scope="col"
                    className={cn(
                      'h-14 w-7 p-0 align-bottom font-medium',
                      col === selected.col ? 'text-accent-text' : 'text-muted',
                    )}
                  >
                    <span className="inline-block rotate-180 pt-1 whitespace-nowrap [writing-mode:vertical-rl]">
                      {value.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VALUES.map((rowValue, row) => (
                <tr key={rowValue.label}>
                  <th
                    scope="row"
                    className={cn(
                      'sticky left-0 z-10 bg-bg pr-1.5 text-right font-medium whitespace-nowrap',
                      row === selected.row ? 'text-accent-text' : 'text-muted',
                    )}
                  >
                    {rowValue.label}
                  </th>
                  {VALUES.map((colValue, col) => {
                    const equal = GRID[row]![col]!.result;
                    const isSelected = row === selected.row && col === selected.col;
                    return (
                      <td key={colValue.label} className="p-0">
                        <button
                          type="button"
                          aria-label={`${rowValue.label} == ${colValue.label} is ${equal}`}
                          aria-pressed={isSelected}
                          onClick={() => setSelected({ row, col })}
                          onMouseEnter={() => setSelected({ row, col })}
                          className={cn(
                            'flex size-7 items-center justify-center rounded-[5px] text-[0.6875rem] transition-colors',
                            equal
                              ? 'bg-level-foundation/25 text-level-foundation'
                              : 'bg-surface-2 text-subtle',
                            isSelected && 'ring-2 ring-accent ring-offset-1 ring-offset-bg',
                          )}
                        >
                          {equal ? '✓' : '·'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div aria-live="polite" className="rounded-lg border border-border bg-surface p-3">
          <p className="font-mono text-sm font-semibold break-words">
            {left.label} == {right.label}{' '}
            <span className={explanation.result ? 'text-level-foundation' : 'text-level-advanced'}>
              → {String(explanation.result)}
            </span>
          </p>
          <ol className="mt-2.5 grid gap-1.5 text-xs leading-5 text-muted">
            {explanation.steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[0.625rem] font-semibold text-accent-text">
                  {i + 1}
                </span>
                <span className="min-w-0 break-words">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-t border-border pt-2.5 text-xs leading-5 text-muted">
            With <code className="font-semibold text-fg">===</code> there is no conversion: this
            comparison is <span className="font-semibold text-fg">{String(strict)}</span>.{' '}
            <span lang="bn">
              === কোনো type conversion করে না — তাই সাধারণ নিয়ম হলো সবসময় === ব্যবহার করা।
            </span>
          </p>
        </div>
      </div>
    </VizFrame>
  );
}

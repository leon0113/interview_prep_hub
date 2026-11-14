import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EQUALITY_VALUES, explainLooseEquality } from '@/visualizations/javascript/looseEquality';
import { vizIds, vizRegistry } from '@/visualizations/registry';

/** The ids the kickoff brief asks for — every one must be registered. */
const REQUIRED_IDS = [
  'py-reference-model',
  'py-shallow-vs-deep-copy',
  'py-legb-scope',
  'py-decorator-wrapping',
  'py-generator-stepper',
  'py-mro-diamond',
  'py-try-except-flow',
  'py-gil-concurrency',
  'js-event-loop',
  'js-hoisting-tdz',
  'js-closure-scope-chain',
  'js-this-binding',
  'js-prototype-chain',
  'js-primitive-vs-reference',
  'js-coercion-table',
  'js-promise-states',
  'js-debounce-throttle',
  'ts-type-sets',
  'ts-narrowing-flow',
  'ts-utility-types',
  'ts-type-vs-interface',
];

async function renderViz(id: string) {
  const Viz = vizRegistry[id]!;
  render(
    <Suspense fallback={<p>loading</p>}>
      <Viz />
    </Suspense>,
  );
  return screen.findByRole('region', { name: /^Visualization:/ });
}

/** The "Step n / m" counter text. */
function counter(): string {
  return screen.getByText(/^Step \d+ \/ \d+$/).textContent ?? '';
}

/** Presses Next until it is disabled, returning how many steps there were. */
async function stepThrough(user: ReturnType<typeof userEvent.setup>): Promise<number> {
  let steps = 1;
  for (;;) {
    const next = screen.getByRole('button', { name: 'Next step' });
    if ((next as HTMLButtonElement).disabled) return steps;
    await user.click(next);
    steps += 1;
    if (steps > 50) throw new Error('Next never disables');
  }
}

afterEach(() => {
  vi.useRealTimers();
});

describe('visualization registry', () => {
  it('registers every required visualization', () => {
    for (const id of REQUIRED_IDS) expect(vizIds, id).toContain(id);
  });

  it('uses kebab-case ids with a track prefix', () => {
    for (const id of vizIds) expect(id).toMatch(/^(py|js|ts)-[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

// Rendering and clicking through every step is slow under jsdom; give these room.
describe.each(vizIds.map((id) => [id]))('%s', { timeout: 30_000 }, (id) => {
  it('renders inside VizFrame and steps from start to end and back', async () => {
    const user = userEvent.setup();
    expect(await renderViz(id)).toBeInTheDocument();

    // The debounce/throttle demo is live and the == table is an explorer: no stepper.
    if (!screen.queryByRole('button', { name: 'Next step' })) return;

    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled();
    const steps = await stepThrough(user);
    expect(steps).toBeGreaterThan(1);
    expect(counter()).toBe(`Step ${steps} / ${steps}`);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(counter()).toBe(`Step 1 / ${steps}`);
  });

  it('restarts and steps through every preset', async () => {
    const user = userEvent.setup();
    await renderViz(id);
    const group = screen.queryByRole('group');
    if (!group || !screen.queryByRole('button', { name: 'Next step' })) return;

    // Choosing a preset remounts the stepper (and the chips), so re-query each one by name.
    const names = within(group)
      .getAllByRole('button')
      .map((button) => button.textContent ?? '');
    expect(names.length).toBeGreaterThan(1);

    for (const name of names) {
      await user.click(within(screen.getByRole('group')).getByRole('button', { name }));
      const chip = within(screen.getByRole('group')).getByRole('button', { name });
      expect(chip).toHaveAttribute('aria-pressed', 'true');
      expect(counter()).toMatch(/^Step 1 \//);
      expect(await stepThrough(user)).toBeGreaterThan(1);
    }
  });
});

describe('step controls', () => {
  it('plays automatically only after Play is pressed, and stops at the end', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderViz('py-generator-stepper');

    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(counter()).toBe('Step 1 / 5');

    await user.click(screen.getByRole('button', { name: 'Play' }));
    await act(() => vi.advanceTimersByTimeAsync(2300));
    expect(counter()).toBe('Step 2 / 5');

    // Each auto-advance schedules the next one after React re-renders, so advance step by step.
    for (let i = 0; i < 6; i++) await act(() => vi.advanceTimersByTimeAsync(2300));
    expect(counter()).toBe('Step 5 / 5');
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('steps with the arrow keys while focus is inside the frame', async () => {
    const user = userEvent.setup();
    await renderViz('js-hoisting-tdz');
    screen.getByRole('button', { name: 'Play' }).focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(counter()).toMatch(/^Step 3 \//);
    await user.keyboard('{ArrowLeft}');
    expect(counter()).toMatch(/^Step 2 \//);
  });
});

describe('== explanation', () => {
  it('agrees with the real == operator for every pair in the table', () => {
    for (const left of EQUALITY_VALUES) {
      for (const right of EQUALITY_VALUES) {
        const { result, steps } = explainLooseEquality(left.value, right.value);
        expect(result, `${left.label} == ${right.label}`).toBe(left.value == right.value);
        expect(steps.length).toBeGreaterThan(0);
      }
    }
  });

  it('explains the classic [] == false', () => {
    const { result, steps } = explainLooseEquality([], false);
    expect(result).toBe(true);
    expect(steps.join(' ')).toMatch(/boolean is converted to a number/);
    expect(steps.join(' ')).toMatch(/converted to a primitive/);
  });
});

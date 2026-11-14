import { cn } from '@/lib/cn';
import { CodePane } from '../shared/parts';
import { StepViz, type VizStep } from '../shared/StepViz';

const CODE = `def bold(fn):
    def wrapper():
        return "<b>" + fn() + "</b>"
    return wrapper

def italic(fn):
    def wrapper():
        return "<i>" + fn() + "</i>"
    return wrapper

@bold
@italic
def greet():
    return "hi"

print(greet())`;

type Layer = 'bold' | 'italic' | 'greet';

interface State {
  line: number | number[];
  /** Which layers exist so far (outermost first). */
  layers: Layer[];
  /** Layer currently executing. */
  active?: Layer;
  /** Value each layer has returned so far. */
  returns: Partial<Record<Layer, string>>;
  output?: string;
}

const LABEL: Record<Layer, string> = {
  bold: 'bold → wrapper()',
  italic: 'italic → wrapper()',
  greet: 'greet()  (original)',
};

const steps: VizStep<State>[] = [
  {
    text: 'Start with the plain function greet.',
    state: { line: [13, 14], layers: ['greet'], returns: {} },
  },
  {
    text: 'Decorators apply bottom-up. @italic is closest to the function, so it wraps first: greet = italic(greet).',
    bn: 'Decorator নিচ থেকে উপরে apply হয় — function-এর সবচেয়ে কাছেরটা আগে।',
    state: { line: 12, layers: ['italic', 'greet'], returns: {} },
  },
  {
    text: 'Then @bold wraps the result: greet = bold(italic(greet)). The name greet now refers to the OUTERMOST wrapper.',
    bn: 'এখন greet নামটা আসল function না, সবচেয়ে বাইরের wrapper-কে বোঝায়।',
    state: { line: 11, layers: ['bold', 'italic', 'greet'], returns: {} },
  },
  {
    text: 'Calling greet() enters the outermost wrapper first — bold.',
    state: { line: 16, layers: ['bold', 'italic', 'greet'], active: 'bold', returns: {} },
  },
  {
    text: "bold's wrapper calls fn(), which is italic's wrapper.",
    state: { line: 3, layers: ['bold', 'italic', 'greet'], active: 'italic', returns: {} },
  },
  {
    text: 'italic\'s wrapper calls fn(), the original greet, which returns "hi".',
    state: {
      line: 14,
      layers: ['bold', 'italic', 'greet'],
      active: 'greet',
      returns: { greet: '"hi"' },
    },
  },
  {
    text: 'Results travel back outwards: italic adds its tags around "hi".',
    state: {
      line: 8,
      layers: ['bold', 'italic', 'greet'],
      active: 'italic',
      returns: { greet: '"hi"', italic: '"<i>hi</i>"' },
    },
  },
  {
    text: 'bold adds its tags last, so it ends up on the outside: calls go outside-in, results come back inside-out.',
    bn: 'Call ঢোকে বাইরে থেকে ভেতরে, আর result ফেরে ভেতর থেকে বাইরে — তাই উপরের decorator-এর tag সবার বাইরে।',
    state: {
      line: 3,
      layers: ['bold', 'italic', 'greet'],
      active: 'bold',
      returns: { greet: '"hi"', italic: '"<i>hi</i>"', bold: '"<b><i>hi</i></b>"' },
      output: '<b><i>hi</i></b>',
    },
  },
];

function Layers({ state, depth = 0 }: { state: State; depth?: number }) {
  const layer = state.layers[depth];
  if (!layer) return null;
  const active = state.active === layer;
  const returned = state.returns[layer];
  return (
    <div
      className={cn(
        'rounded-lg border p-2.5 transition-colors',
        active ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
        layer === 'greet' && !active && 'border-dashed',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span className={cn('font-mono text-xs', active && 'font-semibold text-accent-text')}>
          {LABEL[layer]}
        </span>
        {returned ? (
          <span className="rounded-md bg-level-foundation/10 px-1.5 py-0.5 font-mono text-[0.6875rem] break-all text-level-foundation">
            returns {returned}
          </span>
        ) : null}
      </div>
      {depth < state.layers.length - 1 ? (
        <div className="mt-2">
          <Layers state={state} depth={depth + 1} />
        </div>
      ) : null}
    </div>
  );
}

export default function DecoratorWrappingViz() {
  return (
    <StepViz
      title="Stacked decorators"
      caption="Each decorator wraps the function in another layer. See the order of wrapping, then the call flowing through."
      steps={steps}
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,17rem)_1fr]">
          <CodePane code={CODE} active={state.line} />
          <div>
            <Layers state={state} />
            <p className="mt-3 min-h-6 font-mono text-xs">
              {state.output ? (
                <>
                  <span className="text-subtle">output › </span>
                  {state.output}
                </>
              ) : null}
            </p>
          </div>
        </div>
      )}
    </StepViz>
  );
}

import { CodePane } from '../shared/parts';
import { RefGraph, type RefEdge, type RefNode } from '../shared/RefGraph';
import { StepViz, type VizStep } from '../shared/StepViz';

const CODE = `a = [1, 2]
b = a
b.append(3)
print(a is b, a == b)
b = [1, 2, 3]
print(a is b, a == b)
x = 10
x = x + 1`;

interface State {
  line: number;
  nodes: RefNode[];
  edges: RefEdge[];
  output?: string;
}

const name = (id: string, row: number): RefNode => ({ id, col: 0, row, title: id });
const obj = (
  id: string,
  row: number,
  type: string,
  value: string,
  extra: Partial<RefNode> = {},
): RefNode => ({ id, col: 1, row, title: type, body: value, ...extra });

const steps: VizStep<State>[] = [
  {
    text: 'A list object is created, and the name a is bound to it. A name is a label on an object, not a box holding it.',
    bn: 'একটা list object তৈরি হলো, আর a নামটা তার গায়ে label হিসেবে বসল।',
    state: {
      line: 1,
      nodes: [name('a', 0), obj('L1', 0, 'list', '[1, 2]', { tone: 'accent' })],
      edges: [{ from: 'a', to: 'L1', tone: 'accent' }],
    },
  },
  {
    text: 'b = a copies the reference, not the list. Now two names point at one object.',
    bn: 'Assignment list কপি করে না — b আর a এখন একই object-এর দুটো নাম।',
    state: {
      line: 2,
      nodes: [name('a', 0), name('b', 1), obj('L1', 0, 'list', '[1, 2]', { tone: 'accent' })],
      edges: [
        { from: 'a', to: 'L1', tone: 'accent' },
        { from: 'b', to: 'L1', tone: 'accent' },
      ],
    },
  },
  {
    text: 'Mutating through b changes the single shared object in place — a sees the change too.',
    bn: 'b দিয়ে mutate করলে object-টাই বদলায়, তাই a দিয়েও নতুন value দেখা যায়।',
    state: {
      line: 3,
      nodes: [name('a', 0), name('b', 1), obj('L1', 0, 'list', '[1, 2, 3]', { tone: 'amber' })],
      edges: [
        { from: 'a', to: 'L1', tone: 'amber' },
        { from: 'b', to: 'L1', tone: 'amber' },
      ],
    },
  },
  {
    text: '`is` asks "same object?" and `==` asks "equal value?". Here both are True.',
    state: {
      line: 4,
      output: 'True True',
      nodes: [name('a', 0), name('b', 1), obj('L1', 0, 'list', '[1, 2, 3]', { tone: 'accent' })],
      edges: [
        { from: 'a', to: 'L1', tone: 'accent' },
        { from: 'b', to: 'L1', tone: 'accent' },
      ],
    },
  },
  {
    text: 'Rebinding: b = [...] creates a NEW list and moves the label b to it. The object a points to is untouched.',
    bn: 'Rebinding মানে নামটা নতুন object-এ সরে যাওয়া — পুরনো object-এ কোনো পরিবর্তন হয় না।',
    state: {
      line: 5,
      nodes: [
        name('a', 0),
        name('b', 1),
        obj('L1', 0, 'list', '[1, 2, 3]', { tone: 'accent' }),
        obj('L2', 1, 'list', '[1, 2, 3]', { tone: 'green' }),
      ],
      edges: [
        { from: 'a', to: 'L1', tone: 'accent' },
        { from: 'b', to: 'L2', tone: 'green' },
      ],
    },
  },
  {
    text: 'Equal values, different objects: `is` is now False while `==` is still True.',
    state: {
      line: 6,
      output: 'False True',
      nodes: [
        name('a', 0),
        name('b', 1),
        obj('L1', 0, 'list', '[1, 2, 3]', { tone: 'accent' }),
        obj('L2', 1, 'list', '[1, 2, 3]', { tone: 'green' }),
      ],
      edges: [
        { from: 'a', to: 'L1', tone: 'accent' },
        { from: 'b', to: 'L2', tone: 'green' },
      ],
    },
  },
  {
    text: 'x is bound to the int object 10.',
    state: {
      line: 7,
      nodes: [
        name('a', 0),
        name('b', 1),
        name('x', 2),
        obj('L1', 0, 'list', '[1, 2, 3]'),
        obj('L2', 1, 'list', '[1, 2, 3]'),
        obj('I10', 2, 'int', '10', { tone: 'accent' }),
      ],
      edges: [
        { from: 'a', to: 'L1' },
        { from: 'b', to: 'L2' },
        { from: 'x', to: 'I10', tone: 'accent' },
      ],
    },
  },
  {
    text: 'ints are immutable: x + 1 builds a new int 11 and rebinds x. The old 10 was never modified.',
    bn: 'Immutable object বদলানো যায় না — নতুন int তৈরি হয়ে x সেটার দিকে সরে যায়।',
    state: {
      line: 8,
      nodes: [
        name('a', 0),
        name('b', 1),
        name('x', 2),
        obj('L1', 0, 'list', '[1, 2, 3]'),
        obj('L2', 1, 'list', '[1, 2, 3]'),
        obj('I10', 2, 'int', '10', { dim: true }),
        obj('I11', 3, 'int', '11', { tone: 'green' }),
      ],
      edges: [
        { from: 'a', to: 'L1' },
        { from: 'b', to: 'L2' },
        { from: 'x', to: 'I11', tone: 'green' },
      ],
    },
  },
];

export default function ReferenceModelViz() {
  return (
    <StepViz
      title="Names and objects"
      caption="Variables are names bound to objects. Watch the difference between mutating an object and rebinding a name."
      steps={steps}
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,13rem)_1fr]">
          <div>
            <CodePane code={CODE} active={state.line} />
            <p className="mt-2 min-h-6 font-mono text-xs text-muted">
              {state.output ? (
                <>
                  <span className="text-subtle">output › </span>
                  <span className="text-fg">{state.output}</span>
                </>
              ) : null}
            </p>
          </div>
          <RefGraph
            label="Names on the left pointing at objects on the right"
            columns={['Names', 'Objects']}
            nodes={state.nodes}
            edges={state.edges}
            minRows={4}
          />
        </div>
      )}
    </StepViz>
  );
}

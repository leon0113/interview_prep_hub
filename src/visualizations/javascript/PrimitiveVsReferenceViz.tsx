import { CodePane } from '../shared/parts';
import { RefGraph, type RefEdge, type RefNode } from '../shared/RefGraph';
import { StepViz, type VizStep } from '../shared/StepViz';

const CODE = `let a = 10;
let b = a;
b = 20;

const u1 = { name: "Rafi" };
const u2 = u1;
u2.name = "Nadia";
const u3 = { ...u1 };
u1 === u2;  u1 === u3;`;

interface State {
  line: number;
  nodes: RefNode[];
  edges: RefEdge[];
  output?: string;
}

/** A stack slot: primitives show their value inline, references show a pointer. */
const slot = (id: string, row: number, value: string, tone?: RefNode['tone']): RefNode => ({
  id,
  col: 0,
  row,
  title: id,
  body: value,
  tone,
});
const heap = (id: string, row: number, value: string, tone?: RefNode['tone']): RefNode => ({
  id,
  col: 1,
  row,
  title: 'object',
  body: value,
  tone,
});

const steps: VizStep<State>[] = [
  {
    text: 'A primitive lives directly in the variable: a holds the value 10 itself.',
    state: { line: 1, nodes: [slot('a', 0, '10', 'accent')], edges: [] },
  },
  {
    text: 'b = a copies the VALUE. There are now two independent 10s.',
    bn: 'Primitive কপি করলে value-টাই কপি হয় — দুটো variable সম্পূর্ণ আলাদা।',
    state: { line: 2, nodes: [slot('a', 0, '10'), slot('b', 1, '10', 'accent')], edges: [] },
  },
  {
    text: 'Changing b does nothing to a.',
    state: { line: 3, nodes: [slot('a', 0, '10'), slot('b', 1, '20', 'amber')], edges: [] },
  },
  {
    text: 'An object is stored on the heap. The variable u1 holds only a reference (an address) to it.',
    bn: 'Object থাকে heap-এ; variable-এর কাছে থাকে শুধু তার ঠিকানা।',
    state: {
      line: 5,
      nodes: [
        slot('a', 0, '10'),
        slot('b', 1, '20'),
        slot('u1', 2, '→ ref', 'accent'),
        heap('H1', 2, '{name:"Rafi"}', 'accent'),
      ],
      edges: [{ from: 'u1', to: 'H1', tone: 'accent' }],
    },
  },
  {
    text: 'u2 = u1 copies the REFERENCE, not the object. Two variables, one object.',
    state: {
      line: 6,
      nodes: [
        slot('a', 0, '10'),
        slot('b', 1, '20'),
        slot('u1', 2, '→ ref', 'accent'),
        slot('u2', 3, '→ ref', 'accent'),
        heap('H1', 2, '{name:"Rafi"}', 'accent'),
      ],
      edges: [
        { from: 'u1', to: 'H1', tone: 'accent' },
        { from: 'u2', to: 'H1', tone: 'accent' },
      ],
    },
  },
  {
    text: 'Mutating through u2 changes the shared object, so u1.name is "Nadia" too. (const only stops reassignment, not mutation.)',
    bn: 'একই object-এর দুটো reference — একটা দিয়ে বদলালে অন্যটাতেও দেখা যায়।',
    state: {
      line: 7,
      nodes: [
        slot('a', 0, '10'),
        slot('b', 1, '20'),
        slot('u1', 2, '→ ref', 'amber'),
        slot('u2', 3, '→ ref', 'amber'),
        heap('H1', 2, '{name:"Nadia"}', 'amber'),
      ],
      edges: [
        { from: 'u1', to: 'H1', tone: 'amber' },
        { from: 'u2', to: 'H1', tone: 'amber' },
      ],
    },
  },
  {
    text: 'Spreading creates a NEW object with the same properties (a shallow copy). u3 points somewhere else.',
    state: {
      line: 8,
      nodes: [
        slot('a', 0, '10'),
        slot('b', 1, '20'),
        slot('u1', 2, '→ ref'),
        slot('u2', 3, '→ ref'),
        slot('u3', 4, '→ ref', 'green'),
        heap('H1', 2, '{name:"Nadia"}'),
        heap('H2', 4, '{name:"Nadia"}', 'green'),
      ],
      edges: [
        { from: 'u1', to: 'H1' },
        { from: 'u2', to: 'H1' },
        { from: 'u3', to: 'H2', tone: 'green' },
      ],
    },
  },
  {
    text: '=== on objects compares references: u1 === u2 is true (same object), u1 === u3 is false (equal content, different object).',
    bn: 'Object-এর তুলনায় ভেতরের data দেখা হয় না, দেখা হয় ঠিকানা এক কি না।',
    state: {
      line: 9,
      output: 'true  false',
      nodes: [
        slot('a', 0, '10'),
        slot('b', 1, '20'),
        slot('u1', 2, '→ ref', 'accent'),
        slot('u2', 3, '→ ref', 'accent'),
        slot('u3', 4, '→ ref', 'green'),
        heap('H1', 2, '{name:"Nadia"}', 'accent'),
        heap('H2', 4, '{name:"Nadia"}', 'green'),
      ],
      edges: [
        { from: 'u1', to: 'H1', tone: 'accent' },
        { from: 'u2', to: 'H1', tone: 'accent' },
        { from: 'u3', to: 'H2', tone: 'green' },
      ],
    },
  },
];

export default function PrimitiveVsReferenceViz() {
  return (
    <StepViz
      title="Primitive vs reference"
      caption="Primitives are copied by value; objects are shared by reference. Stack on the left, heap on the right."
      steps={steps}
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @lg:grid-cols-[minmax(0,15rem)_1fr]">
          <div>
            <CodePane code={CODE} active={state.line} />
            <p className="mt-2 min-h-6 font-mono text-xs text-muted">
              {state.output ? (
                <>
                  <span className="text-subtle">result › </span>
                  <span className="text-fg">{state.output}</span>
                </>
              ) : null}
            </p>
          </div>
          <RefGraph
            label="Variables on the stack; objects on the heap with references between them"
            columns={['Stack (variables)', 'Heap (objects)']}
            nodes={state.nodes}
            edges={state.edges}
            minRows={5}
          />
        </div>
      )}
    </StepViz>
  );
}

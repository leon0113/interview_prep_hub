import { CodePane } from '../shared/parts';
import { RefGraph, type RefEdge, type RefNode } from '../shared/RefGraph';
import { StepViz, type VizStep } from '../shared/StepViz';

const CODE = `import copy
a = [[1, 2], [3, 4]]
b = copy.copy(a)       # shallow
c = copy.deepcopy(a)   # deep
a[0].append(99)
a.append([5, 6])`;

interface State {
  line: number;
  nodes: RefNode[];
  edges: RefEdge[];
}

const N = {
  a: { id: 'a', col: 0, row: 0, title: 'a' },
  b: { id: 'b', col: 0, row: 1, title: 'b' },
  c: { id: 'c', col: 0, row: 2, title: 'c' },
} satisfies Record<string, RefNode>;

const outer = (id: string, row: number, items: number, tone?: RefNode['tone']): RefNode => ({
  id,
  col: 1,
  row,
  title: 'list',
  body: `${items} items`,
  tone,
});
const inner = (id: string, row: number, value: string, tone?: RefNode['tone']): RefNode => ({
  id,
  col: 2,
  row,
  title: 'list',
  body: value,
  tone,
});

const aEdges: RefEdge[] = [
  { from: 'a', to: 'OA', tone: 'accent' },
  { from: 'OA', to: 'I1', tone: 'accent' },
  { from: 'OA', to: 'I2', tone: 'accent' },
];
const bEdges: RefEdge[] = [
  { from: 'b', to: 'OB', tone: 'amber' },
  { from: 'OB', to: 'I1', tone: 'amber' },
  { from: 'OB', to: 'I2', tone: 'amber' },
];
const cEdges: RefEdge[] = [
  { from: 'c', to: 'OC', tone: 'green' },
  { from: 'OC', to: 'C1', tone: 'green' },
  { from: 'OC', to: 'C2', tone: 'green' },
];

const steps: VizStep<State>[] = [
  {
    text: 'a is an outer list that holds references to two inner lists.',
    bn: 'বাইরের list-টা ভেতরের list গুলোকে ধরে রাখে না — শুধু তাদের reference রাখে।',
    state: {
      line: 2,
      nodes: [N.a, outer('OA', 0, 2, 'accent'), inner('I1', 0, '[1, 2]'), inner('I2', 1, '[3, 4]')],
      edges: aEdges,
    },
  },
  {
    text: 'Shallow copy: a NEW outer list, but its slots point at the SAME inner lists as a.',
    bn: 'Shallow copy শুধু বাইরের স্তরটা নতুন বানায়; ভেতরের object গুলো shared থাকে।',
    state: {
      line: 3,
      nodes: [
        N.a,
        N.b,
        outer('OA', 0, 2, 'accent'),
        outer('OB', 1, 2, 'amber'),
        inner('I1', 0, '[1, 2]'),
        inner('I2', 1, '[3, 4]'),
      ],
      edges: [...aEdges, ...bEdges],
    },
  },
  {
    text: 'Deep copy: a new outer list AND recursively copied inner lists. Nothing is shared with a.',
    bn: 'Deep copy সব স্তর আলাদা করে কপি করে — মূলটার সাথে আর কোনো সম্পর্ক থাকে না।',
    state: {
      line: 4,
      nodes: [
        N.a,
        N.b,
        N.c,
        outer('OA', 0, 2, 'accent'),
        outer('OB', 1, 2, 'amber'),
        outer('OC', 2, 2, 'green'),
        inner('I1', 0, '[1, 2]'),
        inner('I2', 1, '[3, 4]'),
        inner('C1', 2, '[1, 2]', 'green'),
        inner('C2', 3, '[3, 4]', 'green'),
      ],
      edges: [...aEdges, ...bEdges, ...cEdges],
    },
  },
  {
    text: 'Mutating an inner list through a: b[0] shows 99 as well (shared object). c[0] is unaffected.',
    bn: 'এটাই shallow copy-র ফাঁদ: nested object বদলালে copy-তেও সেই বদল দেখা যায়।',
    state: {
      line: 5,
      nodes: [
        N.a,
        N.b,
        N.c,
        outer('OA', 0, 2, 'accent'),
        outer('OB', 1, 2, 'amber'),
        outer('OC', 2, 2, 'green'),
        inner('I1', 0, '[1, 2, 99]', 'pink'),
        inner('I2', 1, '[3, 4]'),
        inner('C1', 2, '[1, 2]', 'green'),
        inner('C2', 3, '[3, 4]', 'green'),
      ],
      edges: [...aEdges, ...bEdges, ...cEdges],
    },
  },
  {
    text: 'Appending to the outer list of a changes only a: the outer lists are separate, so b still has 2 items.',
    state: {
      line: 6,
      nodes: [
        N.a,
        N.b,
        N.c,
        outer('OA', 0, 3, 'accent'),
        outer('OB', 1, 2, 'amber'),
        outer('OC', 2, 2, 'green'),
        inner('I1', 0, '[1, 2, 99]'),
        inner('I2', 1, '[3, 4]'),
        inner('C1', 2, '[1, 2]', 'green'),
        inner('C2', 3, '[3, 4]', 'green'),
        inner('I3', 4, '[5, 6]', 'accent'),
      ],
      edges: [...aEdges, { from: 'OA', to: 'I3', tone: 'accent' }, ...bEdges, ...cEdges],
    },
  },
];

export default function ShallowVsDeepCopyViz() {
  return (
    <StepViz
      title="Shallow copy vs deep copy"
      caption="Follow the arrows: a shallow copy shares the inner objects, a deep copy does not."
      steps={steps}
    >
      {(state) => (
        <div className="grid gap-3 *:min-w-0 @xl:grid-cols-[minmax(0,15rem)_1fr]">
          <CodePane code={CODE} active={state.line} className="self-start" />
          <RefGraph
            label="Names, outer lists and inner lists with their references"
            columns={['Names', 'Outer lists', 'Inner lists']}
            nodes={state.nodes}
            edges={state.edges}
            minRows={5}
          />
        </div>
      )}
    </StepViz>
  );
}

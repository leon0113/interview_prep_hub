/**
 * Data-structure topics of the LeetCode area: the theory (my notes, verbatim) plus the
 * problems that belong to it (problems point here with `topicId`). Add a topic by writing
 * `<id>.md` (the notes) and `<id>.ts` (wiring), then listing it below.
 */

export interface LcTopicMeta {
  id: string;
  title: string;
  /** One line for cards and search. */
  description: string;
  order: number;
  /** Number of the notes section that holds the practice list (marks solved ones). */
  practiceGroupTitle?: string;
}

export interface LcTopicContent {
  id: string;
  /** The notes, verbatim (Markdown, Bangla + English). */
  notes: string;
  /** Visualizations shown under a notes section, keyed by its number ("9" → section 9). */
  sectionVisualizations: Record<string, string[]>;
}

export const topicMetas: LcTopicMeta[] = [
  {
    id: 'linked-list',
    title: 'Linked List',
    description:
      'Nodes and pointers: traversal, insert / delete, reverse, slow & fast pointers, doubly and circular lists, LRU cache.',
    order: 1,
    practiceGroupTitle: 'Linked list',
  },
];

const topicModules: Record<string, () => Promise<{ default: LcTopicContent }>> = {
  'linked-list': () => import('./linked-list'),
};

export function getTopicMeta(id: string | undefined): LcTopicMeta | undefined {
  return topicMetas.find((t) => t.id === id);
}

export async function loadTopic(id: string): Promise<LcTopicContent | undefined> {
  const load = topicModules[id];
  return load ? (await load()).default : undefined;
}

export interface NotesSection {
  /** Anchor id, e.g. "section-9". */
  id: string;
  /** Leading number of the heading ("9" for "## 9. Reverse ..."), if any. */
  number?: string;
  title: string;
  /** Markdown body, without the heading line. */
  body: string;
}

/**
 * Splits notes into the text before the first `## ` heading (intro) and one entry per `## `
 * section. The document title (`# …`) and the notes' own table of contents are dropped:
 * the page renders its own header and "On this page" list.
 */
export function splitNotes(markdown: string): { intro: string; sections: NotesSection[] } {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const intro: string[] = [];
  const sections: NotesSection[] = [];
  let current: { title: string; body: string[] } | null = null;
  let inFence = false;

  const flush = () => {
    if (!current) return;
    const number = /^(\d+)\./.exec(current.title)?.[1];
    if (!/সূচিপত্র/.test(current.title)) {
      sections.push({
        id: number ? `section-${number}` : `section-${sections.length + 1}`,
        number,
        title: current.title,
        body: current.body.join('\n').trim(),
      });
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) inFence = !inFence;
    if (!inFence && line.startsWith('## ')) {
      flush();
      current = { title: line.slice(3).trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    } else if (!line.startsWith('# ')) {
      intro.push(line);
    }
  }
  flush();
  return {
    intro: intro
      .join('\n')
      .replace(/^\s*---\s*$/gm, '')
      .trim(),
    sections: sections.map((s) => ({ ...s, body: s.body.replace(/\n---\s*$/, '').trim() })),
  };
}

/**
 * In the notes, a plain fence that follows an "Output" label (e.g. "**Output:**" or
 * "**Data sample ও Output:**", possibly after the sample code) is program output. Tag it
 * as ```output so it renders like the rest of the app's output blocks.
 */
export function markOutputFences(markdown: string): string {
  const lines = markdown.split('\n');
  let inFence = false;
  let pendingOutput = false;
  return lines
    .map((line) => {
      if (line.startsWith('```')) {
        if (!inFence) {
          inFence = true;
          if (line.trim() === '```' && pendingOutput) {
            pendingOutput = false;
            return '```output';
          }
        } else {
          inFence = false;
        }
        return line;
      }
      if (!inFence) {
        if (/^#{1,6}\s/.test(line)) pendingOutput = false;
        else if (/Output/.test(line)) pendingOutput = true;
      }
      return line;
    })
    .join('\n');
}

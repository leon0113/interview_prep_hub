import type { LcTopicContent } from '.';
import notes from './linked-list.md?raw';

/** Linked List theory: my notes (linked-list.md, verbatim) and where visualizations go. */
const topic: LcTopicContent = {
  id: 'linked-list',
  notes,
  sectionVisualizations: {
    '6': ['lc-ll-design'], // Insertion
    '7': ['lc-ll-remove-val'], // Deletion (#203: dummy + prev)
    '9': ['lc-ll-reverse'], // Reverse
    '13': ['lc-ll-slow-fast', 'lc-ll-remove-nth'], // Slow / fast: middle, cycle, n-th from end
    // Advanced problems: palindrome, duplicates (14.3), then #160 and #328
    '14': ['lc-ll-palindrome', 'lc-ll-dedupe', 'lc-ll-intersection', 'lc-ll-odd-even'],
  },
};

export default topic;

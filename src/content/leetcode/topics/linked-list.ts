import type { LcTopicContent } from '.';
import notes from './linked-list.md?raw';

/** Linked List theory: my notes (linked-list.md, verbatim) and where visualizations go. */
const topic: LcTopicContent = {
  id: 'linked-list',
  notes,
  sectionVisualizations: {
    '6': ['lc-ll-design'], // Insertion
    '9': ['lc-ll-reverse'], // Reverse
    '13': ['lc-ll-slow-fast'], // Slow / fast pointers: middle and cycle
    '14': ['lc-ll-palindrome'], // Palindrome check (middle + reverse + compare)
  },
};

export default topic;

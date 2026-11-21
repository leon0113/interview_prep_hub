import type { LcProblem } from '../schema';
import removeDuplicates from './26-remove-duplicates-from-sorted-array';
import removeElement from './27-remove-element';
import mergeSortedArray from './88-merge-sorted-array';
import bestTimeToBuyAndSellStock from './121-best-time-to-buy-and-sell-stock';
import singleNumber from './136-single-number';
import powerOfTwo from './231-power-of-two';
import missingNumber from './268-missing-number';
import moveZeroes from './283-move-zeroes';
import reverseString from './344-reverse-string';
import maxConsecutiveOnes from './485-max-consecutive-ones';
import fibonacciNumber from './509-fibonacci-number';
import binarySearch from './704-binary-search';
import sortAnArray from './912-sort-an-array';
import linkedListCycle from './141-linked-list-cycle';
import reverseLinkedList from './206-reverse-linked-list';
import palindromeLinkedList from './234-palindrome-linked-list';
import designLinkedList from './707-design-linked-list';
import middleOfTheLinkedList from './876-middle-of-the-linked-list';
import intersectionOfTwoLinkedLists from './160-intersection-of-two-linked-lists';
import removeLinkedListElements from './203-remove-linked-list-elements';
import removeNthNodeFromEndOfList from './19-remove-nth-node-from-end-of-list';
import removeDuplicatesFromSortedList from './83-remove-duplicates-from-sorted-list';
import oddEvenLinkedList from './328-odd-even-linked-list';

/**
 * Every DSA problem, in the order of docs/leetcode-notes.md (Section 1 → Section 10). A new
 * problem file is added here too (see CLAUDE.md, "LeetCode intake").
 */
export const dsaProblems: LcProblem[] = [
  removeElement,
  removeDuplicates,
  moveZeroes,
  reverseString,
  mergeSortedArray,
  bestTimeToBuyAndSellStock,
  maxConsecutiveOnes,
  missingNumber,
  singleNumber,
  powerOfTwo,
  fibonacciNumber,
  binarySearch,
  sortAnArray,
  // Linked List topic
  designLinkedList,
  middleOfTheLinkedList,
  reverseLinkedList,
  linkedListCycle,
  palindromeLinkedList,
  intersectionOfTwoLinkedLists,
  removeLinkedListElements,
  removeNthNodeFromEndOfList,
  removeDuplicatesFromSortedList,
  oddEvenLinkedList,
];

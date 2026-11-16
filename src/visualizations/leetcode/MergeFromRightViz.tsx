import problem from '@/content/leetcode/dsa/88-merge-sorted-array';
import ArrayPointersViz from './ArrayPointersViz';
import { stepsOf } from './steps';

const states = stepsOf(problem);

/** #88: nums1 and nums2 with their own pointers, filled from the back, with a move arrow. */
export default function MergeFromRightViz() {
  return (
    <ArrayPointersViz
      title="Merge from the right"
      caption="The bigger of nums1[p1] and nums2[p2] goes to the last empty slot i. The arrow shows which value moves where."
      states={states}
    />
  );
}

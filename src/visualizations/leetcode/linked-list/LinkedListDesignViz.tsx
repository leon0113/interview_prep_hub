import { designSteps } from './linkedListSteps';
import { LLStepViz } from './LLStepViz';

const STEPS = designSteps();

/** #707 and notes §6–8: add at head / tail / index, get and delete, walking to index - 1. */
export default function LinkedListDesignViz() {
  return (
    <LLStepViz
      title="Linked list operations"
      caption="LeetCode #707's example: insert and delete walk curr to the node before the index, then rewire next. size keeps index checks O(1)."
      steps={STEPS}
    />
  );
}

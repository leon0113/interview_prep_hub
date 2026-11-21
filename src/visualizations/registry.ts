import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export type VizComponent = LazyExoticComponent<ComponentType>;

/**
 * id -> lazy visualization component. Each one is its own chunk, downloaded only when a
 * question's "Visualize" tab is opened. A question links to one via `visualizationId`;
 * tests/content.test.ts fails if a question references an id that is not registered here.
 */
export const vizRegistry: Record<string, VizComponent> = {
  // Python
  'py-reference-model': lazy(() => import('./python/ReferenceModelViz')),
  'py-shallow-vs-deep-copy': lazy(() => import('./python/ShallowVsDeepCopyViz')),
  'py-legb-scope': lazy(() => import('./python/LegbScopeViz')),
  'py-decorator-wrapping': lazy(() => import('./python/DecoratorWrappingViz')),
  'py-generator-stepper': lazy(() => import('./python/GeneratorStepperViz')),
  'py-mro-diamond': lazy(() => import('./python/MroDiamondViz')),
  'py-try-except-flow': lazy(() => import('./python/TryExceptFlowViz')),
  'py-gil-concurrency': lazy(() => import('./python/GilConcurrencyViz')),

  // JavaScript
  'js-event-loop': lazy(() => import('./javascript/EventLoopViz')),
  'js-hoisting-tdz': lazy(() => import('./javascript/HoistingTdzViz')),
  'js-closure-scope-chain': lazy(() => import('./javascript/ClosureScopeChainViz')),
  'js-this-binding': lazy(() => import('./javascript/ThisBindingViz')),
  'js-prototype-chain': lazy(() => import('./javascript/PrototypeChainViz')),
  'js-primitive-vs-reference': lazy(() => import('./javascript/PrimitiveVsReferenceViz')),
  'js-coercion-table': lazy(() => import('./javascript/CoercionTableViz')),
  'js-promise-states': lazy(() => import('./javascript/PromiseStatesViz')),
  'js-debounce-throttle': lazy(() => import('./javascript/DebounceThrottleViz')),

  // TypeScript
  'ts-type-sets': lazy(() => import('./typescript/TypeSetsViz')),
  'ts-narrowing-flow': lazy(() => import('./typescript/NarrowingFlowViz')),
  'ts-utility-types': lazy(() => import('./typescript/UtilityTypesViz')),
  'ts-type-vs-interface': lazy(() => import('./typescript/TypeVsInterfaceViz')),

  // LeetCode (problem-specific; the generic array visualizer is driven by each problem's
  // `steps` traces and is not registered here — a problem uses it via 'lc-array-pointers')
  'lc-merge-from-right': lazy(() => import('./leetcode/MergeFromRightViz')),
  'lc-merge-sort-tree': lazy(() => import('./leetcode/MergeSortTreeViz')),
  'lc-recursion-tree': lazy(() => import('./leetcode/RecursionTreeViz')),
  'lc-binary-search-range': lazy(() => import('./leetcode/BinarySearchRangeViz')),
  'lc-hash-map-count': lazy(() => import('./leetcode/HashMapCountViz')),
  // Linked List topic
  'lc-ll-design': lazy(() => import('./leetcode/linked-list/LinkedListDesignViz')),
  'lc-ll-reverse': lazy(() => import('./leetcode/linked-list/LinkedListReverseViz')),
  'lc-ll-slow-fast': lazy(() => import('./leetcode/linked-list/LinkedListSlowFastViz')),
  'lc-ll-palindrome': lazy(() => import('./leetcode/linked-list/LinkedListPalindromeViz')),
  'lc-ll-remove-val': lazy(() => import('./leetcode/linked-list/LinkedListRemoveValViz')),
  'lc-ll-dedupe': lazy(() => import('./leetcode/linked-list/LinkedListDedupeViz')),
  'lc-ll-remove-nth': lazy(() => import('./leetcode/linked-list/LinkedListRemoveNthViz')),
  'lc-ll-intersection': lazy(() => import('./leetcode/linked-list/LinkedListIntersectionViz')),
  'lc-ll-odd-even': lazy(() => import('./leetcode/linked-list/LinkedListOddEvenViz')),
};

/** Problem `visualizationId` that means "animate the problem's own `steps` traces". */
export const LC_ARRAY_POINTERS = 'lc-array-pointers';

export const vizIds: readonly string[] = Object.keys(vizRegistry);

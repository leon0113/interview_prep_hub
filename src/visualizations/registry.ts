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
};

export const vizIds: readonly string[] = Object.keys(vizRegistry);

import type { Track } from '../schema';
import { coverage } from './coverage';
import { exercises } from './exercises';
import { typescriptMeta } from './meta';
import { advancedTypes } from './sections/advanced-types';
import { basics } from './sections/basics';
import { configTooling } from './sections/config-tooling';
import { functionsClasses } from './sections/functions-classes';
import { generics } from './sections/generics';
import { objectsInterfaces } from './sections/objects-interfaces';
import { outputPrediction } from './sections/output-prediction';
import { unionsNarrowing } from './sections/unions-narrowing';

const track: Track = {
  ...typescriptMeta,
  sections: [
    basics,
    objectsInterfaces,
    unionsNarrowing,
    functionsClasses,
    generics,
    advancedTypes,
    configTooling,
    outputPrediction,
  ],
  exercises,
  coverage,
};

export default track;

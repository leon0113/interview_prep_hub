import type { Track } from '../schema';
import { coverage } from './coverage';
import { exercises } from './exercises';
import { javascriptMeta } from './meta';
import { asyncJs } from './sections/async';
import { basics } from './sections/basics';
import { closuresThis } from './sections/closures-this';
import { functions } from './sections/functions';
import { objectsArrays } from './sections/objects-arrays';
import { operators } from './sections/operators';
import { other } from './sections/other';
import { outputPrediction } from './sections/output-prediction';
import { prototypesOop } from './sections/prototypes-oop';
import { scopeHoisting } from './sections/scope-hoisting';

const track: Track = {
  ...javascriptMeta,
  sections: [
    basics,
    scopeHoisting,
    operators,
    functions,
    closuresThis,
    objectsArrays,
    prototypesOop,
    asyncJs,
    other,
    outputPrediction,
  ],
  exercises,
  coverage,
};

export default track;

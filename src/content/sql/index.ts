import type { Track } from '../schema';
import { coverage } from './coverage';
import { exercises } from './exercises';
import { sqlMeta } from './meta';
import { basics } from './sections/basics';
import { design } from './sections/design';
import { indexesPerformance } from './sections/indexes-performance';
import { outputPrediction } from './sections/output-prediction';
import { postgresql } from './sections/postgresql';
import { transactions } from './sections/transactions';
import { viewsFunctionsSecurity } from './sections/views-functions-security';
import { windowFunctions } from './sections/window-functions';

const track: Track = {
  ...sqlMeta,
  sections: [
    basics,
    windowFunctions,
    design,
    indexesPerformance,
    transactions,
    postgresql,
    viewsFunctionsSecurity,
    outputPrediction,
  ],
  exercises,
  coverage,
};

export default track;

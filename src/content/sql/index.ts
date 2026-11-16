import type { Track } from '../schema';
import { coverage } from './coverage';
import { exercises } from './exercises';
import { sqlMeta } from './meta';
import { aggregation } from './sections/aggregation';
import { basics } from './sections/basics';
import { constraints } from './sections/constraints';
import { design } from './sections/design';
import { dml } from './sections/dml';
import { indexesPerformance } from './sections/indexes-performance';
import { joins } from './sections/joins';
import { outputPrediction } from './sections/output-prediction';
import { postgresql } from './sections/postgresql';
import { querying } from './sections/querying';
import { subqueriesCtes } from './sections/subqueries-ctes';
import { transactions } from './sections/transactions';
import { viewsFunctionsSecurity } from './sections/views-functions-security';
import { windowFunctions } from './sections/window-functions';

const track: Track = {
  ...sqlMeta,
  sections: [
    basics,
    querying,
    joins,
    aggregation,
    subqueriesCtes,
    constraints,
    dml,
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

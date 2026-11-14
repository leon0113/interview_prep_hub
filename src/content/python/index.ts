import type { Track } from '../schema';
import { coverage } from './coverage';
import { exercises } from './exercises';
import { pythonMeta } from './meta';
import { advanced } from './sections/advanced';
import { basics } from './sections/basics';
import { dataStructures } from './sections/data-structures';
import { errorsFilesModules } from './sections/errors-files-modules';
import { functions } from './sections/functions';
import { oop } from './sections/oop';
import { outputPrediction } from './sections/output-prediction';
import { strings } from './sections/strings';

const track: Track = {
  ...pythonMeta,
  sections: [
    basics,
    strings,
    dataStructures,
    functions,
    oop,
    errorsFilesModules,
    advanced,
    outputPrediction,
  ],
  exercises,
  coverage,
};

export default track;

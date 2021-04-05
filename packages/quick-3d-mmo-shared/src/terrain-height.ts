
import {NOISE_PARAMS} from './terrain-constants.js';
import {Noise} from './noise.js';

class HeightGenerator {
  noise_: Noise;
  constructor() {
    this.noise_ = new Noise(NOISE_PARAMS);
  }

  Get(x, y, z) {
    return [this.noise_.Get(x, y, z), 1];
  }
};

export {HeightGenerator}
import { NOISE_PARAMS } from "./terrain-constants.js";
import { NoiseGenerator } from "./noise.js";

export class HeightGenerator {
  constructor() {
    this.noise_ = new NoiseGenerator(NOISE_PARAMS);
  }

  Get(x, y, z) {
    return [this.noise_.Get(x, y, z), 1];
  }
}

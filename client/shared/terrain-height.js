import { NOISE_PARAMS } from "./terrain-constants.js";
import { noise } from "./noise.js";

export class HeightGenerator {
  constructor() {
    this.noise_ = new noise.Noise(NOISE_PARAMS);
  }

  Get(x, y, z) {
    return [this.noise_.Get(x, y, z), 1];
  }
}

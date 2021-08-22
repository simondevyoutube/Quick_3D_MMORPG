import { terrain_constants } from "./terrain-constants.mjs";
import { Noise } from "./noise.mjs";

export class HeightGenerator {
  constructor() {
    this.noise_ = new Noise(terrain_constants.NOISE_PARAMS);
  }

  Get(x, y, z) {
    return [this.noise_.Get(x, y, z), 1];
  }
}

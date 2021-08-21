import { noise } from './noise.js'
import { terrain_constants } from './terrain-constants.js'

export const terrain_height = (() => {
  class HeightGenerator {
    constructor() {
      this.noise_ = new noise.Noise(terrain_constants.NOISE_PARAMS)
    }

    Get(x, y, z) {
      return [this.noise_.Get(x, y, z), 1]
    }
  }

  return {
    HeightGenerator: HeightGenerator
  }
})()

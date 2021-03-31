import { SimplexNoise } from './simplex-noise';
class Noise {
  _params: any;
  // would love to add type def to this, but I don't wanna mess with the simplex function. 
  // Super complicated.
  _noise: any;

  constructor(params) {
    this._params = params;
    this._Init();
  }

  _Init() {
    this._noise = new SimplexNoise(this._params.seed);
  }

  Get(x, y, z) {
    const G = 2.0 ** (-this._params.persistence);
    const xs = x / this._params.scale;
    const ys = y / this._params.scale;
    const zs = z / this._params.scale;
    const noiseFunc = this._noise;

    let amplitude = 1.0;
    let frequency = 1.0;
    let normalization = 0;
    let total = 0;
    for (let o = 0; o < this._params.octaves; o++) {
      const noiseValue = noiseFunc.noise3D(
        xs * frequency, ys * frequency, zs * frequency) * 0.5 + 0.5;

      total += noiseValue * amplitude;
      normalization += amplitude;
      amplitude *= G;
      frequency *= this._params.lacunarity;
    }
    total /= normalization;
    return Math.pow(
      total, this._params.exponentiation) * this._params.height;
  }
}

export { Noise }
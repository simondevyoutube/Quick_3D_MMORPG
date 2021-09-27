import { SimplexNoise } from "./simplex.js";

export class Noise {
  constructor(args) {
    this.exponentiation = args.exponentiation
    this.height = args.height
    this.lacunarity = args.lacunarity
    this.octaves = args.octaves
    this.persistence = args.persistence
    this.scale = args.scale
    this.seed = args.seed

    this.noise = new SimplexNoise(this.seed);
  }

  Get(x, y, z) {
    const G = 2.0 ** (-this.persistence);
    const xs = x / this.scale;
    const ys = y / this.scale;
    const zs = z / this.scale;

    let amplitude = 1.0;
    let frequency = 1.0;
    let normalization = 0;
    let total = 0;
    for (let o = 0; o < this.octaves; o++) {
      const noiseValue = this.noise.noise3D(
            xs * frequency,
            ys * frequency,
            zs * frequency,
          ) * 0.5 + 0.5;

      total += noiseValue * amplitude;
      normalization += amplitude;
      amplitude *= G;
      frequency *= this.lacunarity;
    }
    total /= normalization;
    return Math.pow(
      total,
      this.exponentiation,
    ) * this.height;
  }

  get(x, y) {
    const G = 2.0 ** (-this.persistence);
    const xs = x / this.scale;
    const ys = y / this.scale;

    let amplitude = 1.0;
    let frequency = 1.0;
    let normalization = 0;
    let total = 0;

    for (let o = 0; o < this.octaves; o++) {
      const noiseValue = this.noise.noise2D(
            xs * frequency,
            ys * frequency,
          ) * 0.5 + 0.5;

      total += noiseValue * amplitude;
      normalization += amplitude;
      amplitude *= G;
      frequency *= this.lacunarity;
    }
    total /= normalization;
    return Math.pow(
      total,
      this.exponentiation,
    ) * this.height;
  }
}
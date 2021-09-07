const NOISE_HEIGHT = 800.0;
const NOISE_SCALE = 1800.0;

export const terrain_constants = {
  QT_MIN_CELL_SIZE: 128,
  QT_MIN_CELL_RESOLUTION: 16,

  PLANET_RADIUS: 1000,

  NOISE_HEIGHT,
  NOISE_SCALE,

  NOISE_PARAMS: {
    octaves: 10,
    persistence: 0.5,
    lacunarity: 1.6,
    exponentiation: 7.5,
    height: NOISE_HEIGHT,
    scale: NOISE_SCALE,
    seed: 1,
  },
};

export const biome_constants = {
  octaves: 2,
  persistence: 0.5,
  lacunarity: 2.0,
  scale: 1024.0,
  noiseType: "simplex",
  seed: 2,
  exponentiation: 2,
  height: 1.0,
};

export const colour_constants = {
  octaves: 1,
  persistence: 0.5,
  lacunarity: 2.0,
  exponentiation: 1.0,
  scale: 256.0,
  noiseType: "simplex",
  seed: 2,
  height: 1.0,
};
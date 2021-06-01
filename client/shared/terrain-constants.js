export const QT_MIN_CELL_SIZE = 100;
// const QT_MIN_CELL_RESOLUTION = 24;
export const QT_MIN_CELL_RESOLUTION = 16;
// const QT_MIN_CELL_RESOLUTION = 4;
export const PLANET_RADIUS = 8000.0;

export const NOISE_HEIGHT = 800.0;
// const NOISE_HEIGHT = 0.0;
export const NOISE_SCALE = 1800.0;
export const NOISE_PARAMS = {
  octaves: 10,
  persistence: 0.5,
  lacunarity: 1.6,
  exponentiation: 7.5,
  height: NOISE_HEIGHT,
  scale: NOISE_SCALE,
  seed: 1,
};

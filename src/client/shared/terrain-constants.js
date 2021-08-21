export const terrain_constants = (function () {
  const QT_MIN_CELL_SIZE = 100
  // const QT_MIN_CELL_RESOLUTION = 24;
  const QT_MIN_CELL_RESOLUTION = 16
  // const QT_MIN_CELL_RESOLUTION = 4;
  const PLANET_RADIUS = 8000.0

  const NOISE_HEIGHT = 800.0
  // const NOISE_HEIGHT = 0.0;
  const NOISE_SCALE = 1800.0

  return {
    QT_MIN_CELL_SIZE: QT_MIN_CELL_SIZE,
    QT_MIN_CELL_RESOLUTION: QT_MIN_CELL_RESOLUTION,
    PLANET_RADIUS: PLANET_RADIUS,

    NOISE_HEIGHT: NOISE_HEIGHT,
    NOISE_SCALE: NOISE_SCALE,
    NOISE_PARAMS: {
      octaves: 10,
      persistence: 0.5,
      lacunarity: 1.6,
      exponentiation: 7.5,
      height: NOISE_HEIGHT,
      scale: NOISE_SCALE,
      seed: 1
    }
  }
})()

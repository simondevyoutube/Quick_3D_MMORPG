"use strict";
exports.__esModule = true;
exports.NOISE_PARAMS = exports.NOISE_SCALE = exports.NOISE_HEIGHT = exports.PLANET_RADIUS = exports.QT_MIN_CELL_RESOLUTION = exports.QT_MIN_CELL_SIZE = void 0;
var QT_MIN_CELL_SIZE = 100;
exports.QT_MIN_CELL_SIZE = QT_MIN_CELL_SIZE;
// const QT_MIN_CELL_RESOLUTION = 24;
var QT_MIN_CELL_RESOLUTION = 16;
exports.QT_MIN_CELL_RESOLUTION = QT_MIN_CELL_RESOLUTION;
// const QT_MIN_CELL_RESOLUTION = 4;
var PLANET_RADIUS = 8000.0;
exports.PLANET_RADIUS = PLANET_RADIUS;
var NOISE_HEIGHT = 800.0;
exports.NOISE_HEIGHT = NOISE_HEIGHT;
// const NOISE_HEIGHT = 0.0;
var NOISE_SCALE = 1800.0;
exports.NOISE_SCALE = NOISE_SCALE;
var NOISE_PARAMS = {
    octaves: 10,
    persistence: 0.5,
    lacunarity: 1.6,
    exponentiation: 7.5,
    height: NOISE_HEIGHT,
    scale: NOISE_SCALE,
    seed: 1
};
exports.NOISE_PARAMS = NOISE_PARAMS;
//# sourceMappingURL=terrain-constants.js.map
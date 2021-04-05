"use strict";
exports.__esModule = true;
exports.Noise = void 0;
var simplex_noise_js_1 = require("./simplex-noise.js");
var Noise = /** @class */ (function () {
    function Noise(params) {
        this._params = params;
        this._Init();
    }
    Noise.prototype._Init = function () {
        this._noise = new simplex_noise_js_1.SimplexNoise(this._params.seed);
    };
    Noise.prototype.Get = function (x, y, z) {
        var G = Math.pow(2.0, (-this._params.persistence));
        var xs = x / this._params.scale;
        var ys = y / this._params.scale;
        var zs = z / this._params.scale;
        var noiseFunc = this._noise;
        var amplitude = 1.0;
        var frequency = 1.0;
        var normalization = 0;
        var total = 0;
        for (var o = 0; o < this._params.octaves; o++) {
            var noiseValue = noiseFunc.noise3D(xs * frequency, ys * frequency, zs * frequency) * 0.5 + 0.5;
            total += noiseValue * amplitude;
            normalization += amplitude;
            amplitude *= G;
            frequency *= this._params.lacunarity;
        }
        total /= normalization;
        return Math.pow(total, this._params.exponentiation) * this._params.height;
    };
    return Noise;
}());
exports.Noise = Noise;
//# sourceMappingURL=noise.js.map
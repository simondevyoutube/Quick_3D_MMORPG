"use strict";
exports.__esModule = true;
exports.HeightGenerator = void 0;
var terrain_constants_js_1 = require("./terrain-constants.js");
var noise_js_1 = require("./noise.js");
var HeightGenerator = /** @class */ (function () {
    function HeightGenerator() {
        this.noise_ = new noise_js_1.Noise(terrain_constants_js_1.NOISE_PARAMS);
    }
    HeightGenerator.prototype.Get = function (x, y, z) {
        return [this.noise_.Get(x, y, z), 1];
    };
    return HeightGenerator;
}());
exports.HeightGenerator = HeightGenerator;
;
//# sourceMappingURL=terrain-height.js.map
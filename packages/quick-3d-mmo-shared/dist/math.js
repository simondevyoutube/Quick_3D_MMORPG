"use strict";
exports.__esModule = true;
exports.in_range = exports.sat = exports.clamp = exports.smootherstep = exports.smoothstep = exports.lerp = exports.rand_normalish = exports.rand_int = exports.rand_range = void 0;
var rand_range = function (a, b) {
    return Math.random() * (b - a) + a;
};
exports.rand_range = rand_range;
var rand_normalish = function () {
    var r = Math.random() + Math.random() + Math.random() + Math.random();
    return (r / 4.0) * 2.0 - 1;
};
exports.rand_normalish = rand_normalish;
var rand_int = function (a, b) {
    return Math.round(Math.random() * (b - a) + a);
};
exports.rand_int = rand_int;
var lerp = function (x, a, b) {
    return x * (b - a) + a;
};
exports.lerp = lerp;
var smoothstep = function (x, a, b) {
    x = x * x * (3.0 - 2.0 * x);
    return x * (b - a) + a;
};
exports.smoothstep = smoothstep;
var smootherstep = function (x, a, b) {
    x = x * x * x * (x * (x * 6 - 15) + 10);
    return x * (b - a) + a;
};
exports.smootherstep = smootherstep;
var clamp = function (x, a, b) {
    return Math.min(Math.max(x, a), b);
};
exports.clamp = clamp;
var sat = function (x) {
    return Math.min(Math.max(x, 0.0), 1.0);
};
exports.sat = sat;
var in_range = function (x, a, b) {
    return x >= a && x <= b;
};
exports.in_range = in_range;
//# sourceMappingURL=math.js.map
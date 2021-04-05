"use strict";
exports.__esModule = true;
exports.LinearSpline = exports.CubicHermiteSpline = void 0;
var CubicHermiteSpline = /** @class */ (function () {
    function CubicHermiteSpline(lerp) {
        this._points = [];
        this._lerp = lerp;
    }
    CubicHermiteSpline.prototype.AddPoint = function (t, d) {
        this._points.push([t, d]);
    };
    CubicHermiteSpline.prototype.Get = function (t) {
        var p1 = 0;
        for (var i = 0; i < this._points.length; i++) {
            if (this._points[i][0] >= t) {
                break;
            }
            p1 = i;
        }
        var p0 = Math.max(0, p1 - 1);
        var p2 = Math.min(this._points.length - 1, p1 + 1);
        var p3 = Math.min(this._points.length - 1, p1 + 2);
        if (p1 == p2) {
            return this._points[p1][1];
        }
        return this._lerp((t - this._points[p1][0]) / (this._points[p2][0] - this._points[p1][0]), this._points[p0][1], this._points[p1][1], this._points[p2][1], this._points[p3][1]);
    };
    return CubicHermiteSpline;
}());
exports.CubicHermiteSpline = CubicHermiteSpline;
;
var LinearSpline = /** @class */ (function () {
    function LinearSpline(lerp) {
        this._points = [];
        this._lerp = lerp;
    }
    LinearSpline.prototype.AddPoint = function (t, d) {
        this._points.push([t, d]);
    };
    LinearSpline.prototype.Get = function (t) {
        var p1 = 0;
        for (var i = 0; i < this._points.length; i++) {
            if (this._points[i][0] >= t) {
                break;
            }
            p1 = i;
        }
        var p2 = Math.min(this._points.length - 1, p1 + 1);
        if (p1 == p2) {
            return this._points[p1][1];
        }
        return this._lerp((t - this._points[p1][0]) / (this._points[p2][0] - this._points[p1][0]), this._points[p1][1], this._points[p2][1]);
    };
    return LinearSpline;
}());
exports.LinearSpline = LinearSpline;
//# sourceMappingURL=spline.js.map
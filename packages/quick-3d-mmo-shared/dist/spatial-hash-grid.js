"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.SpatialHashGrid = void 0;
var math = require("./math.js");
var SpatialHashGrid = /** @class */ (function () {
    function SpatialHashGrid(bounds, dimensions) {
        var x = dimensions[0], y = dimensions[1];
        this._cells = __spreadArray([], Array(x)).map(function (_) { return __spreadArray([], Array(y)).map(function (_) { return (null); }); });
        this._dimensions = dimensions;
        this._bounds = bounds;
        this._queryIds = 0;
    }
    SpatialHashGrid.prototype._GetCellIndex = function (position) {
        var x = math.sat((position[0] - this._bounds[0][0]) / (this._bounds[1][0] - this._bounds[0][0]));
        var y = math.sat((position[1] - this._bounds[0][1]) / (this._bounds[1][1] - this._bounds[0][1]));
        var xIndex = Math.floor(x * (this._dimensions[0] - 1));
        var yIndex = Math.floor(y * (this._dimensions[1] - 1));
        return [xIndex, yIndex];
    };
    SpatialHashGrid.prototype.NewClient = function (position, dimensions) {
        var client = {
            position: position,
            dimensions: dimensions,
            _cells: {
                min: null,
                max: null,
                nodes: null
            },
            _queryId: -1
        };
        this._Insert(client);
        return client;
    };
    SpatialHashGrid.prototype.UpdateClient = function (client) {
        var _a = client.position, x = _a[0], y = _a[1];
        var _b = client.dimensions, w = _b[0], h = _b[1];
        var i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
        var i2 = this._GetCellIndex([x + w / 2, y + h / 2]);
        if (client._cells.min[0] == i1[0] &&
            client._cells.min[1] == i1[1] &&
            client._cells.max[0] == i2[0] &&
            client._cells.max[1] == i2[1]) {
            return;
        }
        this.Remove(client);
        this._Insert(client);
    };
    SpatialHashGrid.prototype.FindNear = function (position, bounds) {
        var x = position[0], y = position[1];
        var w = bounds[0], h = bounds[1];
        var i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
        var i2 = this._GetCellIndex([x + w / 2, y + h / 2]);
        var clients = [];
        var queryId = this._queryIds++;
        for (var x_1 = i1[0], xn = i2[0]; x_1 <= xn; ++x_1) {
            for (var y_1 = i1[1], yn = i2[1]; y_1 <= yn; ++y_1) {
                var head = this._cells[x_1][y_1];
                while (head) {
                    var v = head.client;
                    head = head.next;
                    if (v._queryId != queryId) {
                        v._queryId = queryId;
                        clients.push(v);
                    }
                }
            }
        }
        return clients;
    };
    SpatialHashGrid.prototype._Insert = function (client) {
        var _a = client.position, x = _a[0], y = _a[1];
        var _b = client.dimensions, w = _b[0], h = _b[1];
        var i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
        var i2 = this._GetCellIndex([x + w / 2, y + h / 2]);
        var nodes = [];
        for (var x_2 = i1[0], xn = i2[0]; x_2 <= xn; ++x_2) {
            nodes.push([]);
            for (var y_2 = i1[1], yn = i2[1]; y_2 <= yn; ++y_2) {
                var xi = x_2 - i1[0];
                var head = {
                    next: null,
                    prev: null,
                    client: client
                };
                nodes[xi].push(head);
                head.next = this._cells[x_2][y_2];
                if (this._cells[x_2][y_2]) {
                    this._cells[x_2][y_2].prev = head;
                }
                this._cells[x_2][y_2] = head;
            }
        }
        client._cells.min = i1;
        client._cells.max = i2;
        client._cells.nodes = nodes;
    };
    SpatialHashGrid.prototype.Remove = function (client) {
        var i1 = client._cells.min;
        var i2 = client._cells.max;
        for (var x = i1[0], xn = i2[0]; x <= xn; ++x) {
            for (var y = i1[1], yn = i2[1]; y <= yn; ++y) {
                var xi = x - i1[0];
                var yi = y - i1[1];
                var node = client._cells.nodes[xi][yi];
                if (node.next) {
                    node.next.prev = node.prev;
                }
                if (node.prev) {
                    node.prev.next = node.next;
                }
                if (!node.prev) {
                    this._cells[x][y] = node.next;
                }
            }
        }
        client._cells.min = null;
        client._cells.max = null;
        client._cells.nodes = null;
    };
    return SpatialHashGrid;
}());
exports.SpatialHashGrid = SpatialHashGrid;
//# sourceMappingURL=spatial-hash-grid.js.map
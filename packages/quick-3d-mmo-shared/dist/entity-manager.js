"use strict";
exports.__esModule = true;
exports.EntityManager = void 0;
var EntityManager = /** @class */ (function () {
    function EntityManager() {
        this._ids = 0;
        this._entitiesMap = {};
        this._entities = [];
    }
    EntityManager.prototype._GenerateName = function () {
        this._ids += 1;
        return '__name__' + this._ids;
    };
    EntityManager.prototype.Get = function (n) {
        return this._entitiesMap[n];
    };
    EntityManager.prototype.Filter = function (cb) {
        return this._entities.filter(cb);
    };
    EntityManager.prototype.Add = function (e, n) {
        // console.log("EntityManager.Add(): ", e, n)
        if (!n) {
            n = this._GenerateName();
        }
        e.SetName(n);
        this._entitiesMap[n] = e;
        this._entities.push(e);
        e.SetParent(this);
        e.InitEntity();
    };
    EntityManager.prototype.SetActive = function (e, b) {
        var i = this._entities.indexOf(e);
        if (!b) {
            if (i < 0) {
                return;
            }
            this._entities.splice(i, 1);
        }
        else {
            if (i >= 0) {
                return;
            }
            this._entities.push(e);
        }
    };
    EntityManager.prototype.Update = function (timeElapsed) {
        var dead = [];
        var alive = [];
        for (var i = 0; i < this._entities.length; ++i) {
            var e = this._entities[i];
            debugger;
            e.Update(timeElapsed);
            if (e.dead_) {
                dead.push(e);
            }
            else {
                alive.push(e);
            }
        }
        for (var i = 0; i < dead.length; ++i) {
            var e = dead[i];
            delete this._entitiesMap[e.Name];
            e.Destroy();
        }
        this._entities = alive;
    };
    return EntityManager;
}());
exports.EntityManager = EntityManager;
//# sourceMappingURL=entity-manager.js.map
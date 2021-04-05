import { performance } from 'perf_hooks';
import { Constants } from 'quick-3d-mmo-shared';
import { WorldManager } from './world-manager.js';
import { LoginQueue } from './login-queue.js';
// import { WorldAIClient, WorldNetworkClient } from './world-client.js';
const { EVENT_TYPES } = Constants;
class SocketWrapper {
    constructor(params) {
        // console.log("params: ", params)
        this.socket_ = params === null || params === void 0 ? void 0 : params.socket;
        this.onMessage = null;
        this.dead_ = false;
        this.SetupSocket_();
    }
    get ID() {
        return this.socket_.id;
    }
    get IsAlive() {
        return !this.dead_;
    }
    SetupSocket_() {
        var _a, _b, _c, _d, _e, _f;
        (_b = (_a = this === null || this === void 0 ? void 0 : this.socket_) === null || _a === void 0 ? void 0 : _a.on) === null || _b === void 0 ? void 0 : _b.call(_a, 'user-connected', () => {
            console.log('socket.id: ' + this.socket_.id);
        });
        (_d = (_c = this === null || this === void 0 ? void 0 : this.socket_) === null || _c === void 0 ? void 0 : _c.on) === null || _d === void 0 ? void 0 : _d.call(_c, 'disconnect', () => {
            console.log('Client disconnected.');
            this.dead_ = true;
        });
        (_f = (_e = this.socket_) === null || _e === void 0 ? void 0 : _e.onAny) === null || _f === void 0 ? void 0 : _f.call(_e, (e, d) => {
            try {
                if (!this.onMessage(e, d)) {
                    console.log('Unknown command (' + e + '), disconnected.');
                    this.Disconnect();
                }
            }
            catch (err) {
                console.error(err);
                this.Disconnect();
            }
        });
    }
    Disconnect() {
        this.socket_.disconnect(true);
    }
    Send(msg, data) {
        this.socket_.emit(msg, data);
    }
    onMessage(e, d) { return false; }
}
;
class WorldServer {
    constructor(io, WorldNetworkClient) {
        console.log("new WorldServer");
        this.loginQueue_ = new LoginQueue((c, p) => { this.OnLogin_(c, p, WorldNetworkClient); });
        this.worldMgr_ = new WorldManager({ parent: this });
        this.SetupIO_(io);
    }
    SetupIO_(io) {
        io.on('connection', socket => {
            console.log("WorldServer: user connected");
            this.loginQueue_.Add(new SocketWrapper({ socket: socket }));
        });
    }
    OnLogin_(client, params, WorldNetworkClient) {
        console.log("WorldServer.OnLogin_");
        this.worldMgr_.Add(client, params, WorldNetworkClient);
    }
    Run(WorldAIClient) {
        let t1 = performance.now();
        this.Schedule_(t1, WorldAIClient);
    }
    Schedule_(t1, WorldAIClient) {
        setTimeout(() => {
            let t2 = performance.now();
            this.Update_((t2 - t1) * 0.001, WorldAIClient);
            this.Schedule_(t2, WorldAIClient);
        });
    }
    Update_(timeElapsed, WorldAIClient) {
        this.worldMgr_.Update(timeElapsed, WorldAIClient);
    }
}
;
export { WorldServer, SocketWrapper };
//# sourceMappingURL=world-server.js.map
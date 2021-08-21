import { performance } from "perf_hooks";
import { login_queue } from "./login-queue";
import { world_manager } from "./world-manager";

export const world_server = (() => {
  class SocketWrapper {
    constructor(params) {
      this.socket_ = params.socket;
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
      this.socket_.on("user-connected", () => {
        console.log("socket.id: " + socket.id);
      });
      this.socket_.on("disconnect", () => {
        console.log("Client disconnected.");
        this.dead_ = true;
      });
      this.socket_.onAny((e, d) => {
        try {
          if (!this.onMessage(e, d)) {
            console.log("Unknown command (" + e + "), disconnected.");
            this.Disconnect();
          }
        } catch (err) {
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
  }

  class WorldServer {
    constructor(io) {
      this.loginQueue_ = new login_queue.LoginQueue((c, p) => {
        this.OnLogin_(c, p);
      });

      this.worldMgr_ = new world_manager.WorldManager({ parent: this });
      this.SetupIO_(io);
    }

    SetupIO_(io) {
      io.on("connection", (socket) => {
        this.loginQueue_.Add(new SocketWrapper({ socket: socket }));
      });
    }

    OnLogin_(client, params) {
      this.worldMgr_.Add(client, params);
    }

    Run() {
      let t1 = performance.now();
      this.Schedule_(t1);
    }

    Schedule_(t1) {
      setTimeout(() => {
        let t2 = performance.now();
        this.Update_((t2 - t1) * 0.001);
        this.Schedule_(t2);
      });
    }

    Update_(timeElapsed) {
      this.worldMgr_.Update(timeElapsed);
    }
  }

  return {
    WorldServer: WorldServer,
  };
})();

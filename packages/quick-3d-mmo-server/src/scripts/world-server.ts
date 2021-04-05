import { performance } from 'perf_hooks';
import {Constants} from 'quick-3d-mmo-shared'
import { WorldManager } from './world-manager.js';
import { LoginQueue } from './login-queue.js';
// import { WorldAIClient, WorldNetworkClient } from './world-client.js';

const {EVENT_TYPES} = Constants;

class SocketWrapper {
  socket_: any;
  dead_: boolean;
  constructor(params: {socket: any}) {
    // console.log("params: ", params)
    this.socket_ = params?.socket;
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
    this?.socket_?.on?.('user-connected', () => {
      console.log('socket.id: ' + this.socket_.id);
    });
    this?.socket_?.on?.('disconnect', () => {
      console.log('Client disconnected.');
      this.dead_ = true;
    });
    this.socket_?.onAny?.((e: any, d: any) => {
      try {
        if (!this.onMessage(e, d)) {
          console.log('Unknown command (' + e + '), disconnected.');
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

  Send(msg: any, data) {
    this.socket_.emit(msg, data);
  }
  onMessage(e: any, d: any) {return false}
};


class WorldServer {
  loginQueue_: LoginQueue;
  worldMgr_: WorldManager;
  
  constructor(io, WorldNetworkClient) {
    console.log("new WorldServer")
    this.loginQueue_ = new LoginQueue(
      (c, p) => { this.OnLogin_(c, p, WorldNetworkClient); });

    this.worldMgr_ = new WorldManager({ parent: this });
    this.SetupIO_(io);
  }

  SetupIO_(io) {
    io.on('connection', socket => {
      console.log("WorldServer: user connected")
      this.loginQueue_.Add(new SocketWrapper({ socket: socket }));
    });
  }

  OnLogin_(client, params, WorldNetworkClient) {
    console.log("WorldServer.OnLogin_")
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
};

export {
  WorldServer,
  SocketWrapper
}
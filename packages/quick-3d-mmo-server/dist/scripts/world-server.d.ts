import { WorldManager } from './world-manager.js';
import { LoginQueue } from './login-queue.js';
declare class SocketWrapper {
    socket_: any;
    dead_: boolean;
    constructor(params: any);
    get ID(): any;
    get IsAlive(): boolean;
    SetupSocket_(): void;
    Disconnect(): void;
    Send(msg: any, data: any): void;
    onMessage(e: any, d: any): boolean;
}
declare class WorldServer {
    loginQueue_: LoginQueue;
    worldMgr_: WorldManager;
    constructor(io: any);
    SetupIO_(io: any): void;
    OnLogin_(client: any, params: any): void;
    Run(): void;
    Schedule_(t1: any): void;
    Update_(timeElapsed: any): void;
}
export { WorldServer, SocketWrapper };

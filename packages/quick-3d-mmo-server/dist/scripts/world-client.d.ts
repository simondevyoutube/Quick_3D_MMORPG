import type { WorldEntity } from './world-entity';
import { SocketWrapper } from './world-server';
declare class WorldClient {
    #private;
    entity: WorldEntity;
    client: SocketWrapper;
    entityCache: any;
    terrain_: any;
    onDeath_: any;
    fsm_: any;
    deathTimer_: number;
    timeout_: number;
    constructor(client: SocketWrapper, entity: WorldEntity);
    Destroy(): void;
    OnDeath(): void;
    OnEntityEvent_(t: any, d: any): void;
    OnMessage_(evt: string, data: any): boolean;
    OnDamageEvent_(_: any): void;
    OnInventoryChanged_(inventory: []): void;
    OnChatMessage_(message: any): void;
    BroadcastChat(chatMessage: any): void;
    get IsDead(): boolean;
    OnUpdate_(timeElapsed: any): void;
    OnUpdateClientState_(): void;
    UpdateClientState_(): void;
    Update(timeElapsed: any): void;
}
declare class WorldNetworkClient extends WorldClient {
    entity: any;
    entityCache: any;
    constructor(client: any, entity: any);
    OnUpdate_(timeElapsed: any): void;
    OnUpdateClientState_(): void;
}
declare class WorldAIClient extends WorldClient {
    constructor(entity: WorldEntity, terrain: any, onDeath: any);
    get IsDead(): boolean;
    OnDeath(): void;
    OnUpdateClientState_(): void;
    OnUpdate_(timeElapsed: number): void;
}
export { WorldNetworkClient, WorldAIClient, WorldClient, };

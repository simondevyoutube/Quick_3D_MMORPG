import { quat, vec3 } from 'gl-matrix';
import type { WorldClient } from "./world-client.js";
declare class Action_Attack {
    #private;
    constructor(time: number, cooldown: number, onAction: () => void);
    get Finished(): boolean;
    Update(timeElapsed: number): void;
}
declare class WorldEntity {
    id_: any;
    state_: any;
    position_: any;
    rotation_: any;
    accountInfo_: any;
    characterDefinition_: any;
    characterInfo_: any;
    stats_: any;
    events_: any;
    grid_: any;
    gridClient_: any;
    updateTimer_: any;
    action_: any;
    parent_: WorldClient;
    isAI: boolean;
    constructor(params: any);
    Destroy(): void;
    get ID(): any;
    get Valid(): boolean;
    get Health(): any;
    GetDescription(): {
        account: any;
        character: any;
    };
    CreatePlayerPacket_(): {
        id: any;
        desc: {
            account: any;
            character: any;
        };
        transform: any[];
    };
    CreateStatsPacket_(): any[];
    CreateEventsPacket_(): any;
    CreateTransformPacket_(): any[];
    UpdateTransform(transformData: [string, vec3, quat]): void;
    UpdateGridClient_(): void;
    UpdateInventory(inventory: []): void;
    OnActionAttack(): void;
    OnActionAttack_Fired(): void;
    onEvent_(eventType: string, data: any): void;
    OnDamage(attacker: WorldEntity, damage: number): void;
    SetState(s: string): void;
    FindNear(radius: number, includeSelf?: boolean): any;
    Update(timeElapsed: number): void;
    UpdateActions_(timeElapsed: number): void;
}
export { WorldEntity, Action_Attack };

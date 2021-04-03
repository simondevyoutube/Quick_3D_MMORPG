declare class WorldManager {
    ids_: number;
    entities_: any[];
    grid_: any;
    terrain_: any;
    spawners_: any[];
    tickTimer_: number;
    constructor(params: any);
    AddMonster(e: any): void;
    Add(client: any, params: any): void;
    Update(timeElapsed: any): void;
    TickClientState_(timeElapsed: any): void;
    UpdateSpawners_(timeElapsed: any): void;
    UpdateEntities_(timeElapsed: any): void;
}
export { WorldManager };

declare class TerrainChunkRebuilder {
    _pool: {};
    _params: any;
    _queued: any;
    _old: any;
    _active: any;
    _new: any[];
    constructor(params: any);
    AllocateChunk(params: any): any;
    RetireChunks(chunks: any): void;
    _RecycleChunks(chunks: any): void;
    _Reset(): void;
    get Busy(): any;
    Rebuild(chunks: any): void;
    Update(): void;
}
export { TerrainChunkRebuilder };

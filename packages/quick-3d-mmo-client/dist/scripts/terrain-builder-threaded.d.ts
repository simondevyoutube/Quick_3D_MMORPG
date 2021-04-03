declare class WorkerThread {
    _worker: Worker;
    _resolve: any;
    _id: number;
    constructor(s: any);
    _OnMessage(e: any): void;
    get id(): number;
    postMessage(s: any, resolve: any): void;
}
declare class WorkerThreadPool {
    _workers: WorkerThread[];
    _free: any[];
    _busy: {};
    _queue: any[];
    constructor(sz: any, entry: any);
    get length(): number;
    get Busy(): boolean;
    Enqueue(workItem: any, resolve: any): void;
    _PumpQueue(): void;
}
declare class TerrainChunkRebuilder_Threaded {
    _pool: {};
    _old: any[];
    _workerPool: WorkerThreadPool;
    _params: any;
    constructor(params: any);
    _OnResult(chunk: any, msg: any): void;
    AllocateChunk(params: any): any;
    RetireChunks(chunks: any): void;
    _RecycleChunks(chunks: any): void;
    get Busy(): boolean;
    Rebuild(chunks: any): void;
    Update(): void;
}
export { TerrainChunkRebuilder_Threaded };

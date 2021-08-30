import { TerrainChunk } from "./terrainchunk.js";

const numWorkers = 4;
let _IDs = 0;

export class WorkerThread {
  _worker = new Worker("src/functions/terrain/terrainworker.js", { type: "module" });
  _resolve = undefined;
  _id = _IDs++;
  
  constructor() {
    this._worker.onmessage = (e) => {
      this._OnMessage(e);
    };
  }

  _OnMessage(e) {
    const resolve = this._resolve;
    this._resolve = undefined;
    resolve(e.data);
  }

  get id() {
    return this._id;
  }

  postMessage(s, resolve) {
    this._resolve = resolve;
    this._worker.postMessage(s);
  }
}

export class WorkerPool {
  constructor(num) {
    this._workers = [...Array(num)].map((_) => new WorkerThread());
    this._free = [...this._workers];
    this._busy = {};
    this._queue = [];
  }

  get length() {
    return this._workers.length;
  }

  get busy() {
    return this._queue.length > 0 || Object.keys(this._busy).length > 0;
  }

  Enqueue(workItem, resolve) {
    this._queue.push([workItem, resolve]);
    this._PumpQueue();
  }

  _PumpQueue() {
    while (this._free.length > 0 && this._queue.length > 0) {
      const w = this._free.pop();
      this._busy[w.id] = w;

      const [workItem, workResolve] = this._queue.shift();

      w.postMessage(workItem, (v) => {
        delete this._busy[w.id];
        this._free.push(w);
        workResolve(v);
        this._PumpQueue();
      });
    }
  }
}

export class TerrainChunkRebuilder_Threaded {
  constructor(params) {
    this._pool = {};
    this._old = [];

    this._workerPool = new WorkerPool(numWorkers);

    this._params = params;
  }

  onResult(chunk, msg) {
    if (msg.subject == "build_chunk_result") {
      chunk.rebuildMeshFromData(msg.data);
      chunk.show();
    }
  }

  allocateChunk(params) {
    const w = params.width;

    if (!(w in this._pool)) {
      this._pool[w] = [];
    }

    let c = undefined;
    if (this._pool[w].length > 0) {
      c = this._pool[w].pop();
      c._params = params;
    } else {
      c = new TerrainChunk(params);
    }

    c.hide();

    const threadedParams = {
      noiseParams: params.noiseParams,
      colourNoiseParams: params.colourNoiseParams,
      biomesParams: params.biomesParams,
      colourGeneratorParams: params.colourGeneratorParams,
      heightGeneratorParams: params.heightGeneratorParams,
      width: params.width,
      offset: [params.offset.x, params.offset.y, params.offset.z],
      // origin: params.origin,
      radius: params.radius,
      resolution: params.resolution,
      worldMatrix: params.transform,
    };

    const msg = {
      subject: "build_chunk",
      params: threadedParams,
    };

    this._workerPool.Enqueue(msg, (m) => {
      this.onResult(c, m);
    });

    return c;
  }

  retireChunks(chunks) {
    this._old.push(...chunks);
  }

  recycleChunks(chunks) {
    for (let c of chunks) {
      if (!(c.chunk._params.width in this._pool)) {
        this._pool[c.chunk._params.width] = [];
      }

      c.chunk.destroy();
    }
  }

  get busy() {
    return this._workerPool.busy;
  }

  rebuild(chunks) {
    for (let k in chunks) {
      this._workerPool.Enqueue(chunks[k].chunk._params);
    }
  }

  update() {
    if (!this.busy) {
      this.recycleChunks(this._old);
      this._old = [];
    }
  }
}

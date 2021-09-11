import { Chunk } from "./chunk.js"

const numWorkers = 2;
let _IDs = 0;

export class ChunkBuilder {
  _pool = {};
  _old = [];
  _workerPool = new WorkerPool(numWorkers);

  onResult(chunk, msg) {
    if (msg.subject == "build_chunk_result") {
      chunk.setFromData(msg.data);
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
      c = new Chunk(params);
    }

    c.hide();

    const threadedParams = {
      width: params.width,
      offset: [params.offset.x, params.offset.y, params.offset.z],
      resolution: params.resolution,
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
      for (const chunks of this._old) {
        if (!(chunks.chunk.width in this._pool)) {
          this._pool[chunks.chunk.width] = [];
        }
        chunks.chunk.destroy();
      }
      this._old = [];
    }
  }
}

export class WorkerThread {
  _worker = new Worker("src/terrain/worker.js", { type: "module" });
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
  _busy = {};
  _queue = [];
  
  constructor(num) {
    this._workers = [...Array(num)].map((_) => new WorkerThread());
    this._free = [...this._workers];
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
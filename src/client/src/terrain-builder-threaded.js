import { terrain_chunk } from './terrain-chunk.js'

export const terrain_builder_threaded = (function () {
  const _NUM_WORKERS = 4

  let _IDs = 0

  class WorkerThread {
    constructor(s) {
      this._worker = new Worker(s, { type: 'module' })
      this._worker.onmessage = (e) => {
        this._OnMessage(e)
      }
      this._resolve = null
      this._id = _IDs++
    }

    _OnMessage(e) {
      const resolve = this._resolve
      this._resolve = null
      resolve(e.data)
    }

    get id() {
      return this._id
    }

    postMessage(s, resolve) {
      this._resolve = resolve
      this._worker.postMessage(s)
    }
  }

  class WorkerThreadPool {
    constructor(sz, entry) {
      this._workers = [...Array(sz)].map((_) => new WorkerThread(entry))
      this._free = [...this._workers]
      this._busy = {}
      this._queue = []
    }

    get length() {
      return this._workers.length
    }

    get Busy() {
      return this._queue.length > 0 || Object.keys(this._busy).length > 0
    }

    Enqueue(workItem, resolve) {
      this._queue.push([workItem, resolve])
      this._PumpQueue()
    }

    _PumpQueue() {
      while (this._free.length > 0 && this._queue.length > 0) {
        const w = this._free.pop()
        this._busy[w.id] = w

        const [workItem, workResolve] = this._queue.shift()

        w.postMessage(workItem, (v) => {
          delete this._busy[w.id]
          this._free.push(w)
          workResolve(v)
          this._PumpQueue()
        })
      }
    }
  }

  class _TerrainChunkRebuilder_Threaded {
    constructor(params) {
      this._pool = {}
      this._old = []

      this._workerPool = new WorkerThreadPool(_NUM_WORKERS, 'src/terrain-builder-threaded-worker.js')

      this._params = params
    }

    _OnResult(chunk, msg) {
      if (msg.subject == 'build_chunk_result') {
        chunk.RebuildMeshFromData(msg.data)
        chunk.Show()
      }
    }

    AllocateChunk(params) {
      const w = params.width

      if (!(w in this._pool)) {
        this._pool[w] = []
      }

      let c = null
      if (this._pool[w].length > 0) {
        c = this._pool[w].pop()
        c._params = params
      } else {
        c = new terrain_chunk.TerrainChunk(params)
      }

      c.Hide()

      const threadedParams = {
        noiseParams: params.noiseParams,
        colourNoiseParams: params.colourNoiseParams,
        biomesParams: params.biomesParams,
        colourGeneratorParams: params.colourGeneratorParams,
        heightGeneratorsParams: params.heightGeneratorsParams,
        width: params.width,
        offset: [params.offset.x, params.offset.y, params.offset.z],
        // origin: params.origin,
        radius: params.radius,
        resolution: params.resolution,
        worldMatrix: params.transform
      }

      const msg = {
        subject: 'build_chunk',
        params: threadedParams
      }

      this._workerPool.Enqueue(msg, (m) => {
        this._OnResult(c, m)
      })

      return c
    }

    RetireChunks(chunks) {
      this._old.push(...chunks)
    }

    _RecycleChunks(chunks) {
      for (let c of chunks) {
        if (!(c.chunk._params.width in this._pool)) {
          this._pool[c.chunk._params.width] = []
        }

        c.chunk.Destroy()
      }
    }

    get Busy() {
      return this._workerPool.Busy
    }

    Rebuild(chunks) {
      for (let k in chunks) {
        this._workerPool.Enqueue(chunks[k].chunk._params)
      }
    }

    Update() {
      if (!this.Busy) {
        this._RecycleChunks(this._old)
        this._old = []
      }
    }
  }

  return {
    TerrainChunkRebuilder_Threaded: _TerrainChunkRebuilder_Threaded
  }
})()

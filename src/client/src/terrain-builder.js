import { terrain_chunk } from './terrain-chunk.js'

export const terrain_builder = (function () {
  class _TerrainChunkRebuilder {
    constructor(params) {
      this._pool = {}
      this._params = params
      this._Reset()
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

      this._queued.push(c)

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

    _Reset() {
      this._active = null
      this._queued = []
      this._old = []
      this._new = []
    }

    get Busy() {
      return this._active || this._queued.length > 0
    }

    Rebuild(chunks) {
      if (this.Busy) {
        return
      }
      for (let k in chunks) {
        this._queued.push(chunks[k].chunk)
      }
    }

    Update() {
      if (this._active) {
        const r = this._active.next()
        if (r.done) {
          this._active = null
        }
      } else {
        const b = this._queued.pop()
        if (b) {
          this._active = b._Rebuild()
          this._new.push(b)
        }
      }

      if (this._active) {
        return
      }

      if (!this._queued.length) {
        this._RecycleChunks(this._old)
        for (let b of this._new) {
          b.Show()
        }
        this._Reset()
      }
    }
  }

  return {
    TerrainChunkRebuilder: _TerrainChunkRebuilder
  }
})()

import { TerrainChunk } from "./terrainchunk.js";

export class TerrainChunkBuilder {
  _pool = {};
  _active = undefined;
  _queued = [];
  _old = [];
  _new = [];

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

    this._queued.push(c);

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

  reset() {
    this._active = undefined;
    this._queued = [];
    this._old = [];
    this._new = [];
  }

  busy() {
    return this._active || this._queued.length > 0;
  }

  rebuild(chunks) {
    if (this.busy) {
      return;
    }
    for (let k in chunks) {
      this._queued.push(chunks[k].chunk);
    }
  }

  update() {
    if (this._active) {
      const r = this._active.next();
      if (r.done) {
        this._active = undefined;
      }
    } else {
      const b = this._queued.pop();
      if (b) {
        this._active = b.rebuild();
        this._new.push(b);
      }
    }

    if (this._active) {
      return;
    }

    if (!this._queued.length) {
      this.recycleChunks(this._old);
      for (let b of this._new) {
        b.show();
      }
      this.reset();
    }
  }
}

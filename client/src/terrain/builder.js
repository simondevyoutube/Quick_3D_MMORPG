import { Chunk } from "./chunk.js"


export class ChunkBuilder {
  old = [];
  queue = [];

  constructor(numWorkers=4){
    this.workers = [...Array(numWorkers)].map((_) => new Worker("src/terrain/terrainWorker.js", { type: "module" }));
    this.free = [...this.workers];
  }

  get length() {
    return this.workers.length;
  }

  update() {
    if (this.old.length > 0 && this.queue.length == 0) {
      for (let i = 0; i < this.old.length; i++) {
        const chunks = this.old[i];
        chunks.chunk.destroy()
      }
    }
    if (this.free.length > 0 && this.queue.length > 0) {
      
      const worker = this.free.pop();
      const [workItem, workResolve] = this.queue.shift();

      worker.onmessage = (e) => {
        workResolve(e.data)
        this.free.push(worker);
      };
      worker.postMessage(workItem)
    }
  }

  build(args) {
    const c = new Chunk(args);
    c.hide();

    const workerArgs = {
      width: args.width,
      offset: [args.offset.x, args.offset.y, args.offset.z],
      resolution: args.resolution,
    };

    const msg = {
      event: "build",
      params: workerArgs,
    };

    this.queue.push([msg, (res) => {
      if (res.event == "result") {
        c.setFromData(res.data);
        c.show();
      }
    }]);

    return c;
  }
}

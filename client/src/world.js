import { Entities } from "./interfaces/entities.js";
import { Network } from "./interfaces/network.js";
import { Scenery } from "./interfaces/scenery.js";
import { Assets } from "./interfaces/assets.js";
import { Terrain } from "./interfaces/terrain.js";

import { SpatialHashGrid } from "./structures/spatialhashgrid.js";
import { ThreeInit } from "./interfaces/graphics.js";

import { Player } from "./entities/player.js";
import { NPC } from "./entities/npc.js";

export class World {
  state = undefined;
  input = {
    handleKeyup: undefined,
    handleKeydown: undefined,
  };
  entities = new Entities();
  grid = new SpatialHashGrid(
    [[-1000, -1000], [1000, 1000]],
    [100, 100],
  );
  network = new Network();
  assets = new Assets()
  previousRAF_ = undefined;
  initialized = false;

  constructor() {
    // TODO-DefinitelyMaybe: do better eventually
    this.threejs = new ThreeInit()
    this.scene = this.threejs.scene;
    this.camera = this.threejs.camera;
    this.renderer = this.threejs.renderer;

    // terrain and scenery dont make sense unless three has already been initialized
    this.terrain = new Terrain(this)
    this.scenery = new Scenery(this)

    // Setup Network hooks
    this.network.websocket.on("world.player", (d) => {
      this.spawnPlayer(d)
    })
    this.network.websocket.on("world.load", (d) => {
      this.load(d)
    })

    this.RAF_();
    this.resize();
    this.initialized = true;
    console.log(this);
  }

  spawnPlayer(data) {
    const player = new Player(this)
    this.entities.add(player)
    player.network.onUpdate(data)
  }

  load(data) {
    // create all of the npc's
    console.log("World Load Data:");
    console.log(data);
    const npc = new NPC()
    this.entities.add(npc)
  }

  resize() {
    if (this.initialized) {
      // TODO-DefinitelyMaybe: Adjusts game aspect ratio not layout.
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === undefined) {
        this.previousRAF_ = t;
      }

      try {
        this.renderer.render(this.scene, this.camera); 
      } catch (error) {
        console.log(this.scene, this.camera);
        console.error(error);
      }
      this.Step_(t - this.previousRAF_);
      this.previousRAF_ = t;

      setTimeout(() => {
        this.RAF_();
      }, 1);
    });
  }

  Step_(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this.entities.update(timeElapsedS);
    this.terrain.update(timeElapsed)
    this.scenery.update(timeElapsed)

    // this moves the position of the sun (for shadows)
    this.threejs.update(this.entities.get("player"))
  }
}
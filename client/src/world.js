import { Entities } from "./interfaces/entities.js";
import { Entity } from "./structures/entity.js"
import { Network } from "./interfaces/network.js";
import { Scenery } from "./interfaces/scenery.js";
import { Assets } from "./interfaces/assets.js";
import { NetworkEntitySpawner, PlayerSpawner } from "./entities/spawner.js";
import { Terrain } from "./interfaces/terrain.js";

import { SpatialHashGrid } from "./structures/spatialhashgrid.js";
// import { WEAPONS_DATA } from "../shared/defs.js";
import { ThreeInit } from "./interfaces/graphics.js";

export class World {
  state = undefined;
  scene;
  camera;
  renderer;
  input = {
    handleKeyup: undefined,
    handleKeydown: undefined,
  };
  entities = new Entities();
  grid = new SpatialHashGrid(
    [[-1000, -1000], [1000, 1000]],
    [100, 100],
  );
  network = new Network(this);
  previousRAF_ = undefined;
  initialized = false;

  constructor() {
    // TODO-DefinitelyMaybe: do better eventually
    this.threejs = new ThreeInit()
    this.scene = this.threejs.scene;
    this.camera = this.threejs.camera;
    this.renderer = this.threejs.renderer;

    this.terrain = new Terrain(this)
    this.scenery = new Scenery(this)
    this.assets = new Assets()

    // TODO-DefinitelyMaybe: const spawner = new Spawner()
    const spawner = new Entity();
    spawner.AddComponent(
      new PlayerSpawner(this),
    );
    spawner.AddComponent(
      new NetworkEntitySpawner(this),
    );
    this.entities.Add(spawner, "spawners");

    this.RAF_();

    this.initialized = true;
    this.resize();
    console.log(this);
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

    this.entities.Update(timeElapsedS);
    this.terrain.Update(timeElapsed)
    this.scenery.Update(timeElapsed)

    // terrible hack
    this.threejs.Update(this.entities.get("player"))
  }
}
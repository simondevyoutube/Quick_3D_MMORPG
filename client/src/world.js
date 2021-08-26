import { Entities } from "./interfaces/entities.js";
import { Entity } from "./utils/entity.js"
import { Network } from "./interfaces/network.js";
import { SceneryController } from "./interfaces/scenery.js";
import { Assets } from "./interfaces/assets.js";
import { NetworkEntitySpawner, PlayerSpawner } from "./entities/spawner.js";
import { TerrainChunkManager } from "./interfaces/terrain.js";

import { SpatialHashGrid } from "./interfaces/spatialhashgrid.js";
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
    const threejs = new ThreeInit()
    this.scene = threejs.scene;
    this.camera = threejs.camera;
    this.renderer = threejs.renderer;

    const t = new Entity();
    t.AddComponent(
      new TerrainChunkManager({
        scene: this.scene,
        target: "player",
        threejs: this.renderer,
      }),
    );
    this.entities.Add(t, "terrain");

    const l = new Entity();
    l.AddComponent(new Assets());
    this.entities.Add(l, "assets");

    const scenery = new Entity();
    scenery.AddComponent(
      new SceneryController({
        scene: this.scene,
        grid: this.grid,
      }),
    );
    this.entities.Add(scenery, "scenery");

    const spawner = new Entity();
    spawner.AddComponent(
      new PlayerSpawner({
        grid: this.grid,
        scene: this.scene,
        camera: this.camera,
        network: this.network,
      }),
    );
    spawner.AddComponent(
      new NetworkEntitySpawner({
        grid: this.grid,
        scene: this.scene,
        camera: this.camera,
      }),
    );
    this.entities.Add(spawner, "spawners");

    // HACK
    // for (let k in WEAPONS_DATA) {
    //   database.GetComponent("InventoryDatabaseController").AddItem(
    //     k,
    //     WEAPONS_DATA[k],
    //   );
    // }

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

      this.renderer.render(this.scene, this.camera);
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
  }
}

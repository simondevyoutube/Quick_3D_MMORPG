import { EntityManager } from "./entity-manager.js";
import { Entity } from "./entity.js";
import { LevelUpComponentSpawner } from "./level-up-component.js";
import { NetworkController } from "./network-controller.js";
import { SceneryController } from "./scenery-controller.js";
import { LoadController } from "./load-controller.js";
import { NetworkEntitySpawner, PlayerSpawner } from "./spawners.js";
import { TerrainChunkManager } from "./terrain.js";

import { SpatialHashGrid } from "../shared/spatial-hash-grid.js";
// import { WEAPONS_DATA } from "../shared/defs.js";
import { ThreeJSController } from "./threejs_component.js";

export class CrappyMMOAttempt {
  entities = new EntityManager();
  grid = new SpatialHashGrid(
    [[-1000, -1000], [1000, 1000]],
    [100, 100],
  );
  previousRAF_ = null;

  // _gui = new GUI();
  // _guiParams = {
  //   general: {},
  // };
  initialized = false;

  // constructor() {
  //   // this._gui.addFolder("General");
  //   // this._gui.close();
  // }

  OnGameStarted_() {
    this.LoadControllers_();
    this.LoadPlayer_();

    this.RAF_();
    
    this.initialized = true;
    console.log(this);
  }

  LoadControllers_() {
    const threejs = new Entity();
    threejs.AddComponent(new ThreeJSController());
    this.entities.Add(threejs);

    // Hack
    this.scene_ = threejs.GetComponent("ThreeJSController").scene_;
    this.camera_ = threejs.GetComponent("ThreeJSController").camera_;
    this.threejs_ = threejs.GetComponent("ThreeJSController").threejs_;

    const ui = new Entity();
    // ui.AddComponent(new UIController());
    this.entities.Add(ui, "ui");

    const network = new Entity();
    network.AddComponent(new NetworkController());
    this.entities.Add(network, "network");

    const t = new Entity();
    t.AddComponent(
      new TerrainChunkManager({
        scene: this.scene_,
        target: "player",
        // gui: this._gui,
        // guiParams: this._guiParams,
        threejs: this.threejs_,
      }),
    );
    this.entities.Add(t, "terrain");

    const l = new Entity();
    l.AddComponent(new LoadController());
    this.entities.Add(l, "loader");

    const scenery = new Entity();
    scenery.AddComponent(
      new SceneryController({
        scene: this.scene_,
        grid: this.grid,
      }),
    );
    this.entities.Add(scenery, "scenery");

    const spawner = new Entity();
    spawner.AddComponent(
      new PlayerSpawner({
        grid: this.grid,
        scene: this.scene_,
        camera: this.camera_,
      }),
    );
    spawner.AddComponent(
      new NetworkEntitySpawner({
        grid: this.grid,
        scene: this.scene_,
        camera: this.camera_,
      }),
    );
    this.entities.Add(spawner, "spawners");

    const database = new Entity();
    // database.AddComponent(
    //   new InventoryDatabaseController(),
    // );
    this.entities.Add(database, "database");

    // HACK
    // for (let k in WEAPONS_DATA) {
    //   database.GetComponent("InventoryDatabaseController").AddItem(
    //     k,
    //     WEAPONS_DATA[k],
    //   );
    // }
  }

  LoadPlayer_() {
    const params = {
      camera: this.camera_,
      scene: this.scene_,
    };

    const levelUpSpawner = new Entity();
    levelUpSpawner.AddComponent(
      new LevelUpComponentSpawner({
        camera: this.camera_,
        scene: this.scene_,
      }),
    );
    this.entities.Add(levelUpSpawner, "level-up-spawner");
  }

  _OnWindowResize() {
    if (this.initialized) {
      // TODO-DefinitelyMaybe: Adjusts game aspect ratio not layout.
      this.camera_.aspect = window.innerWidth / window.innerHeight;
      this.camera_.updateProjectionMatrix();
      this.threejs_.setSize(window.innerWidth, window.innerHeight);
    }
  }

  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      }

      this.threejs_.render(this.scene_, this.camera_);
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

// const mmo = new CrappyMMOAttempt();


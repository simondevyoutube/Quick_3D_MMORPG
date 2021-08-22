import { tweakpane } from "./deps.js";

import { EntityManager } from "./entity-manager.js";
import { Entity } from "./entity.js";
import { UIController } from "./ui-controller.js";
import { LevelUpComponentSpawner } from "./level-up-component.js";
import { NetworkController } from "./network-controller.js";
import { SceneryController } from "./scenery-controller.js";
import { LoadController } from "./load-controller.js";
import { NetworkEntitySpawner, PlayerSpawner } from "./spawners.js";
import { TerrainChunkManager } from "./terrain.js";
import { InventoryDatabaseController } from "./inventory-controller.js";

import { SpatialHashGrid } from "../shared/spatial-hash-grid.js";
import { WEAPONS_DATA } from "../shared/defs.js";
import { ThreeJSController } from "./threejs_component.js";

class CrappyMMOAttempt {
  entityManager_ = new EntityManager();
  grid_ = new SpatialHashGrid(
    [[-1000, -1000], [1000, 1000]],
    [100, 100],
  );
  previousRAF_ = null;

  // _gui = new GUI();
  // _guiParams = {
  //   general: {},
  // };
  gameInitialized = false;

  constructor() {
    // this._gui.addFolder("General");
    // this._gui.close();
  }

  OnGameStarted_() {
    this.LoadControllers_();
    this.LoadPlayer_();
    this.gameInitialized = true;

    this.RAF_();
  }

  LoadControllers_() {
    const threejs = new Entity();
    threejs.AddComponent(new ThreeJSController());
    this.entityManager_.Add(threejs);

    // Hack
    this.scene_ = threejs.GetComponent("ThreeJSController").scene_;
    this.camera_ = threejs.GetComponent("ThreeJSController").camera_;
    this.threejs_ = threejs.GetComponent("ThreeJSController").threejs_;

    const ui = new Entity();
    ui.AddComponent(new UIController());
    this.entityManager_.Add(ui, "ui");

    const network = new Entity();
    network.AddComponent(new NetworkController());
    this.entityManager_.Add(network, "network");

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
    this.entityManager_.Add(t, "terrain");

    const l = new Entity();
    l.AddComponent(new LoadController());
    this.entityManager_.Add(l, "loader");

    const scenery = new Entity();
    scenery.AddComponent(
      new SceneryController({
        scene: this.scene_,
        grid: this.grid_,
      }),
    );
    this.entityManager_.Add(scenery, "scenery");

    const spawner = new Entity();
    spawner.AddComponent(
      new PlayerSpawner({
        grid: this.grid_,
        scene: this.scene_,
        camera: this.camera_,
      }),
    );
    spawner.AddComponent(
      new NetworkEntitySpawner({
        grid: this.grid_,
        scene: this.scene_,
        camera: this.camera_,
      }),
    );
    this.entityManager_.Add(spawner, "spawners");

    const database = new Entity();
    database.AddComponent(
      new InventoryDatabaseController(),
    );
    this.entityManager_.Add(database, "database");

    // HACK
    for (let k in WEAPONS_DATA) {
      database.GetComponent("InventoryDatabaseController").AddItem(
        k,
        WEAPONS_DATA[k],
      );
    }
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
    this.entityManager_.Add(levelUpSpawner, "level-up-spawner");
  }

  _OnWindowResize() {
    if (this.gameInitialized) {
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

    this.entityManager_.Update(timeElapsedS);
  }
}

// export const pane = new tweakpane.Pane()
// const PARAMS = {
//   num: 123,
//   string: 'hello',
//   color: '#0f0',
// };
// pane.addInput(PARAMS, 'num');
// pane.addInput(PARAMS, 'string');
// pane.addInput(PARAMS, 'color');
// pane.expanded = false

const mmo = new CrappyMMOAttempt();

document.getElementById("login-button").onclick = () => {
  mmo.OnGameStarted_();
};

window.addEventListener("resize", () => {
  mmo._OnWindowResize();
});

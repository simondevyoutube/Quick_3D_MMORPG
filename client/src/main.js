import {GUI} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/libs/dat.gui.module.js';
import {entity_manager} from './entity-manager.js';
import {entity} from './entity.js';
import {ui_controller} from './ui-controller.js';
import {level_up_component} from './level-up-component.js';
import {network_controller} from './network-controller.js';
import {scenery_controller} from './scenery-controller.js';
import {LoadController} from './load-controller.js';
import {spawners} from './spawners.js';
import {terrain} from './terrain.js';
import {inventory_controller} from './inventory-controller.js';
import {spatial_hash_grid} from '/shared/spatial-hash-grid.mjs';
import {defs} from '/shared/defs.mjs';
import {threejs_component} from './threejs_component.js';

export class EventEmitter{
  constructor(){
      this.callbacks = {}
  }

  on(event = '', cb = () => {}){
      if(!this.callbacks[event]) this.callbacks[event] = [];
      this.callbacks[event].push(cb)
  }

  emit(event = '', data){
      let cbs = this.callbacks[event]
      if(cbs){
          cbs.forEach(cb => cb(data))
      }
  }
}

export class GameEngine {
  constructor() {
    this.entityManager_ = new entity_manager.EntityManager();
    this.eventEmitter = new EventEmitter
  }
  
  start() {
    this.CreateGUI_();

    this.grid_ = new spatial_hash_grid.SpatialHashGrid(
        [[-1000, -1000], [1000, 1000]], [100, 100]);

    this.LoadControllers_();
    this.LoadPlayer_();

    this.previousRAF_ = null;
    this.RAF_();
  }

  CreateGUI_() {
    this._guiParams = {
      general: {
      },
    };
    this._gui = new GUI();

    const generalRollup = this._gui.addFolder('General');
    this._gui.close();
  }

  get THREE() {
    return this.threejs
  }

  LoadControllers_() {
    const threejs = new entity.Entity();
    threejs.AddComponent(new threejs_component.ThreeJSController());
    this.entityManager_.Add(threejs);

    // Hack
    this.scene_ = threejs.GetComponent('ThreeJSController').scene_;
    this.camera_ = threejs.GetComponent('ThreeJSController').camera_;
    this.threejs = threejs.GetComponent('ThreeJSController').threejs;

    const ui = new entity.Entity();
    ui.AddComponent(new ui_controller.UIController());
    this.entityManager_.Add(ui, 'ui');

    const network = new entity.Entity();
    network.AddComponent(new network_controller.NetworkController());
    this.entityManager_.Add(network, 'network');

    const t = new entity.Entity();
    t.AddComponent(new terrain.TerrainChunkManager({
        scene: this.scene_,
        target: 'player',
        gui: this._gui,
        guiParams: this._guiParams,
        threejs: this.threejs,
    }));
    this.entityManager_.Add(t, 'terrain');

    // Add loader entity
    const l = new entity.Entity();
    l.AddComponent(new LoadController());
    this.entityManager_.Add(l, 'loader');

    const scenery = new entity.Entity();
    scenery.AddComponent(new scenery_controller.SceneryController({
        scene: this.scene_,
        grid: this.grid_,
    }));
    this.entityManager_.Add(scenery, 'scenery');

    const spawner = new entity.Entity();
    spawner.AddComponent(new spawners.PlayerSpawner({
        grid: this.grid_,
        scene: this.scene_,
        camera: this.camera_,
    }));
    spawner.AddComponent(new spawners.NetworkEntitySpawner({
        grid: this.grid_,
        scene: this.scene_,
        camera: this.camera_,
    }));
    this.entityManager_.Add(spawner, 'spawners');


    const database = new entity.Entity();
    database.AddComponent(new inventory_controller.InventoryDatabaseController());
    this.entityManager_.Add(database, 'database');

    // HACK
    for (let k in defs.WEAPONS_DATA) {
      database.GetComponent('InventoryDatabaseController').AddItem(
          k, defs.WEAPONS_DATA[k]);
    }

    this.eventEmitter.emit('ready', this)
  }

  LoadPlayer_() {
    const levelUpSpawner = new entity.Entity();
    levelUpSpawner.AddComponent(new level_up_component.LevelUpComponentSpawner({
        camera: this.camera_,
        scene: this.scene_,
    }));
    this.entityManager_.Add(levelUpSpawner, 'level-up-spawner');
  }

  _OnWindowResize() {
    this.camera_.aspect = window.innerWidth / window.innerHeight;
    this.camera_.updateProjectionMatrix();
    this.threejs.setSize(window.innerWidth, window.innerHeight);
  }

  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      }

      this.threejs.render(this.scene_, this.camera_);
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


// let _APP = null;

// window.addEventListener('DOMContentLoaded', () => {
//   _APP = new GameEngine();
// });

export default GameEngine
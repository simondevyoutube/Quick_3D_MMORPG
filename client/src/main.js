import {GUI} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/libs/dat.gui.module.js';

import {entity_manager} from './entity-manager.js';
import {entity} from './entity.js';
import {ui_controller} from './ui-controller.js';
import {level_up_component} from './level-up-component.js';
import {network_controller} from './network-controller.js';
import {scenery_controller} from './scenery-controller.js';
import {load_controller} from './load-controller.js';
import {spawners} from './spawners.js';
import {terrain} from './terrain.js';
import {inventory_controller} from './inventory-controller.js';
import {webxr_component} from './webxr-component.js';

import {spatial_hash_grid} from '../shared/spatial-hash-grid.mjs';
import {defs} from '../shared/defs.mjs';
import {threejs_component} from './threejs_component.js';



class CrappyMMOAttempt {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    console.log('INITIALIZING!');
    this.entityManager_ = new entity_manager.EntityManager();

    document.getElementById('login-ui').style.visibility = 'visible';
    document.getElementById('login-button').onclick = () => {
      this.OnGameStarted_();
    };
  }

  OnGameStarted_() {
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

  LoadControllers_() {
    const threejs = new entity.Entity();
    threejs.AddComponent(new threejs_component.ThreeJSController());
    this.entityManager_.Add(threejs);

    // Hack
    this.scene_ = threejs.GetComponent('ThreeJSController').scene_;
    this.camera_ = threejs.GetComponent('ThreeJSController').camera_;
    this.threejs_ = threejs.GetComponent('ThreeJSController').threejs_;

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
        threejs: this.threejs_,
    }));
    this.entityManager_.Add(t, 'terrain');

    const l = new entity.Entity();
    l.AddComponent(new load_controller.LoadController());
    this.entityManager_.Add(l, 'loader');

    const scenery = new entity.Entity();
    scenery.AddComponent(new scenery_controller.SceneryController({
        scene: this.scene_,
        grid: this.grid_,
    }));
    this.entityManager_.Add(scenery, 'scenery');
    console.log('Added scenery controller')

    const spawner = new entity.Entity();
    spawner.AddComponent(new spawners.PlayerSpawner({
        grid: this.grid_,
        scene: this.scene_,
        camera: this.camera_,
        renderer: this.threejs_,
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

    // WebXR Controller
    const webxr = new entity.Entity();
    webxr.AddComponent(new webxr_component.WebXRController({
        renderer: this.threejs_,
        scene: this.scene_,
        camera: this.camera_,
        unitsPerMeter: 5.3,       // scale up WebXR height to match character scaling
        eyeOffsetMeters: 0,       // extra bias if needed
        invertStickY: false       // fix your forward/back        
    }));
    this.entityManager_.Add(webxr, 'webxr');

    // HACK
    for (let k in defs.WEAPONS_DATA) {
      database.GetComponent('InventoryDatabaseController').AddItem(
          k, defs.WEAPONS_DATA[k]);
    }
  }

  LoadPlayer_() {
    const params = {
      camera: this.camera_,
      scene: this.scene_,
    };

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
    this.threejs_.setSize(window.innerWidth, window.innerHeight);
  }

  RAF_() {
    // dynamic XR scale state
    this._xrScale = 1.0;          // start lower for Quest 3
    this._avgMs   = 0;            // EMA of frame time
    this._targetMs = 1000 / 72;   // will update from XR session.frameRate if available
    this._xrHz = 72;

    if (this.threejs_.xr.setFramebufferScaleFactor) {
      this.threejs_.xr.setFramebufferScaleFactor(this._xrScale);
    }
    if (this.threejs_.xr.setFoveation) {
      this.threejs_.xr.setFoveation(1); // moderate foveation for performance
    }

    this.threejs_.setAnimationLoop((t) => {
      if (this.previousRAF_ === null) this.previousRAF_ = t;
      const dt = t - this.previousRAF_;
      this.previousRAF_ = t;

      // --- dynamic scaling only while in XR ---
      const xr = this.threejs_.xr;
      if (xr && xr.isPresenting) {
        // pick the headset’s refresh rate if exposed
        const session = xr.getSession && xr.getSession();
        const hz = (session && session.frameRate) ? session.frameRate : this._xrHz;
        if (hz !== this._xrHz) {
          this._xrHz = hz;
          this._targetMs = 1000 / hz;
        }

        // exponential moving average of frame time
        this._avgMs = this._avgMs * 0.9 + dt * 0.1;

        // hysteresis band to avoid oscillation (wider band for Quest 3 stability)
        const upThresh   = this._targetMs * 0.88; // faster than target → scale up (sharper)
        const downThresh = this._targetMs * 1.12; // slower than target → scale down

        // clamp range & small step changes
        const minScale = 0.7;
        const maxScale = 1.2;
        const step = 0.05;

        if (this._avgMs > downThresh && this._xrScale > minScale) {
          this._xrScale = Math.max(minScale, +(this._xrScale - step).toFixed(2));
          xr.setFramebufferScaleFactor && xr.setFramebufferScaleFactor(this._xrScale);
        } else if (this._avgMs < upThresh && this._xrScale < maxScale) {
          this._xrScale = Math.min(maxScale, +(this._xrScale + step).toFixed(2));
          xr.setFramebufferScaleFactor && xr.setFramebufferScaleFactor(this._xrScale);
        }
      }

      // your original order
      this.threejs_.render(this.scene_, this.camera_);
      this.Step_(dt);
    });
  }


  Step_(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this.entityManager_.Update(timeElapsedS);
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new CrappyMMOAttempt();
});

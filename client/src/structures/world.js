import { Assets } from "../interfaces/assets.js";
import { Entities } from "../interfaces/entities.js";
import { ThreeInit } from "../interfaces/graphics.js";
import { Input } from "../interfaces/input.js";
import { Network } from "../interfaces/network.js";
import { Physics } from "../interfaces/physics.js";
import { Terrain } from "../interfaces/terrain.js";

export class World {
  previousRAF_ = undefined;
  initialized = false;

  network = new Network();
  assets = new Assets()
  physics = new Physics()
  input = new Input(this)
  entities = new Entities(this);

  constructor() {
    // TODO-DefinitelyMaybe: do better eventually
    this.threejs = new ThreeInit()
    this.scene = this.threejs.scene;
    this.camera = this.threejs.camera;
    this.renderer = this.threejs.renderer;

    // terrain doesnt make sense unless three has already been initialized
    // unless we're computing height...
    this.terrain = new Terrain(this)

    // Setup Network hooks
    this.network.websocket.on("world.player", (d) => {
      const {id, transform} = d;
      const entity = d.desc.character.class
      const name = d.desc.account.name
      // Can't currently guarantee them
      if (transform && id && entity && name) {
        this.entities.receive({id, transform, entity, name})
      }
    })
    this.network.websocket.on("world.update", (d) => {
      // The network is truth. generally speaking.
      for (let i = 0; i < d.length; i++) {
        const {id, transform} = d[i];
        const entity = d[i].desc ? d[i].desc.character.class : false
        // Can't currently guarantee them all
        if (transform && id && entity) {
          this.entities.receive({id, transform, entity})
        }
      }
    })

    this.RAF_();
    this.resize();
    this.initialized = true;
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
      this.update(t - this.previousRAF_);
      this.previousRAF_ = t;

      setTimeout(() => {
        this.RAF_();
      }, 1);
    });
  }

  update(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    // this.entities.update(timeElapsedS);
    this.physics.update(timeElapsedS)
    this.terrain.update(timeElapsedS);
    this.entities.update(timeElapsedS)
    if (this.entities.player) {
      // this moves the position of the sun (for shadows)
      this.threejs.update(this.entities.player)
    }
  }
}
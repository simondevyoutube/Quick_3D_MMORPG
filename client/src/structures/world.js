import { Entities } from "../interfaces/entities.js";
import { Network } from "../interfaces/network.js";
import { Assets } from "../interfaces/assets.js";
import { Terrain } from "../interfaces/terrain.js";

import { SpatialHashGrid } from "./spatialhashgrid.js"
import { ThreeInit } from "../interfaces/graphics.js";

export class World {
  input = {
    handleKeyup: undefined,
    handleKeydown: undefined,
  };
  entities = new Entities(this);
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

    // terrain doesnt make sense unless three has already been initialized
    this.terrain = new Terrain(this)

    // Setup Network hooks
    this.network.websocket.on("world.player", (d) => {
      /*
      desc:
        account: {name: "Caffeinated Noodler"}
        character: {class: "paladin", inventory: {…}}
      id: 832
      transform: (3) ["idle", Array(3), Array(4)]
      */
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
        /*
        desc: {account: {…}, character: {…}}
        events: []
        id: 305
        stats: (2) [305, {…}]
        transform: (3) ["idle", Array(3), Array(4)]
        */
        const {id, transform} = d[i];
        const entity = d[i].desc ? d[i].desc.name : false
        // Can't currently guarantee them
        if (transform && id && entity) {
          this.entities.createEntity({id, transform, entity})
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

      try {
        this.renderer.render(this.scene, this.camera); 
      } catch (error) {
        console.log(this.scene, this.camera);
        console.error(error);
      }
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
    this.terrain.update(timeElapsedS);
    if (this.entities.player) {
      // update player camera
      this.entities.player.update(timeElapsedS)
      // this moves the position of the sun (for shadows)
      this.threejs.update(this.entities.player)
    }
  }
}
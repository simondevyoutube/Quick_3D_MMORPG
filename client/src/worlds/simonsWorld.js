import { THREE } from "../deps.js";
import { Entities } from "../interfaces/entities.js";
import { ThreeInit } from "../interfaces/graphics.js";
import { Input } from "../interfaces/input.js";
import { Network } from "../interfaces/network.js";
import { Physics } from "../interfaces/physics.js";
import { InfiniteTerrain } from "../terrain/terrain.js";


export class World {
  initialized = false;

  network = new Network(this);
  physics = new Physics()
  input = new Input(this)
  entities = new Entities(this);
  time = new THREE.Clock()

  constructor() {
    // TODO-DefinitelyMaybe: do better eventually
    this.threejs = new ThreeInit()
    this.scene = this.threejs.scene;
    this.camera = this.threejs.camera;
    this.renderer = this.threejs.renderer;

    this.camera.position.set(-30, 20, -40)

    // terrain doesnt make sense unless three has already been initialized
    // ...unless we're just computing height...
    this.terrain = new InfiniteTerrain(this)

    this.renderer.setAnimationLoop(()=>this.animate());
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

  animate() {
    const dt = this.time.getDelta()
    this.update(dt);
    this.renderer.render(this.scene, this.camera); 
  }

  start(){
    this.time.start()
    this.time.getDelta()
    this.time.getDelta()
    this.renderer.setAnimationLoop(()=>this.animate())
  }

  stop() {
    this.time.stop()
    this.renderer.setAnimationLoop(null)
  }

  update(dt) {
    this.physics.update(dt)
    this.terrain.update();
    this.entities.update(dt)
    if (this.entities.player) {
      // this moves the position of the sun (for shadows)
      this.threejs.update(this.entities.player)
    }
  }
}
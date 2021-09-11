import { THREE } from "../deps.js";
import { Assets } from "../interfaces/assets.js";
import { ThreeInit } from "../interfaces/graphics.js";
import { newEntityClass } from "../entities/mod.js";

export class World {
  previousTime = 0;
  initialized = false;
  
  time = new THREE.Clock()
  assets = new Assets()

  constructor() {
    // TODO-DefinitelyMaybe: do better eventually
    this.threejs = new ThreeInit()
    this.scene = this.threejs.scene;
    this.camera = this.threejs.camera;
    this.renderer = this.threejs.renderer;

    this.camera.position.set(-7.5, 8, 9);

    const gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );
    this.scene.add(gridHelper)

    const entityClass = newEntityClass("player")
    this.entity = new entityClass({id:0, world:this, state:"idle", position:[0,0,0], quaternion:[0,0,0,1], model:"paladin"})
    this.entity.camera.target.set(0, 5.4, 0)
    this.entity.camera.update()


    this.animate();
    this.resize();

    this.initialized = true;
  }

  update(deltaTime) {
    this.entity.update(deltaTime)
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = this.time.getDelta()
    this.update(dt);
    this.renderer.render(this.scene, this.camera); 
  }
  
  resize() {
    if (this.initialized) {
      // TODO-DefinitelyMaybe: Adjusts game aspect ratio not layout.
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}
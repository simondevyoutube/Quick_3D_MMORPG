import { THREE } from "../deps.js";
import { ThreeInit } from "../interfaces/graphics.js";
import { Entities } from "../interfaces/entities.js";

export class World {
  previousTime = 0;
  initialized = false;
  
  time = new THREE.Clock()

  constructor() {
    // TODO-DefinitelyMaybe: do better eventually
    this.threejs = new ThreeInit()
    /** @type {THREE.Scene} */
    this.scene = this.threejs.scene;
    this.camera = this.threejs.camera;
    this.renderer = this.threejs.renderer;

    this.entities = new Entities(this)
    
    this.camera.position.set(-7.5, 8, 9);

    const gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );
    this.scene.add(gridHelper)

    // Create the first object
    this.entities.create({id:0, entity:"player", world:this, state:"idle", position:[0,0,0], quaternion:[0,0,0,1], model:"paladin"})
    
    // then set that objects camera
    const player = this.entities.get(0)
    player.cameraControls.target.set(0, 5.4, 0)
    player.cameraControls.update()


    this.animate();
    this.resize();

    this.initialized = true;
  }

  changeModel(model) {
    const currentEnt = this.entities.get(0)
    currentEnt.destroy()
    this.entities.create({id:0, entity:"player", world:this, state:"idle", position:[0,0,0], quaternion:[0,0,0,1], model})
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = this.time.getDelta()
    
    // update anything that needs to be updated
    this.entities.update(dt)

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
import { OrbitControls, THREE } from "../deps.js";
import { Input } from "./input.js";
import { create } from "../interfaces/assets.js";
import { Entity } from "./entity.js";


export class Player extends Entity {
  model;
  acceleration = 12;
  move = {
    left:0,
    right:0,
    forward:0,
    backward:0,
    jump:0,
  }
  canMove = true;
  isGrounded = false;

  constructor (args) {
    super(args)
    args = Object.assign(args, {entity:this})
    this.input = new Input(args)
    this.cameraControls = new OrbitControls(args.world.camera, args.world.renderer.domElement)
    create(args).then(val => {
      this.model = val.model;
      this.animator = val.animator
      this.body = val.physicsBody
      args.world.scene?.add(val.model)
      args.world.physics?.world.addBody(val.physicsBody)
    })
  }

  update(deltaTime) {
    if (this.animator && this.model && this.body) {
      this.animator.update(deltaTime)

      // set body velocity
      const velVec = this.getMovementDirection().applyQuaternion(
        this.model.quaternion,
      ).multiplyScalar(this.acceleration);
      // console.log(this.entity.getMovementDirection());
      // console.log(this.entity.body.velocity);
      
      this.body.velocity.set(velVec.x, this.body.velocity.y, velVec.z);
  
      if (this.move.jump && this.isGrounded) {
        this.body.velocity.y = 10;
      }

      const bodyPos = this.body.position
      this.model.position.set(bodyPos.x, bodyPos.y, bodyPos.z)

      // set camera position
      const entPos = this.position
      const offset = new THREE.Vector3().copy(this.cameraControls.object.position).sub(this.cameraControls.target)
      
      this.cameraControls.object.position.set(entPos.x, entPos.y, entPos.z).add(offset)
      this.cameraControls.target.set(entPos.x, entPos.y, entPos.z)
      
      this.cameraControls.update()

      // TODO-DefinitelyMaybe: Rotate 180
      // set player rotation
      const camEuler = new THREE.Euler().setFromQuaternion(this.cameraControls.object.quaternion);

      camEuler.reorder("YXZ");
      camEuler.x = 0;
      const camQuat = new THREE.Quaternion().setFromEuler(camEuler);

      this.model.quaternion.set(camQuat.x, camQuat.y, camQuat.z, camQuat.w); 

    }
  }

  getMovementDirection() {
    return new THREE.Vector3(
      -this.move.left + this.move.right,
      0,
      -this.move.forward + this.move.backward,
    ).normalize();
  }

  destroy(){
    // if the player can destroy it, let it
    super.destroy()
    this.input = undefined
    this.update = undefined
    this.cameraControls.dispose()
    this.animator = undefined;
    // otherwise leave it for the entities update loop
    // i.e. the model and the physics object
  }
}

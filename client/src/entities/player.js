import { newCharacterData } from "../data/models/characters/mod.js";
import { OrbitControls } from "../deps.js";
import { Movement } from "./actions/playermove.js";
import { Input } from "./input.js";
import { Model } from "./model.js";
import { Entity } from "./entity.js";


export class Player extends Entity {
  constructor (args) {
    super(args)
    args = Object.assign(args, newCharacterData(args.model), {entity:this})
    this.input = new Input(args)
    this.camera = new OrbitControls(args.world.camera, args.world.renderer.domElement)
    this.camera.target.set(-50, 0, -5)
    this.camera.update()
    this.model = new Model(args)
    this.movement = new Movement(args)

    this.position.y = 10
  }

  update(deltaTime) {
    // this.camera.update(deltaTime)
    this.movement.update(deltaTime)
    if (this.model.mixer) {
      this.model.mixer.update(deltaTime)
    }
    if (this.model.collisionBody) {
      const pos = this.model.collisionBody.position
      this.model.group.position.set(pos.x, pos.y, pos.z)
    }
  }
}

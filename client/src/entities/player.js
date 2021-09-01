import { Entity } from "../structures/entity.js";
import { PlayerMovement } from "../functions/actions/playermove.js";
import { Input } from "../functions/input.js";
import { ThirdPersonCamera } from "../cameras/thirdperson.js";
import { Model } from "../functions/model.js";

import { newCharacterData } from "../data/models/characters/mod.js";

export class Player extends Entity {
  constructor (args) {
    super(args)
    args = Object.assign(args, newCharacterData(args.model), {entity:this})
    this.input = new Input()
    this.movement = new PlayerMovement(args)
    this.camera = new ThirdPersonCamera(args)
    this.model = new Model(args)
  }

  update(timeElapsed) {
    this.camera.update(timeElapsed)
    if (this.model.mixer) {
      this.model.mixer.update(timeElapsed)
    }
  }
}

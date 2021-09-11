import { Entity } from "./entity.js";
import { Model } from "./model.js";

import { newCharacterData } from "../data/models/characters/mod.js";


export class NPC extends Entity {
  constructor (args) {
    super(args)
    args = Object.assign(args, newCharacterData(args.model), {entity:this})
    this.model = new Model(args)
  }

  update(timeElapsed) {
    if (this.model.mixer) {
      this.model.mixer.update(timeElapsed)
    }
  }
}
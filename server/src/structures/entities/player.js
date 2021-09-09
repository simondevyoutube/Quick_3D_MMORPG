import { newCharacterData } from "../data/models/characters/mod.js";
import { Movement } from "../../functions/actions/playermove.js";
import { Entity } from "../entity.js";


export class Player extends Entity {
  constructor (args) {
    super()
    args = Object.assign(args, newCharacterData(args.model), {entity:this})
    this.movement = new Movement(args)
    this.network = args.network
  }

  update() {}
}

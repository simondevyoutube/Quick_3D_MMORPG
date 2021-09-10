import { newCharacterData } from "../../deps.js";
// import { Movement } from "../../functions/actions/playermove.js";
import { Entity } from "../entity.js";


export class Player extends Entity {
  constructor (args) {
    super()
    this.name = args.name ? args.name : "test";
    this.characterData = newCharacterData(args.model)
    this.model = this.characterData.name
    // this.movement = new Movement(args)
    // this.network = args.network
  }

  toJSON(){
    const data = super.toJSON()
    data.name = this.name
    data.model = this.model
    return data
  }
}

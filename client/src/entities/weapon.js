import { Entity } from "../structures/entity.js";
import { Model } from "../functions/model.js";
import { axe, hammer, sword } from "../data/models/weapons/mod.js";

const weaponsData = (arg) => {
  switch (arg) {
    case "axe":
      return axe
    case "hammer":
      return hammer
    case "sword":
      return sword
    default:
      return sword
  }
}
let ID = 0

export class Weapon extends Entity {
  name = `weapon_${ID++}`
  constructor(world, arg){
    super()
    this.model = new Model(world, weaponsData(arg))
  }
}
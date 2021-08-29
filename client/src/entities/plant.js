import { Entity } from "../structures/entity.js";
import { flowers1, grass1, plant1 } from "../data/models/mod.js";
import { Model } from "../functions/model.js";

const plantsData = (arg) => {
  switch (arg) {
    case "flower":
      return flowers1
    case "grass":
      return grass1
    case "plant":
      return plant1
    default:
      return plant1
  }
}
let ID = 0

export class Plant extends Entity {
  name = `plant_${ID++}`
  constructor(world, arg){
    super()
    this.model = new Model(world, plantsData(arg))
  }
}
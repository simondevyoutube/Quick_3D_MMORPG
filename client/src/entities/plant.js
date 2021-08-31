import { Entity } from "../structures/entity.js";
import { newPlantData } from "../data/models/plants/mod.js";
import { Model } from "../functions/model.js";


export class Plant extends Entity {
  constructor(args){
    super(args)
    args = Object.assign(args, newPlantData(args.model), {entity:this})
    this.model = new Model(args)
  }
}
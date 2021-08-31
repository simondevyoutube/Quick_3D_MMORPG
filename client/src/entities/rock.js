import { Entity } from "../structures/entity.js";
import { Model } from "../functions/model.js";
import { newRockData } from "../data/models/rocks/mod.js";

export class Rock extends Entity {
  constructor(args){
    super(args)
    args = Object.assign(args, newRockData(args.model), {entity:this})
    this.model = new Model(args)
  }
}
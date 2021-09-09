import { Entity } from "../entity.js";
import { Model } from "../../functions/model.js";
import { newTreeData } from "../../data/models/trees/mod.js";

/** Static meaning that the player can't walk through it */
export class Static extends Entity {
  constructor(args){
    super(args)
    args = Object.assign(args, newTreeData(args.model), {entity: this})
    this.model = new Model(args)
  }
}
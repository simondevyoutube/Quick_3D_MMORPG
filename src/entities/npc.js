import { Entity } from "./entity.js";
import { create } from "../interfaces/assets.js";


export class NPC extends Entity {
  constructor (args) {
    super(args)
    args = Object.assign(args, {entity:this})
    this.model = create(args).then(val => {
      this.model = val.model;
      args.world.scene.add(val.model)
    })
  }
}
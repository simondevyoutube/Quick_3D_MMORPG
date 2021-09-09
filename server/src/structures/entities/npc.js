import { Entity } from "../entity.js";

export class NPC extends Entity {
  constructor (args) {
    super()
    this.network = args.network
  }

  update() {}
}
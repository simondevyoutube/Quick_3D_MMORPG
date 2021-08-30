import { Entity } from "../structures/entity.js";
import { Model } from "../functions/model.js";
import { rock1, rockMoss1 } from "../data/models/mod.js";

const rocksData = (arg) => {
  switch (arg) {
    case "rock":
      return rock1
    case "rockmoss":
      return rockMoss1
    default:
      return rock1
  }
}

export class Rock extends Entity {
  name = `rock`
  constructor(args){
    super(args)
    this.model = new Model(args.world, rocksData(args.name))
  }
}
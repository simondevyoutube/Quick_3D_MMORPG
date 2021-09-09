// import { Assets } from "../../interfaces/assets.js";
import { Entities } from "../../interfaces/entities.js";
import { Input } from "../../interfaces/input.js";
import { Network } from "../../interfaces/network.js";
import { Physics } from "../../interfaces/physics.js";
import { Planet } from "../../interfaces/terrain.js";
// import { performance } from "../deps.js";

export class World {
  entities = new Entities()
  input = new Input()
  physics = new Physics()
  terrain = new Planet()
  
  constructor(args) {
    this.network = new Network(args)
  }

  start() {}

  stop() {}
}

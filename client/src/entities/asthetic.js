import { Entity } from "../structures/entity.js";
import { Model } from "../functions/model.js";
import { rand_int } from "../functions/math.js";

import { newRockData } from "../data/models/rocks/mod.js";

export class Asthetic extends Entity {
  constructor(args){
    super(args)
    args = Object.assign(args, newRockData(args.model), {entity:this})
    this.model = new Model(args)
  }

  randomizeCloudArgs(args) {
    // randomizes which model is chosen
    let split = args.url.split("/")
    let name = split[split.length-1]
    const base = args.url.split(name)[0]
    name = name.replace("1", `${rand_int(1,3)}`)
    args.url = `${base}${name}`
    
    args.scale = Math.random() * 20 + 40
    args.emissive = new THREE.Color(0x000000)
    args.color = new THREE.Color(0x202020)

    return args
  }
}
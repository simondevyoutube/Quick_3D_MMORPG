import { THREE } from "../deps.js";
import { Entity } from "../structures/entity.js";
import { Model } from "../functions/model.js";
import { rand_int } from "../functions/math.js";
import { cloud } from "../data/models/cloud.js";

export class Cloud extends Entity {
  constructor (args) {
    super(args)
    args = Object.assign(args, cloud)

    // randomizes which model is chosen
    let split = cloud.url.split("/")
    let name = split[split.length-1]
    const base = cloud.url.split(name)[0]
    name = name.replace("1", `${rand_int(1,3)}`)
    cloud.url = `${base}${name}`
    
    cloud.scale = Math.random() * 20 + 40
    cloud.emissive = new THREE.Color(0x000000)
    cloud.color = new THREE.Color(0x202020)

    this.model = new Model(args)
  }
}
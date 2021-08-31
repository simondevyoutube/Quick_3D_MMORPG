import { Entity } from "../structures/entity.js";
import { Model } from "../functions/model.js";
import { newTreeData } from "../data/models/trees/mod.js";
import { Grid } from "../interfaces/spatialgrid.js";

export class Tree extends Entity {
  constructor(args){
    super(args)
    args = Object.assign(args, newTreeData(args.model), {entity: this})
    this.model = new Model(args)
    this.grid = new Grid(args)
    // data.textures = {
    //   resourcePath: "./resources/trees/Textures/",
    //   names: randomProp.names,
    //   wrap: true,
    // }
    // data.emissive = new THREE.Color(0x000000)
    // data.specular = new THREE.Color(0x000000)
    // data.scale = randomProp.scale *
    //     (0.8 + this.noise.Get(spawnPos.x, 4.0, spawnPos.z) * 0.4),
    // data.castShadow = true,
    // data.receiveShadow = true,
    // data.onMaterial = (m) => {
    //   if (m.name.search("Leaves") >= 0) {
    //     m.alphaTest = 0.5;
    //   }
    // }
  }
}
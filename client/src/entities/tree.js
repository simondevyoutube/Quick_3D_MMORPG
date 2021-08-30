import { Entity } from "../structures/entity.js";
import { Model } from "../functions/model.js";
import { birch1, tree1 } from "../data/models/mod.js";
import { Grid } from "../interfaces/spatialgrid.js";

const treesData = (arg) => {
  switch (arg) {
    case "tree":
      return tree1
    case "birch":
      return birch1
    default:
      return tree1
  }
}

export class Tree extends Entity {
  name = `tree`
  constructor(world, arg){
    super()
    const data = treesData(arg)
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
    this.model = new Model(world, data)
    this.grid = new Grid(world, this)
  }
}
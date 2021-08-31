import { tree1 } from "./tree.js";
import { birch1 } from "./birch.js";

export const newTreeData = (name) => {
  switch (name) {
    case "tree":
      return tree1
    case "birch":
      return birch1
    default:
      throw `Didn't have tree data for: ${name}`
  }
}
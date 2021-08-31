import { flowers1 } from "./flower.js";
import { grass1 } from "./grass.js";
import { plant1 } from "./plant.js";

export const newPlantData = (name) => {
  switch (name) {
    case "flower":
      return flowers1
    case "grass":
      return grass1
    case "plant":
      return plant1
    default:
      throw `Didn't have plant data for: ${name}`
  }
}
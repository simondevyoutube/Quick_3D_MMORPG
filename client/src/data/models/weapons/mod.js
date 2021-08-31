import { axe } from "./axe.js";
import { hammer } from "./hammer.js";
import { sword } from "./sword.js";

export const newWeaponData = (name) => {
  switch (name) {
    case "axe":
      return axe
    case "hammer":
      return hammer
    case "sword":
      return sword
    default:
      throw `Didn't have weapon data for: ${name}`
  }
}
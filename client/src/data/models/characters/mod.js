import { paladin } from "./paladin.js";
import { sorceror } from "./sorceror.js";
import { warrok } from "./warrok.js";
import { zombie } from "./zombie.js";

export const newCharacterData = (name) => {
  switch (name) {
    case "paladin":
      return paladin
    case "sorceror":
      return sorceror
    case "warrok":
      return warrok
    case "zombie":
      return zombie
    default:
      throw `Didn't have character data for: ${name}`
  }
}
import { NPC } from "./npc.js";
import { Player } from "./player.js";

export const newEntityClass = (name) => {
  switch (name) {
    case "player":
      return Player
    case "npc":
      return NPC
    default:
      throw `Couldn't find Entity class for ${name}`
  }
}
// TODO-DefinitelyMaybe: Might combine some of these later
import { Asthetic } from "./asthetic.js";
import { NPC } from "./npc.js";
import { Player } from "./player.js";
import { Static } from "./static.js";

export const newEntityClass = (name) => {
  switch (name) {
    case "player":
      return Player
    case "npc":
      return NPC
    case "cloud":
      return Asthetic
    case "plant":
      return Asthetic
    case "rock":
      return Static
    case "tree":
      return Static
    case "weapon":
      return Asthetic
    default:
      throw `Couldn't find Entity class for ${name}`
  }
}
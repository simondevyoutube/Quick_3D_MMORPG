// TODO-DefinitelyMaybe: Might combine some of these later
import { Cloud } from "./cloud.js";
import { NPC } from "./npc.js";
import { Plant } from "./plant.js";
import { Player } from "./player.js";
import { Rock } from "./rock.js";
import { Tree } from "./tree.js";
import { Weapon } from "./weapon.js";

export const newEntityClass = (name) => {
  switch (name) {
    case "player":
      return Player
    case "npc":
      return NPC
    case "cloud":
      return Cloud
    case "plant":
      return Plant
    case "rock":
      return Rock
    case "tree":
      return Tree
    case "weapon":
      return Weapon
    default:
      return undefined
  }
}
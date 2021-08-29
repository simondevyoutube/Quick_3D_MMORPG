import { Entity } from "../structures/entity.js";
import { NPCMovement } from "../functions/actions/npcmove.js";
import { Equip } from "../functions/actions/equip.js";
import { Grid } from "../interfaces/spatialgrid.js";
import { Attack } from "../functions/actions/attack.js";
import { NetworkEntity } from "../functions/network/entity.js";

let ID = 0

export class NPC extends Entity {
  name = `npc_${ID++}`
  constructor (world) {
    super()
    this.movement = new NPCMovement(world);
    this.equip = new Equip()
    this.grid = new Grid(world, this)
    // TODO-DefinitelyMaybe: maybe this.actions then add the attack action
    this.attack = new Attack()
    this.network = new NetworkEntity(world.network)
  }
}
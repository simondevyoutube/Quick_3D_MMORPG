import { Entity } from "../structures/entity.js";
import { NPCMovement } from "../functions/actions/npcmove.js";
import { Equip } from "../functions/actions/equip.js";
import { Grid } from "../interfaces/spatialgrid.js";
import { Attack } from "../functions/actions/attack.js";
import { NetworkEntity } from "../functions/network/entity.js";
import { Model } from "../functions/model.js";

import { newCharacterData } from "../data/models/characters/mod.js";


export class NPC extends Entity {
  constructor (args) {
    super(args)
    args = Object.assign(args, newCharacterData(args.model), {entity:this})
    this.movement = new NPCMovement(args);
    this.equip = new Equip()
    this.grid = new Grid(args)
    // TODO-DefinitelyMaybe: maybe this.actions then add the attack action
    this.attack = new Attack()
    this.network = new NetworkEntity(args)
    this.model = new Model(args)
  }
}
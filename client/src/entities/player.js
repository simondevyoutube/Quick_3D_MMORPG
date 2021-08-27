import { Entity } from "../structures/entity.js";
import { Movement } from "../functions/actions/move.js";
import { BasicCharacterControllerInput } from "../functions/components/playerinput.js";
import { EquipWeapon } from "../functions/actions/equip.js";
import { Grid } from "../interfaces/spatialgrid.js";
import { Attack } from "../functions/actions/attack.js";
import { ThirdPersonCamera } from "../cameras/thirdperson.js";
import { NetworkPlayerController } from "../interfaces/networkplayercontroller";
import { BloodEffect } from "../entities/particles/blood.js";
import { SorcerorEffect } from "../entities/particles/sorceror.js";

export class Player extends Entity {
  constructor (params) {
    super()
    this.account = params.account;
    this.input = new BasicCharacterControllerInput(params)
    this.movement = new Movement(this.world, playerParams);
    this.equip = new EquipWeapon({ desc: playerParams })
    this.grid = new Grid(this.world, player)
    // TODO-DefinitelyMaybe: maybe this.actions then add the attack action
    this.attack = new Attack()
    this.camera = new ThirdPersonCamera(this.world, this),
    this.network = new NetworkPlayerController(this.network)
    this.bloodEffect = new BloodEffect({
      camera: this.world.camera,
      scene: this.world.scene,
    })
    if (params.character.class == "sorceror") {
      this.sorcerorEffect = new SorcerorEffect(params)
    }
  }
}

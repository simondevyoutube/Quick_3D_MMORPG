import { NPC } from "./npc.js";
import { PlayerMovement } from "../functions/actions/playermove.js";
import { Input } from "../functions/input.js";
import { NetworkPlayer } from "../functions/network/player.js";
import { ThirdPersonCamera } from "../cameras/thirdperson.js";
import { BloodEffect } from "./particles/blood.js";
import { SorcerorEffect } from "./particles/sorceror.js";
// import { paladin, sorceror } from "../data/models/characters/mod.js";
import { rock1 } from "../data/models/mod.js";
import { Model } from "../functions/model.js";

export class Player extends NPC {
  name = `player`
  constructor (world) {
    super(world)
    // this.account = params.account
    this.class = "paladin"
    this.input = new Input()
    this.movement = new PlayerMovement(world)
    this.camera = new ThirdPersonCamera(world, this)
    this.network = new NetworkPlayer(world.network, this)
    this.bloodEffect = new BloodEffect({
      camera: world.camera,
      scene: world.scene,
    })
    this.model = new Model(world, rock1)
    // if (this.class == "sorceror") {
    //   this.sorcerorEffect = new SorcerorEffect()
    //   this.model = new Model(world, rock1)
    // } else {
    //   // TODO-DefinitelyMaybe: 
    // }
  }

  update(timeElapsed) {
    this.camera.update(timeElapsed)
  }
}

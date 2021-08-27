import { NPC } from "./npc.js";
import { PlayerMovement } from "../functions/actions/playermove.js";
import { Input } from "../functions/components/input.js";
import { NetworkPlayer } from "../functions/network/player.js";
import { ThirdPersonCamera } from "../cameras/thirdperson.js";

let ID = 0

export class Player extends NPC {
  name = `player_${ID++}`
  constructor (world) {
    super(world)
    // this.account = params.account
    this.input = new Input()
    this.movement = new PlayerMovement(world)
    this.camera = new ThirdPersonCamera(world, this)
    this.network = new NetworkPlayer(world.network)
  }
}

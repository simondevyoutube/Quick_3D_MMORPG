import { Entity } from "../structures/entity.js";
import { Component } from "../structures/component.js";

import { ThirdPersonCamera } from "../cameras/thirdperson.js";
import { BasicCharacterController } from "./player.js";
import { BasicCharacterControllerInput } from "../interfaces/playerinput.js";

import { Grid } from "../interfaces/spatialgrid.js";

import { EquipWeapon } from "../functions/actions/equip.js"
import { Attack } from "../functions/actions/attack.js"

import { NPCController } from "./npc.js";
import { NetworkEntityController } from "../interfaces/networkentitycontroller.js";
import { NetworkPlayerController } from "../interfaces/networkplayercontroller.js";
import { FloatingName } from "../functions/components/name.js";
import { SorcerorEffect } from "./particles/sorceror.js";
import { BloodEffect } from "./particles/blood.js";

export class PlayerSpawner extends Component {
  constructor(game) {
    super();
    this.game = game
    this.grid = game.grid
    this.scene = game.scene
    this.camera = game.camera
    this.network = game.network
  }

  Spawn(playerParams) {
    // TODO-DefinitelyMaybe: Copy and paste player init into player entity file
    console.log("Spawning a player");
    const params = {
      camera: this.camera,
      scene: this.scene,
      desc: playerParams,
    };

    const player = new Entity();
    player.Account = playerParams.account;
    player.AddComponent(
      new BasicCharacterControllerInput(params),
    );
    player.AddComponent(new BasicCharacterController(this.game, playerParams));
    player.AddComponent(
      new EquipWeapon({ desc: playerParams }),
    );
    player.AddComponent(
      new Grid(this.game, player),
    );
    player.AddComponent(
      new Attack(),
    );
    player.AddComponent(
      // TODO-DefinitelyMaybe: because the entity hasn't been added into the entities manager yet
      // we pass in the player entity
      new ThirdPersonCamera(this.game, player),
    );
    player.AddComponent(
      new NetworkPlayerController(this.network)
    );
    player.AddComponent(
      new BloodEffect({
        camera: this.camera,
        scene: this.scene,
      }),
    );
    if (playerParams.character.class == "sorceror") {
      player.AddComponent(
        new SorcerorEffect(params),
      );
    }
    this.Manager.Add(player, "player");

    return player;
  }
}

export class NetworkEntitySpawner extends Component {
  constructor(game) {
    super();
    this.game = game
    this.grid = game.grid
    this.scene = game.scene
    this.camera = game.camera
    this.network = game.network
  }

  Spawn(name, desc) {
    const npc = new Entity();
    // npc.Account = desc.account;
    npc.AddComponent(
      new NPCController(this.game, desc)
    );
    npc.AddComponent(
      new Grid(this.game, npc),
    );
    npc.AddComponent(
      new NetworkEntityController(),
    );
    if (desc.account.name) {
      npc.AddComponent(
        new FloatingName({ desc: desc }),
      );
    }
    npc.AddComponent(
      new EquipWeapon({ desc: desc }),
    );
    // npc.AddComponent(new InventoryController());
    npc.AddComponent(
      new BloodEffect({
        camera: this.camera,
        scene: this.scene,
      }),
    );
    if (desc.character.class == "sorceror") {
      npc.AddComponent(
        new SorcerorEffect({
          camera: this.camera,
          scene: this.scene,
        }),
      );
    }

    this.Manager.Add(npc, name);

    return npc;
  }
}

export class Spawner extends Entity {
  constructor() {
    super()
  }

  spawn(entity) {
    console.log(`Spawning ${entity.name}`);
    entity.position = this.position
    entity.quaternion = this.quaternion
    // this.SetActive(true) // ?
  }
}

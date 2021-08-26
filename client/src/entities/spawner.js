import { Entity } from "../utils/entity.js";
import { Component } from "../utils/component.js";

import { ThirdPersonCamera } from "../cameras/thirdperson.js";
import { BasicCharacterController } from "./player.js";
import { BasicCharacterControllerInput } from "../interfaces/playerinput.js";

import { SpatialGridController } from "../interfaces/spatialgrid.js";

import { EquipWeapon } from "../components/equip.js";
import { AttackController } from "../components/attack.js";

import { NPCController } from "./npc.js";
import { NetworkEntityController } from "../interfaces/networkentitycontroller.js";
import { NetworkPlayerController } from "../interfaces/networkplayercontroller.js";
import { FloatingName } from "../components/name.js";
import { SorcerorEffect } from "./particles/sorceror.js";
import { BloodEffect } from "./particles/blood.js";

export class PlayerSpawner extends Component {
  constructor(params) {
    super();
    this.params_ = params;
  }

  Spawn(playerParams) {
    console.log("Spawning a player");
    const params = {
      camera: this.params_.camera,
      scene: this.params_.scene,
      desc: playerParams,
    };

    const player = new Entity();
    player.Account = playerParams.account;
    player.AddComponent(
      new BasicCharacterControllerInput(params),
    );
    player.AddComponent(new BasicCharacterController(params));
    player.AddComponent(
      new EquipWeapon({ desc: playerParams }),
    );
    // player.AddComponent(
    //   new UIInventoryController(params),
    // );
    // player.AddComponent(new InventoryController(params));
    // player.AddComponent(
    //   new HealthComponent({
    //     updateUI: true,
    //     health: 1,
    //     maxHealth: 1,
    //     strength: 1,
    //     wisdomness: 1,
    //     benchpress: 1,
    //     curl: 1,
    //     experience: 1,
    //     level: 1,
    //     desc: playerParams,
    //   }),
    // );
    player.AddComponent(
      new SpatialGridController(
        { grid: this.params_.grid },
      ),
    );
    player.AddComponent(
      new AttackController(),
    );
    player.AddComponent(
      new ThirdPersonCamera({
        camera: this.params_.camera,
        target: player,
      }),
    );
    player.AddComponent(
      new NetworkPlayerController(this.params_.network)
    );
    player.AddComponent(
      new BloodEffect({
        camera: this.params_.camera,
        scene: this.params_.scene,
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
  constructor(params) {
    super();
    this.params_ = params;
  }

  Spawn(name, desc) {
    const npc = new Entity();
    npc.Account = desc.account;
    npc.AddComponent(
      new NPCController({
        camera: this.params_.camera,
        scene: this.params_.scene,
        desc: desc,
      }),
    );
    // npc.AddComponent(
    //   new HealthComponent({
    //     health: 50,
    //     maxHealth: 50,
    //     strength: 2,
    //     wisdomness: 2,
    //     benchpress: 3,
    //     curl: 1,
    //     experience: 0,
    //     level: 1,
    //     desc: desc,
    //   }),
    // );
    npc.AddComponent(
      new SpatialGridController(
        { grid: this.params_.grid },
      ),
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
        camera: this.params_.camera,
        scene: this.params_.scene,
      }),
    );
    if (desc.character.class == "sorceror") {
      npc.AddComponent(
        new SorcerorEffect({
          camera: this.params_.camera,
          scene: this.params_.scene,
        }),
      );
    }

    this.Manager.Add(npc, name);

    return npc;
  }
}

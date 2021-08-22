import { Component, Entity } from "./entity.js";

import { ThirdPersonCamera } from "./third-person-camera.js";
import { BasicCharacterController } from "./player-entity.js";
import { HealthComponent } from "./health-component.js";
import {
  BasicCharacterControllerInput,
  PickableComponent,
} from "./player-input.js";
import { SpatialGridController } from "./spatial-grid-controller.js";
import {
  InventoryController,
  InventoryDatabaseController,
  InventoryItem,
  UIInventoryController,
} from "./inventory-controller.js";
import { EquipWeapon } from "./equip-weapon-component.js";
import { AttackController } from "./attacker-controller.js";

import { NPCController } from "./npc-entity.js";
import { HealthBar } from "./health-bar.js";
import { NetworkEntityController } from "./network-entity-controller.js";
import { NetworkPlayerController } from "./network-player-controller.js";
import { FloatingName } from "./floating-name.js";
import { SorcerorEffect } from "./sorceror-effect.js";
import { BloodEffect } from "./blood-effect.js";

export class PlayerSpawner extends Component {
  constructor(params) {
    super();
    this.params_ = params;
  }

  Spawn(playerParams) {
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
    player.AddComponent(
      new UIInventoryController(params),
    );
    player.AddComponent(new InventoryController(params));
    player.AddComponent(
      new HealthComponent({
        updateUI: true,
        health: 1,
        maxHealth: 1,
        strength: 1,
        wisdomness: 1,
        benchpress: 1,
        curl: 1,
        experience: 1,
        level: 1,
        desc: playerParams,
      }),
    );
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
      new NetworkPlayerController({
        camera: this.params_.camera,
        target: player,
      }),
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
    npc.AddComponent(
      new HealthComponent({
        health: 50,
        maxHealth: 50,
        strength: 2,
        wisdomness: 2,
        benchpress: 3,
        curl: 1,
        experience: 0,
        level: 1,
        desc: desc,
      }),
    );
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
    npc.AddComponent(new InventoryController());
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

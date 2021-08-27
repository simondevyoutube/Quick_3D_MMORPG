import { THREE } from "../deps.js";

import { Component } from "../structures/component.js";

export class NetworkPlayerController extends Component {
  updateTimer_ = 0.0;
  loaded_ = false;
  net_

  constructor(network) {
    super();
    this.net_ = network
  }

  InitComponent() {
    this.registerHandler(
      "load.character",
      (m) => {
        this.OnLoaded_(m);
      },
    );
    this.registerHandler(
      "network.update",
      (m) => {
        this.OnUpdate_(m);
      },
    );
    this.registerHandler(
      "action.attack",
      (m) => {
        this.OnActionAttack_(m);
      },
    );
  }

  OnActionAttack_(msg) {
    this.net_.SendActionAttack_();
  }

  OnUpdate_(msg) {
    if (msg.transform) {
      this.parent.SetPosition(new THREE.Vector3(...msg.transform[1]));
      this.parent.SetQuaternion(new THREE.Quaternion(...msg.transform[2]));
    }

    if (msg.stats) {
      this.Broadcast({
        topic: "stats.network",
        value: msg.stats,
      });
    }

    if (msg.events) {
      if (msg.events.length > 0) {
        this.Broadcast({
          topic: "events.network",
          value: msg.events,
        });
      }
    }
  }

  OnLoaded_(_) {
    this.loaded_ = true;
  }

  CreateTransformPacket() {
    const controller = this.GetComponent("BasicCharacterController");

    // HACK
    return [
      controller.stateMachine_._currentState.Name,
      this.parent.position.toArray(),
      this.parent.quaternion.toArray(),
    ];
  }

  Update(timeElapsed) {
    this.updateTimer_ -= timeElapsed;
    if (this.updateTimer_ <= 0.0 && this.loaded_) {
      this.updateTimer_ = 0.1;
      this.net_.SendTransformUpdate(this.CreateTransformPacket());
    }
  }
}

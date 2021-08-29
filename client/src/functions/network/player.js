import { THREE } from "../../deps.js";

export class NetworkPlayer {
  updateTimer_ = 0.0;
  loaded_ = false;
  net_

  constructor(network, entity) {
    this.net_ = network
    this.entity = entity
  }

  initComponent() {
    this.registerHandler(
      "network.update",
      (m) => {
        this.onUpdate(m);
      },
    );
    this.registerHandler(
      "action.attack",
      (m) => {
        this.onActionAttack(m);
      },
    );
  }

  onActionAttack(msg) {
    this.net_.SendActionAttack_();
  }

  onUpdate(data) {
    if (data.transform) {
      this.entity.setPosition(new THREE.Vector3(...data.transform[1]));
      this.entity.setQuaternion(new THREE.Quaternion(...data.transform[2]));
    }
  }

  CreateTransformPacket() {
    const controller = this.GetComponent("PlayerMovement");

    // HACK
    return [
      controller.stateMachine_._currentState.Name,
      this.parent.position.toArray(),
      this.parent.quaternion.toArray(),
    ];
  }

  update(timeElapsed) {
    this.updateTimer_ -= timeElapsed;
    if (this.updateTimer_ <= 0.0) {
      this.updateTimer_ = 0.1;
      this.net_.SendTransformupdate(this.CreateTransformPacket());
    }
  }
}

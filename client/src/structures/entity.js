import { THREE } from "../deps.js";

export class Entity {
  position = new THREE.Vector3();
  quaternion = new THREE.Quaternion();

  constructor(params) {
    this.id = params.id
  }

  setPosition(p) {
    this.position.copy(p);
    this.broadcast({
      topic: "update.position",
      value: this.position,
    });
  }

  setQuaternion(q) {
    this.quaternion.copy(q);
    this.broadcast({
      topic: "update.quaternion",
      value: this.quaternion,
    });
  }
}
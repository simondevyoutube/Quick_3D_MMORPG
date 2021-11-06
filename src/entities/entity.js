import { THREE } from "../deps.js";

export class Entity {
  constructor(args) {
    this.id = args.id
    this.position = new THREE.Vector3(...args.position);
    this.quaternion = new THREE.Quaternion(...args.quaternion);
  }

  setPosition(pos) {
    this.position.copy(pos);
  }

  setQuaternion(quat) {
    this.quaternion.copy(quat);
  }

  destroy() {
    this.id = undefined
    this.position = undefined
    this.quaternion = undefined
  }
}

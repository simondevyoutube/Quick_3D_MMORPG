import { THREE } from "../deps.js";

export class Entity {
  constructor(args) {
    this.id = args.id
    this.position = new THREE.Vector3(...args.transform[1]);
    this.quaternion = new THREE.Quaternion(...args.transform[2]);
  }

  setPosition(pos) {
    this.position.copy(pos);
  }

  setQuaternion(quat) {
    this.quaternion.copy(quat);
  }
}

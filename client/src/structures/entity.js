import { THREE } from "../deps.js";

export class Entity {
  constructor(args) {
    this.id = args.id
    this.position = new THREE.Vector3(args.transform[1][0], args.transform[1][1], args.transform[1][2]);
    this.quaternion = new THREE.Quaternion(args.transform[2][0], args.transform[2][1], args.transform[2][2], args.transform[2][3]);
  }

  setPosition(pos) {
    this.position.copy(pos);
  }

  setQuaternion(quat) {
    this.quaternion.copy(quat);
  }
}
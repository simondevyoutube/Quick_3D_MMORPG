import { Vec3, Quaternion } from "../deps.js";

let ID = 0

export class Entity {
  constructor() {
    this.id = ID++;
    this.position = new Vec3();
    this.quaternion = new Quaternion();
  }

  toJSON() {
    return {
      id: this.id,
      position: this.position.toArray(),
      quaternion: this.quaternion.toArray(),
    }
  }
}

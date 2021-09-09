import { cannon } from "../deps.js";

let ID = 0

export class Entity {
  constructor() {
    this.id = ID++;
    this.position = new cannon.Vec3();
    this.quaternion = new cannon.Quat();
  }

  toJSON() {
    return {
      id: this.id,
      position: this.position,
      quaternion: this.quaternion,
    }
  }
}

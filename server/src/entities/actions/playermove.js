import { THREE } from "../../deps.js";


export class Movement {
  acceleration = new THREE.Vector3(1, 0.125, 100.0);
  velocity = new THREE.Vector3(0, 0, 0);

  constructor(args) {
    this.entity = args.entity
    this.terrain = args.world.terrain
  }

  update(deltaTime) {
    if (!this.entity.model.mixer) {
      // nothing animates? nothing moves.
      return;
    }
  }
}
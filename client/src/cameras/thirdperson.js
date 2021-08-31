import { THREE } from "../deps.js";

export class ThirdPersonCamera {
  currentPosition = new THREE.Vector3();
  currentLookat = new THREE.Vector3();

  constructor(args) {
    this.camera = args.world.camera;
    this.entity = args.entity
    this.terrain = args.world.terrain
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-0, 10, -15);
    idealOffset.applyQuaternion(this.entity.quaternion);
    idealOffset.add(this.entity.position);

    idealOffset.y = Math.max(
      idealOffset.y,
      this.terrain.getHeight(idealOffset) + 5.0,
    );

    return idealOffset;
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 5, 20);
    idealLookat.applyQuaternion(this.entity.quaternion);
    idealLookat.add(this.entity.position);
    return idealLookat;
  }

  update(timeElapsed) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();

    // const t = 0.05;
    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.01, timeElapsed);

    this.currentPosition.lerp(idealOffset, t);
    this.currentLookat.lerp(idealLookat, t);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookat);
  }
}

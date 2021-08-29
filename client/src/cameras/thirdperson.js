import { THREE } from "../deps.js";

export class ThirdPersonCamera {
  currentPosition = new THREE.Vector3();
  currentLookat = new THREE.Vector3();

  constructor(world, player) {
    this.camera = world.camera;
    this.target = player
    this.terrain = world.terrain
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-0, 10, -15);
    idealOffset.applyQuaternion(this.target.quaternion);
    idealOffset.add(this.target.position);

    idealOffset.y = Math.max(
      idealOffset.y,
      this.terrain.getHeight(idealOffset)[0] + 5.0,
    );

    return idealOffset;
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 5, 20);
    idealLookat.applyQuaternion(this.target.quaternion);
    idealLookat.add(this.target.position);
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

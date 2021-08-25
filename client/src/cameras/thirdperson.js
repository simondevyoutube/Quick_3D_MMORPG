import { THREE } from "../deps.js";
import { Component } from "../utils/component.js";

export class ThirdPersonCamera extends Component {
  currentPosition = new THREE.Vector3();
  currentLookat = new THREE.Vector3();

  constructor(params) {
    super();
    this._params = params;
    this._camera = params.camera;
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-0, 10, -15);
    idealOffset.applyQuaternion(this._params.target.rotation);
    idealOffset.add(this._params.target.position);

    const terrain = this.FindEntity("terrain").GetComponent(
      "TerrainChunkManager",
    );
    idealOffset.y = Math.max(
      idealOffset.y,
      terrain.GetHeight(idealOffset)[0] + 5.0,
    );

    return idealOffset;
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 5, 20);
    idealLookat.applyQuaternion(this._params.target.rotation);
    idealLookat.add(this._params.target.position);
    return idealLookat;
  }

  Update(timeElapsed) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();

    // const t = 0.05;
    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.01, timeElapsed);

    this.currentPosition.lerp(idealOffset, t);
    this.currentLookat.lerp(idealLookat, t);

    this._camera.position.copy(this.currentPosition);
    this._camera.lookAt(this.currentLookat);
  }
}

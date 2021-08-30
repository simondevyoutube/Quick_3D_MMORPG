import { THREE } from "../../deps.js";

export class TerrainChunk {
  geometry = new THREE.BufferGeometry();

  constructor(params) {
    this.group = params.group;
    this.plane = new THREE.Mesh(this.geometry, params.material);
    this.plane.castShadow = false;
    this.plane.receiveShadow = true;
    this.plane.frustumCulled = false;
    this.group.add(this.plane);
    this.plane.position.set(0, 0, 0);
  }

  destroy() {
    this.group.remove(this.plane);
  }

  hide() {
    this.plane.visible = false;
  }

  show() {
    this.plane.visible = true;
  }

  rebuildMeshFromData(data) {
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(data.positions, 3),
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(data.colours, 3),
    );
    this.geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(data.normals, 3),
    );
    this.geometry.setAttribute(
      "coords",
      new THREE.Float32BufferAttribute(data.coords, 3),
    );
    this.geometry.setAttribute(
      "weights1",
      new THREE.Float32BufferAttribute(data.weights1, 4),
    );
    this.geometry.setAttribute(
      "weights2",
      new THREE.Float32BufferAttribute(data.weights2, 4),
    );
    this.geometry.computeBoundingBox();
  }
}

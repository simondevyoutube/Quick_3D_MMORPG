import { THREE } from "../deps.js";
import { Noise } from "./noise.js";
import { createInstanced } from "../interfaces/assets.js";
import { terrainConstants } from "../data/terrain/constants.js";

export class Chunk {
  constructor(args) {
    // console.log(args);
    this.width = args.width
    this.material = args.material
    this.group = args.group;

    // TODO-DefinitelyMaybe: Add scenery objects too
    // TODO-DefinitelyMaybe: Add physics collision mesh
    // https://pmndrs.github.io/cannon-es/examples/bunny
    // https://github.com/pmndrs/cannon-es/blob/master/examples/bunny.html
    // TODO-DefinitelyMaybe: Use instanced geometry for scenery
    // https://github.com/mrdoob/three.js/blob/master/examples/webgl_instancing_performance.html

    this.geometry = new THREE.BufferGeometry();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;

    this.heightGenerator = new Noise(terrainConstants.NOISE_PARAMS);

    this.group.add(this.mesh);
  }

  destroy() {
    this.group.remove(this.mesh);
  }

  hide() {
    this.mesh.visible = false;
  }

  show() {
    this.mesh.visible = true;
  }

  setFromData(data) {
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

    if (data.scenery.length > 0) {
      // create the positions array
      createInstanced({
        model: "tree",
        count: data.scenery.length,
        positions: data.scenery
      }).then(val => {
        this.mesh.add(val.instancedMesh)
      })
    }
  }
}

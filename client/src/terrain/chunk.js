import { THREE } from "../deps.js";

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

    this.geometry = new THREE.BufferGeometry();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;

    this.scenery = new THREE.Group()
    this.entities = args.entities

    this.group.add(this.mesh);
    this.group.add(this.scenery)
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
    // TODO-DefinitelyMaybe: What is bounding box for?
    this.geometry.computeBoundingBox();
    // TODO-DefinitelyMaybe: What about vvv?
    // .geometry.computeFaceNormals();
    // .geometry.computeVertexNormals();

    
    if (this.mesh.children.length > 0) {
      console.log("Removed previous scenery");
      this.mesh.remove(this.scenery)
    }
    this.scenery = new THREE.Group()
    // console.log(data.scenery.length, this.width);
    for (let i = 0; i < data.scenery.length; i++) {
      const pos = data.scenery[i];
      const ent = this.entities.create({
        entity: "npc",
        id: 0,
        model: "tree",
        position: [pos[0], 0, pos[1]],
        quaternion: [0, 0, 0, 1],
      })
      if (ent.model instanceof Promise) {
        ent.model.then(_ => {
          this.scenery.add(ent.model)
        })
      }
    }
    this.mesh.add(this.scenery)
  }
}

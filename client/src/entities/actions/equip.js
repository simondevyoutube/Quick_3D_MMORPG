import { FBXLoader, THREE } from "../../deps.js";

/** 
 * Warning: This class hasn't been touched and will probably not work
 */
export class Equip {
  target = undefined;

  constructor(args) {
    this.model = args.model
    this.anchor = undefined // args.model.modelData.equip.rightHand;
  }

  initComponent() {
    this.registerHandler(
      "load.character",
      (m) => this.onCharacterLoaded(m),
    );
  }

  onCharacterLoaded(msg) {
    this.bones = msg.bones;
    this.attachTarget();
  }

  attachTarget() {
    if (this.bones && this.target) {
      this.bones[this.anchor].add(this.target);
    }
  }

  loadModels(item, cb) {
    const loader = new FBXLoader();
    loader.setPath("./resources/weapons/FBX/");
    loader.load(item.renderParams.name + ".fbx", (fbx) => {
      this.target = fbx;
      this.target.scale.setScalar(item.renderParams.scale);
      // this.target.rotateY(Math.PI);
      this.target.rotateX(Math.PI / 2);
      // this.target.rotateY(-1);

      this.target.traverse((c) => {
        c.castShadow = true;
        c.receiveShadow = true;

        // Do this instead of something smart like re-exporting.
        let materials = c.material;
        let newMaterials = [];
        if (!(c.material instanceof Array)) {
          materials = [c.material];
        }

        for (let m of materials) {
          if (m) {
            const c = new THREE.Color().copy(m.color);
            c.multiplyScalar(0.75);
            newMaterials.push(
              new THREE.MeshStandardMaterial({
                color: c,
                name: m.name,
                metalness: 1.0,
              }),
            );
          }
        }

        if (!(c.material instanceof Array)) {
          c.material = newMaterials[0];
        } else {
          c.material = newMaterials;
        }
      });

      cb();

      this.broadcast({
        topic: "load.weapon",
        model: this.target,
        bones: this.bones,
      });
    });
  }
}

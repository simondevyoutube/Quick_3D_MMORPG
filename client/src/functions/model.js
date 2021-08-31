import { THREE } from "../deps.js"

export class Model {
  constructor(args) {
    this.url = args.url
    this.loader = args.world.assets
    this.entity = args.entity
    this.textures = {}
    this.texturesArgs = args.textures

    this.scale = args.scale ? args.scale : 1
    this.hasTextures = args.textures ? true : false
    this.onMaterial = args.onMaterial ? args.onMaterial : undefined
    this.specular = args.specular ? args.specular : undefined
    this.emissive = args.emissive ? args.emissive : undefined
    this.receiveShadow = args.receiveShadow ? args.receiveShadow : undefined
    this.castShadow = args.castShadow ? args.castShadow : undefined
    this.visible = args.visible ? args.visible : undefined

    if (!args.url) {
      console.log(args);
      debugger 
    }

    this.scene = args.world.scene
    
    this.model = undefined

    try {
      this.loader.load(this.url)
      .then(val => {
        this.initModel(val)
      }) 
    } catch (error) {
      console.error(error);
    }
  }

  destroy() {
    // TODO-DefinitelyMaybe: this may not work if reasources share textures
    this.scene.remove(this.model);
  }

  initModel(model) {
    this.model = model

    this.model.position.copy(this.entity.position)
    this.model.quaternion.copy(this.entity.quaternion)

    this.model.scale.setScalar(this.scale);

    if (this.hasTextures) {
      for (let k in this.texturesArgs) {
        const textureURL = this.texturesArgs[k]
        this.loader.load(textureURL)
        .then(val => {
          this.textures[k] = val
          // TODO-DefinitelyMaybe: Maybe this information should live in the texture function
          this.textures[k].encoding = THREE.sRGBEncoding;
          if (this.textures.wrap) {
            this.textures[k].wrapS = THREE.RepeatWrapping;
            this.textures[k].wrapT = THREE.RepeatWrapping;
          }
        })
        .catch(console.error)
      }
    }

    // TODO-DefinitelyMaybe: Currently no go because we're only dealing with obj files
    // this.model.traverse((c) => {
    //   let materials = c.material;

    //   if (!(c.material instanceof Array)) {
    //     materials = [c.material];
    //   }

    //   if (c.geometry) {
    //     c.geometry.computeBoundingBox();
    //   }

    //   for (let m of materials) {
    //     if (this.onMaterial) {
    //       this.onMaterial(m);
    //     }
    //     for (let k in this.textures) {
    //       if (m.name.search(k) >= 0) {
    //         m.map = textures[k];
    //       }
    //     }
    //     if (this.specular) {
    //       m.specular = this.specular;
    //     }
    //     if (this.emissive) {
    //       m.emissive = this.emissive;
    //     }
    //   }

    //   if (this.receiveShadow != undefined) {
    //     c.receiveShadow = this.receiveShadow;
    //   }
    //   if (this.castShadow != undefined) {
    //     c.castShadow = this.castShadow;
    //   }
    //   if (this.visible != undefined) {
    //     c.visible = this.visible;
    //   }
    // });
  }
}

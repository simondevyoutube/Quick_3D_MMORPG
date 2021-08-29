import { THREE } from "../deps.js"

export class Model {
  group_ = new THREE.Group();
  textures = {}

  constructor(world, params) {
    this.url = params.url
    this.loader = world.assets
    this.params = params

    this.scale = params.scale ? params.scale : 1
    this.hasTextures = params.textures ? true : false
    this.onMaterial = params.onMaterial ? params.onMaterial : undefined
    this.specular = params.specular ? params.specular : undefined
    this.emissive = params.emissive ? params.emissive : undefined
    this.receiveShadow = params.receiveShadow ? params.receiveShadow : undefined
    this.castShadow = params.castShadow ? params.castShadow : undefined
    this.visible = params.visible ? params.visible : undefined

    if (!params.url) {
      console.log(params);
      debugger 
    }

    this.world = world
    this.world.scene.add(this.group_);
    
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
    this.group_.traverse((c) => {
      if (c.material) {
        c.material.dispose();
      }
      if (c.geometry) {
        c.geometry.dispose();
      }
    });
    this.world.scene.remove(this.group_);
  }

  initModel(model) {
    this.model = model
    this.group_.add(this.model);

    this.model.scale.setScalar(this.scale);

    if (this.hasTextures) {
      for (let k in this.params.textures) {
        const textureURL = this.params.textures[k]
        this.textures[k] = this.loader.load(textureURL)
        // TODO-DefinitelyMaybe: Maybe this information should live in the texture function
        this.textures[k].encoding = THREE.sRGBEncoding;
        if (this.params.textures.wrap) {
          this.textures[k].wrapS = THREE.RepeatWrapping;
          this.textures[k].wrapT = THREE.RepeatWrapping;
        }
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
    //     for (let k in this.params.textures) {
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

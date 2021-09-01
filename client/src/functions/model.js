import { THREE } from "../deps.js"

export class Model {
  constructor(args) {
    console.log(args);
    this.url = args.url
    this.assets = args.world.assets
    this.entity = args.entity
    this.scene = args.world.scene

    this.model = undefined
    this.textures = {}
    this.texturesArgs = args.textures

    // TODO-DefinitelyMaybe: Possibly cut out the animations into another class
    this.animations = {}
    this.bones = {}
    this.mixer = undefined
    this.actions = {}
    this.currentAction = args.transform[0] ? args.transform[0] : undefined

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

    try {
      this.assets.load(this.url)
      .then(val => {
        this.initModel(val)
      }) 
    } catch (err) {
      throw err;
    }
  }

  destroy() {
    // TODO-DefinitelyMaybe: hopefully this works as intended
    this.scene.remove(this.model);
  }

  initModel(parsedData) {
    // console.log(parsedData);
    this.model = parsedData.scene

    this.model.position.copy(this.entity.position)
    this.model.quaternion.copy(this.entity.quaternion)
    this.model.scale.setScalar(this.scale);

    if (this.hasTextures) {
      for (let k in this.texturesArgs) {
        const textureURL = this.texturesArgs[k]
        this.assets.load(textureURL)
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

    if (parsedData.animations) {
      this.mixer = new THREE.AnimationMixer(this.model)
      for (let i = 0; i < parsedData.animations.length; i++) {
        const animation = parsedData.animations[i];
        this.animations[animation.name] = animation
        this.actions[animation.name] = this.mixer.clipAction(animation)
      }
      // TODO-DefinitelyMaybe: Set this via an arg in future
      // this.actions[this.currentAction].play()
      this.actions["Idle"].play()
    }

    this.model.traverse((c) => {
      let materials = c.material;

      if (!(c.material instanceof Array)) {
        materials = [c.material];
      }

      if (c.geometry) {
        c.geometry.computeBoundingBox();
      }

      for (let m of materials) {
        if (this.onMaterial) {
          this.onMaterial(m);
        }
        for (let k in this.textures) {
          if (m.name.search(k) >= 0) {
            m.map = textures[k];
          }
        }
        if (this.specular) {
          m.specular = this.specular;
        }
        if (this.emissive) {
          m.emissive = this.emissive;
        }
      }

      if (this.receiveShadow != undefined) {
        c.receiveShadow = this.receiveShadow;
      }
      if (this.castShadow != undefined) {
        c.castShadow = this.castShadow;
      }
      if (this.visible != undefined) {
        c.visible = this.visible;
      }

      if (c.skeleton) {
        for (const bone of c.skeleton.bones) {
          this.bones[bone.name] = bone
        }
      }
    });

    this.scene.add(this.model)
  }
}

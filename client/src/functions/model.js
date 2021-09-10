import { LineMaterial, THREE, Wireframe, WireframeGeometry2, deepClone, cannon } from "../deps.js"

export class Model {
  constructor(args) {
    // console.log(args);
    this.url = args.url
    this.assets = args.world.assets
    this.entity = args.entity
    this.scene = args.world.scene

    this.group = undefined
    this.geometry = undefined
    this.textures = {}
    this.texturesArgs = args.textures

    // TODO-DefinitelyMaybe: Possibly cut out the animations into another class
    this.animations = {}
    this.bones = {}
    this.mixer = undefined
    this.actions = {}
    this.currentAction = args.state ? args.state : undefined

    this.physics = args.world.physics
    this.physicsArgs = args.physics
    this.collisionBody = undefined

    this.scale = args.scale ? args.scale : 1
    this.onMaterial = args.onMaterial ? args.onMaterial : undefined
    this.specular = args.specular ? args.specular : undefined
    this.emissive = args.emissive ? args.emissive : undefined
    this.receiveShadow = args.receiveShadow ? args.receiveShadow : undefined
    this.castShadow = args.castShadow ? args.castShadow : undefined
    this.visible = args.visible ? args.visible : undefined

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
    this.scene.remove(this.group);
  }

  initModel(parsedData) {
    this.group = deepClone(parsedData.scene)

    const entityPos = this.entity.position
    const entityQuat = this.entity.quaternion

    this.group.position.copy(entityPos)
    this.group.quaternion.copy(entityQuat)
    this.group.scale.setScalar(this.scale);

    if (this.texturesArgs) {
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
      this.mixer = new THREE.AnimationMixer(this.group)
      for (let i = 0; i < parsedData.animations.length; i++) {
        const animation = parsedData.animations[i];
        this.animations[animation.name.toLowerCase()] = animation
        this.actions[animation.name.toLowerCase()] = this.mixer.clipAction(animation)
      }
      // TODO-DefinitelyMaybe: Set this via an arg in future
      if (this.currentAction) {
        this.actions[this.currentAction].play()
      }
    }

    this.group.traverse((c) => {
      if (c.material) {
        let materials = c.material instanceof Array ? c.material : [c.material];

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
      }

      if (c.geometry) {
        this.geometry = c.geometry
        c.geometry.computeBoundingBox();
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

    if (this.physicsArgs) {
      const lineMat = new LineMaterial( {
        color: 0x4080ff, // light-ish bluey
        linewidth: 0.002,
      });
      const geo = new WireframeGeometry2(new THREE.BoxGeometry(1, 1, 1))
      const wireframeBox = new Wireframe(geo, lineMat)
      this.group.add(wireframeBox)

      const shape = new cannon.Box(new cannon.Vec3(1,1,1))
      const body = new cannon.Body({
        mass:1,
        shape
      })
      this.collisionBody = body
      this.collisionBody.entity = this.entity
      this.collisionBody.position = new cannon.Vec3(entityPos.x, entityPos.y, entityPos.z)
      this.physics.world.addBody(body)
    }

    this.scene.add(this.group)
  }
}

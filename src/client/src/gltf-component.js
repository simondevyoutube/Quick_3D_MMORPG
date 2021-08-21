import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js'
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/GLTFLoader.js'
import { entity } from './entity.js'

export const gltf_component = (() => {
  class StaticModelComponent extends entity.Component {
    constructor(params) {
      super()
      this._Init(params)
    }

    _Init(params) {
      this._params = params

      this._LoadModels()
    }

    InitComponent() {
      this._RegisterHandler('update.position', (m) => {
        this._OnPosition(m)
      })
    }

    _OnPosition(m) {
      if (this._target) {
        this._target.position.copy(m.value)
      }
    }

    _LoadModels() {
      if (this._params.resourceName.endsWith('glb') || this._params.resourceName.endsWith('gltf')) {
        this._LoadGLB()
      } else if (this._params.resourceName.endsWith('fbx')) {
        this._LoadFBX()
      }
    }

    _OnLoaded(obj) {
      this._target = obj
      this._params.scene.add(this._target)

      this._target.scale.setScalar(this._params.scale)
      this._target.position.copy(this.parent_._position)

      let texture = null
      if (this._params.resourceTexture) {
        const texLoader = new THREE.TextureLoader()
        texture = texLoader.load(this._params.resourceTexture)
        texture.encoding = THREE.sRGBEncoding
      }

      this._target.traverse((c) => {
        let materials = c.material
        if (!(c.material instanceof Array)) {
          materials = [c.material]
        }

        for (let m of materials) {
          if (m) {
            if (texture) {
              m.map = texture
            }
            if (this._params.specular) {
              m.specular = this._params.specular
            }
            if (this._params.emissive) {
              m.emissive = this._params.emissive
            }
          }
        }
        if (this._params.receiveShadow != undefined) {
          c.receiveShadow = this._params.receiveShadow
        }
        if (this._params.castShadow != undefined) {
          c.castShadow = this._params.castShadow
        }
        if (this._params.visible != undefined) {
          c.visible = this._params.visible
        }
      })
    }

    _LoadGLB() {
      const loader = new GLTFLoader()
      loader.setPath(this._params.resourcePath)
      loader.load(this._params.resourceName, (glb) => {
        this._OnLoaded(glb.scene)
      })
    }

    _LoadFBX() {
      const loader = new FBXLoader()
      loader.setPath(this._params.resourcePath)
      loader.load(this._params.resourceName, (fbx) => {
        this._OnLoaded(fbx)
      })
    }

    Update(timeInSeconds) {}
  }

  class AnimatedModelComponent extends entity.Component {
    constructor(params) {
      super()
      this._Init(params)
    }

    InitComponent() {
      this._RegisterHandler('update.position', (m) => {
        this._OnPosition(m)
      })
    }

    _OnPosition(m) {
      if (this._target) {
        this._target.position.copy(m.value)
        this._target.position.y = 0.35
      }
    }

    _Init(params) {
      this._params = params

      this._LoadModels()
    }

    _LoadModels() {
      if (this._params.resourceName.endsWith('glb') || this._params.resourceName.endsWith('gltf')) {
        this._LoadGLB()
      } else if (this._params.resourceName.endsWith('fbx')) {
        this._LoadFBX()
      }
    }

    _OnLoaded(obj, animations) {
      this._target = obj
      this._params.scene.add(this._target)

      this._target.scale.setScalar(this._params.scale)
      this._target.position.copy(this._parent._position)

      this.Broadcast({
        topic: 'update.position',
        value: this._parent._position
      })

      let texture = null
      if (this._params.resourceTexture) {
        const texLoader = new THREE.TextureLoader()
        texture = texLoader.load(this._params.resourceTexture)
        texture.encoding = THREE.sRGBEncoding
      }

      this._target.traverse((c) => {
        let materials = c.material
        if (!(c.material instanceof Array)) {
          materials = [c.material]
        }

        for (let m of materials) {
          if (m) {
            if (texture) {
              m.map = texture
            }
            if (this._params.specular) {
              m.specular = this._params.specular
            }
            if (this._params.emissive) {
              m.emissive = this._params.emissive
            }
          }
        }
        if (this._params.receiveShadow != undefined) {
          c.receiveShadow = this._params.receiveShadow
        }
        if (this._params.castShadow != undefined) {
          c.castShadow = this._params.castShadow
        }
        if (this._params.visible != undefined) {
          c.visible = this._params.visible
        }
      })

      const _OnLoad = (anim) => {
        const clip = anim.animations[0]
        const action = this._mixer.clipAction(clip)

        action.play()
      }

      const loader = new FBXLoader()
      loader.setPath(this._params.resourcePath)
      loader.load(this._params.resourceAnimation, (a) => {
        _OnLoad(a)
      })

      this._mixer = new THREE.AnimationMixer(this._target)

      this._parent._mesh = this._target
      this.Broadcast({
        topic: 'load.character',
        model: this._target
      })
    }

    _LoadGLB() {
      const loader = new GLTFLoader()
      loader.setPath(this._params.resourcePath)
      loader.load(this._params.resourceName, (glb) => {
        this._OnLoaded(glb.scene, glb.animations)
      })
    }

    _LoadFBX() {
      const loader = new FBXLoader()
      loader.setPath(this._params.resourcePath)
      loader.load(this._params.resourceName, (fbx) => {
        this._OnLoaded(fbx)
      })
    }

    Update(timeInSeconds) {
      if (this._mixer) {
        this._mixer.update(timeInSeconds)
      }
    }
  }

  return {
    StaticModelComponent: StaticModelComponent,
    AnimatedModelComponent: AnimatedModelComponent
  }
})()

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js'
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/GLTFLoader.js'
import { SkeletonUtils } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/utils/SkeletonUtils.js'
import { entity } from './entity.js'

export const load_controller = (() => {
  class LoadController extends entity.Component {
    constructor() {
      super()

      this.textures_ = {}
      this.models_ = {}
    }

    LoadTexture(path, name) {
      if (!(name in this.textures_)) {
        const loader = new THREE.TextureLoader()
        loader.setPath(path)

        this.textures_[name] = { loader: loader, texture: loader.load(name) }
        this.textures_[name].encoding = THREE.sRGBEncoding
      }

      return this.textures_[name].texture
    }

    LoadFBX(path, name, onLoad) {
      if (!(name in this.models_)) {
        const loader = new FBXLoader()
        loader.setPath(path)

        this.models_[name] = { loader: loader, asset: null, queue: [onLoad] }
        this.models_[name].loader.load(name, (fbx) => {
          this.models_[name].asset = fbx

          const queue = this.models_[name].queue
          this.models_[name].queue = null
          for (let q of queue) {
            const clone = this.models_[name].asset.clone()
            q(clone)
          }
        })
      } else if (this.models_[name].asset == null) {
        this.models_[name].queue.push(onLoad)
      } else {
        const clone = this.models_[name].asset.clone()
        onLoad(clone)
      }
    }

    LoadSkinnedGLB(path, name, onLoad) {
      if (!(name in this.models_)) {
        const loader = new GLTFLoader()
        loader.setPath(path)

        this.models_[name] = { loader: loader, asset: null, queue: [onLoad] }
        this.models_[name].loader.load(name, (glb) => {
          this.models_[name].asset = glb

          glb.scene.traverse((c) => {
            // HAHAHAH
            c.frustumCulled = false
            // Apparently this doesn't work, so just disable frustum culling.
            // Bugs... so many bugs...

            // if (c.geometry) {
            //   // Just make our own, super crappy, super big box
            //   c.geometry.boundingBox = new THREE.Box3(
            //       new THREE.Vector3(-50, -50, -50),
            //       new THREE.Vector3(50, 50, 50));
            //   c.geometry.boundingSphere = new THREE.Sphere();
            //   c.geometry.boundingBox.getBoundingSphere(c.geometry.boundingSphere);
            // }
          })

          const queue = this.models_[name].queue
          this.models_[name].queue = null
          for (let q of queue) {
            const clone = { ...glb }
            clone.scene = SkeletonUtils.clone(clone.scene)

            q(clone)
          }
        })
      } else if (this.models_[name].asset == null) {
        this.models_[name].queue.push(onLoad)
      } else {
        const clone = { ...this.models_[name].asset }
        clone.scene = SkeletonUtils.clone(clone.scene)

        onLoad(clone)
      }
    }
  }

  return {
    LoadController: LoadController
  }
})()

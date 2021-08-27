import { FBXLoader, GLTFLoader, SkeletonClone, THREE } from "../deps.js";
import { Component } from "../structures/component.js";

export class Assets extends Component {

  constructor() {
    super();

    this.textures = {};
    this.models = {};
  }

  LoadTexture(path, name) {
    if (!(name in this.textures)) { 
      // lookup in localstorage first
      const cache = false//JSON.parse(localStorage.getItem(name))

      if (!cache) {
        // otherwise load the texture
        const loader = new THREE.TextureLoader();
        loader.setPath(path);

        let texture = loader.load(name)

        this.textures[name] = { texture };
        this.textures[name].encoding = THREE.sRGBEncoding;

        // and then save in localstorage
        // localStorage.setItem(name, JSON.stringify({texture}))
      } else {
        let texture = cache.texture
        this.textures[name] = {texture}
      }
    }

    return this.textures[name].texture;
  }

  LoadFBX(path, name, onLoad) {
    if (!(name in this.models)) {
      const loader = new FBXLoader();
      loader.setPath(path);

      this.models[name] = { loader: loader, asset: undefined, queue: [onLoad] };
      this.models[name].loader.load(name, (fbx) => {
        this.models[name].asset = fbx;

        const queue = this.models[name].queue;
        this.models[name].queue = undefined;
        for (let q of queue) {
          const clone = this.models[name].asset.clone();
          q(clone);
        }
      });
    } else if (this.models[name].asset == undefined) {
      this.models[name].queue.push(onLoad);
    } else {
      const clone = this.models[name].asset.clone();
      onLoad(clone);
    }
  }

  LoadSkinnedGLB(path, name, onLoad) {
    if (!(name in this.models)) {
      const loader = new GLTFLoader();
      loader.setPath(path);

      this.models[name] = { loader: loader, asset: undefined, queue: [onLoad] };
      this.models[name].loader.load(name, (glb) => {
        this.models[name].asset = glb;

        // TODO-DefinitelyMaybe: LocalStoage continues tomorrow :)
        glb.scene.traverse((c) => {
          c.frustumCulled = false;
        });

        const queue = this.models[name].queue;
        this.models[name].queue = undefined;
        for (let q of queue) {
          const clone = { ...glb };
          clone.scene = SkeletonClone(clone.scene);

          q(clone);
        }
      });
    } else if (this.models[name].asset == undefined) {
      this.models[name].queue.push(onLoad);
    } else {
      const clone = { ...this.models[name].asset };
      clone.scene = SkeletonClone(clone.scene);

      onLoad(clone);
    }
  }
}

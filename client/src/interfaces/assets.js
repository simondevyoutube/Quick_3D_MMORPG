import { GLTFLoader, FBXLoader, THREE, OBJLoader } from "../deps.js";

export class Assets {
  assets = {}
  pending = {}

  // constructor() {
  //   // TODO-DefinitelyMaybe: initialize from localstorage
  // }

  async load(url){
    if (url in this.pending) {
      return await this.assets[url]
    } else {
      if (!(url in this.assets)) {
        const ext = getExtFor(url)
        const loader = getLoaderFor(ext)
        try {
          this.pending[url] = true
          this.assets[url] = loader.loadAsync(url)
          await this.assets[url]
          delete this.pending[url]
        } catch (err) {
          throw err;
        } 
      }
    }
    return this.assets[url]
  }

  loadSync(url){
    if (!(url in this.assets)) {
      try {
        const ext = getExtFor(url)
        const loader = getLoaderFor(ext)
        this.assets[url] = loader.load(url)
      } catch (err) {
        throw `Couldn't load ${url} because: ${err}`; 
      }
    }
    return this.assets[url]
  }
}

function getExtFor(url) {
  const split = url.split(".")
  return split[split.length-1]
}

function getLoaderFor(ext) {
  switch (ext) {
    case "png":
      return new THREE.TextureLoader();
    case "jpg":
      return new THREE.TextureLoader();
    case "obj":
      return new OBJLoader();
    case "fbx":
      return new FBXLoader();
    case "gltf":
      return new GLTFLoader();
    case "glb":
      return new GLTFLoader();
    default:
      throw `Unknown loader for ext: ${ext}`;
  }
}
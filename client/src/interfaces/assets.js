import { GLTFLoader, FBXLoader, OBJLoader, TextureLoader } from "../functions/loaders/mod.js";


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
        const ext = this.getExtFor(url)
        const loader = this.getLoaderFor(ext)
        try {
          this.pending[url] = true
          this.assets[url] = loader.load(url)
          await this.assets[url]
          delete this.pending[url]
        } catch (error) {
          console.error(error);
        } 
      }
    }
    return this.assets[url]
  }

  getExtFor(url) {
    const split = url.split(".")
    return split[split.length-1]
  }

  getLoaderFor(ext) {
    switch (ext) {
      case "png":
        return new TextureLoader();
      case "jpg":
        return new TextureLoader();
      case "obj":
        return new OBJLoader();
      case "fbx":
        return new FBXLoader();
      case "gltf":
        return new GLTFLoader();
      case "glb":
        return new GLTFLoader();
      default:
        console.warn(`Unknown loader for ext: ${ext}`);
        return undefined
    }
  }
}

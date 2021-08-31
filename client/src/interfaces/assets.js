import { getLoaderFor } from "../functions/loaders/mod.js";


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
        const loader = getLoaderFor(ext)
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
}

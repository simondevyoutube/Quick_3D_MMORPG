import { getLoaderFor, getExtFor } from "../functions/loaders.js";


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
}

import { GLTFLoader as loader } from "../../deps.js";

export class GLTFLoader extends loader {
  constructor(){
    super()
  }

  async load(url) {
    try {
      const res = await fetch(url)
      const data = await res.arrayBuffer()
      // TODO-DefinitelyMaybe: grr... need to parse the data the parser doesn't return the data. UGH
      super.parse(data, undefined, (gltf)=> {
        this.gltf = gltf
      })
      return undefined
    } catch (error) {
      throw `Loader error: ${err}`
    }
  }
}
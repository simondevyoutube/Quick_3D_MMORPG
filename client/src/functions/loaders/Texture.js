import { THREE } from "../../deps.js";

export class TextureLoader extends THREE.TextureLoader {
  constructor(){
    super()
  }

  async load(url) {
    try {
      const res = await fetch(url)
      return res.body
    } catch (error) {
      console.error(error);
    }
  }
}
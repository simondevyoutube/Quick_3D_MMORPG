import { FBXLoader as loader } from "../../deps.js";

export class FBXLoader extends loader {
  constructor(){
    super()
  }

  async load(url) {
    try {
      const res = await fetch(url)
      return super.parse(res.body) 
    } catch (error) {
      console.error(error);
    }
  }
}
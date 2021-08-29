import { OBJLoader as loader } from "../../deps.js";

export class OBJLoader extends loader {
  constructor() {
    super()
  }

  async load(url) {
    try {
      const res = await fetch(url)
      const data = await res.text()
      return super.parse(data)
    } catch (error) {
      console.error(error);
    }
  }
}
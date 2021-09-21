import { Entity } from "./entity.js";


export class Player extends Entity {
  /** 
   * @param {{name:string, model:string}} args
   */
  constructor (args) {
    super()
    this.name = args.name
    this.model = args.model
  }

  toJSON(){
    const data = super.toJSON()
    data.name = this.name
    data.model = this.model
    data.state = "idle"
    data.entity = "player"
    return data
  }
}

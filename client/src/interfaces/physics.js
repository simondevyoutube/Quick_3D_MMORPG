import { cannon } from "../deps.js";

export class Physics {
  world = new cannon.World()

  constructor(){
    this.world.gravity.set(0,-40,0)
    // TODO-DefinitelyMaybe: get height data and make plane with it
    // https://github.com/pmndrs/cannon-es/blob/master/examples/heightfield.html
    const groundShape = new cannon.Plane()
    const groundBody = new cannon.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.world.addBody(groundBody)
  }

  add(){}

  update(deltaTime){
    this.world.step(deltaTime)
  }
}
import { cannon } from "../deps.js";

export class Physics {
  world = new cannon.World()

  constructor(){
    this.world.gravity.set(0,-40,0)
    // TODO-DefinitelyMaybe: get height data and make plane with it
    // https://github.com/pmndrs/cannon-es/blob/master/examples/heightfield.html
    // https://github.com/pmndrs/cannon-es/blob/master/examples/bunny.html
    const groundShape = new cannon.Plane()
    const groundBody = new cannon.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.world.addBody(groundBody)
  }

  update(deltaTime){
    this.world.step(deltaTime)
    const entities = this.world.bodies.filter(body => body.entity)
    for (let i = 0; i < entities.length; i++) {
      const body = entities[i];
      const pos = body.position
      body.entity.position.set(pos.x, pos.y, pos.z)
    }
  }
}
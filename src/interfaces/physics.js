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
    // TODO-DefinitelyMaybe: There's a better way to do this but this'll do for now
    // If the time taken was too long... don't do it
    if (deltaTime > 0.1) {
      return
    }
    this.world.step(deltaTime)
    const entities = this.world.bodies.filter(body => body.entity)
    for (let i = 0; i < entities.length; i++) {
      const body = entities[i];
      const pos = body.position
      const quat = body.quaternion
      body.entity.position.set(pos.x, pos.y, pos.z)
      body.entity.quaternion.set(quat.x, quat.y, quat.z, quat.w)
    }
  }
}
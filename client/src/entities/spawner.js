import { Entity } from "../structures/entity.js";

let ID = 0

export class Spawner extends Entity {
  name = `spawner_${ID++}`
  constructor(world) {
    super()
    this.entities = world.entities
  }

  spawn(entity) {
    console.log(`Spawning ${entity.name}`);
    this.entities.Add(entity, entity.name);
    // return entity
  }
}

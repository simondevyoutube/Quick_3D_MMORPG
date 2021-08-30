import { Rock, Tree, Cloud } from "../entities/mod.js";

export class Entities {
  map = {};
  entities = [];

  // TODO-DefinitelyMaybe: What about removing entities?? where is that done
  get(n) {
    return this.map[n];
  }

  getNewEntityByName(name) {
    switch (name) {
      case "sorceror":
        return Tree
      case "tree":
        return Tree
      case "cloud":
        return Cloud
      case "rock":
        return Rock
      default:
        return undefined
    }
  }

  add(entity) {
    this.map[entity.id] = entity;
    this.entities.push(entity);
  }

  updateEntity(data) {
    const {id, transform, entity} = data
    if (id in this.map) {
      // update the entity
      const existingEntity = this.map[id]
      existingEntity.setPosition(transform[1])
      existingEntity.setQuaternion(transform[2])
    } else {
      // create the entity instead
      const entityClass = this.getNewEntityByName(entity)
      const newEntity = new entityClass({id})
      newEntity.setPosition(transform[1])
      newEntity.setPosition(transform[2])
    }
  }
}

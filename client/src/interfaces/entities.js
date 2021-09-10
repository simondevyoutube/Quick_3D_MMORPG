import { THREE } from "../deps.js";
import { newEntityClass } from "../structures/entities/mod.js";

export class Entities {
  map = {};
  entities = [];
  player;

  constructor(arg){
    this.world = arg
  }

  get(n) {
    return this.map[n];
  }

  add(entity) {
    this.map[entity.id] = entity;
    this.entities.push(entity);
  }

  receive(data) {
    const {id, position, quaternion, entity, name, model, state} = data

    if (id in this.map) {
      console.log("Updating existing entity");
      // update the entity
      const existingEntity = this.map[id]
      existingEntity.setPosition(new THREE.Vector3(...position))
      existingEntity.setQuaternion(new THREE.Quaternion(...quaternion))
    } else {
      // console.log("Creating a new entity");
      try {
        const entityClass = newEntityClass(entity)
        console.log(entityClass);
        const newEntity = new entityClass({id, position, quaternion, state, model, world:this.world})
        console.log("Entity Created");
        if (name) {
          // TODO-DefinitelyMaybe: set chat author name
          newEntity.name = name
          this.player = newEntity
        }
        this.add(newEntity)
      } catch (err) {
        console.error(data);
        throw `Tried to create a new entity but: ${err}`;
      }
    }
  }

  update(delta){
    const ents = this.entities.filter(e => e.update)
    for (let i = 0; i < ents.length; i++) {
      // should include both player and npc's
      ents[i].update(delta);
    }
  }
}

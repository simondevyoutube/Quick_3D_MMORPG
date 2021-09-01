import { THREE } from "../deps.js";
import { newEntityClass } from "../entities/mod.js";

export class Entities {
  map = {};
  entities = [];
  player;

  constructor(arg){
    this.world = arg
  }

  // TODO-DefinitelyMaybe: What about removing entities?? where is that done
  get(n) {
    return this.map[n];
  }

  add(entity) {
    this.map[entity.id] = entity;
    this.entities.push(entity);
  }

  receive(data) {
    const {id, transform} = data
    // player, npc, scenery...
    const entity = data.name ? "player" : "npc" // pretending its an npc for the moment
    // one entity might have multiple possible models
    // TODO-DefinitelyMaybe: clear up naming
    const model = data.entity
    // TODO-DefinitelyMaybe: momentary workaround
    const name = data.name

    if (id in this.map) {
      console.log("Updating existing entity");
      // update the entity
      const existingEntity = this.map[id]
      existingEntity.setPosition(new THREE.Vector3(transform[1][0], transform[1][1], transform[1][2]))
      existingEntity.setQuaternion(new THREE.Quaternion(transform[2][0], transform[2][1], transform[2][2], transform[2][3]))
    } else {
      try {
        const entityClass = newEntityClass(entity)
        const newEntity = new entityClass({id, world:this.world, transform, model}) 
        if (name) {
          // TODO-DefinitelyMaybe: set chat author name
          newEntity.name = name
          this.player = newEntity
        }
        this.add(newEntity)
      } catch (err) {
        throw err;
      }
    }
  }
}

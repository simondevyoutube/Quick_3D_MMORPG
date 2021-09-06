import { THREE } from "../deps.js";
import { newEntityClass } from "../entities/mod.js";

export class Entities {
  map = {};
  entities = [];
  player;

  constructor(arg){
    this.world = arg
    this.network = arg.network

    // Setup Network hooks
    this.network.websocket.on("world.player", (d) => {
      const {id, transform} = d;
      const entity = d.desc.character.class
      const name = d.desc.account.name
      // Can't currently guarantee them
      if (transform && id && entity && name) {
        this.receive({id, transform, entity, name})
      }
    })

    this.network.websocket.on("world.update", (d) => {
      // The network is truth. generally speaking.
      for (let i = 0; i < d.length; i++) {
        const {id, transform} = d[i];
        const entity = d[i].desc ? d[i].desc.character.class : false
        // Can't currently guarantee them all
        if (transform && id && entity) {
          this.receive({id, transform, entity})
        }
      }
    })
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
    const entity = data.name ? "player" : "npc"
    // TODO-DefinitelyMaybe: clear up naming
    const model = data.entity
    // TODO-DefinitelyMaybe: momentary workaround
    const name = data.name

    if (id in this.map) {
      console.log("Updating existing entity");
      // update the entity
      const existingEntity = this.map[id]
      existingEntity.setPosition(new THREE.Vector3(...transform[1]))
      existingEntity.setQuaternion(new THREE.Quaternion(...transform[2]))
    } else {
      // console.log("Creating a new entity");
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

import { newEntityClass } from "../entities/mod.js";

export class Entities {
  // TODO-DefinitelyMaybe: Split map into layers/categories
  map = {};
  entities = [];
  player;

  constructor(arg){
    this.world = arg
    this.scene = arg.scene
  }

  /** 
   * @param {number} id
   */
  get(id) {
    return this.map[id];
  }

  /** 
   * @param {{id:number, position:number[], quaternion:number[], entity:string, data?:{}}} args
   */
  create(args) {
    const { entity } = args
    const entityClass = newEntityClass[entity]
    args = Object.assign(args, {world:this.world})
    const newEntity = new entityClass(args)
    this.map[newEntity.id] = newEntity;
    this.entities.push(newEntity);
    return newEntity
  }

  update(delta){
    // Sort out entities being destroyed
    const old = this.entities.filter(e => e.id == undefined)
    for (let i = 0; i < old.length; i++) {
      const ent = old[i];
      this.scene.remove(ent.model)
    }

    // update
    const updates = this.entities.filter(e => e.update)
    for (let i = 0; i < updates.length; i++) {
      // should include both player and npc's
      updates[i].update(delta);
    }

    // Only keep the entities that we can keep track of
    const ents = this.entities.filter(e => e.id != undefined)
    this.entities = ents
    // TODO-DefinitelyMaybe: Does the map need updating?
  }
}

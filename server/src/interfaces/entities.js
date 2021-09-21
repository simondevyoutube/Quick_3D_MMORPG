import { newEntityClass } from "../entities/mod.js";

export class Entities {
  map = {};
  entities = [];
  player;

  get(n) {
    return this.map[n];
  }

  add(entity) {
    this.map[entity.id] = entity;
    this.entities.push(entity);
  }

  /** 
   * @param {{entity:string, data?:any}} args
   */
  create(args){
    const {entity} = args
    const entClass = newEntityClass(entity)
    const newEnt = new entClass(args)
    this.add(newEnt)
    return newEnt
  }

  // update(delta){
  //   const ents = this.entities.filter(e => e.update)
  //   for (let i = 0; i < ents.length; i++) {
  //     // should include both player and npc's
  //     ents[i].update(delta);
  //   }
  // }
}

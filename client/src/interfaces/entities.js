import { newEntityClass } from "../entities/mod.js";

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

  /** 
   * @param {{id:number, position:number[], quaternion:number[], entity:string, data?:{}}} args
   */
  create(args) {
    const { entity } = args
    const entityClass = newEntityClass[entity]
    args = Object.assign(args, {world:this.world})
    const newEntity = new entityClass(args)
    this.add(newEntity)
    return newEntity
  }

  update(delta){
    const ents = this.entities.filter(e => e.update)
    for (let i = 0; i < ents.length; i++) {
      // should include both player and npc's
      ents[i].update(delta);
    }
  }
}

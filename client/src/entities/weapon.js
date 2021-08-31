import { Entity } from "../structures/entity.js";
import { Model } from "../functions/model.js";
import { newWeaponData } from "../data/models/weapons/mod.js";


export class Weapon extends Entity {
  constructor(args){
    super(args)
    args = Object.assign(args, newWeaponData(args.model), {entity: this})
    this.model = new Model(args)
  }
}
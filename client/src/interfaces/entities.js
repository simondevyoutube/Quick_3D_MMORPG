export class Entities {
  nextID = 0;
  map = {};
  entities = [];

  // TODO-DefinitelyMaybe: What about removing entities?? where is that done
  get(n) {
    return this.map[n];
  }

  filter(cb) {
    return this.entities.filter(cb);
  }

  add(entity) {
    this.map[entity.name] = entity;
    this.entities.push(entity);
  }

  update(timeElapsed) {
    // TODO-DefinitelyMaybe: Some entities wont die in the current setup i.e. network, terrain, loader
    // so not looping through some objects everytime would be great.
    const dead = [];
    const alive = [];
    for (let i = 0; i < this.entities.length; ++i) {
      const e = this.entities[i];

      if (e.update) {
        e.update(timeElapsed);
      }

      if (e.dead) {
        dead.push(e);
      } else {
        alive.push(e);
      }
    }

    for (let i = 0; i < dead.length; ++i) {
      const e = dead[i];
      delete this.map[e.name];
      if (e.destroy) {
        e.destroy(); 
      }
    }

    // TODO-DefinitelyMaybe: Might need a better way of removing entities in future
    this.entities = alive;
  }
}

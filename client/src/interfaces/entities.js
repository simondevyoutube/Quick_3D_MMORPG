export class Entities {
  nextID = 0;
  map = {};
  entities = [];

  // TODO-DefinitelyMaybe: What about removing entities?? where is that done
  get(n) {
    return this.map[n];
  }

  Filter(cb) {
    return this.entities.filter(cb);
  }

  Add(e, n) {
    if (!n) {
      n = this.generateName();
    }

    this.map[n] = e;
    this.entities.push(e);

    e.parent = this;
    e.name = n;
    // TODO-DefinitelyMaybe: Why are entities initialized here? how about just bookkeeping.
    e.InitEntity();
  }

  SetActive(e, b) {
    const i = this.entities.indexOf(e);

    if (!b) {
      if (i < 0) {
        return;
      }

      this.entities.splice(i, 1);
    } else {
      if (i >= 0) {
        return;
      }

      this.entities.push(e);
    }
  }

  Update(timeElapsed) {
    // TODO-DefinitelyMaybe: Some entities wont die in the current setup i.e. network, terrain, loader
    // so not looping through some objects everytime would be great.
    const dead = [];
    const alive = [];
    for (let i = 0; i < this.entities.length; ++i) {
      const e = this.entities[i];

      e.Update(timeElapsed);

      if (e.dead_) {
        dead.push(e);
      } else {
        alive.push(e);
      }
    }

    for (let i = 0; i < dead.length; ++i) {
      const e = dead[i];

      delete this.map[e.Name];

      e.destroy();
    }

    this.entities = alive;
  }

  generateName() {
    this.nextID += 1;

    return "__name__" + this.nextID;
  }
}

import { quat, vec3 } from "../deps.ts";
import { WorldAIClient, WorldNetworkClient } from "./client.ts";
import { WorldEntity } from "./entity.ts";
import { SpatialHashGrid } from "../../../client/shared/spatial-hash-grid.js";
import { HeightGenerator } from "../../../client/shared/terrain-height.js";
import { _CHARACTER_MODELS } from "../../../client/shared/defs.js";


export class MonsterSpawner {
  constructor(params) {
    this.parent_ = params.parent;
    this.grid_ = this.parent_.grid_;
    this.terrain_ = this.parent_.terrain_;
    this.pos_ = params.pos;
    this.pos_[1] = this.terrain_.Get(...params.pos)[0];
    this.params_ = params;
  }

  Spawn_() {
    // Hack
    const e = new WorldEntity({
      id: this.parent_.ids_++,
      position: vec3.clone(this.pos_),
      rotation: quat.fromValues(0, 0, 0, 1),
      grid: this.grid_,
      character: {
        definition: _CHARACTER_MODELS[this.params_.class],
        class: this.params_.class,
      },
      account: { accountName: _CHARACTER_MODELS[this.params_.class].name },
    });

    const wc = new WorldAIClient(e, this.terrain_, () => {
      this.entity_ = null;
      console.log("entity gone, spawner making now one soon");
    });

    this.parent_.AddMonster(wc);

    this.entity_ = wc;
  }

  Update(timeElapsed) {
    if (!this.entity_) {
      this.Spawn_();
    }
  }
}

export const _TICK_RATE = 0.1;

export class WorldManager {
  constructor() {
    this.ids_ = 0;
    this.entities_ = [];
    this.grid_ = new SpatialHashGrid(
      [[-4000, -4000], [4000, 4000]],
      [1000, 1000],
    );

    this.terrain_ = new HeightGenerator();

    this.spawners_ = [];
    this.tickTimer_ = 0.0;

    // Hack
    for (let x = -40; x <= 40; ++x) {
      for (let z = -40; z <= 40; ++z) {
        if (Math.random() < 0.1) {
          const pos = vec3.fromValues(x * 75, 0, z * 75);
          if (Math.random() < 0.1) {
            this.spawners_.push(
              new MonsterSpawner({
                parent: this,
                pos: pos,
                class: "warrok",
              }),
            );
          } else {
            this.spawners_.push(
              new MonsterSpawner({
                parent: this,
                pos: pos,
                class: "zombie",
              }),
            );
          }
        }
      }
    }
  }

  AddMonster(e) {
    this.entities_.push(e);
  }

  Add(client, params) {
    const models = ["sorceror", "paladin"];
    const randomClass = models[
      Math.floor(Math.random() * models.length)
    ];

    // Hack
    const e = new WorldEntity({
      id: this.ids_++,
      position: vec3.fromValues(
        -60 + (Math.random() * 2 - 1) * 20,
        0,
        (Math.random() * 2 - 1) * 20,
      ),
      rotation: quat.fromValues(0, 0, 0, 1),
      grid: this.grid_,
      character: {
        definition: _CHARACTER_MODELS[randomClass],
        class: randomClass,
      },
      account: params,
    });

    const wc = new WorldNetworkClient(client, e);

    this.entities_.push(wc);

    wc.BroadcastChat({
      name: "",
      server: true,
      text: "[" + params.accountName + " has entered the game]",
    });
  }

  Update(timeElapsed) {
    this.TickClientState_(timeElapsed);
    this.UpdateEntities_(timeElapsed);
    this.UpdateSpawners_(timeElapsed);
  }

  TickClientState_(timeElapsed) {
    this.tickTimer_ += timeElapsed;
    if (this.tickTimer_ < _TICK_RATE) {
      return;
    }

    this.tickTimer_ = 0.0;

    for (let i = 0; i < this.entities_.length; ++i) {
      this.entities_[i].UpdateClientState_();
    }
    for (let i = 0; i < this.entities_.length; ++i) {
      this.entities_[i].entity_.events_ = [];
    }
  }

  UpdateSpawners_(timeElapsed) {
    for (let i = 0; i < this.spawners_.length; ++i) {
      this.spawners_[i].Update(timeElapsed);
    }
  }

  UpdateEntities_(timeElapsed) {
    const dead = [];
    const alive = [];

    for (let i = 0; i < this.entities_.length; ++i) {
      const e = this.entities_[i];

      e.Update(timeElapsed);

      if (e.IsDead) {
        console.log("killed it off");
        dead.push(e);
      } else {
        alive.push(e);
      }
    }

    this.entities_ = alive;

    for (let d of dead) {
      d.OnDeath();
      d.Destroy();
    }
  }
}

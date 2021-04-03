import { quat, vec3 } from 'gl-matrix';

// import { WorldAIClient, WorldNetworkClient } from './world-client.js';
import { WorldEntity } from './world-entity.js';

import { SpatialHashGrid as aSpatialHashGrid, Constants, Defs, TerrainHeight } from 'quick-3d-mmo-shared';


const { HeightGenerator, CHARACTER_MODELS, CLASS_TYPES, SpatialHashGrid } = {
  ...aSpatialHashGrid,
  ...Constants,
  ...Defs,
  ...TerrainHeight,
}

class MonsterSpawner {
  parent_: any;
  grid_: any;
  terrain_: any;
  pos_: any;
  params_: any;
  entity_: any;

  constructor(params) {
    this.parent_ = params.parent;
    this.grid_ = this.parent_.grid_;
    this.terrain_ = this.parent_.terrain_;
    this.pos_ = params.pos;
    this.pos_[1] = this.terrain_.Get(...params.pos)[0];
    this.params_ = params;
  }

  Spawn_(WorldAIClient) {
    // Hack
    const e = new WorldEntity({
      id: this.parent_.ids_++,
      position: vec3.clone(this.pos_),
      rotation: quat.fromValues(0, 0, 0, 1),
      grid: this.grid_,
      character: {
        definition: CHARACTER_MODELS[this.params_.class],
        class: this.params_.class,
      },
      account: { accountName: CHARACTER_MODELS[this.params_.class].name },
    });

    // console.log("WorldAIClient: ", WorldAIClient)

    const wc = new WorldAIClient(e, this.terrain_, () => {
      this.entity_ = null;
      console.log('entity gone, spawner making now one soon');
    });

    this.parent_.AddMonster(wc);

    this.entity_ = wc;
  }

  Update(timeElapsed, WorldAIClient) {
    if (!this.entity_) {
      this.Spawn_(WorldAIClient);
    }
  }
};


const _TICK_RATE = 0.1;

class WorldManager {
  ids_: number;
  entities_: any[];
  grid_: any;
  terrain_: any;
  spawners_: any[];
  tickTimer_: number;
  constructor(params) {
    this.ids_ = 0;
    this.entities_ = [];
    this.grid_ = new SpatialHashGrid(
      [[-4000, -4000], [4000, 4000]], [1000, 1000]
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
            this.spawners_.push(new MonsterSpawner({
              parent: this, pos: pos, class: 'warrok'
            }));
          } else {
            this.spawners_.push(new MonsterSpawner({
              parent: this, pos: pos, class: 'zombie'
            }));
          }
        }
      }
    }
  }

  AddMonster(e) {
    this.entities_.push(e);
  }

  Add(client, params, WorldNetworkClient) {
    const models = CLASS_TYPES;
    const randomClass = models[
      Math.floor(Math.random() * models.length)];
    console.log("WorldManager.Add(): ", "SocketIOClient", params, "WorldNetworkClient")
    // Hack
    const e = new WorldEntity({
      id: this.ids_++,
      position: vec3.fromValues(
        -60 + (Math.random() * 2 - 1) * 20,
        0,
        (Math.random() * 2 - 1) * 20),
      rotation: quat.fromValues(0, 0, 0, 1),
      grid: this.grid_,
      character: {
        definition: CHARACTER_MODELS[randomClass],
        class: randomClass,
      },
      account: params,
    });

    const wc = new WorldNetworkClient(client, e);

    this.entities_.push(wc);

    wc.BroadcastChat({
      name: 'Server:',
      server: true,
      text: '[' + params.accountName + ' has entered the game]'
    });
  }

  Update(timeElapsed, WorldAIClient) {
    if(false) {
      
    console.log("WorldManager.Update(): ", {timeElapsed, WorldAIClient})
    }
    this.TickClientState_(timeElapsed);
    this.UpdateEntities_(timeElapsed);
    this.UpdateSpawners_(timeElapsed, WorldAIClient);
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
      if (this.entities_?.[i]?.entity_) {
        this.entities_[i].entity_.events_ = [];
      }
    }
  }

  UpdateSpawners_(timeElapsed, WorldAIClient) {
    for (let i = 0; i < this.spawners_.length; ++i) {
      this.spawners_[i].Update(timeElapsed, WorldAIClient);
    }
  }

  UpdateEntities_(timeElapsed) {
    const dead = [];
    const alive = [];

    for (let i = 0; i < this.entities_.length; ++i) {
      const e = this.entities_[i];

      e.Update(timeElapsed);

      if (e.IsDead) {
        console.log('killed it off');
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
};

export { WorldManager }
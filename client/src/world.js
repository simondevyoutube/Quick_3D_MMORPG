import { Entities } from "./interfaces/entities.js";
import { Entity } from "./structures/entity.js"
import { Network } from "./interfaces/network.js";
import { Scenery } from "./interfaces/scenery.js";
import { Assets } from "./interfaces/assets.js";
import { NetworkEntitySpawner, PlayerSpawner } from "./entities/spawner.js";
import { Terrain } from "./interfaces/terrain.js";

import { SpatialHashGrid } from "./structures/spatialhashgrid.js";
// import { WEAPONS_DATA } from "../shared/defs.js";
import { ThreeInit } from "./interfaces/graphics.js";

export class World {
  state = undefined;
  scene;
  camera;
  renderer;
  input = {
    handleKeyup: undefined,
    handleKeydown: undefined,
  };
  entities = new Entities();
  grid = new SpatialHashGrid(
    [[-1000, -1000], [1000, 1000]],
    [100, 100],
  );
  network = new Network(this);
  previousRAF_ = undefined;
  initialized = false;

  constructor() {
    // TODO-DefinitelyMaybe: do better eventually
    this.threejs = new ThreeInit()
    this.scene = this.threejs.scene;
    this.camera = this.threejs.camera;
    this.renderer = this.threejs.renderer;

    this.terrain = new Terrain(this)
    this.scenery = new Scenery(this)
    this.assets = new Assets()

    // TODO-DefinitelyMaybe: const spawner = new Spawner()
    const spawner = new Entity();
    spawner.AddComponent(
      new PlayerSpawner(this),
    );
    spawner.AddComponent(
      new NetworkEntitySpawner(this),
    );
    this.entities.Add(spawner, "spawners");

    // Setup Network hooks
    this.network.websocket.on("world.player", (d) => {
      this.spawnPlayer(d)
    })
    this.network.websocket.on("world.update", (d) => {
      this.update(d)
    })

    this.RAF_();

    this.initialized = true;
    this.resize();
    console.log(this);
  }

  spawnPlayer(d) {
    // find the spawner
    const spawner = this.entities.get("spawners").GetComponent(
      "PlayerSpawner",
    );

    // create the player
    // const player = new Player()
    // spawner.spawn(player)
    const player = spawner.Spawn(d.desc);
    player.Broadcast({
      topic: "network.update",
      transform: d.transform,
    });

    console.log("entering world: " + d.id);
    // set the playerID that we care about
    this.network.playerID_ = d.id;
  }

  update(d) {
    const updates = d;

    const spawner = this.entities.get("spawners").GetComponent(
      "NetworkEntitySpawner",
    );

    for (let u of updates) {
      const id = this.network.GetEntityID_(u.id);

      let npc = undefined;
      if ("desc" in u) {
        // const npc = new NPC()
        // spawner.spawn(npc)
        npc = spawner.Spawn(id, u.desc);

        npc.Broadcast({
          topic: "network.inventory",
          inventory: u.desc.character.inventory,
        });
      } else {
        // TODO-DefinitelyMaybe: This sometimes fails
        // it asks the entity manager for an element thats not there
        npc = this.entities.get(id);
        if (!npc) {
          // TODO-DefinitelyMaybe: We're early out of this and not worry about it for now
          break;
        }
      }

      // Translate events, hardcoded, bad, sorry
      let events = [];
      if (u.events) {
        for (let e of u.events) {
          events.push({
            type: e.type,
            target: this.entities.get(this.network.GetEntityID_(e.target)),
            attacker: this.entities.get(this.network.GetEntityID_(e.attacker)),
            amount: e.amount,
          });
        }
      }

      npc.Broadcast({
        topic: "network.update",
        transform: u.transform,
        stats: u.stats,
        events: events,
      });
    }
  }

  resize() {
    if (this.initialized) {
      // TODO-DefinitelyMaybe: Adjusts game aspect ratio not layout.
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === undefined) {
        this.previousRAF_ = t;
      }

      try {
        this.renderer.render(this.scene, this.camera); 
      } catch (error) {
        console.log(this.scene, this.camera);
        console.error(error);
      }
      this.Step_(t - this.previousRAF_);
      this.previousRAF_ = t;

      setTimeout(() => {
        this.RAF_();
      }, 1);
    });
  }

  Step_(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this.entities.Update(timeElapsedS);
    this.terrain.Update(timeElapsed)
    this.scenery.Update(timeElapsed)

    // terrible hack
    this.threejs.Update(this.entities.get("player"))
  }
}
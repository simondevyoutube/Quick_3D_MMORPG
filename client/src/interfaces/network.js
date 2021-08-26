import { io } from "../deps.js";

export class Network {
  websocket = io(`ws://localhost:3000`, {
    reconnection: false,
    transports: ["websocket"],
    timeout: 10000,
  });
  playerID_;
  game;

  constructor(game) {
    this.game = game
    // let x = new URL(location.href);
    // console.log(`ws://${x.hostname}:${this.port}`);
    // TODO-DefinitelyMaybe: reconnect via `ws.connet()`
    this.websocket.on("connect", () => {
      console.log(`ws id: ${this.websocket.id}`);
      const randomName = this.GenerateRandomName_();
      // Input validation is for losers
      this.websocket.emit(
        "login.commit",
        randomName,
      );
    });

    this.websocket.on("disconnect", () => {
      console.log("DISCONNECTED: " + this.websocket.id); // undefined
    });

    // TODO-DefinitelyMaybe: Maybe this logic should live somewhere else
    this.websocket.on("world.player", (d) => {
      // find the spawner
      const spawner = this.game.entities.get("spawners").GetComponent(
        "PlayerSpawner",
      );

      // create the player
      const player = spawner.Spawn(d.desc);
      player.Broadcast({
        topic: "network.update",
        transform: d.transform,
      });

      console.log("entering world: " + d.id);
      // set the playerID that we care about
      this.playerID_ = d.id;
    })

    this.websocket.on("world.update", (d) => {
      const updates = d;

      const spawner = this.game.entities.get("spawners").GetComponent(
        "NetworkEntitySpawner",
      );

      for (let u of updates) {
        const id = this.GetEntityID_(u.id);

        let npc = undefined;
        if ("desc" in u) {
          npc = spawner.Spawn(id, u.desc);

          npc.Broadcast({
            topic: "network.inventory",
            inventory: u.desc.character.inventory,
          });
        } else {
          // TODO-DefinitelyMaybe: This sometimes fails
          // it asks the entity manager for an element thats not there
          npc = this.game.entities.get(id);
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
              target: this.game.entities.get(this.GetEntityID_(e.target)),
              attacker: this.game.entities.get(this.GetEntityID_(e.attacker)),
              amount: e.amount,
            });
          }
        }

        // ui.AddEventMessages(events);

        npc.Broadcast({
          topic: "network.update",
          transform: u.transform,
          stats: u.stats,
          events: events,
        });
      }
    })

    this.websocket.on("world.stats", (d) => {
      // TODO-DefinitelyMaybe: not worrying about this much yet
    })

    this.websocket.on("world.inventory", (d) => {
      const id = this.GetEntityID_(d[0]);

      const e = this.game.entities.get(id);
      if (!e) {
        return;
      }

      e.Broadcast({
        topic: "network.inventory",
        inventory: d[1],
      });
    })

    this.websocket.on("chat.message", (d) => {
      // this.game.entities.get("ui").GetComponent("UIController").AddChatMessage(d);
    })
  }

  GenerateRandomName_() {
    const names1 = [
      "Aspiring",
      "Nameless",
      "Cautionary",
      "Excited",
      "Modest",
      "Maniacal",
      "Caffeinated",
      "Sleepy",
      "Passionate",
      "Medical",
    ];
    const names2 = [
      "Painter",
      "Cheese Guy",
      "Giraffe",
      "Snowman",
      "Doberwolf",
      "Cocktail",
      "Fondler",
      "Typist",
      "Noodler",
      "Arborist",
      "Peeper",
    ];
    const n1 = names1[
      Math.floor(Math.random() * names1.length)
    ];
    const n2 = names2[
      Math.floor(Math.random() * names2.length)
    ];
    return `${n1} ${n2}`;
  }

  SendTransformUpdate(transform) {
    this.websocket.emit("world.update", transform);
  }

  SendActionAttack_() {
    this.websocket.emit("action.attack");
  }

  SendInventoryChange_(packet) {
    this.websocket.emit("world.inventory", packet);
  }

  GetEntityID_(serverID) {
    if (serverID == this.playerID_) {
      return "player";
    } else {
      return "__npc__" + serverID;
    }
  }
}

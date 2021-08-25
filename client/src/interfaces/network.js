import { io } from "../deps.js";
import { Component } from "../utils/component.js";

export class NetworkController extends Component {
  port = 3000;
  socket_ = io(`ws://localhost:${this.port}`, {
    reconnection: false,
    transports: ["websocket"],
    timeout: 10000,
  });
  playerID_ = null;

  constructor(params) {
    super();
    let x = new URL(location.href);
    // console.log(x.host, x.hostname, x.origin, x.pathname, x.port);
    console.log(`ws://${x.hostname}:${this.port}`);
    this.socket_.on("connect", () => {
      console.log(`ws id: ${this.socket_.id}`);
      const randomName = this.GenerateRandomName_();
      // Input validation is for losers
      this.socket_.emit(
        "login.commit",
        randomName,
      );
    });

    this.socket_.on("disconnect", () => {
      console.log("DISCONNECTED: " + this.socket_.id); // undefined
    });

    this.socket_.onAny((e, d) => {
      this.OnMessage_(e, d);
    });
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
    return n1 + " " + n2;
  }

  SendChat(txt) {
    this.socket_.emit("chat.msg", txt);
  }

  SendTransformUpdate(transform) {
    this.socket_.emit("world.update", transform);
  }

  SendActionAttack_() {
    this.socket_.emit("action.attack");
  }

  SendInventoryChange_(packet) {
    this.socket_.emit("world.inventory", packet);
  }

  GetEntityID_(serverID) {
    if (serverID == this.playerID_) {
      return "player";
    } else {
      return "__npc__" + serverID;
    }
  }

  OnMessage_(e, d) {
    if (e == "world.player") {
      const spawner = this.FindEntity("spawners").GetComponent(
        "PlayerSpawner",
      );

      const player = spawner.Spawn(d.desc);
      player.Broadcast({
        topic: "network.update",
        transform: d.transform,
      });

      player.Broadcast({
        topic: "network.inventory",
        inventory: d.desc.character.inventory,
      });

      console.log("entering world: " + d.id);
      this.playerID_ = d.id;
    } else if (e == "world.update") {
      const updates = d;

      const spawner = this.FindEntity("spawners").GetComponent(
        "NetworkEntitySpawner",
      );

      const ui = this.FindEntity("ui").GetComponent("UIController");

      for (let u of updates) {
        const id = this.GetEntityID_(u.id);

        let npc = null;
        if ("desc" in u) {
          npc = spawner.Spawn(id, u.desc);

          npc.Broadcast({
            topic: "network.inventory",
            inventory: u.desc.character.inventory,
          });
        } else {
          // TODO-DefinitelyMaybe: This sometimes fails
          // it asks the entity manager for an element thats not there
          npc = this.FindEntity(id);
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
              target: this.FindEntity(this.GetEntityID_(e.target)),
              attacker: this.FindEntity(this.GetEntityID_(e.attacker)),
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
    } else if (e == "chat.message") {
      // this.FindEntity("ui").GetComponent("UIController").AddChatMessage(d);
    } else if (e == "world.inventory") {
      const id = this.GetEntityID_(d[0]);

      const e = this.FindEntity(id);
      if (!e) {
        return;
      }

      e.Broadcast({
        topic: "network.inventory",
        inventory: d[1],
      });
    } else if (e == "world.stats") {
      // TODO-DefinitelyMaybe: not worrying about this much yet
    } else {
      console.warn("Network controller unknown event");
      console.log(e);
      console.log(d);
      debugger;
    }
  }
}

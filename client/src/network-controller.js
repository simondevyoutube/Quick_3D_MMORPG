// TODO-DefinitelyMaybe: networking
// import "https://cdn.jsdelivr.net/npm/socket.io-client@3.1.0/dist/socket.io.js";
import { Component } from "./entity.js";

export class NetworkController extends Component {
  constructor() {
    super();

    this.playerID_ = null;
    this.SetupSocket_();
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

  SetupSocket_() {
    console.log("initial request to make websocket");
    this.ws = new WebSocket("ws://localhost:3000/ws");

    this.ws.onopen = async () => {
      console.log("websocket connected")
      console.log("attempting to login");
      // Input validation should be done but currently isn't
      this.ws.send(JSON.stringify({event:"login",data:document.getElementById("login-input").value}));
    }

    this.ws.onmessage = async (event) => {
      const json = JSON.parse(event.data)
      const { type, data } = json
      console.log(`Recieved ${type} event`);
      console.table(json);
      this.OnMessage_(type, data);
    }

    this.ws.onerror = async (event) => {
      console.log(event);
    }

    this.ws.onclose = (event) => {
      console.log("The WebSocket was closed");
    }

    // this.ws.onAny((e, d) => {
    //   this.OnMessage_(e, d);
    // });
  }

  SendChat(txt) {
    this.ws.emit("chat.msg", txt);
  }

  SendTransformUpdate(transform) {
    this.ws.emit("world.update", transform);
  }

  SendActionAttack_() {
    this.ws.emit("action.attack");
  }

  SendInventoryChange_(packet) {
    this.ws.emit("world.inventory", packet);
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
          npc = this.FindEntity(id);
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

        ui.AddEventMessages(events);

        npc.Broadcast({
          topic: "network.update",
          transform: u.transform,
          stats: u.stats,
          events: events,
        });
      }
    } else if (e == "chat.message") {
      this.FindEntity("ui").GetComponent("UIController").AddChatMessage(d);
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
    }
  }
}

import { io } from "../deps.js";

export class Network {
  websocket = io(`ws://localhost:3000`, {
    reconnection: false,
    transports: ["websocket"],
    timeout: 10000,
  });
  playerID_;
  world;

  constructor(world) {
    this.world = world
    // let x = new URL(location.href);
    // console.log(`ws://${x.hostname}:${this.port}`);

    // TODO-DefinitelyMaybe: attempt to reconnect via `ws.connet()`
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
      console.log("DISCONNECTED: " + this.websocket.id);
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

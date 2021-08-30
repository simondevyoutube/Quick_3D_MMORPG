import { io } from "../deps.js";

export class Network {
  websocket = io(`ws://localhost:3000`, {
    reconnection: false,
    transports: ["websocket"],
    timeout: 10000,
  });
  playerID;

  constructor() {
    // TODO-DefinitelyMaybe: attempt to reconnect via `ws.connet()`
    this.websocket.on("connect", () => {
      const randomName = this.GenerateRandomName_();

      // TODO-DefinitelyMaybe: I don't think login belongs here
      // Input validation is for losers
      this.websocket.emit(
        "login.commit",
        randomName,
      );
    });

    this.websocket.on("disconnect", () => {
      console.log("DISCONNECTED: " + this.websocket.id);
    });

    this.websocket.on("world.player", (data) => {
      // remember the playerID that we care about
      this.playerID = data.id;
    })

    // this.websocket.onAny((e,d) => {
    //   // console.log(e);
    // })
  }

  // TODO-DefinitelyMaybe: Placeholder until Login queue / Actual Account is tackled
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
}

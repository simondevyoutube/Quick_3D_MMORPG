export class Network {
  // TODO-DefinitelyMaybe: Making it a secure connection will help.
  ws = new WebSocket(`ws://localhost:3000`);
  playerID;

  constructor(world) {
    this.world = world
    this.ws.onopen = () => {
      console.log("connected");
    }
    this.ws.onmessage = (event) => {      
      this.handleMessage(JSON.parse(event.data))
    };
    this.ws.onerror = (event) => {
      console.error(event);
    }
    this.ws.onclose = () => {
      console.log("connection lost");
    };
  }

  handleMessage(message){
    const {event} = message
    console.log(`${event} event`);
    switch (event) {
      case 'login':
        this.login()
        break;
      case 'world.player':
        this.worldPlayer(message)
        break;
      default:
        console.warn(`Didn't know what to do with ${event}`);
        break;
    }
  }

  update(d){
    // The network is truth. generally speaking.
    for (let i = 0; i < d.length; i++) {
      const { id, position, quaternion, name, model } = d[i];
      this.world.entities.receive({ id, position, quaternion, name, model })
    }
  }

  chatMessage(d){
    if (this.chat) {
      this.chat.receive(d) 
    }
  }

  worldPlayer(data) {
    const { id, position, quaternion, name, model } = data.player;
    const entity = "player"
    const state = "idle"
    this.world.entities.receive({id, position, quaternion, entity, name, model, state})
  }

  login(){
    // TODO-DefinitelyMaybe: Normally there'd be gathering up credentials
    // and sending those to the server to be verified
    // but for now we're going to assume everythings ok
    // console.log("Attempting to login");
    this.ws.send(JSON.stringify({event:"login.commit", login:"test", password:"password"}))
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

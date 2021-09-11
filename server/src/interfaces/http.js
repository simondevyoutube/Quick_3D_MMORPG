import { World } from "../world/simonsWorld.js";

// Create http server
const port = 3000;
const server = Deno.listen({port})

// Create the world
const world = new World();
world.start();

async function handle(conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    const { method, url } = requestEvent.request
    console.log(`${method} ${url}`);
    await requestEvent.respondWith(handleReq(requestEvent.request));
  }
}

function handleReq(req) {
  const { method, url, headers } = req
  if (headers.get("upgrade") == "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    socket.onopen = () => {
      socket.send(JSON.stringify({event:"login"}))
    }
    socket.onmessage = (e) => {
      try {
        handleMessage(socket, JSON.parse(e.data)) 
      } catch (err) {
        console.error(err);
      }
    };
    socket.onerror = (e) => console.log("socket errored:", e.message);
    socket.onclose = () => console.log("socket closed");
    return response;
  }
  return new Response(`lol -> ${method} ${url}`);
}

function handleMessage(ws, message) {
  const { event } = message
  console.log(event);
  switch (event) {
    case "login.commit":
      handleLoginAttempt(ws, message)
      break;
    default:
      console.warn(`Didn't handle the '${event}' event`);
      break;
  }
}

function handleLoginAttempt(ws, data) {
  // const {login, password} = data
  // TODO-DefinitelyMaybe: Get the account information
  // TODO-DefinitelyMaybe: Get character information
  const player = world.entities.create({
    entity:"player",
    model:"sorceror",
  })
  player.name = "What?"

  ws.send(JSON.stringify({
    event:'world.player',
    player: player.toJSON(),
  }))
}

// Start processing connections
console.log("world server has begun\nlistening on: *", port);
for await (const conn of server) {
  handle(conn)
}

import { http, socket_io as socketIo } from "../deps.js";
import { World } from "../structures/world/simonsWorld.js";

// Create http server
const port = 3000;
const server = http.createServer();

// create socket.io server for ws connections
const io = new socketIo.Server(server, {
  cors: {
    origin: "*",
  },
});

// Create the world
const world = new World(io);
world.start();

// Start processing connections
server.listen(port, () => {
  console.log("world server has begun\nlistening on: *", port);
});

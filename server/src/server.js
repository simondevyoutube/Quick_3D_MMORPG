import { http, socket_io } from "./deps.js";
import { WorldServer } from "./world/server.js";

function Main() {
  const port = process.env.PORT || 3000;

  const server = http.createServer();
  const io = new socket_io.Server(server, {
    cors: {
      origin: "*",
    },
  });

  server.listen(port, () => {
    console.log("listening on: *", port);
  });

  const _WORLD = new WorldServer(io);
  _WORLD.Run();
}

Main();

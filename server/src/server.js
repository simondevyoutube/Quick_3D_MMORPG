import { http, socket_io as socketIo } from "./deps.js";
import { WorldServer } from "./world/server.js";

function Main() {
  const port = 3000;

  const server = http.createServer();
  // const server = Deno.serveHttp()
  const io = new socketIo.Server(server, {
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

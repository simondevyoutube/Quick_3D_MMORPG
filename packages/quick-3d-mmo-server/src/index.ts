
import * as http from 'http';
import * as socket_io from 'socket.io';

import {WorldServer} from './scripts/world-server.js';
import {WorldNetworkClient, WorldAIClient} from './scripts/world-client.js';
console.log("asdf");
function Main() {
  const port = process.env.PORT || 3000;

  const server = http.createServer();
  const io = new socket_io.Server(server, {
      cors: {
          origin: '*'
      }
  });

  server.listen(port, () => {
    console.log(`listening on: ${port}`);
  });

  const _WORLD = new WorldServer(io, WorldNetworkClient);
  _WORLD.Run(WorldAIClient);
}


Main();

import {test} from 'shared';
import * as http from 'http';
import * as socket_io from 'socket.io';

import {world_server} from './scripts/world-server';


function Main() {
  const port = process.env.PORT || 3000;

  const server = http.createServer();
  const io = new socket_io.Server(server, {
      cors: {
          origin: '*'
      }
  });

  server.listen(port, () => {
    console.log(`listening on: ${port} : ${test}`);
  });

  const _WORLD = new world_server.WorldServer(io);
  _WORLD.Run();
}


Main();

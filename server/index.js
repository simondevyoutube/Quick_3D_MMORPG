
// const http = require('http');
// const server = http.createServer();
// const io = require('socket.io')(server,
//   {
//     cors: {
//       origin: "*"
//     }
//   }
// );


import * as http from 'http';
import * as socket_io from 'socket.io';

import {WorldServer} from './src/world-server.mjs';

function Main() {
  const port = process.env.PORT || 3030;

  const server = http.createServer();
  const io = new socket_io.Server(server, {
      cors: {
          origin: '*'
      }
  });

  server.listen(port, () => {
    console.log('listening on: *', port);
  });

  const _WORLD = new WorldServer(io);
  _WORLD.Run();
}


Main();
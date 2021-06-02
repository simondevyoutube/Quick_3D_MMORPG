import { Server, createServer } from "./src/deps.js";
import { WorldServer } from "./src/world-server.js";

function Main() {
  const port = process.env.PORT || 3000;

  const server = createServer();
  const io = new Server(server, {
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

// app.all("/socket.io/*", function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
//   res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
//   return next();
// });

// class Client {
//   constructor(socket) {
//     this.socket_ = socket;
//     this.SetupSocket_();
//   }

//   SetupSocket_() {
//     this.socket_.on('user-connected', () => {
//       console.log('socket.id: ' + socket.id);
//       // users.push({id: socket.id})
//       // io.emit('user-connected', socket.id)
//     });
//     this.socket_.on('disconnect', () => {
//       // const index = getIndex(socket.id)
//       // users.splice(1, index)
//       // io.emit('user-disconnected', socket.id)
//     });
//   }
// };

// class WorldServer {
//   constructor() {
//     this.SetupIO_();
//   }

//   SetupIO_() {
//     io.on('connection', socket => {
//       this.clients_[socket.id] = new Client(socket);
//     });
//   }
// };

// class World {
//   constructor() {
//     this.server_ = new WorldServer();
//   }
// };

// const _WORLD = new World();

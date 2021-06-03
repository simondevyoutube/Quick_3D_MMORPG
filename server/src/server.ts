import { isWebSocketPingEvent, isWebSocketCloseEvent, acceptWebSocket, serve, acceptable } from "./deps.ts";
import { WorldServer } from "./server.ts";


const port = 3000;

const server = serve({port:port});
console.log(`Deno server listening on: http://localhost:${port}`);

// instead of initializing the world server with the io input
// we'll simply setup the world so that it can deal with the
// requests we send to it
const world = new WorldServer();
// world.Run();

async function handleWs(sock: WebSocket) {
  console.log("socket connected!");
  try {
    for await (const ev of sock) {
      if (typeof ev === "string") {
        // text message.
        console.log("ws:Text", ev);

        // when we receive something from the websocket
        // we need to figure out what to do with it
        const json = JSON.parse(ev)

        if (json.event) {
          // if (condition) { world.send("") }
        }
      } else if (ev instanceof Uint8Array) {
        // binary message.
        console.log("ws:Binary", ev);
      } else if (isWebSocketPingEvent(ev)) {
        const [, body] = ev;
        // ping.
        console.log("ws:Ping", body);
      } else if (isWebSocketCloseEvent(ev)) {
        // close.
        const { code, reason } = ev;
        console.log("ws:Close", code, reason);
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`);

    if (!sock.CLOSED) {
      sock.close(1000)
    }
  }
}


// Connections to the server will be yielded up as an async iterable.
for await (const req of server) {
  const { conn, r: bufReader, w: bufWriter, headers, url, method } = req;
  console.log(`${method} ${url}`);
  if (method == "GET") {
    if (url == "/ws") {
      console.log("Trying to create a websocket connection");
      await acceptWebSocket({
        conn,
        bufReader,
        bufWriter,
        headers,
      })
      // @ts-ignore
        .then(handleWs)
        .catch(async (err) => {
          console.error(`failed to accept websocket: ${err}`);
          await req.respond({ status: 400 });
        });
    } else {
      // hopefully there isn't any requests that hit this section of code...
      console.log("Might want to check this out");
      console.log(url);
    }
  }
}

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// server.listen(port, () => {
//   console.log("listening on: *", port);
// });


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

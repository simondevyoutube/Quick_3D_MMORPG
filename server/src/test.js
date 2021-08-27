import { serve } from "https://deno.land/std@0.106.0/http/mod.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
} from "https://deno.land/std@0.106.0/ws/mod.ts";


const pool = []
const server = serve({ port: 80 });

async function handleWs(sock) {
  console.log("socket connected!");
  try {
    for await (const ev of sock) {
      if (typeof ev === "string") {
        // text message.
        console.log("ws:Text", ev);
        await sock.send(ev);
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

    if (!sock.isClosed) {
      await sock.close(1000).catch(console.error);
    }
  }
}

for await (const req of server) {
  const {url, method, r: bufReader, w: bufWriter, conn, headers} = req
  console.log(`${method} ${url}`);

  if (url == "/") {
    console.log("sending html");
    req.respond({ body:Deno.readTextFileSync("./src/test.html") }); 
  } else if (url == "/ws") {
    console.log("websocket time");
    acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    })
    .then(sock => {
      pool.push(sock)
      handleWs(sock)
    })
    .catch(err => {
      console.error(`failed to accept websocket: ${err}`);
      req.respond({ status: 400 });
    })
  }
}

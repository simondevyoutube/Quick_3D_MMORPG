var express = require("express")

let server = express()

//https://web.dev/coop-coep/
//https://expressjs.com/en/api.html
server.use(
  express.static('src/client', {
    setHeaders: function (res, path, stat) {
      res.set('Cross-Origin-Embedder-Policy', 'require-corp')
      res.set('Cross-Origin-Opener-Policy', 'same-origin')
    }
  })
)

server.listen(5000)
console.log('serving content on http://localhost:5000')

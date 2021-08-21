
require("sucrase/register")
require("./src/server/index.js")
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


const {app, BrowserWindow} = require('electron')

app.commandLine.appendSwitch('enable-unsafe-webgpu')

function createWindow () {
  const mainWindow = new BrowserWindow()
  mainWindow.loadURL("http://localhost:5000")
}

app.whenReady().then(createWindow)

app.on("exit", () => {
  process.exit(0)
})

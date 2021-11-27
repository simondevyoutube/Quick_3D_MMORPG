import Engine from "./src/main.js"
import {Modifications} from "./Modifications.js"

const engine = new Engine()
// Expose on CLI
window.engine = engine

// Act on login
document.getElementById('login-ui').style.visibility = 'visible';
document.getElementById('login-button').onclick = () => {
    // start();
};
document.getElementById('login-form').onsubmit = function (e) {
    e.preventDefault()

    loadWorld();
}

// TODO loading progress
// document.getElementById('progress')

// Autostart
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
if (username) {
    console.log(`[app > autostart] Welcome: ${username}`)
    loadWorld(username)
}



/**
 * Start the world
 */
function loadWorld() {
    console.log('start')
    // Hide login
    document.getElementById('login-ui').style.visibility = 'hidden';

    engine.on('ready', () => {
        window.THREE = engine.THREE

        // LoadSky(engine._scene)
        const mod = new Modifications(engine)
        window.mod = mod

        mod.LoadSky()
    })
    
    engine.start()
    // engine.emit('ready')
}


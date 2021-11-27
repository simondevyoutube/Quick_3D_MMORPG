import Engine from "./src/main.js"

function start() {
    console.log('start')
    // Hide login
    document.getElementById('login-ui').style.visibility = 'hidden';

    const engine = new Engine()
    engine.start()
}

document.getElementById('login-ui').style.visibility = 'visible';
document.getElementById('login-button').onclick = () => {
    // start();
};
document.getElementById('login-form').onsubmit = function (e) {
    e.preventDefault()

    /* do what you want with the form */
    start();

    // You must return false to prevent the default form behavior
    // return false;
}

// TODO loading progress
// document.getElementById('progress')
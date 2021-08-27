<script>
  function FadeoutLogin() {
    const loginElement = document.getElementById("login-ui");
    if (loginElement.classList.contains("fadeOut")) {
      return;
    }

    loginElement.classList.toggle("fadeOut");
    document.getElementById("game-ui").style.visibility = "visible";
  }
  
</script>

<div class="ui" id="login-ui" style="visibility: visible;">
  <div class="login-screen">
    <div class="login-screen-layout">
      <div class="login-screen-layout window">
        <div class="login-text">Account Name</div>
        <input
          class="login-input"
          id="login-input"
          maxlength="64"
          type="text"
        />
        <button class="login-button" id="login-button">Login</button>
        <a href="game">Game</a>
        <a href="/">Return</a>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    width: 100%;
    height: 100%;
    background: #000000;
    color: white;
    margin: 0;
    overflow: hidden;
  }

  .login-screen {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    font-family: "IM Fell French Canon", serif;
    background-image: url("./resources/background-3.png");
    background-size: cover;
  }
  
  .login-screen-layout {
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .login-screen-layout.window {
    height: 400px;
    width: 500px;
    border-radius: 5px;
    border-color: black;
    border-style: solid;
    background: rgba(0, 0, 0, 0.75);
  }

  .login-button {
    height: 50px;
    width: 200px;
    border-radius: 5px;
    box-sizing: border-box;
    text-align: center;
    background-color: rgba(130, 130, 130, 0.5);
    display: inline-block;
    font-size: 1.5em;
    text-shadow: 2px 2px 5px black;
    color: white;
    margin: 15px;
    transition: all 0.2s;
  }

  .login-button:hover {
    color: #000000;
    background-color: rgba(255, 255, 255, 0.5);
  }

  .login-input {
    background: rgba(0, 0, 0, 0);
    width: 300px;
    font-size: 1.5em;
    text-shadow: 2px 2px 5px black;
    color: white;
    margin: 15px;
  }

  .login-text {
    font-size: 2em;
    text-shadow: 2px 2px 5px black;
    color: white;
  }
</style>
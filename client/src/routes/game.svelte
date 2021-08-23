<script>
  import { CrappyMMOAttempt } from "../main.js";

  const mmo = new CrappyMMOAttempt()

  let inventory   //: document.getElementById("inventory"),
  let stats       //: document.getElementById("stats"),
  let quests      //: document.getElementById("quest-journal"),

  function HideUI_() {
    inventory.style.visibility = "hidden";
    stats.style.visibility = "hidden";
    quests.style.visibility = "hidden";
  }
  // HideUI_();

</script>

<svelte:window on:resize="{() => {mmo._OnWindowResize();}}"></svelte:window>

<button on:click="{() => {
  console.log("Starting Game");
  mmo.OnGameStarted_();}}">Start</button>
<a href="/">Return</a>
<canvas id="game"></canvas>

<style>
  :global(body) {
    width: 100%;
    height: 100%;
    background: #000000;
    color: white;
    margin: 0;
    overflow: hidden;
  }
</style>
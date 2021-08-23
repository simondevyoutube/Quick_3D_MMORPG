<script>
  import { CrappyMMOAttempt } from "../main.js";
  import HUD from "../components/game/hub.svelte";
  import Menu from "../components/game/menu.svelte";

  const game = new CrappyMMOAttempt()
  
  let menu;
  let hud;

  let focused = false

  let showHUD = false
  let showMenu = true;
  
  function handleKeydown(event) {
		// console.log(event.key);
    // console.log(event.keyCode);
	}

  function handleKeyup(event) {
		// console.log(event.key);
    // console.log(event.keyCode);
	}
</script>

<svelte:window on:blur="{() => {focused = false}}"
  on:focus="{() => {focused = true}}"
  on:resize="{() => {game._OnWindowResize();}}"></svelte:window>
<svelte:body on:keyup={handleKeyup}
  on:keydown={handleKeydown}></svelte:body>

<canvas id="game"></canvas>
{#if showHUD}
  <HUD bind:this={hud}
    bind:show={showHUD}></HUD>
{/if}
{#if showMenu}
  <Menu bind:this={menu}
    on:click="{() => {
      game.OnGameStarted_();
      showHUD = true}}"></Menu>
{/if}

<style>
  :global(body) {
    width: 100%;
    height: 100%;
    background: #000000;
    color: white;
    margin: 0;
    overflow: hidden;
  }
  canvas {
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: -1;
  }
</style>
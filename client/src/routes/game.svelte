<script>
  import { CrappyMMOAttempt } from "../main.js";
  import HUD from "../components/game/hub.svelte";
  import Menu from "../components/game/menu.svelte";

  const mmo = new CrappyMMOAttempt()
  
  let menu;
  let hud;

  let showHUD = false
  let showMenu = true;

</script>

<svelte:window on:resize="{() => {mmo._OnWindowResize();}}"></svelte:window>
<svelte:body on:keyup on:keydown></svelte:body>

<canvas id="game"></canvas>
{#if showHUD}
  <HUD bind:this={hud}
    bind:show={showHUD}></HUD>
{/if}
{#if showMenu}
  <Menu bind:this={menu}
    on:click="{() => {
      mmo.OnGameStarted_();
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
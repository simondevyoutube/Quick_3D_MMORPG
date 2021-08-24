<script>
  import { Game } from "../game.js";
  import { onMount } from "svelte";
  import HUD from "../ui/game/hud.svelte";
  import Menu from "../ui/game/menu.svelte";
  import Chat from "../ui/game/chat.svelte";

  const game = new Game()

  let focused = false

  let showHUD = true
  let showMenu = true;
  let showChat = true

  onMount(() => {
    game.load();
    showHUD = true
  })
</script>

<svelte:window on:blur="{() => {focused = false}}"
  on:focus="{() => {focused = true}}"
  on:resize="{() => {game.resize();}}"></svelte:window>
<svelte:body on:keyup={game.input.handleKeyup}
  on:keydown={game.input.handleKeydown}></svelte:body>

<canvas id="game" on:pointerdown on:pointerup></canvas>
{#if showChat}
<Chat></Chat>
{/if}
{#if showHUD}
<HUD></HUD>
{/if}
{#if showMenu}
<Menu></Menu>
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
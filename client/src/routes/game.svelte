<script>
  import { World } from "../world.js";
  import { onMount } from "svelte";
  import HUD from "../ui/game/hud.svelte";
  import Menu from "../ui/game/menu.svelte";
  import Chat from "../ui/game/chat.svelte";

  let world;

  let focused = false

  let showHUD = true
  let showMenu = true;
  let showChat = true

  function test() {
    console.log(world);
  }

  function test2() {
    console.log("test2");
  }

  onMount(() => {
    // new Game expects to be able to make DOM calls
    // i.e. three.js for the canvas element
    world = new World()
    showHUD = true
  })
</script>

<svelte:window on:blur="{() => {focused = false}}"
  on:focus="{() => {focused = true}}"
  on:resize="{() => {world.resize();}}"></svelte:window>
<svelte:body on:keyup={world.input.handleKeyup}
  on:keydown={world.input.handleKeydown}></svelte:body>

<canvas id="game" on:pointerdown on:pointerup></canvas>
{#if showChat}
<Chat></Chat>
{/if}
{#if showHUD}
<HUD></HUD>
{/if}
{#if showMenu}
<Menu on:test="{test}"
  on:test2="{test2}"></Menu>
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
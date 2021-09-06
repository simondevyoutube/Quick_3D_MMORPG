<script>
  import { onMount } from "svelte";
  import { World } from "../structures/worlds/entityViewer.js";
  import Menu from "../ui/game/menu.svelte";

  let world;

  let focused = false

  let showMenu = true;

  function test() {
    console.log(world);
  }

  function test2() {
    console.log(world.camera);
    console.log(world.entity.camera);
  }

  onMount(() => {
    world = new World()
    world.resize()
  })
</script>

<svelte:window on:resize="{() => {world.resize()}}"></svelte:window>
<svelte:body></svelte:body>

<canvas id="game"></canvas>

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
<script>
  import { onMount } from "svelte";
  import { World } from "../worlds/entityViewer.js";
  import Menu from "../ui/game/menu.svelte";
  import ModelPicker from "../ui/dev/models.svelte";

  let world;
  let model = "paladin";

  let focused = false

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

<Menu on:test="{test}"
  on:test2="{test2}"></Menu>
<ModelPicker bind:selected="{model}" on:change="{() => {world.changeModel(model)}}"></ModelPicker>

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
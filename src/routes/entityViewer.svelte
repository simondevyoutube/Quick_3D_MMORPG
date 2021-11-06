<script>
  import { onMount } from "svelte";
  import { World } from "../worlds/entityViewer.js";
  import Menu from "../ui/game/menu.svelte";
  import ModelPicker from "../ui/dev/models.svelte";
  import Inspector from "../ui/dev/inspector.svelte";

  let world;
  let model = "paladin";
  let obj;

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
    obj = world.entities.get(0)
  })
</script>

<svelte:window on:resize="{() => {world.resize()}}"></svelte:window>
<svelte:body></svelte:body>

<canvas id="game"></canvas>

<Menu on:test="{test}"
  on:test2="{test2}"></Menu>
<details open>
  <summary>Helpers</summary>
  <ModelPicker bind:selected="{model}" on:change="{() => {
    world.changeModel(model)
    obj = world.entities.get(0)
  }}"></ModelPicker>
  <Inspector bind:object="{obj}"></Inspector>
</details>

<style>
  :global(body) {
    width: 100%;
    height: 100%;
    background: black;
    color: white;
    margin: 0;
    overflow: hidden;
    font-size: x-large;
  }
  canvas {
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: -1;
  }
  details {
    display: flex;
    flex-direction: column;
    width: 40%;
  }
</style>
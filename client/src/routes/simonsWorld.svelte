<script>
  import { onMount } from "svelte";
  import { World } from "../worlds/simonsWorld.js";
  import Chat from "../ui/game/chat.svelte";
  import HUD from "../ui/game/hud.svelte";
  import Menu from "../ui/game/menu.svelte";
  import Simplex from "../ui/dev/simplex.svelte";
  import Points from "../ui/dev/poisson.svelte";


  let world;
  let chat;

  // TODO-DefinitelyMaybe: focus lost could be a good, stop/start the clock/loop signal
  let focused = false

  // let showHUD = true
  // let showMenu = true;
  // let showChat = true

  function test() {
    console.log(world);
  }

  function test2() {
    console.log(world.entities.player);
  }

  onMount(() => {
    world = new World()
    // showHUD = true
    world.resize()
  })
</script>

<svelte:window on:blur="{() => {
    focused = false
    world.stop()}}"
  on:focus="{() => {
    focused = true
    world.start()}}"
  on:resize="{() => {world.resize()}}"></svelte:window>
<svelte:body on:keyup="{(event) => {world.input.handleKeyup(event)}}"
  on:keydown="{(event) => {world.input.handleKeydown(event)}}"
  on:pointerdown="{(event)=>{world.input.handlePointerdown(event)}}"
  on:pointerup="{(event)=>{world.input.handlePointerup(event)}}"></svelte:body>

<canvas id="game"></canvas>
<Chat bind:this="{chat}" on:send="{(e)=> {
  // TODO-DefinitelyMaybe: Send author info as well
  const {text} = e.detail
  world.network.websocket.emit("chat.message", text)
}}"></Chat>
<HUD></HUD>
<Menu on:test="{test}" on:test2="{test2}"></Menu>
<Simplex></Simplex>
<Points></Points>

<style>
  :global(body) {
    width: 100%;
    height: 100%;
    background: #000000;
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
</style>
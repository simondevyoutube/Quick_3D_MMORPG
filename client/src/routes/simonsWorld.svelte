<script>
  import { onMount } from "svelte";
  import { World } from "../structures/worlds/simonsWorld.js";
  import Chat from "../ui/game/chat.svelte";
  import HUD from "../ui/game/hud.svelte";
  import Menu from "../ui/game/menu.svelte";


  let world;
  let chat;

  // TODO-DefinitelyMaybe: focus lost could be a good, stop/start the clock/loop signal
  let focused = false

  let showHUD = true
  let showMenu = true;
  let showChat = true

  function test() {
    console.log(world);
  }

  function test2() {
    console.log(world.entities.player);
  }

  onMount(() => {
    world = new World()
    world.network.websocket.on("chat.message", (d) => {
      if (chat) {
        chat.receive(d) 
      }
    })
    showHUD = true
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
{#if showChat}
<Chat bind:this="{chat}" on:send="{(e)=> {
  // TODO-DefinitelyMaybe: Send author info as well
  const {text} = e.detail
  world.network.websocket.emit("chat.message", text)
}}"></Chat>
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
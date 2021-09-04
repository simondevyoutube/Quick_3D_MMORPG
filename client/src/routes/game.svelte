<script>
  import { World } from "../structures/world.js";
  import { onMount } from "svelte";
  import HUD from "../ui/game/hud.svelte";
  import Menu from "../ui/game/menu.svelte";
  import Chat from "../ui/game/chat.svelte";
  
  let world;
  let chat;

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
    // new Game expects to be able to make DOM calls
    // i.e. three.js for the canvas element
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

<svelte:window on:blur="{() => {focused = false}}"
  on:focus="{() => {focused = true}}"
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
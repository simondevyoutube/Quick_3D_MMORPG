<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher()
  let text;
  let messages = [
    "Hello chat",
  ]
</script>

<div id="chat">
  <ol>
    {#each messages as message}
    <li>{message}</li>
    {/each}
  </ol>
  <input type="text" bind:value="{text}">
  <button type="submit" on:click="{() => {
    messages = messages.concat(text)
    dispatch('message', {text})
    text = ""
  }}">Send</button>
</div>

<style>
  #chat {
    position: absolute;
    bottom: 0px;
    width: 10%;
    margin-bottom: 10px;
  }
</style>

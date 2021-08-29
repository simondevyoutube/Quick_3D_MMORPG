<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher()
</script>

<nav id="menu">
  <a href="/">Return</a>
  <button on:click="{()=>{
    dispatch("test")
  }}">Test</button>
  <button on:click="{()=>{
    dispatch("test2")
  }}">Test2</button>
</nav>
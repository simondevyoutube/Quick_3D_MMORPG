<script>
  import Vector from "../vector.svelte";
  export let object;
  let props = []
  let selected;
  let value;
  $: if (object) {
    console.log(object);
    props = []
    for (const key in object) {
      props.push(key)
    }
    value = object[selected]
  }
</script>

<details>
  <summary>Inspector</summary>
  {#if object}
  <select bind:value="{selected}">
    {#each props as prop}
      <option value="{prop}">{prop}</option>
    {/each}
  </select>
  {#if typeof(object[selected]?.x) == 'number'}
  <Vector bind:vector={value}></Vector>
  {:else}
  <p>{object[selected]}</p>
  {/if}
  {:else}
  <p>No object</p>
  {/if}
</details>

<style>
  details {
    background-color: black;
  }
</style>
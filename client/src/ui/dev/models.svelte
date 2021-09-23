<script>
  import { newModelData } from "../../data/models/mod.js";

  export let selected;
  let data = [];
  const models = []

  $: if (selected) {
    data = []
    for (const key in newModelData[selected]) {
      const val = newModelData[selected][key];
      data.push({key, val});
    }
  }

  for (const name in newModelData) {
    models.push(name)
  }
</script>

<label for="">Model:</label>
<select bind:value="{selected}" on:change>
  {#each models as name}
    <option value="{name}">{name}</option>
  {/each}
</select>
<details open>
  <summary>Model Data:</summary>
  {#each data as pair}
    {#if typeof(pair.val) == "string"}
      <label for="">{pair.key}</label><input type="text" bind:value="{pair.val}"><br>
    {:else if typeof(pair.val) == "number"}
      <label for="">{pair.key}</label><input type="number" bind:value="{pair.val}"><br>
    {:else if typeof(pair.val) == "boolean"}
      <label for="">{pair.key}</label><input type="checkbox" bind:checked="{pair.val}"><br>
    {:else}
      <!-- It's an object so ... yeah -->
      <label for="">{pair.key}</label>{pair.val} <br>
    {/if}
  {/each}
  <button on:click="{() => {
    console.log("Lets add another variable");
  }}">+</button>
</details>

<style>
  details {
    position: absolute;
    background-color: black;
  }
</style>
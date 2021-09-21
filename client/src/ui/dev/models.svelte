<script>
  import { newModelData } from "../../data/models/mod.js";

  export let selected;
  const models = []
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
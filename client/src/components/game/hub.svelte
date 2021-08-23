<script>
  import Actionbar from "./character/actionbar.svelte";
  import Health from "./character/health.svelte";
  import Inventory from "./character/inventory.svelte";
  import Quests from "./character/quests.svelte";
  import Stats from "./character/stats.svelte";

  let inventory
  let stats
  let quests
  let actionbar
  let health

  export let show = true
  let showInventory = false;
  let showStats = false;
  let showQuests = false;
  let showActionbar = true;
  let showHealth = true;

</script>
{#if show}
{#if showActionbar}
<Actionbar bind:this={actionbar}></Actionbar>
{/if}
{#if showHealth}
<Health bind:this={health}></Health>
{/if}
{#if showInventory}
<Inventory bind:this={inventory}></Inventory>
{/if}
{#if showQuests}
<Quests bind:this={quests}></Quests>
{/if}
{#if showStats}
<Stats bind:this={stats}></Stats>
{/if}
{/if}
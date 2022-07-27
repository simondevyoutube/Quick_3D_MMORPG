<script>
	import Actionbar from './character/actionbar.svelte';
	import Health from './character/health.svelte';
	import Inventory from './character/inventory.svelte';
	import Quests from './character/quests.svelte';
	import Stats from './character/stats.svelte';

	let showInventory = false;
	let showQuests = false;
	let showActionbar = true;
	let showHealth = true;
	let showStats = false;
</script>

<div id="hud">
	{#if showActionbar}
		<Actionbar
			on:toggleInventory={() => {
				showInventory = !showInventory;
			}}
			on:toggleQuests={() => {
				showQuests = !showQuests;
			}}
			on:toggleStats={() => {
				showStats = !showStats;
			}}
		/>
	{/if}
	{#if showHealth}
		<Health />
	{/if}
	{#if showInventory}
		<Inventory />
	{/if}
	{#if showQuests}
		<Quests />
	{/if}
	{#if showStats}
		<Stats />
	{/if}
</div>

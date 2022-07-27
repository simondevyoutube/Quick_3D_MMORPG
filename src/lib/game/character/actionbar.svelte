<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<div class="icon-bar" id="icon-bar">
	<div
		class="icon-bar-item"
		id="icon-bar-stats"
		style="background-image: url('./icons/ui/skills.png');"
		on:click={() => {
			dispatch('toggleStats');
		}}
	/>
	<div
		class="icon-bar-item"
		id="icon-bar-inventory"
		style="background-image: url('./icons/ui/backpack.png');"
		on:click={() => {
			dispatch('toggleInventory');
		}}
	/>
	<div
		class="icon-bar-item"
		id="icon-bar-quests"
		style="background-image: url('./icons/ui/tied-scroll.png');"
		on:click={() => {
			dispatch('toggleQuests');
		}}
	/>
</div>

<style>
	.icon-bar {
		position: absolute;
		display: flex;
		bottom: 0%;
		left: 50%;
	}

	.icon-bar-item {
		background-size: cover;
		width: 75px;
		height: 75px;
		margin: 2px;
	}
</style>

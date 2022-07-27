<script>
	import { onMount } from 'svelte';
	import { World } from '../worlds/entityViewer.js';
	import Menu from '$lib/game/menu.svelte';
	import ModelPicker from '$lib/dev/models.svelte';
	import Inspector from '$lib/dev/inspector.svelte';

	let world;
	let model = 'paladin';
	let obj;

	let focused = false;

	function test() {
		console.log(world);
	}

	function test2() {
		console.log(world.camera);
		console.log(world.entity.camera);
	}

	onMount(() => {
		world = new World();
		world.resize();
		obj = world.entities.get(0);
	});
</script>

<svelte:window
	on:resize={() => {
		world.resize();
	}}
/>
<svelte:body />

<canvas class="absolute" id="game" />
<div class="absolute z-10">
	<Menu on:test={test} on:test2={test2} />
	<details class="flex flex-col" open>
		<summary>Helpers</summary>
		<ModelPicker
			bind:selected={model}
			on:change={() => {
				world.changeModel(model);
				obj = world.entities.get(0);
			}}
		/>
		<Inspector bind:object={obj} />
	</details>
</div>

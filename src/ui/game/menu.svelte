<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<nav id="menu">
	<a class="btn" href="/">Return</a>
	<button
		class="btn"
		on:click={() => {
			dispatch('test');
		}}>Test</button
	>
	<button
		class="btn"
		on:click={() => {
			dispatch('test2');
		}}>Test2</button
	>
</nav>

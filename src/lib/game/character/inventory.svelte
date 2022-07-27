<script>
	let list = ['Bug spray', 'Hair dye'];
</script>

<div id="inventory">
	<h1>Inventory</h1>
	<ol>
		{#each list as item}
			<li>{item}</li>
		{/each}
	</ol>
</div>

<style>
	#inventory {
		position: absolute;
		left: 40%;
		top: 30%;
	}
</style>

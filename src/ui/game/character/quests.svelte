<script>
	let quests = ['go somewhere', 'do Something', 'destory bugs'];
</script>

<div id="quests">
	<h1>Quests</h1>
	<ol>
		{#each quests as quest}
			<li>{quest}</li>
		{/each}
	</ol>
</div>

<style>
	#quests {
		position: absolute;
		left: 50%;
		top: 10px;
	}
</style>

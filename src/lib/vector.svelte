<script>
	export let vector;
	let dem;
	let x;
	let y;
	let z;
	let w;
	$: if (vector) {
		console.log(vector);
		x = vector.x;
		y = vector.y;
		z = vector.z;
		w = vector.w;
		const c1 = typeof x == 'number';
		const c2 = typeof y == 'number';
		const c3 = typeof z == 'number';
		const c4 = typeof w == 'number';
		if (c1 && c2 && c3 && c4) {
			dem = 4;
		} else if (c1 && c2 && c3) {
			dem = 3;
		} else if (c1 && c2) {
			dem = 2;
		} else {
			dem = 1;
		}
	}
</script>

{#if dem == 4}
	<p>({x}, {y}, {z}, {w})</p>
{:else if (dem = 3)}
	<p>({x}, {y}, {z})</p>
{:else if (dem = 2)}
	<p>({x}, {y})</p>
{:else}
	<p>({x})</p>
{/if}

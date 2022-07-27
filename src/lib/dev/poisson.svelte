<script>
	import { onMount, onDestroy } from 'svelte';

	let canvas;
	let context;
	let imageData;
	let worker;

	let radius = 2;
	let width = 100;
	let height = 100;

	$: if (canvas != undefined) {
		radius;
		width;
		height;
		computeNewImage();
	}

	function computeNewImage() {
		imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		worker.postMessage({ imageData, radius });
	}

	onMount(() => {
		context = canvas.getContext('2d');
		imageData = context.createImageData(canvas.width, canvas.height);
		worker = new Worker('./src/ui/dev/poissonWorker.js', { type: 'module' });
		worker.onmessage = (message) => {
			imageData = message.data.imageData;
			context.putImageData(message.data.imageData, 0, 0);
		};
	});

	onDestroy(() => {
		if (worker) {
			worker.terminate();
		}
	});
</script>

<details>
	<summary>Points</summary>
	<div id="container">
		<div>radius: <input type="number" bind:value={radius} />{radius}</div>
		<div>width: <input type="range" bind:value={width} min="10" max="200" step="10" />{width}</div>
		<div>
			height: <input type="range" bind:value={height} min="10" max="200" step="10" />{height}
		</div>
		<canvas bind:this={canvas} {width} {height} />
	</div>
</details>

<style>
	#container {
		position: absolute;
		background-color: black;
		width: 25%;
	}
	input {
		width: 40%;
	}
</style>

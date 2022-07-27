<script>
	// using this persons work as reference
	// https://github.com/lencinhaus/canvas-noise/tree/gh-pages
	import { onMount, onDestroy } from 'svelte';

	/** @type {HTMLCanvasElement} */
	let canvas;
	/** @type {CanvasRenderingContext2D} */
	let context;
	let imageData;
	let worker;

	let seed = 1;
	let scale = 85;
	let octaves = 4;
	let persistence = 0;
	let lacunarity = 2;

	let drawPoints = false;
	let deterministic = false;

	$: if (canvas != undefined) {
		seed;
		scale;
		octaves;
		persistence;
		lacunarity;
		drawPoints;
		deterministic;
		computeNewImage();
	}

	function computeNewImage() {
		worker.postMessage({
			imageData,
			args: {
				seed,
				scale,
				octaves,
				persistence,
				lacunarity,
				drawPoints,
				deterministic
			}
		});
	}

	onMount(() => {
		context = canvas.getContext('2d');
		imageData = context.createImageData(canvas.width, canvas.height);
		worker = new Worker('./src/ui/dev/simplexWorker.js', { type: 'module' });
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
	<summary>Simplex</summary>
	<div id="container">
		<div>Seed: <input type="number" bind:value={seed} /></div>
		<div>Size: <input type="range" bind:value={scale} min="0" max="100" step="5" />{scale}</div>
		<div>
			Octaves: <input type="range" bind:value={octaves} min="1" max="10" step="1" />{octaves}
		</div>
		<div>
			Persistence: <input
				type="range"
				bind:value={persistence}
				min="0"
				max="1"
				step="0.1"
			/>{persistence}
		</div>
		<div>
			Lacunarity: <input
				type="range"
				bind:value={lacunarity}
				min="1"
				max="10"
				step="1"
			/>{lacunarity}
		</div>
		<details>
			<summary>Points</summary>
			<div>Draw points? <input type="checkbox" bind:checked={drawPoints} /></div>
			<div>Deterministically? <input type="checkbox" bind:checked={deterministic} /></div>
		</details>
		<canvas bind:this={canvas} />
	</div>
</details>

<style>
	#container {
		position: absolute;
		background-color: black;
		width: 30%;
	}
	input[type='range'] {
		width: 40%;
	}
	canvas {
		width: 100%;
		height: 200px;
	}
</style>

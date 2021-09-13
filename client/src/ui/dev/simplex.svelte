<script>
  // using this persons work as reference
  // https://github.com/lencinhaus/canvas-noise/tree/gh-pages
  import { onMount } from "svelte";

  /** @type {HTMLCanvasElement} */
  let canvas;
  /** @type {CanvasRenderingContext2D} */
  let context;
  let imageData;
  let worker;

  let seed = 1
  let scale = 85
  let octaves = 5
  let persistence = .4
  let lacunarity = 2

  $: if (imageData != undefined){
    seed
    scale
    octaves
    persistence
    lacunarity
    computeNewImage()
  }

  let numPoints = 10
  let drawPoints = true;

  $: {
    console.log({numPoints,drawPoints});
  }

  function computeNewImage() {
    worker.postMessage({imageData, args:{
      seed,
      scale,
      octaves,
      persistence,
      lacunarity,
    }})
  }

  onMount(() => {
    context = canvas.getContext("2d")
    imageData = context.createImageData(canvas.width, canvas.height)
    worker = new Worker('./src/ui/dev/simplexWorker.js', {type:"module"})
    worker.onmessage = (message)=> {
      context.putImageData(message.data.imageData, 0, 0)
    }
    computeNewImage()
  })
</script>

<details>
  <summary>Simplex Tool</summary>
  <div id="container">
    <div>Seed: <input type="number" bind:value="{seed}"></div>
    <div>Size: {scale}<input type="range" bind:value="{scale}" min="0" max="100" step="5"></div>
    <!-- <div>Size<input type="range" bind:value="{size}" min="2" max="2048" step="{(e)=> {console.log(e);return `100`}}"></div> -->
    <div>Octaves: {octaves}<input type="range" bind:value="{octaves}" min="1" max="10" step="1"></div>
    <div>Persistence {persistence}<input type="range" bind:value="{persistence}" min="0" max="1" step="0.1"></div>
    <div>Lacunarity {lacunarity}<input type="range" bind:value="{lacunarity}" min="1" max="10" step="1"></div>
    <div>Sample Points?<input type="checkbox" bind:checked="{drawPoints}"></div>
    <div>N: <input type="number" bind:value="{numPoints}"></div>
    <canvas bind:this="{canvas}"></canvas>
  </div>
</details>

<style>
  #container {
    position: absolute;
    width: 30%;
  }
  input {
    width:40%;
  }
  canvas {
    width: 100%;
    height: 200px;
  }
</style>
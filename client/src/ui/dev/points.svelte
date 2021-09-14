<script>
  import { onMount } from "svelte";

  let canvas;
  let context;
  let imageData;
  let worker;

  let numPoints = 50
  let width = 100
  let height = 100

  $: if (canvas != undefined) {
    numPoints
    width
    height
    computeNewImage()
  }

  function computeNewImage() {
    canvas.width = width
    canvas.height = height
    imageData = context.getImageData(0,0, width, height)
    worker.postMessage({imageData, args:{
      numPoints,
      width,
      height,
    }})
  }

  onMount(() => {
    context = canvas.getContext("2d")
    imageData = context.createImageData(canvas.width, canvas.height)
    worker = new Worker('./src/ui/dev/pointsWorker.js', {type:"module"})
    worker.onmessage = (message)=> {
      imageData = message.data.imageData
      context.putImageData(message.data.imageData, 0, 0)
    }
    computeNewImage()
  })
</script>

<details>
  <summary>Points Tool</summary>
  <div id="container">
    <div>Number of Points: {numPoints}<input type="range" bind:value="{numPoints}" min="10" max="1000" step="20"></div>
    <div>width: {width}<input type="range" bind:value="{width}" min="10" max="200" step="10"></div>
    <div>height: {height}<input type="range" bind:value="{height}" min="10" max="200" step="10"></div>
    <canvas bind:this="{canvas}" width="{width}" height="{height}"></canvas>
  </div>
</details>

<style>
  #container {
    position: absolute;
    width: 25%;
  }
  input {
    width:40%;
  }
</style>

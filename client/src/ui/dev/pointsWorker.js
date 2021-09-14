let numPoints;

function init(args) {
  numPoints = args.numPoints
}

function computeImageData(imageData) {
  // set it all to white
  for(let y = 0; y < imageData.height; y++) {
    for(let x = 0; x < imageData.width; x++) {
      const dataIndex = (y * imageData.width * 4) + x * 4;

      imageData.data[dataIndex] = 255   // R
      imageData.data[dataIndex+1] = 255 // G
      imageData.data[dataIndex+2] = 255 // B
      imageData.data[dataIndex+3] = 255 // A
    }
	}
  // make some points
  for (let i = 0; i < numPoints; i++) {
    const point = [Math.round(Math.random()*imageData.width), Math.round(Math.random()*imageData.height)]
    const dataIndex = (point[1] * imageData.width * 4) + point[0] * 4;
    imageData.data[dataIndex] = 0   // R
    imageData.data[dataIndex+1] = 0 // G
    imageData.data[dataIndex+2] = 0 // B 
  }

  self.postMessage({imageData})
}

self.onmessage = (message) => {
  const { imageData, args} = message.data
  init(args)
  computeImageData(imageData)
}
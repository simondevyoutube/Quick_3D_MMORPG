import { SimplexNoise } from "../../terrain/simplex.js";

/** @type {SimplexNoise} */
let noise;

let scale = 50
// let size = 256
let octaves = 1
let persistence = 0.5
let lacunarity = 2

function init(args) {
  noise = new SimplexNoise(args.seed)

  scale = args.scale
  octaves = args.octaves
  persistence = args.persistence
  lacunarity = args.lacunarity
}

function computeImageData(imageData) {
  // calculate noise values
  const relativeScale = Math.pow(imageData.width, -scale / 100);
		
  // init the noise function
  for(let y = 0; y < imageData.height; y++) {
    for(let x = 0; x < imageData.width; x++) {
      const dataIndex = (y * imageData.width * 4) + x * 4;

      const scaledX = x * relativeScale;
      const scaledY = y * relativeScale;
      
      let value = 0;
      let amplitude = 1
      let frequency = 1;
      
      for(let o = 0; o < octaves; o++) {
        let octave = noise.noise2D(scaledX * frequency, scaledY * frequency);
        
        octave *= amplitude;
        value += octave;
        
        // update amplitude and frequency
        frequency *= lacunarity;
        amplitude *= persistence;
      }
      
      // lets just do greyscale for the moment
      value = Math.round(((value + 1) / 2) * 255)
      imageData.data[dataIndex] = value   // R
      imageData.data[dataIndex+1] = value // G
      imageData.data[dataIndex+2] = value // B
      imageData.data[dataIndex+3] = 255   // A
    }
	}

  self.postMessage({imageData})
}

self.onmessage = (message) => {
  const { imageData, args} = message.data
  init(args)
  computeImageData(imageData)
}
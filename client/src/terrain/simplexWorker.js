import { SimplexNoise } from "./simplex.js";
import { ltqnorm } from "./probit.js";

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
  // around 1024 points
  const a = Math.floor(imageData.width * imageData.height / 1024)
  const dh = Math.floor(imageData.height/a)
  const dw = Math.floor(imageData.width/a)
  let count = 0
  const samples = []

  // calculate noise constants
  const G = Math.pow(2, -persistence);
  // small number -> 0.04340935270137419
  const relativeScale = Math.pow(imageData.width, -scale / 100);
		
  // Create greyscale noise
  for(let y = 0; y < imageData.height; y++) {
    for(let x = 0; x < imageData.width; x++) {
      const dataIndex = (y * imageData.width * 4) + x * 4;

      const sX = x * relativeScale;
      const sY = y * relativeScale;
      
      let total = 0;
      let amplitude = 1
      let frequency = 1;
      let normalization = 0
      
      for(let i = 0; i < octaves; i++) {
        // Restrict the octave between [0, 1]
        const octave = (noise.noise2D(sX * frequency, sY * frequency) + 1) / 2;

        total += octave * amplitude;
        normalization += amplitude;
        amplitude *= G;
        frequency *= lacunarity;
      }

      total /= normalization
      
      const colour = Math.round(total * 255)
      imageData.data[dataIndex] = colour   // R
      imageData.data[dataIndex+1] = colour // G
      imageData.data[dataIndex+2] = colour // B
      imageData.data[dataIndex+3] = 255    // A

      if (y % dh == 0 && x % dw == 0) {
        count += 1
        // use the value to color another pixel red
        samples.push(total)
        // colour to sample point green
        // imageData.data[dataIndex] = 0     // R
        // imageData.data[dataIndex+1] = 255 // G
        // imageData.data[dataIndex+2] = 0   // B

      }
    }
	}
  // transform the samples to lie within (0, 1)
  const min = samples.reduce((pv, cv) => pv < cv ? pv : cv, Number.POSITIVE_INFINITY)
  const max = samples.reduce((pv, cv) => pv > cv ? pv : cv, Number.NEGATIVE_INFINITY)

  // console.log({min, max, samples});
  // console.log(max-min);

  for (let i = 0; i < samples.length; i++) {
    samples[i] = (samples[i]-min)/(max-min);

    // its only a small amount of numbers from a normal
    // distribution that make it out to these values
    // but we do need to clamp inside of (0, 1)
    // for the ltqnorm function
    if (samples[i] == 0) {
      samples[i] += Number.EPSILON
    }
    if (samples[i] == 1) {
      samples[i] -= Number.EPSILON
    }
  }

  // min = samples.reduce((pv, cv) => pv < cv ? pv : cv, Number.POSITIVE_INFINITY)
  // max = samples.reduce((pv, cv) => pv > cv ? pv : cv, Number.NEGATIVE_INFINITY)
  
  // console.log({min, max, samples});
  // console.log(max-min);

  for (let i = 0; i < samples.length; i+= 2) {
    const x = Math.floor(ltqnorm(samples[i]) * imageData.width)
    const y = Math.floor(ltqnorm(samples[i+1]) * imageData.height)

    const dataIndex = (y * imageData.width * 4) + x * 4;
    // set colour to red for the moment
    imageData.data[dataIndex] = 255 // R
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
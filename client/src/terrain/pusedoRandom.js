import { ltqnorm } from "./probit.js";
import { SimplexNoise } from "./simplex.js";
import { AdaptedPoissonDiscSample } from "./poissonDisc.js";
import { terrainConstants } from "../data/terrain/constants.js";

let index = -1
const numbers = []

// The noise function is used to populate the numbers array
const noise = new SimplexNoise(terrainConstants.NOISE_PARAMS.seed)

// Lets make around 1024 numbers
const amount = 1024
const width = 200
const height = 200
const size = 85
const octaves = 4
const lacunarity = 2

const a = Math.floor((width * height) / amount)
const dh = Math.floor(height/a)
const dw = Math.floor(width/a)
const relativeScale = Math.pow(width, -size / 100);
  
// get samples from the noise
for(let y = 0; y < height; y+= dh) {
  for(let x = 0; x < width; x+= dw) {
    const sX = x * relativeScale;
    const sY = y * relativeScale;
    
    let total = 0;
    let frequency = 1;
    let normalization = 0
    
    for(let i = 0; i < octaves; i++) {
      // Restrict the octave between [0, 1]
      const octave = (noise.noise2D(sX * frequency, sY * frequency) + 1) / 2;
      total += octave;
      normalization += 1;
      frequency *= lacunarity;
    }

    total /= normalization
    
    numbers.push(total)
  }
}

for (let i = 0; i < numbers.length; i++) {
  // TODO-DefinitelyMaybe: somehow we're not bumping into any 0's or 1's.
  // if you do in future, simply normalize the numbers before the ltqnorm()
  // throw them through the ltqnorm
  numbers[i] = ltqnorm(numbers[i])
}

// transform the samples to lie within (0, 1)
const min = numbers.reduce((pv, cv) => pv < cv ? pv : cv, Number.POSITIVE_INFINITY)
const max = numbers.reduce((pv, cv) => pv > cv ? pv : cv, Number.NEGATIVE_INFINITY)

for (let i = 0; i < numbers.length; i++) {
  numbers[i] = (numbers[i]-min)/(max-min);
  // its only a small amount of numbers from a normal
  // distribution that make it out to these values
  // but we do need to clamp them inside of (0, 1)
  // for the ltqnorm function
  if (numbers[i] == 0) {
    numbers[i] += Number.EPSILON
  }
  if (numbers[i] == 1) {
    numbers[i] -= Number.EPSILON
  }
}

/** 
 * @param {boolean?} reset reset the index variable
 * 
 * ```javascript
 * // always call the reset function before use
 * PusedoRandom(true)
 * // otherwise results may vary
 * function foo(PusedoRandom){}
 * ```
 */
export function PusedoRandom(reset = false) {
  index += 1
  if (reset) {
    index = -1
    return
  }
  if (index == numbers.length -1) {
    index = -1
    return numbers[numbers.length -1]
  }
  return numbers[index]
}

// lets go min and build up?
export const terrainSize = terrainConstants.QT_MIN_CELL_SIZE * Math.pow(2, 2)
const radius = 50
const disc = new AdaptedPoissonDiscSample(radius, [terrainSize, terrainSize], 20, PusedoRandom)
PusedoRandom(true)
const sample = disc.GeneratePoints()
// make the points tile nicer
export const points = sample.map((val) => {
  return [(val[0] + terrainSize/2) % terrainSize, (val[1] + terrainSize/2) % terrainSize]
})
import { SimplexNoise } from '../../terrain/simplex.js';
import { PusedoRandom } from '../../terrain/pusedoRandom.js';
import { AdaptedPoissonDiscSample } from '../../terrain/poissonDisc.js';

/** @type {SimplexNoise} */
let noise;

let scale;
let octaves;
let persistence;
let lacunarity;

let drawPoints;
let deterministic;

function init(args) {
	noise = new SimplexNoise(args.seed);

	scale = args.scale;
	octaves = args.octaves;
	persistence = args.persistence;
	lacunarity = args.lacunarity;

	drawPoints = args.drawPoints;
	deterministic = args.deterministic;
}

function computeImageData(imageData) {
	// calculate noise constants
	const G = Math.pow(2, -persistence);
	const relativeScale = Math.pow(imageData.width, -scale / 100);

	// Create greyscale noise
	for (let y = 0; y < imageData.height; y++) {
		for (let x = 0; x < imageData.width; x++) {
			const dataIndex = y * imageData.width * 4 + x * 4;

			const sX = x * relativeScale;
			const sY = y * relativeScale;

			let total = 0;
			let amplitude = 1;
			let frequency = 1;
			let normalization = 0;

			for (let i = 0; i < octaves; i++) {
				// Restrict the octave between [0, 1]
				const octave = (noise.noise2D(sX * frequency, sY * frequency) + 1) / 2;

				total += octave * amplitude;
				normalization += amplitude;
				amplitude *= G;
				frequency *= lacunarity;
			}

			total /= normalization;

			const colour = Math.round(total * 255);
			imageData.data[dataIndex] = colour; // R
			imageData.data[dataIndex + 1] = colour; // G
			imageData.data[dataIndex + 2] = colour; // B
			imageData.data[dataIndex + 3] = 255; // A
		}
	}

	if (drawPoints) {
		const rand = deterministic ? PusedoRandom : Math.random;
		// create points
		PusedoRandom(true);
		let disc = new AdaptedPoissonDiscSample(10, [imageData.width, imageData.height], 30, rand);
		// let disc = new AdaptedPoissonDiscSample(10, [imageData.width, imageData.height], 30, Math.random)
		let points = disc.GeneratePoints();

		// create red pixels
		for (let i = 0; i < points.length; i++) {
			const x = Math.floor(points[i][0]);
			const y = Math.floor(points[i][1]);

			const dataIndex = y * imageData.width * 4 + x * 4;
			// set colour to red for the moment
			imageData.data[dataIndex] = 255; // R
			imageData.data[dataIndex + 1] = 0; // G
			imageData.data[dataIndex + 2] = 0; // B
		}

		// create points
		PusedoRandom(true);
		disc = new AdaptedPoissonDiscSample(10, [imageData.width, imageData.height], 30, rand);
		points = disc.GeneratePoints();

		// create green pixels
		for (let i = 0; i < points.length; i++) {
			const x = Math.floor(points[i][0]);
			const y = Math.floor(points[i][1]);

			const dataIndex = y * imageData.width * 4 + x * 4;
			// set colour to red for the moment
			imageData.data[dataIndex] = 0; // R
			imageData.data[dataIndex + 1] = 255; // G
			imageData.data[dataIndex + 2] = 0; // B
		}
	}

	self.postMessage({ imageData });
}

self.onmessage = (message) => {
	const { imageData, args } = message.data;
	init(args);
	computeImageData(imageData);
};

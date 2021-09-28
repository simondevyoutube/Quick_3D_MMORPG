import { THREE } from "../deps.js";
import { TextureSplatter } from "./texturesplatter.js";
import { Noise } from "./noise.js";
import { terrainConstants, biomeConstants, colourConstants } from "../data/terrain/constants.js"
import { points, terrainSize } from "./pusedoRandom.js";


const size = terrainSize
let widthArg;
let resolutionArg;
let offsetArg;

const heightGenerator = new Noise(terrainConstants.NOISE_PARAMS);
const biomeGenerator = new Noise(biomeConstants);
const colourNoise = new Noise(colourConstants);
const colourGenerator = new TextureSplatter({ biomeGenerator, colourNoise });

function init(args) {
  widthArg = args.width
  resolutionArg = args.resolution
  offsetArg = new THREE.Vector3(
    args.offset[0],
    args.offset[1],
    args.offset[2],
  );
}

function rebuild() {
  // TODO-DefinitelyMaybe: rename these appropriately
  const _D = new THREE.Vector3();
  const _D1 = new THREE.Vector3();
  const _D2 = new THREE.Vector3();
  const _P = new THREE.Vector3();
  const _H = new THREE.Vector3();
  const _W = new THREE.Vector3();
  const _S = new THREE.Vector3();
  const _C = new THREE.Vector3();

  // normals right? ... right?
  const _N = new THREE.Vector3();
  const _N1 = new THREE.Vector3();
  const _N2 = new THREE.Vector3();
  const _N3 = new THREE.Vector3();

  const positions = [];
  const colors = [];
  const up = [];
  const coords = [];
  const uvs = [];
  const weights1 = [];
  const weights2 = [];
  const indices = [];
  const wsPositions = [];

  const resolution = resolutionArg + 2;
  const offset = offsetArg;
  const width = widthArg;
  const half = width / 2;

  const effectiveResolution = resolution - 2;
  for (let x = -1; x <= effectiveResolution + 1; x++) {
    const xp = width * sat(x / effectiveResolution);

    for (let y = -1; y <= effectiveResolution + 1; y++) {
      const yp = width * sat(y / effectiveResolution);

      // Compute position
      _P.set(xp - half, 0.0, yp - half);
      _P.add(offset);

      _D.set(0, 1, 0);

      // Keep the absolute world space position to sample noise
      _W.copy(_P);

      // Purturb height along z-vector
      const height = heightGenerator.get(_W.x, _W.z);
      _H.copy(_D);
      _H.multiplyScalar(height);
      _P.add(_H);

      positions.push(_P.x, _P.y, _P.z);

      _C.copy(_W);
      _C.add(_H);
      coords.push(_C.x, _C.y, _C.z);

      _S.set(_W.x, _W.y, height);

      const color = colourGenerator.GetColour(_S);
      colors.push(color.r, color.g, color.b);
      
      up.push(_D.x, _D.y, _D.z);
      wsPositions.push(_W.x, _W.z, height);
      uvs.push(_P.x / 200.0, _P.y / 200.0);
    }
  }

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      indices.push(
        i * (resolution + 1) + j,
        (i + 1) * (resolution + 1) + j + 1,
        i * (resolution + 1) + j + 1,
      );
      indices.push(
        (i + 1) * (resolution + 1) + j,
        (i + 1) * (resolution + 1) + j + 1,
        i * (resolution + 1) + j,
      );
    }
  }

  const normals = new Array(up.length).fill(0.0);

  for (let i = 0, n = indices.length; i < n; i += 3) {
    const i1 = indices[i] * 3;
    const i2 = indices[i + 1] * 3;
    const i3 = indices[i + 2] * 3;

    _N1.fromArray(positions, i1);
    _N2.fromArray(positions, i2);
    _N3.fromArray(positions, i3);

    _D1.subVectors(_N3, _N2);
    _D2.subVectors(_N1, _N2);
    _D1.cross(_D2);

    normals[i1] += _D1.x;
    normals[i2] += _D1.x;
    normals[i3] += _D1.x;

    normals[i1 + 1] += _D1.y;
    normals[i2 + 1] += _D1.y;
    normals[i3 + 1] += _D1.y;

    normals[i1 + 2] += _D1.z;
    normals[i2 + 2] += _D1.z;
    normals[i3 + 2] += _D1.z;
  }

  // Fix the skirt
  const _ApplyFix = (x, y, xp, yp) => {
    const skirtIndex = x * (resolution + 1) + y;
    const proxyIndex = xp * (resolution + 1) + yp;
    positions[skirtIndex * 3 + 1] -= 10;

    // Normal will be fucked, copy it from proxy point
    normals[skirtIndex * 3 + 0] = normals[proxyIndex * 3 + 0];
    normals[skirtIndex * 3 + 1] = normals[proxyIndex * 3 + 1];
    normals[skirtIndex * 3 + 2] = normals[proxyIndex * 3 + 2];
  };

  for (let y = 0; y <= resolution; ++y) {
    _ApplyFix(0, y, 1, y);
  }
  for (let y = 0; y <= resolution; ++y) {
    _ApplyFix(resolution, y, resolution - 1, y);
  }
  for (let x = 0; x <= resolution; ++x) {
    _ApplyFix(x, 0, x, 1);
  }
  for (let x = 0; x <= resolution; ++x) {
    _ApplyFix(x, resolution, x, resolution - 1);
  }

  for (let i = 0, n = normals.length; i < n; i += 3) {
    _N.fromArray(normals, i);
    _N.normalize();
    normals[i] = _N.x;
    normals[i + 1] = _N.y;
    normals[i + 2] = _N.z;
  }

  for (let i = 0, n = indices.length; i < n; i += 3) {
    const splats = [];
    const i1 = indices[i] * 3;
    const i2 = indices[i + 1] * 3;
    const i3 = indices[i + 2] * 3;
    const indexes = [i1, i2, i3];
    for (let j = 0; j < 3; j++) {
      const j1 = indexes[j];
      _P.fromArray(wsPositions, j1);
      _N.fromArray(normals, j1);
      _D.fromArray(up, j1);
      const s = colourGenerator.GetSplat(_P, _N, _D);
      splats.push(s);
    }

    const splatStrengths = {};
    for (const k in splats[0]) {
      splatStrengths[k] = { key: k, strength: 0.0 };
    }
    for (const curSplat of splats) {
      for (const k in curSplat) {
        splatStrengths[k].strength += curSplat[k].strength;
      }
    }

    const typeValues = Object.values(splatStrengths);
    typeValues.sort((a, b) => {
      if (a.strength < b.strength) {
        return 1;
      }
      if (a.strength > b.strength) {
        return -1;
      }
      return 0;
    });

    for (let s = 0; s < 3; s++) {
      const total = (
        splats[s][typeValues[0].key].strength +
        splats[s][typeValues[1].key].strength +
        splats[s][typeValues[2].key].strength +
        splats[s][typeValues[3].key].strength
      );
      const normalization = 1.0 / total;

      splats[s][typeValues[0].key].strength *= normalization;
      splats[s][typeValues[1].key].strength *= normalization;
      splats[s][typeValues[2].key].strength *= normalization;
      splats[s][typeValues[3].key].strength *= normalization;
    }

    weights1.push(splats[0][typeValues[3].key].index);
    weights1.push(splats[0][typeValues[2].key].index);
    weights1.push(splats[0][typeValues[1].key].index);
    weights1.push(splats[0][typeValues[0].key].index);

    weights1.push(splats[1][typeValues[3].key].index);
    weights1.push(splats[1][typeValues[2].key].index);
    weights1.push(splats[1][typeValues[1].key].index);
    weights1.push(splats[1][typeValues[0].key].index);

    weights1.push(splats[2][typeValues[3].key].index);
    weights1.push(splats[2][typeValues[2].key].index);
    weights1.push(splats[2][typeValues[1].key].index);
    weights1.push(splats[2][typeValues[0].key].index);

    weights2.push(splats[0][typeValues[3].key].strength);
    weights2.push(splats[0][typeValues[2].key].strength);
    weights2.push(splats[0][typeValues[1].key].strength);
    weights2.push(splats[0][typeValues[0].key].strength);

    weights2.push(splats[1][typeValues[3].key].strength);
    weights2.push(splats[1][typeValues[2].key].strength);
    weights2.push(splats[1][typeValues[1].key].strength);
    weights2.push(splats[1][typeValues[0].key].strength);

    weights2.push(splats[2][typeValues[3].key].strength);
    weights2.push(splats[2][typeValues[2].key].strength);
    weights2.push(splats[2][typeValues[1].key].strength);
    weights2.push(splats[2][typeValues[0].key].strength);
  }

  function _Unindex(src, stride) {
    const dst = [];
    for (let i = 0, n = indices.length; i < n; i += 3) {
      const i1 = indices[i] * stride;
      const i2 = indices[i + 1] * stride;
      const i3 = indices[i + 2] * stride;

      for (let j = 0; j < stride; j++) {
        dst.push(src[i1 + j]);
      }
      for (let j = 0; j < stride; j++) {
        dst.push(src[i2 + j]);
      }
      for (let j = 0; j < stride; j++) {
        dst.push(src[i3 + j]);
      }
    }
    return dst;
  }

  const uiPositions = _Unindex(positions, 3);
  const uiColours = _Unindex(colors, 3);
  const uiNormals = _Unindex(normals, 3);
  const uiCoords = _Unindex(coords, 3);
  const uiUVs = _Unindex(uvs, 2);
  const uiWeights1 = weights1;
  const uiWeights2 = weights2;

  const bytesInFloat32 = 4;
  // TODO-DefinitelyMaybe: new ArrayBuffer(); use to be -> new SharedArrayBuffer();
  const positionsArray = new Float32Array(
    new ArrayBuffer(bytesInFloat32 * uiPositions.length),
  );
  const coloursArray = new Float32Array(
    new ArrayBuffer(bytesInFloat32 * uiColours.length),
  );
  const normalsArray = new Float32Array(
    new ArrayBuffer(bytesInFloat32 * uiNormals.length),
  );
  const coordsArray = new Float32Array(
    new ArrayBuffer(bytesInFloat32 * uiCoords.length),
  );
  const uvsArray = new Float32Array(
    new ArrayBuffer(bytesInFloat32 * uiUVs.length),
  );
  const weights1Array = new Float32Array(
    new ArrayBuffer(bytesInFloat32 * uiWeights2.length),
  );
  const weights2Array = new Float32Array(
    new ArrayBuffer(bytesInFloat32 * uiWeights2.length),
  );

  positionsArray.set(uiPositions, 0);
  coloursArray.set(uiColours, 0);
  normalsArray.set(uiNormals, 0);
  uvsArray.set(uiUVs, 0);
  coordsArray.set(uiCoords, 0);
  weights1Array.set(uiWeights1, 0);
  weights2Array.set(uiWeights2, 0);

  const scenery = getPoints(offset, width)
  
  if (width == 1024) {
    // console.log({offset, width, size, numPoints:scenery.length}); 
  }

  return {
    positions: positionsArray,
    colours: coloursArray,
    uvs: uvsArray,
    normals: normalsArray,
    coords: coordsArray,
    weights1: weights1Array,
    weights2: weights2Array,
    scenery
  };
}

/** 
 * @param {THREE.Vector3} offset
 * @param {number} width
 * @returns {number[][]} some points
 */
function getPoints(offset, width) {
  let newPoints = []
  const chunkOffset = new THREE.Vector3().copy(offset)
  // the quads are centered by their center not a corner.
  chunkOffset.setX(Math.abs((chunkOffset.x % size)) - (width/2))
  chunkOffset.setZ(Math.abs((chunkOffset.z % size)) - (width/2))
  const corner = new THREE.Vector3().copy(chunkOffset)
  corner.addScalar(width)
  corner.setY(0)

  // are we dealing with a small subsection
  if (width < size) {
    // filter the points
    newPoints = points.filter(val => {
      const x = val[0]
      const z = val[1]
      if (chunkOffset.x <= x && chunkOffset.z <= z && x <= corner.x && z <= corner.z) {
        return true
      }
      return false
    }).map(val => {
      // if we were a multiple of a bigger square, which one is it?
      const square = [Math.floor(offset.x / size),Math.floor(offset.z / size)]
      return [val[0]+(square[0]*size), val[1]+(square[1]*size)]
    })
  }

  // one thats the same width as size
  if (width == size) {
    newPoints = points.map(val => {
      return [val[0]+offset.x-(width/2), val[1] + offset.z - (width/2)]
    })
  }

  // or one thats bigger
  if (width > size) {
    console.error("Big sized chunks -> Not Yet Implemented");
  }

  // With the generated points
  if (points.length > 0) {
    // calculate the height point as well
    newPoints = newPoints.map(val => {
      const height = heightGenerator.get(val[0], val[1]);
      return [val[0], height, val[1]]
    })
  }

  return newPoints
}


/** 
 * @returns {number} The original number if it was between (0, 1) otherwise returns the closer of the two [0 or 1]
 */
function sat(x) {
  return Math.min(Math.max(x, 0.0), 1.0);
}

self.onmessage = (msg) => {
  if (msg.data.event == "build") {
    init(msg.data.params);

    const rebuiltData = rebuild();

    self.postMessage({ event: "result", data: rebuiltData });
  }
};

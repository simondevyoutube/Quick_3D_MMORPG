import { Vec3 } from "../deps.js";
import { Noise } from "./noise.js";
import { terrainConstants } from "../../../client/src/data/terrain/constants.js"

let widthArg;
let resolutionArg;
let offsetArg;

const heightGenerator = new Noise(terrainConstants.NOISE_PARAMS);

function init(args) {
  widthArg = args.width
  resolutionArg = args.resolution
  offsetArg = new Vec3(
    args.offset[0],
    args.offset[1],
    args.offset[2],
  );
}

function rebuild() {
  const _D = new Vec3();
  const _P = new Vec3();
  const _H = new Vec3();
  const _W = new Vec3();

  const positions = [];
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
      const height = heightGenerator.Get(_W.x, _W.y, _W.z);
      _H.copy(_D);
      _H.multiplyScalar(height);
      _P.add(_H);

      positions.push(_P.x, _P.y, _P.z);
      wsPositions.push(_W.x, _W.z, height);
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

  const bytesInFloat32 = 4;
  // TODO-DefinitelyMaybe: new ArrayBuffer(); use to be -> new SharedArrayBuffer();
  const positionsArray = new Float32Array(
    new ArrayBuffer(bytesInFloat32 * uiPositions.length),
  );

  positionsArray.set(uiPositions, 0);

  return {
    positions: positionsArray,
  };
}

function sat(x) {
  return Math.min(Math.max(x, 0.0), 1.0);
}

self.onmessage = (msg) => {
  if (msg.data.subject == "build_chunk") {
    init(msg.data.params);

    const rebuiltData = rebuild();

    self.postMessage({ subject: "build_chunk_result", data: rebuiltData });
  }
};

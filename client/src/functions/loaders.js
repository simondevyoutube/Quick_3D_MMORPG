import { GLTFLoader, FBXLoader, THREE, OBJLoader } from "../deps.js";

export function getExtFor(url) {
  const split = url.split(".")
  return split[split.length-1]
}

export function getLoaderFor(ext) {
  switch (ext) {
    case "png":
      return new THREE.TextureLoader();
    case "jpg":
      return new THREE.TextureLoader();
    case "obj":
      return new OBJLoader();
    case "fbx":
      return new FBXLoader();
    case "gltf":
      return new GLTFLoader();
    case "glb":
      return new GLTFLoader();
    default:
      throw `Unknown loader for ext: ${ext}`;
  }
}
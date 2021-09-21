import { GLTFLoader, FBXLoader, THREE, OBJLoader } from "../deps.js";

const assets = {}
const pending = {}

export async function load(url){
  if (url in pending) {
    return await assets[url]
  } else {
    if (!(url in assets)) {
      const ext = getExtFor(url)
      const loader = getLoaderFor(ext)
      try {
        pending[url] = true
        assets[url] = loader.loadAsync(url)
        await assets[url]
        delete pending[url]
      } catch (err) {
        throw err;
      } 
    }
  }
  return assets[url]
}

function getExtFor(url) {
  const split = url.split(".")
  return split[split.length-1]
}

function getLoaderFor(ext) {
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
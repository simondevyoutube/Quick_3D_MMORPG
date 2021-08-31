import { GLTFLoader } from "./gltf.js";
import { FBXLoader } from "./fbx.js";
import { TextureLoader } from "./Texture.js";
import { OBJLoader } from "./obj.js";

export function getLoaderFor(ext) {
  switch (ext) {
    case "png":
      return new TextureLoader();
    case "jpg":
      return new TextureLoader();
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
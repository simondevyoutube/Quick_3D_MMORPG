import { THREE } from "../../../deps.js";

export const birch1 = {
  name: "Birch",
  url: "./resources/trees/FBX/Birch_1.fbx",
  textures: {
    Birch_Bark: "./resources/trees/Textures/Birch_Bark.png",
    Birch_Leaves: "./resources/trees/Textures/Birch_Leaves_Green.png",
  },
  textureData: {
    Birch_Leaves: {
      // TODO-DefinitelyMaybe: get these working again
      // wrapS: THREE.RepeatWrapping,
      // wrapT: THREE.RepeatWrapping,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    }
  },
  children: {
    Birch_1: {
      scale: 7.5,
    }
  },
}
import { THREE } from "../../../deps.js";

export const tree1 = {
  name: "Tree",
  url: "./resources/trees/FBX/Tree_1.fbx",
  textures: {
    Bark: "./resources/trees/Textures/Tree_Bark.jpg",
    Tree_Leaves: "./resources/trees/Textures/Tree_Leaves.png",
  },
  textureData: {
    Tree_Leaves: {
      // TODO-DefinitelyMaybe: get these working again
      // emissive: new THREE.Color(0x000000),
      // specular: new THREE.Color(0x000000),
      // castShadow: true,
      // receiveShadow: true,
      // encoding: THREE.sRGBEncoding,
      // wrapS: THREE.RepeatWrapping,
      // wrapT: THREE.RepeatWrapping,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    }
  },
  children: {
    Tree_1: {
      scale: 8,
      rotate: [0.707, 0, 0, -0.707]
    }
  },
  physics: {},
}
const NOISE_HEIGHT = 800.0;
const NOISE_SCALE = 1800.0;

export const terrainConstants = {
  QT_MIN_CELL_SIZE: 256,
  QT_MIN_CELL_RESOLUTION: 16,

  PLANET_RADIUS: 2048,

  NOISE_HEIGHT,
  NOISE_SCALE,

  NOISE_PARAMS: {
    octaves: 10,
    persistence: 0.5,
    lacunarity: 1.6,
    exponentiation: 7.5,
    height: NOISE_HEIGHT,
    scale: NOISE_SCALE,
    seed: 2,
  },
};

export const biomeConstants = {
  octaves: 2,
  persistence: 0.5,
  lacunarity: 2.0,
  scale: 1024.0,
  noiseType: "simplex",
  seed: 2,
  exponentiation: 2,
  height: 1.0,
};

export const colourConstants = {
  octaves: 1,
  persistence: 0.5,
  lacunarity: 2.0,
  exponentiation: 1.0,
  scale: 256.0,
  noiseType: "simplex",
  seed: 2,
  height: 1.0,
};

export const scenery = {
  trees: [
    {
      name: "birch1",
      url: './resources/trees/FBX/Birch_1.fbx',
      textures: {
        Bark: './resources/trees/Textures/Birch_Bark.png',
        Leaves: './resources/trees/Textures/Birch_Leaves_Yellow.png'
      },
      scale: 0.075,
      physics: {}
    },
    {
      name: 'tree1',
      url: './resources/trees/FBX/Tree_1.fbx',
      textures: {
        Bark: './resources/trees/Textures/Tree_Bark.jpg',
        Leaves: './resources/trees/Textures/Tree_Leaves.png'
      },
      scale: 0.1,
      physics: {}
    },
  ],
  rocks: [
    {
      name: 'rock1',
      url: './resources/nature/FBX/Rock_1.fbx',
      scale: 0.025,
    },
    {
      url: './resources/nature/FBX/Rock_Moss_1.fbx',
      name: 'rockmoss1',
      scale: 0.025,
    },
  ],
  plants:[
    {
      name: 'plant1',
      url: './resources/nature/FBX/Plant_1.fbx',
      scale: 0.05,
    },
    {
      url: './resources/nature/FBX/Grass_1.fbx',
      names: 'grass1',
      scale: 0.05,
    },
    {
      url: './resources/nature/FBX/Flowers.fbx',
      names: 'flowers1',
      scale: 0.05,
    },
  ],
};
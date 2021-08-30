import { THREE } from "../deps.js";

import { CubeQuadTree } from "../structures/quadtree.js";

import { DictDifference, DictIntersection } from "../functions/utils/objects.js"

import { terrain_constants, biome_constants } from "../data/constants.js";
import { Noise } from "../functions/noise.js";
import { TextureSplatter } from "../functions/terrain/texturesplatter.js";
import { TextureAtlas } from "../functions/terrain/textures.js";
import { PS1, PS2, VS1, VS2 } from "../functions/terrain/shaders.js";
import { TerrainChunkRebuilder_Threaded } from "../functions/terrain/terrainbuilderthreaded.js";

export class Terrain {
  chunks = {};
  loader = new THREE.TextureLoader();
  material = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    vertexColors: true,
  });

  builder = new TerrainChunkRebuilder_Threaded();
  heightGenerator = new Noise(terrain_constants.NOISE_PARAMS);
  biomes = new Noise(biome_constants);
  groups = [...new Array(6)].map((_) => new THREE.Group());

  colourVars = {
    octaves: 1,
    persistence: 0.5,
    lacunarity: 2.0,
    exponentiation: 1.0,
    scale: 256.0,
    noiseType: "simplex",
    seed: 2,
    height: 1.0,
  };
  colourNoise = new Noise(this.colourVars);

  constructor(world) {
    this.world = world

    const noiseTexture = this.loader.load(
      "./resources/terrain/simplex-noise.png",
    );
    noiseTexture.wrapS = THREE.RepeatWrapping;
    noiseTexture.wrapT = THREE.RepeatWrapping;

    const cap = this.world.renderer.capabilities

    const diffuse = new TextureAtlas(cap);
    diffuse.Load("diffuse", [
      "./resources/terrain/dirt_01_diffuse-1024.png",
      "./resources/terrain/grass1-albedo3-1024.png",
      "./resources/terrain/sandyground-albedo-1024.png",
      "./resources/terrain/worn-bumpy-rock-albedo-1024.png",
      "./resources/terrain/rock-snow-ice-albedo-1024.png",
      "./resources/terrain/snow-packed-albedo-1024.png",
      "./resources/terrain/rough-wet-cobble-albedo-1024.png",
      // './resources/terrain/sandy-rocks1-albedo-1024.png',
      "./resources/terrain/bark1-albedo.jpg",
    ]);

    const normal = new TextureAtlas(cap);
    normal.Load("normal", [
      "./resources/terrain/dirt_01_normal-1024.jpg",
      "./resources/terrain/grass1-normal-1024.jpg",
      "./resources/terrain/sandyground-normal-1024.jpg",
      "./resources/terrain/worn-bumpy-rock-normal-1024.jpg",
      "./resources/terrain/rock-snow-ice-normal-1024.jpg",
      "./resources/terrain/snow-packed-normal-1024.jpg",
      "./resources/terrain/rough-wet-cobble-normal-1024.jpg",
      // './resources/terrain/sandy-rocks1-normal-1024.jpg',
      "./resources/terrain/bark1-normal3.jpg",
    ]);

    this.material.onBeforeCompile = (s) => {
      let vsh = s.vertexShader;
      vsh = VS1 + s.vertexShader;
      const vi1 = vsh.search("#include <fog_vertex>");
      vsh = [vsh.slice(0, vi1) + VS2 + vsh.slice(vi1)].join(
        "",
      );
      s.vertexShader = vsh;

      s.fragmentShader = PS1 + s.fragmentShader;
      const fi1 = s.fragmentShader.search(
        "#include <lights_physical_fragment>",
      );
      s.fragmentShader = [
        s.fragmentShader.slice(0, fi1) + PS2 +
        s.fragmentShader.slice(fi1),
      ].join("");

      s.uniforms.TRIPLANAR_normalMap = { value: normal.Info["normal"].atlas };
      s.uniforms.TRIPLANAR_diffuseMap = {
        value: diffuse.Info["diffuse"].atlas,
      };
      s.uniforms.TRIPLANAR_noiseMap = { value: noiseTexture };

      diffuse.onLoad = () => {
        s.uniforms.TRIPLANAR_diffuseMap.value = diffuse.Info["diffuse"].atlas;
      };
      normal.onLoad = () => {
        s.uniforms.TRIPLANAR_normalMap.value = normal.Info["normal"].atlas;
      };

      // s.fragmentShader += 'poop';
    };

    this.world.scene.add(...this.groups);
  }

  createTerrainChunk(group, groupTransform, offset, width, resolution) {
    const params = {
      group: group,
      transform: groupTransform,
      material: this.material,
      width: width,
      offset: offset,
      radius: terrain_constants.PLANET_RADIUS,
      resolution: resolution,
      biomeGenerator: this.biomes,
      colourGenerator: new TextureSplatter(
        { biomeGenerator: this.biomes, colourNoise: this.colourNoise },
      ),
      heightGenerator: this.heightGenerator,
      noiseParams: terrain_constants.NOISE_PARAMS,
      colourNoiseParams: this.colourVars,
      biomesParams: biome_constants,
      colourGeneratorParams: {
        biomeGeneratorParams: biome_constants,
        colourNoiseParams: this.colourVars,
      },
      heightGeneratorParams: {
        min: 100000,
        max: 100000 + 1,
      },
    };

    return this.builder.allocateChunk(params);
  }

  getHeight(pos) {
    return this.heightGenerator.Get(pos.x, 0.0, pos.z);
  }

  getBiomeAt(pos) {
    return this.biomes.Get(pos.x, 0.0, pos.z);
  }

  update(_) {
    // TODO-DefinitelyMaybe: Maybe this doesn't need to be called so oftened
    // how about simply when close to chunk edges?
    const target = this.world.entities.get("player");
    if (!target) {
      return;
    }

    this.builder.update();
    if (!this.builder.Busy) {
      this.updateVisibleChunks_Quadtree(target);
    }

    for (let k in this.chunks) {
      this.chunks[k].chunk.update(target.position);
    }
    for (let c of this.builder._old) {
      c.chunk.update(target.position);
    }
  }

  updateVisibleChunks_Quadtree(target) {
    function _Key(c) {
      return c.position[0] + "/" + c.position[2] + " [" + c.size + "]";
    }

    const q = new CubeQuadTree({
      radius: terrain_constants.PLANET_RADIUS,
      min_node_size: terrain_constants.QT_MIN_CELL_SIZE,
    });
    q.Insert(target.position);

    const sides = q.GetChildren();

    let newTerrainChunks = {};
    const center = new THREE.Vector3();
    const dimensions = new THREE.Vector3();
    for (let i = 0; i < sides.length; i++) {
      for (let c of sides[i].children) {
        c.bounds.getCenter(center);
        c.bounds.getSize(dimensions);

        const child = {
          index: i,
          group: this.groups[i],
          transform: sides[i].transform,
          position: [center.x, center.y, center.z],
          bounds: c.bounds,
          size: dimensions.x,
        };

        const k = _Key(child);
        newTerrainChunks[k] = child;
      }
    }

    const intersection = DictIntersection(
      this.chunks,
      newTerrainChunks,
    );
    const difference = DictDifference(newTerrainChunks, this.chunks);
    const recycle = Object.values(
      DictDifference(this.chunks, newTerrainChunks),
    );

    this.builder.retireChunks(recycle);

    newTerrainChunks = intersection;

    for (let k in difference) {
      const [xp, yp, zp] = difference[k].position;

      const offset = new THREE.Vector3(xp, yp, zp);
      newTerrainChunks[k] = {
        position: [xp, zp],
        chunk: this.createTerrainChunk(
          difference[k].group,
          difference[k].transform,
          offset,
          difference[k].size,
          terrain_constants.QT_MIN_CELL_RESOLUTION,
        ),
      };
    }

    this.chunks = newTerrainChunks;
  }
}

import { THREE } from "./deps.js";
import { Component } from "./entity.js";
import { CubeQuadTree } from "./quadtree.js";
import { PS1, PS2, VS1, VS2 } from "./terrain-shader.js";
import { _TerrainChunkRebuilder_Threaded } from "./terrain-builder-threaded.js";
import { TextureSplatter } from "./texture-splatter.js";
import { textures } from "./textures.js";
import { utils } from "./utils.js";

import {
  NOISE_PARAMS,
  PLANET_RADIUS,
  QT_MIN_CELL_RESOLUTION,
  QT_MIN_CELL_SIZE,
} from "../shared/terrain-constants.js";
import { HeightGenerator } from "../shared/terrain-height.js";

import { noise } from "../shared/noise.js";

export class TerrainChunkManager extends Component {
  constructor(params) {
    super();
    this._Init(params);
  }

  _Init(params) {
    this._params = params;

    const loader = new THREE.TextureLoader();

    const noiseTexture = loader.load("./resources/terrain/simplex-noise.png");
    noiseTexture.wrapS = THREE.RepeatWrapping;
    noiseTexture.wrapT = THREE.RepeatWrapping;

    const diffuse = new textures.TextureAtlas(params);
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

    const normal = new textures.TextureAtlas(params);
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

    this._material = new THREE.MeshStandardMaterial({
      side: THREE.BackSide,
      vertexColors: true,
    });

    this._material.onBeforeCompile = (s) => {
      let a = 0;
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

    this._builder = new terrain_builder_threaded
      .TerrainChunkRebuilder_Threaded();
    // this._builder = new terrain_builder.TerrainChunkRebuilder();

    this._InitNoise();
    this._InitBiomes(params);
    this._InitTerrain(params);
  }

  _InitNoise() {
    this.heightGenerator_ = new HeightGenerator();
  }

  _InitBiomes(params) {
    params.guiParams.biomes = {
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2.0,
      scale: 1024.0,
      noiseType: "simplex",
      seed: 2,
      exponentiation: 2,
      height: 1.0,
    };

    const onNoiseChanged = () => {
      this._builder.Rebuild(this._chunks);
    };

    const noiseRollup = params.gui.addFolder("Terrain.Biomes");
    noiseRollup.add(params.guiParams.biomes, "scale", 64.0, 4096.0).onChange(
      onNoiseChanged,
    );
    noiseRollup.add(params.guiParams.biomes, "octaves", 1, 20, 1).onChange(
      onNoiseChanged,
    );
    noiseRollup.add(params.guiParams.biomes, "persistence", 0.01, 1.0)
      .onChange(
        onNoiseChanged,
      );
    noiseRollup.add(params.guiParams.biomes, "lacunarity", 0.01, 4.0)
      .onChange(
        onNoiseChanged,
      );
    noiseRollup.add(params.guiParams.biomes, "exponentiation", 0.1, 10.0)
      .onChange(
        onNoiseChanged,
      );

    this._biomes = new NoiseGenerator(params.guiParams.biomes);
    this._biomesParams = params.guiParams.biomes;

    const colourParams = {
      octaves: 1,
      persistence: 0.5,
      lacunarity: 2.0,
      exponentiation: 1.0,
      scale: 256.0,
      noiseType: "simplex",
      seed: 2,
      height: 1.0,
    };
    this._colourNoise = new NoiseGenerator(colourParams);
    this._colourNoiseParams = colourParams;
  }

  _InitTerrain(params) {
    params.guiParams.terrain = {
      wireframe: false,
    };

    this._groups = [...new Array(6)].map((_) => new THREE.Group());
    params.scene.add(...this._groups);

    const terrainRollup = params.gui.addFolder("Terrain");
    terrainRollup.add(params.guiParams.terrain, "wireframe").onChange(() => {
      for (let k in this._chunks) {
        this._chunks[k].chunk._plane.material.wireframe =
          params.guiParams.terrain.wireframe;
      }
    });

    this._chunks = {};
    this._params = params;
  }

  _CreateTerrainChunk(group, groupTransform, offset, width, resolution) {
    const params = {
      group: group,
      transform: groupTransform,
      material: this._material,
      width: width,
      offset: offset,
      // origin: this._params.camera.position.clone(),
      radius: PLANET_RADIUS,
      resolution: resolution,
      biomeGenerator: this._biomes,
      colourGenerator: new TextureSplatter(
        { biomeGenerator: this._biomes, colourNoise: this._colourNoise },
      ),
      heightGenerators: [this.heightGenerator_],
      noiseParams: NOISE_PARAMS,
      colourNoiseParams: this._colourNoiseParams,
      biomesParams: this._biomesParams,
      colourGeneratorParams: {
        biomeGeneratorParams: this._biomesParams,
        colourNoiseParams: this._colourNoiseParams,
      },
      heightGeneratorsParams: {
        min: 100000,
        max: 100000 + 1,
      },
    };

    return this._builder.AllocateChunk(params);
  }

  GetHeight(pos) {
    return this.heightGenerator_.Get(pos.x, 0.0, pos.z);
  }

  GetBiomeAt(pos) {
    return this._biomes.Get(pos.x, 0.0, pos.z);
  }

  Update(_) {
    const target = this.FindEntity(this._params.target);
    if (!target) {
      return;
    }

    this._builder.Update();
    if (!this._builder.Busy) {
      this._UpdateVisibleChunks_Quadtree(target);
    }

    for (let k in this._chunks) {
      this._chunks[k].chunk.Update(target.Position);
    }
    for (let c of this._builder._old) {
      c.chunk.Update(target.Position);
    }

    // this._params.scattering.uniforms.planetRadius.value = PLANET_RADIUS;
    // this._params.scattering.uniforms.atmosphereRadius.value = PLANET_RADIUS * 1.01;
  }

  _UpdateVisibleChunks_Quadtree(target) {
    function _Key(c) {
      return c.position[0] + "/" + c.position[2] + " [" + c.size + "]";
    }

    const q = new CubeQuadTree({
      radius: PLANET_RADIUS,
      min_node_size: QT_MIN_CELL_SIZE,
    });
    q.Insert(target.Position);

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
          group: this._groups[i],
          transform: sides[i].transform,
          position: [center.x, center.y, center.z],
          bounds: c.bounds,
          size: dimensions.x,
        };

        const k = _Key(child);
        newTerrainChunks[k] = child;
      }
    }

    const intersection = utils.DictIntersection(
      this._chunks,
      newTerrainChunks,
    );
    const difference = utils.DictDifference(newTerrainChunks, this._chunks);
    const recycle = Object.values(
      utils.DictDifference(this._chunks, newTerrainChunks),
    );

    this._builder.RetireChunks(recycle);

    newTerrainChunks = intersection;

    for (let k in difference) {
      const [xp, yp, zp] = difference[k].position;

      const offset = new THREE.Vector3(xp, yp, zp);
      newTerrainChunks[k] = {
        position: [xp, zp],
        chunk: this._CreateTerrainChunk(
          difference[k].group,
          difference[k].transform,
          offset,
          difference[k].size,
          QT_MIN_CELL_RESOLUTION,
        ),
      };
    }

    this._chunks = newTerrainChunks;
  }
}

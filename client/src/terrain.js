import { THREE } from "./deps.js";

import { Component } from "./entity.js";
import { CubeQuadTree } from "./quadtree.js";
import { PS1, PS2, VS1, VS2 } from "./terrain-shader.js";
import { TerrainChunkRebuilder_Threaded } from "./terrain-builder-threaded.js";
import { TextureSplatter } from "./texture-splatter.js";
import { TextureAtlas } from "./textures.js";
import { DictDifference, DictIntersection } from "./utils.js";

import { terrain_constants } from "../shared/terrain-constants.js";
import { HeightGenerator } from "../shared/terrain-height.js";

import { Noise } from "../shared/noise.js";

export class TerrainChunkManager extends Component {
  loader = new THREE.TextureLoader();
  _material = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    vertexColors: true,
  });

  _builder = new TerrainChunkRebuilder_Threaded();
  heightGenerator_ = new HeightGenerator();
  _chunks = {};
  noiseVars = {
    octaves: 2,
    persistence: 0.5,
    lacunarity: 2.0,
    scale: 1024.0,
    noiseType: "simplex",
    seed: 2,
    exponentiation: 2,
    height: 1.0,
  };
  _biomes = new Noise(this.noiseVars);
  _groups = [...new Array(6)].map((_) => new THREE.Group());

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
  _colourNoise = new Noise(this.colourVars);

  constructor(params) {
    super();

    const noiseTexture = this.loader.load(
      "./resources/terrain/simplex-noise.png",
    );
    noiseTexture.wrapS = THREE.RepeatWrapping;
    noiseTexture.wrapT = THREE.RepeatWrapping;

    const diffuse = new TextureAtlas(params);
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

    const normal = new TextureAtlas(params);
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

    params.scene.add(...this._groups);
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
      radius: terrain_constants.PLANET_RADIUS,
      resolution: resolution,
      biomeGenerator: this._biomes,
      colourGenerator: new TextureSplatter(
        { biomeGenerator: this._biomes, colourNoise: this._colourNoise },
      ),
      heightGenerators: [this.heightGenerator_],
      noiseParams: terrain_constants.NOISE_PARAMS,
      colourNoiseParams: this.colourVars,
      biomesParams: this.noiseVars,
      colourGeneratorParams: {
        biomeGeneratorParams: this.noiseVars,
        colourNoiseParams: this.colourVars,
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

    // this._params.scattering.uniforms.planetRadius.value = terrain_constants.PLANET_RADIUS;
    // this._params.scattering.uniforms.atmosphereRadius.value = terrain_constants.PLANET_RADIUS * 1.01;
  }

  _UpdateVisibleChunks_Quadtree(target) {
    function _Key(c) {
      return c.position[0] + "/" + c.position[2] + " [" + c.size + "]";
    }

    const q = new CubeQuadTree({
      radius: terrain_constants.PLANET_RADIUS,
      min_node_size: terrain_constants.QT_MIN_CELL_SIZE,
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

    const intersection = DictIntersection(
      this._chunks,
      newTerrainChunks,
    );
    const difference = DictDifference(newTerrainChunks, this._chunks);
    const recycle = Object.values(
      DictDifference(this._chunks, newTerrainChunks),
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
          terrain_constants.QT_MIN_CELL_RESOLUTION,
        ),
      };
    }

    this._chunks = newTerrainChunks;
  }
}

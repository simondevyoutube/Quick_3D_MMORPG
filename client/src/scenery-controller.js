import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {entity} from './entity.js';
import {render_component} from './render-component.js';
import {spatial_grid_controller} from './spatial-grid-controller.js';

import {math} from '../shared/math.mjs';
import {noise} from '../shared/noise.mjs';

export const scenery_controller = (() => {

  const _SCENERY = {
    birch1: {
      base: 'Birch_1.fbx',
      resourcePath: '/client/resources/trees/FBX/',
      names: {
        Bark: 'Birch_Bark.png',
        Leaves: 'Birch_Leaves_Yellow.png'
      },
      scale: 0.075,
      biomes: ['forest','arid'],
      collision: true,
    },
    tree1: {
      base: 'Tree_1.fbx',
      resourcePath: '/client/resources/trees/FBX/',
      names: {
        Bark: 'Tree_Bark.jpg',
        Leaves: 'Leaves_Blue.png'
      },
      scale: 0.1,
      biomes: ['forest','arid'],
      collision: true,
    },
    rock1: {
      base: 'Rock_1.fbx',
      resourcePath: '/client/resources/nature/FBX/',
      names: {},
      scale: 0.25,
      biomes: ['arid', 'desert'],
      collision: true,
    },
    rockMoss1: {
      base: 'Rock_Moss_1.fbx',
      resourcePath: '/client/resources/nature/FBX/',
      names: {},
      scale: 0.25,
      biomes: ['forest'],
      collision: true,
    }
  };

  const _SCENERYSMALL = {
    plant1: {
      base: 'Plant_1.fbx',
      resourcePath: '/client/resources/nature/FBX/',
      names: {},
      scale: 0.05,
      biomes: ['forest', 'arid'],
    },
    grass1: {
      base: 'Grass_1.fbx',
      resourcePath: '/client/resources/nature/FBX/',
      names: {},
      scale: 0.05,
      biomes: ['forest', 'arid'],
    },
    flowers1: {
      base: 'Flowers.fbx',
      resourcePath: '/client/resources/nature/FBX/',
      names: {},
      scale: 0.05,
      biomes: ['forest'],
    },
  };  

  const _BIOMES = {
    desert: 0.2,
    forest: 1.0,
    arid: 0.8,
  };

  const multiples = {
    birch1: {name: 'Birch_', key: 'birch', num: 10},
    tree1: {name: 'Tree_', key: 'tree', num: 10},
    rock1: {name: 'Rock_', key: 'rock', num: 7},
    rockMoss1: {name: 'Rock_Moss_', key: 'rockMoss', num: 7},
  };

  const multiplesSmall = {
    plant1: {name: 'Plant_', key: 'plant', num: 5},
    grass1: {name: 'Grass_', key: 'grass',  num: 2},
    flowers1: {name: 'Flowers', key: 'flowers', num: 1},
  };  

  for (let k in multiples) {
    for (let i = 2; i < multiples[k].num; ++i) {
      _SCENERY[multiples[k].key + i] = {..._SCENERY[k]};
      _SCENERY[multiples[k].key + i].base = multiples[k].name + i + '.fbx';
    }
  }

  for (let k in multiplesSmall) {
    for (let i = 2; i < multiplesSmall[k].num; ++i) {
      _SCENERYSMALL[multiplesSmall[k].key + i] = {..._SCENERYSMALL[k]};
      _SCENERYSMALL[multiplesSmall[k].key + i].base = multiplesSmall[k].name + i + '.fbx';
    }
  }

  class SceneryController extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;

      const noiseParams = {
        octaves: 1.0,
        persistence: 0.5,
        lacunarity: 2.0,
        exponentiation: 1.0,
        scale: 1.0,
        noiseType: 'simplex',
        seed: 2,
        height: 1.0,
      };
      this.noise_ = new noise.Noise(noiseParams);

      this.center_ = null;
      this.vegetation_ = [];
    }

    InitEntity() {
      this.SpawnClouds_();
    }

    SpawnClouds_() {
      
      for (let i = 0; i < 10; ++i) {
        const index = math.rand_int(1, 3);
        const pos = new THREE.Vector3(
            (Math.random() * 2.0 - 1.0) * 5000,
            500,
            (Math.random() * 2.0 - 1.0) * 5000);
  
        const e = new entity.Entity();
        e.AddComponent(new render_component.RenderComponent({
          scene: this.params_.scene,
          resourcePath: '/client/resources/nature2/GLTF/',
          resourceName: 'Cloud' + index + '.glb',
          scale: Math.random() * 20 + 40,
          emissive: new THREE.Color(0x000000),
          color: new THREE.Color(0x202020),
        }));
        e.SetPosition(pos);

        const q = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), math.rand_range(0, 360));
        e.SetQuaternion(q);

        this.Manager.Add(e);
        e.SetActive(false);  
      }
      
    }



    FindBiome_(terrain, pos) {
      const biome = terrain.GetBiomeAt(pos);

      // HACK: duplicaed code from texture-splatter
      const m = biome;
      const h = math.sat(pos.y / 100.0);

      if (h < 0.05) {
        return 'desert';
      } else if (m > 0.5) {
        return 'forest';
      } else {
        return 'arid';
      }
    }

    SpawnAt_(biome, spawnPos) {
      const matchingScenery = [];
      for (let k in _SCENERY) {
        if (_SCENERY[k].biomes.indexOf(biome) >= 0) {
          matchingScenery.push(k);
        }
      }

      const roll = this.noise_.Get(spawnPos.x, 3.0, spawnPos.z);
      const randomProp = _SCENERY[
          matchingScenery[Math.round(roll * (matchingScenery.length - 1))]];

      const e = new entity.Entity();
      e.AddComponent(new render_component.RenderComponent({
        scene: this.params_.scene,
        resourcePath: randomProp.resourcePath,
        resourceName: randomProp.base,
        textures: {
          resourcePath: '/client/resources/trees/Textures/',
          names: randomProp.names,
          wrap: true,
        },
        emissive: new THREE.Color(0x000000),
        specular: new THREE.Color(0x000000),
        scale: randomProp.scale * (0.8 + this.noise_.Get(spawnPos.x, 4.0, spawnPos.z) * 0.4),
        castShadow: true,
        receiveShadow: true,
        onMaterial: (m) => {
          if (m.name.search('Leaves') >= 0) {
            m.alphaTest = 0.5;
          }
        }
      }));
      if (randomProp.collision) {
        e.AddComponent(
          new spatial_grid_controller.SpatialGridController(
              {grid: this.params_.grid}));
      }
      const q = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0), this.noise_.Get(spawnPos.x, 5.0, spawnPos.z) * 360);
      e.SetQuaternion(q);

      return e;      
    }

    SpawnSmallAt_(biome, spawnPos) {

      const matchingScenery = [];
      for (let k in _SCENERYSMALL) {
        if (_SCENERYSMALL[k].biomes.indexOf(biome) >= 0) {
          matchingScenery.push(k);
        }
      }

      const roll = this.noise_.Get(spawnPos.x, 3.0, spawnPos.z);
      const randomProp = _SCENERYSMALL[matchingScenery[Math.round(roll * (matchingScenery.length - 1))]];

      if(matchingScenery.length > 0) {

        const e = new entity.Entity();
        e.AddComponent(new render_component.RenderComponent({
          scene: this.params_.scene,
          resourcePath: randomProp.resourcePath,
          resourceName: randomProp.base,
          //textures: {
          //  resourcePath: '/client/resources/trees/Textures/',
          //  names: randomProp.names,
          //  wrap: true,
          //},
          emissive: new THREE.Color(0x000000),
          specular: new THREE.Color(0x000000),
          scale: randomProp.scale * (0.8 + this.noise_.Get(spawnPos.x, 4.0, spawnPos.z) * 0.4),
          castShadow: false,
          receiveShadow: true,
          onMaterial: (m) => {
            if (m.name.search('Leaves') >= 0) {
              m.alphaTest = 0.5;
            }
          }
        }));

        const q = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), this.noise_.Get(spawnPos.x, 5.0, spawnPos.z) * 360);
        e.SetQuaternion(q);
        return e;
      }
      return null;


    }      

    SpawnVegetation_() {
      const player = this.FindEntity('player');
      if (!player) {
        return;
      }

      const center = new THREE.Vector3().copy(player.Position);

      center.x = Math.round(center.x / 50.0);
      center.y = 0.0;
      center.z = Math.round(center.z / 50.0);

      if (this.center_ && this.center_.equals(center)) {
        return;
      }

      this.center_ = center;

      const _P = new THREE.Vector3();
      const _V = new THREE.Vector3();
      const terrain = this.FindEntity('terrain').GetComponent('TerrainChunkManager');

      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          _P.set(x, 0.0, y);
          _P.add(center);
          _P.multiplyScalar(50.0);

          // already an object here 
          const key = '__scenery__[' + _P.x + '][' + _P.z + ']';
          const obj = this.FindEntity(key);
          if (obj) {
            obj.visible = true;
            this.vegetation_.push(obj);
            continue;
          }

          _V.copy(_P);
          
          _P.x += (this.noise_.Get(_P.x, 0.0, _P.z) * 2.0 - 1.0) * 25.0;
          _P.z += (this.noise_.Get(_P.x, 1.0, _P.z) * 2.0 - 1.0) * 25.0;
          _P.y = terrain.GetHeight(_P)[0];

          const biome = this.FindBiome_(terrain, _P);

          const roll = this.noise_.Get(_V.x, 2.0, _V.z);
          if (roll > _BIOMES[biome]) {            
            continue;
          }

          const e = this.SpawnAt_(biome, _P);

          e.SetPosition(_P);

          this.Manager.Add(e, key);

          e.SetActive(false);
          const veg_position = new THREE.Vector3(e.Position);
          const veg = {
            Name: e.name,
            Position: veg_position,
          }
          this.vegetation_.push(veg);
        }
      }

      // fauna density
      const faunaDensity = 4.0; // smaller = more


      // lots of small stuff
      for (let x = -3; x <= 3; x +=faunaDensity) {
        for (let y = -3; y <= 3; y +=faunaDensity) {
          _P.set(x, 0.0, y);
          _P.add(center);
          _P.multiplyScalar(50.0);

          const key = '__scenery__[' + _P.x + '][' + _P.z + ']';
          const obj = this.FindEntity(key);
          if (obj) {
            obj.visible = true;
            this.vegetation_.push(obj);
            continue;
          }

          _V.copy(_P);
          
          _P.x += (this.noise_.Get(_P.x, 0.0, _P.z) * 2.0 - 1.0) * 25.0;
          _P.z += (this.noise_.Get(_P.x, 1.0, _P.z) * 2.0 - 1.0) * 25.0;
          _P.y = terrain.GetHeight(_P)[0];

          const biome = this.FindBiome_(terrain, _P);

          const roll = this.noise_.Get(_V.x, 2.0, _V.z);
          if (roll > _BIOMES[biome]) {
            continue;
          }

          const e = this.SpawnSmallAt_(biome, _P);
          if(e == null) {
            continue;
          }

          e.SetPosition(_P);

          this.Manager.Add(e, key);

          e.SetActive(false);
          const veg_position = new THREE.Vector3(e.Position);
          const veg = {
            Name: e.name,
            Position: veg_position,
          }
          this.vegetation_.push(veg);
        }
      }      
    }



    DestroyVegation_(){
      // destroy distance
      let destroyDistance = 400;
      // stuff that is a long way from us can be not removed but HIDDEN
      for (let i = 0; i < this.vegetation_.length; ++i) {
        const veg = this.vegetation_[i];     
        const dist = veg.Position.distanceTo(this.FindEntity('player').Position);
        if (dist > destroyDistance) {
          const e = this.FindEntity(veg.Name)
          //this.Manager.Remove(e);
          e.visible = false;
          //e.dead_ = true;
          this.vegetation_.splice(i, 1);
          i--;
        }
      }
    }    

    Update(_) {
      console.log('Vegetation items before:' + this.vegetation_.length);
      this.SpawnVegetation_();
      this.DestroyVegation_();
      console.log('Vegetation items after:' + this.vegetation_.length);
      console.log('=================')

    }
  };

  return {
      SceneryController: SceneryController,
  };
})();
import { biomeConstants, terrainConstants } from "../../../client/src/data/terrain/constants.js";

import { Noise } from "../terrain/noise.js";
import { ChunkBuilder } from "../terrain/builder.js"
import { CubeQuadTree } from "./trees.js"


export class InfiniteTerrain {
  // TODO-DefinitelyMaybe: Terrain generates scenery via a given key.
  // This dictates height and scenery objects.
  key = "123456789"
  chunks = {};
  builder = new ChunkBuilder();
  
  heightGenerator = new Noise(terrainConstants.NOISE_PARAMS);
  biomes = new Noise(biomeConstants);

  // 6 groups for the 6 sides of a cube, right?
  groups = [...new Array(6)].map((_) => new THREE.Group());

  constructor(world) {
    this.world = world
    this.assets = world.assets

    this.world.scene.add(...this.groups);
  }

  createTerrainChunk(group, groupTransform, offset, width, resolution) {
    const params = {
      group: group,
      material: this.material,
      width: width,
      offset: offset,
      resolution: resolution,
      transform: groupTransform,
    };

    return this.builder.allocateChunk(params);
  }

  getHeight(pos) {
    return this.heightGenerator.Get(pos.x, 0.0, pos.z);
  }

  getBiomeAt(pos) {
    return this.biomes.Get(pos.x, 0.0, pos.z);
  }

  update() {
    // TODO-DefinitelyMaybe: Maybe this doesn't need to be called so oftened
    // how about simply when close to chunk edges?
    const target = this.world.entities.player;
    if (!target) {
      return;
    }

    this.builder.update();
    if (!this.builder.Busy) {
      this.updateChunks(target);
    }
  }

  updateChunks(target) {
    // TODO-DefinitelyMaybe: Play around with variables
    const q = new CubeQuadTree({
      radius: terrainConstants.PLANET_RADIUS,
      min_node_size: terrainConstants.QT_MIN_CELL_SIZE,
    });
    q.Insert(target.position);

    const sides = q.GetChildren();

    let newTerrainChunks = {};
    const center = new THREE.Vector3();
    const dimensions = new THREE.Vector3();
    for (let i = 0; i < sides.length; i++) {
      for (const c of sides[i].children) {
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

        const k = `${center.x} / ${center.z} [${child.size}]`;
        newTerrainChunks[k] = child;
      }
    }

    // TODO-DefinitelyMaybe: Remove code below once cubequadtree updates appropriately
    const intersection = DictIntersection(
      this.chunks,
      newTerrainChunks,
    );
    const difference = DictDifference(newTerrainChunks, this.chunks);
    const recycle = Object.values(
      DictDifference(this.chunks, newTerrainChunks),
    );

    if (recycle.length > 0) {
      this.builder.retireChunks(recycle); 
    }

    newTerrainChunks = intersection;

    for (const k in difference) {
      const [xp, yp, zp] = difference[k].position;

      const offset = new THREE.Vector3(xp, yp, zp);
      newTerrainChunks[k] = {
        position: [xp, zp],
        chunk: this.createTerrainChunk(
          difference[k].group,
          difference[k].transform,
          offset,
          difference[k].size,
          terrainConstants.QT_MIN_CELL_RESOLUTION,
        ),
      };
    }

    this.chunks = newTerrainChunks;
  }
}

function DictIntersection(dictA, dictB) {
  const intersection = {};
  for (const k in dictB) {
    if (k in dictA) {
      intersection[k] = dictA[k];
    }
  }
  return intersection;
}

function DictDifference(dictA, dictB) {
  const diff = { ...dictA };
  for (const k in dictB) {
    delete diff[k];
  }
  return diff;
}

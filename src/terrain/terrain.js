import { terrainConstants } from "../data/terrain/constants.js";
import { THREE } from "../deps.js";
import { PS1, PS2, VS1, VS2 } from "./shaders.js";
import { ChunkBuilder } from "./builder.js"
// TODO-DefinitelyMaybe: use the quad tree, not the cubequadtree
import { CubeQuadTree } from "./trees.js"
import { TextureAtlas } from "./textureAtlas.js";
import { load } from "../interfaces/assets.js";


export class InfiniteTerrain {
  // TODO-DefinitelyMaybe: Sort out the black colour. Can't, it's three.js's fault.
  // TODO-DefinitelyMaybe: After being idle/away for some time it'll revert the quad tree to the root square
  // character garbage collected? -> quadtree update -> single root quad

  key = 123456789
  chunks = {};
  builder = new ChunkBuilder();

  // Lets just keep things simple
  groups = [new THREE.Group()]

  constructor(world) {
    this.world = world
    this.entities = this.world.entities

    const noiseTexture = load("./terrain/simplex-noise.png")
    noiseTexture.wrapS = THREE.RepeatWrapping;
    noiseTexture.wrapT = THREE.RepeatWrapping;

    const atlas = new TextureAtlas();
    const p1 = atlas.load("diffuse", [
      "./terrain/dirt_01_diffuse-1024.png",
      "./terrain/grass1-albedo3-1024.png",
      "./terrain/sandyground-albedo-1024.png",
      "./terrain/worn-bumpy-rock-albedo-1024.png",
      "./terrain/rock-snow-ice-albedo-1024.png",
      "./terrain/snow-packed-albedo-1024.png",
      "./terrain/rough-wet-cobble-albedo-1024.png",
      // './terrain/sandy-rocks1-albedo-1024.png',
      "./terrain/bark1-albedo.jpg",
    ])
    
    const p2 = atlas.load("normal", [
      "./resources/terrain/dirt_01_normal-1024.jpg",
      "./resources/terrain/grass1-normal-1024.jpg",
      "./resources/terrain/sandyground-normal-1024.jpg",
      "./resources/terrain/worn-bumpy-rock-normal-1024.jpg",
      "./resources/terrain/rock-snow-ice-normal-1024.jpg",
      "./resources/terrain/snow-packed-normal-1024.jpg",
      "./resources/terrain/rough-wet-cobble-normal-1024.jpg",
      // './resources/terrain/sandy-rocks1-normal-1024.jpg',
      "./resources/terrain/bark1-normal3.jpg",
    ])

    this.material = new THREE.MeshStandardMaterial({
      side: THREE.BackSide,
      vertexColors: true,
    });

    Promise.all([p1,p2]).then(_val => {
      // console.log(_val);
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
  
        s.uniforms.TRIPLANAR_normalMap = { value: atlas.map["normal"].atlas };
        s.uniforms.TRIPLANAR_diffuseMap = {
          value: atlas.map["diffuse"].atlas,
        };
        s.uniforms.TRIPLANAR_noiseMap = { value: noiseTexture };
  
        // s.fragmentShader += 'poop';
      };
    })

    this.world.scene.add(...this.groups);
  }

  update() {
    // TODO-DefinitelyMaybe: Maybe this doesn't need to be called so oftened
    // how about simply when close to chunk edges?
    const target = this.world.entities.player;
    if (!target) {
      return;
    }

    this.builder.update();
    if (!this.builder.busy) {
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
  
      // TODO-DefinitelyMaybe: WHAT-IF the tree could update itself?
      const intersection = DictIntersection(
        this.chunks,
        newTerrainChunks,
      );
      const difference = DictDifference(newTerrainChunks, this.chunks);
  
      newTerrainChunks = intersection;
  
      for (const k in difference) {
        const [xp, yp, zp] = difference[k].position;
        // console.log(difference[k]);
  
        const offset = new THREE.Vector3(xp, yp, zp);
        newTerrainChunks[k] = {
          position: [xp, zp],
          chunk: this.builder.build({
            // TODO-DefinitelyMaybe:  ssssshhhhhhh it never happened like this.
            entities: this.entities,
            group: difference[k].group,
            material: this.material,
            width: difference[k].size,
            offset: offset,
            resolution: terrainConstants.QT_MIN_CELL_RESOLUTION,
            transform: difference[k].transform,
          }),
        };
      }

      const recycle = Object.values(
        DictDifference(this.chunks, newTerrainChunks),
      );

      if (recycle.length > 0) {
        // TODO-DefinitelyMaybe: When the quadtree can update itself this will no be needed
        this.builder.old.push(...recycle);
      }
      this.chunks = newTerrainChunks;
    }
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

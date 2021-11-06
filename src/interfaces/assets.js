import { GLTFLoader, FBXLoader, OBJLoader, MTLLoader, LineMaterial, THREE, Wireframe, WireframeGeometry2, deepClone, cannon } from "../deps.js"
import { newModelData } from "../data/models/mod.js";

// Setting THREE up to cache the loaded resources
THREE.Cache.enabled = true;

/** 
 * @param {{model:string, entity:Entity}} args
 */
export async function create(args) {
  const {model, entity} = args
  const modelData = newModelData[model]
  const loader = getLoaderFor(modelData.url)
  const promises = []
  const textures = {}
  let asset;
  /** @type {THREE.Group | THREE.Scene} */
  let group;
  
  if (loader instanceof OBJLoader) {
    if (modelData.materials) {
      // TODO-DefinitelyMaybe: handle multiple materials
    } else if (modelData.material) {
      // There is only one material
      const extraLoader = getLoaderFor(modelData.material)
      
      const p1 = extraLoader.loadAsync(modelData.material).then(mtl => {
        mtl.preload()
        loader.setMaterials(mtl)
        const p2 = loader.loadAsync(modelData.url).then(val => {
          asset = val
          group = val
          return val
        })
        return p2
      })
      promises.push(p1)
    }
  } else {
    const p = loader.loadAsync(modelData.url).then(val => {
      asset = val
      if (val.scene) {
        group = deepClone(val.scene)
      } else {
        group = deepClone(val)
      }
      return val
    })
    promises.push(p)
  }

  if (modelData.textures) {
    for (const name in modelData.textures) {
      const textureURL = modelData.textures[name];
      const textureLoader = getLoaderFor(textureURL)
      const p = textureLoader.loadAsync(textureURL).then(val => {
        textures[name] = val;
        return val
      }).catch(err => {
        return err;
      })
      promises.push(p)
    }
  }

  // wait for all the reasources to load
  await Promise.all(promises)
  /** @type {{model:THREE.Group | THREE.Scene, physicsBody?:cannon.Body, animator?:THREE.AnimationMixer}}} */
  const data = {model:group}

  const entityPos = entity.position
  group.position.copy(entityPos)

  // TODO-DefinitelyMaybe: Create a single loop through the children instead of this multi-pass

  if (modelData.children) {
    for (let i = 0; i < group.children.length; i++) {
      const child = group.children[i];
      if (child.name in modelData.children) {
        const data = modelData.children[child.name]
        // console.log(child);
        for (const key in data) {
          const val = data[key];
          if (key == 'scale') {
            child[key].setScalar(val);
          }
          if (key == "rotate") {
            child.applyQuaternion(new THREE.Quaternion(val[0],val[1],val[2],val[3]));
          }
        }
      }
    }
  }

  if (asset.animations?.length > 0) {
    const animations = {}
    const mixer = new THREE.AnimationMixer(group)

    for (let i = 0; i < asset.animations.length; i++) {
      const animation = asset.animations[i];
      const name = animation.name.toLowerCase()
      animations[name] = mixer.clipAction(animation)
    }
    animations["idle"].play()
    data.animator = mixer 
  }
  
  if (modelData.physics) {
    const lineMat = new LineMaterial( {
      color: 0x4080ff, // light-ish bluey
      linewidth: 0.002,
    });
    const geo = new WireframeGeometry2(new THREE.BoxGeometry(1, 1, 1))
    const wireframeBox = new Wireframe(geo, lineMat)
    group.add(wireframeBox)

    const shape = new cannon.Box(new cannon.Vec3(1,1,1))
    const body = new cannon.Body({
      mass:1,
      shape
    })
    body.entity = entity
    body.position = new cannon.Vec3(entityPos.x, entityPos.y, entityPos.z)

    data.physicsBody = body
  }

  if (modelData.textures) {
    group.children.forEach(child => {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(material => {
        if (material.name in textures && material.map == null) {
          material.map = textures[material.name]
          // loop through texture data
          if (modelData.textureData) {
            if (material.name in modelData.textureData) {
              const textureData = modelData.textureData[material.name];
              for (const key in textureData) {
                // console.log({key, value:textureData[key]});
                material[key] = textureData[key]
              }
            }
          }
        }
      })
    })
  }

  return data
}

/** 
 * Used for Scenery within chunks
 * @param {{model:string, count:number, positions: number[][]}} args
 */
export async function createInstanced(args) {
  const {model, count, positions} = args
  const modelData = newModelData[model]
  const loader = getLoaderFor(modelData.url)
  const promises = []
  const textures = {}
  let asset;
  /** @type {THREE.Group | THREE.Scene} */
  let group;
  
  if (loader instanceof OBJLoader) {
    if (modelData.materials) {
      // TODO-DefinitelyMaybe: handle multiple materials
    } else if (modelData.material) {
      // There is only one material
      const extraLoader = getLoaderFor(modelData.material)
      
      const p1 = extraLoader.loadAsync(modelData.material).then(mtl => {
        mtl.preload()
        loader.setMaterials(mtl)
        const p2 = loader.loadAsync(modelData.url).then(val => {
          asset = val
          group = val
          return val
        })
        return p2
      })
      promises.push(p1)
    }
  } else {
    const p = loader.loadAsync(modelData.url).then(val => {
      asset = val
      if (val.scene) {
        group = deepClone(val.scene)
      } else {
        group = deepClone(val)
      }
      return val
    })
    promises.push(p)
  }

  if (modelData.textures) {
    for (const name in modelData.textures) {
      const textureURL = modelData.textures[name];
      const textureLoader = getLoaderFor(textureURL)
      const p = textureLoader.loadAsync(textureURL).then(val => {
        textures[name] = val;
        return val
      }).catch(err => {
        return err;
      })
      promises.push(p)
    }
  }

  // wait for all the reasources to load
  await Promise.all(promises)
  /** @type {{model:THREE.Group | THREE.Scene, instancedMesh:THREE.InstancedMesh, physicsBody?:cannon.Body, animator?:THREE.AnimationMixer}}} */
  const data = {model:group}
  
  if (modelData.physics) {
    const lineMat = new LineMaterial( {
      color: 0x4080ff, // light-ish bluey
      linewidth: 0.002,
    });
    const geo = new WireframeGeometry2(new THREE.BoxGeometry(1, 1, 1))
    const wireframeBox = new Wireframe(geo, lineMat)
    group.add(wireframeBox)

    const shape = new cannon.Box(new cannon.Vec3(1,1,1))
    const body = new cannon.Body({
      mass:1,
      shape
    })
    // body.entity = entity
    // body.position = new cannon.Vec3(entityPos.x, entityPos.y, entityPos.z)

    data.physicsBody = body
  }

  if (modelData.textures) {
    group.children.forEach(child => {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(material => {
        if (material.name in textures && material.map == null) {
          material.map = textures[material.name]
          // loop through texture data
          if (modelData.textureData) {
            if (material.name in modelData.textureData) {
              const textureData = modelData.textureData[material.name];
              for (const key in textureData) {
                // console.log({key, value:textureData[key]});
                material[key] = textureData[key]
              }
            }
          }
        }
      })
    })
  }

  let geometry;
  let material;

  if (modelData.children) {
    for (let i = 0; i < group.children.length; i++) {
      const child = group.children[i];
      if (child.name in modelData.children) {
        const data = modelData.children[child.name]
        // TODO-DefinitelyMaybe: Less clever way of doing this
        if (child.geometry) {
          geometry = child.geometry
          for (const key in data) {
            const val = data[key];
            if (key == 'scale') {
              geometry.scale(val, val, val);
            }
            if (key == "rotate") {
              geometry.applyQuaternion(new THREE.Quaternion(val[0],val[1],val[2],val[3]));
            }
          }
        }
        if (child.material) {
          material = child.material
        }
      }
    }
  }
  
  if (geometry && material) {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count)
    for (let i = 0; i < positions.length; i++) {
      // TODO-DefinitelyMaybe: Pusedo-randomize the scale and rotation
      // This gets into distributions again because depending on the scenery object
      // You might want only the occassional really big/small one or uniformly but
      // within a particular range.
      const pos = positions[i];
      const newPostion = new THREE.Vector3(pos[0], pos[1], pos[2])
      const newQuaternion = new THREE.Quaternion()
      const newScale = new THREE.Vector3(1, 1, 1)
      const matrix = new THREE.Matrix4()
      matrix.compose(newPostion, newQuaternion, newScale)
      instancedMesh.setMatrixAt(i, matrix)
    }
    data.instancedMesh = instancedMesh
  } else {
    throw Error(`Couldn't create instanced mesh. Didn't have a geometry and material.`)
  }

  return data
}

export function load(url) {
  const loader = getLoaderFor(url)
  return loader.loadAsync(url)
}

function getExt(url) {
  const split = url.split(".")
  return split[split.length-1]
}

function getLoaderFor(url) {
  switch (getExt(url)) {
    case "png":
      return new THREE.TextureLoader();
    case "jpg":
      return new THREE.TextureLoader();
    case "obj":
      return new OBJLoader();
    case "mtl":
      return new MTLLoader();
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
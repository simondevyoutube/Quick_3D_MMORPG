import { GLTFLoader, FBXLoader, OBJLoader, MTLLoader, LineMaterial, THREE, Wireframe, WireframeGeometry2, deepClone, cannon } from "../deps.js"
import { newModelData } from "../data/models/mod.js";

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
  /** @type {THREE.Group | THREE.Scene | undefined} */
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
          console.log("here");
          asset = val
          group = val
        })
        promises.push(p2)
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
    })
    promises.push(p)
  }

  if (modelData.textures) {
    for (const name in modelData.textures) {
      const textureURL = modelData.textures[name];
      const textureLoader = getLoaderFor(textureURL)
      const p = textureLoader.loadAsync(textureURL).then(val => {
        textures[name] = val;
      }).catch(error => {
        console.error(error);
      })
      promises.push(p)
    }
  }

  // wait for all the reasources to load
  await Promise.all(promises)
  const data = {model:group}
  // console.log(data);


  const entityPos = entity.position
  const entityQuat = entity.quaternion

  group.position.copy(entityPos)
  group.quaternion.copy(entityQuat)
  group.scale.setScalar(modelData.scale);

  if (asset.animations) {
    if (asset.animations.length > 0) {
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
      child.material.forEach(material => {
        // console.log(material);
        if (material.name in textures && material.map == null) {
          material.map = textures[material.name]
          // loop through texture data
          if (modelData.textureData) {
            if (material.name in modelData.textureData) {
              // console.log("Yup");
              const textureData = modelData.textureData[material.name];
              for (const key in textureData) {
                // console.log({key, value:textureData[key]});
                material[key] = textureData[key]
              }
            }
          }
          // console.log(material);
        }
      })
    })
  }

  return data
}

export function load(url) {
  const loader = getLoaderFor(url)
  return loader.load(url)
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
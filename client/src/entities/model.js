import { LineMaterial, THREE, Wireframe, WireframeGeometry2, deepClone, cannon } from "../deps.js"
import { load } from "../interfaces/assets.js";
import { newModelData } from "../data/models/mod.js";

/** 
 * @param {{model:string, entity:Entity}} args
 */
export async function create(args) {
  const {model, entity} = args
  const modelData = newModelData[model]
  let asset = load(modelData.url)
  const textures = {}
  /** @type {THREE.Group | THREE.Scene | undefined} */
  let group;

  const texturePromises = []
  if (modelData.textures) {
    for (const name in modelData.textures) {
      const textureURL = modelData.textures[name];
      texturePromises.push(new Promise((res, rej) => {
          load(textureURL).then(val => {
            textures[name] = val;
            res(true);
          }).catch(_ => {
            rej(false);
          });
        }))
    } 
  }

  await asset.then(model => {
    if (model.scene) {
      asset = model
      group = deepClone(model.scene)
    } else {
      group = deepClone(model)
    }
  })
  const data = {model:group}


  const entityPos = entity.position
  const entityQuat = entity.quaternion

  group.position.copy(entityPos)
  group.quaternion.copy(entityQuat)
  group.scale.setScalar(modelData.scale);

  if (asset.animations) {
    if (asset.animations.length > 0) {
      const animations = {}
      const mixer = new THREE.AnimationMixer(group)
      const actions = {}
  
      for (let i = 0; i < asset.animations.length; i++) {
        const animation = asset.animations[i];
        animations[animation.name.toLowerCase()] = animation
        actions[animation.name.toLowerCase()] = mixer.clipAction(animation)
      }
      actions["idle"].play()
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

  if (texturePromises.length > 0) {
    await Promise.all(texturePromises)
    group.children.forEach(child => {
      child.material.forEach(material => {
        // console.log(material);
        if (material.name in textures && material.map == null) {
          material.map = textures[material.name]
          material.map.encoding = THREE.sRGBEncoding
          material.map.wrapS = THREE.RepeatWrapping
          material.map.wrapT = THREE.RepeatWrapping
          // if (material.name == "Tree_Leaves") {
          // }
        }
      })
    })
  }

  return data
}

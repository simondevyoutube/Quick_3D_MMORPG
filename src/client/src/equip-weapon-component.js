import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js'
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js'
import { entity } from './entity.js'
import { defs } from '/shared/defs.js'

export const equip_weapon_component = (() => {
  class EquipWeapon extends entity.Component {
    constructor(params) {
      super()
      this.params_ = params
      this.target_ = null
      this.name_ = null

      const classType = this.params_.desc.character.class
      const modelData = defs.CHARACTER_MODELS[classType]
      this.anchor_ = modelData.anchors.rightHand
    }

    InitComponent() {
      this._RegisterHandler('load.character', (m) => this._OnCharacterLoaded(m))
      this._RegisterHandler('inventory.equip', (m) => this._OnEquip(m))
    }

    _OnCharacterLoaded(msg) {
      this._bones = msg.bones
      this._AttachTarget()
    }

    _AttachTarget() {
      if (this._bones && this.target_) {
        this._bones[this.anchor_].add(this.target_)
      }
    }

    GetItemDefinition_(name) {
      const database = this.FindEntity('database').GetComponent('InventoryDatabaseController')
      return database.Find(name)
    }

    _OnEquip(msg) {
      if (msg.value == this.name_) {
        return
      }

      if (this.target_) {
        this._UnloadModels()
      }
      const inventory = this.GetComponent('InventoryController')
      const item = this.GetItemDefinition_(msg.value)

      this.name_ = msg.value

      if (item) {
        this._LoadModels(item, () => {
          this._AttachTarget()
        })
      }
    }

    _UnloadModels() {
      if (this.target_) {
        this.target_.parent.remove(this.target_)
        // Probably need to free the memory properly, whatever
        this.target_ = null
      }
    }

    _LoadModels(item, cb) {
      const loader = new FBXLoader()
      loader.setPath('./resources/weapons/FBX/')
      loader.load(item.renderParams.name + '.fbx', (fbx) => {
        this.target_ = fbx
        this.target_.scale.setScalar(item.renderParams.scale)
        // this.target_.rotateY(Math.PI);
        this.target_.rotateX(Math.PI / 2)
        // this.target_.rotateY(-1);

        this.target_.traverse((c) => {
          c.castShadow = true
          c.receiveShadow = true

          // Do this instead of something smart like re-exporting.
          let materials = c.material
          let newMaterials = []
          if (!(c.material instanceof Array)) {
            materials = [c.material]
          }

          for (let m of materials) {
            if (m) {
              const c = new THREE.Color().copy(m.color)
              c.multiplyScalar(0.75)
              newMaterials.push(
                new THREE.MeshStandardMaterial({
                  color: c,
                  name: m.name,
                  metalness: 1.0
                })
              )
            }
          }

          if (!(c.material instanceof Array)) {
            c.material = newMaterials[0]
          } else {
            c.material = newMaterials
          }
        })

        cb()

        this.Broadcast({
          topic: 'load.weapon',
          model: this.target_,
          bones: this._bones
        })
      })
    }
  }

  return {
    EquipWeapon: EquipWeapon
  }
})()

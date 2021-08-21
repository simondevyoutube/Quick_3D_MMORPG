import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js'
import { entity } from './entity.js'

export const network_player_controller = (() => {
  class NetworkEntityController extends entity.Component {
    constructor() {
      super()
      this.updateTimer_ = 0.0
      this.loaded_ = false
    }

    InitComponent() {
      this._RegisterHandler('load.character', (m) => {
        this.OnLoaded_(m)
      })
      this._RegisterHandler('inventory.equip', (m) => {
        this.OnEquipChanged_(m)
      })
      this._RegisterHandler('network.update', (m) => {
        this.OnUpdate_(m)
      })
      this._RegisterHandler('action.attack', (m) => {
        this.OnActionAttack_(m)
      })
    }

    InitEntity() {
      this.net_ = this.FindEntity('network').GetComponent('NetworkController')
    }

    OnEquipChanged_(msg) {
      const inventory = this.GetComponent('InventoryController').CreatePacket()

      this.net_.SendInventoryChange_(inventory)
    }

    OnActionAttack_(msg) {
      this.net_.SendActionAttack_()
    }

    OnUpdate_(msg) {
      if (msg.transform) {
        this.Parent.SetPosition(new THREE.Vector3(...msg.transform[1]))
        this.Parent.SetQuaternion(new THREE.Quaternion(...msg.transform[2]))
      }

      if (msg.stats) {
        this.Broadcast({
          topic: 'stats.network',
          value: msg.stats
        })
      }

      if (msg.events) {
        if (msg.events.length > 0) {
          this.Broadcast({
            topic: 'events.network',
            value: msg.events
          })
        }
      }
    }

    OnLoaded_(_) {
      this.loaded_ = true
    }

    CreateTransformPacket() {
      const controller = this.GetComponent('BasicCharacterController')

      // HACK
      return [
        controller.stateMachine_._currentState.Name,
        this.Parent.Position.toArray(),
        this.Parent.Quaternion.toArray()
      ]
    }

    Update(timeElapsed) {
      this.updateTimer_ -= timeElapsed
      if (this.updateTimer_ <= 0.0 && this.loaded_) {
        this.updateTimer_ = 0.1

        this.net_.SendTransformUpdate(this.CreateTransformPacket())
      }
    }
  }

  return {
    NetworkEntityController: NetworkEntityController
  }
})()

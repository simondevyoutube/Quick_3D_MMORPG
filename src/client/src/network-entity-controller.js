import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js'
import { entity } from './entity.js'

export const network_entity_controller = (() => {
  class NetworkEntityController extends entity.Component {
    constructor() {
      super()
      this.transformUpdates_ = []
      this.targetFrame_ = null
      this.lastFrame_ = null
      this.lastUpdate_ = 0.0
    }

    InitComponent() {
      this._RegisterHandler('network.update', (m) => {
        this.OnNetworkUpdate_(m)
      })
    }

    SetTransform_(transform) {
      this.parent_.SetPosition(new THREE.Vector3(...transform[1]))
      this.parent_.SetQuaternion(new THREE.Quaternion(...transform[2]))
      this.targetFrame_ = { time: 0.1, transform: transform }
    }

    OnNetworkUpdate_(msg) {
      if ('transform' in msg) {
        this.lastUpdate_ = 0.0
        this.transformUpdates_.push({ time: 0.1, transform: msg.transform })

        // First update
        if (this.targetFrame_ == null) {
          this.SetTransform_(msg.transform)
        }
      }

      // All of this should be LCT'd, but whatever
      if ('stats' in msg) {
        this.Broadcast({
          topic: 'stats.network',
          value: msg.stats
        })
      }

      if ('events' in msg) {
        if (msg.events.length > 0) {
          this.Broadcast({
            topic: 'events.network',
            value: msg.events
          })
        }
      }
    }

    Update(timeElapsed) {
      this.lastUpdate_ += timeElapsed
      if (this.lastUpdate_ >= 10.0) {
        this.Parent.SetDead()
      }

      if (this.transformUpdates_.length == 0) {
        return
      }

      for (let i = 0; i < this.transformUpdates_.length; ++i) {
        this.transformUpdates_[i].time -= timeElapsed
      }

      while (this.transformUpdates_.length > 0 && this.transformUpdates_[0].time <= 0.0) {
        this.lastFrame_ = {
          transform: [this.targetFrame_.transform[0], this.Parent.Position.toArray(), this.Parent.Quaternion.toArray()]
        }
        this.targetFrame_ = this.transformUpdates_.shift()
        this.targetFrame_.time = 0.0
      }

      if (this.targetFrame_ && this.lastFrame_) {
        this.targetFrame_.time += timeElapsed
        const p1 = new THREE.Vector3(...this.lastFrame_.transform[1])
        const p2 = new THREE.Vector3(...this.targetFrame_.transform[1])
        const q1 = new THREE.Quaternion(...this.lastFrame_.transform[2])
        const q2 = new THREE.Quaternion(...this.targetFrame_.transform[2])

        const pf = new THREE.Vector3()
        const qf = new THREE.Quaternion()
        pf.copy(p1)
        qf.copy(q1)

        const t = Math.max(Math.min(this.targetFrame_.time / 0.1, 1.0), 0.0)
        pf.lerp(p2, t)
        qf.slerp(q2, t)

        this.Parent.SetPosition(pf)
        this.Parent.SetQuaternion(qf)
        const controller = this.GetComponent('NPCController')
        controller.SetState(this.lastFrame_.transform[0])
      }
    }
  }

  return {
    NetworkEntityController: NetworkEntityController
  }
})()

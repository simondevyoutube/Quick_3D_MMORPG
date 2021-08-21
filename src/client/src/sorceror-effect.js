import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js'
import { entity } from './entity.js'
import { particle_system } from './particle-system.js'

export const sorceror_effect = (() => {
  class SorcerorEffectEmitter extends particle_system.ParticleEmitter {
    constructor(parent) {
      super()
      this.parent_ = parent
      this.blend_ = 0.0
    }

    OnUpdate_() {
      this.parent_.updateMatrixWorld(true)

      this.SetEmissionRate(300.0 * (this.emitterLife_ / 3.0))
    }

    CreateParticle_() {
      const origin = new THREE.Vector3(0, 0, 0)
      this.parent_.localToWorld(origin)

      const radius = 1.0
      const life = (Math.random() * 0.75 + 0.25) * 1.0
      const p = new THREE.Vector3(
        (Math.random() * 2 - 1) * radius,
        (Math.random() * 2 - 1) * radius,
        (Math.random() * 2 - 1) * radius
      )

      const d = p.clone().normalize()
      p.copy(d)
      p.multiplyScalar(radius)
      p.add(origin)
      d.multiplyScalar(-1.0)

      return {
        position: p,
        size: (Math.random() * 0.5 + 0.5) * 1.0,
        colour: new THREE.Color(),
        alpha: 1.0,
        life: life,
        maxLife: life,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: d,
        blend: this.blend_
      }
    }
  }

  class SorcerorEffect extends entity.Component {
    constructor(params) {
      super()
      this.params_ = params

      this.particles_ = new particle_system.ParticleSystem({
        camera: params.camera,
        parent: params.scene,
        texture: './resources/textures/fire.png'
      })
    }

    Destroy() {
      this.particles_.Destroy()
    }

    InitComponent() {
      this._RegisterHandler('action.attack', (m) => {
        this.OnAttack_(m)
      })
      this._RegisterHandler('load.character', (m) => this.OnCharacterLoaded_(m))
    }

    OnCharacterLoaded_(msg) {
      this._bones = msg.bones
    }

    OnAttack_() {
      const hands = [this._bones['RightHandIndex1'], this._bones['LeftHandIndex1']]
      for (let h of hands) {
        let emitter = new SorcerorEffectEmitter(h)
        emitter.alphaSpline_.AddPoint(0.0, 0.0)
        emitter.alphaSpline_.AddPoint(0.1, 1.0)
        emitter.alphaSpline_.AddPoint(0.7, 1.0)
        emitter.alphaSpline_.AddPoint(1.0, 0.0)

        emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x00ff00))
        emitter.colourSpline_.AddPoint(0.5, new THREE.Color(0x40c040))
        emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0xff4040))

        emitter.sizeSpline_.AddPoint(0.0, 0.5)
        emitter.sizeSpline_.AddPoint(0.5, 2.5)
        emitter.sizeSpline_.AddPoint(1.0, 0.0)
        emitter.SetLife(2.5)
        emitter.blend_ = 0.0

        this.particles_.AddEmitter(emitter)

        emitter = new SorcerorEffectEmitter(h)
        emitter.alphaSpline_.AddPoint(0.0, 0.0)
        emitter.alphaSpline_.AddPoint(0.7, 1.0)
        emitter.alphaSpline_.AddPoint(1.0, 0.0)

        emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x202020))
        emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0x101010))

        emitter.sizeSpline_.AddPoint(0.0, 0.5)
        emitter.sizeSpline_.AddPoint(1.0, 4.0)
        emitter.SetLife(2.5)
        emitter.blend_ = 1.0

        this.particles_.AddEmitter(emitter)
      }
    }

    Update(timeElapsed) {
      this.particles_.Update(timeElapsed)
    }
  }

  return {
    SorcerorEffect: SorcerorEffect
  }
})()
